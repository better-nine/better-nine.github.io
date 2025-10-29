(function(){
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let W=window.innerWidth, H=window.innerHeight;
    function resize(){ W=window.innerWidth; H=window.innerHeight; canvas.width=W*dpr; canvas.height=H*dpr; canvas.style.width=W+'px'; canvas.style.height=H+'px'; ctx.setTransform(dpr,0,0,dpr,0,0); }
    window.addEventListener('resize', resize, {passive:true}); resize();

    // --- Game State ---
    const state = {
        running:false,
        paused:false,
        timeLimit:60,
        timeLeft:60,
        score:0,
        combo:0,
        lives:3,
        invuln:0,
        ghosts:[],
        candies:[],
        particles:[],
        last:0,
    };

    const player = { x:W*0.5, y:H*0.6, r:18, speed:260, vx:0, vy:0 };

    function rand(min,max){ return Math.random()*(max-min)+min; }
    function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }

    // Keyboard & Touch
    const keys = new Set();
    window.addEventListener('keydown', (e)=>{ if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D','p','P','r','R'].includes(e.key)) e.preventDefault();
        if(e.key==='p' || e.key==='P'){ togglePause(); return; }
        if(e.key==='r' || e.key==='R'){ restart(); return; }
        keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e)=> keys.delete(e.key.toLowerCase()));

    // Mobile D-Pad
    const pad = document.getElementById('pad');
    const touchDir = {up:false,down:false,left:false,right:false};
    pad.addEventListener('touchstart', onPad, {passive:false});
    pad.addEventListener('touchend', onPad, {passive:false});
    pad.addEventListener('touchcancel', onPad, {passive:false});
    pad.addEventListener('touchmove', onPad, {passive:false});
    function onPad(e){ e.preventDefault();
        const bbox = pad.getBoundingClientRect();
        touchDir.up = touchDir.down = touchDir.left = touchDir.right = false;
        for(const t of e.touches){
            const x = t.clientX - bbox.left; const y = t.clientY - bbox.top;
            const col = Math.round((x/ (56*3 + 16)) * 2); // rough
            const row = Math.round((y/ (56*3 + 16)) * 2);
            // map into buttons
            // positions: (0,1)=up, (1,0)=left, (1,1)=down, (2,1)=right
            if(row===0 && col===1) touchDir.up=true;
            if(row===1 && col===0) touchDir.left=true;
            if(row===1 && col===1) touchDir.down=true;
            if(row===1 && col===2) touchDir.right=true;
        }
    }

    // UI Elements
    const scoreEl = document.getElementById('score');
    const livesEl = document.getElementById('lives');
    const timeEl = document.getElementById('time');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    const modal = document.getElementById('modal');
    const startBtn = document.getElementById('startBtn');
    const howBtn = document.getElementById('howBtn');
    const how = document.getElementById('how');
    const ctaLink = document.getElementById('ctaLink');

    howBtn.addEventListener('click', ()=> how.style.display = (how.style.display==='none')?'block':'none');
    startBtn.addEventListener('click', start);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restart);
    ctaLink.addEventListener('click', (e)=>{ if(!ctaLink.dataset.href){ e.preventDefault(); alert('관리자: 우측 하단 버튼 링크를 data-href에 설정하세요.'); } });

    // Helper to let host easily set CTA link via URL hash
    (function initLink(){
        try{
            const url = new URL(location.href);
            const link = url.searchParams.get('link');
            if(link){ ctaLink.href = link; ctaLink.dataset.href = '1'; }
        }catch(err){}
    })();

    // Ghost & Candy spawners
    function spawnGhost(){
        const speed = rand(60, 130) + (60 - state.timeLeft) * 1.5; // scaling difficulty
        const size = rand(16,26);
        // spawn at edges
        const edge = Math.floor(rand(0,4));
        let x,y,vx,vy;
        if(edge===0){ x=rand(0,W); y=-40; vx=rand(-1,1); vy=1; }
        else if(edge===1){ x=W+40; y=rand(0,H); vx=-1; vy=rand(-.5,.5); }
        else if(edge===2){ x=rand(0,W); y=H+40; vx=rand(-1,1); vy=-1; }
        else { x=-40; y=rand(0,H); vx=1; vy=rand(-.5,.5); }
        const len = Math.hypot(vx,vy)||1; vx*=speed/len; vy*=speed/len;
        state.ghosts.push({x,y,vx,vy,r:size});
    }
    function spawnCandy(){
        const x = rand(40, W-40), y = rand(40, H-40);
        state.candies.push({x,y,r:14, life:10}); // 10s lifetime
    }

    // Particles
    function burst(x,y,emoji='✨'){
        for(let i=0;i<12;i++){
            const a = rand(0, Math.PI*2), s = rand(40,140);
            state.particles.push({x,y,vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:0.6, emoji, size:16});
        }
    }

    // Audio (Web Audio API, tiny blips)
    const AudioCtx = window.AudioContext || window.webkitAudioContext; let actx;
    function beep(type='square', f=660, t=0.07, v=0.05){
        if(!actx) actx = new AudioCtx();
        const o = actx.createOscillator(); const g = actx.createGain();
        o.type=type; o.frequency.value=f; g.gain.value=v; o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime+t);
    }

    // Game loop
    function update(dt){
        if(!state.running || state.paused) return;

        state.last += dt;
        state.invuln = Math.max(0, state.invuln - dt);

        // Timer
        state.timeLeft = Math.max(0, state.timeLeft - dt);
        if(state.timeLeft<=0){ gameOver(true); }

        // Spawn rates
        if(state.last> (0.6 - Math.min(0.45, (60 - state.timeLeft)*0.004))){ spawnGhost(); state.last=0; }
        if(Math.random()<0.02){ spawnCandy(); }

        // Player movement
        let ax=0, ay=0;
        if(keys.has('arrowup')||keys.has('w')||touchDir.up) ay -= 1;
        if(keys.has('arrowdown')||keys.has('s')||touchDir.down) ay += 1;
        if(keys.has('arrowleft')||keys.has('a')||touchDir.left) ax -= 1;
        if(keys.has('arrowright')||keys.has('d')||touchDir.right) ax += 1;
        const len = Math.hypot(ax,ay)||1;
        player.vx = (ax/len) * player.speed;
        player.vy = (ay/len) * player.speed;
        player.x = clamp(player.x + player.vx*dt, player.r, W-player.r);
        player.y = clamp(player.y + player.vy*dt, player.r, H-player.r);

        // Ghosts
        for(const g of state.ghosts){
            g.x += g.vx*dt; g.y += g.vy*dt;
            if(g.x<-60||g.x>W+60||g.y<-60||g.y>H+60) g.dead=true;
            // slight homing
            const dx = player.x - g.x, dy = player.y - g.y; const d = Math.hypot(dx,dy)||1;
            const steer = 20 * dt; g.vx += (dx/d)*steer; g.vy += (dy/d)*steer;
        }
        state.ghosts = state.ghosts.filter(g=>!g.dead);

        // Candies (pumpkins)
        for(const c of state.candies){ c.life -= dt; if(c.life<=0) c.dead=true; }

        // Collisions
        for(const g of state.ghosts){
            const d = Math.hypot(player.x-g.x, player.y-g.y);
            if(d < player.r + g.r){
                if(state.invuln<=0){ state.lives--; state.invuln=1.0; flash(); beep('sawtooth', 200, .09, .07); burst(player.x, player.y, '💥'); if(state.lives<=0){ gameOver(false); } }
            }
        }
        for(const c of state.candies){
            const d = Math.hypot(player.x-c.x, player.y-c.y);
            if(d < player.r + c.r){ c.dead=true; const bonus = 10 + Math.min(50, state.combo*2); state.score += bonus; state.combo++;
                popScore(c.x, c.y, `+${bonus}`); beep('triangle', 880, .07, .05); burst(c.x, c.y, '🎆'); }
        }
        state.candies = state.candies.filter(c=>!c.dead);

        // Particles
        for(const p of state.particles){ p.life -= dt; p.x += p.vx*dt; p.y += p.vy*dt; }
        state.particles = state.particles.filter(p=>p.life>0);

        // UI
        scoreEl.textContent = `점수 ${String(state.score).padStart(3,'0')}`;
        livesEl.textContent = state.lives;
        timeEl.textContent = Math.ceil(state.timeLeft);
    }

    // Visuals
    function draw(){
        // background with subtle vignette
        ctx.clearRect(0,0,W,H);
        const grd = ctx.createRadialGradient(player.x, player.y, 20, player.x, player.y, Math.max(W,H));
        grd.addColorStop(0,'rgba(255,170,60,0.12)');
        grd.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);

        // stars / fog
        ctx.globalAlpha = 0.09; ctx.fillStyle = '#fff';
        for(let i=0;i<60;i++){ ctx.fillRect(((i*73)%W), ((i*131)%H), 2, 2); }
        ctx.globalAlpha = 1;

        // candies
        for(const c of state.candies){ drawEmoji('🎃', c.x, c.y, 24); }

        // ghosts
        for(const g of state.ghosts){ drawEmoji('👻', g.x, g.y, g.r*2); }

        // player (witch hat emoji over circle)
        const flick = state.invuln>0 ? (Math.sin(performance.now()/60)>0?0:1) : 1;
        if(flick){
            ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI*2);
            const grd2 = ctx.createLinearGradient(player.x, player.y-player.r, player.x, player.y+player.r);
            grd2.addColorStop(0, '#2b2b44'); grd2.addColorStop(1, '#6a5acd');
            ctx.fillStyle = grd2; ctx.fill();
            drawEmoji('🧙‍♀️', player.x, player.y-12, 26);
        }

        // particles
        for(const p of state.particles){ ctx.globalAlpha = Math.max(0,p.life*1.4); drawEmoji(p.emoji, p.x, p.y, p.size); ctx.globalAlpha = 1; }

        // edge glow
        ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.strokeRect(1,1,W-2,H-2);
    }

    function drawEmoji(emoji, x, y, size){ ctx.font = `bold ${size}px Apple Color Emoji, "Segoe UI Emoji", Noto Color Emoji, sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(emoji, x, y); }

    // UI feedbacks
    let flashes=0; function flash(){ flashes=6; }
    function renderFlash(){ if(flashes>0){ flashes--; ctx.fillStyle='rgba(255,60,60,.12)'; ctx.fillRect(0,0,W,H); } }

    // Floating score pop
    const pops=[]; function popScore(x,y,text){ pops.push({x,y,vy:-40,life:1,text}); }
    function drawPops(dt){ for(const p of pops){ p.life -= dt; p.y += p.vy*dt; ctx.globalAlpha = Math.max(0,p.life); ctx.fillStyle = '#ffdca8'; ctx.font = '700 22px ui-sans-serif, system-ui'; ctx.textAlign='center'; ctx.fillText(p.text, p.x, p.y); ctx.globalAlpha=1; } for(let i=pops.length-1;i>=0;i--){ if(pops[i].life<=0) pops.splice(i,1); } }

    // Game Flow
    let rafId; let lastTs=0;
    function loop(ts){
        rafId = requestAnimationFrame(loop);
        const dt = Math.min(0.033, (ts - (lastTs||ts)) / 1000); lastTs=ts;
        update(dt); draw(); drawPops(dt); renderFlash();
    }

    function start(){
        reset(); document.getElementById('modal').style.display='none'; canvas.focus(); state.running=true; state.paused=false; lastTs=0; cancelAnimationFrame(rafId); rafId = requestAnimationFrame(loop); beep('square', 520, .08, .05);
    }
    function reset(){
        state.timeLeft = state.timeLimit; state.score=0; state.combo=0; state.lives=3; state.invuln=0; state.ghosts.length=0; state.candies.length=0; state.particles.length=0; player.x=W*0.5; player.y=H*0.6;
    }
    function togglePause(){ if(!state.running) return; state.paused=!state.paused; document.getElementById('pauseBtn').textContent = state.paused? '▶️ Resume':'⏸️ Pause'; if(!state.paused){ lastTs=0; } beep('sine', state.paused?260:420, .05, .04); }
    function restart(){ reset(); state.paused=false; document.getElementById('pauseBtn').textContent='⏸️ Pause'; document.getElementById('modal').style.display='none'; canvas.focus(); beep('triangle', 640, .06, .05); }
    function gameOver(win){ state.running=false; cancelAnimationFrame(rafId); const title = win? '🎉 생존 성공!':'💀 유령에게 잡혔어요!'; const msg = `최종 점수: ${state.score}`; showModal(title, msg); beep('sawtooth', win? 880:160, .15, .06); }

    function showModal(title, msg){
        const modal = document.getElementById('modal');
        modal.style.display='grid'; modal.querySelector('h1').innerText = title; modal.querySelector('.sub').innerText = msg + '  —  R 키로 다시 시작하거나 버튼을 눌러 재시작하세요.';
    }

    // Focus for keyboard
    canvas.addEventListener('click', ()=> canvas.focus());

    // Kick off idle loop (for background viz before start)
    cancelAnimationFrame(rafId); rafId=requestAnimationFrame(loop);
})();
