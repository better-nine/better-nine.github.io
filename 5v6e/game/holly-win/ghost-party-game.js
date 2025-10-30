const noop = () => {};

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
}

function isTypingTarget(el) {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
}

function mapKey(e) {
    const k = (e.key || '').toLowerCase();
    const c = e.code || '';
    return {
        up: k === 'arrowup' || c === 'ArrowUp' || k === 'w' || c === 'KeyW',
        down: k === 'arrowdown' || c === 'ArrowDown' || k === 's' || c === 'KeyS',
        left: k === 'arrowleft' || c === 'ArrowLeft' || k === 'a' || c === 'KeyA',
        right: k === 'arrowright' || c === 'ArrowRight' || k === 'd' || c === 'KeyD',
        pause: k === 'p' || c === 'KeyP',
        restart: k === 'r' || c === 'KeyR',
    };
}

export class GhostPartyGame {
    constructor({
        canvas,
        padElement,
        onScoreChange = noop,
        onLivesChange = noop,
        onTimeChange = noop,
        onPauseChange = noop,
        onGameOver = noop,
        onGameStart = noop,
    } = {}) {
        if (!canvas) throw new Error('GhostPartyGame requires a canvas element.');

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.padElement = padElement || null;

        this.callbacks = {
            onScoreChange,
            onLivesChange,
            onTimeChange,
            onPauseChange,
            onGameOver,
            onGameStart,
        };

        this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        this.W = window.innerWidth;
        this.H = window.innerHeight;

        this.state = {
            running: false,
            paused: false,
            timeLimit: 60,
            timeLeft: 60,
            score: 0,
            combo: 0,
            lives: 3,
            invuln: 0,
            ghosts: [],
            candies: [],
            powerups: [],
            particles: [],
            last: 0,
            speedBoost: 0,
            powerupTimer: 0,
            pumpkinsCollected: 0,
            startedAt: 0,
        };

        this.player = { x: this.W * 0.5, y: this.H * 0.6, r: 18, speed: 260, vx: 0, vy: 0 };

        this.keys = new Set();
        this.touchDir = { up: false, down: false, left: false, right: false };
        this.pops = [];
        this.flashes = 0;

        this.AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.actx = null;

        this.rafId = null;
        this.lastTs = 0;

        this.resize = this.resize.bind(this);
        this.loop = this.loop.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        window.addEventListener('resize', this.resize, { passive: true });
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        this.resize();
        this.bindPad(this.padElement);
        this.resetState();
        this.notifyHud();
    }

    destroy() {
        cancelAnimationFrame(this.rafId);
        window.removeEventListener('resize', this.resize);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        if (this.padElement) {
            this.padElement.querySelectorAll('.pad-btn').forEach((btn) => {
                btn.replaceWith(btn.cloneNode(true));
            });
        }
    }

