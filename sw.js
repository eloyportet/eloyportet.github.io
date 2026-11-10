/* Service worker — offline support for eloy.portet.org
   Bump VERSION whenever any site file changes (see README.md, "Versionner le cache"). */
const VERSION = 'v4';
const CACHE = 'eloy-' + VERSION;
const FONT_CACHE = 'eloy-fonts';

const PRECACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/eloy-portet.vcf',
  '/assets/eloy-avatar-336.jpg',
  '/assets/qr-vcard.svg',
  '/assets/qr-site.svg',
  '/assets/icons/icon-192.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Page: network first (fresh content), cached copy when offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          const path = new URL(req.url).pathname;
          if (res.ok && (path === '/' || path === '/index.html')) caches.open(CACHE).then((c) => c.put('/', copy));
          return res;
        })
        .catch(() => caches.match('/', { ignoreSearch: true }))
    );
    return;
  }

  // Fontshare CSS + font files: cache first, refreshed in background
  if (url.hostname.endsWith('fontshare.com')) {
    event.respondWith(staleWhileRevalidate(req, FONT_CACHE));
    return;
  }

  // Same-origin assets: serve from cache, refresh in background
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(req, CACHE));
  }
});

function staleWhileRevalidate(req, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(req, { ignoreSearch: req.url.startsWith(self.location.origin) }).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
}
