// Static Recorder service worker: cache the app shell so the site loads and
// keeps working offline (recordings themselves live in IndexedDB). Registered
// only when hosted over http(s); file:// pages skip service workers entirely.
// Whisper model weights are cached transparently by the browser's HTTP cache
// after the first transcription.
const CACHE = 'static-recorder-v2';
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
  const sameOrigin = url.origin === location.origin;
  if (e.request.method !== 'GET') return;
  if (!sameOrigin) return; // model weights (Hugging Face CDN) are left to the browser's own cache

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request)
        .then(resp => {
          if (resp && resp.ok && (resp.type === 'basic' || resp.type === 'default')) {
            const copy = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return resp;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});