// Ripasso con gemelli: un errore su un item generato torna come item nuovo dello stesso modello (numerico) o delle
// stesse regole (astratto); l'esito del gemello fa avanzare la scatola dell'originale, ma solo a scadenza raggiunta.
// Uso: TZ=Europe/Rome node tests/twins.test.js
'use strict';
const path = require('path');
const mem = {};
global.localStorage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; }, key: (i) => Object.keys(mem)[i], get length() { return Object.keys(mem).length; } };
global.window = global;
global.addEventListener = () => {};
global.document = { addEventListener() {}, getElementById: () => null, hidden: false };
global.App = {};
for (const f of ['js/banks.js', 'data/bank-verbale.js', 'data/bank-verbale-l2.js', 'data/bank-numerico.js', 'js/gen-numerico.js', 'js/gen-astratto.js', 'js/utils.js', 'js/store.js', 'js/select.js']) require(path.join(__dirname, '..', f));
App.ui = { toast() {} };

let fails = 0, passes = 0;
const check = (name, cond, detail = '') => { if (cond) passes++; else { fails++; console.log('FAIL -', name, detail); } };
const days = (n) => new Date(Date.now() - n * 86400000).toISOString();

const N = App.gen.numerico.make(12345, 2);
const G = App.gen.numerico.chart.make(777, 2);
const A = App.gen.astratto.make(4242, 2);
const kind = (q) => (q.bank === 'astratto' ? (q.rules || []).map((r) => r.type).sort().join('+') : q.meta && q.meta.template);
const wrongOf = (q) => q.options.find((o) => o.letter !== q.correct[0]).letter;
for (const q of [N, G, A]) App.store.addLog({ t: days(2), mode: 'train', bank: q.bank, id: q.id, sel: wrongOf(q), ok: false, sec: 60, level: q.level, tag: q.tag });

const due = App.select.dueItems();
check('tre item in scadenza', due.length === 3, due.map((q) => q.id));
const rev = App.select.forStep({ kind: 'review' });
const twins = rev.filter((q) => q.twinOf);
check('ripasso: tre gemelli', twins.length === 3, rev.map((q) => `${q.id}<${q.twinOf}`));
for (const t of twins) {
  const orig = [N, G, A].find((q) => q.id === t.twinOf);
  check(`gemello di ${orig.id}: id nuovo, stesso tipo e livello`, t.id !== orig.id && kind(t) === kind(orig) && t.level === orig.level && t.id[0] === orig.id[0], `${t.id} ${kind(t)} vs ${kind(orig)}`);
}
// Risposta giusta al gemello a scadenza raggiunta: l'originale passa alla scatola 2.
const tw = twins.find((q) => q.twinOf === N.id);
App.store.addLog({ t: new Date().toISOString(), mode: 'tappa', bank: tw.bank, id: tw.id, twinOf: N.id, sel: tw.correct[0], ok: true, sec: 90, level: 2, tag: tw.tag });
let st = App.store.itemStats().get(`numerico#${N.id}`);
check('gemello giusto: originale in scatola 2', st.box === 2, JSON.stringify({ box: st.box, due: st.due }));
check('il gemello non ha statistiche proprie', !App.store.itemStats().has(`numerico#${tw.id}`));
// Risposta giusta prima della nuova scadenza: la scatola non avanza.
App.store.addLog({ t: new Date(Date.now() + 1000).toISOString(), mode: 'tappa', bank: 'numerico', id: N.id, sel: N.correct[0], ok: true, sec: 90, level: 2, tag: N.tag });
st = App.store.itemStats().get(`numerico#${N.id}`);
check('giusta prima della scadenza: scatola ferma', st.box === 2, st.box);
// Il ripasso finale dello scarico usa gli originali.
const fin = App.select.forStep({ kind: 'review', final: true });
check('ripasso finale: niente gemelli', fin.every((q) => !q.twinOf), fin.map((q) => q.id));

console.log(`${passes} passati, ${fails} falliti`);
process.exit(fails ? 1 : 0);
