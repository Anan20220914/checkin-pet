// views/quiz-xiehouyu.js — 歇后语天地打卡界面
// 每周循环2句歇后语，展示emoji图解+文字解释，SRS调度确保后续重复

import { getState } from '../store.js';
import { XIEHOUYUS, getWeeklyXiehouyus } from '../idiom-data.js';
import { getMemory, grade } from '../srs2.js';
import { submitQuiz } from '../tasks.js';
import { todayKey } from '../utils.js';
import { showOverlay, closeOverlay, switchTab, celebrate } from '../app.js';

let state = null;

/** 计算两个日期键之间的天数差 */
function dayDiff(a, b) {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / 86400000);
}

/** 获取今天要展示的歇后语 */
function getTodayXiehouyu() {
  const weekly = getWeeklyXiehouyus();
  const mem = getMemory('xiehouyu');
  const today = todayKey();

  // 优先展示due的（需要复习的）
  for (const xhy of weekly) {
    const card = mem[xhy.id];
    if (card && card.due && dayDiff(card.due, today) <= 0) {
      return xhy;
    }
  }

  // 没有due的，按本周顺序循环（周一=0, 周二=1, 周三=0...）
  const dayOfWeek = new Date().getDay();
  const idx = ((dayOfWeek === 0 ? 6 : dayOfWeek - 1) % 2);
  return weekly[idx];
}

export function openXiehouyuQuiz(taskId) {
  const task = getState().tasks.find(t => t.id === taskId);
  if (!task) return;

  const xhy = getTodayXiehouyu();
  if (!xhy) return;

  state = { task, xhy };
  renderCard();
}

function renderCard() {
  if (!state) return;
  const { task, xhy } = state;
  const today = todayKey();

  // 检查今天是否已完成
  const isDoneToday = () => {
    const c = getState().checkins[today] || {};
    return !!(c[task.id] && c[task.id].done);
  };

  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qxBack">‹</span>
      <span class="quiz-title">歇后语天地</span>
      <span class="quiz-count">1/1</span>
    </div>
    <div class="xiehouyu-card">
      <div class="xiehouyu-emoji">${xhy.emoji}</div>
      <div class="xiehouyu-first">${xhy.first}</div>
      <div class="xiehouyu-dash">——</div>
      <div class="xiehouyu-second">${xhy.second}</div>
    </div>
    <div class="xiehouyu-section">
      <div class="xiehouyu-label">📖 歇后语解释</div>
      <div class="xiehouyu-meaning">${xhy.meaning}</div>
    </div>
    <button class="btn block big" id="qxLearn" ${isDoneToday() ? 'disabled' : ''}>
      ${isDoneToday() ? '✅ 今天已记住' : '我记住了'}
    </button>
  `;

  let submitting = false;
  showOverlay(html, {
    noClose: false,
    onMount: (card) => {
      card.querySelector('#qxBack').onclick = () => { closeOverlay(); state = null; };
      const learnBtn = card.querySelector('#qxLearn');
      if (learnBtn && !learnBtn.disabled) {
        learnBtn.onclick = () => {
          if (submitting) return;
          submitting = true;
          // 标记SRS
          grade('xiehouyu', xhy.id, 'good');
          // 提交打卡
          submitQuiz(task.id, { correct: 1, total: 1, passRate: 1, passed: true, detail: { xiehouyu: xhy.first } });
          state = null;
          closeOverlay();
          celebrate('歇后语天地打卡成功', `记住「${xhy.first}」· 获得 ${task.points} 积分`);
          setTimeout(() => switchTab('checkin'), 100);
        };
      }
    },
  });
}
