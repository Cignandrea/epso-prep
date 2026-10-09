"""Regressione dei ticket del round 2 Funzionale (F2-01…F2-13). Uso: python3 tests/regress3.py [porta]"""
import sys, os, json, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8786
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
T0 = '2026-10-12T10:00:00+02:00'  # lunedì
def fresh(browser, viewport=(1280, 800), time=T0, touch=False):
    ctx = browser.new_context(viewport={'width': viewport[0], 'height': viewport[1]}, timezone_id='Europe/Rome', has_touch=touch)
    page = new_page(ctx)
    page.clock.install(time=time); page.clock.pause_at(time)
    page.goto(URL); page.wait_for_timeout(300)
    return ctx, page
def start_sim(page, scope='full', timer='section'):
    page.click('#btn-sim'); page.wait_for_timeout(100)
    page.evaluate(f"() => {{ document.querySelector('input[name=sim-scope][value={scope}]').checked = true; document.querySelector('input[name=sim-timer][value={timer}]').checked = true; }}")
    page.click('#sim-start'); page.wait_for_timeout(200); page.click('#tao-intro-start'); page.wait_for_timeout(200)
def bubbles(page): return page.evaluate("() => [...document.querySelectorAll('#tao-bubbles .tao-bubble')].map(b => b.textContent)")

