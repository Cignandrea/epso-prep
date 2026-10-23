// Test del generatore dell'astratto v2 (js/gen-astratto2.js). Uso: TZ=Europe/Rome node tests/gen_astratto2.test.js
// Su 3.000 item per livello (2 e 3) controlla: forma, v: 2 su ogni figura, determinismo, id; ricalcolo indipendente della
// serie e della sesta figura dai parametri delle regole; una sola opzione giusta, cinque opzioni diverse a vista; struttura
// dei distrattori (errori singoli, oppure l'esca: [d], [d, x1], [d, x2], [y]); lettere bilanciate; copertura delle regole;
// spiegazione coerente; scorciatoie «cieche» (voto di maggioranza, la più simile alla quinta, l'intrusa) che devono
// restare basse; disegno di ogni figura su un DOM finto, senza innerHTML né style.
'use strict';
global.window = global; global.App = {};
require('../js/gen-astratto2.js');
const g = App.gen.astratto2;

let fails = 0;
const bad = (msg) => { fails++; if (fails <= 25) console.log('FAIL -', msg); };
const mod = (a, n) => ((a % n) + n) % n;
const FILLS = ['white', 'grey', 'black'];
const N = 3000;
const TAGS = ['conteggio', 'rotazione', 'alternanza', 'riempimento', 'posizione', 'combinata', 'costante', 'dimensione'];

