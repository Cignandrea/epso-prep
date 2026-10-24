"""Nuova versione dell'app in un colpo solo: VERSION in js/main.js e sw.js, e ?v=VERSION su CSS e script in index.html.
Il ?v= evita che un HTML nuovo carichi CSS e script vecchi dalla cache del service worker precedente (bug del 24/10).
Uso: python3 tools/bump.py 1.2.0-b10"""
import re, sys, pathlib
v = sys.argv[1]
root = pathlib.Path(__file__).resolve().parent.parent
for f in ['js/main.js', 'sw.js']:
    p = root / f; s = p.read_text()
    s, n = re.subn(r"const VERSION = '[^']+';", f"const VERSION = '{v}';", s, count=1); assert n == 1, f
    p.write_text(s)
p = root / 'index.html'; s = p.read_text()
s = re.sub(r'(href="css/style\.css)(\?v=[^"]*)?"', rf'\1?v={v}"', s)
s = re.sub(r'(src="(?:js|data)/[\w-]+\.js)(\?v=[^"]*)?"', rf'\1?v={v}"', s)
p.write_text(s)
print('versione', v)
