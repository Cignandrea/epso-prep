"""Regressione dei ticket del round 2 — Team Codice (T-059…T-090). Uso: python3 tests/regress2.py [porta]"""
import sys, os, re, json, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8785
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
httpd = socketserver.TCPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{PORT}/index.html'
URL_LOCALHOST = f'http://localhost:{PORT}/index.html'  # qui il service worker si registra
errors, checks = [], []
def check(tid, name, ok, detail=''):
    checks.append((tid, name, bool(ok), detail)); print(('PASS' if ok else 'FAIL'), tid, '-', name, ('— ' + str(detail)) if detail else '')

def new_page(ctx):
    p = ctx.new_page()
    p.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    p.on('pageerror', lambda e: errors.append(str(e)))
    return p

T0 = '2026-10-12T10:00:00+02:00'  # lunedì (allenamento verbale)
def fresh(browser, viewport=(1280, 800), time=T0, pause=True, url=URL):
    ctx = browser.new_context(viewport={'width': viewport[0], 'height': viewport[1]}, timezone_id='Europe/Rome')
    page = new_page(ctx)
    page.clock.install(time=time)
    if pause: page.clock.pause_at(time)
    page.goto(url); page.wait_for_timeout(300)
    return ctx, page

def start_micro(page):
    page.evaluate("() => App.session.start('micro', App.select.pickMicro(3))"); page.wait_for_timeout(150)
def answer_first(page, conf='sure'):
    page.click('#s-options .opt >> nth=0'); page.click(f'#s-{conf}'); page.wait_for_timeout(80)
def start_sim(page, scope='full', timer='section'):
    page.evaluate(f"() => {{ document.querySelector('input[name=sim-scope][value={scope}]').checked = true; document.querySelector('input[name=sim-timer][value={timer}]').checked = true; }}")
    page.click('#sim-start'); page.wait_for_timeout(200); page.click('#tao-intro-start'); page.wait_for_timeout(200)

# ── T-061 statico: versione del service worker legata a quella dell'app ──
main_js = open(os.path.join(ROOT, 'js', 'main.js'), encoding='utf-8').read()
sw_js = open(os.path.join(ROOT, 'sw.js'), encoding='utf-8').read()
v_main = re.search(r"const VERSION = '([^']+)'", main_js).group(1)
v_sw = re.search(r"const VERSION = '([^']+)'", sw_js).group(1)
check('T-061', 'sw.js VERSION == main.js VERSION e nome cache derivato', v_main == v_sw and 'euprep-${VERSION}' in sw_js, f'{v_main} / {v_sw}')
check('T-089', 'CSP presente e nessun attributo style inline nei sorgenti', 'Content-Security-Policy' in open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read() and not re.search(r"style: `|setAttribute\('style'", ''.join(open(os.path.join(ROOT, 'js', f), encoding='utf-8').read() for f in os.listdir(os.path.join(ROOT, 'js')))))