// Valore atteso di una regola al passo k, scritto da capo (non usa il generatore).
function expect(rp, k) {
  switch (rp.name) {
    case 'kind3': return rp.cyc[k % 3];
    case 'fill3': return FILLS[mod(rp.start + k * rp.dir, 3)];
    case 'size': {
      if (rp.mode === 'bounce') { // simula: una misura a passo, si torna indietro agli estremi 0 e 3
        let u = [0, 1, 2, 3, 2, 1][rp.start]; let d = rp.start <= 2 ? 1 : -1;
        if (rp.start === 3) d = -1;
        for (let j = 0; j < k; j++) { if (u + d < 0 || u + d > 3) d = -d; u += d; }
        return u;
      }
      return rp.mode === 'cycle3' ? rp.lo + mod(rp.start + k * rp.dir, 3) : mod(rp.start + k * rp.dir, 4);
    }
    case 'rot': return mod(rp.start + k * rp.step, 360);
    case 'rotacc': { let a = rp.start; for (let j = 1; j <= k; j++) a += rp.dir * 45 * j; return mod(a, 360); }
    case 'count': {
      if (rp.mode === 'zig') { let n = rp.start; for (let j = 1; j <= k; j++) n += j % 2 ? 2 : -1; return n; }
      return rp.start + k * rp.step;
    }
    case 'sector': return rp.start + k * rp.step;
    case 'secrot': return mod(rp.start + k * rp.step, 8);
    case 'ring': { const ring = [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [1, 0]]; const [r, c] = ring[mod(rp.start + k * rp.step, 8)]; return r * 3 + c; }
    case 'torus': return mod(rp.r0 + k * rp.dy, 3) * 3 + mod(rp.c0 + k * rp.dx, 3);
    case 'bounce': { // simula: una casella a passo lungo la linea, si torna indietro al bordo
      let u = [0, 1, 2, 1][rp.start]; let d = rp.start <= 1 ? 1 : -1;
      for (let j = 0; j < k; j++) { if (u + d < 0 || u + d > 2) d = -d; u += d; }
      const [r, c] = rp.line === 'row' ? [rp.idx, u] : rp.line === 'col' ? [u, rp.idx] : rp.line === 'diag' ? [u, u] : [u, 2 - u];
      return r * 3 + c;
    }
    default: throw new Error(`regola sconosciuta ${rp.name}`);
  }
}
// Caratteristiche visibili di una figura (indipendenti dalla firma del generatore). Il disco si vede come insieme di spicchi.
function visible(s) {
  const v = { els: s.els.join('+') };
  for (const el of s.els) {
    if (el === 'shape') Object.assign(v, { shapeKind: s.shapeKind, shapeFill: s.shapeFill, shapeSize: s.shapeSize });
    if (el === 'arrow') Object.assign(v, { arrowRot: mod(s.arrowRot, 360), arrowFill: s.arrowFill });
    if (el === 'dots') Object.assign(v, { dotsN: s.dotsN, dotsFill: s.dotsFill });
    if (el === 'pie') {
      const set = [];
      for (let i = 0; i < s.pieN; i++) set.push(s.pieDir > 0 ? mod(s.pieAt + i, 8) : mod(s.pieAt - 1 - i, 8));
      Object.assign(v, { pieSet: set.sort((a, b) => a - b).join(','), pieFill: s.pieFill });
    }
    if (el === 'grid') Object.assign(v, { gridCell: s.gridCell, gridFill: s.gridFill });
  }
  return v;
}
const vkey = (s) => JSON.stringify(visible(s));
const FEATS = ['els', 'shapeKind', 'shapeFill', 'shapeSize', 'arrowRot', 'arrowFill', 'dotsN', 'dotsFill', 'pieSet', 'pieFill', 'gridCell', 'gridFill'];
const diffs = (a, b) => { const x = visible(a); const y = visible(b); return FEATS.filter((f) => x[f] !== y[f]).map((f) => `${f}=${x[f]}`); };
const RULE_VF = { kind3: 'shapeKind', fill3: 'shapeFill', size: 'shapeSize', rot: 'arrowRot', rotacc: 'arrowRot', count: 'dotsN', sector: 'pieSet', secrot: 'pieSet', ring: 'gridCell', torus: 'gridCell', bounce: 'gridCell' };
const RULE_TYPE = { kind3: 'alternanza', fill3: 'riempimento', size: 'dimensione', rot: 'rotazione', rotacc: 'rotazione', count: 'conteggio', sector: 'conteggio', secrot: 'rotazione', ring: 'posizione', torus: 'posizione', bounce: 'posizione' };
function uniqueArg(scores, better) {
  const best = scores.reduce((m, s) => (better(s, m) ? s : m), scores[0]);
  const idx = scores.map((s, i) => (s === best ? i : -1)).filter((i) => i >= 0);
  return idx.length === 1 ? idx[0] : -1;
}
const agreement = (states) => states.map((o) => { const v = visible(o); return FEATS.reduce((sum, f) => sum + states.filter((x) => visible(x)[f] === v[f]).length, 0); });
const majority = (states) => uniqueArg(agreement(states), (a, b) => a > b);
const oddOneOut = (states) => uniqueArg(agreement(states), (a, b) => a < b);
const nearest = (states, fifth) => uniqueArg(states.map((o) => diffs(o, fifth).length), (a, b) => a < b);
const farthest = (states, fifth) => uniqueArg(states.map((o) => diffs(o, fifth).length), (a, b) => a > b);
// «Schema dei cambi»: l'opzione che, rispetto alla quinta, cambia esattamente ciò che è cambiato tra la quarta e la quinta.
const pattern = (states, s4, s5) => {
  const want = diffs(s5, s4).map((d) => d.split('=')[0]).sort().join();
  const hits = states.map((o, i) => (diffs(o, s5).map((d) => d.split('=')[0]).sort().join() === want ? i : -1)).filter((i) => i >= 0);
  return hits.length === 1 ? hits[0] : -1;
};

