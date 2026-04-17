const CACHE = "bestellmanager-v1";

const ASSETS = [
  "./BESTELLUNGEN.html",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-regular-400.woff2",
];

// Installation: alle Assets vorab cachen
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Aktivierung: alte Cache-Versionen löschen
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: Cache-first, bei Miss Netzwerk, bei Fehler Cache-Fallback
self.addEventListener("fetch", (e) => {
  // Nur GET-Requests cachen
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;

      return fetch(e.request)
        .then((response) => {
          // Nur gültige Responses cachen
          if (!response || response.status !== 200 || response.type === "error") {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, clone));
          return response;
        })
        .catch(() => {
          // Offline-Fallback: Hauptseite zurückgeben
          return caches.match("./BESTELLUNGEN.html");
        });
    })
  );
});
