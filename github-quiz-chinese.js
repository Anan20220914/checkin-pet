// views/quiz-chinese.js 鈥?璇嗗瓧鎵撳崱鐣岄潰
// 浠庡瓧搴撴寜 SRS 璋冨害鍙?10 瀛楋紝閫愬瓧灞曠ず锛屽闀垮垽 鐔熺粌/涓€鑸?涓嶄細锛屸墺80% 鐔熺粌绠楅€氳繃

import { getState } from '../store.js';
import { CHINESE_STAGES } from '../vocab-data.js';
import { buildDailyList, grade, getStats } from '../srs2.js';
import { submitQuiz } from '../tasks.js';
import { SRS_GRADE, RARITY_COLOR } from '../db2.js';
import { showOverlay, closeOverlay, toast, switchTab, celebrate } from '../app.js';
import { esc } from '../utils.js';

let state = null; // { task, list, idx, grades: [] }

export function openChineseQuiz(taskId) {
  const task = getState().tasks.find(t => t.id === taskId);
  if (!task) return;
  // 鍙栧綋鍓嶉樁娈佃捣鎵€鏈夊瓧锛堝惈宸插璺ㄩ樁娈碉級
  // 璺宠繃绗竴澶╋紝浠庣浜岄樁娈靛紑濮?  const s = getState();
  const startStage = Math.max(1, s.bookProgress.chineseStageIdx || 0);
  const allKeys = [];
  // 浠庣浜岄樁娈靛紑濮嬪彇瀛楋紝璺宠繃绗竴闃舵
  for (let i = 1; i <= startStage; i++) {
    for (const ch of CHINESE_STAGES[i]) allKeys.push(ch);
  }
  // 褰?SRS 瀛﹀畬褰撳墠闃舵涓€瀹氭瘮渚嬪悗鑷姩瑙ｉ攣涓嬩竴闃舵锛堣繖閲屽厛涓嶈嚜鍔紝瀹堕暱鍦ㄨ缃彲鎵嬪姩鍗囬樁锛?  const plan = buildDailyList('chinese', allKeys, task.dailyCount || 10, 3);
  const list = plan.all.length ? plan.all : allKeys.slice(0, task.dailyCount || 10);

  state = { task, list, idx: 0, grades: [], reviewCount: plan.review.length };
  renderCard();
}

function renderCard() {
  if (!state) return;
  if (state.idx >= state.list.length) {
    return finish();
  }
  const ch = state.list[state.idx];
  const total = state.list.length;
  const cur = state.idx + 1;

  const st = getStats('chinese');
  const html = `
    <div class="quiz-head">
      <span class="quiz-back" id="qcBack">鈥?/span>
      <span class="quiz-title">璇嗗瓧鎵撳崱</span>
      <span class="quiz-count">${cur}/${total}</span>
    </div>
    <div class="stats-bar">
      <span class="stat-good">鐔熺粌 ${st.good}</span>
      <span class="stat-ok">涓嶅お浼?${st.ok}</span>
      <span class="stat-again">涓嶄細 ${st.again}</span>
    </div>
    <div class="quiz-stage">
      <div class="big-char">${esc(ch)}</div>
      <button class="btn secondary" id="qcTTS">馃攰 鍚竴鍚?/button>
      <div class="quiz-tip">瀹堕暱鍒ゆ柇瀛╁瓙璁よ鐔熺粌搴?/div>
    </div>
    <div class="quiz-grades">
      <button class="grade-btn good" data-g="good">馃憤 鐔熺粌</button>
      <button class="grade-btn ok" data-g="ok">馃檪 涓€鑸?/button>
      <button class="grade-btn again" data-g="again">馃檹 涓嶄細</button>
    </div>
    <div class="quiz-progress">
      <div class="qp-fill" style="width:${(state.idx / total) * 100}%"></div>
    </div>
  `;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qcBack').onclick = () => { closeOverlay(); state = null; };
      card.querySelector('#qcTTS').onclick = () => {
        // 鐢ㄤ腑鏂?TTS 璇诲瓧
        if (window.speechSynthesis) {
          const u = new SpeechSynthesisUtterance(ch);
          u.lang = 'zh-CN'; u.rate = 0.9;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        }
      };
      card.querySelectorAll('.grade-btn').forEach(btn => {
        btn.onclick = () => {
          const g = btn.dataset.g;
          state.grades.push(g);
          grade('chinese', ch, g);
          state.idx++;
          renderCard();
        };
      });
    },
  });
}

function finish() {
  const total = state.list.length;
  const goodCount = state.grades.filter(g => g === SRS_GRADE.GOOD).length;
  const okCount = state.grades.filter(g => g === SRS_GRADE.OK).length;
  const againCount = state.grades.filter(g => g === SRS_GRADE.AGAIN).length;
  // 閫氳繃鐜囷細鐔熺粌鍗犳瘮 鈮?0%锛堜竴鑸篃绠?浼?锛屼絾鐔熺粌鐜囨墠鏄€氳繃绾匡級
  const passRate = total ? goodCount / total : 0;
  const passed = passRate >= (state.task.passRate || 0.8);

  const result = {
    correct: goodCount + okCount, // 璁ゅ緱鐨?    total,
    passRate,
    passed,
    detail: { good: goodCount, ok: okCount, again: againCount },
  };
  submitQuiz(state.task.id, result);
  const savedTask = state.task;
  state = null;
  if (passed) { closeOverlay(); celebrate('璇嗗瓧鎵撳崱鎴愬姛', `鑾峰緱 ${savedTask.points} 绉垎`); setTimeout(()=>switchTab('checkin'),100); return; }

  const html = `<h2>馃挭 鍐嶆帴鍐嶅帀</h2><div class="desc">璁よ ${goodCount + okCount}/${total} 瀛?路 鑾峰緱 ${Math.max(1, Math.round(savedTask.points/3))} 榧撳姳鍒嗭紝鏄庡ぉ鍐嶆垬</div><button class="btn block" id="qcDone">瀹屾垚</button>`;
  showOverlay(html, {
    onMount: (card) => {
      card.querySelector('#qcDone').onclick = () => { closeOverlay(); switchTab('checkin'); };
    },
  });
}
