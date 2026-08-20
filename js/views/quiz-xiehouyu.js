// views/quiz-xiehouyu.js — 短文阅读打卡界面
// 每天展示一篇30字以内的短文，孩子朗读打卡
// 预写短文库，按日期轮换，每天不同

import { getState } from '../store.js';
import { submitQuiz } from '../tasks.js';
import { todayKey } from '../utils.js';
import { showOverlay, closeOverlay, switchTab, celebrate } from '../app.js';
import { esc } from '../utils.js';

let state = null;

/* ===== 预写短文库 =====
 * 每篇30字以内，用识字字库中的字词写成，通顺有逻辑
 * 按日期轮换，每天一篇
 */
const READINGS = [
  // 自然四季
  '春天来了，花儿开了，小草绿了，小鸟在树上唱歌。',
  '夏天天很热，太阳像大火球，我吃了一根冰棒，真凉快。',
  '秋天到了，树叶黄了，一片片落下来，地上像金色的地毯。',
  '冬天下了大雪，地上白白的，我和爸爸一起堆了一个大雪人。',
  '早上太阳升起来，天亮了，小鸟开始唱歌，新的一天开始了。',
  '晚上月亮出来了，星星一闪一闪的，天黑了，我要睡觉了。',
  '今天下大雨，我没有带伞，淋湿了，妈妈说我像落汤鸡。',
  '天上白云飘来飘去，有的像小狗，有的像大山，真好看。',
  '风吹过来，树叶沙沙响，好凉快呀，秋天真的来了。',
  '雨停了，天上出现了一道彩虹，红橙黄绿青蓝紫，真美丽。',

  // 家庭生活
  '妈妈在做饭，香味飘过来，我跑过去说：妈妈，好香呀！',
  '爸爸下班回家，我跑过去抱住他，爸爸亲了我一下，好开心。',
  '爷爷在看书，奶奶在织毛衣，他们笑眯眯的，很慈祥。',
  '今天我过生日，妈妈买了一个大蛋糕，上面有八根蜡烛。',
  '弟弟哭了，妈妈抱起他，他就不哭了，妈妈真厉害。',
  '一家人坐在桌边吃饭，有说有笑，我觉得很幸福。',
  '我帮妈妈扫地，妈妈夸我长大了，我心里甜滋滋的。',
  '爸爸教我写字，一笔一画，写得好认真，爸爸说我真聪明。',
  '妈妈给我讲故事，讲的是小白兔和大灰狼，我听得很入迷。',
  '今天家里包饺子，我也来帮忙，虽然包得不好看，但很好吃。',

  // 学校学习
  '上课了，老师走进来，我们坐好，开始认真听讲。',
  '我在学校里学了很多字，还会读课文，老师夸我进步大。',
  '下课了，同学们在操场上跑来跑去，有的跳绳，有的打球。',
  '今天考试我得了满分，老师表扬了我，我开心极了。',
  '老师教我们读古诗，声音很好听，我也跟着大声读。',
  '我的同桌叫小明，他数学很好，我有不会的题就问他。',
  '上美术课，我画了一朵大红花，老师贴在墙上给大家看。',
  '学校图书馆里有很多书，我借了一本故事书，真好看。',
  '今天我举手回答问题，答对了，同学们给我鼓掌。',
  '放学了，我和好朋友一起走回家，路上说说笑笑很开心。',

  // 动物朋友
  '我家有一只小猫，白白的毛，红红的鼻子，它最爱吃鱼。',
  '小狗汪汪叫，摇着尾巴跑过来，它是我的好朋友。',
  '小兔子长长的耳朵，红红的眼睛，蹦蹦跳跳真可爱。',
  '鱼儿在水里游来游去，嘴巴一张一合，好像在说话。',
  '小鸟在树上做窝，飞来飞去忙着找虫子，真勤劳。',
  '小马跑得很快，四条腿像风一样，我骑上去真威风。',
  '牛在田里吃草，慢慢地走，尾巴甩来甩去赶苍蝇。',
  '小羊咩咩叫，毛白白的像云朵，软软的真好摸。',
  '树上有一只知了，叫个不停，夏天真热闹。',
  '小鸡跟着鸡妈妈找虫吃，黄黄的毛，圆圆的，好可爱。',

  // 日常活动
  '早上我起床，穿好衣服，刷牙洗脸，然后去吃早饭。',
  '今天我去公园玩，滑了滑梯，荡了秋千，玩得满8开心。',
  '我帮奶奶去买菜，买了白菜和萝卜，奶奶说我真能干。',
  '晚上我刷牙洗脸，换好睡衣，躺在床上，妈妈说晚安。',
  '今天我自己穿鞋，系鞋带有点难，但我学会了，真棒。',
  '我在家里画画，画了太阳和花朵，涂上颜色真漂亮。',
  '吃完饭我帮妈妈收碗，碗有点滑，我小心地端着。',
  '今天我学骑自行车，摔了一跤，但我又爬起来继续骑。',
  '我和爸爸下棋，我赢了一盘，爸爸说我越来越厉害了。',
  '今天我洗了手帕，搓搓搓，泡泡好多，洗完晾在阳台上。',

  // 自然观察
  '春天到了，小树长出新叶子，绿绿的，嫩嫩的，真好看。',
  '夏天的夜里，萤火虫飞来飞去，像小灯笼一样亮闪闪。',
  '秋天的果园里，苹果红了，梨子黄了，农民伯伯真高兴。',
  '冬天的早上，窗户上有冰花，好漂亮，像画出来的一样。',
  '小河里的水清清的，能看到小鱼在游，水草在飘。',
  '山上有很多树，绿绿的，远远看去像一座绿色的大房子。',
  '田里的稻子黄了，弯着腰，好像在说：快来收我吧！',
  '花园里有很多花，红的黄的紫的，蜜蜂在花上采蜜。',
  '天上的云在动，风一吹就变了样子，像在变魔术。',
  '海边有很多沙子，踩上去软软的，浪花跑上来又退回去。',

  // 好习惯
  '吃饭前我洗手，手洗得干干净净，妈妈说不生病。',
  '我每天早上刷牙，牙齿白白亮亮，没有蛀牙真开心。',
  '看书的时候要坐端正，眼睛离书远一点，保护视力。',
  '今天我把自己用完的东西收好了，房间很整齐，妈妈夸我。',
  '过马路时我左右看，绿灯亮了才走，安全最重要。',
  '我每天按时睡觉，不熬夜，第二天精神很好。',
  '玩具玩完了要收好，不能乱扔，好孩子要爱整洁。',
  '今天我帮老师擦黑板，老师说我是个好帮手。',
  '我对人有礼貌，见到老师问好，见到同学说你好。',
  '我节约用水，洗手后关好水龙头，不浪费每一滴水。',

  // 情感表达
  '今天我帮妈妈做了一件事，妈妈笑了，我也笑了。',
  '我的好朋友搬家了，我很舍不得，希望他常回来看我。',
  '今天我摔了一跤，膝盖破了，但我没有哭，很勇敢。',
  '我收到爸爸的礼物，是一个新书包，我高兴地跳起来。',
  '今天我学会了系鞋带，虽然很难，但我没有放弃。',
  '我做了一个梦，梦见自己飞上了天，和星星一起玩。',
  '今天老师表扬了我，我心里美滋滋的，以后要更努力。',
  '下雨天不能出去玩，我在窗边看雨，听着雨声也很开心。',
  '我给奶奶捶背，奶奶说好舒服，我以后天天给她捶。',
  '今天我第一次自己睡一个房间，有点怕，但我很勇敢。',

  // 节日活动
  '过年了，家家户户贴春联，放鞭炮，真热闹呀！',
  '中秋节我们吃月饼，看月亮，月亮又圆又亮真好看。',
  '六一儿童节，学校开了联欢会，我们唱歌跳舞真开心。',
  '端午节吃粽子，妈妈包了肉粽和枣粽，都很香很好吃。',
  '今天下雪了，正好是新年，白雪飘飘，新年好！',
  '国庆节到了，到处挂着红旗，我们唱国歌，祝祖国好。',
];