const t0 = Date.now();
let made = 0;
const all = [];
for (const lv of [2, 3]) {
  const letters = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const rulesSeen = {}; const combos = {}; const trapCount = {};
  const heur = { majority: 0, nearest: 0, odd: 0, farthest: 0, pattern: 0, keySeen: 0 };
  let decoyItems = 0; let repeatItems = 0; let fullCopy = 0; let singles = 0; let partners = 0; let withConst = 0;
  for (let s = 1; s <= N; s++) {
    const seed = s * 7919 + lv * 104729;
    let q;
    try { q = g.make(seed, lv); made++; } catch (e) { bad(`L${lv} seme ${seed}: ${e.message}`); continue; }
    const tag = q.id;
    all.push(q);
    // forma e id
    if (q.id !== g.idFor(seed, lv) || JSON.stringify(g.parseId(q.id)) !== JSON.stringify({ level: lv, seed })) bad(`id ${tag}`);
    if (JSON.stringify(g.make(seed, lv)) !== JSON.stringify(q)) bad(`non deterministico ${tag}`);
    if (q.bank !== 'astratto' || q.format !== 'abs5' || q.level !== lv || q.difficulty !== lv || q.tag !== 'combinata' || q.question !== 'Quale figura completa la serie?') bad(`campi ${tag}`);
    if (q.series.length !== 5 || q.options.length !== 5 || q.options.map((o) => o.letter).join('') !== 'ABCDE') bad(`forma ${tag}`);
    if ([...q.series, ...q.options.map((o) => o.fig)].some((sp) => sp.v !== 2 || !sp.state || !Array.isArray(sp.state.els))) bad(`v: 2 mancante ${tag}`);
    if (q.ruleParams.length !== lv || q.rules.length !== lv) bad(`numero di regole ${tag}`);
    if (new Set(q.ruleParams.map((r) => r.el)).size !== lv) bad(`due regole sullo stesso elemento ${tag}`);
    if (q.rules.some((r, i) => r.type !== RULE_TYPE[q.ruleParams[i].name])) bad(`tipo di regola ${tag}`);
    const els = q.series[0].state.els;
    if (els.length < 2 || els.length > 3 || new Set(els).size !== els.length || (lv === 3 && els.length !== 3)) bad(`elementi ${tag}: ${els}`);
    if (els.length > lv) withConst++;
    for (const rp of q.ruleParams) rulesSeen[rp.name] = (rulesSeen[rp.name] || 0) + 1;
    const combo = q.ruleParams.map((r) => r.name).sort().join('+');
    combos[combo] = (combos[combo] || 0) + 1;
    // ricalcolo indipendente: la serie segue le regole e il resto non cambia
    const first = q.series[0].state;
    const frame = (k) => q.ruleParams.reduce((f, rp) => ({ ...f, [rp.feature]: expect(rp, k) }), { ...first });
    for (let k = 0; k < 5; k++) if (vkey(q.series[k].state) !== vkey(frame(k))) bad(`serie ${tag} figura ${k + 1}`);
    const sixth = frame(5);
    // ogni regola cambia il suo elemento a ogni passo (altrimenti la regola non si legge)
    for (const rp of q.ruleParams) for (let k = 1; k <= 5; k++) if (visible(frame(k))[RULE_VF[rp.name]] === visible(frame(k - 1))[RULE_VF[rp.name]]) bad(`la regola ${rp.name} non cambia al passo ${k} in ${tag}`);
    const good = q.options.filter((o) => vkey(o.fig.state) === vkey(sixth)).map((o) => o.letter);
    if (good.length !== 1 || good[0] !== q.correct[0]) bad(`chiave ${tag}: ${good.join(',')} vs ${q.correct}`);
    const nulls = q.options.filter((o) => o.trap === null).map((o) => o.letter);
    if (nulls.length !== 1 || nulls[0] !== q.correct[0]) bad(`trappola nulla solo sulla chiave ${tag}`);
    if (new Set(q.options.map((o) => vkey(o.fig.state))).size !== 5) bad(`opzioni uguali a vista ${tag}`);
    if (new Set(q.options.map((o) => g.canon(o.fig))).size !== 5) bad(`firma: opzioni uguali ${tag}`);
    letters[q.correct[0]]++;
    // struttura dei distrattori
    const wrong = q.options.filter((o) => o.letter !== q.correct[0]).map((o) => ({ o, d: diffs(o.fig.state, sixth) }));
    const one = wrong.filter((w) => w.d.length === 1); const two = wrong.filter((w) => w.d.length === 2);
    singles += one.length; partners += two.length;
    if (one.length + two.length !== 4) bad(`un distrattore differisce in più di due caratteristiche ${tag}`);
    if (wrong.some((w) => w.d.some((x) => x.startsWith('els=')))) bad(`elementi diversi in un'opzione ${tag}`);
    if (two.length === 2) {
      decoyItems++;
      const shared = two[0].d.filter((x) => two[1].d.includes(x));
      const decoy = one.filter((w) => w.d[0] === shared[0]);
      const other = one.filter((w) => w.d[0] !== shared[0]);
      if (shared.length !== 1 || decoy.length !== 1 || other.length !== 1) bad(`esca malformata ${tag}`);
      else {
        if (other[0].d[0].split('=')[0] === shared[0].split('=')[0]) bad(`y sulla caratteristica dell'esca ${tag}`);
        if (two.some((w) => w.o.trap !== decoy[0].o.trap)) bad(`trappola dei distrattori con l'esca ${tag}`);
        if (two.some((w) => vkey(w.o.fig.state) === vkey(q.series[4].state))) fullCopy++;
      }
    } else if (two.length !== 0) bad(`${two.length} distrattori con due errori ${tag}`);
    // trappola coerente con la caratteristica sbagliata (distrattori a errore singolo)
    const ruledVF = new Set(q.ruleParams.map((rp) => RULE_VF[rp.name]));
    for (const w of one) {
      const f = w.d[0].split('=')[0];
      if (w.o.trap === 'costante') { if (ruledVF.has(f) && f !== 'pieSet') bad(`«costante» su una caratteristica con regola ${tag}`); }
      else if (!q.ruleParams.some((rp) => RULE_VF[rp.name] === f && RULE_TYPE[rp.name] === w.o.trap)) bad(`trappola ${w.o.trap} non coerente con ${f} ${tag}`);
    }
    const s5 = q.series[4].state;
    if (wrong.some((w) => w.d.length === 1 && w.o.trap !== 'costante' && visible(w.o.fig.state)[w.d[0].split('=')[0]] === visible(s5)[w.d[0].split('=')[0]])) repeatItems++;
    for (const o of q.options) {
      if (o.trap && !TAGS.includes(o.trap)) bad(`trappola sconosciuta ${o.trap} ${tag}`);
      if (o.trap) trapCount[o.trap] = (trapCount[o.trap] || 0) + 1;
      if (!o.fig.label || /undefined|NaN|null/.test(o.fig.label)) bad(`etichetta ${tag}`);
    }
    // spiegazione
    const ex = q.explanation;
    if (!ex.includes(`Risposta ${q.correct[0]}.`) || /undefined|NaN|null|\[object/.test(ex)) bad(`spiegazione ${tag}: ${ex.slice(0, 160)}`);
    for (let i = 1; i <= lv; i++) if (!ex.includes(`Regola ${i} (`)) bad(`spiegazione senza la regola ${i} ${tag}`);
    for (const o of q.options) if (o.trap && !ex.includes(`${o.letter}: `)) bad(`spiegazione senza l'opzione ${o.letter} ${tag}`);
    if (/bianci|grigii|  /.test(ex)) bad(`italiano ${tag}`);
    // scorciatoie cieche
    const states = q.options.map((o) => o.fig.state);
    const k = 'ABCDE'.indexOf(q.correct[0]);
    if (majority(states) === k) heur.majority++;
    if (nearest(states, s5) === k) heur.nearest++;
    if (oddOneOut(states) === k) heur.odd++;
    if (farthest(states, s5) === k) heur.farthest++;
    if (pattern(states, q.series[3].state, s5) === k) heur.pattern++;
    if (q.series.some((f) => vkey(f.state) === vkey(sixth))) heur.keySeen++;
  }
  const pct = (x, n = N) => Math.round((x / n) * 1000) / 10;
  console.log(`Livello ${lv}: lettere ${Object.entries(letters).map(([l, c]) => `${l} ${pct(c)}%`).join(' · ')}`);
  console.log(`  scorciatoie che trovano la risposta: maggioranza ${pct(heur.majority)}% · più simile alla quinta ${pct(heur.nearest)}% · intrusa ${pct(heur.odd)}% · più diversa dalla quinta ${pct(heur.farthest)}% · schema dei cambi ${pct(heur.pattern)}% · risposta già nella serie ${pct(heur.keySeen)}%`);
  console.log(`  distrattori: esca in ${pct(decoyItems)}% degli item · ${pct(singles, N * 4)}% con un solo errore, ${pct(partners, N * 4)}% con due · «ripete la quinta» in ${pct(repeatItems)}% · quinta figura ricopiata intera in ${pct(fullCopy)}% · elemento fermo in più in ${pct(withConst)}%`);
  console.log(`  regole: ${Object.entries(rulesSeen).sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r} ${n}`).join(' · ')}`);
  console.log(`  combinazioni: ${Object.keys(combos).length} · trappole: ${Object.entries(trapCount).map(([c, n]) => `${c} ${n}`).join(' · ')}`);
  for (const [l, c] of Object.entries(letters)) if (c / N < 0.17 || c / N > 0.23) bad(`L${lv}: lettera ${l} al ${pct(c)}%`);
  if (heur.majority / N > 0.30) bad(`L${lv}: la maggioranza trova la risposta nel ${pct(heur.majority)}% dei casi`);
  if (heur.nearest / N > 0.10) bad(`L${lv}: «la più simile alla quinta» trova la risposta nel ${pct(heur.nearest)}% dei casi`);
  if (heur.odd / N > 0.25) bad(`L${lv}: «l'intrusa» trova la risposta nel ${pct(heur.odd)}% dei casi`);
  if (heur.farthest / N > 0.25) bad(`L${lv}: «la più diversa dalla quinta» trova la risposta nel ${pct(heur.farthest)}% dei casi`);
  if (heur.pattern / N > 0.40) bad(`L${lv}: «lo schema dei cambi» trova la risposta nel ${pct(heur.pattern)}% dei casi`);
  if (heur.keySeen) bad(`L${lv}: risposta già comparsa nella serie in ${heur.keySeen} item`);
  for (const r of Object.keys(g.RULES)) if (!rulesSeen[r]) bad(`L${lv}: la regola ${r} non compare mai`);
}
const ms = (Date.now() - t0) / made;
console.log(`Tempo medio per item (con i controlli): ${ms.toFixed(2)} ms`);
if (ms > 5) bad(`troppo lento: ${ms.toFixed(2)} ms per item`);

