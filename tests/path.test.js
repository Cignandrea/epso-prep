// Test del percorso (js/path.js) con date simulate: Basi con misura di partenza, simulazioni per data, blocchi a
// tempo, taratura del ciclo, recupero delle schede, scarico, riposo, giorno della prova.
// Uso: TZ=Europe/Rome node tests/path.test.js — exit code ≠ 0 se qualcosa non torna.
'use strict';
const path = require('path');
global.window = global;
global.App = {};
require(path.join(__dirname, '..', 'js', 'utils.js'));

let PATH = {};
let DUE = 0;
let LOG = [];
let SETTINGS = { prereqDone: false };
App.store = { path: () => PATH, setPath: (v) => { PATH = v; }, settings: () => SETTINGS, log: () => LOG };
App.select = { dueItems: () => Array.from({ length: DUE }) };
require(path.join(__dirname, '..', 'js', 'path.js'));
const P = App.path;

let fails = 0, passes = 0;
const check = (name, cond, detail = '') => { if (cond) passes++; else { fails++; console.log('FAIL -', name, detail); } };
const at = (iso) => new Date(iso);
const mark = (ids, t = '2026-10-24T10:00:00+02:00', extra = {}) => { PATH.done = { ...(PATH.done || {}) }; for (const id of ids) PATH.done[id] = { t, n: 0, correct: 0, ...extra }; };
const reset = () => { PATH = {}; DUE = 0; LOG = []; SETTINGS = { prereqDone: false }; };
const basiIds = () => P.BASI.map((s) => s.id);
const show = (x) => JSON.stringify(x && { id: x.id, kind: x.kind, title: x.title, lesson: x.lesson, simAlt: x.simAlt && x.simAlt.id });

// ── 1. Basi: com'è fatta la prova, poi la misura di partenza, poi le schede ──
reset();
let n = P.next(at('2026-10-24T09:00:00+02:00'));
check('primo giorno: b01', n.id === 'b01' && n.phase === 'Basi' && n.index === 1 && n.of === 14, show(n));
P.complete(n);
n = P.next(at('2026-10-24T09:10:00+02:00'));
check('poi la misura di partenza', n.id === 'bm' && n.kind === 'sim' && n.mode === 'baseline' && n.index === 2, show(n));
check('«Non ora» sulla misura: la prossima scheda', P.shortStep(at('2026-10-24T09:10:00+02:00')).id === 'b02', show(P.shortStep(at('2026-10-24T09:10:00+02:00'))));
P.complete(P.shortStep(at('2026-10-24T09:10:00+02:00')));
n = P.next(at('2026-10-24T09:30:00+02:00'));
check('la misura resta la prossima finché non la fai', n.id === 'bm', show(n));
P.complete(n, { n: 20, correct: 12, by: { verbale: { n: 10, correct: 6 }, numerico: { n: 5, correct: 3 }, astratto: { n: 5, correct: 3 } } });
n = P.next(at('2026-10-24T10:30:00+02:00'));
check('dopo la misura: b03', n.id === 'b03' && n.index === 4, show(n));
for (const id of Object.keys(PATH.done)) PATH.done[id].t = '2026-10-24T09:00:00+02:00';
check('nessuna tappa d\'esame fuori dall\'app nelle Basi', !basiIds().includes('b14') && P.BASI.every((s) => s.kind !== 'official'));

// ── 2. Conteggi: sabato 6 tappe, la misura vale 3, le schede lette dentro un drill non contano ──
let c = P.counts(at('2026-10-24T12:00:00+02:00'));
check('sabato: obiettivo 6, misura = 3', c.target === 6 && c.today === 5 && c.total === 3, JSON.stringify(c));
c = P.counts(at('2026-10-26T12:00:00+01:00'));
check('lunedì: obiettivo 3', c.target === 3 && c.today === 0, JSON.stringify(c));
mark(['b05'], '2026-10-24T11:00:00+02:00', { via: 'p2-0' });
c = P.counts(at('2026-10-24T12:00:00+02:00'));
check('scheda letta dentro un drill: non è una tappa in più', c.total === 3 && c.today === 5, JSON.stringify(c));

// ── 3. Simulazioni per data, anche con le Basi a metà ──
reset();
mark(['b01', 'bm', 'b02']);
n = P.next(at('2026-10-31T10:00:00+01:00'));
check('sab 31/10 con Basi a metà: simulazione 1', n.id === 's1' && n.kind === 'sim' && n.lesson === 'strategia', show(n));
n = P.next(at('2026-11-02T10:00:00+01:00'));
check('lun 02/11: blocco a tempo, simulazione come alternativa', n.kind === 'block' && n.simAlt && n.simAlt.id === 's1', show(n));
n = P.next(at('2026-11-06T10:00:00+01:00'));
check('ven 06/11, ultimo giorno utile: simulazione 1', n.id === 's1', show(n));

