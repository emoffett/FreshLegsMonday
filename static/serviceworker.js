// Service worker
// This code executes in its own worker or thread

// Which resources we want to make available offline at time of installation
const cacheName = "pwa-assets-v3-3-0";
const urlsToCache = [
  "/index.html",

  ".well-known/assetlinks.json",

  "/html/contact.html",
  "/html/cookie.html",
  "/html/privacy.html",

  "/css/normalize.css",
  "/css/main.css",
  "/css/predictor.css",

  "/fonts/dseg/DSEG7-Classic-MINI/DSEG7ClassicMini-Regular.woff2",
  "/fonts/Roboto/Roboto-Regular.ttf",
  "/fonts/RobotoMono/static/RobotoMono-Regular.ttf",

  "/img/favicons/android-icon-36x36.png",
  "/img/favicons/android-icon-48x48.png",
  "/img/favicons/android-icon-72x72.png",
  "/img/favicons/android-icon-96x96.png",
  "/img/favicons/android-icon-144x144.png",
  "/img/favicons/android-icon-192x192.png",

  "/img/favicons/apple-icon.png",
  "/img/favicons/apple-icon-76x76.png",
  "/img/favicons/apple-icon-114x114.png",
  "/img/favicons/apple-icon-120x120.png",
  "/img/favicons/apple-icon-180x180.png",
  "/img/favicons/apple-icon-1024x1024.png",

  "/img/favicons/favicon.ico",
  "/img/favicons/favicon-16x16.png",
  "/img/favicons/favicon-32x32.png",
  "/img/favicons/favicon-96x96.png",
  "/img/favicons/icon-512x512.png",
  "/img/favicons/essence-512x512.png",
  "/img/favicons/icon-1024x1024.png",

  "/js/vendor/modernizr-3.11.2.min.js",
  "/js/plugins.js",
  "/js/predictor.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      await cache.addAll(urlsToCache);
    })(),
  );
});

self.addEventListener("activate", (e) => {
  // Clear the old cache when the cacheName is updated
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return;
          }
          return caches.delete(key);
        }),
      );
    }),
  );
});

self.addEventListener("fetch", (e) => {
  let crossSite = false;
  if (e.request.url && e.request.referrer) {
    const requestUrl = new URL(e.request.url);
    const referrerUrl = new URL(e.request.referrer);
    if (requestUrl.origin !== referrerUrl.origin) crossSite = true;
  }

  if (!crossSite) { // don't try to use caching for cross site content, e.g. Google Analytics
    e.respondWith(
      (async () => {
        const cacheHit = await caches.match(e.request);
        if (cacheHit) return cacheHit;
        const response = await fetch(e.request);
        await caches.open(cacheName).then(cache => {
          cache.put(e.request, response.clone());
        });
        return response;
      })(),
    );
  }
});
