// sync.js 鈥?GitHub 鍚屾锛氶€氳繃 REST Contents API 璇诲啓浠撳簱 JSON 鏂囦欢

import { getState, replaceState, persist } from './store.js';
import { b64encode, b64decode } from './utils.js';

const API = 'https://api.github.com';

/** 鍒涘缓涓嶅惈鏁忔劅 token 鐨?state 鍓湰锛堥伩鍏嶆帹閫佸埌 GitHub 瑙﹀彂 Secret Scanning锛?*/
function stripToken(state) {
  const clone = JSON.parse(JSON.stringify(state));
  if (clone.settings) {
    clone.settings.token = null;
  }
  return clone;
}

/** 鎭㈠鏈湴 token锛堟媺鍙栬繙绔悗锛屼繚鐣欐湰鏈?token 涓嶈瑕嗙洊锛?*/
function restoreLocalToken(targetState, localToken) {
  if (targetState.settings) {
    targetState.settings.token = localToken;
  }
}

/** 鍙栧悓姝ラ厤缃?*/
export function getSyncConfig() {
  const s = getState().settings;
  return {
    repo: s.repo, branch: s.branch || 'main',
    dataPath: s.dataPath || 'data/userdata.json',
    token: s.token,
  };
}

/** 鏄惁宸查厤缃悓姝?*/
export function isConfigured() {
  const c = getSyncConfig();
  return !!(c.repo && c.token);
}

/** 鎷夊彇杩滅鏁版嵁 */
export async function pullRemote() {
  const c = getSyncConfig();
  if (!isConfigured()) throw new Error('鏈厤缃?GitHub 鍚屾淇℃伅');
  const [owner, repoName] = parseRepo(c.repo);
  const url = `${API}/repos/${owner}/${repoName}/contents/${c.dataPath}?ref=${c.branch}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${c.token}`, Accept: 'application/vnd.github+json' },
  });
  if (res.status === 404) return null; // 杩滅鏃犳枃浠?  if (!res.ok) throw new Error(`鎷夊彇澶辫触: ${res.status} ${await safeText(res)}`);
  const data = await res.json();
  const sha = data.sha;
  const content = b64decode(data.content.replace(/\n/g, ''));
  let remote;
  try {
    remote = JSON.parse(content);
  } catch (e) {
    // 鏂囦欢鍐呭涓虹┖鎴栨牸寮忛敊璇紝褰撲綔绌哄璞″鐞?    remote = {};
  }
  remote.meta = remote.meta || {};
  remote.meta.lastSyncSha = sha;
  // 娓呯悊杩滅鍙兘娈嬬暀鐨勬棫 token锛堟棫鐗堟湰 bug 瀵艰嚧锛?  if (remote.settings) remote.settings.token = null;
  return remote;
}

