// Import Workbox library from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Precaching assets
workbox.precaching.precacheAndRoute([
    { url: '/dash.html', revision: '12350' },
    { url: '/assets/icons.svg', revision: '12350' },
    { url: '/assets/main.css', revision: '12350' },
    { url: '/assets/main.js', revision: '12350' },
    { url: '/assets/noscript.css', revision: '12350' },
    { url: '/assets/style.css', revision: '12350' },
    { url: '/assets/images/apple-touch-icon.png', revision: '12350' },
    { url: '/assets/images/bg.svg', revision: '12350' },
    { url: '/assets/images/favicon.png', revision: '12350' },
    { url: '/assets/images/image03.jpg', revision: '12350' },
    { url: '/assets/images/share.jpg', revision: '12350' },
    { url: '/build.html', revision: '12350' },
    { url: '/build.js', revision: '12350' },
    { url: '/build.ico', revision: '12350' },
    { url: '/icons/icon.png', revision: '12350' },
    { url: '/icons/build.png', revision: '12350' },
    { url: '/app.html', revision: '12350' },
    { url: '/style.css', revision: '12350' },
    { url: '/script.js', revision: '12350' },
    { url: '/favicon.ico', revision: '12350' },
    { url: '/offline.html', revision: '12350' },
    { url: '/manifest.json', revision: '12350' }
]);

// Caching strategies
// Cache First for static assets like CSS, JavaScript
workbox.routing.registerRoute(
    ({ request }) => request.destination === 'style' || request.destination === 'script',
    new workbox.strategies.CacheFirst({
        cacheName: 'static-resources',
    })
);

// Network First for dynamic or API calls
workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
        cacheName: 'api-cache',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
            }),
        ],
    })
);#

// Offline Fallback
const FALLBACK_HTML_URL = '/offline.html';
workbox.routing.setCatchHandler(({ event }) => {
    switch (event.request.destination) {
        case 'document':
            return caches.match(FALLBACK_HTML_URL);

        default:
            return Response.error();
    }
});

// Update and Activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== 'static-resources' && cacheName !== 'api-cache') {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});