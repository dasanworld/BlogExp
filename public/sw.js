const CACHE_NAME = 'app-cache-v1';
const VERSION = '1.0.0';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_VERSION') {
    checkForUpdates().then((hasUpdate) => {
      event.ports[0].postMessage({
        type: 'VERSION_CHECK_RESULT',
        hasUpdate,
        currentVersion: VERSION
      });
    });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function checkForUpdates() {
  try {
    const response = await fetch('/api/version');
    const data = await response.json();
    return data.version !== VERSION;
  } catch (error) {
    return false;
  }
}

setInterval(() => {
  checkForUpdates().then((hasUpdate) => {
    if (hasUpdate) {
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'UPDATE_AVAILABLE'
          });
        });
      });
    }
  });
}, 30000);