// shop.js — 商店：购买武器/食物、库存管理

import { getState, update } from './store.js';
import { SHOP_WEAPONS, SHOP_FOODS } from './db2.js';

/** 购买武器：扣积分、入库存 */
export function buyWeapon(weaponId) {
  const w = SHOP_WEAPONS.find(x => x.id === weaponId);
  if (!w) return { ok: false, msg: '武器不存在' };
  const s = getState();
  if (s.wallet.points < w.price) return { ok: false, msg: '积分不足' };
  update(st => {
    st.wallet.points -= w.price;
    const slot = st.inventory.weapons.find(x => x.itemId === weaponId);
    if (slot) slot.qty += 1;
    else st.inventory.weapons.push({ itemId: weaponId, qty: 1, equippedBy: null });
  });
  return { ok: true, msg: `购入 ${w.name}` };
}

/** 购买食物：扣积分、入库存 */
export function buyFood(foodId) {
  const f = SHOP_FOODS.find(x => x.id === foodId);
  if (!f) return { ok: false, msg: '食物不存在' };
  const s = getState();
  if (s.wallet.points < f.price) return { ok: false, msg: '积分不足' };
  update(st => {
    st.wallet.points -= f.price;
    const slot = st.inventory.foods.find(x => x.itemId === foodId);
    if (slot) slot.qty += 1;
    else st.inventory.foods.push({ itemId: foodId, qty: 1 });
  });
  return { ok: true, msg: `购入 ${f.name}` };
}

/** 取武器库存数 */
export function weaponQty(weaponId) {
  const s = getState();
  const slot = s.inventory.weapons.find(x => x.itemId === weaponId);
  return slot ? slot.qty : 0;
}

/** 取食物库存数 */
export function foodQty(foodId) {
  const s = getState();
  const slot = s.inventory.foods.find(x => x.itemId === foodId);
  return slot ? slot.qty : 0;
}
