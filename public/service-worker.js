// service-worker.js

// ===== Cache Setup =====
const CACHE_NAME = 'ltapp-cache-v12';
let urlsToCache = ["/", "/index.html"];

// Install event: cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        const manifestResponse = await fetch("/manifest.json");
        const manifest = await manifestResponse.json();

        // Collect asset URLs, filter out invalid, remove duplicates
        const assets = Object.values(manifest)
          .map(entry => entry.file)
          .filter(url => url);

        urlsToCache = [...urlsToCache, ...assets];
        urlsToCache = [...new Set(urlsToCache)];

      } catch (err) {
        console.warn("Could not load manifest.json, caching only basics.");
      }

      await cache.addAll(urlsToCache);
    })()
  );
  self.skipWaiting();
});

// Activate event: delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)));
    })()
  );
  self.clients.claim();
});

// Fetch handler: serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/index.html")));
  } else {
    event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
  }
});

// Skip waiting message
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

// ===== Push Notifications =====
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
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
    clients.matchAll({ type: "window" }).then(clientList => {
      const appClient = clientList.find(c => c.url.includes("/") && "focus" in c);
      if (appClient) appClient.focus();
      else clients.openWindow("/");
    })
  );
});

// ===== Scheduled Notifications in SW =====
const swActiveReminders = {}; // { complaintId: timeoutId }

self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};

  if (type === "SCHEDULE_NOTIFICATION") {
    const { complaintId, title, timeString } = payload;

    if (swActiveReminders[complaintId]) clearTimeout(swActiveReminders[complaintId]);

    const [hour, minute] = timeString.split(":").map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const timeout = target - now;

    const timeoutId = setTimeout(() => {
      self.registration.showNotification("Tenant Complaint Reminder", {
        body: `Reminder for complaint: ${title}`,
        tag: complaintId,
      });
      delete swActiveReminders[complaintId];
    }, timeout);

    swActiveReminders[complaintId] = timeoutId;
  }

  if (type === "CANCEL_NOTIFICATION") {
    const { complaintId } = payload;
    if (swActiveReminders[complaintId]) {
      clearTimeout(swActiveReminders[complaintId]);
      delete swActiveReminders[complaintId];
    }
  }
});
