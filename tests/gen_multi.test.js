// Test dei modelli multi-passaggio (id M…) di js/gen-numerico.js. Uso: TZ=Europe/Rome node tests/gen_multi.test.js
// Il ricalcolo è indipendente dal generatore: legge la domanda come un candidato (Paesi, anni, tassi, ipotesi),
// trova le celle per intestazione di colonna e anno, rifà il conto e controlla chiave, distanze fra le opzioni,
// «Nessuna di queste risposte» (circa 12%, sempre ad almeno due passi), lettere bilanciate e formato all'italiana.
'use strict';
global.window = global; global.App = {};
require('../js/gen-numerico.js');
const g = App.gen.numerico;
const M = g.multi;

let fails = 0;
const bad = (msg) => { fails++; if (fails <= 25) console.log('FAIL -', msg); };
const N = 4000;
const TAGS = new Set(['percentuali', 'rapporti', 'unita-misura', 'lettura-dati', 'media', 'calcolo']);

// ── Lettura dei numeri come li vede il candidato: 1.234,5 · −0,85% · 3:1 ──
const IT_NUM = /^(−?)(\d{1,3}(?:\.\d{3})*)(?:,(\d+))?(?:%|\s.+)?$/;
function parseIt(txt) {
  const m = IT_NUM.exec(String(txt).trim());
  if (!m) return NaN;
  return (m[1] ? -1 : 1) * Number(`${m[2].replace(/\./g, '')}.${m[3] || '0'}`);
}
const decimalsOf = (txt) => { const m = IT_NUM.exec(String(txt).trim()); return m && m[3] ? m[3].length : 0; };
const parseRatio = (txt) => { const m = /^(\d+):(\d+)$/.exec(txt); return m ? Number(m[1]) / Number(m[2]) : NaN; };

// ── Celle per intestazione: gruppo (o intestazione semplice) che contiene `label`, sottointestazione = anno ──
function columns(t) {
  const out = [null];
  if (t.groups) { for (const gr of t.groups) for (let k = 0; k < gr.span; k++) out.push({ label: gr.label, sub: String(t.head[out.length]) }); }
  else for (let j = 1; j < t.head.length; j++) out.push({ label: t.head[j], sub: '' });
  return out;
}
function cell(q, rowName, label, sub) {
  const cs = columns(q.table);
  const hits = cs.map((c, j) => (c && c.label.includes(label) && (sub === undefined || c.sub === String(sub)) ? j : -1)).filter((j) => j > 0);
  if (hits.length !== 1) throw new Error(`colonna «${label}» ${sub || ''}: ${hits.length} corrispondenze`);
  const row = q.table.rows.find((r) => r[0] === rowName);
  if (!row) throw new Error(`riga «${rowName}» assente`);
  const v = parseIt(row[hits[0]]);
  if (!Number.isFinite(v)) throw new Error(`cella illeggibile «${row[hits[0]]}»`);
  return v;
}
const rowsOf = (q) => q.table.rows.map((r) => r[0]);
const sig2 = (v) => { const e = 10 ** (Math.floor(Math.log10(Math.abs(v))) - 1); return Math.round(v / e) * e; };

