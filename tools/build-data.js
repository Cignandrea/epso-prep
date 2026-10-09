// Costruisce data/bank-*.js (contenuti L1, versione 2) a partire dalle banche v1
// in tools/source-v1, applicando le correzioni della revisione dell'08/10/2026.
// Uso: node tools/build-data.js
//
// Ogni modifica è dichiarata qui, con l'ID del quesito: niente modifiche "a mano"
// nei file generati. Per cambiare un quesito si cambia questo script e si rigenera.
'use strict';
const fs = require('fs');
const path = require('path');

global.window = global;
global.App = {};
require(path.join(__dirname, 'source-v1', 'banks-v1.js'));
const srcDir = path.join(__dirname, 'source-v1');
for (const f of fs.readdirSync(srcDir).filter((x) => x.startsWith('bank-') && x.endsWith('.js')).sort()) {
  require(path.join(srcDir, f));
}
const banks = Object.fromEntries(App.banks.list().map((b) => [b.id, b]));
const byId = (bank, id) => {
  const q = banks[bank].questions.find((x) => x.id === id);
  if (!q) throw new Error(`manca ${bank}#${id}`);
  return q;
};
const setOpt = (q, letter, text) => {
  const o = q.options.find((x) => x.letter === letter);
  if (!o) throw new Error(`opzione ${letter} mancante in #${q.id}`);
  o.text = text;
};

