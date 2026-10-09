// Navigazione tra le viste, toast, dialoghi — namespace App.ui
window.App = window.App || {};
App.ui = (() => {
  'use strict';
  const { el } = App.utils;
  const VIEWS = ['home', 'session', 'end', 'sim-setup', 'sim', 'sim-results', 'external', 'stato'];
  let currentView = 'home';

  function show(name, { title = '' } = {}) {
    for (const v of VIEWS) {
      const node = document.getElementById(`view-${v}`);
      if (node) node.hidden = v !== name;
    }
    currentView = name;
    document.body.dataset.view = name;
    const t = document.getElementById('topbar-title');
    if (t) t.textContent = title;
    document.getElementById('topbar').hidden = name === 'sim';
    window.scrollTo(0, 0);
  }
  const view = () => currentView;

  let toastTimer = null;
  function toast(msg, ms = 2600) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, ms);
  }

  // Dialogo di conferma senza window.confirm (che blocca il browser).
  function confirm({ title, message, okText = 'OK', cancelText = 'Annulla', danger = false }) {
    return new Promise((resolve) => {
      const root = document.getElementById('modal-root');
      const close = (v) => { root.replaceChildren(); resolve(v); };
      const box = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-title' },
        el('h2', { id: 'modal-title' }, title),
        message ? el('p', {}, message) : null,
        el('div', { class: 'modal-actions' },
          el('button', { type: 'button', class: 'btn btn-ghost', onclick: () => close(false) }, cancelText),
          el('button', { type: 'button', class: `btn ${danger ? 'btn-danger' : 'btn-primary'}`, onclick: () => close(true) }, okText)
        )
      );
      root.replaceChildren(el('div', { class: 'modal-backdrop', onclick: (e) => { if (e.target.classList.contains('modal-backdrop')) close(false); } }, box));
      // Escape annulla; Tab resta dentro la modale.
      const onKey = (e) => {
        if (!root.contains(box)) { window.removeEventListener('keydown', onKey, true); return; }
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(false); window.removeEventListener('keydown', onKey, true); return; }
        if (e.key === 'Tab') {
          const f = [...box.querySelectorAll('button')];
          const i = f.indexOf(document.activeElement);
          e.preventDefault();
          f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
        }
      };
      window.addEventListener('keydown', onKey, true);
      box.querySelector('.btn-ghost').focus();
    });
  }
  const modalOpen = () => document.getElementById('modal-root').childElementCount > 0;
  const closeModal = () => document.getElementById('modal-root').replaceChildren();

  return { show, view, toast, confirm, modalOpen, closeModal };
})();
