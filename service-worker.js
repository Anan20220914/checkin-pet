// service-worker.js — PWA 离线缓存：app shell 预缓存，api.github.com 不缓存
// 版本更新时间：2026-08-08（每次更新代码时必须同步修改此时间戳）
// 当前缓存版本：v33

const CACHE = 'checkin-pet-v33';
const SHELL = [
  './',
  './index.html',
  './css/style.css',
  './manifest.webmanifest',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './js/app.js',
  './js/utils.js',
  './js/store.js',
  './js/db.js',
  './js/db2.js',
  './js/tasks.js',
  './js/srs.js',
  './js/srs2.js',
  './js/pets.js',
  './js/shop.js',
  './js/battle.js',
  './js/daily.js',
  './js/sync.js',
  './js/speech.js',
  './js/svg-art.js',
  './js/vocab-data.js',
  './js/sw-register.js',
  './js/achievements.js',
  './js/weekly.js',
  './js/pet-render.js',
  './js/pet-svgs.js',
  './js/zombie-svgs.js',
  './js/gift-svgs.js',
  './js/views/checkin.js',
  './js/views/home.js',
  './js/views/pets.js',
  './js/views/shop.js',
  './js/views/settings.js',
  './js/views/quiz-chinese.js',
  './js/views/quiz-english.js',
  './js/views/quiz-math.js',
  './js/views/quiz-poem.js',
  './js/views/quiz-brain.js',
  './js/views/quiz-speak.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // GitHub API：绝不缓存（避免缓存含 token 的响应）
  if (req.url.includes('api.github.com')) {
    return; // 直接走网络
  }
  // 同源静态资源
  if (req.method === 'GET' && new URL(req.url).origin === self.location.origin) {
    // JS/CSS 文件：network-first（保证总是最新代码）
    if (req.url.endsWith('.js') || req.url.endsWith('.css')) {
      e.respondWith(
        fetch(req, { cache: 'no-cache' }).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(req, clone));
          }
          return res;
        }).catch(() => caches.match(req).then(c => c || Response.error()))
      );
      return;
    }
    // 其它：stale-while-revalidate
    e.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req, { cache: 'no-cache' }).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(req, clone));
          }
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
