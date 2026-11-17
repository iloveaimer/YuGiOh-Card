// 离线缓存：应用外壳预缓存，同源资源走「先给缓存、后台更新」。
//
// 卡图来自跨域地址，不在此拦截；只处理同源 GET，避免把第三方响应写进缓存。
// 升级缓存结构时递增 CACHE_NAME，旧版本在 activate 阶段清空。
const CACHE_NAME = 'ygo-card-v1';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest'];
const MAX_ENTRIES = 400;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// 缓存条目过多时按插入顺序淘汰最早的条目，避免占满配额
const trimCache = async cache => {
  const keys = await cache.keys();
  if (keys.length <= MAX_ENTRIES) {
    return;
  }
  await Promise.all(keys.slice(0, keys.length - MAX_ENTRIES).map(key => cache.delete(key)));
};

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    const network = fetch(request).then(response => {
      if (response && response.ok) {
        cache.put(request, response.clone()).then(() => trimCache(cache));
      }
      return response;
    }).catch(() => null);
    if (cached) {
      return cached;
    }
    const fresh = await network;
    if (fresh) {
      return fresh;
    }
    return new Response('离线状态下暂时无法加载该资源', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  })());
});
