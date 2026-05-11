/**
 * Service Worker for Hair Routine
 * 
 * Strategy:
 * - HTML (index.html): Network-first with cache fallback (always fresh when online)
 * - Open-Meteo API: Network-first with cache fallback
 * - Static assets (icons, manifest): Cache-first (rarely change)
 * 
 * Update flow:
 * - New SW version → new cache name → old caches deleted on activate
 * - skipWaiting + clients.claim for immediate activation
 * - Posts 'SW_UPDATED' message to all clients so UI can show "Updated" indicator
 */

var CACHE_VERSION = 'v15';
var CACHE_NAME = 'hair-routine-cache-' + CACHE_VERSION;

var PRECACHE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.svg',
    './icon-512.svg'
];

var OPEN_METEO_ORIGIN = 'https://api.open-meteo.com';

// Install: precache core assets, skip waiting to activate immediately
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(PRECACHE_URLS);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

// Activate: delete old caches, claim all clients
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) {
                    return name.startsWith('hair-routine-cache-') && name !== CACHE_NAME;
                }).map(function(name) {
                    return caches.delete(name);
                })
            );
        }).then(function() {
            return caches.keys();
        }).then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) {
                    return name.startsWith('hair-routine-v2-cache-');
                }).map(function(name) {
                    return caches.delete(name);
                })
            );
        }).then(function() {
            return self.clients.claim();
        }).then(function() {
            return self.clients.matchAll();
        }).then(function(clients) {
            clients.forEach(function(client) {
                client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
            });
        })
    );
});

// Fetch: strategy depends on request type
self.addEventListener('fetch', function(event) {
    var url = new URL(event.request.url);

    // Open-Meteo API: network-first
    if (url.origin === OPEN_METEO_ORIGIN) {
        event.respondWith(networkFirstWithCache(event.request));
        return;
    }

    // Same-origin HTML: network-first (always get latest when online)
    if (url.origin === self.location.origin) {
        var isHTML = event.request.mode === 'navigate' ||
                    url.pathname.endsWith('.html') ||
                    url.pathname === '/' ||
                    url.pathname.endsWith('/');
        if (isHTML) {
            event.respondWith(networkFirstWithCache(event.request));
            return;
        }
        // Static assets (icons, manifest): cache-first
        event.respondWith(cacheFirstWithNetwork(event.request));
        return;
    }

    // Other origins (Cauldron, external APIs): don't intercept — let them pass through
    // Wrapping cross-origin requests in respondWith causes SW cert/load errors
    return;
});

/**
 * Network-first with cache fallback.
 * Prefer fresh content, fall back to cached when offline.
 */
function networkFirstWithCache(request) {
    return fetch(request).then(function(response) {
        if (response.ok) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
                cache.put(request, responseClone);
            });
        }
        return response;
    }).catch(function() {
        return caches.match(request).then(function(cachedResponse) {
            if (cachedResponse) {
                return cachedResponse;
            }
            return new Response('Offline — no cached version available.', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
            });
        });
    });
}

/**
 * Cache-first with network fallback.
 * Used for static assets that rarely change (icons, manifest).
 */
function cacheFirstWithNetwork(request) {
    return caches.match(request).then(function(cachedResponse) {
        if (cachedResponse) {
            return cachedResponse;
        }
        return fetch(request).then(function(response) {
            if (response.ok) {
                var responseClone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(request, responseClone);
                });
            }
            return response;
        });
    });
}