// ── Domande: espressioni regolari sul testo e ricalcolo dalle celle mostrate ──
const P = '(Paese\\s[A-E])'; // nel generatore lo spazio è non divisibile (U+00A0)
const RE = {
  'pil-rapporto': new RegExp(`^Qual era approssimativamente, nel (\\d{4}), il rapporto tra il PIL del ${P} e quello del ${P}\\?$`),
  'abitanti-rapporto': new RegExp(`^Qual era approssimativamente, nel (\\d{4}), il rapporto tra il numero di abitanti del ${P} e quello del ${P}\\?$`),
  'pubblica-rapporto': new RegExp(`^Qual era approssimativamente, nel (\\d{4}), il rapporto tra la spesa pubblica in R&S del ${P} e quella del ${P}\\?$`),
  'pil-valore': new RegExp(`^Qual era nel (\\d{4}) il PIL del ${P}\\? \\(in miliardi di €, arrotondamento all'unità\\)$`),
  'spesa-pubblica': new RegExp(`^A quanto ammontava nel (\\d{4}) la spesa pubblica in R&S del ${P}\\? \\(in milioni di €, arrotondamento all'unità\\)$`),
  'abitanti-valore': new RegExp(`^Quanti abitanti aveva il ${P} nel (\\d{4})\\? \\(in milioni, arrotondamento a una cifra decimale\\)$`),
  'brevetti-valore': new RegExp(`^Quanti brevetti ha registrato il ${P} nel (\\d{4})\\? \\(arrotondamento all'unità\\)$`),
  'ipotesi-pil': new RegExp(`^Se il PIL del ${P} (crescesse|diminuisse) (?:del |dell')([\\d,]+)% tra il (\\d{4}) e il (\\d{4}), di quanto varierebbe, in percentuale, la spesa pubblica in R&S del ${P}\\? \\(arrotondamento a due cifre decimali\\)$`),
  somma: /^Qual è la superficie complessiva delle macroregioni (\S+) e (\S+)\? \(in (km²|milioni di km²)\)$/,
  densita: /^Qual è la densità di popolazione della macroregione (\S+)\? \(in abitanti per km², arrotondamento a una cifra decimale\)$/,
  urbana: /^Di quanti milioni di abitanti la popolazione urbana della macroregione (\S+) supera quella della macroregione (\S+)\? \(arrotondamento a una cifra decimale\)$/,
  'media-paese': /^Quanti abitanti ha in media un Paese della macroregione (\S+)\? \(in milioni, arrotondamento a una cifra decimale\)$/,
  'altro-tasso': new RegExp(`^Nel (\\d{4}), nel ${P} gli utenti abituali di Internet erano il (\\d+)% delle persone con 65 anni e più\\. Quale percentuale delle persone sotto i 65 anni usava abitualmente Internet\\? \\(arrotondamento a una cifra decimale\\)$`),
  'quota-gruppo': new RegExp(`^Nel (\\d{4}), nel ${P} il tasso di disoccupazione era (?:del |dell')(\\d+)% tra i giovani di 15–24 anni e (?:del |dell')(\\d+)% tra le persone di 25 anni e più\\. Quale percentuale della forza lavoro aveva tra 15 e 24 anni\\? \\(arrotondamento a una cifra decimale\\)$`),
  'numero-gruppo': new RegExp(`^Nel (\\d{4}), nel ${P} il tasso di disoccupazione era (?:del |dell')(\\d+)% tra i giovani di 15–24 anni e (?:del |dell')(\\d+)% tra le persone di 25 anni e più\\. Quanti giovani di 15–24 anni facevano parte della forza lavoro\\? \\(in migliaia, arrotondamento all'unità\\)$`),
  rapporto: new RegExp(`^Approssimativamente, qual era nel (\\d{4}) il rapporto tra il PIL del ${P} e quello del ${P}\\?$`),
  'rapporto-somma': new RegExp(`^Approssimativamente, qual era nel (\\d{4}) il rapporto tra il PIL complessivo del ${P} e del ${P} e il PIL del ${P}\\?$`),
  quota: new RegExp(`^Approssimativamente, quale percentuale della popolazione complessiva dei cinque Paesi viveva nel ${P} nel (\\d{4})\\?$`),
};
const KIND_TEMPLATE = {
  'pil-rapporto': 'M1', 'abitanti-rapporto': 'M1', 'pubblica-rapporto': 'M1', 'pil-valore': 'M1', 'spesa-pubblica': 'M1', 'abitanti-valore': 'M1', 'brevetti-valore': 'M1',
  'ipotesi-pil': 'M2', somma: 'M3', densita: 'M3', urbana: 'M3', 'media-paese': 'M3', 'altro-tasso': 'M4', 'quota-gruppo': 'M4', 'numero-gruppo': 'M4',
  rapporto: 'M5', 'rapporto-somma': 'M5', quota: 'M5',
};
const KINDS_BY_LEVEL = {
  2: ['pil-valore', 'spesa-pubblica', 'pubblica-rapporto', 'somma', 'densita', 'urbana', 'media-paese', 'altro-tasso', 'quota-gruppo', 'numero-gruppo', 'rapporto', 'rapporto-somma', 'quota'],
  3: ['pil-rapporto', 'abitanti-rapporto', 'abitanti-valore', 'brevetti-valore', 'ipotesi-pil'],
};
const RATIO = new Set(['pil-rapporto', 'abitanti-rapporto', 'pubblica-rapporto', 'rapporto', 'rapporto-somma']);

