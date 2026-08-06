// zombie-svgs.js — 程序化 SVG 僵尸（植物大战僵尸风，矢量极小）
// 新增：击败状态（害羞/认输/脸红）
const V = 'viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"';
const STROKE = '#1a2a1a';
const SKIN = '#8fbc5f';
const SKIN_D = '#6b8e3d';
const CLOTHES = '#6b7280';

function svg(inner) {
  return `<svg ${V}>${inner}</svg>`;
}

/** 击败状态通用装饰（脸红 + 眼泪） */
function defeatedOverlay() {
  return `
    <!-- 脸红 -->
    <ellipse cx="75" cy="95" rx="10" ry="7" fill="#FFAB91" opacity="0.6"/>
    <ellipse cx="125" cy="95" rx="10" ry="7" fill="#FFAB91" opacity="0.6"/>
    <!-- 眼泪 -->
    <path d="M75 102 q2 6 4 0" fill="#81D4FA" opacity="0.7"/>
    <path d="M125 102 q2 6 4 0" fill="#81D4FA" opacity="0.7"/>
  `;
}

/** 基础僵尸身体（绿色皮肤+破衣服，伸臂） */
function baseBody() {
  return `
    <!-- 身体/衣服 -->
    <path d="M70 110 L70 165 Q70 175 80 175 L120 175 Q130 175 130 165 L130 110 Z" fill="${CLOTHES}" stroke="${STROKE}" stroke-width="3"/>
    <!-- 衣服破损 -->
    <path d="M85 140 L90 150 L95 145 L100 155 L105 145 L110 152 L115 142" fill="none" stroke="${STROKE}" stroke-width="2"/>
    <!-- 手臂（前伸） -->
    <rect x="40" y="105" width="35" height="14" rx="7" fill="${SKIN}" stroke="${STROKE}" stroke-width="3" transform="rotate(-10 57 112)"/>
    <rect x="125" y="105" width="35" height="14" rx="7" fill="${SKIN}" stroke="${STROKE}" stroke-width="3" transform="rotate(10 142 112)"/>
    <!-- 手 -->
    <circle cx="48" cy="108" r="9" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
    <circle cx="152" cy="108" r="9" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
    <!-- 腿 -->
    <rect x="80" y="170" width="16" height="22" fill="${CLOTHES}" stroke="${STROKE}" stroke-width="3"/>
    <rect x="104" y="170" width="16" height="22" fill="${CLOTHES}" stroke="${STROKE}" stroke-width="3"/>
  `;
}

/** 击败状态：身体倾斜、软趴趴 */
function baseBodyDefeated() {
  return `
    <!-- 身体/衣服（倾斜） -->
    <g transform="translate(10, 10) rotate(-8 100 140)">
      <path d="M70 110 L70 165 Q70 175 80 175 L120 175 Q130 175 130 165 L130 110 Z" fill="${CLOTHES}" stroke="${STROKE}" stroke-width="3"/>
      <path d="M85 140 L90 150 L95 145 L100 155 L105 145 L110 152 L115 142" fill="none" stroke="${STROKE}" stroke-width="2"/>
      <rect x="40" y="105" width="35" height="14" rx="7" fill="${SKIN}" stroke="${STROKE}" stroke-width="3" transform="rotate(-10 57 112)"/>
      <rect x="125" y="105" width="35" height="14" rx="7" fill="${SKIN}" stroke="${STROKE}" stroke-width="3" transform="rotate(10 142 112)"/>
      <circle cx="48" cy="108" r="9" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
      <circle cx="152" cy="108" r="9" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
      <rect x="80" y="170" width="16" height="22" fill="${CLOTHES}" stroke="${STROKE}" stroke-width="3"/>
      <rect x="104" y="170" width="16" height="22" fill="${CLOTHES}" stroke="${STROKE}" stroke-width="3"/>
    </g>
  `;
}

