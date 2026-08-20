// views/quiz-brain.js — 大脑开发打卡（思维逻辑启蒙，10题，≥80%通过）
// 题型：图形规律、分类配对、情绪社交、常识因果、逻辑推理、记忆注意力、反义词、比大小

import { getState } from '../store.js';
import { submitQuiz } from '../tasks.js';
import { showOverlay, closeOverlay, switchTab, celebrate } from '../app.js';
import { esc, shuffle, randInt } from '../utils.js';

let state = null; // { task, problems, idx, answers: [] }

/* ===== 结构化题库 ===== */
const BRAIN_QUESTIONS = [
  // 图形规律与推理 G1-G51 (51题)
  { id:'G1', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：红圆 蓝圆 红圆 蓝圆 红圆 ？', optA:'红圆', optB:'蓝圆', optC:'黄圆', answer:'B', interaction:'点击1个选项', time:20, hint:'看看颜色是不是轮流出现？' },
  { id:'G2', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：红方 黄方 红方 黄方 红方 ？', optA:'红方', optB:'黄方', optC:'绿方', answer:'B', interaction:'点击1个选项', time:20, hint:'方块颜色在轮流变化' },
  { id:'G3', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：三角 圆 三角 圆 三角 ？', optA:'三角', optB:'圆', optC:'方', answer:'B', interaction:'点击1个选项', time:20, hint:'三角形和圆形轮流出现' },
  { id:'G4', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：猫 狗 猫 狗 猫 ？', optA:'猫', optB:'狗', optC:'老鼠', answer:'B', interaction:'点击1个选项', time:20, hint:'小猫和小狗轮流出现' },
  { id:'G5', dim:'图形规律与推理', type:'单选', q:'找出不一样的那个！', screen:'5个圆形：红红红红蓝，哪个颜色不一样？', optA:'第1个红圆', optB:'第3个红圆', optC:'第5个蓝圆', answer:'C', interaction:'点击1个选项', time:15, hint:'看看哪个颜色不一样' },
  { id:'G6', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：1个苹果 2个苹果 1个苹果 2个苹果 1个苹果 ？', optA:'1个苹果', optB:'2个苹果', optC:'3个苹果', answer:'B', interaction:'点击1个选项', time:25, hint:'数数每次有几个苹果，1个2个轮流' },
  { id:'G7', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：红 黄 蓝 红 黄 蓝 红 ？', optA:'红', optB:'黄', optC:'蓝', answer:'B', interaction:'点击1个选项', time:25, hint:'红黄蓝三个一组轮流出现' },
  { id:'G8', dim:'图形规律与推理', type:'单选', q:'哪个和其他不一样？', screen:'小狗 小猫 老鼠 花朵', optA:'小狗', optB:'花朵', optC:'老鼠', answer:'B', interaction:'点击1个选项', time:15, hint:'其他三个都是什么？' },
  { id:'G9', dim:'图形规律与推理', type:'单选', q:'哪个和其他不一样？', screen:'太阳 月亮 星星 小鱼', optA:'太阳', optB:'小鱼', optC:'月亮', answer:'B', interaction:'点击1个选项', time:15, hint:'其他三个都在哪里？' },
  { id:'G10', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：1颗星 2颗星 3颗星 4颗星 ？', optA:'5颗星', optB:'3颗星', optC:'1颗星', answer:'A', interaction:'点击1个选项', time:25, hint:'星星数量在变多还是变少？' },
  { id:'G11', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：大 小 大 小 大 ？', optA:'大', optB:'小', optC:'一样大', answer:'B', interaction:'点击1个选项', time:20, hint:'大小在轮流变化' },
  { id:'G12', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：上 下 上 下 上 ？', optA:'上', optB:'下', optC:'左', answer:'B', interaction:'点击1个选项', time:20, hint:'上下在轮流变化' },
  { id:'G13', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：圆 方 圆 方 圆 ？', optA:'圆', optB:'方', optC:'三角', answer:'B', interaction:'点击1个选项', time:20, hint:'圆形和方形轮流出现' },
  { id:'G14', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：红 蓝 红 蓝 红 蓝 红 ？', optA:'红', optB:'蓝', optC:'绿', answer:'B', interaction:'点击1个选项', time:20, hint:'红蓝轮流出现' },
  { id:'G15', dim:'图形规律与推理', type:'单选', q:'找出不一样的那个！', screen:'5个方块：蓝蓝蓝蓝红，哪个不一样？', optA:'第1个蓝方', optB:'第3个蓝方', optC:'第5个红方', answer:'C', interaction:'点击1个选项', time:15, hint:'看看哪个颜色不一样' },
  { id:'G16', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：1 2 1 2 1 ？', optA:'1', optB:'2', optC:'3', answer:'B', interaction:'点击1个选项', time:20, hint:'1和2轮流出现' },
  { id:'G17', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：苹果 香蕉 苹果 香蕉 苹果 ？', optA:'苹果', optB:'香蕉', optC:'橘子', answer:'B', interaction:'点击1个选项', time:20, hint:'苹果和香蕉轮流出现' },
  { id:'G18', dim:'图形规律与推理', type:'单选', q:'哪个和其他不一样？', screen:'苹果 香蕉 橘子 积木', optA:'苹果', optB:'积木', optC:'香蕉', answer:'B', interaction:'点击1个选项', time:15, hint:'其他三个都可以吃' },
  { id:'G19', dim:'图形规律与推理', type:'单选', q:'哪个和其他不一样？', screen:'汽车 巴士 自行车 电视机', optA:'汽车', optB:'电视机', optC:'巴士', answer:'B', interaction:'点击1个选项', time:15, hint:'其他三个都是什么？' },
  { id:'G20', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：大圆 小圆 大圆 小圆 大圆 ？', optA:'大圆', optB:'小圆', optC:'一样大', answer:'B', interaction:'点击1个选项', time:25, hint:'大小在轮流变化' },
  { id:'G21', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：红三角 蓝三角 红三角 蓝三角 红三角 ？', optA:'红三角', optB:'蓝三角', optC:'绿三角', answer:'B', interaction:'点击1个选项', time:25, hint:'颜色在轮流变化' },
  { id:'G22', dim:'图形规律与推理', type:'单选', q:'找出不一样的那个！', screen:'4个图形：圆圆圆圆方，哪个不一样？', optA:'第1个圆', optB:'第3个圆', optC:'第5个方', answer:'C', interaction:'点击1个选项', time:15, hint:'看看哪个形状不一样' },
  { id:'G23', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：2 4 2 4 2 ？', optA:'2', optB:'4', optC:'6', answer:'B', interaction:'点击1个选项', time:25, hint:'2和4轮流出现' },
  { id:'G24', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：太阳 月亮 太阳 月亮 太阳 ？', optA:'太阳', optB:'月亮', optC:'星星', answer:'B', interaction:'点击1个选项', time:20, hint:'太阳和月亮轮流出现' },
  { id:'G25', dim:'图形规律与推理', type:'单选', q:'哪个和其他不一样？', screen:'红花 蓝花 黄花 红球', optA:'红花', optB:'红球', optC:'蓝花', answer:'B', interaction:'点击1个选项', time:15, hint:'其他三个都是什么？' },
  { id:'G26', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：左 右 左 右 左 ？', optA:'左', optB:'右', optC:'上', answer:'B', interaction:'点击1个选项', time:20, hint:'左右在轮流变化' },
  { id:'G27', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：大三角 小三角 大三角 小三角 大三角 ？', optA:'大三角', optB:'小三角', optC:'一样大', answer:'B', interaction:'点击1个选项', time:25, hint:'大小在轮流变化' },
  { id:'G28', dim:'图形规律与推理', type:'单选', q:'找出不一样的那个！', screen:'5个三角形：红红红红蓝，哪个不一样？', optA:'第1个红三角', optB:'第3个红三角', optC:'第5个蓝三角', answer:'C', interaction:'点击1个选项', time:15, hint:'看看哪个颜色不一样' },
  { id:'G29', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：1个圆 2个圆 3个圆 4个圆 ？', optA:'5个圆', optB:'3个圆', optC:'1个圆', answer:'A', interaction:'点击1个选项', time:25, hint:'圆的数量在变多' },
  { id:'G30', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：红 黄 红 黄 红 黄 红 ？', optA:'红', optB:'黄', optC:'蓝', answer:'B', interaction:'点击1个选项', time:20, hint:'红黄轮流出现' },
  { id:'G31', dim:'图形规律与推理', type:'单选', q:'哪个和其他不一样？', screen:'狗 猫 兔子 椅子', optA:'狗', optB:'椅子', optC:'猫', answer:'B', interaction:'点击1个选项', time:15, hint:'其他三个都是动物' },
  { id:'G32', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：方 圆 三角 方 圆 三角 方 ？', optA:'方', optB:'圆', optC:'三角', answer:'B', interaction:'点击1个选项', time:25, hint:'方圆三角三个一组轮流' },
  { id:'G33', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：大 大 小 大 大 小 大 大 ？', optA:'大', optB:'小', optC:'一样大', answer:'B', interaction:'点击1个选项', time:30, hint:'两个大一个小轮流' },
  { id:'G34', dim:'图形规律与推理', type:'单选', q:'找出不一样的那个！', screen:'5个图形：方方方方圆，哪个不一样？', optA:'第1个方', optB:'第3个方', optC:'第5个圆', answer:'C', interaction:'点击1个选项', time:15, hint:'看看哪个形状不一样' },
  { id:'G35', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：红圆 蓝方 红圆 蓝方 红圆 ？', optA:'红圆', optB:'蓝方', optC:'绿圆', answer:'B', interaction:'点击1个选项', time:25, hint:'红圆和蓝方轮流出现' },
  { id:'G36', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：3 1 3 1 3 ？', optA:'3', optB:'1', optC:'2', answer:'B', interaction:'点击1个选项', time:20, hint:'3和1轮流出现' },
  { id:'G37', dim:'图形规律与推理', type:'单选', q:'哪个和其他不一样？', screen:'桌子 椅子 床 苹果', optA:'桌子', optB:'苹果', optC:'椅子', answer:'B', interaction:'点击1个选项', time:15, hint:'其他三个都是家具' },
  { id:'G38', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：猫 狗 鸟 猫 狗 鸟 猫 ？', optA:'猫', optB:'狗', optC:'鸟', answer:'B', interaction:'点击1个选项', time:30, hint:'猫狗鸟三个一组轮流' },
  { id:'G39', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：1颗星 3颗星 1颗星 3颗星 1颗星 ？', optA:'1颗星', optB:'3颗星', optC:'2颗星', answer:'B', interaction:'点击1个选项', time:25, hint:'1颗和3颗轮流出现' },
  { id:'G40', dim:'图形规律与推理', type:'单选', q:'找出不一样的那个！', screen:'5个圆：蓝蓝蓝蓝红，哪个不一样？', optA:'第1个蓝圆', optB:'第3个蓝圆', optC:'第5个红圆', answer:'C', interaction:'点击1个选项', time:15, hint:'看看哪个颜色不一样' },
  { id:'G41', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：红 绿 红 绿 红 绿 红 ？', optA:'红', optB:'绿', optC:'黄', answer:'B', interaction:'点击1个选项', time:20, hint:'红绿轮流出现' },
  { id:'G42', dim:'图形规律与推理', type:'单选', q:'哪个和其他不一样？', screen:'铅笔 橡皮 尺子 香蕉', optA:'铅笔', optB:'香蕉', optC:'橡皮', answer:'B', interaction:'点击1个选项', time:15, hint:'其他三个都是学习用品' },
  { id:'G43', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：大 小 大 小 大 小 大 ？', optA:'大', optB:'小', optC:'一样大', answer:'B', interaction:'点击1个选项', time:20, hint:'大小轮流出现' },
  { id:'G44', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：圆 三角 圆 三角 圆 ？', optA:'圆', optB:'三角', optC:'方', answer:'B', interaction:'点击1个选项', time:20, hint:'圆和三角轮流出现' },
  { id:'G45', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：2个苹果 1个苹果 2个苹果 1个苹果 2个苹果 ？', optA:'2个苹果', optB:'1个苹果', optC:'3个苹果', answer:'B', interaction:'点击1个选项', time:25, hint:'2个和1个轮流出现' },
  { id:'G46', dim:'图形规律与推理', type:'单选', q:'找出不一样的那个！', screen:'4个图形：三角三角三角圆，哪个不一样？', optA:'第1个三角', optB:'第3个三角', optC:'第4个圆', answer:'C', interaction:'点击1个选项', time:15, hint:'看看哪个形状不一样' },
  { id:'G47', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：红 黄 红 黄 红 ？', optA:'红', optB:'黄', optC:'蓝', answer:'B', interaction:'点击1个选项', time:20, hint:'红黄轮流出现' },
  { id:'G48', dim:'图形规律与推理', type:'单选', q:'哪个和其他不一样？', screen:'牛奶 果汁 白开水 铅笔', optA:'牛奶', optB:'铅笔', optC:'果汁', answer:'B', interaction:'点击1个选项', time:15, hint:'其他三个都是饮料' },
  { id:'G49', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：5 3 5 3 5 ？', optA:'5', optB:'3', optC:'4', answer:'B', interaction:'点击1个选项', time:25, hint:'5和3轮流出现' },
  { id:'G50', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：太阳 云 太阳 云 太阳 云 太阳 ？', optA:'太阳', optB:'云', optC:'月亮', answer:'B', interaction:'点击1个选项', time:25, hint:'太阳和云轮流出现' },
  { id:'G51', dim:'图形规律与推理', type:'单选', q:'下一个是什么？', screen:'序列：红蓝红蓝红蓝红蓝红 ？', optA:'红', optB:'蓝', optC:'绿', answer:'B', interaction:'点击1个选项', time:25, hint:'红蓝轮流出现' },
  // 情绪识别与社交 E1-E45 (45题)
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
  { id:'E11', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'小朋友举着奖杯，笑得很开心', optA:'开心', optB:'难过', optC:'害怕', answer:'A', interaction:'点击1个选项', time:10, hint:'举着奖杯笑是什么心情？' },
  { id:'E12', dim:'情绪识别与社交', type:'单选', q:'她是什么心情？', screen:'小女孩抱着新娃娃蹦蹦跳跳', optA:'开心', optB:'难过', optC:'生气', answer:'A', interaction:'点击1个选项', time:10, hint:'蹦蹦跳跳说明什么？' },
  { id:'E13', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'小朋友抱着胳膊嘟着嘴', optA:'开心', optB:'生气', optC:'害怕', answer:'B', interaction:'点击1个选项', time:15, hint:'嘟着嘴是什么心情？' },
  { id:'E14', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'小朋友躲在妈妈身后不敢出来', optA:'开心', optB:'害怕', optC:'难过', answer:'B', interaction:'点击1个选项', time:15, hint:'躲起来说明什么心情？' },
  { id:'E15', dim:'情绪识别与社交', type:'单选', q:'他需要什么？', screen:'小朋友摸着肚子咕咕叫', optA:'吃饭', optB:'睡觉', optC:'喝水', answer:'A', interaction:'点击1个选项', time:10, hint:'肚子咕咕叫是想干什么？' },
  { id:'E16', dim:'情绪识别与社交', type:'单选', q:'哪个行为是对的？', screen:'A：排队插队  B：排队等候', optA:'插队', optB:'排队等候', optC:'都可以', answer:'B', interaction:'点击1个选项', time:10, hint:'排队时要怎么做？' },
  { id:'E17', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'小朋友考了100分，蹦蹦跳跳回家', optA:'开心', optB:'难过', optC:'害怕', answer:'A', interaction:'点击1个选项', time:10, hint:'考了好成绩会怎样？' },
  { id:'E18', dim:'情绪识别与社交', type:'单选', q:'她是什么心情？', screen:'小女孩的气球飞走了', optA:'开心', optB:'难过', optC:'生气', answer:'B', interaction:'点击1个选项', time:15, hint:'气球飞走了会怎样？' },
  { id:'E19', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'小朋友看到大狗朝他跑来', optA:'开心', optB:'害怕', optC:'难过', answer:'B', interaction:'点击1个选项', time:15, hint:'大狗跑来可能害怕' },
  { id:'E20', dim:'情绪识别与社交', type:'单选', q:'哪个行为是对的？', screen:'A：打人  B：好好说话', optA:'打人', optB:'好好说话', optC:'都可以', answer:'B', interaction:'点击1个选项', time:10, hint:'有矛盾应该怎么办？' },
  { id:'E21', dim:'情绪识别与社交', type:'单选', q:'他需要什么？', screen:'小朋友满头大汗，嘴唇干', optA:'喝水', optB:'穿衣', optC:'睡觉', answer:'A', interaction:'点击1个选项', time:15, hint:'出汗嘴唇干需要什么？' },
  { id:'E22', dim:'情绪识别与社交', type:'单选', q:'她是什么心情？', screen:'妈妈给小女孩扎了漂亮辫子，她照镜子', optA:'开心', optB:'难过', optC:'生气', answer:'A', interaction:'点击1个选项', time:15, hint:'扎了漂亮辫子会开心' },
  { id:'E23', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'小朋友的冰淇淋掉地上了', optA:'开心', optB:'难过', optC:'害怕', answer:'B', interaction:'点击1个选项', time:15, hint:'冰淇淋掉了会难过' },
  { id:'E24', dim:'情绪识别与社交', type:'单选', q:'哪个行为是对的？', screen:'A：在图书馆大声说话  B：在图书馆小声说话', optA:'大声说话', optB:'小声说话', optC:'都可以', answer:'B', interaction:'点击1个选项', time:15, hint:'图书馆要安静' },
  { id:'E25', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'小朋友第一次上学，拉着妈妈手不放', optA:'开心', optB:'害怕', optC:'生气', answer:'B', interaction:'点击1个选项', time:15, hint:'拉着妈妈手说明什么？' },
  { id:'E26', dim:'情绪识别与社交', type:'单选', q:'他需要什么？', screen:'小朋友冷得发抖', optA:'脱衣服', optB:'穿厚衣服', optC:'吃冰棍', answer:'B', interaction:'点击1个选项', time:10, hint:'冷的时候要穿什么？' },
  { id:'E27', dim:'情绪识别与社交', type:'单选', q:'哪个行为是对的？', screen:'A：随手扔垃圾  B：扔进垃圾桶', optA:'随手扔', optB:'扔进垃圾桶', optC:'都可以', answer:'B', interaction:'点击1个选项', time:10, hint:'垃圾要扔到哪里？' },
  { id:'E28', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'小朋友被老师表扬了', optA:'开心', optB:'难过', optC:'害怕', answer:'A', interaction:'点击1个选项', time:10, hint:'被表扬会怎样？' },
  { id:'E29', dim:'情绪识别与社交', type:'单选', q:'她是什么心情？', screen:'小女孩的花被踩坏了', optA:'开心', optB:'难过', optC:'生气', answer:'C', interaction:'点击1个选项', time:15, hint:'花被踩坏了会怎样？' },
  { id:'E30', dim:'情绪识别与社交', type:'单选', q:'哪个行为是对的？', screen:'A：抢座位  B：让座给老人', optA:'抢座位', optB:'让座给老人', optC:'都可以', answer:'B', interaction:'点击1个选项', time:10, hint:'要尊敬老人' },
  { id:'E31', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'小朋友在黑屋子里不敢动', optA:'开心', optB:'害怕', optC:'生气', answer:'B', interaction:'点击1个选项', time:15, hint:'黑屋子会让人害怕' },
  { id:'E32', dim:'情绪识别与社交', type:'单选', q:'他需要什么？', screen:'小朋友咳嗽流鼻涕', optA:'看医生', optB:'吃冰棍', optC:'跑步', answer:'A', interaction:'点击1个选项', time:15, hint:'生病了要怎么办？' },
  { id:'E33', dim:'情绪识别与社交', type:'单选', q:'哪个行为是对的？', screen:'A：浪费食物  B：把饭吃干净', optA:'浪费食物', optB:'把饭吃干净', optC:'都可以', answer:'B', interaction:'点击1个选项', time:10, hint:'要爱惜粮食' },
  { id:'E34', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'小朋友等了很久玩具还没来', optA:'开心', optB:'着急', optC:'害怕', answer:'B', interaction:'点击1个选项', time:15, hint:'等很久会着急' },
  { id:'E35', dim:'情绪识别与社交', type:'单选', q:'她是什么心情？', screen:'小女孩被同学嘲笑了', optA:'开心', optB:'难过', optC:'兴奋', answer:'B', interaction:'点击1个选项', time:15, hint:'被嘲笑会难过' },
  { id:'E36', dim:'情绪识别与社交', type:'单选', q:'哪个行为是对的？', screen:'A：对老师没礼貌  B：对老师有礼貌', optA:'没礼貌', optB:'有礼貌', optC:'都可以', answer:'B', interaction:'点击1个选项', time:10, hint:'对老师要有礼貌' },
  { id:'E37', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'小朋友第一次骑自行车没辅助轮', optA:'开心', optB:'害怕', optC:'生气', answer:'B', interaction:'点击1个选项', time:15, hint:'第一次骑车可能害怕' },
  { id:'E38', dim:'情绪识别与社交', type:'单选', q:'他需要什么？', screen:'小朋友在外面玩到天黑了', optA:'回家', optB:'继续玩', optC:'睡觉', answer:'A', interaction:'点击1个选项', time:10, hint:'天黑了应该怎么办？' },
  { id:'E39', dim:'情绪识别与社交', type:'单选', q:'哪个行为是对的？', screen:'A：打断别人说话  B：等别人说完再说话', optA:'打断别人', optB:'等别人说完', optC:'都可以', answer:'B', interaction:'点击1个选项', time:15, hint:'要尊重别人说话' },
  { id:'E40', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'小朋友的画被贴在墙上展示', optA:'开心', optB:'难过', optC:'害怕', answer:'A', interaction:'点击1个选项', time:10, hint:'画被展示会开心' },
  { id:'E41', dim:'情绪识别与社交', type:'单选', q:'她是什么心情？', screen:'小女孩的宠物生病了', optA:'开心', optB:'难过', optC:'兴奋', answer:'B', interaction:'点击1个选项', time:15, hint:'宠物生病会难过' },
  { id:'E42', dim:'情绪识别与社交', type:'单选', q:'哪个行为是对的？', screen:'A：在走廊奔跑  B：在走廊慢慢走', optA:'奔跑', optB:'慢慢走', optC:'都可以', answer:'B', interaction:'点击1个选项', time:10, hint:'走廊里要慢慢走' },
  { id:'E43', dim:'情绪识别与社交', type:'单选', q:'他是什么心情？', screen:'小朋友终于学会了系鞋带', optA:'开心', optB:'难过', optC:'害怕', answer:'A', interaction:'点击1个选项', time:15, hint:'学会新本领会开心' },
  { id:'E44', dim:'情绪识别与社交', type:'单选', q:'他需要什么？', screen:'小朋友鼻子流血了', optA:'低头', optB:'仰头', optC:'跑步', answer:'A', interaction:'点击1个选项', time:15, hint:'流鼻血要低头' },
  { id:'E45', dim:'情绪识别与社交', type:'单选', q:'哪个行为是对的？', screen:'A：玩具乱扔  B：玩具收整齐', optA:'乱扔', optB:'收整齐', optC:'都可以', answer:'B', interaction:'点击1个选项', time:10, hint:'玩完玩具要收好' },
  // 分类与配对 C1-C50 (51题)
  { id:'C1', dim:'分类与配对', type:'单选', q:'哪个不是水果？', screen:'苹果、香蕉、汽车、葡萄', optA:'苹果', optB:'汽车', optC:'葡萄', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是可以吃的水果？' },
  { id:'C2', dim:'分类与配对', type:'单选', q:'面包和谁是好朋友？', screen:'面包、牛奶、积木', optA:'牛奶', optB:'积木', optC:'面包', answer:'A', interaction:'点击1个选项', time:15, hint:'早餐吃什么配面包？' },
  { id:'C3', dim:'分类与配对', type:'单选', q:'钉子和谁是好朋友？', screen:'锤子、钉子、勺子', optA:'锤子', optB:'勺子', optC:'钉子', answer:'A', interaction:'点击1个选项', time:15, hint:'爸爸用什么敲钉子？' },
  { id:'C4', dim:'分类与配对', type:'单选', q:'雪人和哪个在一起？', screen:'雪人，选项：雪花/太阳/落叶', optA:'雪花', optB:'太阳', optC:'落叶', answer:'A', interaction:'点击1个选项', time:15, hint:'什么时候会有雪人？' },
  { id:'C5', dim:'分类与配对', type:'单选', q:'哪个不是动物？', screen:'小狗、小猫、花朵、兔子', optA:'小狗', optB:'花朵', optC:'兔子', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是有生命的动物？' },
  { id:'C6', dim:'分类与配对', type:'单选', q:'钥匙和谁是好朋友？', screen:'钥匙、锁、苹果', optA:'锁', optB:'苹果', optC:'钥匙', answer:'A', interaction:'点击1个选项', time:15, hint:'钥匙用来开什么？' },
  { id:'C7', dim:'分类与配对', type:'单选', q:'哪个不是交通工具？', screen:'汽车、巴士、自行车、花朵', optA:'汽车', optB:'花朵', optC:'自行车', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是路上跑的车？' },
  { id:'C8', dim:'分类与配对', type:'单选', q:'雨伞和谁是好朋友？', screen:'雨伞、太阳、下雨', optA:'太阳', optB:'下雨', optC:'雨伞', answer:'B', interaction:'点击1个选项', time:15, hint:'什么时候需要用雨伞？' },
  { id:'C9', dim:'分类与配对', type:'单选', q:'哪个不是蔬菜？', screen:'胡萝卜、白菜、番茄、篮球', optA:'胡萝卜', optB:'篮球', optC:'番茄', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是饭桌上吃的菜？' },
  { id:'C10', dim:'分类与配对', type:'单选', q:'哪个不是文具？', screen:'铅笔、橡皮、尺子、饼干', optA:'铅笔', optB:'饼干', optC:'橡皮', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是学习用的？' },
  { id:'C11', dim:'分类与配对', type:'单选', q:'哪个不是家具？', screen:'桌子、椅子、床、苹果', optA:'桌子', optB:'苹果', optC:'椅子', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是家里的家具？' },
  { id:'C12', dim:'分类与配对', type:'单选', q:'哪个不是电器？', screen:'电视、冰箱、洗衣机、毛巾', optA:'电视', optB:'毛巾', optC:'冰箱', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些要插电用？' },
  { id:'C13', dim:'分类与配对', type:'单选', q:'哪个不是颜色？', screen:'红色、蓝色、绿色、苹果', optA:'红色', optB:'苹果', optC:'蓝色', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是颜色？' },
  { id:'C14', dim:'分类与配对', type:'单选', q:'哪个不是形状？', screen:'圆形、方形、三角形、香蕉', optA:'圆形', optB:'香蕉', optC:'方形', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是形状？' },
  { id:'C15', dim:'分类与配对', type:'单选', q:'哪个不是饮料？', screen:'牛奶、果汁、白开水、面包', optA:'牛奶', optB:'面包', optC:'果汁', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是可以喝的？' },
  { id:'C16', dim:'分类与配对', type:'单选', q:'哪个不是乐器？', screen:'钢琴、小提琴、鼓、椅子', optA:'钢琴', optB:'椅子', optC:'鼓', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些能演奏音乐？' },
  { id:'C17', dim:'分类与配对', type:'单选', q:'哪个不是球类？', screen:'足球、篮球、乒乓球、书本', optA:'足球', optB:'书本', optC:'篮球', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是球？' },
  { id:'C18', dim:'分类与配对', type:'单选', q:'哪个不是昆虫？', screen:'蝴蝶、蚂蚁、蜜蜂、小鱼', optA:'蝴蝶', optB:'小鱼', optC:'蚂蚁', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是小虫子？' },
  { id:'C19', dim:'分类与配对', type:'单选', q:'哪个不是花？', screen:'玫瑰、向日葵、百合、白菜', optA:'玫瑰', optB:'白菜', optC:'百合', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是花？' },
  { id:'C20', dim:'分类与配对', type:'单选', q:'哪个不是树？', screen:'松树、柳树、苹果树、石头', optA:'松树', optB:'石头', optC:'柳树', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是树？' },
  { id:'C21', dim:'分类与配对', type:'单选', q:'哪个不是鸟？', screen:'麻雀、燕子、老鹰、小狗', optA:'麻雀', optB:'小狗', optC:'燕子', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些会飞是鸟？' },
  { id:'C22', dim:'分类与配对', type:'单选', q:'哪个不是鱼？', screen:'金鱼、鲨鱼、鲤鱼、小猫', optA:'金鱼', optB:'小猫', optC:'鲤鱼', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些在水里游是鱼？' },
  { id:'C23', dim:'分类与配对', type:'单选', q:'哪个不是水果？', screen:'西瓜、菠萝、芒果、毛巾', optA:'西瓜', optB:'毛巾', optC:'菠萝', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是可以吃的水果？' },
  { id:'C24', dim:'分类与配对', type:'单选', q:'哪个不是蔬菜？', screen:'黄瓜、茄子、辣椒、糖果', optA:'黄瓜', optB:'糖果', optC:'茄子', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是饭桌上吃的菜？' },
  { id:'C25', dim:'分类与配对', type:'单选', q:'哪个不是文具？', screen:'彩笔、剪刀、胶水、玩具车', optA:'彩笔', optB:'玩具车', optC:'剪刀', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是学习用的？' },
  { id:'C26', dim:'分类与配对', type:'单选', q:'哪个不是家具？', screen:'沙发、衣柜、书架、小狗', optA:'沙发', optB:'小狗', optC:'衣柜', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是家里的家具？' },
  { id:'C27', dim:'分类与配对', type:'单选', q:'哪个不是电器？', screen:'空调、电风扇、台灯、积木', optA:'空调', optB:'积木', optC:'电风扇', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些要插电用？' },
  { id:'C28', dim:'分类与配对', type:'单选', q:'哪个不是颜色？', screen:'黄色、紫色、橙色、桌子', optA:'黄色', optB:'桌子', optC:'紫色', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是颜色？' },
  { id:'C29', dim:'分类与配对', type:'单选', q:'哪个不是形状？', screen:'圆形、方形、三角形、小狗', optA:'圆形', optB:'小狗', optC:'方形', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是形状？' },
  { id:'C30', dim:'分类与配对', type:'单选', q:'哪个不是饮料？', screen:'豆浆、酸奶、矿泉水、饼干', optA:'豆浆', optB:'饼干', optC:'酸奶', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是可以喝的？' },
  { id:'C31', dim:'分类与配对', type:'单选', q:'哪个不是乐器？', screen:'吉他、笛子、口琴、苹果', optA:'吉他', optB:'苹果', optC:'笛子', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些能演奏音乐？' },
  { id:'C32', dim:'分类与配对', type:'单选', q:'哪个不是球类？', screen:'排球、网球、羽毛球、椅子', optA:'排球', optB:'椅子', optC:'网球', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是球？' },
  { id:'C33', dim:'分类与配对', type:'单选', q:'哪个不是昆虫？', screen:'蜻蜓、瓢虫、蚂蚱、小猫', optA:'蜻蜓', optB:'小猫', optC:'瓢虫', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是小虫子？' },
  { id:'C34', dim:'分类与配对', type:'单选', q:'哪个不是花？', screen:'菊花、荷花、茉莉、萝卜', optA:'菊花', optB:'萝卜', optC:'荷花', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是花？' },
  { id:'C35', dim:'分类与配对', type:'单选', q:'哪个不是树？', screen:'柏树、杨树、榕树、汽车', optA:'柏树', optB:'汽车', optC:'杨树', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是树？' },
  { id:'C36', dim:'分类与配对', type:'单选', q:'哪个不是鸟？', screen:'鸽子、喜鹊、乌鸦、小鱼', optA:'鸽子', optB:'小鱼', optC:'喜鹊', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些会飞是鸟？' },
  { id:'C37', dim:'分类与配对', type:'单选', q:'哪个不是鱼？', screen:'带鱼、鲫鱼、鲈鱼、小兔', optA:'带鱼', optB:'小兔', optC:'鲫鱼', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些在水里游是鱼？' },
  { id:'C38', dim:'分类与配对', type:'单选', q:'哪个不是水果？', screen:'樱桃、荔枝、桂圆、橡皮', optA:'樱桃', optB:'橡皮', optC:'荔枝', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是可以吃的水果？' },
  { id:'C39', dim:'分类与配对', type:'单选', q:'哪个不是蔬菜？', screen:'菠菜、冬瓜、丝瓜、手机', optA:'菠菜', optB:'手机', optC:'冬瓜', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是饭桌上吃的菜？' },
  { id:'C40', dim:'分类与配对', type:'单选', q:'哪个不是文具？', screen:'圆规、订书机、文件夹、蛋糕', optA:'圆规', optB:'蛋糕', optC:'订书机', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是学习用的？' },
  { id:'C41', dim:'分类与配对', type:'单选', q:'哪个不是天气？', screen:'晴天、雨天、下雪、苹果', optA:'晴天', optB:'苹果', optC:'雨天', answer:'B', interaction:'点击1个选项', time:15, hint:'哪些是天上的天气？' },
  { id:'C41', dim:'分类与配对', type:'多选', q:'哪两个是穿在脚上的？', screen:'袜子、手套、鞋子、帽子', optA:'袜子', optB:'手套', optC:'鞋子', answer:'AC', interaction:'点击多个选项', time:20, hint:'想想早上穿鞋子还穿什么？' },
  { id:'C42', dim:'分类与配对', type:'多选', q:'哪几个是天气？（多选）', screen:'太阳、下雨、下雪、月亮', optA:'太阳', optB:'下雨', optC:'下雪', answer:'ABC', interaction:'点击多个选项', time:20, hint:'天上出现什么是天气？月亮是天体' },
  { id:'C43', dim:'分类与配对', type:'多选', q:'哪几个是学习用品？（多选）', screen:'铅笔、书本、游戏机、尺子', optA:'铅笔', optB:'书本', optC:'尺子', answer:'ABC', interaction:'点击多个选项', time:20, hint:'上学时书包里装什么？' },
  { id:'C44', dim:'分类与配对', type:'多选', q:'哪几个是水果？（多选）', screen:'苹果、香蕉、面包、橘子', optA:'苹果', optB:'香蕉', optC:'橘子', answer:'ABC', interaction:'点击多个选项', time:20, hint:'哪些是可以吃的水果？' },
  { id:'C45', dim:'分类与配对', type:'多选', q:'哪几个是动物？（多选）', screen:'小狗、小猫、桌子、兔子', optA:'小狗', optB:'小猫', optC:'兔子', answer:'ABC', interaction:'点击多个选项', time:20, hint:'哪些是有生命的动物？' },
  { id:'C46', dim:'分类与配对', type:'多选', q:'哪几个是蔬菜？（多选）', screen:'胡萝卜、白菜、糖果、番茄', optA:'胡萝卜', optB:'白菜', optC:'番茄', answer:'ABC', interaction:'点击多个选项', time:20, hint:'哪些是饭桌上吃的菜？' },
  { id:'C47', dim:'分类与配对', type:'多选', q:'哪几个是交通工具？（多选）', screen:'汽车、巴士、电视、自行车', optA:'汽车', optB:'巴士', optC:'自行车', answer:'ABC', interaction:'点击多个选项', time:20, hint:'哪些是路上跑的车？' },
  { id:'C48', dim:'分类与配对', type:'多选', q:'哪几个是颜色？（多选）', screen:'红色、蓝色、苹果、绿色', optA:'红色', optB:'蓝色', optC:'绿色', answer:'ABC', interaction:'点击多个选项', time:20, hint:'哪些是颜色？' },
  { id:'C49', dim:'分类与配对', type:'多选', q:'哪几个是文具？（多选）', screen:'铅笔、橡皮、饼干、尺子', optA:'铅笔', optB:'橡皮', optC:'尺子', answer:'ABC', interaction:'点击多个选项', time:20, hint:'哪些是学习用的？' },
  { id:'C50', dim:'分类与配对', type:'多选', q:'哪几个是家具？（多选）', screen:'桌子、椅子、小狗、床', optA:'桌子', optB:'椅子', optC:'床', answer:'ABC', interaction:'点击多个选项', time:20, hint:'哪些是家里的家具？' },
  // 常识与因果 K1-K74 (74题)
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
  { id:'K17', dim:'常识与因果', type:'单选', q:'小鸟用什么飞翔？', screen:'小鸟在天上飞', optA:'翅膀', optB:'脚', optC:'尾巴', answer:'A', interaction:'点击1个选项', time:10, hint:'看看小鸟身上什么在扇动' },
  { id:'K18', dim:'常识与因果', type:'单选', q:'鱼用什么呼吸？', screen:'鱼在水里游', optA:'鼻子', optB:'鳃', optC:'嘴巴', answer:'B', interaction:'点击1个选项', time:15, hint:'鱼头两边有什么在动？' },
  { id:'K19', dim:'常识与因果', type:'单选', q:'彩虹有几种颜色？', screen:'雨后天边出现了彩虹', optA:'5种', optB:'7种', optC:'10种', answer:'B', interaction:'点击1个选项', time:15, hint:'红橙黄绿青蓝紫' },
  { id:'K20', dim:'常识与因果', type:'单选', q:'一年有几个季节？', screen:'春夏秋冬', optA:'2个', optB:'4个', optC:'6个', answer:'B', interaction:'点击1个选项', time:10, hint:'春夏秋冬一共几个？' },
  { id:'K21', dim:'常识与因果', type:'单选', q:'手脏了应该怎么做？', screen:'玩完泥巴手很脏', optA:'不洗直接吃', optB:'用肥皂洗手', optC:'在衣服上擦', answer:'B', interaction:'点击1个选项', time:10, hint:'手上细菌要洗掉' },
  { id:'K22', dim:'常识与因果', type:'单选', q:'晚上睡觉前应该做什么？', screen:'准备上床睡觉了', optA:'刷牙洗脸', optB:'吃糖果', optC:'看电视', answer:'A', interaction:'点击1个选项', time:10, hint:'保护牙齿要刷牙' },
  { id:'K23', dim:'常识与因果', type:'单选', q:'什么东西不能碰？', screen:'家里有这些东西', optA:'玩具', optB:'书本', optC:'插座和刀具', answer:'C', interaction:'点击1个选项', time:10, hint:'电和刀很危险' },
  { id:'K24', dim:'常识与因果', type:'单选', q:'迷路了应该怎么办？', screen:'在街上找不到爸爸妈妈了', optA:'跟陌生人走', optB:'找警察叔叔帮忙', optC:'自己乱跑', answer:'B', interaction:'点击1个选项', time:10, hint:'遇到困难找警察' },
  { id:'K25', dim:'常识与因果', type:'单选', q:'太阳从哪边升起？', screen:'早晨太阳出来了', optA:'东边', optB:'西边', optC:'北边', answer:'A', interaction:'点击1个选项', time:10, hint:'太阳从东边升起' },
  { id:'K26', dim:'常识与因果', type:'单选', q:'太阳从哪边落下？', screen:'傍晚太阳下山了', optA:'东边', optB:'西边', optC:'北边', answer:'B', interaction:'点击1个选项', time:10, hint:'太阳从西边落下' },
  { id:'K27', dim:'常识与因果', type:'单选', q:'什么动物会汪汪叫？', screen:'听到汪汪叫', optA:'小猫', optB:'小狗', optC:'小鸡', answer:'B', interaction:'点击1个选项', time:10, hint:'什么动物汪汪叫？' },
  { id:'K28', dim:'常识与因果', type:'单选', q:'什么动物会喵喵叫？', screen:'听到喵喵叫', optA:'小猫', optB:'小狗', optC:'小鸭', answer:'A', interaction:'点击1个选项', time:10, hint:'什么动物喵喵叫？' },
  { id:'K29', dim:'常识与因果', type:'单选', q:'什么动物会哞哞叫？', screen:'听到哞哞叫', optA:'牛', optB:'羊', optC:'猪', answer:'A', interaction:'点击1个选项', time:10, hint:'什么动物哞哞叫？' },
  { id:'K30', dim:'常识与因果', type:'单选', q:'什么动物会嘎嘎叫？', screen:'听到嘎嘎叫', optA:'鸭子', optB:'鸡', optC:'鹅', answer:'A', interaction:'点击1个选项', time:10, hint:'什么动物嘎嘎叫？' },
  { id:'K31', dim:'常识与因果', type:'单选', q:'什么动物会喔喔叫？', screen:'听到喔喔叫', optA:'公鸡', optB:'鸭子', optC:'鹅', answer:'A', interaction:'点击1个选项', time:10, hint:'公鸡早上会叫' },
  { id:'K32', dim:'常识与因果', type:'单选', q:'什么动物会咩咩叫？', screen:'听到咩咩叫', optA:'羊', optB:'牛', optC:'马', answer:'A', interaction:'点击1个选项', time:10, hint:'什么动物咩咩叫？' },
  { id:'K33', dim:'常识与因果', type:'单选', q:'什么动物会哼哼叫？', screen:'听到哼哼叫', optA:'猪', optB:'牛', optC:'羊', answer:'A', interaction:'点击1个选项', time:10, hint:'什么动物哼哼叫？' },
  { id:'K34', dim:'常识与因果', type:'单选', q:'什么动物会嘶鸣？', screen:'听到嘶嘶叫', optA:'马', optB:'牛', optC:'驴', answer:'A', interaction:'点击1个选项', time:10, hint:'马会嘶鸣' },
  { id:'K35', dim:'常识与因果', type:'单选', q:'春天树上会怎样？', screen:'春天来了', optA:'长新叶', optB:'掉光叶', optC:'不变', answer:'A', interaction:'点击1个选项', time:15, hint:'春天树木发芽' },
  { id:'K36', dim:'常识与因果', type:'单选', q:'夏天天气怎样？', screen:'夏天到了', optA:'很冷', optB:'很热', optC:'下雪', answer:'B', interaction:'点击1个选项', time:10, hint:'夏天很热' },
  { id:'K37', dim:'常识与因果', type:'单选', q:'秋天农民在做什么？', screen:'秋天到了', optA:'播种', optB:'收割', optC:'冬眠', answer:'B', interaction:'点击1个选项', time:15, hint:'秋天是收获的季节' },
  { id:'K38', dim:'常识与因果', type:'单选', q:'冬天动物会做什么？', screen:'冬天到了', optA:'冬眠', optB:'搬家', optC:'游泳', answer:'A', interaction:'点击1个选项', time:15, hint:'有些动物冬天冬眠' },
  { id:'K39', dim:'常识与因果', type:'单选', q:'水烧开会变成什么？', screen:'水壶在烧水', optA:'冰', optB:'水蒸气', optC:'油', answer:'B', interaction:'点击1个选项', time:15, hint:'水烧开冒的气是什么？' },
  { id:'K40', dim:'常识与因果', type:'单选', q:'水放到冰箱冷冻会变成什么？', screen:'水放进冰箱冷冻层', optA:'冰', optB:'气', optC:'石头', answer:'A', interaction:'点击1个选项', time:15, hint:'水冷冻变成冰' },
  { id:'K41', dim:'常识与因果', type:'单选', q:'冰放到温暖的地方会怎样？', screen:'冰块放在桌上', optA:'变成水', optB:'变成石头', optC:'变大', answer:'A', interaction:'点击1个选项', time:15, hint:'冰遇热会融化' },
  { id:'K42', dim:'常识与因果', type:'单选', q:'糖放进水里会怎样？', screen:'糖放进水杯里', optA:'沉底不动', optB:'融化', optC:'变大', answer:'B', interaction:'点击1个选项', time:15, hint:'糖在水里会化掉' },
  { id:'K43', dim:'常识与因果', type:'单选', q:'盐放进水里会怎样？', screen:'盐放进水杯里', optA:'沉底不动', optB:'融化', optC:'变大', answer:'B', interaction:'点击1个选项', time:15, hint:'盐在水里会化掉' },
  { id:'K44', dim:'常识与因果', type:'单选', q:'油和水混在一起会怎样？', screen:'油倒进水里', optA:'混在一起', optB:'油浮在上面', optC:'水浮在上面', answer:'B', interaction:'点击1个选项', time:20, hint:'油比水轻' },
  { id:'K45', dim:'常识与因果', type:'单选', q:'铁块放进水里会怎样？', screen:'铁块放进水盆里', optA:'浮起来', optB:'沉下去', optC:'融化', answer:'B', interaction:'点击1个选项', time:15, hint:'铁很重' },
  { id:'K46', dim:'常识与因果', type:'单选', q:'塑料瓶放进水里会怎样？', screen:'塑料瓶放进水盆里', optA:'浮起来', optB:'沉下去', optC:'融化', answer:'A', interaction:'点击1个选项', time:15, hint:'塑料瓶很轻' },
  { id:'K47', dim:'常识与因果', type:'单选', q:'什么季节会下雪？', screen:'天上飘着雪花', optA:'春天', optB:'夏天', optC:'冬天', answer:'C', interaction:'点击1个选项', time:10, hint:'冬天会下雪' },
  { id:'K48', dim:'常识与因果', type:'单选', q:'什么季节最热？', screen:'太阳火辣辣的', optA:'春天', optB:'夏天', optC:'冬天', answer:'B', interaction:'点击1个选项', time:10, hint:'夏天最热' },
  { id:'K49', dim:'常识与因果', type:'单选', q:'什么季节最冷？', screen:'穿着厚棉袄', optA:'春天', optB:'秋天', optC:'冬天', answer:'C', interaction:'点击1个选项', time:10, hint:'冬天最冷' },
  { id:'K50', dim:'常识与因果', type:'单选', q:'什么季节百花盛开？', screen:'花儿都开了', optA:'春天', optB:'夏天', optC:'冬天', answer:'A', interaction:'点击1个选项', time:10, hint:'春天花儿开' },
  { id:'K51', dim:'常识与因果', type:'单选', q:'打雷时应该怎么做？', screen:'外面打雷了', optA:'到大树下躲', optB:'回屋里', optC:'继续玩', answer:'B', interaction:'点击1个选项', time:10, hint:'打雷不要在树下' },
  { id:'K52', dim:'常识与因果', type:'单选', q:'看到闪电后多久听到雷？', screen:'先看到闪电', optA:'马上', optB:'过一会儿', optC:'同时', answer:'B', interaction:'点击1个选项', time:20, hint:'光比声音快' },
  { id:'K53', dim:'常识与因果', type:'单选', q:'水在什么温度下结冰？', screen:'水变成冰', optA:'0度以下', optB:'50度', optC:'100度', answer:'A', interaction:'点击1个选项', time:20, hint:'水在0度以下结冰' },
  { id:'K54', dim:'常识与因果', type:'单选', q:'水在什么温度下烧开？', screen:'水烧开冒泡', optA:'10度', optB:'50度', optC:'100度', answer:'C', interaction:'点击1个选项', time:20, hint:'水100度烧开' },
  { id:'K55', dim:'常识与因果', type:'单选', q:'人的正常体温大约多少？', screen:'用体温计量体温', optA:'37度', optB:'50度', optC:'20度', answer:'A', interaction:'点击1个选项', time:20, hint:'人体正常体温37度' },
  { id:'K56', dim:'常识与因果', type:'单选', q:'什么时间吃午饭？', screen:'中午到了', optA:'早上', optB:'中午', optC:'晚上', answer:'B', interaction:'点击1个选项', time:10, hint:'中午吃午饭' },
  { id:'K57', dim:'常识与因果', type:'单选', q:'什么时间吃早饭？', screen:'早上起床了', optA:'早上', optB:'中午', optC:'晚上', answer:'A', interaction:'点击1个选项', time:10, hint:'早上吃早饭' },
  { id:'K58', dim:'常识与因果', type:'单选', q:'什么时间吃晚饭？', screen:'天快黑了', optA:'早上', optB:'中午', optC:'晚上', answer:'C', interaction:'点击1个选项', time:10, hint:'晚上吃晚饭' },
  { id:'K59', dim:'常识与因果', type:'单选', q:'一周有几天？', screen:'星期一到星期日', optA:'5天', optB:'7天', optC:'10天', answer:'B', interaction:'点击1个选项', time:10, hint:'一周7天' },
  { id:'K60', dim:'常识与因果', type:'单选', q:'一天有几小时？', screen:'从早到晚', optA:'12小时', optB:'24小时', optC:'48小时', answer:'B', interaction:'点击1个选项', time:15, hint:'一天24小时' },
  { id:'K61', dim:'常识与因果', type:'单选', q:'一小时有几分钟？', screen:'看钟表', optA:'30分钟', optB:'60分钟', optC:'100分钟', answer:'B', interaction:'点击1个选项', time:15, hint:'一小时60分钟' },
  { id:'K62', dim:'常识与因果', type:'单选', q:'一分钟有几秒？', screen:'看秒针转一圈', optA:'30秒', optB:'60秒', optC:'100秒', answer:'B', interaction:'点击1个选项', time:15, hint:'一分钟60秒' },
  { id:'K63', dim:'常识与因果', type:'单选', q:'人有几只眼睛？', screen:'看看你的脸', optA:'1只', optB:'2只', optC:'3只', answer:'B', interaction:'点击1个选项', time:10, hint:'人有2只眼睛' },
  { id:'K64', dim:'常识与因果', type:'单选', q:'人有几只手？', screen:'看看你的身体', optA:'1只', optB:'2只', optC:'3只', answer:'B', interaction:'点击1个选项', time:10, hint:'人有2只手' },
  { id:'K65', dim:'常识与因果', type:'单选', q:'人有几条腿？', screen:'看看你的身体', optA:'1条', optB:'2条', optC:'3条', answer:'B', interaction:'点击1个选项', time:10, hint:'人有2条腿' },
  { id:'K66', dim:'常识与因果', type:'单选', q:'人有几个鼻子？', screen:'摸摸你的脸', optA:'1个', optB:'2个', optC:'3个', answer:'A', interaction:'点击1个选项', time:10, hint:'人有1个鼻子' },
  { id:'K67', dim:'常识与因果', type:'单选', q:'人有几个嘴巴？', screen:'摸摸你的脸', optA:'1个', optB:'2个', optC:'3个', answer:'A', interaction:'点击1个选项', time:10, hint:'人有1个嘴巴' },
  { id:'K68', dim:'常识与因果', type:'单选', q:'人有几只耳朵？', screen:'摸摸你的脸', optA:'1只', optB:'2只', optC:'3只', answer:'B', interaction:'点击1个选项', time:10, hint:'人有2只耳朵' },
  { id:'K69', dim:'常识与因果', type:'单选', q:'小狗有几条腿？', screen:'看看小狗', optA:'2条', optB:'4条', optC:'6条', answer:'B', interaction:'点击1个选项', time:10, hint:'小狗4条腿' },
  { id:'K70', dim:'常识与因果', type:'单选', q:'小猫有几条腿？', screen:'看看小猫', optA:'2条', optB:'4条', optC:'6条', answer:'B', interaction:'点击1个选项', time:10, hint:'小猫4条腿' },
  { id:'K71', dim:'常识与因果', type:'单选', q:'蜘蛛有几条腿？', screen:'看看蜘蛛', optA:'6条', optB:'8条', optC:'10条', answer:'B', interaction:'点击1个选项', time:20, hint:'蜘蛛8条腿' },
  { id:'K72', dim:'常识与因果', type:'单选', q:'蚂蚁有几条腿？', screen:'看看蚂蚁', optA:'4条', optB:'6条', optC:'8条', answer:'B', interaction:'点击1个选项', time:20, hint:'蚂蚁6条腿' },
  { id:'K73', dim:'常识与因果', type:'单选', q:'蝴蝶有几只翅膀？', screen:'看看蝴蝶', optA:'2只', optB:'4只', optC:'6只', answer:'B', interaction:'点击1个选项', time:20, hint:'蝴蝶4只翅膀' },
  { id:'K74', dim:'常识与因果', type:'单选', q:'蜻蜓有几只翅膀？', screen:'看看蜻蜓', optA:'2只', optB:'4只', optC:'6只', answer:'B', interaction:'点击1个选项', time:20, hint:'蜻蜓4只翅膀' },
  // 逻辑推理 L1-L45 (45题)
  { id:'L1', dim:'逻辑推理', type:'单选', q:'小明比小红高，小红比小华高，谁最矮？', screen:'三个小朋友比身高', optA:'小明', optB:'小红', optC:'小华', answer:'C', interaction:'点击1个选项', time:20, hint:'一个比一个矮，最后那个最矮' },
  { id:'L2', dim:'逻辑推理', type:'单选', q:'所有的鸟都会飞，企鹅是鸟，企鹅会飞吗？', screen:'想想企鹅的样子', optA:'会飞', optB:'不会飞', optC:'不确定', answer:'B', interaction:'点击1个选项', time:20, hint:'企鹅虽然不会飞，但它是特殊的鸟' },
  { id:'L3', dim:'逻辑推理', type:'单选', q:'如果今天下雨，地上会怎样？', screen:'外面在下雨', optA:'变干', optB:'变湿', optC:'没变化', answer:'B', interaction:'点击1个选项', time:10, hint:'雨水落到地上会怎样？' },
  { id:'L4', dim:'逻辑推理', type:'单选', q:'小红今年5岁，明年她几岁？', screen:'过一年长一岁', optA:'4岁', optB:'5岁', optC:'6岁', answer:'C', interaction:'点击1个选项', time:10, hint:'过一年加一岁' },
  { id:'L5', dim:'逻辑推理', type:'单选', q:'桌子上有3个苹果，吃掉1个，还剩几个？', screen:'3个苹果吃掉1个', optA:'1个', optB:'2个', optC:'3个', answer:'B', interaction:'点击1个选项', time:10, hint:'3减1等于几？' },
  { id:'L6', dim:'逻辑推理', type:'单选', q:'昨天是星期三，今天是星期几？', screen:'一天过后', optA:'星期二', optB:'星期三', optC:'星期四', answer:'C', interaction:'点击1个选项', time:10, hint:'星期三过一天是星期几？' },
  { id:'L7', dim:'逻辑推理', type:'单选', q:'妈妈买了5颗糖，分给2个孩子，每人一样多，每人几颗？', screen:'5颗糖分给2个人', optA:'2颗', optB:'2颗半', optC:'3颗', answer:'B', interaction:'点击1个选项', time:20, hint:'5除以2等于多少？' },
  { id:'L8', dim:'逻辑推理', type:'单选', q:'如果红灯亮了，你应该怎么做？', screen:'路口红灯亮了', optA:'继续走', optB:'停下来等绿灯', optC:'跑过去', answer:'B', interaction:'点击1个选项', time:10, hint:'红灯停绿灯行' },
  { id:'L9', dim:'逻辑推理', type:'单选', q:'小明比小红高，小明比小华矮，谁最高？', screen:'三个人比身高', optA:'小明', optB:'小红', optC:'小华', answer:'C', interaction:'点击1个选项', time:25, hint:'画一画谁高谁矮' },
  { id:'L10', dim:'逻辑推理', type:'单选', q:'小红比小明矮，小华比小红矮，谁最高？', screen:'三个人比身高', optA:'小明', optB:'小红', optC:'小华', answer:'A', interaction:'点击1个选项', time:25, hint:'画一画谁高谁矮' },
  { id:'L11', dim:'逻辑推理', type:'单选', q:'桌子上有5颗糖，吃了2颗，还剩几颗？', screen:'5颗糖吃了2颗', optA:'2颗', optB:'3颗', optC:'5颗', answer:'B', interaction:'点击1个选项', time:10, hint:'5减2等于几？' },
  { id:'L12', dim:'逻辑推理', type:'单选', q:'桌子上有4个苹果，又放了2个，现在有几个？', screen:'4个苹果加2个', optA:'4个', optB:'5个', optC:'6个', answer:'C', interaction:'点击1个选项', time:10, hint:'4加2等于几？' },
  { id:'L13', dim:'逻辑推理', type:'单选', q:'小明今年6岁，去年他几岁？', screen:'倒退一年', optA:'5岁', optB:'6岁', optC:'7岁', answer:'A', interaction:'点击1个选项', time:10, hint:'去年比今年少一岁' },
  { id:'L14', dim:'逻辑推理', type:'单选', q:'小红今年4岁，后年她几岁？', screen:'过两年', optA:'4岁', optB:'5岁', optC:'6岁', answer:'C', interaction:'点击1个选项', time:10, hint:'后年加两岁' },
  { id:'L15', dim:'逻辑推理', type:'单选', q:'桌子上有6块饼干，分给3个小朋友，每人几块？', screen:'6块分给3人', optA:'1块', optB:'2块', optC:'3块', answer:'B', interaction:'点击1个选项', time:15, hint:'6除以3等于几？' },
  { id:'L16', dim:'逻辑推理', type:'单选', q:'如果今天星期五，明天星期几？', screen:'一天过后', optA:'星期四', optB:'星期五', optC:'星期六', answer:'C', interaction:'点击1个选项', time:10, hint:'星期五过一天' },
  { id:'L17', dim:'逻辑推理', type:'单选', q:'如果今天星期一，昨天星期几？', screen:'倒退一天', optA:'星期日', optB:'星期二', optC:'星期三', answer:'A', interaction:'点击1个选项', time:10, hint:'星期一前一天' },
  { id:'L18', dim:'逻辑推理', type:'单选', q:'桌子上有7颗糖，吃了3颗，还剩几颗？', screen:'7颗糖吃了3颗', optA:'3颗', optB:'4颗', optC:'5颗', answer:'B', interaction:'点击1个选项', time:10, hint:'7减3等于几？' },
  { id:'L19', dim:'逻辑推理', type:'单选', q:'桌子上有3个橘子，又买了4个，现在有几个？', screen:'3个加4个', optA:'6个', optB:'7个', optC:'8个', answer:'B', interaction:'点击1个选项', time:10, hint:'3加4等于几？' },
  { id:'L20', dim:'逻辑推理', type:'单选', q:'小明比小红大2岁，小红5岁，小明几岁？', screen:'小明比小红大2岁', optA:'5岁', optB:'6岁', optC:'7岁', answer:'C', interaction:'点击1个选项', time:15, hint:'5加2等于几？' },
  { id:'L21', dim:'逻辑推理', type:'单选', q:'小红比小明小3岁，小明8岁，小红几岁？', screen:'小红比小明小3岁', optA:'5岁', optB:'6岁', optC:'8岁', answer:'A', interaction:'点击1个选项', time:15, hint:'8减3等于几？' },
  { id:'L22', dim:'逻辑推理', type:'单选', q:'桌子上有10颗糖，吃了5颗，还剩几颗？', screen:'10颗糖吃了5颗', optA:'4颗', optB:'5颗', optC:'6颗', answer:'B', interaction:'点击1个选项', time:10, hint:'10减5等于几？' },
  { id:'L23', dim:'逻辑推理', type:'单选', q:'桌子上有2个红球和3个蓝球，一共几个球？', screen:'2个加3个', optA:'4个', optB:'5个', optC:'6个', answer:'B', interaction:'点击1个选项', time:10, hint:'2加3等于几？' },
  { id:'L24', dim:'逻辑推理', type:'单选', q:'桌子上有4个红球和4个蓝球，一共几个球？', screen:'4个加4个', optA:'6个', optB:'7个', optC:'8个', answer:'C', interaction:'点击1个选项', time:10, hint:'4加4等于几？' },
  { id:'L25', dim:'逻辑推理', type:'单选', q:'桌子上有9颗糖，分给3人，每人几颗？', screen:'9颗分给3人', optA:'2颗', optB:'3颗', optC:'4颗', answer:'B', interaction:'点击1个选项', time:15, hint:'9除以3等于几？' },
  { id:'L26', dim:'逻辑推理', type:'单选', q:'如果今天星期三，明天星期几？', screen:'一天过后', optA:'星期二', optB:'星期四', optC:'星期五', answer:'B', interaction:'点击1个选项', time:10, hint:'星期三过一天' },
  { id:'L27', dim:'逻辑推理', type:'单选', q:'如果今天星期六，昨天星期几？', screen:'倒退一天', optA:'星期四', optB:'星期五', optC:'星期日', answer:'B', interaction:'点击1个选项', time:10, hint:'星期六前一天' },
  { id:'L28', dim:'逻辑推理', type:'单选', q:'桌子上有8块饼干，吃了4块，还剩几块？', screen:'8块吃了4块', optA:'3块', optB:'4块', optC:'5块', answer:'B', interaction:'点击1个选项', time:10, hint:'8减4等于几？' },
  { id:'L29', dim:'逻辑推理', type:'单选', q:'桌子上有5个苹果，又买了5个，现在有几个？', screen:'5个加5个', optA:'9个', optB:'10个', optC:'11个', answer:'B', interaction:'点击1个选项', time:10, hint:'5加5等于几？' },
  { id:'L30', dim:'逻辑推理', type:'单选', q:'小明5岁，小红比小明大1岁，小红几岁？', screen:'小红比小明大1岁', optA:'5岁', optB:'6岁', optC:'7岁', answer:'B', interaction:'点击1个选项', time:15, hint:'5加1等于几？' },
  { id:'L31', dim:'逻辑推理', type:'单选', q:'桌子上有6颗糖，分给2人，每人几颗？', screen:'6颗分给2人', optA:'2颗', optB:'3颗', optC:'4颗', answer:'B', interaction:'点击1个选项', time:15, hint:'6除以2等于几？' },
  { id:'L32', dim:'逻辑推理', type:'单选', q:'如果今天星期四，明天星期几？', screen:'一天过后', optA:'星期三', optB:'星期五', optC:'星期六', answer:'B', interaction:'点击1个选项', time:10, hint:'星期四过一天' },
  { id:'L33', dim:'逻辑推理', type:'单选', q:'桌子上有3个红杯子和3个蓝杯子，一共几个杯子？', screen:'3个加3个', optA:'5个', optB:'6个', optC:'7个', answer:'B', interaction:'点击1个选项', time:10, hint:'3加3等于几？' },
  { id:'L34', dim:'逻辑推理', type:'单选', q:'桌子上有7个橘子，吃了2个，还剩几个？', screen:'7个吃了2个', optA:'4个', optB:'5个', optC:'6个', answer:'B', interaction:'点击1个选项', time:10, hint:'7减2等于几？' },
  { id:'L35', dim:'逻辑推理', type:'单选', q:'小明比小红高，小红比小华高，谁最高？', screen:'三个人比身高', optA:'小明', optB:'小红', optC:'小华', answer:'A', interaction:'点击1个选项', time:20, hint:'一个比一个矮' },
  { id:'L36', dim:'逻辑推理', type:'单选', q:'桌子上有4颗糖，又放了3颗，现在几颗？', screen:'4颗加3颗', optA:'6颗', optB:'7颗', optC:'8颗', answer:'B', interaction:'点击1个选项', time:10, hint:'4加3等于几？' },
  { id:'L37', dim:'逻辑推理', type:'单选', q:'如果今天星期日，明天星期几？', screen:'一天过后', optA:'星期一', optB:'星期六', optC:'星期五', answer:'A', interaction:'点击1个选项', time:10, hint:'星期日过一天' },
  { id:'L38', dim:'逻辑推理', type:'单选', q:'桌子上有10块饼干，吃了3块，还剩几块？', screen:'10块吃了3块', optA:'6块', optB:'7块', optC:'8块', answer:'B', interaction:'点击1个选项', time:10, hint:'10减3等于几？' },
  { id:'L39', dim:'逻辑推理', type:'单选', q:'桌子上有8颗糖，分给4人，每人几颗？', screen:'8颗分给4人', optA:'1颗', optB:'2颗', optC:'3颗', answer:'B', interaction:'点击1个选项', time:15, hint:'8除以4等于几？' },
  { id:'L40', dim:'逻辑推理', type:'单选', q:'小明6岁，小红比小明小2岁，小红几岁？', screen:'小红比小明小2岁', optA:'3岁', optB:'4岁', optC:'5岁', answer:'B', interaction:'点击1个选项', time:15, hint:'6减2等于几？' },
  { id:'L41', dim:'逻辑推理', type:'单选', q:'桌子上有5个苹果，吃了1个，又买了2个，现在几个？', screen:'5减1加2', optA:'5个', optB:'6个', optC:'7个', answer:'B', interaction:'点击1个选项', time:20, hint:'先减后加' },
  { id:'L42', dim:'逻辑推理', type:'单选', q:'如果今天星期二，后天星期几？', screen:'过两天', optA:'星期三', optB:'星期四', optC:'星期五', answer:'B', interaction:'点击1个选项', time:15, hint:'星期二过两天' },
  { id:'L43', dim:'逻辑推理', type:'单选', q:'桌子上有6个橘子，吃了3个，又买了1个，现在几个？', screen:'6减3加1', optA:'3个', optB:'4个', optC:'5个', answer:'B', interaction:'点击1个选项', time:20, hint:'先减后加' },
  { id:'L44', dim:'逻辑推理', type:'单选', q:'小明比小红大3岁，小红4岁，小明几岁？', screen:'小明比小红大3岁', optA:'6岁', optB:'7岁', optC:'8岁', answer:'B', interaction:'点击1个选项', time:15, hint:'4加3等于几？' },
  { id:'L45', dim:'逻辑推理', type:'单选', q:'桌子上有9个苹果，分给3人，每人几个？', screen:'9个分给3人', optA:'2个', optB:'3个', optC:'4个', answer:'B', interaction:'点击1个选项', time:15, hint:'9除以3等于几？' },
  // 记忆与注意力 M1-M41 (41题)
  { id:'M1', dim:'记忆与注意力', type:'单选', q:'请记住：苹果、香蕉、牛奶。下面哪个不在里面？', screen:'刚才记了3样东西', optA:'苹果', optB:'香蕉', optC:'面包', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下刚才的3样东西' },
  { id:'M2', dim:'记忆与注意力', type:'单选', q:'请记住：红色、蓝色、绿色。绿色排第几？', screen:'刚才记了3种颜色', optA:'第1', optB:'第2', optC:'第3', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下顺序' },
  { id:'M3', dim:'记忆与注意力', type:'单选', q:'请记住：小狗、小猫、小兔。一共有几种动物？', screen:'刚才记了几种动物', optA:'2种', optB:'3种', optC:'4种', answer:'B', interaction:'点击1个选项', time:15, hint:'数数有几种' },
  { id:'M4', dim:'记忆与注意力', type:'单选', q:'请记住：3、7、1。最大的数是几？', screen:'刚才记了3个数字', optA:'1', optB:'3', optC:'7', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下哪最大' },
  { id:'M5', dim:'记忆与注意力', type:'单选', q:'请记住：橘子、葡萄、西瓜。哪个不在里面？', screen:'刚才记了3样水果', optA:'橘子', optB:'葡萄', optC:'苹果', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下刚才的3样水果' },
  { id:'M6', dim:'记忆与注意力', type:'单选', q:'请记住：小狗、小猫、小兔、小鸟。一共有几种？', screen:'刚才记了4种动物', optA:'3种', optB:'4种', optC:'5种', answer:'B', interaction:'点击1个选项', time:20, hint:'数数有几种' },
  { id:'M7', dim:'记忆与注意力', type:'单选', q:'请记住：红色、黄色、蓝色。红色排第几？', screen:'刚才记了3种颜色', optA:'第1', optB:'第2', optC:'第3', answer:'A', interaction:'点击1个选项', time:15, hint:'回忆一下顺序' },
  { id:'M8', dim:'记忆与注意力', type:'单选', q:'请记住：5、2、8。最小的数是几？', screen:'刚才记了3个数字', optA:'2', optB:'5', optC:'8', answer:'A', interaction:'点击1个选项', time:15, hint:'回忆一下哪最小' },
  { id:'M9', dim:'记忆与注意力', type:'单选', q:'请记住：苹果、牛奶、面包。哪个在里面？', screen:'刚才记了3样东西', optA:'苹果', optB:'香蕉', optC:'橘子', answer:'A', interaction:'点击1个选项', time:15, hint:'回忆一下刚才的3样东西' },
  { id:'M10', dim:'记忆与注意力', type:'单选', q:'请记住：蓝色、绿色、红色。蓝色排第几？', screen:'刚才记了3种颜色', optA:'第1', optB:'第2', optC:'第3', answer:'A', interaction:'点击1个选项', time:15, hint:'回忆一下顺序' },
  { id:'M11', dim:'记忆与注意力', type:'单选', q:'请记住：3、6、9。最大的数是几？', screen:'刚才记了3个数字', optA:'3', optB:'6', optC:'9', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下哪最大' },
  { id:'M12', dim:'记忆与注意力', type:'单选', q:'请记住：猫、狗、鸟、鱼。一共有几种？', screen:'刚才记了4种动物', optA:'3种', optB:'4种', optC:'5种', answer:'B', interaction:'点击1个选项', time:20, hint:'数数有几种' },
  { id:'M13', dim:'记忆与注意力', type:'单选', q:'请记住：橘子、苹果、香蕉。香蕉排第几？', screen:'刚才记了3样水果', optA:'第1', optB:'第2', optC:'第3', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下顺序' },
  { id:'M14', dim:'记忆与注意力', type:'单选', q:'请记住：4、1、7。最小的数是几？', screen:'刚才记了3个数字', optA:'1', optB:'4', optC:'7', answer:'A', interaction:'点击1个选项', time:15, hint:'回忆一下哪最小' },
  { id:'M15', dim:'记忆与注意力', type:'单选', q:'请记住：红色、蓝色、黄色。黄色排第几？', screen:'刚才记了3种颜色', optA:'第1', optB:'第2', optC:'第3', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下顺序' },
  { id:'M16', dim:'记忆与注意力', type:'单选', q:'请记住：牛奶、面包、鸡蛋。哪个不在里面？', screen:'刚才记了3样东西', optA:'牛奶', optB:'面包', optC:'果汁', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下刚才的3样东西' },
  { id:'M17', dim:'记忆与注意力', type:'单选', q:'请记住：2、5、8、3。一共有几个数字？', screen:'刚才记了4个数字', optA:'3个', optB:'4个', optC:'5个', answer:'B', interaction:'点击1个选项', time:20, hint:'数数有几个' },
  { id:'M18', dim:'记忆与注意力', type:'单选', q:'请记住：小狗、小猫、小兔。小狗排第几？', screen:'刚才记了3种动物', optA:'第1', optB:'第2', optC:'第3', answer:'A', interaction:'点击1个选项', time:15, hint:'回忆一下顺序' },
  { id:'M19', dim:'记忆与注意力', type:'单选', q:'请记住：6、3、9。最大的数是几？', screen:'刚才记了3个数字', optA:'3', optB:'6', optC:'9', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下哪最大' },
  { id:'M20', dim:'记忆与注意力', type:'单选', q:'请记住：苹果、香蕉、橘子。哪个排第2？', screen:'刚才记了3样水果', optA:'苹果', optB:'香蕉', optC:'橘子', answer:'B', interaction:'点击1个选项', time:15, hint:'回忆一下顺序' },
  { id:'M21', dim:'记忆与注意力', type:'单选', q:'请记住：红色、绿色、蓝色。绿色排第几？', screen:'刚才记了3种颜色', optA:'第1', optB:'第2', optC:'第3', answer:'B', interaction:'点击1个选项', time:15, hint:'回忆一下顺序' },
  { id:'M22', dim:'记忆与注意力', type:'单选', q:'请记住：4、8、2。最小的数是几？', screen:'刚才记了3个数字', optA:'2', optB:'4', optC:'8', answer:'A', interaction:'点击1个选项', time:15, hint:'回忆一下哪最小' },
  { id:'M23', dim:'记忆与注意力', type:'单选', q:'请记住：猫、狗、鸟。一共有几种？', screen:'刚才记了3种动物', optA:'2种', optB:'3种', optC:'4种', answer:'B', interaction:'点击1个选项', time:15, hint:'数数有几种' },
  { id:'M24', dim:'记忆与注意力', type:'单选', q:'请记住：西瓜、苹果、橘子。哪个不在里面？', screen:'刚才记了3样水果', optA:'西瓜', optB:'苹果', optC:'香蕉', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下刚才的3样水果' },
  { id:'M25', dim:'记忆与注意力', type:'单选', q:'请记住：7、1、5。最大的数是几？', screen:'刚才记了3个数字', optA:'1', optB:'5', optC:'7', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下哪最大' },
  { id:'M26', dim:'记忆与注意力', type:'单选', q:'请记住：红色、黄色、蓝色。蓝色排第几？', screen:'刚才记了3种颜色', optA:'第1', optB:'第2', optC:'第3', answer:'C', interaction:'点击1个选项', time:15, hint:'回忆一下顺序' },
  { id:'M27', dim:'记忆与注意力', type:'单选', q:'请记住：牛奶、面包、鸡蛋。面包排第几？', screen:'刚才记了3样东西', optA:'第1', optB:'第2', optC:'第3', answer:'B', interaction:'点击1个选项', time:15, hint:'回忆一下顺序' },
  { id:'M28', dim:'记忆与注意力', type:'单选', q:'请记住：3、6、2、8。一共有几个数字？', screen:'刚才记了4个数字', optA:'3个', optB:'4个', optC:'5个', answer:'B', interaction:'点击1个选项', time:20, hint:'数数有几个' },
  { id:'M29', dim:'记忆与注意力', type:'单选', q:'请记住：小狗、小猫、小兔、小鸟、小鱼。一共有几种？', screen:'刚才记了5种动物', optA:'4种', optB:'5种', optC:'6种', answer:'B', interaction:'点击1个选项', time:20, hint:'数数有几种' },
  { id:'M30', dim:'记忆与注意力', type:'单选', q:'请记住：9、3、6。最小的数是几？', screen:'刚才记了3个数字', optA:'3', optB:'6', optC:'9', answer:'A', interaction:'点击1个选项', time:15, hint:'回忆一下哪最小' },
  { id:'M31', dim:'记忆与注意力', type:'单选', q:'请记住：苹果、香蕉、橘子、葡萄。哪个排第3？', screen:'刚才记了4样水果', optA:'苹果', optB:'香蕉', optC:'橘子', answer:'C', interaction:'点击1个选项', time:20, hint:'回忆一下顺序' },
  { id:'M32', dim:'记忆与注意力', type:'单选', q:'请记住：红色、蓝色、绿色、黄色。哪个排第2？', screen:'刚才记了4种颜色', optA:'红色', optB:'蓝色', optC:'绿色', answer:'B', interaction:'点击1个选项', time:20, hint:'回忆一下顺序' },
  { id:'M33', dim:'记忆与注意力', type:'单选', q:'请记住：5、2、8、1。最大的数是几？', screen:'刚才记了4个数字', optA:'1', optB:'5', optC:'8', answer:'C', interaction:'点击1个选项', time:20, hint:'回忆一下哪最大' },
  { id:'M34', dim:'记忆与注意力', type:'单选', q:'请记住：小狗、小猫、小兔、小鸟。哪个排第1？', screen:'刚才记了4种动物', optA:'小狗', optB:'小猫', optC:'小兔', answer:'A', interaction:'点击1个选项', time:20, hint:'回忆一下顺序' },
  { id:'M35', dim:'记忆与注意力', type:'单选', q:'请记住：苹果、牛奶、面包、鸡蛋。哪个不在里面？', screen:'刚才记了4样东西', optA:'苹果', optB:'面包', optC:'果汁', answer:'C', interaction:'点击1个选项', time:20, hint:'回忆一下刚才的4样东西' },
  { id:'M36', dim:'记忆与注意力', type:'单选', q:'请记住：3、7、1、9。最小的数是几？', screen:'刚才记了4个数字', optA:'1', optB:'3', optC:'7', answer:'A', interaction:'点击1个选项', time:20, hint:'回忆一下哪最小' },
  { id:'M37', dim:'记忆与注意力', type:'单选', q:'请记住：红色、黄色、蓝色、绿色。一共有几种颜色？', screen:'刚才记了4种颜色', optA:'3种', optB:'4种', optC:'5种', answer:'B', interaction:'点击1个选项', time:20, hint:'数数有几种' },
  { id:'M38', dim:'记忆与注意力', type:'单选', q:'请记住：猫、狗、鸟、鱼、兔。一共有几种？', screen:'刚才记了5种动物', optA:'4种', optB:'5种', optC:'6种', answer:'B', interaction:'点击1个选项', time:20, hint:'数数有几种' },
  { id:'M39', dim:'记忆与注意力', type:'单选', q:'请记住：苹果、香蕉、橘子。一共有几样？', screen:'刚才记了3样水果', optA:'2样', optB:'3样', optC:'4样', answer:'B', interaction:'点击1个选项', time:15, hint:'数数有几样' },
  { id:'M40', dim:'记忆与注意力', type:'单选', q:'请记住：2、4、6、8。一共有几个数字？', screen:'刚才记了4个数字', optA:'3个', optB:'4个', optC:'5个', answer:'B', interaction:'点击1个选项', time:20, hint:'数数有几个' },
  { id:'M41', dim:'记忆与注意力', type:'单选', q:'请记住：红色、蓝色、绿色。一共有几种颜色？', screen:'刚才记了3种颜色', optA:'2种', optB:'3种', optC:'4种', answer:'B', interaction:'点击1个选项', time:15, hint:'数数有几种' },
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
