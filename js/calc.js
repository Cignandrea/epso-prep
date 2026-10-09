// Calcolatrice e scratchpad della simulazione — namespace App.calc
// Come in TAO: separatore decimale il punto, tastiera o pulsanti, Invio = uguale.
window.App = window.App || {};
App.calc = (() => {
  'use strict';
  const { el } = App.utils;
  const $ = (id) => document.getElementById(id);
  const KEYS = ['C', '(', ')', '⌫', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '+', '='];

  // Valutatore senza eval: tokenizza, shunting-yard, calcola.
  function evaluate(expr) {
    const src = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '.').replace(/\s+/g, '');
    const tokens = src.match(/(\d+\.?\d*|\.\d+)|[-+*/()]/g);
    if (!tokens || tokens.join('') !== src) throw new Error('Espressione non valida');
    const out = [], ops = [];
    const prec = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, 'u-': 3 };
    let prev = null;
    for (const t of tokens) {
      if (/^[\d.]/.test(t)) { out.push(parseFloat(t)); prev = 'num'; continue; }
      if (t === '(') { ops.push(t); prev = '('; continue; }
      if (t === ')') { while (ops.length && ops[ops.length - 1] !== '(') out.push(ops.pop()); if (!ops.length) throw new Error('Parentesi'); ops.pop(); prev = 'num'; continue; }
      const op = (t === '-' && (prev === null || prev === 'op' || prev === '(')) ? 'u-' : t;
      while (ops.length && ops[ops.length - 1] !== '(' && prec[ops[ops.length - 1]] >= prec[op] && op !== 'u-') out.push(ops.pop());
      ops.push(op); prev = 'op';
    }
    while (ops.length) { const o = ops.pop(); if (o === '(') throw new Error('Parentesi'); out.push(o); }
    const st = [];
    for (const t of out) {
      if (typeof t === 'number') { st.push(t); continue; }
      if (t === 'u-') { st.push(-st.pop()); continue; }
      const b = st.pop(), a = st.pop();
      if (a == null || b == null) throw new Error('Espressione incompleta');
      st.push(t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : t === '/' ? a / b : (a * b) / 100);
    }
    if (st.length !== 1 || !Number.isFinite(st[0])) throw new Error('Risultato non valido');
    return Math.round(st[0] * 1e10) / 1e10;
  }

  function press(k) {
    const d = $('calc-display');
    if (k === 'C') { d.value = ''; return; }
    if (k === '⌫') { d.value = d.value.slice(0, -1); return; }
    if (k === '=') { try { d.value = String(evaluate(d.value)); } catch { d.classList.add('calc-err'); setTimeout(() => d.classList.remove('calc-err'), 400); } return; }
    d.value += k;
    d.focus();
  }

  function init() {
    const keys = $('calc-keys');
    keys.replaceChildren(...KEYS.map((k) => el('button', { type: 'button', class: `calc-key${k === '=' ? ' calc-eq' : ''}`, onclick: () => press(k) }, k)));
    $('calc-display').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); press('='); } });
    $('tao-calc').addEventListener('click', () => toggle('tao-calc-widget'));
    $('tao-pad').addEventListener('click', () => toggle('tao-pad-widget'));
    $('s-calc').addEventListener('click', () => toggle('tao-calc-widget'));
    $('s-pad').addEventListener('click', () => toggle('tao-pad-widget'));
    makeDraggable($('tao-calc-widget')); makeDraggable($('tao-pad-widget'));
    for (const b of document.querySelectorAll('[data-close]')) b.addEventListener('click', () => { $(b.dataset.close).hidden = true; });
  }
  function toggle(id) {
    const w = $(id);
    w.hidden = !w.hidden;
    if (!w.hidden) { bringToFront(w); (w.querySelector('input, textarea') || w).focus({ preventScroll: true }); }
  }
  let z = 10;
  function bringToFront(w) { w.style.zIndex = String(++z); }
  // Trascinamento dalla barra del titolo (mouse e tocco) sugli schermi larghi.
  function makeDraggable(w) {
    const head = w.querySelector('.tao-widget-head');
    let drag = null;
    head.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || window.innerWidth < 600) return;
      const r = w.getBoundingClientRect();
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      bringToFront(w);
      head.setPointerCapture(e.pointerId);
    });
    head.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const x = Math.max(0, Math.min(window.innerWidth - w.offsetWidth, e.clientX - drag.dx));
      const y = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - drag.dy));
      w.style.left = `${x}px`; w.style.top = `${y}px`; w.style.right = 'auto'; w.style.bottom = 'auto';
    });
    const end = () => { drag = null; };
    head.addEventListener('pointerup', end); head.addEventListener('pointercancel', end);
  }
  function hideAll() { $('tao-calc-widget').hidden = true; $('tao-pad-widget').hidden = true; }
  function reset() { $('calc-display').value = ''; $('pad-text').value = ''; hideAll(); for (const id of ['tao-calc-widget', 'tao-pad-widget']) { const w = $(id); w.style.left = ''; w.style.top = ''; w.style.right = ''; w.style.bottom = ''; } }

  return { init, evaluate, reset, toggle, hideAll };
})();
