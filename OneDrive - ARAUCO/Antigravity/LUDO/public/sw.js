const CACHE_NAME = 'pvz-ludo-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/PIEZAS.jfif',
  '/LUDO.png',
  '/lanzaguisante.png',
  '/girasol.png',
  '/music_loonboon.mp3',
  '/music_waterygraves.mp3',
  '/music_ultimatebattle.mp3',
  '/music_cerebrawl.mp3',
  '/music_grazetheroof.mp3',
  '/music_brainiacmaniac.mp3',
  '/music_zombiesonyourlawn.mp3',
  '/music_loonboon_orquesta.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache resources individually so a single 404 does not break PWA installation
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url).catch(err => console.warn('Failed to cache:', url, err)))
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Use a Network-First strategy for HTML pages so updates are visible immediately online
  const isHtml = event.request.mode === 'navigate' || 
                 (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isHtml) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the latest index.html on successful fetch
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => {
          // If offline, return the cached version
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-First strategy for static assets (images, music)
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
