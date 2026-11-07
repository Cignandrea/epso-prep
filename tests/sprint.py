"""Smoke test dell'ultima settimana (v1.3): home → scheda → sessione nel clone TAO (una o due prove) → consegna →
risultati → home «Per stasera basta» → «Ne vuoi un'altra?» → seconda sessione (numerico + astratto, due timer) → fine.
Gira sul PC (viewport 1280×800) e sul Fold chiuso (520×820). Richiede che oggi sia nell'ultima settimana (03–09/11/2026):
altrimenti forza la data nel browser con --date AAAA-MM-GG.
Uso: python3 tests/sprint.py [porta] [--date 2026-11-04]"""
import sys, os, json, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
PORT = int(args[0]) if args else 8791
DATE = sys.argv[sys.argv.index('--date') + 1] if '--date' in sys.argv else None
OUT = os.path.join(ROOT, 'tests', 'out'); os.makedirs(OUT, exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
httpd = socketserver.TCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=httpd.serve_forever, daemon=True).start()

errors, fails = [], 0
def check(name, ok, detail=''):
    global fails
    if not ok: fails += 1
    print(('PASS' if ok else 'FAIL'), '-', name, ('— ' + str(detail)) if detail else '')

# Data finta: Date() del browser spostata al giorno chiesto, alle 21:00 (sera).
FAKE_DATE = f"""
(() => {{
  const base = new Date('{DATE}T21:00:00+01:00').getTime();
  const offset = base - Date.now();
  const RealDate = Date;
  class FakeDate extends RealDate {{
    constructor(...a) {{ if (a.length === 0) super(RealDate.now() + offset); else super(...a); }}
    static now() {{ return RealDate.now() + offset; }}
  }}
  window.Date = FakeDate;
}})();
""" if DATE else ''

def run_block(page, label, n_sections):
    """Dalla scheda alla consegna: risponde A a tutto, consegna ogni parte."""
    check(f'{label}: scheda prima della sessione', page.is_visible('#view-lesson'), page.text_content('#lesson-title'))
    page.click('#lesson-go'); page.wait_for_timeout(300)
    for s in range(n_sections):
        check(f'{label}: intro TAO parte {s + 1}', page.is_visible('#tao-intro'), page.text_content('#tao-intro-title'))
        if s == 0: page.screenshot(path=f'{OUT}/sprint-{label}-intro.png')
        page.click('#tao-intro-start'); page.wait_for_timeout(300)
        total = int(page.text_content('#tao-overview-n'))
        for i in range(total):
            page.click('#tao-options input[type=radio] >> nth=0'); page.wait_for_timeout(40)
            if i < total - 1: page.click('#tao-next'); page.wait_for_timeout(60)
        if s == 0: page.screenshot(path=f'{OUT}/sprint-{label}-item.png')
        page.click('#tao-overview-btn'); page.wait_for_timeout(150)
        page.click('#tao-submit'); page.wait_for_timeout(200)
        ok_btn = page.query_selector('#modal-root .modal button.btn-primary')
        if ok_btn: ok_btn.click()
        else: page.keyboard.press('Enter')
        page.wait_for_timeout(300)
    check(f'{label}: risultati', page.is_visible('#view-sim-results'), page.text_content('#sim-sentence'))
    page.screenshot(path=f'{OUT}/sprint-{label}-results.png', full_page=False)
    page.click('#sim-close'); page.wait_for_timeout(300)

with sync_playwright() as p:
    browser = p.chromium.launch()
    for name, vp, mobile in (('pc', {'width': 1280, 'height': 800}, False), ('fold', {'width': 520, 'height': 820}, True)):
        ctx = browser.new_context(viewport=vp, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile)
        if FAKE_DATE: ctx.add_init_script(FAKE_DATE)
        page = ctx.new_page()
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{PORT}/index.html'); page.wait_for_timeout(600)
        label = page.text_content('#next-label')
        check(f'[{name}] home: sessione da 30′ di verbale', 'sessione da 30′' in label and 'Verbale' in page.text_content('#next-title'), label + ' / ' + page.text_content('#next-title'))
        page.screenshot(path=f'{OUT}/sprint-{name}-home.png')
        page.click('#btn-next'); page.wait_for_timeout(300)
        run_block(page, f'{name}-v10', 1)
        check(f'[{name}] home dopo la sessione: per stasera basta', 'Per stasera basta' in page.text_content('#next-title'), page.text_content('#next-title') + ' / ' + page.text_content('#next-sub'))
        alt = page.text_content('#btn-alt')
        check(f'[{name}] un\'altra a un tocco: numerico + astratto', 'Numerico 5' in alt, alt)
        page.screenshot(path=f'{OUT}/sprint-{name}-done.png')
        page.click('#btn-alt'); page.wait_for_timeout(300)
        run_block(page, f'{name}-na', 2)
        done = page.evaluate("() => Object.keys(JSON.parse(localStorage.getItem('eps2.path') || '{}').done || {})")
        check(f'[{name}] percorso: sp1 e sp2 fatte', 'sp1' in done and 'sp2' in done, done)
        today = page.text_content('#today-text')
        check(f'[{name}] oggi: sessione fatta', 'Sessione di oggi fatta' in today, today)
        page.click('#nav-agenda'); page.wait_for_timeout(300)
        page.screenshot(path=f'{OUT}/sprint-{name}-agenda.png', full_page=True)
        check(f'[{name}] agenda: date aggiornate', 'simulazione completa' in page.text_content('#date-list').lower() and 'Prima della prova' in page.text_content('#date-list'))
        ctx.close()
    browser.close()

check('nessun errore JS', not errors, errors[:3])
print(f'{"OK" if not fails else "KO"}: {fails} fallimenti')
sys.exit(1 if fails else 0)
