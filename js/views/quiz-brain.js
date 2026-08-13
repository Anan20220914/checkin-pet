// views/quiz-brain.js — 大脑开发打卡（思维逻辑启蒙，10题，≥80%通过）
// 题型：找不同、找规律(形状序列)、分类、数、大小比较、配对 + 53道结构化题库
// 新旧题库各50%概率出现

import { getState } from '../store.js';
import { submitQuiz } from '../tasks.js';
import { showOverlay, closeOverlay, switchTab, celebrate } from '../app.js';
import { esc, shuffle, randInt } from '../utils.js';

let state = null; // { task, problems, idx, answers: [] }

/* ===== 结构化题库（来自Excel导入，53道） ===== */
const BRAIN_QUESTIONS = [
  // 图形规律与推理 G1-G10
  { id:'G1', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：🔴 🔵 🔴 🔵 🔴 ？', optA:'🔴 红色圆形', optB:'🔵 蓝色圆形', optC:'🟡 黄色圆形', answer:'B', interaction:'点击1个选项', time:20, hint:'看看颜色是不是轮流出现？' },
  { id:'G2', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：🟥 🟨 🟥 🟨 🟥 ？', optA:'🟥 红色方块', optB:'🟨 黄色方块', optC:'🟩 绿色方块', answer:'B', interaction:'点击1个选项', time:20, hint:'方块颜色在轮流变化' },
  { id:'G3', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：🔺 🔴 🔺 🔴 🔺 ？', optA:'🔺 三角形', optB:'🔴 圆形', optC:'🔵 圆形', answer:'B', interaction:'点击1个选项', time:20, hint:'三角形和圆形轮流出现' },
  { id:'G4', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：🐱 🐶 🐱 🐶 🐱 ？', optA:'🐱 小猫', optB:'🐶 小狗', optC:'🐭 小老鼠', answer:'B', interaction:'点击1个选项', time:20, hint:'小猫和小狗轮流出现' },
  { id:'G5', dim:'图形规律与推理', type:'单选', q:'找出不一样的那个！', screen:'4个圆形并排：3个红色，1个蓝色', optA:'第1个红圆', optB:'第2个红圆', optC:'蓝色的圆', answer:'C', interaction:'点击1个选项', time:15, hint:'看看哪个颜色不一样' },
  { id:'G6', dim:'图形规律与推理', type:'单选', q:'找出藏起来不一样的图形！', screen:'5个三角形中藏着1个倒三角形', optA:'正三角形', optB:'倒三角形', optC:'正方形', answer:'B', interaction:'点击1个选项', time:20, hint:'有一个三角形是倒过来的' },
  { id:'G7', dim:'图形规律与推理', type:'单选', q:'叠在一起会变成什么？', screen:'一个蓝色圆形叠在黄色方块上', optA:'黄底蓝圆', optB:'蓝底黄方块', optC:'绿色圆形', answer:'A', interaction:'点击1个选项', time:25, hint:'圆形在上，方块在下' },
  { id:'G8', dim:'图形规律与推理', type:'单选', q:'哪一半能拼成完整的心形？', screen:'左边显示半个❤️，右边给出3个选项', optA:'左半边心', optB:'右半边心', optC:'圆形', answer:'B', interaction:'点击1个选项', time:25, hint:'看看缺的是哪一边' },
  { id:'G9', dim:'图形规律与推理', type:'单选', q:'转一下之后是哪个？', screen:'一个L型积木，旋转后的样子', optA:'朝左的L', optB:'朝右的L', optC:'朝上的L', answer:'B', interaction:'点击1个选项', time:25, hint:'在脑子里转一下这个积木' },
  { id:'G10', dim:'图形规律与推理', type:'单选', q:'哪排星星更多？', screen:'上排5颗星星间距大（看起来长），下排5颗星星间距小（看起来短）', optA:'上面多', optB:'一样多', optC:'下面多', answer:'B', interaction:'点击1个选项', time:30, hint:'数一数，不要只看长短' },
  // 空间方位 S1-S8
  { id:'S1', dim:'空间方位', type:'单选', q:'猫在盒子的哪里？', screen:'一只🐱猫站在🎁礼物盒的上面', optA:'上面', optB:'下面', optC:'里面', answer:'A', interaction:'点击1个选项', time:15, hint:'看看猫站的位置' },
  { id:'S2', dim:'空间方位', type:'单选', q:'鱼在鱼缸的哪里？', screen:'一条🐟鱼在🫙鱼缸里面游', optA:'里面', optB:'外面', optC:'上面', answer:'A', interaction:'点击1个选项', time:15, hint:'鱼在水里还是在水外？' },
  { id:'S3', dim:'空间方位', type:'单选', q:'苹果在哪里？', screen:'一个🍎苹果滚到了桌子下面', optA:'桌上', optB:'桌下', optC:'桌旁', answer:'B', interaction:'点击1个选项', time:15, hint:'看看苹果在桌子的哪个位置' },
  { id:'S4', dim:'空间方位', type:'单选', q:'树在房子的哪边？', screen:'🏠房子左边有棵树🌲，右边有朵花🌸', optA:'左边', optB:'右边', optC:'后面', answer:'A', interaction:'点击1个选项', time:15, hint:'指一指树在房子的哪一边' },
  { id:'S5', dim:'空间方位', type:'单选', q:'哪条路能到学校？', screen:'🚗汽车从🏠家出发，面前有3条路，只有1条通到🏫学校', optA:'左边弯曲的路', optB:'中间直的路', optC:'右边绕圈的路', answer:'B', interaction:'点击1个选项', time:25, hint:'跟着路走走看通到哪里' },
  { id:'S6', dim:'空间方位', type:'单选', q:'门在小朋友的哪边？', screen:'👦小朋友正对着🚪门站着', optA:'前面', optB:'后面', optC:'旁边', answer:'A', interaction:'点击1个选项', time:15, hint:'小朋友脸朝着门' },
  { id:'S7', dim:'空间方位', type:'单选', q:'哪座山离得更近？', screen:'两座山，一座很大，一座很小', optA:'大的那座', optB:'小的那座', optC:'一样近', answer:'A', interaction:'点击1个选项', time:20, hint:'近的东西看起来更大' },
  { id:'S8', dim:'空间方位', type:'单选', q:'书在书包的哪里？', screen:'🎒书包拉链打开，能看到里面有本📖书，外面有支🖊️笔', optA:'里面', optB:'外面', optC:'下面', answer:'A', interaction:'点击1个选项', time:15, hint:'看看书在拉链里面还是外面' },
  // 分类与配对 C1-C8
  { id:'C1', dim:'分类与配对', type:'单选', q:'哪个不是水果？', screen:'🍎苹果、🍌香蕉、🚗汽车、🍇葡萄', optA:'🍎 苹果', optB:'🚗 汽车', optC:'🍇 葡萄', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是可以吃的水果？' },
  { id:'C2', dim:'分类与配对', type:'多选', q:'哪两个是穿在脚上的？', screen:'🧦袜子、🧤手套、👟鞋子、🎩帽子', optA:'🧦 袜子', optB:'🧤 手套', optC:'👟 鞋子', answer:'AC', interaction:'点击2个选项', time:20, hint:'想想早上穿鞋子还穿什么？' },
  { id:'C3', dim:'分类与配对', type:'单选', q:'哪个是小狗的影子？', screen:'左侧🐕小狗照片，右侧3个影子轮廓', optA:'小狗形状影子', optB:'小猫形状影子', optC:'兔子形状影子', answer:'A', interaction:'点击1个选项', time:20, hint:'看看形状和小狗一样吗？' },
  { id:'C4', dim:'分类与配对', type:'单选', q:'哪一半是彩虹的另一半？', screen:'左边显示半条🌈彩虹，右边3个半圆选项', optA:'红色在左的半圆', optB:'紫色在右的半圆', optC:'绿色半圆', answer:'B', interaction:'点击1个选项', time:25, hint:'彩虹左边是红色，右边应该是紫色' },
  { id:'C5', dim:'分类与配对', type:'单选', q:'面包和谁是好朋友？', screen:'🍞面包、🥛牛奶、🧱积木', optA:'🥛 牛奶', optB:'🧱 积木', optC:'🍞 面包', answer:'A', interaction:'点击1个选项', time:15, hint:'早餐吃什么配面包？' },
  { id:'C6', dim:'分类与配对', type:'多选', q:'哪几个是天气？（多选）', screen:'☀️太阳、🌧️下雨、❄️下雪、🌙月亮', optA:'☀️ 太阳', optB:'🌧️ 下雨', optC:'❄️ 下雪', answer:'ABC', interaction:'点击多个选项', time:20, hint:'天上出现什么是天气？月亮是天体' },
  { id:'C7', dim:'分类与配对', type:'单选', q:'钉子和谁是好朋友？', screen:'🔨锤子、📌钉子、🥄勺子', optA:'🔨 锤子', optB:'🥄 勺子', optC:'📌 钉子', answer:'A', interaction:'点击1个选项', time:15, hint:'爸爸用什么敲钉子？' },
  { id:'C8', dim:'分类与配对', type:'单选', q:'雪人和哪个在一起？', screen:'☃️雪人，选项：❄️雪花/☀️太阳/🍂落叶', optA:'❄️ 雪花', optB:'☀️ 太阳', optC:'🍂 落叶', answer:'A', interaction:'点击1个选项', time:15, hint:'什么时候会有雪人？' },
  // 注意力与观察 A1-A8
  { id:'A1', dim:'注意力与观察', type:'单选', q:'哪里不一样？', screen:'两张几乎一样的图，有1处不同', optA:'左上角', optB:'中间', optC:'右下角', answer:'B', interaction:'点击图中不同位置', time:30, hint:'仔细对比两张图的每个地方' },
  { id:'A2', dim:'注意力与观察', type:'单选', q:'小猫藏在哪里？', screen:'一片🌿草丛里藏着一只🐱猫', optA:'草丛左边', optB:'草丛中间', optC:'草丛右边', answer:'B', interaction:'点击图中猫的位置', time:25, hint:'找找看草丛里露出的猫耳朵或尾巴' },
  { id:'A3', dim:'注意力与观察', type:'多选', q:'刚才出现了哪些物品？（多选）', screen:'先快速闪示3个物品1秒，然后显示问号', optA:'🍎 苹果', optB:'🚗 汽车', optC:'🎈 气球', answer:'ABC', interaction:'点击多个选项', time:10, hint:'用眼睛拍一张照片记住' },
  { id:'A4', dim:'注意力与观察', type:'单选', q:'红球在哪个杯子下面？', screen:'3个倒扣杯子动画交换位置', optA:'左边杯子', optB:'中间杯子', optC:'右边杯子', answer:'B', interaction:'点击1个杯子', time:20, hint:'眼睛盯着红球不要看杯子' },
  { id:'A5', dim:'注意力与观察', type:'单选', q:'图里有几只蝴蝶？', screen:'一幅画里画了5只🦋蝴蝶', optA:'3只', optB:'4只', optC:'5只', answer:'C', interaction:'点击1个选项', time:20, hint:'一只一只指着数一数' },
  { id:'A6', dim:'注意力与观察', type:'单选', q:'树的影子朝哪边？', screen:'☀️太阳在左边，🌳树在中间', optA:'左边', optB:'右边', optC:'上边', answer:'B', interaction:'点击1个选项', time:25, hint:'太阳在这边，影子在太阳对面' },
  { id:'A7', dim:'注意力与观察', type:'单选', q:'下一个格子是什么颜色？', screen:'一排格子：🔴🔴🟡🟡🔴🔴？', optA:'🔴 红色', optB:'🟡 黄色', optC:'🔵 蓝色', answer:'B', interaction:'点击1个选项', time:20, hint:'两个红色、两个黄色轮流' },
  { id:'A8', dim:'注意力与观察', type:'单选', q:'这是谁的尾巴？', screen:'显示一条🐘大象的尾巴局部', optA:'🐘 大象', optB:'🐖 小猪', optC:'🐄 奶牛', answer:'A', interaction:'点击1个选项', time:20, hint:'想想谁的尾巴又粗又长？' },
  // 情绪识别与社交 E1-E6
  { id:'E1', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'一个😢哭脸的小朋友', optA:'😄 开心', optB:'😢 难过', optC:'😠 生气', answer:'B', interaction:'点击1个选项', time:10, hint:'看看他的脸是笑还是哭' },
  { id:'E2', dim:'情绪识别与社交', type:'单选', q:'这个表情是什么？', screen:'一张😠生气的脸', optA:'😄 开心', optB:'😢 难过', optC:'😠 生气', answer:'C', interaction:'点击1个选项', time:10, hint:'眉毛皱起来是什么表情？' },
  { id:'E3', dim:'情绪识别与社交', type:'单选', q:'他现在最可能是什么心情？', screen:'小朋友摔跤了，膝盖破了', optA:'😄 开心', optB:'😢 难过', optC:'😴 困了', answer:'B', interaction:'点击1个选项', time:15, hint:'摔跤了会疼，会想哭' },
  { id:'E4', dim:'情绪识别与社交', type:'单选', q:'哪个行为是对的？', screen:'A图：抢玩具；B图：分享玩具', optA:'抢玩具', optB:'分享玩具', optC:'两个都对', answer:'B', interaction:'点击1个选项', time:15, hint:'好朋友应该怎么玩？' },
  { id:'E5', dim:'情绪识别与社交', type:'单选', q:'小狗想要什么？', screen:'🐶小狗在🍖骨头面前转圈', optA:'🍖 骨头', optB:'🎾 球', optC:'🛏️ 睡觉', answer:'A', interaction:'点击1个选项', time:15, hint:'小狗盯着什么看？' },
  { id:'E6', dim:'情绪识别与社交', type:'单选', q:'他需要什么？', screen:'👦小朋友在揉眼睛打哈欠', optA:'吃饭', optB:'睡觉', optC:'跑步', answer:'B', interaction:'点击1个选项', time:15, hint:'揉眼睛打哈欠是想干什么？' },
  // 常识与因果 K1-K8
  { id:'K1', dim:'常识与因果', type:'单选', q:'下雪天应该穿什么？', screen:'❄️窗外在下大雪', optA:'🩳 短袖', optB:'🧥 棉袄', optC:'👙 泳衣', answer:'B', interaction:'点击1个选项', time:10, hint:'下雪天冷还是热？' },
  { id:'K2', dim:'常识与因果', type:'单选', q:'大太阳时天空是什么颜色？', screen:'☀️太阳高高挂', optA:'黑色', optB:'白色', optC:'蓝色', answer:'C', interaction:'点击1个选项', time:10, hint:'抬头看看晴天的天空' },
  { id:'K3', dim:'常识与因果', type:'单选', q:'木头放进水里会怎样？', screen:'一块🪵木头和一盆💧水', optA:'浮起来', optB:'沉下去', optC:'消失', answer:'A', interaction:'点击1个选项', time:15, hint:'你见过木头的船吗？' },
  { id:'K4', dim:'常识与因果', type:'单选', q:'石头放进水里会怎样？', screen:'一块🪨石头和一盆💧水', optA:'浮起来', optB:'沉下去', optC:'融化', answer:'B', interaction:'点击1个选项', time:15, hint:'石头很重还是很轻？' },
  { id:'K5', dim:'常识与因果', type:'单选', q:'下雨前天上会怎样？', screen:'☁️乌云密布', optA:'打雷闪电', optB:'出大太阳', optC:'刮大风', answer:'A', interaction:'点击1个选项', time:15, hint:'乌云来了之后经常听到什么？' },
  { id:'K6', dim:'常识与因果', type:'单选', q:'月亮和星星出来了，现在是？', screen:'🌙月亮和⭐星星挂在天上', optA:'白天', optB:'晚上', optC:'中午', answer:'B', interaction:'点击1个选项', time:10, hint:'什么时候能看到星星？' },
  { id:'K7', dim:'常识与因果', type:'单选', q:'火碰到冰会怎样？', screen:'🔥火焰靠近❄️冰块', optA:'变热', optB:'变冷', optC:'融化', answer:'C', interaction:'点击1个选项', time:15, hint:'冰遇热会变成什么？' },
  { id:'K8', dim:'常识与因果', type:'单选', q:'起火了应该用什么灭？', screen:'🔥着火了！旁边有💧水、🛢️油、📄纸', optA:'💧 水', optB:'🛢️ 油', optC:'📄 纸', answer:'A', interaction:'点击1个选项', time:15, hint:'消防员叔叔用什么灭火？' },
  // 纯记忆游戏 M1-M5
  { id:'M1', dim:'纯记忆游戏', type:'配对', q:'找出相同的两个！', screen:'4张背面朝上的牌（2对相同图案）', optA:'翻第1张', optB:'翻第2张', optC:'翻第3张', answer:'配对成功', interaction:'逐一点牌翻牌，翻到相同消除', time:40, hint:'记住每次翻到的位置' },
  { id:'M2', dim:'纯记忆游戏', type:'配对', q:'找出相同的两个！', screen:'6张背面朝上的牌（3对相同图案）', optA:'翻牌1', optB:'翻牌2', optC:'翻牌3', answer:'配对成功', interaction:'逐一点牌翻牌，翻到相同消除', time:50, hint:'记住每张牌的位置' },
  { id:'M3', dim:'纯记忆游戏', type:'顺序', q:'按刚才的顺序点一遍！', screen:'3个彩色按钮依次亮起（如🔴🟡🔵）', optA:'🔴', optB:'🟡', optC:'🔵', answer:'按原顺序点击', interaction:'按记忆顺序依次点击按钮', time:20, hint:'像跟着灯跳舞一样记住顺序' },
  { id:'M4', dim:'纯记忆游戏', type:'单选', q:'刚才星星在哪里？', screen:'屏幕闪示1个⭐星星位置1秒后消失', optA:'左上角', optB:'中间', optC:'右下角', answer:'B', interaction:'点击正确位置', time:10, hint:'眼睛盯住星星的位置' },
  { id:'M5', dim:'纯记忆游戏', type:'多选', q:'刚才星星出现在哪两个位置？（多选）', screen:'屏幕闪示2个⭐星星位置1秒后消失', optA:'左边', optB:'中间', optC:'右边', answer:'AC', interaction:'点击2个正确位置', time:15, hint:'记住两颗星星分别在哪里' },
];

/** 将结构化题库题目适配为内部统一格式 */
function adaptQuestion(raw) {
  const choices = [
    { label: 'A', text: raw.optA },
    { label: 'B', text: raw.optB },
    { label: 'C', text: raw.optC },
  ];

  // 配对题：简化为翻牌记忆游戏
  if (raw.type === '配对') {
    return {
      qType: 'pair',
      type: raw.dim,
      q: raw.q,
      screen: raw.screen,
      hint: raw.hint,
      time: raw.time,
      pairs: raw.id === 'M1' ? 2 : 3, // M1=2对, M2=3对
    };
  }

  // 顺序题：展示序列后让用户按顺序点击
  if (raw.type === '顺序') {
    return {
      qType: 'sequence',
      type: raw.dim,
      q: raw.q,
      screen: raw.screen,
      hint: raw.hint,
      time: raw.time,
      seq: ['🔴', '🟡', '🔵'],
    };
  }

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
    case 'pair':    return renderPair(p, cur, total);
    case 'sequence': return renderSequence(p, cur, total);
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

/* --- 配对题渲染（翻牌记忆游戏） --- */
function renderPair(p, cur, total) {
  const pairCount = p.pairs;
  // 生成牌组：每对2张相同emoji
  const emojis = ['🍎','🐶','⭐','🌸','🚗','🐱'];
  const cards = [];
  for (let i = 0; i < pairCount; i++) {
    cards.push({ emoji: emojis[i], id: i });
    cards.push({ emoji: emojis[i], id: i });
  }
  const shuffledCards = shuffle(cards);

  let cardsHtml = '';
  shuffledCards.forEach((card, i) => {
    cardsHtml += `<button class="brain-card" data-index="${i}" data-emoji="${card.emoji}" data-id="${card.id}"><span class="brain-card-back">❓</span><span class="brain-card-front" style="display:none">${card.emoji}</span></button>`;
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
      <div class="brain-screen">${esc(p.screen)}</div>
      <div class="quiz-feedback" id="qbFeedback"></div>
    </div>
    <div class="brain-cards">${cardsHtml}</div>
    <div class="brain-hint">${esc(p.hint || '')}</div>
    <div class="quiz-progress"><div class="qp-fill" style="width:${(state.idx / total) * 100}%"></div></div>
  `;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qbBack').onclick = () => { closeOverlay(); state = null; };
      const feedback = card.querySelector('#qbFeedback');
      let flipped = []; // 当前翻开的牌
      let matched = 0;
      let locked = false;

      card.querySelectorAll('.brain-card').forEach(btn => {
        btn.onclick = () => {
          if (locked || flipped.length >= 2) return;
          if (btn.classList.contains('flipped') || btn.classList.contains('matched')) return;

          // 翻牌
          btn.classList.add('flipped');
          btn.querySelector('.brain-card-back').style.display = 'none';
          btn.querySelector('.brain-card-front').style.display = '';
          flipped.push(btn);

          if (flipped.length === 2) {
            locked = true;
            const [a, b] = flipped;
            if (a.dataset.id === b.dataset.id) {
              // 配对成功
              setTimeout(() => {
                a.classList.add('matched');
                b.classList.add('matched');
                flipped = [];
                locked = false;
                matched++;
                feedback.textContent = '✓ 配对成功！';
                feedback.className = 'quiz-feedback right';
                if (matched === pairCount) {
                  state.answers.push({ chosen: '配对成功', answer: '配对成功', right: true });
                  feedback.textContent = '✓ 全部配对成功！';
                  setTimeout(() => { state.idx++; renderCard(); }, 1000);
                }
              }, 500);
            } else {
              // 配对失败，翻回去
              setTimeout(() => {
                [a, b].forEach(el => {
                  el.classList.remove('flipped');
                  el.querySelector('.brain-card-back').style.display = '';
                  el.querySelector('.brain-card-front').style.display = 'none';
                });
                flipped = [];
                locked = false;
                feedback.textContent = '再试试看！';
                feedback.className = 'quiz-feedback wrong';
              }, 1000);
            }
          }
        };
      });
    },
  });
}

/* --- 顺序题渲染（记忆序列后按顺序点击） --- */
function renderSequence(p, cur, total) {
  const seq = p.seq;
  let buttonsHtml = '';
  seq.forEach((emoji, i) => {
    buttonsHtml += `<button class="brain-seq-btn" data-index="${i}"><span class="brain-seq-emoji">${emoji}</span></button>`;
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
      <div class="brain-seq-display" id="qbSeqDisplay">看仔细哦...</div>
      <div class="quiz-feedback" id="qbFeedback"></div>
    </div>
    <div class="brain-seq-buttons">${buttonsHtml}</div>
    <div class="brain-hint">${esc(p.hint || '')}</div>
    <div class="quiz-progress"><div class="qp-fill" style="width:${(state.idx / total) * 100}%"></div></div>
  `;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qbBack').onclick = () => { closeOverlay(); state = null; };
      const feedback = card.querySelector('#qbFeedback');
      const seqDisplay = card.querySelector('#qbSeqDisplay');
      const buttons = card.querySelectorAll('.brain-seq-btn');
      let phase = 'show'; // show -> input -> done
      let inputIdx = 0;
      let answered = false;

      // 展示阶段：依次高亮按钮
      let showIdx = 0;
      function showNext() {
        if (showIdx >= seq.length) {
          // 展示完毕，进入输入阶段
          seqDisplay.textContent = '现在按刚才的顺序点一遍！';
          phase = 'input';
          return;
        }
        const btn = buttons[showIdx];
        btn.classList.add('seq-highlight');
        seqDisplay.textContent = `看：${seq[showIdx]}`;
        setTimeout(() => {
          btn.classList.remove('seq-highlight');
          showIdx++;
          setTimeout(showNext, 300);
        }, 600);
      }
      setTimeout(showNext, 500);

      // 输入阶段：按顺序点击
      buttons.forEach(btn => {
        btn.onclick = () => {
          if (phase !== 'input' || answered) return;
          const idx = parseInt(btn.dataset.index);
          if (idx === inputIdx) {
            btn.classList.add('seq-correct');
            inputIdx++;
            feedback.textContent = '✓';
            feedback.className = 'quiz-feedback right';
            if (inputIdx >= seq.length) {
              answered = true;
              state.answers.push({ chosen: '按顺序点击', answer: '按原顺序点击', right: true });
              feedback.textContent = '✓ 全部正确！';
              setTimeout(() => { state.idx++; renderCard(); }, 800);
            }
          } else {
            answered = true;
            btn.classList.add('seq-wrong');
            state.answers.push({ chosen: '顺序错误', answer: '按原顺序点击', right: false });
            feedback.textContent = '✗ 顺序不对哦！';
            feedback.className = 'quiz-feedback wrong';
            // 高亮正确顺序
            buttons.forEach((b, i) => {
              if (i < seq.length) b.classList.add(i === inputIdx ? 'seq-correct' : 'seq-dim');
            });
            setTimeout(() => { state.idx++; renderCard(); }, 1500);
          }
        };
      });
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
