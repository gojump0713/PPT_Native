/* scenes3.js — 03 덱 (교육 플랫폼) 씬 컨트롤러 T01~T05 */
(function () {
  const S = window.SCENES;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const simple = () => window.PERF.simple();

  /* ══════ T01 · Tstation 챕터 타이틀 ══════ */
  S.tstation = window.CHAPTER_SCENE("tstation");

  /* ══════ 전체화면 자동재생 영상 슬라이드 (TS/CBT 시연) ══════ */
  function fullscreenVideo(id) {
    const el = $("#" + id);
    const video = $(".fsv-video", el);
    return {
      el,
      steps: 1,
      enter() {
        try { video.currentTime = 0; } catch (e) { /* 아직 미로드 */ }
        const p = video.play();                 // muted 이므로 자동재생 정책 통과
        if (p && p.catch) p.catch(() => {});
      },
      leave() {
        video.pause();
        try { video.currentTime = 0; } catch (e) { /* noop */ }
      },
      setStep() {},
    };
  }
  S.ts001 = fullscreenVideo("ts001");
  S.ts002 = fullscreenVideo("ts002");
  S.cbt001 = fullscreenVideo("cbt001");
  S.cbt002 = fullscreenVideo("cbt002");

  /* ══════ T04 · CAS 챕터 타이틀 (+ 키워드 칩 5종 → 라인 연결) ══════ */
  (function () {
    const el = $("#cas");
    const kws = $$(".c4-kw", el);
    const line = $(".c4-line path", el);
    S.cas = window.CHAPTER_SCENE("cas", {
      steps: 2,
      setStep(i, dir) {
        if (i >= 1) {
          gsap.to(kws, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "back.out(1.6)" });
          gsap.to(line, { strokeDashoffset: 0, duration: 1.1, delay: 0.5, ease: "power2.inOut" }); // S04-AC-02: 1.2s 이내
        } else {
          gsap.to(kws, { opacity: 0, y: 20, duration: 0.3 });
          gsap.set(line, { strokeDashoffset: 900 });
        }
      },
    });
  })();

  /* ══════ T02 · Instant Setup — IaC 변환 다이어그램 (혼돈 → Tstation IaC → 표준 스택) ══════ */
  (function () {
    const el = $("#instant-setup");
    const pains = $$(".t2-pain", el);
    const readys = $$(".t2-ready", el);
    const core = $(".t2-core", el);
    const links = $$(".t2-link i", el);
    let tl = null;

    function reveal() {
      if (tl) tl.kill();
      if (simple()) {                                     // 저사양·reduced-motion: 최종 상태 즉시
        gsap.set(pains, { opacity: 0.55, filter: "blur(1px)", y: 0 });
        gsap.set(core, { opacity: 1, scale: 1 });
        gsap.set(readys, { opacity: 1, x: 0, scale: 1 });
        gsap.set(links, { scaleX: 1 });
        return;
      }
      tl = gsap.timeline();
      tl.fromTo(pains, { opacity: 0, y: 20 }, { opacity: 0.55, y: 0, filter: "blur(1px)", duration: 0.5, stagger: 0.09, ease: "power2.out" }, 0.15);
      tl.fromTo(links[0], { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out" }, 0.7);
      tl.fromTo(core, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, 0.9);
      tl.fromTo(links[1], { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out" }, 1.4);
      tl.fromTo(readys, { opacity: 0, x: -30, scale: 0.85 }, { opacity: 1, x: 0, scale: 1, duration: 0.5, stagger: 0.09, ease: "back.out(1.6)" }, 1.5);
    }

    S["instant-setup"] = {
      el,
      steps: 1,
      enter() { reveal(); },                              // 진입 시 클릭 없이 전체 시퀀스 자동 재생
      leave() { if (tl) tl.kill(); },
      setStep() {},
    };
  })();

  /* ══════ T03 · Tstation 6대 특징 (bento-grid + 마이크로 데모) ══════ */
  (function () {
    const el = $("#tstation-features");
    const cards = $$(".t3-card", el);
    let sweepTL = null, sweepDone = false;

    // 마이크로 데모 6종 (각 1.5초 이내, S03-AC-02)
    const DEMOS = {
      setup(card) {
        const term = $(".t3-term", card), checks = $$(".t3-checks b", card);
        const tl = gsap.timeline();
        term.textContent = "";
        const CMD = "$ tstation up";
        let k = 0;
        const t = setInterval(() => { term.textContent = CMD.slice(0, ++k); if (k >= CMD.length) clearInterval(t); }, 40);
        tl.to(checks, { opacity: 1, scale: 1, duration: 0.25, stagger: 0.15, ease: "back.out(2.5)" }, 0.65);
        tl.eventCallback("onInterrupt", () => clearInterval(t));
        return tl;
      },
      gpu(card) {
        const bars = $$(".t3-demo-gpu u", card);
        const tl = gsap.timeline();
        for (let r = 0; r < 2; r++) {
          bars.forEach((b, i) => tl.to(b, { height: `${30 + Math.random() * 60}%`, duration: 0.3, ease: "power1.inOut" }, r * 0.65 + i * 0.08));
        }
        return tl;
      },
      access(card) {
        const devs = $$(".t3-demo-access b", card);
        const tl = gsap.timeline();
        devs.forEach((d, i) => {
          tl.add(() => devs.forEach((x, k) => x.classList.toggle("on", k === i)), i * 0.45);
        });
        tl.add(() => devs.forEach((x) => x.classList.remove("on")), 1.4);
        return tl;
      },
      gov(card) {
        const knobs = $$(".t3-demo-gov u b", card);
        const tl = gsap.timeline();
        knobs.forEach((kn, i) => tl.to(kn, { left: `${18 + Math.random() * 60}%`, duration: 0.5, ease: "power2.inOut" }, i * 0.15));
        return tl;
      },
      secure(card) {
        const dot = $(".t3-dot", card), shield = $(".t3-shield", card), frame = $(".t3-frame", card);
        const tl = gsap.timeline();
        tl.fromTo(dot, { x: 0, opacity: 1 }, { x: 34, duration: 0.5, ease: "power1.in" });
        tl.to(dot, { x: 26, opacity: 0, duration: 0.25 });                 // 방패에 막힘
        tl.fromTo(shield, { scale: 1 }, { scale: 1.25, duration: 0.2, yoyo: true, repeat: 1 }, 0.5);
        tl.fromTo(frame, { x: 0, opacity: 0.4 }, { x: 18, opacity: 1, duration: 0.45 }, 0.9); // 화면 프레임만 전송
        tl.to([dot, frame], { x: 0, opacity: 1, duration: 0.01 }, 1.45);
        return tl;
      },
      stack(card) {
        const chips = $$(".t3-demo-stack i", card);
        return gsap.timeline().to(chips, { opacity: 1, y: 0, duration: 0.35, stagger: 0.22, ease: "back.out(1.8)" });
      },
    };
    const running = new Map();
    function runDemo(card) {
      if (simple()) return;                               // S03-FBK-01
      stopDemo(card);
      running.set(card, DEMOS[card.dataset.demo](card));
    }
    function stopDemo(card) {                             // hover 이탈 즉시 초기화 (S03-AC-02)
      const tl = running.get(card);
      if (tl) tl.kill();
      gsap.set($$(".t3-checks b", card), { opacity: 0, scale: 0.4 });
      gsap.set($$(".t3-demo-stack i", card), { opacity: 0, y: -14 });
      $$(".t3-demo-access b", card).forEach((d) => d.classList.remove("on"));
      const term = $(".t3-term", card);
      if (term) term.textContent = "$ _";
    }
    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => runDemo(card));           // S03-INT-01
      card.addEventListener("mouseleave", () => stopDemo(card));
      stopDemo(card);
    });

    function sweep() {                                    // S03-INT-03: 좌상→우하 1회 자동 시연
      if (sweepTL) sweepTL.kill();
      sweepTL = gsap.timeline();
      cards.forEach((card, i) => sweepTL.add(() => runDemo(card), i * 0.3));
      sweepTL.add(() => {}, cards.length * 0.3 + 1.6);    // 시연 후 정지 (S03-AC-01)
    }

    S["tstation-features"] = {
      el,
      steps: 3, // ①헤드라인 → ②상단 3카드 → ③하단 3카드(+일괄 시연)
      enter(s) { this.setStep(s, 1, true); },
      leave() { if (sweepTL) sweepTL.kill(); cards.forEach(stopDemo); sweepDone = false; },
      setStep(i, dir, instant) {
        if (dir > 0 && i === 0 && !instant) {
          gsap.fromTo($$(".t3-head > *", el), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out", clearProps: "all" });
        }
        cards.forEach((card, k) => {
          const row = k < 3 ? 1 : 2;                      // 상단 3장=스텝②, 하단 3장=스텝③
          const show = i >= row;
          gsap.set(card, { visibility: show ? "visible" : "hidden" });
          if (show && dir > 0 && i === row && !instant) {
            gsap.fromTo(card, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, delay: (k % 3) * 0.13, ease: "power3.out" });
          } else gsap.set(card, { opacity: show ? 1 : 0, y: 0 });
        });
        if (i >= 2 && dir > 0 && !instant && !sweepDone) { sweepDone = true; gsap.delayedCall(0.8, sweep); }
        if (i < 2) sweepDone = false;
      },
    };
  })();

  /* ══════ T05 · CAS 통합 학습관리 (hub-tabs) ══════ */
  (function () {
    const el = $("#cas-platform");
    const hub = $(".c5-hub", el);
    const tabs = $$(".c5-tab", el);
    const screens = $$(".c5-screen", el);
    const bridge = $(".c5-bridge path", el);
    const bases = $(".c5-bases", el);
    let active = -1, cycleTL = null, hoverTimer = null, microTL = null;

    // 목업 마이크로 모션 (탭 활성 시 1회)
    const MICRO = [
      () => { // 문서 → 뷰어 열림
        const viewer = $(".c5-viewer", screens[0]);
        viewer.hidden = false;
        return gsap.timeline()
          .fromTo($(".c5-doc", screens[0]), { scale: 1 }, { scale: 1.03, duration: 0.25, yoyo: true, repeat: 1 })
          .fromTo(viewer, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }, 0.4);
      },
      () => { // 진도 링 카운트업
        const fill = $(".c5-ring-fill", screens[1]);
        const num = $(".c5-ring b", screens[1]);
        const st = { v: 0 };
        return gsap.timeline()
          .to(st, { v: 72, duration: 0.9, ease: "power2.out", onUpdate: () => (num.textContent = Math.round(st.v) + "%") })
          .to(fill, { strokeDashoffset: 327 * (1 - 0.72), duration: 0.9, ease: "power2.out" }, 0);
      },
      () => { // 제출 바 + 스탬프
        const bar = $(".c5-submitbar u", screens[2]);
        const label = $(".c5-submitbar b", screens[2]);
        const stamp = $(".c5-stamp", screens[2]);
        stamp.hidden = false;
        const st = { v: 0 };
        return gsap.timeline()
          .to(st, { v: 38, duration: 0.9, ease: "power2.out", onUpdate: () => (label.textContent = `${Math.round(st.v)} / 42명 제출`) })
          .to(bar, { scaleX: 38 / 42, duration: 0.9, ease: "power2.out" }, 0)
          .fromTo(stamp, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 0.8);
      },
      () => { // 새 답변 도착
        const na = $(".c5-newanswer", screens[3]);
        na.hidden = false;
        return gsap.fromTo(na, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.6)" });
      },
    ];
    function resetMicros() {
      $(".c5-viewer", el).hidden = true;
      $(".c5-stamp", el).hidden = true;
      $(".c5-newanswer", el).hidden = true;
      gsap.set($(".c5-ring-fill", el), { strokeDashoffset: 327 });
      $(".c5-ring b", el).textContent = "0%";
      gsap.set($(".c5-submitbar u", el), { scaleX: 0 });
      $(".c5-submitbar b", el).textContent = "0 / 42명 제출";
    }

    function setTab(k, withMicro = true) {                // S05-INT-01
      if (k === active) return;
      active = k;
      tabs.forEach((t, i) => t.classList.toggle("active", i === k));
      screens.forEach((s, i) => s.classList.toggle("active", i === k));
      if (microTL) microTL.kill();
      resetMicros();
      const items = $$(".c5-screen.active > *", el);
      if (!simple()) gsap.fromTo(items, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.07, ease: "power2.out" });
      if (withMicro && !simple()) microTL = gsap.timeline().add(MICRO[k](), 0.3);
      else if (withMicro) microTL = gsap.timeline().add(MICRO[k](), 0); // 저사양도 핵심 시연 유지 (S05-FBK-01)
    }
    function stopCycle() { if (cycleTL) { cycleTL.kill(); cycleTL = null; } }
    function cycle() {                                    // S05-INT-02: 1바퀴 자동 순회
      stopCycle();
      cycleTL = gsap.timeline();
      [1, 2, 3].forEach((k, i) => cycleTL.add(() => setTab(k), (i + 1) * 2.2));
    }

    tabs.forEach((t, k) => {
      t.addEventListener("click", () => { stopCycle(); setTab(k); });      // 개입 시 수동 전환
      t.addEventListener("mouseenter", () => {
        hoverTimer = setTimeout(() => { stopCycle(); setTab(k); }, 300);   // hover 0.3s 유지
      });
      t.addEventListener("mouseleave", () => clearTimeout(hoverTimer));
    });
    // ↑/↓는 전역 슬라이드 이동(이전/다음)으로 사용 — 탭 전환은 클릭·hover·자동 순회로 (navigation.js 키맵 참고)

    S["cas-platform"] = {
      el,
      steps: 4,
      enter(s) { this.setStep(s, 1, true); },
      leave() { stopCycle(); if (microTL) microTL.kill(); },
      setStep(i, dir, instant) {
        if (dir > 0 && i === 0 && !instant) {
          gsap.fromTo($$(".c5-head > *", el), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out", clearProps: "all" });
        }
        // 스텝② 허브 + 첫 탭
        const showHub = i >= 1;
        gsap.set(hub, { visibility: showHub ? "visible" : "hidden" });
        if (showHub) {
          gsap.to(hub, { opacity: 1, duration: 0.4 });
          if (dir > 0 && i === 1 && !instant) {
            gsap.fromTo(tabs, { x: -26, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.12, ease: "power3.out", clearProps: "opacity,transform" });
          }
          if (active < 0 || i === 1) { active = -1; setTab(0, !instant); }
        } else { gsap.set(hub, { opacity: 0 }); active = -1; stopCycle(); }
        // 스텝③ 자동 순회
        if (i === 2 && dir > 0 && !instant) cycle();
        else if (i !== 2) stopCycle();
        if (i >= 2 && (instant || dir < 0)) setTab(3, false);
        // 스텝④ 공통 기반 배지 + 브릿지
        const showBase = i >= 3;
        gsap.set(bases, { visibility: showBase ? "visible" : "hidden" });
        if (showBase) {
          stopCycle();
          gsap.to(bases, { opacity: 1, duration: 0.4 });
          if (dir > 0 && !instant) {
            gsap.fromTo($$(".c5-bases span", el), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.14, ease: "back.out(1.5)" });
            gsap.to(bridge, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" });
          } else gsap.set(bridge, { strokeDashoffset: 0 });
        } else {
          gsap.set(bases, { opacity: 0 });
          gsap.set(bridge, { strokeDashoffset: 1400 });
        }
      },
    };
  })();
})();
