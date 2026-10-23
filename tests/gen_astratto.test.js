// Test del generatore dell'astratto (js/gen-astratto.js). Uso: node tests/gen_astratto.test.js
// Su 2.000 item per livello controlla: forma, determinismo, id; ricalcolo indipendente della serie e della sesta figura
// dai parametri delle regole; una sola opzione giusta, cinque opzioni diverse a vista; lettere bilanciate; varietà delle
// regole; spiegazione coerente; e quanto spesso le scorciatoie «cieche» (voto di maggioranza, «la più simile alla
// quinta», «la più diversa dalla quinta») trovano la risposta senza capire le regole: devono restare basse.
'use strict';
global.window = global; global.App = {};
require('../js/gen-astratto.js');
const g = App.gen.astratto;

let fails = 0;
const bad = (msg) => { fails++; if (fails <= 25) console.log('FAIL -', msg); };
const mod = (a, n) => ((a % n) + n) % n;
const FILLS = ['white', 'grey', 'black'];
const N = 2000;

// Valore atteso di una regola al passo k, scritto da capo (non usa il generatore).
function expect(rp, k) {
  switch (rp.name) {
    case 'pos': return mod(rp.start + k * rp.step, 8);
    case 'rot': return mod(rp.start + k * rp.step, 360);
    case 'sides': case 'dots': return rp.start + k * rp.step;
    case 'cycle': return FILLS[mod(rp.start + k * rp.dir, 3)];
    case 'alt': case 'kind': case 'movalt': case 'dotalt': return k % 2 === 0 ? rp.a : rp.b;
    default: throw new Error(`regola sconosciuta ${rp.name}`);
  }
}
// Caratteristiche visibili di una figura (indipendenti dalla firma del generatore).
function visible(s) {
  const v = { center: s.center, mover: Boolean(s.mover) };
  if (s.center === 'fig') {
    v.shape = s.kind === 'poly' ? (s.sides === 4 ? 'square' : `poly${s.sides}`) : s.kind;
    if (s.kind === 'arrow') v.rot = mod(s.rot, 360);
    v.fill = s.fill;
  } else { v.dots = s.dots; v.dotFill = s.dotFill; }
  if (s.mover) { v.pos = s.pos; v.movFill = s.movFill; }
  return v;
}
const vkey = (s) => JSON.stringify(visible(s));
const FEATS = ['center', 'shape', 'rot', 'fill', 'dots', 'dotFill', 'mover', 'pos', 'movFill'];
const diff = (a, b) => { const x = visible(a); const y = visible(b); return FEATS.filter((f) => x[f] !== y[f]).length; };
function uniqueArg(scores, better) {
  const best = scores.reduce((m, s) => (better(s, m) ? s : m), scores[0]);
  const idx = scores.map((s, i) => (s === best ? i : -1)).filter((i) => i >= 0);
  return idx.length === 1 ? idx[0] : -1;
}
const majority = (states) => uniqueArg(states.map((o) => { const v = visible(o); return FEATS.reduce((sum, f) => sum + states.filter((x) => visible(x)[f] === v[f]).length, 0); }), (a, b) => a > b);
const nearest = (states, fifth) => uniqueArg(states.map((o) => diff(o, fifth)), (a, b) => a < b);
const farthest = (states, fifth) => uniqueArg(states.map((o) => diff(o, fifth)), (a, b) => a > b);

