// pet-svgs.js — 2.5D 轻拟物卡通宠物 SVG
// 小宝（小狗）重新设计：Q版二头身，焦糖橘+奶油白渐变，大眼睛占面部1/3
// 支持 4 种情绪状态 + 3 个成长阶段

const STROKE = '#4A3B2A';
const SW = 3;

/** SVG 外壳 */
function svg(inner, size = 200) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${inner}</svg>`;
}

/** 圆滚滚身体（头身一体） */
function body(color, cx = 100, cy = 110, r = 55) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="${STROKE}" stroke-width="${SW}"/>`;
}

/** 超大眼：白眼底 + 黑瞳 + 大高光 + 小高光 */
function eye(cx, cy, size = 16) {
  const pupilR = Math.round(size * 0.65);
  const hl1 = Math.round(size * 0.35);
  const hl2 = Math.round(size * 0.15);
  return `<circle cx="${cx}" cy="${cy}" r="${size}" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="${cx}" cy="${cy + 2}" r="${pupilR}" fill="#2a2a2a"/>
<circle cx="${cx - 4}" cy="${cy - 4}" r="${hl1}" fill="#ffffff"/>
<circle cx="${cx + 5}" cy="${cy + 4}" r="${hl2}" fill="#ffffff"/>`;
}

/** 眯眯眼（开心/庆祝） */
function eyeHappy(cx, cy, size = 16) {
  return `<path d="M${cx - size} ${cy} q${size} 8 ${size * 2} 0" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
<path d="M${cx - size + 2} ${cy + 3} q${size - 2} 6 ${size * 2 - 4} 0" fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round"/>`;
}

/** 闭眼睁眼（困倦） */
function eyeSleepy(cx, cy, size = 16) {
  return `<path d="M${cx - size} ${cy} q${size} 4 ${size * 2} 0" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`;
}

/** 星星眼（庆祝） */
function eyeStar(cx, cy, size = 16) {
  return `<circle cx="${cx}" cy="${cy}" r="${size}" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="${cx}" cy="${cy + 2}" r="${Math.round(size * 0.65)}" fill="#FFD700"/>
<circle cx="${cx - 4}" cy="${cy - 4}" r="${Math.round(size * 0.35)}" fill="#ffffff"/>
<circle cx="${cx + 5}" cy="${cy + 4}" r="${Math.round(size * 0.15)}" fill="#ffffff"/>
<path d="M${cx} ${cy - size - 4} l2 4 l4 1 l-3 3 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -3 l4 -1 z" fill="#FFD700" stroke="${STROKE}" stroke-width="1.5"/>`;
}

/** 腮红 */
function cheek(cx, cy, r = 9) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFAB91" opacity="0.5"/>`;
}

/** 小笑嘴 */
function smile(cx, cy, w = 12) {
  return `<path d="M${cx - w} ${cy} q${w} 9 ${w * 2} 0" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`;
}

/** 惊讶嘴 */
function mouthSurprised(cx, cy, r = 6) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFAB91" stroke="${STROKE}" stroke-width="2"/>`;
}

/** 小鼻头点 */
function nose(cx, cy, r = 3.5) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2a2a2a"/>`;
}

/** 打哈欠嘴 */
function mouthYawn(cx, cy) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="8" ry="10" fill="#FFAB91" stroke="${STROKE}" stroke-width="2"/>
<path d="M${cx - 5} ${cy + 2} q5 4 10 0" fill="none" stroke="${STROKE}" stroke-width="1.5" stroke-linecap="round"/>`;
}

/** 尾巴（基础） */
function tail(cx, cy, length = 30) {
  return `<path d="M${cx} ${cy} q${length} -10 ${length + 10} -${length}" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`;
}

/** 蓬松尾巴 */
function fluffyTail(cx, cy, length = 30, whiteTip = true) {
  let tip = '';
  if (whiteTip) {
    tip = `<circle cx="${cx + length + 10}" cy="${cy - length}" r="8" fill="#FFF8E7" stroke="${STROKE}" stroke-width="2"/>`;
  }
  return `<path d="M${cx} ${cy} q${length} -10 ${length + 10} -${length}" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