// ── 4. Recupero: a 12 giorni o meno, con più di 3 Basi rimaste, le schede si leggono dentro i drill ──
reset();
mark(['b01', 'bm', 'b02']);
n = P.next(at('2026-10-29T10:00:00+01:00'));
check('29/10 (13 giorni): ancora Basi', n.phase === 'Basi' && n.id === 'b03', show(n));
n = P.next(at('2026-10-30T10:00:00+01:00'));
check('30/10 (12 giorni): blocco prima di tutto', n.kind === 'block', show(n));
P.complete(n);
n = P.next(at('2026-10-30T10:30:00+01:00'));
check('poi drill verbale con la scheda rimasta del verbale', n.kind === 'drill' && n.slot === 'v' && n.lesson === 'v-quant' && n.alsoDone && n.alsoDone[0] === 'b05', show(n));
P.complete(n);
check('la scheda letta nel drill conta come fatta', P.isDone('b05') && PATH.done.b05.via === 'p2-0');
n = P.next(at('2026-10-30T11:00:00+01:00'));
check('poi numerico con la sua scheda', n.slot === 'n' && n.lesson === 'n-metodo' && n.alsoDone[0] === 'b04', show(n));
check('«Non ora» a 12 giorni: la tappa vera del ciclo', P.shortStep(at('2026-10-30T11:00:00+01:00')).slot === 'n', show(P.shortStep(at('2026-10-30T11:00:00+01:00'))));

// ── 5. Blocchi a tempo: dal 27/10, ogni due giorni, verbale → numerico → astratto ──
reset();
mark(basiIds());
check('26/10: niente blocchi', P.next(at('2026-10-26T10:00:00+01:00')).kind === 'drill');
n = P.next(at('2026-10-27T10:00:00+01:00'));
check('27/10: blocco verbale', n.kind === 'block' && n.bank === 'verbale' && n.n === 10 && n.minutes === 17.5 && n.id === 'blk-2026-10-27-v', show(n));
P.complete(n);
check('27/10 dopo il blocco: ciclo', P.next(at('2026-10-27T11:00:00+01:00')).kind === 'drill');
check('28/10: niente blocco (uno ogni due giorni)', P.next(at('2026-10-28T10:00:00+01:00')).kind === 'drill');
n = P.next(at('2026-10-29T10:00:00+01:00'));
check('29/10: blocco numerico', n.kind === 'block' && n.bank === 'numerico' && n.n === 5 && n.minutes === 10, show(n));
P.complete(n);
n = P.next(at('2026-10-31T10:00:00+01:00'));
check('31/10: la simulazione viene prima del blocco', n.id === 's1', show(n));
check('«Non ora» sulla simulazione: tappa del ciclo, non un blocco', ['drill', 'review'].includes(P.shortStep(at('2026-10-31T10:00:00+01:00')).kind));

// ── 6. Ciclo: verbale doppio; ripasso solo con almeno 3 errori in scadenza ──
reset();
mark(basiIds());
const seq = [];
for (let i = 0; i < 6; i++) { const s = P.next(at('2026-10-26T10:00:00+01:00')); seq.push(s.slot); P.complete(s); }
check('ciclo base senza ripasso: v n v a v n', seq.join('') === 'vnvavn', seq.join(''));
PATH.p2 = { i: 4 }; DUE = 5;
n = P.next(at('2026-10-26T10:00:00+01:00'));
check('ripasso con 5 errori in scadenza', n.kind === 'review' && n.id === 'p2-4', show(n));
DUE = 0;

// ── 7. Taratura sulla misura di partenza e poi sulla simulazione ──
reset();
mark(basiIds());
PATH.done.bm.by = { verbale: { n: 10, correct: 5 }, numerico: { n: 5, correct: 2 }, astratto: { n: 5, correct: 4 } };
let cf = P.cycleFor(P.state());
check('taratura: più verbale, più numerico, astratto breve', cf.keys.join(',') === 'v,n,n,v,a5,v,r' && /più verbale/.test(cf.why) && /più numerico/.test(cf.why) && /misura di partenza/.test(cf.why), JSON.stringify(cf));
mark(['s1'], '2026-10-31T12:00:00+01:00', { by: { verbale: { n: 20, correct: 15 }, numerico: { n: 10, correct: 6 }, astratto: { n: 10, correct: 3 } } });
cf = P.cycleFor(P.state());
check('dopo la simulazione 1 vale la simulazione', cf.keys.join(',') === 'v,n,v,a,a,r' && /simulazione n\. 1/.test(cf.why), JSON.stringify(cf));
mark(['blk-2026-11-02-v'], '2026-11-02T09:00:00+01:00');
n = P.next(at('2026-11-02T10:00:00+01:00'));
check('il motivo arriva alla home', n.why && /più astratto/.test(n.why), show(n) + ' ' + n.why);

