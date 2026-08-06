// weekly.js — 周日礼物结算

import { getState, update } from './store.js';
import { WEEKLY_GIFTS, giftTierForWins } from './db2.js';
import { todayKey, dayOffset } from './utils.js';

/** 取本周一日期键（YYYY-MM-DD） */
export function weekStartKey(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0=周日, 1=周一
  const diff = day === 0 ? -6 : 1 - day; // 回到周一
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** 统计本周（周一至今）每日对决胜利数 */
export function weekWins() {
  const s = getState();
  const ws = weekStartKey();
  return (s.battles || []).filter(b => b.result === 'win' && dayOffset(ws, b.date) >= 0).length;
}

/**
 * 周日（getDay()===0）调用：结算本周礼物
 * @returns 本次结算的礼物，或 null（非周日/已结算）
 */
export function settleWeeklyGift() {
  const now = new Date();
  if (now.getDay() !== 0) return null; // 仅周日
  const ws = weekStartKey(now);
  const s = getState();
  if (s.weeklyGift && s.weeklyGift.weekStart === ws) return null; // 本周已结算
  const wins = weekWins();
  const gift = giftTierForWins(wins);
  update(st => {
    st.weeklyGift = st.weeklyGift || { history: [] };
    st.weeklyGift.weekStart = ws;
    st.weeklyGift.giftId = gift.tier;
    st.weeklyGift.gift = gift;
    st.weeklyGift.history = st.weeklyGift.history || [];
    st.weeklyGift.history.push({ week: ws, tier: gift.tier, giftId: gift.tier, name: gift.name, wins });
  });
  return gift;
}

/** 取当前应展示的周日礼物（本周已结算则用之，否则预览当前等级） */
export function currentGiftPreview() {
  const s = getState();
  const ws = weekStartKey();
  if (s.weeklyGift && s.weeklyGift.weekStart === ws && s.weeklyGift.gift) {
    return { ...s.weeklyGift.gift, settled: true, wins: weekWins() };
  }
  return { ...giftTierForWins(weekWins()), settled: false, wins: weekWins() };
}

/** 礼物历史 */
export function giftHistory() {
  return (getState().weeklyGift?.history || []).slice().reverse();
}
