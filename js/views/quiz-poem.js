// views/quiz-poem.js — 古诗打卡：按 SRS 取诗，显示整首，家长判 熟练/一般/不会，≥80% 熟练算通过

import { getState } from '../store.js';
import { POEMS, poemKeysUpToStage } from '../vocab-data.js';
import { buildDailyList, grade } from '../srs2.js';
import { submitQuiz } from '../tasks.js';
import { SRS_GRADE } from '../db2.js';
import { showOverlay, closeOverlay, switchTab, celebrate } from '../app.js';
import { esc } from '../utils.js';

let state = null; // { task, list, idx, grades }

export function openPoemQuiz(taskId) {
  const task = getState().tasks.find(t => t.id === taskId);
  if (!task) return;
  const s = getState();
  const stageIdx = s.bookProgress?.poemStageIdx || 0;
  const allKeys = poemKeysUpToStage(stageIdx);
  const plan = buildDailyList('poem', allKeys, task.dailyCount || 5, 2);
  const list = plan.all.length ? plan.all : allKeys.slice(0, task.dailyCount || 5);

  state = { task, list, idx: 0, grades: [] };
  renderCard();
}

function renderCard() {
  if (!state) return;
  if (state.idx >= state.list.length) return finish();
  const title = state.list[state.idx];
  const poem = POEMS.find(p => p.title === title);
  if (!poem) { state.idx++; return renderCard(); }
  const total = state.list.length;
  const cur = state.idx + 1;

  // 诗句按句号/逗号分行展示
  const lines = poem.text.split(/[，。！？]/).filter(s => s.trim());

  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qpBack">‹</span>
      <span class="quiz-title">古诗打卡</span>
      <span class="quiz-count">${cur}/${total}</span>
    </div>
    <div class="poem-card">
      <div class="poem-title">《${esc(poem.title)}》</div>
      <div class="poem-author">— ${esc(poem.author)}</div>
      <div class="poem-text">${lines.map(l => `<div>${esc(l)}</div>`).join('')}</div>
    </div>
    <div class="quiz-tip">家长判断孩子背诵熟练度</div>
    <div class="quiz-grades">
      <button class="grade-btn good" data-g="good">👍 学会了</button>
      <button class="grade-btn ok" data-g="ok">🙂 不熟练</button>
      <button class="grade-btn again" data-g="again">🙏 还不会</button>
    </div>
    <div class="quiz-progress"><div class="qp-fill" style="width:${(state.idx/total)*100}%"></div></div>
  `;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qpBack').onclick = () => { closeOverlay(); state = null; };
      card.querySelectorAll('.grade-btn').forEach(btn => {
        btn.onclick = () => {
          const g = btn.dataset.g;
          state.grades.push(g);
          grade('poem', poem.title, g);
          state.idx++;
          renderCard();
        };
      });
    },
  });
}

function finish() {
  const total = state.list.length;
  const good = state.grades.filter(g => g === SRS_GRADE.GOOD).length;
  const ok = state.grades.filter(g => g === SRS_GRADE.OK).length;
  const again = state.grades.filter(g => g === SRS_GRADE.AGAIN).length;
  const passRate = total ? good / total : 0;
  const passed = passRate >= (state.task.passRate || 0.8);
  const result = { correct: good + ok, total, passRate, passed, detail: { good, ok, again } };
  submitQuiz(state.task.id, result);
  const savedTask = state.task;
  state = null;
  if (passed) { closeOverlay(); celebrate('古诗打卡成功', `获得 ${savedTask.points} 积分`); setTimeout(()=>switchTab('checkin'),100); return; }

  const html = `<h2>💪 再接再厉</h2><div class="desc">背诵 ${good + ok}/${total} 首 · 获得 ${Math.max(1, Math.round(savedTask.points/3))} 鼓励分，明天再战</div><button class="btn block" id="qpDone">完成</button>`;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qpDone').onclick = () => { closeOverlay(); switchTab('checkin'); };
    },
  });
}
