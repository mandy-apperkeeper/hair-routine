/**
 * Service Worker for Hair Routine
 * 
 * Strategy:
 * - HTML (index.html): Cache-first with background update (stale-while-revalidate)
 * - Open-Meteo API: Network-first with cache fallback (fresh weather when online, cached when offline)
 * - Everything else: Cache-first
 * 
 * Update flow:
 * - New SW version → new cache name → old caches deleted on activate
 * - skipWaiting + clients.claim for immediate activation
 * - Posts 'SW_UPDATED' message to all clients so UI can show "Updated" indicator
 */

var CACHE_VERSION = 'v5';
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
            // Also clean up legacy v2 cache names
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
            // Notify all clients that the SW has updated
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

    // Open-Meteo API: network-first with cache fallback
    if (url.origin === OPEN_METEO_ORIGIN) {
        event.respondWith(networkFirstWithCache(event.request));
        return;
    }

    // Same-origin navigation/assets: stale-while-revalidate
    if (url.origin === self.location.origin) {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
    }

    // Other requests: network only (don't cache third-party resources)
    event.respondWith(fetch(event.request));
});

/**
 * Network-first with cache fallback.
 * Used for API calls — prefer fresh data, fall back to cached when offline.
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
            // No cache, no network — return a minimal error response
            return new Response(JSON.stringify({ error: 'offline', cached: false }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        });
    });
}

/**
 * Stale-while-revalidate.
 * Returns cached version immediately (fast), fetches update in background.
 * Next load gets the fresh version.
 */
function staleWhileRevalidate(request) {
    return caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(request).then(function(cachedResponse) {
            var fetchPromise = fetch(request).then(function(networkResponse) {
                if (networkResponse.ok) {
                    cache.put(request, networkResponse.clone());
                }
                return networkResponse;
            }).catch(function() {
                // Network failed — that's fine, we have cache
                return cachedResponse;
            });

            // Return cached immediately if available, otherwise wait for network
            return cachedResponse || fetchPromise;
        });
    });
}
