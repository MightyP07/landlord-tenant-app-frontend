// Auto-generate a unique cache name
const CACHE_NAME = `ltapp-cache-${new Date().getTime()}`;
const PRECACHE_URLS = ["/", "/index.html"]; // only index.html is precached

// Install: pre-cache index.html
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .then(() => {
        // Notify clients a new version is available
        self.clients.matchAll().then(clients => {
          clients.forEach(client => client.postMessage({ type: 'NEW_VERSION' }));
        });
      })
  );
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Removing old cache", cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );
  return self.clients.claim();
});

// Fetch: cache-first for everything, dynamically cache JS/CSS/images
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          // Only cache GET requests
          if (!event.request.url.startsWith("http") || event.request.method !== "GET") {
            return networkResponse;
          }

          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Fallback to index.html for navigation requests
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

// Listen for skipWaiting messages
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});