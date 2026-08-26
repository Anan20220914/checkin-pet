// app.js — 入口：路由、初始化、每日刷新编排、共享 UI 工具、自动同步钩子

import { load, getState, subscribe } from './store.js';
import { ensureToday } from './daily.js';
import { registerSW } from './sw-register.js';
import { isConfigured, syncNow } from './sync.js';
import { checkAchievements, hasUnseen } from './achievements.js';
import { renderHome } from './views/home.js';
import { renderCheckin } from './views/checkin.js';
import { renderPets } from './views/pets.js';
import { renderShop } from './views/shop.js';
import { renderSettings } from './views/settings.js';

// ---------- 共享 UI 工具 ----------
let toastTimer = null;
export function toast(msg, ms = 2000) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, ms);
}

export function showOverlay(html, opts = {}) {
  const ov = document.getElementById('overlay');
  const card = document.getElementById('overlayCard');
  // 统一注入右上角关闭按钮（opts.noClose=true 时不加，如答题进行中不可关）
  const closeBtn = opts.noClose ? '' : '<button class="overlay-x" id="ovX" aria-label="关闭">✕</button>';
  card.innerHTML = closeBtn + html;
  ov.hidden = false;
  const x = card.querySelector('#ovX');
  if (x) x.onclick = () => { closeOverlay(); if (opts.onClose) opts.onClose(); };
  if (opts.onMount) opts.onMount(card);
}

export function closeOverlay() {
  const ov = document.getElementById('overlay');
  ov.hidden = true;
  document.getElementById('overlayCard').innerHTML = '';
}

// ---------- 打卡成功特效（奖杯 + 撒花 + 星星飘落） ----------
export function celebrate(msg = '打卡成功', sub = '') {
  const layer = document.createElement('div');
  layer.className = 'success-box-overlay';
  layer.innerHTML = `
    <div class="success-box">
      <div class="success-trophy">🏆</div>
      <div class="success-title">${msg}</div>
      ${sub ? `<div class="success-sub">${sub}</div>` : ''}
    </div>
  `;
  document.body.appendChild(layer);

  // 撒花特效：屏幕上方飘落彩色小星星
  const colors = ['#FF8A80', '#FFD54F', '#80CBC4', '#FFAB91', '#FFE082'];
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const star = document.createElement('div');
      star.textContent = ['⭐', '✨', '', '🌟'][Math.floor(Math.random() * 4)];
      star.style.position = 'fixed';
      star.style.left = (20 + Math.random() * 60) + '%';
      star.style.top = '-20px';
      star.style.fontSize = (16 + Math.random() * 16) + 'px';
      star.style.pointerEvents = 'none';
      star.style.zIndex = '201';
      star.style.animation = `star-fall ${1 + Math.random()}s ease-out forwards`;
      star.style.color = colors[Math.floor(Math.random() * colors.length)];
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 2000);
    }, i * 80);
  }

  setTimeout(() => layer.remove(), 2500);
}

// ---------- 路由 ----------
let currentTab = 'home';

export function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.view').forEach(v => {
    if (v.dataset.tab === tab) {
      v.hidden = false;
      v.style.animation = 'none';
      v.offsetHeight; // force reflow
      v.style.animation = 'viewIn 0.3s ease-out';
    } else {
      v.hidden = true;
    }
  });
  document.querySelectorAll('.tabbar .tab').forEach(b => { b.classList.toggle('active', b.dataset.tab === tab); });
  // 通知 view：tab 切换，checkin 据此重置子页到 home
  window.dispatchEvent(new CustomEvent('tab-switch', { detail: { tab } }));
  renderCurrentView();
  document.getElementById('views').scrollTop = 0;
}

function renderCurrentView() {
  switch (currentTab) {
    case 'home': renderHome(); break;
    case 'checkin': renderCheckin(); break;
    case 'pets': renderPets(); break;
    case 'shop': renderShop(); break;
    case 'settings': renderSettings(); break;
  }
}

function renderTopbar() {
  const s = getState();
  document.getElementById('topAvatar').textContent = s.child.avatar;
  document.getElementById('topName').textContent = s.child.name;
  document.getElementById('topPoints').textContent = s.wallet.points;
}

// ---------- 自动同步钩子 ----------
let syncTimer = null;
export function maybeAutoSync() {
  const s = getState();
  if (!s.settings.autoSync || !isConfigured()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try { await syncNow(); } catch (e) { console.warn('[sync]', e.message); }
  }, 30000);
}

// ---------- 成就提示 ----------
export function notifyAchievements() {
  const newly = checkAchievements();
  for (const a of newly) {
    toast(`🏅 成就解锁：${a.name}！`, 3500);
  }
  return newly.length;
}

// ---------- 初始化 ----------
function init() {
  load();
  ensureToday();
  notifyAchievements();
  renderTopbar();
  bindNav();
  try {
    switchTab('home');
  } catch (e) {
    console.error('[init] switchTab 失败', e);
  }
  registerSW();

  // 状态变更后重渲染（store 广播）
  subscribe(() => {
    renderTopbar();
    renderCurrentView();
    notifyAchievements();
    maybeAutoSync();
  });
}

function bindNav() {
  document.querySelectorAll('.tabbar .tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
