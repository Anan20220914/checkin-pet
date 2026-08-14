// views/quiz-brain.js — 大脑开发打卡（思维逻辑启蒙，10题，≥80%通过）
// 题型：找不同、找规律(形状序列)、分类、数、大小比较、配对 + 53道结构化题库
// 新旧题库各50%概率出现

import { getState } from '../store.js';
import { submitQuiz } from '../tasks.js';
import { showOverlay, closeOverlay, switchTab, celebrate } from '../app.js';
import { esc, shuffle, randInt } from '../utils.js';

let state = null; // { task, problems, idx, answers: [] }

/* ===== 结构化题库（来自Excel导入 + 补充，48道） ===== */
const BRAIN_QUESTIONS = [
  // 图形规律与推理 G1-G5, G11-G15
  { id:'G1', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：🔴 🔵 🔴 🔵 🔴 ？', optA:'🔴 红色圆形', optB:'🔵 蓝色圆形', optC:'🟡 黄色圆形', answer:'B', interaction:'点击1个选项', time:20, hint:'看看颜色是不是轮流出现？' },
  { id:'G2', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：🟥 🟨 🟥 🟨 🟥 ？', optA:'🟥 红色方块', optB:'🟨 黄色方块', optC:'🟩 绿色方块', answer:'B', interaction:'点击1个选项', time:20, hint:'方块颜色在轮流变化' },
  { id:'G3', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：🔺 🔴 🔺 🔴 🔺 ？', optA:'🔺 三角形', optB:'🔴 圆形', optC:'🔵 圆形', answer:'B', interaction:'点击1个选项', time:20, hint:'三角形和圆形轮流出现' },
  { id:'G4', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：🐱 🐶 🐱 🐶 🐱 ？', optA:'🐱 小猫', optB:'🐶 小狗', optC:'🐭 小老鼠', answer:'B', interaction:'点击1个选项', time:20, hint:'小猫和小狗轮流出现' },
  { id:'G5', dim:'图形规律与推理', type:'单选', q:'找出不一样的那个！', screen:'🔴🔴🔴🔴🔵 这5个圆形里，哪个颜色不一样？', optA:'第1个红圆', optB:'第3个红圆', optC:'第5个蓝圆', answer:'C', interaction:'点击1个选项', time:15, hint:'看看哪个颜色不一样' },
  { id:'G11', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：🍎 🍎🍎 🍎🍎🍎 🍎🍎🍎 ？', optA:'🍎 1个苹果', optB:'🍎🍎 2个苹果', optC:'🍎🍎🍎 3个苹果', answer:'A', interaction:'点击1个选项', time:25, hint:'数数每次有几个苹果，1个2个3个轮流' },
  { id:'G12', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：🔴 🟡 🔵 🔴 🟡 🔵 🔴 ？', optA:'🔴 红色', optB:'🟡 黄色', optC:'🔵 蓝色', answer:'B', interaction:'点击1个选项', time:25, hint:'红黄蓝三个一组轮流出现' },
  { id:'G13', dim:'图形规律与推理', type:'单选', q:'哪个和其他不一样？', screen:'🐶 🐱 🐭 🌸', optA:'🐶 小狗', optB:'🌸 花朵', optC:'🐭 老鼠', answer:'B', interaction:'点击1个选项', time:15, hint:'其他三个都是什么？' },
  { id:'G14', dim:'图形规律与推理', type:'单选', q:'哪个和其他不一样？', screen:'☀️ 🌙 ⭐ 🐟', optA:'☀️ 太阳', optB:'🐟 小鱼', optC:'🌙 月亮', answer:'B', interaction:'点击1个选项', time:15, hint:'其他三个都在哪里？' },
  { id:'G15', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：⭐ ⭐⭐ ⭐⭐⭐ ⭐⭐⭐⭐ ？', optA:'⭐⭐⭐⭐⭐ 5颗', optB:'⭐⭐⭐ 3颗', optC:'⭐ 1颗', answer:'A', interaction:'点击1个选项', time:25, hint:'星星数量在变多还是变少？' },
  // 空间方位 S1-S8, S9-S12
  { id:'S1', dim:'空间方位', type:'单选', q:'猫在盒子的哪里？', screen:'一只🐱猫站在🎁礼物盒的上面', optA:'上面', optB:'下面', optC:'里面', answer:'A', interaction:'点击1个选项', time:15, hint:'看看猫站的位置' },
  { id:'S2', dim:'空间方位', type:'单选', q:'鱼在鱼缸的哪里？', screen:'一条🐟鱼在🫙鱼缸里面游', optA:'里面', optB:'外面', optC:'上面', answer:'A', interaction:'点击1个选项', time:15, hint:'鱼在水里还是在水外？' },
  { id:'S3', dim:'空间方位', type:'单选', q:'苹果在哪里？', screen:'一个🍎苹果滚到了桌子下面', optA:'桌上', optB:'桌下', optC:'桌旁', answer:'B', interaction:'点击1个选项', time:15, hint:'看看苹果在桌子的哪个位置' },
  { id:'S4', dim:'空间方位', type:'单选', q:'树在房子的哪边？', screen:'🏠房子左边有棵树🌲，右边有朵花🌸', optA:'左边', optB:'右边', optC:'后面', answer:'A', interaction:'点击1个选项', time:15, hint:'指一指树在房子的哪一边' },
  { id:'S5', dim:'空间方位', type:'单选', q:'哪条路能到学校？', screen:'🚗汽车从🏠家出发，面前有3条路，只有1条通到🏫学校', optA:'左边弯曲的路', optB:'中间直的路', optC:'右边绕圈的路', answer:'B', interaction:'点击1个选项', time:25, hint:'跟着路走走看通到哪里' },
  { id:'S6', dim:'空间方位', type:'单选', q:'门在小朋友的哪边？', screen:'👦小朋友正对着🚪门站着', optA:'前面', optB:'后面', optC:'旁边', answer:'A', interaction:'点击1个选项', time:15, hint:'小朋友脸朝着门' },
  { id:'S7', dim:'空间方位', type:'单选', q:'哪座山离得更近？', screen:'两座山，一座很大，一座很小', optA:'大的那座', optB:'小的那座', optC:'一样近', answer:'A', interaction:'点击1个选项', time:20, hint:'近的东西看起来更大' },
  { id:'S8', dim:'空间方位', type:'单选', q:'书在书包的哪里？', screen:'🎒书包拉链打开，能看到里面有本📖书，外面有支🖊️笔', optA:'里面', optB:'外面', optC:'下面', answer:'A', interaction:'点击1个选项', time:15, hint:'看看书在拉链里面还是外面' },
  { id:'S9', dim:'空间方位', type:'单选', q:'小鸟在树的哪里？', screen:'一只🐦小鸟停在🌳树的顶上', optA:'上面', optB:'下面', optC:'里面', answer:'A', interaction:'点击1个选项', time:15, hint:'小鸟停在树的哪个位置？' },
  { id:'S10', dim:'空间方位', type:'单选', q:'小朋友的左手拿的是什么？', screen:'👦小朋友面向你站着，他左手拿🎈气球，右手拿🍦冰淇淋', optA:'🎈 气球', optB:'🍦 冰淇淋', optC:'两个都拿', answer:'A', interaction:'点击1个选项', time:20, hint:'小朋友面向你，他的左手在你的右边' },
  { id:'S11', dim:'空间方位', type:'单选', q:'谁排在最前面？', screen:'排队：🚗汽车 → 🚌巴士 → 🚲自行车', optA:'🚗 汽车', optB:'🚌 巴士', optC:'🚲 自行车', answer:'A', interaction:'点击1个选项', time:15, hint:'排在第一个的就是最前面的' },
  { id:'S12', dim:'空间方位', type:'单选', q:'月亮在小朋友的哪边？', screen:'👦小朋友抬头看天，🌙月亮在头顶上', optA:'上面', optB:'下面', optC:'左边', answer:'A', interaction:'点击1个选项', time:15, hint:'抬头看是在看哪里？' },
  // 分类与配对 C1-C2, C5-C8, C9-C14
  { id:'C1', dim:'分类与配对', type:'单选', q:'哪个不是水果？', screen:'🍎苹果、🍌香蕉、🚗汽车、🍇葡萄', optA:'🍎 苹果', optB:'🚗 汽车', optC:'🍇 葡萄', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是可以吃的水果？' },
  { id:'C2', dim:'分类与配对', type:'多选', q:'哪两个是穿在脚上的？', screen:'🧦袜子、🧤手套、👟鞋子、🎩帽子', optA:'🧦 袜子', optB:'🧤 手套', optC:'👟 鞋子', answer:'AC', interaction:'点击2个选项', time:20, hint:'想想早上穿鞋子还穿什么？' },
  { id:'C5', dim:'分类与配对', type:'单选', q:'面包和谁是好朋友？', screen:'🍞面包、🥛牛奶、🧱积木', optA:'🥛 牛奶', optB:'🧱 积木', optC:'🍞 面包', answer:'A', interaction:'点击1个选项', time:15, hint:'早餐吃什么配面包？' },
  { id:'C6', dim:'分类与配对', type:'多选', q:'哪几个是天气？（多选）', screen:'☀️太阳、🌧️下雨、❄️下雪、🌙月亮', optA:'☀️ 太阳', optB:'🌧️ 下雨', optC:'❄️ 下雪', answer:'ABC', interaction:'点击多个选项', time:20, hint:'天上出现什么是天气？月亮是天体' },
  { id:'C7', dim:'分类与配对', type:'单选', q:'钉子和谁是好朋友？', screen:'🔨锤子、📌钉子、🥄勺子', optA:'🔨 锤子', optB:'🥄 勺子', optC:'📌 钉子', answer:'A', interaction:'点击1个选项', time:15, hint:'爸爸用什么敲钉子？' },
  { id:'C8', dim:'分类与配对', type:'单选', q:'雪人和哪个在一起？', screen:'☃️雪人，选项：❄️雪花/☀️太阳/🍂落叶', optA:'❄️ 雪花', optB:'☀️ 太阳', optC:'🍂 落叶', answer:'A', interaction:'点击1个选项', time:15, hint:'什么时候会有雪人？' },
  { id:'C9', dim:'分类与配对', type:'单选', q:'哪个不是动物？', screen:'🐶小狗、🐱小猫、🌸花朵、🐰兔子', optA:'🐶 小狗', optB:'🌸 花朵', optC:'🐰 兔子', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是有生命的动物？' },
  { id:'C10', dim:'分类与配对', type:'单选', q:'钥匙和谁是好朋友？', screen:'🔑钥匙、🔒锁、🍎苹果', optA:'🔒 锁', optB:'🍎 苹果', optC:'🔑 钥匙', answer:'A', interaction:'点击1个选项', time:15, hint:'钥匙用来开什么？' },
  { id:'C11', dim:'分类与配对', type:'单选', q:'哪个不是交通工具？', screen:'🚗汽车、🚌巴士、🚲自行车、🌷花朵', optA:'🚗 汽车', optB:'🌷 花朵', optC:'🚲 自行车', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是路上跑的车？' },
  { id:'C12', dim:'分类与配对', type:'多选', q:'哪几个是学习用品？（多选）', screen:'✏️铅笔、📚书本、🎮游戏机、📐尺子', optA:'✏️ 铅笔', optB:'📚 书本', optC:'📐 尺子', answer:'ABC', interaction:'点击多个选项', time:20, hint:'上学时书包里装什么？' },
  { id:'C13', dim:'分类与配对', type:'单选', q:'雨伞和谁是好朋友？', screen:'☔雨伞、☀️太阳、🌧️下雨', optA:'☀️ 太阳', optB:'🌧️ 下雨', optC:'☔ 雨伞', answer:'B', interaction:'点击1个选项', time:15, hint:'什么时候需要用雨伞？' },
  { id:'C14', dim:'分类与配对', type:'单选', q:'哪个不是蔬菜？', screen:'🥕胡萝卜、🥬白菜、🍅番茄、🏀篮球', optA:'🥕 胡萝卜', optB:'🏀 篮球', optC:'🍅 番茄', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是饭桌上吃的菜？' },
  // 情绪识别与社交 E1-E6, E7-E10
  { id:'E1', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'一个😢哭脸的小朋友', optA:'😄 开心', optB:'😢 难过', optC:'😠 生气', answer:'B', interaction:'点击1个选项', time:10, hint:'看看他的脸是笑还是哭' },
  { id:'E2', dim:'情绪识别与社交', type:'单选', q:'这个表情是什么？', screen:'一张😠生气的脸', optA:'😄 开心', optB:'😢 难过', optC:'😠 生气', answer:'C', interaction:'点击1个选项', time:10, hint:'眉毛皱起来是什么表情？' },
  { id:'E3', dim:'情绪识别与社交', type:'单选', q:'他现在最可能是什么心情？', screen:'小朋友摔跤了，膝盖破了', optA:'😄 开心', optB:'😢 难过', optC:'😴 困了', answer:'B', interaction:'点击1个选项', time:15, hint:'摔跤了会疼，会想哭' },
  { id:'E4', dim:'情绪识别与社交', type:'单选', q:'哪个行为是对的？', screen:'A：抢玩具  B：分享玩具', optA:'抢玩具', optB:'分享玩具', optC:'两个都对', answer:'B', interaction:'点击1个选项', time:15, hint:'好朋友应该怎么玩？' },
  { id:'E5', dim:'情绪识别与社交', type:'单选', q:'小狗想要什么？', screen:'🐶小狗在🍖骨头面前转圈', optA:'🍖 骨头', optB:'🎾 球', optC:'🛏️ 睡觉', answer:'A', interaction:'点击1个选项', time:15, hint:'小狗盯着什么看？' },
  { id:'E6', dim:'情绪识别与社交', type:'单选', q:'他需要什么？', screen:'👦小朋友在揉眼睛打哈欠', optA:'吃饭', optB:'睡觉', optC:'跑步', answer:'B', interaction:'点击1个选项', time:15, hint:'揉眼睛打哈欠是想干什么？' },
  { id:'E7', dim:'情绪识别与社交', type:'单选', q:'收到礼物应该说什么？', screen:'🎁小朋友收到了一个礼物', optA:'谢谢', optB:'不要', optC:'再要一个', answer:'A', interaction:'点击1个选项', time:10, hint:'别人送礼物，要有礼貌' },
  { id:'E8', dim:'情绪识别与社交', type:'单选', q:'朋友摔倒了，你应该？', screen:'你的朋友摔倒了', optA:'笑他', optB:'扶他起来', optC:'跑开', answer:'B', interaction:'点击1个选项', time:10, hint:'朋友受伤了要关心他' },
  { id:'E9', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'一个😄笑脸的小朋友', optA:'😄 开心', optB:'😢 难过', optC:'😠 生气', answer:'A', interaction:'点击1个选项', time:10, hint:'看看他在笑还是哭' },
  { id:'E10', dim:'情绪识别与社交', type:'单选', q:'吃饭时应该怎么做？', screen:'一家人在吃饭', optA:'边吃边玩玩具', optB:'安静好好吃', optC:'把不爱吃的扔掉', answer:'B', interaction:'点击1个选项', time:10, hint:'吃饭时要有好习惯' },
  // 常识与因果 K1-K8, K9-K16
  { id:'K1', dim:'常识与因果', type:'单选', q:'下雪天应该穿什么？', screen:'❄️窗外在下大雪', optA:'🩳 短袖', optB:'🧥 棉袄', optC:'👙 泳衣', answer:'B', interaction:'点击1个选项', time:10, hint:'下雪天冷还是热？' },
  { id:'K2', dim:'常识与因果', type:'单选', q:'大太阳时天空是什么颜色？', screen:'☀️太阳高高挂', optA:'黑色', optB:'白色', optC:'蓝色', answer:'C', interaction:'点击1个选项', time:10, hint:'抬头看看晴天的天空' },
  { id:'K3', dim:'常识与因果', type:'单选', q:'木头放进水里会怎样？', screen:'一块🪵木头和一盆💧水', optA:'浮起来', optB:'沉下去', optC:'消失', answer:'A', interaction:'点击1个选项', time:15, hint:'你见过木头的船吗？' },
  { id:'K4', dim:'常识与因果', type:'单选', q:'石头放进水里会怎样？', screen:'一块🪨石头和一盆💧水', optA:'浮起来', optB:'沉下去', optC:'融化', answer:'B', interaction:'点击1个选项', time:15, hint:'石头很重还是很轻？' },
  { id:'K5', dim:'常识与因果', type:'单选', q:'下雨前天上会怎样？', screen:'☁️乌云密布', optA:'打雷闪电', optB:'出大太阳', optC:'刮大风', answer:'A', interaction:'点击1个选项', time:15, hint:'乌云来了之后经常听到什么？' },
  { id:'K6', dim:'常识与因果', type:'单选', q:'月亮和星星出来了，现在是？', screen:'🌙月亮和⭐星星挂在天上', optA:'白天', optB:'晚上', optC:'中午', answer:'B', interaction:'点击1个选项', time:10, hint:'什么时候能看到星星？' },
  { id:'K7', dim:'常识与因果', type:'单选', q:'火碰到冰会怎样？', screen:'🔥火焰靠近❄️冰块', optA:'变热', optB:'变冷', optC:'融化', answer:'C', interaction:'点击1个选项', time:15, hint:'冰遇热会变成什么？' },
  { id:'K8', dim:'常识与因果', type:'单选', q:'起火了应该用什么灭？', screen:'🔥着火了！旁边有💧水、🛢️油、📄纸', optA:'💧 水', optB:'🛢️ 油', optC:'📄 纸', answer:'A', interaction:'点击1个选项', time:15, hint:'消防员叔叔用什么灭火？' },
  { id:'K9', dim:'常识与因果', type:'单选', q:'小树长大需要什么？', screen:'🌱一棵小树苗', optA:'💧水和☀️阳光', optB:'🧊冰块', optC:'🍫巧克力', answer:'A', interaction:'点击1个选项', time:15, hint:'植物需要喝水和晒太阳' },
  { id:'K10', dim:'常识与因果', type:'单选', q:'什么季节树叶会变黄掉下来？', screen:'🍂地上落满了黄叶', optA:'春天', optB:'夏天', optC:'秋天', answer:'C', interaction:'点击1个选项', time:15, hint:'什么时候树叶会掉？' },
  { id:'K11', dim:'常识与因果', type:'单选', q:'蜜蜂采蜜后会做成什么？', screen:'🐝蜜蜂在🌸花朵上采蜜', optA:'🍯蜂蜜', optB:'🥛牛奶', optC:'🍞面包', answer:'A', interaction:'点击1个选项', time:15, hint:'小蜜蜂采的花蜜变成了什么？' },
  { id:'K12', dim:'常识与因果', type:'单选', q:'天黑了看不见路，用什么？', screen:'🌑外面天黑了', optA:'💡灯', optB:'🧊冰块', optC:'⚽球', answer:'A', interaction:'点击1个选项', time:10, hint:'天黑了要开什么才能看见？' },
  { id:'K13', dim:'常识与因果', type:'单选', q:'过马路前应该先做什么？', screen:'🚦红绿灯路口', optA:'直接跑过去', optB:'👀左右看看', optC:'闭上眼睛', answer:'B', interaction:'点击1个选项', time:10, hint:'过马路要注意安全' },
  { id:'K14', dim:'常识与因果', type:'单选', q:'口渴了应该喝什么？', screen:'🥤小朋友满头大汗', optA:'💧白开水', optB:'🧃果汁', optC:'☕咖啡', answer:'A', interaction:'点击1个选项', time:10, hint:'最健康的饮料是什么？' },
  { id:'K15', dim:'常识与因果', type:'单选', q:'种子种到土里会怎样？', screen:'🌰种子埋进🟫土里', optA:'发芽长大', optB:'变成石头', optC:'消失不见', answer:'A', interaction:'点击1个选项', time:15, hint:'种子种下去会长出什么？' },
  { id:'K16', dim:'常识与因果', type:'单选', q:'冰块放在太阳下会怎样？', screen:'🧊冰块放在☀️太阳下', optA:'变成水', optB:'变成石头', optC:'变大', answer:'A', interaction:'点击1个选项', time:15, hint:'冰遇到热会变成什么？' },
];

/** 将结构化题库题目适配为内部统一格式 */
function adaptQuestion(raw) {
  const choices = [
    { label: 'A', text: raw.optA },
    { label: 'B', text: raw.optB },
    { label: 'C', text: raw.optC },
  ];

  // 多选题
  if (raw.type === '多选') {
    return {
      qType: 'multi',
      type: raw.dim,
      q: raw.q,
      screen: raw.screen,
      hint: raw.hint,
      time: raw.time,
      choices,
      answer: raw.answer, // e.g. "AC"
    };
  }

  // 单选题
  return {
    qType: 'single',
    type: raw.dim,
    q: raw.q,
    screen: raw.screen,
    hint: raw.hint,
    time: raw.time,
    choices,
    answer: raw.answer, // e.g. "B"
  };
}

/** 生成10道大脑开发题（50%旧题 + 50%新题） */
function makeProblems() {
  const makers = [makeOddOne, makePattern, makeCategory, makeCount, makeBigger, makeShadow, makeOpposite];
  const oldProbs = [];
  const newProbs = [];

  // 从结构化题库随机抽取
  const shuffledNew = shuffle([...BRAIN_QUESTIONS]);
  const newCount = 5; // 50%
  for (let i = 0; i < newCount && i < shuffledNew.length; i++) {
    newProbs.push(adaptQuestion(shuffledNew[i]));
  }

  // 从旧题生成器随机抽取
  const oldCount = 10 - newProbs.length;
  const shuffledMakers = shuffle([...makers]);
  for (let i = 0; i < oldCount; i++) {
    const fn = shuffledMakers[i % shuffledMakers.length];
    const prob = fn();
    prob.qType = 'single-old'; // 标记旧题
    oldProbs.push(prob);
  }

  // 交错混排
  const result = [];
  let oi = 0, ni = 0;
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0 && ni < newProbs.length) {
      result.push(newProbs[ni++]);
    } else if (oi < oldProbs.length) {
      result.push(oldProbs[oi++]);
    } else if (ni < newProbs.length) {
      result.push(newProbs[ni++]);
    }
  }
  return result;
}

/* ===== 旧题型生成器 ===== */

// 1. 找不同：4个物品，1个不同类
function makeOddOne() {
  const groups = [
    { items: ['🍎','🍐','🍌','🚗'], odd: '🚗', name: '水果' },
    { items: ['🐶','🐱','🐰','🌸'], odd: '🌸', name: '动物' },
    { items: ['🚗','🚌','🚲','⚽'], odd: '⚽', name: '车' },
    { items: ['🌸','🌷','🌻','🐧'], odd: '🐧', name: '花' },
    { items: ['⭐','🌙','☀️','🐟'], odd: '🐟', name: '天上的' },
    { items: ['👕','👖','👗','🍎'], odd: '🍎', name: '衣服' },
  ];
  const g = groups[randInt(0, groups.length - 1)];
  const choices = shuffle(g.items);
  return {
    type: '找不同',
    q: '哪一个和其他不一样？',
    choices,
    answer: g.odd,
    render: (c) => `<span class="brain-emoji">${c}</span>`,
  };
}

// 2. 找规律：形状序列，问下一个
function makePattern() {
  const shapes = ['🔴', '🔵', '🟡', '🟢'];
  const a = shapes[randInt(0, 3)], b = shapes[randInt(0, 3)];
  const seq = [a, b, a, b, a]; // ABAB规律
  const answer = b;
  const choices = shuffle([answer, ...shapes.filter(s => s !== answer).slice(0, 3)]);
  return {
    type: '找规律',
    q: `${seq.join(' ')} 接下来应该是？`,
    choices,
    answer,
    isSeq: true,
    render: (c) => `<span class="brain-emoji">${c}</span>`,
  };
}

// 3. 分类：选同类
function makeCategory() {
  const sets = [
    { pair: ['🍎','🍐'], others: ['🚗','🐶'], name: '水果' },
    { pair: ['🐶','🐱'], others: ['🌸','⭐'], name: '动物' },
    { pair: ['🚗','🚌'], others: ['⚽','🌷'], name: '车' },
    { pair: ['🌸','🌻'], others: ['🚗','🐧'], name: '花' },
  ];
  const s = sets[randInt(0, sets.length - 1)];
  const target = s.pair[randInt(0, 1)];
  const choices = shuffle([s.pair.find(x => x !== target), ...s.others]);
  return {
    type: '找同类',
    q: `和 ${target} 同类的是？`,
    choices,
    answer: s.pair.find(x => x !== target),
    render: (c) => `<span class="brain-emoji">${c}</span>`,
  };
}

// 4. 数数：几个图标
function makeCount() {
  const n = randInt(2, 6);
  const emoji = ['🍎','🐶','⭐','🌸'][randInt(0, 3)];
  const wrongs = [n - 1, n + 1, n + 2].filter(x => x > 0);
  const choices = shuffle([String(n), ...wrongs.slice(0, 3).map(String)]);
  return {
    type: '数一数',
    q: '数一数有几个？',
    count: n,
    countEmoji: emoji,
    choices,
    answer: String(n),
    render: (c) => `<span class="brain-num">${c}</span>`,
  };
}

// 5. 大小比较
function makeBigger() {
  let a = randInt(1, 9), b = randInt(1, 9);
  while (b === a) b = randInt(1, 9); // 确保两数不等
  const bigger = Math.max(a, b);
  const smaller = Math.min(a, b);
  const distractors = [bigger + 1, smaller - 1, bigger + 2].filter(x => x > 0 && x <= 10 && x !== bigger).slice(0, 2);
  const choices = shuffle([String(bigger), String(smaller), ...distractors.map(String)]);
  return {
    type: '比大小',
    q: `${a} 和 ${b}，哪个大？`,
    choices,
    answer: String(bigger),
    render: (c) => `<span class="brain-num">${c}</span>`,
  };
}

// 6. 影子配对（动物和它的影子）——简化成选对应动物
function makeShadow() {
  const pairs = [
    { animal: '🐶', shadow: '🐶' },
    { animal: '🐱', shadow: '🐱' },
    { animal: '🐰', shadow: '🐰' },
  ];
  const p = pairs[randInt(0, 2)];
  const others = ['🐱', '🐰', '🐶', '🦊'].filter(x => x !== p.animal);
  const choices = shuffle([p.animal, ...others.slice(0, 3)]);
  return {
    type: '找相同',
    q: `哪个和它一样？ ${p.shadow}`,
    choices,
    answer: p.animal,
    render: (c) => `<span class="brain-emoji">${c}</span>`,
  };
}

// 7. 反义词/相对（上下、大小、多少）
function makeOpposite() {
  const sets = [
    { q: '上的相反是？', a: '下', choices: ['下','左','右','前'] },
    { q: '大的相反是？', a: '小', choices: ['小','高','长','多'] },
    { q: '多的相反是？', a: '少', choices: ['少','大','高','长'] },
    { q: '白天的相反是？', a: '黑夜', choices: ['黑夜','早上','中午','下午'] },
  ];
  const s = sets[randInt(0, sets.length - 1)];
  return {
    type: '反义词',
    q: s.q,
    choices: shuffle(s.choices),
    answer: s.a,
    render: (c) => `<span class="brain-text">${esc(c)}</span>`,
  };
}

/* ===== 渲染 ===== */
export function openBrainQuiz(taskId) {
  const task = getState().tasks.find(t => t.id === taskId);
  if (!task) return;
  state = { task, problems: makeProblems(), idx: 0, answers: [] };
  renderCard();
}

function renderCard() {
  if (!state) return;
  if (state.idx >= state.problems.length) return finish();
  const p = state.problems[state.idx];
  const total = state.problems.length;
  const cur = state.idx + 1;

  // 根据题型分发到不同渲染器
  switch (p.qType) {
    case 'multi':   return renderMulti(p, cur, total);
    case 'single':  return renderSingleNew(p, cur, total);
    case 'single-old':
    default:        return renderSingleOld(p, cur, total);
  }
}

/* --- 旧单选题渲染（原有逻辑） --- */
function renderSingleOld(p, cur, total) {
  let qExtra = '';
  if (p.count) {
    qExtra = `<div class="brain-count">${Array(p.count).fill(p.countEmoji).map(e => `<span>${e}</span>`).join('')}</div>`;
  }

  let choicesHtml = '';
  p.choices.forEach((c) => {
    choicesHtml += `<button class="brain-choice" data-choice="${esc(c)}">${p.render(c)}</button>`;
  });

  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qbBack">‹</span>
      <span class="quiz-title">🧠 大脑开发</span>
      <span class="quiz-count">${cur}/${total}</span>
    </div>
    <div class="brain-stage">
      <div class="brain-type">${esc(p.type)}</div>
      <div class="brain-q">${esc(p.q)}</div>
      ${qExtra}
      <div class="quiz-feedback" id="qbFeedback"></div>
    </div>
    <div class="quiz-choices">${choicesHtml}</div>
    <div class="quiz-progress"><div class="qp-fill" style="width:${(state.idx / total) * 100}%"></div></div>
  `;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qbBack').onclick = () => { closeOverlay(); state = null; };
      const feedback = card.querySelector('#qbFeedback');
      let answered = false;
      card.querySelectorAll('.brain-choice').forEach(btn => {
        btn.onclick = () => {
          if (answered) return;
          answered = true;
          const chosen = btn.dataset.choice;
          const isRight = chosen === p.answer;
          state.answers.push({ chosen, answer: p.answer, right: isRight });
          btn.classList.add(isRight ? 'correct' : 'wrong');
          if (!isRight) {
            card.querySelectorAll('.brain-choice').forEach(b => {
              if (b.dataset.choice === p.answer) b.classList.add('correct');
            });
          }
          feedback.textContent = isRight ? '✓ 答对了！' : `✗ 答案是 ${p.answer}`;
          feedback.className = 'quiz-feedback ' + (isRight ? 'right' : 'wrong');
          setTimeout(() => { state.idx++; renderCard(); }, isRight ? 700 : 1200);
        };
      });
    },
  });
}

/* --- 新单选题渲染 --- */
function renderSingleNew(p, cur, total) {
  let choicesHtml = '';
  p.choices.forEach((ch) => {
    choicesHtml += `<button class="brain-choice brain-choice-text" data-label="${ch.label}"><span class="brain-choice-label">${ch.label}</span><span class="brain-choice-content">${esc(ch.text)}</span></button>`;
  });

  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qbBack">‹</span>
      <span class="quiz-title">🧠 大脑开发</span>
      <span class="quiz-count">${cur}/${total}</span>
    </div>
    <div class="brain-stage">
      <div class="brain-type">${esc(p.type)}</div>
      <div class="brain-q">${esc(p.q)}</div>
      ${p.screen ? `<div class="brain-screen">${esc(p.screen)}</div>` : ''}
      <div class="quiz-feedback" id="qbFeedback"></div>
    </div>
    <div class="quiz-choices">${choicesHtml}</div>
    <div class="brain-hint" id="qbHint">${esc(p.hint || '')}</div>
    <div class="quiz-progress"><div class="qp-fill" style="width:${(state.idx / total) * 100}%"></div></div>
  `;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qbBack').onclick = () => { closeOverlay(); state = null; };
      const feedback = card.querySelector('#qbFeedback');
      let answered = false;
      card.querySelectorAll('.brain-choice').forEach(btn => {
        btn.onclick = () => {
          if (answered) return;
          answered = true;
          const chosen = btn.dataset.label;
          const isRight = chosen === p.answer;
          state.answers.push({ chosen, answer: p.answer, right: isRight });
          btn.classList.add(isRight ? 'correct' : 'wrong');
          if (!isRight) {
            card.querySelectorAll('.brain-choice').forEach(b => {
              if (b.dataset.label === p.answer) b.classList.add('correct');
            });
          }
          feedback.textContent = isRight ? '✓ 答对了！' : `✗ 答案是 ${p.answer}`;
          feedback.className = 'quiz-feedback ' + (isRight ? 'right' : 'wrong');
          setTimeout(() => { state.idx++; renderCard(); }, isRight ? 700 : 1200);
        };
      });
    },
  });
}

/* --- 多选题渲染 --- */
function renderMulti(p, cur, total) {
  let choicesHtml = '';
  p.choices.forEach((ch) => {
    choicesHtml += `<button class="brain-choice brain-choice-text brain-multi-choice" data-label="${ch.label}"><span class="brain-choice-label">${ch.label}</span><span class="brain-choice-content">${esc(ch.text)}</span></button>`;
  });

  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qbBack">‹</span>
      <span class="quiz-title">🧠 大脑开发</span>
      <span class="quiz-count">${cur}/${total}</span>
    </div>
    <div class="brain-stage">
      <div class="brain-type">${esc(p.type)}</div>
      <div class="brain-q">${esc(p.q)}</div>
      ${p.screen ? `<div class="brain-screen">${esc(p.screen)}</div>` : ''}
      <div class="brain-multi-tip">选出所有正确的选项，选好后点确认</div>
      <div class="quiz-feedback" id="qbFeedback"></div>
    </div>
    <div class="quiz-choices">${choicesHtml}</div>
    <div class="brain-hint" id="qbHint">${esc(p.hint || '')}</div>
    <button class="btn block brain-confirm-btn" id="qbConfirm">确认</button>
    <div class="quiz-progress"><div class="qp-fill" style="width:${(state.idx / total) * 100}%"></div></div>
  `;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qbBack').onclick = () => { closeOverlay(); state = null; };
      const feedback = card.querySelector('#qbFeedback');
      const confirmBtn = card.querySelector('#qbConfirm');
      const selected = new Set();
      let answered = false;

      card.querySelectorAll('.brain-multi-choice').forEach(btn => {
        btn.onclick = () => {
          if (answered) return;
          const label = btn.dataset.label;
          if (selected.has(label)) {
            selected.delete(label);
            btn.classList.remove('selected');
          } else {
            selected.add(label);
            btn.classList.add('selected');
          }
        };
      });

      confirmBtn.onclick = () => {
        if (answered || selected.size === 0) return;
        answered = true;
        const chosen = [...selected].sort().join('');
        const answer = p.answer.split('').sort().join('');
        const isRight = chosen === answer;
        state.answers.push({ chosen, answer: p.answer, right: isRight });

        card.querySelectorAll('.brain-multi-choice').forEach(btn => {
          const label = btn.dataset.label;
          if (p.answer.includes(label)) {
            btn.classList.add('correct');
          } else if (selected.has(label)) {
            btn.classList.add('wrong');
          }
        });

        feedback.textContent = isRight ? '✓ 全部选对了！' : `✗ 正确答案是 ${p.answer}`;
        feedback.className = 'quiz-feedback ' + (isRight ? 'right' : 'wrong');
        confirmBtn.disabled = true;
        setTimeout(() => { state.idx++; renderCard(); }, isRight ? 800 : 1500);
      };
    },
  });
}

function finish() {
  const total = state.problems.length;
  const right = state.answers.filter(a => a.right).length;
  const passRate = total ? right / total : 0;
  const passed = passRate >= (state.task.passRate || 0.8);
  const result = { correct: right, total, passRate, passed };
  submitQuiz(state.task.id, result);
  const savedTask = state.task;
  state = null;
  if (passed) { closeOverlay(); celebrate('大脑开发成功', `获得 ${savedTask.points} 积分`); setTimeout(() => switchTab('checkin'), 100); return; }

  const html = `<h2>💪 再接再厉</h2><div class="desc">答对 ${right}/${total} 题 · 准确率 ${Math.round(passRate * 100)}% · 获得 ${Math.max(1, Math.round(savedTask.points / 3))} 鼓励分</div><button class="btn block" id="qbDone">完成</button>`;
  showOverlay(html, { onMount: c => { c.querySelector('#qbDone').onclick = () => { closeOverlay(); switchTab('checkin'); }; } });
}
