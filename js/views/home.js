// views/home.js — 首页：居中单卡片布局（宠物状态栏 + 宠物互动区 + 打卡速览）

import { getState, update } from '../store.js';
import { isDailyDuelDone, recordDailyDuel, getStudyDoneCount, isDuelRetryAvailable, getDuelRetryState, clearDuelRetryState } from '../tasks.js';
import { getActivePet, petStats } from '../pets.js';
import { MONSTER_TIERS, STUDY_MIN_FOR_DUEL, RARITY_NAME, RARITY_COLOR, COMPANIONS, findCompanion } from '../db2.js';
import { esc, relDay, todayKey, dayOffset } from '../utils.js';
import { showOverlay, closeOverlay, switchTab, toast, celebrate, celebrateWithCake } from '../app.js';
import { runBattle, winReward, shouldDropEgg } from '../battle.js';
import { addEgg } from '../daily.js';
import { renderPet, attackMotion } from '../pet-render.js';
import { openPetDex } from './pets.js';
import { getAchievementList, markSeen } from '../achievements.js';


/** 随机宠物互动反馈 */
function triggerPetInteraction(petEl) {
  const effects = ['pet-interact-wag', 'pet-interact-spin', 'pet-interact-jump'];
  const randomEffect = effects[Math.floor(Math.random() * effects.length)]
  petEl.classList.remove('pet-interact-wag', 'pet-interact-spin', 'pet-interact-jump');
  void petEl.offsetWidth; // force reflow
  petEl.classList.add(randomEffect);

  // 如果是 jump 效果，添加爱心粒子
  if (randomEffect === 'pet-interact-jump') {
    const heart = document.createElement('div');
    heart.className = 'heart-particle';
    heart.textContent = '❤️';
    heart.style.left = '50%';
    heart.style.top = '30%';
    heart.style.transform = 'translateX(-50%)';
    petEl.parentNode.appendChild(heart);
    setTimeout(() => heart.remove(), 1500);
  }

  setTimeout(() => {
    petEl.classList.remove(randomEffect);
  }, 2000);
}

