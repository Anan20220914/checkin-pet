// views/quiz-brain.js — 大脑开发打卡（思维逻辑启蒙，10题4选1，≥80%通过）
// 题型：找不同、找规律(形状序列)、分类、数、大小比较、配对

import { getState } from '../store.js';
import { submitQuiz } from '../tasks.js';
import { showOverlay, closeOverlay, switchTab, celebrate } from '../app.js';
import { esc, shuffle, randInt } from '../utils.js';

let state = null; // { task, problems, idx, answers: [] }

/** 生成10道大脑开发题（随机题型混排） */
function makeProblems() {
  const makers = [makeOddOne, makePattern, makeCategory, makeCount, makeBigger, makeShadow, makeOpposite];
  const probs = [];
  for (let i = 0; i< 10; i++) {
    const fn = makers[i % makers.length];
    probs.push(fn());
  }
  return probs;
}

/* ===== 题型生成器 ===== */

// 1. 找不同：4个物品，1个不同类
function makeOddOne() {
  const groups = [
    { items: ['🍎','🍐','🍌','🚗'], odd: '🚗', name: '水果' },
    { items: ['🐶','🐱','🐰','🌸'], odd: '🌸', name: '动物' },
    { items: ['🚗','🚌','🚲','⚽'], odd: '⚽', name: '车' },
    { items: ['🌸','🌷','🌻','🐧'], odd: '🐧', name: '花' },
    { items: ['⭐','🌙','☀️','🐟'], odd: '🐟', name: '天上的' },
    { items: ['👕','👖','👗','🍎'], odd: '🍎', name: '衣服' },
  ];
  const g = groups[randInt(0, groups.length - 1)];
  const choices = shuffle(g.items);
  return {
    type: '找不同',
    q: '哪一个和其他不一样？',
    choices,
    answer: g.odd,
    render: (c) => `<span class="brain-emoji">${c}</span>`,
  };
}

// 2. 找规律：形状序列，问下一个
function makePattern() {
  const shapes = ['🔴', '🔵', '🟡', '🟢'];
  const a = shapes[randInt(0, 3)], b = shapes[randInt(0, 3)];
  const seq = [a, b, a, b, a]; // ABAB规律
  const answer = b;
  const choices = shuffle([answer, ...shapes.filter(s => s !== answer).slice(0, 3)]);
  return {
    type: '找规律',
    q: `${seq.join(' ')} 接下来应该是？`,
    choices,
    answer,
    isSeq: true,
    render: (c) => `<span class="brain-emoji">${c}</span>`,
  };
}

// 3. 分类：选同类
function makeCategory() {
  const sets = [
    { pair: ['🍎','🍐'], others: ['🚗','🐶'], name: '水果' },
    { pair: ['🐶','🐱'], others: ['🌸','⭐'], name: '动物' },
    { pair: ['🚗','🚌'], others: ['⚽','🌷'], name: '车' },
    { pair: ['🌸','🌻'], others: ['🚗','🐧'], name: '花' },
  ];
  const s = sets[randInt(0, sets.length - 1)];
  const target = s.pair[randInt(0, 1)];
  const choices = shuffle([s.pair.find(x => x !== target), ...s.others]);
  return {
    type: '找同类',
    q: `和 ${target} 同类的是？`,
    choices,
    answer: s.pair.find(x => x !== target),
    render: (c) => `<span class="brain-emoji">${c}</span>`,
  };
}

// 4. 数数：几个图标
function makeCount() {
  const n = randInt(2, 6);
  const emoji = ['🍎','🐶','⭐','🌸'][randInt(0, 3)];
  const wrongs = [n - 1, n + 1, n + 2].filter(x => x > 0);
  const choices = shuffle([String(n), ...wrongs.slice(0, 3).map(String)]);
  return {
    type: '数一数',
    q: '数一数有几个？',
    count: n,
    countEmoji: emoji,
    choices,
    answer: String(n),
    render: (c) => `<span class="brain-num">${c}</span>`,
  };
}

// 5. 大小比较
function makeBigger() {
  let a = randInt(1, 9), b = randInt(1, 9);
  while (b === a) b = randInt(1, 9); // 确保两数不等
  const bigger = Math.max(a, b);
  const smaller = Math.min(a, b);
  // 选项：大数、小数、和两个干扰（不与答案重复）
  const distractors = [bigger + 1, smaller - 1, bigger + 2].filter(x => x > 0 && x <= 10 && x !== bigger).slice(0, 2);
  const choices = shuffle([String(bigger), String(smaller), ...distractors.map(String)]);
  return {
    type: '比大小',
    q: `${a} 和 ${b}，哪个大？`,
    choices,
    answer: String(bigger),
    render: (c) => `<span class="brain-num">${c}</span>`,
  };
}