// ───────────────────────── VERBALE ─────────────────────────
{
  // 1066 ERRATO: previsione presentata come fatto → chiave condizionata, tag, spiegazione.
  const q = byId('verbale', 1066);
  setOpt(q, 'A', 'Per completare il piano previsto, nel terzo anno restano da immettere ottomila avannotti.');
  q.tag = 'inferenza';
  q.explanation = 'Il brano fissa un obiettivo (trentamila avannotti in tre anni) e un dato (ventiduemila nei primi due anni): la differenza, ottomila, è ciò che il piano richiede ancora, non ciò che certamente avverrà, perché le immissioni dipendono dalla qualità dell\'acqua. A lo dice in forma condizionata ("per completare il piano previsto… restano da immettere") ed è quindi dimostrabile. B ignora la condizione sulla qualità dell\'acqua; C contraddice "specie autoctona"; D contraddice il divieto "in vigore fino al termine del progetto". Trappola da evitare: trasformare un piano in una previsione certa.';

  // 1029 DUBBIO: "non richiede quote" ≠ "non acquisisce quote".
  setOpt(byId('verbale', 1029), 'A', 'Alle imprese ospitate non è richiesta la cessione di quote societarie.');
  byId('verbale', 1029).explanation = 'Il brano dichiara che la struttura "non richiede quote di partecipazione societaria alle imprese ospitate": A lo riformula fedelmente, senza dire di più (per esempio che l\'incubatore non ne acquisisca mai). B raddoppia la durata dichiarata (dodici mesi); C contraddice la selezione di dieci startup tramite bando; D sposta nel tempo un contributo che il testo definisce "iniziale".';

  // 1047 DUBBIO (lieve): ancorare al momento descritto dal brano.
  setOpt(byId('verbale', 1047), 'C', 'Al termine dei primi due mesi, una parte dei cani registrati nell\'area non era ancora stata vaccinata.');
  byId('verbale', 1047).explanation = 'Nei primi due mesi è stato vaccinato il settanta per cento dei cani registrati: a quella data il restante trenta per cento non lo era ancora, ed è ciò che dice C, che resta nel momento descritto dal brano. A contraddice la prosecuzione fino a dicembre; B contraddice la gratuità; D allarga da "cani e gatti" a tutte le specie domestiche, oltre l\'ambito dichiarato.';

  // 1063 DUBBIO: tolto l'assoluto "solo", che il brano non contiene.
  setOpt(byId('verbale', 1063), 'B', 'Per conferire gli scarti si utilizza una tessera personale nei tre punti di raccolta.');
  byId('verbale', 1063).explanation = 'Il conferimento "avviene con tessera personale nei tre punti di raccolta": B lo riporta senza aggiungere nulla. A contraddice la distribuzione gratuita; C estende il servizio dalle quattrocento famiglie aderenti a tutto il quartiere; D promuove una "riduzione stimata" a misura esatta. Il vocabolario del brano (gratuito, aderenti, stimata) contiene già tutte le risposte.';

  // 1064 DUBBIO (lieve): regola, non esistenza di esclusi.
  setOpt(byId('verbale', 1064), 'C', 'Il colloquio di valutazione non è previsto per tutti i candidati.');
  byId('verbale', 1064).explanation = 'Il colloquio è previsto "per i soli candidati preselezionati": la regola non lo prevede per tutti, come dice C. A viola il limite dei cinque anni dal dottorato; B contraddice l\'esclusione delle spese per personale aggiuntivo; D raddoppia la durata biennale. "Per i soli" è il quantificatore che regge l\'intero quesito.';

  // 1003 (b.1) DUBBIO (lieve): affermazione resa inequivocabile.
  byId('verbale', 1003).question = 'L\'obbligo del 30% di materiale riciclato non si applicherà agli imballaggi a contatto diretto con i farmaci.';

  // 1033: attribuzione esplicita del dato (coerenza con 1056 e 1063).
  setOpt(byId('verbale', 1033), 'B', 'Secondo i dati del gestore, a parità di prodotto l\'impianto consuma meno acqua della coltivazione in campo aperto.');

  // 1034: trattino morbido (U+00AD) rimosso.
  byId('verbale', 1034).passage = byId('verbale', 1034).passage.replace(/­/g, '');

  // Tag più pertinenti (revisione A1/A2).
  byId('verbale', 1023).tag = 'inferenza';
  byId('verbale', 1027).tag = 'parafrasi';
  byId('verbale', 1068).tag = 'parafrasi';
  byId('verbale', 1041).tag = 'inferenza';
  byId('verbale', 1055).tag = 'inferenza';

  // Riequilibrio delle lettere corrette (bb. 2–3: 12/12/12/12), con spiegazioni riscritte.
  const swap = (id, a, b) => {
    const q = byId('verbale', id);
    const oa = q.options.find((o) => o.letter === a);
    const ob = q.options.find((o) => o.letter === b);
    [oa.text, ob.text] = [ob.text, oa.text];
    q.correct = q.correct.map((c) => (c === a ? b : c === b ? a : c));
  };
  swap(1054, 'B', 'D');
  byId('verbale', 1054).explanation = 'Il brano dice che gli abbonati "viaggiano senza costi aggiuntivi": D è la riformulazione fedele. A contraddice la conservazione delle cabine originali; B nega un biglietto che il testo dichiara disponibile; C colloca nel dopoguerra un servizio attivo dal 1908. L\'integrazione tariffaria è il punto informativo chiave del brano.';
  swap(1058, 'B', 'D');
  byId('verbale', 1058).explanation = 'Il testo dice che nei moduli sulla sicurezza i volontari sono "affiancati da personale della polizia postale": D lo riformula correttamente. A contraddice la gratuità; B descrive gli incontri individuali come sostitutivi mentre il brano li propone "al termine", come consolidamento; C contraddice la natura di alfabetizzazione del corso.';
  swap(1071, 'B', 'D');
  byId('verbale', 1071).explanation = 'L\'iscrizione dei minori "richiede il certificato medico": D è la lettura diretta del requisito. A contraddice l\'ingresso a offerta libera; B attribuisce le residenze agli allievi, mentre il brano le destina alle compagnie professionali; C contraddice l\'offerta per bambini e adolescenti. La corretta è spesso la frase meno vistosa e più aderente.';
  swap(1065, 'B', 'A');
  byId('verbale', 1065).explanation = 'Un terzo di seimila accessi fa duemila: A traduce in numero la frazione del brano. B aggiunge un giorno di apertura non dichiarato; C generalizza l\'appuntamento, richiesto solo per i colloqui approfonditi; D afferma l\'esatto contrario di quella clausola. Convertire frazioni in valori assoluti è un passaggio che l\'esame dà per scontato.';

  // Consegna allineata al test di esempio EPSO; i tre quesiti "NON" restano come esercizio extra.
  for (const q of banks.verbale.questions) {
    if (q.batch === 1) { q.format = 'vfn'; continue; }
    q.format = 'epso4';
    if (/NON è supportata/.test(q.question)) {
      q.question = 'Quale delle seguenti affermazioni NON è corretta?';
      q.extra = true; // formato non EPSO: esclusa da simulazioni e allenamento, disponibile in Micro
    } else {
      q.question = 'Quale delle seguenti affermazioni è corretta?';
    }
  }
}