// Ogni funzione ritorna { v } (valore vero dai dati mostrati) e, per le stime, { est } (con due cifre significative).
const RD = { pct: '(% del PIL)', pub: 'Quota pubblica', pat: 'Brevetti', spesa: 'milioni di €', pc: 'pro capite' };
const gdpOf = (q, c, y) => cell(q, c, RD.spesa, y) / (cell(q, c, RD.pct, y) / 100); // milioni di €
const calc = {
  'pil-rapporto': (q, m) => ({ v: gdpOf(q, m[2], m[1]) / gdpOf(q, m[3], m[1]) }),
  'abitanti-rapporto': (q, m) => ({ v: (gdpOf(q, m[2], m[1]) / cell(q, m[2], RD.pc, m[1])) / (gdpOf(q, m[3], m[1]) / cell(q, m[3], RD.pc, m[1])) }),
  'pubblica-rapporto': (q, m) => ({ v: (cell(q, m[2], RD.spesa, m[1]) * cell(q, m[2], RD.pub, m[1])) / (cell(q, m[3], RD.spesa, m[1]) * cell(q, m[3], RD.pub, m[1])) }),
  'pil-valore': (q, m) => ({ v: gdpOf(q, m[2], m[1]) / 1000 }),
  'spesa-pubblica': (q, m) => ({ v: (cell(q, m[2], RD.spesa, m[1]) * cell(q, m[2], RD.pub, m[1])) / 100 }),
  'abitanti-valore': (q, m) => ({ v: gdpOf(q, m[1], m[2]) / cell(q, m[1], RD.pc, m[2]) }),
  'brevetti-valore': (q, m) => ({ v: cell(q, m[1], RD.pat, m[2]) * (gdpOf(q, m[1], m[2]) / cell(q, m[1], RD.pc, m[2])) }),
  'ipotesi-pil': (q, m) => {
    if (m[1] !== m[6]) throw new Error('due Paesi diversi nella stessa ipotesi');
    const gr = parseIt(m[3]) * (m[2] === 'diminuisse' ? -1 : 1);
    const f = (lab) => cell(q, m[1], lab, m[5]) / cell(q, m[1], lab, m[4]);
    return { v: ((1 + gr / 100) * f(RD.pct) * f(RD.pub) - 1) * 100 };
  },
  somma: (q, m) => {
    const inMil = m[3] === 'milioni di km²';
    if (inMil !== q.table.head[1].includes('milioni')) throw new Error('unità della domanda diversa da quella della tabella');
    return { v: cell(q, m[1], 'Superficie') + cell(q, m[2], 'Superficie') };
  },
  densita: (q, m) => {
    const inMil = q.table.head[1].includes('milioni');
    return { v: (cell(q, m[1], 'Popolazione (milioni)') * 1e6) / (cell(q, m[1], 'Superficie') * (inMil ? 1e6 : 1)) };
  },
  urbana: (q, m) => {
    const u = (c) => (cell(q, c, 'Popolazione (milioni)') * cell(q, c, 'urbana')) / 100;
    return { v: u(m[1]) - u(m[2]) };
  },
  'media-paese': (q, m) => ({ v: cell(q, m[1], 'Popolazione (milioni)') / cell(q, m[1], 'Numero di Paesi') }),
  'altro-tasso': (q, m) => {
    const tot = cell(q, m[2], 'Internet', m[1]), s = cell(q, m[2], '65 anni', m[1]) / 100, r65 = Number(m[3]);
    return { v: (tot - s * r65) / (1 - s) };
  },
  'quota-gruppo': (q, m) => {
    const u = cell(q, m[2], 'Tasso di disoccupazione', m[1]), ry = Number(m[3]), ra = Number(m[4]);
    return { v: ((u - ra) / (ry - ra)) * 100 };
  },
  'numero-gruppo': (q, m) => {
    const u = cell(q, m[2], 'Tasso di disoccupazione', m[1]), ry = Number(m[3]), ra = Number(m[4]);
    return { v: ((u - ra) / (ry - ra)) * cell(q, m[2], 'Forza lavoro', m[1]) };
  },
  rapporto: (q, m) => { const a = cell(q, m[2], 'PIL', m[1]), b = cell(q, m[3], 'PIL', m[1]); return { v: a / b, est: sig2(a) / sig2(b) }; },
  'rapporto-somma': (q, m) => {
    const a = cell(q, m[2], 'PIL', m[1]) + cell(q, m[3], 'PIL', m[1]), b = cell(q, m[4], 'PIL', m[1]);
    return { v: a / b, est: sig2(a) / sig2(b) };
  },
  quota: (q, m) => {
    let tot = 0, est = 0;
    for (const c of rowsOf(q)) { const p = cell(q, c, 'Popolazione', m[2]); tot += p; est += sig2(p); }
    const x = cell(q, m[1], 'Popolazione', m[2]);
    return { v: (x / tot) * 100, est: (sig2(x) / sig2(tot)) * 100 };
  },
};
const minAdj = (vals) => { let mm = Infinity; for (let k = 1; k < vals.length; k++) mm = Math.min(mm, vals[k] - vals[k - 1]); return mm; };

