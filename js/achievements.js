// achievements.js — 成就检测与解锁

import { getState, update } from './store.js';
import { ACHIEVEMENTS } from './db2.js';

/** 检测所有成就，解锁新达成的，返回新解锁列表 */
export function checkAchievements() {
  const s = getState();
  const newly = [];
  for (const a of ACHIEVEMENTS) {
    if (s.achievements.unlocked.includes(a.id)) continue;
    let hit = false;
    try { hit = a.check(s); } catch (e) { hit = false; }
    if (hit) newly.push(a);
  }
  if (newly.length) {
    update(st => {
      for (const a of newly) {
        if (!st.achievements.unlocked.includes(a.id)) st.achievements.unlocked.push(a.id);
      }
    });
  }
  return newly;
}

/** 获取成就展示列表（含解锁状态） */
export function getAchievementList() {
  const s = getState();
  return ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: s.achievements.unlocked.includes(a.id),
  }));
}

/** 标记已查看（去红点） */
export function markSeen() {
  update(st => {
    st.achievements.seen = [...st.achievements.unlocked];
  });
}

/** 有未查看的新成就 */
export function hasUnseen() {
  const s = getState();
  return s.achievements.unlocked.some(id => !s.achievements.seen.includes(id));
}