${tip}`;
}

/* =====================================================
 * 小狗：小宝 — 植物大战僵尸画风（粗线条+平涂+夸张呆萌）
 * =================================================== */

function puppyBody(color = '#D4A05A') {
  return `
    <!-- 蓬松大尾巴（右上方翘起，粗线条） -->
    <path d="M125 85 Q140 55 160 70 Q150 85 155 105 Q140 95 135 110 Q130 95 125 85 Z" fill="${color}" stroke="${STROKE}" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="160" cy="72" r="8" fill="#FFF8E7" stroke="${STROKE}" stroke-width="3"/>

    <!-- 左耳（僵尸风折耳：粗线条三角形，下垂贴头） -->
    <path d="M45 60 L30 40 L35 75 L45 85 Z" fill="${color}" stroke="${STROKE}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M40 62 L34 52 L38 72 Z" fill="#E8C8A0" stroke="${STROKE}" stroke-width="2"/>
    <!-- 右耳（僵尸风折耳：粗线条三角形，下垂贴头） -->
    <path d="M155 60 L170 40 L165 75 L155 85 Z" fill="${color}" stroke="${STROKE}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M160 62 L166 52 L162 72 Z" fill="#E8C8A0" stroke="${STROKE}" stroke-width="2"/>

    <!-- 身体（圆头+短身，粗线条） -->
    <ellipse cx="100" cy="115" rx="60" ry="52" fill="${color}" stroke="${STROKE}" stroke-width="4"/>
    <!-- 肚皮浅色 -->
    <ellipse cx="100" cy="128" rx="35" ry="28" fill="#FFF8E7" stroke="${STROKE}" stroke-width="3"/>

    <!-- 口鼻部（白色吻部，粗线条，突出） -->
    <ellipse cx="100" cy="120" rx="26" ry="22" fill="#FFF8E7" stroke="${STROKE}" stroke-width="3"/>
    <!-- 鼻头和鼻梁（粗） -->
    <ellipse cx="100" cy="112" rx="8" ry="7" fill="#2a2a2a"/>
    <line x1="100" y1="119" x2="100" y2="126" stroke="#2a2a2a" stroke-width="3" stroke-linecap="round"/>

    <!-- 前爪（粗线条） -->
    <ellipse cx="70" cy="160" rx="12" ry="9" fill="${color}" stroke="${STROKE}" stroke-width="4"/>
    <ellipse cx="130" cy="160" rx="12" ry="9" fill="${color}" stroke="${STROKE}" stroke-width="4"/>
  `;
}

/* ---- 开心（僵尸风：大嘴歪牙吐舌） ---- */
export function puppyHappySvg(color = '#D4A05A') {
  return svg(
    `${puppyBody(color)}
    <!-- 腮红（粗线条） -->
    <circle cx="62" cy="115" r="10" fill="#FFAB91" opacity="0.6" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="138" cy="115" r="10" fill="#FFAB91" opacity="0.6" stroke="${STROKE}" stroke-width="2"/>
    <!-- 大眼睛（眼白多，瞳孔小，呆萌） -->
    <circle cx="76" cy="92" r="16" fill="#fff" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="124" cy="92" r="16" fill="#fff" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="78" cy="94" r="7" fill="#2a2a2a"/>
    <circle cx="126" cy="94" r="7" fill="#2a2a2a"/>
    <circle cx="74" cy="90" r="4" fill="#fff"/>
    <circle cx="122" cy="90" r="4" fill="#fff"/>
    <!-- 开心大嘴（歪牙） -->
    <path d="M82 132 Q100 145 118 132" fill="none" stroke="${STROKE}" stroke-width="4" stroke-linecap="round"/>
    <path d="M88 136 L90 142 L94 138 Z" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <path d="M106 138 L110 144 L114 138 Z" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <!-- 吐舌头 -->
    <ellipse cx="100" cy="146" rx="10" ry="12" fill="#FF7A9C" stroke="${STROKE}" stroke-width="3"/>
    <line x1="100" y1="140" x2="100" y2="152" stroke="${STROKE}" stroke-width="2" stroke-linecap="round"/>`
  );
}

/* ---- 困倦（僵尸风：半闭眼+大哈欠） ---- */
export function puppySleepySvg(color = '#D4A05A') {
  return svg(
    `${puppyBody(color)}
    <circle cx="62" cy="115" r="10" fill="#FFAB91" opacity="0.4" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="138" cy="115" r="10" fill="#FFAB91" opacity="0.4" stroke="${STROKE}" stroke-width="2"/>
    <!-- 半闭眼（僵尸风下垂眼） -->
    <path d="M62 92 Q76 98 90 92" fill="none" stroke="${STROKE}" stroke-width="4" stroke-linecap="round"/>
    <path d="M110 92 Q124 98 138 92" fill="none" stroke="${STROKE}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="76" cy="96" r="5" fill="#2a2a2a" opacity="0.5"/>
    <circle cx="124" cy="96" r="5" fill="#2a2a2a" opacity="0.5"/>
    <!-- 大哈欠嘴 -->
    <ellipse cx="100" cy="138" rx="14" ry="16" fill="#FF7A9C" stroke="${STROKE}" stroke-width="4"/>
    <ellipse cx="100" cy="142" rx="8" ry="6" fill="#C62828"/>
    <!-- Zzz -->
    <text x="150" y="50" font-size="24" font-weight="bold" fill="${STROKE}" opacity="0.6">Zzz</text>`
  );
}

/* ---- 鼓励（僵尸风：握拳+坚定眼神） ---- */
export function puppyCheerSvg(color = '#D4A05A') {
  return svg(
    `${puppyBody(color)}
    <circle cx="62" cy="115" r="10" fill="#FFAB91" opacity="0.6" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="138" cy="115" r="10" fill="#FFAB91" opacity="0.6" stroke="${STROKE}" stroke-width="2"/>
    <!-- 握拳的小手（粗线条） -->
    <circle cx="38" cy="105" r="12" fill="${color}" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="162" cy="105" r="12" fill="${color}" stroke="${STROKE}" stroke-width="4"/>
    <!-- 坚定大眼（瞳孔集中） -->
    <circle cx="76" cy="92" r="16" fill="#fff" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="124" cy="92" r="16" fill="#fff" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="78" cy="94" r="8" fill="#2a2a2a"/>
    <circle cx="126" cy="94" r="8" fill="#2a2a2a"/>
    <circle cx="74" cy="90" r="4" fill="#fff"/>
    <circle cx="122" cy="90" r="4" fill="#fff"/>
    <!-- 坚定咧嘴 -->
    <path d="M84 132 Q100 140 116 132" fill="none" stroke="${STROKE}" stroke-width="4" stroke-linecap="round"/>
    <!-- 闪光 -->
    <path d="M45 40 L48 48 L56 50 L48 52 L45 60 L42 52 L34 50 L42 48 Z" fill="#FFD700" stroke="${STROKE}" stroke-width="2"/>`
  );
}

/* ---- 庆祝（僵尸风：星星眼+撒花） ---- */
export function puppyCelebrateSvg(color = '#D4A05A') {
  return svg(
    `${puppyBody(color)}
    <circle cx="62" cy="115" r="10" fill="#FFAB91" opacity="0.6" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="138" cy="115" r="10" fill="#FFAB91" opacity="0.6" stroke="${STROKE}" stroke-width="2"/>
    <!-- 星星眼 -->
    <circle cx="76" cy="92" r="16" fill="#fff" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="124" cy="92" r="16" fill="#fff" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="76" cy="92" r="8" fill="#FFD700"/>
    <circle cx="124" cy="92" r="8" fill="#FFD700"/>
    <path d="M76 84 L78 90 L84 90 L79 94 L81 100 L76 96 L71 100 L73 94 L68 90 L74 90 Z" fill="#FFD700" stroke="${STROKE}" stroke-width="1.5"/>
    <path d="M124 84 L126 90 L132 90 L127 94 L129 100 L124 96 L119 100 L121 94 L116 90 L122 90 Z" fill="#FFD700" stroke="${STROKE}" stroke-width="1.5"/>
    <!-- 开心大嘴 -->
    <path d="M82 132 Q100 148 118 132" fill="none" stroke="${STROKE}" stroke-width="4" stroke-linecap="round"/>
    <path d="M90 138 L92 144 L96 140 Z" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <path d="M104 140 L108 146 L112 140 Z" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <!-- 撒花 -->
    <circle cx="25" cy="50" r="5" fill="#FF8A80" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="175" cy="40" r="4" fill="#80CBC4" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="35" cy="30" r="6" fill="#FFD54F" stroke="${STROKE}" stroke-width="2"/>
    <path d="M20 55 L22 61 L28 62 L23 66 L25 72 L20 68 L15 72 L17 66 L12 62 L18 61 Z" fill="#FF8A80" stroke="${STROKE}" stroke-width="1.5"/>
    <path d="M170 45 L172 51 L178 52 L173 56 L175 62 L170 58 L165 62 L167 56 L162 52 L168 51 Z" fill="#80CBC4" stroke="${STROKE}" stroke-width="1.5"/>`
  );
}

/* =====================================================
 * 成长阶段 SVG（小狗不同体型）
 * =================================================== */

/* 幼崽版（更小更圆，大眼，小折耳） */
export function puppyBabySvg(color = '#D4A05A') {
  return svg(
    `<!-- 幼崽身体（更圆更小，粗线条） -->
    <ellipse cx="100" cy="120" rx="46" ry="44" fill="${color}" stroke="${STROKE}" stroke-width="4"/>
    <ellipse cx="100" cy="130" rx="28" ry="24" fill="#FFF8E7" stroke="${STROKE}" stroke-width="3"/>
    <!-- 小折耳 -->
    <path d="M55 72 L42 55 L48 85 L58 92 Z" fill="${color}" stroke="${STROKE}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 74 L46 66 L50 82 Z" fill="#E8C8A0" stroke="${STROKE}" stroke-width="2"/>
    <path d="M145 72 L158 55 L152 85 L142 92 Z" fill="${color}" stroke="${STROKE}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M150 74 L154 66 L150 82 Z" fill="#E8C8A0" stroke="${STROKE}" stroke-width="2"/>
    <!-- 口鼻部 -->
    <ellipse cx="100" cy="124" rx="20" ry="17" fill="#FFF8E7" stroke="${STROKE}" stroke-width="3"/>
    <ellipse cx="100" cy="117" rx="6" ry="5" fill="#2a2a2a"/>
    <line x1="100" y1="123" x2="100" y2="129" stroke="#2a2a2a" stroke-width="2.5" stroke-linecap="round"/>
    <!-- 超大眼（眼白多瞳孔小，呆萌） -->
    <circle cx="76" cy="100" r="18" fill="#fff" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="124" cy="100" r="18" fill="#fff" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="78" cy="102" r="8" fill="#2a2a2a"/>
    <circle cx="126" cy="102" r="8" fill="#2a2a2a"/>
    <circle cx="74" cy="98" r="5" fill="#fff"/>
    <circle cx="122" cy="98" r="5" fill="#fff"/>
    <circle cx="62" cy="118" r="9" fill="#FFAB91" opacity="0.5" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="138" cy="118" r="9" fill="#FFAB91" opacity="0.5" stroke="${STROKE}" stroke-width="2"/>
    <!-- 开心嘴 -->
    <path d="M86 136 Q100 145 114 136" fill="none" stroke="${STROKE}" stroke-width="4" stroke-linecap="round"/>
    <!-- 小短尾巴 -->
    <circle cx="148" cy="140" r="8" fill="${color}" stroke="${STROKE}" stroke-width="3"/>
    <circle cx="151" cy="138" r="4" fill="#FFF8E7"/>`
  );
}

/* 少年版（介于幼崽和成熟之间） */
export function puppyTeenSvg(color = '#D4A05A') {
  return svg(
    `<!-- 少年身体（粗线条） -->
    <ellipse cx="100" cy="115" rx="54" ry="50" fill="${color}" stroke="${STROKE}" stroke-width="4"/>
    <ellipse cx="100" cy="128" rx="32" ry="27" fill="#FFF8E7" stroke="${STROKE}" stroke-width="3"/>
    <!-- 折耳 -->
    <path d="M48 65 L36 48 L42 80 L52 88 Z" fill="${color}" stroke="${STROKE}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M44 68 L40 60 L44 76 Z" fill="#E8C8A0" stroke="${STROKE}" stroke-width="2"/>
    <path d="M152 65 L164 48 L158 80 L148 88 Z" fill="${color}" stroke="${STROKE}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M156 68 L160 60 L156 76 Z" fill="#E8C8A0" stroke="${STROKE}" stroke-width="2"/>
    <!-- 口鼻部 -->
    <ellipse cx="100" cy="120" rx="23" ry="19" fill="#FFF8E7" stroke="${STROKE}" stroke-width="3"/>
    <ellipse cx="100" cy="113" rx="7" ry="6" fill="#2a2a2a"/>
    <line x1="100" y1="120" x2="100" y2="127" stroke="#2a2a2a" stroke-width="2.5" stroke-linecap="round"/>
    <!-- 大眼 -->
    <circle cx="76" cy="96" r="17" fill="#fff" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="124" cy="96" r="17" fill="#fff" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="78" cy="98" r="7.5" fill="#2a2a2a"/>
    <circle cx="126" cy="98" r="7.5" fill="#2a2a2a"/>
    <circle cx="74" cy="94" r="4.5" fill="#fff"/>
    <circle cx="122" cy="94" r="4.5" fill="#fff"/>
    <circle cx="62" cy="116" r="10" fill="#FFAB91" opacity="0.5" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="138" cy="116" r="10" fill="#FFAB91" opacity="0.5" stroke="${STROKE}" stroke-width="2"/>
    <!-- 微笑 -->
    <path d="M86 132 Q100 140 114 132" fill="none" stroke="${STROKE}" stroke-width="4" stroke-linecap="round"/>
    <!-- 蓬松尾巴 -->
    <path d="M130 145 Q150 155 158 130" fill="none" stroke="${STROKE}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="160" cy="128" r="6" fill="#FFF8E7" stroke="${STROKE}" stroke-width="2"/>
    <!-- 前爪 -->
    <ellipse cx="72" cy="158" rx="10" ry="8" fill="${color}" stroke="${STROKE}" stroke-width="4"/>
    <ellipse cx="128" cy="158" rx="10" ry="8" fill="${color}" stroke="${STROKE}" stroke-width="4"/>`
  );
}

/* 成熟版（完整版，等同于上面的小狗） */
export function puppyMatureSvg(color = '#D4A05A') {
  return svg(
    `${puppyBody(color)}
    <circle cx="62" cy="115" r="10" fill="#FFAB91" opacity="0.6" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="138" cy="115" r="10" fill="#FFAB91" opacity="0.6" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="76" cy="92" r="16" fill="#fff" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="124" cy="92" r="16" fill="#fff" stroke="${STROKE}" stroke-width="4"/>
    <circle cx="78" cy="94" r="7" fill="#2a2a2a"/>
    <circle cx="126" cy="94" r="7" fill="#2a2a2a"/>
    <circle cx="74" cy="90" r="4" fill="#fff"/>
    <circle cx="122" cy="90" r="4" fill="#fff"/>
    <path d="M86 128 Q100 136 114 128" fill="none" stroke="${STROKE}" stroke-width="4" stroke-linecap="round"/>`
  );
}

/* =====================================================
 * 其他动物（保持原有蛋仔派对风格）
 * =================================================== */

/** 圆滚滚胖球身体 */
function animalBody(color, cx = 100, cy = 110, r = 60) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="${STROKE}" stroke-width="${SW}"/>`;
}

