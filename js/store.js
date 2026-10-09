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

  function read(name, fallback) {
    const k = PREFIX + name;
    if (k in memory) return memory[k];
    try {
      const raw = localStorage.getItem(k);
      if (raw == null) return fallback;
      const v = JSON.parse(raw);
      memory[k] = v;
      return v;
    } catch { return fallback; }
  }
  function write(name, value) {
    const k = PREFIX + name;
    memory[k] = value;
    try { localStorage.setItem(k, JSON.stringify(value)); } catch { storageOk = false; }
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

  // ── Stato in corso ──
  const current = () => read('current', null);
  const setCurrent = (v) => write('current', v);
  const sim = () => read('sim', null);
  const setSim = (v) => write('sim', v);

  // ── Statistiche derivate dal registro ──
  // Per ogni item: ultimo esito, data, numero errori, "scatola" Leitner e scadenza del ripasso.
  function itemStats() {
    const stats = new Map();
    for (const e of log()) {
      if (e.mode === 'external' || e.id == null) continue;
      const key = `${e.bank}#${e.id}`;
      const s = stats.get(key) || { bank: e.bank, id: e.id, seen: 0, wrong: 0, last: null, lastOk: null, box: 0, due: null, simSeen: false, modes: new Set() };
      s.seen++;
      s.last = e.t;
      s.lastOk = Boolean(e.ok);
      s.modes.add(e.mode);
      if (e.mode === 'sim') s.simSeen = true;
      if (e.ok) {
        if (e.mode === 'review' && s.box > 0) {
          s.box = s.box >= 3 ? 0 : s.box + 1; // 1→2→3→guarita
          s.due = s.box === 0 ? null : addDays(e.t, s.box === 2 ? 3 : 7);
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
  function exportAll() {
    return JSON.stringify({ app: 'EU Prep Suite v2', exported: new Date().toISOString(), settings: settings(), log: log(), sessions: sessions() }, null, 1);
  }
  function importAll(json, { merge = true } = {}) {
    const data = JSON.parse(json);
    if (!data || !Array.isArray(data.log)) throw new Error('File non valido: manca il registro.');
    if (merge) {
      const seen = new Set(log().map((e) => `${e.t}|${e.mode}|${e.bank}|${e.id}`));
      const merged = [...log(), ...data.log.filter((e) => !seen.has(`${e.t}|${e.mode}|${e.bank}|${e.id}`))].sort((a, b) => a.t.localeCompare(b.t));
      write('log', merged);
      const seenS = new Set(sessions().map((s) => s.t + '|' + s.mode));
      write('sessions', [...sessions(), ...(data.sessions || []).filter((s) => !seenS.has(s.t + '|' + s.mode))].sort((a, b) => a.t.localeCompare(b.t)));
    } else {
      write('log', data.log);
      write('sessions', data.sessions || []);
    }
    if (data.settings) write('settings', { ...settings(), ...data.settings });
    return { items: data.log.length, sessions: (data.sessions || []).length };
  }
  function resetAll() {
    for (const k of ['log', 'sessions', 'current', 'sim', 'settings']) write(k, k === 'settings' ? {} : (k === 'current' || k === 'sim' ? null : []));
  }

  return { settings, setSetting, log, addLog, addLogMany, sessions, addSession, current, setCurrent, sim, setSim, itemStats, exportAll, importAll, resetAll, isStorageOk: () => storageOk };
})();
