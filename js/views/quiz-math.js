// views/quiz-math.js — 数学打卡：10以内加减法10题，准确率≥80%通过

import { getState } from '../store.js';
import { submitQuiz } from '../tasks.js';
import { showOverlay, closeOverlay, switchTab, celebrate } from '../app.js';
import { randInt, esc } from '../utils.js';

let state = null; // { task, problems, idx, answers: [], input }

function makeProblem() {
  const isAdd = Math.random() < 0.5;
  if (isAdd) {
    const a = randInt(0, 5), b = randInt(0, 10 - a);
    return { text: `${a} + ${b}`, answer: a + b };
  } else {
    const a = randInt(0, 10), b = randInt(0, a);
    return { text: `${a} - ${b}`, answer: a - b };
  }
}

export function openMathQuiz(taskId) {
  const task = getState().tasks.find(t => t.id === taskId);
  if (!task) return;
  const n = task.dailyCount || 10;
  const problems = Array.from({ length: n }, () => makeProblem());
  state = { task, problems, idx: 0, answers: [], input: '' };
  renderCard();
}

function renderCard() {
  if (!state) return;
  if (state.idx >= state.problems.length) return finish();
  const p = state.problems[state.idx];
  const total = state.problems.length;
  const cur = state.idx + 1;
  state.input = ''; // 每题清空输入

  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qmBack">‹</span>
      <span class="quiz-title">数学打卡</span>
      <span class="quiz-count">${cur}/${total}</span>
    </div>
    <div class="quiz-stage">
      <div class="math-problem">${p.text} =</div>
      <div class="math-answer" id="qmAns">${esc(state.input) || '?'}</div>
      <div class="quiz-feedback" id="qmFeedback"></div>
    </div>
    <div class="math-keypad">
      ${[1,2,3,4,5,6,7,8,9,0].map(n => `<button data-n="${n}">${n}</button>`).join('')}
      <button data-n="del">⌫</button>
    </div>
    <div class="quiz-progress"><div class="qp-fill" style="width:${(state.idx / total) * 100}%"></div></div>
  `;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qmBack').onclick = () => { closeOverlay(); state = null; };
      const ans = card.querySelector('#qmAns');
      const feedback = card.querySelector('#qmFeedback');
      const submit = () => {
        const val = parseInt(state.input, 10);
        if (isNaN(val)) return;
        const isRight = val === p.answer;
        state.answers.push({ given: val, answer: p.answer, right: isRight });
        feedback.textContent = isRight ? '✓ 答对了！' : `✗ 答案是 ${p.answer}`;
        feedback.className = 'quiz-feedback ' + (isRight ? 'right' : 'wrong');
        ans.classList.add(isRight ? 'flash' : 'shake');
        setTimeout(() => {
          state.idx++;
          renderCard();
        }, isRight ? 600 : 1100);
      };
      card.querySelectorAll('.math-keypad button').forEach(btn => {
        btn.onclick = () => {
          const n = btn.dataset.n;
          if (n === 'del') state.input = state.input.slice(0, -1);
          else if (state.input.length < 2) state.input += n;
          // 输入两位自动提交（10以内最多两位）
          ans.textContent = state.input || '?';
          if (state.input.length >= 2 || (state.input && parseInt(state.input,10) >= 10)) {
            // 10 是两位但可能用户输1再0；改为手动确认
          }
        };
      });
      // 增加确认按钮
      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'btn block';
      confirmBtn.textContent = '确定';
      confirmBtn.style.marginTop = '8px';
      confirmBtn.onclick = submit;
      card.appendChild(confirmBtn);
    },
  });
}

function finish() {
  const total = state.problems.length;
  const right = state.answers.filter(a => a.right).length;
  const passRate = total ? right / total : 0;
  const passed = passRate >= (state.task.passRate || 0.8);
  const result = { correct: right, total, passRate, passed };
  submitQuiz(state.task.id, result);
  const savedTask = state.task;
  state = null;
  if (passed) { closeOverlay(); celebrate('数学打卡成功', `获得 ${savedTask.points} 积分`); setTimeout(()=>switchTab('checkin'),100); return; }

  const html = `<h2>💪 再接再厉</h2><div class="desc">答对 ${right}/${total} 题 · 准确率 ${Math.round(passRate * 100)}% · 获得 ${Math.max(1, Math.round(savedTask.points/3))} 鼓励分</div><button class="btn block" id="qmDone">完成</button>`;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qmDone').onclick = () => { closeOverlay(); switchTab('checkin'); };
    },
  });
}
