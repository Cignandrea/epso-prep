// Costruisce data/bank-verbale-l2.js (verbale di livello prova) dai lotti in tools/source-v2/verbale-l2-*.json.
// Uso: node tools/build-l2.js
// Solo gli item che hanno passato la verifica entrano: un item con "status": "dropped" resta fuori.
// Controlli: schema, una sola chiave, trappole valide, evidenza nel brano, lunghezza del brano.
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'source-v2');
const OUT = path.join(__dirname, '..', 'data', 'bank-verbale-l2.js');
const TRAPS = new Set(['quantificatore', 'inferenza', 'fuori-testo', 'negazione', 'tempo', 'scope', 'parafrasi']);

// --check: solo controlli, nessun file scritto. --only K: solo il lotto verbale-l2-K.json.
const CHECK = process.argv.includes('--check');
const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx > 0 ? process.argv[onlyIdx + 1] : null;
const files = (fs.existsSync(SRC) ? fs.readdirSync(SRC).filter((f) => /^verbale-l2-\d+\.json$/.test(f)).sort() : []).filter((f) => !ONLY || f === `verbale-l2-${ONLY}.json`);
const items = [];
const problems = [];
for (const f of files) {
  let arr;
  try { arr = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')); } catch (err) { problems.push(`${f}: JSON non valido (${err.message})`); continue; }
  for (const q of arr) {
    if (q.status === 'dropped') continue;
    const where = `${f}#${q.id}`;
    const words = String(q.passage || '').trim().split(/\s+/).length;
    const keys = (q.options || []).filter((o) => o.trap == null).map((o) => o.letter);
    if (!Number.isInteger(q.id)) problems.push(`${where}: id non intero`);
    if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.map((o) => o.letter).join('') !== 'ABCD') problems.push(`${where}: opzioni A–D`);
    if (keys.length !== 1 || !Array.isArray(q.correct) || q.correct[0] !== keys[0]) problems.push(`${where}: chiave incoerente`);
    for (const o of q.options || []) if (o.trap != null && !TRAPS.has(o.trap)) problems.push(`${where}: trappola sconosciuta ${o.trap}`);
    if (!TRAPS.has(q.tag)) problems.push(`${where}: tag sconosciuto ${q.tag}`);
    if (words < 120 || words > 185) problems.push(`${where}: brano di ${words} parole`);
    if (!q.evidence || !q.passage.includes(q.evidence)) problems.push(`${where}: evidenza assente dal brano`);
    items.push({ id: q.id, batch: 'L2', level: 2, format: 'epso4', tag: q.tag, difficulty: q.difficulty || 2, topic: q.topic || '', passage: q.passage, question: q.question || 'Quale delle seguenti affermazioni è corretta?', options: q.options.map((o) => ({ letter: o.letter, text: o.text, trap: o.trap == null ? null : o.trap })), correct: [keys[0]], evidence: q.evidence, explanation: q.explanation });
  }
}
const ids = new Set();
for (const q of items) { if (ids.has(q.id)) problems.push(`id duplicato ${q.id}`); ids.add(q.id); }
if (problems.length) { console.error(`${problems.length} problemi:\n- ${problems.join('\n- ')}`); process.exit(1); }
items.sort((a, b) => a.id - b.id);
if (CHECK) { console.log(`OK (solo controllo): ${items.length} quesiti validi da ${files.length} lotti`); process.exit(0); }
const header = `// EU Prep — banca "verbale", livello prova (${items.length} quesiti). FILE GENERATO da tools/build-l2.js: non modificare a mano.\n`;
fs.writeFileSync(OUT, `${header}registerBank(${JSON.stringify({ id: 'verbale', questions: items }, null, 1)});\n`);
console.log(`OK: ${items.length} quesiti da ${files.length} lotti → ${path.relative(process.cwd(), OUT)}`);
