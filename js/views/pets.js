// views/pets.js — 宠物页：图渲染、捏脸、配饰、切换、喂食、图鉴

import { getState, update } from '../store.js';
import { getActivePet, petStats, switchActive, feedPet, equipWeapon, buyAccessory, toggleAccessory, setPetBgColor, setPetSticker } from '../pets.js';
import { foodQty, weaponQty } from '../shop.js';
import { SHOP_FOODS, SHOP_WEAPONS, ACCESSORIES, RARITY_NAME, RARITY_COLOR, SPECIES_BY_RARITY, weaponIcon, COMPANIONS, findCompanion } from '../db2.js';
import { renderPet, getPalette } from '../pet-render.js';
import { getPetSvg, petDefaultColor } from '../pet-svgs.js';
import { esc } from '../utils.js';
import { showOverlay, closeOverlay, toast, switchTab } from '../app.js';


export function renderPets() {
  const s = getState();
  const pet = getActivePet();
  let html = '';

  if (pet) {
    const stats = petStats(pet);
    const pct = (pet.currentHp / pet.hp) * 100;
    html += `
      <div class="card pet-hero">
        ${renderPet(pet, 'lg')}
        <div class="pet-name">${esc(pet.species)} <span class="badge" style="background:${RARITY_COLOR[pet.rarity]}">${RARITY_NAME[pet.rarity]}</span></div>
        <div style="margin-top:8px;width:80%;margin-left:auto;margin-right:auto">
          <div class="hp-bar ${pct < 30 ? 'low' : ''}"><div class="fill" style="width:${pct}%"></div></div>
          <div class="hp-text"><span>体力 ${pet.currentHp}/${pet.hp}</span><span>${pct < 30 ? '需恢复' : '健康'}</span></div>
        </div>
        <div style="text-align:left;margin-top:8px;width:80%;margin-left:auto;margin-right:auto">
          <div class="stat-row"><span class="label">攻击</span><span class="value">${stats.atk}${stats.atkBonus ? ` (+${stats.atkBonus})` : ''}</span></div>
          <div class="stat-row"><span class="label">防御</span><span class="value">${stats.def}${stats.defBonus ? ` (+${stats.defBonus})` : ''}</span></div>
          <div class="stat-row"><span class="label">武器</span><span class="value">${stats.weapon ? weaponIcon(stats.weapon) + ' ' + stats.weapon.name : '无'}</span></div>
        </div>
        <div class="row" style="margin-top:12px;width:90%;margin-left:auto;margin-right:auto">
          <button class="btn secondary" id="petCustomize">🎨 捏脸</button>
          <button class="btn secondary" id="petFeed">🍎 喂食</button>
          <button class="btn secondary" id="petEquip">⚔️ 装备</button>
        </div>
      </div>
    `;
  }

  // 所有宠物
  html += `<div class="section-title">🐾 我的宠物（${s.pets.length}）</div>`;
  for (const p of s.pets) {
    const active = p.active || p.id === pet?.id;
    html += `
      <div class="pet-mini ${active ? 'active' : ''}" data-pet="${p.id}" style="align-items:center">
        <div style="width:48px;height:48px">${renderPet(p, 'sm')}</div>
        <div class="pm-body">
          <div class="pm-name">${esc(p.species)} <span class="badge" style="background:${RARITY_COLOR[p.rarity]}">${RARITY_NAME[p.rarity]}</span></div>
          <div class="pm-sub">HP ${p.currentHp}/${p.hp} · ATK ${petStats(p).atk}${p.equippedWeapon ? ' · 已装备' : ''}</div>
        </div>
        <div style="font-size:11px;color:var(--text-soft)">${active ? '出战中' : '出战'}</div>
      </div>
    `;
  }

  // 蛋
  if (s.inventory.eggs.length) {
    html += `<div class="section-title">🥚 待孵化（${s.inventory.eggs.length}）</div>`;
    for (const egg of s.inventory.eggs) {
      const left = fmtCountdown(egg.hatchAt);
      html += `<div class="egg-card"><div class="egg-emoji">🥚</div><div class="pm-body"><div class="pm-name">神秘蛋</div><div class="pm-sub">${left}</div></div></div>`;
    }
  }

  // 小伙伴模块
  const companions = s.companions || { owned: COMPANIONS.map(c => c.id), active: null };
  const activeComp = companions.active ? findCompanion(companions.active) : null;
  html += `<div class="section-title">🤝 小伙伴（${companions.owned.length} 个）</div>`;
  html += `<div class="companion-list">`;
  for (const c of COMPANIONS) {
    const owned = companions.owned.includes(c.id);
    if (!owned) continue;
    const isActive = companions.active === c.id;
    html += `
      <div class="companion-mini ${isActive ? 'active' : ''}" data-comp="${c.id}" style="${isActive ? `border-color:${c.color}` : ''}">
        <div class="comp-emoji" style="font-size:32px">${c.emoji}</div>
        <div class="cm-body">
          <div class="cm-name">${c.colorName}${c.name}</div>
          <div class="cm-skill" style="color:${c.color};font-weight:700">${c.skillName}</div>
          <div class="cm-desc">${c.skillDesc}</div>
        </div>
        <div class="cm-status">${isActive ? '✅ 出战中' : '点击选择'}</div>
      </div>
    `;
  }
  html += `</div>`;
  // 不带伙伴选项
  if (activeComp) {
    html += `<div style="text-align:center;margin-top:4px"><button class="btn-sm secondary" id="compNone">不带小伙伴</button></div>`;
  }

  // 图鉴入口
  html += `<div style="margin-top:12px"><button class="btn secondary block" id="petDexBtn">📖 宠物图鉴</button></div>`;

  document.getElementById('view-pets').innerHTML = html;

  // 绑定
  document.getElementById('view-pets').querySelectorAll('.pet-mini').forEach(node => {
    node.onclick = () => { switchActive(node.dataset.pet); toast('已切换出战宠物'); };
  });
  document.getElementById('view-pets').querySelector('#petCustomize')?.addEventListener('click', () => openCustomize());
  document.getElementById('view-pets').querySelector('#petFeed')?.addEventListener('click', () => openFeedMenu());
  document.getElementById('view-pets').querySelector('#petEquip')?.addEventListener('click', () => openEquipMenu());
  document.getElementById('view-pets').querySelector('#petDexBtn')?.addEventListener('click', () => openPetDex());

  // 小伙伴选择
  document.getElementById('view-pets').querySelectorAll('.companion-mini').forEach(node => {
    node.onclick = () => {
      const compId = node.dataset.comp;
      update(st => {
        if (!st.companions) st.companions = { owned: COMPANIONS.map(c => c.id), active: null };
        st.companions.active = compId;
      });
      const c = findCompanion(compId);
      toast(`已选择 ${c.colorName}${c.emoji} ${c.name} 一起战斗！`);
      renderPets();
    };
  });
  document.getElementById('view-pets').querySelector('#compNone')?.addEventListener('click', () => {
    update(st => { if (!st.companions) st.companions = { owned: COMPANIONS.map(c => c.id), active: null }; st.companions.active = null; });
    toast('已取消小伙伴');
    renderPets();
  });
}

