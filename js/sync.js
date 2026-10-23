// Sincronizzazione tra dispositivi (Fold e PC) — namespace App.sync
// Si accende solo quando l'app gira come artifact su claude.ai con il database dell'artifact (capability db + user);
// altrove (GitHub Pages, file locale) l'app resta locale come prima. I dati stanno nell'area privata della persona,
// data/users/<id>/, che nessun altro vede:
//   - doc «state»: tappa in pausa (current), simulazione (sim), impostazioni, percorso, con l'ora di ogni modifica;
//   - doc «log-<AAAAMMGG>-<dispositivo>»: registro e sessioni di quel giorno scritti da quel dispositivo.
// Regole di unione: registro e sessioni si sommano senza doppioni; il percorso si unisce (una tappa fatta resta fatta);
// tappa in pausa, simulazione e impostazioni: vince la modifica più recente.
window.App = window.App || {};
App.sync = (() => {
  'use strict';
  let col = null, ready = false, pushTimer = null, pulling = false, lastPull = 0, status = 'off';
  const dirty = new Set();
  const lastDaySig = new Map();
  let lastStateSig = '';
  // Diagnostica: window.__syncDebug = true in console per seguire invii e letture.
  const dbg = (...a) => { if (window.__syncDebug) console.log('[sync]', ...a); };

  const entryKey = (e) => `${e.t}|${e.mode}|${e.bank}|${e.id}|${e.session || ''}`;
  const sessionKey = (s) => `${s.t}|${s.mode}|${s.id || ''}|${(s.banks || []).join('+')}`;
  const dayOf = (iso) => (typeof iso === 'string' ? iso.slice(0, 10).replace(/-/g, '') : 'nodata');
  // Firma dello stato senza il tempo che scorre sull'item corrente: un tick non è una modifica da sincronizzare.
  function stateSig() {
    const cur = App.store.raw('current');
    const c = cur ? { ...cur, elapsed: 0 } : null;
    return JSON.stringify([c, App.store.raw('sim'), App.store.raw('settings'), App.store.raw('path')]);
  }

  async function init() {
    if (!window.claude || typeof window.claude.use !== 'function') return;
    try {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user) return;
      const uid = await user.id();
      if (!uid) return;
      col = db.collection(`data/users/${uid}`);
      ready = true; status = 'on';
      App.store.onWrite(onLocalWrite);
      await pull(true);
      // Ciò che esiste solo qui (sessioni fatte prima della sincronizzazione) parte subito.
      dirty.add('state'); dirty.add('lists'); schedule(1500);
      document.addEventListener('visibilitychange', () => { if (document.hidden) flush(true); else pull(); });
      window.addEventListener('pagehide', () => flush(true));
    } catch (err) { status = 'error'; console.warn('sincronizzazione non disponibile', err); }
  }

  function onLocalWrite(name) {
    dbg('write', name, ready, [...dirty].join(','), Boolean(pushTimer));
    if (!ready) return;
    // Fine di una tappa (sessioni, percorso): parte subito; una risposta: entro pochi secondi; il tempo che scorre: con calma.
    if (name === 'log' || name === 'sessions') { dirty.add('lists'); schedule(name === 'sessions' ? 1200 : 2500); return; }
    if (!['current', 'sim', 'settings', 'path'].includes(name)) return;
    if (stateSig() === lastStateSig) return;
    dirty.add('state');
    schedule(name === 'current' ? 8000 : 1200);
  }
  // Un solo invio in attesa: se ne serve uno prima, anticipa quello già programmato (mai lo rimanda).
  let pushDue = 0;
  function schedule(ms) {
    const due = performance.now() + ms;
    if (pushTimer && pushDue <= due) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushDue = due;
    pushTimer = setTimeout(() => { pushTimer = null; push(); }, ms);
  }
  function flush(leaving = false) {
    if (!ready) return;
    if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
    if (leaving && App.store.raw('current')) dirty.add('state'); // chi esce a metà domanda ritrova anche il tempo speso
    push();
  }

  // Una scrittura alla volta per documento (regola del database): un invio che arriva mentre l'altro è in corso aspetta.
  let pushing = false;
  async function push() {
    dbg('push', ready, [...dirty].join(','), pushing);
    if (!ready || !dirty.size) return;
    if (pushing) { schedule(1500); return; }
    pushing = true;
    try { await pushNow(); } finally { pushing = false; }
  }
  async function pushNow() {
    const work = new Set(dirty); dirty.clear();
    const now = new Date().toISOString();
    try {
      if (work.has('state')) {
        lastStateSig = stateSig();
        await col.doc('state').set({ v: 1, dev: App.store.DEV, updatedAt: now, stamps: App.store.stamps(), current: App.store.raw('current'), sim: App.store.raw('sim'), settings: App.store.raw('settings') || {}, path: App.store.raw('path') || {} });
      }
      if (work.has('lists')) {
        const days = new Map();
        const bucket = (iso) => { const d = dayOf(iso); if (!days.has(d)) days.set(d, { log: [], sessions: [] }); return days.get(d); };
        for (const e of App.store.log()) if (!e.dev || e.dev === App.store.DEV) bucket(e.t).log.push(e);
        for (const s of App.store.sessions()) if (!s.dev || s.dev === App.store.DEV) bucket(s.t).sessions.push(s);
        for (const [day, data] of days) {
          const sig = `${data.log.length}|${data.sessions.length}|${data.log.length ? data.log[data.log.length - 1].t : ''}|${data.sessions.length ? data.sessions[data.sessions.length - 1].t : ''}`;
          if (lastDaySig.get(day) === sig) continue;
          await col.doc(`log-${day}-${App.store.DEV}`).set({ day, dev: App.store.DEV, updatedAt: now, log: data.log, sessions: data.sessions });
          lastDaySig.set(day, sig);
        }
      }
      status = 'on';
    } catch (err) {
      for (const w of work) dirty.add(w);
      status = 'error';
      console.warn('sincronizzazione: invio non riuscito', err && err.code, err && err.message);
      if (err && (err.code === 'unavailable' || err.code === 'resource_exhausted')) schedule(20000);
    }
  }

  async function pull(force = false) {
    if (!ready || pulling || (!force && Date.now() - lastPull < 5000)) return;
    pulling = true;
    try {
      const snap = await col.limit(1000).get();
      let changed = false;
      const rLog = [], rSessions = [];
      for (const doc of snap.docs) {
        const data = doc.data() || {};
        if (doc.id === 'state') changed = mergeState(data) || changed;
        else if (doc.id.startsWith('log-')) { rLog.push(...(data.log || [])); rSessions.push(...(data.sessions || [])); }
      }
      changed = mergeLists(rLog, rSessions) || changed;
      lastPull = Date.now();
      status = 'on';
      // Si ridisegna solo la home: una sessione aperta qui non viene mai cambiata sotto le dita.
      if (changed && App.ui.view() === 'home') App.main.home();
    } catch (err) { status = 'error'; console.warn('sincronizzazione: lettura non riuscita', err && err.code, err && err.message); }
    finally { pulling = false; }
  }

  function mergeState(r) {
    const local = App.store.stamps();
    const rs = r.stamps || {};
    let changed = false;
    const busy = App.session.isLive() || App.ui.view() === 'sim' || App.ui.view() === 'lesson';
    for (const k of ['current', 'sim', 'settings']) {
      if (!(k in r) || !rs[k] || (local[k] && rs[k] <= local[k])) continue;
      if (busy && k !== 'settings') continue; // qui c'è una sessione aperta: vince quella, la sua modifica arriverà dopo
      App.store.applyRemote(k, r[k], rs[k]);
      changed = true;
    }
    // Percorso: unione (una tappa fatta su un dispositivo è fatta ovunque).
    if (r.path && typeof r.path === 'object') {
      const cur = App.store.raw('path') || {};
      const done = { ...(r.path.done || {}), ...(cur.done || {}) };
      const p2 = { i: Math.max((cur.p2 || {}).i || 0, (r.path.p2 || {}).i || 0) };
      const merged = { ...cur, done, p2 };
      if (JSON.stringify(merged) !== JSON.stringify(cur)) { App.store.applyRemote('path', merged, rs.path || new Date().toISOString()); changed = true; }
    }
    lastStateSig = stateSig();
    return changed;
  }

  function mergeLists(rLog, rSessions) {
    let changed = false;
    if (rLog.length) {
      const l = App.store.log();
      const seen = new Set(l.map(entryKey));
      const add = rLog.filter((e) => e && typeof e.t === 'string' && !seen.has(entryKey(e)));
      if (add.length) { App.store.applyRemote('log', [...l, ...add].sort((a, b) => a.t.localeCompare(b.t))); changed = true; }
    }
    if (rSessions.length) {
      const s = App.store.sessions();
      const seen = new Set(s.map(sessionKey));
      const add = rSessions.filter((x) => x && typeof x.t === 'string' && !seen.has(sessionKey(x)));
      if (add.length) { App.store.applyRemote('sessions', [...s, ...add].sort((a, b) => a.t.localeCompare(b.t)).slice(-500)); changed = true; }
    }
    return changed;
  }

  return { init, pull, flush, status: () => status, active: () => ready };
})();