const t0 = Date.now();
let made = 0;
for (const lv of [1, 2, 3]) {
  const letters = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const combos = {};
  const heur = { majority: 0, nearest: 0, farthest: 0, keySeen: 0 };
  const trapCount = {};
  for (let s = 1; s <= N; s++) {
    const seed = s * 7919 + lv * 13;
    let q;
    try { q = g.make(seed, lv); made++; } catch (e) { bad(`L${lv} seme ${seed}: ${e.message}`); continue; }
    const tag = q.id;
    // forma e id
    if (q.id !== g.idFor(seed, lv) || JSON.stringify(g.parseId(q.id)) !== JSON.stringify({ level: lv, seed })) bad(`id ${tag}`);
    if (JSON.stringify(g.make(seed, lv)) !== JSON.stringify(q)) bad(`non deterministico ${tag}`);
    if (q.bank !== 'astratto' || q.format !== 'abs5' || q.level !== lv || q.question !== 'Quale figura completa la serie?') bad(`campi ${tag}`);
    if (q.series.length !== 5 || q.options.length !== 5 || q.options.map((o) => o.letter).join('') !== 'ABCDE') bad(`forma ${tag}`);
    if (q.ruleParams.length !== lv || q.rules.length !== lv) bad(`numero di regole ${tag}`);
    if (new Set(q.ruleParams.map((r) => r.feature)).size !== lv) bad(`due regole sulla stessa caratteristica ${tag}`);
    combos[q.ruleParams.map((r) => r.name).sort().join('+')] = (combos[q.ruleParams.map((r) => r.name).sort().join('+')] || 0) + 1;
    // ricalcolo indipendente: la serie segue le regole e il resto non cambia
    const first = q.series[0].state;
    const frame = (k) => q.ruleParams.reduce((f, rp) => ({ ...f, [rp.feature]: expect(rp, k) }), { ...first });
    for (let k = 0; k < 5; k++) if (vkey(q.series[k].state) !== vkey(frame(k))) bad(`serie ${tag} figura ${k + 1}`);
    const sixth = frame(5);
    const good = q.options.filter((o) => vkey(o.fig.state) === vkey(sixth)).map((o) => o.letter);
    if (good.length !== 1 || good[0] !== q.correct[0]) bad(`chiave ${tag}: ${good.join(',')} vs ${q.correct}`);
    const keys = q.options.filter((o) => o.trap === null).map((o) => o.letter);
    if (keys.length !== 1 || keys[0] !== q.correct[0]) bad(`trappola nulla solo sulla chiave ${tag}`);
    if (new Set(q.options.map((o) => vkey(o.fig.state))).size !== 5) bad(`opzioni uguali a vista ${tag}`);
    if (new Set(q.options.map((o) => g.canon(o.fig))).size !== 5) bad(`firma: opzioni uguali ${tag}`);
    for (const o of q.options) {
      const st = o.fig.state;
      if (st.center === 'dots' && (st.dots < 1 || st.dots > 9)) bad(`pallini fuori scala ${tag}`);
      if (st.center === 'fig' && st.kind === 'poly' && (st.sides < 3 || st.sides > 8)) bad(`lati fuori scala ${tag}`);
      if (o.trap && !['conteggio', 'rotazione', 'alternanza', 'riempimento', 'posizione', 'combinata', 'costante'].includes(o.trap)) bad(`trappola sconosciuta ${o.trap} ${tag}`);
      if (o.trap) trapCount[o.trap] = (trapCount[o.trap] || 0) + 1;
      if (!o.fig.label || /undefined|NaN/.test(o.fig.label)) bad(`etichetta ${tag}`);
    }
    letters[q.correct[0]]++;
    // spiegazione
    const ex = q.explanation;
    if (!ex.includes(`Risposta ${q.correct[0]}.`) || /undefined|NaN|null/.test(ex)) bad(`spiegazione ${tag}: ${ex.slice(0, 120)}`);
    for (const o of q.options) if (o.trap && !ex.includes(`${o.letter}: `)) bad(`spiegazione senza l'opzione ${o.letter} ${tag}`);
    if (/bianci|grigii/.test(ex)) bad(`italiano ${tag}`);
    // scorciatoie cieche
    const states = q.options.map((o) => o.fig.state);
    const k = 'ABCDE'.indexOf(q.correct[0]);
    if (majority(states) === k) heur.majority++;
    if (nearest(states, q.series[4].state) === k) heur.nearest++;
    if (farthest(states, q.series[4].state) === k) heur.farthest++;
    if (q.series.some((f) => vkey(f.state) === vkey(sixth))) heur.keySeen++;
  }
  const pct = (x) => Math.round((x / N) * 100);
  console.log(`Livello ${lv}: lettere ${Object.entries(letters).map(([l, c]) => `${l} ${pct(c)}%`).join(' · ')}`);
  console.log(`  scorciatoie che trovano la risposta: maggioranza ${pct(heur.majority)}% · più simile alla quinta ${pct(heur.nearest)}% · più diversa dalla quinta ${pct(heur.farthest)}% · risposta già vista nella serie ${pct(heur.keySeen)}%`);
  console.log(`  combinazioni (${Object.keys(combos).length}): ${Object.entries(combos).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c} ${pct(n)}%`).join(' · ')}`);
  console.log(`  trappole: ${Object.entries(trapCount).map(([c, n]) => `${c} ${n}`).join(' · ')}`);
  for (const [l, c] of Object.entries(letters)) if (c / N < 0.14 || c / N > 0.26) bad(`L${lv}: lettera ${l} al ${pct(c)}%`);
  if (heur.majority / N > 0.40) bad(`L${lv}: la maggioranza trova la risposta nel ${pct(heur.majority)}% dei casi`);
  if (heur.nearest / N > 0.40) bad(`L${lv}: «la più simile alla quinta» trova la risposta nel ${pct(heur.nearest)}% dei casi`);
  if (heur.farthest / N > 0.45) bad(`L${lv}: «la più diversa dalla quinta» trova la risposta nel ${pct(heur.farthest)}% dei casi`);
  const expected = g.COMBOS[lv].length;
  if (Object.keys(combos).length < expected) bad(`L${lv}: solo ${Object.keys(combos).length} combinazioni su ${expected}`);
}
const ms = (Date.now() - t0) / made;
console.log(`Tempo medio per item: ${ms.toFixed(2)} ms`);
if (ms > 5) bad(`troppo lento: ${ms.toFixed(2)} ms per item`);

// id non validi
for (const id of ['A4-1', 'N2-5', 'A2-', 'A2-x', '', null]) if (g.parseId(id) !== null) bad(`parseId accetta ${id}`);

// Disegno con un DOM minimo: attributi numerici validi, numero di elementi atteso.
global.document = {
  createElementNS: (ns, tag) => ({ tag, attrs: {}, children: [], setAttribute(k, v) { this.attrs[k] = v; }, append(...c) { this.children.push(...c); } }),
};
const flat = (n) => [n, ...n.children.flatMap(flat)];
for (let s = 1; s <= 300; s++) {
  const q = g.make(s, 1 + (s % 3));
  for (const sp of [...q.series, ...q.options.map((o) => o.fig)]) {
    const svg = g.frameSvg(sp, { size: 60, label: 'Figura' });
    const nodes = flat(svg);
    for (const n of nodes) for (const [k, v] of Object.entries(n.attrs)) if (/NaN|undefined/.test(String(v))) bad(`attributo ${k}=${v} in ${q.id}`);
    const st = sp.state;
    const shapes = nodes.filter((n) => ['circle', 'rect', 'polygon'].includes(n.tag)).length;
    const expected = 1 + (st.center === 'dots' ? st.dots : 1) + (st.mover ? 1 : 0);
    if (shapes !== expected) bad(`elementi disegnati ${shapes} invece di ${expected} in ${q.id}`);
    if (!/^Figura: /.test(svg.attrs['aria-label'])) bad(`aria-label ${q.id}`);
  }
}

console.log(fails ? `\n${fails} problemi` : '\nOK: nessun problema');
process.exit(fails ? 1 : 0);
