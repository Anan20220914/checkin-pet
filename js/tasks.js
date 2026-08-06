// tasks.js — 任务查询 + 当日打卡结果记录（勾选/答题/战斗三种）

import { getState, update } from './store.js';
import { todayKey, clone } from './utils.js';
import { CATEGORIES, TASK_KIND } from './db2.js';

/** 取今日 checkin 记录（不存在则创建空） */
export function getTodayCheckin() {
  const today = todayKey();
  if (!getState().checkins[today]) {
    update(s => { if (!s.checkins[today]) s.checkins[today] = {}; });
  }
  return getState().checkins[today];
}

/** 今日某任务是否已完成 */
export function isTaskDone(taskId) {
  const today = todayKey();
  const c = getState().checkins[today] || {};
  return !!(c[taskId] && c[taskId].done);
}

/** 取任务定义 */
export function getTask(taskId) {
  return getState().tasks.find(t => t.id === taskId);
}

/** 按分类取启用的任务 */
export function getTasksByCategory() {
  const s = getState();
  const groups = {};
  for (const cat of Object.keys(CATEGORIES)) groups[cat] = [];
  for (const t of s.tasks) {
    if (t.active && groups[t.category]) groups[t.category].push(t);
  }
  return groups;
}

/* ---------- 勾选型打卡（习惯/运动/家务） ---------- */

/** 切换勾选任务完成状态 */
export function toggleCheckTask(taskId) {
  const task = getTask(taskId);
  if (!task || task.kind !== TASK_KIND.CHECK) return;
  getTodayCheckin();
  const wasDone = isTaskDone(taskId);
  update(s => {
    const today = todayKey();
    const c = s.checkins[today];
    if (wasDone) {
      delete c[taskId];
      s.wallet.points = Math.max(0, s.wallet.points - task.points);
    } else {
      c[taskId] = { done: true, score: task.points };
      s.wallet.points += task.points;
      s.wallet.totalEarned += task.points;
    }
  });
}

/* ---------- 答题型打卡（识字/英语/数学）结果提交 ---------- */

/**
 * 提交答题结果
 * @param taskId 任务id
 * @param result { correct, total, passRate, passed, detail }
 *   passed=false 时不给全额积分，给 1/3 鼓励分；不扣回已给分
 */
export function submitQuiz(taskId, result) {
  const task = getTask(taskId);
  if (!task) return;
  getTodayCheckin();
  const wasDone = isTaskDone(taskId);
  update(s => {
    const today = todayKey();
    const c = s.checkins[today];
    if (wasDone) {
      // 已完成过：更新结果但不重复加分
      c[taskId] = { ...c[taskId], done: result.passed, ...result };
      return;
    }
    const score = result.passed ? task.points : Math.max(1, Math.round(task.points / 3));
    c[taskId] = { done: result.passed, score, ...result };
    if (result.passed) {
      s.wallet.points += task.points;
      s.wallet.totalEarned += task.points;
    } else {
      s.wallet.points += score;
      s.wallet.totalEarned += score;
    }
  });
}

/** 取今日某答题任务结果 */
export function getQuizResult(taskId) {
  const today = todayKey();
  const c = getState().checkins[today] || {};
  return c[taskId] || null;
}

/* ---------- 战斗型打卡（英语开口） ---------- */

/** 记录开口战斗结果 */
export function submitSpeakBattle(taskId, result) {
  const task = getTask(taskId);
  if (!task) return;
  getTodayCheckin();
  const wasDone = isTaskDone(taskId);
  update(s => {
    const today = todayKey();
    const c = s.checkins[today];
    const score = result.passed ? task.points : Math.max(1, Math.round(task.points / 3));
    c[taskId] = { done: result.passed, score, ...result };
    if (!wasDone) {
      s.wallet.points += score;
      s.wallet.totalEarned += score;
    }
    // 开口打卡成功计入开口胜场统计（用于成就）
    if (result.passed && taskId === 'q_speak' && !wasDone) {
      s.stats.totalSpeakWins = (s.stats.totalSpeakWins || 0) + 1;
    }
  });
}

/* ---------- 今日进度统计 ---------- */

/** 今日完成数 / 总数 / 已得积分 */
export function getTodayProgress() {
  const s = getState();
  const today = todayKey();
  const c = s.checkins[today] || {};
  const activeTasks = s.tasks.filter(t => t.active);
  let done = 0, earned = 0;
  for (const t of activeTasks) {
    const r = c[t.id];
    if (r && r.done) { done++; earned += r.score || 0; }
    else if (r && !r.done && r.score) { earned += r.score; } // 失败也拿了鼓励分
  }
  return { done, total: activeTasks.length, earned };
}

/** 学习模块完成数（识字/英语/数学/开口 中完成的数量） */
export function getStudyDoneCount() {
  const s = getState();
  const today = todayKey();
  const c = s.checkins[today] || {};
  return s.tasks.filter(t => t.category === 'study' && c[t.id] && c[t.id].done).length;
}

/* ---------- 每日对决记录 ---------- */

/** 今日是否已发起每日对决 */
export function isDailyDuelDone() {
  const s = getState();
  const today = todayKey();
  const c = s.checkins[today] || {};
  return !!c.dailyDuel;
}

/** 记录每日对决结果 */
export function recordDailyDuel(result) {
  update(s => {
    const today = todayKey();
    if (!s.checkins[today]) s.checkins[today] = {};
    s.checkins[today].dailyDuel = result; // { result: 'win'|'lose', dropEgg, reward, monsterId }
  });
}

/* ---------- 任务管理（设置页用） ---------- */

export function addTask(task) {
  update(s => { s.tasks.push({ id: 'u_' + Date.now().toString(36), kind: TASK_KIND.CHECK, active: true, custom: true, ...task }); });
}
export function updateTask(id, patch) {
  update(s => { const t = s.tasks.find(x => x.id === id); if (t) Object.assign(t, patch); });
}
export function deleteTask(id) {
  update(s => {
    const idx = s.tasks.findIndex(x => x.id === id);
    if (idx < 0) return;
    if (s.tasks[idx].custom) s.tasks.splice(idx, 1);
    else s.tasks[idx].active = false;
  });
}
export function toggleTaskActive(id) {
  update(s => { const t = s.tasks.find(x => x.id === id); if (t) t.active = !t.active; });
}
