// db.js — 默认数据、商店物品表、宠物物种表、词库常量、初始数据构造

import { todayKey } from './utils.js';
import { CHINESE_STAGES, ALL_ENGLISH_WORDS } from './vocab-data.js';

/* ============================================================
 * 任务类型与分类
 * ========================================================== */

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

/** 习惯养成 9 项（用户指定固定项） */
const HABIT_TASKS = [
  { id: 'h_wake', title: '按时起床', icon: '⏰', points: 2 },
  { id: 'h_sleep', title: '按时睡觉', icon: '🌙', points: 2 },
  { id: 'h_brush', title: '好好刷牙', icon: '🪥', points: 1 },
  { id: 'h_face', title: '好好洗脸', icon: '🧴', points: 1 },
  { id: 'h_dress', title: '自己穿衣服', icon: '👕', points: 1 },
  { id: 'h_notlate', title: '上学不迟到', icon: '🎒', points: 2 },
  { id: 'h_temper', title: '不发脾气', icon: '😌', points: 2 },
  { id: 'h_poop', title: '按时拉屎', icon: '💩', points: 2 },
  { id: 'h_toiletlid', title: '冲马桶盖盖子', icon: '🚽', points: 1 },
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
  { id: 'l_sweep', title: '扫地', icon: '🧹', points: 2 },
  { id: 'l_wipe', title: '擦桌子', icon: '🧽', points: 2 },
];

