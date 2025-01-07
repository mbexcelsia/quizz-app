var CACHE_NAME = "quiz-educatif-v3";
var ASSETS_TO_CACHE = [
    "/quizz-app/",
    "/quizz-app/index.html",
    "/quizz-app/manifest.json",
    "/quizz-app/icons/favicon.ico",
    "/quizz-app/icons/logo192.png",
    "/quizz-app/icons/logo512.png",
    "/quizz-app/icons/app-logo.png",
];
self.addEventListener("install", function (event) {
    event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(ASSETS_TO_CACHE); }));
    self.skipWaiting();
});
self.addEventListener("activate", function (event) {
    event.waitUntil(caches
        .keys()
        .then(function (cacheNames) {
        return Promise.all(cacheNames
            .filter(function (name) { return name !== CACHE_NAME; })
            .map(function (name) { return caches.delete(name); }));
    }));
    self.clients.claim();
});
self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET")
        return;
    if (event.request.url.includes("firebaseapp.com") ||
        event.request.url.includes("firebase") ||
        event.request.url.includes("googleapis.com")) {
        return;
    }
    event.respondWith(caches.match(event.request).then(function (response) {
        if (response)
            return response;
        return fetch(event.request.clone())
            .then(function (networkResponse) {
            if (!networkResponse || networkResponse.status !== 200) {
                return networkResponse;
            }
            var responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(function (cache) {
                cache.put(event.request, responseToCache);
            });
            return networkResponse;
        })
            .catch(function () {
            if (event.request.mode === "navigate") {
                return caches
                    .match("/quizz-app/index.html")
                    .then(function (response) { return response || new Response("Application hors ligne"); });
            }
            return new Response("Application hors ligne", {
                status: 503,
                statusText: "Service Unavailable",
            });
        });
    }));
});
