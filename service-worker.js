// service-worker.js 鈥?PWA 绂荤嚎缂撳瓨锛歛pp shell 棰勭紦瀛橈紝api.github.com 涓嶇紦瀛?
// 鐗堟湰鏇存柊鏃堕棿锛?026-08-10锛堟瘡娆℃洿鏂颁唬鐮佹椂蹇呴』鍚屾淇敼姝ゆ椂闂存埑锛?
// 褰撳墠缂撳瓨鐗堟湰锛歷34

const CACHE = 'checkin-pet-v34';
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
  // GitHub API锛氱粷涓嶇紦瀛橈紙閬垮厤缂撳瓨鍚?token 鐨勫搷搴旓級
  if (req.url.includes('api.github.com')) {
    return; // 鐩存帴璧扮綉缁?
  }
  // 鍚屾簮闈欐€佽祫婧?
  if (req.method === 'GET' && new URL(req.url).origin === self.location.origin) {
    // JS/CSS 鏂囦欢锛歯etwork-first锛堜繚璇佹€绘槸鏈€鏂颁唬鐮侊級
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
    // 鍏跺畠锛歴tale-while-revalidate
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
