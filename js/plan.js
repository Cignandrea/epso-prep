// Ritmo e obiettivi della Parte 1 — namespace App.plan
// Il «cosa fare oggi» non sta più qui ma nel percorso (js/path.js, v1.2).
window.App = window.App || {};
App.plan = (() => {
  'use strict';
  const { todayKey, mondayOf } = App.utils;

  // Ritmo per item dalla prova reale [V bando §4.3.2; lettera del 19/10]: 35'/20 = 105", 20'/10 = 120", 10'/10 = 60".
  const PACE = { verbale: 105, numerico: 120, astratto: 60 };
  // Soglie [V avviso C/2026/3362, punto 4]: verbale ≥ 10/20; numerico + astratto ≥ 10/20 insieme.
  // Obiettivi [S, Piano di studio]: verbale ≥ 16/20; numerico e astratto ≥ 6/10 ciascuno (12/20 insieme, margine di 2).
  const TARGET = { verbale: { score: 16, max: 20, min: 10 }, numerico: { score: 6, max: 10 }, astratto: { score: 6, max: 10 } };

  // Giorni attivi nella settimana corrente (lunedì → oggi): sessioni di qualsiasi tipo.
  function weekActivity() {
    const monday = mondayOf();
    const days = new Set();
    for (const s of App.store.sessions()) {
      const d = new Date(s.t);
      if (d >= monday) days.add(todayKey(d));
    }
    const dow = (new Date().getDay() + 6) % 7; // 0 lunedì
    return { active: days.size, elapsed: dow + 1, target: 5 };
  }

  return { PACE, TARGET, weekActivity };
})();
