const CACHE_NAME = 'agrobio-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
]

// Install: cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET
  if (request.method !== 'GET') return

  // Skip Supabase API calls and auth
  if (url.hostname.includes('supabase') || url.pathname.startsWith('/auth')) return

  // API calls from gov: network-first with cache fallback
  if (url.pathname.includes('/api/') || url.hostname.includes('openweathermap')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return res
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((res) => {
        if (res.ok && (url.pathname.match(/\.(js|css|png|svg|ico|woff2?)$/) || url.pathname === '/')) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return res
      })
    })
  )
})

// Offline sync queue
const SYNC_QUEUE_KEY = 'agrobio-sync-queue'

self.addEventListener('message', (event) => {
  if (event.data?.type === 'QUEUE_SYNC') {
    // Store pending mutation for when back online
    event.waitUntil(
      caches.open(SYNC_QUEUE_KEY).then((cache) =>
        cache.put(
          new Request(`/_sync/${Date.now()}`),
          new Response(JSON.stringify(event.data.payload))
        )
      )
    )
  }
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'agrobio-sync') {
    event.waitUntil(processSyncQueue())
  }
})

async function processSyncQueue() {
  const cache = await caches.open(SYNC_QUEUE_KEY)
  const keys = await cache.keys()
  for (const key of keys) {
    try {
      const res = await cache.match(key)
      if (!res) continue
      const payload = await res.json()
      await fetch(payload.url, {
        method: payload.method,
        headers: payload.headers,
        body: payload.body,
      })
      await cache.delete(key)
    } catch {
      // Will retry on next sync
    }
  }
}