// ───────────────────────── NUMERICO ─────────────────────────
{
  // 2009 ERRATO: due opzioni corrette → opzioni rifatte.
  const q = byId('numerico', 2009);
  q.options = [
    { letter: 'A', text: '2 ore e 4 minuti' },
    { letter: 'B', text: '126 minuti' },
    { letter: 'C', text: '144 minuti' },
    { letter: 'D', text: '150 minuti' },
    { letter: 'E', text: '2 ore e 40 minuti' },
  ];
  q.correct = ['C'];
  q.explanation = 'Tempo = 216 / 90 = 2,4 ore = 2,4 × 60 = 144 minuti, cioè 2 ore e 24 minuti. Trappole: leggere "2,4 ore" come 2 ore e 40 minuti o come 2 ore e 4 minuti; arrotondare a 2,5 ore (150 minuti); sottrarre invece di dividere (216 − 90 = 126).';

  // 2011 DUBBIO: le opzioni rivelavano le percentuali.
  const q11 = byId('numerico', 2011);
  q11.options = [
    { letter: 'A', text: 'Nord' },
    { letter: 'B', text: 'Sud' },
    { letter: 'C', text: 'Isole' },
    { letter: 'D', text: 'Centro' },
    { letter: 'E', text: 'Centro e Sud a pari merito' },
  ];
  q11.correct = ['B'];
  q11.explanation = 'Crescite: Nord +60/400 = 15 %; Centro +45/250 = 18 %; Sud +36/180 = 20 %; Isole +18/120 = 15 %. Vince il Sud. Trappola: scegliere il Nord perché ha l\'aumento assoluto maggiore (+60), confondendo valore assoluto e percentuale.';

  // 2018 DUBBIO (lieve): "più conveniente" ambiguo.
  const q18 = byId('numerico', 2018);
  q18.question = 'Qual è il costo per pezzo della confezione con il minor costo unitario?';
  setOpt(q18, 'B', '3,60 €');
  setOpt(q18, 'C', '3,80 €');
  setOpt(q18, 'E', '5,40 €');
  q18.explanation = 'Confezione A: 43,20 / 12 = 3,60 € al pezzo; confezione B: 30,40 / 8 = 3,80 € al pezzo. Il costo unitario minore è 3,60 €. Trappola: fermarsi al prezzo totale più basso (la B) senza calcolare il costo unitario, o riportare il costo unitario della confezione sbagliata.';

  // Refusi e decimali.
  byId('numerico', 2038).passage = byId('numerico', 2038).passage.replace('del 85%', "dell'85%");
  setOpt(byId('numerico', 2003), 'B', '586,50 €');
  setOpt(byId('numerico', 2026), 'C', '1.427,40 €');
  setOpt(byId('numerico', 2026), 'D', '1.610,40 €');
  setOpt(byId('numerico', 2032), 'B', '76,80 €');
  setOpt(byId('numerico', 2032), 'D', '51,20 €');
  setOpt(byId('numerico', 2032), 'E', '57,60 €');
  byId('numerico', 2032).explanation = byId('numerico', 2032).explanation.replace('57,6 €', '57,60 €');

  // Tag e difficoltà.
  byId('numerico', 2024).tag = 'rapporti';
  byId('numerico', 2042).tag = 'rapporti';
  byId('numerico', 2042).difficulty = 2;

  // «Nessuna di queste risposte» come quinta opzione in tutti i quesiti (formato EPSO),
  // corretta in 8 quesiti su 48 (uno su sei).
  const NONE = 'Nessuna di queste risposte';
  const noneCorrect = new Set([2004, 2010, 2016, 2022, 2028, 2034, 2040, 2046]);
  const num = (s) => (s || '').replace(/[^\d,.-]/g, '');
  const keyCount = { A: 0, B: 0, C: 0, D: 0 }; // per bilanciare le lettere corrette tra i quesiti con chiave numerica
  for (const q of banks.numerico.questions) {
    q.format = 'num5';
    const key = q.correct[0];
    const keyOpt = q.options.find((o) => o.letter === key);
    let kept;
    if (noneCorrect.has(q.id)) {
      kept = q.options.filter((o) => o.letter !== key);
      q.explanation = `Il valore corretto, ${keyOpt.text}, non compare tra le opzioni: la risposta è «${NONE}». ` + q.explanation;
      q.noneIsCorrect = true;
    } else {
      // Si elimina un distrattore: preferibilmente uno non citato nella spiegazione, scelto in modo
      // che la lettera della chiave risultante sia quella finora meno usata (equilibrio A/B/C/D).
      const distractors = q.options.filter((o) => o.letter !== key);
      const cited = (o) => q.explanation.includes(num(o.text)) && num(o.text).length >= 2;
      const candidates = distractors.filter((o) => !cited(o)).length ? distractors.filter((o) => !cited(o)) : distractors;
      const resultLetter = (drop) => 'ABCD'[q.options.filter((o) => o !== drop).indexOf(keyOpt)];
      let drop = candidates[0];
      for (const c of candidates) if (keyCount[resultLetter(c)] < keyCount[resultLetter(drop)]) drop = c;
      keyCount[resultLetter(drop)]++;
      kept = q.options.filter((o) => o !== drop);
    }
    const letters = ['A', 'B', 'C', 'D'];
    q.options = kept.map((o, i) => ({ letter: letters[i], text: o.text }));
    q.options.push({ letter: 'E', text: NONE });
    q.correct = noneCorrect.has(q.id) ? ['E'] : [q.options[kept.indexOf(keyOpt)].letter];
    if (!noneCorrect.has(q.id) && q.options[kept.indexOf(keyOpt)].text !== keyOpt.text) throw new Error(`chiave persa in #${q.id}`);
  }
}

