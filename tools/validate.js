// Validatore dei contenuti v2 — uso: node tools/validate.js
// Esce con codice 1 se trova problemi. Stampa anche statistiche e il controllo
// "strategia cieca" per il verbale (opzione prudente / più lunga), da tenere ≤ 30% sui livelli ≥ 2.
'use strict';
const fs = require('fs');
const path = require('path');
global.window = global;
const banks = {};
global.registerBank = (b) => { banks[b.id] = b; };
const dataDir = path.join(__dirname, '..', 'data');
for (const f of fs.readdirSync(dataDir).filter((x) => x.endsWith('.js')).sort()) require(path.join(dataDir, f));

const problems = [];
const ids = new Set();
const NONE = 'Nessuna di queste risposte';
for (const b of Object.values(banks)) {
  if (!b.exam || !b.exam.num || !b.exam.totalMin || !b.exam.perItemSec) problems.push(`${b.id}: exam incompleto`);
  for (const q of b.questions) {
    const ctx = `${b.id}#${q.id}`;
    if (ids.has(q.id)) problems.push(`${ctx}: id duplicato`);
    ids.add(q.id);
    if (!q.format) problems.push(`${ctx}: format mancante`);
    if (!q.question) problems.push(`${ctx}: domanda mancante`);
    if (!q.explanation || q.explanation.length < 60) problems.push(`${ctx}: spiegazione corta`);
    if (!q.tag) problems.push(`${ctx}: tag mancante`);
    if (![1, 2, 3].includes(q.difficulty)) problems.push(`${ctx}: difficulty non valida`);
    if (![1, 2, 3].includes(q.level)) problems.push(`${ctx}: level non valido`);
    const letters = q.options.map((o) => o.letter);
    const texts = q.options.map((o) => o.text.trim());
    if (new Set(letters).size !== letters.length) problems.push(`${ctx}: lettere duplicate`);
    if (new Set(texts).size !== texts.length) problems.push(`${ctx}: testi duplicati`);
    if (letters.join('') !== 'ABCDE'.slice(0, letters.length)) problems.push(`${ctx}: lettere non in ordine`);
    if (!Array.isArray(q.correct) || q.correct.length !== 1 || !letters.includes(q.correct[0])) problems.push(`${ctx}: correct non valido`);
    if (q.format === 'epso4') {
      if (q.options.length !== 4) problems.push(`${ctx}: epso4 richiede 4 opzioni`);
      if (!/^Quale delle seguenti affermazioni (NON )?è corretta\?$/.test(q.question)) problems.push(`${ctx}: consegna non EPSO: ${q.question}`);
      if (/NON/.test(q.question) && !q.extra) problems.push(`${ctx}: consegna NON senza flag extra`);
      if (!q.passage || q.passage.split(/\s+/).length < 50) problems.push(`${ctx}: brano assente o troppo corto`);
    }
    if (q.format === 'vfn' && (q.options.length !== 3 || texts.join('|') !== 'Vero|Falso|Non si può dire')) problems.push(`${ctx}: vfn non valido`);
    if (q.format === 'num5') {
      if (q.options.length !== 5) problems.push(`${ctx}: num5 richiede 5 opzioni`);
      if (q.options[4].text !== NONE) problems.push(`${ctx}: manca «${NONE}» in E`);
      if (q.noneIsCorrect && q.correct[0] !== 'E') problems.push(`${ctx}: noneIsCorrect ma chiave ≠ E`);
      if (!q.noneIsCorrect && q.correct[0] === 'E') problems.push(`${ctx}: chiave E senza noneIsCorrect`);
      if (!q.passage) problems.push(`${ctx}: dati mancanti`);
    }
    if (q.format === 'mc4' && q.options.length !== 4) problems.push(`${ctx}: mc4 richiede 4 opzioni`);
    if (/­/.test(q.passage + q.question + texts.join(''))) problems.push(`${ctx}: trattino morbido`);
    if (/del 85%/.test(q.passage)) problems.push(`${ctx}: refuso "del 85%"`);
  }
}

// Statistiche
for (const b of Object.values(banks)) {
  const dist = {};
  for (const q of b.questions) dist[q.correct[0]] = (dist[q.correct[0]] || 0) + 1;
  const words = b.questions.filter((q) => q.passage).map((q) => q.passage.split(/\s+/).length);
  const avgWords = words.length ? Math.round(words.reduce((a, c) => a + c, 0) / words.length) : 0;
  console.log(`${b.id}: ${b.questions.length} quesiti${b.hidden ? ' (nascosta)' : ''} · lettere ${JSON.stringify(dist)} · brano medio ${avgWords} parole`);
}

// Strategia cieca sul verbale epso4: "l'unica opzione prudente, altrimenti la più lunga".
{
  const qs = banks.verbale.questions.filter((q) => q.format === 'epso4' && !q.extra);
  const prudent = (t) => /\b(non|una parte|alcuni|alcune|può|possono|non tutti|non tutte|in alcuni casi|non necessariamente)\b/i.test(t);
  let hits = 0;
  for (const q of qs) {
    const pr = q.options.filter((o) => prudent(o.text));
    let pick = pr.length === 1 ? pr[0] : [...q.options].sort((a, b) => b.text.length - a.text.length)[0];
    if (pick.letter === q.correct[0]) hits++;
  }
  console.log(`strategia cieca (verbale epso4, ${qs.length} quesiti): ${hits}/${qs.length} = ${Math.round((hits / qs.length) * 100)}% (obiettivo per i livelli ≥ 2: ≤ 30%)`);
}

if (problems.length) {
  console.error('❌ PROBLEMI:\n' + problems.join('\n'));
  process.exit(1);
}
console.log('✅ contenuti validi');