/** 鎺ㄩ€佹湰鍦版暟鎹埌杩滅 */
export async function pushLocal() {
  const c = getSyncConfig();
  if (!isConfigured()) throw new Error('鏈厤缃?GitHub 鍚屾淇℃伅');
  const [owner, repoName] = parseRepo(c.repo);
  const s = getState();
  // 鎺ㄩ€佸墠绉婚櫎 token锛岄伩鍏?GitHub Secret Scanning 妫€娴嬪鑷存帹閫佸け璐?  const payload = stripToken(s);
  const content = b64encode(JSON.stringify(payload));
  // 鍏?GET 鎷?sha锛堥伩鍏?422锛?  let sha = s.meta.lastSyncSha;
  const getUrl = `${API}/repos/${owner}/${repoName}/contents/${c.dataPath}?ref=${c.branch}`;
  const getRes = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${c.token}`, Accept: 'application/vnd.github+json' },
  });
  if (getRes.status === 404) {
    sha = null;
  } else if (getRes.ok) {
    const getData = await getRes.json();
    sha = getData.sha;
    // 杩滅鍐呭
    const remoteContent = b64decode(getData.content.replace(/\n/g, ''));
    const remote = JSON.parse(remoteContent);
    // 鍐茬獊妫€娴嬶細杩滅姣旀湰鍦版柊
    if (remote.meta && remote.meta.lastSyncAt && s.meta.lastSyncAt &&
        new Date(remote.meta.lastSyncAt) > new Date(s.meta.lastSyncAt) && s.meta.localDirty) {
      throw new Error('杩滅鏈夋洿鏂颁笖鏈湴涔熸湁鏀瑰姩锛岃鍦ㄨ缃〉閫夋嫨銆屾媺鍙栬繙绔€嶆垨銆屽己鍒舵帹閫併€?);
    }
  } else if (getRes.status !== 404) {
    throw new Error(`璇诲彇 sha 澶辫触: ${getRes.status}`);
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
  if (!res.ok) throw new Error(`鎺ㄩ€佸け璐? ${res.status} ${await safeText(res)}`);
  const data = await res.json();
  // 鏍囪宸插悓姝?  const newSha = data.content ? data.content.sha : sha;
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

/** 鍚屾鍏ュ彛锛氬厛鎷夊彇瀵规瘮锛屽啀鍐冲畾鎺ㄩ€佹垨鎻愮ず */
export async function syncNow({ force = false } = {}) {
  const c = getSyncConfig();
  if (!isConfigured()) throw new Error('鏈厤缃?GitHub 鍚屾淇℃伅');
  const [owner, repoName] = parseRepo(c.repo);
  const s = getState();

  // 璇昏繙绔?  const getUrl = `${API}/repos/${owner}/${repoName}/contents/${c.dataPath}?ref=${c.branch}`;
  const getRes = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${c.token}`, Accept: 'application/vnd.github+json' },
  });

  if (getRes.status === 404) {
    // 杩滅鏃犳枃浠讹紝鐩存帴鎺ㄩ€?    return pushLocal();
  }
  if (!getRes.ok) throw new Error(`鎷夊彇澶辫触: ${getRes.status}`);
  const getData = await getRes.json();
  const remoteSha = getData.sha;
  const remoteContent = b64decode(getData.content.replace(/\n/g, ''));
  let remote;
  try { remote = JSON.parse(remoteContent); } catch { remote = null; }

  // 鏈湴鏃犺剰涓旇繙绔氨鏄笂娆″悓姝ョ増鏈細鏃犻渶鎿嶄綔
  if (!s.meta.localDirty && s.meta.lastSyncSha === remoteSha) {
    return { ok: true, msg: '宸叉槸鏈€鏂? };
  }

  // 鏈湴鏃犺剰浣嗚繙绔湁鏇存柊锛氭媺鍙栬鐩?  if (!s.meta.localDirty && remote) {
    remote.meta = remote.meta || {};
    remote.meta.lastSyncSha = remoteSha;
    restoreLocalToken(remote, s.settings.token);
    replaceState(remote);
    persist();
    return { ok: true, msg: '宸叉媺鍙栬繙绔洿鏂? };
  }

  // 鏈湴鏈夎剰锛歠orce 鍒欑洿鎺ユ帹閫侊紝鍚﹀垯闇€鐢ㄦ埛鍐崇瓥
  if (force) return pushLocal();
  // 鍒ゆ柇杩滅鏄惁鏇存柊杩?  if (remote && remote.meta && remote.meta.lastSyncAt && s.meta.lastSyncAt &&
      new Date(remote.meta.lastSyncAt).getTime() > new Date(s.meta.lastSyncAt).getTime()) {
    return { ok: false, conflict: true, msg: '杩滅鏈夋洿鏂帮紝鏈湴涔熸湁鏀瑰姩' };
  }
  // 杩滅娌℃洿鏂版垨鏃犳椂闂存埑锛氭帹閫佹湰鍦?  return pushLocal();
}

/** 鎷夊彇骞惰鐩栨湰鍦帮紙鐢ㄦ埛閫夋嫨杩滅浼樺厛锛?*/
export async function pullAndOverwrite() {
  const remote = await pullRemote();
  if (!remote) throw new Error('杩滅鏆傛棤鏁版嵁鏂囦欢');
  const s = getState();
  restoreLocalToken(remote, s.settings.token);
  replaceState(remote);
  persist();
  return { ok: true };
}

function parseRepo(repo) {
  // 鏀寔 "owner/repo" 鎴?github URL
  let r = (repo || '').trim();
  r = r.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
  r = r.replace(/\.git$/, '');
  const parts = r.split('/');
  if (parts.length < 2) throw new Error('浠撳簱鏍煎紡搴斾负 owner/repo');
  return [parts[0], parts[1]];
}

async function safeText(res) {
  try { return await res.text(); } catch { return ''; }
}
