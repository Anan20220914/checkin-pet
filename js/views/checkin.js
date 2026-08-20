// views/checkin.js — 打卡页：时间轴+圆角卡片布局

import { getState } from '../store.js';
import {
  getTasksByCategory, toggleCheckTask, isTaskDone, getQuizResult, getTodayProgress,
  getStudyDoneCount, isDailyDuelDone,
} from '../tasks.js';
import { CATEGORIES, TASK_KIND } from '../db2.js';
import { esc } from '../utils.js';
import { switchTab } from '../app.js';
import { currentGiftPreview } from '../weekly.js';
import { openChineseQuiz } from './quiz-chinese.js';
import { openEnglishQuiz } from './quiz-english.js';
import { openMathQuiz } from './quiz-math.js';
import { openPoemQuiz } from './quiz-poem.js';
import { openBrainQuiz } from './quiz-brain.js';
import { openSpeakBattle } from './quiz-speak.js';
import { openIdiomQuiz } from './quiz-idiom.js';
import { openXiehouyuQuiz } from './quiz-xiehouyu.js';


// 模块级子视图状态
let subView = 'home'; // 'home' | 'study' | 'habit' | 'sport' | 'life'
let selectedCategory = null;

/** 切换 tab 时重置回主页（app.js switchTab 调用） */
export function resetSubView() { subView = 'home'; selectedCategory = null; }

function setSubView(v) { subView = v; renderCheckin(); document.getElementById('view-checkin').scrollTop = 0; }

export function renderCheckin() {
  if (subView === 'home') return renderHome();
  if (subView === 'study') return renderStudy();
  return renderCheckList(subView); // habit | sport | life
}

/* ============ 主界面（时间轴布局） ============ */
function renderHome() {
  const s = getState();
  const prog = getTodayProgress();
  const pct = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
  const studyDone = getStudyDoneCount();
  const dueled = isDailyDuelDone();

  // 各分类完成数
  const groups = getTasksByCategory();

  let html = '';

  // 进度概览（简化）
  html += `
    <div class="card home-progress" style="text-align:center;padding:20px;">
      <div style="font-size:36px;font-weight:900;color:var(--primary);">${pct}%</div>
      <div style="font-size:14px;color:var(--text-soft);margin-top:4px;">今日打卡进度 · ${prog.done}/${prog.total} 项</div>
      <div style="font-size:16px;font-weight:700;color:var(--accent-dark);margin-top:8px;">已得 ${prog.earned} 🪙</div>
      <!-- 进度条 -->
      <div class="hp-bar" style="margin-top:12px;height:8px;">
        <div class="fill" style="width:${pct}%;background:linear-gradient(90deg, var(--primary), var(--accent));"></div>
      </div>
    </div>
  `;

  // 时间轴布局
  html += `<div class="timeline">`;

  // 学习模块（单独处理）
  const studyTasks = s.tasks.filter(t => t.category === 'study' && t.active);
  const studyTotal = studyTasks.length;
  const studyPassed = studyTasks.filter(t => isTaskDone(t.id)).length;
  const studyPct = studyTotal > 0 ? Math.round((studyPassed / studyTotal) * 100) : 0;

  html += `
    <div class="timeline-item ${studyPassed >= studyTotal ? 'done' : ''}">
      <div class="task-card ${studyPassed >= studyTotal ? 'done' : ''} study" data-go="study">
        <div class="tc-icon">📚</div>
        <div class="tc-body">
          <div class="tc-title">学习打卡</div>
          <div class="tc-sub">${studyPassed}/${studyTotal} 完成 · ${studyDone}/${studyTotal} 通过</div>
        </div>
        <div style="font-size:20px;">${studyPassed >= studyTotal ? '✅' : '👉'}</div>
      </div>
    </div>
  `;

  // 其他分类
  const cats = [
    { key: 'habit', icon: '🌱', name: '习惯养成', theme: 'habit' },
    { key: 'sport', icon: '⚽', name: '运动打卡', theme: 'sport' },
    { key: 'life', icon: '🏠', name: '家务打卡', theme: 'life' },
  ];

  for (const cat of cats) {
    const list = groups[cat.key] || [];
    const done = list.filter(t => isTaskDone(t.id)).length;
    const total = list.length;
    const isDone = done >= total;
    const earned = list.filter(t => isTaskDone(t.id)).reduce((s, t) => s + t.points, 0);

    html += `
      <div class="timeline-item ${isDone ? 'done' : ''}">
        <div class="task-card ${isDone ? 'done' : ''} ${cat.theme}" data-go="${cat.key}">
          <div class="tc-icon">${cat.icon}</div>
          <div class="tc-body">
            <div class="tc-title">${cat.name}</div>
            <div class="tc-sub">${done}/${total} 完成 · 已得 ${earned} 分</div>
          </div>
          <div style="font-size:20px;">${isDone ? '✅' : '👉'}</div>
        </div>
      </div>
    `;
  }

  html += `</div>`;

  document.getElementById('view-checkin').innerHTML = html;

  // 绑定入口
  document.getElementById('view-checkin').querySelectorAll('.task-card').forEach(t => {
    t.onclick = () => setSubView(t.dataset.go);
  });
}