// id non validi; livelli fuori scala
for (const id of ['B1-5', 'B4-1', 'A2-5', 'B2-', 'B2-x', 'B2-99999999999', '', null]) if (g.parseId(id) !== null) bad(`parseId accetta ${id}`);
if (g.make(5, 1).level !== 2 || g.make(5, 7).level !== 3) bad('livelli fuori scala');

// Disegno con un DOM minimo: solo createElementNS/setAttribute/append; niente innerHTML né style (CSP della app).
global.document = {
  createElementNS: (ns, tag) => {
    if (ns !== 'http://www.w3.org/2000/svg') bad(`namespace ${ns}`);
    const n = { tag, attrs: {}, children: [], setAttribute(k, v) { this.attrs[k] = v; }, append(...c) { this.children.push(...c); } };
    for (const p of ['innerHTML', 'outerHTML', 'style', 'textContent']) Object.defineProperty(n, p, { set() { bad(`${p} usato nel disegno`); }, get() { return undefined; } });
    return n;
  },
};
const flat = (n) => [n, ...n.children.flatMap(flat)];
const PER_EL = { shape: () => 1, arrow: () => 1, dots: (s) => s.dotsN, pie: () => 7, grid: () => 6 };
let drawn = 0;
for (const q of all) {
  for (const sp of [...q.series, ...q.options.map((o) => o.fig)]) {
    let svg;
    try { svg = g.draw(sp, { size: 64, label: 'Figura' }); } catch (e) { bad(`disegno ${q.id}: ${e.message}`); continue; }
    drawn++;
    const nodes = flat(svg);
    for (const n of nodes) {
      for (const [k, v] of Object.entries(n.attrs)) {
        if (/NaN|undefined|null|Infinity/.test(String(v))) bad(`attributo ${k}=${v} in ${q.id}`);
        if (n === svg.children[0]) continue; // la cornice
        if (['x', 'y', 'cx', 'cy', 'x1', 'y1', 'x2', 'y2'].includes(k) && (Number(v) < 3 || Number(v) > 97)) bad(`coordinata ${k}=${v} fuori dalla cornice in ${q.id}`);
        if (k === 'points') for (const c of String(v).split(/[ ,]/).map(Number)) if (c < 3 || c > 97) bad(`punto ${c} fuori dalla cornice in ${q.id}`);
      }
    }
    const st = sp.state;
    const shapes = nodes.filter((n) => ['circle', 'rect', 'polygon', 'path', 'line'].includes(n.tag)).length;
    const expected = 1 + st.els.reduce((sum, el) => sum + PER_EL[el](st), 0);
    if (shapes !== expected) bad(`elementi disegnati ${shapes} invece di ${expected} in ${q.id}`);
    if (!/^Figura: /.test(svg.attrs['aria-label'])) bad(`aria-label ${q.id}`);
    if (svg.attrs.viewBox !== '0 0 100 100' || svg.attrs.width !== '64') bad(`svg ${q.id}`);
  }
}
console.log(`Figure disegnate: ${drawn}`);

console.log(fails ? `\n${fails} problemi` : '\nOK: nessun problema');
process.exit(fails ? 1 : 0);
