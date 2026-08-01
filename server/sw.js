const CACHE_NAME = 'helpinder-v3'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// Fetch: network-first for navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const req = event.request

  // Skip non-GET requests
  if (req.method !== 'GET') return

  // Skip cross-origin requests (Yandex Maps, Chart.js CDN)
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // Network-first for HTML navigation (always get fresh content)
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy))
          return res
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/'))),
    )
    return
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy))
        }
        return res
      })
    }),
  )
})
