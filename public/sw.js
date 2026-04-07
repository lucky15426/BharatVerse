const CACHE_NAME = "bharatverse-v1";

// Cache static assets only if they exist on the server
const urlsToCache = [
  "/",
  "/manifest.json",
  "/vite.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Service Worker: Caching critical assets");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("🧹 Service Worker: Clearing old cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-http/https requests (chrome extensions, data URLs, Clerk internals)
  if (!request.url.startsWith("http")) return;

  // 2. Skip cross-origin requests to prevent 429/CORS issues (e.g. Clerk API)
  if (url.origin !== self.location.origin) return;

  // 3. Navigation requests: Fallback to index.html for Single Page App (SPA) routing
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match("/");
      })
    );
    return;
  }

  // 4. Default strategy: Cache falling back to network (for static assets)
  event.respondWith(
    caches.match(request).then((response) => {
      return (
        response ||
        fetch(request).catch(() => {
          // Graceful failure for network errors
          return null;
        })
      );
    })
  );
});
