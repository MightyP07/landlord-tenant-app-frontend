const CACHE_NAME = "ltapp-cache-v1"; // increment this on new deployments
const urlsToCache = [
  "/",
  "/index.html",
  "/main.js",   // add your main JS
  "/style.css", // add your CSS files
  // add any other static assets here
];

// Install: cache files
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching Files");
      return cache.addAll(urlsToCache);
    }).then(() => self.skipWaiting()) // activate immediately
  );
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
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
  return self.clients.claim(); // take control immediately
});

// Fetch: serve cached files first, then network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Optional: listen for update messages from the app
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});