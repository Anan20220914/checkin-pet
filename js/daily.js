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

/** 稀有度概率抽取（按 RARITY_TABLE.weight） */
export function pickRarity() {
  const entries = Object.entries(RARITY_TABLE).map(([k, v]) => ({ rarity: k, weight: v.weight }));
  return weightedPick(entries, 'weight').rarity;
}

/** 战斗失败后的次日回到 tier1：重置连胜已在 battle 模块处理 */
export function resetStreakForNewDayIfLose() {
  // 预留：如需"跨天自动处理失败连胜"可在此
}
