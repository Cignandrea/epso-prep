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
  const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0); return d; };

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
  const isTouchPhone = () => Math.min(window.innerWidth, window.innerHeight) < 600 && matchMedia('(pointer: coarse)').matches;

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* fallback */ }
    try {
      const ta = el('textarea', { style: 'position:fixed;opacity:0' }, text);
      document.body.append(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch { return false; }
  }

  return { shuffle, el, clock, taoClock, minSec, todayKey, dateIt, timeIt, dateTimeIt, mondayOf, daysAgo, paragraphs, uid, isTouchPhone, copyText, pad2 };
})();
