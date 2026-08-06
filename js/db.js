// db.js — 默认数据、商店物品表、宠物物种表、词库常量、初始数据构造

import { todayKey } from './utils.js';

/* ============================================================
 * 任务类型与分类
 * ========================================================== */

/**
 * 任务打卡类型：
 * - check   勾选型（习惯/运动/家务）：点一下即完成
 * - quiz    答题型（识字/英语/数学）：完成一组题目，达成功率才算通过
 * - battle  战斗型（英语开口）：读词攻击怪兽，打死算通过
 */
export const TASK_KIND = { CHECK: 'check', QUIZ: 'quiz', BATTLE: 'battle' };

/** 分类元信息 */
export const CATEGORIES = {
  habit: { name: '习惯养成', emoji: '🌱', color: '#8b5cf6' },
  study: { name: '学习打卡', emoji: '📚', color: '#3b82f6' },
  sport: { name: '运动打卡', emoji: '⚽', color: '#10b981' },
  life: { name: '家务打卡', emoji: '🏠', color: '#f59e0b' },
};

/** 习惯养成 7 项（用户指定固定项） */
const HABIT_TASKS = [
  { id: 'h_wake', title: '按时起床', icon: '⏰', points: 2 },
  { id: 'h_sleep', title: '按时睡觉', icon: '🌙', points: 2 },
  { id: 'h_brush', title: '好好刷牙', icon: '🪥', points: 1 },
  { id: 'h_face', title: '好好洗脸', icon: '🧴', points: 1 },
  { id: 'h_dress', title: '自己穿衣服', icon: '👕', points: 1 },
  { id: 'h_notlate', title: '上学不迟到', icon: '🎒', points: 2 },
  { id: 'h_temper', title: '不发脾气', icon: '😌', points: 2 },
];

/** 运动选项（孩子选今天做了哪些） */
const SPORT_TASKS = [
  { id: 's_run', title: '跑步', icon: '🏃', points: 2 },
  { id: 's_jump', title: '跳绳', icon: '🤸', points: 2 },
  { id: 's_ball', title: '球类', icon: '⚽', points: 2 },
  { id: 's_bike', title: '骑车', icon: '🚲', points: 2 },
  { id: 's_swim', title: '游泳', icon: '🏊', points: 3 },
  { id: 's_outdoor', title: '户外活动', icon: '🌳', points: 2 },
  { id: 's_gym', title: '体能训练', icon: '🤾', points: 2 },
];

/** 家务选项 */
const LIFE_TASKS = [
  { id: 'l_bag', title: '整理书包', icon: '🎒', points: 2 },
  { id: 'l_dishes', title: '洗碗', icon: '🍽️', points: 2 },
  { id: 'l_room', title: '收拾房间', icon: '🧹', points: 3 },
  { id: 'l_trash', title: '倒垃圾', icon: '🗑️', points: 1 },
  { id: 'l_table', title: '摆碗筷', icon: '🥢', points: 1 },
  { id: 'l_laundry', title: '叠衣服', icon: '👕', points: 2 },
  { id: 'l_water', title: '浇花', icon: '🪴', points: 1 },
];

/** 学习打卡 6 个互动模块 */
const STUDY_TASKS = [
  { id: 'q_chinese', title: '识字打卡', icon: '字', points: 8, kind: 'quiz', quizType: 'chinese', dailyCount: 10, passRate: 0.8 },
  { id: 'q_english', title: '英语打卡', icon: 'ABC', points: 8, kind: 'quiz', quizType: 'english', dailyCount: 10, passRate: 0.8 },
  { id: 'q_math', title: '数学打卡', icon: '➕', points: 6, kind: 'quiz', quizType: 'math', dailyCount: 10, passRate: 0.8 },
  { id: 'q_brain', title: '大脑开发', icon: '🧠', points: 8, kind: 'quiz', quizType: 'brain', dailyCount: 10, passRate: 0.8 },
  { id: 'q_poem', title: '古诗打卡', icon: '📜', points: 8, kind: 'quiz', quizType: 'poem', dailyCount: 1, passRate: 0.8 },
  { id: 'q_speak', title: '英语开口', icon: '🗣️', points: 10, kind: 'battle', quizType: 'speak', dailyCount: 10, passRate: 1 },
];

