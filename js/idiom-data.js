// idiom-data.js — 成语数据 + 歇后语数据
// 精选适合儿童的常见成语与歇后语，配emoji图解

/* ============================================================
 * 成语库
 * ========================================================== */
export const IDIOMS = [
  {
    id: 'idy001',
    text: '画蛇添足',
    pinyin: 'huà shé tiān zú',
    emoji: '🐍',
    meaning: '画蛇的时候给蛇添上了脚。比喻做了多余的事，不但无益，反而不合适。',
    example: '这幅画已经很完美了，再改就是画蛇添足了。',
  },
  {
    id: 'idy002',
    text: '守株待兔',
    pinyin: 'shǒu zhū dài tù',
    emoji: '🌳🐰',
    meaning: '守着树桩等待撞上来的兔子。比喻不主动努力，而存侥幸心理，希望得到意外收获。',
    example: '学习不能守株待兔，要主动努力才行。',
  },
  {
    id: 'idy003',
    text: '亡羊补牢',
    pinyin: 'wáng yáng bǔ láo',
    emoji: '🐑🔧',
    meaning: '羊丢了再去修补羊圈。比喻出了问题以后及时补救，还不算晚。',
    example: '这次考试没考好没关系，亡羊补牢，下次努力。',
  },
  {
    id: 'idy004',
    text: '掩耳盗铃',
    pinyin: 'yǎn ěr dào líng',
    emoji: '🙉🔔',
    meaning: '捂着耳朵去偷铃铛，以为别人听不见。比喻自己欺骗自己。',
    example: '做错事不承认，就像掩耳盗铃，骗不了别人。',
  },
  {
    id: 'idy005',
    text: '拔苗助长',
    pinyin: 'bá miáo zhù zhǎng',
    emoji: '🌱📏',
    meaning: '把禾苗拔高想让它长得快些。比喻急于求成，反而把事情弄糟。',
    example: '学习要循序渐进，不能拔苗助长。',
  },
  {
    id: 'idy006',
    text: '狐假虎威',
    pinyin: 'hú jiǎ hǔ wēi',
    emoji: '🦊',
    meaning: '狐狸假借老虎的威风。比喻借助别人的势力来欺压人。',
    example: '他总是仗着哥哥的名气狐假虎威，其实自己没什么本事。',
  },
  {
    id: 'idy007',
    text: '井底之蛙',
    pinyin: 'jǐng dǐ zhī wā',
    emoji: '🐸',
    meaning: '住在井底的青蛙，只能看到井口那么大一块天。比喻见识短浅的人。',
    example: '多出去走走看看，不要做井底之蛙。',
  },
  {
    id: 'idy008',
    text: '对牛弹琴',
    pinyin: 'duì niú tán qín',
    emoji: '🐮🎹',
    meaning: '对着牛弹琴。比喻对不懂道理的人讲道理，或者说话不看对象。',
    example: '跟他讲这些深奥的道理，简直就是对牛弹琴。',
  },
  {
    id: 'idy009',
    text: '自相矛盾',
    pinyin: 'zì xiāng máo dùn',
    emoji: '🛡️️',
    meaning: '用自己的矛刺自己的盾。比喻言行不一致，自己打自己的嘴。',
    example: '你刚才说的话自相矛盾，到底是上还是下？',
  },
  {
    id: 'idy010',
    text: '叶公好龙',
    pinyin: 'yè gōng hào lóng',
    emoji: '🐲',
    meaning: '叶公平时非常喜欢龙，真龙来了却吓跑了。比喻表面上爱好某事物，实际上并不真正爱好。',
    example: '他口口声声说要学钢琴，却不肯练习，真是叶公好龙。',
  },
  {
    id: 'idy011',
    text: '刻舟求剑',
    pinyin: 'kè zhōu qiú jiàn',
    emoji: '🛶️',
    meaning: '在船上刻记号找掉下去的剑。比喻不知道灵活变通，死守教条。',
    example: '时代在变，解决问题的方法也要变，不能刻舟求剑。',
  },
  {
    id: 'idy012',
    text: '杯弓蛇影',
    pinyin: 'bēi gōng shé yǐng',
    emoji: '🍷',
    meaning: '把酒杯里弓的倒影误看成蛇。比喻疑神疑鬼，自己吓自己。',
    example: '别杯弓蛇影了，那只是一只普通的虫子。',
  },
  {
    id: 'idy013',
    text: '买椟还珠',
    pinyin: 'mǎi dú huán zhū',
    emoji: '📦💎',
    meaning: '买了装珍珠的匣子，却把珍珠还回去了。比喻取舍不当，丢了重要的，留下次要的。',
    example: '你只看重包装不看重内容，简直是买椟还珠。',
  },
  {
    id: 'idy014',
    text: '胸有成竹',
    pinyin: 'xiōng yǒu chéng zhú',
    emoji: '🎋',
    meaning: '心里早就有了完整的竹子形象。比喻做事之前心中已有计划。',
    example: '他对这次演讲胸有成竹，因为准备得很充分。',
  },
  {
    id: 'idy015',
    text: '画龙点睛',
    pinyin: 'huà lóng diǎn jīng',
    emoji: '🐲👁️',
    meaning: '画龙时最后点上眼睛，龙就活了。比喻在关键处点明实质，使内容更生动。',
    example: '最后这句话真是画龙点睛，让整篇文章都活了起来。',
  },
  {
    id: 'idy016',
    text: '望梅止渴',
    pinyin: 'wàng méi zhǐ kě',
    emoji: '🍑💧',
    meaning: '看到梅子就解渴了。比喻用空想或愿望来安慰自己。',
    example: '没有水的时候只能望梅止渴，想想美好的事。',
  },
  {
    id: 'idy017',
    text: '滥竽充数',
    pinyin: 'làn yú chōng shù',
    emoji: '🎵',
    meaning: '不会吹竽却混在乐队里充数。比喻没有真才实学，混在行家里面充数。',
    example: '他在队里滥竽充数，其实根本不懂音乐。',
  },
  {
    id: 'idy018',
    text: '南辕北辙',
    pinyin: 'nán yuán běi zhé',
    emoji: '🚗',
    meaning: '车要去南方却往北走。比喻行动和目的正好相反。',
    example: '你不努力学习却想考第一，这不是南辕北辙吗？',
  },
];