/** 小笑嘴通用 */
function smileGeneric(cx, cy, w = 12) {
  return `<path d="M${cx - w} ${cy} q${w} 9 ${w * 2} 0" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`;
}

/** 通用鼻子 */
function noseGeneric(cx, cy, r = 3.5) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2a2a2a"/>`;
}

/** 通用腮红 */
function cheekGeneric(cx, cy, r = 9) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFAB91" opacity="0.5"/>`;
}

/* ---- 小猫 ---- */
export function catSvg(color = '#b8b8c8') {
  return svg(
    `<path d="M58 76 L46 42 L88 64 Z" fill="${color}" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M142 76 L154 42 L112 64 Z" fill="${color}" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M62 70 L54 50 L80 62 Z" fill="#FFC0CB"/>
<path d="M138 70 L146 50 L118 62 Z" fill="#FFC0CB"/>
${animalBody(color)}
${cheekGeneric(66, 120)}
${cheekGeneric(134, 120)}
<circle cx="80" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="120" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="80" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="120" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="76" cy="97" r="5" fill="#ffffff"/>
<circle cx="124" cy="97" r="5" fill="#ffffff"/>
${noseGeneric(100, 116)}
${smileGeneric(88, 124, 12)}
<line x1="28" y1="110" x2="60" y2="112" stroke="${STROKE}" stroke-width="2.5" stroke-linecap="round"/>
<line x1="28" y1="120" x2="60" y2="120" stroke="${STROKE}" stroke-width="2.5" stroke-linecap="round"/>
<line x1="28" y1="130" x2="60" y2="126" stroke="${STROKE}" stroke-width="2.5" stroke-linecap="round"/>
<line x1="172" y1="110" x2="140" y2="112" stroke="${STROKE}" stroke-width="2.5" stroke-linecap="round"/>
<line x1="172" y1="120" x2="140" y2="120" stroke="${STROKE}" stroke-width="2.5" stroke-linecap="round"/>
<line x1="172" y1="130" x2="140" y2="126" stroke="${STROKE}" stroke-width="2.5" stroke-linecap="round"/>`
  );
}