/* ============================================================
 * 宠物 / 怪物 / 商店数值表
 * ========================================================== */

export const RARITY_TABLE = {
  common: { hp: 50, atk: 10, def: 5, weight: 60 },
  rare: { hp: 70, atk: 14, def: 8, weight: 28 },
  epic: { hp: 95, atk: 18, def: 12, weight: 10 },
  legendary: { hp: 130, atk: 24, def: 16, weight: 2 },
};

/** 配饰表：透明 PNG 图层叠加在宠物上方。slot 决定叠加位置/大小 */
export const ACCESSORIES = [
  { id: 'a_cap_red', name: '小红帽', img: 'acc/red-cap.svg', slot: 'hat', price: 15 },
  { id: 'a_crown', name: '小皇冠', img: 'acc/crown.svg', slot: 'hat', price: 30 },
  { id: 'a_glasses', name: '墨镜', img: 'acc/glasses.svg', slot: 'eyes', price: 12 },
  { id: 'a_bow', name: '蝴蝶结', img: 'acc/bow.svg', slot: 'ear', price: 10 },
  { id: 'a_scarf', name: '围巾', img: 'acc/scarf.svg', slot: 'neck', price: 12 },
];

/** 染色色板：hue-rotate 角度 + saturate，让白底动物图片呈现不同颜色 */
const PALETTES = {
  default: [{ name: '原色', color: '#f4d3a8' }],
  dog: [{ name: '奶黄', color: '#f4d3a8' }, { name: '金黄', color: '#fbbf24' }, { name: '巧克力', color: '#92400e' }, { name: '雪白', color: '#f5f5f5' }],
  cat: [{ name: '奶白', color: '#f0f0f0' }, { name: '橘猫', color: '#f97316' }, { name: '灰猫', color: '#9ca3af' }, { name: '黑猫', color: '#3a2a1a' }],
  rabbit: [{ name: '雪白', color: '#f5f5f5' }, { name: '粉兔', color: '#fbcfe8' }, { name: '灰兔', color: '#9ca3af' }, { name: '棕兔', color: '#a78b5a' }],
  hamster: [{ name: '金黄', color: '#fbbf24' }, { name: '奶白', color: '#f5f5f5' }, { name: '花斑', color: '#d4a373' }],
  chick: [{ name: '嫩黄', color: '#fde047' }, { name: '橙黄', color: '#f97316' }],
  fox: [{ name: '火红', color: '#f97316' }, { name: '银白', color: '#f5f5f5' }],
  panda: [{ name: '经典', color: '#fff' }],
  penguin: [{ name: '经典', color: '#3a2a1a' }],
  dino: [{ name: '翠绿', color: '#22c55e' }, { name: '紫', color: '#a855f7' }, { name: '红', color: '#ef4444' }],
  unicorn: [{ name: '雪白', color: '#fff' }, { name: '粉', color: '#fbcfe8' }, { name: '蓝', color: '#bfdbfe' }, { name: '薄荷', color: '#bbf7d0' }],
  lion: [{ name: '金黄', color: '#fbbf24' }, { name: '棕', color: '#a78b5a' }],
  tiger: [{ name: '橙', color: '#f97316' }, { name: '白虎', color: '#f5f5f5' }],
  dragon: [{ name: '翠绿', color: '#22c55e' }, { name: '赤红', color: '#ef4444' }, { name: '玄青', color: '#1e3a8a' }, { name: '金黄', color: '#fbbf24' }],
  phoenix: [{ name: '烈焰', color: '#f97316' }, { name: '冰晶', color: '#3b82f6' }, { name: '紫焰', color: '#a855f7' }],
};

/**
 * 自然界动物宠物表。
 * - img: AI 生成图片路径（pets/*.png），白色/浅色中性底便于 CSS 染色
 * - attack: 攻击动作描述（战斗日志/动画用）
 * - motion: CSS 攻击动画类名（见 style.css）
 * - palette: 可染色色板（CSS filter）
 */
