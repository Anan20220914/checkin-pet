// views/quiz-english.js — 英语打卡：听单词选对应图片，4选1，家长判熟练/一般/不会

import { getState } from '../store.js';
import { ALL_ENGLISH_WORDS, ENGLISH_PHRASES, findWordBySvg } from '../vocab-data.js';
import { buildDailyList, grade, getStats } from '../srs2.js';
import { submitQuiz } from '../tasks.js';
import { SRS_GRADE } from '../db2.js';
import { showOverlay, closeOverlay, switchTab, celebrate } from '../app.js';
import { speak } from '../speech.js';
import { esc, shuffle } from '../utils.js';
import { getArt } from '../svg-art.js';

let state = null; // { task, list, idx, grades, correctInRound }

export function openEnglishQuiz(taskId) {
  const task = getState().tasks.find(t => t.id === taskId);
  if (!task) return;
  // 9个单词 + 1个日常短句（都走 SRS 循环记忆）
  // 跳过第一天（前9个单词）
  const allWordKeys = ALL_ENGLISH_WORDS.map(w => w.word);
  const wordKeys = allWordKeys.slice(9);
  const phraseKeys = ENGLISH_PHRASES.map(p => p.word);
  const wordPlan = buildDailyList('english', wordKeys, 9, 2);
  const phrasePlan = buildDailyList('english', phraseKeys, 1, 1);
  const wordList = wordPlan.all.length ? wordPlan.all : wordKeys.slice(0, 9);
  const phraseList = phrasePlan.all.length ? phrasePlan.all : [phraseKeys[0]];
  // 映射回对象
  const wordItems = wordList.map(w => ALL_ENGLISH_WORDS.find(x => x.word === w)).filter(Boolean);
  const phraseItems = phraseList.map(w => ENGLISH_PHRASES.find(x => x.word === w)).filter(Boolean);
  const items = [...wordItems, ...phraseItems];
  state = { task, items, idx: 0, grades: [], correctInRound: 0 };
  renderCard();
}

function renderCard() {
  if (!state) return;
  if (state.idx >= state.items.length) return finish();
  const item = state.items[state.idx];
  const total = state.items.length;
  const cur = state.idx + 1;

  // 4 选 1：正确 + 3 干扰（从全部词里随机取）
  const distractors = shuffle(ALL_ENGLISH_WORDS.filter(w => w.word !== item.word)).slice(0, 3);
  const choices = shuffle([item, ...distractors]);

  let choicesHtml = '';
  for (const c of choices) {
    choicesHtml += `<button class="ch-choice" data-word="${esc(c.word)}">
      <span class="ch-svg">${getArt(c.svg)}</span>
      <span class="ch-word">${esc(c.word)}</span>
    </button>`;
  }

  const st = getStats('english');
  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qeBack">‹</span>
      <span class="quiz-title">英语打卡</span>
      <span class="quiz-count">${cur}/${total}</span>
    </div>
    <div class="stats-bar">
      <span class="stat-good">熟练 ${st.good}</span>
      <span class="stat-ok">不太会 ${st.ok}</span>
      <span class="stat-again">不会 ${st.again}</span>
    </div>
    <div class="quiz-stage">
      <div class="quiz-tip">点 🔊 听单词，选对应的图</div>
      <button class="btn secondary big" id="qePlay" style="margin:12px auto;display:flex">🔊 点这里听单词</button>
      <div class="quiz-feedback" id="qeFeedback"></div>
    </div>
    <div class="quiz-choices">${choicesHtml}</div>
    <div class="quiz-grades" id="qeGrades" style="display:none">
      <button class="grade-btn good" data-g="good">👍 熟练</button>
      <button class="grade-btn ok" data-g="ok">🙂 一般</button>
      <button class="grade-btn again" data-g="again">🙏 不会</button>
    </div>
    <div class="quiz-progress"><div class="qp-fill" style="width:${(state.idx / total) * 100}%"></div></div>
  `;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qeBack').onclick = () => { closeOverlay(); state = null; };
      const playBtn = card.querySelector('#qePlay');
      const grades = card.querySelector('#qeGrades');
      const feedback = card.querySelector('#qeFeedback');
      playBtn.onclick = () => speak(item.word);
      // 自动播一次
      setTimeout(() => speak(item.word), 300);

      let answered = false;
      card.querySelectorAll('.ch-choice').forEach(btn => {
        btn.onclick = () => {
          if (answered) return;
          answered = true;
          const isRight = btn.dataset.word === item.word;
          btn.classList.add(isRight ? 'correct' : 'wrong');
          if (!isRight) {
            // 高亮正确答案
            card.querySelectorAll('.ch-choice').forEach(b => {
              if (b.dataset.word === item.word) b.classList.add('correct');
            });
          }
          feedback.textContent = isRight ? '✓ 选对了！' : `✗ 是 "${item.cn}" (${item.word})`;
          feedback.className = 'quiz-feedback ' + (isRight ? 'right' : 'wrong');
          if (isRight) state.correctInRound++;
          // 展示家长判定三档
          grades.style.display = 'flex';
        };
      });

      card.querySelectorAll('.grade-btn').forEach(btn => {
        btn.onclick = () => {
          const g = btn.dataset.g;
          state.grades.push(g);
          grade('english', item.word, g);
          state.idx++;
          renderCard();
        };
      });
    },
  });
}

function finish() {
  const total = state.items.length;
  const good = state.grades.filter(g => g === SRS_GRADE.GOOD).length;
  const ok = state.grades.filter(g => g === SRS_GRADE.OK).length;
  const again = state.grades.filter(g => g === SRS_GRADE.AGAIN).length;
  const passRate = total ? good / total : 0;
  const passed = passRate >= (state.task.passRate || 0.8);
  const result = { correct: good + ok, total, passRate, passed, detail: { good, ok, again } };
  submitQuiz(state.task.id, result);
  const savedTask = state.task;
  state = null;
  if (passed) { closeOverlay(); celebrate('英语打卡成功', `获得 ${savedTask.points} 积分`); setTimeout(()=>switchTab('checkin'),100); return; }

  const html = `<h2>💪 再接再厉</h2><div class="desc">认得 ${good + ok}/${total} 词 · 获得 ${Math.max(1, Math.round(savedTask.points/3))} 鼓励分</div><button class="btn block" id="qeDone">完成</button>`;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qeDone').onclick = () => { closeOverlay(); switchTab('checkin'); };
    },
  });
}
