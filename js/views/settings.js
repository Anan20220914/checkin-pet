// views/settings.js — 设置页：孩子信息、识字阶段、任务管理、GitHub同步、导入导出

import { getState, update, exportJSON, importJSON } from '../store.js';
import { CHINESE_STAGES } from '../vocab-data.js';
import { CATEGORIES, TASK_KIND, RARITY_NAME, RARITY_COLOR, SHOP_WEAPONS, SHOP_FOODS } from '../db2.js';
import { isConfigured, syncNow, pullAndOverwrite } from '../sync.js';
import { esc, formatDateTime } from '../utils.js';
import { showOverlay, closeOverlay, toast, switchTab } from '../app.js';
import { toggleCheckTask, toggleTaskActive, addTask, deleteTask } from '../tasks.js';


export function renderSettings() {
  const s = getState();
  const cfg = s.settings;
  const configured = isConfigured();
  const dirty = s.meta.localDirty;

  let html = '';

  // 孩子信息
  html += `
    <div class="card">
      <div class="section-title" style="margin:0 0 8px">👦 孩子信息</div>
      <div class="form-group">
        <label>昵称</label>
        <input class="form-control" id="set-name" value="${esc(s.child.name)}">
      </div>
      <div class="form-group">
        <label>头像 emoji</label>
        <input class="form-control" id="set-avatar" value="${esc(s.child.avatar)}" maxlength="2">
      </div>
    </div>
  `;

  // 识字阶段
  const stageIdx = s.bookProgress.chineseStageIdx || 0;
  const stage = CHINESE_STAGES[stageIdx];
  const learnedChars = Object.keys(s.memory.chinese || {}).filter(k => (s.memory.chinese[k].box||0) >= 1).length;
  html += `
    <div class="card">
      <div class="section-title" style="margin:0 0 8px">📚 识字字库</div>
      <div class="muted" style="font-size:13px;margin-bottom:8px">当前阶段 ${stageIdx + 1}/${CHINESE_STAGES.length} · 已学 ${learnedChars} 字</div>
      <div style="font-size:13px;color:var(--text-soft);background:var(--bg-soft);padding:8px;border-radius:8px;margin-bottom:8px">本阶段字：${stage.slice(0,12).join(' ')}${stage.length > 12 ? ' …' : ''}</div>
      <div class="row">
        <button class="btn secondary" id="stage-prev" ${stageIdx > 0 ? '' : 'disabled'}>上一阶段</button>
        <button class="btn secondary" id="stage-next" ${stageIdx < CHINESE_STAGES.length - 1 ? '' : 'disabled'}>下一阶段</button>
      </div>
    </div>
  `;

  // GitHub 同步
  html += `
    <div class="card">
      <div class="section-title" style="margin:0 0 8px">🔄 GitHub 同步</div>
      <div class="form-group">
        <label>仓库（owner/repo）</label>
        <input class="form-control" id="set-repo" value="${esc(cfg.repo)}" placeholder="yourname/checkin-pet">
      </div>
      <div class="form-group">
        <label>分支</label>
        <input class="form-control" id="set-branch" value="${esc(cfg.branch)}" placeholder="main">
      </div>
      <div class="form-group">
        <label>数据文件路径</label>
        <input class="form-control" id="set-path" value="${esc(cfg.dataPath)}" placeholder="data/userdata.json">
      </div>
      <div class="form-group">
        <label>访问令牌 Token（fine-grained PAT）</label>
        <input class="form-control" type="password" id="set-token" value="${esc(cfg.token)}" autocomplete="off" placeholder="github_pat_...">
        <div class="hint warn">Token 只存本机，不会同步到仓库文件；建议仓库设为私有</div>
      </div>
      <div class="sync-status ${dirty ? 'dirty' : ''}" id="syncStatus">${syncStatusText(s, configured)}</div>
      <div class="row">
        <button class="btn" id="btn-sync">${configured ? '立即同步' : '保存并同步'}</button>
        <button class="btn secondary" id="btn-pull" ${configured ? '' : 'disabled'}>拉取远端</button>
      </div>
      <label style="display:flex;align-items:center;gap:6px;margin-top:10px;font-size:14px">
        <input type="checkbox" id="set-auto" ${cfg.autoSync ? 'checked' : ''}> 打卡/战斗后自动同步
      </label>
    </div>
  `;

  // 任务管理入口
  html += `<div class="card">
    <div class="section-title" style="margin:0 0 8px">📝 任务管理</div>
    <button class="btn secondary block" id="btn-tasks">管理打卡任务</button>
  </div>`;

  // 数据导入导出
  html += `<div class="card">
    <div class="section-title" style="margin:0 0 8px">💾 数据备份</div>
    <div class="row">
      <button class="btn secondary" id="btn-export">导出 JSON</button>
      <button class="btn secondary" id="btn-import">导入 JSON</button>
    </div>
    <input type="file" id="file-import" accept="application/json" hidden>
    <div class="hint">导入会覆盖现有数据，请先导出备份</div>
  </div>`;

  // 关于
  html += `<div class="card">
    <div class="section-title" style="margin:0 0 8px">ℹ️ 关于</div>
    <div class="muted" style="font-size:13px;line-height:1.8">
      打卡宠物岛 · 让坚持打卡变成养宠物打怪兽的游戏<br>
      数据存本地 + GitHub 同步 · 离线可用<br>
      部署：GitHub Pages · 可加到手机主屏幕
    </div>
  </div>`;

  document.getElementById('view-settings').innerHTML = html;
  bindSettings();
}

