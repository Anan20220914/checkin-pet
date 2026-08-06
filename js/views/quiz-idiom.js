// views/quiz-idiom.js — 成语园地打卡界面
// 每周循环3个成语，展示emoji图解+文字解释，SRS调度确保后续重复

import { getState } from '../store.js';
import { IDIOMS, getWeeklyIdioms } from '../idiom-data.js';
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

/** 获取今天要展示的成语 */
function getTodayIdiom() {
  const weekly = getWeeklyIdioms();
  const mem = getMemory('idiom');
  const today = todayKey();

  // 优先展示due的（需要复习的）
  for (const idiom of weekly) {
    const card = mem[idiom.id];
    if (card && card.due && dayDiff(card.due, today) <= 0) {
      return idiom;
    }
  }

  // 没有due的，按本周顺序循环（周一=0, 周二=1, 周三=2, 周四=0...）
  const dayOfWeek = new Date().getDay();
  const idx = ((dayOfWeek === 0 ? 6 : dayOfWeek - 1) % 3);
  return weekly[idx];
}

export function openIdiomQuiz(taskId) {
  const task = getState().tasks.find(t => t.id === taskId);
  if (!task) return;

  const idiom = getTodayIdiom();
  if (!idiom) return;

  state = { task, idiom };
  renderCard();
}

function renderCard() {
  if (!state) return;
  const { task, idiom } = state;
  const today = todayKey();

  // 检查今天是否已完成
  const isDoneToday = () => {
    const c = getState().checkins[today] || {};
    return !!(c[task.id] && c[task.id].done);
  };

  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qiBack">‹</span>
      <span class="quiz-title">成语园地</span>
      <span class="quiz-count">1/1</span>
    </div>
    <div class="idiom-card">
      <div class="idiom-emoji">${idiom.emoji}</div>
      <div class="idiom-text">${idiom.text}</div>
      <div class="idiom-pinyin">${idiom.pinyin}</div>
    </div>
    <div class="idiom-section">
      <div class="idiom-label">📖 成语解释</div>
      <div class="idiom-meaning">${idiom.meaning}</div>
    </div>
    <div class="idiom-section">
      <div class="idiom-label">💡 例句</div>
      <div class="idiom-example">${idiom.example}</div>
    </div>
    <button class="btn block big" id="qiLearn" ${isDoneToday() ? 'disabled' : ''}>
      ${isDoneToday() ? '✅ 今天已学会' : '我学会了'}
    </button>
  `;

  let submitting = false;
  showOverlay(html, {
    noClose: false,
    onMount: (card) => {
      card.querySelector('#qiBack').onclick = () => { closeOverlay(); state = null; };
      const learnBtn = card.querySelector('#qiLearn');
      if (learnBtn && !learnBtn.disabled) {
        learnBtn.onclick = () => {
          if (submitting) return;
          submitting = true;
          // 标记SRS
          grade('idiom', idiom.id, 'good');
          // 提交打卡
          submitQuiz(task.id, { correct: 1, total: 1, passRate: 1, passed: true, detail: { idiom: idiom.text } });
          state = null;
          closeOverlay();
          celebrate('成语园地打卡成功', `学会「${idiom.text}」· 获得 ${task.points} 积分`);
          setTimeout(() => switchTab('checkin'), 100);
        };
      }
    },
  });
}
