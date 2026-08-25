// vocab-data.js — 识字字库 + 英语词库
// 识字字库按统编版语文一年级上册识字顺序整理（公开课程标准，非版权书复制）
// 英语词库分 6 类，每词配 category 与简笔画 SVG key（svg-art.js 据此画图）

/* ============================================================
 * 识字字库：分阶段（每阶段约 25-30 字），从最常用字起步
 * 覆盖一年级上册高频字，可扩展
 * ========================================================== */
export const CHINESE_STAGES = [
  // 第1阶段：基础笔画与身体字（去掉太简单的数字）
  ['口','目','耳','手','足','大','小','上','下','左','右','人','天','地','日','月','木','水','火','山','石','田','土','云','雨'],
  // 第2阶段：自然与天象
  ['日','月','水','火','山','石','田','土','云','雨','风','天','地','星','光','电','木','禾','米','竹','花','草','虫','鸟','鱼'],
  // 第3阶段：人称与家庭
  ['我','你','他','她','们','爸','妈','爷','奶','哥','姐','弟','妹','儿','子','女','男','老','师','友','家','人','口','心','头'],
  // 第4阶段：动作与身体
  ['走','跑','跳','飞','看','听','说','读','写','画','吃','喝','打','拿','放','坐','立','起','来','去','出','入','开','关','买'],
  // 第5阶段：生活与器物
  ['书','本','笔','纸','字','词','车','马','牛','羊','犬','衣','帽','鞋','伞','灯','钟','床','桌','椅','门','窗','碗','筷','刀'],
  // 第6阶段：颜色与形状
  ['红','黄','蓝','绿','白','黑','紫','灰','圆','方','长','短','高','低','多','少','新','旧','好','坏','美','丑','快','慢','远'],
  // 第7阶段：时间与方位
  ['今','明','昨','年','早','晚','春','夏','秋','冬','东','西','南','北','前','后','里','外','早','晚','中','间','旁','边','对'],
  // 第8阶段：情感与品质
  ['爱','喜','乐','笑','哭','怒','怕','想','知','会','能','要','给','帮','让','学','问','答','真','假','对','错','同','一','起'],
];

/* ============================================================
 * 英语词库：6 类，每词 { word, cn, svg } svg 为 svg-art.js 的 key
 * ========================================================== */