export function renderHome() {
  const s = getState();
  const monster = s.monsters.today;
  const pet = getActivePet();
  const stats = pet ? petStats(pet) : null;
  const dueled = isDailyDuelDone();
  const studyDone = getStudyDoneCount();

  // 获取各分类完成进度
  const groups = s.tasks.filter(t => t.active).reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = { total: 0, done: 0, tasks: [] };
    acc[t.category].total++;
    acc[t.category].tasks.push(t);
    return acc;
  }, {});

  // 计算今日各分类完成数
  const today = todayKey();
  const checkins = s.checkins[today] || {};
  for (const cat of Object.keys(groups)) {
    const tasks = groups[cat].tasks;
    groups[cat].done = tasks.filter(t => checkins[t.id] && checkins[t.id].done).length;
  }

  let html = '';

  // === 宠物互动区（居中单卡片）===
  const petMood = pet ? (pet.mood || 'happy') : 'happy';
  const moodLabels = { happy: '开心', sleepy: '困倦', cheer: '鼓励', celebrate: '庆祝' };

  html += `
    <div class="card pet-interact-card" style="text-align:center;padding:24px 16px;margin-bottom:16px;position:relative;overflow:hidden;">
      <!-- 背景装饰 -->
      <div style="position:absolute;top:8px;right:12px;font-size:24px;opacity:0.4;">☁️</div>
      <div style="position:absolute;top:24px;left:12px;font-size:18px;opacity:0.3;">☁️</div>

      <!-- 宠物状态栏 -->
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px;">
        <span style="font-size:14px;font-weight:700;color:var(--text-soft);">
          ${pet ? esc(pet.species) : '小宝'}
          ${pet ? `<span style="font-size:11px;color:var(--text-soft);margin-left:4px;">${moodLabels[petMood] || ''}</span>` : ''}
        </span>
        ${pet ? `<span class="badge" style="background:${RARITY_COLOR[pet.rarity]}">${RARITY_NAME[pet.rarity]}</span>` : ''}
      </div>

      <!-- 宠物大图（可点击互动） -->
      <div id="petInteractArea" style="cursor:pointer;display:inline-block;position:relative;">
        ${pet ? renderPet(pet, 'lg') : '<div class="empty-emoji">🐾</div>'}
      </div>

      <!-- 宠物信息 -->
      ${pet ? `
        <div style="margin-top:12px;">
          <div style="display:flex;align-items:center;justify-content:center;gap:16px;font-size:13px;color:var(--text-soft);">
            <span>HP ${pet.currentHp}/${pet.hp}</span>
            <span>ATK ${stats ? stats.atk : '-'}</span>
          </div>
          <div class="hp-bar" style="width:60%;margin:8px auto 0;height:8px;">
            <div class="fill" style="width:${(pet.currentHp/pet.hp*100)}%"></div>
          </div>
        </div>
      ` : ''}

      <!-- 成长阶段指示器 -->
      ${pet && pet.species === '小狗' ? `
        <div class="growth-indicator" style="margin-top:8px;">
          <div class="stage ${pet.growthStage === 'baby' || pet.growthStage === 'teen' || pet.growthStage === 'mature' ? 'active' : ''}"></div>
          <div class="stage ${pet.growthStage === 'teen' || pet.growthStage === 'mature' ? 'active' : ''}"></div>
          <div class="stage ${pet.growthStage === 'mature' ? 'active' : ''}"></div>
          <span class="stage-label">${pet.growthStage === 'baby' ? '幼崽' : pet.growthStage === 'teen' ? '少年' : '成熟'}</span>
        </div>
      ` : ''}
    </div>
  `;

  // === 决斗主舞台（简化版）===
  const monsterEmoji = (monster && monster.emoji) || '🐺';
  const retryState = getDuelRetryState();
  const retryAvailable = isDuelRetryAvailable();
  // 重试状态下，怪物用剩余 HP
  const displayMonster = retryAvailable && retryState ? { ...monster, hp: retryState.monsterHpLeft, maxHp: monster.hp } : monster;
  const monHpPct = displayMonster ? (displayMonster.hp / displayMonster.maxHp * 100) : 100;
  // 当前小伙伴
  const activeCompanionId = s.companions?.active || null;
  const activeCompanion = activeCompanionId ? findCompanion(activeCompanionId) : null;
  html += `
    <div class="arena-card">
      <div class="arena-bg"></div>
      <div class="arena-deco">
        <div class="cloud" style="top:12px;left:8%">☁️</div>
        <div class="cloud c2" style="top:24px;right:18%">☁️</div>
      </div>
      <div class="arena-stage">
        <div class="arena-pet">
          ${pet ? renderPet(pet, 'md', null, true) : '<div class="empty-emoji">🐾</div>'}
          <div class="arena-name">${pet ? esc(pet.species) : '无宠物'}${activeCompanion ? ` <span style="font-size:18px" title="${activeCompanion.colorName}${activeCompanion.name}：${activeCompanion.skillDesc}">${activeCompanion.emoji}</span>` : ''}</div>
          ${pet ? `<div class="arena-hp"><div class="fill" style="width:${(pet.currentHp/pet.hp*100)}%"></div></div><div class="arena-hp-text">HP ${pet.currentHp}/${pet.hp}</div>` : ''}
        </div>
        <div class="arena-vs">VS</div>
        <div class="arena-monster">
          ${displayMonster ? `<div class="arena-monster-emoji" style="font-size:80px;line-height:1">${monsterEmoji}</div>
          <div class="arena-name">${esc(displayMonster.name)}</div>
          <div class="arena-hp"><div class="fill monster" style="width:${monHpPct}%"></div></div>
          <div class="arena-hp-text">${retryAvailable ? `剩余 ${displayMonster.hp}/${displayMonster.maxHp} HP` : `Tier ${displayMonster.tier}`}</div>` : '今日怪兽未刷新'}
        </div>
      </div>
      <div class="arena-ground"></div>
      ${activeCompanion ? `<div style="text-align:center;padding:4px 0 8px;font-size:12px;color:var(--primary-dark);font-weight:700">🤝 小伙伴：${activeCompanion.colorName}${activeCompanion.emoji} ${activeCompanion.name} · ${activeCompanion.skillName}</div>` : ''}
      ${retryAvailable ? `<div style="text-align:center;padding:4px 0 8px;font-size:12px;color:var(--primary-dark);font-weight:700">⚠️ 上次决斗失败，怪物剩余 ${retryState.monsterHpLeft} HP · 可喂食后二次决斗</div>` : ''}
      <div class="arena-btn-wrap">
        ${duelBtn(dueled, studyDone, pet, monster)}
      </div>
    </div>
  `;

  // === 本周战果 ===
  html += `<div class="section-title">📅 本周战果</div>`;
  html += `<div class="week-strip">`;
  const week = weekDays();
  for (const d of week) {
    const b = (s.battles || []).find(x => x.date === d.key);
    const c = s.checkins[d.key];
    const checked = c ? Object.keys(c).filter(k => c[k] && c[k].done).length : 0;
    const today = d.key === todayKey();
    let cls = today ? 'today' : '';
    let icon = '·', sub = '-';
    if (b) {
      cls = (b.result === 'win' ? 'win' : 'lose') + (today ? ' today' : '');
      icon = b.result === 'win' ? '🏆' : '😅';
      sub = b.result === 'win' ? '胜' : '负';
    } else if (checked > 0) {
      cls = 'checked' + (today ? ' today' : '');
      icon = '✅'; sub = checked + '项';
    } else if (today) {
      icon = '👉'; sub = '今天';
    }
    html += `
      <div class="week-day ${cls}">
        <div class="wd-name">${d.label}</div>
        <div class="wd-icon">${icon}</div>
        <div class="wd-sub">${sub}</div>
      </div>
    `;
  }
  html += `</div>`;

  // === 成就徽章入口 ===
  const achList = getAchievementList();
  const achUnlocked = achList.filter(a => a.unlocked);
  html += `
    <div class="home-row">
      <div class="home-mini ach" id="openAch">
        <div class="hm-emoji">🏅</div>
        <div class="hm-name">成就</div>
        <div class="hm-sub">${achUnlocked.length}/${achList.length} 已解锁</div>
      </div>
      <div class="home-mini" id="homeDexBtn">
        <div class="hm-emoji">📖</div>
        <div class="hm-name">宠物图鉴</div>
      </div>
    </div>
    <div class="home-row">
      <div class="home-mini" id="openZomDex">
        <div class="hm-emoji">🐺</div>
        <div class="hm-name">怪物图鉴</div>
      </div>
      <div class="home-mini" id="openCompanions">
        <div class="hm-emoji">🤝</div>
        <div class="hm-name">小伙伴</div>
        <div class="hm-sub">${activeCompanion ? `${activeCompanion.emoji} ${activeCompanion.name}` : '未选择'}</div>
      </div>
    </div>
  `;

  document.getElementById('view-home').innerHTML = html;

  // 绑定事件
  const petArea = document.getElementById('view-home').querySelector('#petInteractArea');
  if (petArea) {
    petArea.onclick = () => {
      const petSvg = petArea.querySelector('.pet-svg');
      if (petSvg) triggerPetInteraction(petSvg);
    };
  }

  // 打卡速览点击
  document.getElementById('view-home').querySelectorAll('.checkin-card').forEach(card => {
    card.onclick = () => {
      const cat = card.dataset.cat;
      switchTab('checkin');
      // 延迟切换到对应分类
      setTimeout(() => {
        const event = new CustomEvent('checkin-set-category', { detail: { category: cat } });
        window.dispatchEvent(event);
      }, 100);
    };
  });

  const goDuel = document.getElementById('view-home').querySelector('#goDuel');
  if (goDuel && !goDuel.disabled) goDuel.onclick = () => startDailyDuel();
  document.getElementById('view-home').querySelector('#openAch').onclick = openAchievements;
  document.getElementById('view-home').querySelector('#homeDexBtn').onclick = () => openPetDex();
  document.getElementById('view-home').querySelector('#openZomDex').onclick = openZombieDex;
  document.getElementById('view-home').querySelector('#openCompanions').onclick = () => switchTab('pets');
}

