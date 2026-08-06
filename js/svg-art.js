// svg-art.js — 英语单词的 SVG 简笔画（程序化生成，零依赖、离线可用）
// 每个函数返回内联 SVG 字符串，风格统一：圆角粗线条 + 填色，幼儿友好

const W = 120, H = 120; // viewBox

function svg(inner) {
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="display:block">${inner}</svg>`;
}

/** 颜色色块（用于 color 类） */
function colorBlock(color, label) {
  return svg(`
    <rect x="14" y="14" width="92" height="92" rx="16" fill="${color}" stroke="#3a2a1a" stroke-width="3"/>
    <text x="60" y="72" text-anchor="middle" font-size="22" font-weight="700" fill="#fff" font-family="sans-serif">${label}</text>
  `);
}

/** 数字图示（用于 number 类） */
function numberDots(n) {
  let dots = '';
  const cols = n <= 5 ? n : 5;
  const rows = Math.ceil(n / 5);
  const startX = 60 - (cols - 1) * 11;
  const startY = 60 - (rows - 1) * 11;
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols && idx < n; c++) {
      dots += `<circle cx="${startX + c * 22}" cy="${startY + r * 22}" r="9" fill="#f59e0b" stroke="#3a2a1a" stroke-width="2.5"/>`;
      idx++;
    }
  }
  return svg(`<rect x="8" y="8" width="104" height="104" rx="18" fill="#fff8e7" stroke="#f0e3c8" stroke-width="3"/>${dots}`);
}

/** 形状类 */
function shapes(key) {
  const stroke = '#3a2a1a';
  switch (key) {
    case 'circle': return svg(`<circle cx="60" cy="60" r="40" fill="#60a5fa" stroke="${stroke}" stroke-width="4"/>`);
    case 'square': return svg(`<rect x="22" y="22" width="76" height="76" rx="6" fill="#34d399" stroke="${stroke}" stroke-width="4"/>`);
    case 'triangle': return svg(`<polygon points="60,20 100,95 20,95" fill="#fbbf24" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`);
    case 'star': return svg(`<polygon points="60,18 72,48 104,50 79,70 88,100 60,84 32,100 41,70 16,50 48,48" fill="#facc15" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>`);
    case 'heart': return svg(`<path d="M60 96 C20 70 18 38 38 30 C52 24 60 38 60 44 C60 38 68 24 82 30 C102 38 100 70 60 96 Z" fill="#f87171" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>`);
    case 'diamond': return svg(`<polygon points="60,18 100,60 60,102 20,60" fill="#a78bfa" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`);
    case 'oval': return svg(`<ellipse cx="60" cy="60" rx="46" ry="34" fill="#f472b6" stroke="${stroke}" stroke-width="4"/>`);
    case 'cross': return svg(`<rect x="50" y="18" width="20" height="84" fill="#f87171" stroke="${stroke}" stroke-width="3" rx="3"/><rect x="18" y="50" width="84" height="20" fill="#f87171" stroke="${stroke}" stroke-width="3" rx="3"/>`);
    default: return svg(`<text x="60" y="68" text-anchor="middle" font-size="40">?</text>`);
  }
}

/** 天气类 */
function weatherArt(key) {
  const stroke = '#3a2a1a';
  switch (key) {
    case 'sun':
      let rays = '';
      for (let i = 0; i < 8; i++) { const a = i * 45 * Math.PI / 180; rays += `<line x1="${60 + Math.cos(a) * 34}" y1="${60 + Math.sin(a) * 34}" x2="${60 + Math.cos(a) * 46}" y2="${60 + Math.sin(a) * 46}" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>`; }
      return svg(`<g>${rays}</g><circle cx="60" cy="60" r="26" fill="#fbbf24" stroke="${stroke}" stroke-width="3"/>`);
    case 'rain':
      return svg(`<ellipse cx="60" cy="42" rx="34" ry="20" fill="#cbd5e1" stroke="${stroke}" stroke-width="3"/>
        <line x1="38" y1="70" x2="32" y2="92" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
        <line x1="60" y1="70" x2="54" y2="92" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>
        <line x1="82" y1="70" x2="76" y2="92" stroke="#60a5fa" stroke-width="4" stroke-linecap="round"/>`);
    case 'cloud':
      return svg(`<ellipse cx="44" cy="58" rx="22" ry="18" fill="#e2e8f0" stroke="${stroke}" stroke-width="3"/>
        <ellipse cx="72" cy="54" rx="26" ry="22" fill="#f1f5f9" stroke="${stroke}" stroke-width="3"/>
        <ellipse cx="60" cy="68" rx="30" ry="14" fill="#e2e8f0" stroke="${stroke}" stroke-width="3"/>`);
    case 'snow':
      return svg(`<ellipse cx="60" cy="40" rx="32" ry="18" fill="#dbeafe" stroke="${stroke}" stroke-width="3"/>
        <circle cx="40" cy="78" r="5" fill="#93c5fd"/><circle cx="60" cy="88" r="5" fill="#93c5fd"/><circle cx="80" cy="78" r="5" fill="#93c5fd"/>`);
    case 'wind':
      return svg(`<path d="M20 45 Q60 45 80 45 Q92 45 92 55" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
        <path d="M20 65 Q55 65 70 65 Q82 65 82 75" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
        <path d="M20 85 Q50 85 64 85" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>`);
    case 'rainbow':
      return svg(`<path d="M16 88 A44 44 0 0 1 104 88" fill="none" stroke="#ef4444" stroke-width="8"/>
        <path d="M24 88 A36 36 0 0 1 96 88" fill="none" stroke="#f59e0b" stroke-width="8"/>
        <path d="M32 88 A28 28 0 0 1 88 88" fill="none" stroke="#eab308" stroke-width="8"/>
        <path d="M40 88 A20 20 0 0 1 80 88" fill="none" stroke="#22c55e" stroke-width="8"/>
        <path d="M48 88 A12 12 0 0 1 72 88" fill="none" stroke="#3b82f6" stroke-width="8"/>`);
    case 'moon':
      return svg(`<path d="M72 30 A30 30 0 1 0 72 90 A24 24 0 1 1 72 30 Z" fill="#fde68a" stroke="${stroke}" stroke-width="3"/>
        <circle cx="36" cy="40" r="2.5" fill="#3a2a1a"/><circle cx="92" cy="56" r="2.5" fill="#3a2a1a"/>`);
    case 'star':
      return shapes('star');
    default: return svg(`<text x="60" y="68" text-anchor="middle" font-size="40">?</text>`);
  }
}

/** 日用品类 */
function dailyArt(key) {
  const stroke = '#3a2a1a';
  switch (key) {
    case 'cup':
      return svg(`<path d="M32 36 H88 L82 96 Q82 102 76 102 H44 Q38 102 38 96 Z" fill="#f3f4f6" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M88 46 Q104 46 104 60 Q104 74 88 74" fill="none" stroke="${stroke}" stroke-width="3"/>`);
    case 'bowl':
      return svg(`<path d="M16 50 H104 Q100 96 60 96 Q20 96 16 50 Z" fill="#fbbf24" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <ellipse cx="60" cy="50" rx="44" ry="10" fill="#f59e0b" stroke="${stroke}" stroke-width="3"/>`);
    case 'spoon':
      return svg(`<ellipse cx="44" cy="40" rx="22" ry="26" fill="#e5e7eb" stroke="${stroke}" stroke-width="3"/>
        <rect x="38" y="58" width="12" height="42" rx="6" fill="#e5e7eb" stroke="${stroke}" stroke-width="3"/>`);
    case 'toothbrush':
      return svg(`<rect x="16" y="54" width="64" height="12" rx="6" fill="#38bdf8" stroke="${stroke}" stroke-width="3"/>
        <rect x="76" y="48" width="8" height="24" fill="#fff" stroke="${stroke}" stroke-width="2"/>
        <line x1="78" y1="46" x2="78" y2="54" stroke="${stroke}" stroke-width="3"/><line x1="82" y1="46" x2="82" y2="54" stroke="${stroke}" stroke-width="3"/>`);
    case 'towel':
      return svg(`<rect x="24" y="22" width="72" height="76" rx="6" fill="#fca5a5" stroke="${stroke}" stroke-width="3"/>
        <line x1="24" y1="36" x2="96" y2="36" stroke="${stroke}" stroke-width="2"/><line x1="24" y1="84" x2="96" y2="84" stroke="${stroke}" stroke-width="2"/>`);
    case 'comb':
      return svg(`<rect x="16" y="46" width="88" height="16" rx="4" fill="#a78bfa" stroke="${stroke}" stroke-width="3"/>
        ${[24,36,48,60,72,84,96].map(x => `<line x1="${x}" y1="62" x2="${x}" y2="92" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>`).join('')}`);
    case 'clock':
      return svg(`<circle cx="60" cy="60" r="40" fill="#fff" stroke="${stroke}" stroke-width="4"/>
        <line x1="60" y1="60" x2="60" y2="32" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
        <line x1="60" y1="60" x2="84" y2="60" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
        <circle cx="60" cy="60" r="3" fill="${stroke}"/>`);
    case 'lamp':
      return svg(`<path d="M38 36 H82 L74 64 H46 Z" fill="#fde68a" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <line x1="60" y1="64" x2="60" y2="96" stroke="${stroke}" stroke-width="4"/>
        <line x1="44" y1="96" x2="76" y2="96" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>`);
    case 'umbrella':
      return svg(`<path d="M20 56 Q60 16 100 56 Z" fill="#f87171" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <line x1="60" y1="56" x2="60" y2="92" stroke="${stroke}" stroke-width="4"/>
        <path d="M60 92 Q60 102 70 102" fill="none" stroke="${stroke}" stroke-width="4"/>`);
    case 'book':
      return svg(`<path d="M22 28 Q42 22 60 28 Q78 22 98 28 V92 Q78 86 60 92 Q42 86 22 92 Z" fill="#fbbf24" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <line x1="60" y1="28" x2="60" y2="92" stroke="${stroke}" stroke-width="3"/>`);
    case 'pen':
      return svg(`<path d="M28 92 L40 80 L80 40 L88 48 L48 88 L36 100 Z" fill="#60a5fa" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <polygon points="28,92 36,100 24,104" fill="${stroke}"/>`);
    case 'bag':
      return svg(`<path d="M30 38 H90 V96 Q90 100 86 100 H34 Q30 100 30 96 Z" fill="#34d399" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M44 38 Q44 20 60 20 Q76 20 76 38" fill="none" stroke="${stroke}" stroke-width="3"/>
        <rect x="50" y="58" width="20" height="16" rx="3" fill="#10b981" stroke="${stroke}" stroke-width="2"/>`);
    case 'bottle':
      return svg(`<rect x="46" y="16" width="28" height="14" fill="#38bdf8" stroke="${stroke}" stroke-width="3"/>
        <path d="M44 30 Q44 38 50 40 H70 Q76 38 76 30 V96 Q76 100 72 100 H48 Q44 100 44 96 Z" fill="#bae6fd" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>`);
    case 'plate':
      return svg(`<circle cx="60" cy="60" r="44" fill="#f1f5f9" stroke="${stroke}" stroke-width="4"/>
        <circle cx="60" cy="60" r="30" fill="#fff" stroke="${stroke}" stroke-width="2"/>`);
    default: return svg(`<text x="60" y="68" text-anchor="middle" font-size="40">?</text>`);
  }
}