export const ENGLISH_WORDS = {
  shape: [
    { word: 'circle', cn: '圆形', svg: 'circle' },
    { word: 'square', cn: '方形', svg: 'square' },
    { word: 'triangle', cn: '三角形', svg: 'triangle' },
    { word: 'star', cn: '星星', svg: 'star' },
    { word: 'heart', cn: '心形', svg: 'heart' },
    { word: 'diamond', cn: '菱形', svg: 'diamond' },
    { word: 'oval', cn: '椭圆', svg: 'oval' },
    { word: 'cross', cn: '十字', svg: 'cross' },
  ],
  weather: [
    { word: 'sun', cn: '太阳', svg: 'sun' },
    { word: 'rain', cn: '雨', svg: 'rain' },
    { word: 'cloud', cn: '云', svg: 'cloud' },
    { word: 'snow', cn: '雪', svg: 'snow' },
    { word: 'wind', cn: '风', svg: 'wind' },
    { word: 'rainbow', cn: '彩虹', svg: 'rainbow' },
    { word: 'moon', cn: '月亮', svg: 'moon' },
    { word: 'star', cn: '星星', svg: 'star' },
  ],
  number: [
    { word: 'one', cn: '一', svg: 'n1' },
    { word: 'two', cn: '二', svg: 'n2' },
    { word: 'three', cn: '三', svg: 'n3' },
    { word: 'four', cn: '四', svg: 'n4' },
    { word: 'five', cn: '五', svg: 'n5' },
    { word: 'six', cn: '六', svg: 'n6' },
    { word: 'seven', cn: '七', svg: 'n7' },
    { word: 'eight', cn: '八', svg: 'n8' },
    { word: 'nine', cn: '九', svg: 'n9' },
    { word: 'ten', cn: '十', svg: 'n10' },
  ],
  daily: [
    { word: 'cup', cn: '杯子', svg: 'cup' },
    { word: 'bowl', cn: '碗', svg: 'bowl' },
    { word: 'spoon', cn: '勺子', svg: 'spoon' },
    { word: 'toothbrush', cn: '牙刷', svg: 'toothbrush' },
    { word: 'towel', cn: '毛巾', svg: 'towel' },
    { word: 'comb', cn: '梳子', svg: 'comb' },
    { word: 'clock', cn: '钟', svg: 'clock' },
    { word: 'lamp', cn: '灯', svg: 'lamp' },
    { word: 'umbrella', cn: '雨伞', svg: 'umbrella' },
    { word: 'book', cn: '书', svg: 'book' },
    { word: 'pen', cn: '笔', svg: 'pen' },
    { word: 'bag', cn: '包', svg: 'bag' },
    { word: 'bottle', cn: '瓶子', svg: 'bottle' },
    { word: 'plate', cn: '盘子', svg: 'plate' },
  ],
  vehicle: [
    { word: 'car', cn: '小汽车', svg: 'car' },
    { word: 'bus', cn: '公交车', svg: 'bus' },
    { word: 'bike', cn: '自行车', svg: 'bike' },
    { word: 'train', cn: '火车', svg: 'train' },
    { word: 'plane', cn: '飞机', svg: 'plane' },
    { word: 'ship', cn: '船', svg: 'ship' },
    { word: 'boat', cn: '小船', svg: 'boat' },
    { word: 'subway', cn: '地铁', svg: 'subway' },
    { word: 'taxi', cn: '出租车', svg: 'taxi' },
    { word: 'truck', cn: '卡车', svg: 'truck' },
    { word: 'ambulance', cn: '救护车', svg: 'ambulance' },
    { word: 'fire', cn: '消防车', svg: 'fire' },
  ],
  abc: [
    // 第一组
    { word: 'banana', cn: '香蕉', svg: 'banana' },
    { word: 'dog', cn: '狗', svg: 'dog' },
    { word: 'book', cn: '书', svg: 'book' },
    { word: 'boots', cn: '靴子', svg: 'boots' },
    { word: 'bike', cn: '自行车', svg: 'bike' },
    { word: 'duck', cn: '鸭子', svg: 'duck' },
    { word: 'cup', cn: '杯子', svg: 'cup' },
    { word: 'bus', cn: '公交车', svg: 'bus' },
    { word: 'peas', cn: '豌豆', svg: 'peas' },
    { word: 'hat', cn: '帽子', svg: 'hat' },
    { word: 'worm', cn: '虫子', svg: 'worm' },
    { word: 'boat', cn: '船', svg: 'boat' },
    { word: 'house', cn: '房子', svg: 'house' },
    { word: 'lion', cn: '狮子', svg: 'lion' },
    { word: 'apple', cn: '苹果', svg: 'apple' },
    { word: 'ball', cn: '球', svg: 'ball' },
    { word: 'mouse', cn: '老鼠', svg: 'mouse' },
    { word: 'beans', cn: '豆子', svg: 'beans' },
    { word: 'car', cn: '小汽车', svg: 'car' },
    { word: 'bed', cn: '床', svg: 'bed' },
    // 第二组
    { word: 'hair', cn: '头发', svg: 'hair' },
    { word: 'bowl', cn: '碗', svg: 'bowl' },
    { word: 'whale', cn: '鲸鱼', svg: 'whale' },
    { word: 'bee', cn: '蜜蜂', svg: 'bee' },
    { word: 'moon', cn: '月亮', svg: 'moon' },
    { word: 'nose', cn: '鼻子', svg: 'nose' },
    { word: 'bird', cn: '鸟', svg: 'bird' },
    { word: 'bath', cn: '洗澡', svg: 'bath' },
    { word: 'monkey', cn: '猴子', svg: 'monkey' },
    { word: 'bubble', cn: '泡泡', svg: 'bubble' },
    { word: 'cat', cn: '猫', svg: 'cat' },
    { word: 'tummy', cn: '肚子', svg: 'tummy' },
    { word: 'bag', cn: '包', svg: 'bag' },
    { word: 'tree', cn: '树', svg: 'tree' },
    { word: 'cloud', cn: '云', svg: 'cloud' },
    { word: 'feet', cn: '脚', svg: 'feet' },
    { word: 'goat', cn: '山羊', svg: 'goat' },
    { word: 'key', cn: '钥匙', svg: 'key' },
    { word: 'flower', cn: '花', svg: 'flower' },
    { word: 'kite', cn: '风筝', svg: 'kite' },
    // 第三组
    { word: 'cake', cn: '蛋糕', svg: 'cake' },
    { word: 'fish', cn: '鱼', svg: 'fish' },
    { word: 'top', cn: '陀螺', svg: 'top' },
    { word: 'teddy', cn: '泰迪熊', svg: 'teddy' },
    { word: 'rocket', cn: '火箭', svg: 'rocket' },
    { word: 'coat', cn: '外套', svg: 'coat' },
    { word: 'yo-yo', cn: '悠悠球', svg: 'yo-yo' },
    { word: 'mango', cn: '芒果', svg: 'mango' },
    { word: 'digger', cn: '挖掘机', svg: 'digger' },
    { word: 'donkey', cn: '驴', svg: 'donkey' },
    { word: 'train', cn: '火车', svg: 'train' },
    { word: 'socks', cn: '袜子', svg: 'socks' },
    { word: 'cow', cn: '奶牛', svg: 'cow' },
    { word: 'swing', cn: '秋千', svg: 'swing' },
    { word: 'egg', cn: '鸡蛋', svg: 'egg' },
    { word: 'shoes', cn: '鞋子', svg: 'shoes' },
    { word: 'milk', cn: '牛奶', svg: 'milk' },
    { word: 'plane', cn: '飞机', svg: 'plane' },
    { word: 'tiger', cn: '老虎', svg: 'tiger' },
    { word: 'drum', cn: '鼓', svg: 'drum' },
  ],
};

