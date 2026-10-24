// Persistenza — namespace App.store
// localStorage con copia in memoria. Tutto ciò che conta sta in quattro chiavi:
//   eps2.log       registro per item (array di voci) + sessioni esterne
//   eps2.sessions  riepiloghi di sessione (array)
//   eps2.current   sessione Micro/Allenamento/Ripasso in corso (o null)
//   eps2.sim       simulazione in corso (o null)
//   eps2.settings  impostazioni
//   eps2.path      percorso: tappe fatte (v1.2)
//   eps2.stamps    ora dell'ultima modifica di current/sim/settings/path (per la sincronizzazione tra dispositivi)
// Ogni voce nuova di registro e sessioni porta `dev`, l'id di questo dispositivo: la sincronizzazione unisce senza doppioni.
window.App = window.App || {};
App.store = (() => {
  'use strict';
  const PREFIX = 'eps2.';
  const memory = {};
  let storageOk = true;
  const STAMPED = ['current', 'sim', 'settings', 'path'];
  const writeListeners = [];
  let silent = false;
  const DEV = (() => {
    try {
      let d = localStorage.getItem(`${PREFIX}dev`);
      if (!d) { d = `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`; localStorage.setItem(`${PREFIX}dev`, d); }
      return d;
    } catch { return `d${Math.random().toString(36).slice(2, 8)}`; }
  })();

  const corrupt = [];
  const isoT = (t) => typeof t === 'string' && !Number.isNaN(Date.parse(t));
  const isObj = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
  // Forma attesa per chiave: una voce non valida viene scartata (copia in <k>.corrupt), mai lasciata a far cadere la home.
  const SHAPES = {
    log: { list: true, ok: (e) => isObj(e) && isoT(e.t) && typeof e.mode === 'string' },
    sessions: { list: true, ok: (e) => isObj(e) && isoT(e.t) && typeof e.mode === 'string', fix: (s) => (Array.isArray(s.banks) ? s : { ...s, banks: typeof s.banks === 'string' ? [s.banks] : [] }) },
    settings: { list: false, ok: isObj },
    path: { list: false, ok: isObj },
    stamps: { list: false, ok: isObj },
  };
  function setAside(k, raw) { try { localStorage.setItem(`${k}.corrupt`, typeof raw === 'string' ? raw : JSON.stringify(raw)); } catch { /* ignora */ } }
  function sanitize(name, v) {
    const shape = SHAPES[name];
    if (!shape) return v;
    const k = PREFIX + name;
    if (shape.list) {
      if (!Array.isArray(v)) { setAside(k, v); corrupt.push(name); notify(`Dati «${name}» di forma inattesa: messi da parte (${name}.corrupt), ripartiti da zero.`); return []; }
      const good = v.filter(shape.ok).map(shape.fix || ((x) => x));
      if (good.length !== v.length) { setAside(k, v); corrupt.push(name); notify(`Dati «${name}»: ${v.length - good.length} voci illeggibili messe da parte (${name}.corrupt).`); write(name, good); }
      return good;
    }
    if (!shape.ok(v)) { setAside(k, v); corrupt.push(name); notify(`Dati «${name}» di forma inattesa: messi da parte (${name}.corrupt), ripristinati i valori predefiniti.`); return {}; }
    return v;
  }
  function notify(msg) { if (window.App && App.ui) App.ui.toast(msg, 7000); }
  function read(name, fallback) {
    const k = PREFIX + name;
    if (k in memory) return memory[k];
    let raw = null;
    try { raw = localStorage.getItem(k); } catch { return fallback; }
    if (raw == null) return fallback;
    try {
      const v = sanitize(name, JSON.parse(raw));
      memory[k] = v;
      return v;
    } catch {
      // Valore illeggibile: si conserva a parte, non si sovrascrive in silenzio.
      setAside(k, raw);
      try { localStorage.removeItem(k); } catch { /* ignora */ }
      corrupt.push(name);
      notify(`Dati «${name}» illeggibili: messi da parte (${name}.corrupt), ripartiti da zero.`);
      return fallback;
    }
  }
  // Un'altra scheda ha scritto: la copia in memoria non vale più.
  window.addEventListener('storage', (e) => { if (e.key && e.key.startsWith(PREFIX)) delete memory[e.key]; });
  let warned = false;
  function write(name, value, { stamp = null } = {}) {
    const k = PREFIX + name;
    memory[k] = value;
    try { localStorage.setItem(k, JSON.stringify(value)); } catch {
      storageOk = false;
      if (!warned && window.App && App.ui) { warned = true; App.ui.toast('Impossibile salvare sul dispositivo: i dati di questa sessione andranno persi alla chiusura. Esporta da Stato.', 6000); }
    }
    if (STAMPED.includes(name)) {
      const st = { ...read('stamps', {}) };
      st[name] = stamp || new Date().toISOString();
      memory[`${PREFIX}stamps`] = st;
      try { localStorage.setItem(`${PREFIX}stamps`, JSON.stringify(st)); } catch { /* ignora */ }
    }
    if (!silent) for (const fn of writeListeners) { try { fn(name); } catch (err) { console.warn('listener di scrittura', err); } }
  }
  const onWrite = (fn) => writeListeners.push(fn);
  const stamps = () => ({ ...read('stamps', {}) });
  // Scrittura che arriva da un altro dispositivo: non riparte verso la sincronizzazione e tiene l'ora d'origine.
  // I dati letti dal database arrivano congelati: se ne salva una copia, che il resto dell'app può modificare.
  function applyRemote(name, value, stamp) { silent = true; try { write(name, value == null ? value : JSON.parse(JSON.stringify(value)), { stamp }); } finally { silent = false; } }

  const DEFAULT_SETTINGS = { confidence: true, microVfn: true, prereqDone: false, officialDone: false, leaveDone: false, portalChecked: null, complaintsDone: false, version: 2 };
  const settings = () => ({ ...DEFAULT_SETTINGS, ...read('settings', {}) });
  const setSetting = (k, v) => write('settings', { ...settings(), [k]: v });

  // ── Registro per item ── (una voce con `t` esplicito nel passato tiene l'ordine cronologico: Leitner legge in sequenza)
  const byT = (a, b) => a.t.localeCompare(b.t);
  const log = () => read('log', []);
  function addLog(entry) { addLogMany([entry]); }
  function addLogMany(entries) {
    const l = log();
    const now = new Date().toISOString();
    const last = l.length ? l[l.length - 1].t : '';
    let reorder = false;
    for (const e of entries) { const row = { t: now, dev: DEV, ...e }; if (row.t < last) reorder = true; l.push(row); }
    if (reorder) l.sort(byT);
    write('log', l);
  }

  // ── Sessioni ── (sempre in ordine cronologico)
  const sessions = () => read('sessions', []);
  function addSession(s) {
    const l = sessions();
    l.push({ t: new Date().toISOString(), dev: DEV, ...s });
    l.sort(byT);
    write('sessions', l.slice(-500));
  }

  // ── Percorso ──
  const path = () => read('path', {});
  const setPath = (v) => write('path', v);

  // ── Stato in corso (con controllo di forma: una chiave malformata viene scartata, non fa cadere la home) ──
  function validShape(name, v, check) {
    if (v == null) return null;
    try { if (check(v)) return v; } catch { /* malformata */ }
    try { localStorage.setItem(`${PREFIX}${name}.corrupt`, JSON.stringify(v)); } catch { /* ignora */ }
    write(name, null);
    if (window.App && App.ui) App.ui.toast(`Stato «${name}» non valido: scartato.`, 6000);
    return null;
  }
  const current = () => validShape('current', read('current', null), (c) => isObj(c)
    && Array.isArray(c.items) && c.items.length > 0 && c.items.every((it) => isObj(it) && typeof it.bank === 'string')
    && Array.isArray(c.answers) && c.answers.every(isObj)
    && Number.isInteger(c.index) && c.index >= 0 && c.index < c.items.length
    && isoT(c.startedAt) && ['answer', 'feedback'].includes(c.phase) && (c.phase !== 'feedback' || c.answers.length > 0));
  const setCurrent = (v) => write('current', v);
  const sim = () => validShape('sim', read('sim', null), (x) => {
    if (!isObj(x) || !Array.isArray(x.sections) || !x.sections.length || !Array.isArray(x.units) || !x.units.length) return false;
    if (!Number.isInteger(x.unit) || x.unit < 0 || x.unit >= x.units.length || !isoT(x.startedAt)) return false;
    if (!['intro', 'running', 'overview', 'results'].includes(x.phase)) return false;
    if (!x.sections.every((sec) => isObj(sec) && Array.isArray(sec.items) && sec.items.length > 0 && isObj(sec.answers) && isObj(sec.bookmarks) && isObj(sec.time))) return false;
    if (!x.units.every((u) => isObj(u) && Array.isArray(u.sections) && u.sections.length > 0 && u.sections.every((si) => Number.isInteger(si) && si >= 0 && si < x.sections.length))) return false;
    const n = x.units[x.unit].sections.reduce((s, si) => s + x.sections[si].items.length, 0);
    if (!Number.isInteger(x.pos) || x.pos < 0 || x.pos >= n) return false;
    if ((x.phase === 'running' || x.phase === 'overview') && typeof x.deadline !== 'number') return false;
    return x.phase !== 'results' || Array.isArray(x.results);
  });
  const setSim = (v) => write('sim', v);

  // ── Statistiche derivate dal registro ──
  // Per ogni item: ultimo esito, data, numero errori, "scatola" Leitner e scadenza del ripasso.
  function itemStats() {
    const stats = new Map();
    for (const e of log()) {
      if (e.mode === 'external' || e.id == null || !isoT(e.t)) continue;
      // Un gemello (ripasso con numeri nuovi) conta per l'item originale.
      const id = e.twinOf != null ? e.twinOf : e.id;
      const key = `${e.bank}#${id}`;
      const s = stats.get(key) || { bank: e.bank, id, seen: 0, wrong: 0, blank: 0, last: null, lastOk: null, box: 0, due: null, simSeen: false, healedAt: null, modes: new Set() };
      s.seen++;
      s.last = e.t;
      s.lastOk = Boolean(e.ok);
      s.modes.add(e.mode);
      if (e.mode === 'sim') s.simSeen = true;
      if (e.unanswered) {
        s.blank++; // lasciata in bianco: conta nel punteggio, non è una trappola e non entra nel ripasso
      } else if (e.ok) {
        // Una risposta giusta a un item in ripasso lo fa avanzare, in qualunque modalità (Micro, Allenamento, Ripasso).
        // Avanza solo a scadenza raggiunta: una risposta giusta il giorno dopo l'errore non vale come ripasso a distanza.
        if (s.box > 0 && e.mode !== 'sim' && (!s.due || Date.parse(e.t) >= Date.parse(s.due))) {
          s.box = s.box >= 3 ? 0 : s.box + 1; // 1→2→3→guarita («disinnescata»)
          s.due = s.box === 0 ? null : addDays(e.t, s.box === 2 ? 3 : 7);
          if (s.box === 0) s.healedAt = e.t;
        } else if (s.box === 0 && e.conf === 'doubt' && e.mode !== 'sim') {
          // Giusta ma in dubbio: torna dopo 3 giorni, per consolidarla.
          s.box = 2;
          s.due = addDays(e.t, 3);
        }
      } else {
        s.wrong++;
        s.box = 1;
        s.due = addDays(e.t, 1);
      }
      stats.set(key, s);
    }
    return stats;
  }
  function addDays(iso, n) { const d = new Date(iso); d.setDate(d.getDate() + n); d.setHours(4, 0, 0, 0); return d.toISOString(); }

  // ── Export / import ──
  const SCHEMA = 2;
  function exportAll() {
    return JSON.stringify({ app: 'EU Prep Suite v2', version: SCHEMA, exported: new Date().toISOString(), settings: settings(), path: path(), log: log(), sessions: sessions() }, null, 1);
  }
  const sessionKey = (s) => (s.id ? `${s.id}|${(s.banks || []).join('+')}` : `${s.t}|${s.mode}`);
  function importAll(json, { merge = true } = {}) {
    let data;
    try { data = JSON.parse(json); } catch { throw new Error('non è un file JSON.'); }
    if (!data || typeof data !== 'object' || !Array.isArray(data.log)) throw new Error('manca il registro (log).');
    data.log.forEach((e, i) => {
      if (!e || typeof e !== 'object' || !isoT(e.t) || typeof e.mode !== 'string' || typeof e.bank !== 'string') throw new Error(`voce ${i + 1} del registro non valida.`);
    });
    (data.sessions || []).forEach((s, i) => {
      if (!s || typeof s !== 'object' || !isoT(s.t) || typeof s.mode !== 'string') throw new Error(`sessione ${i + 1} non valida.`);
    });
    if (data.settings != null && (typeof data.settings !== 'object' || Array.isArray(data.settings))) throw new Error('impostazioni non valide.');
    let addedItems = data.log.length, addedSessions = (data.sessions || []).length;
    if (merge) {
      const seen = new Set(log().map((e) => `${e.t}|${e.mode}|${e.bank}|${e.id}`));
      const newItems = data.log.filter((e) => !seen.has(`${e.t}|${e.mode}|${e.bank}|${e.id}`));
      write('log', [...log(), ...newItems].sort((a, b) => a.t.localeCompare(b.t)));
      const seenS = new Set(sessions().map(sessionKey));
      const newSessions = (data.sessions || []).filter((s) => !seenS.has(sessionKey(s)));
      write('sessions', [...sessions(), ...newSessions].sort((a, b) => a.t.localeCompare(b.t)));
      addedItems = newItems.length; addedSessions = newSessions.length;
    } else {
      write('log', data.log);
      write('sessions', data.sessions || []);
    }
    if (data.path && typeof data.path === 'object' && !Array.isArray(data.path)) {
      const cur = path();
      write('path', { ...cur, ...data.path, done: { ...(data.path.done || {}), ...(cur.done || {}) }, p2: { i: Math.max((cur.p2 || {}).i || 0, (data.path.p2 || {}).i || 0) } });
    }
    if (data.settings) {
      const allowed = {};
      for (const k of Object.keys(DEFAULT_SETTINGS)) if (k in data.settings) allowed[k] = data.settings[k];
      write('settings', { ...settings(), ...allowed });
    }
    return { items: addedItems, sessions: addedSessions };
  }
  const resetListeners = [];
  const onReset = (fn) => resetListeners.push(fn);
  function resetAll() {
    for (const k of ['log', 'sessions', 'current', 'sim', 'settings', 'path']) write(k, k === 'settings' || k === 'path' ? {} : (k === 'current' || k === 'sim' ? null : []));
    for (const fn of resetListeners) fn();
  }

  // Lettura grezza per la sincronizzazione (senza controllo di forma su current/sim: lo fa chi li usa).
  const raw = (name) => read(name, ['log', 'sessions'].includes(name) ? [] : null);

  return { settings, setSetting, log, addLog, addLogMany, sessions, addSession, current, setCurrent, sim, setSim, path, setPath, itemStats, exportAll, importAll, resetAll, onReset, onWrite, stamps, applyRemote, raw, DEV, corruptKeys: () => corrupt.slice(), isStorageOk: () => storageOk };
})();