function duelBtn(dueled, studyDone, pet, monster) {
  if (dueled) return `<button class="btn big block" disabled>今日已对决 ✓</button>`;
  // 检查是否处于重试状态
  const retryAvailable = isDuelRetryAvailable();
  if (retryAvailable) {
    const retryState = getDuelRetryState();
    if (!pet || pet.currentHp <= 0) return `<button class="btn big block" disabled>宠物体力不足，请先喂食恢复</button>`;
    return `<button class="btn big block" id="goDuel" style="background:var(--primary-dark)">⚔️ 二次决斗（怪物剩余 ${retryState.monsterHpLeft} HP）</button>`;
  }
  if (!monster) return `<button class="btn big block" disabled>怪兽未刷新</button>`;
  if (!pet || pet.currentHp <= 0) return `<button class="btn big block" disabled>宠物体力不足</button>`;
  return `<button class="btn big block" id="goDuel">⚔️ 开始决斗</button>`;
}

/** 渲染小伙伴选择浮层 */
function openCompanionSelect(onConfirm) {
  const s = getState();
  const companions = s.companions || { owned: COMPANIONS.map(c => c.id), active: null };
  const activeId = companions.active;

  let gridHtml = '<div class="companion-grid">';
  // 不带伙伴选项
  gridHtml += `<div class="companion-card ${!activeId ? 'selected' : ''}" data-comp="">
    <div class="comp-emoji">🚫</div>
    <div class="comp-name">不带伙伴</div>
    <div class="comp-skill">独自战斗</div>
  </div>`;
  for (const c of COMPANIONS) {
    const owned = companions.owned.includes(c.id);
    if (!owned) continue;
    const selected = activeId === c.id;
    gridHtml += `<div class="companion-card ${selected ? 'selected' : ''}" data-comp="${c.id}" style="border-color:${selected ? c.color : ''}">
      <div class="comp-emoji" style="font-size:36px">${c.emoji}</div>
      <div class="comp-name">${c.colorName}${c.name}</div>
      <div class="comp-skill" style="color:${c.color};font-weight:700">${c.skillName}</div>
      <div class="comp-desc">${c.skillDesc}</div>
    </div>`;
  }
  gridHtml += '</div>';

  showOverlay(`
    <h2>🤝 选择小伙伴</h2>
    <div class="desc">每次决斗可以带一个小伙伴帮忙打怪兽（免费）</div>
    ${gridHtml}
    <button class="btn big block" id="compConfirm" style="margin-top:12px">确认出发</button>
  `, {
    onMount: (card) => {
      let chosen = activeId;
      card.querySelectorAll('.companion-card').forEach(el => {
        el.onclick = () => {
          chosen = el.dataset.comp || null;
          card.querySelectorAll('.companion-card').forEach(e => e.classList.remove('selected'));
          el.classList.add('selected');
        };
      });
      card.querySelector('#compConfirm').onclick = () => {
        // 保存选择
        update(st => { if (!st.companions) st.companions = { owned: COMPANIONS.map(c => c.id), active: null }; st.companions.active = chosen; });
        closeOverlay();
        onConfirm(chosen);
      };
    },
  });
}

