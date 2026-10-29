// Üretim derlemesinde Vite bu iki değeri gerçek varlık listesiyle doldurur.
const CACHE = 'corpus3d-__VERSION__';
const PRECACHE = __PRECACHE__;
const scopeURL = (path) => new URL(path, self.registration.scope).href;

self.addEventListener('install', (event) => {
  // Tamamı başarıyla indirilmedikçe worker kurulmaz; kısmi önbellek hazır sayılmaz.
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.map(scopeURL))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('corpus3d-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await (await caches.open(CACHE)).match(scopeURL('index.html'))) || Response.error()));
    return;
  }
  event.respondWith(caches.open(CACHE).then(async (cache) => {
    const cached = await cache.match(request);
    return cached || fetch(request);
  }));
});
