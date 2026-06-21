// Einfacher Service Worker: sorgt dafür, dass die Bestellseite auch bei
// kurzzeitigem Verbindungsverlust zum Mini-PC weiterhin angezeigt werden
// kann. API-Aufrufe (Bestellungen, Produkte) werden bewusst NICHT gecacht,
// damit nie veraltete oder widersprüchliche Daten verwendet werden – nur
// die Seite selbst (HTML, CSS, JS, Icons) wird zwischengespeichert.

const CACHE_NAME = "dergah-shell-v1";

const APP_SHELL = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // API-Aufrufe niemals aus dem Cache bedienen – diese Daten müssen
  // immer aktuell vom Server kommen.
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Nur GET-Requests cachen (z.B. keine POST-Bestellungen).
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
