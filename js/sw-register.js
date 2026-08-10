// sw-register.js 鈥?娉ㄥ唽 service worker锛堜粎鐢熶骇锛屾湰鍦板紑鍙戝彲涓嶇敤锛?
export function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  // localhost 璋冭瘯鏃朵笉寮哄埗娉ㄥ唽锛岄伩鍏嶇紦瀛樺共鎵帮紱閮ㄧ讲鍚庢甯告敞鍐?  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then(registration => {
      // 涓诲姩妫€鏌ユ洿鏂?      registration.update().catch(() => {});

      // 妫€娴嬪埌鏂扮増鏈椂鑷姩鍒锋柊椤甸潰
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 鏈夋柊鐗堟湰锛屽己鍒跺埛鏂伴〉闈㈠姞杞芥渶鏂颁唬鐮?              console.log('[SW] 妫€娴嬪埌鏂扮増鏈紝姝ｅ湪鍒锋柊...');
              window.location.reload();
            }
          });
        }
      });
    }).catch(err => {
      console.warn('[sw] 娉ㄥ唽澶辫触', err);
    });
  });
}
