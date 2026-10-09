// Registro delle banche dati ("cartucce") — namespace App.banks
//
// Ogni file in data/ chiama registerBank({ id, label, order, exam, questions }).
// Più file possono registrare lo STESSO id: le domande si accodano (lotti).
// Per aggiungere una batteria futura basta quindi creare data/bank-<x>-N.js
// e aggiungerlo a index.html e sw.js: nessun'altra modifica al motore.
//
// La variabile globale QUESTIONS resta l'interfaccia usata da quiz/flashcards/
// progress: qui viene definita come getter dinamico sulla banca attiva, così
// il motore originale continua a funzionare senza modifiche ai punti d'uso.
window.App = window.App || {};

(() => {
  'use strict';

  const registry = new Map(); // id -> { id, label, order, exam, questions }

  window.registerBank = function registerBank({ id, label, order = null, exam = null, questions = [] }) {
    if (!registry.has(id)) {
      registry.set(id, { id, label: label || id, order: order != null ? order : 99, exam, questions: [] });
    }
    const bank = registry.get(id);
    // I lotti successivi possono omettere label/order/exam: si aggiornano solo se forniti
    if (label) bank.label = label;
    if (exam) bank.exam = exam;
    if (order != null) bank.order = order;

    // Accoda evitando id duplicati (i lotti devono usare range di id distinti)
    const existing = new Set(bank.questions.map((q) => q.id));
    for (const q of questions) {
      if (!existing.has(q.id)) {
        bank.questions.push(q);
        existing.add(q.id);
      }
    }
  };

  App.banks = (() => {
    const ACTIVE_KEY = 'euprep.activeBank';
    let activeId = null;
    const listeners = [];

    function list() {
      return [...registry.values()].sort((a, b) => a.order - b.order);
    }

    function get(id) {
      return registry.get(id) || null;
    }

    function active() {
      return get(activeId) || list()[0] || { id: 'vuota', label: '—', exam: null, questions: [] };
    }

    function setActive(id) {
      if (!registry.has(id) || id === activeId) return;
      activeId = id;
      try { localStorage.setItem(ACTIVE_KEY, id); } catch { /* private mode: pazienza */ }
      for (const fn of listeners) fn(active());
    }

    function onChange(fn) {
      listeners.push(fn);
    }

    function init() {
      let saved = null;
      try { saved = localStorage.getItem(ACTIVE_KEY); } catch { /* ignora */ }
      activeId = registry.has(saved) ? saved : (list()[0] ? list()[0].id : null);

      const select = document.getElementById('bank-select');
      if (select) {
        select.replaceChildren(
          ...list().map((b) => {
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = `${b.label} (${b.questions.length})`;
            return opt;
          })
        );
        select.value = activeId;
        select.addEventListener('change', async () => {
          if (App.quiz && App.quiz.isActive()) {
            const ok = await App.ui.confirmDialog({
              title: 'Quiz in corso',
              message: 'Cambiando materia, la sessione corrente andrà persa. Continuare?',
              okText: 'Cambia materia',
              danger: true,
            });
            if (!ok) { select.value = activeId; return; }
            App.quiz.abort();
          }
          setActive(select.value);
        });
      }
    }

    return { init, list, get, active, setActive, onChange };
  })();

  // Interfaccia storica del motore: QUESTIONS = domande della banca attiva.
  Object.defineProperty(window, 'QUESTIONS', {
    get: () => App.banks.active().questions,
    configurable: false,
  });
})();
