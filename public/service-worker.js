// ===== Cache Setup =====
// ✅ Use timestamp so each deployment creates a new cache
const CACHE_NAME = `ltapp-cache-${Date.now()}`;
let urlsToCache = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        const manifestResponse = await fetch("/manifest.json");
        const manifest = await manifestResponse.json();

        const assets = Object.values(manifest)
          .map((entry) => entry.file)
          .filter(Boolean);

        urlsToCache = [...new Set([...urlsToCache, ...assets])];
      } catch (e) {
        console.warn("Could not load manifest.json, caching only basics.", e);
      }

      await cache.addAll(urlsToCache);
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })()
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((resp) => resp || fetch(event.request))
    );
  }
});

// ===== Push Notifications =====
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.warn("Push event data parsing failed:", e);
  }

  const title = data.title || "Reminder";
  const body = data.body || "You have a pending reminder!";
  const options = {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || "ltapp-reminder",
    data,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      const appClient = clientList.find(
        (c) => c.url.includes("/") && "focus" in c
      );
      if (appClient) return appClient.focus();
      return self.clients.openWindow("/");
    })
  );
});

// ===== Messages from client =====
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
