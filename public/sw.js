const CACHE_NAME = 'assist-ecriture-v1';

// Fichiers à mettre en cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation
self.addEventListener('install', (event) => {
  console.log('[SW] Installation');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Mise en cache des fichiers');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // ✅ IGNORER les requêtes WebLLM (modèles, wasm, etc.)
  if (url.includes('raw.githubusercontent.com') ||
      url.includes('.wasm') ||
      url.includes('.bin') ||
      url.includes('mlc-ai')) {
    // Ne pas intercepter, laisser le navigateur gérer normalement
    return;
  }
  
  // Pour les autres requêtes, utiliser le cache
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});