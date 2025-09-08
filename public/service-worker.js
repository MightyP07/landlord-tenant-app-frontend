// public/service-worker.js

// ===== Cache Setup =====
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
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })()
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/index.html")));
  } else {
    event.respondWith(caches.match(event.request).then((resp) => resp || fetch(event.request)));
  }
});

// ===== Push Notifications & Aggressive Alarm =====
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
    vibrate: [200, 100, 200, 100, 400], // vibration pattern
  };

  event.waitUntil(
    (async () => {
      // Show notification
      await self.registration.showNotification(title, options);

      // Try playing aggressive alarm
      try {
        const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        if (clients && clients.length) {
          // Send message to client(s) to play alarm sound
          clients.forEach((client) => {
            client.postMessage({ type: "PLAY_ALARM", payload: { title } });
          });
        }
      } catch (e) {
        console.error("Error sending PLAY_ALARM message to client:", e);
      }
    })()
  );
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      const appClient = clientList.find((c) => c.url.includes("/") && "focus" in c);
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