/** 学习打卡 8 个互动模块 */
const STUDY_TASKS = [
  { id: 'q_chinese', title: '识字打卡', icon: '字', points: 8, kind: 'quiz', quizType: 'chinese', dailyCount: 10, passRate: 0.8 },
  { id: 'q_english', title: '英语打卡', icon: 'ABC', points: 8, kind: 'quiz', quizType: 'english', dailyCount: 10, passRate: 0.8 },
  { id: 'q_math', title: '数学打卡', icon: '➕', points: 6, kind: 'quiz', quizType: 'math', dailyCount: 10, passRate: 0.8 },
  { id: 'q_brain', title: '大脑开发', icon: '', points: 8, kind: 'quiz', quizType: 'brain', dailyCount: 10, passRate: 0.8 },
  { id: 'q_poem', title: '古诗打卡', icon: '📜', points: 8, kind: 'quiz', quizType: 'poem', dailyCount: 1, passRate: 0.8 },
  { id: 'q_speak', title: '英语开口', icon: '🗣️', points: 10, kind: 'battle', quizType: 'speak', dailyCount: 10, passRate: 1 },
  { id: 'q_idiom', title: '成语园地', icon: '🏛️', points: 8, kind: 'quiz', quizType: 'idiom', dailyCount: 1, passRate: 1 },
  { id: 'q_xiehouyu', title: '短文阅读', icon: '📖', points: 8, kind: 'quiz', quizType: 'xiehouyu', dailyCount: 1, passRate: 1 },
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
 * 自然界动物宠物表 — 仅保留小狗
 */
export const SPECIES_BY_RARITY = {
  common: [
    { species: '小狗', emoji: '🐶', img: 'pets/dog.png', attack: '扑咬', motion: 'lunge', palette: PALETTES.dog },
  ],
  rare: [],
  epic: [],
  legendary: [],
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
  { id: 'w_grenade', name: '手榴弹', emoji: '💣', atk: 16, price: 60, rarityReq: 'rare' },
  { id: 'w_flame', name: '火焰杖', emoji: '🔥', atk: 18, price: 80, rarityReq: 'rare' },
  { id: 'w_smg', name: '冲锋枪', emoji: '🔫', atk: 22, price: 110, rarityReq: 'epic' },
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
  { tier: 1, streakMin: 0, name: '小野狼', emoji: '🐺', img: 'zombies/basic.png', hp: [40, 50], atk: [6, 8], def: [1, 3], drop: 0.30, reward: 5 },
  { tier: 2, streakMin: 2, name: '大棕熊', emoji: '🐻', img: 'zombies/conehead.png', hp: [60, 75], atk: [9, 12], def: [3, 5], drop: 0.40, reward: 8 },
  { tier: 3, streakMin: 4, name: '剑齿虎', emoji: '🐅', img: 'zombies/pole.png', hp: [90, 110], atk: [13, 16], def: [5, 7], drop: 0.50, reward: 12 },
  { tier: 4, streakMin: 6, name: '猛犸象', emoji: '🦣', img: 'zombies/buckethead.png', hp: [130, 160], atk: [17, 21], def: [7, 11], drop: 0.60, reward: 18 },
  { tier: 5, streakMin: 9, name: '霸王龙', emoji: '🦖', img: 'zombies/football.png', hp: [190, 230], atk: [22, 27], def: [10, 14], drop: 0.70, reward: 25 },
  { tier: 6, streakMin: 13, name: '三角龙', emoji: '🦕', img: 'zombies/newspaper.png', hp: [240, 290], atk: [26, 31], def: [12, 16], drop: 0.78, reward: 30 },
  { tier: 7, streakMin: 17, name: '翼龙', emoji: '🦅', img: 'zombies/dancing.png', hp: [300, 360], atk: [32, 38], def: [14, 18], drop: 0.82, reward: 38 },
  { tier: 8, streakMin: 22, name: '远古巨兽', emoji: '🐉', img: 'zombies/gargantuar.png', hp: [380, 460], atk: [40, 48], def: [17, 22], drop: 0.90, reward: 50 },
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

  // 预设第一天的进度（跳过第一天，从第二天开始）
  const memory = { chinese: {}, english: {}, poem: {}, idiom: {}, xiehouyu: {} };

  // 识字：第一阶段的字标记为熟练（跳过第一天）
  if (CHINESE_STAGES && CHINESE_STAGES[0]) {
    const due = new Date(today + 'T00:00:00');
    due.setDate(due.getDate() + 7);
    const dueStr = `${due.getFullYear()}-${String(due.getMonth()+1).padStart(2,'0')}-${String(due.getDate()).padStart(2,'0')}`;
    for (const ch of CHINESE_STAGES[0]) {
      memory.chinese[ch] = { box: 3, interval: 7, due: dueStr, lastGrade: 'good', lastSeen: today, seenCount: 1 };
    }
  }

  // 英语：前9个单词标记为熟练（跳过第一天）
  if (ALL_ENGLISH_WORDS && ALL_ENGLISH_WORDS.length > 0) {
    const due = new Date(today + 'T00:00:00');
    due.setDate(due.getDate() + 7);
    const dueStr = `${due.getFullYear()}-${String(due.getMonth()+1).padStart(2,'0')}-${String(due.getDate()).padStart(2,'0')}`;
    const first9 = ALL_ENGLISH_WORDS.slice(0, 9).map(w => w.word);
    for (const word of first9) {
      memory.english[word] = { box: 3, interval: 7, due: dueStr, lastGrade: 'good', lastSeen: today, seenCount: 1 };
    }
  }

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
    wallet: { points: 20, totalEarned: 20 },
    pets: [
      {
        id: 'p_starter', species: '小狗', emoji: '🐶', rarity: 'common',
        hp: 50, atk: 10, def: 5, active: true, currentHp: 50,
        buffs: [], equippedWeapon: 'w_wood', obtainedAt: today,
        colorIdx: 0, accessories: [], bgColor: '#fff8e7', sticker: null,
        mood: 'happy', feedCount: 0, growthStage: 'baby',
      },
    ],
    inventory: { weapons: [], foods: [{ id: 'f_bread', qty: 3 }, { id: 'f_apple', qty: 5 }], eggs: [] },
    shopItems: { weapons: SHOP_WEAPONS, foods: SHOP_FOODS },
    monsters: { today: null, history: [] },
    battles: [],
    stats: { streak: 0, bestStreak: 0, totalBattles: 0, totalWins: 0, noDropStreak: 0, totalCheckinDays: 0, totalSpeakWins: 0, maxPets: 1 },
    // 学习记忆状态：{ chinese: {字: {...}}, english: {word: {...}} }
    memory,
    // 识字进度（当前书册/阶段索引）— 跳过第一天，从第二阶段开始
    bookProgress: { chineseStageIdx: 1, poemStageIdx: 0 },
    // 图鉴：已解锁的宠物物种名 / 怪物 tier
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
  if (!data.memory.idiom) data.memory.idiom = {};
  if (!data.memory.xiehouyu) data.memory.xiehouyu = {};
  if (!data.bookProgress) data.bookProgress = { chineseStageIdx: 0, poemStageIdx: 0 };
  if (data.bookProgress && data.bookProgress.poemStageIdx === undefined) data.bookProgress.poemStageIdx = 0;

  // 跳过第一天：如果用户没有学习记录，预设第一天的进度
  const today = todayKey();
  const hasChineseLearned = data.memory && data.memory.chinese && Object.keys(data.memory.chinese).length > 0;
  const hasEnglishLearned = data.memory && data.memory.english && Object.keys(data.memory.english).length > 0;

  if (!hasChineseLearned && CHINESE_STAGES && CHINESE_STAGES[0]) {
    const due = new Date(today + 'T00:00:00');
    due.setDate(due.getDate() + 7);
    const dueStr = `${due.getFullYear()}-${String(due.getMonth()+1).padStart(2,'0')}-${String(due.getDate()).padStart(2,'0')}`;
    for (const ch of CHINESE_STAGES[0]) {
      data.memory.chinese[ch] = { box: 3, interval: 7, due: dueStr, lastGrade: 'good', lastSeen: today, seenCount: 1 };
    }
    // 将识字进度更新为第二阶段
    data.bookProgress.chineseStageIdx = 1;
  }

  if (!hasEnglishLearned && ALL_ENGLISH_WORDS && ALL_ENGLISH_WORDS.length > 0) {
    const due = new Date(today + 'T00:00:00');
    due.setDate(due.getDate() + 7);
    const dueStr = `${due.getFullYear()}-${String(due.getMonth()+1).padStart(2,'0')}-${String(due.getDate()).padStart(2,'0')}`;
    const first9 = ALL_ENGLISH_WORDS.slice(0, 9).map(w => w.word);
    for (const word of first9) {
      data.memory.english[word] = { box: 3, interval: 7, due: dueStr, lastGrade: 'good', lastSeen: today, seenCount: 1 };
    }
  }

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
  // 始终重新计算累计打卡天数（成就解锁依赖此值）
  data.stats.totalCheckinDays = Object.keys(data.checkins || {}).length;
  // 宠物新增字段
  for (const p of (data.pets || [])) {
    if (p.colorIdx === undefined) p.colorIdx = 0;
    if (!p.accessories) p.accessories = [];
    if (!p.bgColor) p.bgColor = '#fff8e7';
    if (p.sticker === undefined) p.sticker = null;
    if (p.mood === undefined) p.mood = 'happy';
    if (p.feedCount === undefined) p.feedCount = 0;
    if (p.growthStage === undefined) p.growthStage = 'mature';
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

  // 数据修复：添加决斗记录、怪物图鉴、刷新怪物（2026-08-06）
  if (!data.meta) data.meta = {};
  if (!data.meta.dataFix_20260806) {
    // 前天（周二）和昨天（周三）的决斗记录，今天（周四）还没有打卡
    const duelDates = [
      { date: '2026-08-04', turns: 6 },
      { date: '2026-08-05', turns: 5 },
    ];

    if (!data.battles) data.battles = [];

    let addedCount = 0;
    for (const d of duelDates) {
      if (!data.battles.some(b => b.date === d.date)) {
        data.battles.push({
          id: 'b_fix_' + d.date.replace(/-/g, ''),
          date: d.date,
          petId: (data.pets && data.pets[0]) ? data.pets[0].id : 'p_starter',
          monsterId: 'm_' + d.date + '_456',
          result: 'win',
          turns: d.turns,
          dropEgg: false,
          earnedPoints: 5
        });
        addedCount++;
      }
    }

    // 更新 stats（前天和昨天共2场胜利，连胜=2）
    if (!data.stats) data.stats = {};
    data.stats.totalBattles = (data.stats.totalBattles || 0) + addedCount;
    data.stats.totalWins = (data.stats.totalWins || 0) + addedCount;
    data.stats.streak = (data.stats.streak || 0) + addedCount;
    if ((data.stats.bestStreak || 0) < data.stats.streak) {
      data.stats.bestStreak = data.stats.streak;
    }

    // 添加小野狼到怪物图鉴
    if (!data.pokedex) data.pokedex = { pets: ['小狗'], monsters: [] };
    if (!data.pokedex.monsters) data.pokedex.monsters = [];
    if (!data.pokedex.monsters.includes(1)) data.pokedex.monsters.push(1);

    // 刷新今天的怪物（连胜2 → tier 2 大棕熊）
    const todayStr = todayKey();
    if (!data.monsters) data.monsters = { today: null, history: [] };
    data.monsters.today = {
      id: 'm_' + todayStr + '_789',
      date: todayStr,
      tier: 2,
      name: '大棕熊',
      emoji: '🐻',
      hp: 65, atk: 10, def: 4, maxHp: 65
    };

    data.meta.dataFix_20260806 = true;
  }

  // ============================================================
  // v32 数据修复：自动修复被重置的数据（2026-08-08）
  // ============================================================
  if (!data.meta.dataFix_20260808) {
    // 检测数据是否被重置为初始值（20元、无武器、面包x3、苹果x5、无决斗、无打卡）
    const isReset =
      data.wallet && data.wallet.points === 20 &&
      data.wallet.totalEarned === 20 &&
      data.inventory &&
      data.inventory.weapons.length === 0 &&
      data.inventory.foods.length === 2 &&
      data.inventory.foods[0].id === 'f_bread' &&
      data.inventory.foods[0].qty === 3 &&
      data.inventory.foods[1].id === 'f_apple' &&
      data.inventory.foods[1].qty === 5 &&
      (!data.battles || data.battles.length === 0) &&
      (!data.checkins || Object.keys(data.checkins).length === 0);

    if (isReset) {
      // 修复钱包余额（3元）
      data.wallet.points = 3;

      // 修复库存（弩箭、木剑、苹果、牛奶）
      data.inventory = {
        weapons: [
          { id: 'w_bow', name: '弩箭', emoji: '🏹', atk: 12 },
          { id: 'w_wood', name: '木剑', emoji: '🗡️', atk: 4 }
        ],
        foods: [
          { id: 'f_apple', name: '苹果', emoji: '🍎', qty: 5 },
          { id: 'f_milk', name: '牛奶', emoji: '🥛', qty: 1 }
        ],
        eggs: []
      };

      // 添加打卡记录（周一至周四）
      data.checkins = {};
      ['2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07'].forEach(date => {
        data.checkins[date] = {};
      });

      // 添加决斗记录（周一至周四全部胜利）
      data.battles = [
        { id: 'b_fix_20260804', date: '2026-08-04', petId: 'p_starter', monsterId: 'm_20260804_456', result: 'win', turns: 6, dropEgg: false, earnedPoints: 5 },
        { id: 'b_fix_20260805', date: '2026-08-05', petId: 'p_starter', monsterId: 'm_20260805_457', result: 'win', turns: 5, dropEgg: false, earnedPoints: 5 },
        { id: 'b_fix_20260806', date: '2026-08-06', petId: 'p_starter', monsterId: 'm_20260806_458', result: 'win', turns: 7, dropEgg: false, earnedPoints: 5 },
        { id: 'b_fix_20260807', date: '2026-08-07', petId: 'p_starter', monsterId: 'm_20260807_459', result: 'win', turns: 6, dropEgg: false, earnedPoints: 5 }
      ];

      // 修复统计数据
      data.stats = data.stats || {};
      data.stats.totalCheckinDays = 4;
      data.stats.streak = 4;
      data.stats.bestStreak = Math.max(data.stats.bestStreak || 0, 4);
      data.stats.totalBattles = 4;
      data.stats.totalWins = 4;
      data.stats.noDropStreak = 0;

      // 修复怪物图鉴
      data.pokedex = data.pokedex || { pets: ['小狗'], monsters: [] };
      data.pokedex.monsters = data.pokedex.monsters || [];
      [1, 2, 3].forEach(tier => {
        if (!data.pokedex.monsters.includes(tier)) data.pokedex.monsters.push(tier);
      });

      // 刷新今天的怪兽
      const todayStr = todayKey();
      data.monsters = data.monsters || { today: null, history: [] };
      data.monsters.today = {
        id: 'm_' + todayStr + '_789',
        date: todayStr,
        tier: 4,
        name: '猛犸象',
        emoji: '🦣',
        hp: 145, atk: 19, def: 9, maxHp: 145
      };

      // 修复成就
      data.achievements = data.achievements || { unlocked: [], seen: [] };
      if (!data.achievements.unlocked.includes('checkin_3')) {
        data.achievements.unlocked.push('checkin_3');
      }
    }

    data.meta.dataFix_20260808 = true;
  }

  // ============================================================
  // v33 数据修复：确保当前怪物 tier 在图鉴中 + 新任务自动补齐（2026-08-10）
  // ============================================================
  if (!data.meta.dataFix_20260810) {
    // 如果今天有怪物，确保其 tier 在图鉴中（遇到即解锁）
    if (data.monsters && data.monsters.today) {
      const tier = data.monsters.today.tier;
      if (tier && !data.pokedex.monsters.includes(tier)) {
        data.pokedex.monsters.push(tier);
      }
    }
    // 补充缺失的新任务（扫地/擦桌子/按时拉屎等）
    const currentIds = (data.tasks || []).map(t => t.id);
    const newTasks = buildTasks().filter(t => !currentIds.includes(t.id));
    if (newTasks.length > 0) {
      data.tasks = [...(data.tasks || []), ...newTasks];
    }
    data.meta.dataFix_20260810 = true;
  }

  // ============================================================
  // v34 数据修复：补充周一至周三打卡+决斗 + 刷新怪物为剑齿虎 + 点亮徽章（2026-08-13）
  // ============================================================
  if (!data.meta.dataFix_20260813) {
    // 1. 补充周一至周三（08-10、08-11、08-12）的打卡记录
    if (!data.checkins) data.checkins = {};
    const fillDates = ['2026-08-10', '2026-08-11', '2026-08-12'];
    for (const d of fillDates) {
      if (!data.checkins[d]) {
        data.checkins[d] = {};
      }
    }

    // 2. 补充周一至周三的决斗记录（全部胜利）
    if (!data.battles) data.battles = [];
    const duelDates = [
      { date: '2026-08-10', turns: 6 },
      { date: '2026-08-11', turns: 5 },
      { date: '2026-08-12', turns: 7 },
    ];
    let addedDuels = 0;
    for (const d of duelDates) {
      if (!data.battles.some(b => b.date === d.date)) {
        data.battles.push({
          id: 'b_fix_' + d.date.replace(/-/g, ''),
          date: d.date,
          petId: (data.pets && data.pets[0]) ? data.pets[0].id : 'p_starter',
          monsterId: 'm_' + d.date + '_456',
          result: 'win',
          turns: d.turns,
          dropEgg: false,
          earnedPoints: 5,
        });
        addedDuels++;
      }
    }
    // 更新统计：连胜设为5（今天遇到剑齿虎 tier 3）
    if (!data.stats) data.stats = {};
    data.stats.totalBattles = (data.stats.totalBattles || 0) + addedDuels;
    data.stats.totalWins = (data.stats.totalWins || 0) + addedDuels;
    data.stats.streak = 5; // 强制设为5 → tier 3 剑齿虎
    if ((data.stats.bestStreak || 0) < data.stats.streak) {
      data.stats.bestStreak = data.stats.streak;
    }
    // 重新计算累计打卡天数
    data.stats.totalCheckinDays = Object.keys(data.checkins).length;

    // 3. 刷新今天的怪物（按更新后的连胜取 tier → 剑齿虎）
    const todayStr = todayKey();
    if (!data.monsters) data.monsters = { today: null, history: [] };
    const streak = (data.stats && data.stats.streak) || 0;
    let tierCfg = MONSTER_TIERS[0];
    for (const t of MONSTER_TIERS) { if (streak >= t.streakMin) tierCfg = t; }
    const hp = Math.floor(Math.random() * (tierCfg.hp[1] - tierCfg.hp[0] + 1)) + tierCfg.hp[0];
    const atk = Math.floor(Math.random() * (tierCfg.atk[1] - tierCfg.atk[0] + 1)) + tierCfg.atk[0];
    const def = Math.floor(Math.random() * (tierCfg.def[1] - tierCfg.def[0] + 1)) + tierCfg.def[0];
    data.monsters.today = {
      id: 'm_' + todayStr + '_' + Math.floor(Math.random() * 900 + 100),
      date: todayStr,
      tier: tierCfg.tier,
      name: tierCfg.name,
      emoji: tierCfg.emoji,
      hp, atk, def, maxHp: hp,
    };

    // 4. 确保狼(1)、棕熊(2)、剑齿虎(3)都在怪物图鉴里
    if (!data.pokedex) data.pokedex = { pets: ['小狗'], monsters: [] };
    if (!data.pokedex.monsters) data.pokedex.monsters = [];
    for (let t = 1; t <= 3; t++) {
      if (!data.pokedex.monsters.includes(t)) data.pokedex.monsters.push(t);
    }

    // 5. 点亮一个徽章（连胜5场 → streak_5）
    if (!data.achievements) data.achievements = { unlocked: [], seen: [] };
    if (!data.achievements.unlocked.includes('streak_5') && (data.stats.bestStreak || 0) >= 5) {
      data.achievements.unlocked.push('streak_5');
    }
    // 如果连胜还不到5，至少点亮"坚持初体验"（3天打卡）
    if (!data.achievements.unlocked.includes('checkin_3') && data.stats.totalCheckinDays >= 3) {
      data.achievements.unlocked.push('checkin_3');
    }

    data.meta.dataFix_20260813 = true;
  }

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
