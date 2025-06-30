const CACHE_NAME = 'retro-pet-cache-v2'; // Update this to invalidate old caches
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './icon/icon-512.png',
  './icon/pig-left.png',
  './icon/pig-right.png',
  './icon/pig-sleep.png',
  './icon/pig-sleepR.png'
];

// Install: cache all required assets and activate immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate: delete old caches and take control of clients immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: respond with cache, then update cache in the background
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Only cache valid responses (status 200)
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // If fetch fails and no cache, optionally return a fallback
        if (cachedResponse) return cachedResponse;
        // You can add fallback logic here for certain URLs (e.g. offline page)
      });

      // Return cached response immediately if exists, else wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
