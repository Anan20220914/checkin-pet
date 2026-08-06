// utils.js — 通用工具函数（无依赖，纯函数）

/** 生成唯一 ID：prefix + 时间36进制 + 随机4位 */
export function uid(prefix = 'id') {
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

/** 本地日期键 YYYY-MM-DD（以孩子所在时区为准，避免 UTC 错位） */
export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 简单整数随机 [min,max] 含两端 */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 抖动 -2..+2 */
export function roll() {
  return randInt(-2, 2);
}

/** 区间随机浮点 */
export function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/** 加权随机选择：items=[{...}], weightKey 默认 'weight'，返回选中项 */
export function weightedPick(items, weightKey = 'weight') {
  const total = items.reduce((s, it) => s + (it[weightKey] || 0), 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= (it[weightKey] || 0);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

/** 概率判定，p∈[0,1] */
export function chance(p) {
  return Math.random() < p;
}

/** UTF-8 安全 base64 编码（btoa 不支持中文） */
export function b64encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

/** UTF-8 安全 base64 解码 */
export function b64decode(b64) {
  return decodeURIComponent(escape(atob(b64)));
}

/** HTML 转义，防 XSS（孩子昵称等用户输入） */
export function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 简单深克隆 */
export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** 数值限幅 */
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/** Fisher-Yates 洗牌（返回新数组） */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 从数组随机取 n 个（不重复） */
export function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}

/** ISO 时间戳格式化为本地可读 "MM-DD HH:mm" */
export function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${mm}-${dd} ${hh}:${mi}`;
}

/** 把分钟数格式化为 "X小时Y分钟" */
export function fmtMinutes(min) {
  if (min < 60) return `${min}分钟`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}小时${m}分钟` : `${h}小时`;
}

/** 时间戳差转剩余倒计时描述（用于蛋孵化） */
export function fmtCountdown(targetMs, nowMs = Date.now()) {
  const diff = targetMs - nowMs;
  if (diff <= 0) return '可孵化';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}小时${m}分钟后`;
  return `${m}分钟后`;
}

/** 距今天数（用于日期标签） */
export function dayOffset(dateKey, base = todayKey()) {
  const a = new Date(dateKey + 'T00:00:00');
  const b = new Date(base + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

/** 相对日期文案：今天/昨天/X天前 */
export function relDay(dateKey, base = todayKey()) {
  const off = dayOffset(dateKey, base);
  if (off === 0) return '今天';
  if (off === 1) return '昨天';
  if (off > 0) return `${off}天前`;
  return `${-off}天后`;
}