/** 生成今天的短文（按日期轮换） */
function getTodayReading() {
  const today = todayKey();
  // 用日期数字算索引，每天不同，循环轮换
  const dayNum = today.split('-').join('').split('').reduce((a, c) => a + parseInt(c), 0);
  const idx = dayNum % READINGS.length;
  const text = READINGS[idx];

  // 提取短文中的词语（2-4字的词组）
  const words = [];
  // 简单分词：按标点分割后取有意义的片段
  const clean = text.replace(/[，。！？、！？]/g, ' ');
  const segments = clean.trim().split(/\s+/);
  for (const seg of segments) {
    if (seg.length >= 2 && seg.length <= 4) {
      words.push(seg);
    }
  }

  // 统计字数（去掉标点）
  const charCount = text.replace(/[，。！？、！？]/g, '').length;

  return { text, words: words.slice(0, 6), charCount };
}

export function openXiehouyuQuiz(taskId) {
  const task = getState().tasks.find(t => t.id === taskId);
  if (!task) return;

  const reading = getTodayReading();
  state = { task, reading };
  renderCard();
}

function renderCard() {
  if (!state) return;
  const { task, reading } = state;
  const today = todayKey();

  const isDoneToday = () => {
    const c = getState().checkins[today] || {};
    return !!(c[task.id] && c[task.id].done);
  };

  const wordsHtml = reading.words.map(w => `<span class="reading-word">${esc(w)}</span>`).join('');

  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qxBack">‹</span>
      <span class="quiz-title">📖 短文阅读</span>
      <span class="quiz-count">1/1</span>
    </div>
    <div class="reading-card">
      <div class="reading-text">${esc(reading.text)}</div>
      <div class="reading-meta">共 ${reading.charCount} 字</div>
    </div>
    <div class="reading-section">
      <div class="reading-label">📝 今日词语</div>
      <div class="reading-words">${wordsHtml}</div>
    </div>
    <div class="reading-section">
      <div class="reading-label">💡 阅读提示</div>
      <div class="reading-tip">请大声朗读上面的短文，遇到不会的字可以问爸爸妈妈。</div>
    </div>
    <button class="btn block big" id="qxLearn" ${isDoneToday() ? 'disabled' : ''}>
      ${isDoneToday() ? '✅ 今天已读完' : '我读完了'}
    </button>
  `;

  let submitting = false;
  showOverlay(html, {
    noClose: false,
    onMount: (card) => {
      card.querySelector('#qxBack').onclick = () => { closeOverlay(); state = null; };
      const learnBtn = card.querySelector('#qxLearn');
      if (learnBtn && !learnBtn.disabled) {
        learnBtn.onclick = () => {
          if (submitting) return;
          submitting = true;
          submitQuiz(task.id, { correct: 1, total: 1, passRate: 1, passed: true, detail: { reading: reading.text.slice(0, 20) } });
          state = null;
          closeOverlay();
          celebrate('短文阅读打卡成功', `读完短文 · 获得 ${task.points} 积分`);
          setTimeout(() => switchTab('checkin'), 100);
        };
      }
    },
  });
}