/** 英语分类中文名 */
export const ENGLISH_CATEGORIES = {
  color: '颜色',
  shape: '形状',
  weather: '天气',
  number: '数字',
  daily: '日用品',
  vehicle: '交通工具',
  abc: 'ABC基础',
};

/** 日常短句（启蒙常用语，每日1句循环记忆） */
export const ENGLISH_PHRASES = [
  { word: 'Good morning', cn: '早上好', svg: 'sun' },
  { word: 'Good night', cn: '晚上好', svg: 'moon' },
  { word: 'Hello', cn: '你好', svg: 'star' },
  { word: 'Thank you', cn: '谢谢', svg: 'heart' },
  { word: 'Goodbye', cn: '再见', svg: 'wind' },
  { word: 'Sorry', cn: '对不起', svg: 'cloud' },
  { word: 'I love you', cn: '我爱你', svg: 'heart' },
  { word: 'Yes', cn: '是的', svg: 'star' },
  { word: 'No', cn: '不是', svg: 'cross' },
];

/** 平铺所有英语单词（带 category） */
export const ALL_ENGLISH_WORDS = (() => {
  const all = [];
  for (const [cat, list] of Object.entries(ENGLISH_WORDS)) {
    for (const w of list) all.push({ ...w, category: cat });
  }
  return all;
})();

/** 按 svg key 取英语词（用于反向查找） */
export function findWordBySvg(svg) {
  return ALL_ENGLISH_WORDS.find(w => w.svg === svg) || null;
}

/* ============================================================
 * 古诗词库：参考 2026 最新版浙江语文教材（统编版）古诗顺序整理
 * 公开课程标准，按一至六年级出现顺序分阶段。key 用诗题。
 * ========================================================== */