// 6. 影子配对（动物和它的影子）——简化成选对应动物
function makeShadow() {
  const pairs = [
    { animal: '🐶', shadow: '🐶' },
    { animal: '🐱', shadow: '🐱' },
    { animal: '🐰', shadow: '🐰' },
  ];
  const p = pairs[randInt(0, 2)];
  const others = ['🐱', '🐰', '🐶', '🦊'].filter(x => x !== p.animal);
  const choices = shuffle([p.animal, ...others.slice(0, 3)]);
  return {
    type: '找相同',
    q: `哪个和它一样？ ${p.shadow}`,
    choices,
    answer: p.animal,
    render: (c) => `<span class="brain-emoji">${c}</span>`,
  };
}

// 7. 反义词/相对（上下、大小、多少）
function makeOpposite() {
  const sets = [
    { q: '上的相反是？', a: '下', choices: ['下','左','右','前'] },
    { q: '大的相反是？', a: '小', choices: ['小','高','长','多'] },
    { q: '多的相反是？', a: '少', choices: ['少','大','高','长'] },
    { q: '白天的相反是？', a: '黑夜', choices: ['黑夜','早上','中午','下午'] },
  ];
  const s = sets[randInt(0, sets.length - 1)];
  return {
    type: '反义词',
    q: s.q,
    choices: shuffle(s.choices),
    answer: s.a,
    render: (c) => `<span class="brain-text">${esc(c)}</span>`,
  };
}

/* ===== 渲染 ===== */
export function openBrainQuiz(taskId) {
  const task = getState().tasks.find(t => t.id === taskId);
  if (!task) return;
  state = { task, problems: makeProblems(), idx: 0, answers: [] };
  renderCard();
}

function renderCard() {
  if (!state) return;
  if (state.idx >= state.problems.length) return finish();
  const p = state.problems[state.idx];
  const total = state.problems.length;
  const cur = state.idx + 1;

  let qExtra = '';
  if (p.count) {
    qExtra = `<div class="brain-count">${Array(p.count).fill(p.countEmoji).map(e => `<span>${e}</span>`).join('')}</div>`;
  }

  let choicesHtml = '';
  p.choices.forEach((c, i) => {
    choicesHtml += `<button class="brain-choice" data-choice="${esc(c)}">${p.render(c)}</button>`;
  });

  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qbBack">‹</span>
      <span class="quiz-title">🧠 大脑开发</span>
      <span class="quiz-count">${cur}/${total}</span>
    </div>
    <div class="brain-stage">
      <div class="brain-type">${p.type}</div>
      <div class="brain-q">${esc(p.q)}</div>
      ${qExtra}
      <div class="quiz-feedback" id="qbFeedback"></div>
    </div>
    <div class="quiz-choices">${choicesHtml}</div>
    <div class="quiz-progress"><div class="qp-fill" style="width:${(state.idx / total) * 100}%"></div></div>
  `;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qbBack').onclick = () => { closeOverlay(); state = null; };
      const feedback = card.querySelector('#qbFeedback');
      let answered = false;
      card.querySelectorAll('.brain-choice').forEach(btn => {
        btn.onclick = () => {
          if (answered) return;
          answered = true;
          const chosen = btn.dataset.choice;
          const isRight = chosen === p.answer;
          state.answers.push({ chosen, answer: p.answer, right: isRight });
          btn.classList.add(isRight ? 'correct' : 'wrong');
          if (!isRight) {
            card.querySelectorAll('.brain-choice').forEach(b => {
              if (b.dataset.choice === p.answer) b.classList.add('correct');
            });
          }
          feedback.textContent = isRight ? '✓ 答对了！' : `✗ 答案是 ${p.answer}`;
          feedback.className = 'quiz-feedback ' + (isRight ? 'right' : 'wrong');
          setTimeout(() => { state.idx++; renderCard(); }, isRight ? 700 : 1200);
        };
      });
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
  if (passed) { closeOverlay(); celebrate('大脑开发成功', `获得 ${savedTask.points} 积分`); setTimeout(() => switchTab('checkin'), 100); return; }

  const html = `<h2>💪 再接再厉</h2><div class="desc">答对 ${right}/${total} 题 · 准确率 ${Math.round(passRate * 100)}% · 获得 ${Math.max(1, Math.round(savedTask.points / 3))} 鼓励分</div><button class="btn block" id="qbDone">完成</button>`;
  showOverlay(html, { onMount: c => { c.querySelector('#qbDone').onclick = () => { closeOverlay(); switchTab('checkin'); }; } });
}