/** 普通僵尸 */
export function basicZ(defeated = false) {
  if (defeated) {
    return svg(`
      ${baseBodyDefeated()}
      <!-- 头（倾斜） -->
      <g transform="translate(10, 10) rotate(-8 100 80)">
        <ellipse cx="100" cy="80" rx="34" ry="38" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
        <!-- >_< 眼睛 -->
        <path d="M78 75 l8 8 M86 75 l-8 8" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <path d="M106 75 l8 8 M114 75 l-8 8" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <!-- 波浪嘴 -->
        <path d="M82 100 q9 3 18 -3 q9 3 18 -3" fill="none" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
      </g>
      ${defeatedOverlay()}
    `);
  }
  return svg(`
    ${baseBody()}
    <!-- 头 -->
    <ellipse cx="100" cy="80" rx="34" ry="38" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
    <!-- 眼睛 -->
    <circle cx="88" cy="75" r="7" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="112" cy="75" r="7" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="88" cy="77" r="3" fill="${STROKE}"/>
    <circle cx="112" cy="77" r="3" fill="${STROKE}"/>
    <!-- 嘴 -->
    <path d="M82 95 Q100 102 118 95" fill="none" stroke="${STROKE}" stroke-width="3"/>
    <!-- 牙 -->
    <rect x="90" y="92" width="4" height="5" fill="#fff" stroke="${STROKE}" stroke-width="1"/>
    <rect x="106" y="92" width="4" height="5" fill="#fff" stroke="${STROKE}" stroke-width="1"/>
  `);
}

/** 路障僵尸 */
export function coneheadZ(defeated = false) {
  if (defeated) {
    return svg(`
      ${baseBodyDefeated()}
      <g transform="translate(10, 10) rotate(-8 100 80)">
        <ellipse cx="100" cy="80" rx="34" ry="38" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
        <path d="M78 75 l8 8 M86 75 l-8 8" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <path d="M106 75 l8 8 M114 75 l-8 8" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <path d="M82 100 q9 3 18 -3 q9 3 18 -3" fill="none" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <!-- 路障（倾斜） -->
        <polygon points="100,25 70,75 130,75" fill="#f97316" stroke="${STROKE}" stroke-width="3" transform="rotate(-5 100 50)"/>
        <rect x="78" y="60" width="44" height="8" fill="#fff" transform="rotate(-5 100 64)"/>
      </g>
      ${defeatedOverlay()}
    `);
  }
  return svg(`
    ${baseBody()}
    <ellipse cx="100" cy="80" rx="34" ry="38" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
    <circle cx="88" cy="75" r="7" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="112" cy="75" r="7" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="88" cy="77" r="3" fill="${STROKE}"/>
    <circle cx="112" cy="77" r="3" fill="${STROKE}"/>
    <path d="M82 95 Q100 102 118 95" fill="none" stroke="${STROKE}" stroke-width="3"/>
    <!-- 路障 -->
    <polygon points="100,25 70,75 130,75" fill="#f97316" stroke="${STROKE}" stroke-width="3"/>
    <rect x="78" y="60" width="44" height="8" fill="#fff"/>
  `);
}

/** 撑杆僵尸 */
export function poleZ(defeated = false) {
  if (defeated) {
    return svg(`
      ${baseBodyDefeated()}
      <g transform="translate(10, 10) rotate(-8 100 80)">
        <ellipse cx="100" cy="80" rx="34" ry="38" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
        <path d="M78 75 l8 8 M86 75 l-8 8" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <path d="M106 75 l8 8 M114 75 l-8 8" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <path d="M82 100 q9 3 18 -3 q9 3 18 -3" fill="none" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <!-- 撑杆（掉落） -->
        <line x1="45" y1="60" x2="155" y2="170" stroke="#92400e" stroke-width="5" stroke-linecap="round" transform="rotate(15 100 115)"/>
        <circle cx="155" cy="170" r="5" fill="#92400e"/>
      </g>
      ${defeatedOverlay()}
    `);
  }
  return svg(`
    ${baseBody()}
    <ellipse cx="100" cy="80" rx="34" ry="38" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
    <circle cx="88" cy="75" r="7" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="112" cy="75" r="7" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="88" cy="77" r="3" fill="${STROKE}"/>
    <circle cx="112" cy="77" r="3" fill="${STROKE}"/>
    <path d="M82 95 Q100 102 118 95" fill="none" stroke="${STROKE}" stroke-width="3"/>
    <!-- 撑杆 -->
    <line x1="45" y1="40" x2="155" y2="170" stroke="#92400e" stroke-width="5" stroke-linecap="round"/>
    <circle cx="155" cy="170" r="5" fill="#92400e"/>
  `);
}