/** 交通工具类 */
function vehicleArt(key) {
  const stroke = '#3a2a1a';
  switch (key) {
    case 'car':
      return svg(`<path d="M16 64 Q16 56 24 56 L40 56 L50 40 H82 L92 56 Q104 56 104 64 V82 Q104 86 100 86 H88 Q86 94 78 94 Q70 94 68 86 H52 Q50 94 42 94 Q34 94 32 86 H20 Q16 86 16 82 Z" fill="#ef4444" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="42" cy="86" r="9" fill="#1f2937"/><circle cx="78" cy="86" r="9" fill="#1f2937"/>
        <path d="M50 44 H80 L86 56 H44 Z" fill="#bae6fd" stroke="${stroke}" stroke-width="2"/>`);
    case 'bus':
      return svg(`<rect x="16" y="34" width="88" height="52" rx="8" fill="#fbbf24" stroke="${stroke}" stroke-width="3"/>
        ${[26,46,66,86].map(x => `<rect x="${x}" y="44" width="14" height="14" fill="#bae6fd" stroke="${stroke}" stroke-width="2"/>`).join('')}
        <circle cx="38" cy="86" r="9" fill="#1f2937"/><circle cx="82" cy="86" r="9" fill="#1f2937"/>`);
    case 'bike':
      return svg(`<circle cx="34" cy="80" r="16" fill="none" stroke="${stroke}" stroke-width="4"/>
        <circle cx="86" cy="80" r="16" fill="none" stroke="${stroke}" stroke-width="4"/>
        <path d="M34 80 L58 48 H82 L86 80 M58 48 L34 80 M58 48 L48 80" stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <line x1="52" y1="40" x2="64" y2="40" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>`);
    case 'train':
      return svg(`<rect x="12" y="40" width="96" height="44" rx="8" fill="#3b82f6" stroke="${stroke}" stroke-width="3"/>
        ${[24,44,64,84].map(x => `<rect x="${x}" y="48" width="14" height="14" rx="2" fill="#bae6fd" stroke="${stroke}" stroke-width="2"/>`).join('')}
        <rect x="16" y="84" width="20" height="8" fill="#1f2937"/><rect x="84" y="84" width="20" height="8" fill="#1f2937"/>
        <polygon points="60,40 50,28 70,28" fill="#fbbf24" stroke="${stroke}" stroke-width="2"/>`);
    case 'plane':
      return svg(`<path d="M60 18 L70 56 L104 70 L70 78 L66 96 L56 92 L54 78 L20 70 L54 56 Z" fill="#e2e8f0" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>`);
    case 'ship':
      return svg(`<path d="M14 64 H106 L96 92 Q96 96 90 96 H30 Q24 96 24 92 Z" fill="#3b82f6" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="44" y="30" width="6" height="34" fill="#92400e"/>
        <path d="M50 30 L78 44 L50 58 Z" fill="#ef4444" stroke="${stroke}" stroke-width="2"/>`);
    case 'boat':
      return svg(`<path d="M22 58 L98 58 L88 84 Q88 88 82 88 H38 Q32 88 32 84 Z" fill="#a78bfa" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <line x1="60" y1="58" x2="60" y2="20" stroke="#92400e" stroke-width="4"/>
        <path d="M60 22 L88 52 L60 52 Z" fill="#fbbf24" stroke="${stroke}" stroke-width="2"/>`);
    case 'subway':
      return svg(`<rect x="18" y="30" width="84" height="50" rx="14" fill="#10b981" stroke="${stroke}" stroke-width="3"/>
        ${[30,58].map(x => `<rect x="${x}" y="40" width="24" height="14" rx="3" fill="#d1fae5" stroke="${stroke}" stroke-width="2"/>`).join('')}
        <circle cx="34" cy="84" r="6" fill="#1f2937"/><circle cx="86" cy="84" r="6" fill="#1f2937"/>`);
    case 'taxi':
      return svg(`<path d="M16 60 Q16 52 24 52 L40 52 L48 38 H84 L92 52 Q104 52 104 60 V80 Q104 84 100 84 H86 Q84 92 76 92 Q68 92 66 84 H54 Q52 92 44 92 Q36 92 34 84 H20 Q16 84 16 80 Z" fill="#fbbf24" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="56" y="34" width="20" height="8" rx="2" fill="#1f2937"/>
        <circle cx="44" cy="84" r="8" fill="#1f2937"/><circle cx="76" cy="84" r="8" fill="#1f2937"/>`);
    case 'truck':
      return svg(`<rect x="12" y="46" width="56" height="36" rx="4" fill="#60a5fa" stroke="${stroke}" stroke-width="3"/>
        <path d="M68 54 H92 L104 66 V84 H68 Z" fill="#fbbf24" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="34" cy="86" r="8" fill="#1f2937"/><circle cx="86" cy="86" r="8" fill="#1f2937"/>`);
    case 'ambulance':
      return svg(`<rect x="12" y="44" width="60" height="38" rx="4" fill="#fff" stroke="${stroke}" stroke-width="3"/>
        <path d="M72 52 H94 L104 64 V82 H72 Z" fill="#ef4444" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="34" y="54" width="14" height="14" fill="#ef4444"/><polygon points="41,54 38,60 44,60 36,68 40,62 44,62" fill="#fff"/>
        <circle cx="32" cy="84" r="7" fill="#1f2937"/><circle cx="88" cy="84" r="7" fill="#1f2937"/>`);
    case 'fire':
      return svg(`<rect x="12" y="42" width="64" height="40" rx="4" fill="#ef4444" stroke="${stroke}" stroke-width="3"/>
        <path d="M76 50 H98 L104 60 V82 H76 Z" fill="#fff" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="20" y="20" width="20" height="22" rx="2" fill="#fbbf24" stroke="${stroke}" stroke-width="2"/>
        <circle cx="34" cy="84" r="7" fill="#1f2937"/><circle cx="90" cy="84" r="7" fill="#1f2937"/>`);
    default: return svg(`<text x="60" y="68" text-anchor="middle" font-size="40">?</text>`);
  }
}

