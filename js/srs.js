// srs.js — 间隔重复调度（循环记忆）
// 每个字/单词在 memory 里记录 { box, interval, due, lastGrade, seenCount }
// box=0 未学过；box>=1 已学，box 越高记得越牢
// 调度：
//   熟练(good) → box+1，interval 拉长（1→2→4→7→14→30 天）
//   一般(ok)   → box 不变，interval 缩短到次日复习（保证"一般"次日也出现）
//   不会(again)→ box 归 1，due 设为次日（必出现）

import { getState, update } from './store.js';
import { todayKey } from './utils.js';
import { SRS_GRADE } from './db2.js';

const INTERVALS = [0, 1, 2, 4, 7, 14, 30, 60]; // box 对应的间隔天数（box=0 未学）

function dayDiff(a, b) {
  const da = new Date(a + 'T00:00:00');
  const db2 = new Date(b + 'T00:00:00');
  return Math.round((db2 - da) / 86400000);
}

/** 取某学科记忆表 */
export function getMemory(subject) {
  const s = getState();
  return s.memory[subject] || {};
}

/** 某字/词的当前记忆状态 */
export function getCard(subject, key) {
  return getMemory(subject)[key] || null;
}

/** 记录一次判定，更新记忆状态 */
export function grade(subject, key, gradeStr) {
  update(s => {
    const mem = s.memory[subject] || (s.memory[subject] = {});
    const card = mem[key] || { box: 0, interval: 0, due: todayKey(), lastGrade: null, seenCount: 0 };
    const today = todayKey();
    card.seenCount = (card.seenCount || 0) + 1;
    card.lastGrade = gradeStr;
    card.lastSeen = today;
    const isPoem = subject === 'poem';
    if (gradeStr === SRS_GRADE.GOOD) {
      card.box = Math.min(7, (card.box || 0) + 1);
      card.interval = isPoem ? 15 : 7;
    } else if (gradeStr === SRS_GRADE.OK) {
      card.box = Math.max(1, card.box || 1);
      card.interval = 1;
    } else {
      card.box = 1;
      card.interval = 1;
    }
    const due = new Date(today + 'T00:00:00');
    due.setDate(due.getDate() + card.interval);
    const y = due.getFullYear();
    const m = String(due.getMonth() + 1).padStart(2, '0');
    const d = String(due.getDate()).padStart(2, '0');
    card.due = `${y}-${m}-${d}`;
    mem[key] = card;
  });
}

/**
 * 生成本日学习清单（识字/英语通用）
 * @param subject 'chinese' | 'english'
 * @param allKeys 全部可选 key 数组（识字=字, 英语=单词）
 * @param perDay 每日总数
 * @param reviewMin 复习占位下限
 * @returns { review: [], fresh: [], all: [] }
 */
export function buildDailyList(subject, allKeys, perDay = 10, reviewMin = 3) {
  const today = todayKey();
  const mem = getMemory(subject);
  const isPoem = subject === 'poem';
  const notLearned = [], dueAgain = [], dueReview = [], learnedRecent = [], learnedOld = [];
  for (const key of allKeys) {
    const c = mem[key];
    if (!c || c.box === 0) { notLearned.push(key); continue; }
    if (c.lastGrade === SRS_GRADE.AGAIN) { dueAgain.push(key); continue; }
    if (c.due && dayDiff(c.due, today) <= 0) { dueReview.push(key); continue; }
    const lastSeen = c.lastSeen || c.due || today;
    if (dayDiff(lastSeen, today) <= 7) learnedRecent.push(key); else learnedOld.push(key);
  }
  if (isPoem) {
    let pick = dueAgain[0] || dueReview[0] || notLearned[0] || allKeys[0] || '';
    return { review: [], fresh: [pick], all: [pick], dueCount: dueAgain.length, learnedCount: allKeys.length - notLearned.length };
  }
  const all = [];
  for (const k of dueAgain) { if (all.length < perDay) all.push(k); }
  for (const k of dueReview) { if (all.length < perDay && !all.includes(k)) all.push(k); }
  const rT = Math.max(0, Math.round(perDay * 0.2)), rP = shuffleArr(learnedRecent);
  for (let i = 0; i < rT && i < rP.length; i++) { if (all.length < perDay && !all.includes(rP[i])) all.push(rP[i]); }
  const oT = Math.max(0, Math.round(perDay * 0.1)), oP = shuffleArr(learnedOld);
  for (let i = 0; i < oT && i < oP.length; i++) { if (all.length < perDay && !all.includes(oP[i])) all.push(oP[i]); }
  for (const k of notLearned) { if (all.length >= perDay) break; if (!all.includes(k)) all.push(k); }
  if (all.length < perDay) { const pool = shuffleArr([...learnedRecent, ...learnedOld]); for (const k of pool) { if (all.length >= perDay) break; if (!all.includes(k)) all.push(k); } }
  return { review: [], fresh: [], all: all.slice(0, perDay), dueCount: dueAgain.length, learnedCount: allKeys.length - notLearned.length };
}
function shuffleArr(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/**
 * 统计某学科（chinese/english/poem）掌握情况
 * 熟练：box>=3 且 lastGrade=good
 * 不太会：学过(box>=1) 但未达熟练
 * 不会：lastGrade=again
 */
export function getStats(subject) {
  const mem = getMemory(subject);
  let good = 0, ok = 0, again = 0;
  for (const key of Object.keys(mem)) {
    const c = mem[key];
    if (!c || c.box === 0) continue;
    if (c.lastGrade === SRS_GRADE.AGAIN) again++;
    else if (c.lastGrade === SRS_GRADE.GOOD) good++;
    else ok++;
  }
  return { good, ok, again, total: good + ok + again };
}
