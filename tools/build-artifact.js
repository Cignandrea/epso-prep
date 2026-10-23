// Prepara la versione da pubblicare come artifact su claude.ai in dist/artifact/.
// Uso: node tools/build-artifact.js
// Differenze rispetto a GitHub Pages: niente involucro <html>/<head>/<body> (lo aggiunge la piattaforma),
// niente CSP propria (la imposta la piattaforma e bloccherebbe il runtime dei dati), niente manifest,
// service worker e icone (l'artifact ha i suoi). Stessi file JS e CSS, nessuna copia divergente.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist', 'artifact');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const title = (html.match(/<title>[\s\S]*?<\/title>/) || ['<title>EU Prep Suite</title>'])[0];
const desc = (html.match(/<meta name="description"[^>]*>/) || [''])[0];
const body = html.slice(html.indexOf('<body>') + '<body>'.length, html.lastIndexOf('</body>'));
const page = [
  title,
  desc,
  '<meta name="color-scheme" content="light dark">',
  '<link rel="stylesheet" href="css/style.css">',
  body.trim(),
  '',
].join('\n');
fs.writeFileSync(path.join(OUT, 'index.html'), page);

const files = {};
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
for (const rel of ['css/style.css', ...scripts]) {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) { console.error(`manca ${rel}`); process.exit(1); }
  const dst = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  files[rel] = path.relative(process.cwd(), dst);
}
fs.writeFileSync(path.join(OUT, 'files.json'), JSON.stringify(files, null, 1));
const size = Object.values(files).reduce((s, f) => s + fs.statSync(path.join(process.cwd(), f)).size, 0) + Buffer.byteLength(page);
console.log(`OK: dist/artifact/index.html + ${Object.keys(files).length} file (${(size / 1024).toFixed(0)} KB)`);
