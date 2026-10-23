// Generatore del numerico di livello prova — namespace App.gen.numerico
// Formato verificato sul test di esempio EPSO in italiano (08/10/2026): una tabella (5 Paesi × 6 colonne),
// domande a più passaggi, 5 opzioni con E = «Nessuna di queste risposte».
// make(seed, livello) è una funzione pura: lo stesso id (N<livello>-<seme>) ridà sempre lo stesso item.
// I calcoli usano i valori come appaiono in tabella (arrotondati), cioè quelli che vede il candidato.
// Ogni distrattore viene da un errore tipico con nome (base sbagliata, riga sbagliata, unità…), salvo i
// «quasi giusti» (errore di calcolo o di arrotondamento) usati per bilanciare la posizione della risposta.
window.App = window.App || {};
App.gen = App.gen || {};
App.gen.numerico = (() => {
  'use strict';

  // ── Casualità riproducibile ──
  function mulberry32(a) {
    return function rnd() {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const R = (rng) => ({
    f: (a, b) => a + (b - a) * rng(),
    i: (a, b) => a + Math.floor(rng() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(rng() * arr.length)],
    shuffle: (arr) => { const x = arr.slice(); for (let k = x.length - 1; k > 0; k--) { const j = Math.floor(rng() * (k + 1)); [x[k], x[j]] = [x[j], x[k]]; } return x; },
    chance: (p) => rng() < p,
  });

  // ── Numeri all'italiana: punto per le migliaia, virgola per i decimali, segno meno tipografico ──
  const roundTo = (x, dec) => { const f = 10 ** dec; return Math.round(x * f) / f; };
  function num(x, dec = 0) {
    const v = roundTo(x, dec);
    const neg = v < 0 || Object.is(v, -0);
    const [int, frac] = Math.abs(v).toFixed(dec).split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${neg && v !== 0 ? '−' : ''}${grouped}${frac ? ',' + frac : ''}`;
  }
  const pct = (x, dec = 1) => `${num(x, dec)}%`;

  // Popolazioni approssimate (milioni): solo per dare grandezze plausibili; i dati delle tabelle sono di esercitazione.
  const POP = { Austria: 9.1, Belgio: 11.8, Bulgaria: 6.4, Cipro: 0.93, Croazia: 3.9, Danimarca: 5.9, Estonia: 1.37, Finlandia: 5.6, Francia: 68.4, Germania: 83.4, Grecia: 10.4, Irlanda: 5.3, Lettonia: 1.88, Lituania: 2.86, Lussemburgo: 0.67, Malta: 0.56, 'Paesi Bassi': 17.9, Polonia: 36.6, Portogallo: 10.6, 'Repubblica ceca': 10.9, Romania: 19.0, Slovacchia: 5.4, Slovenia: 2.12, Spagna: 48.6, Svezia: 10.6, Ungheria: 9.6 };
  const COUNTRIES = Object.keys(POP);
  // Paesi UE fuori dall'euro, con un cambio plausibile (unità di moneta nazionale per 1 €).
  const FX = { Polonia: 4.3, 'Repubblica ceca': 25.1, Ungheria: 392, Romania: 4.97, Svezia: 11.3, Danimarca: 7.46 };
  const NOTE = 'Dati di esercitazione, non statistiche ufficiali.';

  // Preposizioni con i nomi dei Paesi («nei Paesi Bassi», «a Malta», «dell'Austria»).
  const IN = { Cipro: 'a Cipro', Malta: 'a Malta', 'Paesi Bassi': 'nei Paesi Bassi', 'Repubblica ceca': 'nella Repubblica ceca' };
  const inC = (n) => IN[n] || `in ${n}`;
  const DI = { Austria: "dell'Austria", Belgio: 'del Belgio', Cipro: 'di Cipro', Estonia: "dell'Estonia", Irlanda: "dell'Irlanda", Lussemburgo: 'del Lussemburgo', Malta: 'di Malta', 'Paesi Bassi': 'dei Paesi Bassi', Portogallo: 'del Portogallo', Ungheria: "dell'Ungheria" };
  const diC = (n) => DI[n] || `della ${n}`;
  // Concordanze per genere e numero del soggetto della domanda.
  const V = {
    fs: { varied: 'è variata', beat: 'ha superato quella', repr: 'rappresenta', vary: 'variasse', reach: 'raggiungerebbe', should: 'dovrebbe' },
    fp: { varied: 'sono variate', beat: 'hanno superato quelle', repr: 'rappresentano', vary: 'variassero', reach: 'raggiungerebbero', should: 'dovrebbero' },
    mp: { varied: 'sono variati', beat: 'hanno superato quelli', repr: 'rappresentano', vary: 'variassero', reach: 'raggiungerebbero', should: 'dovrebbero' },
  };
  function countries(r, n, pool = COUNTRIES) { return r.shuffle(pool).slice(0, n).sort((a, b) => a.localeCompare(b, 'it')); }
  // Una serie di anni per una grandezza: valore iniziale e crescite annue.
  function series(r, base, g, years, dec) {
    const out = [base];
    for (let k = 1; k < years; k++) out.push(out[k - 1] * (1 + r.f(g[0], g[1])));
    return out.map((v) => roundTo(v, dec));
  }
  const cell = (v, dec) => num(v, dec);

  // Temi per le tabelle «una grandezza su tre anni + una seconda grandezza» (modelli di livello 1 e alcuni di livello 3).
  const THEMES = [
    { title: 'Commercio di servizi digitali', a: 'Esportazioni', b: 'Importazioni', what: 'le esportazioni di servizi digitali', of: 'delle esportazioni di servizi digitali', g: 'fp', unit: 'milioni di €', short: 'milioni di €', pc: [60, 900], bR: [0.5, 1.4], dec: 0 },
    { title: 'Spesa per la cultura', a: 'Spesa delle famiglie', b: 'Spesa pubblica', what: 'la spesa delle famiglie per la cultura', of: 'della spesa delle famiglie per la cultura', g: 'fs', unit: 'milioni di €', short: 'milioni di €', pc: [50, 380], bR: [0.3, 1.1], dec: 0 },
    { title: 'Turismo internazionale', a: 'Arrivi', b: 'Pernottamenti', what: 'gli arrivi di turisti stranieri', of: 'degli arrivi di turisti stranieri', g: 'mp', unit: 'migliaia', short: 'migliaia', pc: [300, 3800], bR: [2.4, 4.6], dec: 0 },
    { title: 'Energia elettrica', a: 'Produzione da rinnovabili', b: 'Consumi totali', what: 'la produzione di elettricità da fonti rinnovabili', of: 'della produzione di elettricità da fonti rinnovabili', g: 'fs', unit: 'TWh', short: 'TWh', pc: [1.5, 11], bR: [1.3, 3.8], dec: 1 },
    { title: 'Istruzione superiore', a: 'Iscritti', b: 'Laureati', what: 'gli iscritti all\'università', of: 'degli iscritti all\'università', g: 'mp', unit: 'migliaia', short: 'migliaia', pc: [24, 62], bR: [0.14, 0.3], dec: 1 },
    { title: 'Brevetti europei', a: 'Domande depositate', b: 'Brevetti concessi', what: 'le domande di brevetto depositate', of: 'delle domande di brevetto depositate', g: 'fp', unit: 'numero', short: '', pc: [25, 420], bR: [0.3, 0.7], dec: 0 },
  ];
  // Tabella standard: 5 Paesi × (A 2022, A 2023, A 2024, B 2022, B 2023, B 2024).
  function themeTable(r, th, gA = [-0.07, 0.18], gB = [-0.06, 0.12]) {
    const names = countries(r, 5);
    const A = names.map((n) => series(r, POP[n] * r.f(th.pc[0], th.pc[1]), gA, 3, th.dec));
    const B = names.map((n, k) => series(r, A[k][0] * r.f(th.bR[0], th.bR[1]), gB, 3, th.dec));
    const u = th.unit === 'numero' ? '' : ` (${th.short})`;
    return {
      names, A, B,
      table: {
        title: `${th.title}${th.unit === 'numero' ? '' : `, in ${th.unit}`}`,
        note: NOTE,
        groups: [{ label: th.a, span: 3 }, { label: th.b, span: 3 }],
        head: ['Paese', '2022', '2023', '2024', '2022', '2023', '2024'],
        rows: names.map((n, i) => [n, ...A[i].map((v) => cell(v, th.dec)), ...B[i].map((v) => cell(v, th.dec))]),
      },
      unitSuffix: u,
    };
  }
  const YEARS = [2022, 2023, 2024];
  const unitText = (th) => (th.unit === 'numero' ? '' : ` ${th.unit}`);

  // ── Modelli di domanda ──
  // Ognuno ritorna { tag, table, question, truth, dec, fmt, cands: [{ v, trap, why }], steps, positive, wide, meta }.
  const T = {};

  // L1 · variazione percentuale tra due anni
  T.T1 = (r) => {
    const th = r.pick(THEMES);
    const t = themeTable(r, th);
    const i = r.i(0, 4);
    const [ya, yb] = r.pick([[0, 1], [1, 2], [0, 2]]);
    const va = t.A[i][ya], vb = t.A[i][yb];
    const truth = ((vb - va) / va) * 100;
    const j = (i + r.i(1, 4)) % 5;
    const other = [[0, 1], [1, 2], [0, 2]].filter((p) => p[0] !== ya || p[1] !== yb)[r.i(0, 1)];
    return {
      tag: 'percentuali', table: t.table, dec: 1, fmt: (v) => pct(v), wide: true,
      question: `Di quanto ${V[th.g].varied}, in percentuale, ${th.what} ${inC(t.names[i])} tra il ${YEARS[ya]} e il ${YEARS[yb]}? (arrotondamento a una cifra decimale)`,
      truth,
      steps: [`(${num(vb, th.dec)} − ${num(va, th.dec)}) ÷ ${num(va, th.dec)} × 100 = ${pct(truth)}`],
      cands: [
        { v: ((vb - va) / vb) * 100, trap: 'percentuali', why: `divide per il valore del ${YEARS[yb]} invece che per quello di partenza (base sbagliata)` },
        { v: (vb / va) * 100, trap: 'percentuali', why: 'è il rapporto tra i due valori, non la variazione: manca il «− 100»' },
        { v: ((t.A[j][yb] - t.A[j][ya]) / t.A[j][ya]) * 100, trap: 'lettura-dati', why: `è la variazione registrata ${inC(t.names[j])} (riga sbagliata)` },
        { v: ((t.A[i][other[1]] - t.A[i][other[0]]) / t.A[i][other[0]]) * 100, trap: 'lettura-dati', why: `è la variazione tra il ${YEARS[other[0]]} e il ${YEARS[other[1]]} (anni sbagliati)` },
        { v: ((t.B[i][yb] - t.B[i][ya]) / t.B[i][ya]) * 100, trap: 'lettura-dati', why: `è la variazione della colonna «${th.b}» (colonna sbagliata)` },
      ],
      meta: { template: 'T1', rows: [i, j], cols: [ya, yb], params: { other }, raw: { A: t.A, B: t.B } },
    };
  };

  // L1 · differenza assoluta tra due Paesi nello stesso anno
  T.T2 = (r) => {
    const th = r.pick(THEMES);
    const t = themeTable(r, th);
    const y = r.i(0, 2);
    const order = [0, 1, 2, 3, 4].sort((a, b) => t.A[b][y] - t.A[a][y]);
    const x = order[r.i(0, 2)], z = order[r.i(3, 4)];
    const truth = t.A[x][y] - t.A[z][y];
    const y2 = (y + r.i(1, 2)) % 3;
    const w = order.find((k) => k !== x && k !== z);
    const u = unitText(th);
    return {
      tag: 'lettura-dati', table: t.table, dec: th.dec, fmt: (v) => `${num(v, th.dec)}${u}`, positive: true,
      question: `Nel ${YEARS[y]}, di quanto ${th.what} ${inC(t.names[x])} ${V[th.g].beat} ${inC(t.names[z])}?${th.unit === 'numero' ? ' (in numero di domande)' : ` (in ${th.unit})`}`,
      truth,
      steps: [`${num(t.A[x][y], th.dec)} − ${num(t.A[z][y], th.dec)} = ${num(truth, th.dec)}${u}`],
      cands: [
        { v: t.A[x][y2] - t.A[z][y2], trap: 'lettura-dati', why: `è la differenza del ${YEARS[y2]} (anno sbagliato)` },
        { v: t.A[x][y] - t.A[w][y], trap: 'lettura-dati', why: `confronta con la riga «${t.names[w]}» (riga sbagliata)` },
        { v: t.B[x][y] - t.B[z][y], trap: 'lettura-dati', why: `usa la colonna «${th.b}» (colonna sbagliata)` },
        { v: t.A[x][y] - t.A[z][y2], trap: 'lettura-dati', why: 'mescola due anni diversi' },
      ],
      meta: { template: 'T2', rows: [x, z, w], cols: [y, y2], params: {}, raw: { A: t.A, B: t.B } },
    };
  };

  // L1 · quota sul totale dei cinque Paesi
  T.T3 = (r) => {
    const th = r.pick(THEMES);
    const t = themeTable(r, th);
    const y = r.i(0, 2), i = r.i(0, 4);
    const tot = (yy) => t.A.reduce((s, row) => s + row[yy], 0);
    const v = t.A[i][y];
    const truth = (v / tot(y)) * 100;
    const y2 = (y + 1) % 3;
    const max = Math.max(...t.A.map((row) => row[y]));
    return {
      tag: 'rapporti', table: t.table, dec: 1, fmt: (x) => pct(x), positive: true,
      question: `Nel ${YEARS[y]}, quale quota del totale dei cinque Paesi ${V[th.g].repr} ${th.what} ${inC(t.names[i])}? (in percentuale, arrotondamento a una cifra decimale)`,
      truth,
      steps: [`totale ${YEARS[y]} = ${num(tot(y), th.dec)}`, `${num(v, th.dec)} ÷ ${num(tot(y), th.dec)} × 100 = ${pct(truth)}`],
      cands: [
        { v: (v / (tot(y) - v)) * 100, trap: 'rapporti', why: 'divide per il totale degli altri quattro Paesi, escludendo il Paese della domanda' },
        { v: (v / tot(y2)) * 100, trap: 'lettura-dati', why: `usa il totale del ${YEARS[y2]} (anno sbagliato)` },
        { v: (t.A[i][y2] / tot(y2)) * 100, trap: 'lettura-dati', why: `è la quota del ${YEARS[y2]}` },
        { v: max !== v ? (v / max) * 100 : (v / tot(y)) * 120, trap: 'rapporti', why: 'confronta con il Paese più grande invece che con il totale' },
      ],
      meta: { template: 'T3', rows: [i], cols: [y, y2], params: {}, raw: { A: t.A, B: t.B } },
    };
  };

  // L2 · valore pro capite (unità da allineare)
  T.T4 = (r) => {
    const names = countries(r, 5);
    const big = r.chance(0.5); // spesa in miliardi o in milioni
    const topic = r.pick([
      { title: 'Spesa pubblica per la ricerca', what: 'la spesa pubblica per la ricerca', pc: [70, 420], a: 'Spesa pubblica', b: 'Spesa delle imprese' },
      { title: 'Spesa per la protezione dell\'ambiente', what: 'la spesa pubblica per la protezione dell\'ambiente', pc: [90, 520], a: 'Spesa pubblica', b: 'Spesa delle imprese' },
      { title: 'Spesa per le politiche del lavoro', what: 'la spesa per le politiche attive del lavoro', pc: [60, 380], a: 'Politiche attive', b: 'Sussidi di disoccupazione' },
    ]);
    const unit = big ? 'miliardi di €' : 'milioni di €';
    const pop = names.map((n) => [roundTo(POP[n] * r.f(0.985, 1.0), 2), 0].map((v, k) => (k === 0 ? v : 0)));
    for (const p of pop) p[1] = roundTo(p[0] * r.f(0.997, 1.012), 2);
    const val = names.map((_, k) => [0, 1].map((y) => { const tot = pop[k][y] * r.f(topic.pc[0], topic.pc[1]) * 1e6; return big ? roundTo(tot / 1e9, 2) : roundTo(tot / 1e6, 0); }));
    const other = names.map((_, k) => [0, 1].map(() => (big ? roundTo(val[k][0] * r.f(0.5, 1.6), 2) : roundTo(val[k][0] * r.f(0.5, 1.6), 0))));
    const dv = big ? 2 : 0;
    const i = r.i(0, 4), y = r.i(0, 1);
    const factor = big ? 1000 : 1; // miliardi → milioni
    const truth = (val[i][y] * factor) / pop[i][y];
    const j = (i + r.i(1, 4)) % 5;
    return {
      tag: 'unita-misura', dec: 0, fmt: (v) => `${num(v, 0)} €`, positive: true,
      table: {
        title: `${topic.title} e popolazione`, note: `Spesa in ${unit}; popolazione in milioni di abitanti. ${NOTE}`,
        groups: [{ label: 'Popolazione', span: 2 }, { label: topic.a, span: 2 }, { label: topic.b, span: 2 }],
        head: ['Paese', '2023', '2024', '2023', '2024', '2023', '2024'],
        rows: names.map((n, k) => [n, cell(pop[k][0], 2), cell(pop[k][1], 2), cell(val[k][0], dv), cell(val[k][1], dv), cell(other[k][0], dv), cell(other[k][1], dv)]),
      },
      question: `Qual è stata nel ${2023 + y} ${topic.what} per abitante ${inC(names[i])}? (in euro, arrotondamento all'unità)`,
      truth,
      steps: [`${num(val[i][y], dv)} ${unit} = ${num(val[i][y] * factor, 0)} milioni di €`, `${num(val[i][y] * factor, 0)} milioni ÷ ${num(pop[i][y], 2)} milioni di abitanti = ${num(truth, 0)} € per abitante`],
      cands: [
        { v: big ? truth / 1000 : truth * 1000, trap: 'unita-misura', why: big ? 'dimentica che la spesa è in miliardi (manca il × 1.000)' : 'confonde milioni e migliaia (× 1.000 di troppo)' },
        { v: (val[i][y] * factor) / pop[i][1 - y], trap: 'lettura-dati', why: `usa la popolazione del ${2023 + (1 - y)} (anno sbagliato)` },
        { v: (other[i][y] * factor) / pop[i][y], trap: 'lettura-dati', why: `usa la colonna «${topic.b}» (colonna sbagliata)` },
        { v: (val[j][y] * factor) / pop[j][y], trap: 'lettura-dati', why: `è il valore della riga «${names[j]}» (riga sbagliata)` },
      ],
      meta: { template: 'T4', rows: [i, j], cols: [y], params: { big }, raw: { pop, val, other } },
    };
  };

  // L2 · punti percentuali o variazione percentuale di un tasso
  T.T5 = (r) => {
    const names = countries(r, 5);
    const occ = names.map(() => { const a = r.f(58, 79); return [roundTo(a, 1), roundTo(a + r.f(-1.8, 2.2), 1)]; });
    const dis = names.map(() => { const a = r.f(3.2, 13.5); return [roundTo(a, 1), roundTo(Math.max(2.1, a + r.f(-2.4, 2.4)), 1)]; });
    const fl = names.map((n) => { const a = POP[n] * 1000 * r.f(0.45, 0.53); return [roundTo(a, 0), roundTo(a * r.f(0.99, 1.02), 0)]; });
    const i = r.i(0, 4);
    if (Math.abs(dis[i][1] - dis[i][0]) < 0.4) dis[i][1] = roundTo(dis[i][0] + (r.chance(0.5) ? 1 : -1) * r.f(0.5, 1.9), 1);
    const j = (i + r.i(1, 4)) % 5;
    const points = r.chance(0.5);
    const d = dis[i][1] - dis[i][0];
    const rel = (d / dis[i][0]) * 100;
    const table = {
      title: 'Mercato del lavoro', note: `Tassi in %; forza lavoro in migliaia. ${NOTE}`,
      groups: [{ label: 'Tasso di occupazione', span: 2 }, { label: 'Tasso di disoccupazione', span: 2 }, { label: 'Forza lavoro', span: 2 }],
      head: ['Paese', '2023', '2024', '2023', '2024', '2023', '2024'],
      rows: names.map((n, k) => [n, cell(occ[k][0], 1), cell(occ[k][1], 1), cell(dis[k][0], 1), cell(dis[k][1], 1), cell(fl[k][0], 0), cell(fl[k][1], 0)]),
    };
    const meta = { template: 'T5', rows: [i, j], cols: [], params: { points }, raw: { occ, dis, fl } };
    if (points) {
      return {
        tag: 'percentuali', table, dec: 1, fmt: (v) => `${num(v, 1)} punti percentuali`, wide: true,
        question: `Di quanti punti percentuali è variato il tasso di disoccupazione ${inC(names[i])} tra il 2023 e il 2024? (arrotondamento a una cifra decimale)`,
        truth: d,
        steps: [`${num(dis[i][1], 1)} − ${num(dis[i][0], 1)} = ${num(d, 1)} punti percentuali`],
        cands: [
          { v: rel, trap: 'percentuali', why: 'è la variazione percentuale del tasso, non la differenza in punti' },
          { v: dis[j][1] - dis[j][0], trap: 'lettura-dati', why: `è la variazione registrata ${inC(names[j])} (riga sbagliata)` },
          { v: occ[i][1] - occ[i][0], trap: 'lettura-dati', why: 'è la variazione del tasso di occupazione (colonna sbagliata)' },
          { v: -d, trap: 'lettura-dati', why: 'inverte il verso della variazione' },
        ],
        meta,
      };
    }
    return {
      tag: 'percentuali', table, dec: 1, fmt: (v) => pct(v), wide: true,
      question: `Di quanto è variato, in percentuale, il tasso di disoccupazione ${inC(names[i])} tra il 2023 e il 2024? (arrotondamento a una cifra decimale)`,
      truth: rel,
      steps: [`(${num(dis[i][1], 1)} − ${num(dis[i][0], 1)}) ÷ ${num(dis[i][0], 1)} × 100 = ${pct(rel)}`],
      cands: [
        { v: d, trap: 'percentuali', why: 'è la differenza in punti percentuali, non la variazione percentuale' },
        { v: (d / dis[i][1]) * 100, trap: 'percentuali', why: 'divide per il tasso del 2024 (base sbagliata)' },
        { v: ((dis[j][1] - dis[j][0]) / dis[j][0]) * 100, trap: 'lettura-dati', why: `è la variazione registrata ${inC(names[j])} (riga sbagliata)` },
        { v: ((occ[i][1] - occ[i][0]) / occ[i][0]) * 100, trap: 'lettura-dati', why: 'usa il tasso di occupazione (colonna sbagliata)' },
      ],
      meta,
    };
  };

  // L2 · proiezione allo stesso tasso di crescita
  T.T6 = (r) => {
    const th = r.pick(THEMES.filter((x) => x.dec === 0));
    const up = r.chance(0.7);
    const t = themeTable(r, th, up ? [0.06, 0.19] : [-0.16, -0.06]);
    const i = r.i(0, 4);
    const v1 = t.A[i][1], v2 = t.A[i][2];
    const g = v2 / v1;
    const truth = v2 * g;
    const g0 = t.A[i][1] / t.A[i][0];
    const u = unitText(th);
    return {
      tag: 'percentuali', table: t.table, dec: 0, fmt: (v) => `${num(v, 0)}${u}`, positive: true,
      question: `Se tra il 2024 e il 2025 ${th.what} ${inC(t.names[i])} ${V[th.g].vary} con lo stesso tasso registrato tra il 2023 e il 2024, quale valore ${V[th.g].reach} nel 2025?${th.unit === 'numero' ? ' (arrotondamento all\'unità)' : ` (in ${th.unit}, arrotondamento all'unità)`}`,
      truth,
      steps: [`tasso 2023–2024 = ${num(v2, th.dec)} ÷ ${num(v1, th.dec)} = ${num(g, 4)}`, `${num(v2, th.dec)} × ${num(g, 4)} = ${num(truth, 0)}${u}`],
      cands: [
        { v: v2 + (v2 - v1), trap: 'percentuali', why: 'aggiunge la stessa differenza assoluta invece di applicare lo stesso tasso' },
        { v: v2 * (v2 / t.A[i][0]), trap: 'lettura-dati', why: 'applica la crescita di due anni (2022–2024) invece di quella di un anno' },
        { v: v2 * g0, trap: 'lettura-dati', why: 'usa il tasso tra il 2022 e il 2023 (anni sbagliati)' },
        { v: v2 * (t.B[i][2] / t.B[i][1]), trap: 'lettura-dati', why: `usa il tasso della colonna «${th.b}» (colonna sbagliata)` },
      ],
      meta: { template: 'T6', rows: [i], cols: [1, 2], params: {}, raw: { A: t.A, B: t.B } },
    };
  };

  // L2 · tasso complessivo di più Paesi (media ponderata)
  T.T7 = (r) => {
    const names = countries(r, 5);
    const occ = names.map((n) => { const a = POP[n] * 1000 * r.f(0.42, 0.5); return [roundTo(a, 0), roundTo(a * r.f(0.99, 1.025), 0)]; });
    const dis = names.map((n, k) => { const rate = r.f(0.035, 0.16); return [roundTo((occ[k][0] * rate) / (1 - rate), 0), roundTo((occ[k][1] * Math.max(0.025, rate + r.f(-0.02, 0.02))) / (1 - rate), 0)]; });
    const rate = (k, y) => (dis[k][y] / (dis[k][y] + occ[k][y])) * 100;
    const shown = names.map((_, k) => [roundTo(rate(k, 0), 1), roundTo(rate(k, 1), 1)]);
    const y = r.i(0, 1);
    const sd = dis.reduce((s, x) => s + x[y], 0), so = occ.reduce((s, x) => s + x[y], 0);
    const truth = (sd / (sd + so)) * 100;
    const simple = shown.reduce((s, x) => s + x[y], 0) / 5;
    const sd2 = dis.reduce((s, x) => s + x[1 - y], 0), so2 = occ.reduce((s, x) => s + x[1 - y], 0);
    return {
      tag: 'media', dec: 1, fmt: (v) => pct(v), positive: true,
      table: {
        title: 'Occupati e disoccupati', note: `Occupati e disoccupati in migliaia; tasso di disoccupazione in %. ${NOTE}`,
        groups: [{ label: 'Occupati', span: 2 }, { label: 'Disoccupati', span: 2 }, { label: 'Tasso di disoccupazione', span: 2 }],
        head: ['Paese', '2023', '2024', '2023', '2024', '2023', '2024'],
        rows: names.map((n, k) => [n, cell(occ[k][0], 0), cell(occ[k][1], 0), cell(dis[k][0], 0), cell(dis[k][1], 0), cell(shown[k][0], 1), cell(shown[k][1], 1)]),
      },
      question: `Qual è stato nel ${2023 + y} il tasso di disoccupazione dei cinque Paesi considerati insieme? (in percentuale, arrotondamento a una cifra decimale)`,
      truth,
      steps: [`disoccupati totali = ${num(sd, 0)}; forza lavoro totale = ${num(sd, 0)} + ${num(so, 0)} = ${num(sd + so, 0)}`, `${num(sd, 0)} ÷ ${num(sd + so, 0)} × 100 = ${pct(truth)}`],
      cands: [
        { v: simple, trap: 'media', why: 'è la media semplice dei cinque tassi: non tiene conto del peso di ciascun Paese' },
        { v: (sd / so) * 100, trap: 'rapporti', why: 'divide per gli occupati invece che per la forza lavoro (occupati + disoccupati)' },
        { v: (sd2 / (sd2 + so2)) * 100, trap: 'lettura-dati', why: `è il tasso del ${2023 + (1 - y)} (anno sbagliato)` },
      ],
      meta: { template: 'T7', rows: [], cols: [y], params: {}, raw: { occ, dis, shown } },
    };
  };

  // L2 · conversione di valuta
  T.T8 = (r) => {
    const names = r.shuffle(Object.keys(FX)).slice(0, 5).sort((a, b) => a.localeCompare(b, 'it'));
    const fx = names.map((n) => [roundTo(FX[n] * r.f(0.97, 1.03), FX[n] > 100 ? 1 : 3), 0]);
    for (const f of fx) f[1] = roundTo(f[0] * r.f(0.97, 1.03), f[0] > 100 ? 1 : 3);
    const eur = names.map(() => r.f(900, 9000));
    const exp = names.map((_, k) => [roundTo(eur[k] * fx[k][0], 0), roundTo(eur[k] * r.f(0.95, 1.12) * fx[k][1], 0)]);
    const imp = names.map((_, k) => [roundTo(exp[k][0] * r.f(0.8, 1.15), 0), roundTo(exp[k][1] * r.f(0.8, 1.15), 0)]);
    const i = r.i(0, 4), y = r.i(0, 1);
    const truth = exp[i][y] / fx[i][y];
    const dfx = (k, yy) => (fx[k][yy] > 100 ? 1 : 3);
    return {
      tag: 'unita-misura', dec: 0, fmt: (v) => `${num(v, 0)} milioni di €`, positive: true,
      table: {
        title: 'Commercio agroalimentare dei Paesi fuori dall\'euro', note: `Esportazioni e importazioni in milioni di moneta nazionale; cambio in unità di moneta nazionale per 1 €. ${NOTE}`,
        groups: [{ label: 'Esportazioni', span: 2 }, { label: 'Importazioni', span: 2 }, { label: 'Cambio', span: 2 }],
        head: ['Paese', '2023', '2024', '2023', '2024', '2023', '2024'],
        rows: names.map((n, k) => [n, cell(exp[k][0], 0), cell(exp[k][1], 0), cell(imp[k][0], 0), cell(imp[k][1], 0), cell(fx[k][0], dfx(k, 0)), cell(fx[k][1], dfx(k, 1))]),
      },
      question: `Quanto valevano in euro le esportazioni agroalimentari ${diC(names[i])} nel ${2023 + y}? (in milioni di €, arrotondamento all'unità)`,
      truth,
      steps: [`${num(exp[i][y], 0)} ÷ ${num(fx[i][y], dfx(i, y))} = ${num(truth, 0)} milioni di €`],
      cands: [
        { v: exp[i][y] / fx[i][1 - y], trap: 'lettura-dati', why: `usa il cambio del ${2023 + (1 - y)} (anno sbagliato)` },
        { v: imp[i][y] / fx[i][y], trap: 'lettura-dati', why: 'converte le importazioni invece delle esportazioni' },
        { v: exp[i][1 - y] / fx[i][1 - y], trap: 'lettura-dati', why: `è il valore del ${2023 + (1 - y)}` },
        { v: (exp[i][y] / fx[i][y]) * (fx[i][y] > 100 ? 0.1 : 10), trap: 'unita-misura', why: 'sposta la virgola: errore di ordine di grandezza' },
      ],
      meta: { template: 'T8', rows: [i], cols: [y], params: {}, raw: { exp, imp, fx } },
    };
  };

  // L3 · valore ricavato da una quota, poi combinato (spesa in R&S da PIL e % del PIL)
  T.T9 = (r) => {
    const names = countries(r, 5);
    const gdp = names.map((n) => { const a = POP[n] * r.f(22, 58); return [roundTo(a, 1), roundTo(a * r.f(1.01, 1.07), 1)]; });
    const sh = names.map(() => { const a = r.f(0.8, 3.4); return [roundTo(a, 2), roundTo(Math.max(0.6, a + r.f(-0.25, 0.3)), 2)]; });
    const res = names.map((n) => { const a = POP[n] * r.f(2.5, 9); return [roundTo(a, 1), roundTo(a * r.f(0.98, 1.06), 1)]; });
    const i = r.i(0, 4);
    if (Math.abs(sh[i][1] - sh[i][0]) < 0.08) sh[i][1] = roundTo(sh[i][0] + 0.15, 2);
    const rd = (y) => gdp[i][y] * sh[i][y] / 100 * 1000; // milioni di €
    const truth = rd(1) - rd(0);
    return {
      tag: 'rapporti', dec: 0, fmt: (v) => `${num(v, 0)} milioni di €`, wide: true,
      table: {
        title: 'PIL, ricerca e ricercatori', note: `PIL in miliardi di €; spesa in R&S in % del PIL; ricercatori in migliaia. ${NOTE}`,
        groups: [{ label: 'PIL', span: 2 }, { label: 'Spesa in R&S (% del PIL)', span: 2 }, { label: 'Ricercatori', span: 2 }],
        head: ['Paese', '2023', '2024', '2023', '2024', '2023', '2024'],
        rows: names.map((n, k) => [n, cell(gdp[k][0], 1), cell(gdp[k][1], 1), cell(sh[k][0], 2), cell(sh[k][1], 2), cell(res[k][0], 1), cell(res[k][1], 1)]),
      },
      question: `Di quanti milioni di euro è variata la spesa in R&S ${inC(names[i])} tra il 2023 e il 2024? (arrotondamento al milione)`,
      truth,
      steps: [`2023: ${num(gdp[i][0], 1)} × ${num(sh[i][0], 2)}% = ${num(rd(0), 0)} milioni di €`, `2024: ${num(gdp[i][1], 1)} × ${num(sh[i][1], 2)}% = ${num(rd(1), 0)} milioni di €`, `differenza = ${num(truth, 0)} milioni di €`],
      cands: [
        { v: gdp[i][1] * (sh[i][1] - sh[i][0]) / 100 * 1000, trap: 'percentuali', why: 'applica la variazione della quota al solo PIL del 2024: ignora che è cambiato anche il PIL' },
        { v: gdp[i][0] * (sh[i][1] - sh[i][0]) / 100 * 1000, trap: 'lettura-dati', why: 'usa il PIL del 2023 per entrambi gli anni' },
        { v: (gdp[i][1] - gdp[i][0]) * sh[i][1] / 100 * 1000, trap: 'percentuali', why: 'applica la quota del 2024 alla sola crescita del PIL' },
        { v: truth / 10, trap: 'unita-misura', why: 'sbaglia la conversione da miliardi a milioni' },
      ],
      meta: { template: 'T9', rows: [i], cols: [0, 1], params: {}, raw: { gdp, sh, res } },
    };
  };

  // L3 · crescita necessaria per raggiungere un altro valore
  T.T10 = (r) => {
    const th = r.pick(THEMES);
    const t = themeTable(r, th);
    const order = [0, 1, 2, 3, 4].sort((a, b) => t.A[a][2] - t.A[b][2]);
    const pairs = [];
    for (const a of order) for (const b of order) if (t.A[b][2] / t.A[a][2] >= 1.15 && t.A[b][2] / t.A[a][2] <= 2.5) pairs.push([a, b]);
    const [x, z] = pairs.length ? r.pick(pairs) : [order[0], order[4]];
    const vx = t.A[x][2], vz = t.A[z][2];
    const truth = ((vz - vx) / vx) * 100;
    return {
      tag: 'percentuali', table: t.table, dec: 1, fmt: (v) => pct(v), positive: true, wide: true,
      question: `Di quanto ${V[th.g].should} aumentare, in percentuale, rispetto al 2024, ${th.what} ${inC(t.names[x])} per raggiungere il valore registrato nel 2024 ${inC(t.names[z])}? (arrotondamento a una cifra decimale)`,
      truth,
      steps: [`(${num(vz, th.dec)} − ${num(vx, th.dec)}) ÷ ${num(vx, th.dec)} × 100 = ${pct(truth)}`],
      cands: [
        { v: ((vz - vx) / vz) * 100, trap: 'percentuali', why: 'divide per il valore da raggiungere invece che per quello di partenza (base sbagliata)' },
        { v: (vz / vx) * 100, trap: 'percentuali', why: 'è il rapporto tra i due valori, non l\'aumento necessario' },
        { v: ((t.A[z][1] - t.A[x][1]) / t.A[x][1]) * 100, trap: 'lettura-dati', why: 'usa i valori del 2023 (anno sbagliato)' },
        { v: ((t.B[z][2] - t.B[x][2]) / t.B[x][2]) * 100, trap: 'lettura-dati', why: `usa la colonna «${th.b}» (colonna sbagliata)` },
      ],
      meta: { template: 'T10', rows: [x, z], cols: [2], params: {}, raw: { A: t.A, B: t.B } },
    };
  };

  // L3 · valore di partenza da valore finale e variazione (percentuale inversa)
  T.T11 = (r) => {
    const names = countries(r, 5);
    const topic = r.pick([
      { title: 'Rifiuti urbani', what: 'i rifiuti urbani raccolti', unit: 'migliaia di tonnellate', pc: [350, 760], a: 'Raccolti', b: 'Raccolta differenziata' },
      { title: 'Trasporto ferroviario', what: 'i passeggeri del trasporto ferroviario', unit: 'migliaia', pc: [9000, 110000], a: 'Passeggeri', b: 'Passeggeri regionali' },
      { title: 'Musei statali', what: 'i visitatori dei musei statali', unit: 'migliaia', pc: [250, 2400], a: 'Visitatori', b: 'Visitatori stranieri' },
    ]);
    const v = names.map((n) => roundTo(POP[n] * r.f(topic.pc[0], topic.pc[1]), 0));
    const p = names.map(() => { const s = r.chance(0.75) ? 1 : -1; return roundTo(s * r.f(6, 24), 1); });
    const v2 = names.map((_, k) => roundTo(v[k] * r.f(0.38, 0.72), 0));
    const p2 = names.map(() => roundTo(r.f(-12, 18), 1));
    const i = r.i(0, 4);
    const truth = v[i] / (1 + p[i] / 100);
    const j = (i + r.i(1, 4)) % 5;
    return {
      tag: 'percentuali', dec: 0, fmt: (x) => `${num(x, 0)} ${topic.unit}`, positive: true,
      table: {
        title: topic.title, note: `Valori in ${topic.unit}; variazioni in % rispetto all'anno precedente. ${NOTE}`,
        groups: [{ label: topic.a, span: 2 }, { label: topic.b, span: 2 }, { label: 'Altri dati 2024', span: 2 }],
        head: ['Paese', '2024', 'var. %', '2024', 'var. %', 'popolazione (milioni)', 'quota sul totale (%)'],
        rows: names.map((n, k) => [n, cell(v[k], 0), cell(p[k], 1), cell(v2[k], 0), cell(p2[k], 1), cell(POP[n], 2), cell(roundTo((v[k] / v.reduce((s, x) => s + x, 0)) * 100, 1), 1)]),
      },
      question: `A quanto ammontavano nel 2023 ${topic.what} ${inC(names[i])}? (in ${topic.unit}, arrotondamento all'unità)`,
      truth,
      steps: [`${num(v[i], 0)} ÷ (1 ${p[i] >= 0 ? '+' : '−'} ${num(Math.abs(p[i]) / 100, 3)}) = ${num(truth, 0)}`],
      cands: [
        { v: v[i] * (1 - p[i] / 100), trap: 'percentuali', why: 'toglie la percentuale al valore del 2024: la variazione si calcola sul 2023, quindi bisogna dividere' },
        { v: v[i] * (1 + p[i] / 100), trap: 'percentuali', why: 'applica la variazione in avanti, verso il 2025' },
        { v: v[j] / (1 + p[j] / 100), trap: 'lettura-dati', why: `è il valore della riga «${names[j]}» (riga sbagliata)` },
        { v: v2[i] / (1 + p2[i] / 100), trap: 'lettura-dati', why: `usa la colonna «${topic.b}» (colonna sbagliata)` },
      ],
      meta: { template: 'T11', rows: [i, j], cols: [], params: {}, raw: { v, p, v2, p2 } },
    };
  };

  // L3 · scarto tra due crescite, in punti percentuali
  T.T12 = (r) => {
    const th = r.pick(THEMES);
    const t = themeTable(r, th, [-0.05, 0.2]);
    const i = r.i(0, 4); let j = (i + r.i(1, 4)) % 5;
    const g = (k, a, b) => ((t.A[k][b] - t.A[k][a]) / t.A[k][a]) * 100;
    let gx = g(i, 1, 2), gy = g(j, 1, 2);
    let x = i, y = j;
    if (gx < gy) { [x, y] = [j, i]; [gx, gy] = [gy, gx]; }
    const truth = gx - gy;
    return {
      tag: 'percentuali', table: t.table, dec: 1, fmt: (v) => `${num(v, 1)} punti percentuali`, wide: true,
      question: `Di quanti punti percentuali la crescita percentuale ${th.of} ${inC(t.names[x])} tra il 2023 e il 2024 ha superato quella registrata ${inC(t.names[y])}? (arrotondamento a una cifra decimale)`,
      truth,
      steps: [`crescita ${inC(t.names[x])} = ${pct(gx)}; ${inC(t.names[y])} = ${pct(gy)}`, `${num(gx, 1)} − ${num(gy, 1)} = ${num(truth, 1)} punti percentuali`],
      cands: [
        { v: gy !== 0 ? (truth / Math.abs(gy)) * 100 : truth * 3, trap: 'percentuali', why: 'calcola di quanto in percentuale una crescita supera l\'altra, invece della differenza in punti' },
        { v: ((t.A[x][2] - t.A[x][1]) / t.A[x][2]) * 100 - ((t.A[y][2] - t.A[y][1]) / t.A[y][2]) * 100, trap: 'percentuali', why: 'calcola le crescite sui valori del 2024 (base sbagliata)' },
        { v: g(x, 0, 1) - g(y, 0, 1), trap: 'lettura-dati', why: 'usa le crescite tra il 2022 e il 2023 (anni sbagliati)' },
        { v: ((t.A[x][2] - t.A[y][2]) / t.A[y][2]) * 100, trap: 'lettura-dati', why: 'confronta i livelli del 2024 invece delle crescite' },
      ],
      meta: { template: 'T12', rows: [x, y], cols: [1, 2], params: {}, raw: { A: t.A, B: t.B } },
    };
  };

  const BY_LEVEL = { 1: ['T1', 'T2', 'T3'], 2: ['T4', 'T5', 'T6', 'T7', 'T8'], 3: ['T9', 'T10', 'T11', 'T12'] };

  // ══ Grafici ══ Nei test EPSO i dati arrivano anche da grafici a barre, a linee e a torta [A eutraining, guida 2026],
  // con i valori scritti sul grafico. Gli item con grafico hanno id G<livello>-<seme> e un campo `chart`
  // (a volte anche `table`); i calcoli usano i valori come appaiono sul grafico.
  const YEARS6 = ['2019', '2020', '2021', '2022', '2023', '2024'];
  const labelsOf = (vals, dec) => vals.map((v) => num(v, dec));

  // L1 · barre orizzontali, due anni: variazione percentuale di un Paese
  T.G1 = (r) => {
    const th = r.pick(THEMES);
    const names = countries(r, 5);
    const vals = names.map((n) => series(r, POP[n] * r.f(th.pc[0], th.pc[1]), [-0.08, 0.2], 2, th.dec));
    const i = r.i(0, 4);
    const [v23, v24] = vals[i];
    if (Math.abs(v24 - v23) / v23 < 0.02) return { truth: NaN };
    const truth = ((v24 - v23) / v23) * 100;
    const j = (i + r.i(1, 4)) % 5;
    return {
      tag: 'percentuali', dec: 1, fmt: (v) => pct(v), wide: true,
      chart: { type: 'hbar', title: `${th.title}: ${th.a.toLowerCase()}${th.unit === 'numero' ? '' : `, in ${th.unit}`}`, note: NOTE, categories: names, series: ['2023', '2024'].map((y, k) => ({ name: y, values: vals.map((v) => v[k]), labels: labelsOf(vals.map((v) => v[k]), th.dec) })) },
      question: `Di quanto ${V[th.g].varied}, in percentuale, ${th.what} ${inC(names[i])} tra il 2023 e il 2024? (arrotondamento a una cifra decimale)`,
      truth,
      steps: [`dal grafico: ${num(v23, th.dec)} nel 2023 e ${num(v24, th.dec)} nel 2024`, `(${num(v24, th.dec)} − ${num(v23, th.dec)}) ÷ ${num(v23, th.dec)} × 100 = ${pct(truth)}`],
      cands: [
        { v: ((v24 - v23) / v24) * 100, trap: 'percentuali', why: 'divide per il valore del 2024 invece che per quello di partenza (base sbagliata)' },
        { v: (v24 / v23) * 100, trap: 'percentuali', why: 'è il rapporto tra i due valori, non la variazione: manca il «− 100»' },
        { v: ((vals[j][1] - vals[j][0]) / vals[j][0]) * 100, trap: 'lettura-dati', why: `è la variazione registrata ${inC(names[j])} (barre sbagliate)` },
        { v: ((v23 - v24) / v23) * 100, trap: 'lettura-dati', why: 'inverte il verso della variazione' },
      ],
      meta: { template: 'G1', rows: [i, j], cols: [0, 1], params: {}, raw: { vals } },
    };
  };

  // L1 · linee, due Paesi su sei anni: aumento medio annuo
  T.G2 = (r) => {
    const th = r.pick(THEMES);
    const names = countries(r, 2);
    const vals = names.map((n) => series(r, POP[n] * r.f(th.pc[0], th.pc[1]), [-0.04, 0.14], 6, th.dec));
    const i = r.i(0, 1), j = 1 - i;
    const v = vals[i];
    if (v[5] - v[0] < (th.dec ? 0.5 : 5)) return { truth: NaN };
    const truth = (v[5] - v[0]) / 5;
    const dec = 1;
    const u = unitText(th);
    return {
      tag: 'media', dec, fmt: (x) => `${num(x, dec)}${u}`, positive: true, wide: true,
      chart: { type: 'line', title: `${th.title}: ${th.a.toLowerCase()}${th.unit === 'numero' ? '' : `, in ${th.unit}`}`, note: NOTE, categories: YEARS6, series: names.map((n, k) => ({ name: n, values: vals[k], labels: labelsOf(vals[k], th.dec) })) },
      question: `Qual è stato l'aumento medio annuo ${th.of} ${inC(names[i])} tra il 2019 e il 2024? (${th.unit === 'numero' ? '' : `in ${th.unit}, `}arrotondamento a una cifra decimale)`,
      truth,
      steps: [`aumento totale: ${num(v[5], th.dec)} − ${num(v[0], th.dec)} = ${num(v[5] - v[0], th.dec)}`, `gli intervalli annuali dal 2019 al 2024 sono 5: ${num(v[5] - v[0], th.dec)} ÷ 5 = ${num(truth, dec)}`],
      cands: [
        { v: (v[5] - v[0]) / 6, trap: 'media', why: 'divide per 6 (gli anni) invece che per 5 (gli intervalli tra un anno e l\'altro)' },
        { v: (v[5] - v[1]) / 4, trap: 'lettura-dati', why: 'parte dal 2020 invece che dal 2019' },
        { v: (vals[j][5] - vals[j][0]) / 5, trap: 'lettura-dati', why: `è l'aumento medio ${inC(names[j])} (linea sbagliata)` },
        { v: (v[4] - v[0]) / 4, trap: 'lettura-dati', why: 'si ferma al 2023' },
      ],
      meta: { template: 'G2', rows: [i, j], cols: [0, 5], params: {}, raw: { vals } },
    };
  };

  // Temi per le torte: composizione di un totale.
  const PIE_THEMES = [
    { title: 'Bilancio di un programma europeo di ricerca per area', unit: 'milioni di €', dec: 0, tot: [2200, 9800], cats: ['Salute', 'Clima ed energia', 'Digitale e industria', 'Cultura e società', 'Infrastrutture di ricerca'], what: 'i fondi per', of: 'dei fondi per' },
    { title: 'Produzione di energia elettrica di un Paese per fonte', unit: 'TWh', dec: 1, tot: [180, 640], cats: ['Gas', 'Eolico e solare', 'Idroelettrico', 'Nucleare', 'Altre fonti'], what: 'la produzione da', of: 'della produzione da' },
    { title: 'Spesa di una regione per settore', unit: 'milioni di €', dec: 0, tot: [1400, 6200], cats: ['Sanità', 'Trasporti', 'Istruzione', 'Ambiente', 'Altro'], what: 'la spesa per', of: 'della spesa per' },
    { title: 'Arrivi turistici in una regione per provenienza', unit: 'migliaia', dec: 0, tot: [2400, 9600], cats: ['Italia', 'Germania', 'Francia', 'Stati Uniti', 'Altri Paesi'], what: 'gli arrivi da', of: 'degli arrivi da' },
  ];
  function shares(r, n) {
    for (let guard = 0; guard < 50; guard++) {
      const w = Array.from({ length: n }, () => r.f(0.6, 3));
      const s = w.reduce((a, b) => a + b, 0);
      const out = w.map((x) => Math.max(4, Math.round((x / s) * 100)));
      const diff = 100 - out.reduce((a, b) => a + b, 0);
      out[out.indexOf(Math.max(...out))] += diff;
      if (out.every((x) => x >= 4) && new Set(out).size === n) return out;
    }
    return [32, 24, 19, 14, 11];
  }
  const pieChart = (th, years, sh, tots) => ({
    type: 'pie', title: th.title, note: `Quote in percentuale del totale; totale in ${th.unit}. ${NOTE}`, categories: th.cats,
    series: years.map((y, k) => ({ name: y, values: sh[k], labels: sh[k].map((x) => `${x}%`), totalLabel: `${y} · totale ${num(tots[k], th.dec)} ${th.unit}` })),
  });

  // L2 · torta con totale: valore assoluto di una voce o differenza fra due voci
  T.G3 = (r) => {
    const th = r.pick(PIE_THEMES);
    const sh = shares(r, 5);
    const tot = roundTo(r.f(th.tot[0], th.tot[1]), th.dec === 0 ? -1 : 0);
    let a = r.i(0, 4), b = (a + r.i(1, 4)) % 5;
    const u = ` ${th.unit}`;
    const dec = th.dec;
    const val = (k) => (sh[k] / 100) * tot;
    const diffQ = r.chance(0.5);
    if (diffQ && sh[a] < sh[b]) [a, b] = [b, a];
    if (diffQ && sh[a] - sh[b] < 5) return { truth: NaN };
    const other = [0, 1, 2, 3, 4].find((k) => k !== a && k !== b);
    const truth = diffQ ? val(a) - val(b) : val(a);
    const c = th.cats;
    return {
      tag: diffQ ? 'lettura-dati' : 'percentuali', dec, fmt: (x) => `${num(x, dec)}${u}`, positive: true, wide: diffQ,
      chart: pieChart(th, ['2024'], [sh], [tot]),
      question: diffQ
        ? `Nel 2024, di quanto il valore della voce «${c[a]}» ha superato quello della voce «${c[b]}»? (in ${th.unit}, arrotondamento ${dec ? 'a una cifra decimale' : 'all\'unità'})`
        : `Qual era nel 2024 il valore della voce «${c[a]}»? (in ${th.unit}, arrotondamento ${dec ? 'a una cifra decimale' : 'all\'unità'})`,
      truth,
      steps: diffQ
        ? [`${sh[a]}% − ${sh[b]}% = ${sh[a] - sh[b]} punti`, `${sh[a] - sh[b]}% di ${num(tot, dec)} = ${num(truth, dec)}${u}`]
        : [`${sh[a]}% di ${num(tot, dec)} = ${num(tot, dec)} × ${num(sh[a] / 100, 2)} = ${num(truth, dec)}${u}`],
      cands: diffQ ? [
        { v: val(a), trap: 'lettura-dati', why: `è il valore di «${c[a]}» da solo, senza togliere «${c[b]}»` },
        { v: val(a) + val(b), trap: 'lettura-dati', why: 'somma le due voci invece di sottrarle' },
        { v: val(a) - val(other), trap: 'lettura-dati', why: `sottrae la voce «${c[other]}» (fetta sbagliata)` },
        { v: truth * 10, trap: 'unita-misura', why: 'sposta la virgola: errore di ordine di grandezza' },
      ] : [
        { v: ((100 - sh[a]) / 100) * tot, trap: 'percentuali', why: 'calcola il resto del totale invece della quota richiesta' },
        { v: val(b), trap: 'lettura-dati', why: `è il valore di «${c[b]}» (fetta sbagliata)` },
        { v: truth / 10, trap: 'unita-misura', why: 'sposta la virgola: errore di ordine di grandezza' },
      ],
      meta: { template: 'G3', rows: [a, b], cols: [], params: { diffQ, tot }, raw: { sh, tot } },
    };
  };

  // L2 · due torte (2023 e 2024) con totali diversi: variazione percentuale di una voce
  T.G4 = (r) => {
    const th = r.pick(PIE_THEMES.filter((t) => t.unit !== 'TWh'));
    const s23 = shares(r, 5);
    const s24 = s23.map((x) => Math.max(4, x + r.i(-4, 4)));
    const d = 100 - s24.reduce((a, b) => a + b, 0);
    s24[s24.indexOf(Math.max(...s24))] += d;
    if (s24.some((x) => x < 4)) return { truth: NaN };
    const t23 = roundTo(r.f(th.tot[0], th.tot[1]), -1);
    const t24 = roundTo(t23 * r.f(0.9, 1.25), -1);
    const a = r.i(0, 4);
    const v23 = (s23[a] / 100) * t23, v24 = (s24[a] / 100) * t24;
    const truth = ((v24 - v23) / v23) * 100;
    if (Math.abs(truth) < 3 || s24[a] === s23[a]) return { truth: NaN };
    const c = th.cats;
    return {
      tag: 'percentuali', dec: 1, fmt: (x) => pct(x), wide: true,
      chart: pieChart(th, ['2023', '2024'], [s23, s24], [t23, t24]),
      question: `Di quanto è variato, in percentuale, il valore della voce «${c[a]}» tra il 2023 e il 2024? (arrotondamento a una cifra decimale)`,
      truth,
      steps: [`2023: ${s23[a]}% di ${num(t23, 0)} = ${num(v23, 1)}`, `2024: ${s24[a]}% di ${num(t24, 0)} = ${num(v24, 1)}`, `(${num(v24, 1)} − ${num(v23, 1)}) ÷ ${num(v23, 1)} × 100 = ${pct(truth)}`],
      cands: [
        { v: s24[a] - s23[a], trap: 'percentuali', why: 'è la differenza fra le quote in punti percentuali, non la variazione del valore' },
        { v: ((s24[a] - s23[a]) / s23[a]) * 100, trap: 'rapporti', why: 'confronta solo le quote: ignora che il totale è cambiato' },
        { v: ((t24 - t23) / t23) * 100, trap: 'lettura-dati', why: 'è la variazione del totale, non della voce' },
        { v: ((v24 - v23) / v24) * 100, trap: 'percentuali', why: 'divide per il valore del 2024 (base sbagliata)' },
      ],
      meta: { template: 'G4', rows: [a], cols: [0, 1], params: { t23, t24 }, raw: { s23, s24, t23, t24 } },
    };
  };

  // L2 · barre + un dato nel testo della domanda: spesa per abitante
  T.G5 = (r) => {
    const names = countries(r, 5);
    const topic = r.pick([
      { title: 'Spesa pubblica per la cultura', what: 'la spesa pubblica per la cultura', pc: [60, 260] },
      { title: 'Spesa pubblica per la ricerca', what: 'la spesa pubblica per la ricerca', pc: [90, 420] },
      { title: 'Spesa per le politiche attive del lavoro', what: 'la spesa per le politiche attive del lavoro', pc: [70, 360] },
    ]);
    const vals = names.map((n) => series(r, POP[n] * r.f(topic.pc[0], topic.pc[1]), [-0.06, 0.12], 2, 0));
    const i = r.i(0, 4), j = (i + r.i(1, 4)) % 5;
    const y = r.i(0, 1);
    const pop = roundTo(POP[names[i]] * r.f(0.985, 1.01), 2);
    const truth = vals[i][y] / pop;
    return {
      tag: 'unita-misura', dec: 0, fmt: (x) => `${num(x, 0)} €`, positive: true, wide: true,
      chart: { type: 'hbar', title: `${topic.title}, in milioni di €`, note: NOTE, categories: names, series: ['2023', '2024'].map((yy, k) => ({ name: yy, values: vals.map((v) => v[k]), labels: labelsOf(vals.map((v) => v[k]), 0) })) },
      question: `Nel ${2023 + y} la popolazione ${diC(names[i])} era di ${num(pop, 2)} milioni di abitanti. Qual è stata quell'anno ${topic.what} per abitante? (in euro, arrotondamento all'unità)`,
      truth,
      steps: [`dal grafico: ${num(vals[i][y], 0)} milioni di €`, `${num(vals[i][y], 0)} milioni ÷ ${num(pop, 2)} milioni di abitanti = ${num(truth, 0)} € per abitante`],
      cands: [
        { v: vals[i][1 - y] / pop, trap: 'lettura-dati', why: `usa la barra del ${2023 + (1 - y)} (anno sbagliato)` },
        { v: vals[j][y] / pop, trap: 'lettura-dati', why: `usa il valore ${diC(names[j])} (barra sbagliata)` },
        { v: truth * 10, trap: 'unita-misura', why: 'sposta la virgola: errore di ordine di grandezza' },
        { v: vals[i][y] / (pop * 1.1), trap: 'rapporti', why: 'divide per una popolazione sbagliata' },
      ],
      meta: { template: 'G5', rows: [i, j], cols: [y], params: { pop }, raw: { vals } },
    };
  };

  // L3 · linee, esportazioni e importazioni: scarto tra due crescite, in punti percentuali
  T.G6 = (r) => {
    const name = r.pick(COUNTRIES);
    const base = POP[name] * r.f(900, 3000);
    const ex = series(r, base, [-0.03, 0.12], 6, 0);
    const im = series(r, base * r.f(0.8, 1.15), [-0.03, 0.1], 6, 0);
    const a = r.pick([0, 1]), b = 5;
    const g = (s) => ((s[b] - s[a]) / s[a]) * 100;
    const gE = g(ex), gI = g(im);
    if (gE - gI < 1.5) return { truth: NaN };
    const truth = gE - gI;
    return {
      tag: 'percentuali', dec: 1, fmt: (x) => `${num(x, 1)} punti percentuali`, wide: true,
      chart: { type: 'line', title: `Commercio di beni ${diC(name)}, in milioni di €`, note: NOTE, categories: YEARS6, series: [{ name: 'Esportazioni', values: ex, labels: labelsOf(ex, 0) }, { name: 'Importazioni', values: im, labels: labelsOf(im, 0) }] },
      question: `Di quanti punti percentuali la crescita delle esportazioni tra il ${YEARS6[a]} e il 2024 ha superato quella delle importazioni? (arrotondamento a una cifra decimale)`,
      truth,
      steps: [`esportazioni: (${num(ex[b], 0)} − ${num(ex[a], 0)}) ÷ ${num(ex[a], 0)} × 100 = ${pct(gE)}`, `importazioni: (${num(im[b], 0)} − ${num(im[a], 0)}) ÷ ${num(im[a], 0)} × 100 = ${pct(gI)}`, `${num(gE, 1)} − ${num(gI, 1)} = ${num(truth, 1)} punti percentuali`],
      cands: [
        { v: gI !== 0 ? ((gE - gI) / Math.abs(gI)) * 100 : truth * 3, trap: 'percentuali', why: 'calcola di quanto, in percentuale, una crescita supera l\'altra, invece della differenza in punti' },
        { v: ((ex[b] - ex[a]) / ex[b]) * 100 - ((im[b] - im[a]) / im[b]) * 100, trap: 'percentuali', why: 'calcola le crescite sui valori del 2024 (base sbagliata)' },
        { v: ((ex[b] - im[b]) / im[b]) * 100, trap: 'lettura-dati', why: 'confronta i livelli del 2024 invece delle crescite' },
        { v: ((ex[b] - ex[1 - a]) / ex[1 - a]) * 100 - ((im[b] - im[1 - a]) / im[1 - a]) * 100, trap: 'lettura-dati', why: `parte dal ${YEARS6[1 - a]} (anno sbagliato)` },
      ],
      meta: { template: 'G6', rows: [], cols: [a, b], params: { name }, raw: { ex, im } },
    };
  };

  // L3 · barre + tabella: chilogrammi per abitante, differenza fra due Paesi
  T.G7 = (r) => {
    const names = countries(r, 5);
    const pop = names.map((n) => roundTo(POP[n] * r.f(0.985, 1.01), 2));
    const kg = names.map(() => r.f(360, 780));
    const w = names.map((n, k) => [roundTo((pop[k] * kg[k]) * r.f(0.97, 1.03), 0), roundTo(pop[k] * kg[k], 0)]);
    const order = [0, 1, 2, 3, 4].sort((a, b) => w[b][1] / pop[b] - w[a][1] / pop[a]);
    const x = order[r.i(0, 1)], z = order[r.i(3, 4)];
    const pc = (k) => w[k][1] / pop[k];
    const truth = pc(x) - pc(z);
    if (truth < 20) return { truth: NaN };
    return {
      tag: 'unita-misura', dec: 0, fmt: (v) => `${num(v, 0)} kg`, positive: true, wide: true,
      chart: { type: 'hbar', title: 'Rifiuti urbani raccolti, in migliaia di tonnellate', note: NOTE, categories: names, series: ['2023', '2024'].map((yy, k) => ({ name: yy, values: w.map((v) => v[k]), labels: labelsOf(w.map((v) => v[k]), 0) })) },
      table: { title: 'Popolazione nel 2024, in milioni di abitanti', head: ['Paese', 'Popolazione'], rows: names.map((n, k) => [n, num(pop[k], 2)]) },
      question: `Nel 2024, di quanti chilogrammi per abitante i rifiuti urbani raccolti ${inC(names[x])} hanno superato quelli raccolti ${inC(names[z])}? (arrotondamento all'unità)`,
      truth,
      steps: [`1 migliaio di tonnellate = 1.000.000 kg e 1 milione di abitanti = 1.000.000 di persone, quindi kg per abitante = migliaia di t ÷ milioni di abitanti`, `${names[x]}: ${num(w[x][1], 0)} ÷ ${num(pop[x], 2)} = ${num(pc(x), 1)} kg`, `${names[z]}: ${num(w[z][1], 0)} ÷ ${num(pop[z], 2)} = ${num(pc(z), 1)} kg`, `differenza = ${num(truth, 0)} kg`],
      cands: [
        { v: (w[x][1] - w[z][1]) / (pop[x] - pop[z] || 1), trap: 'rapporti', why: 'divide la differenza dei rifiuti per la differenza delle popolazioni: non è un dato per abitante' },
        { v: (w[x][0] / pop[x]) - (w[z][0] / pop[z]), trap: 'lettura-dati', why: 'usa le barre del 2023 (anno sbagliato)' },
        { v: pc(x), trap: 'lettura-dati', why: `è il dato per abitante ${inC(names[x])} da solo, senza la differenza` },
        { v: truth / 1000, trap: 'unita-misura', why: 'confonde chilogrammi e tonnellate' },
      ],
      meta: { template: 'G7', rows: [x, z], cols: [1], params: {}, raw: { w, pop } },
    };
  };

  const CHART_LEVEL = { 1: ['G1', 'G2'], 2: ['G3', 'G4', 'G5'], 3: ['G6', 'G7'] };

  // ── Opzioni: chiave unica, valori ben distinti, posizione della risposta bilanciata ──
  function assemble(r, sc, noneCorrect) {
    const u = 10 ** -sc.dec;
    if (!Number.isFinite(sc.truth)) return null;
    // Niente risultati a metà fra due arrotondamenti (x,5): chi arrotonda i passaggi intermedi otterrebbe l'altra cifra.
    const frac = Math.abs(sc.truth / u) % 1;
    if (Math.abs(frac - 0.5) < 0.08) return null;
    const truth = roundTo(sc.truth, sc.dec);
    if (sc.positive && truth <= 0) return null;
    // Opzioni ben separate: almeno 2 unità dell'arrotondamento e almeno l'1,5% del risultato, così un arrotondamento
    // intermedio del candidato non lo porta mai a metà strada fra due opzioni.
    const gap = Math.max(2 * u, Math.abs(truth) * 0.015);
    const far = (a, b, k = 1) => Math.abs(roundTo(a, sc.dec) - roundTo(b, sc.dec)) >= k * gap - 1e-9;
    const plausible = (v) => Number.isFinite(v) && (!sc.positive || v > 0) && (sc.wide || truth === 0 || (Math.abs(v) >= Math.abs(truth) * 0.3 && Math.abs(v) <= Math.abs(truth) * 3.2));
    // Distrattori con nome: valori distinti fra loro e dalla risposta.
    const named = [];
    for (const c of r.shuffle(sc.cands)) {
      if (!plausible(c.v) || !far(c.v, truth) || named.some((n) => !far(n.v, c.v))) continue;
      named.push({ ...c, v: roundTo(c.v, sc.dec) });
    }
    // «Quasi giusti»: un errore di calcolo o di arrotondamento, sopra o sotto la risposta.
    const nearMiss = (sign) => {
      for (let k = 0; k < 8; k++) {
        const step = Math.max(Math.abs(truth) * r.f(0.04, 0.12), u * r.i(3, 9));
        const v = roundTo(truth + sign * step, sc.dec);
        if (plausible(v) && far(v, truth)) return { v, trap: sc.tag, why: 'è vicino al risultato ma deriva da un errore di calcolo o di arrotondamento', near: true };
      }
      return null;
    };
    let chosen = null, key = null;
    if (noneCorrect) {
      chosen = named.slice(0, 4);
      while (chosen.length < 4) {
        const nm = nearMiss(r.chance(0.5) ? 1 : -1);
        if (!nm || chosen.some((c) => !far(c.v, nm.v))) { if (!nm) return null; continue; }
        chosen.push(nm);
      }
      key = 'E';
    } else {
      // posizione desiderata della risposta tra le quattro cifre (0 = la più piccola)
      for (const k of r.shuffle([0, 1, 2, 3])) {
        const below = named.filter((c) => c.v < truth), above = named.filter((c) => c.v > truth);
        const pickSide = (list, n, sign) => {
          const out = list.slice(0, n);
          for (let guard = 0; out.length < n && guard < 10; guard++) {
            const nm = nearMiss(sign);
            if (nm && [...out, ...chosen0].every((c) => far(c.v, nm.v))) out.push(nm);
          }
          return out.length === n ? out : null;
        };
        const chosen0 = [];
        const lo = pickSide(r.shuffle(below), k, -1);
        if (!lo) continue;
        chosen0.push(...lo);
        const hi = pickSide(r.shuffle(above), 3 - k, 1);
        if (!hi) continue;
        chosen = [...lo, ...hi, { v: truth, trap: null, key: true }];
        break;
      }
      if (!chosen) return null;
    }
    const all = [...chosen];
    for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++) if (!far(all[a].v, all[b].v)) return null;
    if (noneCorrect && all.some((c) => !far(c.v, truth, 2))) return null; // con E giusta nessuna cifra deve sembrare «quasi giusta»
    all.sort((a, b) => a.v - b.v);
    const letters = ['A', 'B', 'C', 'D'];
    const options = all.map((c, k) => ({ letter: letters[k], text: sc.fmt(c.v), trap: c.key ? null : c.trap }));
    if (!noneCorrect) key = letters[all.findIndex((c) => c.key)];
    options.push({ letter: 'E', text: 'Nessuna di queste risposte', trap: noneCorrect ? null : sc.tag });
    if (new Set(options.map((o) => o.text)).size !== 5) return null;
    // Spiegazione: il calcolo, poi perché ogni cifra sbagliata è sbagliata.
    const wrong = all.map((c, k) => ({ c, letter: letters[k] })).filter((x) => !x.c.key).map((x) => `${x.letter} (${sc.fmt(x.c.v)}) ${x.c.why}.`);
    const explanation = [
      `${sc.steps.join('; ')}.`,
      noneCorrect ? `Il risultato è ${sc.fmt(truth)}, che non compare tra A e D: la risposta è E.` : `Il risultato è ${sc.fmt(truth)}: la risposta è ${key}.`,
      ...wrong,
    ].join(' ');
    return { options, key, explanation, truth };
  }

  function make(seed, level = 2) {
    const lv = [1, 2, 3].includes(level) ? level : 2;
    const rng = mulberry32((Math.imul(seed >>> 0, 2654435761) ^ (lv * 97531)) >>> 0);
    const r = R(rng);
    const tpls = BY_LEVEL[lv];
    // «Nessuna di queste risposte» giusta circa una volta su cinque: deciso una volta per item, anche se si ritenta.
    const noneCorrect = rng() < 0.2;
    for (let attempt = 0; attempt < 40; attempt++) {
      const name = tpls[Math.floor(rng() * tpls.length)];
      const sc = T[name](r);
      const out = assemble(r, sc, noneCorrect);
      if (!out) continue;
      return {
        bank: 'numerico', id: idFor(seed, lv), level: lv, format: 'num5', difficulty: lv,
        tag: sc.tag, table: sc.table, question: sc.question,
        options: out.options, correct: [out.key], explanation: out.explanation,
        answer: { value: roundTo(out.truth, sc.dec), display: sc.fmt(out.truth) },
        meta: { ...sc.meta, dec: sc.dec },
      };
    }
    throw new Error(`numerico: nessun item valido per il seme ${seed}`);
  }

  // Item con grafico: stessa logica, modelli G (id G<livello>-<seme>).
  function makeChart(seed, level = 2) {
    const lv = [1, 2, 3].includes(level) ? level : 2;
    const rng = mulberry32((Math.imul(seed >>> 0, 2246822519) ^ (lv * 48271)) >>> 0);
    const r = R(rng);
    const tpls = CHART_LEVEL[lv];
    const noneCorrect = rng() < 0.2;
    for (let attempt = 0; attempt < 60; attempt++) {
      const name = tpls[Math.floor(rng() * tpls.length)];
      const sc = T[name](r);
      if (!sc || !Number.isFinite(sc.truth)) continue;
      const out = assemble(r, sc, noneCorrect);
      if (!out) continue;
      return {
        bank: 'numerico', id: chartIdFor(seed, lv), level: lv, format: 'num5', difficulty: lv,
        tag: sc.tag, chart: sc.chart, table: sc.table || null, question: sc.question,
        options: out.options, correct: [out.key], explanation: out.explanation,
        answer: { value: roundTo(out.truth, sc.dec), display: sc.fmt(out.truth) },
        meta: { ...sc.meta, dec: sc.dec },
      };
    }
    throw new Error(`numerico (grafico): nessun item valido per il seme ${seed}`);
  }

  const idFor = (seed, level) => `N${level}-${seed}`;
  const chartIdFor = (seed, level) => `G${level}-${seed}`;
  function parseId(id) {
    const m = /^N([123])-(\d{1,10})$/.exec(String(id));
    return m ? { level: Number(m[1]), seed: Number(m[2]) } : null;
  }
  function parseChartId(id) {
    const m = /^G([123])-(\d{1,10})$/.exec(String(id));
    return m ? { level: Number(m[1]), seed: Number(m[2]) } : null;
  }

  return { make, idFor, parseId, TEMPLATES: BY_LEVEL, CHART_TEMPLATES: CHART_LEVEL, num, chart: { make: makeChart, idFor: chartIdFor, parseId: parseChartId } };
})();
