// Test del generatore del numerico (js/gen-numerico.js). Uso: node tests/gen_numerico.test.js
// Controlla su 3.000 item per livello: forma, una sola chiave, opzioni distinte e lontane fra loro,
// «Nessuna di queste» giusta circa una volta su cinque, lettere bilanciate, determinismo, spiegazione coerente,
// e un ricalcolo indipendente della risposta per i modelli che lo permettono dai dati grezzi.
'use strict';
global.window = global; global.App = {};
require('../js/gen-numerico.js');
const g = App.gen.numerico;

let fails = 0;
const bad = (msg) => { fails++; if (fails <= 20) console.log('FAIL -', msg); };
const parseNum = (txt) => { const m = /^(−?)([\d.]+)(?:,(\d+))?/.exec(txt.replace(/\s/g, '')); if (!m) return NaN; return (m[1] ? -1 : 1) * Number(`${m[2].replace(/\./g, '')}.${m[3] || '0'}`); };
const N = 3000;

// Ricalcolo indipendente dai dati grezzi (meta.raw) per i modelli a un passaggio o due.
const recompute = {
  T1: (m) => { const [i] = m.rows; const [a, b] = m.cols; return ((m.raw.A[i][b] - m.raw.A[i][a]) / m.raw.A[i][a]) * 100; },
  T2: (m) => { const [x, z] = m.rows; const [y] = m.cols; return m.raw.A[x][y] - m.raw.A[z][y]; },
  T3: (m) => { const [i] = m.rows; const [y] = m.cols; return (m.raw.A[i][y] / m.raw.A.reduce((s, r) => s + r[y], 0)) * 100; },
  T7: (m) => { const [y] = m.cols; const d = m.raw.dis.reduce((s, r) => s + r[y], 0); const o = m.raw.occ.reduce((s, r) => s + r[y], 0); return (d / (d + o)) * 100; },
  T8: (m) => { const [i] = m.rows; const [y] = m.cols; return m.raw.exp[i][y] / m.raw.fx[i][y]; },
  T9: (m) => { const [i] = m.rows; return (m.raw.gdp[i][1] * m.raw.sh[i][1] - m.raw.gdp[i][0] * m.raw.sh[i][0]) * 10; },
  T11: (m) => { const [i] = m.rows; return m.raw.v[i] / (1 + m.raw.p[i] / 100); },
};

// Ricalcolo dalla tabella MOSTRATA (testo delle celle), per tutti i dodici modelli: quello che si vede basta per la chiave.
const cellNum = (q, row, col) => parseNum(q.table.rows[row][col]);
const fromTable = {
  T1: (q, m) => { const [i] = m.rows; const [a, b] = m.cols; const va = cellNum(q, i, 1 + a), vb = cellNum(q, i, 1 + b); return ((vb - va) / va) * 100; },
  T2: (q, m) => { const [x, z] = m.rows; const [y] = m.cols; return cellNum(q, x, 1 + y) - cellNum(q, z, 1 + y); },
  T3: (q, m) => { const [i] = m.rows; const [y] = m.cols; let tot = 0; for (let k = 0; k < 5; k++) tot += cellNum(q, k, 1 + y); return (cellNum(q, i, 1 + y) / tot) * 100; },
  T4: (q, m) => { const [i] = m.rows; const [y] = m.cols; return (cellNum(q, i, 3 + y) * (m.params.big ? 1000 : 1)) / cellNum(q, i, 1 + y); },
  T5: (q, m) => { const [i] = m.rows; const d = cellNum(q, i, 4) - cellNum(q, i, 3); return m.params.points ? d : (d / cellNum(q, i, 3)) * 100; },
  T6: (q, m) => { const [i] = m.rows; const v1 = cellNum(q, i, 2), v2 = cellNum(q, i, 3); return v2 * (v2 / v1); },
  T7: (q, m) => { const [y] = m.cols; let d = 0, o = 0; for (let k = 0; k < 5; k++) { o += cellNum(q, k, 1 + y); d += cellNum(q, k, 3 + y); } return (d / (d + o)) * 100; },
  T8: (q, m) => { const [i] = m.rows; const [y] = m.cols; return cellNum(q, i, 1 + y) / cellNum(q, i, 5 + y); },
  T9: (q, m) => { const [i] = m.rows; return (cellNum(q, i, 2) * cellNum(q, i, 4) - cellNum(q, i, 1) * cellNum(q, i, 3)) * 10; },
  T10: (q, m) => { const [x, z] = m.rows; const vx = cellNum(q, x, 3), vz = cellNum(q, z, 3); return ((vz - vx) / vx) * 100; },
  T11: (q, m) => { const [i] = m.rows; return cellNum(q, i, 1) / (1 + cellNum(q, i, 2) / 100); },
  T12: (q, m) => { const [x, y] = m.rows; const gr = (k) => ((cellNum(q, k, 3) - cellNum(q, k, 2)) / cellNum(q, k, 2)) * 100; return gr(x) - gr(y); },
};
// I Paesi nominati dalla domanda (le righe usate dal calcolo).
const NAMED = { T1: 1, T2: 2, T3: 1, T4: 1, T5: 1, T6: 1, T8: 1, T9: 1, T10: 2, T11: 1, T12: 2 };

