// Service worker: cache dell'app per l'uso offline, versionata.
// VERSION deve coincidere con App.main.VERSION (js/main.js): è il nome della cache, quindi ogni build
// invalida la precedente (T-061). Il controllo è in tests/smoke.py.
const VERSION = '1.2.0-b10';
const CACHE = `euprep-${VERSION}`;
// CSS e script con ?v=VERSION, come in index.html: un HTML nuovo non pesca mai file vecchi dalla cache (tools/bump.py).
const V = (u) => `${u}?v=${VERSION}`;
const ASSETS = [
  './', './index.html', './manifest.webmanifest', V('./css/style.css'),
  ...['banks', 'gen-numerico', 'gen-astratto', 'gen-astratto2', 'utils', 'store', 'ui', 'plan', 'ready', 'select', 'lessons', 'path', 'session', 'calc', 'sim', 'stato', 'sync', 'main'].map((n) => V(`./js/${n}.js`)),
  ...['bank-verbale', 'bank-verbale-l2', 'bank-numerico'].map((n) => V(`./data/${n}.js`)),
  './fonts/ibm-plex-sans-latin-400-normal.woff2', './fonts/ibm-plex-sans-latin-500-normal.woff2', './fonts/ibm-plex-sans-latin-600-normal.woff2', './fonts/ibm-plex-sans-latin-700-normal.woff2',
  './fonts/ibm-plex-mono-latin-400-normal.woff2', './fonts/ibm-plex-mono-latin-500-normal.woff2', './fonts/ibm-plex-mono-latin-600-normal.woff2',
  './fonts/ibm-plex-serif-latin-400-normal.woff2', './fonts/ibm-plex-serif-latin-400-italic.woff2', './fonts/ibm-plex-serif-latin-600-normal.woff2',
  './icons/favicon-64.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
];
// cache: 'reload' scavalca la cache HTTP del browser: la nuova versione non si porta dietro file vecchi di qualche minuto.
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
// Rete prima per l'HTML (per prendere subito gli aggiornamenti), cache prima per il resto.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === 'navigate' || url.pathname.endsWith('index.html')) {
    e.respondWith(fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))));
    return;
  }
  // Solo risposte buone finiscono in cache: un 404 o un 5xx si ritenta dalla rete la volta dopo (T-077).
  e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })));
});
