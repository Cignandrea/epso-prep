// Selezione degli item — namespace App.select
// Regole: mai item già visti nelle simulazioni (né quelli di una simulazione in sospeso); priorità ai ripassi
// in scadenza; poi item mai visti, pesati sulle trappole con più errori recenti; infine i meno recenti.
window.App = window.App || {};
App.select = (() => {
  'use strict';
  const { shuffle, isTrapError } = App.utils;

  const key = (q) => `${q.bank}#${q.id}`;

  // Pesi delle trappole: 1 + errori veri negli ultimi 14 giorni (max 4). Le bianche non contano.
  function tagWeights() {
    const since = new Date(); since.setDate(since.getDate() - 14);
    const w = {};
    for (const e of App.store.log()) {
      if (!isTrapError(e)) continue;
      if (new Date(e.t) < since) continue;
      w[e.tag] = Math.min(4, (w[e.tag] || 1) + 1);
    }
    return w;
  }

  // Item di una simulazione in sospeso (non ancora nel registro): non devono comparire altrove, con la soluzione.
  function pendingSimKeys() {
    const sim = App.store.sim();
    const out = new Set();
    if (!sim || sim.phase === 'results') return out;
    for (const s of sim.sections) for (const it of s.items) out.add(`${it.bank}#${it.id}`);
    return out;
  }

  function pool(bankId, { formats = null, levels = null, includeExtra = false } = {}) {
    const b = App.banks.get(bankId);
    if (!b || b.hidden) return [];
    return b.questions.filter((q) => (!formats || formats.includes(q.format)) && (!levels || levels.includes(q.level)) && (includeExtra || !q.extra));
  }

  // Ripassi in scadenza (Leitner), tutte le banche visibili.
  function dueItems(stats = App.store.itemStats()) {
    const now = new Date().toISOString();
    const pending = pendingSimKeys();
    const out = [];
    for (const s of stats.values()) {
      if (s.due && s.due <= now) {
        const q = App.banks.question(s.bank, s.id);
        if (q && !App.banks.get(s.bank).hidden && !pending.has(key(q))) out.push(q);
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

  // Candidati di una banca: mai usati in simulazione, non nella sim in sospeso, non già scelti.
  function candidates(bankId, fmt, stats, chosen, pending, includeExtra = false) {
    return pool(bankId, { formats: fmt, includeExtra }).filter((q) => !chosen.includes(q) && !pending.has(key(q)) && !(stats.get(key(q)) || {}).simSeen);
  }

  // Allenamento: n item di una banca, formato d'esame.
  function pickTraining(bankId, n) {
    const stats = App.store.itemStats();
    const weights = tagWeights();
    const pending = pendingSimKeys();
    const fmt = bankId === 'verbale' ? ['epso4'] : ['num5'];
    const due = dueItems(stats).filter((q) => q.bank === bankId && fmt.includes(q.format)).slice(0, Math.max(1, Math.floor(n / 3)));
    const chosen = [...due];
    for (const q of rank(candidates(bankId, fmt, stats, chosen, pending), stats, weights)) { if (chosen.length >= n) break; chosen.push(q); }
    if (chosen.length < n) for (const q of pool(bankId, { formats: fmt })) { if (chosen.length >= n) break; if (!chosen.includes(q) && !pending.has(key(q))) chosen.push(q); }
    return shuffle(chosen);
  }

  // Micro: 3 item alternati (verbale, numerico, …), con un ripasso se in scadenza e,
  // se attivo, un item Vero/Falso/Non si può dire mai visto al posto dell'ultimo verbale (mai del numerico: T-063).
  function pickMicro(n = 3) {
    const stats = App.store.itemStats();
    const weights = tagWeights();
    const settings = App.store.settings();
    const pending = pendingSimKeys();
    const chosen = [];
    const due = dueItems(stats).filter((q) => q.bank === 'verbale' || q.bank === 'numerico');
    if (due.length) chosen.push(shuffle(due)[0]);
    // Composizione: per 3 item, 2 verbali + 1 numerico (il ripasso conta nella sua banca). Si riempie la banca più indietro.
    const want = { numerico: Math.max(1, Math.floor(n / 3)) };
    want.verbale = n - want.numerico;
    const have = (b) => chosen.filter((q) => q.bank === b).length;
    for (let guard = 0; chosen.length < n && guard < 8; guard++) {
      const order = ['verbale', 'numerico'].sort((a, b) => (want[b] - have(b)) - (want[a] - have(a)));
      let picked = null;
      for (const bankId of order) {
        picked = rank(candidates(bankId, bankId === 'verbale' ? ['epso4'] : ['num5'], stats, chosen, pending, true), stats, weights)[0];
        if (picked) break;
      }
      if (!picked) break;
      chosen.push(picked);
    }
    if (settings.microVfn && chosen.length >= 2) {
      const vfn = pool('verbale', { formats: ['vfn'] }).filter((q) => !stats.has(key(q)) && !pending.has(key(q)));
      const dueSet = new Set(due.map(key));
      // L'ultimo verbale d'esame non in ripasso cede il posto al V/F/NSP.
      let idx = -1;
      for (let k = chosen.length - 1; k >= 0; k--) { const q = chosen[k]; if (q.bank === 'verbale' && q.format === 'epso4' && !dueSet.has(key(q))) { idx = k; break; } }
      if (vfn.length && idx >= 0) chosen[idx] = shuffle(vfn)[0];
    }
    return chosen.slice(0, n);
  }

  function pickOneMore(exclude) {
    const stats = App.store.itemStats();
    const weights = tagWeights();
    const pending = pendingSimKeys();
    const ex = new Set(exclude.map(key));
    const cand = [...pool('verbale', { formats: ['epso4'] }), ...pool('numerico', { formats: ['num5'] })].filter((q) => !ex.has(key(q)) && !pending.has(key(q)) && !(stats.get(key(q)) || {}).simSeen);
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

  return { pool, dueItems, pickTraining, pickMicro, pickOneMore, pickSim, poolReport, tagWeights, pendingSimKeys };
})();
