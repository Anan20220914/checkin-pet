// views/quiz-chinese.js — 识字打卡界面
// 从字库按 SRS 调度取 10 字，逐字展示，家长判 熟练/一般/不会，≥80% 熟练算通过

import { getState } from '../store.js';
import { ALL_CHINESE_CHARS, getChineseWords } from '../vocab-data.js';
import { buildDailyList, grade, getStats } from '../srs2.js';
import { submitQuiz } from '../tasks.js';
import { SRS_GRADE, RARITY_COLOR } from '../db2.js';
import { showOverlay, closeOverlay, toast, switchTab, celebrate } from '../app.js';
import { esc } from '../utils.js';

let state = null; // { task, list, idx, grades: [] }

export function openChineseQuiz(taskId) {
  const task = getState().tasks.find(t => t.id === taskId);
  if (!task) return;
  // 使用新的字库：两册共200字同时调度
  const allKeys = ALL_CHINESE_CHARS;
  // 当 SRS 学完当前阶段一定比例后自动解锁下一阶段（这里先不自动，家长在设置可手动升阶）
  const plan = buildDailyList('chinese', allKeys, task.dailyCount || 10, 3);
  const list = plan.all.length ? plan.all : allKeys.slice(0, task.dailyCount || 10);

  state = { task, list, idx: 0, grades: [], reviewCount: plan.review.length };
  renderCard();
}

function renderCard() {
  if (!state) return;
  if (state.idx >= state.list.length) {
    return finish();
  }
  const ch = state.list[state.idx];
  const total = state.list.length;
  const cur = state.idx + 1;

  const st = getStats('chinese');
  const words = getChineseWords(ch);
  const wordsHtml = words.length ? `<div class="word-groups">${words.map(w => `<span>${esc(w)}</span>`).join(' · ')}</div>` : '';
  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qcBack">‹</span>
      <span class="quiz-title">识字打卡</span>
      <span class="quiz-count">${cur}/${total}</span>
    </div>
    <div class="stats-bar">
      <span class="stat-good">熟练 ${st.good}</span>
      <span class="stat-ok">不太会 ${st.ok}</span>
      <span class="stat-again">不会 ${st.again}</span>
    </div>
    <div class="quiz-stage">
      <div class="big-char">${esc(ch)}</div>
      ${wordsHtml}
      <button class="btn secondary" id="qcTTS">🔊 听一听</button>
      <div class="quiz-tip">家长判断孩子认读熟练度</div>
    </div>
    <div class="quiz-grades">
      <button class="grade-btn good" data-g="good">👍 熟练</button>
      <button class="grade-btn ok" data-g="ok">🙂 一般</button>
      <button class="grade-btn again" data-g="again">🙏 不会</button>
    </div>
    <div class="quiz-progress">
      <div class="qp-fill" style="width:${(state.idx / total) * 100}%"></div>
    </div>
  `;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qcBack').onclick = () => { closeOverlay(); state = null; };
      card.querySelector('#qcTTS').onclick = () => {
        // 用中文 TTS 读字
        if (window.speechSynthesis) {
          const u = new SpeechSynthesisUtterance(ch);
          u.lang = 'zh-CN'; u.rate = 0.9;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        }
      };
      card.querySelectorAll('.grade-btn').forEach(btn => {
        btn.onclick = () => {
          const g = btn.dataset.g;
          state.grades.push(g);
          grade('chinese', ch, g);
          state.idx++;
          renderCard();
        };
      });
    },
  });
}

function finish() {
  const total = state.list.length;
  const goodCount = state.grades.filter(g => g === SRS_GRADE.GOOD).length;
  const okCount = state.grades.filter(g => g === SRS_GRADE.OK).length;
  const againCount = state.grades.filter(g => g === SRS_GRADE.AGAIN).length;
  // 通过率：熟练占比 ≥80%（一般也算"会"，但熟练率才是通过线）
  const passRate = total ? goodCount / total : 0;
  const passed = passRate >= (state.task.passRate || 0.8);

  const result = {
    correct: goodCount + okCount, // 认得的
    total,
    passRate,
    passed,
    detail: { good: goodCount, ok: okCount, again: againCount },
  };
  submitQuiz(state.task.id, result);
  const savedTask = state.task;
  state = null;
  if (passed) { closeOverlay(); celebrate('识字打卡成功', `获得 ${savedTask.points} 积分`); setTimeout(()=>switchTab('checkin'),100); return; }

  const html = `<h2>💪 再接再厉</h2><div class="desc">认读 ${goodCount + okCount}/${total} 字 · 获得 ${Math.max(1, Math.round(savedTask.points/3))} 鼓励分，明天再战</div><button class="btn block" id="qcDone">完成</button>`;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qcDone').onclick = () => { closeOverlay(); switchTab('checkin'); };
    },
  });
}
