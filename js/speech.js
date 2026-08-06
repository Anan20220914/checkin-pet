// speech.js — 语音合成（TTS）+ 语音识别（SpeechRecognition）封装
// 全部基于浏览器原生 Web Speech API，零依赖

/** 是否支持语音合成 */
export const canSpeak = typeof speechSynthesis !== 'undefined';

/** 是否支持语音识别 */
export const canRecognize = typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

/** 读一个英语单词 */
export function speak(text, opts = {}) {
  if (!canSpeak) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = opts.lang || 'en-US';
  u.rate = opts.rate || 0.85;   // 幼儿听力放慢
  u.pitch = opts.pitch || 1.1;
  // 选英语嗓音
  const voices = speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en'));
  if (enVoice) u.voice = enVoice;
  speechSynthesis.speak(u);
}

export function stopSpeak() {
  if (canSpeak) speechSynthesis.cancel();
}

/**
 * 识别孩子发音
 * @returns Promise<{ transcript, ok }>
 *   ok=true 识别到目标词（宽松匹配）
 */
export function recognize(targetWord) {
  return new Promise((resolve) => {
    if (!canRecognize) {
      // 不支持：家长手动判定
      resolve({ transcript: '', ok: false, manual: true });
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    let finished = false;
    const done = (res) => { if (finished) return; finished = true; resolve(res); };
    rec.onresult = (e) => {
      const alts = [];
      for (let i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript.trim().toLowerCase());
      const match = matchWord(targetWord, alts);
      done({ transcript: alts[0], ok: match, alts });
    };
    rec.onerror = () => done({ transcript: '', ok: false, error: true });
    rec.onend = () => { if (!finished) done({ transcript: '', ok: false, noResult: true }); };
    try { rec.start(); } catch (e) { done({ transcript: '', ok: false, error: true }); }
    // 6 秒超时
    setTimeout(() => { try { rec.stop(); } catch {} }, 6000);
  });
}

/** 宽松匹配：识别结果包含目标词或发音接近 */
function matchWord(target, alts) {
  const t = (target || '').toLowerCase().trim();
  // 精确包含
  for (const a of alts) {
    if (a === t || a.includes(t) || t.includes(a)) return true;
  }
  // 简单 Levenshtein 距离 ≤2 视为通过（容错孩子发音）
  for (const a of alts) {
    if (a && levenshtein(a, t) <= 2) return true;
  }
  return false;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i-1].toLowerCase() === b[j-1].toLowerCase() ? 0 : 1;
      dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost);
    }
  }
  return dp[m][n];
}

/** 预加载嗓音列表（部分浏览器异步加载） */
if (canSpeak && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}
