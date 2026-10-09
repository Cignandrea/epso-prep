"""Smoke test rapido: carica l'app, percorre Micro, Allenamento, Simulazione, sessione esterna, Stato.
Uso: python3 tests/smoke.py [porta]"""
import sys, json, time, threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8781
OUT = os.path.join(ROOT, 'tests', 'out'); os.makedirs(OUT, exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
httpd = socketserver.TCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=httpd.serve_forever, daemon=True).start()

errors, checks = [], []
def check(name, ok, detail=''):
    checks.append((name, bool(ok), detail)); print(('PASS' if ok else 'FAIL'), '-', name, ('— ' + str(detail)) if detail else '')

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={'width': 520, 'height': 820}, device_scale_factor=2, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{PORT}/index.html')
    page.wait_for_timeout(500)
    page.screenshot(path=f'{OUT}/home.png')
    check('home visibile', page.is_visible('#view-home'), page.text_content('#next-title'))

    # ── Micro ──
    page.click('#btn-micro'); page.wait_for_timeout(300)
    check('micro: sessione aperta', page.is_visible('#view-session'), page.text_content('#s-counter'))
    for i in range(3):
        opts = page.query_selector_all('#s-options .opt')
        check(f'micro q{i+1}: opzioni', len(opts) in (3, 4, 5), len(opts))
        opts[0].click(); page.wait_for_timeout(100)
        page.click('#s-sure'); page.wait_for_timeout(150)
        check(f'micro q{i+1}: feedback', page.is_visible('#s-feedback'), page.text_content('#s-fb-head'))
        if i == 0: page.screenshot(path=f'{OUT}/micro-feedback.png')
        page.click('#s-next'); page.wait_for_timeout(200)
    check('micro: fine sessione', page.is_visible('#view-end'), page.text_content('#e-score'))
    page.screenshot(path=f'{OUT}/end.png')
    page.click('#e-done'); page.wait_for_timeout(200)

    # ── Allenamento (forzato: verbale 10) ──
    page.evaluate("() => App.session.start('train', App.select.pickTraining('verbale', 10))"); page.wait_for_timeout(300)
    check('train: 10 item', page.text_content('#s-counter').strip() == '1 / 10', page.text_content('#s-counter'))
    # ripresa: ricarica a metà
    page.click('#s-options .opt >> nth=1'); page.click('#s-sure'); page.wait_for_timeout(100); page.click('#s-next'); page.wait_for_timeout(100)
    page.reload(); page.wait_for_timeout(500)
    check('train: home propone Riprendi', 'Riprendi' in page.text_content('#btn-next'), page.text_content('#btn-next'))
    page.click('#btn-next'); page.wait_for_timeout(300)
    check('train: ripresa alla domanda 2', page.text_content('#s-counter').strip() == '2 / 10', page.text_content('#s-counter'))
    for i in range(9):
        page.click('#s-options .opt >> nth=0'); page.click('#s-doubt'); page.wait_for_timeout(80); page.click('#s-next'); page.wait_for_timeout(120)
    check('train: fine', page.is_visible('#view-end'), page.text_content('#e-sentence'))
    page.click('#e-copy'); page.wait_for_timeout(100)
    page.click('#e-done'); page.wait_for_timeout(200)

    # ── Sessione esterna ──
    page.click('#btn-external'); page.wait_for_timeout(200)
    page.fill('#ext-score', '7'); page.fill('#ext-max', '10'); page.fill('#ext-min', '10')
    page.click('#ext-form button[type=submit]'); page.wait_for_timeout(200)
    check('esterna: salvata e home', page.is_visible('#view-home'))

    # ── Simulazione (desktop) ──
    page2 = ctx.new_page(); page2.set_viewport_size({'width': 1280, 'height': 800})
    page2.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page2.on('pageerror', lambda e: errors.append(str(e)))
    page2.goto(f'http://127.0.0.1:{PORT}/index.html'); page2.wait_for_timeout(400)
    page2.click('#btn-sim'); page2.wait_for_timeout(200)
    check('sim: setup', page2.is_visible('#view-sim-setup'), page2.text_content('#sim-pool-note'))
    page2.click('#sim-start'); page2.wait_for_timeout(300)
    check('sim: intro', page2.is_visible('#tao-intro'), page2.text_content('#tao-intro-title'))
    page2.click('#tao-intro-start'); page2.wait_for_timeout(300)
    check('sim: item 1 e timer', page2.is_visible('#tao-item') and 'min' in page2.text_content('#tao-timer'), page2.text_content('#tao-timer'))
    page2.screenshot(path=f'{OUT}/sim-item.png')
    page2.click('#tao-options .tao-opt >> nth=0'); page2.wait_for_timeout(100)
    page2.click('#tao-bookmark'); page2.click('#tao-next'); page2.wait_for_timeout(100)
    page2.keyboard.press('B'); page2.keyboard.press('ArrowRight'); page2.wait_for_timeout(100)
    check('sim: navigazione', page2.text_content('#tao-bubbles .current').strip() == '3')
    page2.click('#tao-overview-btn'); page2.wait_for_timeout(200)
    check('sim: overview', page2.is_visible('#tao-overview') and page2.text_content('#ov-bm').strip() == '1' and page2.text_content('#ov-inc').strip() == '18', f"bm={page2.text_content('#ov-bm')} inc={page2.text_content('#ov-inc')}")
    page2.screenshot(path=f'{OUT}/sim-overview.png')
    page2.click('#tao-submit'); page2.wait_for_timeout(200)
    check('sim: conferma consegna', page2.is_visible('.modal'))
    page2.click('.modal .btn-primary'); page2.wait_for_timeout(300)
    check('sim: intro numerico', page2.is_visible('#tao-intro') and 'Numerical' in page2.text_content('#tao-intro-title'), page2.text_content('#tao-intro-title'))
    page2.click('#tao-intro-start'); page2.wait_for_timeout(200)
    page2.click('#tao-calc'); page2.fill('#calc-display', '6075/1.82/(3725/3.34)'); page2.keyboard.press('Enter'); page2.wait_for_timeout(100)
    check('sim: calcolatrice', abs(float(page2.input_value('#calc-display')) - 2.99) < 0.05, page2.input_value('#calc-display'))
    page2.screenshot(path=f'{OUT}/sim-numeric.png')
    for i in range(10):
        page2.click('#tao-options .tao-opt >> nth=1'); page2.wait_for_timeout(50)
        if i < 9: page2.click('#tao-next'); page2.wait_for_timeout(50)
    page2.click('#tao-overview-btn'); page2.wait_for_timeout(100); page2.click('#tao-submit'); page2.wait_for_timeout(200)
    page2.click('.modal .btn-primary'); page2.wait_for_timeout(400)
    check('sim: risultati', page2.is_visible('#view-sim-results'), page2.text_content('#sim-sentence'))
    page2.screenshot(path=f'{OUT}/sim-results.png', full_page=True)
    log = page2.evaluate("() => JSON.parse(localStorage.getItem('eps2.log')).filter(e => e.mode === 'sim').length")
    check('sim: 30 voci nel registro', log == 30, log)
    page2.click('#sim-close'); page2.wait_for_timeout(200)
    page2.click('#nav-stato'); page2.wait_for_timeout(200)
    check('stato: visibile', page2.is_visible('#view-stato'), page2.text_content('#stato-device'))
    page2.screenshot(path=f'{OUT}/stato.png', full_page=True)
    browser.close()

httpd.shutdown()
check('zero errori console/page', len(errors) == 0, ' | '.join(errors)[:600])
fails = [c for c in checks if not c[1]]
print(f'\n{len(checks) - len(fails)}/{len(checks)} PASS')
sys.exit(1 if fails else 0)
