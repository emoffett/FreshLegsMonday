// Service worker
// This code executes in its own worker or thread

// Which resources we want to make available offline at time of installation
const urlsToCache = [
  "/index.html",

  "/css/normalize.css",
  "/css/main.css",
  "/css/predictor.css",

  "/fonts/dseg/DSEG7-Classic-MINI/DSEG7ClassicMini-Regular.woff2",
  "/fonts/Roboto/Roboto-Regular.ttf",
  "/fonts/RobotoMono/static/RobotoMono-Regular.ttf",

  "/img/favicons/apple-icon.png",
  "/img/favicons/apple-icon-76x76.png",
  "/img/favicons/apple-icon-114x114.png",
  "/img/favicons/apple-icon-120x120.png",
  "/img/favicons/apple-icon-180x180.png",
  "/img/favicons/favicon.ico",
  "/img/favicons/icon-512x512.png",

  "/js/vendor/modernizr-3.11.2.min.js",
  "/js/plugins.js",
  "/js/predictor.js"
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
