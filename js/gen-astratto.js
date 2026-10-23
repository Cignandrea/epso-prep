// Generatore dell'astratto — namespace App.gen.astratto
// Formato [V test di esempio EPSO in italiano, 08/10/2026]: una serie di cinque figure; si sceglie la sesta tra cinque opzioni (A–E).
// make(seme, livello) è una funzione pura: lo stesso id (A<livello>-<seme>) ridà sempre lo stesso item, anche su un altro dispositivo.
//
// Una figura ha al centro una forma (freccia, poligono, cerchio o quadrato) oppure un gruppo di pallini, e spesso un
// quadratino lungo il bordo. Ogni regola agisce su una caratteristica diversa (posizione, orientamento, lati, numero,
// colore, forma); quello che nessuna regola tocca resta fisso. Livello 1: una regola; livello 2: due; livello 3: tre.
// Ogni opzione sbagliata viola almeno una regola o cambia un elemento fisso. In circa due item su tre l'opzione «più
// simile a tutte le altre» è una trappola: la scorciatoia del voto di maggioranza non paga, servono le regole.
window.App = window.App || {};
App.gen = App.gen || {};
App.gen.astratto = (() => {
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

  // ── Lessico: spiegazioni ed etichette accessibili ──
  const FILLS = ['white', 'grey', 'black'];
  const FILL_M = { white: 'bianco', grey: 'grigio', black: 'nero' };
  const FILL_F = { white: 'bianca', grey: 'grigia', black: 'nera' };
  const FILL_MP = { white: 'bianchi', grey: 'grigi', black: 'neri' };
  const RING = ['in alto a sinistra', 'in alto al centro', 'in alto a destra', 'a destra al centro', 'in basso a destra', 'in basso al centro', 'in basso a sinistra', 'a sinistra al centro'];
  const DIRS = ['verso l\'alto', 'verso l\'alto a destra', 'verso destra', 'verso il basso a destra', 'verso il basso', 'verso il basso a sinistra', 'verso sinistra', 'verso l\'alto a sinistra'];
  const POLY = { 3: 'triangolo', 4: 'quadrato', 5: 'pentagono', 6: 'esagono', 7: 'ettagono', 8: 'ottagono' };
  const SHAPE = { circle: 'cerchio', square: 'quadrato' };
  const at8 = (p, k) => mod(p.start + k * p.step, 8);
  const at360 = (p, k) => mod(p.start + k * p.step, 360);
  const cells = (n) => `${n} ${n === 1 ? 'casella' : 'caselle'}`;
  const verso = (s) => (s > 0 ? 'orario' : 'antiorario');
  const alt2 = (p, k) => (k % 2 === 0 ? p.a : p.b);

  // ── Regole: caratteristica governata, valore al passo k (0–4 la serie, 5 la risposta), valori sbagliati plausibili ──
  const RULES = {
    pos: {
      type: 'posizione', feature: 'pos', needs: 'mover',
      init: (t) => ({ start: t.int(0, 7), step: t.pick([1, -1, 1, -1, 2, -2]) }),
      at: at8,
      wrong: (p, k) => [at8(p, k - 1), at8(p, k + 1), at8(p, k - 2), mod(p.start - k * p.step, 8)],
      desc: (p) => `il quadratino si sposta lungo il bordo di ${cells(Math.abs(p.step))} a ogni passo, in senso ${verso(p.step)}`,
      broke: 'il quadratino è nella casella sbagliata',
    },
    rot: {
      type: 'rotazione', feature: 'rot', needs: 'arrow',
      init: (t, level) => ({ start: t.int(0, 7) * 45, step: t.pick(level === 1 ? [45, -45, 90, -90] : [45, -45, 90, -90, 135, -135]) }),
      at: at360,
      wrong: (p, k) => [at360(p, k - 1), at360(p, k + 1), at360(p, k - 2), mod(at360(p, k) + 180, 360), mod(p.start - k * p.step, 360)],
      desc: (p) => `la freccia ruota di ${Math.abs(p.step)}° a ogni passo, in senso ${verso(p.step)}`,
      broke: 'la freccia ha l\'orientamento sbagliato',
    },
    sides: {
      type: 'conteggio', feature: 'sides', needs: 'poly',
      init: (t) => (t.chance(0.6) ? { start: 3, step: 1 } : { start: 8, step: -1 }),
      at: (p, k) => p.start + k * p.step,
      wrong: (p, k) => [k - 1, k - 2, k + 1].map((j) => p.start + j * p.step).filter((n) => n >= 3 && n <= 8),
      desc: (p) => (p.step > 0 ? 'la figura centrale ha un lato in più a ogni passo (triangolo, quadrato, pentagono…)' : 'la figura centrale ha un lato in meno a ogni passo (ottagono, ettagono, esagono…)'),
      broke: 'la figura ha il numero di lati sbagliato',
    },
    dots: {
      type: 'conteggio', feature: 'dots', needs: 'dots',
      init: (t) => (t.chance(0.6) ? { start: t.int(1, 3), step: 1 } : { start: t.int(7, 9), step: -1 }),
      at: (p, k) => p.start + k * p.step,
      wrong: (p, k) => [k - 1, k + 1, k - 2].map((j) => p.start + j * p.step).filter((n) => n >= 1 && n <= 9),
      desc: (p) => `i pallini ${p.step > 0 ? 'aumentano' : 'diminuiscono'} di uno a ogni passo`,
      broke: 'il numero di pallini è sbagliato',
    },
    cycle: {
      type: 'riempimento', feature: 'fill', needs: 'fig',
      init: (t) => ({ start: t.int(0, 2), dir: t.pick([1, -1]) }),
      at: (p, k) => FILLS[mod(p.start + k * p.dir, 3)],
      wrong: (p, k) => FILLS.filter((f) => f !== FILLS[mod(p.start + k * p.dir, 3)]),
      desc: (p) => `il colore della figura centrale segue il ciclo ${p.dir > 0 ? 'bianco → grigio → nero' : 'nero → grigio → bianco'}, poi ricomincia`,
      broke: 'il colore della figura centrale è sbagliato',
    },
    alt: {
      type: 'alternanza', feature: 'fill', needs: 'fig',
      init: (t) => { const [a, b] = t.pick([['white', 'black'], ['black', 'white'], ['white', 'grey'], ['grey', 'white'], ['grey', 'black'], ['black', 'grey']]); return { a, b }; },
      at: alt2,
      wrong: (p, k) => FILLS.filter((f) => f !== alt2(p, k)),
      desc: (p) => `il colore della figura centrale alterna ${FILL_M[p.a]} e ${FILL_M[p.b]}`,
      broke: 'il colore della figura centrale è sbagliato',
    },
    kind: {
      type: 'alternanza', feature: 'kind', needs: 'shape',
      init: (t) => { const [a, b] = t.pick([['circle', 'square'], ['square', 'circle']]); return { a, b }; },
      at: alt2,
      wrong: (p, k) => [alt2(p, k + 1)],
      desc: (p) => `la figura centrale alterna ${SHAPE[p.a]} e ${SHAPE[p.b]}`,
      broke: 'la forma della figura centrale è sbagliata',
    },
    movalt: {
      type: 'alternanza', feature: 'movFill', needs: 'mover',
      init: (t) => { const [a, b] = t.pick([['white', 'black'], ['black', 'white']]); return { a, b }; },
      at: alt2,
      wrong: (p, k) => [alt2(p, k + 1)],
      desc: (p) => `il quadratino è a turno ${FILL_M[p.a]} e ${FILL_M[p.b]}`,
      broke: 'il colore del quadratino è sbagliato',
    },
    dotalt: {
      type: 'alternanza', feature: 'dotFill', needs: 'dots',
      init: (t) => { const [a, b] = t.pick([['black', 'white'], ['white', 'black']]); return { a, b }; },
      at: alt2,
      wrong: (p, k) => [alt2(p, k + 1)],
      desc: (p) => `i pallini sono a turno ${FILL_MP[p.a]} e ${FILL_MP[p.b]}`,
      broke: 'il colore dei pallini è sbagliato',
    },
  };

  // Combinazioni compatibili: al massimo una regola per caratteristica (la freccia non cambia lati né forma, e così via).
  const COMBOS = {
    1: [['pos'], ['rot'], ['sides'], ['dots'], ['cycle'], ['alt'], ['kind']],
    2: [['pos', 'rot'], ['pos', 'dots'], ['pos', 'sides'], ['pos', 'cycle'], ['pos', 'kind'], ['rot', 'cycle'], ['rot', 'alt'], ['sides', 'cycle'], ['sides', 'alt'], ['dots', 'dotalt'], ['pos', 'movalt'], ['kind', 'cycle'], ['rot', 'movalt'], ['dots', 'movalt'], ['sides', 'movalt']],
    3: [['pos', 'rot', 'cycle'], ['pos', 'rot', 'alt'], ['pos', 'sides', 'cycle'], ['pos', 'sides', 'alt'], ['pos', 'dots', 'dotalt'], ['pos', 'movalt', 'rot'], ['pos', 'movalt', 'dots'], ['pos', 'movalt', 'sides'], ['pos', 'kind', 'cycle'], ['pos', 'movalt', 'cycle'], ['movalt', 'rot', 'cycle'], ['movalt', 'sides', 'cycle'], ['movalt', 'dots', 'dotalt']],
  };

  // Elementi fissi che un'opzione sbagliata può cambiare: categoria della trappola e spiegazione.
  const FIXED = {
    fill: ['riempimento', 'il colore della figura centrale cambia, ma nella serie resta sempre uguale'],
    rot: ['rotazione', 'la freccia è girata, ma nella serie punta sempre nella stessa direzione'],
    sides: ['conteggio', 'il numero di lati cambia, ma nella serie resta sempre uguale'],
    kind: ['alternanza', 'la forma centrale cambia, ma nella serie resta sempre la stessa'],
    dots: ['conteggio', 'il numero di pallini cambia, ma nella serie resta sempre uguale'],
    dotFill: ['riempimento', 'il colore dei pallini cambia, ma nella serie resta sempre uguale'],
    pos: ['posizione', 'il quadratino si è spostato, ma nella serie resta fermo'],
    movFill: ['riempimento', 'il colore del quadratino cambia, ma nella serie resta sempre uguale'],
  };

  // Disposizione: cosa c'è nella figura, dati i requisiti delle regole. Le caratteristiche senza regola restano fisse.
  function layout(t, names) {
    const needs = new Set(names.map((n) => RULES[n].needs));
    const f = { center: 'fig', kind: 'circle', sides: 0, rot: 0, fill: 'white', dots: 0, dotFill: 'black', mover: false, pos: 0, movFill: 'black' };
    if (needs.has('dots')) {
      f.center = 'dots'; f.kind = ''; f.dots = t.int(2, 6); f.dotFill = t.pick(['black', 'white']);
    } else {
      f.kind = needs.has('arrow') ? 'arrow' : needs.has('poly') ? 'poly' : needs.has('shape') ? 'circle' : t.pick(['arrow', 'circle', 'square', 'poly']);
      if (f.kind === 'poly') f.sides = t.int(3, 6);
      if (f.kind === 'arrow') f.rot = t.int(0, 7) * 45;
      f.fill = t.pick(FILLS);
    }
    // Un quadratino fermo dà contesto anche senza una regola di posizione, come nelle serie reali.
    f.mover = needs.has('mover') || t.chance(0.5);
    if (f.mover) { f.pos = t.int(0, 7); f.movFill = t.pick(['black', 'white']); }
    return f;
  }

  const frameAt = (base, rules, k) => rules.reduce((f, ru) => ({ ...f, [RULES[ru.name].feature]: RULES[ru.name].at(ru.p, k) }), { ...base });
  const valid = (f) => !(f.center === 'dots' && (f.dots < 1 || f.dots > 9)) && !(f.center === 'fig' && f.kind === 'poly' && (f.sides < 3 || f.sides > 8));

  // Firma visiva: due figure con la stessa firma sono identiche a vista (per esempio la rotazione conta solo per la freccia).
  function canonOf(f) {
    const parts = [];
    if (f.center === 'fig') {
      const shape = f.kind === 'poly' ? (f.sides === 4 ? 'square' : `poly${f.sides}`) : f.kind;
      parts.push(`C:${shape}:${f.kind === 'arrow' ? mod(f.rot, 360) : 0}:${f.fill}`);
    } else if (f.center === 'dots') parts.push(`D:${f.dots}:${f.dotFill}`);
    if (f.mover) parts.push(`M:${f.pos}:${f.movFill}`);
    return parts.join('|');
  }

  function setup(t, level) {
    const names = t.pick(COMBOS[level]);
    const rules = names.map((name) => ({ name, p: RULES[name].init(t, level) }));
    const base = layout(t, names);
    const series = [0, 1, 2, 3, 4].map((k) => frameAt(base, rules, k));
    const key = frameAt(base, rules, 5);
    if (![...series, key].every(valid)) return null;
    return { names, rules, base, series, key, used: new Set(names.map((n) => RULES[n].feature)) };
  }

  // «Atomi» di errore: una caratteristica portata a un valore sbagliato (violazione di regola o di elemento fisso).
  function atomsFor(st) {
    const { key, rules, base, used } = st;
    const out = [];
    const seen = new Set();
    const add = (a) => {
      const id = `${a.feature}=${a.value}`;
      if (a.value === key[a.feature] || seen.has(id) || !valid({ ...key, [a.feature]: a.value })) return;
      seen.add(id); out.push(a);
    };
    for (const ru of rules) {
      const def = RULES[ru.name];
      for (const w of def.wrong(ru.p, 5)) add({ feature: def.feature, value: w, rule: ru.name, trap: def.type, why: def.broke });
    }
    const fixed = (feature, value) => add({ feature, value, rule: null, trap: FIXED[feature][0], why: FIXED[feature][1] });
    if (base.center === 'fig') {
      if (!used.has('fill')) FILLS.forEach((c) => fixed('fill', c));
      if (base.kind === 'arrow' && !used.has('rot')) { fixed('rot', mod(base.rot + 90, 360)); fixed('rot', mod(base.rot + 180, 360)); }
      if (base.kind === 'poly' && !used.has('sides')) { fixed('sides', base.sides + 1); fixed('sides', base.sides - 1); }
      if ((base.kind === 'circle' || base.kind === 'square') && !used.has('kind')) fixed('kind', base.kind === 'circle' ? 'square' : 'circle');
    } else {
      if (!used.has('dots')) { fixed('dots', base.dots + 1); fixed('dots', base.dots - 1); }
      if (!used.has('dotFill')) fixed('dotFill', base.dotFill === 'black' ? 'white' : 'black');
    }
    if (base.mover) {
      if (!used.has('pos')) { fixed('pos', mod(base.pos + 1, 8)); fixed('pos', mod(base.pos + 4, 8)); }
      if (!used.has('movFill')) fixed('movFill', base.movFill === 'black' ? 'white' : 'black');
    }
    return out;
  }

  // Quattro opzioni sbagliate. Struttura «esca» (circa 7 volte su 10): un errore d'esca E e due opzioni che contengono E più
  // un altro errore, più una con un errore diverso. Così sulla caratteristica di E vince il valore sbagliato e l'opzione
  // «più votata» è l'esca, non la risposta. Struttura semplice (le altre volte): quattro errori singoli, come spesso nelle
  // prove reali. In entrambe c'è quasi sempre la trappola «ripeti la quinta figura».
  function distractors(t, st, atoms) {
    const apply = (as) => as.reduce((f, a) => ({ ...f, [a.feature]: a.value }), { ...st.key });
    const ruleAtoms = atoms.filter((a) => a.rule);
    const fifth = st.series[4];
    const repeat = ruleAtoms.filter((a) => a.value === fifth[a.feature]);
    const keyCanon = canonOf(st.key);
    for (let tries = 0; tries < 12; tries++) {
      let combos;
      if (t.chance(0.72)) {
        const d = repeat.length && t.chance(0.6) ? t.pick(repeat) : t.pick(ruleAtoms);
        const others = t.shuffle(atoms.filter((a) => a.feature !== d.feature));
        if (others.length < 2) continue;
        const x1 = others[0];
        const x2 = others.find((a) => a.feature !== x1.feature) || others[1];
        const y = others.find((a) => a !== x1 && a !== x2) || x1;
        combos = [[d], [d, x1], [d, x2], [y]];
      } else {
        const first = repeat.length ? t.pick(repeat) : t.pick(ruleAtoms);
        const rest = t.shuffle(atoms.filter((a) => a !== first));
        const chosen = [first];
        for (const a of rest) if (chosen.length < 4 && !chosen.some((c) => c.feature === a.feature)) chosen.push(a);
        for (const a of rest) if (chosen.length < 4 && !chosen.includes(a)) chosen.push(a);
        if (chosen.length < 4) continue;
        combos = chosen.map((a) => [a]);
      }
      const opts = combos.map((as) => ({ fig: apply(as), atoms: as }));
      const canons = new Set([keyCanon, ...opts.map((o) => canonOf(o.fig))]);
      if (canons.size === 5 && opts.every((o) => valid(o.fig))) return opts;
    }
    return null;
  }

  function describe(f) {
    let center = '';
    if (f.center === 'fig') {
      if (f.kind === 'arrow') center = `freccia ${FILL_F[f.fill]} rivolta ${DIRS[mod(f.rot, 360) / 45]}`;
      else if (f.kind === 'poly') center = `${POLY[f.sides]} ${FILL_M[f.fill]}`;
      else center = `${SHAPE[f.kind]} ${FILL_M[f.fill]}`;
    } else if (f.center === 'dots') center = `${f.dots} ${f.dots === 1 ? `pallino ${FILL_M[f.dotFill]}` : `pallini ${FILL_MP[f.dotFill]}`}`;
    return f.mover ? `${center}; quadratino ${FILL_M[f.movFill]} ${RING[f.pos]}` : center;
  }

  // Cosa resta uguale in tutta la serie (aiuta a capire le opzioni che cambiano un elemento fisso).
  function fixedText(base, used) {
    const parts = [];
    if (base.center === 'fig') {
      const shape = base.kind === 'arrow' ? 'la freccia' : base.kind === 'poly' ? `il ${POLY[base.sides]}` : `il ${SHAPE[base.kind]}`;
      if (!used.has('kind') && !used.has('sides') && !used.has('rot')) parts.push(base.kind === 'arrow' ? `la freccia ${DIRS[mod(base.rot, 360) / 45]}` : shape);
      if (!used.has('fill')) parts.push(`il colore ${FILL_M[base.fill]} della figura centrale`);
    } else {
      if (!used.has('dots')) parts.push(`${base.dots} pallini`);
      if (!used.has('dotFill')) parts.push(`il colore dei pallini (${FILL_MP[base.dotFill]})`);
    }
    if (base.mover) {
      if (!used.has('pos')) parts.push(`il quadratino ${RING[base.pos]}`);
      if (!used.has('movFill')) parts.push(`il colore del quadratino (${FILL_M[base.movFill]})`);
    }
    return parts.length ? `Restano uguali in tutta la serie: ${parts.join(', ')}.` : '';
  }

  const spec = (f) => ({ state: { ...f }, label: describe(f) });

  function make(seed, level = 2) {
    const lv = [1, 2, 3].includes(Number(level)) ? Number(level) : 2;
    const s = Number(seed) >>> 0;
    const t = tools(mulberry32((Math.imul(s, 2654435761) ^ Math.imul(lv, 40503)) >>> 0));
    for (let attempt = 0; attempt < 80; attempt++) {
      const st = setup(t, lv);
      if (!st) continue;
      const atoms = atomsFor(st);
      if (atoms.length < 3 || !atoms.some((a) => a.rule)) continue;
      const dis = distractors(t, st, atoms);
      if (!dis) continue;
      const letters = ['A', 'B', 'C', 'D', 'E'];
      const order = t.shuffle([{ fig: st.key, atoms: null }, ...dis]);
      const k = order.findIndex((o) => !o.atoms);
      const keyLetter = letters[k];
      const ruleTexts = st.rules.map((ru) => ({ type: RULES[ru.name].type, desc: RULES[ru.name].desc(ru.p) }));
      const multi = ruleTexts.length > 1;
      const whyOf = (o) => [...new Set(o.atoms.map((a) => a.why))].join(' e ');
      const explanation = [
        ...ruleTexts.map((x, i) => `${multi ? `Regola ${i + 1}` : 'Regola'} (${x.type}): ${x.desc}.`),
        fixedText(st.base, st.used),
        `La sesta figura è quindi: ${describe(st.key)}. Risposta ${keyLetter}.`,
        ...order.map((o, i) => (o.atoms ? `${letters[i]}: ${whyOf(o)}.` : null)),
      ].filter(Boolean).join(' ');
      return {
        bank: 'astratto', id: idFor(s, lv), level: lv, format: 'abs5', difficulty: lv,
        tag: lv === 1 ? ruleTexts[0].type : 'combinata',
        question: 'Quale figura completa la serie?',
        series: st.series.map(spec),
        options: order.map((o, i) => ({ letter: letters[i], fig: spec(o.fig), trap: o.atoms ? o.atoms[0].trap : null })),
        correct: [keyLetter],
        rules: ruleTexts,
        ruleParams: st.rules.map((ru) => ({ name: ru.name, feature: RULES[ru.name].feature, ...ru.p })),
        explanation,
      };
    }
    throw new Error(`astratto: nessun item valido per il seme ${seed} (livello ${lv})`);
  }

  // ── Disegno (solo nel browser): bianco e nero su fondo bianco in entrambi i temi, come in TAO ──
  const INK = '#1b1b1b';
  const COLOR = { white: '#ffffff', grey: '#9aa0a6', black: INK };
  const RINGXY = [[16, 16], [50, 16], [84, 16], [84, 50], [84, 84], [50, 84], [16, 84], [16, 50]];
  const DOTXY = [[35, 35], [50, 35], [65, 35], [35, 50], [50, 50], [65, 50], [35, 65], [50, 65], [65, 65]];
  // Pallini disposti come sui dadi: si contano a colpo d'occhio.
  const DICE = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8], 7: [0, 2, 3, 4, 5, 6, 8], 8: [0, 1, 2, 3, 5, 6, 7, 8], 9: [0, 1, 2, 3, 4, 5, 6, 7, 8] };
  function polyPoints(n) {
    const rad = n === 3 ? 25 : n === 4 ? 24 : 23;
    const cy = n % 2 ? 52 : 50;
    const off = n % 2 === 0 ? Math.PI / n : 0; // lato in basso orizzontale per ogni poligono
    const pts = [];
    for (let k = 0; k < n; k++) { const a = -Math.PI / 2 + off + (2 * Math.PI * k) / n; pts.push(`${(50 + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`); }
    return pts.join(' ');
  }
  function frameSvg(sp, { size = 72, label = '' } = {}) {
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v)); return n; };
    const f = (sp && sp.state) || sp || {};
    const svg = mk('svg', { viewBox: '0 0 100 100', width: size, height: size, role: 'img', focusable: 'false', 'aria-label': `${label ? `${label}: ` : ''}${(sp && sp.label) || describe(f)}` });
    svg.append(mk('rect', { x: 1.5, y: 1.5, width: 97, height: 97, rx: 3, fill: '#ffffff', stroke: INK, 'stroke-width': 3 }));
    const big = { stroke: INK, 'stroke-width': 3.5, 'stroke-linejoin': 'round' };
    const small = { stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' };
    if (f.center === 'fig') {
      const fill = COLOR[f.fill] || '#ffffff';
      if (f.kind === 'circle') svg.append(mk('circle', { cx: 50, cy: 50, r: 22, fill, ...big }));
      else if (f.kind === 'square') svg.append(mk('rect', { x: 31, y: 31, width: 38, height: 38, fill, ...big }));
      else if (f.kind === 'poly') svg.append(mk('polygon', { points: polyPoints(f.sides), fill, ...big }));
      else if (f.kind === 'arrow') {
        const g = mk('g', { transform: `rotate(${mod(f.rot, 360)} 50 50)` });
        g.append(mk('polygon', { points: '50,29 67,49 57,49 57,71 43,71 43,49 33,49', fill, ...big }));
        svg.append(g);
      }
    } else if (f.center === 'dots') {
      for (const c of DICE[f.dots] || []) { const [x, y] = DOTXY[c]; svg.append(mk('circle', { cx: x, cy: y, r: 5.5, fill: COLOR[f.dotFill] || INK, ...small })); }
    }
    if (f.mover) { const [x, y] = RINGXY[f.pos]; svg.append(mk('rect', { x: x - 6.5, y: y - 6.5, width: 13, height: 13, fill: COLOR[f.movFill] || INK, ...small })); }
    return svg;
  }

  function idFor(seed, level) { return `A${level}-${Number(seed) >>> 0}`; }
  function parseId(id) {
    const m = /^A([123])-(\d{1,10})$/.exec(String(id));
    return m ? { level: Number(m[1]), seed: Number(m[2]) } : null;
  }

  return {
    make, idFor, parseId, frameSvg, describe,
    canon: (sp) => canonOf((sp && sp.state) || sp),
    RULES: Object.fromEntries(Object.entries(RULES).map(([k, v]) => [k, v.type])),
    COMBOS,
  };
})();
