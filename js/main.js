// Bootstrap, home, service worker — namespace App.main
// La home ha un solo pulsante: «Continua» riprende ciò che è in pausa o avvia la prossima tappa del percorso.
// Tutto il resto (Micro, allenamento libero, schede, simulazione a scelta) sta sotto «Altro».
window.App = window.App || {};
App.main = (() => {
  'use strict';
  const { el, rich, daysUntil } = App.utils;
  const $ = (id) => document.getElementById(id);
  // Versione dell'app: deve coincidere con VERSION in sw.js (controllo nei test).
  const VERSION = '1.2.0-b2';

  // La home non deve mai restare vuota: se i dati salvati fanno cadere il calcolo, resta una via verso Stato (esporta, azzera) (F2-05).
  function home() {
    try { homeView(); } catch (err) {
      console.warn('home: dati non leggibili', err);
      $('next-label').textContent = 'Dati non leggibili';
      $('next-title').textContent = 'Qualcosa nei dati salvati non va';
      $('next-sub').textContent = `Apri Stato: esporta il JSON, poi «Azzera tutto». Dettaglio: ${err && err.message ? err.message : err}`;
      $('next-note').hidden = true;
      $('btn-next').hidden = false;
      $('btn-next').textContent = 'Apri Stato';
      $('btn-next').onclick = () => App.stato.open();
      App.ui.show('home', { title: '' });
    }
  }

  function countdownText(now = new Date()) {
    const d = App.path.daysToExam(now);
    if (d < 0) return 'Parte 1 sostenuta mercoledì 11/11';
    if (d === 0) return 'Prova oggi alle 14:00 (ora di Bruxelles)';
    return `Prova mer 11/11 alle 14:00 · ${d === 1 ? 'domani' : `tra ${d} giorni`}`;
  }

  function setCard({ label = '', title = '', sub = '', btn = null, onClick = null, note = '', alt = null }) {
    $('next-label').textContent = label;
    $('next-title').textContent = title;
    $('next-sub').textContent = sub;
    $('btn-next').hidden = !btn;
    if (btn) { $('btn-next').textContent = btn; $('btn-next').onclick = onClick; }
    $('next-note').hidden = !note;
    $('next-note').textContent = note;
    $('btn-alt').hidden = !alt;
    if (alt) { $('btn-alt').textContent = alt.text; $('btn-alt').onclick = alt.onClick; }
  }

  function homeView() {
    App.session.closeStale();
    App.sim.closeStale();
    App.calc.hideAll();
    $('home-countdown').textContent = countdownText();
    const sim = App.store.sim();
    const cur = App.store.current();
    const c = App.path.counts();
    if (sim && sim.phase === 'results') {
      setCard({ label: 'Simulazione completata', title: 'Rivedi i risultati', sub: 'La revisione resta qui finché non premi «Chiudi».', btn: 'Rivedi i risultati', onClick: () => App.sim.resume() });
    } else if (sim) {
      setCard({ label: 'In corso', title: 'Simulazione', sub: 'Il tempo continua a scorrere, come nella prova vera: riprendi subito.', btn: 'Riprendi la simulazione', onClick: () => App.sim.resume() });
    } else if (cur) {
      const title = cur.step ? cur.step.title : App.session.MODE_LABEL[cur.mode];
      const where = cur.lessonId && !cur.lessonSeen ? 'dalla scheda' : `dalla domanda ${Math.min(cur.answers.length + 1, cur.items.length)} di ${cur.items.length}`;
      setCard({ label: 'In pausa', title, sub: `Riprendi ${where}: niente è andato perso.`, btn: 'Riprendi', onClick: () => App.session.resume() });
    } else {
      pathCard(App.path.next(), c);
    }
    paintToday(c);
    paintTodo();
    App.ui.show('home', { title: '' });
  }

  function pathCard(nx, c) {
    const start = () => App.path.start(nx);
    const first = c.total === 0;
    switch (nx.kind) {
      case 'lesson': case 'drill': case 'review': {
        const label = nx.phase === 'Basi' && nx.index ? `Basi · tappa ${nx.index} di ${nx.of}` : `${nx.phase} · tappa ${c.total + 1}`;
        setCard({ label, title: nx.title, sub: `${nx.sub} · circa ${nx.min}′`, btn: first ? 'Inizia' : 'Continua', onClick: start, note: first ? 'Puoi fermarti quando vuoi: alla riapertura riparti dallo stesso punto.' : '' });
        break;
      }
      case 'official':
        setCard({ label: `Basi · tappa ${nx.index} di ${nx.of}`, title: nx.title, sub: nx.sub, btn: 'Apri', onClick: () => showOfficial(nx), note: 'È l\'unica tappa fuori dall\'app: la fai su TAO, poi torni qui.', alt: { text: 'Non ora: una tappa da 10′', onClick: () => App.path.start(shortStep()) } });
        break;
      case 'sim':
        setCard({ label: 'Simulazione', title: nx.title, sub: `${nx.sub} · 65′ di fila`, btn: 'Inizia la simulazione', onClick: start, note: 'Sul PC, schermo intero, niente carta e niente pause: come mercoledì 11/11.', alt: { text: 'Non ora: una tappa da 10′', onClick: () => App.path.start(shortStep()) } });
        break;
      case 'rest':
        setCard({ label: 'Martedì 10/11', title: 'Oggi riposo', sub: 'Domani alle 14:00 c\'è la prova. Prepara il posto e dormi: gli esercizi di oggi non cambiano il risultato.', btn: 'Rileggi «Prima della prova»', onClick: () => App.lessons.show('fine', { goText: 'Chiudi' }) });
        break;
      case 'examday':
        setCard({ label: 'Mercoledì 11/11', title: 'Oggi alle 14:00: la prova', sub: 'Durante la prova non aprire quest\'app né Claude. In bocca al lupo.', btn: 'Rileggi «Prima della prova»', onClick: () => App.lessons.show('fine', { goText: 'Chiudi' }) });
        break;
      case 'taper-done':
        setCard({ label: 'Scarico', title: 'Fatto: basta così', sub: 'Fino alla prova solo riposo. Se vuoi, un ripasso leggero degli errori.', btn: 'Ripasso facoltativo', onClick: () => startReview() });
        break;
      default:
        setCard({ label: 'Parte 1', title: 'Parte 1 sostenuta', sub: 'I risultati della Parte 1 arrivano da EPSO dopo la Parte 1. Per la Parte 2 si riparte dal Project.', btn: null });
    }
  }
  // Alternativa breve a una tappa lunga (simulazione, test ufficiale): la prossima del ciclo di allenamento.
  function shortStep() {
    const st = App.path.state();
    const cy = App.path.CYCLE.find((x) => x.kind === 'drill');
    return { ...cy, id: `p2-${st.p2.i}`, p2i: st.p2.i, phase: 'Allenamento' };
  }

  function paintToday(c) {
    const dots = $('today-dots');
    dots.replaceChildren(...Array.from({ length: c.target }, (_, i) => el('span', { class: `dot${i < c.today ? ' on' : ''}` })));
    $('today-text').textContent = c.today >= c.target ? `Oggi ${c.today} tappe: obiettivo fatto` : `Oggi ${c.today} di ${c.target} tappe`;
    $('week-line').textContent = c.total ? `Percorso: ${c.total} ${c.total === 1 ? 'tappa fatta' : 'tappe fatte'}. Un giorno saltato non è un debito.` : '';
  }

  // Promemoria fuori dallo studio ma decisivo per la Parte 1 [V lettera del 19/10]: sparisce con «Fatto» o a scadenza passata.
  function paintTodo() {
    const open = App.path.prereqOpen();
    $('todo-card').hidden = !open;
    if (!open) return;
    const d = daysUntil(App.path.PREREQ.day);
    $('todo-text').replaceChildren(...rich(`Da fare prima della prova: **EU Login con l'app** e **test dei prerequisiti su TAO**, entro ${App.path.PREREQ.label} (${d === 0 ? 'oggi' : d === 1 ? 'domani' : `tra ${d} giorni`}). Senza, un problema tecnico il giorno della prova non dà diritto a ripeterla.`));
  }

  // ── Test di esempio ufficiale (l'unica tappa fuori dall'app) ──
  let officialStep = null;
  function showOfficial(step) {
    officialStep = step || { id: 'b14', title: 'Test di esempio ufficiale su TAO' };
    for (const id of ['off-v', 'off-n', 'off-a']) $(id).value = '';
    App.ui.show('official', { title: 'Test ufficiale' });
  }
  function saveOfficial() {
    const vals = [['verbale', 'off-v', 10], ['numerico', 'off-n', 5], ['astratto', 'off-a', 5]];
    const t = new Date().toISOString();
    let any = false;
    for (const [bank, id, max] of vals) {
      const raw = $(id).value.trim();
      if (raw === '') continue;
      const score = Number(raw);
      if (!Number.isInteger(score) || score < 0 || score > max) { App.ui.toast(`${App.BANK_LABEL[bank]}: un numero da 0 a ${max}.`); return; }
      any = true;
      App.store.addLog({ t, mode: 'external', bank, source: 'Test di esempio EPSO (TAO)', score, max, min: 0, tag: null, note: null });
      App.store.addSession({ t, mode: 'external', banks: [bank], n: max, correct: score, sec: 0, trap: null, source: 'Test di esempio EPSO (TAO)', step: officialStep ? officialStep.id : undefined });
    }
    if (officialStep && officialStep.id === 'b14') App.path.complete(officialStep, {});
    App.ui.toast(any ? 'Registrato: è la tua prima misura.' : 'Segnato come fatto.');
    home();
  }

  // Prima di iniziare qualcosa di nuovo: una sessione in pausa si chiude come parziale, una simulazione in sospeso
  // si abbandona, risultati non ancora chiusi si archiviano. Sempre con conferma (T-009, T-064, T-065).
  async function closePausedIfAny() {
    const sim = App.store.sim();
    if (sim && sim.phase === 'results') {
      const ok = await App.ui.confirm({ title: 'Risultati da rivedere', message: 'Hai i risultati di una simulazione ancora aperti. Chiuderli e iniziare qualcos\'altro? Punteggi ed errori restano nel registro.', okText: 'Chiudi e vai avanti', cancelText: 'Torna indietro' });
      if (!ok) return false;
      App.sim.discard();
    } else if (sim) {
      const ok = await App.ui.confirm({ title: 'Hai una simulazione in corso', message: 'Iniziare qualcos\'altro la abbandona: non verrà conteggiata.', okText: 'Abbandona e vai avanti', cancelText: 'Torna indietro', danger: true });
      if (!ok) return false;
      App.sim.discard();
    }
    const c = App.store.current();
    if (!c) return true;
    const ok = await App.ui.confirm({ title: 'Hai una sessione in pausa', message: `${c.step ? c.step.title : App.session.MODE_LABEL[c.mode]}, ${c.answers.length}/${c.items.length} fatte. Chiuderla (le risposte date restano) e iniziare qualcos'altro?`, okText: 'Chiudi e vai avanti', cancelText: 'Torna indietro' });
    if (ok) App.session.closeAsPartial(c);
    return ok;
  }

  async function startMicro() {
    if (!(await closePausedIfAny())) return;
    const items = App.select.pickMicro();
    if (!items.length) { App.ui.toast('Nessuna domanda disponibile.'); return; }
    App.session.start('micro', items);
  }
  async function startTraining(bank, n) {
    if (!(await closePausedIfAny())) return;
    App.session.start('train', App.select.pickTraining(bank, n), { bankLabel: App.BANK_LABEL[bank] });
  }
  async function startReview() {
    if (!(await closePausedIfAny())) return;
    const items = App.select.forStep({ kind: 'review' });
    if (!items.length) { App.ui.toast('Nessun errore da ripassare: ottimo.'); return; }
    App.session.start('review', items);
  }

  function init() {
    $('app-version').textContent = `v${VERSION}`;
    App.store.settings(); // lettura all'avvio: impostazioni illeggibili segnalate subito (F2-12)
    App.session.init();
    App.sim.init();
    App.calc.init();
    App.stato.init();
    $('btn-home').addEventListener('click', () => {
      if (App.ui.view() === 'session') { App.ui.toast('Usa «Esci» per mettere in pausa.'); return; }
      if (App.ui.view() === 'sim') return;
      home();
    });
    $('btn-micro').addEventListener('click', startMicro);
    $('btn-train-v').addEventListener('click', () => startTraining('verbale', 5));
    $('btn-train-n').addEventListener('click', () => startTraining('numerico', 5));
    $('btn-train-a').addEventListener('click', () => startTraining('astratto', 10));
    $('btn-review').addEventListener('click', startReview);
    $('btn-lessons').addEventListener('click', () => App.lessons.openIndex());
    $('btn-sim').addEventListener('click', async () => { if (await closePausedIfAny()) App.sim.showSetup(); });
    $('btn-official').addEventListener('click', () => showOfficial(App.path.isDone('b14') ? { id: 'extra-official' } : { id: 'b14' }));
    $('off-done').addEventListener('click', saveOfficial);
    $('off-later').addEventListener('click', () => home());
    $('todo-done').addEventListener('click', () => { App.store.setSetting('prereqDone', true); App.ui.toast('Segnato. Un pensiero in meno.'); home(); });
    $('lessons-back').addEventListener('click', () => home());
    // Avvio: la home mostra ciò che era in corso (tappa in pausa, simulazione, risultati) e lo si riprende con un tocco.
    home();
    if (App.sync) App.sync.init();
    registerSW();
  }

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    // Cache offline solo sull'hosting proprio (GitHub Pages) o in locale: sulle anteprime (artifact) ogni versione arriva fresca.
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
  return { home, startMicro, closePausedIfAny, showOfficial, VERSION };
})();
