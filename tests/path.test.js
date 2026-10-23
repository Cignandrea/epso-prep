// Test del percorso (js/path.js) con date simulate: fasi, simulazioni, scarico, riposo, giorno della prova.
// Uso: node tests/path.test.js — exit code ≠ 0 se qualcosa non torna.
'use strict';
const path = require('path');
global.window = global;
global.App = {};
require(path.join(__dirname, '..', 'js', 'utils.js'));

let PATH = {};
let DUE = 0;
let SETTINGS = { prereqDone: false };
App.store = { path: () => PATH, setPath: (v) => { PATH = v; }, settings: () => SETTINGS };
App.select = { dueItems: () => Array.from({ length: DUE }) };
require(path.join(__dirname, '..', 'js', 'path.js'));
const P = App.path;

let fails = 0, passes = 0;
const check = (name, cond, detail = '') => { if (cond) passes++; else { fails++; console.log('FAIL -', name, detail); } };
const at = (iso) => new Date(iso);
const doneAll = (steps, t = '2026-10-24T10:00:00+02:00') => { for (const s of steps) PATH.done = { ...(PATH.done || {}), [s.id]: { t } }; };
const reset = () => { PATH = {}; DUE = 0; SETTINGS = { prereqDone: false }; };

// 1. Primo giorno: la prima tappa delle basi
reset();
let n = P.next(at('2026-10-24T09:00:00+02:00'));
check('primo giorno: b01', n.id === 'b01' && n.phase === 'Basi' && n.index === 1 && n.of === 14, JSON.stringify(n));
// 2. Le basi vanno in ordine
P.complete(n);
n = P.next(at('2026-10-24T09:10:00+02:00'));
check('poi b02', n.id === 'b02' && n.index === 2);
// 3. Simulazione 1 non prima di aver finito le basi, anche il 31/10
n = P.next(at('2026-10-31T10:00:00+01:00'));
check('31/10 con basi incomplete: ancora basi', n.phase === 'Basi', n.id);
// 4. Basi finite il 31/10 → simulazione 1
doneAll(P.BASI);
n = P.next(at('2026-10-31T10:00:00+01:00'));
check('31/10 basi finite: sim 1', n.id === 's1' && n.kind === 'sim', n.id);
// 5. Prima del 31/10 con basi finite → ciclo di allenamento
n = P.next(at('2026-10-29T10:00:00+01:00'));
check('29/10: allenamento', n.phase === 'Allenamento' && n.id === 'p2-0' && n.pick.bank === 'verbale', n.id);
// 6. Ciclo: avanza; il ripasso si salta con pochi errori in scadenza
for (let i = 0; i < 4; i++) P.complete(P.next(at('2026-10-29T10:00:00+01:00')));
n = P.next(at('2026-10-29T10:00:00+01:00'));
check('ripasso saltato con 0 errori in scadenza', n.kind === 'drill' && n.id === 'p2-5', n.id);
DUE = 5; PATH.p2 = { i: 4 };
n = P.next(at('2026-10-29T10:00:00+01:00'));
check('ripasso proposto con 5 errori in scadenza', n.kind === 'review' && n.id === 'p2-4', n.id);
DUE = 0;
// 7. Sim 1 fatta → il 01/11 si torna al ciclo
PATH.done.s1 = { t: '2026-10-31T12:00:00+01:00' };
n = P.next(at('2026-11-01T10:00:00+01:00'));
check('dopo sim 1: allenamento', n.phase === 'Allenamento', n.id);
// 8. Ultima settimana: livelli più alti
PATH.p2 = { i: 1 };
n = P.next(at('2026-11-04T10:00:00+01:00'));
check('dal 03/11 numerico più difficile', n.pick && n.pick.bank === 'numerico' && n.pick.gen.includes(3), JSON.stringify(n.pick));
// 9. Sim 2 dal 07/11
n = P.next(at('2026-11-07T10:00:00+01:00'));
check('07/11: sim 2', n.id === 's2', n.id);
// 10. Sim 1 saltata: dopo il 06/11 non torna
delete PATH.done.s1;
n = P.next(at('2026-11-07T10:00:00+01:00'));
check('sim 1 scaduta il 07/11: si propone la 2', n.id === 's2', n.id);
// 11. Scarico dal 08/11: sim 2 ancora possibile l'08, poi ripasso finale e scheda
n = P.next(at('2026-11-08T10:00:00+01:00'));
check('08/11 con sim 2 non fatta: sim 2', n.id === 's2', n.id);
PATH.done.s2 = { t: '2026-11-08T12:00:00+01:00' };
n = P.next(at('2026-11-08T15:00:00+01:00'));
check('08/11: ripasso finale', n.id === 't1' && n.phase === 'Scarico', n.id);
n = P.next(at('2026-11-09T10:00:00+01:00'));
check('09/11 senza sim 2 obbligatoria: t1', n.id === 't1', n.id);
P.complete(n); n = P.next(at('2026-11-09T10:00:00+01:00'));
check('poi scheda «Prima della prova»', n.id === 't2' && n.lesson === 'fine', n.id);
P.complete(n); n = P.next(at('2026-11-09T11:00:00+01:00'));
check('scarico finito', n.kind === 'taper-done', n.kind);
// 12. Riposo, giorno della prova, dopo
check('10/11 riposo', P.next(at('2026-11-10T09:00:00+01:00')).kind === 'rest');
check('11/11 mattina: giorno della prova', P.next(at('2026-11-11T09:00:00+01:00')).kind === 'examday');
check('11/11 dopo le 14: dopo', P.next(at('2026-11-11T14:30:00+01:00')).kind === 'after');
check('12/11: dopo', P.next(at('2026-11-12T09:00:00+01:00')).kind === 'after');
// 13. Conteggi: oggi e totale; la simulazione vale la giornata
reset();
PATH = { done: { b01: { t: '2026-10-24T09:00:00+02:00' }, b02: { t: '2026-10-24T09:20:00+02:00' }, b03: { t: '2026-10-23T22:00:00+02:00' } } };
let c = P.counts(at('2026-10-24T12:00:00+02:00'));
check('conteggi oggi/totale', c.today === 2 && c.total === 3 && c.target === 3, JSON.stringify(c));
PATH.done.s1 = { t: '2026-10-24T15:00:00+02:00' };
c = P.counts(at('2026-10-24T16:00:00+02:00'));
check('una simulazione riempie la giornata', c.today >= 3, JSON.stringify(c));
// 14. Countdown e promemoria dei prerequisiti
check('giorni alla prova dal 23/10', P.daysToExam(at('2026-10-23T20:00:00+02:00')) === 19, P.daysToExam(at('2026-10-23T20:00:00+02:00')));
check('prerequisiti aperti il 23/10', P.prereqOpen(at('2026-10-23T20:00:00+02:00')) === true);
check('prerequisiti chiusi dopo la scadenza', P.prereqOpen(at('2026-11-06T12:00:00+01:00')) === false);
SETTINGS.prereqDone = true;
check('prerequisiti segnati come fatti', P.prereqOpen(at('2026-10-23T20:00:00+02:00')) === false);
// 15. Ora della prova: 14:00 di Bruxelles = 13:00 UTC dell'11/11 (ora solare)
check('ora della prova in UTC', P.EXAM.at.toISOString() === '2026-11-11T13:00:00.000Z', P.EXAM.at.toISOString());
check('scadenza prerequisiti in UTC', P.PREREQ.at.toISOString() === '2026-11-06T10:59:00.000Z', P.PREREQ.at.toISOString());

console.log(`${passes} passati, ${fails} falliti`);
process.exit(fails ? 1 : 0);
