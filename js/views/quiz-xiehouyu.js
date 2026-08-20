// views/quiz-xiehouyu.js — 短文阅读打卡界面
// 每天从识字字库的词语中生成一段30字以内的短文，孩子朗读打卡
// 基于日期种子生成，每天不同，同一天内容固定

import { getState } from '../store.js';
import { CHINESE_WORDS, ALL_CHINESE_CHARS } from '../vocab-data.js';
import { submitQuiz } from '../tasks.js';
import { todayKey } from '../utils.js';
import { showOverlay, closeOverlay, switchTab, celebrate } from '../app.js';
import { esc } from '../utils.js';

let state = null;

/* ===== 短文模板库 =====
 * 每个模板用 {w1} {w2} {w3} 等占位符
 * 生成时从字库词语中随机选取填入
 * 模板控制在30字以内
 */
const READING_TEMPLATES = [
  // 自然类
  '{w1}的{w2}升起来了，{w3}照在{w4}上，{w5}也亮了。',
  '{w1}天上飘着{w2}，{w3}吹过{w4}，{w5}摇来摇去。',
  '春天来了，{w1}开了，{w2}绿了，{w3}在{w4}上飞来飞去。',
  '下{w1}了，{w2}都湿了，{w3}打着{w4}走在路上。',
  '天上的{w1}一闪一闪，{w2}弯弯的，{w3}在{w4}里唱歌。',
  // 家庭类
  '{w1}在{w2}里{w3}，{w4}在旁边{w5}，一家人很开心。',
  '{w1}给我买了一个{w2}，我{w3}地{w4}起来。',
  '{w1}和{w2}一起{w3}，{w4}也{w5}，大家{w6}。',
  '我{w1}了{w2}，{w3}说我{w4}，我心里很{w5}。',
  '{w1}在{w2}{w3}，{w4}在{w5}{w6}，家里很热闹。',
  // 动物类
  '小{w1}在{w2}上{w3}，小{w4}在{w5}里{w6}。',
  '{w1}和{w2}是好朋友，他们一起{w3}，一起{w4}。',
  '小{w1}爱吃{w2}，小{w3}爱吃{w4}，它们都不{w5}。',
  '一只小{w1}在{w2}上跳来跳去，{w3}它{w4}。',
  // 学校类
  '{w1}教我们{w2}，我们{w3}地{w4}，{w5}很开心。',
  '今天我学了{w1}和{w2}，{w3}说我{w4}了。',
  '上课了，{w1}打开{w2}，{w3}认真地{w4}。',
  '我在{w1}里{w2}，{w3}在{w4}上{w5}，{w6}很好。',
  // 生活类
  '早上我{w1}{w2}，然后{w3}去{w4}，路上看见{w5}。',
  '{w1}里有很多{w2}，我{w3}了一个{w4}，很{w5}。',
  '我{w1}了一本{w2}，里面写着{w3}和{w4}，真{w5}。',
  '{w1}给我做了一碗{w2}，我{w3}地{w4}完了。',
  '今天天{w1}，我和{w2}去{w3}，我们{w4}得很{w5}。',
  // 情感类
  '{w1}笑了，{w2}也笑了，大家{w3}地{w4}。',
  '我{w1}了，{w2}过来{w3}我，我心里{w4}。',
  '{w1}哭了，因为{w2}不见了，{w3}帮他{w4}。',
  '今天我{w1}了一件事，{w2}说我{w3}，我很{w4}。',
];

/* ===== 基于日期的伪随机数生成器 ===== */
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** 从词语数组中按种子取词 */
function pickWords(count, seed) {
  const rng = seededRandom(seed);
  const allWords = [];
  for (const cw of CHINESE_WORDS) {
    allWords.push(...cw.words);
  }
  const picked = [];
  const used = new Set();
  while (picked.length < count && used.size < allWords.length) {
    const idx = Math.floor(rng() * allWords.length);
    const w = allWords[idx];
    if (!used.has(w) && w.length <= 4) {
      used.add(w);
      picked.push(w);
    }
  }
  // 补齐（万一词库不够）
  while (picked.length < count) {
    picked.push(CHINESE_WORDS[picked.length % CHINESE_WORDS.length].words[0]);
  }
  return picked;
}

/** 生成今天的短文 */
function generateTodayReading() {
  const today = todayKey();
  // 用日期数字做种子
  const seed = today.split('-').join('').split('').reduce((a, c) => a + parseInt(c), 0) * 137 + today.length * 31;

  const rng = seededRandom(seed);
  const templateIdx = Math.floor(rng() * READING_TEMPLATES.length);
  const template = READING_TEMPLATES[templateIdx];

  // 统计占位符数量
  const placeholders = template.match(/\{w\d+\}/g) || [];
  const count = placeholders.length;

  const words = pickWords(count, seed + templateIdx * 7);

  // 替换占位符
  let text = template;
  for (let i = 0; i < count; i++) {
    text = text.replace(`{w${i + 1}}`, words[i]);
  }

  // 提取本短文用到的字
  const usedChars = [];
  for (const w of words) {
    for (const ch of w) {
      if (!usedChars.includes(ch)) usedChars.push(ch);
    }
  }

  return { text, words, usedChars, templateIdx };
}

export function openXiehouyuQuiz(taskId) {
  const task = getState().tasks.find(t => t.id === taskId);
  if (!task) return;

  const reading = generateTodayReading();
  state = { task, reading };
  renderCard();
}

function renderCard() {
  if (!state) return;
  const { task, reading } = state;
  const today = todayKey();

  const isDoneToday = () => {
    const c = getState().checkins[today] || {};
    return !!(c[task.id] && c[task.id].done);
  };

  // 统计字数
  const charCount = reading.text.replace(/[，。！？、，]/g, '').length;

  // 高亮已学字（用不同颜色标记字库中的字）
  const wordsHtml = reading.words.map(w => `<span class="reading-word">${esc(w)}</span>`).join('');

  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qxBack">‹</span>
      <span class="quiz-title">📖 短文阅读</span>
      <span class="quiz-count">1/1</span>
    </div>
    <div class="reading-card">
      <div class="reading-text">${esc(reading.text)}</div>
      <div class="reading-meta">共 ${charCount} 字</div>
    </div>
    <div class="reading-section">
      <div class="reading-label">📝 今日词语</div>
      <div class="reading-words">${wordsHtml}</div>
    </div>
    <div class="reading-section">
      <div class="reading-label">💡 阅读提示</div>
      <div class="reading-tip">请大声朗读上面的短文，遇到不会的字可以问爸爸妈妈。</div>
    </div>
    <button class="btn block big" id="qxLearn" ${isDoneToday() ? 'disabled' : ''}>
      ${isDoneToday() ? '✅ 今天已读完' : '我读完了'}
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
          submitQuiz(task.id, { correct: 1, total: 1, passRate: 1, passed: true, detail: { reading: reading.text.slice(0, 20) } });
          state = null;
          closeOverlay();
          celebrate('短文阅读打卡成功', `读完「${reading.text.slice(0, 12)}…」· 获得 ${task.points} 积分`);
          setTimeout(() => switchTab('checkin'), 100);
        };
      }
    },
  });
}
