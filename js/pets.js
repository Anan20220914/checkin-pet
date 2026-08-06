// pets.js — 宠物系统：切换出战、装备武器、喂食、有效属性

import { getState, update } from './store.js';
import { SHOP_WEAPONS, SHOP_FOODS, ACCESSORIES } from './db2.js';
import { clamp } from './utils.js';

/** 取当前出战宠物 */
export function getActivePet() {
  const s = getState();
  return s.pets.find(p => p.active) || s.pets[0] || null;
}

/** 切换出战宠物 */
export function switchActive(petId) {
  update(s => {
    for (const p of s.pets) p.active = (p.id === petId);
    // 切换出战时清空旧 buff（装备不变）
  });
}

/** 给宠物装备武器（要求宠物稀有度 ≥ 武器门槛） */
export function equipWeapon(petId, weaponId) {
  const weapon = SHOP_WEAPONS.find(w => w.id === weaponId);
  if (!weapon) return { ok: false, msg: '武器不存在' };
  // 校验稀有度门槛
  const order = ['common', 'rare', 'epic', 'legendary'];
  const s = getState();
  const pet = s.pets.find(p => p.id === petId);
  if (!pet) return { ok: false, msg: '宠物不存在' };
  if (order.indexOf(pet.rarity) < order.indexOf(weapon.rarityReq)) {
    return { ok: false, msg: `${pet.species} 的等级不足以装备${weapon.name}` };
  }
  update(st => {
    const p = st.pets.find(pp => pp.id === petId);
    if (p) p.equippedWeapon = weaponId;
  });
  return { ok: true, msg: `已装备 ${weapon.name}` };
}

/** 计算宠物成长阶段 */
export function calcGrowthStage(feedCount) {
  if (feedCount >= 15) return 'mature';
  if (feedCount >= 5) return 'teen';
  return 'baby';
}

/** 喂食宠物：消耗食物库存，恢复 HP 或叠加 buff */
export function feedPet(petId, foodId) {
  const food = SHOP_FOODS.find(f => f.id === foodId);
  if (!food) return { ok: false, msg: '食物不存在' };
  const s = getState();
  const slot = s.inventory.foods.find(f => f.itemId === foodId);
  if (!slot || slot.qty <= 0) return { ok: false, msg: `${food.name} 库存不足` };
  const pet = s.pets.find(p => p.id === petId);
  if (!pet) return { ok: false, msg: '宠物不存在' };

  update(st => {
    const fslot = st.inventory.foods.find(f => f.itemId === foodId);
    fslot.qty -= 1;
    if (fslot.qty <= 0) {
      st.inventory.foods = st.inventory.foods.filter(f => f.qty > 0);
    }
    const p = st.pets.find(pp => pp.id === petId);
    if (food.heal) {
      p.currentHp = clamp(p.currentHp + food.heal, 0, p.hp);
    }
    if (food.buff) {
      if (food.buff.revive) {
        p.buffs.push({ revive: true });
      } else {
        p.buffs.push({ ...food.buff });
      }
    }
    // 成长系统：增加喂食次数
    p.feedCount = (p.feedCount || 0) + 1;
    p.growthStage = calcGrowthStage(p.feedCount);
    // 喂食后心情变为开心
    p.mood = 'happy';
  });
  return { ok: true, msg: `${pet.species} 吃了${food.name}` };
}

/** 计算宠物有效属性（含装备+buff）供 UI 展示 */
export function petStats(pet) {
  let atkBonus = 0, defBonus = 0, hasRevive = false;
  let weapon = null;
  if (pet.equippedWeapon) {
    weapon = SHOP_WEAPONS.find(w => w.id === pet.equippedWeapon) || null;
    if (weapon) atkBonus += weapon.atk;
  }
  for (const b of (pet.buffs || [])) {
    if (b.atk) atkBonus += b.atk;
    if (b.def) defBonus += b.def;
    if (b.revive) hasRevive = true;
  }
  return {
    atk: pet.atk + atkBonus, def: pet.def + defBonus,
    weapon, atkBonus, defBonus, hasRevive,
  };
}

/** 清除 buff（战斗结束时调用） */
export function clearBuffs(petId) {
  update(s => {
    const p = s.pets.find(pp => pp.id === petId);
    if (p) p.buffs = [];
  });
}

/** 设宠物当前 HP（战斗结算后） */
export function setPetHp(petId, hp) {
  update(s => {
    const p = s.pets.find(pp => pp.id === petId);
    if (p) p.currentHp = clamp(hp, 0, p.hp);
  });
}

/** 购买配饰 */
export function buyAccessory(accId) {
  const a = ACCESSORIES.find(x => x.id === accId);
  if (!a) return { ok: false, msg: '配饰不存在' };
  const s = getState();
  if ((s.accessories?.owned || []).includes(accId)) return { ok: false, msg: '已拥有' };
  if (s.wallet.points < a.price) return { ok: false, msg: '积分不足' };
  update(st => {
    st.wallet.points -= a.price;
    st.accessories = st.accessories || { owned: [], equipped: {} };
    st.accessories.owned.push(accId);
  });
  return { ok: true, msg: `购入 ${a.name}` };
}

/** 给宠物装备/卸下配饰 */
export function toggleAccessory(petId, accId) {
  update(s => {
    const p = s.pets.find(pp => pp.id === petId);
    if (!p) return;
    p.accessories = p.accessories || [];
    const idx = p.accessories.indexOf(accId);
    if (idx >= 0) p.accessories.splice(idx, 1);
    else p.accessories.push(accId);
  });
}

/** 设置宠物染色索引 */
export function setPetColor(petId, colorIdx) {
  update(s => {
    const p = s.pets.find(pp => pp.id === petId);
    if (p) p.colorIdx = colorIdx;
  });
}

/** 设置宠物背景色 */
export function setPetBgColor(petId, color) {
  update(s => {
    const p = s.pets.find(pp => pp.id === petId);
    if (p) p.bgColor = color;
  });
}

/** 设置/切换宠物贴纸 */
export function setPetSticker(petId, sticker) {
  update(s => {
    const p = s.pets.find(pp => pp.id === petId);
    if (p) p.sticker = (p.sticker === sticker ? null : sticker);
  });
}