export const SPECIES_BY_RARITY = {
  common: [
    { species: '小狗', emoji: '🐶', img: 'pets/dog.png', attack: '扑咬', motion: 'lunge', palette: PALETTES.dog },
    { species: '小猫', emoji: '🐱', img: 'pets/cat.png', attack: '挥爪抓', motion: 'swipe', palette: PALETTES.cat },
    { species: '兔子', emoji: '🐰', img: 'pets/rabbit.png', attack: '后腿蹬', motion: 'kick', palette: PALETTES.rabbit },
    { species: '仓鼠', emoji: '🐹', img: 'pets/hamster.png', attack: '抱摔', motion: 'lunge', palette: PALETTES.hamster },
    { species: '小鸡', emoji: '🐤', img: 'pets/chick.png', attack: '啄击', motion: 'peck', palette: PALETTES.chick },
  ],
  rare: [
    { species: '小狐狸', emoji: '🦊', img: 'pets/fox.png', attack: '扑咬', motion: 'lunge', palette: PALETTES.fox },
    { species: '熊猫', emoji: '🐼', img: 'pets/panda.png', attack: '抱摔', motion: 'lunge', palette: PALETTES.panda },
    { species: '企鹅', emoji: '🐧', img: 'pets/penguin.png', attack: '嘴啄', motion: 'peck', palette: PALETTES.penguin },
    { species: '小恐龙', emoji: '🦖', img: 'pets/dino.png', attack: '甩尾', motion: 'swipe', palette: PALETTES.dino },
  ],
  epic: [
    { species: '独角兽', emoji: '🦄', img: 'pets/unicorn.png', attack: '独角顶', motion: 'lunge', palette: PALETTES.unicorn },
    { species: '小狮子', emoji: '🦁', img: 'pets/lion.png', attack: '扑咬', motion: 'lunge', palette: PALETTES.lion },
    { species: '老虎', emoji: '🐯', img: 'pets/tiger.png', attack: '挥爪抓', motion: 'swipe', palette: PALETTES.tiger },
  ],
  legendary: [
    { species: '神龙', emoji: '🐉', img: 'pets/dragon.png', attack: '吐息', motion: 'swipe', palette: PALETTES.dragon },
    { species: '凤凰', emoji: '🔥', img: 'pets/phoenix.png', attack: '烈焰冲撞', motion: 'lunge', palette: PALETTES.phoenix },
  ],
};

/** 按物种取完整动物定义（含 img/attack/motion/palette） */
export function findSpecies(speciesName) {
  for (const list of Object.values(SPECIES_BY_RARITY)) {
    const f = list.find(s => s.species === speciesName);
    if (f) return f;
  }
  return null;
}

export const SHOP_WEAPONS = [
  { id: 'w_wood', name: '木剑', emoji: '🗡️', atk: 4, price: 10, rarityReq: 'common' },
  { id: 'w_iron', name: '铁剑', emoji: '⚔️', atk: 8, price: 25, rarityReq: 'common' },
  { id: 'w_bow', name: '弩箭', emoji: '🏹', atk: 12, price: 45, rarityReq: 'rare' },
  { id: 'w_flame', name: '火焰杖', emoji: '🔥', atk: 18, price: 80, rarityReq: 'rare' },
  { id: 'w_thunder', name: '雷神锤', emoji: '⚡', atk: 26, price: 140, rarityReq: 'epic' },
  { id: 'w_dragon', name: '屠龙刀', emoji: '🐲', atk: 38, price: 240, rarityReq: 'legendary' },
];

export const SHOP_FOODS = [
  { id: 'f_apple', name: '苹果', emoji: '🍎', heal: 15, buff: null, price: 4 },
  { id: 'f_bread', name: '面包', emoji: '🍞', heal: 30, buff: null, price: 7 },
  { id: 'f_milk', name: '牛奶', emoji: '🥛', heal: 9999, buff: { def: 2 }, price: 12 },
  { id: 'f_meat', name: '烤肉', emoji: '🍖', heal: 40, buff: { atk: 3 }, price: 15 },
  { id: 'f_elixir', name: '神秘药剂', emoji: '🧪', heal: 0, buff: { revive: true }, price: 30 },
];