/* ---- 兔子 ---- */
export function rabbitSvg(color = '#f5e6d3') {
  return svg(
    `<ellipse cx="82" cy="48" rx="12" ry="40" fill="${color}" stroke="${STROKE}" stroke-width="${SW}"/>
<ellipse cx="118" cy="48" rx="12" ry="40" fill="${color}" stroke="${STROKE}" stroke-width="${SW}"/>
<ellipse cx="82" cy="54" rx="5.5" ry="28" fill="#FFC0CB"/>
<ellipse cx="118" cy="54" rx="5.5" ry="28" fill="#FFC0CB"/>
${animalBody(color)}
${cheekGeneric(68, 120)}
${cheekGeneric(132, 120)}
<circle cx="80" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="120" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="80" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="120" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="76" cy="97" r="5" fill="#ffffff"/>
<circle cx="124" cy="97" r="5" fill="#ffffff"/>
${noseGeneric(100, 118)}
${smileGeneric(88, 126, 12)}`
  );
}

/* ---- 仓鼠 ---- */
export function hamsterSvg(color = '#e0a96d') {
  return svg(
    `<circle cx="64" cy="62" r="14" fill="${color}" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="136" cy="62" r="14" fill="${color}" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="64" cy="62" r="6" fill="#FFC0CB"/>
<circle cx="136" cy="62" r="6" fill="#FFC0CB"/>
${animalBody(color)}
<circle cx="62" cy="126" r="17" fill="#f0c89a" opacity="0.85" stroke="${STROKE}" stroke-width="2.5"/>
<circle cx="138" cy="126" r="17" fill="#f0c89a" opacity="0.85" stroke="${STROKE}" stroke-width="2.5"/>
<circle cx="80" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="120" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="80" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="120" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="76" cy="97" r="5" fill="#ffffff"/>
<circle cx="124" cy="97" r="5" fill="#ffffff"/>
${noseGeneric(100, 116)}
<path d="M92 124 q8 6 16 0" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`
  );
}

