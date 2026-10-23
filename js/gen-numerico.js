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

  // ══ Multi-passaggio (id M<livello>-<seme>), sul modello del campione ufficiale EPSO AD di numerico (2024) ══
  // Tabella con colonne eterogenee (% del PIL in due anni, quota pubblica in due anni, brevetti per milione di
  // abitanti, spesa in milioni di €, PIL pro capite); grandezza da ricavare (PIL = spesa ÷ quota del PIL) e poi
  // rapporto fra due righe, con opzioni «1:3», «2:3», «3:2», «3:1»; ipotesi nel testo con opzioni molto vicine
  // (1,11% / 1,21% / 1,31% / 1,41%); righe che non sono Paesi; media pesata inversa; stime. Solo livelli 2 e 3.
  // Flusso casuale proprio (altre costanti): gli item N… e G… restano identici. Etichette generiche (Paese A–E,
  // macroregioni): i dati sono inventati e non devono passare per statistiche di Paesi reali.
  // La chiave si decide prima del modello: «Nessuna di queste risposte» giusta circa una volta su otto, altrimenti
  // una posizione A–D estratta in modo uniforme, attorno alla quale il modello costruisce le opzioni.
  // Spazio non divisibile: «Paese A» non va a capo nella prima colonna della tabella (stesso testo nella domanda).
  const PAESI_M = ['A', 'B', 'C', 'D', 'E'].map((l) => `Paese ${l}`);
  const MT = {};
  const pairOf = (r) => { const x = r.i(0, 4); return [x, (x + r.i(1, 4)) % 5]; };
  const thirdOf = (r, a, b) => r.pick([0, 1, 2, 3, 4].filter((k) => k !== a && k !== b));
  const sumOf = (a) => a.reduce((s, v) => s + v, 0);
  const logU = (r, a, b) => Math.exp(r.f(Math.log(a), Math.log(b)));
  const frac4 = (p) => num(p / 100, 4); // 1,97 (%) → 0,0197
  // Una quota che cambia fra due anni: variazione relativa fra min e max in valore assoluto, segno a caso, mai nulla.
  function moved(r, v, min, max, dec) {
    for (let k = 0; k < 8; k++) { const w = roundTo(v * (1 + (r.chance(0.5) ? 1 : -1) * r.f(min, max)), dec); if (w !== v) return w; }
    return roundTo(v * (1 + max), dec);
  }
  // Stima a due cifre significative (quella che basta quando le opzioni sono lontane).
  const sig2 = (v) => { const e = 10 ** (Math.floor(Math.log10(Math.abs(v))) - 1); return Math.round(v / e) * e; };
  // «del 2%» ma «dell'1,5%», «dell'8%», «dell'11%», «dell'80%» (numeri che si leggono con una vocale iniziale).
  const delN = (txt) => (/^(1|8|11|8\d)([,.]|$)/.test(txt) ? `dell'${txt}` : `del ${txt}`);
  const SLIPS = ['deriva da un errore di calcolo o di arrotondamento', 'derivano da errori di calcolo o di arrotondamento'];
  const SLIPS_CLOSE = ['è un valore vicino al risultato, tipico di un errore di calcolo o di un arrotondamento intermedio: con opzioni così vicine serve il calcolo esatto', 'sono valori vicini al risultato, tipici di errori di calcolo o di arrotondamenti intermedi: con opzioni così vicine serve il calcolo esatto'];
  const SLIPS_GRID = ['è lontana dalla stima corretta', 'sono lontane dalla stima corretta'];

  // ── Opzioni a rapporto: la chiave è set[pos]; le altre tre sono l'inverso della chiave, il rapporto «ingenuo»
  // (un passaggio saltato, tau) e il suo inverso. Il rapporto vero dista al massimo il 3% dalla chiave e almeno
  // 1,6 volte da ogni altra opzione; il calcolo ingenuo cade su tau e lontano dalla chiave.
  const RATIO_SETS = [[[1, 3], [2, 3], [3, 2], [3, 1]], [[1, 4], [1, 2], [2, 1], [4, 1]], [[2, 5], [2, 3], [3, 2], [5, 2]]];
  const rval = (o) => o[0] / o[1];
  const rtxt = (o) => `${o[0]}:${o[1]}`;
  const sameR = (a, b) => a[0] * b[1] === a[1] * b[0];
  const invR = (o) => [o[1], o[0]];
  const ratioSet = (r) => RATIO_SETS[r.chance(0.6) ? 0 : r.i(1, 2)];
  // tau: un'opzione diversa dalla chiave e dal suo inverso, raggiungibile con q = tau ÷ chiave (ok(q) = fattibile).
  function pickTau(r, set, key, ok) {
    const c = set.filter((o) => !sameR(o, key) && !sameR(o, invR(key))).map((o) => ({ o, q: rval(o) / rval(key) })).filter((t) => ok(t.q));
    if (!c.length) return null;
    c.sort((a, b) => Math.abs(Math.log(a.q)) - Math.abs(Math.log(b.q)));
    return c.length > 1 && r.chance(0.25) ? c[1] : c[0];
  }
  function ratioItem(ctx, sc) {
    const k = rval(sc.key);
    if (!Number.isFinite(sc.R) || Math.abs(Math.log(sc.R / k)) > Math.log(1.03)) return null;
    if (sc.set.some((o) => !sameR(o, sc.key) && Math.abs(Math.log(sc.R / rval(o))) < Math.log(1.6))) return null;
    if (Math.abs(Math.log(sc.N / rval(sc.tau))) > Math.log(1.1) || Math.abs(Math.log(sc.N / k)) < Math.log(1.35)) return null;
    const opts = sc.set.map((o) => {
      if (sameR(o, sc.key)) return { v: rval(o), text: rtxt(o), key: true };
      if (sameR(o, sc.tau)) return { v: rval(o), text: rtxt(o), trap: sc.tauTrap, why: sc.whyTau, rank: 0 };
      if (sameR(o, invR(sc.key))) return { v: rval(o), text: rtxt(o), trap: 'rapporti', why: sc.whyInv, rank: 1 };
      if (sameR(o, invR(sc.tau))) return { v: rval(o), text: rtxt(o), trap: sc.tauTrap, why: sc.whyBoth, rank: 2 };
      return null;
    });
    if (!opts.every(Boolean)) return null;
    return { ...sc, opts, dec: 2, value: roundTo(sc.R, 2), display: rtxt(sc.key), params: { ...(sc.params || {}), set: sc.set.map(rtxt) },
      result: `Il rapporto è ${num(sc.R, 2)}, cioè circa ${rtxt(sc.key)}: la risposta è ${'ABCD'[ctx.pos]}.` };
  }

  // ── Opzioni numeriche «sparse»: distrattori con nome in ordine di insidia, poi errori di calcolo (trappola
  // «calcolo»). Opzioni distanti almeno il 3% (o 2 unità dell'arrotondamento); risultato lontano da un x,5.
  // Con E giusta le quattro cifre stanno tutte dalla stessa parte del risultato, ad almeno due passi da lui
  // (passo = distanza minima fra due opzioni vicine): nessuna sembra «quasi giusta» e nessun buco tradisce la E.
  function spreadOpts(r, sc, ctx) {
    const u = 10 ** -sc.dec;
    if (!Number.isFinite(sc.truth) || Math.abs((Math.abs(sc.truth / u) % 1) - 0.5) < 0.15) return null;
    const t = roundTo(sc.truth, sc.dec);
    const lo = sc.lo === undefined ? 0 : sc.lo, hi = sc.hi === undefined ? Infinity : sc.hi;
    if (!(t > lo && t < hi)) return null;
    const gap = Math.max(2 * u, Math.abs(t) * (sc.gapRel || 0.03));
    const ok = (v) => Number.isFinite(v) && v > lo && v < hi;
    const apart = (v, list) => list.every((o) => Math.abs(o.v - v) >= gap - 1e-9);
    const named = [];
    for (const c of sc.cands) {
      const v = roundTo(c.v, sc.dec);
      if (!ok(v) || (!c.far && (Math.abs(v) < Math.abs(t) * 0.3 || Math.abs(v) > Math.abs(t) * 3.2))) continue;
      if (Math.abs(v - t) < gap - 1e-9 || !apart(v, named)) continue;
      named.push({ ...c, v, rank: named.length });
    }
    // Le cifre di riempimento hanno la stessa grana dei risultati possibili (per esempio migliaia di km² nelle somme):
    // una cifra «impossibile» si scarterebbe senza calcolare.
    const qn = sc.quantum || u;
    const rq = (v) => roundTo(Math.round(v / qn) * qn, sc.dec);
    const slip = (v) => ({ v, trap: 'calcolo', filler: true });
    const sideOf = (o) => (o.v < t ? -1 : 1);
    let chosen = null;
    if (!ctx.none) {
      const need = { '-1': ctx.pos, 1: 3 - ctx.pos };
      chosen = [];
      for (const c of named) if (chosen.filter((o) => sideOf(o) === sideOf(c)).length < need[sideOf(c)]) chosen.push(c);
      for (const side of [-1, 1]) {
        for (let guard = 0; chosen.filter((o) => sideOf(o) === side).length < need[side]; guard++) {
          if (guard > 40) return null;
          const v = rq(t + side * Math.max(gap * r.f(1, 1.8), Math.abs(t) * r.f(0.04, 0.13)));
          if (ok(v) && Math.abs(v - t) >= gap - 1e-9 && apart(v, chosen)) chosen.push(slip(v));
        }
      }
      chosen.push({ v: t, key: true });
    } else {
      // distanza misurata dal risultato vero (non arrotondato)
      const validE = (list) => {
        const s = list.map((o) => o.v).sort((a, b) => a - b);
        if (!s.every(ok) || new Set(s).size !== 4) return false;
        let m = Infinity;
        for (let k = 1; k < 4; k++) m = Math.min(m, s[k] - s[k - 1]);
        return m >= gap - 1e-9 && s.every((v) => Math.abs(v - sc.truth) >= 2 * m + 1e-9);
      };
      for (let attempt = 0; attempt < 60 && !chosen; attempt++) {
        const side = named.length && r.chance(0.75) ? sideOf(named[0]) : (r.chance(0.5) ? 1 : -1);
        const m = gap * r.f(1, 1.25);
        // Il distrattore con nome più insidioso da quella parte (se abbastanza lontano) fa da perno della scala:
        // j gradini fra lui e il risultato, gli altri oltre; altrimenti una scala che parte da due passi.
        const c = r.chance(0.9) ? named.find((n) => sideOf(n) === side && Math.abs(n.v - t) >= 2 * m - 1e-9) : null;
        let list;
        if (c) {
          const a = Math.abs(c.v - t);
          const j = r.i(0, Math.max(0, Math.min(3, Math.floor((a - 2 * m) / m + 1e-9))));
          list = [c];
          for (let k = 1; k <= j; k++) list.push(slip(rq(c.v - side * k * m)));
          let d = a;
          for (let k = 0; k < 3 - j; k++) { d += m * r.f(1, 1.3); list.push(slip(rq(t + side * d))); }
          // un secondo distrattore con nome, se cade nella scala, prende il posto della cifra più vicina
          const c2 = named.find((n) => n !== c && sideOf(n) === side);
          if (c2) {
            const idx = list.reduce((b, o, k) => (k && Math.abs(o.v - c2.v) < Math.abs(list[b].v - c2.v) ? k : b), 1);
            const trial = list.slice(); trial[idx] = c2;
            if (validE(trial)) list = trial;
          }
        } else {
          const steps = [0, 1, 2].map(() => m * r.f(1, 1.3));
          const d0 = 2 * Math.min(...steps) * r.f(1.05, 1.5);
          list = [0, 1, 2, 3].map((k) => slip(rq(t + side * (d0 + sumOf(steps.slice(0, k))))));
        }
        if (validE(list)) chosen = list;
      }
      if (!chosen) return null;
    }
    chosen.sort((a, b) => a.v - b.v);
    for (let k = 1; k < 4; k++) if (chosen[k].v - chosen[k - 1].v < gap - 1e-9) return null;
    return chosen.map((o) => ({ ...o, text: sc.fmt(o.v) }));
  }

  // ── Opzioni molto vicine (campione ufficiale: 1,11% / 1,21% / 1,31% / 1,41%): valori in % con due decimali,
  // almeno 0,08 punti fra due opzioni, tutte entro mezzo punto dal risultato e con lo stesso segno.
  // Senza distrattori con nome nella fascia: scala regolare di passo 0,10 come nel campione.
  function closeOpts(r, sc, ctx) {
    if (!Number.isFinite(sc.truth) || Math.abs((Math.abs(sc.truth * 100) % 1) - 0.5) < 0.15) return null;
    const t = roundTo(sc.truth, 2);
    const sg = Math.sign(t);
    const okV = (v) => Math.sign(v) === sg && Math.abs(v) >= 0.05;
    const named = [];
    for (const c of sc.cands) {
      const v = roundTo(c.v, 2);
      if (okV(v) && Math.abs(v - t) >= 0.08 - 1e-9 && Math.abs(v - t) <= 0.45 + 1e-9 && named.every((n) => Math.abs(n.v - v) >= 0.08 - 1e-9)) named.push({ ...c, v, rank: named.length });
    }
    const slip = (v) => ({ v: roundTo(v, 2), trap: 'calcolo', filler: true });
    const minGap = (list) => { const s = list.map((o) => o.v).sort((a, b) => a - b); let m = Infinity; for (let k = 1; k < s.length; k++) m = Math.min(m, s[k] - s[k - 1]); return m; };
    const valid = (list, near) => list.every((o) => okV(o.v)) && new Set(list.map((o) => o.v)).size === list.length && minGap(list) >= 0.08 - 1e-9
      && (near ? list.every((o) => Math.abs(o.v - t) <= 0.5 + 1e-9) : list.every((o) => Math.abs(o.v - sc.truth) >= 2 * minGap(list) + 1e-9));
    // Riempie n posti da una parte con gradini 0,1·k ± 0,03 che restino distanti dagli altri.
    const fill = (list, side, n) => {
      const pool = r.shuffle([1, 2, 3, 4].flatMap((k) => [-3, -2, -1, 0, 1, 2, 3].map((dd) => k * 0.1 + dd / 100)));
      for (const off of pool) {
        if (n <= 0) break;
        const v = roundTo(t + side * off, 2);
        if (Math.abs(v - t) >= 0.08 - 1e-9 && list.every((o) => Math.abs(o.v - v) >= 0.08 - 1e-9)) { list.push(slip(v)); n--; }
      }
      return n === 0;
    };
    let chosen = null;
    const p = ctx.pos;
    for (let attempt = 0; attempt < 40 && !chosen; attempt++) {
      let list;
      if (!ctx.none) {
        const c = attempt < 30 && r.chance(0.85) ? named.find((n) => (n.v < t ? p > 0 : p < 3)) : null;
        if (!c) list = [0, 1, 2, 3].filter((j) => j !== p).map((j) => slip(t + (j - p) * 0.1));
        else {
          list = [c];
          if (!fill(list, -1, p - (c.v < t ? 1 : 0)) || !fill(list, 1, 3 - p - (c.v > t ? 1 : 0))) continue;
        }
        list.push({ v: t, key: true });
        list.sort((a, b) => a.v - b.v);
        if (valid(list, true) && list[p].key) chosen = list;
      } else {
        // E giusta: scala da una sola parte, a partire da due passi dal risultato; il distrattore con nome più
        // insidioso, se cade abbastanza lontano, fa da gradino della scala.
        const side = r.chance(0.5) ? 1 : -1;
        // primo gradino ad almeno 0,20 punti dal risultato vero (non da quello arrotondato)
        const d0 = Math.ceil((0.2 + Math.max(0, side * (sc.truth - t))) * 100 - 1e-6) / 100 + (attempt % 3) / 100;
        const c = r.chance(0.85) ? named.find((n) => (n.v - t) * side >= d0 - 1e-9) : null;
        if (c) {
          const off = Math.abs(c.v - t);
          const j = r.i(0, Math.min(3, Math.floor((off - d0 + 1e-9) / 0.1)));
          list = [0, 1, 2, 3].map((k) => (k === j ? c : slip(t + side * (off + (k - j) * 0.1))));
        } else list = [0, 1, 2, 3].map((k) => slip(t + side * (d0 + k * 0.1)));
        list.sort((a, b) => a.v - b.v);
        if (valid(list, false)) chosen = list;
      }
    }
    return chosen ? chosen.map((o) => ({ ...o, text: sc.fmt(o.v) })) : null;
  }

  // ── Opzioni a griglia per le stime (passo di 5 o 10 punti): la chiave è il valore della griglia vicino al
  // risultato (entro 0,15 passi); con E giusta ogni opzione dista almeno due passi. Un distrattore prende la
  // trappola di un errore con nome quando quell'errore porta vicino a lui (entro 0,3 passi).
  function gridItem(ctx, sc) {
    const t = sc.truth;
    if (!ctx.none ? Math.abs(t - sc.grid[ctx.pos]) > 0.15 * sc.step : sc.grid.some((v) => Math.abs(v - t) < 2 * sc.step - 1e-9)) return null;
    const opts = sc.grid.map((v, k) => ({ v, text: sc.fmt(v), key: !ctx.none && k === ctx.pos }));
    const used = new Set();
    sc.named.forEach((c, rank) => {
      let best = -1;
      opts.forEach((o, k) => { if (!o.key && !used.has(k) && Math.abs(o.v - c.v) <= 0.3 * sc.step && (best < 0 || Math.abs(o.v - c.v) < Math.abs(opts[best].v - c.v))) best = k; });
      if (best >= 0) { used.add(best); Object.assign(opts[best], { trap: c.trap, why: c.why, rank }); }
    });
    opts.forEach((o, k) => { if (!o.key && !used.has(k)) Object.assign(o, { trap: 'calcolo', filler: true }); });
    const display = ctx.none ? `${num(t, 1)}%` : sc.fmt(sc.grid[ctx.pos]);
    return { ...sc, opts, dec: 1, value: roundTo(t, 1), display, slips: SLIPS_GRID, params: { ...(sc.params || {}), step: sc.step },
      result: ctx.none ? null : `Il risultato è ${num(t, 1)}%, cioè circa ${display}: la risposta è ${'ABCD'[ctx.pos]}.` };
  }

  function valueItem(r, ctx, sc) {
    const opts = (sc.close ? closeOpts : spreadOpts)(r, sc, ctx);
    if (!opts) return null;
    const t = roundTo(sc.truth, sc.dec);
    return { ...sc, opts, value: t, display: sc.fmt(t) };
  }

  // ── Tabella «Ricerca e sviluppo» (modelli M1 e M2), con le colonne del campione ufficiale ──
  function rdData(r) {
    const [y0, y1] = r.pick([[2019, 2022], [2020, 2023], [2021, 2024], [2020, 2024]]);
    const d = { y0, y1, gdp: [], rd0: [], pub0: [], pat: [], pc: [] };
    for (let k = 0; k < 5; k++) {
      d.gdp.push(logU(r, 45000, 2200000)); // milioni di €, non mostrato: si ricava da spesa e quota del PIL
      d.rd0.push(roundTo(r.f(0.85, 3.6), 2));
      d.pub0.push(roundTo(r.f(18, 46), 1));
      d.pat.push(roundTo(r.f(35, 420), 1));
      d.pc.push(Math.round(r.f(14000, 62000)));
    }
    d.rd1 = d.rd0.map((v) => moved(r, v, 0.01, 0.09, 2));
    d.pub1 = d.pub0.map((v) => moved(r, v, 0.01, 0.07, 1));
    return d;
  }
  function rdTable(d) {
    d.spesa = d.gdp.map((g, k) => Math.round((g * d.rd0[k]) / 100));
    const Y0 = String(d.y0), Y1 = String(d.y1);
    return {
      title: 'Ricerca e sviluppo (R&S) in cinque Paesi',
      note: `Spesa in R&S in % del PIL e in milioni di €; quota pubblica = parte della spesa in R&S finanziata dallo Stato, in %; PIL pro capite in €. ${NOTE}`,
      groups: [{ label: 'Spesa in R&S (% del PIL)', span: 2 }, { label: 'Quota pubblica della spesa in R&S (%)', span: 2 }, { label: 'Brevetti per milione di abitanti', span: 1 }, { label: 'Spesa in R&S (milioni di €)', span: 1 }, { label: 'PIL pro capite (€)', span: 1 }],
      head: ['Paese', Y0, Y1, Y0, Y1, Y0, Y0, Y0],
      rows: PAESI_M.map((n, k) => [n, num(d.rd0[k], 2), num(d.rd1[k], 2), num(d.pub0[k], 1), num(d.pub1[k], 1), num(d.pat[k], 1), num(d.spesa[k], 0), num(d.pc[k], 0)]),
    };
  }

  // M1 · grandezza non in tabella, poi rapporto fra due righe (L3: PIL o abitanti, con opzioni a rapporto; abitanti
  // o brevetti come valore). L2: varianti più corte (PIL o spesa pubblica di un Paese, rapporto fra spese pubbliche).
  MT.M1 = (r, ctx) => {
    const kinds = ctx.level === 3
      ? (ctx.none ? ['abitanti-valore', 'brevetti-valore'] : ['pil-rapporto', 'pil-rapporto', 'abitanti-rapporto', 'abitanti-valore', 'brevetti-valore'])
      : (ctx.none ? ['pil-valore', 'spesa-pubblica'] : ['pil-valore', 'spesa-pubblica', 'pubblica-rapporto']);
    const kind = r.pick(kinds);
    const d = rdData(r);
    const [x, y] = pairOf(r);
    const X = PAESI_M[x], Y = PAESI_M[y], y0 = d.y0, y1 = d.y1;
    const G = (k, rd = d.rd0[k]) => (d.spesa[k] / rd) * 100; // PIL in milioni di € dai dati mostrati
    const base = { kind, rows: [x, y] };

    if (kind === 'pil-rapporto' || kind === 'abitanti-rapporto' || kind === 'pubblica-rapporto') {
      const set = ratioSet(r);
      const key = set[ctx.pos];
      const rho = rval(key);
      if (kind === 'pil-rapporto') {
        // Confrontare le spese dà rho × (quota X ÷ quota Y): le quote del PIL portano quel calcolo su tau.
        const t = pickTau(r, set, key, (q) => q >= 0.2 && q <= 5);
        if (!t) return null;
        const lo = Math.max(0.75, 0.75 / t.q), hi = Math.min(3.9, 3.9 / t.q);
        if (lo >= hi) return null;
        d.rd0[y] = roundTo(r.f(lo, hi), 2);
        d.rd0[x] = roundTo(d.rd0[y] * t.q * (1 + r.f(-0.05, 0.05)), 2);
        d.rd1[x] = moved(r, d.rd0[x], 0.01, 0.09, 2); d.rd1[y] = moved(r, d.rd0[y], 0.01, 0.09, 2);
        d.gdp[y] = logU(r, 60000, 900000);
        d.gdp[x] = d.gdp[y] * rho * (1 + r.f(-0.012, 0.012));
        const table = rdTable(d);
        return ratioItem(ctx, {
          ...base, tag: 'rapporti', table, set, key, tau: t.o, R: G(x) / G(y), N: d.spesa[x] / d.spesa[y], tauTrap: 'rapporti',
          question: `Qual era approssimativamente, nel ${y0}, il rapporto tra il PIL del ${X} e quello del ${Y}?`,
          formula: 'PIL = spesa in R&S ÷ (spesa in R&S in % del PIL ÷ 100); poi rapporto fra i due PIL.',
          steps: [`PIL del ${X} = ${num(d.spesa[x])} ÷ ${frac4(d.rd0[x])} = ${num(G(x))} milioni di €`, `PIL del ${Y} = ${num(d.spesa[y])} ÷ ${frac4(d.rd0[y])} = ${num(G(y))} milioni di €`, `${num(G(x))} ÷ ${num(G(y))} = ${num(G(x) / G(y), 2)}`],
          whyTau: 'è il rapporto fra le spese in R&S: ogni spesa va prima divisa per la sua quota del PIL, perché i due Paesi investono in R&S quote diverse del PIL',
          whyInv: `inverte il rapporto: è il PIL del ${Y} rispetto a quello del ${X}`,
          whyBoth: 'confronta le spese in R&S invece dei PIL e in più inverte il rapporto',
        });
      }
      if (kind === 'abitanti-rapporto') {
        // Fermarsi ai PIL dà rho × (PIL pro capite X ÷ Y): i PIL pro capite portano quel calcolo su tau.
        const t = pickTau(r, set, key, (q) => q >= 0.22 && q <= 4.5);
        if (!t) return null;
        const lo = Math.max(13000, 13000 / t.q), hi = Math.min(64000, 64000 / t.q);
        if (lo >= hi) return null;
        d.pc[y] = Math.round(r.f(lo, hi));
        d.pc[x] = Math.round(d.pc[y] * t.q * (1 + r.f(-0.04, 0.04)));
        const pyLo = Math.max(1.5, 0.8 / rho), pyHi = Math.min(60, 110 / rho);
        if (pyLo >= pyHi) return null;
        const py = logU(r, pyLo, pyHi); // abitanti in milioni
        d.gdp[y] = py * d.pc[y];
        d.gdp[x] = py * rho * (1 + r.f(-0.012, 0.012)) * d.pc[x];
        const table = rdTable(d);
        if (Math.abs(Math.log(d.spesa[x] / d.spesa[y] / rho)) < Math.log(1.35)) return null; // nemmeno le spese portano sulla chiave
        const P = (k) => G(k) / d.pc[k];
        return ratioItem(ctx, {
          ...base, tag: 'rapporti', table, set, key, tau: t.o, R: P(x) / P(y), N: G(x) / G(y), tauTrap: 'rapporti',
          question: `Qual era approssimativamente, nel ${y0}, il rapporto tra il numero di abitanti del ${X} e quello del ${Y}?`,
          formula: 'PIL = spesa in R&S ÷ (spesa in R&S in % del PIL ÷ 100); abitanti = PIL ÷ PIL pro capite; poi rapporto fra gli abitanti.',
          steps: [`abitanti del ${X} = ${num(d.spesa[x])} ÷ ${frac4(d.rd0[x])} ÷ ${num(d.pc[x])} = ${num(G(x))} milioni di € ÷ ${num(d.pc[x])} € = ${num(P(x), 2)} milioni`, `abitanti del ${Y} = ${num(d.spesa[y])} ÷ ${frac4(d.rd0[y])} ÷ ${num(d.pc[y])} = ${num(G(y))} milioni di € ÷ ${num(d.pc[y])} € = ${num(P(y), 2)} milioni`, `${num(P(x), 2)} ÷ ${num(P(y), 2)} = ${num(P(x) / P(y), 2)}`],
          whyTau: 'è il rapporto fra i PIL: per passare agli abitanti bisogna ancora dividere ciascun PIL per il suo PIL pro capite',
          whyInv: `inverte il rapporto: sono gli abitanti del ${Y} rispetto a quelli del ${X}`,
          whyBoth: 'si ferma ai PIL e in più inverte il rapporto',
        });
      }
      // pubblica-rapporto (L2). Ignorare la quota pubblica dà il rapporto fra le spese totali, portato su tau.
      const t = pickTau(r, set, key, (q) => q >= 0.3 && q <= 3.3);
      if (!t) return null;
      const qp = 1 / t.q; // quota pubblica X ÷ quota pubblica Y
      const lo = Math.max(15, 15 / qp), hi = Math.min(52, 52 / qp);
      if (lo >= hi) return null;
      d.pub0[y] = roundTo(r.f(lo, hi), 1);
      d.pub0[x] = roundTo(d.pub0[y] * qp * (1 + r.f(-0.04, 0.04)), 1);
      d.pub1[x] = moved(r, d.pub0[x], 0.01, 0.07, 1); d.pub1[y] = moved(r, d.pub0[y], 0.01, 0.07, 1);
      const sy = logU(r, 400, 40000);
      d.gdp[y] = (sy * 100) / d.rd0[y];
      d.gdp[x] = (sy * rval(t.o) * (1 + r.f(-0.012, 0.012)) * 100) / d.rd0[x];
      const table = rdTable(d);
      const Pb = (k) => (d.spesa[k] * d.pub0[k]) / 100;
      return ratioItem(ctx, {
        ...base, tag: 'rapporti', table, set, key, tau: t.o, R: Pb(x) / Pb(y), N: d.spesa[x] / d.spesa[y], tauTrap: 'percentuali',
        question: `Qual era approssimativamente, nel ${y0}, il rapporto tra la spesa pubblica in R&S del ${X} e quella del ${Y}?`,
        formula: 'spesa pubblica in R&S = spesa in R&S × quota pubblica ÷ 100; poi rapporto fra le due spese pubbliche.',
        steps: [`${X}: ${num(d.spesa[x])} × ${num(d.pub0[x] / 100, 3)} = ${num(Pb(x), 1)} milioni di €`, `${Y}: ${num(d.spesa[y])} × ${num(d.pub0[y] / 100, 3)} = ${num(Pb(y), 1)} milioni di €`, `${num(Pb(x), 1)} ÷ ${num(Pb(y), 1)} = ${num(Pb(x) / Pb(y), 2)}`],
        whyTau: 'è il rapporto fra le spese totali in R&S: manca la quota pubblica, diversa nei due Paesi',
        whyInv: `inverte il rapporto: è la spesa pubblica del ${Y} rispetto a quella del ${X}`,
        whyBoth: 'confronta le spese totali e in più inverte il rapporto',
      });
    }

    const table = rdTable(d);
    if (kind === 'pil-valore') {
      const T = G(x) / 1000;
      return valueItem(r, ctx, {
        ...base, tag: 'unita-misura', table, dec: 0, truth: T, fmt: (v) => `${num(v, 0)} miliardi di €`, slips: SLIPS,
        question: `Qual era nel ${y0} il PIL del ${X}? (in miliardi di €, arrotondamento all'unità)`,
        formula: 'PIL = spesa in R&S ÷ (spesa in R&S in % del PIL ÷ 100).',
        steps: [`${num(d.spesa[x])} ÷ ${frac4(d.rd0[x])} = ${num(G(x))} milioni di €`, `${num(G(x))} milioni = ${num(T, 0)} miliardi di €`],
        cands: [
          { v: G(x, d.rd1[x]) / 1000, trap: 'lettura-dati', why: `usa la quota del PIL del ${y1} invece di quella del ${y0}` },
          { v: G(y) / 1000, trap: 'lettura-dati', why: `è il PIL del ${Y} (riga sbagliata)` },
          { v: T * 10, far: true, trap: 'unita-misura', why: 'divide la spesa per la quota senza convertire: la percentuale va divisa per 100 e i milioni portati a miliardi (risultato 10 volte troppo grande)' },
        ],
      });
    }
    if (kind === 'spesa-pubblica') {
      const T = (d.spesa[x] * d.pub0[x]) / 100;
      return valueItem(r, ctx, {
        ...base, tag: 'percentuali', table, dec: 0, truth: T, fmt: (v) => `${num(v, 0)} milioni di €`, slips: SLIPS,
        question: `A quanto ammontava nel ${y0} la spesa pubblica in R&S del ${X}? (in milioni di €, arrotondamento all'unità)`,
        formula: 'spesa pubblica in R&S = spesa in R&S × quota pubblica ÷ 100.',
        steps: [`${num(d.spesa[x])} × ${num(d.pub0[x] / 100, 3)} = ${num(T, 1)} milioni di €`],
        cands: [
          { v: (d.spesa[x] * d.pub1[x]) / 100, trap: 'lettura-dati', why: `usa la quota pubblica del ${y1} invece di quella del ${y0}` },
          { v: (d.spesa[x] * (100 - d.pub0[x])) / 100, trap: 'percentuali', why: 'è la parte non finanziata dallo Stato (100% − quota pubblica)' },
          { v: (d.spesa[y] * d.pub0[y]) / 100, trap: 'lettura-dati', why: `è la spesa pubblica del ${Y} (riga sbagliata)` },
          { v: T * 10, far: true, trap: 'unita-misura', why: 'divide la quota per 10 invece che per 100 (risultato 10 volte troppo grande)' },
          { v: T / 10, far: true, trap: 'unita-misura', why: 'divide la quota per 1.000 invece che per 100 (risultato 10 volte troppo piccolo)' },
        ],
      });
    }
    const P = (k, rd) => G(k, rd) / d.pc[k]; // abitanti in milioni: milioni di € ÷ € per abitante
    if (kind === 'abitanti-valore') {
      const T = P(x);
      if (T < 1.5) return null;
      return valueItem(r, ctx, {
        ...base, tag: 'unita-misura', table, dec: 1, truth: T, fmt: (v) => `${num(v, 1)} milioni`, slips: SLIPS,
        question: `Quanti abitanti aveva il ${X} nel ${y0}? (in milioni, arrotondamento a una cifra decimale)`,
        formula: 'PIL = spesa in R&S ÷ (spesa in R&S in % del PIL ÷ 100); abitanti = PIL ÷ PIL pro capite (milioni di € ÷ € = milioni di abitanti).',
        steps: [`PIL = ${num(d.spesa[x])} ÷ ${frac4(d.rd0[x])} = ${num(G(x))} milioni di €`, `abitanti = ${num(G(x))} ÷ ${num(d.pc[x])} = ${num(T, 2)} milioni`],
        cands: [
          { v: P(x, d.rd1[x]), trap: 'lettura-dati', why: `usa la quota del PIL del ${y1} invece di quella del ${y0}` },
          { v: P(y), trap: 'lettura-dati', why: `sono gli abitanti del ${Y} (riga sbagliata)` },
          { v: (d.spesa[x] / d.pub0[x]) * 100 / d.pc[x], trap: 'lettura-dati', why: 'divide la spesa per la quota pubblica invece che per la quota del PIL' },
        ],
      });
    }
    // brevetti-valore (L3)
    const T = d.pat[x] * P(x);
    if (T < 40) return null;
    return valueItem(r, ctx, {
      ...base, tag: 'unita-misura', table, dec: 0, truth: T, fmt: (v) => `${num(v, 0)} brevetti`, slips: SLIPS,
      question: `Quanti brevetti ha registrato il ${X} nel ${y0}? (arrotondamento all'unità)`,
      formula: 'abitanti (in milioni) = PIL ÷ PIL pro capite, con PIL = spesa in R&S ÷ (spesa in R&S in % del PIL ÷ 100); brevetti = brevetti per milione di abitanti × abitanti in milioni.',
      steps: [`PIL = ${num(d.spesa[x])} ÷ ${frac4(d.rd0[x])} = ${num(G(x))} milioni di €`, `abitanti = ${num(G(x))} ÷ ${num(d.pc[x])} = ${num(P(x), 3)} milioni`, `brevetti = ${num(d.pat[x], 1)} × ${num(P(x), 3)} = ${num(T, 0)}`],
      cands: [
        { v: d.pat[x] * P(x, d.rd1[x]), trap: 'lettura-dati', why: `usa la quota del PIL del ${y1} invece di quella del ${y0}` },
        { v: d.pat[x] * P(y), trap: 'lettura-dati', why: `moltiplica per gli abitanti del ${Y} (riga sbagliata)` },
        { v: d.pat[y] * P(x), trap: 'lettura-dati', why: `usa i brevetti per milione del ${Y} (riga sbagliata)` },
      ],
    });
  };

  // M2 · ipotesi nel testo: variazione di un prodotto di tre fattori (PIL × quota del PIL in R&S × quota pubblica)
  // fra i due anni della tabella, con opzioni molto vicine: serve il calcolo esatto.
  MT.M2 = (r, ctx) => {
    const d = rdData(r);
    const x = r.i(0, 4), X = PAESI_M[x];
    // Variazioni più ampie per il Paese della domanda: i termini misti del prodotto pesano qualche decimo di punto.
    d.rd1[x] = moved(r, d.rd0[x], 0.02, 0.07, 2);
    d.pub1[x] = moved(r, d.pub0[x], 0.015, 0.06, 1);
    const table = rdTable(d);
    const down = r.chance(0.25);
    const g = r.pick([1, 1.5, 2, 2.5, 3, 3.5, 4]);
    const sg = down ? -g : g;
    const fG = 1 + sg / 100, fR = d.rd1[x] / d.rd0[x], fP = d.pub1[x] / d.pub0[x];
    const F = fG * fR * fP;
    const T = (F - 1) * 100;
    if (Math.abs(T) < 0.6) return null;
    return valueItem(r, ctx, {
      kind: 'ipotesi-pil', rows: [x], params: { g: sg }, close: true, tag: 'percentuali', table, dec: 2, truth: T, fmt: (v) => `${num(v, 2)}%`, slips: SLIPS_CLOSE,
      question: `Se il PIL del ${X} ${down ? 'diminuisse' : 'crescesse'} ${delN(num(g, g % 1 ? 1 : 0))}% tra il ${d.y0} e il ${d.y1}, di quanto varierebbe, in percentuale, la spesa pubblica in R&S del ${X}? (arrotondamento a due cifre decimali)`,
      formula: 'spesa pubblica in R&S = PIL × (spesa in R&S in % del PIL) × (quota pubblica); la variazione è (fattore del PIL × fattore della quota del PIL × fattore della quota pubblica − 1) × 100.',
      steps: [`fattore del PIL = ${num(fG, 3)}`, `quota del PIL: ${num(d.rd1[x], 2)} ÷ ${num(d.rd0[x], 2)} = ${num(fR, 5)}`, `quota pubblica: ${num(d.pub1[x], 1)} ÷ ${num(d.pub0[x], 1)} = ${num(fP, 5)}`, `${num(fG, 3)} × ${num(fR, 5)} × ${num(fP, 5)} = ${num(F, 5)}`, `(${num(F, 5)} − 1) × 100 = ${num(T, 2)}%`],
      cands: [
        { v: sg + (fR - 1) * 100 + (fP - 1) * 100, trap: 'percentuali', why: 'somma le tre variazioni percentuali invece di moltiplicare i tre fattori: è un\'approssimazione, e con opzioni così vicine non basta' },
        { v: (1 - 1 / F) * 100, trap: 'percentuali', why: 'calcola la variazione sul valore finale invece che su quello di partenza (base sbagliata)' },
        { v: (fG * fR - 1) * 100, trap: 'lettura-dati', why: 'trascura la variazione della quota pubblica' },
        { v: (fG * fP - 1) * 100, trap: 'lettura-dati', why: 'trascura la variazione della quota del PIL spesa in R&S' },
        { v: (fR * fP - 1) * 100, trap: 'lettura-dati', why: 'dimentica la variazione del PIL indicata nella domanda' },
      ],
    });
  };

  // M3 · righe che non sono Paesi (macroregioni): somma di superfici, densità, differenza di popolazione urbana,
  // abitanti medi per Paese. Superficie in km² (come nel campione) o in milioni di km².
  const MACRO = ['Centro', 'Est', 'Nord', 'Ovest', 'Sud'];
  MT.M3 = (r, ctx) => {
    const inMil = r.chance(0.4);
    const sup = MACRO.map(() => roundTo(r.f(2.2, 44), 3)); // milioni di km²
    const pop = sup.map((s) => roundTo(s * r.f(9, 140), 1)); // milioni di abitanti
    const urb = MACRO.map(() => r.i(32, 86));
    const np = MACRO.map(() => r.i(6, 54));
    const supTxt = (k) => (inMil ? num(sup[k], 3) : num(sup[k] * 1e6, 0));
    const table = {
      title: 'Cinque macroregioni: territorio e popolazione',
      note: `Superficie in ${inMil ? 'milioni di km²' : 'km²'}; popolazione in milioni di abitanti; popolazione urbana in % della popolazione. ${NOTE}`,
      head: ['Macroregione', inMil ? 'Superficie (milioni di km²)' : 'Superficie (km²)', 'Popolazione (milioni)', 'Popolazione urbana (%)', 'Numero di Paesi'],
      rows: MACRO.map((n, k) => [n, supTxt(k), num(pop[k], 1), num(urb[k], 0), num(np[k], 0)]),
    };
    const kind = r.pick(['somma', 'densita', 'urbana', 'media-paese']);
    const base = { kind, table, params: { inMil }, slips: SLIPS };
    if (kind === 'somma') {
      const [x, y] = pairOf(r), z = thirdOf(r, x, y);
      const dec = inMil ? 3 : 0, k = inMil ? 1 : 1e6;
      const S = (a, b) => roundTo((sup[a] + sup[b]) * k, dec);
      const T = S(x, y);
      const unitTxt = inMil ? 'milioni di km²' : 'km²';
      const carry = 10 ** (Math.floor(Math.log10(T)) - 1);
      return valueItem(r, ctx, {
        ...base, rows: [x, y], tag: 'lettura-dati', dec, truth: T, gapRel: 0.02, quantum: inMil ? 0.001 : 1000, fmt: (v) => `${num(v, dec)} ${unitTxt}`,
        question: `Qual è la superficie complessiva delle macroregioni ${MACRO[x]} e ${MACRO[y]}? (in ${unitTxt})`,
        formula: 'superficie complessiva = somma delle due superfici.',
        steps: [`${supTxt(x)} + ${supTxt(y)} = ${num(T, dec)} ${unitTxt}`],
        cands: [
          { v: S(x, z), trap: 'lettura-dati', why: `somma la macroregione ${MACRO[z]} invece della ${MACRO[y]} (riga sbagliata)` },
          { v: S(z, y), trap: 'lettura-dati', why: `somma la macroregione ${MACRO[z]} invece della ${MACRO[x]} (riga sbagliata)` },
          { v: T + carry, trap: 'calcolo', why: 'sbaglia un riporto nella somma' },
          { v: T - carry, trap: 'calcolo', why: 'sbaglia un riporto nella somma' },
        ],
      });
    }
    if (kind === 'densita') {
      const x = r.i(0, 4), z = (x + r.i(1, 4)) % 5;
      const D = (k) => pop[k] / sup[k]; // milioni di abitanti ÷ milioni di km² = abitanti per km²
      const T = D(x);
      return valueItem(r, ctx, {
        ...base, rows: [x], tag: 'rapporti', dec: 1, truth: T, fmt: (v) => `${num(v, 1)} abitanti per km²`,
        question: `Qual è la densità di popolazione della macroregione ${MACRO[x]}? (in abitanti per km², arrotondamento a una cifra decimale)`,
        formula: 'densità = popolazione ÷ superficie (in abitanti e km², oppure in milioni di abitanti e milioni di km²).',
        steps: [inMil ? `${num(pop[x], 1)} milioni ÷ ${num(sup[x], 3)} milioni di km² = ${num(T, 2)} abitanti per km²` : `${num(pop[x] * 1e6, 0)} abitanti ÷ ${supTxt(x)} km² = ${num(T, 2)} abitanti per km²`],
        cands: [
          { v: (pop[x] * urb[x]) / 100 / sup[x], trap: 'percentuali', why: 'considera solo la popolazione urbana' },
          { v: D(z), trap: 'lettura-dati', why: `è la densità della macroregione ${MACRO[z]} (riga sbagliata)` },
          { v: pop[x] / np[x], trap: 'rapporti', why: 'divide la popolazione per il numero di Paesi invece che per la superficie' },
        ],
      });
    }
    if (kind === 'urbana') {
      let [x, y] = pairOf(r);
      const U = (k) => (pop[k] * urb[k]) / 100;
      if (U(x) < U(y)) [x, y] = [y, x];
      const z = thirdOf(r, x, y);
      const T = U(x) - U(y);
      if (T < 3) return null;
      return valueItem(r, ctx, {
        ...base, rows: [x, y], tag: 'percentuali', dec: 1, truth: T, fmt: (v) => `${num(v, 1)} milioni`,
        question: `Di quanti milioni di abitanti la popolazione urbana della macroregione ${MACRO[x]} supera quella della macroregione ${MACRO[y]}? (arrotondamento a una cifra decimale)`,
        formula: 'popolazione urbana = popolazione × quota urbana ÷ 100; poi differenza fra le due macroregioni.',
        steps: [`${MACRO[x]}: ${num(pop[x], 1)} × ${num(urb[x] / 100, 2)} = ${num(U(x), 3)} milioni`, `${MACRO[y]}: ${num(pop[y], 1)} × ${num(urb[y] / 100, 2)} = ${num(U(y), 3)} milioni`, `${num(U(x), 3)} − ${num(U(y), 3)} = ${num(T, 1)} milioni`],
        cands: [
          { v: pop[x] - pop[y], trap: 'lettura-dati', why: 'confronta la popolazione totale invece di quella urbana' },
          { v: ((urb[x] - urb[y]) / 100) * pop[x], trap: 'percentuali', why: `applica la differenza fra le due quote urbane alla sola popolazione della macroregione ${MACRO[x]}` },
          { v: (pop[x] * (100 - urb[x])) / 100 - (pop[y] * (100 - urb[y])) / 100, trap: 'percentuali', why: 'usa la quota non urbana (100% − quota urbana)' },
          { v: U(x) - U(z), trap: 'lettura-dati', why: `confronta con la macroregione ${MACRO[z]} (riga sbagliata)` },
        ],
      });
    }
    // media-paese
    const x = r.i(0, 4), z = (x + r.i(1, 4)) % 5;
    const T = pop[x] / np[x];
    if (T < 1.5) return null;
    return valueItem(r, ctx, {
      ...base, rows: [x], tag: 'media', dec: 1, truth: T, fmt: (v) => `${num(v, 1)} milioni`,
      question: `Quanti abitanti ha in media un Paese della macroregione ${MACRO[x]}? (in milioni, arrotondamento a una cifra decimale)`,
      formula: 'abitanti medi per Paese = popolazione della macroregione ÷ numero dei suoi Paesi.',
      steps: [`${num(pop[x], 1)} ÷ ${np[x]} = ${num(T, 2)} milioni`],
      cands: [
        { v: sumOf(pop) / sumOf(np), trap: 'media', why: 'è la media di tutte e cinque le macroregioni insieme' },
        { v: pop[z] / np[z], trap: 'lettura-dati', why: `è la media della macroregione ${MACRO[z]} (riga sbagliata)` },
        { v: (pop[x] * urb[x]) / 100 / np[x], trap: 'percentuali', why: 'considera solo la popolazione urbana' },
      ],
    });
  };

  // M4 · media pesata inversa: dal tasso complessivo (tabella) e dal tasso di un gruppo (testo) si ricava il tasso
  // dell'altro gruppo, oppure dai tassi dei due gruppi si ricava il peso di un gruppo (in % o in migliaia).
  MT.M4 = (r, ctx) => {
    const kind = r.pick(['altro-tasso', 'altro-tasso', 'quota-gruppo', 'numero-gruppo']);
    const y = r.i(0, 1), Yr = 2023 + y, Yo = 2024 - y;
    const x = r.i(0, 4), X = PAESI_M[x], z = (x + r.i(1, 4)) % 5;
    if (kind === 'altro-tasso') {
      const pop = PAESI_M.map(() => { const a = logU(r, 1.2, 85); return [roundTo(a, 1), roundTo(a * r.f(0.995, 1.012), 1)]; });
      const s = [], U = [];
      let r65 = 0;
      for (let k = 0; k < 5; k++) {
        const s0 = r.f(15, 27), ds = r.f(0.1, 0.6);
        const ru = r.f(72, 95), r6 = r.f(25, 70), up = r.f(0.3, 2.2);
        s.push([roundTo(s0, 1), roundTo(s0 + ds, 1)]);
        const u0 = (s[k][0] * r6 + (100 - s[k][0]) * ru) / 100, u1 = (s[k][1] * (r6 + up * 2) + (100 - s[k][1]) * Math.min(98, ru + up)) / 100;
        U.push([roundTo(u0, 1), roundTo(u1, 1)]);
        if (k === x) r65 = Math.round(y ? r6 + up * 2 : r6);
      }
      const Ux = U[x][y], sx = s[x][y];
      const under = (u, sh) => (u - (sh * r65) / 100) / (1 - sh / 100);
      const T = under(Ux, sx);
      if (!(T > Ux && T < 99)) return null;
      return valueItem(r, ctx, {
        kind, rows: [x], params: { r65 }, tag: 'media', dec: 1, truth: T, hi: 100, fmt: (v) => `${num(v, 1)}%`, slips: SLIPS,
        table: {
          title: 'Popolazione e uso di Internet', note: `Popolazione in milioni di abitanti; persone con 65 anni e più e utenti abituali di Internet in % della popolazione. ${NOTE}`,
          groups: [{ label: 'Popolazione (milioni)', span: 2 }, { label: 'Persone con 65 anni e più (%)', span: 2 }, { label: 'Utenti abituali di Internet (%)', span: 2 }],
          head: ['Paese', '2023', '2024', '2023', '2024', '2023', '2024'],
          rows: PAESI_M.map((n, k) => [n, num(pop[k][0], 1), num(pop[k][1], 1), num(s[k][0], 1), num(s[k][1], 1), num(U[k][0], 1), num(U[k][1], 1)]),
        },
        question: `Nel ${Yr}, nel ${X} gli utenti abituali di Internet erano il ${r65}% delle persone con 65 anni e più. Quale percentuale delle persone sotto i 65 anni usava abitualmente Internet? (arrotondamento a una cifra decimale)`,
        formula: 'tasso totale = quota degli over 65 × tasso degli over 65 + quota degli under 65 × tasso degli under 65, quindi tasso degli under 65 = (tasso totale − quota degli over 65 × tasso degli over 65) ÷ quota degli under 65.',
        steps: [`(${num(Ux, 1)} − ${num(sx / 100, 3)} × ${r65}) ÷ ${num(1 - sx / 100, 3)} = ${num(Ux - (sx * r65) / 100, 3)} ÷ ${num(1 - sx / 100, 3)} = ${num(T, 2)}%`],
        cands: [
          { v: 2 * Ux - r65, trap: 'media', why: 'tratta i due gruppi come se pesassero uguale (media semplice): le persone sotto i 65 anni sono molte di più' },
          { v: Ux, trap: 'lettura-dati', why: 'è la quota su tutta la popolazione, non sulle persone sotto i 65 anni' },
          { v: Ux - (sx * r65) / 100, trap: 'rapporti', why: 'non divide per la quota delle persone sotto i 65 anni: è la loro parte sul totale della popolazione' },
          { v: under(U[x][1 - y], s[x][1 - y]), trap: 'lettura-dati', why: `usa i dati del ${Yo} (anno sbagliato)` },
          { v: under(U[z][y], s[z][y]), trap: 'lettura-dati', why: `usa i dati del ${PAESI_M[z]} (riga sbagliata)` },
        ],
      });
    }
    // quota-gruppo / numero-gruppo: disoccupazione dei giovani (15–24) e degli altri (25 anni e più)
    const fl = PAESI_M.map(() => { const a = logU(r, 450, 42000); return [Math.round(a), Math.round(a * r.f(0.99, 1.02))]; });
    const occ = PAESI_M.map(() => { const a = r.f(58, 80); return [roundTo(a, 1), roundTo(a + r.f(-1.5, 2), 1)]; });
    const rate = () => { const s = r.f(6.5, 16); return roundTo((s * r.f(13, 38) + (100 - s) * r.f(3, 10.5)) / 100, 1); };
    const U = PAESI_M.map(() => [rate(), rate()]);
    const sh = r.f(6.5, 16), ryT = r.i(14, 38), raT = r.i(3, 10);
    U[x][y] = roundTo((sh * ryT + (100 - sh) * raT) / 100, 1);
    const Ux = U[x][y];
    const share = (u) => ((u - raT) / (ryT - raT)) * 100;
    const S = share(Ux);
    if (!(S > 3 && S < 30)) return null;
    const num_ = kind === 'numero-gruppo';
    const k = num_ ? fl[x][y] / 100 : 1;
    const T = S * k;
    const lead = `Nel ${Yr}, nel ${X} il tasso di disoccupazione era ${delN(String(ryT))}% tra i giovani di 15–24 anni e ${delN(String(raT))}% tra le persone di 25 anni e più.`;
    return valueItem(r, ctx, {
      kind, rows: [x], params: { ryT, raT }, tag: 'media', dec: num_ ? 0 : 1, truth: T, hi: num_ ? fl[x][y] : 100,
      fmt: num_ ? (v) => `${num(v, 0)} migliaia` : (v) => `${num(v, 1)}%`, slips: SLIPS,
      table: {
        title: 'Mercato del lavoro', note: `Forza lavoro (occupati e disoccupati) in migliaia di persone; tassi in %. ${NOTE}`,
        groups: [{ label: 'Forza lavoro (migliaia)', span: 2 }, { label: 'Tasso di disoccupazione (%)', span: 2 }, { label: 'Tasso di occupazione (%)', span: 2 }],
        head: ['Paese', '2023', '2024', '2023', '2024', '2023', '2024'],
        rows: PAESI_M.map((n, j) => [n, num(fl[j][0], 0), num(fl[j][1], 0), num(U[j][0], 1), num(U[j][1], 1), num(occ[j][0], 1), num(occ[j][1], 1)]),
      },
      question: num_
        ? `${lead} Quanti giovani di 15–24 anni facevano parte della forza lavoro? (in migliaia, arrotondamento all'unità)`
        : `${lead} Quale percentuale della forza lavoro aveva tra 15 e 24 anni? (arrotondamento a una cifra decimale)`,
      formula: `tasso complessivo = quota dei giovani × tasso dei giovani + (1 − quota dei giovani) × tasso degli altri, quindi quota dei giovani = (tasso complessivo − tasso degli altri) ÷ (tasso dei giovani − tasso degli altri)${num_ ? '; giovani = quota × forza lavoro' : ''}.`,
      steps: [`(${num(Ux, 1)} − ${raT}) ÷ (${ryT} − ${raT}) = ${num(Ux - raT, 1)} ÷ ${ryT - raT} = ${num(S / 100, 4)}, cioè ${num(S, 2)}%`, ...(num_ ? [`${num(S / 100, 4)} × ${num(fl[x][y], 0)} = ${num(T, 1)} migliaia`] : [])],
      cands: [
        { v: ((Ux - raT) / ryT) * 100 * k, trap: 'media', why: 'divide per il tasso dei giovani invece che per la differenza fra i due tassi' },
        { v: (Ux / ryT) * 100 * k, trap: 'rapporti', why: 'divide il tasso complessivo per quello dei giovani, come se tutti i disoccupati fossero giovani' },
        { v: share(U[x][1 - y]) * k, trap: 'lettura-dati', why: `usa il tasso di disoccupazione del ${Yo} (anno sbagliato)` },
        { v: share(U[z][y]) * k, trap: 'lettura-dati', why: `usa il tasso di disoccupazione del ${PAESI_M[z]} (riga sbagliata)` },
        ...(num_ ? [{ v: S * (fl[x][1 - y] / 100), trap: 'lettura-dati', why: `usa la forza lavoro del ${Yo} (anno sbagliato)` }] : []),
      ],
    });
  };

  // M5 · «approssimativamente»: rapporto (opzioni a rapporto) o quota sul totale (griglia di 5 o 10 punti), con
  // numeri lunghi e opzioni lontane: basta una stima con due cifre significative.
  MT.M5 = (r, ctx) => {
    const kind = ctx.none ? 'quota' : r.pick(['rapporto', 'rapporto-somma', 'quota']);
    const p24 = [], pc = [];
    for (let k = 0; k < 5; k++) { p24.push(logU(r, 900, 62000)); pc.push(r.f(9000, 70000)); } // migliaia di abitanti; € per abitante
    const [x, y] = pairOf(r), z = thirdOf(r, x, y);
    const X = PAESI_M[x], Y = PAESI_M[y], Z = PAESI_M[z];
    let set = null, key = null, tau = null;
    if (kind !== 'quota') {
      set = ratioSet(r); key = set[ctx.pos];
      // Confrontare le popolazioni (colonna sbagliata) dà tau: i PIL pro capite fanno la differenza.
      tau = pickTau(r, set, key, (q) => q >= 0.25 && q <= 4);
      if (!tau) return null;
      const rho = rval(key), tv = rval(tau.o);
      if (kind === 'rapporto') {
        // PIL pro capite X ÷ Y = rho ÷ tau = 1 ÷ q: entrambi fra 9.000 e 72.000 €
        const lo = Math.max(9000, 9000 * tau.q), hi = Math.min(72000, 72000 * tau.q);
        const plo = Math.max(900, 900 / tv), phi = Math.min(62000, 62000 / tv);
        if (lo >= hi || plo >= phi) return null;
        p24[y] = logU(r, plo, phi);
        p24[x] = p24[y] * tv * (1 + r.f(-0.03, 0.03));
        pc[y] = r.f(lo, hi);
        pc[x] = ((pc[y] * rho * p24[y]) / p24[x]) * (1 + r.f(-0.012, 0.012));
      } else {
        // (PIL X + PIL Z) ÷ PIL Y = rho; (abitanti X + Z) ÷ abitanti Y ≈ tau
        p24[y] = ((p24[x] + p24[z]) / tv) * (1 + r.f(-0.03, 0.03));
        pc[y] = ((p24[x] * pc[x] + p24[z] * pc[z]) / rho / p24[y]) * (1 + r.f(-0.012, 0.012));
      }
      if (pc.some((v) => v < 8000 || v > 80000) || p24.some((v) => v < 250 || v > 90000)) return null;
    }
    const pop = p24.map((v) => [Math.round(v * r.f(0.93, 1.05)), Math.round(v)]);
    const gdp = p24.map((v, k) => { const g24 = Math.round((pop[k][1] * pc[k]) / 1000); return [Math.round(g24 * r.f(0.72, 0.95)), g24]; }); // milioni di €
    const area = p24.map((v) => Math.round((v * 1000) / r.f(28, 260)));
    const table = {
      title: 'Popolazione, PIL e superficie', note: `Popolazione in migliaia di abitanti; PIL in milioni di €; superficie in km². ${NOTE}`,
      groups: [{ label: 'Popolazione (migliaia)', span: 2 }, { label: 'PIL (milioni di €)', span: 2 }, { label: 'Superficie (km²)', span: 1 }],
      head: ['Paese', '2014', '2024', '2014', '2024', '2024'],
      rows: PAESI_M.map((n, k) => [n, num(pop[k][0], 0), num(pop[k][1], 0), num(gdp[k][0], 0), num(gdp[k][1], 0), num(area[k], 0)]),
    };
    const est = (v) => num(sig2(v), 0);
    if (kind === 'rapporto' || kind === 'rapporto-somma') {
      const somma = kind === 'rapporto-somma';
      const gx = somma ? gdp[x][1] + gdp[z][1] : gdp[x][1], gy = gdp[y][1];
      const px = somma ? pop[x][1] + pop[z][1] : pop[x][1], py = pop[y][1];
      const R = gx / gy;
      if (Math.abs(Math.log(sig2(gx) / sig2(gy) / rval(key))) > Math.log(1.25)) return null; // la stima porta sulla chiave
      return ratioItem(ctx, {
        kind, rows: somma ? [x, z, y] : [x, y], tag: 'rapporti', table, set, key, tau: tau.o, R, N: px / py, tauTrap: 'lettura-dati',
        question: somma
          ? `Approssimativamente, qual era nel 2024 il rapporto tra il PIL complessivo del ${X} e del ${Z} e il PIL del ${Y}?`
          : `Approssimativamente, qual era nel 2024 il rapporto tra il PIL del ${X} e quello del ${Y}?`,
        formula: `rapporto = ${somma ? `(PIL del ${X} + PIL del ${Z})` : `PIL del ${X}`} ÷ PIL del ${Y}; con opzioni così distanti basta una stima con due cifre significative.`,
        steps: [`stima: ${est(gx)} ÷ ${est(gy)} ≈ ${num(sig2(gx) / sig2(gy), 2)}`, `calcolo esatto: ${somma ? `(${num(gdp[x][1])} + ${num(gdp[z][1])})` : num(gx)} ÷ ${num(gy)} = ${num(R, 2)}`],
        whyTau: 'confronta le popolazioni invece dei PIL (colonna sbagliata)',
        whyInv: 'inverte il rapporto',
        whyBoth: 'confronta le popolazioni e in più inverte il rapporto',
      });
    }
    // quota della popolazione dei cinque Paesi, griglia di 5 o 10 punti
    const step = r.pick([5, 10]);
    let grid;
    if (!ctx.none) {
      const target = step * (ctx.pos + 1 + r.i(0, 2)) + r.f(-0.12, 0.12) * step;
      if (target > 62) return null;
      const others = sumOf(pop.map((v, k) => (k === x ? 0 : v[1])));
      pop[x][1] = Math.round((target / (100 - target)) * others);
      if (pop[x][1] < 250) return null;
      pop[x][0] = Math.round(pop[x][1] * r.f(0.93, 1.05));
      gdp[x][1] = Math.round((pop[x][1] * pc[x]) / 1000); gdp[x][0] = Math.round(gdp[x][1] * r.f(0.72, 0.95));
      area[x] = Math.round((pop[x][1] * 1000) / r.f(28, 260));
      table.rows[x] = [X, num(pop[x][0], 0), num(pop[x][1], 0), num(gdp[x][0], 0), num(gdp[x][1], 0), num(area[x], 0)];
    }
    const tot = sumOf(pop.map((v) => v[1]));
    const T = (pop[x][1] / tot) * 100;
    if (!ctx.none) grid = [0, 1, 2, 3].map((j) => Math.round(T / step) * step + (j - ctx.pos) * step);
    else {
      const up = T + 2 * step + 3 * step <= 95 && (r.chance(0.5) || (T - 2 * step) - 3 * step < step);
      const first = up ? Math.ceil((T + 2 * step) / step) * step : Math.floor((T - 2 * step) / step) * step - 3 * step;
      grid = [0, 1, 2, 3].map((j) => first + j * step);
    }
    if (grid[0] < step || grid[3] > 95) return null;
    const shareOf = (a, k) => (a[k] / sumOf(a)) * 100;
    return gridItem(ctx, {
      kind, rows: [x], tag: 'rapporti', table, truth: T, step, grid, fmt: (v) => `${num(v, 0)}%`,
      question: `Approssimativamente, quale percentuale della popolazione complessiva dei cinque Paesi viveva nel ${X} nel 2024?`,
      formula: 'quota = popolazione del Paese ÷ popolazione dei cinque Paesi × 100; con opzioni distanti fra loro basta una stima.',
      steps: [`totale 2024 = ${num(tot)} migliaia`, `stima: ${est(pop[x][1])} ÷ ${est(tot)} ≈ ${num((sig2(pop[x][1]) / sig2(tot)) * 100, 0)}%`, `calcolo esatto: ${num(pop[x][1])} ÷ ${num(tot)} × 100 = ${num(T, 1)}%`],
      named: [
        { v: (pop[x][1] / (tot - pop[x][1])) * 100, trap: 'rapporti', why: 'divide per la popolazione degli altri quattro Paesi invece che per il totale' },
        { v: shareOf(gdp.map((v) => v[1]), x), trap: 'lettura-dati', why: 'è la quota del PIL, non della popolazione (colonna sbagliata)' },
        { v: shareOf(pop.map((v) => v[0]), x), trap: 'lettura-dati', why: 'è la quota del 2014 (anno sbagliato)' },
      ],
    });
  };

  // Assemblaggio comune: lettere, chiave, E, spiegazione (formula, numeri, risultato, trappola principale, altre).
  function finishM(sc, ctx) {
    const L = ['A', 'B', 'C', 'D'];
    const opts = sc.opts;
    if (!opts || opts.length !== 4) return null;
    for (let k = 1; k < 4; k++) if (!(opts[k].v > opts[k - 1].v)) return null;
    const keyIdx = opts.findIndex((o) => o.key);
    if (ctx.none ? keyIdx !== -1 : keyIdx !== ctx.pos) return null;
    const key = ctx.none ? 'E' : L[keyIdx];
    const options = opts.map((o, k) => ({ letter: L[k], text: o.text, trap: o.key ? null : o.trap }));
    options.push({ letter: 'E', text: 'Nessuna di queste risposte', trap: ctx.none ? null : sc.tag });
    if (new Set(options.map((o) => o.text)).size !== 5) return null;
    const wrong = opts.map((o, k) => ({ ...o, letter: L[k] })).filter((o) => !o.key);
    const named = wrong.filter((o) => !o.filler).sort((a, b) => a.rank - b.rank);
    const slips = wrong.filter((o) => o.filler);
    const and = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} e ${xs[xs.length - 1]}` : xs[0]);
    const parts = [`Formula: ${sc.formula}`, `${sc.steps.join('; ')}.`,
      ctx.none ? `Il risultato è ${sc.display}, che non compare tra A e D: la risposta è E.` : (sc.result || `Il risultato è ${sc.display}: la risposta è ${key}.`)];
    if (named.length) parts.push(`Trappola principale: ${named[0].letter} (${named[0].text}) ${named[0].why}.`);
    for (const o of named.slice(1)) parts.push(`${o.letter} (${o.text}) ${o.why}.`);
    if (slips.length) parts.push(`${and(slips.map((o) => o.letter))} (${and(slips.map((o) => o.text))}) ${(sc.slips || SLIPS)[slips.length > 1 ? 1 : 0]}.`);
    return { options, key, explanation: parts.join(' ') };
  }

  const MULTI_LEVEL = { 2: ['M1', 'M3', 'M4', 'M5'], 3: ['M1', 'M2'] };
  // Livello 1 non esiste per questi modelli: si genera il livello 2 (e l'id lo dice).
  function makeMulti(seed, level = 2) {
    const lv = level === 3 ? 3 : 2;
    const rng = mulberry32((Math.imul(seed >>> 0, 3266489917) ^ (lv * 69069)) >>> 0);
    const r = R(rng);
    const ctx = { level: lv, none: rng() < 0.12, pos: Math.floor(rng() * 4) };
    const tpls = MULTI_LEVEL[lv];
    // Il modello si sceglie una volta (stessa frequenza per tutti); si cambia solo dopo molti tentativi a vuoto.
    const first = tpls[Math.floor(rng() * tpls.length)];
    for (let attempt = 0; attempt < 120; attempt++) {
      const name = attempt < 60 ? first : tpls[Math.floor(rng() * tpls.length)];
      const sc = MT[name](r, ctx);
      if (!sc) continue;
      const out = finishM(sc, ctx);
      if (!out) continue;
      return {
        bank: 'numerico', id: multiIdFor(seed, lv), level: lv, format: 'num5', difficulty: lv,
        tag: sc.tag, table: sc.table, question: sc.question,
        options: out.options, correct: [out.key], explanation: out.explanation,
        answer: { value: sc.value, display: sc.display },
        meta: { template: name, kind: sc.kind, dec: sc.dec, rows: sc.rows || [], params: sc.params || {} },
      };
    }
    throw new Error(`numerico (multi): nessun item valido per il seme ${seed}`);
  }
  const multiIdFor = (seed, level) => `M${level}-${seed}`;
  function parseMultiId(id) {
    const m = /^M([23])-(\d{1,10})$/.exec(String(id));
    return m ? { level: Number(m[1]), seed: Number(m[2]) } : null;
  }

  return { make, idFor, parseId, TEMPLATES: BY_LEVEL, CHART_TEMPLATES: CHART_LEVEL, MULTI_TEMPLATES: MULTI_LEVEL, num, chart: { make: makeChart, idFor: chartIdFor, parseId: parseChartId }, multi: { make: makeMulti, idFor: multiIdFor, parseId: parseMultiId } };
})();
