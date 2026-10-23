// Registro delle banche di quesiti — namespace App.banks
// I file in data/ chiamano registerBank({ id, label, order, exam, level, hidden, questions }).
// Banche generate (astratto; numerico di livello prova): gli item non stanno in un file ma si ricostruiscono
// dal loro id (seme + livello) con App.gen.*: stesso id → stesso item, anche su un altro dispositivo.
window.App = window.App || {};
(() => {
  'use strict';
  const registry = new Map();

  window.registerBank = function registerBank(b) {
    const bank = registry.get(b.id) || { id: b.id, label: b.id, order: 99, exam: null, hidden: false, questions: [] };
    if (b.label) bank.label = b.label;
    if (b.order != null) bank.order = b.order;
    if (b.exam) bank.exam = b.exam;
    if (b.hidden != null) bank.hidden = Boolean(b.hidden);
    if (b.generated) bank.generated = true;
    const existing = new Set(bank.questions.map((q) => q.id));
    for (const q of b.questions || []) {
      if (existing.has(q.id)) continue;
      bank.questions.push({ ...q, bank: b.id });
      existing.add(q.id);
    }
    bank.byId = new Map(bank.questions.map((q) => [q.id, q]));
    registry.set(b.id, bank);
  };

  // L'astratto esiste solo generato: la banca è vuota ma ha i metadati della prova [V bando §4.3.2].
  window.registerBank({ id: 'astratto', label: 'Ragionamento astratto', order: 3, exam: { num: 10, totalMin: 10, perItemSec: 60 }, generated: true, questions: [] });

  // Item generati già ricostruiti in questa pagina (si rigenerano a richiesta: la cache è solo un risparmio).
  const genCache = new Map();
  const GEN = { A: () => App.gen && App.gen.astratto, N: () => App.gen && App.gen.numerico, G: () => App.gen && App.gen.numerico && App.gen.numerico.chart };
  function generated(bankId, id) {
    if (typeof id !== 'string') return null;
    const key = `${bankId}#${id}`;
    if (genCache.has(key)) return genCache.get(key);
    const g = (GEN[id[0]] || (() => null))();
    if (!g) return null;
    const p = g.parseId(id);
    if (!p) return null;
    let q = null;
    try { q = g.make(p.seed, p.level); } catch (err) { console.warn('item generato non ricostruibile', id, err); return null; }
    if (!q || q.bank !== bankId) return null;
    if (genCache.size > 400) genCache.delete(genCache.keys().next().value);
    genCache.set(key, q);
    return q;
  }

  App.banks = {
    list: () => [...registry.values()].sort((a, b) => a.order - b.order),
    visible: () => App.banks.list().filter((b) => !b.hidden),
    get: (id) => registry.get(id) || null,
    question: (bankId, id) => {
      const b = registry.get(bankId);
      if (!b) return null;
      return (b.byId && b.byId.get(id)) || generated(bankId, id);
    },
    // Un item generato scelto per una sessione resta in cache: la ripresa non lo ricalcola.
    remember: (q) => { if (q && typeof q.id === 'string') genCache.set(`${q.bank}#${q.id}`, q); return q; },
    all: () => App.banks.list().flatMap((b) => b.questions),
  };

  App.TAGS = {
    quantificatore: 'Quantificatori (tutti/alcuni/solo)',
    inferenza: 'Inferenza oltre il testo',
    'fuori-testo': 'Conoscenza esterna al brano',
    negazione: 'Negazioni e condizioni',
    tempo: 'Sequenze temporali e date',
    scope: 'Ambito e attribuzione',
    parafrasi: 'Parafrasi ingannevole',
    percentuali: 'Percentuali e variazioni',
    rapporti: 'Rapporti e proporzioni',
    'unita-misura': 'Unità di misura e conversioni',
    'lettura-dati': 'Lettura di tabelle e dati',
    media: 'Medie e valori aggregati',
    conteggio: 'Astratto: conteggio',
    rotazione: 'Astratto: rotazione',
    alternanza: 'Astratto: alternanza',
    riempimento: 'Astratto: riempimento',
    posizione: 'Astratto: posizione',
    combinata: 'Astratto: regole combinate',
    tempo_scaduto: 'Tempo scaduto',
  };
  App.tagLabel = (t) => App.TAGS[t] || t;
  // Regola riusabile per ogni trappola (riga sotto «Trappola: …» nella correzione) e scheda da rileggere.
  App.TAG_RULE = {
    quantificatore: 'Confronta il quantificatore dell\'opzione con quello del brano: se è più forte, l\'opzione cade.',
    negazione: 'Un divieto non diventa un permesso; «solo se» è necessario, non sufficiente.',
    inferenza: 'Vale solo ciò che segue per forza: niente cause da correlazioni, niente generalizzazioni da un campione.',
    'fuori-testo': 'Vero nel mondo ma assente dal brano vuol dire sbagliato.',
    tempo: 'Previsto, proposto o stimato non è avvenuto: controlla tempi e date.',
    scope: 'Il dato vale solo per chi il brano indica: soggetto, gruppo, luogo.',
    parafrasi: 'Opzione quasi uguale al brano: confrontala parola per parola.',
    percentuali: 'Variazione = (nuovo − vecchio) ÷ vecchio; i punti percentuali sono una differenza.',
    rapporti: 'Scrivi «parte ÷ totale» prima dei numeri; il totale spesso va sommato.',
    'unita-misura': 'Fissa l\'unità del risultato prima del calcolo; converti una volta sola.',
    'lettura-dati': 'Prima la domanda, poi riga, colonna e anno; solo dopo la calcolatrice.',
    media: 'Tasso di più gruppi = totale ÷ totale, non la media dei tassi.',
    conteggio: 'Scrivi la sequenza dei numeri e trova il passo.',
    rotazione: 'Segui un solo dettaglio, la punta, e misura il passo in 45°.',
    alternanza: 'Due valori a turno: la 6ª copia la 4ª.',
    riempimento: 'Tre colori in ciclo: la 6ª copia la 3ª.',
    posizione: 'Conta di quante caselle si sposta a ogni passo e in che verso.',
    combinata: 'Una regola per elemento: elimina le opzioni una regola alla volta.',
    tempo_scaduto: 'Segna sempre una risposta provvisoria prima di andare avanti: in bianco vale zero.',
  };
  App.TAG_LESSON = {
    quantificatore: 'v-quant', negazione: 'v-quant', inferenza: 'v-infer', 'fuori-testo': 'v-infer',
    tempo: 'v-tempo', scope: 'v-tempo', parafrasi: 'v-tempo',
    percentuali: 'n-perc', rapporti: 'n-tab', 'unita-misura': 'n-tab', 'lettura-dati': 'n-tab', media: 'n-medie',
    conteggio: 'a-cont', rotazione: 'a-cont', alternanza: 'a-alt', riempimento: 'a-alt', posizione: 'a-alt', combinata: 'a-comb',
    tempo_scaduto: 'strategia',
  };
  App.tagRule = (t) => App.TAG_RULE[t] || '';
  App.BANK_LABEL = { verbale: 'Verbale', numerico: 'Numerico', astratto: 'Astratto', sim: 'Simulazione completa' };
  // Etichetta breve del livello: base = brani e problemi corti (fondamenta), prova = livello del test reale.
  App.levelLabel = (q) => (q.bank === 'astratto' ? (['', 'una regola', 'due regole', 'tre regole'][q.level] || '') : q.level >= 2 ? 'livello prova' : 'livello base');
})();