/* ---- 小鸡 ---- */
export function chickSvg(color = '#ffd54a') {
  return svg(
    `<path d="M88 52 q4 -14 12 -8 q0 8 -4 12 z" fill="#ff7a3a" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M104 56 q8 -12 12 -2 q-4 8 -8 8 z" fill="#ff7a3a" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
${animalBody(color)}
${cheekGeneric(66, 120)}
${cheekGeneric(134, 120)}
<circle cx="82" cy="100" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="118" cy="100" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="82" cy="102" r="11" fill="#2a2a2a"/>
<circle cx="118" cy="102" r="11" fill="#2a2a2a"/>
<circle cx="78" cy="99" r="5" fill="#ffffff"/>
<circle cx="122" cy="99" r="5" fill="#ffffff"/>
<path d="M100 116 L84 124 L100 132 L116 124 Z" fill="#ff8c2a" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<line x1="84" y1="124" x2="116" y2="124" stroke="${STROKE}" stroke-width="3"/>
<path d="M86 152 q14 6 28 0" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`
  );
}

/* ---- 小狐狸 ---- */
export function foxSvg(color = '#e8784a') {
  return svg(
    `<path d="M152 140 c40 14 46 -22 24 -38 c-4 8 -2 18 -14 22 c-6 2 -8 8 -10 16 z" fill="${color}" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M176 102 c20 8 16 24 4 24 c0 -8 -4 -16 -8 -20 c-4 -8 -6 -16 -8 -20 z" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M60 76 L48 40 L90 62 Z" fill="${color}" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M140 76 L152 40 L110 62 Z" fill="${color}" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M62 70 L54 50 L82 62 Z" fill="#FFC0CB"/>
<path d="M138 70 L146 50 L118 62 Z" fill="#FFC0CB"/>
${animalBody(color)}
${cheekGeneric(68, 120)}
${cheekGeneric(132, 120)}
<circle cx="80" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="120" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="80" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="120" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="76" cy="97" r="5" fill="#ffffff"/>
<circle cx="124" cy="97" r="5" fill="#ffffff"/>
${noseGeneric(100, 118)}
${smileGeneric(88, 126, 12)}`
  );
}

