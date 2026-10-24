// Selezione degli item — namespace App.select
// Regole: mai item già visti nelle simulazioni (né quelli di una simulazione in sospeso); priorità ai ripassi
// in scadenza; poi item mai visti, pesati sulle trappole con più errori recenti; infine i meno recenti.
// Verbale: livello base (L1, brani corti) e livello prova (L2, ~150 parole); metà del livello prova è
// riservata alle simulazioni, così le due simulazioni complete hanno brani mai visti.
// Numerico (livello prova) e astratto: item generati, sempre nuovi; tornano solo come ripasso degli errori.
window.App = window.App || {};
App.select = (() => {
  'use strict';
  const { shuffle, isTrapError } = App.utils;

  const key = (q) => `${q.bank}#${q.id}`;

  // Brani di livello prova riservati alle simulazioni: la seconda metà di ogni lotto da 20 (id 1111–1120, 1131–1140…).
  // Riserve per le due simulazioni complete: 40 brani di livello prova dei primi quattro lotti (id 1101–1180, metà di
  // ogni lotto). I lotti successivi vanno tutti all'allenamento.
  // Riserve delle simulazioni: nei lotti 1–4 la seconda metà di ogni blocco da 20; nei lotti di livello alto (1261–1300)
  // gli ultimi 5 di ogni lotto, così le simulazioni hanno brani difficili anche dopo molti drill.
  const isSimReserve = (q) => q.bank === 'verbale' && q.level >= 2 && typeof q.id === 'number' && (
    (q.id <= 1180 && ((q.id - 1101) % 20 + 20) % 20 >= 10) ||
    (q.id >= 1261 && q.id <= 1300 && (q.id - 1261) % 20 >= 15));

  // Pesi delle trappole: 1 + errori veri negli ultimi 14 giorni (max 5); un errore dato da «Sicuro» conta doppio,
  // perché è la trappola che non si vede. Le bianche non contano.
  function tagWeights() {
    const since = new Date(); since.setDate(since.getDate() - 14);
    const w = {};
    for (const e of App.store.log()) {
      if (!isTrapError(e)) continue;
      if (new Date(e.t) < since) continue;
      w[e.tag] = Math.min(5, (w[e.tag] || 1) + (e.conf === 'sure' ? 2 : 1));
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

  // Ripassi in scadenza (Leitner), tutte le banche visibili (anche gli item generati: si ricostruiscono dall'id).
  function dueItems(stats = App.store.itemStats()) {
    const now = new Date().toISOString();
    const pending = pendingSimKeys();
    const out = [];
    for (const s of stats.values()) {
      if (s.due && s.due <= now) {
        const b = App.banks.get(s.bank);
        const q = b && !b.hidden ? App.banks.question(s.bank, s.id) : null;
        if (q && !pending.has(key(q))) out.push(q);
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

  const hasTag = (q, tags) => !tags || tags.includes(q.tag) || (q.options || []).some((o) => o.trap && tags.includes(o.trap));

  // ── Verbale ──
  // levels in ordine di preferenza ([2, 1] = prima il livello prova, poi il base). Le riserve delle simulazioni
  // si usano in allenamento solo se non resta altro.
  // hard: prima i brani più difficili (difficoltà 4, poi 3), per chi va forte.
  // mag5: quesiti a 5 opzioni della banca privata (libro): solo allenamento, mai nelle simulazioni (formato EPSO a 4).
  function pickVerbal(n, { levels = [1, 2], tags = null, formats = ['epso4', 'mag5'], due = true, exclude = [], hard = false } = {}) {
    const stats = App.store.itemStats();
    const weights = tagWeights();
    const pending = pendingSimKeys();
    const ex = new Set(exclude.map(key));
    const ok = (q) => !ex.has(key(q)) && !pending.has(key(q)) && !(stats.get(key(q)) || {}).simSeen;
    const chosen = [];
    const add = (q) => { if (q && chosen.length < n && !chosen.includes(q)) chosen.push(q); };
    if (due) for (const q of dueItems(stats).filter((x) => x.bank === 'verbale' && formats.includes(x.format) && hasTag(x, tags)).slice(0, Math.floor(n / 3))) add(q);
    // Prima i brani mai visti, di ogni livello in ordine di preferenza; solo dopo quelli già visti (un brano già
    // risolto si riconosce e gonfia il punteggio).
    const tiers = [];
    for (const seen of [false, true]) for (const lv of levels) {
      const free = pool('verbale', { formats, levels: [lv] }).filter(ok).filter((q) => !isSimReserve(q) && stats.has(key(q)) === seen);
      const parts = hard ? [free.filter((q) => (q.difficulty || 0) >= 4), free.filter((q) => (q.difficulty || 0) === 3), free] : [free];
      for (const part of parts) {
        if (tags) tiers.push(part.filter((q) => hasTag(q, tags)));
        tiers.push(part);
      }
    }
    for (const tier of tiers) for (const q of rank(tier, stats, weights)) add(q);
    // Ultima risorsa: le riserve, poi qualsiasi brano non visto in simulazione.
    if (chosen.length < n) for (const q of rank(pool('verbale', { formats }).filter(ok), stats, weights)) add(q);
    if (chosen.length < n) for (const q of pool('verbale', { formats }).filter((q) => !pending.has(key(q)))) add(q);
    return shuffle(chosen);
  }

  // ── Generati: numerico livello prova e astratto ──
  // levels: un livello per posizione, ciclico ([1, 2, 2, 3] su 10 item → 1,2,2,3,1,2,2,3,1,2), poi mescolati.
  // Varietà: lo stesso modello (numerico) o la stessa regola principale (astratto) al massimo due volte per sessione.
  // Da quale generatore viene un item, dal prefisso dell'id: A astratto, B astratto v2, N tabelle, G grafici, M più passaggi.
  function makerOf(id) {
    const gen = App.gen || {};
    const n = gen.numerico || {};
    return { A: gen.astratto, B: gen.astratto2, N: gen.numerico, G: n.chart, M: n.multi }[String(id)[0]] || null;
  }
  // Quote per livello prova: numerico su tabelle eterogenee a più passaggi (come il campione ufficiale), grafici e tabelle
  // semplici; astratto con più elementi per figura (v2) accanto alle serie a una figura. Senza un generatore, la sua quota
  // passa agli altri.
  function chooseMaker(bankId, level) {
    const gen = App.gen || {};
    if (bankId === 'astratto') {
      const v2 = gen.astratto2 && level >= 2 && Math.random() < (level >= 3 ? 0.5 : 0.35);
      return v2 ? gen.astratto2 : gen.astratto;
    }
    const n = gen.numerico;
    if (!n) return null;
    const r = Math.random();
    if (level >= 2 && n.multi && r < 0.35) return n.multi;
    if (n.chart && r < (level >= 2 && n.multi ? 0.6 : 0.3)) return n.chart;
    return n;
  }
  // «Tipo» per la varietà e per i gemelli: il modello per il numerico, la combinazione di regole per l'astratto.
  const kindOf = (q) => (q.bank === 'astratto' ? ((q.rules || []).map((r) => r.type).sort().join('+') || q.tag) : ((q.meta && q.meta.template) || q.tag));

  // Ripasso con un gemello: per numerico e astratto generati, stesso modello (o stesse regole) e stesso livello, con
  // numeri e figure nuovi. Si ripassa il ragionamento, non la chiave ricordata; l'esito conta per l'item originale.
  function twinFor(q) {
    if (!q || typeof q.id !== 'string' || !App.gen) return q;
    const maker = makerOf(q.id);
    if (!maker || typeof maker.make !== 'function') return q;
    const want = kindOf(q);
    for (let i = 0; i < 400; i++) {
      const seed = 1 + Math.floor(Math.random() * 2147483000);
      let t;
      try { t = maker.make(seed, q.level); } catch { continue; }
      if (t && t.id !== q.id && kindOf(t) === want) return App.banks.remember({ ...t, twinOf: q.id });
    }
    return q;
  }

  // Modelli (numerico) e combinazioni di regole (astratto) sbagliati spesso negli ultimi 14 giorni: almeno 2 errori e
  // almeno 4 su 10. Circa un terzo di ogni sessione generata li ripropone, con numeri e figure nuovi.
  function weakKinds(bankId) {
    const since = Date.now() - 14 * 86400000;
    const c = {};
    const log = App.store.log();
    for (let i = log.length - 1, k = 0; i >= 0 && k < 150; i--) {
      const e = log[i];
      if (e.bank !== bankId || typeof e.id !== 'string' || e.unanswered || e.mode === 'external' || Date.parse(e.t) < since) continue;
      k++;
      const q = App.banks.question(bankId, e.id);
      if (!q) continue;
      const kd = kindOf(q);
      c[kd] = c[kd] || { n: 0, wrong: 0 };
      c[kd].n++; if (!e.ok) c[kd].wrong++;
    }
    return new Set(Object.entries(c).filter(([, x]) => x.wrong >= 2 && x.wrong / x.n >= 0.4).map(([kd]) => kd));
  }

  function genPick(bankId, n, levels = [2], { tags = null, exclude = [] } = {}) {
    const g = bankId === 'astratto' ? App.gen && App.gen.astratto : App.gen && App.gen.numerico;
    if (!g || n <= 0) return [];
    const out = [];
    const seen = new Set(exclude.map((q) => q.id));
    const kinds = {};
    let weak = new Set();
    try { weak = weakKinds(bankId); } catch (err) { console.warn('modelli deboli non calcolabili', err); }
    const wantWeak = weak.size && !tags ? Math.max(1, Math.round(n * 0.3)) : 0;
    let weakTaken = 0;
    const maxKind = Math.max(2, Math.ceil(n / 4));
    for (let guard = 0; out.length < n && guard < n * 40; guard++) {
      const level = levels[out.length % levels.length];
      const seed = 1 + Math.floor(Math.random() * 2147483000);
      const maker = chooseMaker(bankId, level) || g;
      let q;
      try { q = maker.make(seed, level); } catch (err) { console.warn('generatore', bankId, err); continue; }
      if (!q || seen.has(q.id)) continue;
      const strict = guard < n * 30; // dopo molti tentativi si rinuncia ai filtri piuttosto che lasciare la sessione corta
      if (strict && tags && !hasTag(q, tags) && !(q.rules || []).some((r) => tags.includes(r.type))) continue;
      if (strict && (kinds[kindOf(q)] || 0) >= maxKind) continue;
      if (strict && weakTaken < wantWeak && !weak.has(kindOf(q)) && guard < n * 20) continue;
      if (weak.has(kindOf(q))) weakTaken++;
      kinds[kindOf(q)] = (kinds[kindOf(q)] || 0) + 1;
      seen.add(q.id);
      out.push(App.banks.remember(q));
    }
    return shuffle(out);
  }
  function dueOf(bankId, max, filter = () => true) {
    const pending = pendingSimKeys();
    return shuffle(dueItems().filter((q) => q.bank === bankId && filter(q) && !pending.has(key(q)))).slice(0, max).map(twinFor);
  }

  // ── Tappe del percorso ──
  function forStep(step) {
    if (step.kind === 'review') return reviewItems(step.final ? 10 : 8, { onlySeen: Boolean(step.final) });
    const p = step.pick || {};
    if (p.mix) return mixItems();
    const n = p.n || 5;
    if (p.bank === 'verbale') return pickVerbal(n, { levels: p.levels || [1, 2], tags: p.tags || null, formats: p.formats || ['epso4', 'mag5'], hard: Boolean(p.hard) });
    if (p.bank === 'numerico' && !p.gen) return pickTraining('numerico', n, { levels: p.levels || [1] });
    if (p.bank === 'numerico' || p.bank === 'astratto') {
      const due = dueOf(p.bank, Math.floor(n / 3), (q) => !p.tags || hasTag(q, p.tags));
      return shuffle([...due, ...genPick(p.bank, n - due.length, p.gen || [2], { tags: p.tags || null, exclude: due })]);
    }
    return [];
  }

  // Una domanda per prova, livello base: per la prima tappa e per la scheda «Prima della prova».
  function mixItems() {
    const v = pickVerbal(1, { levels: [1, 2], due: false });
    const nn = genPick('numerico', 1, [1]);
    const a = genPick('astratto', 1, [1]);
    return [...v, ...nn, ...a];
  }

  // Ripasso: errori in scadenza, poi gli errori più recenti; nello scarico solo domande già viste.
  function reviewItems(n, { onlySeen = false } = {}) {
    const stats = App.store.itemStats();
    const pending = pendingSimKeys();
    const chosen = shuffle(dueItems(stats)).slice(0, n);
    const add = (q) => { if (q && chosen.length < n && !chosen.some((c) => key(c) === key(q)) && !pending.has(key(q))) chosen.push(q); };
    const recentWrong = [...stats.values()].filter((s) => s.wrong > 0 && s.lastOk === false).sort((a, b) => b.last.localeCompare(a.last));
    for (const s of recentWrong) add(App.banks.question(s.bank, s.id));
    if (onlySeen) {
      const seen = [...stats.values()].filter((s) => !s.simSeen).sort((a, b) => a.last.localeCompare(b.last));
      for (const s of seen) add(App.banks.question(s.bank, s.id));
    }
    if (chosen.length < 3) for (const q of [...pickVerbal(2, { levels: [1, 2], due: false }), ...genPick('astratto', 2, [1, 2])]) add(q);
    // Nel ripasso finale dello scarico niente di nuovo; negli altri, gemelli per numerico e astratto.
    return onlySeen ? chosen : chosen.map(twinFor);
  }

  // Allenamento libero (menu «Altro»): n item di una prova al livello della prova.
  function pickTraining(bankId, n, { levels = null } = {}) {
    if (bankId === 'verbale') return pickVerbal(n, { levels: levels || [2, 1] });
    if (bankId === 'numerico' && levels && levels.includes(1) && !levels.includes(2)) {
      // Problemi brevi della banca base (L1): solo come riscaldamento.
      const stats = App.store.itemStats();
      const weights = tagWeights();
      const pending = pendingSimKeys();
      const cand = pool('numerico', { formats: ['num5'] }).filter((q) => !pending.has(key(q)) && !(stats.get(key(q)) || {}).simSeen);
      return shuffle(rank(cand, stats, weights).slice(0, n));
    }
    const due = dueOf(bankId, Math.floor(n / 3));
    return shuffle([...due, ...genPick(bankId, n - due.length, bankId === 'astratto' ? [1, 2, 2, 3] : [2, 2, 3], { exclude: due })]);
  }

  // Micro: una domanda per prova (verbale, numerico, astratto), con un ripasso al posto della prima se in scadenza.
  function pickMicro() {
    const settings = App.store.settings();
    const stats = App.store.itemStats();
    const pending = pendingSimKeys();
    let v = [];
    if (settings.microVfn && Math.random() < 0.5) v = pool('verbale', { formats: ['vfn'] }).filter((q) => !stats.has(key(q)) && !pending.has(key(q))).slice(0, 1);
    if (!v.length) v = pickVerbal(1, { levels: [1, 2], due: false });
    const items = [...v, ...genPick('numerico', 1, [1, 2]), ...genPick('astratto', 1, [1, 2])];
    const due = shuffle(dueItems(stats))[0];
    if (due && !items.some((q) => key(q) === key(due))) items[0] = due;
    return items;
  }

  function pickOneMore(exclude) {
    const banks = ['verbale', 'numerico', 'astratto'];
    const b = banks[Math.floor(Math.random() * banks.length)];
    const ex = exclude.map((it) => App.banks.question(it.bank, it.id)).filter(Boolean);
    const q = b === 'verbale' ? pickVerbal(1, { levels: [1, 2], due: false, exclude: ex })[0] : genPick(b, 1, [1, 2], { exclude: ex })[0];
    return q || null;
  }

  // Simulazione: verbale mai visto (prima le riserve del livello prova); numerico e astratto generati.
  // Le riserve vanno prima solo nelle simulazioni del percorso: una simulazione a scelta usa prima gli altri brani nuovi,
  // così non consuma i brani tenuti per la simulazione n. 2.
  // hard: chi va forte in questa prova (path.strong) ha numerico e astratto ai livelli 2–3 e, nel verbale, un quarto
  // della prova dai brani di livello alto riservati.
  function pickSim(bankId, n, { reserveFirst = true, hard = false } = {}) {
    if (bankId !== 'verbale') {
      const items = genPick(bankId, n, hard ? [2, 3, 3] : bankId === 'astratto' ? [1, 2, 2, 3] : [2, 2, 3]);
      return { items, fresh: items.length, available: Infinity };
    }
    const stats = App.store.itemStats();
    const all = pool('verbale', { formats: ['epso4'] });
    const unseen = all.filter((q) => !stats.has(key(q)));
    let reserve = shuffle(unseen.filter((q) => q.level >= 2 && isSimReserve(q)));
    if (hard) {
      const top = reserve.filter((q) => (q.difficulty || 0) >= 4).slice(0, Math.round(n / 4));
      reserve = [...top, ...reserve.filter((q) => !top.includes(q))];
    }
    const other = shuffle(unseen.filter((q) => q.level >= 2 && !isSimReserve(q)));
    const order = [...(reserveFirst ? [...reserve, ...other] : [...other, ...reserve]), ...shuffle(unseen.filter((q) => q.level < 2))];
    const chosen = order.slice(0, n);
    const fresh = chosen.length;
    const seenNotSim = all.filter((q) => stats.has(key(q)) && !stats.get(key(q)).simSeen).sort((a, b) => stats.get(key(a)).last.localeCompare(stats.get(key(b)).last));
    for (const q of seenNotSim) { if (chosen.length >= n) break; chosen.push(q); }
    return { items: shuffle(chosen), fresh, available: all.length - all.filter((q) => (stats.get(key(q)) || {}).simSeen).length };
  }

  // Quante domande del verbale restano (per lo Stato e la schermata della simulazione).
  function poolReport() {
    const stats = App.store.itemStats();
    const all = pool('verbale', { formats: ['epso4'] });
    const l2 = all.filter((q) => q.level >= 2), l1 = all.filter((q) => q.level < 2);
    return {
      verbale: {
        l2: l2.length, l2Unseen: l2.filter((q) => !stats.has(key(q))).length,
        reserve: l2.filter(isSimReserve).filter((q) => !stats.has(key(q))).length,
        l1: l1.length, l1Unseen: l1.filter((q) => !stats.has(key(q))).length,
        total: all.length, unseen: all.filter((q) => !stats.has(key(q))).length,
        freshForSim: all.filter((q) => !(stats.get(key(q)) || {}).simSeen).length,
        priv: pool('verbale', { formats: ['epso4', 'mag5'] }).filter((q) => q.priv).length,
        privUnseen: pool('verbale', { formats: ['epso4', 'mag5'] }).filter((q) => q.priv && !stats.has(key(q))).length,
      },
    };
  }

  return { pool, dueItems, pickVerbal, genPick, forStep, pickTraining, pickMicro, pickOneMore, pickSim, poolReport, tagWeights, pendingSimKeys, isSimReserve };
})();
