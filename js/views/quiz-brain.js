// views/quiz-brain.js — 大脑开发打卡（思维逻辑启蒙，10题，≥80%通过）
// 题型：图形规律、分类配对、情绪社交、常识因果、逻辑推理、记忆注意力、反义词、比大小

import { getState } from '../store.js';
import { submitQuiz } from '../tasks.js';
import { showOverlay, closeOverlay, switchTab, celebrate } from '../app.js';
import { esc, shuffle, randInt } from '../utils.js';

let state = null; // { task, problems, idx, answers: [] }

/* ===== 结构化题库 ===== */
const BRAIN_QUESTIONS = [
  // 图形规律与推理 G1-G15
  { id:'G1', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：红圆 蓝圆 红圆 蓝圆 红圆 ？', optA:'红圆', optB:'蓝圆', optC:'黄圆', answer:'B', interaction:'点击1个选项', time:20, hint:'看看颜色是不是轮流出现？' },
  { id:'G2', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：红方 黄方 红方 黄方 红方 ？', optA:'红方', optB:'黄方', optC:'绿方', answer:'B', interaction:'点击1个选项', time:20, hint:'方块颜色在轮流变化' },
  { id:'G3', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：三角 圆 三角 圆 三角 ？', optA:'三角', optB:'圆', optC:'方', answer:'B', interaction:'点击1个选项', time:20, hint:'三角形和圆形轮流出现' },
  { id:'G4', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：猫 狗 猫 狗 猫 ？', optA:'猫', optB:'狗', optC:'老鼠', answer:'B', interaction:'点击1个选项', time:20, hint:'小猫和小狗轮流出现' },
  { id:'G5', dim:'图形规律与推理', type:'单选', q:'找出不一样的那个！', screen:'5个圆形：红红红红蓝，哪个颜色不一样？', optA:'第1个红圆', optB:'第3个红圆', optC:'第5个蓝圆', answer:'C', interaction:'点击1个选项', time:15, hint:'看看哪个颜色不一样' },
  { id:'G11', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：1个苹果 2个苹果 1个苹果 2个苹果 1个苹果 ？', optA:'1个苹果', optB:'2个苹果', optC:'3个苹果', answer:'B', interaction:'点击1个选项', time:25, hint:'数数每次有几个苹果，1个2个轮流' },
  { id:'G12', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：红 黄 蓝 红 黄 蓝 红 ？', optA:'红', optB:'黄', optC:'蓝', answer:'B', interaction:'点击1个选项', time:25, hint:'红黄蓝三个一组轮流出现' },
  { id:'G13', dim:'图形规律与推理', type:'单选', q:'哪个和其他不一样？', screen:'小狗 小猫 老鼠 花朵', optA:'小狗', optB:'花朵', optC:'老鼠', answer:'B', interaction:'点击1个选项', time:15, hint:'其他三个都是什么？' },
  { id:'G14', dim:'图形规律与推理', type:'单选', q:'哪个和其他不一样？', screen:'太阳 月亮 星星 小鱼', optA:'太阳', optB:'小鱼', optC:'月亮', answer:'B', interaction:'点击1个选项', time:15, hint:'其他三个都在哪里？' },
  { id:'G15', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：1颗星 2颗星 3颗星 4颗星 ？', optA:'5颗星', optB:'3颗星', optC:'1颗星', answer:'A', interaction:'点击1个选项', time:25, hint:'星星数量在变多还是变少？' },
  // 情绪识别与社交 E1-E10
  { id:'E1', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'一个小朋友在哭', optA:'开心', optB:'难过', optC:'生气', answer:'B', interaction:'点击1个选项', time:10, hint:'看看他在笑还是哭' },
  { id:'E2', dim:'情绪识别与社交', type:'单选', q:'这个表情是什么？', screen:'一张生气的脸，眉毛皱起来', optA:'开心', optB:'难过', optC:'生气', answer:'C', interaction:'点击1个选项', time:10, hint:'眉毛皱起来是什么表情？' },
  { id:'E3', dim:'情绪识别与社交', type:'单选', q:'他现在最可能是什么心情？', screen:'小朋友摔跤了，膝盖破了', optA:'开心', optB:'难过', optC:'困了', answer:'B', interaction:'点击1个选项', time:15, hint:'摔跤了会疼，会想哭' },
  { id:'E4', dim:'情绪识别与社交', type:'单选', q:'哪个行为是对的？', screen:'A：抢玩具  B：分享玩具', optA:'抢玩具', optB:'分享玩具', optC:'两个都对', answer:'B', interaction:'点击1个选项', time:15, hint:'好朋友应该怎么玩？' },
  { id:'E5', dim:'情绪识别与社交', type:'单选', q:'小狗想要什么？', screen:'小狗在骨头面前转圈', optA:'骨头', optB:'球', optC:'睡觉', answer:'A', interaction:'点击1个选项', time:15, hint:'小狗盯着什么看？' },
  { id:'E6', dim:'情绪识别与社交', type:'单选', q:'他需要什么？', screen:'小朋友在揉眼睛打哈欠', optA:'吃饭', optB:'睡觉', optC:'跑步', answer:'B', interaction:'点击1个选项', time:15, hint:'揉眼睛打哈欠是想干什么？' },
  { id:'E7', dim:'情绪识别与社交', type:'单选', q:'收到礼物应该说什么？', screen:'小朋友收到了一个礼物', optA:'谢谢', optB:'不要', optC:'再要一个', answer:'A', interaction:'点击1个选项', time:10, hint:'别人送礼物，要有礼貌' },
  { id:'E8', dim:'情绪识别与社交', type:'单选', q:'朋友摔倒了，你应该？', screen:'你的朋友摔倒了', optA:'笑他', optB:'扶他起来', optC:'跑开', answer:'B', interaction:'点击1个选项', time:10, hint:'朋友受伤了要关心他' },
  { id:'E9', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'一个小朋友在笑', optA:'开心', optB:'难过', optC:'生气', answer:'A', interaction:'点击1个选项', time:10, hint:'看看他在笑还是哭' },
  { id:'E10', dim:'情绪识别与社交', type:'单选', q:'吃饭时应该怎么做？', screen:'一家人在吃饭', optA:'边吃边玩玩具', optB:'安静好好吃', optC:'把不爱吃的扔掉', answer:'B', interaction:'点击1个选项', time:10, hint:'吃饭时要有好习惯' },
  // 分类与配对 C1-C14
  { id:'C1', dim:'分类与配对', type:'单选', q:'哪个不是水果？', screen:'苹果、香蕉、汽车、葡萄', optA:'苹果', optB:'汽车', optC:'葡萄', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是可以吃的水果？' },
  { id:'C2', dim:'分类与配对', type:'多选', q:'哪两个是穿在脚上的？', screen:'袜子、手套、鞋子、帽子', optA:'袜子', optB:'手套', optC:'鞋子', answer:'AC', interaction:'点击2个选项', time:20, hint:'想想早上穿鞋子还穿什么？' },
  { id:'C5', dim:'分类与配对', type:'单选', q:'面包和谁是好朋友？', screen:'面包、牛奶、积木', optA:'牛奶', optB:'积木', optC:'面包', answer:'A', interaction:'点击1个选项', time:15, hint:'早餐吃什么配面包？' },
  { id:'C6', dim:'分类与配对', type:'多选', q:'哪几个是天气？（多选）', screen:'太阳、下雨、下雪、月亮', optA:'太阳', optB:'下雨', optC:'下雪', answer:'ABC', interaction:'点击多个选项', time:20, hint:'天上出现什么是天气？月亮是天体' },
  { id:'C7', dim:'分类与配对', type:'单选', q:'钉子和谁是好朋友？', screen:'锤子、钉子、勺子', optA:'锤子', optB:'勺子', optC:'钉子', answer:'A', interaction:'点击1个选项', time:15, hint:'爸爸用什么敲钉子？' },
  { id:'C8', dim:'分类与配对', type:'单选', q:'雪人和哪个在一起？', screen:'雪人，选项：雪花/太阳/落叶', optA:'雪花', optB:'太阳', optC:'落叶', answer:'A', interaction:'点击1个选项', time:15, hint:'什么时候会有雪人？' },
  { id:'C9', dim:'分类与配对', type:'单选', q:'哪个不是动物？', screen:'小狗、小猫、花朵、兔子', optA:'小狗', optB:'花朵', optC:'兔子', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是有生命的动物？' },
  { id:'C10', dim:'分类与配对', type:'单选', q:'钥匙和谁是好朋友？', screen:'钥匙、锁、苹果', optA:'锁', optB:'苹果', optC:'钥匙', answer:'A', interaction:'点击1个选项', time:15, hint:'钥匙用来开什么？' },
  { id:'C11', dim:'分类与配对', type:'单选', q:'哪个不是交通工具？', screen:'汽车、巴士、自行车、花朵', optA:'汽车', optB:'花朵', optC:'自行车', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是路上跑的车？' },
  { id:'C12', dim:'分类与配对', type:'多选', q:'哪几个是学习用品？（多选）', screen:'铅笔、书本、游戏机、尺子', optA:'铅笔', optB:'书本', optC:'尺子', answer:'ABC', interaction:'点击多个选项', time:20, hint:'上学时书包里装什么？' },
  { id:'C13', dim:'分类与配对', type:'单选', q:'雨伞和谁是好朋友？', screen:'雨伞、太阳、下雨', optA:'太阳', optB:'下雨', optC:'雨伞', answer:'B', interaction:'点击1个选项', time:15, hint:'什么时候需要用雨伞？' },
  { id:'C14', dim:'分类与配对', type:'单选', q:'哪个不是蔬菜？', screen:'胡萝卜、白菜、番茄、篮球', optA:'胡萝卜', optB:'篮球', optC:'番茄', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是饭桌上吃的菜？' },
  // 常识与因果 K1-K16
  { id:'K1', dim:'常识与因果', type:'单选', q:'下雪天应该穿什么？', screen:'窗外在下大雪', optA:'短袖', optB:'棉袄', optC:'泳衣', answer:'B', interaction:'点击1个选项', time:10, hint:'下雪天冷还是热？' },
  { id:'K2', dim:'常识与因果', type:'单选', q:'大太阳时天空是什么颜色？', screen:'太阳高高挂', optA:'黑色', optB:'白色', optC:'蓝色', answer:'C', interaction:'点击1个选项', time:10, hint:'抬头看看晴天的天空' },
  { id:'K3', dim:'常识与因果', type:'单选', q:'木头放进水里会怎样？', screen:'一块木头放进水盆里', optA:'浮起来', optB:'沉下去', optC:'消失', answer:'A', interaction:'点击1个选项', time:15, hint:'你见过木头做的船吗？' },
  { id:'K4', dim:'常识与因果', type:'单选', q:'石头放进水里会怎样？', screen:'一块石头放进水盆里', optA:'浮起来', optB:'沉下去', optC:'融化', answer:'B', interaction:'点击1个选项', time:15, hint:'石头很重还是很轻？' },
  { id:'K5', dim:'常识与因果', type:'单选', q:'下雨前天上会怎样？', screen:'乌云密布', optA:'打雷闪电', optB:'出大太阳', optC:'刮大风', answer:'A', interaction:'点击1个选项', time:15, hint:'乌云来了之后经常听到什么？' },
  { id:'K6', dim:'常识与因果', type:'单选', q:'月亮和星星出来了，现在是？', screen:'月亮和星星挂在天上', optA:'白天', optB:'晚上', optC:'中午', answer:'B', interaction:'点击1个选项', time:10, hint:'什么时候能看到星星？' },
  { id:'K7', dim:'常识与因果', type:'单选', q:'火碰到冰会怎样？', screen:'火焰靠近冰块', optA:'变热', optB:'变冷', optC:'融化', answer:'C', interaction:'点击1个选项', time:15, hint:'冰遇热会变成什么？' },
  { id:'K8', dim:'常识与因果', type:'单选', q:'起火了应该用什么灭？', screen:'着火了！旁边有水、油、纸', optA:'水', optB:'油', optC:'纸', answer:'A', interaction:'点击1个选项', time:15, hint:'消防员叔叔用什么灭火？' },
  { id:'K9', dim:'常识与因果', type:'单选', q:'小树长大需要什么？', screen:'一棵小树苗', optA:'水和阳光', optB:'冰块', optC:'巧克力', answer:'A', interaction:'点击1个选项', time:15, hint:'植物需要喝水和晒太阳' },
  { id:'K10', dim:'常识与因果', type:'单选', q:'什么季节树叶会变黄掉下来？', screen:'地上落满了黄叶', optA:'春天', optB:'夏天', optC:'秋天', answer:'C', interaction:'点击1个选项', time:15, hint:'什么时候树叶会掉？' },
  { id:'K11', dim:'常识与因果', type:'单选', q:'蜜蜂采蜜后会做成什么？', screen:'蜜蜂在花朵上采蜜', optA:'蜂蜜', optB:'牛奶', optC:'面包', answer:'A', interaction:'点击1个选项', time:15, hint:'小蜜蜂采的花蜜变成了什么？' },
  { id:'K12', dim:'常识与因果', type:'单选', q:'天黑了看不见路，用什么？', screen:'外面天黑了', optA:'灯', optB:'冰块', optC:'球', answer:'A', interaction:'点击1个选项', time:10, hint:'天黑了要开什么才能看见？' },
  { id:'K13', dim:'常识与因果', type:'单选', q:'过马路前应该先做什么？', screen:'红绿灯路口', optA:'直接跑过去', optB:'左右看看', optC:'闭上眼睛', answer:'B', interaction:'点击1个选项', time:10, hint:'过马路要注意安全' },
  { id:'K14', dim:'常识与因果', type:'单选', q:'口渴了应该喝什么？', screen:'小朋友满头大汗', optA:'白开水', optB:'果汁', optC:'咖啡', answer:'A', interaction:'点击1个选项', time:10, hint:'最健康的饮料是什么？' },
  { id:'K15', dim:'常识与因果', type:'单选', q:'种子种到土里会怎样？', screen:'种子埋进土里', optA:'发芽长大', optB:'变成石头', optC:'消失不见', answer:'A', interaction:'点击1个选项', time:15, hint:'种子种下去会长出什么？' },
  { id:'K16', dim:'常识与因果', type:'单选', q:'冰块放在太阳下会怎样？', screen:'冰块放在太阳下', optA:'变成水', optB:'变成石头', optC:'变大', answer:'A', interaction:'点击1个选项', time:15, hint:'冰遇到热会变成什么？' },
  // 常识补充 K17-K24
  { id:'K17', dim:'常识与因果', type:'单选', q:'小鸟用什么飞翔？', screen:'小鸟在天上飞', optA:'翅膀', optB:'脚', optC:'尾巴', answer:'A', interaction:'点击1个选项', time:10, hint:'看看小鸟身上什么在扇动' },
  { id:'K18', dim:'常识与因果', type:'单选', q:'鱼用什么呼吸？', screen:'鱼在水里游', optA:'鼻子', optB:'鳃', optC:'嘴巴', answer:'B', interaction:'点击1个选项', time:15, hint:'鱼头两边有什么在动？' },
  { id:'K19', dim:'常识与因果', type:'单选', q:'彩虹有几种颜色？', screen:'雨后天边出现了彩虹', optA:'5种', optB:'7种', optC:'10种', answer:'B', interaction:'点击1个选项', time:15, hint:'红橙黄绿青蓝紫' },
  { id:'K20', dim:'常识与因果', type:'单选', q:'一年有几个季节？', screen:'春夏秋冬', optA:'2个', optB:'4个', optC:'6个', answer:'B', interaction:'点击1个选项', time:10, hint:'春夏秋冬一共几个？' },
  { id:'K21', dim:'常识与因果', type:'单选', q:'手脏了应该怎么做？', screen:'玩完泥巴手很脏', optA:'不洗直接吃', optB:'用肥皂洗手', optC:'在衣服上擦', answer:'B', interaction:'点击1个选项', time:10, hint:'手上细菌要洗掉' },
  { id:'K22', dim:'常识与因果', type:'单选', q:'晚上睡觉前应该做什么？', screen:'准备上床睡觉了', optA:'刷牙洗脸', optB:'吃糖果', optC:'看电视', answer:'A', interaction:'点击1个选项', time:10, hint:'保护牙齿要刷牙' },
  { id:'K23', dim:'常识与因果', type:'单选', q:'什么东西不能碰？', screen:'家里有这些东西', optA:'玩具', optB:'书本', optC:'插座和刀具', answer:'C', interaction:'点击1个选项', time:10, hint:'电和刀很危险' },
  { id:'K24', dim:'常识与因果', type:'单选', q:'迷路了应该怎么办？', screen:'在街上找不到爸爸妈妈了', optA:'跟陌生人走', optB:'找警察叔叔帮忙', optC:'自己乱跑', answer:'B', interaction:'点击1个选项', time:10, hint:'遇到困难找警察' },
  // 逻辑推理 L1-L8（纯文字）
  { id:'L1', dim:'逻辑推理', type:'单选', q:'小明比小红高，小红比小华高，谁最矮？', screen:'三个小朋友比身高', optA:'小明', optB:'小红', optC:'小华', answer:'C', interaction:'点击1个选项', time:20, hint:'一个比一个矮，最后那个最矮' },
  { id:'L2', dim:'逻辑推理', type:'单选', q:'所有的鸟都会飞，企鹅是鸟，企鹅会飞吗？', screen:'想想企鹅的样子', optA:'会飞', optB:'不会飞', optC:'不确定', answer:'B', interaction:'点击1个选项', time:20, hint:'企鹅虽然不会飞，但它是特殊的鸟' },
  { id:'L3', dim:'逻辑推理', type:'单选', q:'如果今天下雨，地上会怎样？', screen:'外面在下雨', optA:'变干', optB:'变湿', optC:'没变化', answer:'B', interaction:'点击1个选项', time:10, hint:'雨水落到地上会怎样？' },
  { id:'L4', dim:'逻辑推理', type:'单选', q:'小红今年5岁，明年她几岁？', screen:'过一年长一岁', optA:'4岁', optB:'5岁', optC:'6岁', answer:'C', interaction:'点击1个选项', time:10, hint:'过一年加一岁' },
  { id:'L5', dim:'逻辑推理', type:'单选', q:'桌子上有3个苹果，吃掉1个，还剩几个？', screen:'3个苹果吃掉1个', optA:'1个', optB:'2个', optC:'3个', answer:'B', interaction:'点击1个选项', time:10, hint:'3减1等于几？' },
  { id:'L6', dim:'逻辑推理', type:'单选', q:'昨天是星期三，今天是星期几？', screen:'一天过后', optA:'星期二', optB:'星期三', optC:'星期四', answer:'C', interaction:'点击1个选项', time:10, hint:'星期三过一天是星期几？' },
  { id:'L7', dim:'逻辑推理', type:'单选', q:'妈妈买了5颗糖，分给2个孩子，每人一样多，每人几颗？', screen:'5颗糖分给2个人', optA:'2颗', optB:'2颗半', optC:'3颗', answer:'B', interaction:'点击1个选项', time:20, hint:'5除以2等于多少？' },
  { id:'L8', dim:'逻辑推理', type:'单选', q:'如果红灯亮了，你应该怎么做？', screen:'路口红灯亮了', optA:'继续走', optB:'停下来等绿灯', optC:'跑过去', answer:'B', interaction:'点击1个选项', time:10, hint:'红灯停绿灯行' },
  // 记忆与注意力 M1-M4（纯文字）
  { id:'M1', dim:'记忆与注意力', type:'单选', q:'请记住：苹果、香蕉、牛奶。下面哪个不在里面？', screen:'刚才记了3样东西', optA:'苹果', optB:'香蕉', optC:'面包', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下刚才的3样东西' },
  { id:'M2', dim:'记忆与注意力', type:'单选', q:'请记住：红色、蓝色、绿色。绿色排第几？', screen:'刚才记了3种颜色', optA:'第1', optB:'第2', optC:'第3', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下顺序' },
  { id:'M3', dim:'记忆与注意力', type:'单选', q:'请记住：小狗、小猫、小兔。一共有几种动物？', screen:'刚才记了几种动物', optA:'2种', optB:'3种', optC:'4种', answer:'B', interaction:'点击1个选项', time:15, hint:'数数有几种' },
  { id:'M4', dim:'记忆与注意力', type:'单选', q:'请记住：3、7、1。最大的数是几？', screen:'刚才记了3个数字', optA:'1', optB:'3', optC:'7', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下哪最大' },
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

/** 生成10道大脑开发题（全部从纯文字题库随机抽取） */
function makeProblems() {
  const shuffled = shuffle([...BRAIN_QUESTIONS]);
  const problems = [];
  for (let i = 0; i < 10 && i < shuffled.length; i++) {
    problems.push(adaptQuestion(shuffled[i]));
  }

  // 如果题库不够10道，用旧题生成器补充（仅纯文字题）
  if (problems.length < 10) {
    const textMakers = [makeBigger, makeOpposite];
    const shuffledMakers = shuffle([...textMakers]);
    let mi = 0;
    while (problems.length < 10) {
      const fn = shuffledMakers[mi % shuffledMakers.length];
      const prob = fn();
      prob.qType = 'single-old';
      problems.push(prob);
      mi++;
    }
  }

  return problems;
}

/* ===== 旧题型生成器（仅保留纯文字题） ===== */

// 比大小
function makeBigger() {
  let a = randInt(1, 9), b = randInt(1, 9);
  while (b === a) b = randInt(1, 9);
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

// 反义词/相对
function makeOpposite() {
  const sets = [
    { q: '上的相反是？', a: '下', choices: ['下','左','右','前'] },
    { q: '大的相反是？', a: '小', choices: ['小','高','长','多'] },
    { q: '多的相反是？', a: '少', choices: ['少','大','高','长'] },
    { q: '白天的相反是？', a: '黑夜', choices: ['黑夜','早上','中午','下午'] },
    { q: '热的相反是？', a: '冷', choices: ['冷','温','暖','烫'] },
    { q: '快的相反是？', a: '慢', choices: ['慢','走','跑','停'] },
    { q: '长的相反是？', a: '短', choices: ['短','宽','高','粗'] },
    { q: '高兴的相反是？', a: '难过', choices: ['难过','生气','害怕','无聊'] },
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

  switch (p.qType) {
    case 'multi':       return renderMulti(p, cur, total);
    case 'single':      return renderSingleNew(p, cur, total);
    case 'single-old':
    default:            return renderSingleOld(p, cur, total);
  }
}

/* --- 旧单选题渲染（比大小/反义词） --- */
function renderSingleOld(p, cur, total) {
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

/* --- 新单选题渲染（结构化题库） --- */
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
