// Auto versioned cache
const CACHE_NAME = `ltapp-cache-v${Date.now()}`;

// Basic URLs to cache
let urlsToCache = ["/", "/index.html"];

// Install event: cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Try to fetch manifest.json for all built assets
      try {
        const manifestResponse = await fetch("/manifest.json");
        const manifest = await manifestResponse.json();

        // Add all asset URLs to cache
        const assets = Object.values(manifest).map((entry) => entry.file);
        urlsToCache = [...urlsToCache, ...assets];
      } catch (err) {
        console.warn("Could not load manifest.json, caching only basics.");
      }

      await cache.addAll(urlsToCache);
    })()
  );
  self.skipWaiting(); // activate new SW immediately
});

// Activate event: delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      );
    })()
  );
  self.clients.claim();
});

// Intercept fetch requests
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    // Navigation requests fallback to index.html
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((resp) => resp || fetch(event.request))
    );
  }
});

// Listen for skip waiting message from client
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
