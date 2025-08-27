const CACHE_NAME = "ltapp-cache-" + new Date().getTime();
const urlsToCache = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      );

      // Notify only once: send message only if this SW is brand new
      if (self.registration.navigationPreload) {
        const clientsArr = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        clientsArr.forEach((client) => {
          client.postMessage({ type: "NEW_VERSION" });
        });
      }
    })()
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(
      (response) =>
        response ||
        fetch(event.request).catch(() => caches.match("/index.html"))
    )
  );
});