/** 铁桶僵尸 */
export function bucketheadZ(defeated = false) {
  if (defeated) {
    return svg(`
      ${baseBodyDefeated()}
      <g transform="translate(10, 10) rotate(-8 100 80)">
        <ellipse cx="100" cy="80" rx="34" ry="38" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
        <ellipse cx="88" cy="80" rx="6" ry="8" fill="${STROKE}"/>
        <ellipse cx="112" cy="80" rx="6" ry="8" fill="${STROKE}"/>
        <path d="M82 100 q9 3 18 -3 q9 3 18 -3" fill="none" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <!-- 铁桶（掉落） -->
        <path d="M65 60 L65 20 Q65 12 75 12 L125 12 Q135 12 135 20 L135 60 Z" fill="#9ca3af" stroke="${STROKE}" stroke-width="3" transform="rotate(10 100 36)"/>
        <ellipse cx="100" cy="60" rx="35" ry="6" fill="#6b7280" stroke="${STROKE}" stroke-width="2" transform="rotate(10 100 60)"/>
        <line x1="65" y1="40" x2="135" y2="40" stroke="#6b7280" stroke-width="2" transform="rotate(10 100 40)"/>
      </g>
      ${defeatedOverlay()}
    `);
  }
  return svg(`
    ${baseBody()}
    <ellipse cx="100" cy="80" rx="34" ry="38" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
    <ellipse cx="88" cy="80" rx="6" ry="8" fill="${STROKE}"/>
    <ellipse cx="112" cy="80" rx="6" ry="8" fill="${STROKE}"/>
    <path d="M82 95 Q100 102 118 95" fill="none" stroke="${STROKE}" stroke-width="3"/>
    <!-- 铁桶 -->
    <path d="M65 60 L65 20 Q65 12 75 12 L125 12 Q135 12 135 20 L135 60 Z" fill="#9ca3af" stroke="${STROKE}" stroke-width="3"/>
    <ellipse cx="100" cy="60" rx="35" ry="6" fill="#6b7280" stroke="${STROKE}" stroke-width="2"/>
    <line x1="65" y1="40" x2="135" y2="40" stroke="#6b7280" stroke-width="2"/>
  `);
}

/** 橄榄球僵尸 */
export function footballZ(defeated = false) {
  if (defeated) {
    return svg(`
      ${baseBodyDefeated()}
      <g transform="translate(10, 10) rotate(-8 100 80)">
        <ellipse cx="100" cy="80" rx="34" ry="38" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
        <path d="M78 75 l8 8 M86 75 l-8 8" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <path d="M106 75 l8 8 M114 75 l-8 8" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <path d="M82 100 q9 3 18 -3 q9 3 18 -3" fill="none" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <!-- 橄榄球头盔（掉落） -->
        <path d="M62 75 Q62 35 100 35 Q138 35 138 75" fill="#991b1b" stroke="${STROKE}" stroke-width="3" transform="rotate(15 100 55)"/>
        <path d="M62 75 Q100 85 138 75" fill="none" stroke="#fff" stroke-width="3" transform="rotate(15 100 75)"/>
        <line x1="100" y1="35" x2="100" y2="80" stroke="#fff" stroke-width="2" transform="rotate(15 100 57)"/>
        <rect x="62" y="100" width="76" height="14" rx="4" fill="#991b1b" stroke="${STROKE}" stroke-width="3" transform="rotate(5 100 107)"/>
      </g>
      ${defeatedOverlay()}
    `);
  }
  return svg(`
    ${baseBody()}
    <ellipse cx="100" cy="80" rx="34" ry="38" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
    <circle cx="88" cy="75" r="7" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="112" cy="75" r="7" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="88" cy="77" r="3" fill="${STROKE}"/>
    <circle cx="112" cy="77" r="3" fill="${STROKE}"/>
    <path d="M82 95 Q100 102 118 95" fill="none" stroke="${STROKE}" stroke-width="3"/>
    <!-- 橄榄球头盔 -->
    <path d="M62 75 Q62 35 100 35 Q138 35 138 75" fill="#991b1b" stroke="${STROKE}" stroke-width="3"/>
    <path d="M62 75 Q100 85 138 75" fill="none" stroke="#fff" stroke-width="3"/>
    <line x1="100" y1="35" x2="100" y2="80" stroke="#fff" stroke-width="2"/>
    <!-- 护肩 -->
    <rect x="62" y="100" width="76" height="14" rx="4" fill="#991b1b" stroke="${STROKE}" stroke-width="3"/>
  `);
}

