// Bootstrap, home, service worker — namespace App.main
// La home ha un solo pulsante: «Continua» riprende ciò che è in pausa o avvia la prossima tappa del percorso.
// Tutto il resto (Micro, allenamento libero, schede, simulazione a scelta) sta sotto «Altro».
window.App = window.App || {};
App.main = (() => {
  'use strict';
  const { el, rich, daysUntil, todayKey, dateIt } = App.utils;
  const $ = (id) => document.getElementById(id);
  // Versione dell'app: deve coincidere con VERSION in sw.js (controllo nei test).
  const VERSION = '1.2.0-b7';

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

  // Conto alla rovescia: il numero grande sono i giorni, sotto data e ora della prova.
  function paintHead(now = new Date()) {
    const d = App.path.daysToExam(now);
    const days = $('home-days'), unit = $('home-unit'), when = $('home-countdown');
    if (d < 0) { days.textContent = '✓'; unit.textContent = 'Parte 1 sostenuta'; when.textContent = 'mer 11/11 · i risultati arrivano da EPSO'; return; }
    if (d === 0) { days.textContent = '0'; unit.textContent = 'Oggi la Parte 1'; when.textContent = 'alle 14:00, ora di Bruxelles'; return; }
    days.textContent = String(d);
    unit.textContent = d === 1 ? 'giorno alla Parte 1' : 'giorni alla Parte 1';
    when.textContent = 'mer 11/11 · 14:00';
  }

  // Calendario fino alla prova: una casella per giorno, la barra sono le tappe fatte rispetto all'obiettivo del giorno.
  const CAL_START = '2026-10-23';
  const CAL_MARKS = { '2026-10-31': 'S1', '2026-11-07': 'S2', '2026-11-06': 'PR', '2026-11-10': 'R', '2026-11-11': 'P1' };
  const MARK_LABEL = { S1: 'simulazione n. 1', S2: 'simulazione n. 2', PR: 'test dei prerequisiti entro le 11:59', R: 'riposo', P1: 'Parte 1 alle 14:00' };
  function paintCalendar(now = new Date()) {
    const today = todayKey(now);
    const counts = App.path.dayCounts();
    const [y, m, dd] = CAL_START.split('-').map(Number);
    const days = [];
    for (const d = new Date(y, m - 1, dd, 12); todayKey(d) <= App.path.EXAM.day; d.setDate(d.getDate() + 1)) days.push(new Date(d));
    const strip = $('cal-strip');
    strip.style.setProperty('--days', String(days.length));
    strip.replaceChildren(...days.map((d) => {
      const k = todayKey(d), dow = d.getDay(), weekend = dow === 0 || dow === 6;
      const n = counts[k] || 0;
      const target = weekend ? App.path.PER_DAY_WEEKEND : App.path.PER_DAY;
      const cls = ['cal-day', k < today ? 'is-past' : k === today ? 'is-today' : 'is-future', weekend && 'is-weekend', k === App.path.EXAM.day && 'is-exam', k === App.path.REST && 'is-rest'].filter(Boolean).join(' ');
      const fill = el('i');
      fill.style.setProperty('--fill', String(Math.min(1, n / target)));
      const mark = CAL_MARKS[k] || '';
      const label = `${dateIt(d)}${k === today ? ' (oggi)' : ''}: ${n === 1 ? '1 tappa' : `${n} tappe`}${mark ? ` · ${MARK_LABEL[mark]}` : ''}`;
      return el('li', { class: cls, title: label, 'aria-label': label },
        el('span', { class: 'cal-dow', 'aria-hidden': 'true' }, 'DLMMGVS'[dow]),
        el('span', { class: 'cal-num', 'aria-hidden': 'true' }, String(d.getDate())),
        el('span', { class: 'cal-bar', 'aria-hidden': 'true' }, fill),
        el('span', { class: 'cal-mark', 'aria-hidden': 'true' }, mark));
    }));
  }

  function setCard({ label = '', title = '', sub = '', btn = null, meta = '', onClick = null, note = '', alt = null }) {
    $('next-label').textContent = label;
    $('next-title').textContent = title;
    $('next-sub').textContent = sub;
    $('btn-next').hidden = !btn;
    if (btn) { $('btn-next').replaceChildren(el('span', {}, btn), meta ? el('span', { class: 'btn-meta' }, meta) : ''); $('btn-next').onclick = onClick; }
    $('next-note').hidden = !note;
    $('next-note').textContent = note;
    $('btn-alt').hidden = !alt;
    if (alt) { $('btn-alt').textContent = alt.text; $('btn-alt').onclick = alt.onClick; }
  }

  function homeView() {
    App.session.closeStale();
    App.sim.closeStale();
    App.calc.hideAll();
    paintHead();
    paintCalendar();
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
    try { App.ready.render($('home-gauges')); } catch (err) { console.warn('soglie non calcolabili', err); $('home-gauges').replaceChildren(); }
    App.ui.show('home', { title: '' });
  }

  function pathCard(nx, c) {
    const start = () => App.path.start(nx);
    const first = c.total === 0;
    const later = () => { const s = shortStep(); return { text: `Non ora: ${s.title} · ${s.min}′`, onClick: () => App.path.start(s) }; };
    // In settimana la simulazione resta a portata di mano accanto alla tappa del giorno.
    const simAlt = nx.simAlt ? { text: `Oppure: ${nx.simAlt.title} · 65′`, onClick: () => App.path.start(nx.simAlt) } : null;
    const meta = (min) => (min ? `${min}′ →` : '→');
    switch (nx.kind) {
      case 'lesson': case 'drill': case 'review': {
        const label = nx.phase === 'Basi' && nx.index ? `Basi · tappa ${nx.index} di ${nx.of}` : `${nx.phase} · tappa ${c.total + 1}`;
        const note = first ? 'Puoi fermarti quando vuoi: alla riapertura riparti dallo stesso punto.'
          : nx.boosted ? 'In questa prova vai forte: la scheda resta, le domande sono di livello prova.'
          : (nx.lesson && nx.phase !== 'Basi' ? 'Prima del drill, la scheda di questa prova che non avevi ancora letto.' : nx.why || '');
        setCard({ label, title: nx.title, sub: nx.sub, btn: first ? 'Inizia' : 'Continua', meta: meta(nx.min), onClick: start, note, alt: simAlt });
        break;
      }
      case 'block':
        setCard({ label: 'Allenamento · blocco a tempo', title: nx.title, sub: nx.sub, btn: 'Inizia il blocco', meta: meta(nx.min), onClick: start, note: 'Come in TAO: nessuna correzione fino alla fine, con segnalibro e panoramica. Allena la gestione del tempo.', alt: simAlt || later() });
        break;
      case 'official':
        setCard({ label: 'Fuori dall\'app', title: nx.title, sub: nx.sub, btn: 'Apri', meta: meta(0), onClick: () => showOfficial(nx), alt: later() });
        break;
      case 'sim':
        if (nx.mode === 'baseline') {
          setCard({ label: `Basi · tappa ${nx.index} di ${nx.of}`, title: nx.title, sub: nx.sub, btn: 'Inizia la misura', meta: meta(nx.min), onClick: start, note: 'Serve a capire da dove parti: il percorso darà più spazio a ciò che serve. Meglio sul PC o sul telefono aperto, senza pause.', alt: later() });
        } else {
          setCard({ label: 'Simulazione · Parte 1 completa', title: nx.title, sub: nx.sub, btn: 'Inizia la simulazione', meta: '65′ →', onClick: start, note: 'Sul PC, schermo intero, niente carta e niente pause: come mercoledì 11/11.', alt: later() });
        }
        break;
      case 'rest':
        setCard({ label: 'Martedì 10/11', title: 'Oggi riposo', sub: 'Domani alle 14:00 c\'è la prova. Prepara il posto e dormi: gli esercizi di oggi non cambiano il risultato.', btn: 'Rileggi «Prima della prova»', meta: meta(0), onClick: () => App.lessons.show('fine', { goText: 'Chiudi' }) });
        break;
      case 'examday':
        setCard({ label: 'Mercoledì 11/11', title: 'Oggi alle 14:00: la prova', sub: 'Durante la prova non aprire quest\'app né Claude. In bocca al lupo.', btn: 'Rileggi «Prima della prova»', meta: meta(0), onClick: () => App.lessons.show('fine', { goText: 'Chiudi' }) });
        break;
      case 'taper-wait':
        setCard({ label: 'Scarico', title: 'Per oggi basta', sub: 'Domani, lunedì 09/11, le ultime tappe leggere: un verbale breve e «Prima della prova», con il PC da preparare.', btn: null, alt: { text: 'Ripasso facoltativo degli errori', onClick: () => startReview() } });
        break;
      case 'taper-done':
        setCard({ label: 'Scarico', title: 'Fatto: basta così', sub: 'Fino alla prova solo riposo. Se vuoi, un ripasso leggero degli errori.', btn: 'Ripasso facoltativo', meta: meta(0), onClick: () => startReview() });
        break;
      default:
        setCard({ label: 'Parte 1', title: 'Parte 1 sostenuta', sub: 'I risultati della Parte 1 arrivano da EPSO dopo la Parte 1. Per la Parte 2 si riparte dal Project.', btn: null });
    }
  }
  // Alternativa breve a una tappa lunga (simulazione, misura, blocco): la prossima tappa vera del percorso.
  const shortStep = () => App.path.shortStep();

  function paintToday(c) {
    $('today-dots').replaceChildren(...Array.from({ length: c.target }, (_, i) => el('span', { class: `seg${i < c.today ? ' on' : ''}` })));
    $('today-text').textContent = c.today >= c.target ? `Oggi ${c.today} tappe: obiettivo fatto` : `Oggi ${c.today} di ${c.target} tappe`;
    $('week-line').textContent = c.total ? `Percorso: ${c.total} ${c.total === 1 ? 'tappa fatta' : 'tappe fatte'}. Un giorno saltato non è un debito.` : 'Un giorno saltato non è un debito: il percorso riparte da dove sei.';
  }

  // Promemoria fuori dallo studio ma decisivo per la Parte 1 [V lettera del 19/10]: sparisce con «Fatto» o a scadenza passata.
  function paintTodo() {
    const open = App.path.prereqOpen();
    $('todo-card').hidden = !open;
    if (!open) return;
    const d = daysUntil(App.path.PREREQ.day);
    $('todo-text').replaceChildren(...rich(`**EU Login con l'app** e **test dei prerequisiti su TAO**, sul PC della prova, entro **${App.path.PREREQ.label}** (${d === 0 ? 'oggi' : d === 1 ? 'domani' : `tra ${d} giorni`}). Senza, un problema tecnico il giorno della prova non dà diritto a ripeterla. Nella stessa seduta: il test di esempio pubblico, per conoscere la piattaforma.`));
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
    App.store.setSetting('officialDone', true);
    App.ui.toast(any ? 'Registrato nello Stato.' : 'Segnato come fatto.');
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
    $('btn-official').addEventListener('click', () => showOfficial({ id: 'extra-official', title: 'Test di esempio ufficiale su TAO' }));
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
