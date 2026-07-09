/* main.js — 부트스트랩: 스테이지 스케일링 · 커서 글로우 · 덱 시작 */
(function () {
  /* ── 1920×1080 고정 스테이지 레터박스 스케일링 (PRD 7.1) ── */
  const stage = document.getElementById("stage");
  function fit() {
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  window.addEventListener("resize", fit);
  fit();

  /* ── 커서 글로우 (PC 전용 커서 인터랙션) ── */
  const glow = document.getElementById("cursor-glow");
  let gx = 0, gy = 0, tx = 0, ty = 0, shown = false;
  window.addEventListener("mousemove", (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!shown) { shown = true; glow.style.opacity = 1; gx = tx; gy = ty; }
  });
  (function glowLoop() {
    gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
    glow.style.transform = `translate(${gx}px, ${gy}px)`;
    requestAnimationFrame(glowLoop);
  })();

  /* ── 오프닝 전체화면 아이콘 (F 키와 동일 동작) ── */
  const fsBtn = document.querySelector(".s01-fs");
  if (fsBtn) {
    fsBtn.addEventListener("click", (e) => {
      e.stopPropagation();                                 // 스테이지 클릭(다음) 전파 방지
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
    });
  }

  /* ── reduced-motion: GSAP 타임라인 가속 (0.2~0.3초 수준 크로스페이드화, COM-08) ── */
  if (window.PERF.reducedMotion) gsap.globalTimeline.timeScale(3);

  /* ── 시작 ── */
  if (!document.documentElement.classList.contains("gated")) {
    window.DECK.init();
  } else {
    // 게이트 해제(창 확대) 시 1회 시작
    const watch = setInterval(() => {
      if (!document.documentElement.classList.contains("gated")) {
        clearInterval(watch);
        window.DECK.init();
      }
    }, 500);
  }
})();
