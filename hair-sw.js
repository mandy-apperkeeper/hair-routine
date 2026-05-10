/**
 * Service Worker for Hair Routine v2
 * Cache-first strategy for offline capability.
 */

var CACHE_NAME = 'hair-routine-v2-cache-v2';
var ASSETS_TO_CACHE = [
    './',
    'index.html'
];

// Install: cache the HTML file
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Fetch: cache-first strategy
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});

// Activate: delete old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) {
                    return name.startsWith('hair-routine-v2-cache-') && name !== CACHE_NAME;
                }).map(function(name) {
                    return caches.delete(name);
                })
            );
        })
    );
});