/** 本周 7 天键+标签 */
function weekDays() {
  const today = new Date();
  const day = today.getDay(); // 0=周日
  const monday = day === 0 ? -6 : 1 - day;
  const labels = ['一','二','三','四','五','六','日'];
  const arr = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + monday + i);
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0');
    arr.push({ key: `${y}-${m}-${dd}`, label: labels[i] });
  }
  return arr;
}

/* ============ 每日对决逻辑 ============ */
function startDailyDuel() {
  const s = getState();
  const pet = getActivePet();
  const monster = s.monsters.today;
  if (!pet || !monster) { toast('数据异常'); return; }
  if (pet.currentHp <= 0) { toast('宠物体力不足，请先喂食恢复'); return; }

  // 检查是否处于重试状态
  const retryState = getDuelRetryState();
  const isRetry = isDuelRetryAvailable();

  if (isRetry && retryState) {
    // 二次决斗：直接开始（保留之前选择的伙伴）
    const companionId = s.companions?.active || null;
    const weakenedMonster = {
      ...monster,
      hp: retryState.monsterHpLeft,
      maxHp: monster.hp,
      atk: retryState.monsterAtkLeft,
      def: retryState.monsterDefLeft,
    };
    const result = runBattle(pet, weakenedMonster, companionId);
    playBattleAnimation(pet, weakenedMonster, result, () => settleDailyDuelRetry(pet, weakenedMonster, result));
  } else {
    // 首次决斗：先选择小伙伴
    openCompanionSelect((companionId) => {
      const freshS = getState();
      const freshPet = getActivePet();
      const freshMonster = freshS.monsters.today;
      if (!freshPet || !freshMonster) { toast('数据异常'); return; }
      const result = runBattle(freshPet, freshMonster, companionId);
      playBattleAnimation(freshPet, freshMonster, result, () => settleDailyDuel(freshPet, freshMonster, result));
    });
  }
}