/** 颜色映射 */
const COLORS = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#facc15',
  orange: '#f97316', purple: '#a855f7', pink: '#ec4899', black: '#1f2937',
  white: '#f9fafb', brown: '#92400e',
};

/** 主入口：按 svg key 取 SVG 字符串 */
export function getArt(svgKey) {
  // 数字
  if (svgKey.startsWith('n')) {
    const n = parseInt(svgKey.slice(1), 10);
    if (n >= 1 && n <= 10) return numberDots(n);
  }
  // 颜色
  if (COLORS[svgKey]) {
    return colorBlock(COLORS[svgKey], '');
  }
  // 形状
  if (['circle','square','triangle','star','heart','diamond','oval','cross'].includes(svgKey)) {
    return shapes(svgKey);
  }
  // 天气
  if (['sun','rain','cloud','snow','wind','rainbow','moon'].includes(svgKey)) {
    return weatherArt(svgKey);
  }
  // 日用品
  if (['cup','bowl','spoon','toothbrush','towel','comb','clock','lamp','umbrella','book','pen','bag','bottle','plate'].includes(svgKey)) {
    return dailyArt(svgKey);
  }
  // 交通
  if (['car','bus','bike','train','plane','ship','boat','subway','taxi','truck','ambulance','fire'].includes(svgKey)) {
    return vehicleArt(svgKey);
  }
  return svg(`<text x="60" y="68" text-anchor="middle" font-size="40">?</text>`);
}
