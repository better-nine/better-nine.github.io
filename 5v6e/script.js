// 부드러운 스크롤 (기존에 쓰시던 경우 유지)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            e.preventDefault();
            window.scrollTo({ top: target.offsetTop - 60, behavior: "smooth" });
        }
    });
});

// 가시성 리빌 (선택 기능: 카드/타일 등장)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => entry.isIntersecting && entry.target.classList.add("visible"));
}, { threshold: 0.15 });
document.querySelectorAll(".tile, .card").forEach(el => observer.observe(el));

// ===== 👻 Ghost Burst on CTA Pill =====
(function setupGhostBurst() {
    const btn = document.querySelector(".cta-pill");
    if (!btn) return;

    btn.addEventListener("click", (e) => {
        e.preventDefault(); // <a>지만 이동 없음
        const rect = btn.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;

        spawnGhosts(14, originX, originY);
    });

    function spawnGhosts(count, x, y) {
        for (let i = 0; i < count; i++) {
            const el = document.createElement("span");
            el.className = "ghost-emoji";
            el.textContent = "👻";

            // 시작 좌표: 버튼 중심 근처에 약간의 랜덤 퍼짐
            const jitterX = (Math.random() - 0.5) * 80;  // -40 ~ 40px
            const jitterY = (Math.random() - 0.5) * 30;  // -15 ~ 15px
            el.style.left = `${x + jitterX}px`;
            el.style.top  = `${y + jitterY}px`;

            // 각 고스트마다 서로 다른 지속시간/크기/방향 부여
            const dur = 1.8 + Math.random() * 1.6;        // 1.8s ~ 3.4s
            const size = 20 + Math.random() * 22;         // 20px ~ 42px
            const drift = (Math.random() - 0.5) * 200;    // 좌우 표류량
            const rot = (Math.random() - 0.5) * 40 + "deg";

            el.style.fontSize = `${size}px`;
            el.style.animationDuration = `${dur}s`;
            el.style.setProperty("--dx", `${drift}px`);
            el.style.setProperty("--rot", rot);

            document.body.appendChild(el);
            el.addEventListener("animationend", () => el.remove());
        }
    }
})();
