// Il percorso della Parte 1 — namespace App.path
// Una sola sequenza di tappe fino alla prova: la home propone sempre e solo la prossima.
// Fasi: Basi (una misura di partenza e 12 schede con poche domande e correzione subito) → Allenamento a ritmo di
// prova (ciclo verbale, numerico, verbale, astratto, ripasso, tarato sulla misura più recente; blocchi a tempo ogni
// due giorni) con due simulazioni complete → Scarico → riposo → prova.
// Lo stato sta in App.store.path(): { done: { [id]: { t, n, correct, by? } }, p2: { i } }.
window.App = window.App || {};
App.path = (() => {
  'use strict';
  const { todayKey, daysUntil } = App.utils;

  // Date della prova [V lettera d'invito del 19/10; TAO, «My sessions», letto il 23/10]. Ora di Bruxelles = ora italiana.
  const EXAM = { day: '2026-11-11', at: new Date('2026-11-11T14:00:00+01:00'), label: 'mer 11/11 alle 14:00' };
  const PREREQ = { at: new Date('2026-11-06T11:59:00+01:00'), day: '2026-11-06', label: 'ven 06/11 alle 11:59' };
  const TAPER = '2026-11-08';   // scarico da domenica 08/11 [S, Piano di studio]
  const REST = '2026-11-10';    // il giorno prima: niente
  // Tappe al giorno: 3 nei feriali (circa 35′, il budget deciso l'08/10), 6 nel fine settimana (sessioni lunghe).
  const PER_DAY = 3;
  const PER_DAY_WEEKEND = 6;
  const isWeekend = (now) => now.getDay() === 0 || now.getDay() === 6;
  const targetFor = (now) => (isWeekend(now) ? PER_DAY_WEEKEND : PER_DAY);

  // Basi: prima com'è fatta la prova, poi una misura di partenza nel formato vero (le sessioni pubbliche TAO non danno
  // punteggio [V istruzioni TAO §2.5.9]), poi le schede, a turno sulle tre prove.
  const BASI = [
    { id: 'b01', kind: 'lesson', lesson: 'prova', title: 'Come funziona la Parte 1', sub: 'scheda + 3 domande, una per prova', min: 7, pick: { mix: true } },
    { id: 'bm', kind: 'sim', mode: 'baseline', title: 'Misura di partenza', sub: 'come la prova ma più corta: 10 domande di verbale, 5 di numerico e 5 serie di astratto, con il ritmo vero', min: 33 },
    { id: 'b02', kind: 'lesson', lesson: 'v-metodo', title: 'Verbale · il metodo', sub: 'scheda + 4 domande', min: 10, pick: { bank: 'verbale', n: 4, levels: [1] } },
    { id: 'b03', kind: 'lesson', lesson: 'a-metodo', title: 'Astratto · il metodo', sub: 'scheda + 5 serie di figure', min: 7, pick: { bank: 'astratto', n: 5, gen: [1] } },
    { id: 'b04', kind: 'lesson', lesson: 'n-metodo', title: 'Numerico · il metodo', sub: 'scheda + 4 domande su tabelle e grafici', min: 11, pick: { bank: 'numerico', n: 4, gen: [1] } },
    { id: 'b05', kind: 'lesson', lesson: 'v-quant', title: 'Verbale · quantificatori e negazioni', sub: 'scheda + 4 domande', min: 10, pick: { bank: 'verbale', n: 4, levels: [1], tags: ['quantificatore', 'negazione'], formats: ['epso4', 'vfn'] } },
    { id: 'b06', kind: 'lesson', lesson: 'a-cont', title: 'Astratto · conteggio e rotazione', sub: 'scheda + 5 serie di figure', min: 7, pick: { bank: 'astratto', n: 5, gen: [1], tags: ['conteggio', 'rotazione'] } },
    { id: 'b07', kind: 'lesson', lesson: 'n-perc', title: 'Numerico · percentuali e variazioni', sub: 'scheda + 4 domande su tabelle e grafici', min: 11, pick: { bank: 'numerico', n: 4, gen: [1], tags: ['percentuali'] } },
    { id: 'b08', kind: 'lesson', lesson: 'v-infer', title: 'Verbale · inferenza e conoscenza esterna', sub: 'scheda + 4 domande', min: 10, pick: { bank: 'verbale', n: 4, levels: [1, 2], tags: ['inferenza', 'fuori-testo'] } },
    { id: 'b09', kind: 'lesson', lesson: 'a-alt', title: 'Astratto · alternanza, riempimento, posizione', sub: 'scheda + 5 serie di figure', min: 7, pick: { bank: 'astratto', n: 5, gen: [1], tags: ['alternanza', 'riempimento', 'posizione'] } },
    { id: 'b10', kind: 'lesson', lesson: 'n-tab', title: 'Numerico · quote, pro capite, unità', sub: 'scheda + 4 domande su tabelle e grafici', min: 11, pick: { bank: 'numerico', n: 4, gen: [1, 2], tags: ['rapporti', 'unita-misura', 'lettura-dati'] } },
    { id: 'b11', kind: 'lesson', lesson: 'v-tempo', title: 'Verbale · tempo, ambito, parafrasi', sub: 'scheda + 4 domande', min: 10, pick: { bank: 'verbale', n: 4, levels: [1, 2], tags: ['tempo', 'scope', 'parafrasi'] } },
    { id: 'b12', kind: 'lesson', lesson: 'a-comb', title: 'Astratto · regole combinate', sub: 'scheda + 5 serie di figure', min: 7, pick: { bank: 'astratto', n: 5, gen: [2] } },
    { id: 'b13', kind: 'lesson', lesson: 'n-medie', title: 'Numerico · medie, proiezioni, cambi', sub: 'scheda + 4 domande su tabelle e grafici', min: 11, pick: { bank: 'numerico', n: 4, gen: [2], tags: ['media', 'percentuali', 'unita-misura'] } },
  ];
  // Prova di ogni scheda (per il recupero: a pochi giorni dalla prova le schede rimaste si leggono prima del drill).
  const SLOT_OF = { b01: '*', b02: 'v', b03: 'a', b04: 'n', b05: 'v', b06: 'a', b07: 'n', b08: 'v', b09: 'a', b10: 'n', b11: 'v', b12: 'a', b13: 'n' };

  // Tappe dell'allenamento. Durate oneste: domande a ritmo di prova più il tempo per leggere la correzione.
  const DRILL = {
    v: { slot: 'v', kind: 'drill', title: 'Verbale a ritmo di prova', sub: '5 domande · 1′45″ ciascuna, poi la correzione', min: 12, pick: { bank: 'verbale', n: 5, levels: [2, 1] } },
    n: { slot: 'n', kind: 'drill', title: 'Numerico su tabelle e grafici', sub: '5 domande · 2′ ciascuna, poi la correzione', min: 13, pick: { bank: 'numerico', n: 5, gen: [2] } },
    a: { slot: 'a', kind: 'drill', title: 'Astratto: 10 serie', sub: '10 serie · 1′ ciascuna, poi la correzione', min: 13, pick: { bank: 'astratto', n: 10, gen: [1, 2, 2, 3] } },
    a5: { slot: 'a', kind: 'drill', title: 'Astratto: 5 serie', sub: '5 serie · 1′ ciascuna, poi la correzione', min: 7, pick: { bank: 'astratto', n: 5, gen: [2, 2, 3] } },
    r: { slot: 'r', kind: 'review', title: 'Ripasso degli errori', sub: 'tornano le domande sbagliate nei giorni scorsi', min: 8 },
  };
  // Il verbale pesa doppio: è l'unico punteggio che entra in graduatoria [V bando].
  const BASE_CYCLE = ['v', 'n', 'v', 'a', 'r'];
  const CYCLE = BASE_CYCLE.map((k) => DRILL[k]);

  // Blocchi a tempo: una prova sola, nel clone di TAO, con la correzione solo alla fine. Dal 27/10, ogni due giorni.
  const BLOCK_FROM = '2026-10-27';
  const BLOCKS = {
    verbale: { title: 'Blocco a tempo · verbale', sub: '10 domande in 17′30″, la correzione alla fine', min: 24, n: 10, minutes: 17.5 },
    numerico: { title: 'Blocco a tempo · numerico', sub: '5 domande in 10′, la correzione alla fine', min: 15, n: 5, minutes: 10 },
    astratto: { title: 'Blocco a tempo · astratto', sub: '10 serie in 10′, la correzione alla fine', min: 14, n: 10, minutes: 10 },
  };

  const SIMS = [
    { id: 's1', kind: 'sim', lesson: 'strategia', from: '2026-10-31', until: '2026-11-06', title: 'Simulazione completa n. 1', sub: 'sul PC: verbale 35′ → numerico 20′ → astratto 10′', min: 65 },
    { id: 's2', kind: 'sim', from: '2026-11-07', until: '2026-11-08', title: 'Simulazione completa n. 2', sub: 'sul PC, se puoi alle 14:00 come la prova', min: 65 },
  ];

  // Scarico: domenica 08/11 il ripasso; lunedì 09/11 un verbale leggero e la scheda «Prima della prova» (con il PC).
  const TAPERS = [
    { id: 't1', kind: 'review', title: 'Ripasso finale', sub: 'solo domande già viste: niente di nuovo', min: 10, final: true },
    { id: 't3', kind: 'drill', from: '2026-11-09', title: 'Verbale leggero', sub: '5 brani brevi mai visti, a ritmo di prova, poi la correzione', min: 10, pick: { bank: 'verbale', n: 5, levels: [1] } },
    { id: 't2', kind: 'lesson', from: '2026-11-09', lesson: 'fine', title: 'Prima della prova', sub: 'scheda + 3 domande leggere; poi prepara il PC con la checklist', min: 6, pick: { mix: true } },
  ];

  const blank = () => ({ done: {}, p2: { i: 0 } });
  function state() {
    const s = App.store.path();
    return { ...blank(), ...s, done: { ...(s.done || {}) }, p2: { i: 0, ...(s.p2 || {}) } };
  }

  // Quante tappe fatte in totale e oggi (una simulazione o la misura di partenza valgono 3).
  function counts(now = new Date()) {
    const st = state();
    const k = todayKey(now);
    let total = 0, today = 0;
    for (const [id, d] of Object.entries(st.done)) {
      if (d && d.via) continue; // scheda letta dentro un'altra tappa: non è una tappa in più
      total++;
      if (d && d.t && todayKey(new Date(d.t)) === k) today += id[0] === 's' || id === 'bm' ? PER_DAY : 1;
    }
    const target = targetFor(now);
    return { total, today: Math.min(today, target * 3), target };
  }

  // Tappe fatte per giorno (calendario della home): una simulazione o la misura valgono 3, le schede lette dentro un
  // drill non contano.
  function dayCounts() {
    const m = {};
    for (const [id, d] of Object.entries(state().done)) {
      if (!d || d.via || !d.t) continue;
      const k = todayKey(new Date(d.t));
      m[k] = (m[k] || 0) + (id[0] === 's' || id === 'bm' ? PER_DAY : 1);
    }
    return m;
  }

  function phaseOf(k) { return k >= TAPER ? 'Scarico' : 'Basi'; }

  // ── Taratura del ciclo sulla misura più recente (misura di partenza, poi simulazioni) [S, regola del Piano §3] ──
  function measure(st) {
    for (const id of ['s2', 's1', 'bm']) { const d = st.done[id]; if (d && d.by) return { id, by: d.by }; }
    return null;
  }
  function cycleFor(st) {
    const m = measure(st);
    if (!m) return { keys: BASE_CYCLE, why: '' };
    const r = (b) => { const x = m.by[b]; return x && x.n ? x.correct / x.n : null; };
    const v = r('verbale'), n = r('numerico'), a = r('astratto');
    const keys = ['v', 'n', 'v', a != null && a >= 0.8 ? 'a5' : 'a', 'r'];
    const why = [];
    if (v != null && v < 0.6) { keys.splice(4, 0, 'v'); why.push('più verbale'); }
    // Numerico e astratto ben sopra la soglia (80% o più tutti e due): una tappa di verbale in più, perché è l'unico
    // punteggio che entra in graduatoria.
    else if (v != null && v < 0.9 && n != null && n >= 0.8 && a != null && a >= 0.8) { keys.splice(4, 0, 'v'); why.push('più verbale, perché numerico e astratto sono già ben sopra la soglia'); }
    if (n != null && n < 0.5) { keys.splice(2, 0, 'n'); why.push('più numerico'); }
    if (a != null && a < 0.5) { keys.splice(keys.length - 1, 0, 'a'); why.push('più astratto'); }
    if (a != null && a >= 0.8) why.push('astratto più breve');
    const src = m.id === 'bm' ? 'sulla misura di partenza' : `sulla simulazione n. ${m.id.slice(1)}`;
    return { keys, why: why.length ? `Ciclo tarato ${src}: ${why.join(', ')}.` : '' };
  }

  // Livello del numerico e dell'astratto: si sale quando le ultime risposte di livello prova (2 e oltre) sono giuste
  // almeno 7 volte su 10. Contano solo gli item generati (id testuale), non le risposte in bianco della simulazione.
  function accuracy(bank, { last = 12, minLevel = 2 } = {}) {
    const log = (App.store.log && App.store.log()) || [];
    let hits = 0, n = 0;
    for (let i = log.length - 1; i >= 0 && n < last; i--) {
      const e = log[i];
      if (e.bank !== bank || e.mode === 'external' || e.unanswered || typeof e.id !== 'string' || (e.level || 0) < minLevel) continue;
      n++; if (e.ok) hits++;
    }
    return n >= 6 ? hits / n : null;
  }

  // ── Chi va forte salta il livello base ──
  // Forte in una prova: misura di partenza al 75% o più, oppure almeno l'85% delle ultime 8 risposte (qualsiasi
  // livello; ripasso e gemelli esclusi; servono almeno 6 risposte).
  function recentRate(bank, last = 8) {
    const log = (App.store.log && App.store.log()) || [];
    let hits = 0, n = 0;
    for (let i = log.length - 1; i >= 0 && n < last; i--) {
      const e = log[i];
      if (e.bank !== bank || e.mode === 'external' || e.mode === 'review' || e.unanswered || e.twinOf != null) continue;
      n++; if (e.ok) hits++;
    }
    return n >= 6 ? hits / n : null;
  }
  function strong(st, bank) {
    const m = st.done.bm && st.done.bm.by && st.done.bm.by[bank];
    if (m && m.n && m.correct / m.n >= 0.75) return true;
    return (recentRate(bank) || 0) >= 0.85;
  }
  // Verbale «solido»: misura di partenza al 60% o più (sopra la soglia con margine), oppure almeno il 70% delle ultime
  // 8 risposte. Le domande di livello base non allenano più nulla: si passa ai brani di livello prova.
  function solid(st, bank) {
    const m = st.done.bm && st.done.bm.by && st.done.bm.by[bank];
    if (m && m.n && m.correct / m.n >= 0.6) return true;
    return (recentRate(bank) || 0) >= 0.7;
  }
  // Le schede delle Basi di una prova in cui vai forte passano a domande di livello prova (nel verbale prima i brani
  // più difficili); nel verbale basta essere «solidi» per i brani di livello prova. Il metodo resta, la difficoltà no.
  function boost(step, st) {
    const p = step.pick;
    if (!p || !p.bank) return step;
    const isStrong = strong(st, p.bank);
    if (!isStrong && !(p.bank === 'verbale' && solid(st, p.bank))) return step;
    const pick = p.bank === 'verbale' ? { ...p, levels: [2], formats: ['epso4'], hard: isStrong } : { ...p, gen: [2, 3] };
    const sub = step.sub.replace(/(\d+) domande/, '$1 domande di livello prova').replace(/(\d+) serie di figure/, '$1 serie di livello prova');
    return { ...step, pick, sub, boosted: isStrong ? 'forte' : 'solido' };
  }

  function cycleStep(st, now, basiLeft = null) {
    const { keys, why } = cycleFor(st);
    const hardN = (accuracy('numerico') || 0) >= 0.7 || strong(st, 'numerico');
    const hardA = (accuracy('astratto') || 0) >= 0.7 || strong(st, 'astratto');
    const hardV = strong(st, 'verbale');
    for (let i = st.p2.i; i < st.p2.i + keys.length; i++) {
      const base = DRILL[keys[i % keys.length]];
      if (base.kind === 'review' && App.select.dueItems().length < 3) continue; // pochi errori in scadenza: si salta
      const pick = base.pick ? { ...base.pick } : null;
      if (pick && hardN && pick.bank === 'numerico') pick.gen = [2, 3];
      if (pick && hardA && pick.bank === 'astratto') pick.gen = base === DRILL.a5 ? [2, 3, 3] : [2, 2, 3, 3];
      if (pick && hardV && pick.bank === 'verbale') pick.hard = true;
      // Recupero: la scheda rimasta di questa prova si legge prima del drill e conta come fatta.
      let lesson = null, alsoDone = null;
      if (basiLeft && base.slot !== 'r') {
        const b = basiLeft.find((s) => s.kind === 'lesson' && (SLOT_OF[s.id] === base.slot || SLOT_OF[s.id] === '*'));
        if (b) { lesson = b.lesson; alsoDone = [b.id]; }
      }
      return { ...base, pick, lesson, alsoDone, id: `p2-${i}`, p2i: i, phase: 'Allenamento', why };
    }
    return { ...DRILL.v, id: `p2-${st.p2.i}`, p2i: st.p2.i, phase: 'Allenamento', why };
  }

  // Blocco a tempo del giorno, se tocca: dal 27/10, a due giorni dall'ultimo; verbale, numerico, astratto a turno.
  function blockStep(st, now) {
    const k = todayKey(now);
    if (k < BLOCK_FROM) return null;
    const done = Object.keys(st.done).filter((id) => id.startsWith('blk-')).sort();
    if (done.some((id) => id.slice(4, 14) === k)) return null;
    const last = done.length ? done[done.length - 1].slice(4, 14) : null;
    if (last && daysUntil(k, new Date(`${last}T12:00:00`)) < 2) return null;
    const bank = ['verbale', 'numerico', 'astratto'][done.length % 3];
    const b = BLOCKS[bank];
    // Chi va forte allena un margine: il 10% di tempo in meno del ritmo della prova.
    if (strong(st, bank)) {
      const minutes = Math.round(b.minutes * 0.9 * 2) / 2;
      return { id: `blk-${k}-${bank[0]}`, kind: 'block', bank, ...b, minutes, sub: `${b.sub.split(',')[0].replace(/in [\d′″]+/, `in ${minutes % 1 ? `${Math.floor(minutes)}′30″` : `${minutes}′`}`)}: ritmo stretto, il 10% più veloce della prova; la correzione alla fine`, phase: 'Allenamento' };
    }
    return { id: `blk-${k}-${bank[0]}`, kind: 'block', bank, ...b, phase: 'Allenamento' };
  }

  // La prossima cosa da fare, in base alla data e a ciò che è già fatto.
  function next(now = new Date()) {
    const k = todayKey(now);
    const st = state();
    if (k > EXAM.day || (k === EXAM.day && now >= EXAM.at)) return { kind: 'after' };
    if (k === EXAM.day) return { kind: 'examday' };
    if (k === REST) return { kind: 'rest' };
    // Senza la simulazione n. 1 fatta, la n. 2 è la prima: niente numero e la scheda di strategia prima di iniziare.
    const simOf = (s) => (s.id === 's2' && !st.done.s1 ? { ...s, title: 'Simulazione completa', lesson: 'strategia' } : s);
    if (k >= TAPER) {
      const s2 = SIMS[1];
      if (k <= s2.until && !st.done[s2.id]) return { ...simOf(s2), phase: 'Simulazione' };
      const t = TAPERS.find((s) => !st.done[s.id] && (!s.from || k >= s.from));
      if (t) return { ...t, phase: 'Scarico' };
      return TAPERS.some((s) => !st.done[s.id]) ? { kind: 'taper-wait' } : { kind: 'taper-done' };
    }
    // Simulazioni per data, anche con le Basi a metà: nel fine settimana (o l'ultimo giorno utile) sono la tappa
    // principale; negli altri giorni restano a portata di mano come alternativa.
    const found = SIMS.find((s) => k >= s.from && k <= s.until && !st.done[s.id]);
    const sim = found ? simOf(found) : null;
    if (sim && (isWeekend(now) || k === sim.until)) return { ...sim, phase: 'Simulazione' };
    const basiLeft = BASI.filter((s) => !st.done[s.id]);
    // A 12 giorni o meno dalla prova, con più di 3 Basi da fare, le schede rimaste si leggono dentro i drill.
    const compress = basiLeft.length > 3 && daysToExam(now) <= 12;
    let step;
    if (basiLeft.length && !compress) step = boost({ ...basiLeft[0], phase: 'Basi', index: BASI.length - basiLeft.length + 1, of: BASI.length }, st);
    else step = blockStep(st, now) || cycleStep(st, now, compress ? basiLeft : null);
    return sim ? { ...step, simAlt: { ...sim, phase: 'Simulazione' } } : step;
  }

  // Alternativa breve a una tappa lunga (simulazione, misura, blocco): la prossima tappa vera del ciclo.
  function shortStep(now = new Date()) {
    const st = state();
    const basiLeft = BASI.filter((s) => !st.done[s.id] && s.kind === 'lesson');
    if (basiLeft.length && daysToExam(now) > 12) return boost({ ...basiLeft[0], phase: 'Basi' }, st);
    return cycleStep(st, now, basiLeft.length ? basiLeft : null);
  }

  function complete(step, summary = {}) {
    if (!step || !step.id) return;
    const st = state();
    const t = new Date().toISOString();
    st.done[step.id] = { t, n: summary.n || 0, correct: summary.correct || 0, ...(summary.by ? { by: summary.by } : {}) };
    for (const id of step.alsoDone || []) if (!st.done[id]) st.done[id] = { t, n: 0, correct: 0, via: step.id };
    if (Number.isInteger(step.p2i)) st.p2.i = Math.max(st.p2.i, step.p2i + 1);
    App.store.setPath(st);
  }
  const isDone = (id) => Boolean(state().done[id]);

  // Avvio di una tappa: sessione (scheda + domande), simulazione completa, misura di partenza o blocco a tempo.
  function start(step) {
    if (!step) return;
    const meta = { id: step.id, title: step.title, ...(step.alsoDone ? { alsoDone: step.alsoDone } : {}) };
    if (step.kind === 'sim') {
      const go = () => (step.mode === 'baseline' ? App.sim.startBaseline({ step: meta }) : App.sim.startFull({ step: meta }));
      if (step.lesson) App.lessons.show(step.lesson, { kicker: step.title, goText: 'Inizia la simulazione', onGo: go, onBack: () => App.main.home() });
      else go();
      return;
    }
    if (step.kind === 'block') { App.sim.startBlock({ step: meta, bank: step.bank, n: step.n, minutes: step.minutes }); return; }
    if (step.kind === 'official') { App.main.showOfficial(step); return; }
    const items = App.select.forStep(step);
    if (!items.length) { App.ui.toast('Nessuna domanda disponibile per questa tappa.'); return; }
    App.session.start('tappa', items, { step: { id: step.id, p2i: step.p2i, title: step.title, kind: step.kind, ...(step.alsoDone ? { alsoDone: step.alsoDone } : {}) }, lessonId: step.lesson || null, bankLabel: step.title });
  }

  const daysToExam = (now = new Date()) => daysUntil(EXAM.day, now);
  const prereqOpen = (now = new Date()) => !App.store.settings().prereqDone && now < PREREQ.at;

  return { EXAM, PREREQ, TAPER, REST, PER_DAY, PER_DAY_WEEKEND, BASI, CYCLE, DRILL, BLOCKS, SIMS, TAPERS, next, shortStep, complete, isDone, start, counts, dayCounts, daysToExam, prereqOpen, phaseOf, state, cycleFor, accuracy, strong, isWeekend };
})();
