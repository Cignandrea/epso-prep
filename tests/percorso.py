"""Test end-to-end della v1.2 «Percorso»: home a un solo pulsante, schede, tappe con verbale/numerico/astratto,
pausa e ripresa esatta dopo la chiusura, simulazione completa con le tre prove, nessun errore di console.
Uso: python3 tests/percorso.py [porta]   — screenshot in tests/out/percorso-*.png"""
import sys, time, threading, http.server, socketserver, functools, os, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8791
OUT = os.path.join(ROOT, 'tests', 'out'); os.makedirs(OUT, exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=httpd.serve_forever, daemon=True).start()

checks, errors = [], []
def check(name, ok, detail=''):
    checks.append((name, bool(ok)))
    print(('PASS' if ok else 'FAIL'), '-', name, ('— ' + str(detail)) if detail else '')

# Data fissa: venerdì 23/10/2026 sera (fase Basi). Il test non dipende dal giorno in cui gira.
FAKE_NOW = "2026-10-24T09:00:00+02:00"
CLOCK = """
(() => { const fixed = new Date('%s').getTime(); const R = Date;
  let start = Number(sessionStorage.getItem('__fakeStart')); if (!start) { start = R.now(); sessionStorage.setItem('__fakeStart', String(start)); }
  const warp = () => Number(sessionStorage.getItem('__warp') || 0);
  class D extends R { constructor(...a) { if (a.length) super(...a); else super(fixed + (R.now() - start) + warp()); }
    static now() { return fixed + (R.now() - start) + warp(); } }
  window.Date = D; })();
""" % FAKE_NOW

VIEWPORTS = [('fold-esterno', 520, 820, True), ('fold-interno', 930, 700, True), ('pc', 1280, 800, False)]

def answer_current(page):
    opts = page.query_selector_all('#s-options .opt')
    opts[0].click(); page.wait_for_timeout(80)
    if page.is_visible('#s-sure'): page.click('#s-sure')
    else: page.click('#s-answer')
    page.wait_for_timeout(120)