function fmtCountdown(targetMs) {
  const diff = targetMs - Date.now();
  if (diff <= 0) return '可孵化';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}小时${m}分钟后` : `${m}分钟后`;
}

function openCustomize() {
  const pet = getActivePet();
  if (!pet) return;

  // 背景色选项
  const bgColors = ['#fff8e7','#fde68a','#fbcfe8','#bbf7d0','#bfdbfe','#ddd6fe','#fed7aa','#fecaca'];
  let bgHtml = bgColors.map(c => `<div class="bg-swatch ${pet.bgColor === c ? 'active' : ''}" data-bg="${c}" style="background:${c}"></div>`).join('');

  // 贴纸选项
  const stickers = ['💖','⭐','🌈','🎶','💫','🔆','🎀','🌟'];
  let stickerHtml = stickers.map(s => `<button class="sticker-btn ${pet.sticker === s ? 'active' : ''}" data-sticker="${s}">${s}</button>`).join('');

  // 配饰
  let accHtml = '<div class="acc-grid">';
  for (const a of ACCESSORIES) {
    const equipped = (pet.accessories || []).includes(a.id);
    accHtml += `<button data-acc="${a.id}" class="${equipped ? 'equipped' : ''}">${a.name}${equipped ? ' ✓' : ''}</button>`;
  }
  accHtml += '</div>';

  const html = `
    <h2>🎨 捏脸 ${esc(pet.species)}</h2>
    <div style="text-align:center;margin:8px 0">${renderPet(pet, 'lg')}</div>
    <div class="custom-panel">
      <div>
        <div class="section-title" style="margin:0 0 6px">背景色</div>
        <div class="bg-swatches">${bgHtml}</div>
      </div>
      <div>
        <div class="section-title" style="margin:0 0 6px">贴纸</div>
        <div class="sticker-grid">${stickerHtml}</div>
      </div>
      <div>
        <div class="section-title" style="margin:0 0 6px">配饰</div>
        ${accHtml}
      </div>
      <div class="hint">全部免费，点击自由搭配 ✨</div>
    </div>
    <button class="btn secondary block" id="ccClose" style="margin-top:12px">完成</button>
  `;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelectorAll('.bg-swatch').forEach(sw => {
        sw.onclick = () => { setPetBgColor(pet.id, sw.dataset.bg); openCustomize(); };
      });
      card.querySelectorAll('.sticker-btn').forEach(b => {
        b.onclick = () => { setPetSticker(pet.id, b.dataset.sticker); openCustomize(); };
      });
      card.querySelectorAll('[data-acc]').forEach(b => {
        b.onclick = () => { toggleAccessory(pet.id, b.dataset.acc); openCustomize(); };
      });
      card.querySelector('#ccClose').onclick = () => { closeOverlay(); renderPets(); };
    },
  });
}

function openFeedMenu() {
  const pet = getActivePet();
  if (!pet) return;
  const foods = SHOP_FOODS.filter(f => foodQty(f.id) > 0);
  if (!foods.length) {
    showOverlay(`<h2>🍎 喂食</h2><div class="desc">没有食物了，去商店买一些吧</div><button class="btn block" id="goShop">去商店</button>`, {
      onMount: c => { c.querySelector('#goShop').onclick = () => { closeOverlay(); switchTab('shop'); }; },
    });
    return;
  }
  let list = '';
  for (const f of foods) {
    list += `<div class="shop-item"><div class="s-icon">${f.emoji}</div><div class="s-body"><div class="s-name">${f.name}</div><div class="s-desc">${descFood(f)}</div></div><button class="btn-sm btn-feed" data-food="${f.id}">喂</button></div>`;
  }
  showOverlay(`<h2>🍎 喂 ${esc(pet.species)}</h2><div class="desc">体力 ${pet.currentHp}/${pet.hp}</div>${list}<button class="btn secondary block" id="close">关闭</button>`, {
    onMount: c => {
      c.querySelectorAll('.btn-feed').forEach(b => b.onclick = () => {
        const r = feedPet(pet.id, b.dataset.food);
        toast(r.msg);
        if (r.ok) { closeOverlay(); renderPets(); }
      });
      c.querySelector('#close').onclick = closeOverlay;
    },
  });
}

function openEquipMenu() {
  const pet = getActivePet();
  if (!pet) return;
  const weapons = SHOP_WEAPONS.filter(w => weaponQty(w.id) > 0);
  if (!weapons.length) {
    showOverlay(`<h2>⚔️ 装备</h2><div class="desc">没有武器，去商店买一些吧</div><button class="btn block" id="goShop">去商店</button>`, {
      onMount: c => { c.querySelector('#goShop').onclick = () => { closeOverlay(); switchTab('shop'); }; },
    });
    return;
  }
  const order = ['common','rare','epic','legendary'];
  let list = '';
  for (const w of weapons) {
    list += `<div class="shop-item"><div class="s-icon">${weaponIcon(w)}</div><div class="s-body"><div class="s-name">${w.name}</div><div class="s-desc">攻击 +${w.atk}</div></div><button class="btn-sm btn-equip" data-w="${w.id}">${pet.equippedWeapon === w.id ? '已装' : '装备'}</button></div>`;
  }
  showOverlay(`<h2>⚔️ 给 ${esc(pet.species)} 装备</h2>${list}<button class="btn secondary block" id="close">关闭</button>`, {
    onMount: c => {
      c.querySelectorAll('.btn-equip').forEach(b => b.onclick = () => {
        const r = equipWeapon(pet.id, b.dataset.w);
        toast(r.msg);
        if (r.ok) { closeOverlay(); renderPets(); }
      });
      c.querySelector('#close').onclick = closeOverlay;
    },
  });
}

/** 宠物图鉴 */
export function openPetDex() {
  try {
  const unlocked = (getState().pokedex?.pets || []);
  const ownedSpecies = (getState().pets || []).map(p => p.species);
  let grid = '<div class="dex-grid">';
  for (const [rarity, list] of Object.entries(SPECIES_BY_RARITY)) {
    for (const sp of list) {
      const has = unlocked.includes(sp.species) || ownedSpecies.includes(sp.species);
      grid += `<div class="dex-cell ${has ? '' : 'locked'}" data-sp="${sp.species}">
        <div class="dex-emoji" style="font-size:40px">${has ? sp.emoji : '🐾'}</div>
        <div class="dex-name">${has ? sp.species : '？？'}</div>
      </div>`;
    }
  }
  grid += '</div>';
  const html = `<h2>📖 宠物图鉴</h2><div class="desc">已解锁 ${unlocked.length} / ${totalSpecies()} 种</div>${grid}<button class="btn secondary block" id="close" style="margin-top:12px">关闭</button>`;
  showOverlay(html, {
    onMount: c => { c.querySelector('#close').onclick = closeOverlay; },
  });
  } catch(e) { console.error('[openPetDex]', e); alert('图鉴错误: '+e.message); }
}

function totalSpecies() {
  let n = 0;
  for (const list of Object.values(SPECIES_BY_RARITY)) n += list.length;
  return n;
}

function descFood(f) {
  let s = '';
  if (f.heal) s += `回血${f.heal >= 9999 ? '满' : f.heal}`;
  if (f.buff) { if (f.buff.atk) s += ` 攻+${f.buff.atk}`; if (f.buff.def) s += ` 防+${f.buff.def}`; if (f.buff.revive) s += ' 复活'; }
  return s;
}
