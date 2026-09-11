// Turnout — minimal service worker.
//
// Just enough to satisfy Android/Chrome's "installable" criteria and give
// the app a basic offline shell. This intentionally does NOT try to cache
// or serve stale game data — Turnout's whole point is live, current RSVPs,
// so every real request always goes to the network first.

const SHELL_CACHE = 'turnout-shell-v1';
const SHELL_ASSETS = ['/', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== SHELL_CACHE).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Network-first: always try the real network so nobody's stuck looking at
  // an out-of-date game list. Only fall back to the cached shell if the
  // network is genuinely unreachable (e.g. no signal at the field).
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((res) => res || caches.match('/'))),
  );
});
