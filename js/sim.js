// Simulazione: clone della piattaforma TAO — namespace App.sim
// Verificato sul test di esempio EPSO (08/10/2026): navigazione libera, segnalibro, panoramica con
// All / Bookmarked / Incomplete, «Submit this part», timer in alto, calcolatrice e scratchpad,
// nessuna correzione prima della consegna.
window.App = window.App || {};
App.sim = (() => {
  'use strict';
  const { el, taoClock, minSec, clock, paragraphs, uid, copyText, dateTimeIt, isTouchPhone } = App.utils;
  const $ = (id) => document.getElementById(id);

  const SECTION_DEF = {
    verbale: { bank: 'verbale', name: 'Verbal', label: 'Verbal Reasoning', n: 20, minutes: 35 },
    numerico: { bank: 'numerico', name: 'Numerical', label: 'Numerical Reasoning', n: 10, minutes: 20 },
  };

  let SIM = null;
  let tickId = null;
  let shownAt = 0;
  let overviewFilter = 'all';

  const persist = () => App.store.setSim(SIM);

  // ── Setup ──
  function showSetup() {
    $('sim-device-note').hidden = !(matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 1);
    const rep = App.select.poolReport();
    $('sim-pool-note').textContent = `Domande mai usate in simulazione: verbale ${rep.verbale.freshForSim}/${rep.verbale.total}, numerico ${rep.numerico.freshForSim}/${rep.numerico.total} (livello L1; il livello EPSO arriva con la v1.2).`;
    App.ui.show('sim-setup', { title: 'Simulazione' });
  }

  function startFromSetup() {
    const scope = document.querySelector('input[name="sim-scope"]:checked').value;
    const timerMode = document.querySelector('input[name="sim-timer"]:checked').value;
    const defs = scope === 'full' ? [SECTION_DEF.verbale, SECTION_DEF.numerico] : [SECTION_DEF[scope]];
    const sections = [];
    for (const d of defs) {
      const pick = App.select.pickSim(d.bank, d.n);
      if (pick.items.length < d.n) {
        App.ui.toast(`Domande insufficienti per ${App.BANK_LABEL[d.bank]}: ${pick.items.length}/${d.n}. Servono le batterie L2.`);
        if (pick.items.length === 0) return;
      }
      const n = pick.items.length;
      const minutes = n === d.n ? d.minutes : Math.max(1, Math.round((n * d.minutes) / d.n));
      sections.push({ ...d, n, minutes, reduced: n < d.n, items: pick.items.map((q) => ({ bank: q.bank, id: q.id })), fresh: pick.fresh, answers: {}, bookmarks: {}, time: {}, status: 'pending', deadline: null, startedAt: null, submittedAt: null, byTimeout: false });
    }
    // In modalità "timer unico" le sezioni formano una sola unità navigabile, come nel test di esempio.
    const units = timerMode === 'single'
      ? [{ sections: sections.map((_, i) => i), minutes: sections.reduce((s, x) => s + x.minutes, 0) }]
      : sections.map((_, i) => ({ sections: [i], minutes: sections[i].minutes }));
    SIM = { id: uid(), startedAt: new Date().toISOString(), scope, timerMode, sections, units, unit: 0, pos: 0, phase: 'intro', deadline: null, byTimeout: false };
    persist();
    App.calc.reset();
    App.ui.show('sim');
    renderIntro();
  }

  // Una simulazione iniziata in un giorno precedente e mai consegnata si chiude come abbandonata:
  // non consuma il pool e non entra nel registro.
  function closeStale() {
    const sim = App.store.sim();
    if (!sim || sim.phase === 'results') return;
    if (App.utils.todayKey(new Date(sim.startedAt)) === App.utils.todayKey()) return;
    App.store.setSim(null);
    App.ui.toast('La simulazione lasciata a metà in un giorno precedente è stata chiusa senza conteggio.', 5000);
  }

  function resume() {
    SIM = App.store.sim();
    if (!SIM) return false;
    if (SIM.phase !== 'results' && SIM.sections.some((sec) => sec.items.some((it) => !App.banks.question(it.bank, it.id)))) {
      App.store.setSim(null); SIM = null;
      App.ui.toast('La simulazione in sospeso usava domande non più disponibili: chiusa senza conteggio.', 5000);
      App.main.home();
      return false;
    }
    App.ui.show('sim');
    if (SIM.phase === 'intro') renderIntro();
    else if (SIM.phase === 'running' || SIM.phase === 'overview') { startTick(); renderItem(); if (SIM.phase === 'overview') openOverview(); }
    else if (SIM.phase === 'results') showResults();
    return true;
  }

  // ── Unità (una sezione, o tutte con timer unico) ──
  const unitItems = () => SIM.units[SIM.unit].sections.flatMap((si) => SIM.sections[si].items.map((it, k) => ({ ...it, si, k })));
  const sectionOf = (pos) => SIM.sections[unitItems()[pos].si];

  function renderIntro() {
    const u = SIM.units[SIM.unit];
    const secs = u.sections.map((si) => SIM.sections[si]);
    $('tao-intro').hidden = false; $('tao-body').hidden = true; document.querySelector('.tao-footer').hidden = true;
    $('tao-section-name').textContent = secs.map((s) => s.name).join(' + ');
    $('tao-item-id').textContent = ''; $('tao-item-sep').hidden = true;
    $('tao-timer').textContent = taoClock(u.minutes * 60);
    $('tao-intro-title').textContent = secs.map((s) => `${s.label} · ${s.n} questions${s.reduced ? ' (reduced: question pool)' : ''}`).join(' / ');
    $('tao-intro-text').textContent = `${u.minutes} minutes. You can move freely between questions, bookmark them and review them in the overview before submitting. No feedback is given until the end. ${secs.length > 1 ? 'A single timer covers all sections, as in the EPSO sample test.' : 'The timer starts when you press Start.'} Contenuti di livello L1: brani più corti e tabelle più semplici della prova reale (livello EPSO dalla v1.2).`;
    $('tao-intro-start').onclick = startUnit;
  }

  function startUnit() {
    const u = SIM.units[SIM.unit];
    const now = Date.now();
    SIM.deadline = now + u.minutes * 60000;
    for (const si of u.sections) { SIM.sections[si].status = 'running'; SIM.sections[si].startedAt = new Date(now).toISOString(); }
    SIM.phase = 'running'; SIM.pos = 0;
    persist();
    startTick();
    renderItem();
  }

  function startTick() { clearInterval(tickId); tickId = setInterval(tick, 500); tick(); }
  function tick() {
    if (!SIM || (SIM.phase !== 'running' && SIM.phase !== 'overview')) return;
    const left = (SIM.deadline - Date.now()) / 1000;
    $('tao-timer').textContent = taoClock(left);
    if (left <= 0) submitUnit(true);
  }

  function accrue() {
    if (!SIM || SIM.phase !== 'running' || !shownAt) return;
    const it = unitItems()[SIM.pos];
    const s = SIM.sections[it.si];
    s.time[it.id] = (s.time[it.id] || 0) + (Date.now() - shownAt) / 1000;
    shownAt = Date.now();
  }

  function renderItem() {
    $('tao-intro').hidden = true; $('tao-body').hidden = false; document.querySelector('.tao-footer').hidden = false; $('tao-overview').hidden = true;
    const items = unitItems();
    const it = items[SIM.pos];
    const s = SIM.sections[it.si];
    const q = App.banks.question(it.bank, it.id);
    $('tao-section-name').textContent = s.name;
    $('tao-item-id').textContent = `IT${String(q.id).padStart(4, '0')}`; $('tao-item-sep').hidden = false;
    const p = $('tao-passage');
    p.hidden = !q.passage;
    renderPassageInto(p, q.passage);
    applyHighlights(p, (s.hl && s.hl[it.id]) || []);
    $('tao-question').textContent = q.question;
    const sel = s.answers[it.id] || null;
    $('tao-options').replaceChildren(...q.options.map((o) => el('label', { class: `tao-opt${sel === o.letter ? ' checked' : ''}` },
      el('input', { type: 'radio', name: 'tao-answer', value: o.letter, checked: sel === o.letter, onchange: () => select(o.letter) }),
      el('span', { class: 'tao-opt-letter' }, `${o.letter})`), el('span', { class: 'tao-opt-text' }, o.text))));
    $('tao-bookmark').setAttribute('aria-pressed', String(Boolean(s.bookmarks[it.id])));
    $('tao-bookmark').classList.toggle('on', Boolean(s.bookmarks[it.id]));
    $('tao-prev').disabled = SIM.pos === 0;
    $('tao-next').disabled = SIM.pos === items.length - 1;
    $('tao-overview-n').textContent = items.length;
    renderBubbles();
    $('tao-body').scrollTop = 0;
    shownAt = Date.now();
    persist();
  }

  function renderPassageInto(node, text) {
    node.replaceChildren();
    if (!text) return;
    const lines = text.split('\n');
    if (lines.length > 2 && lines.filter((l) => l.includes(' — ') || /:\s/.test(l)).length >= lines.length - 1) {
      const intro = lines[0].includes(' — ') ? null : lines[0];
      if (intro) node.append(el('p', {}, intro));
      const rows = lines.slice(intro ? 1 : 0).map((l) => (l.includes(' — ') ? l.split(' — ') : l.split(/:\s+/)));
      node.append(el('table', { class: 'data-table tao-table' }, el('tbody', {}, rows.map((r) => el('tr', {}, r.map((c, i) => el(i === 0 ? 'th' : 'td', {}, c)))))));
    } else for (const l of lines) node.append(el('p', {}, l));
  }

  // Barra di navigazione come in TAO: al massimo 11 bolle visibili, «…» ai lati per spostare la finestra.
  let bubbleStart = 0;
  function renderBubbles() {
    const items = unitItems();
    const box = $('tao-bubbles');
    const W = Math.max(5, Math.min(11, Math.floor((box.clientWidth || 480) / 44)));
    if (SIM.pos < bubbleStart || SIM.pos >= bubbleStart + W) bubbleStart = Math.max(0, Math.min(items.length - W, SIM.pos - Math.floor(W / 2)));
    bubbleStart = Math.max(0, Math.min(bubbleStart, Math.max(0, items.length - W)));
    const nodes = [];
    if (bubbleStart > 0) nodes.push(el('button', { type: 'button', class: 'tao-ellipsis', 'aria-label': 'Previous questions', tabindex: '-1', onclick: () => { bubbleStart = Math.max(0, bubbleStart - W); renderBubbles(); } }, '…'));
    for (let i = bubbleStart; i < Math.min(items.length, bubbleStart + W); i++) {
      const it = items[i];
      const s = SIM.sections[it.si];
      const answered = Boolean(s.answers[it.id]), marked = Boolean(s.bookmarks[it.id]);
      nodes.push(el('button', { type: 'button', class: `tao-bubble${i === SIM.pos ? ' current' : ''}${answered ? ' answered' : ''}${marked ? ' marked' : ''}`, tabindex: i === SIM.pos ? '0' : '-1', 'aria-current': i === SIM.pos ? 'true' : null, 'aria-label': `Question ${i + 1}${answered ? ', answered' : ', not answered'}${marked ? ', bookmarked' : ''}`, onclick: () => goTo(i) }, String(i + 1)));
    }
    if (bubbleStart + W < items.length) nodes.push(el('button', { type: 'button', class: 'tao-ellipsis', 'aria-label': 'Next questions', tabindex: '-1', onclick: () => { bubbleStart = Math.min(items.length - W, bubbleStart + W); renderBubbles(); } }, '…'));
    box.replaceChildren(...nodes);
  }

  // ── Evidenziatore: la selezione nel brano diventa <mark>; un click sulla marca la toglie. Salvato per item. ──
  let highlightMode = false;
  function textOffsets(root, range) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let pos = 0, start = -1, end = -1, node;
    while ((node = walker.nextNode())) {
      if (node === range.startContainer) start = pos + range.startOffset;
      if (node === range.endContainer) end = pos + range.endOffset;
      pos += node.nodeValue.length;
    }
    return start >= 0 && end > start ? [start, end] : null;
  }
  function applyHighlights(root, ranges) {
    for (const r of [...ranges].sort((a, b) => b[0] - a[0])) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let pos = 0, node;
      const pieces = [];
      while ((node = walker.nextNode())) {
        const len = node.nodeValue.length;
        const a = Math.max(r[0], pos), b = Math.min(r[1], pos + len);
        if (a < b) pieces.push([node, a - pos, b - pos]);
        pos += len;
      }
      for (const [n, a, b] of pieces) {
        const range = document.createRange();
        range.setStart(n, a); range.setEnd(n, b);
        const mark = document.createElement('mark'); mark.className = 'tao-hl';
        range.surroundContents(mark);
      }
    }
  }
  function onPassageMouseUp() {
    if (!highlightMode || !SIM || SIM.phase !== 'running') return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const root = $('tao-passage');
    if (!root.contains(range.commonAncestorContainer)) return;
    const off = textOffsets(root, range);
    sel.removeAllRanges();
    if (!off) return;
    const it = unitItems()[SIM.pos];
    const s = SIM.sections[it.si];
    s.hl = s.hl || {};
    const list = (s.hl[it.id] || []).filter((r) => r[1] <= off[0] || r[0] >= off[1]);
    list.push(off);
    s.hl[it.id] = list;
    persist();
    renderPassageInto(root, App.banks.question(it.bank, it.id).passage);
    applyHighlights(root, list);
  }
  function onPassageClick(e) {
    const mark = e.target.closest('mark.tao-hl');
    if (!mark || !SIM) return;
    const root = $('tao-passage');
    const range = document.createRange(); range.selectNodeContents(mark);
    const off = textOffsets(root, range);
    const it = unitItems()[SIM.pos];
    const s = SIM.sections[it.si];
    if (off && s.hl && s.hl[it.id]) {
      s.hl[it.id] = s.hl[it.id].filter((r) => !(r[0] <= off[0] && r[1] >= off[1]));
      persist();
      renderPassageInto(root, App.banks.question(it.bank, it.id).passage);
      applyHighlights(root, s.hl[it.id]);
    }
  }

  function select(letter) {
    const it = unitItems()[SIM.pos];
    SIM.sections[it.si].answers[it.id] = letter;
    for (const l of $('tao-options').querySelectorAll('.tao-opt')) {
      const input = l.querySelector('input');
      input.checked = input.value === letter;
      l.classList.toggle('checked', input.value === letter);
    }
    renderBubbles();
    persist();
  }
  function goTo(i) { accrue(); SIM.pos = Math.max(0, Math.min(unitItems().length - 1, i)); SIM.phase = 'running'; renderItem(); }
  function toggleBookmark() {
    const it = unitItems()[SIM.pos];
    const s = SIM.sections[it.si];
    s.bookmarks[it.id] = !s.bookmarks[it.id];
    if (!s.bookmarks[it.id]) delete s.bookmarks[it.id];
    renderItem();
  }

  // ── Overview ──
  function openOverview() {
    accrue();
    SIM.phase = 'overview'; persist();
    $('tao-overview').hidden = false;
    renderOverview();
  }
  function renderOverview() {
    const items = unitItems();
    const bm = items.filter((it) => SIM.sections[it.si].bookmarks[it.id]).length;
    const inc = items.filter((it) => !SIM.sections[it.si].answers[it.id]).length;
    $('ov-bm').textContent = bm; $('ov-inc').textContent = inc;
    for (const t of document.querySelectorAll('.tao-tab')) { t.classList.toggle('active', t.dataset.filter === overviewFilter); t.setAttribute('aria-selected', String(t.dataset.filter === overviewFilter)); }
    const body = $('tao-overview-body');
    body.replaceChildren();
    for (const si of SIM.units[SIM.unit].sections) {
      const s = SIM.sections[si];
      const group = el('div', { class: 'ov-group' }, el('h3', {}, s.label));
      const row = el('div', { class: 'ov-row' });
      items.forEach((it, i) => {
        if (it.si !== si) return;
        const answered = Boolean(s.answers[it.id]), marked = Boolean(s.bookmarks[it.id]);
        if (overviewFilter === 'bookmarked' && !marked) return;
        if (overviewFilter === 'incomplete' && answered) return;
        row.append(el('button', { type: 'button', class: `tao-bubble${i === SIM.pos ? ' current' : ''}${answered ? ' answered' : ''}${marked ? ' marked' : ''}`, onclick: () => { $('tao-overview').hidden = true; goTo(i); } }, String(i + 1)));
      });
      group.append(row);
      body.append(group);
    }
  }
  function closeOverview() { $('tao-overview').hidden = true; SIM.phase = 'running'; shownAt = Date.now(); persist(); }

  async function submitUnit(byTimeout) {
    if (!SIM || SIM.phase === 'results' || SIM.phase === 'done' || SIM.phase === 'intro') return;
    if (!byTimeout) {
      const token = `${SIM.id}:${SIM.unit}`;
      const inc = unitItems().filter((it) => !SIM.sections[it.si].answers[it.id]).length;
      const ok = await App.ui.confirm({ title: 'Submit this part?', message: inc ? `You have ${inc} unanswered question${inc === 1 ? '' : 's'}. Unanswered questions count as incorrect.` : 'All questions answered.', okText: 'Submit', cancelText: 'Go back' });
      // Se nel frattempo il timer ha consegnato (o la sim è cambiata), questa conferma non vale più.
      if (!ok || !SIM || `${SIM.id}:${SIM.unit}` !== token || (SIM.phase !== 'running' && SIM.phase !== 'overview')) return;
    } else {
      App.ui.closeModal();
    }
    accrue();
    clearInterval(tickId);
    const now = new Date().toISOString();
    for (const si of SIM.units[SIM.unit].sections) { const s = SIM.sections[si]; s.status = 'done'; s.submittedAt = now; s.byTimeout = Boolean(byTimeout); }
    $('tao-overview').hidden = true;
    App.calc.reset();
    if (SIM.unit < SIM.units.length - 1) { SIM.unit++; SIM.pos = 0; SIM.phase = 'intro'; persist(); renderIntro(); return; }
    finish();
  }

  // ── Fine ──
  function finish() {
    SIM.phase = 'results';
    SIM.finishedAt = new Date().toISOString();
    const entries = [];
    const results = [];
    for (const s of SIM.sections) {
      let correct = 0, answered = 0, time = 0;
      for (const it of s.items) {
        const q = App.banks.question(it.bank, it.id);
        const sel = s.answers[it.id] || null;
        const ok = sel != null && sel === q.correct[0];
        if (ok) correct++;
        if (sel) answered++;
        const sec = Math.round(s.time[it.id] || 0);
        time += sec;
        entries.push({ mode: 'sim', session: SIM.id, bank: q.bank, id: q.id, sel, ok, sec, conf: null, tag: q.tag, level: q.level, format: q.format, unanswered: sel == null });
      }
      results.push({ bank: s.bank, label: s.label, n: s.items.length, correct, answered, time, byTimeout: s.byTimeout, fresh: s.fresh });
    }
    SIM.results = results;
    App.store.addLogMany(entries);
    for (const r of results) App.store.addSession({ mode: 'sim', id: SIM.id, banks: [r.bank], n: r.n, correct: r.correct, sec: r.time, trap: trapOf(entries.filter((e) => e.bank === r.bank)), timerMode: SIM.timerMode, byTimeout: r.byTimeout });
    persist();
    showResults();
  }
  function trapOf(entries) {
    const c = {};
    for (const e of entries) if (!e.ok && !e.unanswered && e.tag) c[e.tag] = (c[e.tag] || 0) + 1;
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    if (top) return top[0];
    return entries.some((e) => e.unanswered) ? 'tempo_scaduto' : null;
  }

  function showResults() {
    const r = SIM.results || [];
    $('sim-scores').replaceChildren(...r.map((x) => {
      const t = App.plan.TARGET[x.bank];
      return el('div', { class: 'sim-score' },
        el('span', { class: 'num-big' }, `${x.correct}/${x.n}`),
        el('span', { class: 'num-label' }, `${App.BANK_LABEL[x.bank]} · ${minSec(x.time)} totali · ${x.answered}/${x.n} risposte${x.byTimeout ? ' · tempo scaduto' : ''}`),
        t ? el('span', { class: 'num-note' }, `soglia ${t.min || t.score}/${t.max}${t.min ? ` · obiettivo ${t.score}/${t.max}` : ''}${x.fresh < x.n ? ` · ${x.n - x.fresh} domande già viste in allenamento` : ''}`) : null);
    }));
    const sentences = [];
    for (const x of r) {
      const t = App.plan.TARGET[x.bank];
      if (!t) continue;
      if (x.bank === 'verbale') {
        if (x.n !== t.max) sentences.push(`Verbale: ${x.correct}/${x.n} su una prova ridotta (il pool era corto): non confrontabile con la soglia.`);
        else if (x.correct < t.min) sentences.push(`Verbale: ${x.correct}/${t.max}, sotto la soglia di passaggio (${t.min}/${t.max}).`);
        else if (x.correct >= t.score) sentences.push(`Verbale: ${x.correct}/${t.max}, obiettivo raggiunto (≥ ${t.score}).`);
        else sentences.push(`Verbale: ${x.correct}/${t.max}, sopra la soglia (${t.min}) ma sotto l'obiettivo di ${t.score}/${t.max}.`);
      } else if (x.n !== t.max) {
        sentences.push(`${App.BANK_LABEL[x.bank]}: ${x.correct}/${x.n} su una prova ridotta.`);
      } else {
        sentences.push(`${App.BANK_LABEL[x.bank]}: ${x.correct}/${t.max} verso la soglia combinata numerico + astratto di 10/20 (obiettivo ${t.score}/${t.max} ciascuno).`);
      }
    }
    $('sim-sentence').textContent = sentences.join(' ');
    const review = $('sim-review');
    review.replaceChildren();
    for (const s of SIM.sections) {
      review.append(el('h3', {}, App.BANK_LABEL[s.bank]));
      s.items.forEach((it, i) => {
        const q = App.banks.question(it.bank, it.id);
        const sel = s.answers[it.id] || null;
        const ok = sel === q.correct[0];
        const co = q.options.find((o) => o.letter === q.correct[0]);
        review.append(el('details', { class: `review-item ${ok ? 'ok' : 'ko'}` },
          el('summary', {}, `${i + 1}. ${ok ? '✓' : '✗'} · ${sel ? 'tua ' + sel : 'in bianco'} · corretta ${co.letter} · ${minSec(s.time[it.id] || 0)} · ${App.tagLabel(q.tag)}`),
          q.passage ? el('div', { class: 'review-passage' }, ...q.passage.split('\n').map((l) => el('p', {}, l))) : null,
          el('p', { class: 'review-q' }, q.question),
          el('ul', { class: 'review-opts' }, ...q.options.map((o) => el('li', { class: o.letter === q.correct[0] ? 'is-correct' : o.letter === sel ? 'is-wrong' : '' }, `${o.letter}) ${o.text}`))),
          el('div', { class: 'review-expl' }, ...paragraphs(q.explanation))));
      });
    }
    $('sim-copy').onclick = async () => { (await copyText(summaryText())) ? App.ui.toast('Riepilogo copiato: incollalo in chat.') : App.ui.toast('Copia non riuscita.'); };
    $('sim-close').onclick = () => { App.store.setSim(null); SIM = null; App.main.home(); };
    App.ui.show('sim-results', { title: 'Simulazione' });
  }

  function summaryText() {
    const lines = [`EU Prep Suite — Simulazione (${SIM.timerMode === 'single' ? 'timer unico' : 'timer per prova'}) · ${dateTimeIt(SIM.finishedAt || new Date().toISOString())}`];
    for (const s of SIM.sections) {
      const r = SIM.results.find((x) => x.bank === s.bank);
      const wrong = s.items.filter((it) => (s.answers[it.id] || null) !== App.banks.question(it.bank, it.id).correct[0]);
      lines.push(`${App.BANK_LABEL[s.bank]} L1: ${r.correct}/${r.n} · ${minSec(r.time)} · ${minSec(r.n ? r.time / r.n : 0)} a domanda${r.byTimeout ? ' · tempo scaduto' : ''}`);
      lines.push(wrong.length ? `  errori: ${wrong.map((it) => { const q = App.banks.question(it.bank, it.id); return `#${q.id} (${q.tag}${s.answers[it.id] ? '' : ', in bianco'})`; }).join(' · ')}` : '  errori: nessuno');
    }
    return lines.join('\n');
  }

  async function abandon() {
    const ok = await App.ui.confirm({ title: 'Abbandonare la simulazione?', message: 'Non verrà conteggiata. Le domande resteranno disponibili per una prossima simulazione.', okText: 'Abbandona', cancelText: 'Continua', danger: true });
    if (!ok) return;
    clearInterval(tickId);
    App.store.setSim(null); SIM = null;
    App.main.home();
  }

  function init() {
    $('sim-cancel').addEventListener('click', () => App.main.home());
    $('sim-start').addEventListener('click', startFromSetup);
    $('tao-prev').addEventListener('click', () => goTo(SIM.pos - 1));
    $('tao-next').addEventListener('click', () => goTo(SIM.pos + 1));
    $('tao-bookmark').addEventListener('click', toggleBookmark);
    $('tao-overview-btn').addEventListener('click', openOverview);
    $('tao-overview-close').addEventListener('click', closeOverview);
    $('tao-overview-back').addEventListener('click', closeOverview);
    $('tao-submit').addEventListener('click', () => submitUnit(false));
    for (const t of document.querySelectorAll('.tao-tab')) t.addEventListener('click', () => { overviewFilter = t.dataset.filter; renderOverview(); });
    document.querySelector('.tao-logo').addEventListener('click', abandon);
    $('tao-exit').addEventListener('click', abandon);
    $('tao-highlight').addEventListener('click', () => { highlightMode = !highlightMode; $('tao-highlight').setAttribute('aria-pressed', String(highlightMode)); $('tao-highlight').classList.toggle('on', highlightMode); $('tao-passage').classList.toggle('hl-mode', highlightMode); });
    $('tao-passage').addEventListener('mouseup', onPassageMouseUp);
    $('tao-passage').addEventListener('touchend', () => setTimeout(onPassageMouseUp, 0));
    $('tao-passage').addEventListener('click', onPassageClick);
    window.addEventListener('resize', () => { if (SIM && SIM.phase === 'running') renderBubbles(); });
    window.addEventListener('keydown', (e) => {
      if (App.ui.view() !== 'sim' || !SIM || SIM.phase !== 'running' || App.ui.modalOpen()) return;
      if (e.target.closest('input[type=text], textarea')) return;
      if (e.key === 'ArrowRight') goTo(SIM.pos + 1);
      else if (e.key === 'ArrowLeft') goTo(SIM.pos - 1);
      else if ('ABCDE'.includes(e.key.toUpperCase()) && e.key.length === 1) {
        const q = App.banks.question(unitItems()[SIM.pos].bank, unitItems()[SIM.pos].id);
        if (q.options.some((o) => o.letter === e.key.toUpperCase())) select(e.key.toUpperCase());
      }
    });
    window.addEventListener('visibilitychange', () => { if (SIM && SIM.phase === 'running') { if (document.hidden) accrue(); else shownAt = Date.now(); } });
  }

  return { init, showSetup, resume, closeStale, isActive: () => Boolean(App.store.sim()) };
})();
