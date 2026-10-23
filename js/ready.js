// Prontezza rispetto alle soglie — namespace App.ready
// Stima [S] del punteggio in prova dalla PRIMA risposta agli item di livello prova (verbale di livello 2, numerico e
// astratto generati di livello 2–3) degli ultimi 10 giorni: tappe, allenamento, blocchi, misura, simulazioni. Il
// ripasso e le risposte ripetute non contano (si ricorda la chiave). Soglie [V avviso C/2026/3362, punto 4];
// obiettivi [S, Piano di studio].
window.App = window.App || {};
App.ready = (() => {
  'use strict';
  const { el, minSec } = App.utils;
  const WINDOW_DAYS = 10;
  const LAST = 30;          // al massimo le ultime 30 prime risposte per prova
  const MIN_V = 8, MIN_NA = 5;

  function compute(now = new Date()) {
    const since = new Date(now); since.setDate(since.getDate() - WINDOW_DAYS);
    const seen = new Set();
    const by = { verbale: [], numerico: [], astratto: [] };
    for (const e of App.store.log()) {
      if (!by[e.bank] || e.mode === 'external') continue;
      const key = `${e.bank}#${e.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (e.mode === 'review' || new Date(e.t) < since || (e.level || 0) < 2) continue;
      by[e.bank].push(e);
    }
    const out = {};
    for (const [bank, all] of Object.entries(by)) {
      const list = all.slice(-LAST);
      const n = list.length, ok = list.filter((e) => e.ok).length;
      const timed = list.filter((e) => !e.unanswered && e.sec > 0);
      out[bank] = { n, ok, p: n ? ok / n : null, pace: timed.length ? timed.reduce((s, e) => s + e.sec, 0) / timed.length : null };
    }
    const v = out.verbale, nu = out.numerico, ab = out.astratto;
    const clamp = (x) => Math.max(0, Math.min(20, x));
    const verbale = v.n >= MIN_V ? (() => {
      const est = 20 * v.p, se = 20 * Math.sqrt((v.p * (1 - v.p) + 0.02) / v.n);
      return { est, lo: clamp(est - se), hi: clamp(est + se), n: v.n, pace: v.pace };
    })() : { est: null, n: v.n, pace: v.pace };
    const na = nu.n >= MIN_NA && ab.n >= MIN_NA ? (() => {
      const est = 10 * nu.p + 10 * ab.p;
      const se = Math.sqrt(100 * (nu.p * (1 - nu.p) + 0.02) / nu.n + 100 * (ab.p * (1 - ab.p) + 0.02) / ab.n);
      return { est, lo: clamp(est - se), hi: clamp(est + se), n: nu.n + ab.n, nN: nu.n, nA: ab.n, pN: nu.p, pA: ab.p, paceN: nu.pace, paceA: ab.pace };
    })() : { est: null, nN: nu.n, nA: ab.n, pN: nu.p, pA: ab.p, paceN: nu.pace, paceA: ab.pace };
    return { verbale, na, banks: out };
  }

  const pct = (x) => `${(x / 20) * 100}%`;
  const fmt = (x) => String(Math.round(x));

  // Righello 0–20: soglia in rosso, obiettivo tratteggiato, stima e margine in giallo.
  function gauge({ name, r, soglia, goal, note, empty }) {
    const track = el('div', { class: 'gauge-track', 'aria-hidden': 'true' }, el('span', { class: 'gauge-line' }));
    const tick = el('span', { class: 'gauge-tick' }); tick.style.left = pct(soglia); track.append(tick);
    const g = el('span', { class: 'gauge-tick goal' }); g.style.left = pct(goal); track.append(g);
    if (r.est != null) {
      const band = el('span', { class: 'gauge-range' }); band.style.left = pct(r.lo); band.style.width = `calc(${pct(r.hi)} - ${pct(r.lo)})`;
      const dot = el('span', { class: 'gauge-dot' }); dot.style.left = pct(r.est);
      track.append(band, dot);
    }
    const scale = el('div', { class: 'gauge-scale', 'aria-hidden': 'true' });
    for (const [x, label, cls] of [[0, '0', ''], [soglia, String(soglia), 't-soglia'], [goal, String(goal), 't-goal'], [20, '20', '']]) {
      const s = el('span', { class: cls }, label); s.style.left = pct(x); scale.append(s);
    }
    const val = r.est != null ? el('span', { class: 'gauge-val' }, `≈ ${fmt(r.est)}/20 `, el('small', {}, `(${fmt(r.lo)}–${fmt(r.hi)})`)) : el('span', { class: 'gauge-val' }, el('small', {}, 'ancora pochi dati'));
    const label = r.est != null ? `${name}: circa ${fmt(r.est)} su 20, tra ${fmt(r.lo)} e ${fmt(r.hi)}; soglia ${soglia}, obiettivo ${goal}.` : `${name}: ancora pochi dati.`;
    return el('div', { class: 'gauge', role: 'img', 'aria-label': label },
      el('div', { class: 'gauge-top' }, el('span', { class: 'gauge-name' }, name), val),
      track, scale,
      el('p', { class: 'gauge-note' }, r.est != null ? note : empty));
  }
  // Legenda unica sotto i righelli.
  function legend() {
    return el('p', { class: 'gauge-legend' }, el('span', { class: 'lg-soglia' }, 'soglia'), ' ', el('span', { class: 'lg-goal' }, 'obiettivo'), ' ', el('span', { class: 'lg-est' }, 'stima e margine'));
  }

  function render(box, now = new Date()) {
    const R = compute(now);
    const v = R.verbale, na = R.na, P = App.plan.PACE;
    const paceTxt = (sec, ref) => (sec ? `${minSec(sec)} a domanda (prova ${minSec(ref)})` : '');
    const vNote = [`${v.n} prime risposte di livello prova`, paceTxt(v.pace, P.verbale)].filter(Boolean).join(' · ');
    const naParts = [];
    if (na.pN != null) naParts.push(`numerico ${Math.round(na.pN * 100)}%${na.paceN ? ` (${minSec(na.paceN)})` : ''}`);
    if (na.pA != null) naParts.push(`astratto ${Math.round(na.pA * 100)}%${na.paceA ? ` (${minSec(na.paceA)})` : ''}`);
    box.replaceChildren(
      gauge({ name: 'Verbale', r: v, soglia: 10, goal: App.plan.TARGET.verbale.score, note: vNote, empty: `Si accende dopo ${MIN_V} risposte a brani di livello prova (la misura di partenza basta). Finora: ${v.n}.` }),
      gauge({ name: 'Numerico + astratto', r: na, soglia: 10, goal: App.plan.TARGET.numerico.score + App.plan.TARGET.astratto.score, note: naParts.join(' · '), empty: `Si accende dopo ${MIN_NA} risposte di livello prova in numerico e ${MIN_NA} in astratto. Finora: ${na.nN} e ${na.nA}.` }),
      legend());
    return R;
  }

  return { compute, render };
})();
