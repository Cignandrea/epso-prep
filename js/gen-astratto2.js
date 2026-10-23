// Generatore dell'astratto v2 (più elementi per figura) — namespace App.gen.astratto2
// Formato [V test di esempio EPSO in italiano, 08/10/2026]: cinque figure in fila, si sceglie la sesta tra cinque (A–E).
// Rispetto alla v1 (gen-astratto.js) ogni figura contiene 2–3 elementi indipendenti, ognuno al suo posto fisso, e ogni regola
// governa un elemento diverso: è lo schema descritto dai siti di preparazione [A], non verificato su prove reali.
// Livello 2: due regole (in metà degli item c'è anche un terzo elemento fermo); livello 3: tre regole.
// Elementi: forma (tipo, colore, misura), freccia (orientamento), pallini (numero), disco a 8 spicchi (settore colorato),
// griglia 3×3 (casella colorata). Id «B<livello>-<seme>»: make(seme, livello) è pura, lo stesso id ridà lo stesso item.
//
// Distrattori: ogni opzione sbagliata viola una regola o cambia qualcosa che nella serie resta fisso. Se ogni opzione avesse
// un solo errore, su ogni caratteristica la chiave starebbe con la maggioranza e il «voto di maggioranza» la troverebbe
// sempre. Per questo in circa 4 item su 5 (DECOY) c'è l'esca della v1: un'opzione con un errore E, due con E più un altro
// errore, una con un errore diverso; l'opzione «più simile a tutte» è l'esca. Negli altri item quattro errori singoli, uno
// per regola e il resto su elementi fissi. Spesso un elemento resta com'era nella quinta figura (trappola «ripeti la 5ª»).
window.App = window.App || {};
App.gen = App.gen || {};
App.gen.astratto2 = (() => {
  'use strict';

  function mulberry32(a) {
    return function rnd() {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function tools(rng) {
    return {
      int: (a, b) => a + Math.floor(rng() * (b - a + 1)),
      pick: (arr) => arr[Math.floor(rng() * arr.length)],
      shuffle: (arr) => { const x = arr.slice(); for (let k = x.length - 1; k > 0; k--) { const j = Math.floor(rng() * (k + 1)); [x[k], x[j]] = [x[j], x[k]]; } return x; },
      chance: (p) => rng() < p,
    };
  }
  const mod = (a, n) => ((a % n) + n) % n;

  // Quota di item con l'esca (vedi sopra). Con 0 restano solo errori singoli, ma il voto di maggioranza trova sempre la chiave.
  const DECOY = 0.8;

  // ── Lessico ──
  const FILLS = ['white', 'grey', 'black'];
  const FILL_M = { white: 'bianco', grey: 'grigio', black: 'nero' };
  const FILL_F = { white: 'bianca', grey: 'grigia', black: 'nera' };
  const FILL_MP = { white: 'bianchi', grey: 'grigi', black: 'neri' };
  const KINDS = ['circle', 'triangle', 'square'];
  const KIND = { circle: 'cerchio', triangle: 'triangolo', square: 'quadrato', pentagon: 'pentagono' };
  const SIZE_W = ['molto piccolo', 'piccolo', 'medio', 'grande'];
  const DIRS = ['verso l\'alto', 'verso l\'alto a destra', 'verso destra', 'verso il basso a destra', 'verso il basso', 'verso il basso a sinistra', 'verso sinistra', 'verso l\'alto a sinistra'];
  const CELL = ['in alto a sinistra', 'in alto al centro', 'in alto a destra', 'al centro a sinistra', 'al centro', 'al centro a destra', 'in basso a sinistra', 'in basso al centro', 'in basso a destra'];
  const CLOCK = ['12', '1 e mezza', '3', '4 e mezza', '6', '7 e mezza', '9', '10 e mezza'];
  const dalle = (e) => (mod(e, 8) === 1 ? `dall'${CLOCK[1]}` : `dalle ${CLOCK[mod(e, 8)]}`);
  const alle = (e) => (mod(e, 8) === 1 ? `all'${CLOCK[1]}` : `alle ${CLOCK[mod(e, 8)]}`);
  const RINGC = [0, 1, 2, 5, 8, 7, 6, 3]; // le 8 caselle del bordo della griglia, in senso orario dall'angolo in alto a sinistra
  const TRI4 = [0, 1, 2, 1]; // avanti e indietro su tre caselle
  const WAVE6 = [0, 1, 2, 3, 2, 1]; // avanti e indietro su quattro misure
  const VEC = { '1,0': 'verso destra', '-1,0': 'verso sinistra', '0,1': 'verso il basso', '0,-1': 'verso l\'alto', '1,1': 'in diagonale verso il basso a destra', '-1,1': 'in diagonale verso il basso a sinistra', '1,-1': 'in diagonale verso l\'alto a destra', '-1,-1': 'in diagonale verso l\'alto a sinistra' };
  const LINE = { row: ['la riga in alto', 'la riga centrale', 'la riga in basso'], col: ['la colonna di sinistra', 'la colonna centrale', 'la colonna di destra'], diag: ['la diagonale dall\'alto a sinistra al basso a destra'], anti: ['la diagonale dall\'alto a destra al basso a sinistra'] };
  const verso = (s) => (s > 0 ? 'orario' : 'antiorario');
  const cells = (n) => `${n} ${n === 1 ? 'casella' : 'caselle'}`;
  const cellOf = (r, c) => mod(r, 3) * 3 + mod(c, 3);
  const around = (cell) => {
    const r = Math.floor(cell / 3); const c = cell % 3; const out = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr; const cc = c + dc; if ((dr || dc) && rr >= 0 && rr <= 2 && cc >= 0 && cc <= 2) out.push(rr * 3 + cc); }
    return out;
  };
  const bounceCell = (p, u) => (p.line === 'row' ? cellOf(p.idx, u) : p.line === 'col' ? cellOf(u, p.idx) : p.line === 'diag' ? cellOf(u, u) : cellOf(u, 2 - u));

  // ── Regole: una per elemento. at(p, k) = valore al passo k (0–4 la serie, 5 la risposta); wrong(p) = valori sbagliati
  // plausibili per la sesta figura (quelli uguali alla chiave o non validi si scartano dopo). ──
  const RULES = {
    kind3: {
      el: 'shape', feature: 'shapeKind', type: 'alternanza',
      init: (t) => ({ cyc: t.shuffle(KINDS) }),
      at: (p, k) => p.cyc[mod(k, 3)],
      wrong: (p) => [p.cyc[1], p.cyc[0], 'pentagon'],
      desc: (p) => `la forma segue il ciclo ${KIND[p.cyc[0]]} → ${KIND[p.cyc[1]]} → ${KIND[p.cyc[2]]}, poi ricomincia`,
      broke: 'la forma è del tipo sbagliato',
    },
    fill3: {
      el: 'shape', feature: 'shapeFill', type: 'riempimento',
      init: (t) => ({ start: t.int(0, 2), dir: t.pick([1, -1]) }),
      at: (p, k) => FILLS[mod(p.start + k * p.dir, 3)],
      wrong: () => FILLS.slice(),
      desc: (p) => `il colore della forma segue il ciclo ${[0, 1, 2].map((k) => FILL_M[FILLS[mod(p.start + k * p.dir, 3)]]).join(' → ')}, poi ricomincia`,
      broke: 'la forma ha il colore sbagliato',
    },
    size: {
      el: 'shape', feature: 'shapeSize', type: 'dimensione',
      init: (t) => {
        const mode = t.pick(['cycle4', 'cycle3', 'bounce']);
        // Avanti e indietro: solo le partenze in cui l'inversione che serve per la sesta figura si vede già nella serie.
        if (mode === 'bounce') return { mode, start: t.pick([0, 1, 3, 4]) };
        if (mode === 'cycle3') return { mode, start: t.int(0, 2), dir: t.pick([1, -1]), lo: t.int(0, 1) };
        return { mode, start: t.int(0, 3), dir: t.pick([1, -1]) };
      },
      at: (p, k) => (p.mode === 'bounce' ? WAVE6[mod(p.start + k, 6)] : p.mode === 'cycle3' ? p.lo + mod(p.start + k * p.dir, 3) : mod(p.start + k * p.dir, 4)),
      wrong: () => [0, 1, 2, 3],
      desc: (p) => {
        if (p.mode === 'bounce') return 'la forma cresce di una misura a ogni passo fino alla più grande, poi rimpicciolisce fino alla più piccola, e così via avanti e indietro';
        const n = p.mode === 'cycle3' ? 'tre' : 'quattro';
        return p.dir > 0 ? `la forma cresce di una misura a ogni passo e, dopo la più grande, ricomincia dalla più piccola (${n} misure)` : `la forma rimpicciolisce di una misura a ogni passo e, dopo la più piccola, ricomincia dalla più grande (${n} misure)`;
      },
      broke: 'la forma ha la misura sbagliata',
    },
    rot: {
      el: 'arrow', feature: 'arrowRot', type: 'rotazione',
      init: (t) => ({ start: t.int(0, 7) * 45, step: t.pick([45, -45, 90, -90, 135, -135]) }),
      at: (p, k) => mod(p.start + k * p.step, 360),
      wrong: (p) => { const key = p.start + 5 * p.step; return [key - p.step, key + p.step, key + 45, key - 45, key + 180, p.start - 5 * p.step].map((x) => mod(x, 360)); },
      desc: (p) => `la freccia ruota di ${Math.abs(p.step)}° a ogni passo, in senso ${verso(p.step)}`,
      broke: 'la freccia ha l\'orientamento sbagliato',
    },
    rotacc: {
      el: 'arrow', feature: 'arrowRot', type: 'rotazione',
      init: (t) => ({ start: t.int(0, 7) * 45, dir: t.pick([1, -1]) }),
      at: (p, k) => mod(p.start + (p.dir * 45 * k * (k + 1)) / 2, 360),
      // ripete la quinta; ripete l'ultimo passo (180°); passo cresciuto di 90°; verso opposto; 45° in più o in meno
      wrong: (p) => { const a4 = p.start + p.dir * 450; const key = p.start + p.dir * 675; return [a4, a4 + p.dir * 180, a4 + p.dir * 270, a4 - p.dir * 225, key + 45, key - 45].map((x) => mod(x, 360)); },
      desc: (p) => `la freccia ruota in senso ${verso(p.dir)} di 45°, poi di 90°, poi di 135°…: la rotazione cresce di 45° a ogni passo, quindi l'ultima è di 225°`,
      broke: 'la freccia ha l\'orientamento sbagliato',
    },
    count: {
      el: 'dots', feature: 'dotsN', type: 'conteggio',
      init: (t, level) => {
        if (level >= 3 && t.chance(0.35)) return { mode: 'zig', start: t.int(1, 3) };
        return t.chance(0.55) ? { mode: 'lin', start: t.int(1, 2), step: 1 } : { mode: 'lin', start: t.int(6, 7), step: -1 };
      },
      at: (p, k) => (p.mode === 'zig' ? p.start + 2 * Math.ceil(k / 2) - Math.floor(k / 2) : p.start + k * p.step),
      wrong: (p) => { if (p.mode === 'zig') return [p.start + 2, p.start + 3, p.start + 5, p.start + 1]; const key = p.start + 5 * p.step; return [key - p.step, key + p.step, key + 2 * p.step, key - 2 * p.step]; },
      desc: (p) => (p.mode === 'zig' ? 'i pallini aumentano di due e poi calano di uno, a turno (+2, −1, +2, −1…)' : `i pallini ${p.step > 0 ? 'aumentano' : 'diminuiscono'} di uno a ogni passo`),
      broke: 'il numero di pallini è sbagliato',
    },
    sector: {
      el: 'pie', feature: 'pieN', type: 'conteggio',
      init: (t) => (t.chance(0.6) ? { start: t.int(1, 2), step: 1 } : { start: t.int(6, 7), step: -1 }),
      at: (p, k) => p.start + k * p.step,
      wrong: (p) => { const key = p.start + 5 * p.step; return [key - p.step, key + p.step, key + 2 * p.step, key - 2 * p.step]; },
      desc: (p, b) => (p.step > 0
        ? `il settore ${FILL_M[b.pieFill]} del disco cresce di uno spicchio (45°) a ogni passo, in senso ${verso(b.pieDir)}, con un lato sempre fermo ${alle(b.pieAt)}`
        : `il settore ${FILL_M[b.pieFill]} del disco si accorcia di uno spicchio (45°) a ogni passo, con un lato sempre fermo ${alle(b.pieAt)}`),
      broke: 'il settore colorato ha il numero di spicchi sbagliato',
    },
    secrot: {
      el: 'pie', feature: 'pieAt', type: 'rotazione',
      init: (t) => ({ start: t.int(0, 7), step: t.pick([1, -1, 2, -2, 3, -3]) }),
      at: (p, k) => mod(p.start + k * p.step, 8),
      wrong: (p) => { const key = p.start + 5 * p.step; return [key - p.step, key + p.step, p.start - 5 * p.step, key + 1, key - 1, key + 4].map((x) => mod(x, 8)); },
      desc: (p, b) => (b.pieN === 1
        ? `lo spicchio ${FILL_M[b.pieFill]} del disco ruota di ${45 * Math.abs(p.step)}° a ogni passo, in senso ${verso(p.step)}`
        : `i ${b.pieN} spicchi ${FILL_MP[b.pieFill]} del disco ruotano insieme di ${45 * Math.abs(p.step)}° a ogni passo, in senso ${verso(p.step)}`),
      broke: 'il settore colorato del disco è nella posizione sbagliata',
    },
    ring: {
      el: 'grid', feature: 'gridCell', type: 'posizione',
      init: (t) => ({ start: t.int(0, 7), step: t.pick([1, -1, 2, -2]) }),
      at: (p, k) => RINGC[mod(p.start + k * p.step, 8)],
      wrong: (p) => { const q = p.start + 5 * p.step; return [q - p.step, q + p.step, p.start - 5 * p.step, q + 1, q - 1].map((x) => RINGC[mod(x, 8)]).concat([4]); },
      desc: (p, b) => `la casella ${FILL_F[b.gridFill]} della griglia gira lungo il bordo di ${cells(Math.abs(p.step))} a ogni passo, in senso ${verso(p.step)}`,
      broke: 'la casella colorata della griglia è nel posto sbagliato',
    },
    torus: {
      el: 'grid', feature: 'gridCell', type: 'posizione',
      init: (t) => { const [dx, dy] = t.pick([[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]); return { r0: t.int(0, 2), c0: t.int(0, 2), dx, dy }; },
      at: (p, k) => cellOf(p.r0 + k * p.dy, p.c0 + k * p.dx),
      wrong: (p) => { const r = p.r0 + 5 * p.dy; const c = p.c0 + 5 * p.dx; return [cellOf(r - p.dy, c - p.dx), cellOf(r + p.dy, c + p.dx), ...around(cellOf(r, c))]; },
      desc: (p, b) => `la casella ${FILL_F[b.gridFill]} della griglia si sposta di una casella ${VEC[`${p.dx},${p.dy}`]} a ogni passo e, quando esce da un lato, rientra dal lato opposto`,
      broke: 'la casella colorata della griglia è nel posto sbagliato',
    },
    bounce: {
      el: 'grid', feature: 'gridCell', type: 'posizione',
      init: (t) => { const line = t.pick(['row', 'col', 'diag', 'anti']); return { line, idx: line === 'row' || line === 'col' ? t.int(0, 2) : 0, start: t.int(0, 3) }; },
      at: (p, k) => bounceCell(p, TRI4[mod(p.start + k, 4)]),
      wrong: (p) => [0, 1, 2].map((u) => bounceCell(p, u)).concat(around(bounceCell(p, TRI4[mod(p.start + 5, 4)]))),
      desc: (p, b) => `la casella ${FILL_F[b.gridFill]} della griglia si sposta di una casella a ogni passo lungo ${LINE[p.line][p.idx]} e, arrivata al bordo, torna indietro`,
      broke: 'la casella colorata della griglia è nel posto sbagliato',
    },
  };
  const ELS = ['shape', 'arrow', 'dots', 'pie', 'grid'];
  const EL_RULES = { shape: ['kind3', 'fill3', 'size'], arrow: ['rot', 'rotacc'], dots: ['count'], pie: ['sector', 'secrot'], grid: ['ring', 'torus', 'bounce'] };
  // Caratteristica visibile di ogni chiave dello stato (il disco si vede come insieme di spicchi colorati).
  const VF = { shapeKind: 'shapeKind', shapeFill: 'shapeFill', shapeSize: 'shapeSize', arrowRot: 'arrowRot', arrowFill: 'arrowFill', dotsN: 'dotsN', dotsFill: 'dotsFill', pieAt: 'pieMask', pieN: 'pieMask', pieDir: 'pieMask', pieFill: 'pieFill', gridCell: 'gridCell', gridFill: 'gridFill' };
  const EL_OF = (key) => (key.startsWith('shape') ? 'shape' : key.startsWith('arrow') ? 'arrow' : key.startsWith('dots') ? 'dots' : key.startsWith('pie') ? 'pie' : 'grid');
  const REPEAT = {
    shape: 'la forma è rimasta come nella quinta figura',
    arrow: 'la freccia è rimasta come nella quinta figura',
    dots: 'i pallini sono rimasti come nella quinta figura',
    pie: 'il disco è rimasto come nella quinta figura',
    grid: 'la casella della griglia è rimasta dov\'era nella quinta figura',
  };

  // ── Stato di una figura: els = elementi nei posti (sinistra-destra, oppure alto sinistra, alto destra, basso) ──
  // Disco: pieAt = lato fermo del settore (0 = ore 12, poi ogni 45° in senso orario), pieN = spicchi colorati,
  // pieDir = verso in cui il settore si estende dal lato fermo.
  function runOf(f) { return { lo: f.pieDir > 0 ? mod(f.pieAt, 8) : mod(f.pieAt - f.pieN, 8), n: f.pieN }; }
  function maskOf(f) { const { lo, n } = runOf(f); let m = 0; for (let i = 0; i < n; i++) m |= 1 << mod(lo + i, 8); return m; }
  function vis(f) {
    const v = { els: (f.els || []).join('+') };
    for (const el of f.els || []) {
      if (el === 'shape') Object.assign(v, { shapeKind: f.shapeKind, shapeFill: f.shapeFill, shapeSize: f.shapeSize });
      else if (el === 'arrow') Object.assign(v, { arrowRot: mod(f.arrowRot, 360), arrowFill: f.arrowFill });
      else if (el === 'dots') Object.assign(v, { dotsN: f.dotsN, dotsFill: f.dotsFill });
      else if (el === 'pie') Object.assign(v, { pieMask: maskOf(f), pieFill: f.pieFill });
      else if (el === 'grid') Object.assign(v, { gridCell: f.gridCell, gridFill: f.gridFill });
    }
    return v;
  }
  const canonOf = (f) => JSON.stringify(vis(f));
  const isInt = Number.isInteger;
  function valid(f) {
    for (const el of f.els || []) {
      if (el === 'shape' && !(KIND[f.shapeKind] && FILLS.includes(f.shapeFill) && isInt(f.shapeSize) && f.shapeSize >= 0 && f.shapeSize <= 3 && !(f.shapeKind === 'pentagon' && f.shapeSize < 2))) return false;
      if (el === 'arrow' && !(isInt(f.arrowRot) && mod(f.arrowRot, 45) === 0 && FILLS.includes(f.arrowFill))) return false;
      if (el === 'dots' && !(isInt(f.dotsN) && f.dotsN >= 1 && f.dotsN <= 7 && FILLS.includes(f.dotsFill))) return false;
      if (el === 'pie' && !(isInt(f.pieN) && f.pieN >= 1 && f.pieN <= 7 && isInt(f.pieAt) && f.pieAt >= 0 && f.pieAt <= 7 && Math.abs(f.pieDir) === 1 && (f.pieFill === 'black' || f.pieFill === 'grey'))) return false;
      if (el === 'grid' && !(isInt(f.gridCell) && f.gridCell >= 0 && f.gridCell <= 8 && (f.gridFill === 'black' || f.gridFill === 'grey'))) return false;
    }
    return true;
  }

  // Valori fissi di un elemento (quelli governati da una regola vengono sovrascritti da at()).
  function baseEl(t, el, rule) {
    if (el === 'shape') return { shapeKind: t.pick(rule === 'size' ? KINDS : [...KINDS, 'pentagon']), shapeFill: t.pick(FILLS), shapeSize: t.int(2, 3) };
    if (el === 'arrow') return { arrowRot: t.int(0, 7) * 45, arrowFill: t.pick(FILLS) };
    if (el === 'dots') return { dotsN: t.int(2, 5), dotsFill: t.pick(FILLS) };
    if (el === 'pie') {
      const pieFill = t.chance(0.7) ? 'black' : 'grey'; // uno spicchio grigio a 1x si vede meno di uno nero
      if (rule === 'secrot') return { pieAt: 0, pieN: t.pick([1, 2]), pieDir: 1, pieFill };
      if (rule === 'sector') return { pieAt: t.pick([0, 2, 4, 6]), pieN: 1, pieDir: t.pick([1, -1]), pieFill };
      return { pieAt: t.pick([0, 2, 4, 6]), pieN: t.int(1, 3), pieDir: 1, pieFill };
    }
    return { gridCell: t.int(0, 8), gridFill: t.chance(0.8) ? 'black' : 'grey' };
  }

  const frameAt = (base, rules, k) => rules.reduce((f, ru) => ({ ...f, [RULES[ru.name].feature]: RULES[ru.name].at(ru.p, k) }), { ...base, els: base.els.slice() });

  // Peso di ogni elemento nella scelta: i pallini hanno una sola regola, la griglia e la forma tre (posizione e
  // movimento sono le regole più frequenti nei manuali [A]).
  const EL_W = { shape: 1.2, arrow: 1, dots: 0.75, pie: 1, grid: 1.25 };
  function setup(t, level) {
    const pool = [];
    let left = ELS.slice();
    while (left.length) {
      let r = t.int(0, 999) / 1000 * left.reduce((s, el) => s + EL_W[el], 0);
      const el = left.find((x) => (r -= EL_W[x]) < 0) || left[left.length - 1];
      pool.push(el); left = left.filter((x) => x !== el);
    }
    const ruledEls = pool.slice(0, level);
    const extra = level === 2 && t.chance(0.5) ? [pool[2]] : [];
    const rules = ruledEls.map((el) => { const name = t.pick(EL_RULES[el]); return { name, p: RULES[name].init(t, level) }; });
    const ruleOf = Object.fromEntries(rules.map((ru) => [RULES[ru.name].el, ru.name]));
    const base = { els: t.shuffle([...ruledEls, ...extra]) };
    for (const el of base.els) Object.assign(base, baseEl(t, el, ruleOf[el] || null));
    const series = [0, 1, 2, 3, 4].map((k) => frameAt(base, rules, k));
    const key = frameAt(base, rules, 5);
    if (![...series, key].every(valid)) return null;
    // Niente serie periodiche in cui la sesta figura è già comparsa: basterebbe ricopiarla.
    const kc = canonOf(key);
    if (series.some((f) => canonOf(f) === kc)) return null;
    return { rules, ruleOf, base: series[0], series, key };
  }

  // «Atomi» di errore: una chiave dello stato portata a un valore sbagliato (regola violata o elemento fisso cambiato).
  function atomsFor(st) {
    const { key, rules, ruleOf, series } = st;
    const fifth = vis(series[4]);
    const keyC = canonOf(key);
    const out = [];
    const seen = new Set();
    const add = (a) => {
      const fig = { ...key, [a.key]: a.value };
      if (!valid(fig)) return;
      const c = canonOf(fig);
      if (c === keyC || seen.has(c)) return;
      seen.add(c);
      a.vf = VF[a.key]; a.el = EL_OF(a.key);
      a.repeat = Boolean(a.rule) && vis(fig)[a.vf] === fifth[a.vf];
      if (a.repeat) a.why = REPEAT[a.el];
      out.push(a);
    };
    for (const ru of rules) {
      const def = RULES[ru.name];
      for (const v of def.wrong(ru.p)) add({ key: def.feature, value: v, rule: ru.name, trap: def.type, why: def.broke });
    }
    const fixed = (k, v, why) => add({ key: k, value: v, rule: null, trap: 'costante', why });
    for (const el of key.els) {
      const r = ruleOf[el] || null;
      const feat = r ? RULES[r].feature : null;
      if (el === 'shape') {
        if (feat !== 'shapeKind') for (const k of [...KINDS, 'pentagon']) if (!(k === 'pentagon' && feat === 'shapeSize')) fixed('shapeKind', k, `la forma è un ${KIND[k]}, ma nella serie è sempre un ${KIND[key.shapeKind]}`);
        if (feat !== 'shapeFill') for (const c of FILLS) fixed('shapeFill', c, `la forma è ${FILL_F[c]}, ma nella serie è sempre ${FILL_F[key.shapeFill]}`);
        if (feat !== 'shapeSize') for (const d of [-1, 1]) fixed('shapeSize', key.shapeSize + d, 'la forma ha un\'altra misura, ma nella serie la misura non cambia');
      } else if (el === 'arrow') {
        if (!feat) for (const d of [90, -90, 180]) fixed('arrowRot', mod(key.arrowRot + d, 360), `la freccia è girata, ma nella serie punta sempre ${DIRS[mod(key.arrowRot, 360) / 45]}`);
        for (const c of FILLS) fixed('arrowFill', c, `la freccia è ${FILL_F[c]}, ma nella serie è sempre ${FILL_F[key.arrowFill]}`);
      } else if (el === 'dots') {
        if (!feat) for (const d of [-1, 1]) fixed('dotsN', key.dotsN + d, `il numero di pallini cambia, ma nella serie è sempre ${key.dotsN}`);
        for (const c of FILLS) fixed('dotsFill', c, `i pallini sono ${FILL_MP[c]}, ma nella serie sono sempre ${FILL_MP[key.dotsFill]}`);
      } else if (el === 'pie') {
        if (r === 'sector') {
          for (const d of [-1, 1]) fixed('pieAt', mod(key.pieAt + d, 8), `il settore colorato è spostato: nella serie ha sempre un lato fermo ${alle(key.pieAt)}`);
          fixed('pieDir', -key.pieDir, `il settore colorato è dall'altra parte del lato fermo ${alle(key.pieAt)}`);
        } else if (r === 'secrot') {
          for (const d of [-1, 1]) fixed('pieN', key.pieN + d, `il settore colorato ha un'altra ampiezza, ma nella serie è sempre di ${key.pieN === 1 ? 'uno spicchio' : `${key.pieN} spicchi`}`);
        } else {
          for (const d of [-1, 1]) fixed('pieAt', mod(key.pieAt + d, 8), 'il settore colorato è girato, ma nella serie resta sempre fermo');
          for (const d of [-1, 1]) fixed('pieN', key.pieN + d, 'il settore colorato ha un\'altra ampiezza, ma nella serie resta sempre uguale');
        }
        fixed('pieFill', key.pieFill === 'black' ? 'grey' : 'black', `il settore è ${FILL_M[key.pieFill === 'black' ? 'grey' : 'black']}, ma nella serie è sempre ${FILL_M[key.pieFill]}`);
      } else if (el === 'grid') {
        if (!feat) for (const c of around(key.gridCell)) fixed('gridCell', c, `la casella della griglia si è spostata, ma nella serie resta sempre ${CELL[key.gridCell]}`);
        fixed('gridFill', key.gridFill === 'black' ? 'grey' : 'black', `la casella della griglia è ${FILL_F[key.gridFill === 'black' ? 'grey' : 'black']}, ma nella serie è sempre ${FILL_F[key.gridFill]}`);
      }
    }
    return out;
  }

  // Quattro opzioni sbagliate. Esca (DECOY): [d], [d, x1], [d, x2], [y], con x1, x2 e y su caratteristiche diverse da
  // quella di d: sulla caratteristica di d vince il valore sbagliato e l'opzione «più votata» è [d]. x1 e x2 coprono le
  // altre regole, y è di preferenza un valore cambiato ma sbagliato. Semplice: un errore per regola, poi elementi fissi.
  function distractors(t, st, atoms) {
    const apply = (as) => as.reduce((f, a) => ({ ...f, [a.key]: a.value }), { ...st.key, els: st.key.els.slice() });
    const keyC = canonOf(st.key);
    const ruleAtoms = atoms.filter((a) => a.rule);
    const consts = atoms.filter((a) => !a.rule);
    const names = st.rules.map((ru) => ru.name);
    const byRule = (r) => ruleAtoms.filter((a) => a.rule === r);
    for (let tries = 0; tries < 30; tries++) {
      let combos;
      if (t.chance(DECOY)) {
        const reps = ruleAtoms.filter((a) => a.repeat);
        const d = reps.length && t.chance(0.6) ? t.pick(reps) : t.pick(ruleAtoms);
        const off = atoms.filter((a) => a.vf !== d.vf);
        const changed = off.filter((a) => a.rule && !a.repeat);
        const y = changed.length && t.chance(0.75) ? t.pick(changed) : t.pick(off);
        const parts = [];
        const wantRep = d.repeat && t.chance(0.3); // con due regole, a volte [d, x1] è la quinta figura ricopiata
        for (const r of t.shuffle(names.filter((n) => n !== d.rule))) {
          const c = t.shuffle(byRule(r).filter((a) => a !== y && a.vf !== d.vf));
          const a = c.find((z) => z.repeat === wantRep) || c[0];
          if (a) parts.push(a);
        }
        for (const a of t.shuffle(consts)) if (parts.length < 2 && a !== y && a.vf !== d.vf && !parts.some((p) => p.vf === a.vf)) parts.push(a);
        for (const a of t.shuffle(off)) if (parts.length < 2 && a !== y && !parts.includes(a)) parts.push(a);
        if (parts.length < 2 || !y) continue;
        combos = [[d], [d, parts[0]], [d, parts[1]], [y]];
      } else {
        const chosen = [];
        t.shuffle(names).forEach((r, i) => {
          const c = t.shuffle(byRule(r));
          const a = (i === 0 && t.chance(0.6) && c.find((z) => z.repeat)) || c[0];
          if (a) chosen.push(a);
        });
        for (const a of t.shuffle(consts)) if (chosen.length < 4 && !chosen.some((c) => c.vf === a.vf)) chosen.push(a);
        for (const a of t.shuffle(atoms)) if (chosen.length < 4 && !chosen.includes(a)) chosen.push(a);
        if (chosen.length < 4) continue;
        combos = chosen.map((a) => [a]);
      }
      const opts = combos.map((as) => ({ fig: apply(as), atoms: as }));
      const canons = new Set([keyC, ...opts.map((o) => canonOf(o.fig))]);
      if (canons.size === 5 && opts.every((o) => valid(o.fig))) return opts;
    }
    return null;
  }

  // ── Descrizioni (spiegazione ed etichette accessibili) ──
  function describeEl(el, f) {
    if (el === 'shape') return `${KIND[f.shapeKind]} ${FILL_M[f.shapeFill]} ${SIZE_W[f.shapeSize]}`;
    if (el === 'arrow') return `freccia ${FILL_F[f.arrowFill]} rivolta ${DIRS[mod(f.arrowRot, 360) / 45]}`;
    if (el === 'dots') return f.dotsN === 1 ? `1 pallino ${FILL_M[f.dotsFill]}` : `${f.dotsN} pallini ${FILL_MP[f.dotsFill]}`;
    if (el === 'pie') { const { lo, n } = runOf(f); return `disco con ${n === 1 ? `1 spicchio ${FILL_M[f.pieFill]}` : `${n} spicchi ${FILL_MP[f.pieFill]}`} su 8, ${dalle(lo)} ${alle(lo + n)}`; }
    if (el === 'grid') return `griglia con la casella ${FILL_F[f.gridFill]} ${CELL[f.gridCell]}`;
    return '';
  }
  const describe = (f) => ((f && f.els) || []).map((el) => describeEl(el, f)).join('; ');
  const ART = { shape: 'il ', arrow: 'la ', dots: '', pie: 'il ', grid: 'la ' };

  // Cosa resta uguale in tutta la serie: gli elementi senza regola e le caratteristiche fisse di quelli con una regola.
  function fixedText(st) {
    const b = st.base;
    const parts = b.els.map((el) => {
      const r = st.ruleOf[el];
      if (!r) return el === 'dots' ? (b.dotsN === 1 ? `il pallino ${FILL_M[b.dotsFill]}` : `i ${b.dotsN} pallini ${FILL_MP[b.dotsFill]}`) : `${ART[el]}${describeEl(el, b)}`;
      if (r === 'kind3') return `il colore (${FILL_M[b.shapeFill]}) e la misura della forma`;
      if (r === 'fill3') return `il tipo (${KIND[b.shapeKind]}) e la misura della forma`;
      if (r === 'size') return `il tipo (${KIND[b.shapeKind]}) e il colore (${FILL_M[b.shapeFill]}) della forma`;
      if (el === 'arrow') return `il colore della freccia (${FILL_F[b.arrowFill]})`;
      if (el === 'dots') return `il colore dei pallini (${FILL_MP[b.dotsFill]})`;
      if (r === 'sector') return `il colore del settore (${FILL_M[b.pieFill]})`;
      if (r === 'secrot') return `l'ampiezza (${b.pieN === 1 ? 'uno spicchio' : `${b.pieN} spicchi`}) e il colore (${FILL_M[b.pieFill]}) del settore`;
      return `il colore della casella della griglia (${FILL_F[b.gridFill]})`;
    });
    return parts.length ? `Restano uguali in tutta la serie: ${parts.join('; ')}.` : '';
  }

  const spec = (f) => ({ v: 2, state: { ...f, els: f.els.slice() }, label: describe(f) });

  function make(seed, level = 2) {
    const lv = Number(level) >= 3 ? 3 : 2;
    const s = Number(seed) >>> 0;
    const t = tools(mulberry32((Math.imul(s, 2246822519) ^ Math.imul(lv + 11, 3266489917)) >>> 0));
    for (let attempt = 0; attempt < 150; attempt++) {
      const st = setup(t, lv);
      if (!st) continue;
      const atoms = atomsFor(st);
      if (new Set(atoms.filter((a) => a.rule).map((a) => a.rule)).size < st.rules.length) continue;
      const dis = distractors(t, st, atoms);
      if (!dis) continue;
      const letters = ['A', 'B', 'C', 'D', 'E'];
      const order = t.shuffle([{ fig: st.key, atoms: null }, ...dis]);
      const keyLetter = letters[order.findIndex((o) => !o.atoms)];
      const ruleTexts = st.rules.map((ru) => ({ type: RULES[ru.name].type, desc: RULES[ru.name].desc(ru.p, st.base) }));
      const whyOf = (o) => [...new Set(o.atoms.map((a) => a.why))].join(' e ');
      const explanation = [
        ...ruleTexts.map((x, i) => `Regola ${i + 1} (${x.type}): ${x.desc}.`),
        fixedText(st),
        `La sesta figura è quindi: ${describe(st.key)}. Risposta ${keyLetter}.`,
        ...order.map((o, i) => (o.atoms ? `${letters[i]}: ${whyOf(o)}.` : null)),
      ].filter(Boolean).join(' ');
      return {
        bank: 'astratto', id: idFor(s, lv), level: lv, format: 'abs5', difficulty: lv, tag: 'combinata',
        question: 'Quale figura completa la serie?',
        series: st.series.map(spec),
        options: order.map((o, i) => ({ letter: letters[i], fig: spec(o.fig), trap: o.atoms ? o.atoms[0].trap : null })),
        correct: [keyLetter],
        rules: ruleTexts,
        ruleParams: st.rules.map((ru) => ({ name: ru.name, el: RULES[ru.name].el, feature: RULES[ru.name].feature, ...ru.p })),
        explanation,
      };
    }
    throw new Error(`astratto2: nessun item valido per il seme ${seed} (livello ${lv})`);
  }

  // ── Disegno (solo nel browser): nero, grigio e bianco su fondo bianco, come in TAO. Solo createElementNS e attributi SVG. ──
  const INK = '#1b1b1b';
  const COLOR = { white: '#ffffff', grey: '#9aa0a6', black: INK };
  const SLOTS = { 1: { s: 1.3, xy: [[50, 50]] }, 2: { s: 1.05, xy: [[27, 50], [73, 50]] }, 3: { s: 1, xy: [[27, 27], [73, 27], [50, 73]] } };
  const SIZES = [7.5, 10, 13.5, 18]; // raggi delle quattro misure: ognuna almeno il 30% più grande della precedente
  const ARROW = [[0, -18], [10, -4], [3.5, -4], [3.5, 18], [-3.5, 18], [-3.5, -4], [-10, -4]];
  const DICE = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8], 7: [0, 2, 3, 4, 5, 6, 8] };
  const n2 = (x) => Number(x.toFixed(2));
  const pts = (arr) => arr.map(([x, y]) => `${n2(x)},${n2(y)}`).join(' ');

  function drawEl(mk, el, f, cx, cy, s) {
    const out = [];
    const line = { stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' };
    if (el === 'shape') {
      const R = SIZES[f.shapeSize] * s;
      const fill = COLOR[f.shapeFill];
      if (f.shapeKind === 'circle') out.push(mk('circle', { cx: n2(cx), cy: n2(cy), r: n2(R), fill, ...line }));
      else if (f.shapeKind === 'square') { const h = 0.88 * R; out.push(mk('rect', { x: n2(cx - h), y: n2(cy - h), width: n2(2 * h), height: n2(2 * h), fill, ...line })); }
      else {
        const n = f.shapeKind === 'triangle' ? 3 : 5;
        const rc = (n === 3 ? 1.2 : 1.07) * R;
        const oy = cy + (n === 3 ? rc / 4 : rc * 0.0955); // centra il riquadro della figura, non il baricentro
        const p = [];
        for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (2 * Math.PI * i) / n; p.push([cx + rc * Math.cos(a), oy + rc * Math.sin(a)]); }
        out.push(mk('polygon', { points: pts(p), fill, ...line }));
      }
    } else if (el === 'arrow') {
      const g = mk('g', { transform: `rotate(${mod(f.arrowRot, 360)} ${n2(cx)} ${n2(cy)})` });
      g.append(mk('polygon', { points: pts(ARROW.map(([x, y]) => [cx + x * s, cy + y * s])), fill: COLOR[f.arrowFill], ...line }));
      out.push(g);
    } else if (el === 'dots') {
      const d = 13.5 * s;
      for (const i of DICE[f.dotsN] || []) out.push(mk('circle', { cx: n2(cx + ((i % 3) - 1) * d), cy: n2(cy + (Math.floor(i / 3) - 1) * d), r: n2(4.5 * s), fill: COLOR[f.dotsFill], stroke: INK, 'stroke-width': 2 }));
    } else if (el === 'pie') {
      const r = 18 * s;
      const P = (e) => { const a = ((-90 + 45 * e) * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
      out.push(mk('circle', { cx: n2(cx), cy: n2(cy), r: n2(r), fill: '#ffffff' }));
      const { lo, n } = runOf(f);
      const [x0, y0] = P(lo); const [x1, y1] = P(lo + n);
      out.push(mk('path', { d: `M${n2(cx)} ${n2(cy)} L${n2(x0)} ${n2(y0)} A${n2(r)} ${n2(r)} 0 ${n > 4 ? 1 : 0} 1 ${n2(x1)} ${n2(y1)} Z`, fill: COLOR[f.pieFill] }));
      for (let e = 0; e < 4; e++) { const [ax, ay] = P(e); const [bx, by] = P(e + 4); out.push(mk('line', { x1: n2(ax), y1: n2(ay), x2: n2(bx), y2: n2(by), stroke: INK, 'stroke-width': 2 })); }
      out.push(mk('circle', { cx: n2(cx), cy: n2(cy), r: n2(r), fill: 'none', ...line }));
    } else if (el === 'grid') {
      const c = 12 * s; const x0 = cx - 1.5 * c; const y0 = cy - 1.5 * c;
      const row = Math.floor(f.gridCell / 3); const col = f.gridCell % 3;
      out.push(mk('rect', { x: n2(x0 + col * c), y: n2(y0 + row * c), width: n2(c), height: n2(c), fill: COLOR[f.gridFill] }));
      for (let i = 1; i < 3; i++) {
        out.push(mk('line', { x1: n2(x0 + i * c), y1: n2(y0), x2: n2(x0 + i * c), y2: n2(y0 + 3 * c), stroke: INK, 'stroke-width': 2 }));
        out.push(mk('line', { x1: n2(x0), y1: n2(y0 + i * c), x2: n2(x0 + 3 * c), y2: n2(y0 + i * c), stroke: INK, 'stroke-width': 2 }));
      }
      out.push(mk('rect', { x: n2(x0), y: n2(y0), width: n2(3 * c), height: n2(3 * c), fill: 'none', stroke: INK, 'stroke-width': 2.5 }));
    }
    return out;
  }

  function draw(sp, { size = 72, label = '' } = {}) {
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v)); return n; };
    const f = (sp && sp.state) || sp || {};
    const desc = (sp && sp.label) || describe(f);
    const svg = mk('svg', { viewBox: '0 0 100 100', width: size, height: size, role: 'img', focusable: 'false', 'aria-label': `${label ? `${label}: ` : ''}${desc}` });
    svg.append(mk('rect', { x: 1.5, y: 1.5, width: 97, height: 97, rx: 3, fill: '#ffffff', stroke: INK, 'stroke-width': 3 }));
    const els = f.els || [];
    const lay = SLOTS[els.length] || SLOTS[3];
    els.forEach((el, i) => { const [cx, cy] = lay.xy[i] || [50, 50]; svg.append(...drawEl(mk, el, f, cx, cy, lay.s)); });
    return svg;
  }

  function idFor(seed, level) { return `B${Number(level) >= 3 ? 3 : 2}-${Number(seed) >>> 0}`; }
  function parseId(id) {
    const m = /^B([23])-(\d{1,10})$/.exec(String(id));
    if (!m || Number(m[2]) > 4294967295) return null;
    return { level: Number(m[1]), seed: Number(m[2]) };
  }

  return {
    make, idFor, parseId, draw, frameSvg: draw, describe, DECOY,
    canon: (sp) => canonOf((sp && sp.state) || sp),
    RULES: Object.fromEntries(Object.entries(RULES).map(([k, v]) => [k, { type: v.type, el: v.el, feature: v.feature }])),
    ELEMENTS: EL_RULES,
  };
})();
