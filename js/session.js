// Sessioni Micro / Allenamento / Ripasso — namespace App.session
// Un item per volta, ritmo visibile, «Sicuro/Dubbio», feedback subito, registro per item,
// ripresa automatica dopo un'interruzione (stato salvato a ogni passo).
window.App = window.App || {};
App.session = (() => {
  'use strict';
  const { el, clock, minSec, paragraphs, uid, copyText, dateTimeIt, shuffle } = App.utils;
  const $ = (id) => document.getElementById(id);

  const MODE_LABEL = { micro: 'Micro', train: 'Allenamento', review: 'Ripasso errori' };
  let S = null;          // stato della sessione corrente
  let tickId = null;
  let itemShownAt = 0;   // epoch ms: quando l'item corrente è apparso (per il tempo)
  let elapsedBefore = 0; // secondi già spesi sull'item (se ripreso)

  const persist = () => App.store.setCurrent(S);

  function start(mode, questions, { bankLabel = '' } = {}) {
    if (!questions.length) { App.ui.toast('Nessuna domanda disponibile.'); return; }
    S = {
      id: uid(), mode, bankLabel, startedAt: new Date().toISOString(),
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
    $('s-target').textContent = clock(pace);
    const p = $('s-passage');
    p.hidden = !q.passage;
    renderPassage(p, q.passage);
    $('s-question').textContent = q.question;
    $('s-options').replaceChildren(...q.options.map((o) => el('button', {
      type: 'button', class: 'opt', 'aria-pressed': String(S.selected === o.letter), dataset: { letter: o.letter },
      onclick: () => choose(o.letter),
    }, el('span', { class: 'opt-letter' }, o.letter), el('span', { class: 'opt-text' }, o.text))));
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
    document.querySelector('#view-session .item-layout').scrollTop = 0;
  }

  // Dati tabellari del numerico: righe "a — b — c" diventano una tabella leggibile.
  function renderPassage(node, text) {
    node.replaceChildren();
    if (!text) return;
    const lines = text.split('\n');
    const tableLines = lines.filter((l) => l.includes(' — ') || l.includes(': '));
    if (lines.length > 2 && tableLines.length >= lines.length - 1) {
      const intro = lines[0].includes(' — ') ? null : lines[0];
      if (intro) node.append(el('p', {}, intro));
      const rows = lines.slice(intro ? 1 : 0).map((l) => (l.includes(' — ') ? l.split(' — ') : l.split(/:\s+/)));
      node.append(el('table', { class: 'data-table' }, el('tbody', {}, rows.map((r) => el('tr', {}, r.map((c, i) => el(i === 0 ? 'th' : 'td', { scope: i === 0 ? 'row' : null }, c)))))));
    } else {
      for (const l of lines) node.append(el('p', {}, l));
    }
  }

  function tick() {
    if (!S || S.phase !== 'answer') return;
    const q = current();
    const pace = App.plan.PACE[q.bank] || 90;
    const sec = elapsedBefore + (Date.now() - itemShownAt) / 1000;
    S.elapsed = sec;
    $('s-time').textContent = clock(sec);
    const fill = $('s-pace-fill');
    fill.style.width = `${Math.min(100, (sec / pace) * 100)}%`;
    $('s-pace').classList.toggle('over', sec > pace);
    if (Math.round(sec) % 10 === 0) persist();
  }

  function choose(letter) {
    if (S.phase !== 'answer') return;
    S.selected = letter;
    for (const b of $('s-options').querySelectorAll('.opt')) b.setAttribute('aria-pressed', String(b.dataset.letter === letter));
    setActions(true);
    persist();
  }
  function setActions(enabled) { for (const id of ['s-sure', 's-doubt', 's-answer']) $(id).disabled = !enabled; }

  function answer(conf) {
    if (S.phase !== 'answer' || S.selected == null) return;
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
    $('s-fb-head').textContent = a.ok ? `Corretta · ${minSec(a.sec)}${a.sec > pace ? ' (oltre il ritmo di ' + clock(pace) + ')' : ''}` : `Sbagliata · ${minSec(a.sec)}`;
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
    if (!resumed) $('s-next').focus();
  }

  function next() {
    if (S.phase !== 'feedback') return;
    if (S.index >= S.items.length - 1) { finish(); return; }
    S.index++; S.phase = 'answer'; S.selected = null; S.elapsed = 0;
    persist();
    renderItem();
  }

  async function quit() {
    const ok = await App.ui.confirm({ title: 'Interrompere?', message: 'Le risposte date restano nel registro. Puoi riprendere più tardi dalla home, oggi stesso.', okText: 'Metti in pausa', cancelText: 'Continua' });
    if (!ok) return;
    clearInterval(tickId);
    persist();
    App.main.home();
  }

  // Chiusura: riepilogo di sessione, log, schermata di fine.
  function finish() {
    clearInterval(tickId);
    const answers = S.answers;
    const n = answers.length, correct = answers.filter((a) => a.ok).length;
    const sec = answers.reduce((s, a) => s + a.sec, 0);
    const banks = [...new Set(answers.map((a) => a.bank))];
    const trap = dominantTrap(answers);
    const summary = { mode: S.mode, id: S.id, banks, n, correct, sec, trap, sure_wrong: answers.filter((a) => a.conf === 'sure' && !a.ok).length, doubt_ok: answers.filter((a) => a.conf === 'doubt' && a.ok).length };
    App.store.addSession(summary);
    App.store.setCurrent(null);
    renderEnd(summary, answers);
    S = { ...S, finished: true };
    App.ui.show('end', { title: 'Fine sessione' });
  }

  function dominantTrap(answers) {
    const c = {};
    for (const a of answers) if (!a.ok && a.tag) c[a.tag] = (c[a.tag] || 0) + 1;
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : null;
  }

  function renderEnd(sum, answers) {
    $('e-mode').textContent = `${MODE_LABEL[sum.mode]} · ${sum.banks.map((b) => App.BANK_LABEL[b] || b).join(' + ')} · ${dateTimeIt(new Date().toISOString())}`;
    $('e-score').textContent = `${sum.correct}/${sum.n}`;
    const avg = sum.n ? sum.sec / sum.n : 0;
    const paceRef = sum.banks.length === 1 ? App.plan.PACE[sum.banks[0]] : null;
    $('e-pace').textContent = minSec(avg) + (paceRef ? ` / ${clock(paceRef)}` : '');
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
    $('e-more').onclick = () => {
      const more = App.select.pickOneMore(S.items);
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
      if (App.ui.view() !== 'session' || !S) return;
      if (e.target.closest('input, textarea, select')) return;
      const k = e.key.toUpperCase();
      if (S.phase === 'answer' && 'ABCDE'.includes(k) && k.length === 1) {
        if (current().options.some((o) => o.letter === k)) choose(k);
      } else if (S.phase === 'answer' && e.key === 'Enter' && S.selected) {
        answer(App.store.settings().confidence ? 'sure' : null);
      } else if (S.phase === 'feedback' && (e.key === 'Enter' || e.key === 'ArrowRight')) next();
    });
  }

  // Sessione lasciata a metà in un giorno precedente: si chiude e si conta ciò che è stato fatto.
  function closeStale() {
    const c = App.store.current();
    if (!c) return;
    if (c.startedAt.slice(0, 10) === App.utils.todayKey()) return;
    if (c.answers.length) {
      const correct = c.answers.filter((a) => a.ok).length;
      App.store.addSession({ mode: c.mode, id: c.id, banks: [...new Set(c.answers.map((a) => a.bank))], n: c.answers.length, correct, sec: c.answers.reduce((s, a) => s + a.sec, 0), trap: dominantTrap(c.answers), partial: true, sure_wrong: 0, doubt_ok: 0 });
    }
    App.store.setCurrent(null);
  }

  return { start, resume, init, closeStale, MODE_LABEL, isActive: () => Boolean(App.store.current()) };
})();
