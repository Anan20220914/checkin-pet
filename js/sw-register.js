// sw-register.js — 注册 service worker（仅生产，本地开发可不用）

export function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  // localhost 调试时不强制注册，避免缓存干扰；部署后正常注册
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.warn('[sw] 注册失败', err);
    });
  });
}