/** 读报僵尸 */
export function newspaperZ(defeated = false) {
  if (defeated) {
    return svg(`
      ${baseBodyDefeated()}
      <g transform="translate(10, 10) rotate(-8 100 80)">
        <ellipse cx="100" cy="80" rx="34" ry="38" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
        <!-- 眼镜 -->
        <circle cx="88" cy="75" r="9" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
        <circle cx="112" cy="75" r="9" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
        <line x1="97" y1="75" x2="103" y2="75" stroke="${STROKE}" stroke-width="2"/>
        <path d="M82 90 q9 5 18 0 q9 5 18 0" fill="none" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <!-- 报纸（掉落） -->
        <rect x="30" y="95" width="60" height="45" fill="#fff" stroke="${STROKE}" stroke-width="2" transform="rotate(-15 60 117)"/>
        <line x1="40" y1="108" x2="80" y2="106" stroke="#9ca3af" stroke-width="2" transform="rotate(-15 60 117)"/>
        <line x1="40" y1="116" x2="80" y2="114" stroke="#9ca3af" stroke-width="2" transform="rotate(-15 60 117)"/>
        <line x1="40" y1="124" x2="80" y2="122" stroke="#9ca3af" stroke-width="2" transform="rotate(-15 60 117)"/>
      </g>
      ${defeatedOverlay()}
    `);
  }
  return svg(`
    ${baseBody()}
    <ellipse cx="100" cy="80" rx="34" ry="38" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
    <!-- 眼镜 -->
    <circle cx="88" cy="75" r="9" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="112" cy="75" r="9" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <line x1="97" y1="75" x2="103" y2="75" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="88" cy="75" r="4" fill="${STROKE}"/>
    <circle cx="112" cy="75" r="4" fill="${STROKE}"/>
    <path d="M82 95 Q100 102 118 95" fill="none" stroke="${STROKE}" stroke-width="3"/>
    <!-- 报纸 -->
    <rect x="30" y="95" width="60" height="45" fill="#fff" stroke="${STROKE}" stroke-width="2" transform="rotate(-5 60 117)"/>
    <line x1="40" y1="108" x2="80" y2="106" stroke="#9ca3af" stroke-width="2"/>
    <line x1="40" y1="116" x2="80" y2="114" stroke="#9ca3af" stroke-width="2"/>
    <line x1="40" y1="124" x2="80" y2="122" stroke="#9ca3af" stroke-width="2"/>
    <line x1="50" y1="100" x2="50" y2="140" stroke="#9ca3af" stroke-width="1"/>
  `);
}

