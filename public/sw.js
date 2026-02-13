const CACHE_NAME = "portfolio-dashboard-v2";
const APP_SHELL = ["/", "/login", "/dashboard", "/offline-dashboard"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/local-first/")) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone).catch(() => null);
          });

          return response;
        })
        .catch(async () => {
          if (url.pathname.startsWith("/dashboard")) {
            const offlineDashboard = await caches.match("/offline-dashboard");
            if (offlineDashboard) {
              return offlineDashboard;
            }
          }

          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }

          return caches.match("/offline-dashboard");
        }),
    );

    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone).catch(() => null);
        });

        return response;
      });
    }),
  );
});
