// pet-render.js — 宠物渲染：SVG + 背景色 + 贴纸 + 配饰 + 装备 + 情绪 + 成长阶段

import { findSpecies, SHOP_WEAPONS } from './db2.js';
import { getPetSvg, growthStageLabel, petDefaultColor } from './pet-svgs.js';

/**
 * 渲染一只宠物为 HTML（SVG + 背景色 + 贴纸 + 配饰 + 装备 + 情绪 + 成长）
 * @param pet 宠物对象 { species, bgColor, sticker, accessories, equippedWeapon, emoji, mood, growthStage }
 * @param size 'lg'|'md'|''|'sm'
 * @param moodOverride 可选，覆盖宠物当前情绪
 */
export function renderPet(pet, size = '', moodOverride = null, showWeapon = false) {
  if (!pet) return '';
  const sp = findSpecies(pet.species);
  const sizeCls = size === 'lg' ? 'lg' : (size === 'md' ? 'md' : (size === 'sm' ? 'sm' : ''));
  const mood = moodOverride || pet.mood || 'happy';
  const growthStage = pet.growthStage || 'mature';

  // 获取宠物 SVG
  let svgContent = '';
  if (sp && sp.species === '小狗') {
    svgContent = getPetSvg(pet.species, pet.bgColor, mood, growthStage);
  } else {
    svgContent = getPetSvg(pet.species, pet.bgColor);
  }

  const accs = (pet.accessories || []).map(id => {
    // 简单处理：如果 accessories 存储的是字符串ID，返回占位
    return null;
  }).filter(Boolean);

  let layers = '';
  for (const a of accs) {
    layers += `<div class="acc-layer slot-${a.slot}"><img src="${a.img}" alt="" onerror="this.parentNode.style.display='none'"></div>`;
  }

  // 贴纸（在宠物旁边的小装饰 emoji）
  let stickerLayer = '';
  if (pet.sticker) {
    stickerLayer = `<div class="pet-sticker">${pet.sticker}</div>`;
  }

  // 装备武器：显示对应武器 emoji（右手）
  let weaponLayer = '';
  if (pet.equippedWeapon) {
    const w = SHOP_WEAPONS.find(x => x.id === pet.equippedWeapon);
    const wEmoji = w ? w.emoji : '⚔️';
    weaponLayer = `<div class="weapon-layer sword"><span>${wEmoji}</span></div>`;
  }

  // 成长阶段指示器
  let growthIndicator = '';
  if (pet.species === '小狗') {
    const stages = [
      { key: 'baby', label: '幼崽' },
      { key: 'teen', label: '少年' },
      { key: 'mature', label: '成熟' },
    ];
    const currentIdx = stages.findIndex(s => s.key === growthStage);
    growthIndicator = `<div class="growth-indicator">
      ${stages.map((s, i) => `<div class="stage ${i <= currentIdx ? 'active' : ''}"></div>`).join('')}
      <span class="stage-label">${growthStageLabel(growthStage)}</span>
    </div>`;
  }

  return `<div class="pet-img-wrap pet-armed">
    <div class="pet-svg ${sizeCls}" style="background:${pet.bgColor || '#fff8e7'}">${svgContent}</div>
    ${stickerLayer}
    ${layers}
    ${weaponLayer}
    ${growthIndicator}
  </div>`;
}

/** 取某宠物的所有可选色板 */
export function getPalette(pet) {
  const sp = findSpecies(pet.species);
  return (sp && sp.palette) || [{ name: '原色', color: petDefaultColor(pet.species) }];
}

/** 取动物攻击动作类名 */
export function attackMotion(pet) {
  const sp = findSpecies(pet.species);
  return sp ? `attack-${sp.motion}` : 'attack-lunge';
}

/** 取动物攻击动作描述 */
export function attackName(pet) {
  const sp = findSpecies(pet.species);
  return sp ? sp.attack : '攻击';
}
