// sync.js — GitHub 同步：通过 REST Contents API 读写仓库 JSON 文件

import { getState, replaceState, persist } from './store.js';
import { b64encode, b64decode } from './utils.js';

const API = 'https://api.github.com';

/** 取同步配置 */
export function getSyncConfig() {
  const s = getState().settings;
  return {
    repo: s.repo, branch: s.branch || 'main',
    dataPath: s.dataPath || 'data/userdata.json',
    token: s.token,
  };
}

/** 是否已配置同步 */
export function isConfigured() {
  const c = getSyncConfig();
  return !!(c.repo && c.token);
}

/** 拉取远端数据 */
export async function pullRemote() {
  const c = getSyncConfig();
  if (!isConfigured()) throw new Error('未配置 GitHub 同步信息');
  const [owner, repoName] = parseRepo(c.repo);
  const url = `${API}/repos/${owner}/${repoName}/contents/${c.dataPath}?ref=${c.branch}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${c.token}`, Accept: 'application/vnd.github+json' },
  });
  if (res.status === 404) return null; // 远端无文件
  if (!res.ok) throw new Error(`拉取失败: ${res.status} ${await safeText(res)}`);
  const data = await res.json();
  const sha = data.sha;
  const content = b64decode(data.content.replace(/\n/g, ''));
  const remote = JSON.parse(content);
  remote.meta = remote.meta || {};
  remote.meta.lastSyncSha = sha;
  return remote;
}

/** 推送本地数据到远端 */
export async function pushLocal() {
  const c = getSyncConfig();
  if (!isConfigured()) throw new Error('未配置 GitHub 同步信息');
  const [owner, repoName] = parseRepo(c.repo);
  const s = getState();
  const content = b64encode(JSON.stringify(s));
  // 先 GET 拿 sha（避免 422）
  let sha = s.meta.lastSyncSha;
  const getUrl = `${API}/repos/${owner}/${repoName}/contents/${c.dataPath}?ref=${c.branch}`;
  const getRes = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${c.token}`, Accept: 'application/vnd.github+json' },
  });
  if (getRes.status === 404) {
    sha = null;
  } else if (getRes.ok) {
    const getData = await getRes.json();
    sha = getData.sha;
    // 远端内容
    const remoteContent = b64decode(getData.content.replace(/\n/g, ''));
    const remote = JSON.parse(remoteContent);
    // 冲突检测：远端比本地新
    if (remote.meta && remote.meta.lastSyncAt && s.meta.lastSyncAt &&
        new Date(remote.meta.lastSyncAt) > new Date(s.meta.lastSyncAt) && s.meta.localDirty) {
      throw new Error('远端有更新且本地也有改动，请在设置页选择「拉取远端」或「强制推送」');
    }
  } else if (getRes.status !== 404) {
    throw new Error(`读取 sha 失败: ${getRes.status}`);
  }

  const putUrl = `${API}/repos/${owner}/${repoName}/contents/${c.dataPath}`;
  const body = {
    message: 'chore: sync checkin data',
    content,
    branch: c.branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(putUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${c.token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`推送失败: ${res.status} ${await safeText(res)}`);
  const data = await res.json();
  // 标记已同步
  const newSha = data.content ? data.content.sha : sha;
  const nowIso = new Date().toISOString();
  replaceState((() => {
    const st = JSON.parse(JSON.stringify(getState()));
    st.meta.lastSyncAt = nowIso;
    st.meta.lastSyncSha = newSha;
    st.meta.localDirty = false;
    return st;
  })());
  persist();
  return { ok: true, sha: newSha };
}

/** 同步入口：先拉取对比，再决定推送或提示 */
export async function syncNow({ force = false } = {}) {
  const c = getSyncConfig();
  if (!isConfigured()) throw new Error('未配置 GitHub 同步信息');
  const [owner, repoName] = parseRepo(c.repo);
  const s = getState();

  // 读远端
  const getUrl = `${API}/repos/${owner}/${repoName}/contents/${c.dataPath}?ref=${c.branch}`;
  const getRes = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${c.token}`, Accept: 'application/vnd.github+json' },
  });

  if (getRes.status === 404) {
    // 远端无文件，直接推送
    return pushLocal();
  }
  if (!getRes.ok) throw new Error(`拉取失败: ${getRes.status}`);
  const getData = await getRes.json();
  const remoteSha = getData.sha;
  const remoteContent = b64decode(getData.content.replace(/\n/g, ''));
  let remote;
  try { remote = JSON.parse(remoteContent); } catch { remote = null; }

  // 本地无脏且远端就是上次同步版本：无需操作
  if (!s.meta.localDirty && s.meta.lastSyncSha === remoteSha) {
    return { ok: true, msg: '已是最新' };
  }

  // 本地无脏但远端有更新：拉取覆盖
  if (!s.meta.localDirty && remote) {
    remote.meta = remote.meta || {};
    remote.meta.lastSyncSha = remoteSha;
    replaceState(remote);
    persist();
    return { ok: true, msg: '已拉取远端更新' };
  }

  // 本地有脏：force 则直接推送，否则需用户决策
  if (force) return pushLocal();
  // 判断远端是否更新过
  if (remote && remote.meta && remote.meta.lastSyncAt && s.meta.lastSyncAt &&
      new Date(remote.meta.lastSyncAt).getTime() > new Date(s.meta.lastSyncAt).getTime()) {
    return { ok: false, conflict: true, msg: '远端有更新，本地也有改动' };
  }
  // 远端没更新或无时间戳：推送本地
  return pushLocal();
}

/** 拉取并覆盖本地（用户选择远端优先） */
export async function pullAndOverwrite() {
  const remote = await pullRemote();
  if (!remote) throw new Error('远端暂无数据文件');
  replaceState(remote);
  persist();
  return { ok: true };
}

function parseRepo(repo) {
  // 支持 "owner/repo" 或 github URL
  let r = (repo || '').trim();
  r = r.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
  r = r.replace(/\.git$/, '');
  const parts = r.split('/');
  if (parts.length < 2) throw new Error('仓库格式应为 owner/repo');
  return [parts[0], parts[1]];
}

async function safeText(res) {
  try { return await res.text(); } catch { return ''; }
}
