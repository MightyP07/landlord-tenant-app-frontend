// Change this manually on each big deploy
const CACHE_NAME = "ltapp-cache-v6";
const urlsToCache = ["/", "/index.html"];

// Install: cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // activate new SW immediately
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      );

      // Notify clients a new version is available
      const clientsArr = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      clientsArr.forEach((client) => client.postMessage({ type: "NEW_VERSION" }));
    })()
  );
  self.clients.claim();
});

// Fetch: cache-first strategy
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(
      (response) => response || fetch(event.request).catch(() => caches.match("/index.html"))
    )
  );
});