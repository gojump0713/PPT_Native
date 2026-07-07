/* navigation.js — 덱 엔진: 슬라이드/스텝 상태 · 전환 · 입력 · 해시 · 저장 (PRD 5.2~5.4) */
(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const hudSection = document.getElementById("hud-section");
  const hudPage = document.getElementById("hud-page");
  const hudTimer = document.getElementById("hud-timer");
  const progressFill = document.getElementById("progress-fill");
  const blackout = document.getElementById("blackout");
  const STORE_KEY = "anc-deck-pos";

  const DECK = {
    slides,
    current: -1,
    step: 0,
    locked: false,
    startTime: performance.now(),
    _autoTimers: [],

    /* ── 자동 시퀀스 (autoplay): 클릭 없이 스텝 자동 진행 (CONFIG.autoplay) ── */
    clearAuto() { this._autoTimers.forEach(clearTimeout); this._autoTimers.length = 0; },
    startAuto() {
      this.clearAuto();
      const idx = this.current;
      const seq = (window.CONFIG.autoplay || {})[slides[idx].id];
      if (!seq) return;
      if (window.PERF.simple()) { this.applyStep(this.totalSteps(idx) - 1, 1); return; }  // 저사양·reduced-motion: 최종 상태 즉시
      let acc = 0;
      seq.forEach((delay, k) => {
        acc += delay;
        // 아직 같은 슬라이드이고 수동 진행이 없었을 때만 다음 스텝 진행 (step===k 가드로 자기정합)
        this._autoTimers.push(setTimeout(() => {
          if (this.current === idx && this.step === k) this.applyStep(k + 1, 1);
        }, acc));
      });
    },

    scene(i) { return window.SCENES[slides[i ?? this.current].id]; },

    totalSteps(i) {
      return parseInt(slides[i].dataset.steps || "1", 10);
    },

    /* ── 슬라이드 이동 (전환 잠금 포함, T-공통 규칙) ── */
    goTo(index, opts = {}) {
      index = Math.max(0, Math.min(slides.length - 1, index));
      const step = opts.step ?? 0;
      if (index === this.current) {
        if (step !== this.step) this.applyStep(step, step > this.step ? 1 : -1);
        return;
      }
      if (this.locked) return;
      this.locked = true;
      this.clearAuto();

      const prevIdx = this.current;
      const dir = index > prevIdx ? 1 : -1;
      const from = prevIdx >= 0 ? slides[prevIdx] : null;
      const to = slides[index];
      const type = window.PERF.simple() ? "fade-fast" : (window.CONTENT[index].transition || "fade");

      if (from) this.scene(prevIdx).leave();
      this.current = index;
      this.step = step;

      const done = () => {
        this.locked = false;
        if (from) from.classList.remove("active");
        this.scene().enter(step);
        this.sync();
        this.startAuto();
      };
      to.classList.add("active");
      this.transition(type, from, to, dir, done);
      this.sync(true);
    },

    /* ── 전환 라이브러리 (기능명세서 0절 매핑) ── */
    transition(type, from, to, dir, done) {
      const D = window.CONFIG.transition.normal;
      const tl = gsap.timeline({ onComplete: done });
      switch (type) {
        case "fade-fast": // reduced-motion / 저사양 (COM-08)
          if (from) tl.to(from, { opacity: 0, duration: 0.25 }, 0);
          tl.fromTo(to, { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.05);
          break;
        case "push": // T-02
          if (from) tl.to(from, { xPercent: -14 * dir, opacity: 0, duration: D, ease: "power3.inOut" }, 0);
          tl.fromTo(to, { xPercent: 26 * dir, opacity: 0 }, { xPercent: 0, opacity: 1, duration: D, ease: "power3.inOut", clearProps: "transform" }, 0.08);
          break;
        case "blur-fade": // T-09
          if (from) tl.to(from, { opacity: 0, filter: "blur(14px)", duration: D * 0.8, ease: "power2.in", onComplete: () => gsap.set(from, { filter: "none" }) }, 0);
          tl.fromTo(to, { opacity: 0, filter: "blur(14px)" }, { opacity: 1, filter: "blur(0px)", duration: D, ease: "power2.out", clearProps: "filter" }, 0.25);
          break;
        case "morph": // T-04 근사: 스케일 크로스디졸브
          if (from) tl.to(from, { opacity: 0, scale: 1.06, duration: D * 0.8, ease: "power2.in", onComplete: () => gsap.set(from, { scale: 1 }) }, 0);
          tl.fromTo(to, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: D, ease: "power3.out", clearProps: "transform" }, 0.2);
          break;
        case "zoom": // T-05
          if (from) tl.to(from, { opacity: 0, scale: 0.92, duration: D * 0.8, ease: "power2.in", onComplete: () => gsap.set(from, { scale: 1 }) }, 0);
          tl.fromTo(to, { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: D, ease: "power3.out", clearProps: "transform" }, 0.2);
          break;
        case "fly": // T-07 Camera Fly-through 근사: 줌아웃 → 영상 공간 진입
          if (from) tl.to(from, { opacity: 0, scale: 0.85, filter: "blur(6px)", duration: D, ease: "power2.in", onComplete: () => gsap.set(from, { scale: 1, filter: "none" }) }, 0);
          tl.fromTo(to, { opacity: 0, scale: 1.3, filter: "blur(8px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.3, ease: "power3.out", clearProps: "transform,filter" }, 0.35);
          break;
        case "wipe": // T-03 Page Wipe: clip-path 와이프
          if (from) tl.to(from, { opacity: 0, duration: D, ease: "power2.inOut" }, 0.15);
          tl.fromTo(to, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: D, ease: "power3.inOut", clearProps: "clipPath" }, 0);
          break;
        case "particle": // T-08 근사: 디졸브 + 스케일
          if (from) tl.to(from, { opacity: 0, scale: 1.04, filter: "blur(10px)", duration: D * 0.9, ease: "power2.in", onComplete: () => gsap.set(from, { scale: 1, filter: "none" }) }, 0);
          tl.fromTo(to, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: D, ease: "power2.out", clearProps: "transform" }, 0.3);
          break;
        default: // fade (T-01)
          if (from) tl.to(from, { opacity: 0, duration: D * 0.7, ease: "power2.inOut" }, 0);
          tl.fromTo(to, { opacity: 0 }, { opacity: 1, duration: D, ease: "power2.inOut" }, 0.2);
      }
      // 전환 최대 잠금 안전장치
      setTimeout(() => (this.locked = false), (D + 1.2) * 1000);
    },

    applyStep(step, dir) {
      this.step = step;
      this.scene().setStep(step, dir);
      this.sync();
    },

    /* ── 스텝 소진 규칙 (COM-03) ── */
    next() {
      if (this.locked) return;
      this.clearAuto();                                   // 수동 진행 시 자동 시퀀스 중단
      if (this.step < this.totalSteps(this.current) - 1) this.applyStep(this.step + 1, 1);
      else if (this.current < slides.length - 1) this.goTo(this.current + 1, { step: 0 });
      else if (window.CONFIG.openOverviewAtEnd && !window.OVERVIEW.isOpen) window.OVERVIEW.open(); // S10-INT-03
    },
    prev() {
      if (this.locked) return;
      this.clearAuto();                                   // 수동 진행 시 자동 시퀀스 중단
      if (this.step > 0) this.applyStep(this.step - 1, -1);
      else if (this.current > 0) this.goTo(this.current - 1, { step: 0 });
    },

    /* ── HUD·해시·저장 동기화 ── */
    sync(skipStore) {
      const meta = window.CONTENT[this.current];
      hudSection.textContent = meta.section;
      hudPage.textContent = `${this.current + 1} / ${slides.length}`;
      const stepsHere = this.totalSteps(this.current);
      const stepFrac = stepsHere > 1 ? this.step / (stepsHere - 1) : 1;
      progressFill.style.width = (((this.current + stepFrac) / slides.length) * 100).toFixed(2) + "%";
      const hash = "#/" + meta.id;
      if (location.hash !== hash) {
        this._ignoreHash = true;
        location.hash = hash;
      }
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify({ slide: this.current, step: this.step }));
      } catch (e) { /* 프라이빗 모드 등 */ }
      if (window.NOTES) window.NOTES.update();
    },

    /* ── 초기 위치 결정: 해시 > LocalStorage > 0 (PRD 5.4) ── */
    init() {
      let index = 0, step = 0;
      const hashId = location.hash.replace(/^#\//, "");
      const byHash = window.CONTENT.findIndex((s) => s.id === hashId);
      if (byHash >= 0) index = byHash;
      else {
        try {
          const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
          if (saved && Number.isInteger(saved.slide) && saved.slide < slides.length) {
            index = saved.slide;
            step = Math.min(saved.step || 0, this.totalSteps(index) - 1);
          }
        } catch (e) { /* noop */ }
      }
      this.goTo(index, { step });
    },
  };

  /* ── 해시 내비게이션 (뒤로/앞으로가기) ── */
  window.addEventListener("hashchange", () => {
    if (DECK._ignoreHash) { DECK._ignoreHash = false; return; }
    const id = location.hash.replace(/^#\//, "");
    const idx = window.CONTENT.findIndex((s) => s.id === id);
    if (idx >= 0 && idx !== DECK.current) DECK.goTo(idx, { step: 0 });
  });

  /* ── 키보드 (PRD 5.3 · COM-02) ── */
  let numBuffer = "";
  window.addEventListener("keydown", (e) => {
    if (document.documentElement.classList.contains("gated")) return;
    // Overview가 열려 있으면 우선 처리
    if (window.OVERVIEW.isOpen && window.OVERVIEW.key(e)) return;

    switch (e.key) {
      case "ArrowRight": case " ": case "PageDown":
        e.preventDefault(); DECK.next(); break;
      case "ArrowLeft": case "PageUp":
        e.preventDefault(); DECK.prev(); break;
      case "Home": e.preventDefault(); DECK.goTo(0); break;
      case "End": e.preventDefault(); DECK.goTo(slides.length - 1); break;
      case "o": case "O": window.OVERVIEW.toggle(); break;
      case "Escape": // 닫기 전용 (O-02) — 오버레이 없으면 무시(전체화면 해제와 충돌 없음)
        if (!blackout.hidden) blackout.hidden = true;
        break;
      case "f": case "F":
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(() => {});
        break;
      case "b": case "B":
        blackout.hidden = !blackout.hidden; break;
      case "n": case "N":
        if (window.NOTES) window.NOTES.open(); break;
      case "r": case "R":
        DECK.startTime = performance.now(); break;
      case "Enter":
        if (numBuffer) {
          const n = parseInt(numBuffer, 10);
          if (n >= 1 && n <= slides.length) DECK.goTo(n - 1, { step: 0 });
          numBuffer = "";
        }
        break;
      default:
        if (/^[0-9]$/.test(e.key)) numBuffer = (numBuffer + e.key).slice(-2);
    }
  });

  /* ── 마우스 휠·터치패드 (wheel 이벤트, COM-03) ── */
  let wheelAcc = 0, wheelLockUntil = 0;
  window.addEventListener("wheel", (e) => {
    if (window.OVERVIEW.isOpen || !blackout.hidden) return;
    const now = performance.now();
    if (now < wheelLockUntil) return;
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) >= window.CONFIG.wheelThreshold) {
      wheelAcc > 0 ? DECK.next() : DECK.prev();
      wheelAcc = 0;
      wheelLockUntil = now + window.CONFIG.wheelCooldownMs;
    }
  }, { passive: true });

  /* ── 클릭 = 다음 스텝 (인터랙티브 요소 제외) ── */
  document.getElementById("stage").addEventListener("click", (e) => {
    if (e.target.closest("button, a, .s03-card, .s04-card, .s05-node, .chip, .s06-module, .s06-track, .s02-stage")) return;
    DECK.next();
  });

  /* ── 발표 타이머 ── */
  setInterval(() => {
    const s = Math.floor((performance.now() - DECK.startTime) / 1000);
    hudTimer.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }, 1000);

  window.DECK = DECK;
})();
