// Stato: prontezza, attività, trappole, calibrazione, dati, dispositivo — namespace App.stato
window.App = window.App || {};
App.stato = (() => {
  'use strict';
  const { el, minSec, dateTimeIt, copyText, mondayOf, todayKey, clock } = App.utils;
  const $ = (id) => document.getElementById(id);
  const MODE = { micro: 'Micro', train: 'Allenamento', review: 'Ripasso', sim: 'Simulazione', external: 'Esterna' };
  const todayStart = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

  function render() {
    const sessions = App.store.sessions();
    const log = App.store.log();
    const week = App.plan.weekActivity();
    const grid = $('stato-grid');
    grid.replaceChildren();

    // Settimana: 5 su 7, senza catene.
    grid.append(tile(`${week.active}/${week.target}`, `giorni attivi questa settimana (${week.elapsed} ${week.elapsed === 1 ? 'trascorso' : 'trascorsi'})`));

    // Per prova: ultime 5 sessioni (allenamento, simulazione, esterne) e confronto con soglia/obiettivo.
    for (const bank of ['verbale', 'numerico', 'astratto']) {
      const last = sessions.filter((s) => (s.mode === 'train' || s.mode === 'sim' || s.mode === 'external') && (s.banks || []).includes(bank) && s.n).slice(-5);
      const t = App.plan.TARGET[bank];
      const txt = last.length ? last.map((s) => `${s.correct}/${s.n}`).join(' · ') : 'nessuna sessione';
      grid.append(tile(App.BANK_LABEL[bank], `${txt}\nobiettivo ${t.score}/${t.max}${t.min ? ` · soglia ${t.min}/${t.max}` : ''}`));
    }

    // Trappole negli ultimi 14 giorni.
    const since = new Date(); since.setDate(since.getDate() - 14);
    const tags = {};
    let blanks = 0;
    for (const e of log) {
      if (new Date(e.t) < since) continue;
      if (e.mode === 'external') { if (e.tag) tags[e.tag] = (tags[e.tag] || 0) + 1; continue; }
      if (e.unanswered) { blanks++; continue; }
      if (!e.ok && e.tag) tags[e.tag] = (tags[e.tag] || 0) + 1;
    }
    if (blanks) tags.tempo_scaduto = (tags.tempo_scaduto || 0) + blanks;
    // Trappole «disinnescate»: item usciti dal ripasso (tre risposte giuste a distanza) negli ultimi 14 giorni.
    const healed = [...App.store.itemStats().values()].filter((x) => x.healedAt && new Date(x.healedAt) >= since).length;
    const entries = Object.entries(tags).sort((a, b) => b[1] - a[1]);
    const max = entries.length ? entries[0][1] : 1;
    grid.append(tile(String(healed), 'trappole disinnescate (14 giorni): errori usciti dal ripasso'));
    $('stato-tags').replaceChildren(...(entries.length ? entries.map(([tag, n]) => el('div', { class: 'tagbar' },
      el('span', { class: 'tagbar-label' }, App.tagLabel(tag)),
      el('span', { class: 'tagbar-track' }, el('span', { class: 'tagbar-fill', style: `width:${Math.round((n / max) * 100)}%` })),
      el('span', { class: 'tagbar-n' }, String(n)))) : [el('p', { class: 'muted' }, 'Nessun errore registrato negli ultimi 14 giorni.')]));

    // Calibrazione.
    const recent = log.filter((e) => e.mode !== 'external' && e.conf && new Date(e.t) >= since);
    const sw = recent.filter((e) => e.conf === 'sure' && !e.ok).length;
    const dok = recent.filter((e) => e.conf === 'doubt' && e.ok).length;
    const sure = recent.filter((e) => e.conf === 'sure').length;
    $('stato-calib').textContent = recent.length
      ? `Ultimi 14 giorni: ${sw} sbagliate da sicuro su ${sure} «sicuro» (${sure ? Math.round((sw / sure) * 100) : 0}%) · ${dok} giuste in dubbio. Le sbagliate da sicuro sono le trappole da capire a fondo; le giuste in dubbio sono tempo recuperabile con il segnalibro.`
      : 'Nessun dato: attiva «Sicuro / Dubbio» e fai una sessione.';

    // Ultime sessioni.
    $('stato-sessions').replaceChildren(...sessions.slice(-12).reverse().map((s) => el('div', { class: 'session-row' },
      el('span', { class: 'session-when' }, dateTimeIt(s.t)),
      el('span', { class: 'session-what' }, `${MODE[s.mode] || s.mode}${s.partial ? ' (interrotta)' : ''}${s.extra ? ' · extra' : ''} · ${(s.banks || []).map((b) => App.BANK_LABEL[b] || b).join(' + ')}${s.source ? ' · ' + s.source : ''}`),
      el('span', { class: 'session-score' }, s.n ? `${s.correct}/${s.n}${s.sec ? ' · ' + minSec(s.sec / s.n) + ' per domanda' : ''}` : ''))));
    if (!sessions.length) $('stato-sessions').append(el('p', { class: 'muted' }, 'Ancora nessuna sessione.'));

    // Pool.
    const rep = App.select.poolReport();
    $('stato-pools').textContent = Object.entries(rep).map(([b, r]) => `${App.BANK_LABEL[b]}: ${r.total} domande L1, ${r.unseen} mai viste, ${r.freshForSim} disponibili per le simulazioni`).join(' · ') + '. Batterie L2 (livello EPSO) dalla v1.2; astratto dalla v1.3.';

    // Impostazioni.
    const st = App.store.settings();
    $('set-conf').checked = Boolean(st.confidence);
    $('set-vfn').checked = Boolean(st.microVfn);

    // Dispositivo: misure reali del viewport (per il Fold), senza screenshot.
    renderDevice();
  }

  function tile(big, label) { return el('div', { class: 'tile' }, el('span', { class: 'num-big' }, big), el('span', { class: 'num-label' }, label)); }

  function renderDevice() {
    const seg = (window.viewport && window.viewport.segments) ? window.viewport.segments.length : (window.visualViewport && window.visualViewport.segments ? window.visualViewport.segments.length : 1);
    const posture = navigator.devicePosture ? navigator.devicePosture.type : 'n/d';
    const sw = screen.width, sh = screen.height;
    $('stato-device').textContent = `viewport ${window.innerWidth}×${window.innerHeight} CSS px · schermo ${sw}×${sh} · pixel ratio ${Number(window.devicePixelRatio).toFixed(2)} · segmenti ${seg} · postura ${posture} · ${matchMedia('(pointer: coarse)').matches ? 'tocco' : 'mouse'} · ${matchMedia('(prefers-color-scheme: dark)').matches ? 'tema scuro' : 'tema chiaro'} · ${navigator.onLine ? 'online' : 'offline'}`;
  }

  function weekSummary() {
    const monday = mondayOf();
    const sessions = App.store.sessions().filter((s) => new Date(s.t) >= monday);
    const log = App.store.log().filter((e) => new Date(e.t) >= monday);
    const week = App.plan.weekActivity();
    const lines = [`EU Prep Suite — riepilogo settimana dal ${monday.toLocaleDateString('it-IT')} · generato ${dateTimeIt(new Date().toISOString())}`, `Giorni attivi: ${week.active}/${week.target}`];
    for (const bank of ['verbale', 'numerico', 'astratto']) {
      const ss = sessions.filter((s) => (s.banks || []).includes(bank) && s.n);
      if (!ss.length) { lines.push(`${App.BANK_LABEL[bank]}: nessuna sessione`); continue; }
      const n = ss.reduce((a, s) => a + s.n, 0), c = ss.reduce((a, s) => a + s.correct, 0);
      lines.push(`${App.BANK_LABEL[bank]}: ${ss.length} sessioni · ${c}/${n} (${Math.round((c / n) * 100)}%) · ${ss.map((s) => `${MODE[s.mode]} ${s.correct}/${s.n}`).join(', ')}`);
    }
    const tags = {};
    for (const e of log) if (e.mode !== 'external' && !e.ok && e.tag) tags[e.tag] = (tags[e.tag] || 0) + 1;
    const top = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 4);
    lines.push(`Trappole: ${top.length ? top.map(([t, n]) => `${App.tagLabel(t)} ×${n}`).join(' · ') : 'nessun errore'}`);
    const sw = log.filter((e) => e.conf === 'sure' && !e.ok).length, dok = log.filter((e) => e.conf === 'doubt' && e.ok).length;
    lines.push(`Calibrazione: ${sw} sbagliate da sicuro · ${dok} giuste in dubbio`);
    const rep = App.select.poolReport();
    lines.push(`Pool: verbale ${rep.verbale.unseen} mai viste / ${rep.verbale.freshForSim} per simulazioni · numerico ${rep.numerico.unseen} / ${rep.numerico.freshForSim}`);
    return lines.join('\n');
  }

  // ── Sessione esterna ──
  function showExternal() {
    const tagSel = $('ext-tag');
    const fill = () => {
      const bank = $('ext-bank').value;
      const tagsFor = { astratto: ['conteggio', 'rotazione', 'alternanza', 'riempimento', 'posizione', 'combinata', 'tempo_scaduto'], verbale: ['quantificatore', 'inferenza', 'fuori-testo', 'negazione', 'tempo', 'scope', 'parafrasi', 'tempo_scaduto'], numerico: ['percentuali', 'rapporti', 'unita-misura', 'lettura-dati', 'media', 'tempo_scaduto'], sim: ['tempo_scaduto', 'inferenza', 'quantificatore', 'lettura-dati', 'percentuali', 'rotazione', 'conteggio'] };
      tagSel.replaceChildren(el('option', { value: '' }, 'nessuna / non so'), ...tagsFor[bank].map((t) => el('option', { value: t }, App.tagLabel(t))));
    };
    $('ext-bank').onchange = fill;
    fill();
    const plan = App.plan.today();
    if (plan.kind === 'external') $('ext-bank').value = plan.bank, fill();
    App.ui.show('external', { title: 'Sessione esterna' });
    $('ext-score').focus();
  }
  function saveExternal(e) {
    e.preventDefault();
    const score = Number($('ext-score').value), max = Number($('ext-max').value), min = Number($('ext-min').value) || 0;
    if (!(max > 0) || score < 0 || score > max) { App.ui.toast('Controlla punteggio e totale.'); return; }
    const bank = $('ext-bank').value;
    const entry = { mode: 'external', bank, source: $('ext-source').value, score, max, min, tag: $('ext-tag').value || null, note: $('ext-note').value.trim() || null };
    App.store.addLog(entry);
    App.store.addSession({ mode: 'external', banks: [bank], n: max, correct: score, sec: min * 60, trap: entry.tag, source: entry.source });
    $('ext-form').reset();
    App.ui.toast('Registrata.');
    App.main.home();
  }

  function init() {
    $('nav-stato').addEventListener('click', () => { render(); App.ui.show('stato', { title: 'Stato' }); });
    $('st-copy-week').addEventListener('click', async () => { (await copyText(weekSummary())) ? App.ui.toast('Riepilogo della settimana copiato.') : App.ui.toast('Copia non riuscita.'); });
    $('st-export').addEventListener('click', () => {
      const blob = new Blob([App.store.exportAll()], { type: 'application/json' });
      const a = el('a', { href: URL.createObjectURL(blob), download: `eu-prep-${todayKey()}.json` });
      document.body.append(a); a.click(); a.remove();
    });
    $('st-import').addEventListener('change', async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { const r = App.store.importAll(await f.text()); App.ui.toast(r.items || r.sessions ? `Importati ${r.items} item nuovi e ${r.sessions} sessioni nuove.` : 'Niente di nuovo da importare: tutto era già presente.'); render(); }
      catch (err) { App.ui.toast(`Import fallito: ${err.message}`); }
      e.target.value = '';
    });
    $('st-reset').addEventListener('click', async () => {
      const ok = await App.ui.confirm({ title: 'Azzerare tutto?', message: 'Registro, sessioni e impostazioni verranno cancellati da questo dispositivo. Esporta prima, se vuoi conservarli.', okText: 'Azzera', danger: true });
      if (ok) { App.store.resetAll(); App.ui.toast('Azzerato.'); render(); }
    });
    $('set-conf').addEventListener('change', (e) => App.store.setSetting('confidence', e.target.checked));
    $('set-vfn').addEventListener('change', (e) => App.store.setSetting('microVfn', e.target.checked));
    $('ext-form').addEventListener('submit', saveExternal);
    $('ext-cancel').addEventListener('click', () => App.main.home());
    window.addEventListener('resize', () => { if (App.ui.view() === 'stato') renderDevice(); });
  }

  return { init, render, showExternal, weekSummary };
})();
