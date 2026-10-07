// Static Recorder service worker: keeps the app working offline once loaded.
// Registered only when hosted over http(s); file:// pages skip service workers.
// Network-first for same-origin files so updates ship immediately; the cache
// is the offline fallback. Whisper/LLM model weights are cached transparently
// by the browser's HTTP cache after first use.
const CACHE = 'static-recorder-v3';
const SHELL = [
  './',
  './index.html',
  './coi-serviceworker.js',
  './manifest.webmanifest',
  './icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin) return; // model/cdn fetches use the browser cache

  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then(cached => cached || caches.match('./index.html')))
  );
});
