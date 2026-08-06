// views/quiz-speak.js — 英语开口打卡（独立战斗，单向攻击开口专属小怪兽）
// 读对一个单词 → 宠物攻击一次"读音小怪"；10 个单词读完打死小怪 = 打卡成功
// 宠物不掉血、不影响连胜、不掉蛋；武器攻击力影响每次伤害（当天买武器更易打死）

import { getState } from '../store.js';
import { ALL_ENGLISH_WORDS } from '../vocab-data.js';
import { buildDailyList, grade } from '../srs2.js';
import { submitSpeakBattle } from '../tasks.js';
import { SRS_GRADE } from '../db2.js';
import { showOverlay, closeOverlay, switchTab, toast, celebrate } from '../app.js';
import { speak, recognize, canRecognize } from '../speech.js';
import { esc, shuffle } from '../utils.js';
import { getArt } from '../svg-art.js';
import { getActivePet, petStats } from '../pets.js';
import { generateSpeakMonster, attackDamage } from '../battle.js';
import { todayKey } from '../utils.js';

let state = null; // { task, words, idx, pet, monster, monsterHp, monsterMaxHp, results }

export function openSpeakBattle(taskId) {
  const task = getState().tasks.find(t => t.id === taskId);
  if (!task) return;
  const pet = getActivePet();
  if (!pet) { toast('还没有宠物出战'); return; }

  const allKeys = ALL_ENGLISH_WORDS.map(w => w.word).slice(9);
  const plan = buildDailyList('english', allKeys, task.dailyCount || 10, 2);
  const list = plan.all.length ? plan.all : allKeys.slice(0, task.dailyCount || 10);
  const words = list.map(w => ALL_ENGLISH_WORDS.find(x => x.word === w)).filter(Boolean);
  if (!words.length) { toast('没有可读的单词'); return; }

  const monster = generateSpeakMonster(todayKey());
  state = {
    task, words, idx: 0, pet, monster,
    monsterHp: monster.hp, monsterMaxHp: monster.hp,
    results: [],
  };
  renderCard();
}