function playBattleAnimation(pet, monster, result, onDone) {
  const log = result.log;
  const petMaxHp = pet.hp;
  const monMaxHp = monster.hp;
  const overlay = document.getElementById('overlay');
  const card = document.getElementById('overlayCard');
  const monsterEmoji = monster.emoji || '🐺';

  // 小伙伴显示
  const companionId = getState().companions?.active || null;
  const companion = companionId ? findCompanion(companionId) : null;
  const companionEmoji = companion ? companion.emoji : '';

  // 随机选特效
  const FX_POOL = ['fx-explosion', 'fx-slash', 'fx-shockwave'];
  const EMOJI_POOL = ['💥', '⚡', '🔥', '⭐', '💢'];
  let petCombo = 0, monCombo = 0;

  function buildHitFx(isCrit) {
    const fxClass = FX_POOL[Math.floor(Math.random() * FX_POOL.length)];
    const emoji = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
    let html = `<div class="${fxClass}">${emoji}</div>`;
    html += '<div class="fx-particles"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>';
    if (isCrit) html += '<div class="fx-slash"></div>';
    return html;
  }

  function buildDmgPop(dmg, isCrit) {
    if (isCrit) return `<div class="dmg-crit">暴击!-${dmg}</div>`;
    return `<div class="dmg-pop">-${dmg}</div>`;
  }

  function buildCombo(side, count) {
    if (count < 2) return '';
    return `<div class="combo-text">${count}连击!</div>`;
  }

  const render = (idx) => {
    if (idx >= log.length) { onDone(); return; }
    const entry = log[idx];
    const petHp = entry.petHp ?? petMaxHp;
    const monHp = entry.monHp ?? monMaxHp;
    const petPct = (petHp / petMaxHp) * 100;
    const monPct = (monHp / monMaxHp) * 100;
    const logHtml = log.slice(0, idx + 1).map(e => `<div class="line ${e.actor}">${esc(e.text)}</div>`).join('');

    // 判断是否是战斗结束
    const isLast = idx === log.length - 1;
    const isWin = isLast && result.result === 'win';
    const isLose = isLast && result.result === 'lose';

    // 暴击判定：伤害 >= 10 视为暴击
    const dmgMatch = entry.text.match(/(\d+)/);
    const dmgVal = dmgMatch ? parseInt(dmgMatch[1]) : 0;
    const isCrit = (entry.actor === 'pet' || entry.actor === 'monster') && dmgVal >= 10;

    // 连击计数
    if (entry.actor === 'pet') { petCombo++; monCombo = 0; }
    else if (entry.actor === 'monster') { monCombo++; petCombo = 0; }
    else { petCombo = 0; monCombo = 0; }

    // 宠物侧特效
    let petClass = '';
    let petFxHtml = '';
    if (entry.actor === 'pet') {
      petClass = attackMotion(pet);
    } else if (entry.actor === 'monster') {
      petClass = isCrit ? 'hit-shake crit-flash' : 'hit-shake hit-flash';
      petFxHtml = buildDmgPop(dmgVal, isCrit) + buildCombo('pet', monCombo);
    } else if (isWin) {
      petClass = 'victory-glow';
    } else if (isLose) {
      petClass = 'defeat-fade';
    }

    // 怪兽侧特效
    let monClass = '';
    let monFxHtml = '';
    if (entry.actor === 'pet') {
      monClass = isCrit ? 'hit-shake crit-flash' : 'hit-shake hit-flash';
      monFxHtml = buildHitFx(isCrit) + buildDmgPop(dmgVal, isCrit) + buildCombo('mon', petCombo);
    } else if (entry.actor === 'monster') {
      monClass = '';
    } else if (isWin) {
      monClass = 'defeat-fade';
      monFxHtml = '<div class="fx-explosion">💥</div><div class="fx-particles"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>';
    } else if (isLose) {
      monClass = 'victory-glow';
    }

    // 战斗开始 VS 对撞
    const vsClass = idx === 0 ? 'vs-clash' : '';

    // 屏幕震动：暴击或战斗结束时
    const stageShake = (isCrit || isLast) ? 'screen-shake' : '';

    // HP 条低血量闪烁
    const petHpLow = petPct > 0 && petPct <= 25 ? 'hp-low' : '';
    const monHpLow = monPct > 0 && monPct <= 25 ? 'hp-low' : '';

    card.innerHTML = `
      <div class="quiz-head"><span class="quiz-title">⚔️ 决斗</span><span class="quiz-count">回合 ${Math.min(idx,30)}/30</span></div>
      <div class="battle-stage ${stageShake}">
        <div class="bs-vs">
          <div class="bs-side pet">
            <div style="height:72px;display:flex;align-items:flex-end;justify-content:center;position:relative" class="${petClass}">${renderPet(pet,'sm')}${petFxHtml}</div>
            <div class="bs-name">${esc(pet.species)}${companionEmoji ? ` <span style="font-size:16px">${companionEmoji}</span>` : ''}</div>
            <div class="bs-hpbar"><div class="fill ${petHpLow}" style="width:${petPct}%"></div></div>
            <div style="font-size:10px">${petHp} HP</div>
          </div>
          <div class="bs-vs-label ${vsClass}">VS</div>
          <div class="bs-side">
            <div style="height:72px;display:flex;align-items:flex-end;justify-content:center;position:relative" class="${monClass}">
              <div class="monster-emoji" style="font-size:72px;line-height:1">${monsterEmoji}</div>
              ${monFxHtml}
            </div>
            <div class="bs-name">${esc(monster.name)}</div>
            <div class="bs-hpbar"><div class="fill ${monHpLow}" style="width:${monPct}%"></div></div>
            <div style="font-size:10px">${monHp} HP</div>
          </div>
        </div>
      </div>
      <div class="battle-log" id="duelLog">${logHtml}</div>
    `;
    overlay.hidden = false;
    const logEl = card.querySelector('#duelLog');
    if (logEl) logEl.scrollTop = logEl.scrollHeight;
    const delay = idx === 0 ? 700 : (isCrit ? 1100 : 900);
    setTimeout(() => render(idx + 1), delay);
  };
  render(0);
}