/** 舞王僵尸 */
export function dancingZ(defeated = false) {
  if (defeated) {
    return svg(`
      <g transform="translate(10, 20) rotate(-12 100 140)">
        <!-- 身体倾斜 -->
        <path d="M65 115 L80 170 Q82 180 92 178 L128 168 Q138 166 134 156 L120 105 Z" fill="#7c3aed" stroke="${STROKE}" stroke-width="3"/>
        <!-- 手臂张开跳舞 -->
        <rect x="35" y="100" width="35" height="14" rx="7" fill="${SKIN}" stroke="${STROKE}" stroke-width="3" transform="rotate(-45 52 107)"/>
        <rect x="130" y="95" width="35" height="14" rx="7" fill="${SKIN}" stroke="${STROKE}" stroke-width="3" transform="rotate(45 147 102)"/>
        <circle cx="40" cy="85" r="9" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
        <circle cx="160" cy="80" r="9" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
        <rect x="85" y="170" width="16" height="22" fill="#7c3aed" stroke="${STROKE}" stroke-width="3"/>
        <rect x="109" y="168" width="16" height="22" fill="#7c3aed" stroke="${STROKE}" stroke-width="3"/>
        <!-- 头 -->
        <ellipse cx="100" cy="80" rx="34" ry="38" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
        <!-- 墨镜 -->
        <rect x="76" y="68" width="20" height="12" rx="4" fill="${STROKE}"/>
        <rect x="104" y="68" width="20" height="12" rx="4" fill="${STROKE}"/>
        <line x1="96" y1="74" x2="104" y2="74" stroke="${STROKE}" stroke-width="2"/>
        <!-- 嘴张开唱 -->
        <ellipse cx="100" cy="95" rx="8" ry="6" fill="${STROKE}"/>
        <ellipse cx="100" cy="96" rx="5" ry="3" fill="#7c0000"/>
      </g>
      ${defeatedOverlay()}
    `);
  }
  return svg(`
    <!-- 身体倾斜 -->
    <path d="M65 115 L80 170 Q82 180 92 178 L128 168 Q138 166 134 156 L120 105 Z" fill="#7c3aed" stroke="${STROKE}" stroke-width="3"/>
    <!-- 手臂张开跳舞 -->
    <rect x="35" y="100" width="35" height="14" rx="7" fill="${SKIN}" stroke="${STROKE}" stroke-width="3" transform="rotate(-45 52 107)"/>
    <rect x="130" y="95" width="35" height="14" rx="7" fill="${SKIN}" stroke="${STROKE}" stroke-width="3" transform="rotate(45 147 102)"/>
    <circle cx="40" cy="85" r="9" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
    <circle cx="160" cy="80" r="9" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
    <rect x="85" y="170" width="16" height="22" fill="#7c3aed" stroke="${STROKE}" stroke-width="3"/>
    <rect x="109" y="168" width="16" height="22" fill="#7c3aed" stroke="${STROKE}" stroke-width="3"/>
    <!-- 头 -->
    <ellipse cx="100" cy="80" rx="34" ry="38" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
    <!-- 墨镜 -->
    <rect x="76" y="68" width="20" height="12" rx="4" fill="${STROKE}"/>
    <rect x="104" y="68" width="20" height="12" rx="4" fill="${STROKE}"/>
    <line x1="96" y1="74" x2="104" y2="74" stroke="${STROKE}" stroke-width="2"/>
    <!-- 嘴张开唱 -->
    <ellipse cx="100" cy="95" rx="8" ry="6" fill="${STROKE}"/>
    <ellipse cx="100" cy="96" rx="5" ry="3" fill="#7c0000"/>
    <!-- 闪光 -->
    <circle cx="35" cy="60" r="8" fill="#fde047" stroke="${STROKE}" stroke-width="1"/>
    <circle cx="160" cy="50" r="6" fill="#fde047" stroke="${STROKE}" stroke-width="1"/>
  `);
}