with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # ── F2-01 «…» sposta la finestra delle bolle dall'item 1 ──
    ctx, page = fresh(browser)
    start_sim(page, 'verbale')
    b0 = bubbles(page)
    page.click('#tao-bubbles .tao-ellipsis'); page.wait_for_timeout(50)
    b1 = bubbles(page)
    check('F2-01', '«…» dall\'item 1 mostra le bolle successive senza cambiare item', b0[0] == '1' and b1[0] != '1' and '20' in b1 and page.evaluate("() => App.store.sim().pos") == 0, f'{b0[:3]}… → {b1[:3]}…')
    page.click('#tao-bubbles .tao-bubble >> nth=-1'); page.wait_for_timeout(50)
    check('F2-01', 'bolla 20 raggiungibile', page.evaluate("() => App.store.sim().pos") == 19)
    ctx.close()
    ctx, page = fresh(browser, viewport=(475, 750), touch=True)
    start_sim(page, 'verbale')
    page.click('#tao-overview-btn'); page.wait_for_timeout(50)
    close_w = page.evaluate("() => document.getElementById('tao-overview-close').getBoundingClientRect().width")
    page.keyboard.press('Escape'); page.wait_for_timeout(50)
    st = page.evaluate("() => { const box = document.getElementById('tao-bubbles').getBoundingClientRect(); const els = [...document.querySelectorAll('#tao-bubbles button')].map(b => b.getBoundingClientRect()); const bub = document.querySelector('#tao-bubbles .tao-bubble').getBoundingClientRect(); return { inside: els.every(r => r.left >= box.left - 1 && r.right <= box.right + 1), n: els.length, bubble: [Math.round(bub.width), Math.round(bub.height)], bm: document.getElementById('tao-bookmark').getBoundingClientRect().height, align: getComputedStyle(document.getElementById('tao-passage')).textAlign, inert: getComputedStyle(document.querySelector('.tao-tool-inert')).display, crumbs: (() => { const c = document.querySelector('.tao-crumbs'); return c.scrollWidth <= c.clientWidth + 1; })() }; }")
    st['close'] = close_w
    check('F2-01', 'a 475 px le bolle e «…» stanno nel contenitore', st['inside'], json.dumps(st))
    check('F2-07', 'a 475 px: bolle 44×44, ✕ 44, segnalibro 44, testo a sinistra, strumenti inerti nascosti, breadcrumb intero', st['bubble'] == [44, 44] and st['close'] >= 44 and st['bm'] >= 44 and st['align'] == 'left' and st['inert'] == 'none' and st['crumbs'], json.dumps(st))
    # F2-08: sotto 600 px un widget per volta, sopra il footer
    page.click('#tao-calc'); page.click('#tao-pad'); page.wait_for_timeout(50)
    st = page.evaluate("() => { const c = document.getElementById('tao-calc-widget'), p = document.getElementById('tao-pad-widget'); const f = document.querySelector('.tao-footer').getBoundingClientRect(); return { calcHidden: c.hidden, padHidden: p.hidden, padBottom: p.getBoundingClientRect().bottom, footerTop: f.top }; }")
    check('F2-08', 'sotto 600 px: aprire gli appunti chiude la calcolatrice; il widget resta sopra il footer', st['calcHidden'] and not st['padHidden'] and st['padBottom'] <= st['footerTop'] + 1, json.dumps(st))
    ctx.close()

    # ── F2-02 sim stantia: sessioni datate alla consegna ──
    ctx, page = fresh(browser, time='2026-10-10T10:00:00+02:00')  # sabato
    start_sim(page, 'full', 'section')
    page.click('#tao-options .tao-opt >> nth=0'); page.clock.run_for(20 * 60000)
    page.click('#tao-overview-btn'); page.wait_for_timeout(50); page.click('#tao-submit'); page.wait_for_timeout(100); page.click('.modal .btn-primary'); page.wait_for_timeout(200)
    check('F2-02', 'verbale consegnato alle 10:20, intro del numerico', page.evaluate("() => App.store.sim().phase") == 'intro')
    page.clock.run_for(47 * 3600000)  # lunedì 09:20
    page.reload(); page.wait_for_timeout(500)
    st = page.evaluate("() => ({ sess: App.store.sessions().map(s => s.t), log: [...new Set(App.store.log().map(e => e.t))], title: document.getElementById('next-title').textContent, done: App.plan.today().done, active: App.plan.weekActivity().active })")
    check('F2-02', 'sim stantia: sessione e voci datate sabato 10:20; lunedì non è «Fatto», settimana 0', len(st['sess']) == 1 and st['sess'][0].startswith('2026-10-10T08:20') and st['log'] == ['2026-10-10T08:20:00.000Z'] and 'Rivedi' in st['title'] and not st['done'] and st['active'] == 0, json.dumps(st))
    page.click('#btn-next'); page.wait_for_timeout(200)
    check('F2-02', 'risultati con la sola sezione consegnata', page.evaluate("() => App.store.sim().sections.length") == 1 and 'interrotta' in page.text_content('#sim-sentence'))
    page.click('#sim-close'); page.wait_for_timeout(200)
    check('F2-02', 'dopo «Chiudi» lunedì propone Verbale', page.text_content('#next-title').strip() == 'Verbale', page.text_content('#next-title'))
    ctx.close()

    # ── F2-03 Invio dopo un click col mouse ──
    ctx, page = fresh(browser)
    page.evaluate("() => App.session.start('train', App.select.pickTraining('verbale', 10))"); page.wait_for_timeout(150)
    page.click('#s-options .opt >> nth=0'); page.keyboard.press('B'); page.keyboard.press('Enter'); page.wait_for_timeout(150)
    a = page.evaluate("() => App.store.current().answers[0]")
    check('F2-03', 'click A, tasto B, Invio → risposta B confermata (sure)', a and a['sel'] == 'B' and a['conf'] == 'sure' and page.is_visible('#s-feedback'), json.dumps(a))
    page.keyboard.press('Enter'); page.wait_for_timeout(100)
    page.click('#s-options .opt >> nth=2'); page.keyboard.press('Enter'); page.wait_for_timeout(150)
    a = page.evaluate("() => App.store.current().answers[1]")
    check('F2-03', 'click C, Invio → C confermata', a and a['sel'] == 'C', json.dumps(a))
    page.focus('#s-next'); page.keyboard.press('Enter'); page.wait_for_timeout(100)
    check('F2-03', 'Invio su «Prossima» avanza una sola volta', page.text_content('#s-counter').strip() == '3 / 10', page.text_content('#s-counter'))
    ctx.close()

    # ── F2-04 calcolatrice nell'allenamento numerico: barra di sessione libera ──
    for vp in [(1280, 800), (930, 700), (750, 475), (475, 750)]:
        ctx, page = fresh(browser, viewport=vp, touch=vp[0] < 1000)
        page.evaluate("() => App.session.start('train', App.select.pickTraining('numerico', 5))"); page.wait_for_timeout(150)
        page.click('#s-calc'); page.wait_for_timeout(100)
        st = page.evaluate("""() => { const w = document.getElementById('tao-calc-widget').getBoundingClientRect(); const ids = ['s-quit', 's-calc', 's-pad', 's-pace']; const free = {}; for (const id of ids) { const r = document.getElementById(id).getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); free[id] = Boolean(e && (e.id === id || e.closest('#' + id))); } const sure = document.getElementById('s-sure').getBoundingClientRect(); const eS = document.elementFromPoint(sure.left + sure.width / 2, sure.top + sure.height / 2); const p = document.getElementById('s-passage').getBoundingClientRect(); const overlapPassage = !(w.right <= p.left || p.right <= w.left || w.bottom <= p.top || p.bottom <= w.top); const col = document.getElementById('s-content'); const reachable = w.bottom <= window.innerHeight + 0.5 || (col.scrollHeight > col.clientHeight && col.getBoundingClientRect().bottom <= window.innerHeight + 0.5); return { free, sureFree: Boolean(eS && eS.closest('#s-sure')), inScreen: reachable && w.top >= 0, docked: document.getElementById('tao-calc-widget').dataset.docked === '1', overlapPassage, vp: [window.innerWidth, window.innerHeight] }; }""")
        wide = vp[0] >= 640 and vp[0] >= vp[1]  # due colonne: widget agganciato sotto la tabella, nulla coperto
        check('F2-04', f'{vp[0]}×{vp[1]}: calcolatrice aperta, Esci/strumenti/ritmo{"/Sicuro/tabella" if wide else ""} liberi e widget nello schermo', all(st['free'].values()) and (not wide or (st['sureFree'] and st['docked'] and not st['overlapPassage'])) and st['inScreen'], json.dumps(st))
        if wide:
            page.click('#s-calc'); page.wait_for_timeout(50)
            check('F2-04', f'{vp[0]}×{vp[1]}: chiusura → sganciato, dock vuoto', page.evaluate("() => document.getElementById('tao-calc-widget').parentNode.id === 'widgets' && document.getElementById('s-dock').hidden"))
        ctx.close()

    # ── F2-05 voci malformate nel registro/sessioni → home e Stato raggiungibili ──
    cases = {
        'log [null]': "localStorage.setItem('eps2.log','[null]')",
        'log t non valida': "localStorage.setItem('eps2.log', JSON.stringify([{t:'ieri',mode:'micro',bank:'verbale',id:1025,ok:false,tag:'scope'}]))",
        'log senza t': "localStorage.setItem('eps2.log', JSON.stringify([{mode:'micro',bank:'verbale',id:1025,ok:false,tag:'scope'}]))",
        'log oggetto': "localStorage.setItem('eps2.log','{\"a\":1}')",
        'sessions [null]': "localStorage.setItem('eps2.sessions','[null]')",
        'sessions banks stringa': "localStorage.setItem('eps2.sessions', JSON.stringify([{t:new Date().toISOString(),mode:'train',n:5,correct:2,banks:'verbale'}]))",
        'settings illeggibili': "localStorage.setItem('eps2.settings','}{')",
    }
    for name, js in cases.items():
        ctx, page = fresh(browser)
        n_err = len(errors)
        page.evaluate(f"() => {{ {js}; }}"); page.reload(); page.wait_for_timeout(500)
        toast0 = page.text_content('#toast')
        home_ok = page.evaluate("() => !document.getElementById('view-home').hidden && document.getElementById('next-title').textContent !== '…'")
        page.click('#nav-stato'); page.wait_for_timeout(300)
        stato_ok = page.is_visible('#view-stato') and page.is_visible('#st-reset')
        corrupt = page.evaluate("() => Object.keys(localStorage).filter(k => k.endsWith('.corrupt'))")
        normalized = name == 'sessions banks stringa'  # forma riparabile: si normalizza senza avviso
        check('F2-05', f'{name}: home e Stato raggiungibili, {"normalizzata" if normalized else "copia .corrupt e avviso"}, nessun errore', home_ok and stato_ok and (normalized or (corrupt and toast0)) and len(errors) == n_err and (not normalized or page.evaluate("() => App.store.sessions()[0].banks") == ['verbale']), f'toast={toast0[:60]!r} corrupt={corrupt} errs={errors[n_err:][:1]}')
        ctx.close()
    # sessione «buona» mista a voci cattive: le buone restano
    ctx, page = fresh(browser)
    page.evaluate("() => { const good = {t: new Date().toISOString(), mode:'train', banks:['verbale'], n:10, correct:7}; localStorage.setItem('eps2.sessions', JSON.stringify([null, good, 'x'])); }"); page.reload(); page.wait_for_timeout(400)
    check('F2-05', 'voci valide conservate accanto a quelle scartate', page.evaluate("() => App.store.sessions().length") == 1 and page.evaluate("() => App.plan.today().done"))
    ctx.close()

    # ── F2-06 stato in corso di forma valida ma incoerente → scartato ──
    ctx, page = fresh(browser)
    res = page.evaluate("""() => {
      const base = () => ({ id: 'a', mode: 'micro', bankLabel: '', extra: false, startedAt: new Date().toISOString(), items: [{bank:'verbale',id:1001},{bank:'verbale',id:1002}], index: 0, phase: 'answer', selected: null, elapsed: 0, answers: [] });
      const bad = [Object.assign(base(), { items: [] }), Object.assign(base(), { index: 7 }), Object.assign(base(), { answers: [null] }), Object.assign(base(), { phase: 'feedback' })];
      const out = [];
      for (const c of bad) { localStorage.setItem('eps2.current', JSON.stringify(c)); window.dispatchEvent(new StorageEvent('storage', { key: 'eps2.current' })); out.push(App.store.current() === null); }
      localStorage.setItem('eps2.current', JSON.stringify(base())); window.dispatchEvent(new StorageEvent('storage', { key: 'eps2.current' }));
      out.push(App.store.current() !== null);
      return out;
    }""")
    check('F2-06', 'current incoerente (items vuoto, index fuori, answers [null], feedback senza risposte) scartato; valido accettato', all(res), res)
    res = page.evaluate("""() => {
      const sec = () => ({ bank: 'verbale', name: 'Verbal', label: 'Verbal Reasoning', n: 2, minutes: 4, items: [{bank:'verbale',id:1001},{bank:'verbale',id:1002}], answers: {}, bookmarks: {}, time: {}, hl: {}, status: 'running' });
      const base = () => ({ id: 's', startedAt: new Date().toISOString(), scope: 'verbale', timerMode: 'section', sections: [sec()], units: [{ sections: [0], minutes: 4 }], unit: 0, pos: 0, phase: 'running', deadline: Date.now() + 60000 });
      const bad = [Object.assign(base(), { units: [] }), Object.assign(base(), { unit: 3 }), Object.assign(base(), { pos: 9 }), (() => { const b = base(); b.sections[0].items = []; return b; })(), Object.assign(base(), { deadline: null })];
      const out = [];
      for (const c of bad) { localStorage.setItem('eps2.sim', JSON.stringify(c)); window.dispatchEvent(new StorageEvent('storage', { key: 'eps2.sim' })); out.push(App.store.sim() === null); }
      localStorage.setItem('eps2.sim', JSON.stringify(base())); window.dispatchEvent(new StorageEvent('storage', { key: 'eps2.sim' }));
      out.push(App.store.sim() !== null);
      return out;
    }""")
    check('F2-06', 'sim incoerente (units vuoto, unit/pos fuori, sezione senza item, deadline mancante) scartata; valida accettata', all(res), res)
    ctx.close()

    # ── F2-09 stato dell'interfaccia azzerato tra simulazioni ──
    ctx, page = fresh(browser)
    start_sim(page, 'verbale')
    page.click('#tao-highlight'); page.click('#tao-overview-btn'); page.wait_for_timeout(50); page.click('.tao-tab[data-filter=bookmarked]'); page.keyboard.press('Escape'); page.wait_for_timeout(50)
    page.click('#tao-exit'); page.wait_for_timeout(100); page.click('.modal .btn-danger'); page.wait_for_timeout(200)
    start_sim(page, 'verbale')
    page.click('#tao-overview-btn'); page.wait_for_timeout(50)
    st = page.evaluate("() => ({ hl: document.getElementById('tao-highlight').getAttribute('aria-pressed'), mode: document.getElementById('tao-passage').classList.contains('hl-mode'), filter: document.querySelector('.tao-tab.active').dataset.filter })")
    check('F2-09', 'nuova sim: evidenziatore spento e overview su «All Questions»', st['hl'] == 'false' and not st['mode'] and st['filter'] == 'all', json.dumps(st))
    ctx.close()

    # ── F2-10 pausa dopo mezzanotte ──
    ctx, page = fresh(browser, time='2026-10-12T23:55:00+02:00')
    page.evaluate("() => App.session.start('micro', App.select.pickMicro(3))"); page.wait_for_timeout(150)
    page.click('#s-options .opt >> nth=0'); page.click('#s-sure'); page.wait_for_timeout(80); page.click('#s-next'); page.wait_for_timeout(80)
    page.clock.run_for(10 * 60000)  # 00:05
    page.click('#s-quit'); page.wait_for_timeout(100); page.click('.modal .btn-primary'); page.wait_for_timeout(200)
    check('F2-10', 'pausa alle 00:05 di una Micro iniziata alle 23:55 → «Riprendi», nessuna parziale', 'Riprendi' in page.text_content('#btn-next') and page.evaluate("() => App.store.sessions().length") == 0, page.text_content('#btn-next'))
    page.clock.run_for(4 * 3600000)  # 04:05: oltre 3 ore
    page.evaluate("() => App.main.home()"); page.wait_for_timeout(100)
    check('F2-10', 'dopo 4 ore e giorno diverso → chiusa come parziale datata al giorno prima', 'Riprendi' not in page.text_content('#btn-next') and page.evaluate("() => App.store.sessions().length") == 1 and page.evaluate("() => App.store.sessions()[0].t").startswith('2026-10-12T21:55'))
    ctx.close()

    # ── F2-11 esito del feedback non coperto dalla topbar (750×475) ──
    ctx, page = fresh(browser, viewport=(750, 475), touch=True)
    page.evaluate("() => App.session.start('train', App.select.pickTraining('verbale', 5))"); page.wait_for_timeout(150)
    page.click('#s-options .opt >> nth=0'); page.click('#s-sure'); page.wait_for_timeout(200)
    st = page.evaluate("() => ({ head: document.getElementById('s-fb-head').getBoundingClientRect().top, bar: document.getElementById('topbar').getBoundingClientRect().bottom, home: document.getElementById('btn-home').getBoundingClientRect().height })")
    check('F2-11', '750×475: riga dell\'esito sotto la topbar; «EU Prep» ≥ 44 px', st['head'] >= st['bar'] - 0.5 and st['home'] >= 44, json.dumps(st))
    ctx.close()

    # ── F2-12 più chiavi corrotte → tutti gli avvisi leggibili ──
    ctx, page = fresh(browser)
    page.evaluate("() => { localStorage.setItem('eps2.current', '{}'); localStorage.setItem('eps2.sim', JSON.stringify({phase: 'running'})); localStorage.setItem('eps2.log', '[{\"t\":'); localStorage.setItem('eps2.settings', '}{'); }")
    page.reload(); page.wait_for_timeout(500)
    toast = page.text_content('#toast')
    check('F2-12', 'quattro chiavi corrotte → un avviso per chiave, insieme nel toast', all(k in toast for k in ['current', 'sim', 'log', 'settings']), toast.replace('\n', ' | ')[:200])
    ctx.close()

    # ── F2-13 esterna: messaggio per data troppo vecchia; sessioni in ordine cronologico ──
    ctx, page = fresh(browser, time='2026-10-13T10:00:00+02:00')
    page.click('#btn-external'); page.wait_for_timeout(100)
    page.evaluate("() => { const d = document.getElementById('ext-date'); d.min = ''; d.value = '2024-01-05'; }")
    page.select_option('#ext-bank', 'verbale'); page.fill('#ext-score', '5'); page.fill('#ext-max', '10'); page.click('#ext-form button[type=submit]'); page.wait_for_timeout(150)
    check('F2-13', 'data del 2024 → messaggio «troppo vecchia»', 'troppo vecchia' in page.text_content('#toast') and page.evaluate("() => App.store.sessions().length") == 0, page.text_content('#toast'))
    page.fill('#ext-date', '2026-10-13'); page.click('#ext-form button[type=submit]'); page.wait_for_timeout(150)
    page.click('#btn-external'); page.wait_for_timeout(100); page.fill('#ext-date', '2026-10-12'); page.select_option('#ext-bank', 'numerico'); page.fill('#ext-score', '6'); page.fill('#ext-max', '10'); page.click('#ext-form button[type=submit]'); page.wait_for_timeout(150)
    page.click('#nav-stato'); page.wait_for_timeout(200)
    rows = page.evaluate("() => [...document.querySelectorAll('#stato-sessions .session-when')].map(e => e.textContent.slice(0, 5))")
    check('F2-13', 'esterna retrodatata sotto quella di oggi (ordine cronologico, più recente in alto)', rows == ['13/10', '12/10'], rows)
    ctx.close()
    browser.close()

httpd.shutdown()
check('ALL', 'zero errori console/page', len(errors) == 0, ' | '.join(errors)[:500])
fails = [c for c in checks if not c[2]]
print(f'\n{len(checks) - len(fails)}/{len(checks)} PASS')
sys.exit(1 if fails else 0)
