/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */
export {};

const BASE_PATH = "/quizz-app/";
const CACHE_NAME = "quiz-educatif-v3";
const ASSETS_TO_CACHE = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}icons/favicon.ico`,
  `${BASE_PATH}icons/logo-192.png`,
  `${BASE_PATH}icons/logo-512.png`,
  `${BASE_PATH}icons/app-logo.png`,
];

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event: FetchEvent) => {
  if (event.request.method !== "GET") return;

  if (
    event.request.url.includes("firebaseapp.com") ||
    event.request.url.includes("firebase") ||
    event.request.url.includes("googleapis.com")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      return fetch(event.request.clone())
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches
              .match(`${BASE_PATH}index.html`)
              .then(
                (response) => response || new Response("Application hors ligne")
              );
          }
          return new Response("Application hors ligne", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
    })
  );
});