// ── Id ──
if (M.parseId('M1-5') !== null || M.parseId('M4-5') !== null || M.parseId('N2-5') !== null || M.parseId('M2-x') !== null || M.parseId('M2-') !== null) bad('parseId accetta id non validi');
if (JSON.stringify(M.parseId('M3-42')) !== JSON.stringify({ level: 3, seed: 42 })) bad('parseId M3-42');
{ const q = M.make(77, 1); if (q.level !== 2 || q.id !== 'M2-77') bad(`livello 1 non riportato al 2: ${q.id}`); }
if (JSON.stringify(g.MULTI_TEMPLATES) !== JSON.stringify({ 2: ['M1', 'M3', 'M4', 'M5'], 3: ['M1', 'M2'] })) bad('MULTI_TEMPLATES');

for (const lv of [2, 3]) {
  const letters = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const kinds = {};
  const templates = {};
  let closeNamed = 0, closeCount = 0, eNamed = 0;
  for (let s = 1; s <= N; s++) {
    const seed = s * 7907 + lv * 13;
    let q;
    try { q = M.make(seed, lv); } catch (e) { bad(`L${lv} seme ${seed}: ${e.message}`); continue; }
    const id = q.id;
    // forma e id
    if (id !== M.idFor(seed, lv) || JSON.stringify(M.parseId(id)) !== JSON.stringify({ level: lv, seed })) bad(`id ${id}`);
    if (JSON.stringify(M.make(seed, lv)) !== JSON.stringify(q)) bad(`non deterministico ${id}`);
    if (q.bank !== 'numerico' || q.format !== 'num5' || q.level !== lv || q.difficulty !== lv) bad(`campi ${id}`);
    if (/undefined|NaN|Infinity/.test(JSON.stringify(q))) bad(`testo con undefined/NaN ${id}`);
    if (q.options.length !== 5 || q.options.map((o) => o.letter).join('') !== 'ABCDE' || q.options[4].text !== 'Nessuna di queste risposte') bad(`opzioni ${id}`);
    const keys = q.options.filter((o) => o.trap === null).map((o) => o.letter);
    if (keys.length !== 1 || keys[0] !== q.correct[0] || q.correct.length !== 1) bad(`chiave ${id}`);
    if (new Set(q.options.map((o) => o.text)).size !== 5) bad(`opzioni uguali ${id}`);
    if (!TAGS.has(q.tag) || q.tag === 'calcolo') bad(`tag dell'item ${q.tag} ${id}`);
    for (const o of q.options) if (o.trap !== null && !TAGS.has(o.trap)) bad(`trappola sconosciuta ${o.trap} ${id}`);
    const t = q.table;
    if (!t || t.rows.length !== 5 || t.rows.some((r) => r.length !== t.head.length)) bad(`tabella ${id}`);
    if (t.groups && t.groups.reduce((a, gr) => a + gr.span, 0) !== t.head.length - 1) bad(`gruppi di colonne ${id}`);
    if (!t.note || !t.note.includes('Dati di esercitazione')) bad(`nota della tabella ${id}`);
    if (/\bdel (1|8|11|8\d)([,.%]|\b)/.test(q.question)) bad(`manca l'elisione («dell'») ${id}: ${q.question}`);
    // spiegazione: formula, numeri, risultato, chiave
    const ex = q.explanation;
    if (!ex.startsWith('Formula: ')) bad(`spiegazione senza formula in testa ${id}`);
    if (!ex.includes(q.answer.display)) bad(`spiegazione senza il risultato ${id}`);
    if (!ex.includes(`la risposta è ${q.correct[0]}.`)) bad(`spiegazione senza la chiave ${id}`);
    for (const o of q.options.slice(0, 4)) if (o.trap && !ex.includes(`(${o.text}`) && !ex.includes(` ${o.text}`)) bad(`spiegazione non commenta ${o.letter} ${id}`);
    if (/\d\.\d{1,2}(?!\d)/.test(ex.replace(/\d{1,3}(\.\d{3})+/g, ''))) bad(`decimali col punto nella spiegazione ${id}`);

    const kind = q.meta.kind;
    kinds[kind] = (kinds[kind] || 0) + 1;
    templates[q.meta.template] = (templates[q.meta.template] || 0) + 1;
    if (KIND_TEMPLATE[kind] !== q.meta.template) bad(`modello ${q.meta.template} per il tipo ${kind} ${id}`);
    if (!KINDS_BY_LEVEL[lv].includes(kind)) bad(`tipo ${kind} al livello ${lv} ${id}`);
    letters[q.correct[0]]++;
    const isE = q.correct[0] === 'E';
    const kIdx = 'ABCD'.indexOf(q.correct[0]);
    const m = RE[kind] && RE[kind].exec(q.question);
    if (!m) { bad(`domanda non riconosciuta (${kind}) ${id}: ${q.question}`); continue; }
    let res;
    try { res = calc[kind](q, m); } catch (e) { bad(`ricalcolo ${id}: ${e.message}`); continue; }
    const V = res.v;
    if (!Number.isFinite(V)) { bad(`ricalcolo non numerico ${id}`); continue; }
    const texts = q.options.slice(0, 4).map((o) => o.text);

    if (RATIO.has(kind)) {
      // opzioni «a:b» crescenti; vero rapporto entro il 3% dalla chiave, almeno 1,6 volte lontano dalle altre
      const vals = texts.map(parseRatio);
      if (vals.some((v) => !Number.isFinite(v))) { bad(`opzioni non a rapporto ${id}: ${texts}`); continue; }
      if (minAdj(vals) <= 0) bad(`rapporti non crescenti ${id}`);
      if (isE) { bad(`E giusta in un item a rapporto ${id}`); continue; }
      if (Math.abs(Math.log(V / vals[kIdx])) > Math.log(1.03) + 1e-9) bad(`rapporto ${V.toFixed(3)} lontano dalla chiave ${texts[kIdx]} ${id}`);
      vals.forEach((v, k) => { if (k !== kIdx && Math.abs(Math.log(V / v)) < Math.log(1.6)) bad(`rapporto ${V.toFixed(3)} vicino anche a ${texts[k]} ${id}`); });
      if (res.est !== undefined) {
        const near = vals.reduce((b, v, k) => (Math.abs(Math.log(res.est / v)) < Math.abs(Math.log(res.est / vals[b])) ? k : b), 0);
        if (near !== kIdx) bad(`la stima a due cifre (${res.est.toFixed(3)}) non porta sulla chiave ${id}`);
      }
      // l'inverso della chiave c'è sempre: è la trappola «rapporti»
      const inv = texts.findIndex((x) => x === texts[kIdx].split(':').reverse().join(':'));
      if (inv < 0 || q.options[inv].trap !== 'rapporti') bad(`manca l'inverso della chiave come trappola ${id}`);
    } else if (kind === 'quota') {
      // griglia di 5 o 10 punti; chiave entro 0,15 passi; con E ogni opzione ad almeno due passi; basta la stima
      const vals = texts.map(parseIt);
      if (!texts.every((x) => /^\d+%$/.test(x))) bad(`griglia non in % intere ${id}`);
      const step = vals[1] - vals[0];
      if (![5, 10].includes(step) || vals.some((v, k) => k && v - vals[k - 1] !== step)) { bad(`griglia irregolare ${id}: ${texts}`); continue; }
      if (isE) {
        if (vals.some((v) => Math.abs(v - V) < 2 * step - 1e-9)) bad(`E giusta ma ${V.toFixed(1)}% è a meno di due passi da un'opzione ${id}`);
        if (vals.some((v) => Math.abs(v - res.est) < 0.5 * step)) bad(`E giusta ma la stima cade su un'opzione ${id}`);
      } else {
        if (Math.abs(vals[kIdx] - V) > 0.15 * step + 1e-9) bad(`quota ${V.toFixed(2)}% lontana dalla chiave ${texts[kIdx]} ${id}`);
        vals.forEach((v, k) => { if (k !== kIdx && Math.abs(v - V) < 0.85 * step) bad(`quota vicina anche a ${texts[k]} ${id}`); });
        const near = vals.reduce((b, v, k) => (Math.abs(v - res.est) < Math.abs(vals[b] - res.est) ? k : b), 0);
        if (near !== kIdx) bad(`la stima a due cifre (${res.est.toFixed(1)}%) non porta sulla chiave ${id}`);
      }
    } else {
      // valori: formato italiano con i decimali dichiarati, un'opzione sola entro mezza unità del valore vero
      const dec = q.meta.dec, u = 10 ** -dec;
      if (texts.some((x) => !IT_NUM.test(x) || decimalsOf(x) !== dec)) bad(`formato dei numeri ${id}: ${texts.join(' / ')}`);
      const vals = texts.map(parseIt);
      if (minAdj(vals) <= 0) bad(`opzioni non crescenti ${id}`);
      const fr = Math.abs(V / u) % 1;
      if (Math.abs(fr - 0.5) < 0.15 - 1e-6) bad(`risultato vicino a un confine di arrotondamento ${V} ${id}`);
      const within = vals.map((v, k) => (Math.abs(v - V) <= u / 2 + 1e-6 ? k : -1)).filter((k) => k >= 0);
      if (isE) {
        if (within.length) bad(`E giusta ma ${texts[within[0]]} vale il risultato ${id}`);
        const step = minAdj(vals);
        if (vals.some((v) => Math.abs(v - V) < 2 * step - 1e-6)) bad(`E giusta ma il risultato ${V.toFixed(3)} è a meno di due passi (${step.toFixed(3)}) ${id}`);
        if (!vals.every((v) => v > V) && !vals.every((v) => v < V)) bad(`E giusta con opzioni da entrambe le parti ${id}`);
        if (q.options.slice(0, 4).some((o) => o.trap !== 'calcolo')) eNamed++;
      } else if (within.length !== 1 || within[0] !== kIdx) bad(`ricalcolo ${V.toFixed(4)}: opzioni entro mezza unità ${within.map((k) => texts[k])}, chiave ${texts[kIdx]} ${id}`);
      if (kind === 'ipotesi-pil') {
        closeCount++;
        if (minAdj(vals) < 0.08 - 1e-9) bad(`opzioni vicine a meno di 0,08 punti ${id}: ${texts}`);
        if (vals[3] - vals[0] > 0.9 + 1e-9) bad(`opzioni non vicine fra loro ${id}: ${texts}`);
        if (!vals.every((v) => Math.sign(v) === Math.sign(V))) bad(`opzioni di segno diverso ${id}`);
        if (q.options.slice(0, 4).some((o) => o.trap === 'percentuali')) closeNamed++;
      } else {
        const gapMin = Math.max(2 * u, Math.abs(isE ? V : vals[kIdx]) * 0.019);
        if (minAdj(vals) < gapMin - 1e-6) bad(`opzioni troppo vicine ${id}: ${texts.join(' / ')}`);
      }
    }
  }
  const share = Object.fromEntries(Object.entries(letters).map(([k, v]) => [k, v / N]));
  for (const k of 'ABCD') if (share[k] < 0.2 || share[k] > 0.25) bad(`L${lv}: lettera ${k} al ${(share[k] * 100).toFixed(1)}%`);
  if (share.E < 0.09 || share.E > 0.15) bad(`L${lv}: E giusta al ${(share.E * 100).toFixed(1)}%`);
  for (const tp of g.MULTI_TEMPLATES[lv]) if (!templates[tp]) bad(`L${lv}: modello ${tp} mai usato`);
  for (const k of KINDS_BY_LEVEL[lv]) if (!kinds[k]) bad(`L${lv}: tipo ${k} mai usato`);
  console.log(`M L${lv}: ${N} item · lettere ${Object.entries(share).map(([k, v]) => `${k} ${(v * 100).toFixed(1)}%`).join(' ')} · modelli ${JSON.stringify(templates)}`);
  console.log(`   tipi ${JSON.stringify(kinds)}${closeCount ? ` · ipotesi con la trappola «somma delle variazioni» o «base sbagliata» fra le opzioni: ${(closeNamed / closeCount * 100).toFixed(0)}%` : ''} · item con E giusta e almeno una trappola con nome: ${eNamed}`);
}
console.log(fails ? `${fails} problemi` : 'OK: nessun problema');
process.exit(fails ? 1 : 0);
