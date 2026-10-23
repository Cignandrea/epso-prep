// Il percorso della Parte 1 — namespace App.path
// Una sola sequenza di tappe da ~10′ fino alla prova: la home propone sempre e solo la prossima.
// Fasi: Basi (scheda + poche domande con correzione subito) → Allenamento a ritmo di prova (ciclo verbale,
// numerico, verbale, astratto, ripasso) con due simulazioni complete → Scarico → riposo → prova.
// Lo stato sta in App.store.path(): { done: { [id]: { t, n, correct } }, p2: { i } }.
window.App = window.App || {};
App.path = (() => {
  'use strict';
  const { todayKey, daysUntil } = App.utils;

  // Date della prova [V lettera d'invito del 19/10; TAO, «My sessions», letto il 23/10]. Ora di Bruxelles = ora italiana.
  const EXAM = { day: '2026-11-11', at: new Date('2026-11-11T14:00:00+01:00'), label: 'mer 11/11 alle 14:00' };
  const PREREQ = { at: new Date('2026-11-06T11:59:00+01:00'), day: '2026-11-06', label: 'ven 06/11 alle 11:59' };
  const TAPER = '2026-11-08';   // scarico da domenica 08/11 [S, Piano di studio]
  const REST = '2026-11-10';    // il giorno prima: niente
  const PER_DAY = 3;            // 3 tappe ≈ 30′: budget deciso l'08/10; il minimo è 1

  const BASI = [
    { id: 'b01', kind: 'lesson', lesson: 'prova', title: 'Come funziona la Parte 1', sub: 'scheda + 3 domande, una per prova', min: 6, pick: { mix: true } },
    { id: 'b02', kind: 'lesson', lesson: 'v-metodo', title: 'Verbale · il metodo', sub: 'scheda + 4 domande', min: 8, pick: { bank: 'verbale', n: 4, levels: [1] } },
    { id: 'b03', kind: 'lesson', lesson: 'a-metodo', title: 'Astratto · il metodo', sub: 'scheda + 5 serie di figure', min: 6, pick: { bank: 'astratto', n: 5, gen: [1] } },
    { id: 'b04', kind: 'lesson', lesson: 'n-metodo', title: 'Numerico · il metodo', sub: 'scheda + 4 domande su tabella', min: 9, pick: { bank: 'numerico', n: 4, gen: [1] } },
    { id: 'b05', kind: 'lesson', lesson: 'v-quant', title: 'Verbale · quantificatori e negazioni', sub: 'scheda + 4 domande', min: 8, pick: { bank: 'verbale', n: 4, levels: [1], tags: ['quantificatore', 'negazione'], formats: ['epso4', 'vfn'] } },
    { id: 'b06', kind: 'lesson', lesson: 'a-cont', title: 'Astratto · conteggio e rotazione', sub: 'scheda + 5 serie di figure', min: 6, pick: { bank: 'astratto', n: 5, gen: [1], tags: ['conteggio', 'rotazione'] } },
    { id: 'b07', kind: 'lesson', lesson: 'n-perc', title: 'Numerico · percentuali e variazioni', sub: 'scheda + 4 domande su tabella', min: 9, pick: { bank: 'numerico', n: 4, gen: [1], tags: ['percentuali'] } },
    { id: 'b08', kind: 'lesson', lesson: 'v-infer', title: 'Verbale · inferenza e conoscenza esterna', sub: 'scheda + 4 domande', min: 8, pick: { bank: 'verbale', n: 4, levels: [1, 2], tags: ['inferenza', 'fuori-testo'] } },
    { id: 'b09', kind: 'lesson', lesson: 'a-alt', title: 'Astratto · alternanza, riempimento, posizione', sub: 'scheda + 5 serie di figure', min: 6, pick: { bank: 'astratto', n: 5, gen: [1], tags: ['alternanza', 'riempimento', 'posizione'] } },
    { id: 'b10', kind: 'lesson', lesson: 'n-tab', title: 'Numerico · quote, pro capite, unità', sub: 'scheda + 4 domande su tabella', min: 9, pick: { bank: 'numerico', n: 4, gen: [1, 2], tags: ['rapporti', 'unita-misura', 'lettura-dati'] } },
    { id: 'b11', kind: 'lesson', lesson: 'v-tempo', title: 'Verbale · tempo, ambito, parafrasi', sub: 'scheda + 4 domande', min: 8, pick: { bank: 'verbale', n: 4, levels: [1, 2], tags: ['tempo', 'scope', 'parafrasi'] } },
    { id: 'b12', kind: 'lesson', lesson: 'a-comb', title: 'Astratto · regole combinate', sub: 'scheda + 5 serie di figure', min: 6, pick: { bank: 'astratto', n: 5, gen: [2] } },
    { id: 'b13', kind: 'lesson', lesson: 'n-medie', title: 'Numerico · medie, proiezioni, cambi', sub: 'scheda + 4 domande su tabella', min: 9, pick: { bank: 'numerico', n: 4, gen: [2], tags: ['media', 'percentuali', 'unita-misura'] } },
    { id: 'b14', kind: 'official', title: 'Test di esempio ufficiale su TAO', sub: 'sul PC della prova, 30′: la piattaforma vera e una prima misura', min: 30 },
  ];

  // Ciclo dell'allenamento: il verbale pesa doppio, perché è l'unico punteggio che entra in graduatoria [V bando].
  const CYCLE = [
    { slot: 'v', kind: 'drill', title: 'Verbale a ritmo di prova', sub: '5 domande · 1′45″ ciascuna', min: 9, pick: { bank: 'verbale', n: 5, levels: [2, 1] } },
    { slot: 'n', kind: 'drill', title: 'Numerico su tabelle', sub: '5 domande · 2′ ciascuna', min: 10, pick: { bank: 'numerico', n: 5, gen: [2] } },
    { slot: 'v', kind: 'drill', title: 'Verbale a ritmo di prova', sub: '5 domande · 1′45″ ciascuna', min: 9, pick: { bank: 'verbale', n: 5, levels: [2, 1] } },
    { slot: 'a', kind: 'drill', title: 'Astratto: 10 serie', sub: '10 serie in 10′, come in prova', min: 10, pick: { bank: 'astratto', n: 10, gen: [1, 2, 2, 3] } },
    { slot: 'r', kind: 'review', title: 'Ripasso degli errori', sub: 'tornano le domande sbagliate nei giorni scorsi', min: 8 },
  ];
  const HARDER_FROM = '2026-11-03'; // ultima settimana: più item difficili

  const SIMS = [
    { id: 's1', kind: 'sim', from: '2026-10-31', until: '2026-11-06', title: 'Simulazione completa n. 1', sub: 'sul PC: verbale 35′ → numerico 20′ → astratto 10′', min: 65 },
    { id: 's2', kind: 'sim', from: '2026-11-07', until: '2026-11-08', title: 'Simulazione completa n. 2', sub: 'sul PC, se puoi alle 14:00 come la prova', min: 65 },
  ];

  const TAPERS = [
    { id: 't1', kind: 'review', title: 'Ripasso finale', sub: 'solo domande già viste: niente di nuovo', min: 10, final: true },
    { id: 't2', kind: 'lesson', lesson: 'fine', title: 'Prima della prova', sub: 'scheda + 3 domande leggere', min: 6, pick: { mix: true } },
  ];

  const blank = () => ({ done: {}, p2: { i: 0 } });
  function state() {
    const s = App.store.path();
    return { ...blank(), ...s, done: { ...(s.done || {}) }, p2: { i: 0, ...(s.p2 || {}) } };
  }

  // Quante tappe fatte in totale e oggi (una simulazione vale la giornata).
  function counts(now = new Date()) {
    const st = state();
    const k = todayKey(now);
    let total = 0, today = 0;
    for (const [id, d] of Object.entries(st.done)) {
      total++;
      if (d && d.t && todayKey(new Date(d.t)) === k) today += id[0] === 's' ? PER_DAY : 1;
    }
    return { total, today: Math.min(today, 9), target: PER_DAY };
  }

  function phaseOf(k) { return k >= TAPER ? 'Scarico' : 'Basi'; }

  function cycleStep(st, now) {
    const hard = todayKey(now) >= HARDER_FROM;
    for (let i = st.p2.i; i < st.p2.i + CYCLE.length; i++) {
      const base = CYCLE[i % CYCLE.length];
      if (base.kind === 'review' && App.select.dueItems().length < 3) continue; // pochi errori in scadenza: si salta
      const pick = base.pick ? { ...base.pick } : null;
      if (pick && hard && pick.bank === 'numerico') pick.gen = [2, 3];
      if (pick && hard && pick.bank === 'astratto') pick.gen = [2, 2, 3, 3];
      return { ...base, pick, id: `p2-${i}`, p2i: i, phase: 'Allenamento' };
    }
    return { ...CYCLE[0], id: `p2-${st.p2.i}`, p2i: st.p2.i, phase: 'Allenamento' };
  }

  // La prossima cosa da fare, in base alla data e a ciò che è già fatto.
  function next(now = new Date()) {
    const k = todayKey(now);
    const st = state();
    if (k > EXAM.day || (k === EXAM.day && now >= EXAM.at)) return { kind: 'after' };
    if (k === EXAM.day) return { kind: 'examday' };
    if (k === REST) return { kind: 'rest' };
    const basiLeft = BASI.filter((s) => !st.done[s.id]);
    if (k >= TAPER) {
      const s2 = SIMS[1];
      if (k <= s2.until && !st.done[s2.id] && !basiLeft.length) return { ...s2, phase: 'Simulazione' };
      const t = TAPERS.find((s) => !st.done[s.id]);
      return t ? { ...t, phase: 'Scarico' } : { kind: 'taper-done' };
    }
    if (basiLeft.length) return { ...basiLeft[0], phase: 'Basi', index: BASI.length - basiLeft.length + 1, of: BASI.length };
    const sim = SIMS.find((s) => k >= s.from && k <= s.until && !st.done[s.id]);
    if (sim) return { ...sim, phase: 'Simulazione' };
    return cycleStep(st, now);
  }

  function complete(step, summary = {}) {
    if (!step || !step.id) return;
    const st = state();
    st.done[step.id] = { t: new Date().toISOString(), n: summary.n || 0, correct: summary.correct || 0 };
    if (Number.isInteger(step.p2i)) st.p2.i = Math.max(st.p2.i, step.p2i + 1);
    App.store.setPath(st);
  }
  const isDone = (id) => Boolean(state().done[id]);

  // Avvio di una tappa: sessione (scheda + domande), simulazione completa o test ufficiale.
  function start(step) {
    if (!step) return;
    if (step.kind === 'sim') { App.sim.startFull({ step: { id: step.id, title: step.title } }); return; }
    if (step.kind === 'official') { App.main.showOfficial(step); return; }
    const items = App.select.forStep(step);
    if (!items.length) { App.ui.toast('Nessuna domanda disponibile per questa tappa.'); return; }
    App.session.start('tappa', items, { step: { id: step.id, p2i: step.p2i, title: step.title, kind: step.kind }, lessonId: step.lesson || null, bankLabel: step.title });
  }

  const daysToExam = (now = new Date()) => daysUntil(EXAM.day, now);
  const prereqOpen = (now = new Date()) => !App.store.settings().prereqDone && now < PREREQ.at;

  return { EXAM, PREREQ, TAPER, REST, PER_DAY, BASI, CYCLE, SIMS, TAPERS, next, complete, isDone, start, counts, daysToExam, prereqOpen, phaseOf, state };
})();
