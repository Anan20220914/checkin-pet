# 🐾 打卡宠物岛

给孩子做的日常打卡工作台：完成打卡任务赚积分，用积分给宠物买武器和食物，每天英语开口读词攻击当日怪兽，打死怪兽就掉宠物蛋、孵化新宠物。部署到 GitHub Pages，可加到手机主屏幕当 App 永久使用，数据通过 GitHub 同步、离线也能用。

## 功能

- **习惯打卡**：按时起床/睡觉、好好刷牙洗脸、自己穿衣、上学不迟到、不发脾气（7 项勾选）
- **学习打卡**（互动）：
  - 📖 识字：分级字库（参考统编一年级），家长判"熟练/一般/不会"，≥80% 熟练算通过
  - 🅰️ 英语：听单词选对应图，家长判三档，≥80% 熟练通过
  - ➕ 数学：10 以内加减法 10 题，准确率 ≥80% 通过
  - 🗣️ 英语开口：读单词让宠物攻击当日怪兽，打死怪兽 = 打卡成功 + 掉蛋
- **运动 / 家务打卡**：列出常见项目，孩子选今天做了哪些
- **循环记忆**：熟练/一般的字词次日会再出现，不会的次日必出现（间隔重复）
- **宠物系统**：默认送一只宠物，多只可切换出战、装备武器、喂食恢复
- **商店**：用积分买武器（提升攻击）和食物（回血/增益/复活）
- **每日对决**：连胜越高怪兽越强（Tier 1→6），失败连胜归零但不扣分，胜利按 Tier 发积分 + 概率掉蛋
- **数据同步**：localStorage 本地为主 + GitHub 仓库 JSON 同步（多设备/换机不丢）
- **离线可用 + PWA**：加到手机主屏幕当 App 用

## 本地预览

```bash
# 任选其一
python -m http.server 8080
# 或
npx serve .
```

浏览器打开 `http://localhost:8080`。首次使用直接进入应用，数据自动初始化。

> 语音识别（英语开口）需 Chrome 内核浏览器，且部分功能需 HTTPS 或 localhost。手机上用 Safari「添加到主屏幕」或 Chrome「安装」效果最佳。

## 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库（建议 **私有** 仓库，PWA 同样可用）。
2. 把本目录所有文件上传到仓库根目录（main 分支）。
3. 仓库 **Settings → Pages**，Source 选 `Deploy from a branch`，分支选 `main`、目录选 `/ (root)`，保存。
   - 私有仓库用 GitHub Actions 部署更稳，见下方「私有仓库」。
4. 等 1-2 分钟，访问 `https://<你的用户名>.github.io/<仓库名>/` 即可。
5. 手机浏览器打开该地址，Safari 点分享→「添加到主屏幕」；Chrome 地址栏右侧→「安装」。之后从桌面图标打开，全屏无地址栏，离线也能用。

### 私有仓库（推荐）

私有仓库的 GitHub Pages 需通过 Actions 部署。在仓库 `.github/workflows/deploy.yml` 加：

```yaml
name: Deploy to Pages
on:
  push:
    branches: [main]
permissions: { pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - uses: actions/deploy-pages@v4
```

随后 Settings → Pages → Source 选 `GitHub Actions`。

## 配置数据同步（GitHub API）

应用内「设置」页填写：

- **仓库**：`owner/repo`，如 `zhangsan/checkin-pet`
- **分支**：默认 `main`
- **数据文件路径**：默认 `data/userdata.json`
- **Token**：fine-grained PAT

### 生成 Token 步骤

1. GitHub → 右上头像 → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
2. **Resource owner**：选你自己；**Repository access**：选 `Only select repositories` → 勾选你的打卡仓库
3. **Permissions → Repository permissions → Contents**：设为 `Read and write`（其它保持默认 No access）
4. **Expiration**：建议 90 天；到期需重新生成并在应用里更新
5. 生成后复制 `github_pat_...`，粘贴到应用设置页的 Token 框

> ⚠️ Token 只存在你手机本机的 localStorage，**不会**被写入同步到仓库的 JSON 文件，也不会进 service worker 缓存。换设备需重新配置。同步走的是 GitHub 官方 API，token 仅授权该仓库的 Contents 读写。

### 同步说明

- 默认**手动同步**：设置页点「立即同步」
- 可开启「打卡/战斗后自动同步」（节流 30 秒）
- 同一设备多端编辑概率低；若本地与远端都有改动，会提示让你选「拉取远端」或「立即同步（强制）」
- 数据也支持「导出 JSON / 导入 JSON」作为兜底备份

## 文件结构

```
index.html              单页入口 + 5 Tab 导航
css/style.css           全部样式
manifest.webmanifest    PWA 清单
service-worker.js       离线缓存（app shell 预缓存，API 不缓存）
js/
  app.js                路由 / 初始化 / 共享 UI / 自动同步
  store.js              状态管理（localStorage 唯一出入口）
  db.js                 任务/宠物/怪物/商店数值表 + 初始数据
  tasks.js              任务查询 + 当日打卡结果（勾选/答题/战斗）
  srs.js                间隔重复调度（循环记忆）
  pets.js               宠物：切换/装备/喂食/属性
  shop.js               商店：购买 / 库存
  battle.js             怪物生成 / 伤害 / 掉蛋
  daily.js              每日刷新：怪物/回血/蛋孵化
  sync.js               GitHub Contents API 读写 + 冲突
  speech.js             TTS 朗读 + 语音识别
  svg-art.js            英语单词 SVG 简笔画
  vocab-data.js         识字字库 + 英语词库
  sw-register.js        注册 service worker
  views/                各 Tab 与打卡界面渲染
icons/                  PWA 图标 + favicon
```

## 自定义与扩展

- **加任务**：设置 → 任务管理，可增删勾选型任务（习惯/运动/家务）
- **识字字库**：`js/vocab-data.js` 的 `CHINESE_STAGES`，按阶段添加字即可；设置页可手动切换当前阶段
- **英语词库**：`js/vocab-data.js` 的 `ENGLISH_WORDS`，每词配 `svg` key，对应 `js/svg-art.js` 里的简笔画
- **数值平衡**：`js/db.js` 里的 `SHOP_WEAPONS`、`SHOP_FOODS`、`MONSTER_TIERS`、`RARITY_TABLE`

## 说明

- 识字字库按统编版语文一年级上册识字顺序整理（公开课程标准），未复制任何版权书籍内容。如需对接《四五快读》等特定教材，可在词库文件自行替换字表。
- 英语单词图全部由程序化 SVG 绘制，零依赖、离线可用；如需更精美图片可自行替换 `svg-art.js`。
- 语音识别对孩子英语发音容差较宽（包含目标词或编辑距离 ≤2 即判对），家长可在每词手动修正「读对/再试」。
