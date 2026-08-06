// store.js — 状态管理：localStorage 唯一数据出入口 + 订阅广播

import { createInitialData, migrate } from './db2.js';

const STORAGE_KEY = 'chckn-pet-island-v1';

let state = null;
const listeners = new Set();

/** 加载本地数据；不存在则初始化 */
export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = migrate(parsed) || createInitialData();
    } else {
      state = createInitialData();
      persist();
    }
  } catch (e) {
    console.warn('[store] 加载失败，重置为初始数据', e);
    state = createInitialData();
    persist();
  }
  return state;
}

/** 落地到 localStorage（同步阻塞，保证即时真相） */
export function persist() {
  if (!state) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('[store] 持久化失败', e);
  }
}

/** 获取完整 state（只读语义，调用方不应直接改） */
export function getState() {
  return state;
}

/** 用 mutator 修改 state：执行 → 落地 → 标脏 → 广播 */
export function update(fn) {
  if (!state) load();
  fn(state);
  state.meta.localDirty = true;
  persist();
  broadcast();
}

/** 直接替换整个 state（用于导入、同步拉取覆盖） */
export function replaceState(newState, opts = {}) {
  state = migrate(newState) || createInitialData();
  if (opts.markClean) state.meta.localDirty = false;
  persist();
  broadcast();
}

/** 订阅变更，返回取消订阅函数 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function broadcast() {
  for (const fn of listeners) {
    try { fn(state); } catch (e) { console.error('[store] 订阅回调出错', e); }
  }
}

/** 导出 JSON 字符串（用于数据导出/同步） */
export function exportJSON() {
  return JSON.stringify(state, null, 2);
}

/** 导入 JSON 字符串（用于数据导入兜底） */
export function importJSON(jsonStr) {
  const data = JSON.parse(jsonStr);
  replaceState(data);
}