export const MONSTER_TIERS = [
  { tier: 1, streakMin: 0, name: '普通僵尸', emoji: '🧟', img: 'zombies/basic.png', hp: [40, 50], atk: [6, 8], def: [1, 3], drop: 0.30, reward: 5 },
  { tier: 2, streakMin: 2, name: '路障僵尸', emoji: '🧟', img: 'zombies/conehead.png', hp: [60, 75], atk: [9, 12], def: [3, 5], drop: 0.40, reward: 8 },
  { tier: 3, streakMin: 4, name: '撑杆僵尸', emoji: '🧟', img: 'zombies/pole.png', hp: [90, 110], atk: [13, 16], def: [5, 7], drop: 0.50, reward: 12 },
  { tier: 4, streakMin: 6, name: '铁桶僵尸', emoji: '🧟', img: 'zombies/buckethead.png', hp: [130, 160], atk: [17, 21], def: [7, 11], drop: 0.60, reward: 18 },
  { tier: 5, streakMin: 9, name: '橄榄球僵尸', emoji: '🧟', img: 'zombies/football.png', hp: [190, 230], atk: [22, 27], def: [10, 14], drop: 0.70, reward: 25 },
  { tier: 6, streakMin: 13, name: '读报僵尸', emoji: '🧟', img: 'zombies/newspaper.png', hp: [240, 290], atk: [26, 31], def: [12, 16], drop: 0.78, reward: 30 },
  { tier: 7, streakMin: 17, name: '舞王僵尸', emoji: '🧟', img: 'zombies/dancing.png', hp: [300, 360], atk: [32, 38], def: [14, 18], drop: 0.82, reward: 38 },
  { tier: 8, streakMin: 22, name: '巨人僵尸', emoji: '🧟', img: 'zombies/gargantuar.png', hp: [380, 460], atk: [40, 48], def: [17, 22], drop: 0.90, reward: 50 },
];