// ── 8. Livello del numerico e dell'astratto secondo le risposte di livello prova ──
reset();
mark(basiIds());
PATH.p2 = { i: 1 };
n = P.next(at('2026-10-26T10:00:00+01:00'));
check('numerico al livello 2 di partenza', n.pick.bank === 'numerico' && n.pick.gen.join() === '2', JSON.stringify(n.pick));
LOG = Array.from({ length: 10 }, (_, i) => ({ t: '2026-10-26T09:00:00+01:00', mode: 'tappa', bank: 'numerico', id: `N2-${i}`, ok: i < 8, level: 2 }));
n = P.next(at('2026-10-26T10:00:00+01:00'));
check('8/10 al livello 2: numerico sale al 3', n.pick.gen.includes(3), JSON.stringify(n.pick));
LOG = Array.from({ length: 10 }, (_, i) => ({ t: '2026-10-26T09:00:00+01:00', mode: 'tappa', bank: 'numerico', id: `N1-${i}`, ok: true, level: 1 }));
n = P.next(at('2026-10-26T10:00:00+01:00'));
check('le risposte di livello base non fanno salire', n.pick.gen.join() === '2', JSON.stringify(n.pick));
LOG = [];

// ── 9. Simulazione 2 e scarico ──
reset();
mark(basiIds());
n = P.next(at('2026-11-07T10:00:00+01:00'));
check('07/11 senza la sim 1: «Simulazione completa» con la scheda di strategia', n.id === 's2' && n.title === 'Simulazione completa' && n.lesson === 'strategia', show(n));
mark(['s1'], '2026-10-31T12:00:00+01:00');
n = P.next(at('2026-11-07T10:00:00+01:00'));
check('07/11 con la sim 1 fatta: sim 2', n.id === 's2' && n.title === 'Simulazione completa n. 2' && !n.lesson, show(n));
n = P.next(at('2026-11-08T10:00:00+01:00'));
check('08/11 con la sim 2 non fatta: sim 2', n.id === 's2', show(n));
mark(['s2'], '2026-11-08T12:00:00+01:00');
n = P.next(at('2026-11-08T15:00:00+01:00'));
check('08/11: ripasso finale', n.id === 't1' && n.phase === 'Scarico', show(n));
P.complete(n);
n = P.next(at('2026-11-08T16:00:00+01:00'));
check('08/11 dopo il ripasso: per oggi basta', n.kind === 'taper-wait', show(n));
n = P.next(at('2026-11-09T10:00:00+01:00'));
check('09/11: verbale leggero', n.id === 't3' && n.pick.levels.join() === '1', show(n));
P.complete(n); n = P.next(at('2026-11-09T10:30:00+01:00'));
check('poi «Prima della prova»', n.id === 't2' && n.lesson === 'fine', show(n));
P.complete(n); n = P.next(at('2026-11-09T11:00:00+01:00'));
check('scarico finito', n.kind === 'taper-done', show(n));
reset();
mark(basiIds());
n = P.next(at('2026-11-09T10:00:00+01:00'));
check('09/11 senza ripasso fatto: si parte da t1', n.id === 't1', show(n));

// ── 10. Riposo, giorno della prova, dopo ──
check('10/11 riposo', P.next(at('2026-11-10T09:00:00+01:00')).kind === 'rest');
check('11/11 mattina: giorno della prova', P.next(at('2026-11-11T09:00:00+01:00')).kind === 'examday');
check('11/11 dopo le 14: dopo', P.next(at('2026-11-11T14:30:00+01:00')).kind === 'after');
check('12/11: dopo', P.next(at('2026-11-12T09:00:00+01:00')).kind === 'after');

// ── 11. Una simulazione riempie la giornata feriale ──
reset();
PATH = { done: { s1: { t: '2026-11-02T15:00:00+01:00' } } };
c = P.counts(at('2026-11-02T16:00:00+01:00'));
check('una simulazione vale 3 tappe', c.today === 3 && c.target === 3, JSON.stringify(c));

// ── 12. Countdown e promemoria dei prerequisiti ──
check('giorni alla prova dal 23/10', P.daysToExam(at('2026-10-23T20:00:00+02:00')) === 19, P.daysToExam(at('2026-10-23T20:00:00+02:00')));
check('prerequisiti aperti il 23/10', P.prereqOpen(at('2026-10-23T20:00:00+02:00')) === true);
check('prerequisiti chiusi dopo la scadenza', P.prereqOpen(at('2026-11-06T12:00:00+01:00')) === false);
SETTINGS.prereqDone = true;
check('prerequisiti segnati come fatti', P.prereqOpen(at('2026-10-23T20:00:00+02:00')) === false);
check('ora della prova in UTC', P.EXAM.at.toISOString() === '2026-11-11T13:00:00.000Z', P.EXAM.at.toISOString());
check('scadenza prerequisiti in UTC', P.PREREQ.at.toISOString() === '2026-11-06T10:59:00.000Z', P.PREREQ.at.toISOString());

console.log(`${passes} passati, ${fails} falliti`);
process.exit(fails ? 1 : 0);
