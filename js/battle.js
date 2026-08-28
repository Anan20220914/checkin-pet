// battle.js — 怪物生成、回合结算、胜负判定、掉蛋（纯函数为主）

import { MONSTER_TIERS, RARITY_TABLE, SHOP_WEAPONS, SHOP_FOODS, weaponIcon, findCompanion } from './db2.js';
import { randInt, chance, uid, weightedPick } from './utils.js';

/** 按连胜数取每日对决 tier 配置 */
export function tierForStreak(streak) {
  let tier = MONSTER_TIERS[0];
  for (const t of MONSTER_TIERS) {
    if (streak >= t.streakMin) tier = t;
  }
  return tier;
}

/** 生成每日对决当日大怪兽（按连胜 Tier） */
export function generateMonsterFor(date, streak) {
  const tierCfg = tierForStreak(streak);
  const hp = randInt(tierCfg.hp[0], tierCfg.hp[1]);
  const atk = randInt(tierCfg.atk[0], tierCfg.atk[1]);
  const def = randInt(tierCfg.def[0], tierCfg.def[1]);
  return {
    id: `m_${date}_${randInt(100, 999)}`,
    date, tier: tierCfg.tier,
    name: tierCfg.name, emoji: tierCfg.emoji,
    hp, atk, def, maxHp: hp,
  };
}

/** 生成英语开口专属小怪兽（单向、独立于每日大怪兽） */
export function generateSpeakMonster(date) {
  // HP 50：宠物无武器 ATK10 每次约8伤害，读对6-7个可打死；
  // 买了武器伤害更高更轻松。读错不攻击，给孩子正反馈
  return {
    id: `sm_${date}_${randInt(100, 999)}`,
    date, name: '读音小怪', emoji: '🌀',
    hp: 50, atk: 0, def: 2, maxHp: 50, isSpeak: true,
  };
}

/** 计算宠物有效属性（基础 + 装备武器 + 食物 buff） */
export function petEffectiveStats(pet) {
  let atkBonus = 0, defBonus = 0, revive = false;
  let weapon = null;
  if (pet.equippedWeapon) {
    weapon = SHOP_WEAPONS.find(w => w.id === pet.equippedWeapon) || null;
    if (weapon) atkBonus += weapon.atk;
  }
  for (const b of (pet.buffs || [])) {
    if (b.atk) atkBonus += b.atk;
    if (b.def) defBonus += b.def;
    if (b.revive) revive = true;
  }
  return { atk: pet.atk + atkBonus, def: pet.def + defBonus, revive, weapon };
}

/** 单次攻击伤害（开口战斗逐词用，每日对决也用） */
export function attackDamage(atkTotal, defOpp) {
  return Math.max(1, atkTotal - defOpp + randInt(-2, 2));
}

/**
 * 每日对决完整回合结算（纯函数）
 * log 每条带 HP 快照 { petHp, monHp }，便于逐回合动画
 * @param pet 宠物对象
 * @param monster 怪兽对象
 * @param companionId 可选，小伙伴id
 * @returns { log, result, petHpLeft, monsterHpLeft, usedRevive, turns }
 */
