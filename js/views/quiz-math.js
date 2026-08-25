// views/quiz-math.js — 数学打卡：10题，一半数字加减、一半图形题（emoji 展示物品），准确率≥80%通过

import { getState } from '../store.js';
import { submitQuiz } from '../tasks.js';
import { showOverlay, closeOverlay, switchTab, celebrate } from '../app.js';
import { randInt, esc } from '../utils.js';

let state = null; // { task, problems, idx, answers: [], input }

// 图形题用的物品 emoji
const ITEMS = ['🍌', '🍎', '🍓', '🍇', '🍊', '🍑', '🥕', '🌽', '⭐', '🎈'];

function makeNumProblem() {
  const isAdd = Math.random() < 0.5;
  if (isAdd) {
    const a = randInt(0, 5), b = randInt(0, 10 - a);
    return { type: 'num', text: `${a} + ${b}`, answer: a + b };
  } else {
    const a = randInt(0, 10), b = randInt(0, a);
    return { type: 'num', text: `${a} - ${b}`, answer: a - b };
  }
}

function makePicProblem() {
  const isAdd = Math.random() < 0.5;
  const item = ITEMS[randInt(0, ITEMS.length - 1)];
  if (isAdd) {
    // 加法：a 个 + b 个，总数 ≤ 10
    const a = randInt(1, 5), b = randInt(1, 10 - a);
    const row1 = item.repeat(a);
    const row2 = item.repeat(b);
    return {
      type: 'pic',
      op: 'add',
      item,
      a, b,
      answer: a + b,
      display: row1,
      display2: row2,
      text: `${a} 个 ${item}，再加 ${b} 个 ${item}，一共几个？`,
    };
  } else {
    // 减法：从 a 个里拿走 b 个
    const a = randInt(2, 10), b = randInt(1, a);
    const row1 = item.repeat(a);
    // 被拿走的用虚线框表示
    const kept = item.repeat(a - b);
    const taken = item.repeat(b);
    return {
      type: 'pic',
      op: 'sub',
      item,
      a, b,
      answer: a - b,
      display: row1,
      keptDisplay: kept,
      takenDisplay: taken,
      text: `有 ${a} 个 ${item}，拿走 ${b} 个，还剩几个？`,
    };
  }
}

export function openMathQuiz(taskId) {
  const task = getState().tasks.find(t => t.id === taskId);
  if (!task) return;
  const n = task.dailyCount || 10;
  const halfNum = Math.floor(n / 2);
  const halfPic = n - halfNum;
  const numProblems = Array.from({ length: halfNum }, () => makeNumProblem());
  const picProblems = Array.from({ length: halfPic }, () => makePicProblem());
  // 打乱顺序，让数字题和图形题交替出现
  const problems = [...numProblems, ...picProblems];
  for (let i = problems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [problems[i], problems[j]] = [problems[j], problems[i]];
  }
  state = { task, problems, idx: 0, answers: [], input: '' };
  renderCard();
}

function renderCard() {
  if (!state) return;
  if (state.idx >= state.problems.length) return finish();
  const p = state.problems[state.idx];
  const total = state.problems.length;
  const cur = state.idx + 1;
  state.input = '';

  let stageHtml = '';
  if (p.type === 'pic') {
    // 图形题
    let itemsHtml = '';
    if (p.op === 'add') {
      // 加法：展示两组物品
      itemsHtml = `
        <div class="pic-items pic-row">${p.display.split('').map(e => `<span class="pic-item">${e}</span>`).join('')}</div>
        <div class="pic-op">➕ 再加</div>
        <div class="pic-items pic-row">${p.display2.split('').map(e => `<span class="pic-item">${e}</span>`).join('')}</div>
        <div class="pic-op">＝</div>
      `;
    } else {
      // 减法：展示全部物品，被拿走的画删除线
      const allItems = p.display.split('').map((e, i) => {
        const isTaken = i >= p.a - p.b;
        return `<span class="pic-item ${isTaken ? 'pic-taken' : ''}">${e}</span>`;
      }).join('');
      itemsHtml = `
        <div class="pic-items pic-row">${allItems}</div>
        <div class="pic-op">拿走 ${p.b} 个 ${p.item}</div>
        <div class="pic-op">＝</div>
      `;
    }
    stageHtml = `
      <div class="pic-question">${esc(p.text)}</div>
      <div class="pic-stage">${itemsHtml}</div>
      <div class="math-answer" id="qmAns">${esc(state.input) || '?'}</div>
      <div class="quiz-feedback" id="qmFeedback"></div>
    `;
  } else {
    // 数字题
    stageHtml = `
      <div class="math-problem">${p.text} =</div>
      <div class="math-answer" id="qmAns">${esc(state.input) || '?'}</div>
      <div class="quiz-feedback" id="qmFeedback"></div>
    `;
  }

  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qmBack">‹</span>
      <span class="quiz-title">数学打卡</span>
      <span class="quiz-count">${cur}/${total}</span>
    </div>
    <div class="quiz-stage">
      ${stageHtml}
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
          ans.textContent = state.input || '?';
        };
      });
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
