"""Test della sincronizzazione tra dispositivi (js/sync.js) con un database finto al posto di quello dell'artifact.
Il finto `window.claude.use('db' | 'user')` imita l'API della capability (collection/doc/get/set/limit, dati congelati).
Scenario: il Fold fa due tappe → il PC, vuoto, le ritrova; il PC lascia una tappa a metà → il Fold la riprende dalla
stessa domanda. Uso: python3 tests/sync.py [porta]"""
import sys, json, threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8793

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=httpd.serve_forever, daemon=True).start()

checks, errors = [], []
def check(name, ok, detail=''):
    checks.append((name, bool(ok)))
    print(('PASS' if ok else 'FAIL'), '-', name, ('— ' + str(detail)) if detail else '')

FAKE_NOW = "2026-10-24T09:00:00+02:00"
CLOCK = """
(() => { const fixed = new Date('%s').getTime(); const R = Date;
  let start = Number(sessionStorage.getItem('__fakeStart')); if (!start) { start = R.now(); sessionStorage.setItem('__fakeStart', String(start)); }
  class D extends R { constructor(...a) { if (a.length) super(...a); else super(fixed + (R.now() - start)); }
    static now() { return fixed + (R.now() - start); } }
  window.Date = D; })();
""" % FAKE_NOW

# Database finto: il contenuto iniziale arriva da Python, ogni scrittura resta in window.__db (letto alla fine).
FAKE_DB = """
(() => {
  const seed = %s;
  window.__db = Object.assign({}, seed);
  window.__writes = 0;
  const freeze = (o) => { if (o && typeof o === 'object') { Object.values(o).forEach(freeze); Object.freeze(o); } return o; };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const snap = (path) => { const d = window.__db[path]; return { id: path.split('/').pop(), exists: Boolean(d), data: () => (d ? freeze(clone(d)) : undefined), metadata: { fromCache: false, hasPendingWrites: false } }; };
  const doc = (path) => ({ id: path.split('/').pop(), path,
    get: async () => snap(path),
    set: async (data) => { if (!data || typeof data !== 'object' || Array.isArray(data)) throw { code: 'invalid_argument', message: 'body' };
      const s = JSON.stringify(data); if (s.length > 256 * 1024) throw { code: 'invalid_argument', message: 'too big' };
      window.__db[path] = JSON.parse(s); window.__writes++; },
    update: async (data) => { if (!window.__db[path]) throw { code: 'invalid_argument', message: 'missing' }; Object.assign(window.__db[path], clone(data)); window.__writes++; },
    delete: async () => { delete window.__db[path]; },
  });
  const collection = (path) => {
    const depth = path.split('/').length + 1;
    const q = (lim) => ({ path,
      doc: (id) => doc(`${path}/${id}`),
      limit: (n) => q(n),
      get: async () => { const docs = Object.keys(window.__db).filter((k) => k.startsWith(path + '/') && k.split('/').length === depth).sort().slice(0, lim).map(snap);
        return { docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } }; },
    });
    return q(1000);
  };
  window.claude = { use: async (name) => (name === 'db' ? Object.freeze({ collection, doc }) : name === 'user' ? Object.freeze({ id: async () => 'u_test', isOwner: () => true }) : null) };
})();
"""

def answer_current(page):
    page.query_selector_all('#s-options .opt')[0].click(); page.wait_for_timeout(80)
    if page.is_visible('#s-sure'): page.click('#s-sure')
    else: page.click('#s-answer')
    page.wait_for_timeout(120)

def device(p, name, w, h, mobile, db):
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile)
    ctx.add_init_script(CLOCK)
    ctx.add_init_script(FAKE_DB % json.dumps(db))
    page = ctx.new_page()
    page.on('console', lambda m: errors.append(f'[{name}] {m.text}') if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(f'[{name}] {e}'))
    page.goto(f'http://127.0.0.1:{PORT}/index.html'); page.wait_for_timeout(700)
    return browser, page

def do_tappa(page, n_questions):
    page.click('#btn-next'); page.wait_for_timeout(200)
    if page.is_visible('#lesson-go'): page.click('#lesson-go'); page.wait_for_timeout(200)
    for _ in range(n_questions):
        answer_current(page); page.click('#s-next'); page.wait_for_timeout(150)

