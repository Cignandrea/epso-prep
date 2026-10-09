// Persistenza — namespace App.store
// localStorage con copia in memoria. Tutto ciò che conta sta in quattro chiavi:
//   eps2.log       registro per item (array di voci) + sessioni esterne
//   eps2.sessions  riepiloghi di sessione (array)
//   eps2.current   sessione Micro/Allenamento/Ripasso in corso (o null)
//   eps2.sim       simulazione in corso (o null)
//   eps2.settings  impostazioni
window.App = window.App || {};
App.store = (() => {
  'use strict';
  const PREFIX = 'eps2.';
  const memory = {};
  let storageOk = true;

  const corrupt = [];
  function read(name, fallback) {
    const k = PREFIX + name;
    if (k in memory) return memory[k];
    let raw = null;
    try { raw = localStorage.getItem(k); } catch { return fallback; }
    if (raw == null) return fallback;
    try {
      const v = JSON.parse(raw);
      memory[k] = v;
      return v;
    } catch {
      // Valore illeggibile: si conserva a parte, non si sovrascrive in silenzio.
      try { localStorage.setItem(`${k}.corrupt`, raw); localStorage.removeItem(k); } catch { /* ignora */ }
      corrupt.push(name);
      if (window.App && App.ui) App.ui.toast(`Dati «${name}» illeggibili: messi da parte (${name}.corrupt), ripartiti da zero.`, 7000);
      return fallback;
    }
  }
  // Un'altra scheda ha scritto: la copia in memoria non vale più.
  window.addEventListener('storage', (e) => { if (e.key && e.key.startsWith(PREFIX)) delete memory[e.key]; });
  let warned = false;
  function write(name, value) {
    const k = PREFIX + name;
    memory[k] = value;
    try { localStorage.setItem(k, JSON.stringify(value)); } catch {
      storageOk = false;
      if (!warned && window.App && App.ui) { warned = true; App.ui.toast('Impossibile salvare sul dispositivo: i dati di questa sessione andranno persi alla chiusura. Esporta da Stato.', 6000); }
    }
  }

  const DEFAULT_SETTINGS = { confidence: true, microVfn: true, version: 2 };
  const settings = () => ({ ...DEFAULT_SETTINGS, ...read('settings', {}) });
  const setSetting = (k, v) => write('settings', { ...settings(), [k]: v });

  // ── Registro per item ──
  const log = () => { const v = read('log', []); return Array.isArray(v) ? v : []; };
  function addLog(entry) {
    const l = log();
    l.push({ t: new Date().toISOString(), ...entry });
    write('log', l);
  }
  function addLogMany(entries) {
    const l = log();
    const t = new Date().toISOString();
    for (const e of entries) l.push({ t, ...e });
    write('log', l);
  }

  // ── Sessioni ──
  const sessions = () => { const v = read('sessions', []); return Array.isArray(v) ? v : []; };
  function addSession(s) {
    const l = sessions();
    l.push({ t: new Date().toISOString(), ...s });
    write('sessions', l.slice(-500));
  }

  // ── Stato in corso (con controllo di forma: una chiave malformata viene scartata, non fa cadere la home) ──
  function validShape(name, v, check) {
    if (v == null) return null;
    try { if (check(v)) return v; } catch { /* malformata */ }
    try { localStorage.setItem(`${PREFIX}${name}.corrupt`, JSON.stringify(v)); } catch { /* ignora */ }
    write(name, null);
    if (window.App && App.ui) App.ui.toast(`Stato «${name}» non valido: scartato.`, 6000);
    return null;
  }
  const current = () => validShape('current', read('current', null), (c) => Array.isArray(c.items) && Array.isArray(c.answers) && typeof c.index === 'number' && typeof c.startedAt === 'string' && ['answer', 'feedback'].includes(c.phase));
  const setCurrent = (v) => write('current', v);
  const sim = () => validShape('sim', read('sim', null), (x) => Array.isArray(x.sections) && Array.isArray(x.units) && typeof x.unit === 'number' && typeof x.startedAt === 'string' && ['intro', 'running', 'overview', 'results'].includes(x.phase) && x.sections.every((sec) => Array.isArray(sec.items) && sec.answers && sec.bookmarks && sec.time));
  const setSim = (v) => write('sim', v);

  // ── Statistiche derivate dal registro ──
  // Per ogni item: ultimo esito, data, numero errori, "scatola" Leitner e scadenza del ripasso.
  function itemStats() {
    const stats = new Map();
    for (const e of log()) {
      if (e.mode === 'external' || e.id == null) continue;
      const key = `${e.bank}#${e.id}`;
      const s = stats.get(key) || { bank: e.bank, id: e.id, seen: 0, wrong: 0, blank: 0, last: null, lastOk: null, box: 0, due: null, simSeen: false, healedAt: null, modes: new Set() };
      s.seen++;
      s.last = e.t;
      s.lastOk = Boolean(e.ok);
      s.modes.add(e.mode);
      if (e.mode === 'sim') s.simSeen = true;
      if (e.unanswered) {
        s.blank++; // lasciata in bianco: conta nel punteggio, non è una trappola e non entra nel ripasso
      } else if (e.ok) {
        // Una risposta giusta a un item in ripasso lo fa avanzare, in qualunque modalità (Micro, Allenamento, Ripasso).
        if (s.box > 0 && e.mode !== 'sim') {
          s.box = s.box >= 3 ? 0 : s.box + 1; // 1→2→3→guarita («disinnescata»)
          s.due = s.box === 0 ? null : addDays(e.t, s.box === 2 ? 3 : 7);
          if (s.box === 0) s.healedAt = e.t;
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
    return JSON.stringify({ app: 'EU Prep Suite v2', version: SCHEMA, exported: new Date().toISOString(), settings: settings(), log: log(), sessions: sessions() }, null, 1);
  }
  const sessionKey = (s) => (s.id ? `${s.id}|${(s.banks || []).join('+')}` : `${s.t}|${s.mode}`);
  function importAll(json, { merge = true } = {}) {
    let data;
    try { data = JSON.parse(json); } catch { throw new Error('non è un file JSON.'); }
    if (!data || typeof data !== 'object' || !Array.isArray(data.log)) throw new Error('manca il registro (log).');
    const isoT = (t) => typeof t === 'string' && !Number.isNaN(Date.parse(t));
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
    for (const k of ['log', 'sessions', 'current', 'sim', 'settings']) write(k, k === 'settings' ? {} : (k === 'current' || k === 'sim' ? null : []));
    for (const fn of resetListeners) fn();
  }

  return { settings, setSetting, log, addLog, addLogMany, sessions, addSession, current, setCurrent, sim, setSim, itemStats, exportAll, importAll, resetAll, onReset, corruptKeys: () => corrupt.slice(), isStorageOk: () => storageOk };
})();
