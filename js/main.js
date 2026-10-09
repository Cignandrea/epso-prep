// Bootstrap, home, service worker — namespace App.main
window.App = window.App || {};
App.main = (() => {
  'use strict';
  const { el, dateIt, todayKey } = App.utils;
  const $ = (id) => document.getElementById(id);
  const VERSION = '1.1.0-b2';

  function home() {
    App.session.closeStale();
    App.sim.closeStale();
    const plan = App.plan.today();
    const week = App.plan.weekActivity();
    $('home-date').textContent = dateIt();
    const title = $('next-title'), sub = $('next-sub'), label = $('next-label'), btn = $('btn-next'), note = $('next-note');
    note.hidden = true;
    btn.onclick = null;

    if (App.store.sim() && App.store.sim().phase === 'results') {
      label.textContent = 'Simulazione completata';
      title.textContent = 'Rivedi i risultati';
      sub.textContent = 'La revisione resta disponibile finché non premi «Chiudi».';
      btn.textContent = 'Rivedi i risultati';
      btn.onclick = () => App.sim.resume();
    } else if (App.store.sim()) {
      label.textContent = 'In corso';
      title.textContent = 'Simulazione';
      sub.textContent = 'Il tempo continua a scorrere, come nella prova vera: riprendi subito.';
      btn.textContent = 'Riprendi la simulazione';
      btn.onclick = () => App.sim.resume();
    } else if (App.store.current()) {
      const c = App.store.current();
      label.textContent = 'In corso';
      title.textContent = `${App.session.MODE_LABEL[c.mode]} · ${c.answers.length}/${c.items.length} fatte`;
      sub.textContent = 'Riprendi da dove eri: la domanda corrente riparte senza perdere il tempo già speso.';
      btn.textContent = 'Riprendi';
      btn.onclick = () => App.session.resume();
    } else if (plan.done) {
      label.textContent = 'Oggi';
      title.textContent = 'Fatto per oggi.';
      sub.textContent = 'La sessione del giorno è registrata. Tutto il resto è extra: una Micro se ti va, non per dovere.';
      btn.textContent = 'Micro extra';
      btn.onclick = () => startMicro();
    } else if (plan.kind === 'train') {
      label.textContent = 'Prossima';
      title.textContent = plan.title;
      sub.textContent = plan.sub;
      btn.textContent = 'Inizia';
      btn.onclick = () => App.session.start('train', App.select.pickTraining(plan.bank, plan.n), { bankLabel: plan.title });
    } else if (plan.kind === 'external') {
      label.textContent = 'Oggi';
      title.textContent = plan.title;
      sub.textContent = plan.sub;
      btn.textContent = 'Registra il punteggio';
      btn.onclick = () => App.stato.showExternal();
      note.hidden = false;
      note.textContent = 'Le figure arrivano nell\'app con la v1.3; fino ad allora l\'astratto si fa sul PDF Maggioli.';
    } else if (plan.kind === 'sim') {
      label.textContent = 'Weekend';
      title.textContent = plan.title;
      sub.textContent = plan.sub;
      btn.textContent = 'Prepara la simulazione';
      btn.onclick = () => App.sim.showSetup();
      note.hidden = false;
      note.textContent = 'Se la simulazione la fai sul libro o sul test EPSO, registrala come sessione esterna.';
    }

    // Ripasso errori in scadenza.
    const due = App.select.dueItems();
    $('btn-review').hidden = due.length === 0;
    $('review-sub').textContent = `${due.length} ${due.length === 1 ? 'domanda sbagliata torna' : 'domande sbagliate tornano'} oggi`;
    $('btn-review').onclick = () => App.session.start('review', App.utils.shuffle(due).slice(0, 10));

    $('week-line').textContent = `Settimana: ${week.active} giorni attivi su ${week.target} (obiettivo), ${week.elapsed} trascorsi. Un giorno saltato non è un debito.`;
    App.ui.show('home', { title: '' });
  }

  // Una sessione in pausa non si perde in silenzio: si chiude come parziale, con conferma.
  async function closePausedIfAny() {
    const c = App.store.current();
    if (!c) return true;
    const ok = await App.ui.confirm({ title: 'Hai una sessione in pausa', message: `${App.session.MODE_LABEL[c.mode]}, ${c.answers.length}/${c.items.length} fatte. Vuoi chiuderla (le risposte date restano nel registro) e iniziare qualcos'altro?`, okText: 'Chiudi e vai avanti', cancelText: 'Torna indietro' });
    if (ok) App.session.closeAsPartial(c);
    return ok;
  }

  async function startMicro() {
    if (!(await closePausedIfAny())) return;
    const items = App.select.pickMicro(3);
    if (!items.length) { App.ui.toast('Nessuna domanda disponibile.'); return; }
    App.session.start('micro', items);
  }

  function init() {
    $('app-version').textContent = `v${VERSION}`;
    App.session.init();
    App.sim.init();
    App.calc.init();
    App.stato.init();
    $('btn-home').addEventListener('click', () => {
      if (App.ui.view() === 'session') { App.ui.toast('Usa «Esci» per mettere in pausa la sessione.'); return; }
      if (App.ui.view() === 'sim') return;
      home();
    });
    $('btn-micro').addEventListener('click', startMicro);
    $('btn-sim').addEventListener('click', async () => { if (await closePausedIfAny()) App.sim.showSetup(); });
    $('btn-external').addEventListener('click', () => App.stato.showExternal());
    // Avvio: ripresa automatica di ciò che era in corso.
    home();
    registerSW();
  }

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    // Cache offline solo sull'hosting proprio (GitHub Pages) o in locale: sulle anteprime di prova
    // (artifact) ogni versione deve arrivare fresca, senza cache.
    const local = ['localhost', '127.0.0.1'].includes(location.hostname);
    const own = location.hostname.endsWith('github.io');
    if (!(own || local)) return;
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) App.ui.toast('Nuova versione pronta: riapri l\'app per aggiornarla.', 5000); });
      });
    }).catch(() => {});
  }

  document.addEventListener('DOMContentLoaded', init);
  return { home, startMicro, VERSION };
})();