export const RARITY_NAME = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' };
export const RARITY_COLOR = { common: '#9ca3af', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' };

export const BATTLE_MIN_TASKS = 3;   // 学习模块完成数达此即可发起每日对决
export const STUDY_MIN_FOR_DUEL = 3; // 发起每日对决需完成的学习模块数（识字/英语/数学/开口 中至少3个）
export const EGG_HATCH_HOURS = 24;
export const DAILY_REGEN_RATIO = 0.1;

/* ============================================================
 * 间隔重复（SRS）参数
 * ========================================================== */

/**
 * 单字/单词的记忆状态。三档判定 → 下次出现间隔：
 *  - 熟练(good)   → interval ×2，稳定后逐步拉长
 *  - 一般(ok)     → 次日复习 + 1，逐步拉长
 *  - 不会(again)  → 次日必出现，interval 重置
 * 调度规则见 srs.js。
 */
export const SRS_GRADE = { GOOD: 'good', OK: 'ok', AGAIN: 'again' };

/** 学习打卡每日题量与组词规则 */
export const QUIZ_CONFIG = {
  chinese: { perDay: 10, reviewMin: 3, failMustReview: true },
  english: { perDay: 10, reviewMin: 2, failMustReview: true },
  math: { perDay: 10 },
};

/* ============================================================
 * 初始数据
 * ========================================================== */

export function buildTasks() {
  const tasks = [];
  for (const t of HABIT_TASKS) tasks.push({ ...t, category: 'habit', kind: 'check', active: true, custom: false });
  for (const t of STUDY_TASKS) tasks.push({ ...t, category: 'study', active: true, custom: false });
  for (const t of SPORT_TASKS) tasks.push({ ...t, category: 'sport', kind: 'check', active: true, custom: false });
  for (const t of LIFE_TASKS) tasks.push({ ...t, category: 'life', kind: 'check', active: true, custom: false });
  return tasks;
}

export function createInitialData() {
  const today = todayKey();
  return {
    version: 1,
    child: { name: '小宝', avatar: '🦊', createdAt: today },
    settings: {
      repo: '', branch: 'main', dataPath: 'data/userdata.json',
      token: '', autoSync: false, soundOn: true,
    },
    tasks: buildTasks(),
    // 打卡记录：每日 { taskId: { done, passRate?, grade?, score? } }
    checkins: {},
    wallet: { points: 0, totalEarned: 0 },
    pets: [
      {
        id: 'p_starter', species: '小狗', emoji: '🐶', rarity: 'common',
        hp: 50, atk: 10, def: 5, active: true, currentHp: 50,
        buffs: [], equippedWeapon: null, obtainedAt: today,
        colorIdx: 0, accessories: [], bgColor: '#fff8e7', sticker: null,
      },
    ],
    inventory: { weapons: [], foods: [], eggs: [] },
    shopItems: { weapons: SHOP_WEAPONS, foods: SHOP_FOODS },
    monsters: { today: null, history: [] },
    battles: [],
    stats: { streak: 0, bestStreak: 0, totalBattles: 0, totalWins: 0, noDropStreak: 0, totalCheckinDays: 0, totalSpeakWins: 0, maxPets: 1 },
    // 学习记忆状态：{ chinese: {字: {...}}, english: {word: {...}} }
    memory: { chinese: {}, english: {}, poem: {} },
    // 识字进度（当前书册/阶段索引）
    bookProgress: { chineseStageIdx: 0, poemStageIdx: 0 },
    // 图鉴：已解锁的宠物物种名 / 僵尸 tier
    pokedex: { pets: ['小狗'], monsters: [] },
    // 成就：已解锁 id 列表
    achievements: { unlocked: [], seen: [] },
    // 周日礼物：{ weekStart, tier, giftId, history: [{week, tier, giftId}] }
    weeklyGift: { history: [] },
    // 配饰库存（拥有的配饰 id）
    accessories: { owned: [], equipped: {} }, // equipped: petId -> [accId]
    meta: { lastSyncAt: null, lastSyncSha: null, localDirty: false },
  };
}

export function migrate(data) {
  if (!data || typeof data !== 'object') return null;
  if (!data.version) data.version = 1;
  if (!data.memory) data.memory = { chinese: {}, english: {} };
  if (!data.memory.poem) data.memory.poem = {};
  if (!data.bookProgress) data.bookProgress = { chineseStageIdx: 0, poemStageIdx: 0 };
  if (data.bookProgress && data.bookProgress.poemStageIdx === undefined) data.bookProgress.poemStageIdx = 0;
  if (!data.pokedex) data.pokedex = { pets: ['小狗'], monsters: [] };
  if (!data.achievements) data.achievements = { unlocked: [], seen: [] };
  if (!data.weeklyGift) data.weeklyGift = { history: [] };
  if (!data.accessories) data.accessories = { owned: [], equipped: {} };
  if (!data.stats) data.stats = {};
  if (!data.monsters) data.monsters = { today: null, history: [] };
  if (!data.battles) data.battles = [];
  if (!data.inventory) data.inventory = { weapons: [], foods: [], eggs: [] };
  // 始终用最新预设任务覆盖（保留自定义任务）
  const customTasks = (data.tasks || []).filter(t => t.custom);
  data.tasks = [...buildTasks(), ...customTasks];
  if (data.stats.totalSpeakWins === undefined) data.stats.totalSpeakWins = 0;
  if (data.stats.maxPets === undefined) data.stats.maxPets = (data.pets || []).length || 1;
  if (data.stats.streak === undefined) data.stats.streak = 0;
  if (data.stats.bestStreak === undefined) data.stats.bestStreak = 0;
  if (data.stats.totalBattles === undefined) data.stats.totalBattles = 0;
  if (data.stats.totalWins === undefined) data.stats.totalWins = 0;
  if (data.stats.noDropStreak === undefined) data.stats.noDropStreak = 0;
  if (data.stats.totalCheckinDays === undefined) data.stats.totalCheckinDays = Object.keys(data.checkins || {}).length;
  // 宠物新增字段
  for (const p of (data.pets || [])) {
    if (p.colorIdx === undefined) p.colorIdx = 0;
    if (!p.accessories) p.accessories = [];
    if (!p.bgColor) p.bgColor = '#fff8e7';
    if (p.sticker === undefined) p.sticker = null;
  }
  // 旧格式 checkins 转新格式
  if (data.checkins) {
    for (const day of Object.keys(data.checkins)) {
      const c = data.checkins[day];
      if (c && c.done && typeof c.done === 'object') {
        const oldDone = c.done; const earned = c.earned || 0; const newC = {};
        for (const taskId of Object.keys(oldDone)) {
          if (oldDone[taskId]) { const task = (data.tasks || []).find(t => t.id === taskId); newC[taskId] = { done: true, score: task ? task.points : 2 }; }
        }
        if (c.battleTriggered) newC.dailyDuel = { result: 'win', reward: 5 };
        data.checkins[day] = newC;
      }
    }
  }
  // 补偿积分
  if (data.wallet && !data.meta) data.meta = {};
  if (data.wallet && !data.meta.compensated && data.checkins && Object.keys(data.checkins).length > 0) {
    const days = Object.keys(data.checkins).length;
    if (days >= 1) { data.wallet.points = (data.wallet.points || 0) + days * 10; data.wallet.totalEarned = (data.wallet.totalEarned || 0) + days * 10; data.meta.compensated = true; }
  }
  // 修复 pokedex
  if (data.pokedex && data.pets) { for (const p of data.pets) { if (!data.pokedex.pets.includes(p.species)) data.pokedex.pets.push(p.species); } }
  return data;
}

/* ============================================================
 * 成就定义
 * ========================================================== */
export const ACHIEVEMENTS = [
  { id: 'checkin_3', name: '坚持初体验', desc: '连续打卡3天', icon: '🔥', check: s => s.stats.totalCheckinDays >= 3 },
  { id: 'checkin_7', name: '一周小达人', desc: '连续打卡7天', icon: '📅', check: s => s.stats.totalCheckinDays >= 7 },
  { id: 'checkin_30', name: '习惯养成家', desc: '累计打卡30天', icon: '🏅', check: s => s.stats.totalCheckinDays >= 30 },
  { id: 'win_10', name: '怪兽克星', desc: '击败10只怪兽', icon: '⚔️', check: s => s.stats.totalWins >= 10 },
  { id: 'win_50', name: '怪兽终结者', desc: '击败50只怪兽', icon: '🏆', check: s => s.stats.totalWins >= 50 },
  { id: 'pets_5', name: '小小饲养员', desc: '拥有5只宠物', icon: '🐾', check: s => (s.pets || []).length >= 5 },
  { id: 'pets_10', name: '动物园园长', desc: '拥有10只宠物', icon: '🦁', check: s => (s.pets || []).length >= 10 },
  { id: 'streak_5', name: '连胜5场', desc: '每日对决连胜5场', icon: '⚡', check: s => s.stats.bestStreak >= 5 },
  { id: 'speak_20', name: '开口小达人', desc: '开口打卡成功20次', icon: '🗣️', check: s => s.stats.totalSpeakWins >= 20 },
  { id: 'rarity_legend', name: '传说降临', desc: '拥有一只传说宠物', icon: '🌟', check: s => (s.pets || []).some(p => p.rarity === 'legendary') },
  { id: 'gift_4', name: '有车一族', desc: '获得汽车级周日礼物', icon: '🚗', check: s => (s.weeklyGift?.history || []).some(g => g.tier >= 4) },
];

/* ============================================================
 * 周日礼物等级表（按本周每日对决胜负数定级）
 * tier = 本周胜利数 + 1（封顶8）；失败多也至少给自行车
 * 含带真实车标的汽车（AI 生图）
 * ========================================================== */
export const WEEKLY_GIFTS = [
  { tier: 1, name: '自行车', emoji: '🚲', img: 'gifts/bicycle.png', minWins: 0 },
  { tier: 2, name: '滑板车', emoji: '🛴', img: 'gifts/scooter.png', minWins: 1 },
  { tier: 3, name: '电动车', emoji: '🛵', img: 'gifts/ebike.png', minWins: 2 },
  { tier: 4, name: '大众小汽车', emoji: '🚗', img: 'gifts/vw.png', minWins: 3, brand: '大众' },
  { tier: 5, name: '丰田汽车', emoji: '🚙', img: 'gifts/toyota.png', minWins: 4, brand: '丰田' },
  { tier: 6, name: '宝马跑车', emoji: '🏎️', img: 'gifts/bmw.png', minWins: 5, brand: '宝马' },
  { tier: 7, name: '直升机', emoji: '🚁', img: 'gifts/helicopter.png', minWins: 7 },
  { tier: 8, name: '航空母舰', emoji: '🛳️', img: 'gifts/carrier.png', minWins: 9 },
];

/** 按本周胜利数取礼物等级 */
export function giftTierForWins(wins) {
  let g = WEEKLY_GIFTS[0];
  for (const w of WEEKLY_GIFTS) {
    if (wins >= w.minWins) g = w;
  }
  return g;
}