function renderCard() {
  if (!state) return;
  if (state.monsterHp <= 0) return finish(true); // 提前打死
  if (state.idx >= state.words.length) return finish(false);
  const w = state.words[state.idx];
  const total = state.words.length;
  const cur = state.idx + 1;
  const monPct = Math.max(0, (state.monsterHp / state.monsterMaxHp) * 100);
  const stats = petStats(state.pet);

  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qsBack">‹</span>
      <span class="quiz-title">英语开口 · 第${cur}/${total}词</span>
      <span class="quiz-count">开口小怪</span>
    </div>
    <div class="battle-stage">
      <div class="bs-vs">
        <div class="bs-side pet">
          <div class="bs-emoji">${state.pet.emoji}</div>
          <div class="bs-name">${esc(state.pet.species)}</div>
          <div style="font-size:10px">ATK ${stats.atk}${stats.weapon ? ' · '+stats.weapon.emoji : ''}</div>
        </div>
        <div class="bs-vs-label">→</div>
        <div class="bs-side">
          <div class="bs-emoji">${state.monster.emoji}</div>
          <div class="bs-name">${esc(state.monster.name)}</div>
          <div class="bs-hpbar"><div class="fill" style="width:${monPct}%"></div></div>
          <div style="font-size:10px">HP ${Math.max(0, Math.round(state.monsterHp))}</div>
        </div>
      </div>
      <div class="speak-word-area">
        <div class="speak-art">${getArt(w.svg)}</div>
        <div class="bs-word" id="qsWord">${esc(w.word)} <span class="speak-cn">${esc(w.cn)}</span></div>
      </div>
    </div>
    <div class="speak-actions">
      <button class="btn big" id="qsRecog">🎤 我来读！</button>
      <div class="recog-status" id="qsStatus">大声读出上面的词，读对宠物就攻击小怪</div>
      <div class="row" style="margin-top:8px">
        <button class="btn secondary" id="qsRight">家长：读对了</button>
        <button class="btn secondary" id="qsWrong">家长：没读对</button>
      </div>
      <button class="btn ghost" id="qsSkip">跳过</button>
    </div>
    <div class="quiz-progress"><div class="qp-fill" style="width:${(state.idx / total) * 100}%"></div></div>
    <div class="hint" style="text-align:center;margin-top:8px">${canRecognize ? '语音识别自动判断，家长可修正' : '本设备不支持语音，请家长判断'}</div>
  `;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qsBack').onclick = () => { closeOverlay(); state = null; };
      const status = card.querySelector('#qsStatus');
      const recogBtn = card.querySelector('#qsRecog');
      const rightBtn = card.querySelector('#qsRight');
      const wrongBtn = card.querySelector('#qsWrong');
      const skipBtn = card.querySelector('#qsSkip');
      let judged = false;
      const judge = (ok, by) => {
        if (judged) return;
        judged = true;
        state.results.push({ word: w.word, ok, by });
        grade('english', w.word, ok ? SRS_GRADE.GOOD : SRS_GRADE.AGAIN);
        if (ok) {
          const dmg = attackDamage(petStats(state.pet).atk, state.monster.def);
          state.monsterHp -= dmg;
          status.textContent = `✓ 读对了！${state.pet.species} 造成 ${dmg} 伤害`;
          status.className = 'recog-status match';
          // 小怪受击特效
          const monSide = card.querySelector('.bs-side:not(.pet) .bs-emoji, .bs-side:not(.pet) > div');
          if (monSide) { monSide.classList.add('hit-shake','hit-flash'); const fx = document.createElement('div'); fx.className='attack-fx'; fx.textContent='💥'; monSide.appendChild(fx); const pop=document.createElement('div'); pop.className='dmg-pop'; pop.textContent='-'+dmg; monSide.appendChild(pop); }
          // 宠物攻击动作
          const petEmoji = card.querySelector('.bs-side.pet .bs-emoji');
          if (petEmoji) petEmoji.classList.add('attack-lunge');
        } else {
          status.textContent = '✗ 没读对，这回合没攻击到小怪';
          status.className = 'recog-status miss';
        }
        // 宠物不掉血（单向攻击）
        if (state.monsterHp <= 0) {
          setTimeout(() => finish(true), 700);
          return;
        }
        setTimeout(() => { state.idx++; renderCard(); }, ok ? 850 : 1100);
      };

      recogBtn.onclick = async () => {
        if (state.recognizing) return;
        state.recognizing = true;
        status.textContent = '🎤 正在听…请大声读';
        status.className = 'recog-status';
        const res = await recognize(w.word);
        state.recognizing = false;
        if (res.manual) { status.textContent = '本设备不支持语音，请家长手动判断'; return; }
        if (res.error || res.noResult) { status.textContent = '没听清楚，请家长判断'; return; }
        judge(res.ok, 'voice');
      };
      rightBtn.onclick = () => judge(true, 'parent');
      wrongBtn.onclick = () => judge(false, 'parent');
      skipBtn.onclick = () => { judged = true; state.idx++; renderCard(); };
    },
  });
}

function finish(won) {
  if (!state) return;
  const total = state.words.length;
  const spokenCorrect = state.results.filter(r => r.ok).length;
  const passed = won; // 打死小怪才算打卡成功

  // 提交打卡结果（积分入账）—— 不影响连胜、不掉蛋、宠物不掉血
  submitSpeakBattle(state.task.id, { passed, won, spokenCorrect, total, monsterHpLeft: Math.max(0, state.monsterHp) });
  const savedTask = state.task;
  const petName = state.pet.species;
  state = null;
  if (won) { closeOverlay(); celebrate('开口打卡成功', `获得 ${savedTask.points} 积分`); setTimeout(()=>switchTab('checkin'),100); return; }

  const html = `<h2>💪 下次加油</h2><div class="desc">小怪没打死 · 读对 ${spokenCorrect}/${total} 个词 · 获得 ${Math.max(1, Math.round(savedTask.points/3))} 鼓励分</div><button class="btn block" id="qsDone">完成</button>`;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qsDone').onclick = () => { closeOverlay(); switchTab('checkin'); };
    },
  });
}