function settleDailyDuel(pet, monster, result) {
  const s = getState();
  const won = result.result === 'win';
  let reward = 0, dropEgg = false;
  update(st => {
    const p = st.pets.find(pp => pp.id === pet.id);
    if (p) { p.currentHp = Math.max(won ? 1 : 0, result.petHpLeft); p.buffs = []; }
    st.battles.push({ id: 'b_' + Date.now().toString(36), date: monster.date, petId: pet.id, monsterId: monster.id, result: result.result, turns: result.turns, dropEgg: false, earnedPoints: 0, attempt: 1 });
    st.stats.totalBattles++;
    if (!st.pokedex.monsters.includes(monster.tier)) st.pokedex.monsters.push(monster.tier);
    if (won) {
      st.stats.streak = (st.stats.streak || 0) + 1;
      if (st.stats.streak > st.stats.bestStreak) st.stats.bestStreak = st.stats.streak;
      st.stats.totalWins++;
      reward = winReward(monster.tier);
      dropEgg = shouldDropEgg(monster.tier, st.stats.noDropStreak || 0);
      st.stats.noDropStreak = dropEgg ? 0 : (st.stats.noDropStreak || 0) + 1;
    } else { st.stats.streak = 0; reward = 2; }
    st.wallet.points += reward; st.wallet.totalEarned += reward;
  });
  if (dropEgg) addEgg('daily-duel');

  if (won) {
    recordDailyDuel({ result: result.result, dropEgg, reward, monsterId: monster.id });
    const streakAfter = getState().stats.streak;
    closeOverlay();
    const sub = dropEgg ? `获得 ${reward} 金币 · 掉落宠物蛋🥚` : `获得 ${reward} 金币 · 连胜 ${streakAfter}`;
    celebrateWithCake('决斗胜利', sub);
    setTimeout(()=>switchTab('home'),100);
    return;
  }

  // 失败：记录怪物剩余状态，允许二次决斗
  recordDailyDuel({
    result: 'lose',
    dropEgg: false,
    reward,
    monsterId: monster.id,
    retryState: {
      monsterHpLeft: result.monsterHpLeft,
      monsterAtkLeft: monster.atk,
      monsterDefLeft: monster.def,
      attempt: 1,
    },
  });

  const html = `<h2>😴 决斗失败</h2>
    <div class="desc">没能击败 ${monster.name}，连胜归零 · 获得 ${reward} 金币</div>
    <div style="background:var(--bg-soft);border-radius:12px;padding:12px;margin:12px 0;text-align:center">
      <div style="font-size:14px;color:var(--text-soft)">怪物剩余状态</div>
      <div style="font-size:28px;font-weight:800;color:var(--primary-dark);margin:4px 0">${monster.emoji} ${result.monsterHpLeft} HP</div>
      <div style="font-size:12px;color:var(--text-soft)">冲击力 ${monster.atk} · 防御 ${monster.def}</div>
    </div>
    <div style="font-size:13px;color:var(--primary-dark);text-align:center;margin-bottom:12px">
      💡 可以给宠物喂食恢复体力后，再发起<b>二次决斗</b>！<br>怪物会保留剩余血量。
    </div>
    <button class="btn block" id="duelRetry" style="margin-bottom:8px">🍎 去喂食恢复</button>
    <button class="btn secondary block" id="duelPet">好的</button>`;
  showOverlay(html, { onMount: c => {
    c.querySelector('#duelPet').onclick = () => { closeOverlay(); switchTab('home'); };
    c.querySelector('#duelRetry').onclick = () => { closeOverlay(); switchTab('pets'); };
  }});
}

