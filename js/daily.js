// daily.js — 每日刷新编排：怪物刷新、回血、checkin 初始化、蛋孵化

import { getState, update } from './store.js';
import { todayKey, uid, chance, randInt, weightedPick } from './utils.js';
import {
  MONSTER_TIERS, RARITY_TABLE, SPECIES_BY_RARITY, DAILY_REGEN_RATIO, EGG_HATCH_HOURS,
} from './db2.js';
import { generateMonsterFor } from './battle.js';

/** 应用启动时调用：确保今日数据就绪 */
export function ensureToday() {
  const s = getState();
  const today = todayKey();

  // 蛋孵化检查（无论是否换天都可能到期）
  tryHatch();

  // 今日 checkin 不存在则建空
  update(st => {
    if (!st.checkins[today]) {
      st.checkins[today] = { done: {}, earned: 0, battleTriggered: false, battleId: null };
    }
  });

  // 怪物刷新：今日怪物为空或日期不是今天则生成
  const m = getState().monsters.today;
  if (!m || m.date !== today) {
    update(st => {
      // 旧怪物（昨天）如有则进 history
      if (st.monsters.today && st.monsters.today.date !== today) {
        // 战斗历史已单独记录，怪物不必重复归档
      }
      st.monsters.today = generateMonsterFor(today, st.stats.streak);
      // 遇到即解锁怪物图鉴
      const tier = st.monsters.today.tier;
      if (tier && !st.pokedex.monsters.includes(tier)) {
        st.pokedex.monsters.push(tier);
      }
    });
  }
}

/** 每日自然回血 10%（温和馈赠），在跨天时对所有宠物执行 */
export function dailyRegen() {
  update(st => {
    for (const pet of st.pets) {
      if (pet.currentHp < pet.hp) {
        const regen = Math.round(pet.hp * DAILY_REGEN_RATIO);
        pet.currentHp = Math.min(pet.hp, pet.currentHp + regen);
      }
    }
  });
}

/** 蛋孵化检查：hatchAt <= now 的蛋移到 pets[] */
/** 孵化稀有度根据"最近决斗情况"定：连胜越高孵出越稀有 */
export function tryHatch() {
  // 先读当前决斗连胜，决定本次孵化稀有度
  const s0 = getState();
  const streak = s0.stats.streak || 0;
  const lastBattle = (s0.battles || []).slice(-1)[0];
  const lastWin = lastBattle ? lastBattle.result === 'win' : false;
  const rarity = rarityByDuel(streak, lastWin);

  update(st => {
    const now = Date.now();
    const remaining = [];
    for (const egg of st.inventory.eggs) {
      if (egg.hatchAt <= now) {
        const species = weightedPick(SPECIES_BY_RARITY[rarity].map((sp, i) => ({ ...sp, weight: 1 })));
        const base = RARITY_TABLE[rarity];
        st.pets.push({
          id: uid('p'), species: species.species, emoji: species.emoji, rarity,
          hp: base.hp, atk: base.atk, def: base.def,
          active: false, currentHp: base.hp, buffs: [], equippedWeapon: null,
          obtainedAt: todayKey(), colorIdx: 0, accessories: [], bgColor: '#fff8e7', sticker: null,
        });
        if (!st.pokedex.pets.includes(species.species)) st.pokedex.pets.push(species.species);
      } else {
        remaining.push(egg);
      }
    }
    st.inventory.eggs = remaining;
    st.stats.maxPets = Math.max(st.stats.maxPets || 1, st.pets.length);
  });
}

/** 根据决斗连胜+最近胜负定孵化稀有度 */
function rarityByDuel(streak, lastWin) {
  if (!lastWin) return 'common'; // 最近没赢 → 只孵普通
  if (streak >= 10) return 'legendary'; // 连胜10+ → 传说
  if (streak >= 6) return 'epic';       // 连胜6-9 → 史诗
  if (streak >= 3) return 'rare';       // 连胜3-5 → 稀有
  return 'common';                       // 连胜1-2 → 普通
}

/** 加新蛋（战斗掉落用） */
export function addEgg(source = 'battle') {
  update(st => {
    st.inventory.eggs.push({
      eggId: uid('e'), source,
      hatchAt: Date.now() + EGG_HATCH_HOURS * 3600000,
    });
  });
}

/** 稀有度概率抽取（按 RARITY_TABLE.weight） */
export function pickRarity() {
  const entries = Object.entries(RARITY_TABLE).map(([k, v]) => ({ rarity: k, weight: v.weight }));
  return weightedPick(entries, 'weight').rarity;
}

/** 战斗失败后的次日回到 tier1：重置连胜已在 battle 模块处理 */
export function resetStreakForNewDayIfLose() {
  // 预留：如需"跨天自动处理失败连胜"可在此
}
