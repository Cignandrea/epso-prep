// Registro delle banche di quesiti — namespace App.banks
// I file in data/ chiamano registerBank({ id, label, order, exam, level, hidden, questions }).
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
    const existing = new Set(bank.questions.map((q) => q.id));
    for (const q of b.questions || []) {
      if (existing.has(q.id)) continue;
      bank.questions.push({ ...q, bank: b.id });
      existing.add(q.id);
    }
    registry.set(b.id, bank);
  };

  App.banks = {
    list: () => [...registry.values()].sort((a, b) => a.order - b.order),
    visible: () => App.banks.list().filter((b) => !b.hidden),
    get: (id) => registry.get(id) || null,
    question: (bankId, id) => {
      const b = registry.get(bankId);
      return b ? b.questions.find((q) => q.id === id) || null : null;
    },
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
  App.BANK_LABEL = { verbale: 'Verbale', numerico: 'Numerico', astratto: 'Astratto', sim: 'Simulazione completa', euknowledge: 'Conoscenza UE', digital: 'Digitali' };
})();
