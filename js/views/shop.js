// views/shop.js — 商店页：武器 + 食物，购买

import { getState } from '../store.js';
import { buyWeapon, buyFood, weaponQty, foodQty } from '../shop.js';
import { SHOP_WEAPONS, SHOP_FOODS, RARITY_NAME, RARITY_COLOR } from '../db2.js';
import { esc } from '../utils.js';
import { toast } from '../app.js';

const COIN = '<span class="coin-ico sm"></span>';


export function renderShop() {
  const s = getState();
  let html = '';

  html += `<div class="card" style="display:flex;justify-content:space-between;align-items:center">
    <div><div class="muted" style="font-size:12px">积分钱包</div><div style="font-size:24px;font-weight:800;color:var(--primary-dark)">${s.wallet.points} <span class="coin-ico"></span></div></div>
    <div class="muted" style="font-size:12px;text-align:right">累计获得<br>${s.wallet.totalEarned}</div>
  </div>`;

  // 武器
  html += `<div class="section-title">⚔️ 武器</div>`;
  const order = ['common','rare','epic','legendary'];
  for (const w of SHOP_WEAPONS) {
    const have = weaponQty(w.id);
    html += `<div class="shop-item">
      <div class="s-icon">${w.emoji}</div>
      <div class="s-body">
        <div class="s-name">${w.name} <span class="badge" style="background:${RARITY_COLOR[w.rarityReq]}">${RARITY_NAME[w.rarityReq]}+</span></div>
        <div class="s-desc">攻击 +${w.atk}</div>
      </div>
      <div class="s-actions">
        <button class="btn-sm btn-buy" data-w="${w.id}" ${s.wallet.points >= w.price ? '' : 'disabled'}>${w.price}${COIN}</button>
        ${have ? `<span class="qty-tag">已有 ${have}</span>` : ''}
      </div>
    </div>`;
  }

  // 食物
  html += `<div class="section-title">🍎 食物</div>`;
  for (const f of SHOP_FOODS) {
    const have = foodQty(f.id);
    html += `<div class="shop-item">
      <div class="s-icon">${f.emoji}</div>
      <div class="s-body">
        <div class="s-name">${f.name}</div>
        <div class="s-desc">${descFood(f)}</div>
      </div>
      <div class="s-actions">
        <button class="btn-sm btn-buy" data-f="${f.id}" ${s.wallet.points >= f.price ? '' : 'disabled'}>${f.price}${COIN}</button>
        ${have ? `<span class="qty-tag">已有 ${have}</span>` : ''}
      </div>
    </div>`;
  }

  document.getElementById('view-shop').innerHTML = html;

  document.getElementById('view-shop').querySelectorAll('[data-w]').forEach(b => b.onclick = () => {
    const r = buyWeapon(b.dataset.w);
    toast(r.msg);
  });
  document.getElementById('view-shop').querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
    const r = buyFood(b.dataset.f);
    toast(r.msg);
  });
}

function descFood(f) {
  let s = '';
  if (f.heal) s += `回血${f.heal >= 9999 ? '满' : f.heal}`;
  if (f.buff) {
    if (f.buff.atk) s += ` 攻+${f.buff.atk}`;
    if (f.buff.def) s += ` 防+${f.buff.def}`;
    if (f.buff.revive) s += ' 战斗复活';
  }
  return s || '无特殊效果';
}
