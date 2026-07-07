/* scenes3.js — 03 덱 (교육 플랫폼) 씬 컨트롤러 T01~T05 */
(function () {
  const S = window.SCENES;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const simple = () => window.PERF.simple();

  /* ══════ T01 · Tstation 챕터 타이틀 ══════ */
  S.tstation = window.CHAPTER_SCENE("tstation");

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

  /* ══════ T02 · Instant Setup (IaC 인포그래픽 영상 · 구간 재생) ══════ */
  (function () {
    const el = $("#instant-setup");
    const video = $(".t2-video", el);
    const segs = $$(".t2-seg", el);
    const chips = $$(".t2-chip", el);
    const SEGSRC = window.CONFIG.iacSegments;           // 구간→파일 매핑 (config.js)
    let cur = -1, raf = 0, fbTL = null;

    function segLoop() {
      if (cur >= 0 && video.duration) {
        segs.forEach((s, k) => s.style.setProperty("--p",
          k < cur ? 1 : k === cur ? Math.min(1, video.currentTime / video.duration) : 0));
      }
      raf = requestAnimationFrame(segLoop);
    }

    // 폴백 인포그래픽 (S02-FBK-01)
    function playFallback(seg, instant) {
      if (fbTL) fbTL.kill();
      $$(".t2f-seg", el).forEach((s, k) => s.classList.toggle("on", k === seg));
      fbTL = gsap.timeline();
      if (seg === 0) {
        const blocks = $$(".t2f-a .t2f-pipe span", el);
        const clock = $(".t2f-clock b", el);
        if (instant) { gsap.set(blocks, { opacity: 1, y: 0 }); clock.textContent = "6"; return; }
        fbTL.to(blocks, { opacity: 1, y: 0, duration: 0.45, stagger: 0.28, ease: "power2.out" });
        const st = { v: 0 };
        fbTL.to(st, { v: 6, duration: 1.8, ease: "power1.in", onUpdate: () => (clock.textContent = Math.round(st.v)) }, 0.2);
      } else if (seg === 1) {
        const code = $(".t2f-code", el);
        const stacks = $$(".t2f-stack i", el);
        const SRC = "env: ai-class-2026\ngpu: A100 x 0.25\nstack: [pytorch, tensorflow, cuda]\ndeploy: instant";
        if (instant) { code.textContent = SRC; gsap.set(stacks, { opacity: 1, y: 0 }); return; }
        code.textContent = "";
        let k = 0;
        const t = setInterval(() => {
          code.textContent = SRC.slice(0, ++k);
          if (k >= SRC.length) clearInterval(t);
        }, 28);
        fbTL.add(() => {}, 0.1);
        fbTL.to(stacks, { opacity: 1, y: 0, duration: 0.4, stagger: 0.2, ease: "back.out(1.6)" }, 1.6);
      } else {
        const c = $(".t2f-c", el);
        const one = $(".t2f-one b", el);
        if (instant) { c.classList.add("done"); one.textContent = "1"; return; }
        c.classList.remove("done");
        fbTL.add(() => c.classList.add("done"), 1.0);
        fbTL.fromTo(".t2f-one", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" }, 1.0);
      }
    }

    function playSeg(seg, instant) {
      cur = seg;
      chips.forEach((c, k) => c.classList.toggle("on", k === seg));       // S02-INT-02
      if (el.classList.contains("no-video") || simple()) { playFallback(seg, instant); return; }
      video.src = `assets/videos/${SEGSRC[seg]}`;
      video.load();
      if (instant) {
        // 구간 즉시 완료 상태: 마지막 프레임 (S02-INT-01)
        video.addEventListener("loadedmetadata", function once() {
          video.removeEventListener("loadedmetadata", once);
          video.currentTime = Math.max(0, video.duration - 0.05);
        });
      } else {
        video.play().catch(() => el.classList.add("no-video"));
      }
    }
    // 구간 끝: 마지막 프레임 정지 유지 (S02-AC-02 — loop 미사용)
    video.addEventListener("ended", () => video.pause());
    video.addEventListener("error", () => { el.classList.add("no-video"); playFallback(Math.max(0, cur), false); });

    segs.forEach((s, k) => s.addEventListener("click", () => window.DECK.goTo(window.DECK.current, { step: k }))); // S02-INT-03

    S["instant-setup"] = {
      el,
      steps: 3,
      enter(s) {
        if (simple()) el.classList.add("no-video");
        raf = requestAnimationFrame(segLoop);
        this.setStep(s, 1, true);
      },
      leave() { video.pause(); cancelAnimationFrame(raf); if (fbTL) fbTL.kill(); },
      setStep(i, dir, instant) { playSeg(i, instant && dir > 0); },
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
    // 키보드 ↑/↓ 탭 전환 (S05-INT-04)
    window.addEventListener("keydown", (e) => {
      if (window.DECK.current !== window.DECK.slides.indexOf(el)) return;
      if (window.OVERVIEW.isOpen) return;
      if (e.key === "ArrowDown") { e.preventDefault(); stopCycle(); setTab(Math.min(3, Math.max(0, active) + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); stopCycle(); setTab(Math.max(0, active - 1)); }
    });

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
