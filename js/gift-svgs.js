// gift-svgs.js — 程序化 SVG 周礼物（矢量极小）
const V = 'viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg"';
const ST = '#3a2a1a';
function svg(i){return `<svg ${V}>${i}</svg>`;}

export function bicycleSvg(){return svg(`
  <!-- 轮子 -->
  <circle cx="55" cy="140" r="35" fill="none" stroke="${ST}" stroke-width="6"/>
  <circle cx="145" cy="140" r="35" fill="none" stroke="${ST}" stroke-width="6"/>
  <line x1="55" y1="105" x2="55" y2="175" stroke="${ST}" stroke-width="2"/>
  <line x1="40" y1="140" x2="70" y2="140" stroke="${ST}" stroke-width="2"/>
  <line x1="145" y1="105" x2="145" y2="175" stroke="${ST}" stroke-width="2"/>
  <line x1="130" y1="140" x2="160" y2="140" stroke="${ST}" stroke-width="2"/>
  <!-- 车架 -->
  <path d="M55 140 L100 80 L145 140 M100 80 L75 140 M55 140 L75 140" fill="none" stroke="#ef4444" stroke-width="6" stroke-linecap="round"/>
  <!-- 座椅 -->
  <ellipse cx="78" cy="74" rx="12" ry="5" fill="#3a2a1a"/>
  <line x1="100" y1="80" x2="78" y2="78" stroke="#3a2a1a" stroke-width="3"/>
  <!-- 车把 -->
  <line x1="100" y1="80" x2="120" y2="55" stroke="#3a2a1a" stroke-width="4"/>
  <line x1="110" y1="50" x2="135" y2="58" stroke="#3a2a1a" stroke-width="4" stroke-linecap="round"/>
  <!-- 篮子 -->
  <path d="M100 80 L110 55 L130 55 L125 78 Z" fill="#fbbf24" stroke="${ST}" stroke-width="2"/>
`);}

export function scooterSvg(){return svg(`
  <!-- 轮子 -->
  <circle cx="50" cy="150" r="22" fill="none" stroke="${ST}" stroke-width="6"/>
  <circle cx="150" cy="150" r="18" fill="none" stroke="${ST}" stroke-width="6"/>
  <!-- 踏板 -->
  <rect x="50" y="135" width="100" height="10" rx="3" fill="#3b82f6" stroke="${ST}" stroke-width="2"/>
  <!-- 立柱 -->
  <line x1="150" y1="145" x2="140" y2="60" stroke="#3b82f6" stroke-width="6"/>
  <!-- 车把 -->
  <line x1="125" y1="55" x2="155" y2="55" stroke="${ST}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="125" cy="55" r="5" fill="#ef4444"/>
  <circle cx="155" cy="55" r="5" fill="#ef4444"/>
`)}

export function ebikeSvg(){return svg(`
  <!-- 轮子 -->
  <circle cx="50" cy="140" r="32" fill="none" stroke="${ST}" stroke-width="6"/>
  <circle cx="150" cy="140" r="32" fill="none" stroke="${ST}" stroke-width="6"/>
  <!-- 车身 -->
  <path d="M50 140 L90 90 L150 140 M90 90 L130 140 M50 140 L130 140" fill="none" stroke="#22c55e" stroke-width="7" stroke-linecap="round"/>
  <!-- 座椅 -->
  <ellipse cx="92" cy="84" rx="14" ry="6" fill="#3a2a1a"/>
  <!-- 车把 -->
  <line x1="150" y1="140" x2="165" y2="70" stroke="#3a2a1a" stroke-width="5"/>
  <line x1="150" y1="65" x2="180" y2="70" stroke="#3a2a1a" stroke-width="5" stroke-linecap="round"/>
  <!-- 电池 -->
  <rect x="70" y="120" width="40" height="12" rx="3" fill="#fbbf24" stroke="${ST}" stroke-width="2"/>
`)}