// ───────────────────────── UE e DIGITALI (archiviate, nascoste) ─────────────────────────
{
  const q = byId('euknowledge', 3031);
  q.options = [
    { letter: 'A', text: '27' },
    { letter: 'B', text: '21' },
    { letter: 'C', text: '20' },
    { letter: 'D', text: '19' },
  ];
  q.correct = ['B'];
  q.explanation = 'L\'area dell\'euro conta 21 Stati membri: la Bulgaria ha adottato l\'euro dal 1º gennaio 2026, dopo la Croazia (1º gennaio 2023). Attenzione ai materiali datati, che riportano ancora 19 o 20 paesi. Fonti: BCE, comunicato stampa del 1º gennaio 2026; Consiglio dell\'UE, cronologia dell\'area dell\'euro. Dato verificato l\'8 ottobre 2026: da ricontrollare prima della Parte 2.';
  q.recheck = '2027-01';
  setOpt(byId('euknowledge', 3003), 'A', 'Dai capi di Stato o di governo degli Stati membri, insieme al presidente del Consiglio europeo e al presidente della Commissione');
  byId('euknowledge', 3058).question = byId('euknowledge', 3058).question.replace('intervieni', 'interviene');
  for (const id of [3060, 3033, 3043, 3027]) byId('euknowledge', id).recheck = '2027-01';
  byId('digital', 4001).question = byId('digital', 4001).question.replace('sulla direttiva sui servizi digitali', 'sul regolamento sui servizi digitali (Digital Services Act)');
  banks.euknowledge.hidden = true;
  banks.digital.hidden = true;
  for (const q of banks.euknowledge.questions) q.format = 'mc4';
  for (const q of banks.digital.questions) q.format = 'mc4';
}

// ───────────────────────── SCRITTURA ─────────────────────────
const meta = {
  verbale: { label: 'Ragionamento verbale', order: 1, exam: { num: 20, totalMin: 35, perItemSec: 105 }, level: 1 },
  numerico: { label: 'Ragionamento numerico', order: 2, exam: { num: 10, totalMin: 20, perItemSec: 120 }, level: 1 },
  euknowledge: { label: 'Conoscenza UE (archivio)', order: 8, exam: { num: 30, totalMin: 40, perItemSec: 80 }, level: 1 },
  digital: { label: 'Competenze digitali (archivio)', order: 9, exam: { num: 40, totalMin: 30, perItemSec: 45 }, level: 1 },
};
const outDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(outDir, { recursive: true });
for (const [id, b] of Object.entries(banks)) {
  const m = meta[id];
  const payload = {
    id,
    label: m.label,
    order: m.order,
    exam: m.exam,
    level: m.level,
    hidden: Boolean(b.hidden),
    source: 'EU Prep Suite v1 (09/08/2026), corretta l\'08–09/10/2026 secondo la revisione in 08_/revisione-2026-10-08',
    questions: b.questions.map((q) => ({
      id: q.id, batch: q.batch, level: 1, format: q.format, tag: q.tag, difficulty: q.difficulty,
      ...(q.extra ? { extra: true } : {}), ...(q.recheck ? { recheck: q.recheck } : {}), ...(q.noneIsCorrect ? { noneIsCorrect: true } : {}),
      passage: q.passage || '', question: q.question, options: q.options, correct: q.correct, explanation: q.explanation,
    })),
  };
  const header = `// EU Prep Suite v2 — banca "${id}" (${payload.questions.length} quesiti). FILE GENERATO da tools/build-data.js: non modificare a mano.\n`;
  fs.writeFileSync(path.join(outDir, `bank-${id}.js`), header + 'registerBank(' + JSON.stringify(payload, null, 1) + ');\n');
  console.log(`scritto data/bank-${id}.js (${payload.questions.length})`);
}