function syncStatusText(s, configured) {
  if (!configured) return '未配置同步信息';
  const t = s.meta.localDirty ? '有未同步的改动' : '已是最新';
  const last = s.meta.lastSyncAt ? ` · 上次同步 ${formatDateTime(s.meta.lastSyncAt)}` : ' · 尚未同步';
  return t + last;
}

function bindSettings() {
  const saveBasic = () => {
    update(s => {
      s.child.name = document.getElementById('set-name').value.trim() || '小宝';
      s.child.avatar = document.getElementById('set-avatar').value.trim() || '🦊';
      s.settings.repo = document.getElementById('set-repo').value.trim();
      s.settings.branch = document.getElementById('set-branch').value.trim() || 'main';
      s.settings.dataPath = document.getElementById('set-path').value.trim() || 'data/userdata.json';
      s.settings.token = document.getElementById('set-token').value.trim();
      s.settings.autoSync = document.getElementById('set-auto').checked;
    });
  };

  document.getElementById('set-name').addEventListener('change', saveBasic);
  document.getElementById('set-avatar').addEventListener('change', saveBasic);
  document.getElementById('set-repo').addEventListener('change', saveBasic);
  document.getElementById('set-branch').addEventListener('change', saveBasic);
  document.getElementById('set-path').addEventListener('change', saveBasic);
  document.getElementById('set-token').addEventListener('change', saveBasic);
  document.getElementById('set-auto').addEventListener('change', saveBasic);

  document.getElementById('stage-prev').onclick = () => { saveBasic(); update(s => { if (s.bookProgress.chineseStageIdx > 0) s.bookProgress.chineseStageIdx--; }); };
  document.getElementById('stage-next').onclick = () => { saveBasic(); update(s => { if (s.bookProgress.chineseStageIdx < CHINESE_STAGES.length - 1) s.bookProgress.chineseStageIdx++; }); };

  document.getElementById('btn-sync').onclick = async () => {
    saveBasic();
    if (!isConfigured()) { toast('请先填写仓库和 Token'); return; }
    toast('同步中…');
    try {
      const r = await syncNow();
      toast(r.msg || (r.ok ? '同步成功' : '同步完成'));
      renderSettings();
    } catch (e) { toast('同步失败：' + e.message); }
  };
  document.getElementById('btn-pull').onclick = async () => {
    saveBasic();
    try {
      await pullAndOverwrite();
      toast('已拉取远端数据');
      renderSettings();
    } catch (e) { toast('拉取失败：' + e.message); }
  };

  document.getElementById('btn-tasks').onclick = openTaskManager;

  document.getElementById('btn-export').onclick = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `checkin-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    toast('已导出');
  };
  document.getElementById('btn-import').onclick = () => document.getElementById('file-import').click();
  document.getElementById('file-import').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { importJSON(reader.result); toast('导入成功'); renderSettings(); }
      catch (e) { toast('导入失败：' + e.message); }
    };
    reader.readAsText(file);
  };
}

function openTaskManager() {
  const s = getState();
  const order = ['study', 'habit', 'sport', 'life'];
  let list = '';
  for (const cat of order) {
    const meta = CATEGORIES[cat];
    list += `<div class="cat-header"><span class="cat-emoji">${meta.emoji}</span><span>${meta.name}</span><span class="cat-bar"></span></div>`;
    for (const t of s.tasks.filter(t => t.category === cat)) {
      const isCheck = t.kind === TASK_KIND.CHECK;
      list += `<div class="shop-item">
        <div class="s-icon" style="font-size:18px">${t.icon || '⭐'}</div>
        <div class="s-body">
          <div class="s-name">${esc(t.title)} ${t.active ? '' : '<span class="badge" style="background:#9ca3af">停用</span>'}</div>
          <div class="s-desc">${isCheck ? `勾选 · ${t.points}分` : `每日${t.dailyCount}题 · ${t.points}分`}</div>
        </div>
        <div class="s-actions">
          ${t.custom ? `<button class="btn-sm btn-equip" data-del="${t.id}">删除</button>` : `<button class="btn-sm btn-equip" data-toggle="${t.id}">${t.active ? '停用' : '启用'}</button>`}
        </div>
      </div>`;
    }
  }
  const html = `<h2>📝 任务管理</h2>${list}
    <div class="section-title">➕ 新增勾选任务</div>
    <div class="form-group"><input class="form-control" id="nt-title" placeholder="任务名"></div>
    <div class="row">
      <select class="form-control" id="nt-cat">
        <option value="habit">习惯养成</option><option value="sport">运动</option><option value="life">家务</option>
      </select>
      <input class="form-control" id="nt-pts" type="number" value="2" min="1" max="10">
    </div>
    <button class="btn block" id="nt-add">添加</button>
    <button class="btn secondary block" id="nt-close" style="margin-top:8px">关闭</button>`;
  showOverlay(html, {
    onMount: c => {
      c.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { deleteTask(b.dataset.del); closeOverlay(); openTaskManager(); });
      c.querySelectorAll('[data-toggle]').forEach(b => b.onclick = () => { toggleTaskActive(b.dataset.toggle); closeOverlay(); openTaskManager(); });
      c.querySelector('#nt-add').onclick = () => {
        const title = c.querySelector('#nt-title').value.trim();
        if (!title) { toast('请输入任务名'); return; }
        addTask({ title, category: c.querySelector('#nt-cat').value, points: parseInt(c.querySelector('#nt-pts').value, 10) || 2, icon: '⭐' });
        toast('已添加');
        closeOverlay(); openTaskManager();
      };
      c.querySelector('#nt-close').onclick = closeOverlay;
    },
  });
}