with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # ── T-059 / T-066 pausa e background ──
    ctx, page = fresh(browser)
    start_micro(page); answer_first(page); page.click('#s-next'); page.wait_for_timeout(100)
    page.clock.run_for(10000)
    el0 = page.evaluate("() => App.store.current().elapsed")
    page.click('#s-quit'); page.wait_for_timeout(100); page.click('.modal .btn-primary'); page.wait_for_timeout(200)
    el1 = page.evaluate("() => App.store.current().elapsed")
    page.evaluate("() => Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })")
    page.evaluate("() => document.dispatchEvent(new Event('visibilitychange'))")
    page.clock.run_for(300000)
    page.evaluate("() => Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })")
    page.evaluate("() => document.dispatchEvent(new Event('visibilitychange'))"); page.evaluate("() => window.dispatchEvent(new Event('pagehide'))")
    el2 = page.evaluate("() => App.store.current().elapsed")
    check('T-059', 'dopo «Esci» il tempo salvato non cresce in background', 9 <= el0 <= 11 and abs(el1 - el0) < 1 and abs(el2 - el1) < 0.01, f'{el0:.1f} → {el1:.1f} → {el2:.1f}')
    # Ripresa: il tempo riparte da quello salvato e il background non entra (T-066)
    page.click('#btn-next'); page.wait_for_timeout(150)
    page.clock.run_for(5000)
    page.evaluate("() => Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })"); page.evaluate("() => document.dispatchEvent(new Event('visibilitychange'))")
    page.clock.run_for(240000)
    page.evaluate("() => Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })"); page.evaluate("() => document.dispatchEvent(new Event('visibilitychange'))")
    page.clock.run_for(2000)
    el3 = page.evaluate("() => App.store.current().elapsed")
    check('T-066', 'tempo in background escluso dall\'item (10 + 5 + 2 ≈ 17 s)', 16 <= el3 <= 18.5, f'{el3:.1f} · #s-time {page.text_content("#s-time")}')
    # Azzera tutto → nessuno zombie
    page.click('#s-quit'); page.wait_for_timeout(100); page.click('.modal .btn-primary'); page.wait_for_timeout(150)
    page.evaluate("() => App.store.resetAll()")
    page.evaluate("() => Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })"); page.evaluate("() => document.dispatchEvent(new Event('visibilitychange'))"); page.evaluate("() => window.dispatchEvent(new Event('pagehide'))")
    check('T-059', 'dopo «Azzera tutto» eps2.current resta null', page.evaluate("() => localStorage.getItem('eps2.current')") in (None, 'null'))
    ctx.close()

    # ── T-060 sim a sezioni ripresa dopo la scadenza → intro del numerico; timer unico → risultati ──
    ctx, page = fresh(browser)
    page.click('#btn-sim'); page.wait_for_timeout(100); start_sim(page, 'full', 'section')
    page.click('#tao-options .tao-opt >> nth=0'); page.wait_for_timeout(50)
    page.evaluate("() => { const s = App.store.sim(); s.deadline = Date.now() - 60000; App.store.setSim(s); }")
    page.reload(); page.wait_for_timeout(300); page.click('#btn-next'); page.wait_for_timeout(400)
    st = page.evaluate("() => ({phase: App.store.sim().phase, unit: App.store.sim().unit, introHidden: document.getElementById('tao-intro').hidden, bodyHidden: document.getElementById('tao-body').hidden, s0: App.store.sim().sections[0].status, s1: App.store.sim().sections[1].status, timer: document.getElementById('tao-timer').textContent})")
    check('T-060', 'ripresa dopo scadenza: intro del numerico visibile, item nascosto', st['phase'] == 'intro' and st['unit'] == 1 and not st['introHidden'] and st['bodyHidden'] and st['s0'] == 'done' and st['s1'] == 'pending' and st['timer'] == '20min 00s', json.dumps(st))
    page.click('#tao-intro-start'); page.wait_for_timeout(100); page.clock.run_for(1500)
    check('T-060', 'Start del numerico: timer attivo da 20′', page.evaluate("() => App.store.sim().phase") == 'running' and page.text_content('#tao-timer').startswith('19min 58'), page.text_content('#tao-timer'))
    ctx.close()
    ctx, page = fresh(browser)
    page.click('#btn-sim'); page.wait_for_timeout(100); start_sim(page, 'verbale', 'single')
    page.evaluate("() => { const s = App.store.sim(); s.deadline = Date.now() - 60000; App.store.setSim(s); }")
    page.reload(); page.wait_for_timeout(300); page.click('#btn-next'); page.wait_for_timeout(400)
    check('T-060', 'timer unico scaduto alla ripresa → risultati', page.is_visible('#view-sim-results') and page.evaluate("() => App.store.sim().phase") == 'results')
    ctx.close()

    # ── T-062 Leitner: la scatola avanza in Micro/Allenamento ──
    ctx, page = fresh(browser)
    page.evaluate("""() => {
      const q = App.banks.get('verbale').questions.find(x => x.format === 'epso4');
      const d0 = new Date(Date.now() - 2 * 86400000).toISOString();   // sabato: sbagliata
      const d1 = new Date(Date.now() - 1 * 86400000).toISOString();   // domenica: giusta in Micro
      const l = App.store.log(); l.length = 0;
      l.push({ t: d0, mode: 'micro', session: 'a', bank: 'verbale', id: q.id, sel: 'A', ok: false, sec: 30, conf: 'sure', tag: q.tag, level: q.level, format: q.format });
      l.push({ t: d1, mode: 'micro', session: 'b', bank: 'verbale', id: q.id, sel: 'B', ok: true, sec: 30, conf: 'sure', tag: q.tag, level: q.level, format: q.format });
      localStorage.setItem('eps2.log', JSON.stringify(l));
      window.__q = q.id;
    }""")
    page.reload(); page.wait_for_timeout(300)
    st = page.evaluate("() => { const s = App.store.itemStats().get('verbale#' + window.__q || ''); const q = App.banks.get('verbale').questions.find(x => x.format === 'epso4'); const st = App.store.itemStats().get('verbale#' + q.id); return { box: st.box, due: st.due, dueNow: App.select.dueItems().some(x => x.id === q.id) }; }")
    check('T-062', 'risposta giusta in Micro → scatola 2, ripasso a +3 giorni, non riproposto oggi', st['box'] == 2 and not st['dueNow'] and st['due'].startswith('2026-10-14'), json.dumps(st))
    ctx.close()

    # ── T-063 composizione Micro: sempre ≥ 1 numerico, nessun duplicato (con e senza ripasso, vfn on/off) ──
    ctx, page = fresh(browser)
    res = page.evaluate("""() => {
      const out = [];
      const q = App.banks.get('verbale').questions.find(x => x.format === 'epso4');
      for (const withDue of [false, true]) for (const vfn of [true, false]) {
        localStorage.removeItem('eps2.log');
        if (withDue) localStorage.setItem('eps2.log', JSON.stringify([{ t: new Date(Date.now() - 86400000).toISOString(), mode: 'micro', session: 'x', bank: 'verbale', id: q.id, sel: 'A', ok: false, sec: 20, conf: null, tag: q.tag, level: q.level, format: q.format }]));
        window.dispatchEvent(new StorageEvent('storage', { key: 'eps2.log' }));
        App.store.setSetting('microVfn', vfn);
        for (let i = 0; i < 10; i++) {
          const items = App.select.pickMicro(3);
          const keys = items.map(x => x.bank + '#' + x.id);
          out.push({ withDue, vfn, n: items.length, num: items.filter(x => x.bank === 'numerico').length, verb: items.filter(x => x.bank === 'verbale' && x.format === 'epso4').length, vfn_n: items.filter(x => x.format === 'vfn').length, dup: new Set(keys).size !== keys.length, due: withDue ? keys.includes('verbale#' + q.id) : null });
        }
      }
      return out;
    }""")
    bad = [r for r in res if r['n'] != 3 or r['num'] < 1 or r['dup'] or (r['due'] is False) or (r['vfn'] and r['vfn_n'] != 1) or (not r['vfn'] and r['vfn_n'] != 0)]
    check('T-063', '40 Micro: 3 item, ≥1 numerico, ripasso incluso, vfn solo se attivo, nessun duplicato', not bad, json.dumps(bad[:3]))
    ctx.close()

    # ── T-064 / T-065 avvio sopra uno stato in corso ──
    ctx, page = fresh(browser)
    page.click('#btn-sim'); page.wait_for_timeout(100); start_sim(page, 'full', 'section')
    page.reload(); page.wait_for_timeout(300)
    excl = page.evaluate("() => { const pend = App.select.pendingSimKeys(); let hit = 0; for (let i = 0; i < 10; i++) for (const q of App.select.pickMicro(3)) if (pend.has(q.bank + '#' + q.id)) hit++; for (const q of App.select.pickTraining('verbale', 10)) if (pend.has(q.bank + '#' + q.id)) hit++; return { pend: pend.size, hit }; }")
    check('T-064', 'item della sim in sospeso mai in Micro/Allenamento', excl['pend'] == 30 and excl['hit'] == 0, json.dumps(excl))
    page.click('#btn-micro'); page.wait_for_timeout(150)
    check('T-064', 'Micro con sim in corso → modale', page.is_visible('.modal') and 'simulazione' in page.text_content('.modal').lower())
    page.click('.modal .btn-ghost'); page.wait_for_timeout(150)
    check('T-064', '«Torna indietro» conserva la sim', page.evaluate("() => App.store.sim() !== null") and not page.is_visible('#view-session'))
    page.click('#btn-micro'); page.wait_for_timeout(150); page.click('.modal .btn-danger, .modal .btn-primary'); page.wait_for_timeout(300)
    check('T-064', 'conferma → sim abbandonata, Micro avviata', page.evaluate("() => App.store.sim() === null") and page.is_visible('#view-session'))
    page.click('#s-quit'); page.wait_for_timeout(100); page.click('.modal .btn-primary'); page.wait_for_timeout(200)
    # T-065: Ripasso con sessione in pausa
    page.evaluate("""() => { const q = App.banks.get('verbale').questions.find(x => x.format === 'epso4'); const l = App.store.log(); l.push({ t: new Date(Date.now() - 86400000).toISOString(), mode: 'micro', session: 'x', bank: 'verbale', id: q.id, sel: 'A', ok: false, sec: 20, conf: null, tag: q.tag, level: q.level, format: q.format }); localStorage.setItem('eps2.log', JSON.stringify(l)); window.dispatchEvent(new StorageEvent('storage', { key: 'eps2.log' })); App.main.home(); }""")
    page.wait_for_timeout(200)
    check('T-065', 'Ripasso visibile con sessione in pausa', page.is_visible('#btn-review') and 'Riprendi' in page.text_content('#btn-next'))
    page.click('#btn-review'); page.wait_for_timeout(150)
    check('T-065', 'Ripasso con sessione in pausa → modale, sessione conservata', page.is_visible('.modal') and page.evaluate("() => App.store.current() !== null"))
    page.click('.modal .btn-ghost'); page.wait_for_timeout(100)
    ctx.close()

    # ── T-067 / T-082 tempo per item in simulazione: segnalibro, overview, background, ricarica ──
    ctx, page = fresh(browser)
    page.click('#btn-sim'); page.wait_for_timeout(100); start_sim(page, 'verbale', 'section')
    page.clock.run_for(30000); page.click('#tao-bookmark'); page.wait_for_timeout(50)
    page.clock.run_for(10000); page.click('#tao-overview-btn'); page.wait_for_timeout(50)
    page.clock.run_for(20000); page.click('#tao-overview-close'); page.wait_for_timeout(50)
    page.clock.run_for(5000)
    page.evaluate("() => Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })"); page.evaluate("() => document.dispatchEvent(new Event('visibilitychange'))")
    page.clock.run_for(60000)
    stored_hidden = page.evaluate("() => Object.values(App.store.sim().sections[0].time)[0]")
    page.evaluate("() => Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })"); page.evaluate("() => document.dispatchEvent(new Event('visibilitychange'))")
    page.clock.run_for(5000); page.click('#tao-next'); page.wait_for_timeout(100)
    t1 = page.evaluate("() => Object.values(App.store.sim().sections[0].time)[0]")
    check('T-067', 'segnalibro, overview e background non alterano il tempo dell\'item (30+10+5+5 = 50 s)', 49 <= t1 <= 51.5 and 44 <= stored_hidden <= 46.5, f'{t1:.1f} (salvato in background: {stored_hidden:.1f})')
    bm = page.evaluate("() => Object.keys(App.store.sim().sections[0].bookmarks).length")
    check('T-067', 'segnalibro registrato', bm == 1, bm)
    ctx.close()

    # ── T-068 evidenziatore: unione, click rimuove, persistenza ──
    ctx, page = fresh(browser)
    page.click('#btn-sim'); page.wait_for_timeout(100); start_sim(page, 'verbale', 'section')
    page.click('#tao-highlight')
    def hl_select(a, b):  # seleziona per offset globali nel testo del brano (come li salva l'app)
        page.evaluate(f"""() => {{ const root = document.getElementById('tao-passage'); const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let pos = 0, n, sN, sO, eN, eO;
          while ((n = walker.nextNode())) {{ const len = n.nodeValue.length; if (sN == null && {a} < pos + len) {{ sN = n; sO = {a} - pos; }} if (eN == null && {b} <= pos + len) {{ eN = n; eO = {b} - pos; break; }} pos += len; }}
          const r = document.createRange(); r.setStart(sN, sO); r.setEnd(eN, eO); const s = getSelection(); s.removeAllRanges(); s.addRange(r); root.dispatchEvent(new MouseEvent('mouseup', {{ bubbles: true }})); }}""")
        page.wait_for_timeout(50)
    hl_select(3, 18)
    h1 = page.evaluate("() => Object.values(App.store.sim().sections[0].hl)[0]")
    hl_select(10, 25)
    h2 = page.evaluate("() => Object.values(App.store.sim().sections[0].hl)[0]")
    check('T-068', 'selezione sovrapposta → unione [3,25]', h1 == [[3, 18]] and h2 == [[3, 25]], f'{h1} → {h2}')
    page.reload(); page.wait_for_timeout(300); page.click('#btn-next'); page.wait_for_timeout(300)
    marks = page.evaluate("() => document.querySelectorAll('#tao-passage mark.tao-hl').length")
    check('T-068', 'evidenziazione ripristinata dopo ricarica', marks >= 1, marks)
    page.clock.run_for(1000)
    page.evaluate("() => document.querySelector('#tao-passage mark.tao-hl').dispatchEvent(new MouseEvent('click', { bubbles: true }))"); page.wait_for_timeout(50)
    h3 = page.evaluate("() => Object.values(App.store.sim().sections[0].hl)[0]")
    check('T-068', 'click sulla marca la toglie', h3 == [] and page.evaluate("() => document.querySelectorAll('#tao-passage mark.tao-hl').length") == 0, h3)
    # T-083 overview: fuoco e Escape
    page.click('#tao-overview-btn'); page.wait_for_timeout(100)
    foc = page.evaluate("() => document.activeElement.id")
    page.keyboard.press('Escape'); page.wait_for_timeout(100)
    check('T-083', 'overview: fuoco su ✕, Escape chiude e torna al pulsante', foc == 'tao-overview-close' and page.evaluate("() => document.getElementById('tao-overview').hidden") and page.evaluate("() => document.activeElement.id") == 'tao-overview-btn', foc)
    # T-069 modificatori in sim
    page.keyboard.press('Control+C'); page.keyboard.press('Control+A'); page.wait_for_timeout(50)
    check('T-069', 'Ctrl+C / Ctrl+A non rispondono in simulazione', page.evaluate("() => Object.keys(App.store.sim().sections[0].answers).length") == 0)
    # T-084 ArrowRight con fuoco su un radio non cambia la risposta
    page.keyboard.press('B'); page.wait_for_timeout(50); page.focus('#tao-options input:checked'); page.keyboard.press('ArrowRight'); page.wait_for_timeout(100)
    st = page.evaluate("() => ({pos: App.store.sim().pos, ans: Object.values(App.store.sim().sections[0].answers)})")
    check('T-069', 'ArrowRight con fuoco sul radio: avanti senza cambiare la risposta', st['pos'] == 1 and st['ans'] == ['B'], json.dumps(st))
    # T-085 z-index limitato
    for i in range(40): page.click('#tao-calc'); page.click('#tao-pad')
    zz = page.evaluate("() => [document.getElementById('tao-calc-widget').style.zIndex, document.getElementById('tao-pad-widget').style.zIndex].map(Number)")
    check('T-085', 'z-index dei widget resta ≤ 42 dopo 80 aperture', max(zz) <= 42, zz)
    page.click('#tao-calc'); page.click('#tao-pad')
    # T-083 modale: fuoco ripristinato
    page.click('#tao-overview-btn'); page.wait_for_timeout(50); page.click('#tao-submit'); page.wait_for_timeout(100); page.keyboard.press('Escape'); page.wait_for_timeout(100)
    check('T-083', 'dopo la modale il fuoco torna a «Submit»', page.evaluate("() => document.activeElement.id") == 'tao-submit', page.evaluate("() => document.activeElement.id"))
    ctx.close()

    # ── T-069 / T-070 tastiera in sessione ──
    ctx, page = fresh(browser)
    page.evaluate("() => App.session.start('train', App.select.pickTraining('verbale', 10))"); page.wait_for_timeout(150)
    page.keyboard.press('Control+C'); page.wait_for_timeout(50)
    check('T-069', 'Ctrl+C non sceglie C in sessione', page.evaluate("() => App.store.current().selected") is None)
    page.keyboard.press('A'); page.focus('#s-doubt'); page.keyboard.press('Enter'); page.wait_for_timeout(150)
    check('T-070', 'Invio su «Dubbio» registra doubt', page.evaluate("() => App.store.current().answers[0].conf") == 'doubt', page.evaluate("() => App.store.current().answers[0].conf"))
    page.keyboard.press('Enter'); page.wait_for_timeout(150)  # fuoco su «Prossima» → avanti
    page.keyboard.press('B'); page.focus('#s-quit'); page.keyboard.press('Enter'); page.wait_for_timeout(150)
    check('T-070', 'Invio su «Esci» apre «Interrompere?» senza rispondere', page.is_visible('.modal') and page.evaluate("() => App.store.current().phase") == 'answer' and page.text_content('#s-counter').strip() == '2 / 10', page.text_content('#s-counter'))
    page.keyboard.press('Escape'); page.wait_for_timeout(100)
    # T-086 ripresa in feedback mostra il tempo
    page.clock.run_for(7000); page.keyboard.press('Enter'); page.wait_for_timeout(100)
    page.reload(); page.wait_for_timeout(300); page.click('#btn-next'); page.wait_for_timeout(300)
    check('T-086', 'ripresa in feedback: tempo dell\'item mostrato (7″)', page.text_content('#s-time').strip() == '7″', page.text_content('#s-time'))
    ctx.close()

    # ── T-071 sim notturna a cavallo della mezzanotte: ripresa, non chiusa ──
    ctx, page = fresh(browser, time='2026-10-10T23:50:00+02:00')
    page.click('#btn-sim'); page.wait_for_timeout(100); start_sim(page, 'verbale', 'section')
    for i in range(5): page.click('#tao-options .tao-opt >> nth=0'); page.click('#tao-next'); page.wait_for_timeout(40)
    page.clock.run_for(15 * 60000)  # 00:05
    page.reload(); page.wait_for_timeout(400)
    st = page.evaluate("() => ({sim: App.store.sim() && App.store.sim().phase, btn: document.getElementById('btn-next').textContent, answers: App.store.sim() ? Object.keys(App.store.sim().sections[0].answers).length : 0})")
    check('T-071', 'alle 00:05 la sim delle 23:50 è ancora in corso (deadline 00:25)', st['sim'] == 'running' and 'Riprendi la simulazione' in st['btn'] and st['answers'] == 5, json.dumps(st))
    page.clock.run_for(7 * 3600000)  # 07:05: scaduta da oltre 6 h
    page.reload(); page.wait_for_timeout(400)
    check('T-071', 'sim ferma da 7 ore oltre la scadenza → chiusa senza conteggio', page.evaluate("() => App.store.sim()") is None and page.evaluate("() => App.store.log().length") == 0)
    ctx.close()

    # ── T-072 bianche: non trappole nel riepilogo settimana né nel Flex ──
    ctx, page = fresh(browser, time='2026-10-16T10:00:00+02:00')  # venerdì (Flex)
    page.evaluate("""() => {
      const vs = App.banks.get('verbale').questions.filter(x => x.format === 'epso4').slice(0, 20);
      const ns = App.banks.get('numerico').questions.filter(x => x.format === 'num5').slice(0, 10);
      const t = new Date(Date.now() - 86400000).toISOString();
      App.store.addLogMany([
        ...vs.map(q => ({ t, mode: 'sim', session: 's1', bank: 'verbale', id: q.id, sel: null, ok: false, sec: 0, conf: null, tag: q.tag, level: q.level, format: q.format, unanswered: true })),
        ...ns.map((q, i) => ({ t, mode: 'sim', session: 's1', bank: 'numerico', id: q.id, sel: 'A', ok: i < 4, sec: 60, conf: null, tag: q.tag, level: q.level, format: q.format, unanswered: false })),
      ]);
    }""")
    summ = page.evaluate("() => App.stato.weekSummary()")
    weak = page.evaluate("() => App.plan.weakestBank()")
    trap_line = [l for l in summ.split('\n') if l.startswith('Trappole')][0]
    check('T-072', 'riepilogo settimana: le 20 bianche sono «Tempo scaduto», non trappole', 'Tempo scaduto ×20' in trap_line and trap_line.count('×') <= 4 and 'Parafrasi' not in trap_line and 'Inferenza' not in trap_line, trap_line)
    check('T-072', 'Flex: il verbale in bianco non conta come 20 errori; vince il numerico (6/10 errori)', weak['bank'] == 'numerico' and weak['counts']['verbale']['n'] == 0, json.dumps(weak))
    ctx.close()

    # ── T-073 / T-074 chiavi corrotte ──
    ctx, page = fresh(browser)
    page.evaluate("() => { localStorage.setItem('eps2.current', '{}'); localStorage.setItem('eps2.sim', JSON.stringify({phase: 'running'})); localStorage.setItem('eps2.log', '[{\"t\":'); }")
    page.reload(); page.wait_for_timeout(500)
    st = page.evaluate("() => ({home: !document.getElementById('view-home').hidden, title: document.getElementById('next-title').textContent, cur: localStorage.getItem('eps2.current'), sim: localStorage.getItem('eps2.sim'), logCorrupt: localStorage.getItem('eps2.log.corrupt'), curCorrupt: localStorage.getItem('eps2.current.corrupt'), toast: document.getElementById('toast').textContent})")
    check('T-073', 'eps2.current/sim malformate → home visibile, chiavi scartate con copia', st['home'] and st['title'] not in ('…', '') and st['cur'] in (None, 'null') and st['sim'] in (None, 'null') and st['curCorrupt'] == '{}', json.dumps(st)[:200])
    check('T-074', 'registro illeggibile → copia in eps2.log.corrupt e avviso', st['logCorrupt'] == '[{"t":' and 'illeggibili' in st['toast'], st['toast'])
    check('T-074', 'nessun errore di pagina con chiavi corrotte', not [e for e in errors if 'TypeError' in e], ' | '.join(errors)[:200])
    ctx.close()

    # ── T-075 due schede ──
    ctx = browser.new_context(viewport={'width': 1280, 'height': 800}, timezone_id='Europe/Rome')
    p1, p2 = new_page(ctx), new_page(ctx)
    p1.goto(URL); p2.goto(URL); p1.wait_for_timeout(300); p2.wait_for_timeout(300)
    p1.evaluate("() => App.session.start('train', App.select.pickTraining('verbale', 5))"); p1.wait_for_timeout(100)
    for i in range(2): p1.click('#s-options .opt >> nth=0'); p1.click('#s-sure'); p1.wait_for_timeout(60); p1.click('#s-next'); p1.wait_for_timeout(60)
    p2.wait_for_timeout(200)
    p2.evaluate("() => { App.store.setCurrent(null); App.session.start('train', App.select.pickTraining('numerico', 3)); }"); p2.wait_for_timeout(100)
    p2.click('#s-options .opt >> nth=0'); p2.click('#s-sure'); p2.wait_for_timeout(100)
    n = p2.evaluate("() => JSON.parse(localStorage.getItem('eps2.log')).length")
    check('T-075', 'due schede: nessuna voce persa (2 + 1 = 3)', n == 3, n)
    ctx.close()

    # ── T-078 import malformato → errore leggibile, zero scritture ──
    ctx, page = fresh(browser)
    res = page.evaluate("""() => {
      const before = JSON.stringify([localStorage.getItem('eps2.log'), localStorage.getItem('eps2.settings')]);
      const msgs = [];
      for (const bad of ['{"log":[null]}', '{"log":[{"mode":"micro","bank":"verbale","id":1001}]}', '{"log":[],"settings":"abc"}', 'nope']) {
        try { App.store.importAll(bad); msgs.push('ACCETTATO'); } catch (e) { msgs.push(e.message); }
      }
      return { msgs, same: before === JSON.stringify([localStorage.getItem('eps2.log'), localStorage.getItem('eps2.settings')]), version: JSON.parse(App.store.exportAll()).version };
    }""")
    check('T-078', 'import malformato rifiutato con messaggio, nessuna scrittura, export con version', 'ACCETTATO' not in res['msgs'] and res['same'] and res['version'] == 2 and all('Cannot read' not in m for m in res['msgs']), json.dumps(res, ensure_ascii=False)[:300])
    ctx.close()

    # ── T-080 / T-081 esterna: banca prevista e data ──
    ctx, page = fresh(browser, time='2026-10-17T10:00:00+02:00')  # sabato (sim)
    page.click('#btn-external'); page.wait_for_timeout(150)
    dv = page.evaluate("() => document.getElementById('ext-date').value")
    check('T-081', 'campo data presente, default oggi', dv == '2026-10-17', dv)
    page.fill('#ext-date', '2026-10-16'); page.select_option('#ext-bank', 'astratto'); page.fill('#ext-score', '7'); page.fill('#ext-max', '10'); page.click('#ext-form button[type=submit]'); page.wait_for_timeout(200)
    sess = page.evaluate("() => App.store.sessions()")
    check('T-081', 'esterna di ieri datata ieri', sess and sess[-1]['t'].startswith('2026-10-16'), sess[-1]['t'] if sess else None)
    check('T-080', 'sabato: astratto esterno non vale come simulazione → non «Fatto»', 'Fatto' not in page.text_content('#next-title') and 'Simulazione' in page.text_content('#next-title'), page.text_content('#next-title'))
    page.click('#btn-external'); page.wait_for_timeout(100); page.select_option('#ext-bank', 'sim'); page.fill('#ext-score', '20'); page.fill('#ext-max', '40'); page.click('#ext-form button[type=submit]'); page.wait_for_timeout(200)
    check('T-080', 'sabato: simulazione completa esterna → «Fatto per oggi»', 'Fatto' in page.text_content('#next-title'), page.text_content('#next-title'))
    ctx.close()

    # ── T-084 schermo esterno del Fold (475 px): uscita visibile e focusabile ──
    ctx, page = fresh(browser, viewport=(475, 750))
    page.click('#btn-sim'); page.wait_for_timeout(100); start_sim(page, 'verbale', 'section')
    st = page.evaluate("() => { const l = document.getElementById('tao-logo'); const r = l.getBoundingClientRect(); return { tag: l.tagName, visible: r.width > 0 && r.height >= 44, focusable: l.tabIndex >= 0, exitHidden: getComputedStyle(document.getElementById('tao-exit')).display === 'none' }; }")
    check('T-084', 'a 475 px il logo è un pulsante di uscita ≥ 44 px, focusabile', st['tag'] == 'BUTTON' and st['visible'] and st['focusable'], json.dumps(st))
    page.click('#tao-logo'); page.wait_for_timeout(100)
    check('T-084', 'tocco sul logo → conferma di abbandono', page.is_visible('.modal') and 'Abbandonare' in page.text_content('.modal'))
    ctx.close()

    # ── T-090 risultati: copy del numerico ──
    ctx, page = fresh(browser)
    page.click('#btn-sim'); page.wait_for_timeout(100); start_sim(page, 'numerico', 'section')
    page.evaluate("() => { const s = App.store.sim(); s.deadline = Date.now() - 1; App.store.setSim(s); }"); page.reload(); page.wait_for_timeout(300); page.click('#btn-next'); page.wait_for_timeout(400)
    note = page.text_content('#sim-scores .num-note')
    check('T-090', 'numerico: «obiettivo 6/10 · soglia combinata» (non «soglia 6/10»)', 'obiettivo 6/10' in note and 'soglia combinata' in note and 'soglia 6/10' not in note, note)
    ctx.close()

    # ── T-077 / T-061 service worker su localhost: 404 non in cache, cache con il nome della versione ──
    ctx = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = new_page(ctx)
    page.goto(URL_LOCALHOST); page.wait_for_timeout(500)
    n_err = len(errors)
    try:
        page.evaluate("() => navigator.serviceWorker.ready.then(() => new Promise(r => setTimeout(r, 300)))")
        page.evaluate("() => fetch('js/non-esiste.js').then(r => r.status)")
        page.wait_for_timeout(300)
        st = page.evaluate("() => caches.keys().then(async (keys) => { const c = await caches.open(keys[0]); const miss = await c.match('js/non-esiste.js'); return { keys, miss: Boolean(miss), ok: Boolean(await c.match('./js/main.js')) || Boolean(await c.match('js/main.js')) }; })")
        check('T-077', 'service worker: 404 non in cache, asset validi sì', st['keys'] == [f'euprep-{v_main}'] and not st['miss'] and st['ok'], json.dumps(st))
    except Exception as ex:
        check('T-077', 'service worker testabile su localhost', False, str(ex)[:200])
    # il 404 provocato di proposito non è un errore dell'app
    del errors[n_err:]
    ctx.close()
    browser.close()

httpd.shutdown()
check('ALL', 'zero errori console/page', len(errors) == 0, ' | '.join(errors)[:500])
fails = [c for c in checks if not c[2]]
print(f'\n{len(checks) - len(fails)}/{len(checks)} PASS')
sys.exit(1 if fails else 0)
