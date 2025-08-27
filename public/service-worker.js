// ✅ Bump this version manually each deployment
const CACHE_NAME = "ltapp-cache-v4";

const urlsToCache = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // activate immediately
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // ✅ Delete old caches not matching CACHE_NAME
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );

      // ✅ Notify all clients about new version
      const clientsArr = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      clientsArr.forEach((client) => {
        client.postMessage({ type: "NEW_VERSION" });
      });
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