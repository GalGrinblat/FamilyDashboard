// Basic service worker for Family Dashboard PWA
// Caches the shell and key assets for offline support.

const CACHE_NAME = 'family-dashboard-v1'
const OFFLINE_URL = '/'

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Skip cross-origin requests and API routes
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache, but also update it in the background
    fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return networkResponse
        })
        return cachedResponse
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse.ok) return networkResponse
          const responseClone = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return networkResponse
        })
        .catch(() => {
          // Return the offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }
          return new Response('', { status: 408 })
        })
    }),
  )
})