/* ============================================================
 * 歇后语库
 * ========================================================== */
export const XIEHOUYUS = [
  {
    id: 'xhy001',
    first: '芝麻开花',
    second: '节节高',
    emoji: '🌱',
    meaning: '芝麻的花是从下往上开的，一节比一节高。比喻生活或工作越来越好，不断进步。',
  },
  {
    id: 'xhy002',
    first: '竹篮打水',
    second: '一场空',
    emoji: '🧺',
    meaning: '用竹篮子打水，水会漏光。比喻白费力气，没有收获。',
  },
  {
    id: 'xhy003',
    first: '十五个吊桶打水',
    second: '七上八下',
    emoji: '🪣',
    meaning: '十五个吊桶在井里上下打水，七个上来八个下去。形容心神不定，忐忑不安。',
  },
  {
    id: 'xhy004',
    first: '八仙过海',
    second: '各显神通',
    emoji: '🌊',
    meaning: '八个神仙过大海，每个人都施展自己的本领。比喻各自发挥自己的才能。',
  },
  {
    id: 'xhy005',
    first: '泥菩萨过河',
    second: '自身难保',
    emoji: '🧘',
    meaning: '泥做的菩萨过河会被水冲化。比喻自己都顾不上了，顾不上别人。',
  },
  {
    id: 'xhy006',
    first: '王婆卖瓜',
    second: '自卖自夸',
    emoji: '🍉',
    meaning: '王婆卖自己的瓜，自己夸自己的瓜好。比喻自己夸赞自己。',
  },
  {
    id: 'xhy007',
    first: '狗拿耗子',
    second: '多管闲事',
    emoji: '🐕🐁',
    meaning: '狗去抓老鼠。比喻管了不该管的事，越俎代庖。',
  },
  {
    id: 'xhy008',
    first: '骑驴看唱本',
    second: '走着瞧',
    emoji: '🐴📖',
    meaning: '骑在驴上看唱本，只能边走边看。比喻等着看结果，事情还没完。',
  },
  {
    id: 'xhy009',
    first: '小葱拌豆腐',
    second: '一清二白',
    emoji: '🌱',
    meaning: '小葱是青的，豆腐是白的。比喻清清楚楚，明明白白。',
  },
  {
    id: 'xhy010',
    first: '打破砂锅',
    second: '问到底',
    emoji: '🍲',
    meaning: '砂锅打破裂纹直通到底。比喻追根究底，问个水落石出。',
  },
  {
    id: 'xhy011',
    first: '黄鼠狼给鸡拜年',
    second: '没安好心',
    emoji: '🐔',
    meaning: '黄鼠狼给鸡拜年，不安好心。比喻表面热情，实际不怀好意。',
  },
  {
    id: 'xhy012',
    first: '外甥打灯笼',
    second: '照旧（舅）',
    emoji: '🏮',
    meaning: '外甥给舅舅打灯笼，照亮舅舅（照旧）。比喻还是老样子，没有变化。',
  },
];

/** 获取本周的成语（基于周数，每周3个） */
export function getWeeklyIdioms() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
  const weekNum = Math.floor(days / 7);
  const startIdx = (weekNum * 3) % IDIOMS.length;
  return [
    IDIOMS[startIdx],
    IDIOMS[(startIdx + 1) % IDIOMS.length],
    IDIOMS[(startIdx + 2) % IDIOMS.length],
  ];
}

/** 获取本周的歇后语（基于周数，每周2句） */
export function getWeeklyXiehouyus() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
  const weekNum = Math.floor(days / 7);
  const startIdx = (weekNum * 2) % XIEHOUYUS.length;
  return [
    XIEHOUYUS[startIdx],
    XIEHOUYUS[(startIdx + 1) % XIEHOUYUS.length],
  ];
}
