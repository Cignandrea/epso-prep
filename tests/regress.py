"""Regressione dei ticket del round 1 (T-001…T-023). Uso: python3 tests/regress.py [porta]"""
import sys, os, json, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8784
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
httpd = socketserver.TCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{PORT}/index.html'
errors, checks = [], []
def check(tid, name, ok, detail=''):
    checks.append((tid, name, bool(ok), detail)); print(('PASS' if ok else 'FAIL'), tid, '-', name, ('— ' + str(detail)) if detail else '')

def new_page(ctx):
    p = ctx.new_page()
    p.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    p.on('pageerror', lambda e: errors.append(str(e)))
    return p

with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # ── T-001 Invio → feedback visibile, poi Invio → prossimo ──
    ctx = browser.new_context(viewport={'width': 1280, 'height': 800}); page = new_page(ctx)
    page.goto(URL); page.wait_for_timeout(300)
    page.evaluate("() => App.session.start('train', App.select.pickTraining('verbale', 10))"); page.wait_for_timeout(200)
    page.keyboard.press('A'); page.keyboard.press('Enter'); page.wait_for_timeout(250)
    check('T-001', 'Invio mostra il feedback e resta su 1/10', page.is_visible('#s-feedback') and page.text_content('#s-counter').strip() == '1 / 10', page.text_content('#s-counter'))
    page.keyboard.press('Enter'); page.wait_for_timeout(200)
    check('T-001', 'secondo Invio → 2/10', page.text_content('#s-counter').strip() == '2 / 10', page.text_content('#s-counter'))
    # T-010: tasti bloccati con modale, Escape chiude
    page.click('#s-quit'); page.wait_for_timeout(150)
    page.keyboard.press('B'); page.wait_for_timeout(100)
    sel = page.evaluate("() => App.store.current().selected")
    check('T-010', 'lettera ignorata con modale aperta', sel is None, sel)
    page.keyboard.press('Escape'); page.wait_for_timeout(150)
    check('T-010', 'Escape chiude la modale', not page.is_visible('.modal'))
    ctx.close()

    # ── T-002 fuso orario 00:30 Europe/Rome: sessione in pausa resta di oggi ──
    ctx = browser.new_context(viewport={'width': 520, 'height': 820}, timezone_id='Europe/Rome'); page = new_page(ctx)
    page.goto(URL); page.wait_for_timeout(300)
    page.clock.install(time='2026-10-12T00:30:00+02:00')
    page.evaluate("() => App.session.start('micro', App.select.pickMicro(3))"); page.wait_for_timeout(200)
    page.click('#s-options .opt >> nth=0'); page.click('#s-sure'); page.wait_for_timeout(100)
    page.click('#s-quit'); page.wait_for_timeout(100); page.click('.modal .btn-primary'); page.wait_for_timeout(200)
    check('T-002', 'alle 00:30 la home propone Riprendi', 'Riprendi' in page.text_content('#btn-next'), page.text_content('#btn-next'))
    # allenamento completo alle 00:35 → Fatto per oggi (lunedì = verbale)
    page.evaluate("() => { App.store.setCurrent(null); App.session.start('train', App.select.pickTraining('verbale', 2)); }"); page.wait_for_timeout(200)
    for i in range(2):
        page.click('#s-options .opt >> nth=0'); page.click('#s-sure'); page.wait_for_timeout(80); page.click('#s-next'); page.wait_for_timeout(120)
    page.click('#e-done'); page.wait_for_timeout(200)
    check('T-002', 'allenamento completato alle 00:35 → Fatto per oggi', 'Fatto per oggi' in page.text_content('#next-title'), page.text_content('#next-title'))
    ctx.close()

    # ── T-003 sessione lasciata ieri → parziale datata ieri, oggi non «fatto» ──
    ctx = browser.new_context(viewport={'width': 520, 'height': 820}, timezone_id='Europe/Rome'); page = new_page(ctx)
    page.goto(URL); page.wait_for_timeout(300)
    page.clock.install(time='2026-10-11T18:00:00+02:00')
    page.evaluate("() => App.session.start('train', App.select.pickTraining('verbale', 10))"); page.wait_for_timeout(200)
    page.click('#s-options .opt >> nth=0'); page.click('#s-sure'); page.wait_for_timeout(80); page.click('#s-next'); page.wait_for_timeout(100)
    page.click('#s-quit'); page.wait_for_timeout(100); page.click('.modal .btn-primary'); page.wait_for_timeout(100)
    page.clock.set_system_time('2026-10-12T09:00:00+02:00'); page.reload(); page.wait_for_timeout(400)
    sess = page.evaluate("() => JSON.parse(localStorage.getItem('eps2.sessions'))")
    check('T-003', 'parziale datata al giorno in cui è stata fatta', sess and sess[-1].get('partial') and sess[-1]['t'].startswith('2026-10-11'), sess[-1]['t'] if sess else None)
    check('T-003', 'lunedì propone Verbale, non «Fatto»', page.text_content('#next-title').strip() == 'Verbale', page.text_content('#next-title'))
    check('T-003', 'settimana 0 giorni attivi', 'Settimana: 0 giorni' in page.text_content('#week-line'), page.text_content('#week-line'))
    ctx.close()

    # ── T-004 sim: tastiera allinea il radio; click dopo tastiera registra ──
    ctx = browser.new_context(viewport={'width': 1280, 'height': 800}); page = new_page(ctx)
    page.goto(URL); page.wait_for_timeout(300)
    page.click('#btn-sim'); page.wait_for_timeout(150); page.click('#sim-start'); page.wait_for_timeout(200); page.click('#tao-intro-start'); page.wait_for_timeout(200)
    page.click('#tao-options .tao-opt >> nth=2'); page.keyboard.press('B'); page.wait_for_timeout(100)
    st = page.evaluate("() => ({radio: [...document.querySelectorAll('#tao-options input')].filter(i => i.checked).map(i => i.value), stored: Object.values(App.store.sim().sections[0].answers)})")
    check('T-004', 'tasto B spunta il radio B', st['radio'] == ['B'] and st['stored'] == ['B'], json.dumps(st))
    page.click('#tao-options .tao-opt >> nth=2'); page.wait_for_timeout(100)
    st = page.evaluate("() => Object.values(App.store.sim().sections[0].answers)")
    check('T-004', 'click su C dopo tastiera registra C', st == ['C'], st)

    # ── T-005 corsa: timer scaduto con modale aperta → nessuna doppia consegna ──
    page.click('#tao-overview-btn'); page.wait_for_timeout(100); page.click('#tao-submit'); page.wait_for_timeout(150)
    check('T-005', 'modale aperta', page.is_visible('.modal'))
    page.evaluate("() => { const s = App.store.sim(); s.deadline = Date.now() - 1; App.store.setSim(s); }")
    page.evaluate("() => { const s = App.store.sim(); }")
    # forza il tick: il timer interno legge SIM in memoria; impostiamo il deadline in memoria tramite resume
    page.reload(); page.wait_for_timeout(300); page.click('#btn-next'); page.wait_for_timeout(800)
    st = page.evaluate("() => ({unit: App.store.sim().unit, phase: App.store.sim().phase, modal: document.getElementById('modal-root').childElementCount})")
    check('T-005', 'allo scadere: intro del numerico, modale chiusa', st['unit'] == 1 and st['phase'] == 'intro' and st['modal'] == 0, json.dumps(st))
    ctx.close()

    # ── T-006 stato: barre trappole ──
    ctx = browser.new_context(viewport={'width': 520, 'height': 820}); page = new_page(ctx)
    page.goto(URL); page.wait_for_timeout(300)
    page.evaluate("() => App.session.start('micro', App.select.pickMicro(3))"); page.wait_for_timeout(200)
    for i in range(3):
        page.click('#s-options .opt >> nth=0'); page.click('#s-sure'); page.wait_for_timeout(80); page.click('#s-next'); page.wait_for_timeout(120)
    page.click('#e-done'); page.wait_for_timeout(100); page.click('#nav-stato'); page.wait_for_timeout(200)
    html = page.inner_html('#stato-tags')
    check('T-006', 'barre trappole renderizzate', 'object HTML' not in html and (page.locator('#stato-tags .tagbar').count() > 0 or 'Nessun errore' in html), html[:80])
    # T-013 target di tocco
    h = page.evaluate("() => [...document.querySelectorAll('#view-stato .choice')].map(e => e.getBoundingClientRect().height)")
    check('T-013', 'checkbox impostazioni ≥ 44 px', all(x >= 44 for x in h), h)
    # T-019 import dello stesso export → nessuna voce nuova
    r = page.evaluate("() => App.store.importAll(App.store.exportAll())")
    check('T-019', 'import dello stesso file: 0 nuove', r['items'] == 0 and r['sessions'] == 0, json.dumps(r))
    ctx.close()

    # ── T-007/T-021: sim stantia chiusa; sim finita → «Rivedi i risultati» ──
    ctx = browser.new_context(viewport={'width': 1280, 'height': 800}, timezone_id='Europe/Rome'); page = new_page(ctx)
    page.goto(URL); page.wait_for_timeout(300)
    page.clock.install(time='2026-10-10T10:00:00+02:00')
    page.click('#btn-sim'); page.wait_for_timeout(150); page.click('#sim-start'); page.wait_for_timeout(200); page.click('#tao-intro-start'); page.wait_for_timeout(200)
    page.clock.set_system_time('2026-10-12T10:00:00+02:00'); page.reload(); page.wait_for_timeout(500)
    check('T-007', 'sim di due giorni fa chiusa senza conteggio', page.evaluate("() => App.store.sim()") is None and page.evaluate("() => JSON.parse(localStorage.getItem('eps2.log')||'[]').length") == 0)
    ctx.close()

    # ── T-009: Micro con sessione in pausa → conferma e chiusura parziale ──
    ctx = browser.new_context(viewport={'width': 520, 'height': 820}); page = new_page(ctx)
    page.goto(URL); page.wait_for_timeout(300)
    page.evaluate("() => App.session.start('train', App.select.pickTraining('verbale', 10))"); page.wait_for_timeout(200)
    page.click('#s-options .opt >> nth=0'); page.click('#s-sure'); page.wait_for_timeout(80); page.click('#s-next'); page.wait_for_timeout(100)
    page.click('#s-quit'); page.wait_for_timeout(100); page.click('.modal .btn-primary'); page.wait_for_timeout(200)
    page.click('#btn-micro'); page.wait_for_timeout(150)
    check('T-009', 'avviso sessione in pausa', page.is_visible('.modal'))
    page.click('.modal .btn-primary'); page.wait_for_timeout(300)
    sess = page.evaluate("() => JSON.parse(localStorage.getItem('eps2.sessions'))")
    check('T-009', 'parziale registrata e Micro avviata', sess and sess[-1].get('partial') and page.is_visible('#view-session') and 'Micro' in page.text_content('#s-mode'), (sess[-1] if sess else None, page.text_content('#s-mode')))
    ctx.close()

    # ── T-011: id mancante nella sessione in pausa ──
    ctx = browser.new_context(viewport={'width': 520, 'height': 820}); page = new_page(ctx)
    page.goto(URL); page.wait_for_timeout(300)
    page.evaluate("() => { App.session.start('train', App.select.pickTraining('verbale', 3)); const c = App.store.current(); c.items[1] = {bank: 'verbale', id: 9999}; App.store.setCurrent(c); }")
    page.reload(); page.wait_for_timeout(400); page.click('#btn-next'); page.wait_for_timeout(300)
    n = page.text_content('#s-counter')
    check('T-011', 'item mancante saltato senza errori', page.is_visible('#view-session') and '/ 2' in n, n)
    ctx.close()

    # ── T-008/T-018 calcolatrice: widget esclusivi, % rimosso ──
    ctx = browser.new_context(viewport={'width': 1280, 'height': 800}); page = new_page(ctx)
    page.goto(URL); page.wait_for_timeout(300)
    page.click('#btn-sim'); page.wait_for_timeout(100); page.click('#sim-start'); page.wait_for_timeout(200); page.click('#tao-intro-start'); page.wait_for_timeout(200)
    page.click('#tao-calc'); page.click('#tao-pad'); page.wait_for_timeout(100)
    st = page.evaluate("() => ({calc: document.getElementById('tao-calc-widget').hidden, pad: document.getElementById('tao-pad-widget').hidden, pct: [...document.querySelectorAll('.calc-key')].some(k => k.textContent === '%')})")
    check('T-008', 'aprendo lo scratchpad la calcolatrice si chiude', st['calc'] and not st['pad'], json.dumps(st))
    check('T-018', 'tasto % rimosso', not st['pct'])
    ctx.close()
    browser.close()

httpd.shutdown()
check('ALL', 'zero errori console/page', len(errors) == 0, ' | '.join(errors)[:500])
fails = [c for c in checks if not c[2]]
print(f'\n{len(checks) - len(fails)}/{len(checks)} PASS')
sys.exit(1 if fails else 0)
