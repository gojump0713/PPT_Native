/* scenes5.js — 05 덱 · iStation 심화 4장 씬 컨트롤러 (기능명세서 v2.0)
 * P1 경제성 비교 · P2 AI Routing · P3 Open-Weight 그래프(정적) · P4 계층 구조도(정적) */
(function () {
  const S = window.SCENES;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const simple = () => window.PERF.simple();

  function countUp(el, to, opt) {
    opt = opt || {};
    const dec = opt.dec || 0, suffix = opt.suffix || "", prefix = opt.prefix || "";
    const fmt = (v) => prefix + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US")) + suffix;
    if (simple() || opt.instant) { el.textContent = fmt(to); return null; }
    const st = { v: 0 };
    return gsap.to(st, { v: to, duration: opt.dur || 1.2, ease: "power2.out", onUpdate: () => (el.textContent = fmt(st.v)) });
  }

  /* 정적 이미지 슬라이드 (P3 그래프 · P4 구조도) — 진입 시 부드러운 페이드인만 */
  function stillScene(id) {
    const el = $("#" + id);
    const fig = $("figure", el);
    return {
      el, steps: 1,
      enter() { if (fig && !simple()) gsap.fromTo(fig, { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out", clearProps: "transform" }); },
      leave() {},
      setStep() {},
    };
  }

  /* ══════════════ P1 · 경제성 비교 (query-split-compare) ══════════════ */
  (function () {
    const el = $("#econ-compare");
    const query = $(".ec-query", el);
    const ext = $(".ec-ext", el), int = $(".ec-int", el);
    const conclusion = $(".ec-conclusion", el);
    const badge = $(".ec-badge", el);
    const canvas = $(".ec-particles", el), ctx = canvas.getContext("2d");
    const gaugeApi = $(".ec-gauge .ec-g-row:nth-child(1) b", el);
    const gaugeTok = $(".ec-gauge .ec-g-row:nth-child(2) b", el);
    const gaugeCost = $(".ec-cost", el);
    let tweens = [], parts = [], raf = 0, emitting = false;
    const killTweens = () => { tweens.forEach((t) => t && t.kill && t.kill()); tweens = []; };

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (emitting && parts.length < 90 && Math.random() < 0.5) {
        parts.push({ x: 120 + Math.random() * 420, y: 430 + Math.random() * 120, vx: (Math.random() - 0.2) * 1.4, vy: -1.2 - Math.random() * 1.8, life: 1 });
      }
      parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.life -= 0.011; });
      parts = parts.filter((p) => p.life > 0 && p.y > -20);
      parts.forEach((p) => { ctx.globalAlpha = Math.max(0, p.life) * 0.8; ctx.fillStyle = "#ff7867"; ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, 6.283); ctx.fill(); });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    }
    const startParticles = () => { if (simple() || raf) return; emitting = true; raf = requestAnimationFrame(loop); };
    const stopParticles = () => { emitting = false; cancelAnimationFrame(raf); raf = 0; parts = []; ctx && ctx.clearRect(0, 0, canvas.width, canvas.height); };

    S["econ-compare"] = {
      el, steps: 4,
      enter(s) { this.setStep(s, 1, true); },
      leave() { killTweens(); stopParticles(); },
      setStep(i, dir, instant) {
        const quick = instant || simple();
        killTweens();
        gsap.set(query, { opacity: i >= 0 ? 1 : 0 });
        if (dir > 0 && i === 0 && !quick) gsap.fromTo(query, { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.6)" });
        ext.classList.add("on"); int.classList.add("on");
        if (i >= 1) {
          tweens.push(countUp(gaugeApi, 4582, { instant: quick && i > 1 }));
          tweens.push(countUp(gaugeTok, 18.7, { dec: 1, suffix: "M", instant: quick && i > 1 }));
          gaugeCost.textContent = "₩ 지속 증가 ↑";
          startParticles();
        } else { gaugeApi.textContent = "0"; gaugeTok.textContent = "0"; gaugeCost.textContent = "₩ —"; stopParticles(); }
        int.classList.toggle("focus", i >= 2);
        gsap.set(badge, { opacity: i >= 2 ? 1 : 0 });
        if (dir > 0 && i === 2 && !quick) gsap.fromTo(badge, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" });
        gsap.set(conclusion, { opacity: i >= 3 ? 1 : 0, y: i >= 3 ? 0 : 12 });
        if (dir > 0 && i === 3 && !quick) gsap.fromTo(conclusion, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
      },
    };
  })();

  /* ══════════════ P2 · AI Routing (flex 밴드 파이프라인) ══════════════ */
  (function () {
    const el = $("#ai-routing");
    const arrows = $$(".ar-arrow", el);
    const vlm = $(".ar-vlm", el), vlmItems = $$(".ar-vlm u", el);
    const gate = $(".ar-gate", el), gaugeFill = $(".ar-gauge-fill", el);
    const outMain = $(".ar-out-main", el), outExc = $(".ar-out-exc", el);
    const tokenFill = $(".ar-token-meter i", el);
    const conclusion = $(".ar-conclusion", el);
    const govItems = $$(".ar-gp-item", el);
    let tweens = [];
    const kill = () => { tweens.forEach((t) => t && t.kill && t.kill()); tweens = []; };

    S["ai-routing"] = {
      el, steps: 5,
      enter(s) { this.setStep(s, 1, true); },
      leave() { kill(); },
      setStep(i, dir, instant) {
        const quick = instant || simple();
        kill();
        // 연결 화살표 (입력→코디네이터→VLM→게이트)
        arrows[0].classList.toggle("on", i >= 0);
        arrows[1].classList.toggle("on", i >= 1);
        arrows[2].classList.toggle("on", i >= 2);
        // S2 — Internal VLM 우선 실행
        vlm.classList.toggle("on", i >= 1);
        if (i >= 1) {
          if (dir > 0 && i === 1 && !quick) { vlmItems.forEach((u) => u.classList.remove("on")); vlmItems.forEach((u, k) => tweens.push(gsap.delayedCall(0.15 + k * 0.28, () => u.classList.add("on")))); }
          else vlmItems.forEach((u) => u.classList.add("on"));
        } else vlmItems.forEach((u) => u.classList.remove("on"));
        // S3 — Quality Gate 내부 답변 (92%)
        const gateOn = i >= 2;
        gate.classList.toggle("on", gateOn);
        outMain.classList.toggle("on", gateOn);
        if (gateOn) {
          if (dir > 0 && i === 2 && !quick) tweens.push(gsap.fromTo(gaugeFill, { strokeDashoffset: 327 }, { strokeDashoffset: 327 * (1 - 0.92), duration: 1, ease: "power2.out" }));
          else gsap.set(gaugeFill, { strokeDashoffset: 327 * (1 - 0.92) });
        } else gsap.set(gaugeFill, { strokeDashoffset: 327 });
        // S4 — Routing 예외 경로 + Token Meter + Governance
        const routeOn = i >= 3;
        outExc.classList.toggle("on", routeOn);
        govItems.forEach((g) => g.classList.toggle("hot", routeOn && (g.dataset.gov === "token" || g.dataset.gov === "budget")));
        if (routeOn) {
          if (dir > 0 && i === 3 && !quick) tweens.push(gsap.fromTo(tokenFill, { width: "0%" }, { width: "72%", duration: 1, ease: "power1.inOut" }));
          else gsap.set(tokenFill, { width: "72%" });
        } else gsap.set(tokenFill, { width: "0%" });
        // S5 — 통합 답변
        gsap.set(conclusion, { opacity: i >= 4 ? 1 : 0, y: i >= 4 ? 0 : 12 });
        if (dir > 0 && i === 4 && !quick) tweens.push(gsap.fromTo(conclusion, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }));
      },
    };
  })();

  /* ══════════════ P3 · Open-Weight Intelligence Index (사이트 데이터 재현 차트) ══════════════ */
  (function () {
    const el = $("#open-weight-benchmark");
    const chart = $(".ob-chart", el);
    // Artificial Analysis Intelligence Index v4.1 · 2026-07 스냅샷 (artificialanalysis.ai / benchlm.ai)
    const DATA = [
      { name: "Claude Fable 5", score: 60.0, type: "proprietary" },
      { name: "GPT-5.6 Sol", score: 58.9, type: "proprietary" },
      { name: "Claude Opus 4.8", score: 55.7, type: "proprietary" },
      { name: "GPT-5.6 Terra", score: 55.0, type: "proprietary" },
      { name: "GPT-5.5", score: 54.8, type: "proprietary" },
      { name: "Grok 4.5", score: 53.8, type: "proprietary" },
      { name: "Claude Opus 4.7", score: 53.5, type: "proprietary" },
      { name: "Claude Sonnet 5", score: 53.4, type: "proprietary" },
      { name: "GPT-5.4", score: 51.4, type: "proprietary" },
      { name: "GPT-5.6 Luna", score: 51.2, type: "proprietary" },
      { name: "GLM-5.2", score: 51.1, type: "open" },
      { name: "Gemini 3.5 Flash", score: 50.2, type: "proprietary" },
      { name: "Gemini 3.1 Pro", score: 46.5, type: "proprietary" },
      { name: "Qwen3.7 Max", score: 46.0, type: "proprietary" },
      { name: "MiniMax M3", score: 44.4, type: "open" },
      { name: "GPT-5.3 Codex", score: 44.3, type: "proprietary" },
      { name: "DeepSeek V4 Pro", score: 44.3, type: "open" },
      { name: "Kimi K2.6", score: 44.2, type: "open" },
      { name: "Claude Opus 4.6", score: 43.7, type: "proprietary" },
      { name: "Muse Spark 1.1", score: 43.1, type: "proprietary" },
    ];
    const MAX = 64;
    let built = false, tweens = [];
    const kill = () => { tweens.forEach((t) => t && t.kill && t.kill()); tweens = []; };
    function build() {
      if (built) return; built = true;
      chart.innerHTML = "";
      DATA.forEach((m) => {
        const b = document.createElement("div");
        b.className = "ob-b"; b.dataset.type = m.type; b.dataset.score = m.score;
        b.innerHTML = `<span class="ob-b-score">0</span><div class="ob-b-fill"></div><span class="ob-b-name">${m.name}</span>`;
        chart.appendChild(b);
      });
    }
    function draw(instant) {
      $$(".ob-b", chart).forEach((b, k) => {
        const score = +b.dataset.score;
        const h = (score / MAX) * 100;
        const fill = $(".ob-b-fill", b), num = $(".ob-b-score", b);
        if (instant || simple()) { gsap.set(fill, { height: h + "%" }); num.textContent = score.toFixed(1); return; }
        tweens.push(gsap.fromTo(fill, { height: 0 }, { height: h + "%", duration: 0.9, delay: k * 0.03, ease: "power2.out" }));
        const st = { v: 0 };
        tweens.push(gsap.to(st, { v: score, duration: 0.9, delay: k * 0.03, ease: "power2.out", onUpdate: () => (num.textContent = st.v.toFixed(1)) }));
      });
    }
    S["open-weight-benchmark"] = {
      el, steps: 1,
      enter() { build(); kill(); draw(false); },
      leave() { kill(); },
      setStep() {},
    };
  })();

  /* ══════════════ P4 · 계층적 다중 AI (OIGP 구조도, 정적) ══════════════ */
  S["hierarchical-ai"] = stillScene("hierarchical-ai");
})();
