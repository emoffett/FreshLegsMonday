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

// Stale While Revalidate: Send a request to the network and in parallel look in the cache
// If a cache hit respond with that, otherwise wait for the network response
// Either way, update the cache with the latest from the network.

// Assumes that we only want to handle GET requests for the app itself
// When a request comes into your service worker, there are two things you can do; you can ignore it,
// which lets it go to the network, or you can respond to it.
self.addEventListener("fetch", event => {
  let crossSite = false;
  if (event.request.url && event.request.referrer) {
    const requestUrl = new URL(event.request.url);
    const referrerUrl = new URL(event.request.referrer);
    if (requestUrl.origin !== referrerUrl.origin) crossSite = true;
  }

  if (!crossSite) { // don't try to use caching for cross site content, e.g. Google Analytics
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const networkFetch = fetch(event.request).then(response => {
          caches.open("pwa-assets").then(cache => {
            cache.put(event.request, response.clone());
          });
        });
        return cachedResponse || networkFetch;
      })
    );
  }
});
