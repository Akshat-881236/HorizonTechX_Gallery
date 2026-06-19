const CACHE_NAME = "horizon-gallery-v1.0.0";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./logo.svg",
    "./iframe-blocker.js",
    "./robots.txt",

    // External CSS
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",

    // TrackerJS Files
    "https://akshat-881236.github.io/TrackerJS/TrackID/track_id_100.115.js",
    "https://akshat-881236.github.io/TrackerJS/TrackID/seo-runtime-auditor.js",
    "https://akshat-881236.github.io/TrackerJS/TrackID/anh-inspection-mode.js",
    "https://akshat-881236.github.io/TrackerJS/redirect.js"
];

self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        if (key !== CACHE_NAME) {
                            return caches.delete(key);
                        }

                    })

                );

            })

    );

    self.clients.claim();
});

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                const networkFetch = fetch(event.request)

                    .then(networkResponse => {

                        if (
                            networkResponse &&
                            networkResponse.status === 200
                        ) {

                            const clone =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        event.request,
                                        clone
                                    );

                                });

                        }

                        return networkResponse;

                    })

                    .catch(() => cachedResponse);

                return cachedResponse || networkFetch;

            })

    );

});