/* ---- 熊猫 ---- */
export function pandaSvg(color = '#ffffff') {
  return svg(
    `<circle cx="60" cy="62" r="15" fill="#2b2b33" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="140" cy="62" r="15" fill="#2b2b33" stroke="${STROKE}" stroke-width="${SW}"/>
${animalBody(color)}
<ellipse cx="80" cy="98" rx="19" ry="15" fill="#2b2b33" stroke="${STROKE}" stroke-width="${SW}" transform="rotate(-20 80 98)"/>
<ellipse cx="120" cy="98" rx="19" ry="15" fill="#2b2b33" stroke="${STROKE}" stroke-width="${SW}" transform="rotate(20 120 98)"/>
${cheekGeneric(66, 124)}
${cheekGeneric(134, 124)}
<circle cx="80" cy="100" r="12" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="120" cy="100" r="12" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="80" cy="102" r="8" fill="#2a2a2a"/>
<circle cx="120" cy="102" r="8" fill="#2a2a2a"/>
<circle cx="76" cy="99" r="3.5" fill="#ffffff"/>
<circle cx="116" cy="99" r="3.5" fill="#ffffff"/>
${noseGeneric(100, 118)}
${smileGeneric(88, 128, 12)}`
  );
}

/* ---- 企鹅 ---- */
export function penguinSvg(color = '#2b2b3a') {
  return svg(
    `${animalBody(color)}
<ellipse cx="100" cy="120" rx="38" ry="44" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
${cheekGeneric(64, 104)}
${cheekGeneric(136, 104)}
<circle cx="82" cy="90" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="118" cy="90" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="82" cy="92" r="11" fill="#2a2a2a"/>
<circle cx="118" cy="92" r="11" fill="#2a2a2a"/>
<circle cx="78" cy="89" r="5" fill="#ffffff"/>
<circle cx="114" cy="89" r="5" fill="#ffffff"/>
<path d="M100 104 L84 96 L100 88 L116 96 Z" fill="#ff8c2a" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<line x1="84" y1="96" x2="116" y2="96" stroke="${STROKE}" stroke-width="3"/>
<path d="M86 152 q14 6 28 0" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`
  );
}

/* ---- 小恐龙 ---- */
export function dinoSvg(color = '#6fbf6f') {
  return svg(
    `<path d="M152 136 q24 -2 22 -22 q-8 6 -12 -2 q-2 14 -12 18 z" fill="${color}" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M70 54 L78 36 L86 54 Z" fill="#5fa85f" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M88 50 L96 32 L104 50 Z" fill="#5fa85f" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M106 52 L114 36 L122 54 Z" fill="#5fa85f" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
${animalBody(color)}
${cheekGeneric(68, 120)}
${cheekGeneric(132, 120)}
<circle cx="80" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="120" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="80" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="120" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="76" cy="97" r="5" fill="#ffffff"/>
<circle cx="124" cy="97" r="5" fill="#ffffff"/>
${noseGeneric(100, 118)}
${smileGeneric(88, 126, 12)}`
  );
}

/* ---- 独角兽 ---- */
function maneBit(x, y, c) {
  return `<path d="M${x} ${y} q16 -6 20 8 q-8 2 -8 14 q-12 -8 -14 -2 z" fill="${c}" stroke="${STROKE}" stroke-width="2.5" stroke-linejoin="round"/>`;
}

