const CACHE_NAME = "ltapp-cache-" + new Date().getTime();
const urlsToCache = ["/", "/index.html"];

// Install new service worker and cache essentials
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // take control immediately
});

// Activate new service worker, clean old caches, and refresh clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Delete old caches
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)));

      // Reload all open app tabs so they use the new version
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
  self.clients.claim();
});

// Fetch handler with cache fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(
      (response) =>
        response ||
        fetch(event.request).catch(() => caches.match("/index.html"))
    )
  );
});