    resize() {
        this.W = window.innerWidth;
        this.H = window.innerHeight;
        this.canvas.width = this.W * this.dpr;
        this.canvas.height = this.H * this.dpr;
        this.canvas.style.width = `${this.W}px`;
        this.canvas.style.height = `${this.H}px`;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    bindPad(pad) {
        if (!pad) return;
        const buttons = pad.querySelectorAll('.pad-btn');
        buttons.forEach((btn) => this.bindPadButton(btn));
    }

    bindPadButton(btn) {
        if (!btn) return;
        const dir = btn.dataset.dir;
        const setDir = (value) => {
            this.touchDir[dir] = value;
        };
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); setDir(true); }, { passive: false });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); setDir(false); }, { passive: false });
        btn.addEventListener('touchcancel', (e) => { e.preventDefault(); setDir(false); }, { passive: false });
        btn.addEventListener('mousedown', (e) => { e.preventDefault(); setDir(true); });
        ['mouseup', 'mouseleave', 'mouseout'].forEach((ev) => {
            btn.addEventListener(ev, (e) => { e.preventDefault(); setDir(false); });
        });
    }

    resetState() {
        const s = this.state;
        s.running = false;
        s.paused = false;
        s.timeLeft = s.timeLimit;
        s.score = 0;
        s.combo = 0;
        s.lives = 3;
        s.invuln = 0;
        s.ghosts.length = 0;
        s.candies.length = 0;
        s.powerups.length = 0;
        s.particles.length = 0;
        s.last = 0;
        s.speedBoost = 0;
        s.powerupTimer = 0;
        s.pumpkinsCollected = 0;
        s.startedAt = 0;
        this.player.x = this.W * 0.5;
        this.player.y = this.H * 0.6;
        this.pops.length = 0;
        this.flashes = 0;
        this.clearControls();
    }

    start() {
        this.resetState();
        this.state.startedAt = Date.now();
        this.state.running = true;
        this.state.paused = false;
        this.lastTs = 0;
        cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame(this.loop);
        this.beep('square', 520, 0.08, 0.05);
        this.canvas.focus();
        this.notifyHud();
        this.callbacks.onPauseChange(this.state.paused);
        this.callbacks.onGameStart({ ...this.publicState() });
    }

    restart() {
        this.resetState();
        this.state.startedAt = Date.now();
        this.state.running = true;
        this.state.paused = false;
        this.lastTs = 0;
        cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame(this.loop);
        this.beep('triangle', 640, 0.06, 0.05);
        this.canvas.focus();
        this.notifyHud();
        this.callbacks.onPauseChange(this.state.paused);
        this.callbacks.onGameStart({ ...this.publicState() });
    }

    togglePause() {
        if (!this.state.running) return this.state.paused;
        this.state.paused = !this.state.paused;
        if (!this.state.paused) {
            this.lastTs = 0;
        }
        this.beep('sine', this.state.paused ? 260 : 420, 0.05, 0.04);
        this.callbacks.onPauseChange(this.state.paused);
        return this.state.paused;
    }

    publicState() {
        return {
            running: this.state.running,
            paused: this.state.paused,
            score: this.state.score,
            lives: this.state.lives,
            timeLeft: this.state.timeLeft,
            timeLimit: this.state.timeLimit,
        };
    }

    handleKeyDown(e) {
        if (isTypingTarget(e.target)) return;
        const m = mapKey(e);
        if (m.pause) {
            e.preventDefault();
            this.togglePause();
            return;
        }
        if (m.restart) {
            e.preventDefault();
            this.restart();
            return;
        }
        if (m.up || m.down || m.left || m.right) e.preventDefault();
        if (m.up) this.keys.add('up');
        if (m.down) this.keys.add('down');
        if (m.left) this.keys.add('left');
        if (m.right) this.keys.add('right');
    }

    handleKeyUp(e) {
        if (isTypingTarget(e.target)) return;
        const m = mapKey(e);
        if (m.up) this.keys.delete('up');
        if (m.down) this.keys.delete('down');
        if (m.left) this.keys.delete('left');
        if (m.right) this.keys.delete('right');
    }

    clearControls() {
        try {
            this.keys.clear();
        } catch (err) {
            /* noop */
        }
        if (typeof this.touchDir === 'object') {
            this.touchDir.up = false;
            this.touchDir.down = false;
            this.touchDir.left = false;
            this.touchDir.right = false;
        }
        this.player.vx = 0;
        this.player.vy = 0;
    }

    loop(ts) {
        this.rafId = requestAnimationFrame(this.loop);
        const dt = Math.min(0.033, (ts - (this.lastTs || ts)) / 1000);
        this.lastTs = ts;
        this.update(dt);
        this.draw();
        this.drawPops(dt);
        this.renderFlash();
    }

    update(dt) {
        if (!this.state.running || this.state.paused) return;

        const state = this.state;
        state.last += dt;
        state.invuln = Math.max(0, state.invuln - dt);
        if (state.speedBoost > 0) state.speedBoost = Math.max(0, state.speedBoost - dt);

        state.timeLeft = Math.max(0, state.timeLeft - dt);
        if (state.timeLeft <= 0) {
            this.gameOver(true);
            return;
        }

        if (state.last > (0.6 - Math.min(0.45, (60 - state.timeLeft) * 0.004))) {
            this.spawnGhost();
            state.last = 0;
        }
        if (Math.random() < 0.02) {
            this.spawnCandy();
        }
        state.powerupTimer += dt;
        if (state.powerupTimer >= 10) {
            state.powerupTimer = 0;
            this.spawnPowerup();
        }

        let ax = 0;
        let ay = 0;
        if (this.keys.has('up') || this.touchDir.up) ay -= 1;
        if (this.keys.has('down') || this.touchDir.down) ay += 1;
        if (this.keys.has('left') || this.touchDir.left) ax -= 1;
        if (this.keys.has('right') || this.touchDir.right) ax += 1;
        const len = Math.hypot(ax, ay) || 1;

        const curSpeed = this.player.speed * (state.speedBoost > 0 ? 2 : 1);
        this.player.vx = (ax / len) * curSpeed;
        this.player.vy = (ay / len) * curSpeed;
        this.player.x = clamp(this.player.x + this.player.vx * dt, this.player.r, this.W - this.player.r);
        this.player.y = clamp(this.player.y + this.player.vy * dt, this.player.r, this.H - this.player.r);

        for (const g of state.ghosts) {
            g.x += g.vx * dt;
            g.y += g.vy * dt;
            if (g.x < -60 || g.x > this.W + 60 || g.y < -60 || g.y > this.H + 60) g.dead = true;
            const dx = this.player.x - g.x;
            const dy = this.player.y - g.y;
            const d = Math.hypot(dx, dy) || 1;
            const steer = 20 * dt;
            g.vx += (dx / d) * steer;
            g.vy += (dy / d) * steer;
        }
        state.ghosts = state.ghosts.filter((g) => !g.dead);

        for (const c of state.candies) {
            c.life -= dt;
            if (c.life <= 0) c.dead = true;
        }
        for (const p of state.powerups) {
            p.life -= dt;
            if (p.life <= 0) p.dead = true;
        }

        for (const g of state.ghosts) {
            const d = Math.hypot(this.player.x - g.x, this.player.y - g.y);
            if (d < this.player.r + g.r) {
                if (state.invuln <= 0) {
                    state.lives -= 1;
                    state.invuln = 1.0;
                    this.flash();
                    this.beep('sawtooth', 200, 0.09, 0.07);
                    this.burst(this.player.x, this.player.y, '💥');
                    if (state.lives <= 0) {
                        this.gameOver(false);
                        return;
                    }
                }
            }
        }

        for (const c of state.candies) {
            const d = Math.hypot(this.player.x - c.x, this.player.y - c.y);
            if (d < this.player.r + c.r) {
                c.dead = true;
                const bonus = 10 + Math.min(50, state.combo * 2);
                state.score += bonus;
                state.combo++;
                state.pumpkinsCollected++;
                if (state.pumpkinsCollected % 5 === 0) {
                    state.timeLeft += 1;
                    this.popScore(this.player.x, this.player.y - 28, '⏱ +1s');
                    this.beep('square', 960, 0.12, 0.06);
                    this.burst(this.player.x, this.player.y, '⏱');
                }
                this.popScore(c.x, c.y, `+${bonus}`);
                this.beep('triangle', 880, 0.07, 0.05);
                this.burst(c.x, c.y, '🎆');
            }
        }
        state.candies = state.candies.filter((c) => !c.dead);

        for (const p of state.powerups) {
            const d = Math.hypot(this.player.x - p.x, this.player.y - p.y);
            if (d < this.player.r + p.r) {
                p.dead = true;
                state.speedBoost = 4.0;
                this.popScore(p.x, p.y, '⚡ SPEED x2');
                this.beep('sine', 1120, 0.09, 0.06);
                this.burst(p.x, p.y, '⚡');
            }
        }
        state.powerups = state.powerups.filter((p) => !p.dead);

        for (const p of state.particles) {
            p.life -= dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }
        state.particles = state.particles.filter((p) => p.life > 0);

        this.notifyHud();
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.W, this.H);
        const grd = ctx.createRadialGradient(this.player.x, this.player.y, 20, this.player.x, this.player.y, Math.max(this.W, this.H));
        grd.addColorStop(0, 'rgba(255,170,60,0.12)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, this.W, this.H);
        ctx.globalAlpha = 0.09;
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 60; i++) {
            ctx.fillRect(((i * 73) % this.W), ((i * 131) % this.H), 2, 2);
        }
        ctx.globalAlpha = 1;

        for (const c of this.state.candies) {
            const alpha = this.blinkAlpha(c.life, 1.5, 7);
            if (alpha === 0) continue;
            ctx.globalAlpha = alpha;
            this.drawEmoji('🎃', c.x, c.y, 24);
            ctx.globalAlpha = 1;
        }
        for (const p of this.state.powerups) {
            const alpha = this.blinkAlpha(p.life, 1.5, 7);
            if (alpha === 0) continue;
            ctx.globalAlpha = alpha;
            this.drawEmoji('🍬', p.x, p.y, 24);
            ctx.globalAlpha = 1;
        }
        for (const g of this.state.ghosts) {
            this.drawEmoji('👻', g.x, g.y, g.r * 2);
        }

        const flick = this.state.invuln > 0 ? (Math.sin(performance.now() / 60) > 0 ? 0 : 1) : 1;
        if (flick) {
            ctx.beginPath();
            ctx.arc(this.player.x, this.player.y, this.player.r, 0, Math.PI * 2);
            const grd2 = ctx.createLinearGradient(this.player.x, this.player.y - this.player.r, this.player.x, this.player.y + this.player.r);
            grd2.addColorStop(0, '#2b2b44');
            grd2.addColorStop(1, '#6a5acd');
            ctx.fillStyle = grd2;
            ctx.fill();

            if (this.state.speedBoost > 0) {
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'rgba(255, 200, 80, 0.6)';
                ctx.beginPath();
                ctx.arc(this.player.x, this.player.y, this.player.r + 6, 0, Math.PI * 2);
                ctx.stroke();
            }
            this.drawEmoji('🧙‍♀️', this.player.x, this.player.y - 12, 26);
        }
        for (const p of this.state.particles) {
            ctx.globalAlpha = Math.max(0, p.life * 1.4);
            this.drawEmoji(p.emoji, p.x, p.y, p.size);
            ctx.globalAlpha = 1;
        }
        ctx.strokeStyle = 'rgba(255,255,255,.06)';
        ctx.strokeRect(1, 1, this.W - 2, this.H - 2);
    }

    drawEmoji(emoji, x, y, size) {
        this.ctx.font = `bold ${size}px Apple Color Emoji, "Segoe UI Emoji", Noto Color Emoji, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(emoji, x, y);
    }

    blinkAlpha(remain, threshold = 1.5, hz = 7) {
        if (remain >= threshold) return 1;
        const t = performance.now() / 1000;
        return Math.sin(t * hz * 2 * Math.PI) > 0 ? 1 : 0;
    }

    flash() {
        this.flashes = 6;
    }

    renderFlash() {
        if (this.flashes > 0) {
            this.flashes--;
            this.ctx.fillStyle = 'rgba(255,60,60,.12)';
            this.ctx.fillRect(0, 0, this.W, this.H);
        }
    }

    popScore(x, y, text) {
        this.pops.push({ x, y, vy: -40, life: 1, text });
    }

    drawPops(dt) {
        for (const p of this.pops) {
            p.life -= dt;
            p.y += p.vy * dt;
            this.ctx.globalAlpha = Math.max(0, p.life);
            this.ctx.fillStyle = '#ffdca8';
            this.ctx.font = '700 22px ui-sans-serif, system-ui';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(p.text, p.x, p.y);
            this.ctx.globalAlpha = 1;
        }
        for (let i = this.pops.length - 1; i >= 0; i--) {
            if (this.pops[i].life <= 0) this.pops.splice(i, 1);
        }
    }

    spawnGhost() {
        const speed = rand(60, 130) + (60 - this.state.timeLeft) * 1.5;
        const baseSize = rand(16, 26);
        let growth = 1;
        if (this.state.score >= 1500) growth = 1 + Math.min(1.5, (this.state.score - 1500) / 1500 * 1.5);
        else growth = Math.max(0.7, this.state.score / 1500);
        const size = baseSize * growth;
        const edge = Math.floor(rand(0, 4));
        let x;
        let y;
        let vx;
        let vy;
        if (edge === 0) {
            x = rand(0, this.W);
            y = -40;
            vx = rand(-1, 1);
            vy = 1;
        } else if (edge === 1) {
            x = this.W + 40;
            y = rand(0, this.H);
            vx = -1;
            vy = rand(-0.5, 0.5);
        } else if (edge === 2) {
            x = rand(0, this.W);
            y = this.H + 40;
            vx = rand(-1, 1);
            vy = -1;
        } else {
            x = -40;
            y = rand(0, this.H);
            vx = 1;
            vy = rand(-0.5, 0.5);
        }
        const len = Math.hypot(vx, vy) || 1;
        vx *= speed / len;
        vy *= speed / len;
        this.state.ghosts.push({ x, y, vx, vy, r: size });
    }

    spawnCandy() {
        const x = rand(40, this.W - 40);
        const y = rand(40, this.H - 40);
        this.state.candies.push({ x, y, r: 14, life: 10 });
    }

    spawnPowerup() {
        const x = rand(40, this.W - 40);
        const y = rand(40, this.H - 40);
        this.state.powerups.push({ x, y, r: 14, life: 5 });
    }

    burst(x, y, emoji = '✨') {
        for (let i = 0; i < 12; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = rand(40, 140);
            this.state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6, emoji, size: 16 });
        }
    }

    beep(type = 'square', f = 660, t = 0.07, v = 0.05) {
        if (!this.AudioCtx) return;
        if (!this.actx) this.actx = new this.AudioCtx();
        const o = this.actx.createOscillator();
        const g = this.actx.createGain();
        o.type = type;
        o.frequency.value = f;
        g.gain.value = v;
        o.connect(g);
        g.connect(this.actx.destination);
        o.start();
        o.stop(this.actx.currentTime + t);
    }

    gameOver(win) {
        this.state.running = false;
        cancelAnimationFrame(this.rafId);
        const durationMs = Math.max(0, Date.now() - (this.state.startedAt || Date.now()));
        this.callbacks.onGameOver({ win, score: this.state.score, durationMs });
        this.beep('sawtooth', win ? 880 : 160, 0.15, 0.06);
        this.clearControls();
    }

    notifyHud() {
        this.callbacks.onScoreChange(this.state.score);
        this.callbacks.onLivesChange(this.state.lives);
        this.callbacks.onTimeChange(Math.ceil(this.state.timeLeft));
    }
}
