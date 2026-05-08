const CACHE_NAME = 'hifdzi-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icons.svg',
];

// Install Event
self.addEventListener('install', (event) => {
  console.log('[SW] Install Event');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate Event');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle API requests (equran.id)
  if (url.hostname === 'equran.id' && !url.pathname.includes('.mp3')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cacheCopy);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Handle Audio files
  if (url.pathname.includes('.mp3') || 
      url.pathname.includes('/audio/') || 
      url.pathname.includes('/audio-full/') ||
      request.destination === 'audio') {
    
    event.respondWith(
      caches.match(request.url, { ignoreSearch: true }).then(async (cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Serving audio from cache:', url.href);
          
          // Support for Range Requests (Critical for Basic responses)
          if (request.headers.has('range') && cachedResponse.type !== 'opaque') {
            try {
              return await returnRangeResponse(request, cachedResponse);
            } catch (e) {
              console.error('[SW] Range response failed, falling back to full response');
              return cachedResponse;
            }
          }
          
          return cachedResponse;
        }
        
        console.log('[SW] Fetching audio from network:', url.href);
        return fetch(request);
      })
    );
    return;
  }

  // Default Stale-While-Revalidate for other assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok && (url.protocol === 'http:' || url.protocol === 'https:')) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);
      
      return cachedResponse || fetchPromise;
    })
  );
});

/**
 * Helper to handle Range Requests for cached media
 */
async function returnRangeResponse(request, response) {
  const data = await response.arrayBuffer();
  const range = request.headers.get('range');
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : data.byteLength - 1;
  const chunk = data.slice(start, end + 1);

  return new Response(chunk, {
    status: 206,
    statusText: 'Partial Content',
    headers: new Headers({
      'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${data.byteLength}`,
      'Content-Length': chunk.byteLength,
      'Accept-Ranges': 'bytes'
    })
  });
}
