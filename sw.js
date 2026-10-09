// Service worker: cache dell'app per l'uso offline, versionata. Aggiornare CACHE a ogni rilascio.
const CACHE = 'euprep-v1.1.0';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/banks.js', './js/utils.js', './js/store.js', './js/ui.js', './js/plan.js', './js/select.js', './js/session.js', './js/calc.js', './js/sim.js', './js/stato.js', './js/main.js',
  './data/bank-verbale.js', './data/bank-numerico.js', './data/bank-euknowledge.js', './data/bank-digital.js',
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
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })));
});