for (const lv of [1, 2, 3]) {
  const letters = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const templates = {};
  for (let s = 1; s <= N; s++) {
    const seed = s * 104729 + lv;
    let q;
    try { q = g.make(seed, lv); } catch (e) { bad(`L${lv} seme ${seed}: ${e.message}`); continue; }
    if (q.id !== g.idFor(seed, lv) || JSON.stringify(g.parseId(q.id)) !== JSON.stringify({ level: lv, seed })) bad(`id ${q.id}`);
    if (JSON.stringify(g.make(seed, lv)) !== JSON.stringify(q)) bad(`non deterministico ${q.id}`);
    if (q.options.length !== 5 || q.options.map((o) => o.letter).join('') !== 'ABCDE' || q.options[4].text !== 'Nessuna di queste risposte') bad(`opzioni ${q.id}`);
    const keys = q.options.filter((o) => o.trap === null).map((o) => o.letter);
    if (keys.length !== 1 || keys[0] !== q.correct[0]) bad(`chiave ${q.id}`);
    if (new Set(q.options.map((o) => o.text)).size !== 5) bad(`opzioni uguali ${q.id}`);
    const vals = q.options.slice(0, 4).map((o) => parseNum(o.text));
    const unit = 10 ** -q.meta.dec;
    const gap = Math.max(2 * unit, Math.abs(q.answer.value) * 0.015);
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) if (Math.abs(vals[a] - vals[b]) < gap - 1e-6) bad(`opzioni troppo vicine ${q.id}: ${q.options[a].text} / ${q.options[b].text}`);
    for (let a = 1; a < 4; a++) if (vals[a] <= vals[a - 1]) bad(`opzioni non in ordine crescente ${q.id}`);
    const truth = q.answer.value;
    if (q.correct[0] === 'E') { if (vals.some((v) => Math.abs(v - truth) < 2 * unit - 1e-9)) bad(`E giusta ma una cifra coincide ${q.id}`); }
    else if (Math.abs(vals['ABCD'.indexOf(q.correct[0])] - truth) > 1e-9) bad(`la chiave non vale la risposta ${q.id}`);
    if (!q.explanation.includes(q.answer.display)) bad(`spiegazione senza il risultato ${q.id}`);
    if (!/\(arrotondamento|\(in /.test(q.question)) bad(`domanda senza arrotondamento o unità ${q.id}`);
    const rc = recompute[q.meta.template];
    if (rc) { const v = Math.round(rc(q.meta) * 10 ** q.meta.dec) / 10 ** q.meta.dec; if (Math.abs(v - truth) > 1e-9) bad(`ricalcolo diverso ${q.id}: ${v} ≠ ${truth}`); }
    if (q.table.rows.length !== 5 || q.table.rows.some((r) => r.length !== q.table.head.length)) bad(`tabella ${q.id}`);
    const ft = fromTable[q.meta.template];
    if (!ft) bad(`modello senza ricalcolo dalla tabella ${q.meta.template}`);
    else {
      const v = ft(q, q.meta);
      if (!Number.isFinite(v)) bad(`ricalcolo dalla tabella non numerico ${q.id}`);
      else if (q.correct[0] === 'E') { if (vals.some((x) => Math.abs(x - v) <= unit + 1e-9)) bad(`tabella: E giusta ma un'opzione vale ${num(v)} ${q.id}`); }
      else {
        const k = 'ABCD'.indexOf(q.correct[0]);
        if (Math.abs(vals[k] - v) > unit + 1e-9) bad(`tabella: la chiave ${q.options[k].text} non torna con il ricalcolo ${v.toFixed(3)} ${q.id}`);
        const nearest = vals.reduce((best, x, idx) => (Math.abs(x - v) < Math.abs(vals[best] - v) ? idx : best), 0);
        if (nearest !== k) bad(`tabella: il ricalcolo ${v.toFixed(3)} è più vicino a ${q.options[nearest].text} che alla chiave ${q.id}`);
      }
      for (let n = 0; n < (NAMED[q.meta.template] || 0); n++) if (!q.question.includes(q.table.rows[q.meta.rows[n]][0])) bad(`la domanda non nomina ${q.table.rows[q.meta.rows[n]][0]} ${q.id}`);
    }
    letters[q.correct[0]]++;
    templates[q.meta.template] = (templates[q.meta.template] || 0) + 1;
  }
  const share = Object.fromEntries(Object.entries(letters).map(([k, v]) => [k, v / N]));
  for (const [k, v] of Object.entries(share)) if (v < 0.12 || v > 0.28) bad(`L${lv}: lettera ${k} al ${(v * 100).toFixed(1)}%`);
  if (share.E < 0.15 || share.E > 0.25) bad(`L${lv}: E giusta al ${(share.E * 100).toFixed(1)}%`);
  for (const t of g.TEMPLATES[lv]) if (!templates[t]) bad(`L${lv}: modello ${t} mai usato`);
  console.log(`L${lv}: ${N} item · lettere ${Object.entries(share).map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`).join(' ')} · modelli ${JSON.stringify(templates)}`);
}
// ══ Grafici (id G…): ricalcolo dai valori SCRITTI sul grafico e nel testo, come li vede il candidato ══
const lab = (c, k, i) => parseNum(String(c.series[k].labels[i]).replace('%', ''));
const totOf = (c, k) => parseNum(/totale ([\d.,]+)/.exec(c.series[k].totalLabel)[1]);
const fromChart = {
  G1: (q, m) => { const [i] = m.rows; const a = lab(q.chart, 0, i), b = lab(q.chart, 1, i); return ((b - a) / a) * 100; },
  G2: (q, m) => { const [i] = m.rows; return (lab(q.chart, i, 5) - lab(q.chart, i, 0)) / 5; },
  G3: (q, m) => { const [a, b] = m.rows; const t = totOf(q.chart, 0); return m.params.diffQ ? ((lab(q.chart, 0, a) - lab(q.chart, 0, b)) / 100) * t : (lab(q.chart, 0, a) / 100) * t; },
  G4: (q, m) => { const [a] = m.rows; const v23 = (lab(q.chart, 0, a) / 100) * totOf(q.chart, 0), v24 = (lab(q.chart, 1, a) / 100) * totOf(q.chart, 1); return ((v24 - v23) / v23) * 100; },
  G5: (q, m) => { const [i] = m.rows; const [y] = m.cols; const pop = parseNum(/era di ([\d.,]+) milioni/.exec(q.question)[1]); return lab(q.chart, y, i) / pop; },
  G6: (q, m) => { const [a, b] = m.cols; const gr = (k) => ((lab(q.chart, k, b) - lab(q.chart, k, a)) / lab(q.chart, k, a)) * 100; return gr(0) - gr(1); },
  G7: (q, m) => { const [x, z] = m.rows; const pc = (k) => lab(q.chart, 1, k) / parseNum(q.table.rows[k][1]); return pc(x) - pc(z); },
};
for (const lv of [1, 2, 3]) {
  const letters = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const templates = {};
  const NC = 2000;
  for (let s = 1; s <= NC; s++) {
    const seed = s * 7919 + lv;
    let q;
    try { q = g.chart.make(seed, lv); } catch (e) { bad(`grafico L${lv} seme ${seed}: ${e.message}`); continue; }
    if (q.id !== g.chart.idFor(seed, lv) || JSON.stringify(g.chart.parseId(q.id)) !== JSON.stringify({ level: lv, seed })) bad(`id ${q.id}`);
    if (JSON.stringify(g.chart.make(seed, lv)) !== JSON.stringify(q)) bad(`non deterministico ${q.id}`);
    if (!q.chart || !['hbar', 'line', 'pie'].includes(q.chart.type)) bad(`grafico mancante ${q.id}`);
    for (const se of q.chart.series) if (se.values.length !== q.chart.categories.length || se.labels.length !== se.values.length || se.values.some((v) => !Number.isFinite(v))) bad(`serie incoerente ${q.id}`);
    if (q.chart.type === 'pie') for (const se of q.chart.series) { const tot = se.values.reduce((a, b) => a + b, 0); if (tot !== 100) bad(`quote che non fanno 100 (${tot}) ${q.id}`); }
    if (q.options.length !== 5 || q.options[4].text !== 'Nessuna di queste risposte') bad(`opzioni ${q.id}`);
    const keys = q.options.filter((o) => o.trap === null).map((o) => o.letter);
    if (keys.length !== 1 || keys[0] !== q.correct[0]) bad(`chiave ${q.id}`);
    if (new Set(q.options.map((o) => o.text)).size !== 5) bad(`opzioni uguali ${q.id}`);
    const vals = q.options.slice(0, 4).map((o) => parseNum(o.text));
    const unit = 10 ** -q.meta.dec;
    const v = fromChart[q.meta.template](q, q.meta);
    if (!Number.isFinite(v)) bad(`ricalcolo non numerico ${q.id}`);
    else if (q.correct[0] === 'E') { if (vals.some((x) => Math.abs(x - v) <= unit + 1e-9)) bad(`grafico: E giusta ma un'opzione vale ${v} ${q.id}`); }
    else {
      const k = 'ABCD'.indexOf(q.correct[0]);
      if (Math.abs(vals[k] - v) > unit + 1e-9) bad(`grafico: la chiave ${q.options[k].text} non torna con il ricalcolo ${v.toFixed(3)} ${q.id} ${q.meta.template}`);
      const nearest = vals.reduce((best, x, idx) => (Math.abs(x - v) < Math.abs(vals[best] - v) ? idx : best), 0);
      if (nearest !== k) bad(`grafico: il ricalcolo ${v.toFixed(3)} è più vicino a ${q.options[nearest].text} ${q.id}`);
    }
    if (/undefined|NaN/.test(JSON.stringify(q))) bad(`testo con undefined/NaN ${q.id}`);
    if (!q.explanation.includes(q.answer.display)) bad(`spiegazione senza il risultato ${q.id}`);
    letters[q.correct[0]]++;
    templates[q.meta.template] = (templates[q.meta.template] || 0) + 1;
  }
  const share = Object.fromEntries(Object.entries(letters).map(([k, x]) => [k, x / NC]));
  for (const [k, x] of Object.entries(share)) if (x < 0.12 || x > 0.28) bad(`grafici L${lv}: lettera ${k} al ${(x * 100).toFixed(1)}%`);
  for (const t of g.CHART_TEMPLATES[lv]) if (!templates[t]) bad(`grafici L${lv}: modello ${t} mai usato`);
  console.log(`Grafici L${lv}: ${NC} item · lettere ${Object.entries(share).map(([k, x]) => `${k} ${(x * 100).toFixed(0)}%`).join(' ')} · modelli ${JSON.stringify(templates)}`);
}
console.log(fails ? `${fails} problemi` : 'OK: nessun problema');
process.exit(fails ? 1 : 0);