/** 巨人僵尸 */
export function gargantuarZ(defeated = false) {
  if (defeated) {
    return svg(`
      <g transform="translate(15, 15) rotate(-10 100 130)">
        <!-- 大身体 -->
        <path d="M55 105 L55 180 Q55 192 67 192 L133 192 Q145 192 145 180 L145 105 Z" fill="${SKIN_D}" stroke="${STROKE}" stroke-width="4"/>
        <!-- 粗手臂 -->
        <rect x="20" y="100" width="40" height="20" rx="10" fill="${SKIN}" stroke="${STROKE}" stroke-width="3" transform="rotate(-10 40 110)"/>
        <rect x="140" y="100" width="40" height="20" rx="10" fill="${SKIN}" stroke="${STROKE}" stroke-width="3" transform="rotate(10 160 110)"/>
        <circle cx="28" cy="108" r="12" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
        <circle cx="172" cy="108" r="12" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
        <!-- 大头 -->
        <ellipse cx="100" cy="75" rx="42" ry="44" fill="${SKIN}" stroke="${STROKE}" stroke-width="4"/>
        <!-- >_< 眼睛 -->
        <path d="M82 68 l8 8 M90 68 l-8 8" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <path d="M106 68 l8 8 M114 68 l-8 8" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <!-- 波浪嘴 -->
        <path d="M78 100 q9 3 18 -3 q9 3 18 -3 q9 3 18 -3" fill="none" stroke="${STROKE}" stroke-width="3" stroke-linecap="round"/>
        <!-- 小牙 -->
        <rect x="90" y="97" width="5" height="6" fill="#fff" stroke="${STROKE}" stroke-width="1"/>
        <rect x="105" y="97" width="5" height="6" fill="#fff" stroke="${STROKE}" stroke-width="1"/>
        <!-- 电线杆（掉落） -->
        <line x1="172" y1="108" x2="172" y2="20" stroke="#9ca3af" stroke-width="6" transform="rotate(20 172 64)"/>
        <line x1="160" y1="40" x2="184" y2="40" stroke="#9ca3af" stroke-width="3" transform="rotate(20 172 40)"/>
        <line x1="163" y1="50" x2="181" y2="50" stroke="#9ca3af" stroke-width="2" transform="rotate(20 172 50)"/>
      </g>
      ${defeatedOverlay()}
    `);
  }
  return svg(`
    <!-- 大身体 -->
    <path d="M55 105 L55 180 Q55 192 67 192 L133 192 Q145 192 145 180 L145 105 Z" fill="${SKIN_D}" stroke="${STROKE}" stroke-width="4"/>
    <!-- 粗手臂 -->
    <rect x="20" y="100" width="40" height="20" rx="10" fill="${SKIN}" stroke="${STROKE}" stroke-width="3" transform="rotate(-10 40 110)"/>
    <rect x="140" y="100" width="40" height="20" rx="10" fill="${SKIN}" stroke="${STROKE}" stroke-width="3" transform="rotate(10 160 110)"/>
    <circle cx="28" cy="108" r="12" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
    <circle cx="172" cy="108" r="12" fill="${SKIN}" stroke="${STROKE}" stroke-width="3"/>
    <!-- 大头 -->
    <ellipse cx="100" cy="75" rx="42" ry="44" fill="${SKIN}" stroke="${STROKE}" stroke-width="4"/>
    <ellipse cx="85" cy="72" rx="9" ry="11" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <ellipse cx="115" cy="72" rx="9" ry="11" fill="#fff" stroke="${STROKE}" stroke-width="2"/>
    <circle cx="86" cy="74" r="4" fill="${STROKE}"/>
    <circle cx="116" cy="74" r="4" fill="${STROKE}"/>
    <path d="M78 95 Q100 105 122 95" fill="none" stroke="${STROKE}" stroke-width="3"/>
    <rect x="90" y="92" width="5" height="6" fill="#fff" stroke="${STROKE}" stroke-width="1"/>
    <rect x="105" y="92" width="5" height="6" fill="#fff" stroke="${STROKE}" stroke-width="1"/>
    <!-- 电线杆 -->
    <line x1="172" y1="108" x2="172" y2="20" stroke="#9ca3af" stroke-width="6"/>
    <line x1="160" y1="40" x2="184" y2="40" stroke="#9ca3af" stroke-width="3"/>
    <line x1="163" y1="50" x2="181" y2="50" stroke="#9ca3af" stroke-width="2"/>
  `);
}

/** 按 tier 取僵尸 SVG（支持 defeated 参数） */
export function getZombieSvg(tier, defeated = false) {
  const fns = [basicZ, coneheadZ, poleZ, bucketheadZ, footballZ, newspaperZ, dancingZ, gargantuarZ];
  const fn = fns[tier - 1] || basicZ;
  return fn(defeated);
}
