// Il piano di studio codificato: settimana tipo, obiettivi, ritmo — namespace App.plan
// Fonte: Piano di studio v1 (08/10/2026) e decisioni del 09/10/2026.
window.App = window.App || {};
App.plan = (() => {
  'use strict';
  const { todayKey, mondayOf } = App.utils;

  // Ritmo per item dalla prova reale [bando §4.3.2]: 35'/20 = 105", 20'/10 = 120", 10'/10 = 60".
  const PACE = { verbale: 105, numerico: 120, astratto: 60 };
  // Obiettivi [S, da tarare sulla baseline]: verbale ≥ 16/20; numerico + astratto ≥ 12/20.
  const TARGET = { verbale: { score: 16, max: 20, min: 10 }, numerico: { score: 6, max: 10 }, astratto: { score: 6, max: 10 } };

  // Settimana tipo (0 = domenica … 6 = sabato).
  const WEEK = {
    1: { kind: 'train', bank: 'verbale', n: 10, title: 'Verbale', sub: '10 domande · ~17′ + correzione' },
    2: { kind: 'external', bank: 'astratto', title: 'Astratto sul PDF Maggioli', sub: '2 blocchi da 10 figure in 10′ · poi registra il punteggio qui' },
    3: { kind: 'train', bank: 'verbale', n: 10, title: 'Verbale', sub: '10 domande · ~17′ + correzione' },
    4: { kind: 'train', bank: 'numerico', n: 5, title: 'Numerico', sub: '5 domande · ~10′ + correzione · calcolatrice a schermo, niente carta' },
    5: { kind: 'flex', title: 'Flex', sub: 'La prova con più errori nella settimana' },
    6: { kind: 'sim', title: 'Simulazione', sub: 'Sul PC, 65′ di fila, poi correzione' },
    0: { kind: 'sim', title: 'Simulazione', sub: 'Sul PC, 65′ di fila, poi correzione' },
  };

  // Errori per banca negli ultimi 7 giorni (per il venerdì "flex").
  function weakestBank() {
    const since = new Date(); since.setDate(since.getDate() - 7);
    const counts = { verbale: { n: 0, w: 0 }, numerico: { n: 0, w: 0 }, astratto: { n: 0, w: 0 } };
    for (const e of App.store.log()) {
      if (new Date(e.t) < since) continue;
      if (e.mode === 'external') {
        if (counts[e.bank] && e.max) { counts[e.bank].n += e.max; counts[e.bank].w += e.max - e.score; }
        continue;
      }
      if (!counts[e.bank]) continue;
      counts[e.bank].n++;
      if (!e.ok) counts[e.bank].w++;
    }
    let best = 'verbale', bestRate = -1;
    for (const [b, c] of Object.entries(counts)) {
      if (c.n < 3) continue;
      const rate = c.w / c.n;
      if (rate > bestRate) { bestRate = rate; best = b; }
    }
    return { bank: best, rate: bestRate, counts };
  }

  // Che cosa propone la home oggi.
  function today() {
    const d = new Date();
    const base = WEEK[d.getDay()];
    let plan = { ...base };
    if (base.kind === 'flex') {
      const w = weakestBank();
      if (w.bank === 'astratto') plan = { ...WEEK[2], title: 'Flex: astratto', sub: 'È la prova con più errori: 2 blocchi da 10 sul PDF, poi registra' };
      else if (w.bank === 'numerico') plan = { ...WEEK[4], title: 'Flex: numerico', sub: `${WEEK[4].sub} · è la prova con più errori questa settimana` };
      else plan = { ...WEEK[1], title: 'Flex: verbale', sub: `${WEEK[1].sub} · ${w.rate < 0 ? 'pochi dati: si parte dal verbale, che pesa di più' : 'è la prova con più errori questa settimana'}` };
    }
    const key = todayKey(d);
    const done = App.store.sessions().some((s) => !s.partial && todayKey(new Date(s.t)) === key && (s.mode === 'train' || s.mode === 'sim' || (s.mode === 'external' && (plan.kind === 'external' || plan.kind === 'sim'))));
    return { ...plan, done, dayKey: key };
  }

  // Giorni attivi nella settimana corrente (lunedì → oggi): sessioni di qualsiasi tipo, anche Micro.
  function weekActivity() {
    const monday = mondayOf();
    const days = new Set();
    for (const s of App.store.sessions()) {
      const d = new Date(s.t);
      if (d >= monday) days.add(todayKey(d));
    }
    const dow = (new Date().getDay() + 6) % 7; // 0 lunedì
    return { active: days.size, elapsed: dow + 1, target: 5 };
  }

  return { PACE, TARGET, WEEK, today, weekActivity, weakestBank };
})();