export const POEMS = [
  // 第1阶段（一年级上册，共6首，按教材顺序）
  { title: '咏鹅', author: '骆宾王', text: '鹅，鹅，鹅，曲项向天歌。白毛浮绿水，红掌拨清波。', stage: 0 },
  { title: '江南', author: '汉乐府', text: '江南可采莲，莲叶何田田。鱼戏莲叶间。鱼戏莲叶东，鱼戏莲叶西，鱼戏莲叶南，鱼戏莲叶北。', stage: 0 },
  { title: '画', author: '王维', text: '远看山有色，近听水无声。春去花还在，人来鸟不惊。', stage: 0 },
  { title: '悯农（其二）', author: '李绅', text: '锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。', stage: 0 },
  { title: '古朗月行（节选）', author: '李白', text: '小时不识月，呼作白玉盘。又疑瑶台镜，飞在青云端。', stage: 0 },
  { title: '风', author: '李峤', text: '解落三秋叶，能开二月花。过江千尺浪，入竹万竿斜。', stage: 0 },
  // 第2阶段（一年级下册，共7首，按教材顺序）
  { title: '春晓', author: '孟浩然', text: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', stage: 1 },
  { title: '赠汪伦', author: '李白', text: '李白乘舟将欲行，忽闻岸上踏歌声。桃花潭水深千尺，不及汪伦送我情。', stage: 1 },
  { title: '静夜思', author: '李白', text: '床前明月光，疑是地上霜。举头望明月，低头思故乡。', stage: 1 },
  { title: '寻隐者不遇', author: '贾岛', text: '松下问童子，言师采药去。只在此山中，云深不知处。', stage: 1 },
  { title: '池上', author: '白居易', text: '小娃撑小艇，偷采白莲回。不解藏踪迹，浮萍一道开。', stage: 1 },
  { title: '小池', author: '杨万里', text: '泉眼无声惜细流，树阴照水爱晴柔。小荷才露尖尖角，早有蜻蜓立上头。', stage: 1 },
  { title: '画鸡', author: '唐寅', text: '头上红冠不用裁，满身雪白走将来。平生不敢轻言语，一叫千门万户开。', stage: 1 },
  // 第3阶段（二年级上册，共7首，按教材顺序）
  { title: '梅花', author: '王安石', text: '墙角数枝梅，凌寒独自开。遥知不是雪，为有暗香来。', stage: 2 },
  { title: '小儿垂钓', author: '胡令能', text: '蓬头稚子学垂纶，侧坐莓苔草映身。路人借问遥招手，怕得鱼惊不应人。', stage: 2 },
  { title: '登鹳雀楼', author: '王之涣', text: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', stage: 2 },
  { title: '望庐山瀑布', author: '李白', text: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。', stage: 2 },
  { title: '江雪', author: '柳宗元', text: '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。', stage: 2 },
  { title: '夜宿山寺', author: '李白', text: '危楼高百尺，手可摘星辰。不敢高声语，恐惊天上人。', stage: 2 },
  { title: '敕勒歌', author: '北朝民歌', text: '敕勒川，阴山下。天似穹庐，笼盖四野。天苍苍，野茫茫，风吹草低见牛羊。', stage: 2 },
  // 第4阶段（二年级下册，共7首，按教材顺序）
  { title: '村居', author: '高鼎', text: '草长莺飞二月天，拂堤杨柳醉春烟。儿童散学归来早，忙趁东风放纸鸢。', stage: 3 },
  { title: '咏柳', author: '贺知章', text: '碧玉妆成一树高，万条垂下绿丝绦。不知细叶谁裁出，二月春风似剪刀。', stage: 3 },
  { title: '草', author: '白居易', text: '离离原上草，一岁一枯荣。野火烧不尽，春风吹又生。', stage: 3 },
  { title: '晓出净慈寺送林子方', author: '杨万里', text: '毕竟西湖六月中，风光不与四时同。接天莲叶无穷碧，映日荷花别样红。', stage: 3 },
  { title: '绝句', author: '杜甫', text: '两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。', stage: 3 },
  { title: '悯农（其一）', author: '李绅', text: '春种一粒粟，秋收万颗子。四海无闲田，农夫犹饿死。', stage: 3 },
  { title: '舟夜书所见', author: '查慎行', text: '月黑见渔灯，孤光一点萤。微微风簇浪，散作满河星。', stage: 3 },
  // 第5阶段（三年级，按教材顺序）
  { title: '所见', author: '袁枚', text: '牧童骑黄牛，歌声振林樾。意欲捕鸣蝉，忽然闭口立。', stage: 4 },
  { title: '山行', author: '杜牧', text: '远上寒山石径斜，白云生处有人家。停车坐爱枫林晚，霜叶红于二月花。', stage: 4 },
  { title: '望天门山', author: '李白', text: '天门中断楚江开，碧水东流至此回。两岸青山相对出，孤帆一片日边来。', stage: 4 },
  { title: '饮湖上初晴后雨', author: '苏轼', text: '水光潋滟晴方好，山色空蒙雨亦奇。欲把西湖比西子，淡妆浓抹总相宜。', stage: 4 },
  { title: '望洞庭', author: '刘禹锡', text: '湖光秋月两相和，潭面无风镜未磨。遥望洞庭山水翠，白银盘里一青螺。', stage: 4 },
  { title: '早发白帝城', author: '李白', text: '朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。', stage: 4 },
];

/** 取古诗阶段数 */
export const POEM_STAGES = (() => {
  const stages = new Set(POEMS.map(p => p.stage));
  return [...stages].sort((a,b)=>a-b);
})();

/** 取某阶段起的古诗 keys（标题） */
export function poemKeysUpToStage(stageIdx) {
  return POEMS.filter(p => p.stage <= stageIdx).map(p => p.title);
}

/* ============================================================
 * 新识字字库：第一册 + 第二册（共200字），每个字配3个常用词
 * ========================================================== */
export const CHINESE_WORDS = [
  // 第一册
  { char: "人", book: 1, words: ["人民", "大人", "人们"] },
  { char: "口", book: 1, words: ["口水", "门口", "人口"] },
  { char: "大", book: 1, words: ["大家", "大小", "大人"] },
  { char: "中", book: 1, words: ["中心", "中国", "中间"] },
  { char: "小", book: 1, words: ["小孩", "大小", "小手"] },
  { char: "哭", book: 1, words: ["大哭", "哭泣", "哭闹"] },
  { char: "笑", book: 1, words: ["笑声", "大笑", "笑话"] },
  { char: "一", book: 1, words: ["一天", "一个", "一起"] },
  { char: "上", book: 1, words: ["上面", "上学", "上山"] },
  { char: "下", book: 1, words: ["下山", "下面", "下雨"] },
  { char: "爸", book: 1, words: ["爸爸", "老爸", "爸妈"] },
  { char: "妈", book: 1, words: ["妈妈", "老妈", "爸妈"] },
  { char: "天", book: 1, words: ["天空", "今天", "明天"] },
  { char: "太", book: 1, words: ["太阳", "太好", "太大"] },
  { char: "月", book: 1, words: ["月亮", "明月", "日月"] },
  { char: "二", book: 1, words: ["二月", "二个", "二手"] },
  { char: "地", book: 1, words: ["大地", "土地", "地面"] },
  { char: "阳", book: 1, words: ["太阳", "阳光", "夕阳"] },
  { char: "亮", book: 1, words: ["明亮", "月亮", "漂亮"] },
  { char: "星", book: 1, words: ["星星", "火星", "明星"] },
  { char: "云", book: 1, words: ["白云", "云朵", "乌云"] },
  { char: "火", book: 1, words: ["大火", "火车", "火柴"] },
  { char: "水", book: 1, words: ["水牛", "山水", "水果"] },
  { char: "三", book: 1, words: ["三月", "三个", "三头"] },
  { char: "土", book: 1, words: ["土地", "泥土", "土豆"] },
  { char: "山", book: 1, words: ["大山", "山水", "山羊"] },
  { char: "石", book: 1, words: ["石头", "石子", "山石"] },
  { char: "木", book: 1, words: ["木头", "树木", "木耳"] },
  { char: "我", book: 1, words: ["我们", "自我", "我家"] },
  { char: "好", book: 1, words: ["好人", "你好", "好人"] },
  { char: "有", book: 1, words: ["有人", "没有", "有力"] },
  { char: "田", book: 1, words: ["田地", "水田", "农田"] },
  { char: "牛", book: 1, words: ["水牛", "小牛", "牛奶"] },
  { char: "羊", book: 1, words: ["山羊", "小羊", "羊群"] },
  { char: "聪", book: 1, words: ["聪明", "聪慧", "聪耳"] },
  { char: "耳", book: 1, words: ["耳朵", "木耳", "耳光"] },
  { char: "目", book: 1, words: ["目光", "耳目", "目的"] },
  { char: "心", book: 1, words: ["开心", "小心", "爱心"] },
  { char: "和", book: 1, words: ["和好", "和平", "和气"] },
  { char: "四", book: 1, words: ["四月", "四个", "四方"] },
  { char: "明", book: 1, words: ["明天", "明白", "明亮"] },
  { char: "头", book: 1, words: ["头发", "石头", "开头"] },
  { char: "眉", book: 1, words: ["眉毛", "眉头", "眉心"] },
  { char: "鼻", book: 1, words: ["鼻子", "鼻涕", "鼻孔"] },
  { char: "手", book: 1, words: ["小手", "手上", "手心"] },
  { char: "花", book: 1, words: ["花朵", "开花", "小花"] },
  { char: "树", book: 1, words: ["大树", "树叶", "树苗"] },
  { char: "五", book: 1, words: ["五月", "五个", "五天"] },
  { char: "草", book: 1, words: ["小草", "草地", "花草"] },
  { char: "叶", book: 1, words: ["树叶", "叶子", "绿叶"] },
  { char: "日", book: 1, words: ["日子", "日月", "明日"] },
  { char: "风", book: 1, words: ["大风", "风雨", "春风"] },
  { char: "雨", book: 1, words: ["下雨", "雨水", "雨天"] },
  { char: "的", book: 1, words: ["好的", "我的", "你的"] },
  { char: "孩", book: 1, words: ["孩子", "小孩", "女孩"] },
  { char: "六", book: 1, words: ["六月", "六个", "六天"] },
  { char: "白", book: 1, words: ["白色", "白天", "白云"] },
  { char: "红", book: 1, words: ["红色", "红花", "火红"] },
  { char: "是", book: 1, words: ["是的", "不是", "就是"] },
  { char: "家", book: 1, words: ["大家", "家人", "回家"] },
  { char: "多", book: 1, words: ["多少", "很多", "大多"] },
  { char: "唱", book: 1, words: ["唱歌", "唱戏", "合唱"] },
  { char: "子", book: 1, words: ["儿子", "孩子", "种子"] },
  { char: "七", book: 1, words: ["七月", "七个", "七天"] },
  { char: "爱", book: 1, words: ["爱心", "可爱", "友爱"] },
  { char: "爷", book: 1, words: ["爷爷", "老爷", "大爷"] },
  { char: "奶", book: 1, words: ["牛奶", "奶奶", "奶牛"] },
  { char: "少", book: 1, words: ["多少", "很少", "少年"] },
  { char: "歌", book: 1, words: ["歌曲", "唱歌", "儿歌"] },
  { char: "不", book: 1, words: ["不要", "不好", "不能"] },
  { char: "朋", book: 1, words: ["朋友", "朋辈", "朋党"] },
  { char: "八", book: 1, words: ["八月", "八个", "八天"] },
  { char: "宝", book: 1, words: ["宝宝", "宝贝", "宝物"] },
  { char: "在", book: 1, words: ["在家", "在学校", "现在"] },
  { char: "学", book: 1, words: ["学习", "学生", "上学"] },
  { char: "书", book: 1, words: ["书本", "读书", "看书"] },
  { char: "游", book: 1, words: ["游泳", "游戏", "游玩"] },
  { char: "友", book: 1, words: ["朋友", "友好", "友爱"] },
  { char: "儿", book: 1, words: ["儿子", "女儿", "儿童"] },
  { char: "九", book: 1, words: ["九月", "九个", "九天"] },
  { char: "贝", book: 1, words: ["宝贝", "贝壳", "贝类"] },
  { char: "生", book: 1, words: ["生活", "学生", "出生"] },
  { char: "习", book: 1, words: ["学习", "练习", "习作"] },
  { char: "看", book: 1, words: ["看见", "看书", "好看"] },
  { char: "戏", book: 1, words: ["游戏", "唱戏", "看戏"] },
  { char: "字", book: 1, words: ["写字", "识字", "文字"] },
  { char: "气", book: 1, words: ["天气", "生气", "空气"] },
  { char: "十", book: 1, words: ["十月", "十个", "十天"] },
  // 第二册
  { char: "会", book: 2, words: ["学会", "开会", "不会"] },
  { char: "见", book: 2, words: ["看见", "见面", "再见"] },
  { char: "早", book: 2, words: ["早上", "早安", "早晨"] },
  { char: "雪", book: 2, words: ["下雪", "雪花", "雪白"] },
  { char: "鸡", book: 2, words: ["公鸡", "小鸡", "鸡蛋"] },
  { char: "绿", book: 2, words: ["绿色", "绿叶", "碧绿"] },
  { char: "黄", book: 2, words: ["黄色", "黄瓜", "金黄"] },
  { char: "青", book: 2, words: ["青色", "青菜", "青山"] },
  { char: "鱼", book: 2, words: ["小鱼", "金鱼", "鱼儿"] },
  { char: "做", book: 2, words: ["做事", "做人", "做工"] },
  { char: "飞", book: 2, words: ["飞机", "飞鸟", "飞行"] },
  { char: "跑", book: 2, words: ["跑步", "快跑", "奔跑"] },
  { char: "要", book: 2, words: ["不要", "想要", "要好"] },
  { char: "吃", book: 2, words: ["吃饭", "好吃", "吃东西"] },
  { char: "鸟", book: 2, words: ["小鸟", "鸟儿", "飞鸟"] },
  { char: "他", book: 2, words: ["他们", "他人", "其他"] },
  { char: "们", book: 2, words: ["人们", "我们", "你们"] },
  { char: "春", book: 2, words: ["春天", "春风", "春雨"] },
  { char: "夏", book: 2, words: ["夏天", "夏日", "夏季"] },
  { char: "秋", book: 2, words: ["秋天", "秋风", "秋季"] },
  { char: "冬", book: 2, words: ["冬天", "冬日", "冬季"] },
  { char: "季", book: 2, words: ["季节", "四季", "雨季"] },
  { char: "都", book: 2, words: ["都是", "都好", "都有"] },
  { char: "个", book: 2, words: ["一个", "这个", "那个"] },
  { char: "狗", book: 2, words: ["小狗", "狗狗", "看门狗"] },
  { char: "猫", book: 2, words: ["小猫", "猫咪", "花猫"] },
  { char: "蓝", book: 2, words: ["蓝色", "蓝天", "蔚蓝"] },
  { char: "落", book: 2, words: ["落下", "落叶", "降落"] },
  { char: "真", book: 2, words: ["真的", "真好", "认真"] },
  { char: "开", book: 2, words: ["开门", "开始", "开心"] },
  { char: "说", book: 2, words: ["说话", "听说", "小说"] },
  { char: "也", book: 2, words: ["也是", "也有", "也好"] },
  { char: "马", book: 2, words: ["小马", "骑马", "马车"] },
  { char: "米", book: 2, words: ["大米", "小米", "米饭"] },
  { char: "哥", book: 2, words: ["哥哥", "大哥", "表哥"] },
  { char: "姐", book: 2, words: ["姐姐", "大姐", "表姐"] },
  { char: "来", book: 2, words: ["回来", "过来", "来往"] },
  { char: "黑", book: 2, words: ["黑色", "黑夜", "乌黑"] },
  { char: "去", book: 2, words: ["出去", "过去", "来去"] },
  { char: "出", book: 2, words: ["出来", "出去", "出门"] },
  { char: "跳", book: 2, words: ["跳舞", "跳高", "跳远"] },
  { char: "着", book: 2, words: ["看着", "听着", "笑着"] },
  { char: "了", book: 2, words: ["好了", "走了", "来了"] },
  { char: "你", book: 2, words: ["你们", "你好", "你的"] },
  { char: "又", book: 2, words: ["又是", "又有", "又大"] },
  { char: "弟", book: 2, words: ["弟弟", "兄弟", "表弟"] },
  { char: "妹", book: 2, words: ["妹妹", "姐妹", "小妹"] },
  { char: "东", book: 2, words: ["东方", "东风", "东西"] },
  { char: "就", book: 2, words: ["就是", "就好", "就会"] },
  { char: "还", book: 2, words: ["还有", "还是", "还要"] },
  { char: "快", book: 2, words: ["快乐", "快点", "快乐"] },
  { char: "得", book: 2, words: ["得到", "觉得", "跑得快"] },
  { char: "西", book: 2, words: ["西方", "东西", "西风"] },
  { char: "乐", book: 2, words: ["快乐", "音乐", "乐园"] },
  { char: "到", book: 2, words: ["到了", "到达", "看到"] },
  { char: "起", book: 2, words: ["起来", "起床", "一起"] },
  { char: "玩", book: 2, words: ["玩耍", "玩具", "游玩"] },
  { char: "捉", book: 2, words: ["捉住", "捉迷藏", "捉虫"] },
  { char: "迷", book: 2, words: ["迷路", "迷人", "入迷"] },
  { char: "球", book: 2, words: ["气球", "足球", "篮球"] },
  { char: "很", book: 2, words: ["很好", "很大", "很多"] },
  { char: "高", book: 2, words: ["高兴", "高大", "高楼"] },
  { char: "鸭", book: 2, words: ["鸭子", "小鸭", "鸭蛋"] },
  { char: "哈", book: 2, words: ["哈哈", "笑哈哈", "哈气"] },
  { char: "方", book: 2, words: ["方向", "地方", "东方"] },
  { char: "爬", book: 2, words: ["爬山", "爬行", "爬树"] },
  { char: "藏", book: 2, words: ["捉迷藏", "躲藏", "藏书"] },
  { char: "兴", book: 2, words: ["高兴", "兴奋", "兴趣"] },
  { char: "向", book: 2, words: ["方向", "向前", "向上"] },
  { char: "对", book: 2, words: ["对的", "不对", "对话"] },
  { char: "能", book: 2, words: ["能够", "能力", "能干"] },
  { char: "叫", book: 2, words: ["叫声", "叫好", "大叫"] },
  { char: "变", book: 2, words: ["变化", "变成", "变天"] },
  { char: "问", book: 2, words: ["问题", "问好", "提问"] },
  { char: "成", book: 2, words: ["成为", "成功", "成长"] },
  { char: "再", book: 2, words: ["再见", "再次", "再来"] },
  { char: "急", book: 2, words: ["着急", "急忙", "急性"] },
  { char: "教", book: 2, words: ["教书", "教师", "教学"] },
  { char: "门", book: 2, words: ["门口", "开门", "关门"] },
  { char: "只", book: 2, words: ["只有", "只是", "一只"] },
  { char: "回", book: 2, words: ["回来", "回家", "回去"] },
  { char: "公", book: 2, words: ["公鸡", "公共", "公园"] },
  { char: "打", book: 2, words: ["打扫", "打球", "打电话"] },
  { char: "兔", book: 2, words: ["兔子", "小兔", "白兔"] },
  { char: "请", book: 2, words: ["请问", "请求", "请进"] },
  { char: "过", book: 2, words: ["过来", "过去", "经过"] },
  { char: "吗", book: 2, words: ["好吗", "对吗", "是吗"] },
  { char: "泳", book: 2, words: ["游泳", "泳衣", "泳装"] },
];

/** 全部汉字的字符数组（按顺序） */
export const ALL_CHINESE_CHARS = CHINESE_WORDS.map(w => w.char);

/** 取某字的完整数据 */
export function getChineseCharData(char) {
  return CHINESE_WORDS.find(w => w.char === char) || null;
}

/** 取某字的3个组词 */
export function getChineseWords(char) {
  const data = getChineseCharData(char);
  return data ? data.words : [];
}
