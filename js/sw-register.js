// sw-register.js — 注册 service worker（仅生产，本地开发可不用）

export function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  // localhost 调试时不强制注册，避免缓存干扰；部署后正常注册
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then(registration => {
      // 主动检查更新
      registration.update().catch(() => {});

      // 检测到新版本时自动刷新页面
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 有新版本，强制刷新页面加载最新代码
              console.log('[SW] 检测到新版本，正在刷新...');
              window.location.reload();
            }
          });
        }
      });
    }).catch(err => {
      console.warn('[sw] 注册失败', err);
    });
  });
}
