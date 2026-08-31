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

/** 获取昨天的日期字符串（yyyy-mm-dd） */
function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
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
    if (gradeStr === SRS_GRADE.GOOD) {
      card.box = Math.min(7, (card.box || 0) + 1);
      // 古诗学会后间隔设为2天（确保次日换新诗，2天后可随机复习）
      if (subject === 'poem') {
        card.interval = Math.max(2, INTERVALS[card.box] || 2);
      } else {
        card.interval = INTERVALS[card.box] || 7;
      }
    } else if (gradeStr === SRS_GRADE.OK) {
      card.box = Math.max(1, card.box || 1);
      // "一般"也适当拉长间隔，但比"熟练"短
      card.interval = Math.max(1, (INTERVALS[card.box] || 7) >> 1);
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
 *
 * 调度规则（2026-08-13 修订）：
 *   - 昨天不会/一般的字 → 必出现（强化复习，不属于"学会的"）
 *   - 学会的内容（昨天熟练 + 到期复习 + 历史学过）→ 仅占 20%
 *   - 新字/未学过的 → 占 80%，确保持续学习新内容
 */
export function buildDailyList(subject, allKeys, perDay = 10, reviewMin = 3) {
  const today = todayKey();
  const yesterday = getYesterdayKey();
  const mem = getMemory(subject);
  const isPoem = subject === 'poem';
  const notLearned = [], dueReview = [], learnedRecent = [], learnedOld = [];
  // 昨天标记为"不会"或"一般"的字（今天必出现）
  const yesterdayWeak = [];
  // 昨天熟练的字（用于循环记忆：熟练的字次日重复）
  const yesterdayGood = [];
  for (const key of allKeys) {
    const c = mem[key];
    if (!c || c.box === 0) { notLearned.push(key); continue; }
    // 昨天标记为"不会"或"一般"的 → 今天必出现
    if (c.lastSeen === yesterday && (c.lastGrade === SRS_GRADE.AGAIN || c.lastGrade === SRS_GRADE.OK)) {
      yesterdayWeak.push(key);
      continue;
    }
    if (c.due && dayDiff(c.due, today) >= 0) { dueReview.push(key); continue; }
    // 昨天标记为熟练的字
    if (c.lastGrade === SRS_GRADE.GOOD && c.lastSeen === yesterday) {
      yesterdayGood.push(key);
    }
    const lastSeen = c.lastSeen || c.due || today;
    if (dayDiff(lastSeen, today) <= 7) learnedRecent.push(key); else learnedOld.push(key);
  }
  if (isPoem) {
    // 古诗刷新逻辑（2026-08-31 修订）：
    // 规则：
    //   1. 今天/昨天标记为"不会/一般"的诗 → 次日继续推送同一首
    //   2. 学会(good)的诗 → 次日换新诗；学会的那首在一个月内会随机出现几次复习
    //   3. 排除昨天刚学会的诗（确保"学会了"次日一定换新诗）
    //   4. 都没有则从未学过的诗中随机选一首新的

    // 0. 指定今日古诗（家长手动指定，优先级最高）
    const s = getState();
    const forcedPoem = s.forcedPoem;
    if (forcedPoem && forcedPoem.title && forcedPoem.date === today) {
      const key = forcedPoem.title;
      if (allKeys.includes(key)) {
        return { review: [], fresh: [key], all: [key], dueCount: 0, learnedCount: allKeys.length - notLearned.length };
      }
    }

    // 1. 找出今天或昨天标记为"不会/一般"的诗 → 必须继续学同一首
    const weakPoems = [];
    for (const key of allKeys) {
      const c = mem[key];
      if (!c || c.box === 0) continue;
      if ((c.lastSeen === today || c.lastSeen === yesterday) &&
          (c.lastGrade === SRS_GRADE.AGAIN || c.lastGrade === SRS_GRADE.OK)) {
        weakPoems.push(key);
      }
    }

    // 2. 找出到期可复习的诗（学会的，且距今超过2天，排除昨天/今天刚学的）
    const reviewablePoems = [];
    for (const key of allKeys) {
      const c = mem[key];
      if (!c || c.box === 0) continue;
      if (c.lastGrade === SRS_GRADE.GOOD && c.due && dayDiff(c.due, today) >= 0) {
        // 排除昨天和今天刚学会的（确保学会次日换新诗）
        if (c.lastSeen !== yesterday && c.lastSeen !== today) {
          reviewablePoems.push(key);
        }
      }
    }

    let pick = '';
    // 优先：不会/一般的诗继续学同一首
    if (weakPoems.length > 0) {
      pick = weakPoems[0];
    }
    // 其次：50% 概率随机复习一首学过的诗（一个月内随机出现几次）
    else if (reviewablePoems.length > 0 && Math.random() < 0.5) {
      pick = reviewablePoems[Math.floor(Math.random() * reviewablePoems.length)];
    }
    // 最后：从未学过的诗中随机选一首新的
    if (!pick) {
      pick = notLearned.length
        ? notLearned[Math.floor(Math.random() * notLearned.length)]
        : (reviewablePoems.length
            ? reviewablePoems[Math.floor(Math.random() * reviewablePoems.length)]
            : (allKeys[0] || ''));
    }
    return { review: [], fresh: [pick], all: [pick], dueCount: weakPoems.length, learnedCount: allKeys.length - notLearned.length };
  }
  const all = [];
  // 1. 昨天不会或一般的字 → 最多占 50%（强化复习，但不挤占新词名额）
  const weakBudget = Math.min(yesterdayWeak.length, Math.ceil(perDay * 0.5));
  const shuffledWeak = shuffleArr(yesterdayWeak);
  for (let i = 0; i < weakBudget; i++) { if (all.length < perDay) all.push(shuffledWeak[i]); }
  // 2. 学会的内容仅占 20%（昨天熟练 + 到期复习 + 历史学过，合并后取 20%）
  const reviewBudget = Math.max(0, Math.round(perDay * 0.2));
  const reviewPool = shuffleArr([...yesterdayGood, ...dueReview, ...learnedRecent, ...learnedOld]);
  for (let i = 0; i < reviewBudget && i < reviewPool.length; i++) {
    if (all.length < perDay && !all.includes(reviewPool[i])) all.push(reviewPool[i]);
  }
  // 3. 新字补足剩余（优先未学过的，保证每天有新词）
  const shuffledFresh = shuffleArr(notLearned);
  for (const k of shuffledFresh) {
    if (all.length >= perDay) break;
    if (!all.includes(k)) all.push(k);
  }
  // 4. 兜底：如果新字不够，从已学中随机补足
  if (all.length < perDay) {
    const pool = shuffleArr([...learnedRecent, ...learnedOld, ...dueReview]);
    for (const k of pool) {
      if (all.length >= perDay) break;
      if (!all.includes(k)) all.push(k);
    }
  }
  return { review: [], fresh: [], all: all.slice(0, perDay), dueCount: yesterdayWeak.length, learnedCount: allKeys.length - notLearned.length };
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
