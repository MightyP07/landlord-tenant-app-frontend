const CACHE_NAME = "ltapp-cache-v2"; // increment on each deployment
const PRECACHE_URLS = [
  "/",              // index.html
  "/index.html",
  "/main.js",       // your main JS
  "/style.css",     // your CSS
  // add any other static files you want pre-cached
];

// Install: pre-cache essential files
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
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
          // Optional fallback if network fails
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

// Optional: listen for messages to skip waiting
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});