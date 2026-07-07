/* env-gate.js — 모바일 접근 감지 → 안내 화면 (PRD 0.3) */
(function () {
  const gate = document.getElementById("env-gate");

  function isMobileEnv() {
    const ua = navigator.userAgent;
    const mobileUA = /Android|iPhone|iPad|iPod|Mobile|Tablet|webOS|BlackBerry/i.test(ua);
    const narrow = window.innerWidth < 1024;
    const portrait = window.innerHeight > window.innerWidth;
    return mobileUA || (narrow && portrait) || narrow;
  }

  function check() {
    const blocked = isMobileEnv();
    gate.hidden = !blocked;
    document.documentElement.classList.toggle("gated", blocked);
    return blocked;
  }

  window.ENV_GATE = { check, isMobileEnv };
  check();
  // PC에서 창을 일시적으로 줄였다 되돌리는 경우 대응 (모바일 보정 아님)
  window.addEventListener("resize", check);
})();
