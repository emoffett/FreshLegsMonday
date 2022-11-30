// Service worker
// This code executes in its own worker or thread

// Which resources we want to make available offline at time of installation
const urlsToCache = [
  "/",
  "/css/normalize.css",
  "/css/main.css",
  "/css/predictor.css"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("pwa-assets")
    .then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  console.log("Service worker installed");
});

self.addEventListener("activate", event => {
  console.log("Service worker activated");
});

// Try to find the resource in the cache; if a hit respond with that.
// Either way update the cache with the latest from the server
self.addEventListener("fetch", event => {
  console.log(`URL requested: ${event.request.url}`);
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const networkFetch = fetch(event.request).then(response => {
        caches.open("pwa-assets").then(cache => {
          cache.put(event.request, response.clone()); // might need to handle pushes differently, e.g. for GA https://stackoverflow.com/questions/57905153/serviceworkers-fetch-object-that-was-not-a-response-was-passed-to-respondwit
        });
      });
      return cachedResponse || networkFetch;
    })
  );
});
