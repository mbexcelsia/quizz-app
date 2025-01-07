/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */
export {};

const CACHE_NAME = "quiz-educatif-v3";
const ASSETS_TO_CACHE = [
  "/quizz-app/",
  "/quizz-app/index.html",
  "/quizz-app/manifest.json",
  "/quizz-app/icons/favicon.ico",
  "/quizz-app/icons/logo192.png",
  "/quizz-app/icons/logo512.png",
  "/quizz-app/icons/app-logo.png",
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
              .match("/quizz-app/index.html")
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