/* ============ 学习子页 ============ */
function renderStudy() {
  const s = getState();
  const tasks = s.tasks.filter(t => t.category === 'study' && t.active);
  let html = subHeader('学习打卡', '📚');

  html += `<div class="study-grid">`;
  for (const t of tasks) {
    const result = getQuizResult(t.id);
    const passed = result && result.done;
    const isBattle = t.kind === TASK_KIND.BATTLE;
    let sub;
    if (isBattle) sub = passed ? '✓ 打败读音小怪' : '读词攻击小怪';
    else if (t.quizType === 'idiom') sub = passed ? `✓ 已学会` : `每日1个`;
    else if (t.quizType === 'xiehouyu') sub = passed ? `✓ 已读完` : `每日1篇`;
    else sub = passed ? `✓ ${result.correct}/${result.total} 通过` : `每日${t.dailyCount}题`;
    html += `
      <div class="study-tile ${passed ? 'done' : ''} ${isBattle ? 'battle' : ''}" data-task="${t.id}">
        <div class="tile-icon">${isBattle ? '🗣️' : t.icon}</div>
        <div class="tile-name">${esc(t.title)}</div>
        <div class="tile-sub">${sub}</div>
        ${passed ? '<div class="tile-check">✓</div>' : ''}
      </div>
    `;
  }
  html += `</div>`;

  document.getElementById('view-checkin').innerHTML = html;
  document.getElementById('view-checkin').querySelector('#subBack').onclick = () => setSubView('home');
  document.getElementById('view-checkin').querySelectorAll('.study-tile').forEach(node => {
    node.onclick = () => {
      const t = getState().tasks.find(x => x.id === node.dataset.task);
      if (!t) return;
      if (t.quizType === 'chinese') openChineseQuiz(t.id);
      else if (t.quizType === 'english') openEnglishQuiz(t.id);
      else if (t.quizType === 'math') openMathQuiz(t.id);
      else if (t.quizType === 'poem') openPoemQuiz(t.id);
      else if (t.quizType === 'brain') openBrainQuiz(t.id);
      else if (t.quizType === 'speak') openSpeakBattle(t.id);
      else if (t.quizType === 'idiom') openIdiomQuiz(t.id);
      else if (t.quizType === 'xiehouyu') openXiehouyuQuiz(t.id);
    };
  });
}

/* ============ 习惯/运动/家务勾选子页（时间轴） ============ */
function renderCheckList(cat) {
  const meta = CATEGORIES[cat];
  const groups = getTasksByCategory();
  const list = groups[cat] || [];
  let html = subHeader(meta.name, meta.emoji);

  const done = list.filter(t => isTaskDone(t.id)).length;
  const earnedPts = list.filter(t=>isTaskDone(t.id)).reduce((s,t)=>s+t.points,0);
  html += `<div class="sub-summary">已勾选 ${done} 项 · 已得 ${earnedPts} 分</div>`;

  html += `<div class="timeline">`;
  for (const t of list) {
    const isDone = isTaskDone(t.id);
    html += `
      <div class="timeline-item ${isDone ? 'done' : ''}">
        <div class="task ${isDone ? 'done' : ''}" data-check="${t.id}">
          <div class="t-icon">${t.icon || '⭐'}</div>
          <div class="t-body">
            <div class="t-title">${esc(t.title)}</div>
            <div class="t-pts">+${t.points} 积分</div>
          </div>
          <div class="t-check">${isDone ? '✓' : ''}</div>
        </div>
      </div>
    `;
  }
  html += `</div>`;

  document.getElementById('view-checkin').innerHTML = html;
  document.getElementById('view-checkin').querySelector('#subBack').onclick = () => setSubView('home');
  document.getElementById('view-checkin').querySelectorAll('[data-check]').forEach(node => {
    node.onclick = () => toggleCheckTask(node.dataset.check);
  });
}

/* ============ 子页返回栏 ============ */
function subHeader(title, emoji) {
  return `
    <div class="sub-header">
      <button class="sub-back" id="subBack">‹</button>
      <span class="sub-emoji">${emoji}</span>
      <span class="sub-title">${esc(title)}</span>
    </div>
  `;
}

// 切到首页 tab 时重置子页到主界面
window.addEventListener('tab-switch', (e) => {
  if (e.detail.tab === 'checkin') {
    if (subView !== 'home') { subView = 'home'; renderCheckin(); }
  }
});
