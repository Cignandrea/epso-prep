// Service worker: cache dell'app per l'uso offline, versionata.
// VERSION deve coincidere con App.main.VERSION (js/main.js): è il nome della cache, quindi ogni build
// invalida la precedente (T-061). Il controllo è in tests/smoke.py.
const VERSION = '1.1.0-b5';
const CACHE = `euprep-${VERSION}`;
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/banks.js', './js/utils.js', './js/store.js', './js/ui.js', './js/plan.js', './js/select.js', './js/session.js', './js/calc.js', './js/sim.js', './js/stato.js', './js/main.js',
  './data/bank-verbale.js', './data/bank-numerico.js',
  './icons/favicon-64.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
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
