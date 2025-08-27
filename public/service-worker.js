// Auto-generate a unique cache name based on the current timestamp
const CACHE_NAME = `ltapp-cache-${new Date().getTime()}`;

const PRECACHE_URLS = [
  "/",              
  "/index.html",
  "/main.js",       
  "/style.css",     
  // add other static files here
];

// Install: pre-cache essential files
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

// Activate: clean up old caches
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

// Fetch: respond with cache first, then network, and dynamically cache new requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (!event.request.url.startsWith("http") || event.request.method !== "GET") {
            return networkResponse;
          }

          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

// Listen for messages to skip waiting
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});