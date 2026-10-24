// Bootstrap, home, service worker — namespace App.main
// La home ha un solo pulsante: «Continua» riprende ciò che è in pausa o avvia la prossima tappa del percorso.
// Tutto il resto (Micro, allenamento libero, schede, simulazione a scelta) sta sotto «Altro».
window.App = window.App || {};
App.main = (() => {
  'use strict';
  const { el, rich, daysUntil, todayKey, dateIt } = App.utils;
  const $ = (id) => document.getElementById(id);
  // Versione dell'app: deve coincidere con VERSION in sw.js (controllo nei test).
  const VERSION = '1.2.0-b11';

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
    const sim = App.store.sim();
    const cur = App.store.current();
    const c = App.path.counts();
    if (sim && sim.phase === 'results') {
      setCard({ label: 'Simulazione completata', title: 'Rivedi i risultati', sub: 'La revisione resta qui finché non premi «Chiudi».', btn: 'Rivedi i risultati', onClick: () => App.sim.resume() });
    } else if (sim) {
      setCard({ label: 'In corso', title: 'Simulazione', sub: 'Il tempo continua a scorrere, come nella prova vera: riprendi subito.', btn: 'Riprendi la simulazione', onClick: () => App.sim.resume() });
    } else if (cur && cur.step) {
      // In pausa c'è una tappa del percorso: riprenderla È la prossima tappa.
      const where = cur.lessonId && !cur.lessonSeen ? 'dalla scheda' : `dalla domanda ${Math.min(cur.answers.length + 1, cur.items.length)} di ${cur.items.length}`;
      setCard({ label: 'In pausa', title: cur.step.title, sub: `Riprendi ${where}: niente è andato perso.`, btn: 'Riprendi', onClick: () => App.session.resume() });
    } else {
      // Un allenamento libero in pausa non copre il percorso: la tappa resta in primo piano, la sessione va sotto.
      pathCard(App.path.next(), c, cur);
    }
    paintToday(c);
    paintNudge();
    App.ui.show('home', { title: '' });
  }

  function pathCard(nx, c, paused = null) {
    // Con una sessione libera in pausa, iniziare una tappa chiede prima di chiuderla (le risposte date restano).
    const go = (step) => async () => { if (paused && !(await closePausedIfAny())) return; App.path.start(step); };
    const start = go(nx);
    const first = c.total === 0;
    const resumeAlt = paused ? { text: `In pausa: ${App.session.MODE_LABEL[paused.mode] || 'sessione'}, ${paused.answers.length} di ${paused.items.length} fatte · Riprendi`, onClick: () => App.session.resume() } : null;
    const later = () => { if (resumeAlt) return resumeAlt; const s = shortStep(); return { text: `Non ora: ${s.title} · ${s.min}′`, onClick: go(s) }; };
    // In settimana la simulazione resta a portata di mano accanto alla tappa del giorno.
    const simAlt = resumeAlt || (nx.simAlt ? { text: `Oppure: ${nx.simAlt.title} · 65′`, onClick: go(nx.simAlt) } : null);
    const meta = (min) => (min ? `${min}′ →` : '→');
    switch (nx.kind) {
      case 'lesson': case 'drill': case 'review': {
        const label = nx.phase === 'Basi' && nx.index ? `Basi · tappa ${nx.index} di ${nx.of}` : `${nx.phase} · tappa ${c.total + 1}`;
        const note = first ? 'Puoi fermarti quando vuoi: riparti dallo stesso punto.'
          : (nx.lesson && nx.phase !== 'Basi' ? 'Prima del drill, la scheda di questa prova che non avevi ancora letto.' : nx.why || '');
        setCard({ label, title: nx.title, sub: nx.sub, btn: first ? 'Inizia' : 'Continua', meta: meta(nx.min), onClick: start, note, alt: simAlt });
        break;
      }
      case 'block':
        setCard({ label: 'Allenamento · blocco a tempo', title: nx.title, sub: nx.sub, btn: 'Inizia il blocco', meta: meta(nx.min), onClick: start, note: 'Come in TAO: la correzione arriva alla fine.', alt: simAlt || later() });
        break;
      case 'official':
        setCard({ label: 'Fuori dall\'app', title: nx.title, sub: nx.sub, btn: 'Apri', meta: meta(0), onClick: () => showOfficial(nx), alt: later() });
        break;
      case 'sim':
        if (nx.mode === 'baseline') {
          setCard({ label: `Basi · tappa ${nx.index} di ${nx.of}`, title: nx.title, sub: nx.sub, btn: 'Inizia la misura', meta: meta(nx.min), onClick: start, note: 'Senza pause, sul dispositivo dove segui il percorso.', alt: later() });
        } else {
          setCard({ label: 'Simulazione · Parte 1 completa', title: nx.title, sub: nx.sub, btn: 'Inizia la simulazione', meta: '65′ →', onClick: start, note: 'Sul PC, a schermo intero, senza pause. Alla fine esporta i dati e importali sul telefono.', alt: later() });
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
    // Nei giorni senza alternativa (riposo, scarico) la sessione in pausa resta comunque raggiungibile.
    if (resumeAlt && $('btn-alt').hidden) { $('btn-alt').hidden = false; $('btn-alt').textContent = resumeAlt.text; $('btn-alt').onclick = resumeAlt.onClick; }
  }
  // Alternativa breve a una tappa lunga (simulazione, misura, blocco): la prossima tappa vera del percorso.
  const shortStep = () => App.path.shortStep();

  function paintToday(c) {
    $('today-dots').replaceChildren(...Array.from({ length: c.target }, (_, i) => el('span', { class: `seg${i < c.today ? ' on' : ''}` })));
    $('today-text').textContent = c.today >= c.target ? `Oggi ${c.today} tappe: obiettivo fatto` : `Oggi ${c.today} di ${c.target} tappe`;
  }

  // ── Agenda: calendario, cose da fare fuori dall'app, date ──
  const shortDate = (key) => { const d = new Date(`${key}T12:00:00`); return `${'dom lun mar mer gio ven sab'.split(' ')[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`; };
  const inDays = (key) => { const d = daysUntil(key); return d <= 0 ? 'oggi' : d === 1 ? 'domani' : `tra ${d} giorni`; };
  // Testi delle cose da fare [V lettera del 19/10; bando, Allegato I §1 e §7]
  function todoInfo(t) {
    switch (t.id) {
      case 'prereq': return { title: 'EU Login con l\'app e test dei prerequisiti su TAO', when: `entro ${App.path.PREREQ.label} · ${inDays(t.due)}`, detail: 'Sul PC e nel posto della prova, meglio entro mar 27/10. Senza, un problema tecnico il giorno della prova non dà diritto a ripeterla.', btn: 'Fatto', short: 'prerequisiti su TAO' };
      case 'leave': return { title: 'Permesso dal lavoro per mer 11/11 pomeriggio', when: 'prima possibile', detail: 'La prova non si sposta per impegni di lavoro.', btn: 'Fatto', short: 'permesso per l\'11/11' };
      case 'portal': return { title: 'Controlla le comunicazioni nel portale EPSO', when: t.urgent ? 'da fare oggi' : `prossimo controllo ${shortDate(t.due)}`, detail: `Il bando chiede almeno ogni 3 giorni. Ultimo controllo: ${shortDate(t.last)}.`, btn: 'Controllato oggi', short: 'controlla il portale' };
      case 'complaints': return { title: 'Reclami, se servono', when: `entro ${App.path.COMPLAINTS.label} · ${inDays(t.due)}`, detail: 'Domanda errata o problema tecnico, dal tuo account EPSO. Se non ne hai, premi «Nessun reclamo».', btn: 'Nessun reclamo', short: 'reclami entro il 14/11' };
      default: return null;
    }
  }
  function doneTodo(id) {
    const key = { prereq: 'prereqDone', leave: 'leaveDone', complaints: 'complaintsDone' }[id];
    if (key) App.store.setSetting(key, true);
    if (id === 'portal') App.store.setSetting('portalChecked', todayKey());
    App.ui.toast('Segnato.');
    paintAgenda();
    paintBadge();
  }
  function paintTodos() {
    const list = App.path.todos();
    $('todo-list').replaceChildren(...list.map((t) => {
      const info = todoInfo(t);
      return el('li', { class: `todo-item${t.urgent ? ' is-urgent' : ''}` },
        el('div', { class: 'todo-body' },
          el('p', { class: 'todo-title' }, info.title),
          el('p', { class: 'todo-when' }, info.when),
          el('p', { class: 'todo-detail' }, info.detail)),
        el('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => doneTodo(t.id) }, info.btn));
    }));
    $('todo-empty').hidden = list.length > 0;
  }
  // Le date che contano, in ordine; quelle passate restano in grigio.
  const DATES = [
    { key: '2026-10-31', text: 'Simulazione n. 1, sul PC (fino a ven 06/11)' },
    { key: '2026-11-06', text: 'Scadenza dei prerequisiti su TAO, alle 11:59' },
    { key: '2026-11-07', text: 'Simulazione n. 2, sul PC, se puoi alle 14:00' },
    { key: '2026-11-10', text: 'Riposo' },
    { key: '2026-11-11', text: 'Parte 1, alle 14:00 (ora di Bruxelles, la stessa dell\'Italia)' },
    { key: '2026-11-14', text: 'Ultimo giorno per i reclami' },
  ];
  function paintDates() {
    const today = todayKey();
    $('date-list').replaceChildren(...DATES.map((d) => el('li', { class: `date-row${d.key < today ? ' is-past' : ''}${d.key === App.path.EXAM.day ? ' is-exam' : ''}` },
      el('span', { class: 'date-when' }, shortDate(d.key)), el('span', { class: 'date-what' }, d.text))));
  }
  function paintAgenda() { paintCalendar(); paintTodos(); paintDates(); }
  function agendaView() { App.calc.hideAll(); paintAgenda(); paintBadge(); App.ui.show('agenda', { title: '' }); }
  function trainView() { App.calc.hideAll(); App.ui.show('train', { title: '' }); }
  // Pallino sull'Agenda e una riga in «Oggi» solo quando una scadenza è vicina.
  function paintBadge() { $('agenda-badge').hidden = !App.path.todos().some((t) => t.urgent); }
  function paintNudge() {
    const urgent = App.path.todos().filter((t) => t.urgent);
    paintBadge();
    const n = $('home-nudge');
    n.hidden = !urgent.length;
    if (!urgent.length) return;
    const first = todoInfo(urgent[0]);
    n.replaceChildren(el('span', { class: 'nudge-dot', 'aria-hidden': 'true' }), el('span', {}, `Da fare: ${first.short}${urgent.length > 1 ? ` e altre ${urgent.length - 1}` : ''}`), el('span', { class: 'nudge-go', 'aria-hidden': 'true' }, '→'));
    n.onclick = agendaView;
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
    $('nav-home').addEventListener('click', () => { if (App.ui.view() !== 'session' && App.ui.view() !== 'sim') home(); });
    $('nav-train').addEventListener('click', trainView);
    $('nav-agenda').addEventListener('click', agendaView);
    $('lessons-back').addEventListener('click', () => trainView());
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