export function unicornSvg(color = '#f0c4f5') {
  return svg(
    `${maneBit(142, 50, '#ff5a7a')}
${maneBit(148, 64, '#ff8c3a')}
${maneBit(150, 78, '#ffd23a')}
${maneBit(148, 92, '#5ad17a')}
${maneBit(142, 106, '#4ab3ff')}
<path d="M100 36 L92 64 L108 64 Z" fill="#fff7c4" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<line x1="98" y1="42" x2="102" y2="60" stroke="${STROKE}" stroke-width="2.5"/>
<line x1="100" y1="40" x2="100" y2="62" stroke="${STROKE}" stroke-width="2.5"/>
${animalBody(color)}
${cheekGeneric(68, 120)}
${cheekGeneric(132, 120)}
<circle cx="80" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="120" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="80" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="120" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="76" cy="97" r="5" fill="#ffffff"/>
<circle cx="124" cy="97" r="5" fill="#ffffff"/>
${noseGeneric(100, 118)}
${smileGeneric(88, 126, 12)}`
  );
}

/* ---- 小狮子 ---- */
export function lionSvg(color = '#e8a848') {
  return svg(
    `<circle cx="100" cy="110" r="84" fill="#c4761f" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="38" cy="70" r="14" fill="#c4761f" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="162" cy="70" r="14" fill="#c4761f" stroke="${STROKE}" stroke-width="${SW}"/>
${animalBody(color)}
${cheekGeneric(66, 120)}
${cheekGeneric(134, 120)}
<circle cx="80" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="120" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="80" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="120" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="76" cy="97" r="5" fill="#ffffff"/>
<circle cx="124" cy="97" r="5" fill="#ffffff"/>
${noseGeneric(100, 118)}
<path d="M90 126 q10 9 20 0" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>
<line x1="100" y1="118" x2="100" y2="124" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>`
  );
}

/* ---- 老虎 ---- */
export function tigerSvg(color = '#f4a83a') {
  return svg(
    `<circle cx="68" cy="58" r="12" fill="${color}" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="132" cy="58" r="12" fill="${color}" stroke="${STROKE}" stroke-width="${SW}"/>
${animalBody(color)}
<path d="M100 56 q0 12 0 20" fill="none" stroke="#2b2b33" stroke-width="5" stroke-linecap="round"/>
<path d="M72 72 q-10 4 -6 16" fill="none" stroke="#2b2b33" stroke-width="5" stroke-linecap="round"/>
<path d="M128 72 q10 4 6 16" fill="none" stroke="#2b2b33" stroke-width="5" stroke-linecap="round"/>
<path d="M56 110 q-8 4 -4 16" fill="none" stroke="#2b2b33" stroke-width="5" stroke-linecap="round"/>
<path d="M144 110 q8 4 16" fill="none" stroke="#2b2b33" stroke-width="5" stroke-linecap="round"/>
${cheekGeneric(64, 122)}
${cheekGeneric(136, 122)}
<circle cx="80" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="120" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="80" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="120" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="76" cy="97" r="5" fill="#ffffff"/>
<circle cx="124" cy="97" r="5" fill="#ffffff"/>
${noseGeneric(100, 118)}
${smileGeneric(88, 126, 12)}`
  );
}

/* ---- 神龙 ---- */
export function dragonSvg(color = '#5fa8e8') {
  return svg(
    `<path d="M48 92 q-26 -6 -22 -26 q12 8 -22 2 q6 8 -2 14 q8 -6 4 8 q-6 8 -6 2 z" fill="#9fd0ff" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M152 92 q26 -6 22 -26 q-12 8 -22 2 q6 8 -2 14 q-8 -2 -4 8 q6 8 6 2 z" fill="#9fd0ff" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M82 54 q-8 -16 2 -24 q4 8 2 16 q4 -2 2 8 z" fill="${color}" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M118 54 q8 -16 -2 -24 q-4 8 -2 16 q-4 -2 -2 8 z" fill="${color}" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
${animalBody(color)}
${cheekGeneric(68, 120)}
${cheekGeneric(132, 120)}
<circle cx="80" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="120" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="80" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="120" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="76" cy="97" r="5" fill="#ffffff"/>
<circle cx="124" cy="97" r="5" fill="#ffffff"/>
${noseGeneric(100, 118)}
${smileGeneric(88, 126, 12)}`
  );
}

/* ---- 凤凰 ---- */
export function phoenixSvg(color = '#e8542a') {
  return svg(
    `<path d="M46 96 q-24 -2 -18 -22 q8 8 -18 4 q6 8 -2 14 q8 -6 -4 8 q8 4 6 -4 z" fill="#ffb14a" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M154 96 q24 -2 18 -22 q-8 8 -18 4 q6 8 -2 14 q-8 -6 -4 8 q8 4 6 -4 z" fill="#ffb14a" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M100 46 q-8 -10 2 -22 q4 8 0 14 q6 -6 8 0 q-2 10 -8 14 q-2 -6 -2 -6 z" fill="#ffb14a" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M102 42 q6 -8 12 -4 q-2 6 -6 6 q2 -4 -2 -2 q-2 4 -4 0 z" fill="#ffd84a"/>
${animalBody(color)}
${cheekGeneric(68, 120)}
${cheekGeneric(132, 120)}
<circle cx="80" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="120" cy="98" r="16" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}"/>
<circle cx="80" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="120" cy="100" r="11" fill="#2a2a2a"/>
<circle cx="76" cy="97" r="5" fill="#ffffff"/>
<circle cx="124" cy="97" r="5" fill="#ffffff"/>
<path d="M100 112 L92 120 L100 128 L108 120 Z" fill="#ffb14a" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round"/>
<line x1="92" y1="120" x2="108" y2="120" stroke="${STROKE}" stroke-width="3"/>
<path d="M88 134 q12 6 24 0" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`
  );
}

