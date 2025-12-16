const CACHE_NAME = 'museum-assets-v1'

const ASSET_EXTENSIONS = [
  '.mp4',
  '.webm',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
]

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', event => {
  const { request } = event

  if (
    request.method === 'GET' &&
    ASSET_EXTENSIONS.some(ext => request.url.includes(ext))
  ) {
    event.respondWith(cacheFirst(request))
  }
})

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  const response = await fetch(request)

  // ❗ ВАЖНО: кешируем ТОЛЬКО 200 OK
  if (response.ok && response.status === 200) {
    cache.put(request, response.clone())
  }

  return response
}