def run(p, vp):
    name, w, h, mobile = vp
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile)
    ctx.add_init_script(CLOCK)
    page = ctx.new_page()
    if os.environ.get('STUB_ASTRATTO'):
        page.route('**/js/gen-astratto.js', lambda route: route.fulfill(path=os.environ['STUB_ASTRATTO'], content_type='application/javascript'))
    page.on('console', lambda m: errors.append(f'[{name}] {m.text}') if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append(f'[{name}] {e}'))
    page.goto(f'http://127.0.0.1:{PORT}/index.html'); page.wait_for_timeout(400)
    tag = f'[{name}]'
    check(f'{tag} home: un solo pulsante principale', page.is_visible('#btn-next') and page.text_content('#btn-next').strip() == 'Inizia', page.text_content('#btn-next'))
    check(f'{tag} home: tappa 1 di 14', 'tappa 1 di 14' in page.text_content('#next-label'), page.text_content('#next-label'))
    check(f'{tag} home: conto alla rovescia', 'tra 18 giorni' in page.text_content('#home-countdown'), page.text_content('#home-countdown'))
    check(f'{tag} home: promemoria prerequisiti', page.is_visible('#todo-card'))
    check(f'{tag} home: «Altro» chiuso', not page.is_visible('#btn-micro'))
    page.screenshot(path=f'{OUT}/percorso-{name}-home.png')

    # Tappa 1: scheda + 3 domande (verbale, numerico, astratto)
    page.click('#btn-next'); page.wait_for_timeout(200)
    check(f'{tag} tappa 1: scheda', page.is_visible('#view-lesson') and 'Parte 1' in page.text_content('#lesson-title'), page.text_content('#lesson-title'))
    page.screenshot(path=f'{OUT}/percorso-{name}-scheda.png')
    page.click('#lesson-go'); page.wait_for_timeout(200)
    banks = []
    for i in range(3):
        mode = page.text_content('#s-mode')
        banks.append(mode)
        if 'Astratto' in mode:
            n_series = len(page.query_selector_all('#s-passage .series svg'))
            n_opts = len(page.query_selector_all('#s-options .opt-figure svg'))
            check(f'{tag} astratto: 5 figure in serie e 5 opzioni disegnate', n_series == 5 and n_opts == 5, f'{n_series}/{n_opts}')
            page.screenshot(path=f'{OUT}/percorso-{name}-astratto.png')
        if 'Numerico' in mode:
            rows = len(page.query_selector_all('#s-passage table tbody tr'))
            charts = len(page.query_selector_all('#s-passage svg.chart-svg'))
            check(f'{tag} numerico: tabella o grafico', rows >= 4 or charts >= 1, f'{rows} righe, {charts} grafici')
            check(f'{tag} numerico: calcolatrice disponibile', page.is_visible('#s-calc'))
            page.screenshot(path=f'{OUT}/percorso-{name}-numerico.png')
        answer_current(page)
        check(f'{tag} tappa 1 q{i+1}: correzione subito', page.is_visible('#s-feedback'), page.text_content('#s-fb-head'))
        if i == 0: page.screenshot(path=f'{OUT}/percorso-{name}-feedback.png')
        page.click('#s-next'); page.wait_for_timeout(200)
    check(f'{tag} tappa 1: una domanda per prova', sum('Verbale' in b for b in banks) == 1 and sum('Numerico' in b for b in banks) == 1 and sum('Astratto' in b for b in banks) == 1, banks)
    check(f'{tag} fine tappa: «Continua» verso la tappa 2', page.is_visible('#e-next') and 'Verbale · il metodo' in page.text_content('#e-next'), page.text_content('#e-next'))
    check(f'{tag} fine tappa: oggi 1 di 3', 'Oggi 1 di 3' in page.text_content('#e-today'), page.text_content('#e-today'))
    page.screenshot(path=f'{OUT}/percorso-{name}-fine.png')

    # Tappa 2: scheda → «Più tardi» → home in pausa → Riprendi → una risposta → chiusura (reload) → ripresa esatta
    page.click('#e-next'); page.wait_for_timeout(200)
    check(f'{tag} tappa 2: scheda del verbale', 'metodo' in page.text_content('#lesson-title').lower())
    page.click('#lesson-back'); page.wait_for_timeout(200)
    check(f'{tag} pausa dalla scheda: home «Riprendi»', page.text_content('#btn-next').strip() == 'Riprendi' and 'dalla scheda' in page.text_content('#next-sub'), page.text_content('#next-sub'))
    page.click('#btn-next'); page.wait_for_timeout(200)
    page.click('#lesson-go'); page.wait_for_timeout(200)
    check(f'{tag} tappa 2: 4 domande', page.text_content('#s-counter').strip() == '1 / 4', page.text_content('#s-counter'))
    answer_current(page); page.click('#s-next'); page.wait_for_timeout(150)
    page.wait_for_timeout(1200)  # un po' di tempo sulla domanda 2
    page.reload(); page.wait_for_timeout(400)
    check(f'{tag} riapertura: home «Riprendi» dalla domanda 2 di 4', 'domanda 2 di 4' in page.text_content('#next-sub'), page.text_content('#next-sub'))
    page.click('#btn-next'); page.wait_for_timeout(200)
    check(f'{tag} ripresa esatta: 2 / 4', page.text_content('#s-counter').strip() == '2 / 4', page.text_content('#s-counter'))
    for i in range(3):
        answer_current(page); page.click('#s-next'); page.wait_for_timeout(150)
    check(f'{tag} tappa 2 finita: oggi 2 di 3', 'Oggi 2 di 3' in page.text_content('#e-today'), page.text_content('#e-today'))
    page.click('#e-done'); page.wait_for_timeout(200)
    check(f'{tag} home: tappa 3 di 14', 'tappa 3 di 14' in page.text_content('#next-label'), page.text_content('#next-label'))
    check(f'{tag} home: due pallini pieni', len(page.query_selector_all('#today-dots .dot.on')) == 2)

    # «Altro»: schede, ripasso, simulazione completa con le tre prove
    page.click('#home-more summary'); page.wait_for_timeout(150)
    check(f'{tag} «Altro» aperto: 8 voci', len(page.query_selector_all('#home-more .alt-card')) == 8)
    page.click('#btn-lessons'); page.wait_for_timeout(150)
    check(f'{tag} indice delle schede', len(page.query_selector_all('#lessons-list .alt-card')) >= 14)
    page.click('#lessons-back'); page.wait_for_timeout(150)
    page.click('#home-more summary') if not page.is_visible('#btn-sim') else None
    page.click('#btn-sim'); page.wait_for_timeout(200)
    page.click('#sim-start'); page.wait_for_timeout(200)
    check(f'{tag} sim: intro verbale', 'Verbal Reasoning' in page.text_content('#tao-intro-title'), page.text_content('#tao-intro-title'))
    for sec in ['Verbal', 'Numerical', 'Abstract']:
        page.click('#tao-intro-start'); page.wait_for_timeout(200)
        check(f'{tag} sim {sec}: in corso', sec in page.text_content('#tao-section-name'), page.text_content('#tao-section-name'))
        if sec == 'Abstract':
            check(f'{tag} sim astratto: opzioni-figura', len(page.query_selector_all('#tao-options .tao-opt-figure svg')) == 5)
            page.screenshot(path=f'{OUT}/percorso-{name}-sim-astratto.png')
        if sec == 'Numerical':
            check(f'{tag} sim numerico: tabella o grafico', len(page.query_selector_all('#tao-passage table tbody tr')) >= 4 or len(page.query_selector_all('#tao-passage svg.chart-svg')) >= 1)
            page.screenshot(path=f'{OUT}/percorso-{name}-sim-numerico.png')
        page.click('#tao-options .tao-opt'); page.wait_for_timeout(80)
        # il tempo passa (orologio simulato +40′): la parte si consegna da sola per tempo scaduto, come in TAO
        page.evaluate("() => sessionStorage.setItem('__warp', String(Number(sessionStorage.getItem('__warp') || 0) + 40 * 60 * 1000))")
        page.wait_for_timeout(1300)
    check(f'{tag} sim: risultati con le tre prove', page.is_visible('#view-sim-results') and len(page.query_selector_all('#sim-scores .sim-score')) == 3, len(page.query_selector_all('#sim-scores .sim-score')))
    page.screenshot(path=f'{OUT}/percorso-{name}-sim-risultati.png', full_page=True)
    page.click('#sim-close'); page.wait_for_timeout(200)
    check(f'{tag} home dopo la sim: percorso intatto', 'tappa 3 di 14' in page.text_content('#next-label'), page.text_content('#next-label'))
    page.click('#nav-stato'); page.wait_for_timeout(200)
    check(f'{tag} Stato: si apre', page.is_visible('#view-stato'))
    check(f'{tag} Stato: sincronizzazione spiegata', 'Sincronizzazione' in page.text_content('#stato-sync'), page.text_content('#stato-sync'))
    page.screenshot(path=f'{OUT}/percorso-{name}-stato.png', full_page=True)
    browser.close()

with sync_playwright() as p:
    for vp in VIEWPORTS:
        run(p, vp)

check('nessun errore di console', not errors, errors[:5])
failed = [c for c in checks if not c[1]]
print(f'\n{len(checks) - len(failed)}/{len(checks)} controlli passati')
httpd.shutdown()
sys.exit(1 if failed else 0)
