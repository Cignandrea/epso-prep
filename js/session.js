// Sessioni Micro / Allenamento / Ripasso — namespace App.session
// Un item per volta, ritmo visibile, «Sicuro/Dubbio», feedback subito, registro per item,
// ripresa dalla home dopo un'interruzione (stato salvato a ogni passo).
window.App = window.App || {};
App.session = (() => {
  'use strict';
  const { el, minSec, paragraphs, uid, copyText, dateTimeIt, renderPassage } = App.utils;
  const $ = (id) => document.getElementById(id);

  const MODE_LABEL = { micro: 'Micro', train: 'Allenamento', review: 'Ripasso' };
  let S = null;          // stato della sessione corrente (null quando nessuna sessione è a schermo)
  let tickId = null;
  let itemShownAt = 0;   // epoch ms: quando l'item corrente è apparso (per il tempo)
  let elapsedBefore = 0; // secondi già spesi sull'item (se ripreso o tornati dal background)
  let hiddenSince = 0;   // epoch ms: da quando l'app è in secondo piano (0 = visibile)

  const persist = () => { if (S) App.store.setCurrent(S); };
  const live = () => Boolean(S) && !S.finished && App.ui.view() === 'session';

  function start(mode, questions, { bankLabel = '' } = {}) {
    if (!questions.length) { App.ui.toast('Nessuna domanda disponibile.'); return; }
    const extra = App.plan.today().done; // oltre la sessione del giorno: si registra come «extra», senza pressione
    App.calc.reset();
    S = {
      id: uid(), mode, bankLabel, extra, startedAt: new Date().toISOString(),
      items: questions.map((q) => ({ bank: q.bank, id: q.id })),
      index: 0, phase: 'answer', selected: null, elapsed: 0,
      answers: [], // { bank, id, sel, ok, sec, conf, tag }
    };
    persist();
    App.ui.show('session', { title: MODE_LABEL[mode] });
    renderItem();
  }

  function resume() {
    const c = App.store.current();
    if (!c) return false;
    // Item non più presenti (contenuti aggiornati): si saltano; se non resta nulla, si chiude.
    const valid = c.items.filter((it) => App.banks.question(it.bank, it.id));
    if (valid.length !== c.items.length) {
      const doneIds = new Set(c.answers.map((a) => `${a.bank}#${a.id}`));
      c.items = valid;
      c.index = Math.min(c.items.filter((it) => doneIds.has(`${it.bank}#${it.id}`)).length, Math.max(0, c.items.length - 1));
      c.phase = 'answer'; c.selected = null; c.elapsed = 0;
      if (!c.items.length || c.index >= c.items.length) { closeAsPartial(c); App.ui.toast('La sessione in pausa conteneva domande non più disponibili: chiusa.'); return false; }
      App.store.setCurrent(c);
    }
    S = c;
    App.ui.show('session', { title: MODE_LABEL[S.mode] });
    if (S.phase === 'feedback') { renderItem(); showFeedback(S.answers[S.answers.length - 1], true); }
    else renderItem();
    return true;
  }

  function current() { const it = S.items[S.index]; return App.banks.question(it.bank, it.id); }

  function renderItem() {
    const q = current();
    const pace = App.plan.PACE[q.bank] || 90;
    $('s-counter').textContent = `${S.index + 1} / ${S.items.length}`;
    $('s-mode').textContent = `${MODE_LABEL[S.mode]} · ${App.BANK_LABEL[q.bank] || q.bank}${q.level ? ' L' + q.level : ''}${q.format === 'vfn' ? ' · fondamenta' : ''}`;
    $('s-target').textContent = minSec(pace);
    $('s-tools').hidden = q.bank !== 'numerico';
    if (q.bank !== 'numerico') App.calc.hideAll();
    const p = $('s-passage');
    p.hidden = !q.passage;
    renderPassage(p, q.passage);
    const qn = $('s-question');
    if (q.format === 'vfn') { qn.replaceChildren(el('span', { class: 'q-lead' }, 'In base al brano, questa affermazione è vera, falsa o indecidibile?'), el('br'), el('span', {}, q.question)); }
    else qn.textContent = q.question;
    $('s-options').replaceChildren(...q.options.map((o) => el('button', {
      type: 'button', class: 'opt', 'aria-pressed': String(S.selected === o.letter), dataset: { letter: o.letter },
      onclick: () => choose(o.letter),
    }, el('span', { class: 'opt-radio', 'aria-hidden': 'true' }), el('span', { class: 'opt-letter' }, `${o.letter})`), el('span', { class: 'opt-text' }, o.text))));
    const conf = App.store.settings().confidence;
    $('s-sure').hidden = !conf; $('s-doubt').hidden = !conf; $('s-answer').hidden = conf;
    setActions(S.selected != null);
    $('s-feedback').hidden = true;
    $('s-actions').hidden = false;
    $('s-options').classList.remove('revealed');
    elapsedBefore = S.phase === 'answer' ? (S.elapsed || 0) : 0;
    itemShownAt = Date.now();
    clearInterval(tickId);
    tickId = setInterval(tick, 500);
    tick();
    window.scrollTo(0, 0);
  }

  function paint(sec, pace) {
    $('s-time').textContent = minSec(sec);
    $('s-pace-fill').style.width = `${Math.min(100, (sec / pace) * 100)}%`;
    $('s-pace').classList.toggle('over', sec > pace);
  }

  function tick() {
    if (!S || S.finished || S.phase !== 'answer') return;
    if (document.hidden && hiddenSince) return; // in secondo piano il tempo è fermo: fa fede l'ultimo tick prima di nascondere
    const q = current();
    const pace = App.plan.PACE[q.bank] || 90;
    const sec = elapsedBefore + (Date.now() - itemShownAt) / 1000;
    S.elapsed = sec;
    paint(sec, pace);
    if (Math.round(sec * 2) % 4 === 0) persist();
  }

  function choose(letter) {
    if (!S || S.phase !== 'answer') return;
    S.selected = letter;
    for (const b of $('s-options').querySelectorAll('.opt')) b.setAttribute('aria-pressed', String(b.dataset.letter === letter));
    setActions(true);
    persist();
  }
  function setActions(enabled) { for (const id of ['s-sure', 's-doubt', 's-answer']) $(id).disabled = !enabled; }

  function answer(conf) {
    if (!S || S.phase !== 'answer' || S.selected == null) return;
    clearInterval(tickId);
    const q = current();
    const sec = Math.round(elapsedBefore + (Date.now() - itemShownAt) / 1000);
    const ok = q.correct[0] === S.selected;
    const a = { bank: q.bank, id: q.id, sel: S.selected, ok, sec, conf, tag: q.tag, level: q.level, format: q.format };
    S.answers.push(a);
    S.phase = 'feedback';
    S.elapsed = 0;
    App.store.addLog({ mode: S.mode, session: S.id, ...a });
    persist();
    showFeedback(a, false);
  }

  function showFeedback(a, resumed) {
    const q = App.banks.question(a.bank, a.id);
    const pace = App.plan.PACE[q.bank] || 90;
    paint(a.sec, pace); // anche alla ripresa: il tempo mostrato è quello dell'item appena risposto
    $('s-actions').hidden = true;
    const opts = $('s-options');
    opts.classList.add('revealed');
    for (const b of opts.querySelectorAll('.opt')) {
      b.disabled = true;
      if (b.dataset.letter === q.correct[0]) b.classList.add('is-correct');
      else if (b.dataset.letter === a.sel) b.classList.add('is-wrong');
    }
    const fb = $('s-feedback');
    fb.hidden = false;
    fb.className = `feedback ${a.ok ? 'ok' : 'ko'}`;
    $('s-fb-head').textContent = a.ok ? `Corretta · ${minSec(a.sec)}${a.sec > pace ? ' (oltre il ritmo di ' + minSec(pace) + ')' : ''}` : `Sbagliata · ${minSec(a.sec)}`;
    const correctOpt = q.options.find((o) => o.letter === q.correct[0]);
    $('s-fb-correct').textContent = a.ok ? '' : `Risposta corretta: ${correctOpt.letter}) ${correctOpt.text}`;
    const calib = $('s-fb-calib');
    if (a.conf === 'sure' && !a.ok) { calib.hidden = false; calib.textContent = 'Eri sicuro: questa è una trappola pericolosa, va capita a fondo.'; }
    else if (a.conf === 'doubt' && a.ok) { calib.hidden = false; calib.textContent = 'Giusta, ma in dubbio: in prova, segnalibro e avanti, si torna dopo.'; }
    else if (a.conf === 'doubt' && !a.ok) { calib.hidden = false; calib.textContent = 'Dubbio e sbagliata: il dubbio era fondato. In prova vale il segnalibro.'; }
    else calib.hidden = true;
    $('s-fb-expl').replaceChildren(...paragraphs(q.explanation));
    $('s-fb-tag').textContent = q.tag ? `Trappola: ${App.tagLabel(q.tag)}` : '';
    const last = S.index === S.items.length - 1;
    $('s-next').textContent = last ? 'Fine sessione' : 'Prossima';
    // Si porta in vista l'esito, non il pulsante: il brano resta raggiungibile sopra, la correzione sotto.
    if (!resumed) setTimeout(() => { $('s-fb-head').scrollIntoView({ block: 'start', behavior: 'auto' }); $('s-next').focus({ preventScroll: true }); }, 30);
  }

  function next() {
    if (!S || S.finished || S.phase !== 'feedback') return;
    if (S.index >= S.items.length - 1) { finish(); return; }
    S.index++; S.phase = 'answer'; S.selected = null; S.elapsed = 0;
    persist();
    renderItem();
  }

  // Pausa: lo stato resta salvato (eps2.current), la sessione esce dalla memoria. Si riprende dalla home.
  async function quit() {
    const ok = await App.ui.confirm({ title: 'Interrompere?', message: 'Le risposte date restano nel registro. Puoi riprendere più tardi dalla home, oggi stesso.', okText: 'Metti in pausa', cancelText: 'Continua' });
    if (!ok || !S) return;
    clearInterval(tickId);
    if (S.phase === 'answer') tick();
    persist();
    S = null;
    App.calc.hideAll();
    App.main.home();
  }

  // Chiusura: riepilogo di sessione, log, schermata di fine.
  function finish() {
    if (!S || S.finished) return;
    S.finished = true;
    clearInterval(tickId);
    const answers = S.answers;
    const n = answers.length, correct = answers.filter((a) => a.ok).length;
    const sec = answers.reduce((s, a) => s + a.sec, 0);
    const banks = [...new Set(answers.map((a) => a.bank))];
    const trap = dominantTrap(answers);
    const summary = { mode: S.mode, id: S.id, banks, n, correct, sec, trap, extra: Boolean(S.extra), sure_wrong: answers.filter((a) => a.conf === 'sure' && !a.ok).length, doubt_ok: answers.filter((a) => a.conf === 'doubt' && a.ok).length };
    App.store.addSession(summary);
    App.store.setCurrent(null);
    renderEnd(summary, answers);
    App.ui.show('end', { title: 'Fine sessione' });
  }

  function dominantTrap(answers) {
    const c = {};
    for (const a of answers) if (!a.ok && a.tag) c[a.tag] = (c[a.tag] || 0) + 1;
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : null;
  }

  function renderEnd(sum, answers) {
    const items = S.items;
    $('e-mode').textContent = `${MODE_LABEL[sum.mode]} · ${sum.banks.map((b) => App.BANK_LABEL[b] || b).join(' + ')} · ${dateTimeIt(new Date().toISOString())}`;
    $('e-score').textContent = `${sum.correct}/${sum.n}`;
    const avg = sum.n ? sum.sec / sum.n : 0;
    const paceRef = sum.banks.length === 1 ? App.plan.PACE[sum.banks[0]] : null;
    $('e-pace').textContent = minSec(avg) + (paceRef ? ` / ${minSec(paceRef)}` : '');
    $('e-trap').textContent = sum.trap ? App.tagLabel(sum.trap) : 'nessuna';
    const sentence = [];
    if (sum.n && sum.correct === sum.n) sentence.push('Tutte giuste.');
    if (sum.trap) sentence.push(`Prossima sessione: più attenzione a «${App.tagLabel(sum.trap)}».`);
    if (sum.sure_wrong) sentence.push(`${sum.sure_wrong} error${sum.sure_wrong === 1 ? 'e' : 'i'} da sicuro: ${sum.sure_wrong === 1 ? 'quella è la trappola' : 'quelle sono le trappole'} da capire a fondo.`);
    if (paceRef && avg > paceRef) sentence.push(`Ritmo oltre la prova di ${minSec(avg - paceRef)} a domanda.`);
    if (!sentence.length) sentence.push('Fatto. Basta per questa sessione.');
    $('e-sentence').textContent = sentence.join(' ');
    $('e-more').hidden = sum.mode !== 'micro';
    const wrong = answers.filter((a) => !a.ok);
    $('e-review-wrap').hidden = wrong.length === 0;
    $('e-review').replaceChildren(...wrong.map((a) => {
      const q = App.banks.question(a.bank, a.id);
      const co = q.options.find((o) => o.letter === q.correct[0]);
      return el('div', { class: 'review-item' },
        el('p', { class: 'review-head' }, `#${q.id} · ${App.BANK_LABEL[q.bank]} · ${App.tagLabel(q.tag)}${a.conf === 'sure' ? ' · eri sicuro' : ''}`),
        q.passage ? el('details', {}, el('summary', {}, 'Brano'), ...q.passage.split('\n').map((l) => el('p', {}, l))) : null,
        el('p', { class: 'review-q' }, q.question),
        el('p', {}, `Tua: ${a.sel} · Corretta: ${co.letter}) ${co.text}`),
        el('div', { class: 'review-expl' }, ...paragraphs(q.explanation)));
    }));
    $('e-copy').onclick = async () => { (await copyText(summaryText(sum, answers))) ? App.ui.toast('Riepilogo copiato: incollalo in chat.') : App.ui.toast('Copia non riuscita.'); };
    $('e-more').onclick = async () => {
      if (!(await App.main.closePausedIfAny())) return;
      const more = App.select.pickOneMore(items);
      if (!more) { App.ui.toast('Nessuna domanda nuova disponibile.'); return; }
      start('micro', [more]);
    };
    $('e-done').onclick = () => App.main.home();
  }

  function summaryText(sum, answers) {
    const lines = [`EU Prep Suite — ${MODE_LABEL[sum.mode]} · ${dateTimeIt(new Date().toISOString())}`];
    lines.push(`${sum.banks.map((b) => App.BANK_LABEL[b] || b).join(' + ')} L1 · ${sum.n} domande · ${sum.correct}/${sum.n} · ${minSec(sum.n ? sum.sec / sum.n : 0)} a domanda`);
    const wrong = answers.filter((a) => !a.ok);
    lines.push(wrong.length ? `Errori: ${wrong.map((a) => `#${a.id} (${a.tag}${a.conf === 'sure' ? ', sicuro' : a.conf === 'doubt' ? ', dubbio' : ''}, ${minSec(a.sec)})`).join(' · ')}` : 'Errori: nessuno');
    lines.push(`Calibrazione: ${sum.sure_wrong} sbagliate da sicuro · ${sum.doubt_ok} giuste in dubbio`);
    lines.push(`Trappola dominante: ${sum.trap ? App.tagLabel(sum.trap) : 'nessuna'}`);
    return lines.join('\n');
  }

  function init() {
    $('s-sure').addEventListener('click', () => answer('sure'));
    $('s-doubt').addEventListener('click', () => answer('doubt'));
    $('s-answer').addEventListener('click', () => answer(null));
    $('s-next').addEventListener('click', next);
    $('s-quit').addEventListener('click', quit);
    window.addEventListener('keydown', (e) => {
      if (!live() || App.ui.modalOpen()) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return; // Ctrl+C e simili non sono risposte
      if (e.target.closest('input, textarea, select')) return;
      // Con il fuoco su un pulsante («Dubbio», «Esci», «Prossima»…) Invio e Spazio fanno la loro azione: nessun dirottamento.
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('button, a')) return;
      const k = e.key.toUpperCase();
      if (S.phase === 'answer' && 'ABCDE'.includes(k) && k.length === 1) {
        if (current().options.some((o) => o.letter === k)) choose(k);
      } else if (S.phase === 'answer' && e.key === 'Enter' && S.selected) {
        e.preventDefault();
        answer(App.store.settings().confidence ? 'sure' : null);
      } else if (S.phase === 'answer' && (e.key === 'Backspace' || e.key === '?') && S.selected && App.store.settings().confidence) {
        e.preventDefault();
        answer('doubt');
      } else if (S.phase === 'feedback' && (e.key === 'Enter' || e.key === 'ArrowRight')) {
        e.preventDefault();
        next();
      }
    });
    // T-017/T-066: in secondo piano il tempo dell'item si salva; al ritorno il tempo passato fuori non conta
    // (stesso schema della simulazione). Solo quando la sessione è davvero a schermo.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (live() && S.phase === 'answer') { tick(); persist(); }
        hiddenSince = Date.now();
      } else {
        hiddenSince = 0;
        if (live() && S.phase === 'answer') { elapsedBefore = S.elapsed || 0; itemShownAt = Date.now(); }
      }
    });
    window.addEventListener('pagehide', () => { if (live() && S.phase === 'answer') { tick(); persist(); } });
    App.store.onReset(() => { clearInterval(tickId); S = null; });
  }

  // Sessione lasciata a metà in un giorno precedente: si chiude e si conta ciò che è stato fatto.
  function closeStale() {
    const c = App.store.current();
    if (!c) return;
    if (App.utils.todayKey(new Date(c.startedAt)) === App.utils.todayKey()) return;
    closeAsPartial(c);
  }

  // Chiude una sessione in corso come parziale, datata al giorno in cui è stata fatta.
  function closeAsPartial(c = App.store.current()) {
    if (!c) return;
    if (c.answers.length) {
      const correct = c.answers.filter((a) => a.ok).length;
      App.store.addSession({ t: c.startedAt, mode: c.mode, id: c.id, banks: [...new Set(c.answers.map((a) => a.bank))], n: c.answers.length, correct, sec: c.answers.reduce((s, a) => s + a.sec, 0), trap: dominantTrap(c.answers), partial: true, sure_wrong: c.answers.filter((a) => a.conf === 'sure' && !a.ok).length, doubt_ok: c.answers.filter((a) => a.conf === 'doubt' && a.ok).length });
    }
    App.store.setCurrent(null);
    if (S && S.id === c.id) { clearInterval(tickId); S = null; }
  }

  return { start, resume, init, closeStale, closeAsPartial, MODE_LABEL, isActive: () => Boolean(App.store.current()) };
})();
