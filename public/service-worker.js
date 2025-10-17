const CACHE_NAME = 'map-cache-v1';
const URLS_TO_CACHE = ['/map_zoom_1.webp'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.endsWith('map_zoom_1.webp')) {
    event.respondWith(
      caches.match(event.request).then(response =>
        response || fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
      )
    );
  }
});
