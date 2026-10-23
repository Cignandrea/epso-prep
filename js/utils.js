// Utility condivise — namespace App.utils
window.App = window.App || {};
App.utils = (() => {
  'use strict';

  function shuffle(arr, rng = Math.random) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Crea un elemento DOM; i figli stringa diventano nodi di testo (mai HTML).
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) {
      if (c == null) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return node;
  }

  const pad2 = (n) => String(n).padStart(2, '0');
  const clock = (sec) => { const s = Math.max(0, Math.round(sec)); return `${Math.floor(s / 60)}:${pad2(s % 60)}`; };
  const taoClock = (sec) => { const s = Math.max(0, Math.floor(sec)); return `${Math.floor(s / 60)}min ${pad2(s % 60)}s`; };
  const minSec = (sec) => { const s = Math.max(0, Math.round(sec)); return s >= 60 ? `${Math.floor(s / 60)}′${pad2(s % 60)}″` : `${s}″`; };

  const todayKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const dateIt = (d = new Date()) => d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeIt = (d = new Date()) => d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const dateTimeIt = (iso) => { const d = new Date(iso); return `${d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${timeIt(d)}`; };
  function mondayOf(d = new Date()) {
    const x = new Date(d); x.setHours(0, 0, 0, 0);
    const day = (x.getDay() + 6) % 7; // 0 = lunedì
    x.setDate(x.getDate() - day);
    return x;
  }

  // Paragrafi leggibili da una spiegazione in un solo blocco.
  function paragraphs(text) {
    const clean = (text || '').trim();
    const sentences = clean.split(/(?<=[.!?])\s+(?=[A-ZÀÈÉÌÒÙ0-9"“«(])/).map((s) => s.trim()).filter(Boolean);
    const out = []; let cur = '';
    for (const s of sentences) {
      if (cur && cur.length + s.length > 220) { out.push(cur); cur = s; } else cur = cur ? `${cur} ${s}` : s;
    }
    if (cur) out.push(cur);
    return out.map((p) => el('p', {}, p));
  }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // Un errore «di trappola» è una risposta data e sbagliata: le bianche e le sessioni esterne non lo sono.
  const isTrapError = (e) => e && e.mode !== 'external' && !e.ok && !e.unanswered && Boolean(e.tag);

  // Dati del numerico: le righe «a — b — c» (o «Etichetta: valore») diventano una tabella; il resto paragrafi.
  // Unico renderer per allenamento e simulazione.
  function renderPassage(node, text, { tableClass = 'data-table' } = {}) {
    node.replaceChildren();
    if (!text) return;
    const lines = text.split('\n');
    const isRow = (l) => l.includes(' — ') || /^[^:]{1,40}:\s+\S/.test(l);
    const rowLines = lines.filter(isRow);
    if (lines.length > 2 && rowLines.length >= lines.length - 1 && lines.some((l) => l.includes(' — ') || /\d/.test(l))) {
      const intro = isRow(lines[0]) ? null : lines[0];
      if (intro) node.append(el('p', {}, intro));
      const rows = lines.slice(intro ? 1 : 0).map((l) => (l.includes(' — ') ? l.split(' — ') : l.split(/:\s+/)));
      node.append(el('table', { class: tableClass }, el('tbody', {}, rows.map((r) => el('tr', {}, r.map((c, i) => el(i === 0 ? 'th' : 'td', i === 0 ? { scope: 'row' } : {}, c)))))));
    } else {
      for (const l of lines) node.append(el('p', {}, l));
    }
  }

  // Testo con **grassetto** → nodi DOM (mai HTML): per schede di studio ed etichette.
  function rich(text) {
    return String(text == null ? '' : text).split(/\*\*(.+?)\*\*/g).map((p, i) => (i % 2 ? el('strong', {}, p) : p)).filter((p) => p !== '');
  }

  const hasStimulus = (q) => Boolean(q && (q.passage || q.table || q.series || q.chart));

  // Una figura dell'astratto (SVG costruito dal generatore). Se il generatore manca, un segnaposto leggibile.
  function figure(spec, { size = 64, label = '' } = {}) {
    const g = window.App && App.gen && App.gen.astratto;
    if (g && spec) { try { return g.frameSvg(spec, { size, label }); } catch (err) { console.warn('figura non disegnabile', err); } }
    return el('span', { class: 'fig-missing' }, '?');
  }

  // ── Grafici del numerico (barre orizzontali, linee, torte), in SVG con i valori scritti, come nei test EPSO ──
  const SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs = {}, text) {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    if (text != null) n.textContent = text;
    return n;
  }
  const itNum = (x) => new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 }).format(x);
  function legend(names, cls = 's') {
    return el('ul', { class: 'chart-legend', 'aria-hidden': 'true' }, names.map((nm, k) => el('li', {}, el('span', { class: `sw ${cls}${k}` }), nm)));
  }
  function hbarSvg(c) {
    const ns = c.series.length, W = 560, labelW = 124, valueW = 70, barH = 17, gapS = 3, gapG = 12;
    const groupH = ns * barH + (ns - 1) * gapS;
    const H = c.categories.length * (groupH + gapG) + 4;
    const max = Math.max(...c.series.flatMap((s) => s.values)) || 1;
    const plotW = W - labelW - valueW;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart-svg', role: 'img', 'aria-label': `Grafico a barre: ${c.title}` });
    svg.append(svgEl('line', { x1: labelW, y1: 0, x2: labelW, y2: H - 4, class: 'axis' }));
    c.categories.forEach((cat, i) => {
      const y0 = 2 + i * (groupH + gapG);
      svg.append(svgEl('text', { x: labelW - 8, y: y0 + groupH / 2, class: 'cat', 'text-anchor': 'end', 'dominant-baseline': 'middle' }, cat));
      c.series.forEach((s, k) => {
        const y = y0 + k * (barH + gapS);
        const w = Math.max(1, (s.values[i] / max) * plotW);
        svg.append(svgEl('rect', { x: labelW, y, width: w.toFixed(1), height: barH, class: `bar s${k}` }));
        svg.append(svgEl('text', { x: (labelW + w + 5).toFixed(1), y: y + barH / 2, class: 'val', 'dominant-baseline': 'middle' }, s.labels[i]));
      });
    });
    return svg;
  }
  function niceTicks(min, max, n = 4) {
    const span = max - min || 1;
    const raw = span / n, mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || raw;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    const out = [];
    for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v * 1e6) / 1e6);
    return out;
  }
  function lineSvg(c) {
    const W = 560, H = 270, padL = 58, padR = 22, padT = 22, padB = 34;
    const all = c.series.flatMap((s) => s.values);
    const ticks = niceTicks(Math.min(...all), Math.max(...all));
    const lo = ticks[0], hi = ticks[ticks.length - 1];
    const x = (i) => padL + (i * (W - padL - padR)) / (c.categories.length - 1);
    const y = (v) => padT + (1 - (v - lo) / (hi - lo || 1)) * (H - padT - padB);
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart-svg', role: 'img', 'aria-label': `Grafico a linee: ${c.title}` });
    for (const t of ticks) {
      svg.append(svgEl('line', { x1: padL, y1: y(t).toFixed(1), x2: W - padR, y2: y(t).toFixed(1), class: 'grid' }));
      svg.append(svgEl('text', { x: padL - 6, y: y(t).toFixed(1), class: 'tick', 'text-anchor': 'end', 'dominant-baseline': 'middle' }, itNum(t)));
    }
    c.categories.forEach((cat, i) => svg.append(svgEl('text', { x: x(i).toFixed(1), y: H - 10, class: 'cat', 'text-anchor': 'middle' }, cat)));
    c.series.forEach((s, k) => {
      svg.append(svgEl('polyline', { points: s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' '), class: `line s${k}` }));
      s.values.forEach((v, i) => {
        svg.append(svgEl('circle', { cx: x(i).toFixed(1), cy: y(v).toFixed(1), r: 4, class: `dot s${k}` }));
        // con due linee: etichette della prima sopra, della seconda sotto (o il contrario se la seconda sta sopra)
        const other = c.series[1 - k];
        const above = !other || (k === 0 ? v >= other.values[i] : v > other.values[i]);
        svg.append(svgEl('text', { x: x(i).toFixed(1), y: (y(v) + (above ? -9 : 17)).toFixed(1), class: 'val', 'text-anchor': 'middle' }, s.labels[i]));
      });
    });
    return svg;
  }
  function pieSvg(s, cats) {
    const R = 86, C = 100;
    const svg = svgEl('svg', { viewBox: '0 0 200 200', class: 'chart-svg pie', role: 'img', 'aria-label': `Grafico a torta ${s.name}: ${cats.map((ct, k) => `${ct} ${s.labels[k]}`).join(', ')}` });
    const tot = s.values.reduce((a, b) => a + b, 0) || 1;
    let a0 = -Math.PI / 2;
    s.values.forEach((v, k) => {
      const a1 = a0 + (v / tot) * 2 * Math.PI;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const p = (a) => `${(C + R * Math.cos(a)).toFixed(2)},${(C + R * Math.sin(a)).toFixed(2)}`;
      svg.append(svgEl('path', { d: `M${C},${C} L${p(a0)} A${R},${R} 0 ${large} 1 ${p(a1)} Z`, class: `slice s${k}` }));
      if (v / tot >= 0.07) {
        const m = (a0 + a1) / 2;
        svg.append(svgEl('text', { x: (C + R * 0.62 * Math.cos(m)).toFixed(1), y: (C + R * 0.62 * Math.sin(m)).toFixed(1), class: 'pct', 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, s.labels[k]));
      }
      a0 = a1;
    });
    return svg;
  }
  function chartFigure(c) {
    const fig = el('figure', { class: `nchart nchart-${c.type}` }, c.title ? el('figcaption', {}, c.title) : null);
    if (c.type === 'pie') {
      const pies = el('div', { class: 'pies' });
      c.series.forEach((s) => pies.append(el('div', { class: 'pie-box' }, el('p', { class: 'pie-title' }, s.totalLabel || s.name), pieSvg(s, c.categories))));
      fig.append(pies);
      // Legenda a tabella: voce, colore e quota per ogni torta (si legge anche dove la fetta è troppo piccola per l'etichetta).
      fig.append(el('div', { class: 'table-scroll' }, el('table', { class: 'data-table pie-legend' },
        el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'Voce'), c.series.map((s) => el('th', { scope: 'col' }, s.name)))),
        el('tbody', {}, c.categories.map((cat, k) => el('tr', {}, el('th', { scope: 'row' }, el('span', { class: `sw s${k}` }), cat), c.series.map((s) => el('td', {}, s.labels[k]))))))));
    } else {
      if (c.series.length > 1) fig.append(legend(c.series.map((s) => s.name)));
      fig.append(el('div', { class: 'chart-scroll' }, c.type === 'line' ? lineSvg(c) : hbarSvg(c)));
    }
    if (c.note) fig.append(el('p', { class: 'table-note' }, c.note));
    return fig;
  }

  // Stimolo di un item, unico renderer per sessioni, simulazione e revisioni:
  // brano (verbale), grafico e/o tabella (numerico livello prova), serie di cinque figure (astratto).
  function renderStimulus(node, q, { tableClass = 'data-table', evidence = false, figSize = 64 } = {}) {
    node.replaceChildren();
    if (!q) return;
    if (q.chart) node.append(chartFigure(q.chart));
    if (q.series) {
      const row = el('div', { class: 'series', role: 'group', 'aria-label': 'Serie di cinque figure: qual è la sesta?' });
      q.series.forEach((spec, i) => row.append(el('span', { class: 'fig' }, figure(spec, { size: figSize, label: `Figura ${i + 1}` }))));
      row.append(el('span', { class: 'fig fig-q', 'aria-hidden': 'true' }, '?'));
      node.append(row);
      return;
    }
    if (q.table) {
      const t = q.table;
      // Intestazione a due righe quando le colonne sono raggruppate per grandezza (Esportazioni → 2022 · 2023 · 2024).
      const heads = [];
      if (t.groups) {
        heads.push(el('tr', {}, el('th', { scope: 'col', rowspan: '2', class: 'th-first' }, (t.head || [])[0] || ''), t.groups.map((g) => el('th', { scope: 'colgroup', colspan: String(g.span), class: 'th-group' }, g.label))));
        heads.push(el('tr', {}, (t.head || []).slice(1).map((h) => el('th', { scope: 'col', class: 'th-sub' }, h))));
      } else {
        heads.push(el('tr', {}, (t.head || []).map((h, i) => el('th', i === 0 ? { scope: 'col', class: 'th-first' } : { scope: 'col' }, h))));
      }
      const body = (t.rows || []).map((r) => el('tr', {}, r.map((c, i) => el(i === 0 ? 'th' : 'td', i === 0 ? { scope: 'row' } : {}, c))));
      node.append(el('figure', { class: 'ntable' },
        t.title ? el('figcaption', {}, t.title) : null,
        el('div', { class: 'table-scroll' }, el('table', { class: `${tableClass}${t.groups ? ' grouped' : ''}` }, el('thead', {}, heads), el('tbody', {}, body))),
        t.note ? el('p', { class: 'table-note' }, t.note) : null));
      if (q.passage) node.append(el('p', { class: 'table-text' }, q.passage));
      return;
    }
    if (q.chart) return;
    renderPassage(node, q.passage, { tableClass });
    if (evidence && q.evidence) markText(node, q.evidence, 'evidence');
  }

  // Evidenzia un passo del brano (la prova della risposta corretta): cerca il testo nei nodi, senza HTML.
  function markText(root, needle, cls) {
    const target = String(needle).trim();
    if (!target) return false;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const i = node.nodeValue.indexOf(target);
      if (i < 0) continue;
      const r = document.createRange();
      r.setStart(node, i); r.setEnd(node, i + target.length);
      const m = document.createElement('mark'); m.className = cls;
      r.surroundContents(m);
      return true;
    }
    return false;
  }

  // Giorni di calendario tra oggi e una data «AAAA-MM-GG» (positivo nel futuro).
  function daysUntil(key, from = new Date()) {
    const [y, m, d] = key.split('-').map(Number);
    const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    return Math.round((new Date(y, m - 1, d) - a) / 86400000);
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* fallback */ }
    try {
      const ta = el('textarea', {}, text); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch { return false; }
  }

  return { shuffle, el, clock, taoClock, minSec, todayKey, dateIt, timeIt, dateTimeIt, mondayOf, paragraphs, uid, isTrapError, renderPassage, renderStimulus, hasStimulus, figure, markText, rich, daysUntil, copyText, pad2 };
})();