/** 通用汽车（带车标参数） */
function carSvg(bodyColor, brandMark){
  return svg(`
    <!-- 车身 -->
    <path d="M30 130 Q30 100 60 95 L80 70 L130 70 L150 95 Q170 100 170 130 L170 145 Q170 150 165 150 L35 150 Q30 150 30 145 Z" fill="${bodyColor}" stroke="${ST}" stroke-width="3"/>
    <!-- 车窗 -->
    <path d="M82 72 L98 95 L128 95 L122 72 Z" fill="#bfdbfe" stroke="${ST}" stroke-width="2"/>
    <!-- 车门线 -->
    <line x1="100" y1="95" x2="100" y2="140" stroke="${ST}" stroke-width="2"/>
    <!-- 车灯 -->
    <ellipse cx="45" cy="125" rx="6" ry="4" fill="#fde047"/>
    <ellipse cx="155" cy="125" rx="6" ry="4" fill="#fde047"/>
    <!-- 车标（车头格栅） -->
    ${brandMark}
    <!-- 轮子 -->
    <circle cx="60" cy="150" r="18" fill="#1f2937" stroke="${ST}" stroke-width="3"/>
    <circle cx="60" cy="150" r="8" fill="#9ca3af"/>
    <circle cx="140" cy="150" r="18" fill="#1f2937" stroke="${ST}" stroke-width="3"/>
    <circle cx="140" cy="150" r="8" fill="#9ca3af"/>
  `);
}
export function vwSvg(){return carSvg('#3b82f6', '<circle cx="100" cy="138" r="11" fill="#fff" stroke="#1e3a8a" stroke-width="2"/><text x="100" y="143" text-anchor="middle" font-size="10" font-weight="900" fill="#1e3a8a">VW</text>');}
export function toyotaSvg(){return carSvg('#9ca3af', '<g transform="translate(100,138)"><ellipse cx="0" cy="0" rx="10" ry="7" fill="none" stroke="#1f2937" stroke-width="2"/><ellipse cx="0" cy="0" rx="5" ry="3" fill="none" stroke="#1f2937" stroke-width="2"/><ellipse cx="0" cy="0" rx="2" ry="6" fill="#1f2937"/></g>');}
export function bmwSvg(){return carSvg('#ef4444', '<circle cx="100" cy="138" r="11" fill="#fff" stroke="${ST}" stroke-width="2"/><path d="M100 138 L100 127 A11 11 0 0 1 111 138 Z" fill="#3b82f6"/><path d="M100 138 L111 138 A11 11 0 0 1 100 149 Z" fill="#fff"/><path d="M100 138 L100 149 A11 11 0 0 1 89 138 Z" fill="#3b82f6"/><path d="M100 138 L89 138 A11 11 0 0 1 100 127 Z" fill="#fff"/><circle cx="100" cy="138" r="11" fill="none" stroke="${ST}" stroke-width="1.5"/>');}

export function helicopterSvg(){return svg(`
  <!-- 机身 -->
  <ellipse cx="100" cy="120" rx="45" ry="25" fill="#ef4444" stroke="${ST}" stroke-width="3"/>
  <!-- 驾驶舱玻璃 -->
  <ellipse cx="65" cy="115" rx="18" ry="15" fill="#bfdbfe" stroke="${ST}" stroke-width="2"/>
  <!-- 尾梁 -->
  <rect x="140" y="112" width="40" height="10" fill="#ef4444" stroke="${ST}" stroke-width="2"/>
  <!-- 尾旋翼 -->
  <rect x="175" y="100" width="14" height="3" fill="${ST}"/>
  <rect x="175" y="130" width="14" height="3" fill="${ST}"/>
  <!-- 主旋翼 -->
  <line x1="50" y1="75" x2="150" y2="75" stroke="${ST}" stroke-width="4" stroke-linecap="round"/>
  <line x1="100" y1="75" x2="100" y2="95" stroke="${ST}" stroke-width="3"/>
  <!-- 起落架 -->
  <line x1="75" y1="145" x2="70" y2="160" stroke="${ST}" stroke-width="3"/>
  <line x1="125" y1="145" x2="130" y2="160" stroke="${ST}" stroke-width="3"/>
  <line x1="60" y1="160" x2="140" y2="160" stroke="${ST}" stroke-width="3"/>
`)}

export function carrierSvg(){return svg(`
  <!-- 船体 -->
  <path d="M20 140 L180 140 L170 170 L30 170 Z" fill="#6b7280" stroke="${ST}" stroke-width="3"/>
  <!-- 甲板 -->
  <rect x="25" y="125" width="150" height="18" fill="#9ca3af" stroke="${ST}" stroke-width="2"/>
  <!-- 舰岛 -->
  <rect x="120" y="100" width="30" height="25" fill="#4b5563" stroke="${ST}" stroke-width="2"/>
  <rect x="125" y="85" width="8" height="18" fill="#4b5563" stroke="${ST}" stroke-width="2"/>
  <!-- 飞机 -->
  <path d="M50 130 L75 125 L80 130 L75 132 L50 134 Z" fill="#fbbf24" stroke="${ST}" stroke-width="1.5"/>
  <path d="M85 130 L110 126 L115 130 L110 133 L85 134 Z" fill="#fbbf24" stroke="${ST}" stroke-width="1.5"/>
  <!-- 水 -->
  <path d="M15 172 Q40 168 60 172 Q80 176 100 172 Q120 168 140 172 Q160 176 185 172" fill="none" stroke="#3b82f6" stroke-width="3"/>
`)}

/** 按 tier 取礼物 SVG */
export function getGiftSvg(tier){
  const fns=[bicycleSvg,scooterSvg,ebikeSvg,vwSvg,toyotaSvg,bmwSvg,helicopterSvg,carrierSvg];
  return (fns[tier-1]||bicycleSvg)();
}