/** 二次决斗结算 */
function settleDailyDuelRetry(pet, weakenedMonster, result) {
  const won = result.result === 'win';
  let reward = 0, dropEgg = false;
  update(st => {
    const p = st.pets.find(pp => pp.id === pet.id);
    if (p) { p.currentHp = Math.max(won ? 1 : 0, result.petHpLeft); p.buffs = []; }
    st.battles.push({ id: 'b_' + Date.now().toString(36), date: weakenedMonster.date, petId: pet.id, monsterId: weakenedMonster.id, result: result.result, turns: result.turns, dropEgg: false, earnedPoints: 0, attempt: 2 });
    st.stats.totalBattles++;
    if (won) {
      st.stats.streak = (st.stats.streak || 0) + 1;
      if (st.stats.streak > st.stats.bestStreak) st.stats.bestStreak = st.stats.streak;
      st.stats.totalWins++;
      reward = winReward(weakenedMonster.tier);
      dropEgg = shouldDropEgg(weakenedMonster.tier, st.stats.noDropStreak || 0);
      st.stats.noDropStreak = dropEgg ? 0 : (st.stats.noDropStreak || 0) + 1;
    } else { st.stats.streak = 0; reward = 2; }
    st.wallet.points += reward; st.wallet.totalEarned += reward;
  });
  if (dropEgg) addEgg('daily-duel');

  // 二次决斗后清除重试状态（无论胜负，不再有第三次机会）
  clearDuelRetryState();
  recordDailyDuel({ result: result.result, dropEgg, reward, monsterId: weakenedMonster.id });

  if (won) {
    const streakAfter = getState().stats.streak;
    closeOverlay();
    const sub = dropEgg ? `获得 ${reward} 金币 · 掉落宠物蛋🥚` : `获得 ${reward} 金币 · 连胜 ${streakAfter}`;
    celebrateWithCake('二次决斗胜利', sub);
    setTimeout(()=>switchTab('home'),100);
    return;
  }

  const html = `<h2>😴 二次决斗失败</h2>
    <div class="desc">没能击败 ${weakenedMonster.name}，连胜归零 · 获得 ${reward} 金币</div>
    <div style="font-size:13px;color:var(--text-soft);text-align:center;margin:8px 0">今日决斗机会已用完，明天再战！</div>
    <button class="btn block" id="duelPet">好的</button>`;
  showOverlay(html, { onMount: c => {
    c.querySelector('#duelPet').onclick = () => { closeOverlay(); switchTab('home'); };
  }});
}

