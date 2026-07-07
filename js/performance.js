/* performance.js — FPS 프로브·WebGL 감지·저사양 모드 (PRD 8.3) */
(function () {
  const html = document.documentElement;
  const PERF = {
    lowPower: false,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    webgl: false,
    _listeners: [],
  };

  // WebGL 가용성
  try {
    const c = document.createElement("canvas");
    PERF.webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) { PERF.webgl = false; }

  function setLowPower(on, reason) {
    if (PERF.lowPower === on) return;
    PERF.lowPower = on;
    html.classList.toggle("low-power", on);
    if (on) console.warn("[perf] 저사양 모드 진입 — " + reason);
    PERF._listeners.forEach((fn) => fn(on));
  }
  PERF.onChange = (fn) => PERF._listeners.push(fn);

  // 강제 설정
  if (window.CONFIG.lowPowerOverride === true) setLowPower(true, "config 강제");
  else if (window.CONFIG.lowPowerOverride === null && !PERF.webgl) {
    setLowPower(true, "WebGL 미지원");
  }

  // 초기 3초 FPS 프로브
  if (!PERF.lowPower && window.CONFIG.lowPowerOverride === null) {
    let frames = 0;
    const start = performance.now();
    const probeMs = (window.CONFIG.fpsProbeSeconds || 3) * 1000;
    function tick(now) {
      frames++;
      if (now - start < probeMs) requestAnimationFrame(tick);
      else {
        const fps = frames / ((now - start) / 1000);
        if (fps < (window.CONFIG.fpsThreshold || 45)) {
          setLowPower(true, "평균 FPS " + fps.toFixed(1));
        }
      }
    }
    requestAnimationFrame(tick);
  }

  // reduced-motion 반영 (COM-08)
  html.classList.toggle("reduced-motion", PERF.reducedMotion);
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
    PERF.reducedMotion = e.matches;
    html.classList.toggle("reduced-motion", e.matches);
  });

  PERF.simple = () => PERF.lowPower || PERF.reducedMotion;
  window.PERF = PERF;
})();