export function runBattle(pet, monster, companionId = null) {
  const eff = petEffectiveStats(pet);
  let petHp = pet.currentHp;
  const petMaxHp = pet.hp;
  let monHp = monster.hp;
  const petAtk = eff.atk, petDef = eff.def;
  let usedRevive = false;
  const log = [];
  const MAX_TURNS = 30;

  // 小伙伴技能效果
  const companion = companionId ? findCompanion(companionId) : null;
  let monAtk = monster.atk;
  let companionBonusDmg = 0;
  let companionHeal = 0;
  let companionShield = 0;
  let companionReduceAtk = 0;

  if (companion) {
    if (companion.skill === 'extraDamage') companionBonusDmg = companion.power;
    if (companion.skill === 'heal') companionHeal = companion.power;
    if (companion.skill === 'reduceAtk') { companionReduceAtk = companion.power; monAtk = Math.max(1, monAtk - companion.power); }
    if (companion.skill === 'shield') companionShield = companion.power;
    log.push({ actor: 'system', text: `🤝 ${companion.emoji} ${companion.name} 加入了战斗！技能：${companion.skillName}`, petHp, monHp });
  }

  log.push({ actor: 'system', text: `⚔️ 战斗开始！${pet.emoji} ${pet.species} VS ${monster.emoji} ${monster.name}`, petHp, monHp });

  for (let turn = 1; turn <= MAX_TURNS; turn++) {
    // 宠物先手
    let dmgToMon = attackDamage(petAtk, monster.def);
    // 小伙伴额外伤害
    if (companionBonusDmg > 0) {
      dmgToMon += companionBonusDmg;
      log.push({ actor: 'pet', text: `回合${turn}：${pet.species} ${eff.weapon ? weaponIcon(eff.weapon) : '👊'} 攻击造成 ${dmgToMon - companionBonusDmg} 伤害，${companion.emoji} ${companion.name} 追加 ${companionBonusDmg} 伤害`, petHp, monHp: Math.max(0, monHp - dmgToMon) });
    } else {
      log.push({ actor: 'pet', text: `回合${turn}：${pet.species} ${eff.weapon ? weaponIcon(eff.weapon) : '👊'} 攻击造成 ${dmgToMon} 伤害`, petHp, monHp: Math.max(0, monHp - dmgToMon) });
    }
    monHp -= dmgToMon;
    if (monHp <= 0) {
      log.push({ actor: 'system', text: `🎉 ${monster.emoji} ${monster.name} 被击败！`, petHp: Math.max(0, petHp), monHp: 0 });
      return { log, result: 'win', petHpLeft: Math.max(0, petHp), monsterHpLeft: 0, usedRevive, turns: turn };
    }
    // 怪兽反击
    let dmgToPet = attackDamage(monAtk, petDef);
    // 小伙伴护盾减伤
    if (companionShield > 0) {
      dmgToPet = Math.max(1, dmgToPet - companionShield);
    }
    petHp -= dmgToPet;
    log.push({ actor: 'monster', text: `${monster.emoji} ${monster.name} 反击造成 ${dmgToPet} 伤害${companionShield > 0 ? `（护盾抵消${companionShield}）` : ''}`, petHp: Math.max(0, petHp), monHp: Math.max(0, monHp) });
    // 小伙伴治疗
    if (companionHeal > 0 && petHp > 0 && petHp < petMaxHp) {
      const healed = Math.min(companionHeal, petMaxHp - petHp);
      petHp += healed;
      log.push({ actor: 'system', text: `${companion.emoji} ${companion.name} 治愈恢复 ${healed} HP`, petHp, monHp: Math.max(0, monHp) });
    }
    if (petHp <= 0) {
      if (eff.revive && !usedRevive) {
        usedRevive = true;
        petHp = Math.round(petMaxHp * 0.3);
        log.push({ actor: 'system', text: `🧪 神秘药剂触发！${pet.species} 复活，恢复30%生命`, petHp, monHp: Math.max(0, monHp) });
      } else {
        log.push({ actor: 'system', text: `😢 ${pet.emoji} ${pet.species} 被打败了…`, petHp: 0, monHp: Math.max(0, monHp) });
        return { log, result: 'lose', petHpLeft: 0, monsterHpLeft: Math.max(0, monHp), usedRevive, turns: turn };
      }
    }
  }
  // 超过回合上限
  const monPct = monHp / monster.hp;
  if (monPct > 0.5) {
    log.push({ actor: 'system', text: '回合用尽，未能击败怪兽…', petHp: Math.max(0, petHp), monHp: Math.max(0, monHp) });
    return { log, result: 'lose', petHpLeft: Math.max(0, petHp), monsterHpLeft: Math.max(0, monHp), usedRevive, turns: MAX_TURNS };
  }
  log.push({ actor: 'system', text: '回合用尽，险胜！', petHp: Math.max(0, petHp), monHp: 0 });
  return { log, result: 'win', petHpLeft: Math.max(0, petHp), monsterHpLeft: 0, usedRevive, turns: MAX_TURNS };
}

/** 判定每日对决是否掉蛋：按 tier 掉率 + pity（连续2次未掉则必掉） */
export function shouldDropEgg(tier, noDropStreak) {
  const tierCfg = MONSTER_TIERS.find(t => t.tier === tier);
  if (!tierCfg) return false;
  if (noDropStreak >= 2) return true;
  return chance(tierCfg.drop);
}

/** 每日对决胜利奖励积分（按 tier） */
export function winReward(tier) {
  const tierCfg = MONSTER_TIERS.find(t => t.tier === tier);
  return tierCfg ? tierCfg.reward : 5;
}

/** 每日对决失败安慰积分 */
export const LOSE_REWARD = 2;
