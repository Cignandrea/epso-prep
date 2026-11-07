// Il percorso della Parte 1 — namespace App.path
// Una sola sequenza di tappe fino alla prova: la home propone sempre e solo la prossima.
// Fasi fino al 02/11: Basi (una misura di partenza e 12 schede con poche domande e correzione subito) → Allenamento a
// ritmo di prova (ciclo verbale, numerico, verbale, astratto, ripasso, tarato sulla misura più recente; blocchi a
// tempo ogni due giorni) con una simulazione completa. Dal 03/11 (v1.3): l'ultima settimana, una sessione da 30′ a
// sera nel formato della prova, la simulazione completa nel fine settimana, «Prima della prova» lunedì, riposo martedì.
// Dal 07/11 (v1.3.1, decisione di Andrea del 07/11: «la userò oggi e domani e basta, 2 o 3 ore in tutto»): piano a due
// giorni, sabato la simulazione completa, domenica una sessione di verbale e «Prima della prova», poi riposo fino alla prova.
// Lo stato sta in App.store.path(): { done: { [id]: { t, n, correct, by? } }, p2: { i } }.
window.App = window.App || {};
App.path = (() => {
  'use strict';
  const { todayKey, daysUntil } = App.utils;

  // Date della prova [V lettera d'invito del 19/10; TAO, «My sessions», letto il 23/10]. Ora di Bruxelles = ora italiana.
  const EXAM = { day: '2026-11-11', at: new Date('2026-11-11T14:00:00+01:00'), label: 'mer 11/11 alle 14:00' };
  const PREREQ = { at: new Date('2026-11-06T11:59:00+01:00'), day: '2026-11-06', label: 'ven 06/11 alle 11:59' };
  // Reclami (domanda errata, problema tecnico): 3 giorni di calendario dal giorno dopo la prova [V bando, Allegato I §7].
  const COMPLAINTS = { at: new Date('2026-11-14T23:59:00+01:00'), day: '2026-11-14', label: 'sab 14/11' };
  // Portale EPSO: il bando chiede di controllare l'account almeno ogni 3 giorni di calendario [V Allegato I §1].
  // Ultimo controllo verificato prima di questa funzione: 24/10, dal Chrome di Andrea [V portale].
  const PORTAL = { every: 3, seed: '2026-10-24' };
  const PREREQ_SOON = '2026-10-27'; // consigliato entro martedì 27/10 [S, Piano di studio]
  const TAPER = '2026-11-08';   // scarico da domenica 08/11 [S, Piano di studio]
  const REST = '2026-11-09';    // riposo da lunedì 09/11 fino alla prova (piano a due giorni del 07/11)
  // Tappe al giorno: 3 nei feriali (circa 35′, il budget deciso l'08/10), 6 nel fine settimana (sessioni lunghe);
  // nell'ultima settimana una sessione da 30′ al giorno (decisione del 03/11).
  const PER_DAY = 3;
  const PER_DAY_WEEKEND = 6;
  const isWeekend = (now) => now.getDay() === 0 || now.getDay() === 6;
  const targetFor = (now) => (todayKey(now) >= SPRINT_FROM ? 1 : isWeekend(now) ? PER_DAY_WEEKEND : PER_DAY);

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

  // Simulazione del percorso lungo (fino al 02/11): dal 03/11 vale l'ultima settimana (sotto).
  const SIMS = [
    { id: 's1', kind: 'sim', lesson: 'strategia', from: '2026-10-31', until: '2026-11-02', title: 'Simulazione completa n. 1', sub: 'sul PC: verbale 35′ → numerico 20′ → astratto 10′', min: 65 },
  ];

  // ── Ultima settimana (dal 03/11, decisione di Andrea del 03/11): una sessione da 30′ a sera, nel formato della prova ──
  // Ogni sessione è un blocco nel clone di TAO con il ritmo esatto della prova (verbale 1′45″ a domanda, numerico 2′,
  // astratto 1′), domande di livello prova a 4 opzioni, correzione solo alla fine; prima, una scheda di 2′ sulla
  // trappola del giorno. Le sessioni sono una coda: ogni sera l'app propone la prima non fatta, una al giorno
  // (un'altra resta a un tocco); una sera saltata non si accumula. Il verbale è 4 sessioni su 6: è l'unico punteggio
  // in graduatoria [V bando]; numerico e astratto, già sopra la soglia nella misura del 24/10, si tengono caldi.
  const SPRINT_FROM = '2026-11-03';
  const V10 = { verbale: { n: 10, minutes: 17.5 } };
  const NA = { numerico: { n: 5, minutes: 10 }, astratto: { n: 10, minutes: 10 } };
  const SPRINT = [
    { id: 'sp1', kind: 'block', lesson: 'v-metodo', counts: V10, title: 'Verbale · 10 domande in 17′30″', sub: 'metà prova al ritmo vero, poi la correzione', min: 28 },
    { id: 'sp2', kind: 'block', lesson: 'n-metodo', counts: NA, title: 'Numerico 5 in 10′ + astratto 10 in 10′', sub: 'due prove di fila, ognuna col suo timer, poi la correzione', min: 30 },
    { id: 'sp3', kind: 'block', lesson: 'v-tempo', counts: V10, title: 'Verbale · 10 domande in 17′30″', sub: 'metà prova al ritmo vero, poi la correzione', min: 28 },
    { id: 'sp4', kind: 'block', lesson: 'v-quant', counts: V10, title: 'Verbale · 10 domande in 17′30″', sub: 'metà prova al ritmo vero, poi la correzione', min: 28 },
    { id: 'sp5', kind: 'block', lesson: 'a-comb', counts: NA, title: 'Numerico 5 in 10′ + astratto 10 in 10′', sub: 'due prove di fila, ognuna col suo timer, poi la correzione', min: 30 },
    { id: 'sp6', kind: 'block', lesson: 'v-infer', counts: V10, title: 'Verbale · 10 domande in 17′30″', sub: 'metà prova al ritmo vero, poi la correzione', min: 28 },
  ];
  // Simulazione completa, consigliata nel fine settimana (65′, sul PC, alle 14:00 come la prova): nel sabato e nella
  // domenica è la sessione principale; «Non oggi» porta alla sessione da 30′.
  const SPRINT_SIM = { id: 'sp-sim', kind: 'sim', exact: true, lesson: 'strategia', from: '2026-11-07', until: '2026-11-08', title: 'Simulazione completa', sub: 'sul PC, alle 14:00 se puoi: verbale 35′ → numerico 20′ → astratto 10′, come la prova', min: 65 };
  // Domenica 08/11 chiude (dal 07/11; prima era lunedì): la scheda «Prima della prova» (checklist del PC) con 3 domande leggere.
  const SPRINT_FINAL = { id: 't2', kind: 'lesson', from: '2026-11-08', lesson: 'fine', title: 'Prima della prova', sub: 'scheda + 3 domande leggere; poi prepara il PC con la checklist', min: 6, pick: { mix: true } };
  const isSprintId = (id) => id.startsWith('sp') || id === SPRINT_FINAL.id;

  const blank = () => ({ done: {}, p2: { i: 0 } });
  function state() {
    const s = App.store.path();
    return { ...blank(), ...s, done: { ...(s.done || {}) }, p2: { i: 0, ...(s.p2 || {}) } };
  }

  // Peso di una tappa nel conteggio del giorno: nel percorso lungo una simulazione o la misura valgono 3 tappe;
  // nell'ultima settimana ogni sessione (anche la simulazione) vale 1, perché l'obiettivo del giorno è 1.
  const weightOf = (id) => (isSprintId(id) ? 1 : /^s\d$/.test(id) || id === 'bm' ? PER_DAY : 1);

  // Quante tappe fatte in totale e oggi.
  function counts(now = new Date()) {
    const st = state();
    const k = todayKey(now);
    let total = 0, today = 0;
    for (const [id, d] of Object.entries(st.done)) {
      if (d && d.via) continue; // scheda letta dentro un'altra tappa: non è una tappa in più
      total++;
      if (d && d.t && todayKey(new Date(d.t)) === k) today += weightOf(id);
    }
    const target = targetFor(now);
    return { total, today: Math.min(today, target * 3), target };
  }

  // Tappe fatte per giorno (calendario della home); le schede lette dentro un drill non contano.
  function dayCounts() {
    const m = {};
    for (const [id, d] of Object.entries(state().done)) {
      if (!d || d.via || !d.t) continue;
      const k = todayKey(new Date(d.t));
      m[k] = (m[k] || 0) + weightOf(id);
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

  // ── Ultima settimana: la sessione di stasera ──
  // Coda delle sessioni: la prima non fatta. Una al giorno: fatta quella, «Per stasera basta» (un'altra resta a un
  // tocco). Sabato e domenica la simulazione completa viene prima, con la sessione da 30′ come «Non oggi».
  // Domenica 08/11, dopo la sessione (o se le sessioni sono finite), chiude «Prima della prova». Da lunedì riposo (next).
  function sprintNext(st, now) {
    const k = todayKey(now);
    const doneOn = (id) => Boolean(st.done[id] && st.done[id].t && todayKey(new Date(st.done[id].t)) === k);
    const left = SPRINT.filter((s) => !st.done[s.id]);
    const queued = left[0] ? { ...left[0], phase: 'Ultima settimana', index: SPRINT.length - left.length + 1, of: SPRINT.length } : null;
    const sim = !st.done[SPRINT_SIM.id] && k >= SPRINT_SIM.from && k <= SPRINT_SIM.until ? { ...SPRINT_SIM, phase: 'Simulazione' } : null;
    const final = !st.done[SPRINT_FINAL.id] && k >= SPRINT_FINAL.from ? { ...SPRINT_FINAL, phase: 'Ultima settimana' } : null;
    const todayDone = Object.keys(st.done).some((id) => isSprintId(id) && doneOn(id));
    if (!todayDone) {
      if (sim) return { ...sim, alt: queued };
      if (queued) return { ...queued, alt: sim };
    }
    if (final && (todayDone || !queued)) return final;
    if (!todayDone) return { kind: 'sprint-empty' };
    // Sessione di oggi fatta: basta così; chi vuole ne ha un'altra a un tocco.
    return { kind: 'sprint-done', more: queued || (sim && !doneOn(SPRINT_SIM.id) ? sim : null) };
  }

  // La prossima cosa da fare, in base alla data e a ciò che è già fatto.
  function next(now = new Date()) {
    const k = todayKey(now);
    const st = state();
    if (k > EXAM.day || (k === EXAM.day && now >= EXAM.at)) return { kind: 'after' };
    if (k === EXAM.day) return { kind: 'examday' };
    if (k >= REST) return { kind: 'rest' };
    if (k >= SPRINT_FROM) return sprintNext(st, now);
    // Simulazioni per data, anche con le Basi a metà: nel fine settimana (o l'ultimo giorno utile) sono la tappa
    // principale; negli altri giorni restano a portata di mano come alternativa.
    const sim = SIMS.find((s) => k >= s.from && k <= s.until && !st.done[s.id]) || null;
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
    if (todayKey(now) >= SPRINT_FROM) {
      const q = SPRINT.find((s) => !st.done[s.id]);
      return q ? { ...q, phase: 'Ultima settimana' } : { ...SPRINT_FINAL, phase: 'Ultima settimana' };
    }
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
      const go = () => (step.mode === 'baseline' ? App.sim.startBaseline({ step: meta }) : App.sim.startFull({ step: meta, exact: Boolean(step.exact) }));
      if (step.lesson) App.lessons.show(step.lesson, { kicker: step.title, goText: 'Inizia la simulazione', onGo: go, onBack: () => App.main.home() });
      else go();
      return;
    }
    if (step.kind === 'block') {
      // Sessioni dell'ultima settimana: più prove di fila (counts), difficoltà esatta della prova, una scheda prima.
      const go = () => (step.counts ? App.sim.startBlock({ step: meta, counts: step.counts, exact: true }) : App.sim.startBlock({ step: meta, bank: step.bank, n: step.n, minutes: step.minutes }));
      if (step.lesson) App.lessons.show(step.lesson, { kicker: step.title, goText: 'Inizia la sessione', onGo: go, onBack: () => App.main.home() });
      else go();
      return;
    }
    if (step.kind === 'official') { App.main.showOfficial(step); return; }
    const items = App.select.forStep(step);
    if (!items.length) { App.ui.toast('Nessuna domanda disponibile per questa tappa.'); return; }
    App.session.start('tappa', items, { step: { id: step.id, p2i: step.p2i, title: step.title, kind: step.kind, ...(step.alsoDone ? { alsoDone: step.alsoDone } : {}) }, lessonId: step.lesson || null, bankLabel: step.title });
  }

  const daysToExam = (now = new Date()) => daysUntil(EXAM.day, now);
  const prereqOpen = (now = new Date()) => !App.store.settings().prereqDone && now < PREREQ.at;

  // Cose da fare fuori dall'app, con la scadenza: l'app è l'unico punto di contatto con la prova (decisione del 24/10).
  // urgent = da mostrare anche in «Oggi»; le altre stanno solo nell'Agenda.
  function todos(now = new Date()) {
    const s = App.store.settings();
    const k = todayKey(now);
    const out = [];
    if (!s.prereqDone && now < PREREQ.at) {
      out.push({ id: 'prereq', due: PREREQ.day, urgent: k >= PREREQ_SOON || daysUntil(PREREQ.day, now) <= 7 });
    }
    if (!s.leaveDone && now < EXAM.at) out.push({ id: 'leave', due: EXAM.day, urgent: daysUntil(EXAM.day, now) <= 10 });
    const last = /^\d{4}-\d{2}-\d{2}$/.test(s.portalChecked || '') ? s.portalChecked : PORTAL.seed;
    const lastDate = new Date(`${last}T12:00:00`);
    const next = new Date(lastDate); next.setDate(next.getDate() + PORTAL.every);
    out.push({ id: 'portal', last, due: todayKey(next), urgent: k >= todayKey(next) });
    if (!s.complaintsDone && now >= EXAM.at && now <= COMPLAINTS.at) out.push({ id: 'complaints', due: COMPLAINTS.day, urgent: true });
    return out.sort((a, b) => (b.urgent - a.urgent) || a.due.localeCompare(b.due));
  }

  return { EXAM, PREREQ, COMPLAINTS, PORTAL, todos, TAPER, REST, PER_DAY, PER_DAY_WEEKEND, SPRINT_FROM, SPRINT, SPRINT_SIM, SPRINT_FINAL, BASI, CYCLE, DRILL, BLOCKS, SIMS, next, shortStep, complete, isDone, start, counts, dayCounts, targetFor, daysToExam, prereqOpen, phaseOf, state, cycleFor, accuracy, strong, isWeekend };
})();