/* ============ 图鉴/成就/礼物 浮层 ============ */
function openZombieDex() {
  try {
    const unlocked = (getState().pokedex?.monsters || []);
    let grid = '<div class="dex-grid">';
    for (const z of MONSTER_TIERS) {
      const has = unlocked.includes(z.tier);
      grid += `<div class="dex-cell ${has?'':'locked'}">
        <div class="dex-emoji" style="font-size:40px">${has ? z.emoji : '🔒'}</div>
        <div class="dex-name">${z.name}</div>
        <div class="dex-tier">Tier ${z.tier}</div>
      </div>`;
    }
    grid += '</div>';
    showOverlay(`<h2>🐺 怪物图鉴</h2><div class="desc">已解锁 ${unlocked.length}/${MONSTER_TIERS.length}</div>${grid}<button class="btn secondary block" id="close" style="margin-top:12px">关闭</button>`, { onMount: c => { c.querySelector('#close').onclick = closeOverlay; } });
  } catch (e) {
    console.error('[openZombieDex]', e);
    alert('怪物图鉴错误: ' + e.message);
  }
}

function openAchievements() {
  const list = getAchievementList();
  let html = `<h2>🏅 成就徽章</h2><div class="desc">已解锁 ${list.filter(a=>a.unlocked).length}/${list.length}</div>`;
  for (const a of list) {
    html += `<div class="ach-item ${a.unlocked?'unlocked':'locked'}">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-body"><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div>
      <div class="ach-status">${a.unlocked?'✓':'🔒'}</div>
    </div>`;
  }
  html += `<button class="btn secondary block" id="close" style="margin-top:12px">关闭</button>`;
  showOverlay(html, { onMount: c => { c.querySelector('#close').onclick = closeOverlay; } });
  markSeen();
}