with sync_playwright() as p:
    # 1) Fold: due tappe, poi l'invio al database
    b, fold = device(p, 'fold', 520, 820, True, {})
    check('fold: sincronizzazione attiva', 'attiva' in fold.evaluate("App.sync.status()") or fold.evaluate("App.sync.active()"), fold.evaluate("App.sync.status()"))
    do_tappa(fold, 3); fold.click('#e-done'); fold.wait_for_timeout(200)
    # la tappa 2 è la misura di partenza (33′): «Non ora» porta alla scheda successiva
    fold.click('#btn-alt'); fold.wait_for_timeout(200)
    if fold.is_visible('#lesson-go'): fold.click('#lesson-go'); fold.wait_for_timeout(200)
    for _ in range(4):
        answer_current(fold); fold.click('#s-next'); fold.wait_for_timeout(150)
    fold.click('#e-done'); fold.wait_for_timeout(3500)  # attesa dell'invio programmato
    db = fold.evaluate("window.__db")
    keys = sorted(db.keys())
    check('fold: documento «state» scritto', 'data/users/u_test/state' in db, keys)
    check('fold: registro del giorno scritto', any('/log-20261024-' in k for k in keys), keys)
    st = db.get('data/users/u_test/state', {})
    check('fold: percorso con due tappe fatte', len((st.get('path') or {}).get('done') or {}) == 2, (st.get('path') or {}).get('done'))
    b.close()

    # 2) PC vuoto: ritrova le due tappe e il registro
    b, pc = device(p, 'pc', 1280, 800, False, db)
    pc.wait_for_timeout(500)
    check('pc: home alla misura di partenza (tappa 3 di 14)', 'tappa 3 di 14' in pc.text_content('#next-label') and 'Misura' in pc.text_content('#next-title'), pc.text_content('#next-label'))
    check('pc: registro unito (7 risposte)', pc.evaluate("App.store.log().filter((e) => e.mode !== 'external').length") == 7, pc.evaluate("App.store.log().length"))
    check('pc: due segmenti pieni oggi', len(pc.query_selector_all('#today-dots .seg.on')) == 2)
    # il PC lascia a metà la scheda successiva («Non ora» sulla misura): scheda → prima domanda risposta → chiusura
    pc.click('#btn-alt'); pc.wait_for_timeout(200)
    if pc.is_visible('#lesson-go'): pc.click('#lesson-go'); pc.wait_for_timeout(200)
    answer_current(pc); pc.click('#s-next'); pc.wait_for_timeout(300)
    counter_pc = pc.text_content('#s-counter').strip()
    pc.evaluate("App.sync.flush(true)"); pc.wait_for_timeout(500)
    db2 = pc.evaluate("window.__db")
    b.close()
    st2 = db2.get('data/users/u_test/state', {})
    check('pc: tappa in pausa inviata', bool(st2.get('current')), (st2.get('current') or {}).get('index'))

    # 3) Fold riaperto: riprende la tappa del PC dalla stessa domanda; il percorso non torna indietro
    fold_db = dict(db2)
    b, fold2 = device(p, 'fold-2', 520, 820, True, fold_db)
    fold2.wait_for_timeout(500)
    sub = fold2.text_content('#next-sub')
    check('fold: «Riprendi» la tappa lasciata sul PC', fold2.text_content('#btn-next').strip().startswith('Riprendi'), fold2.text_content('#btn-next'))
    fold2.click('#btn-next'); fold2.wait_for_timeout(250)
    if fold2.is_visible('#lesson-go'): fold2.click('#lesson-go'); fold2.wait_for_timeout(200)
    check('fold: stessa domanda del PC', fold2.text_content('#s-counter').strip() == counter_pc, f"{fold2.text_content('#s-counter')} vs {counter_pc}")
    b.close()

check('nessun errore di console', not errors, errors[:5])
failed = [c for c in checks if not c[1]]
print(f'\n{len(checks) - len(failed)}/{len(checks)} controlli passati')
httpd.shutdown()
sys.exit(1 if failed else 0)
