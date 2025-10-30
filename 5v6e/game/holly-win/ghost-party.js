import { GhostPartyGame } from './ghost-party-game.js';
import { submitScore, fetchLeaderboard } from './ghost-party-leaderboard.js';

const canvas = document.getElementById('game');
const pad = document.getElementById('pad');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const timeEl = document.getElementById('time');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const modal = document.getElementById('modal');
const startBtn = document.getElementById('startBtn');
const howBtn = document.getElementById('howBtn');
const how = document.getElementById('how');
const lbRefresh = document.getElementById('lbRefresh');
const lbList = document.getElementById('lbList');
const submitWrap = document.getElementById('submitWrap');
const submitBtn = document.getElementById('submitBtn');
const submitMsg = document.getElementById('submitMsg');
const playerNameInput = document.getElementById('playerName');

const storedName = typeof localStorage !== 'undefined' ? localStorage.getItem('playerName') : '';
if (playerNameInput && storedName) {
    playerNameInput.value = storedName;
}

function formatScore(score) {
    return `점수 ${String(score ?? 0).padStart(3, '0')}`;
}

function updateScore(score) {
    if (scoreEl) scoreEl.textContent = formatScore(score);
}

function updateLives(lives) {
    if (livesEl) livesEl.textContent = lives;
}

function updateTime(time) {
    if (timeEl) timeEl.textContent = time;
}

function updatePauseButton(paused) {
    if (!pauseBtn) return;
    pauseBtn.textContent = paused ? '▶️ Resume' : '⏸️ Pause';
}

function hideSubmitForm() {
    if (submitWrap) submitWrap.style.display = 'none';
    if (submitMsg) {
        submitMsg.style.display = 'none';
        submitMsg.textContent = '';
    }
}

function showSubmitForm() {
    if (submitWrap) submitWrap.style.display = 'block';
    if (submitMsg) {
        submitMsg.style.display = 'none';
        submitMsg.textContent = '';
    }
}

function setModalContent(title, message) {
    if (!modal) return;
    const h1 = modal.querySelector('h1');
    const sub = modal.querySelector('.sub');
    if (h1) h1.innerText = title;
    if (sub) {
        sub.innerText = message ? `${message}  —  R 키로 다시 시작하거나 버튼을 눌러 재시작하세요.` : sub.innerText;
    }
}

function showModal() {
    if (modal) modal.style.display = 'grid';
}

function hideModal() {
    if (modal) modal.style.display = 'none';
}

let lastRun = { score: 0, durationMs: 0 };

const game = new GhostPartyGame({
    canvas,
    padElement: pad,
    onScoreChange: updateScore,
    onLivesChange: updateLives,
    onTimeChange: updateTime,
    onPauseChange: updatePauseButton,
    onGameOver: ({ win, score, durationMs }) => {
        lastRun = { score, durationMs };
        setModalContent(win ? '🎉 생존 성공!' : '💀 유령에게 잡혔어요!', `최종 점수: ${score}`);
        showModal();
        showSubmitForm();
        if (playerNameInput) {
            const prev = typeof localStorage !== 'undefined' ? localStorage.getItem('playerName') || '' : '';
            if (prev) playerNameInput.value = prev;
            setTimeout(() => playerNameInput?.focus(), 60);
        }
        loadLeaderboard();
    },
    onGameStart: () => {
        hideModal();
        hideSubmitForm();
        updatePauseButton(false);
    },
});

if (canvas) {
    canvas.addEventListener('click', () => canvas.focus());
}

function isHowHidden() {
    if (!how) return true;
    if (how.style.display === '') {
        return window.getComputedStyle(how).display === 'none';
    }
    return how.style.display === 'none';
}

if (howBtn && how) {
    howBtn.addEventListener('click', () => {
        how.style.display = isHowHidden() ? 'block' : 'none';
    });
}

if (startBtn) {
    startBtn.addEventListener('click', () => {
        game.start();
    });
}

if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        game.togglePause();
    });
}

if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        game.restart();
    });
}

if (playerNameInput) {
    playerNameInput.addEventListener('change', () => {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem('playerName', playerNameInput.value || '');
    });
}

if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
        submitBtn.disabled = true;
        if (submitMsg) {
            submitMsg.style.display = 'block';
            submitMsg.textContent = '제출 중...';
        }

        const name = (playerNameInput?.value || '').trim() || 'Anonymous';
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('playerName', name);
        }
        const score = lastRun.score;
        const durationMs = Math.max(0, lastRun.durationMs);

        try {
            const res = await submitScore({ name, score, durationMs });
            if (res && res.ok) {
                if (submitMsg) submitMsg.textContent = '기록 저장 완료!';
                await loadLeaderboard();
            } else {
                if (submitMsg) submitMsg.textContent = `저장 실패: ${res && res.error ? res.error : 'unknown'}`;
            }
        } catch (err) {
            if (submitMsg) submitMsg.textContent = '저장 중 오류가 발생했습니다.';
        } finally {
            submitBtn.disabled = false;
        }
    });
}

function toSafeText(value, fallback = 'Anonymous') {
    let s;
    if (typeof value === 'string') s = value;
    else if (value == null) s = fallback;
    else {
        try { s = JSON.stringify(value); }
        catch { s = String(value); }
    }
    s = s == null ? fallback : String(s);
    if (s.length > 32) s = s.slice(0, 32);
    return s.replace(/[<>&]/g, (m) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[m]));
}

function renderLeaderboard(list) {
    if (!lbList) return;
    if (!list || !list.length) {
        lbList.innerHTML = '<div class="ghost">데이터가 없습니다.</div>';
        return;
    }
    lbList.innerHTML = list.map((item) => {
        const safeName = toSafeText(item && item.name, 'Anonymous');
        const score = Number(item && item.score);
        const scoreText = Number.isFinite(score) ? score : '0';
        const rankText = Number.isFinite(Number(item && item.rank)) ? item.rank : '';
        return `<div class="lb-row"><div class="lb-rank">${rankText}</div><div class="lb-name">${safeName}</div><div class="lb-score">${scoreText}</div></div>`;
    }).join('');
}

async function loadLeaderboard() {
    if (lbList) lbList.innerHTML = '<div class="ghost">불러오는 중...</div>';
    try {
        const { items } = await fetchLeaderboard({ limit: 50, period: 'all' });
        renderLeaderboard(items);
    } catch (e) {
        console.error('[LB] load failed:', e);
        if (lbList) {
            lbList.innerHTML = `<div class="ghost">리더보드를 불러올 수 없습니다.<br/><small class="lb-error-detail">${(e && e.message) ? e.message : 'unknown error'}</small></div>`;
        }
    }
}

if (lbRefresh) {
    lbRefresh.addEventListener('click', () => {
        loadLeaderboard();
    });
}

hideSubmitForm();
updateScore(0);
updateLives(3);
updateTime(60);
updatePauseButton(false);
loadLeaderboard();