/* =====================================================
 * 分发 & 默认色 + 情绪状态映射
 * =================================================== */

const PET_MAP = {
  '小狗': puppyMatureSvg, 'puppy': puppyMatureSvg, 'dog': puppyMatureSvg,
  '小猫': catSvg, 'cat': catSvg,
  '兔子': rabbitSvg, 'rabbit': rabbitSvg,
  '仓鼠': hamsterSvg, 'hamster': hamsterSvg,
  '小鸡': chickSvg, 'chick': chickSvg,
  '小狐狸': foxSvg, 'fox': foxSvg,
  '熊猫': pandaSvg, 'panda': pandaSvg,
  '企鹅': penguinSvg, 'penguin': penguinSvg,
  '小恐龙': dinoSvg, 'dino': dinoSvg,
  '独角兽': unicornSvg, 'unicorn': unicornSvg,
  '小狮子': lionSvg, 'lion': lionSvg,
  '老虎': tigerSvg, 'tiger': tigerSvg,
  '神龙': dragonSvg, 'dragon': dragonSvg,
  '凤凰': phoenixSvg, 'phoenix': phoenixSvg,
};

const MOOD_MAP = {
  '小狗': { happy: puppyHappySvg, sleepy: puppySleepySvg, cheer: puppyCheerSvg, celebrate: puppyCelebrateSvg },
  'puppy': { happy: puppyHappySvg, sleepy: puppySleepySvg, cheer: puppyCheerSvg, celebrate: puppyCelebrateSvg },
  'dog': { happy: puppyHappySvg, sleepy: puppySleepySvg, cheer: puppyCheerSvg, celebrate: puppyCelebrateSvg },
};

const GROWTH_MAP = {
  '小狗': { baby: puppyBabySvg, teen: puppyTeenSvg, mature: puppyMatureSvg },
  'puppy': { baby: puppyBabySvg, teen: puppyTeenSvg, mature: puppyMatureSvg },
  'dog': { baby: puppyBabySvg, teen: puppyTeenSvg, mature: puppyMatureSvg },
};

const DEFAULT_COLORS = {
  '小狗': '#D4A05A', 'puppy': '#D4A05A', 'dog': '#D4A05A',
  '小猫': '#b8b8c8', 'cat': '#b8b8c8',
  '兔子': '#f5e6d3', 'rabbit': '#f5e6d3',
  '仓鼠': '#e0a96d', 'hamster': '#e0a96d',
  '小鸡': '#ffd54a', 'chick': '#ffd54a',
  '小狐狸': '#e8784a', 'fox': '#e8784a',
  '熊猫': '#ffffff', 'panda': '#ffffff',
  '企鹅': '#2b2b3a', 'penguin': '#2b2b3a',
  '小恐龙': '#6fbf6f', 'dino': '#6fbf6f',
  '独角兽': '#f0c4f5', 'unicorn': '#f0c4f5',
  '小狮子': '#e8a848', 'lion': '#e8a848',
  '老虎': '#f4a83a', 'tiger': '#f4a83a',
  '神龙': '#5fa8e8', 'dragon': '#5fa8e8',
  '凤凰': '#e8542a', 'phoenix': '#e8542a',
};

/** 按物种名 + 情绪 + 成长阶段取 SVG */
export function getPetSvg(species, color, mood = 'happy', growthStage = 'mature') {
  const key = String(species || '');

  // 小狗支持情绪和成长
  const moodMap = MOOD_MAP[key];
  const growthMap = GROWTH_MAP[key];



  if (moodMap && growthMap) {
    // 如果是小狗，根据成长阶段选择基础SVG，然后根据情绪微调
    const growthFn = growthMap[growthStage] || growthMap.mature || moodMap.happy;
    // 对于小狗，返回对应情绪的版本（每种成长阶段已有对应SVG）
    if (growthStage === 'baby') return (growthMap.baby || puppyBabySvg)(color);
    if (growthStage === 'teen') return (growthMap.teen || puppyTeenSvg)(color);
    const moodFn = moodMap[mood] || moodMap.happy || puppyHappySvg;
    return moodFn(color);
  }

  // 其他动物 fallback
  const fn = PET_MAP[key];
  if (!fn) return puppyHappySvg(color);
  return fn(color || DEFAULT_COLORS[key] || '#e8a86f');
}

/** 取某物种默认主色 */
export function petDefaultColor(species) {
  const key = String(species || '');
  return DEFAULT_COLORS[key] || '#e8a86f';
}

/** 获取成长阶段显示名 */
export function growthStageLabel(stage) {
  const labels = { baby: '幼崽', teen: '少年', mature: '成熟' };
  return labels[stage] || stage;
}

export { svg };
