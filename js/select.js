// Selezione degli item — namespace App.select
// Regole: mai item già visti nelle simulazioni; priorità ai ripassi in scadenza; poi item mai visti,
// pesati sulle trappole con più errori recenti; infine i meno recenti.
window.App = window.App || {};
App.select = (() => {
  'use strict';
  const { shuffle } = App.utils;

  const key = (q) => `${q.bank}#${q.id}`;

  // Pesi delle trappole: 1 + errori negli ultimi 14 giorni (max 4).
  function tagWeights() {
    const since = new Date(); since.setDate(since.getDate() - 14);
    const w = {};
    for (const e of App.store.log()) {
      if (e.mode === 'external' || e.ok || e.unanswered || !e.tag) continue;
      if (new Date(e.t) < since) continue;
      w[e.tag] = Math.min(4, (w[e.tag] || 1) + 1);
    }
    return w;
  }

  function pool(bankId, { formats = null, levels = null, includeExtra = false } = {}) {
    const b = App.banks.get(bankId);
    if (!b || b.hidden) return [];
    return b.questions.filter((q) => (!formats || formats.includes(q.format)) && (!levels || levels.includes(q.level)) && (includeExtra || !q.extra));
  }

  // Ripassi in scadenza (Leitner), tutte le banche visibili.
  function dueItems(stats = App.store.itemStats()) {
    const now = new Date().toISOString();
    const out = [];
    for (const s of stats.values()) {
      if (s.due && s.due <= now) {
        const q = App.banks.question(s.bank, s.id);
        if (q && !App.banks.get(s.bank).hidden) out.push(q);
      }
    }
    return out;
  }

  // Ordina per priorità: pesi di trappola e anzianità; mai visti prima.
  function rank(items, stats, weights) {
    const scored = items.map((q) => {
      const s = stats.get(key(q));
      const w = weights[q.tag] || 1;
      const unseen = !s;
      const age = s ? (Date.now() - new Date(s.last).getTime()) / 86400000 : 999;
      return { q, score: (unseen ? 1000 : Math.min(age, 60)) * w + Math.random() * 5 };
    });
    return scored.sort((a, b) => b.score - a.score).map((x) => x.q);
  }

  // Allenamento: n item di una banca, formato d'esame.
  function pickTraining(bankId, n) {
    const stats = App.store.itemStats();
    const weights = tagWeights();
    const fmt = bankId === 'verbale' ? ['epso4'] : ['num5'];
    const due = dueItems(stats).filter((q) => q.bank === bankId && fmt.includes(q.format)).slice(0, Math.max(1, Math.floor(n / 3)));
    const chosen = [...due];
    const rest = pool(bankId, { formats: fmt }).filter((q) => !chosen.includes(q) && !(stats.get(key(q)) || {}).simSeen);
    for (const q of rank(rest, stats, weights)) { if (chosen.length >= n) break; chosen.push(q); }
    if (chosen.length < n) for (const q of pool(bankId, { formats: fmt })) { if (chosen.length >= n) break; if (!chosen.includes(q)) chosen.push(q); }
    return shuffle(chosen);
  }

  // Micro: 3 item alternati (verbale, numerico, …), con un ripasso se in scadenza e,
  // se attivo, un item Vero/Falso/Non si può dire mai visto.
  function pickMicro(n = 3) {
    const stats = App.store.itemStats();
    const weights = tagWeights();
    const settings = App.store.settings();
    const chosen = [];
    const due = dueItems(stats);
    if (due.length) chosen.push(shuffle(due)[0]);
    const seqBanks = ['verbale', 'numerico', 'verbale'];
    let i = 0;
    while (chosen.length < n && i < 12) {
      const bankId = seqBanks[i % seqBanks.length]; i++;
      const fmt = bankId === 'verbale' ? ['epso4'] : ['num5'];
      const cand = pool(bankId, { formats: fmt, includeExtra: true }).filter((q) => !chosen.includes(q) && !(stats.get(key(q)) || {}).simSeen);
      const r = rank(cand, stats, weights)[0];
      if (r) chosen.push(r);
    }
    if (settings.microVfn) {
      const vfn = pool('verbale', { formats: ['vfn'] }).filter((q) => !stats.has(key(q)));
      if (vfn.length && chosen.length >= 2) chosen[chosen.length - 1] = shuffle(vfn)[0];
    }
    return chosen.slice(0, n);
  }

  function pickOneMore(exclude) {
    const stats = App.store.itemStats();
    const weights = tagWeights();
    const ex = new Set(exclude.map(key));
    const cand = [...pool('verbale', { formats: ['epso4'] }), ...pool('numerico', { formats: ['num5'] })].filter((q) => !ex.has(key(q)) && !(stats.get(key(q)) || {}).simSeen);
    return rank(cand, stats, weights)[0] || null;
  }

  // Simulazione: item mai visti in nessuna modalità; se non bastano, i meno recenti (mai quelli già usati in simulazione).
  function pickSim(bankId, n) {
    const stats = App.store.itemStats();
    const fmt = bankId === 'verbale' ? ['epso4'] : ['num5'];
    const all = pool(bankId, { formats: fmt });
    const unseen = all.filter((q) => !stats.has(key(q)));
    const seenNotSim = all.filter((q) => stats.has(key(q)) && !stats.get(key(q)).simSeen).sort((a, b) => stats.get(key(a)).last.localeCompare(stats.get(key(b)).last));
    const chosen = shuffle(unseen).slice(0, n);
    for (const q of seenNotSim) { if (chosen.length >= n) break; chosen.push(q); }
    return { items: chosen, fresh: Math.min(unseen.length, n), available: all.length - all.filter((q) => (stats.get(key(q)) || {}).simSeen).length };
  }

  function poolReport() {
    const stats = App.store.itemStats();
    const rep = {};
    for (const b of App.banks.visible()) {
      const fmtMain = b.id === 'verbale' ? 'epso4' : 'num5';
      const main = b.questions.filter((q) => q.format === fmtMain && !q.extra);
      rep[b.id] = {
        total: main.length,
        unseen: main.filter((q) => !stats.has(key(q))).length,
        freshForSim: main.filter((q) => !(stats.get(key(q)) || {}).simSeen).length,
      };
    }
    return rep;
  }

  return { pool, dueItems, pickTraining, pickMicro, pickOneMore, pickSim, poolReport, tagWeights };
})();
