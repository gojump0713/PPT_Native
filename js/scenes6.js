/* scenes6.js — 06 덱 · Colab vs Tstation 8장 씬 컨트롤러 (Tstation UI설계 작업지시서)
 * CL1 문제 요약 · CL2 런타임 타임라인 · CL3 데이터 접근 · CL4 협업 · CL5 캠퍼스 GPU · CL6 모니터링 · CL7 해결 구조 · CL8 도입 효과 */
(function () {
  const S = window.SCENES;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const simple = () => window.PERF.simple();

  /* 슬라이드 id로 덱 이동 (문제 카드 → 상세 페이지, CTA → 데모/사례) */
  function gotoId(id) {
    const idx = window.CONTENT.findIndex((s) => s.id === id);
    if (idx >= 0) window.DECK.goTo(idx, { step: 0 });
  }
  $$("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", (e) => { e.stopPropagation(); gotoId(btn.dataset.goto); });
  });

  /* ══════════════ CL1 · 문제 제기 및 핵심 한계 요약 ══════════════ */
  (function () {
    const el = $("#cl-intro");
    const colab = $(".q1-colab", el), univ = $(".q1-univ", el);
    const cards = $$(".q1-card", el);
    let tweens = [];
    const kill = () => { tweens.forEach((t) => t && t.kill && t.kill()); tweens = []; };

    S["cl-intro"] = {
      el, steps: 3,
      enter(s) { this.setStep(s, 1, true); },
      leave() { kill(); },
      setStep(i, dir, instant) {
        const quick = instant || simple();
        kill();
        colab.classList.toggle("on", i >= 0);
        univ.classList.toggle("on", i >= 1);
        if (i >= 2) {
          if (dir > 0 && i === 2 && !quick) {
            cards.forEach((c) => c.classList.remove("on"));
            cards.forEach((c, k) => tweens.push(gsap.delayedCall(0.1 + k * 0.14, () => c.classList.add("on"))));
          } else cards.forEach((c) => c.classList.add("on"));
        } else cards.forEach((c) => c.classList.remove("on"));
      },
    };
  })();

  /* ══════════════ CL2 · 런타임 종료와 비영속 환경 (타임라인 자동 재생) ══════════════ */
  (function () {
    const el = $("#cl-runtime");
    const nodes = $$(".rt-node", el);
    const prog = $(".rt-prog s", el), progNum = $(".rt-prog em", el);
    const loop = $(".rt-loop", el), loopPath = $(".rt-loop-path", el);
    const impacts = $(".rt-impacts", el);
    const conclusion = $(".rt-conclusion", el);
    let demoTL = null, tweens = [];
    const kill = () => { tweens.forEach((t) => t && t.kill && t.kill()); tweens = []; if (demoTL) { demoTL.kill(); demoTL = null; } };
    const len = loopPath.getTotalLength ? loopPath.getTotalLength() : 2400;

    function resetLane() {
      nodes.forEach((n) => n.classList.remove("on"));
      gsap.set(prog, { width: 0 }); progNum.textContent = "0%";
      loop.classList.remove("on");
      gsap.set(loopPath, { opacity: 0, strokeDasharray: "8 7", strokeDashoffset: 0 });
    }
    function playDemo() {
      kill(); resetLane();
      if (simple()) { // 저사양: 최종 상태 즉시
        nodes.forEach((n) => n.classList.add("on"));
        gsap.set(prog, { width: "78%" }); progNum.textContent = "78%";
        gsap.set(loopPath, { opacity: 1 }); loop.classList.add("on");
        return;
      }
      demoTL = gsap.timeline();
      nodes.forEach((n, k) => demoTL.call(() => n.classList.add("on"), null, 0.15 + k * 0.5));
      // 모델 학습 진행률 (78%에서 런타임 종료)
      const st = { v: 0 };
      demoTL.to(st, {
        v: 78, duration: 1.6, ease: "power1.inOut",
        onUpdate: () => { gsap.set(prog, { width: st.v + "%" }); progNum.textContent = Math.round(st.v) + "%"; },
      }, 0.15 + 5 * 0.5);
      // 종료 → 루프백 드로잉
      demoTL.set(loopPath, { opacity: 1, strokeDasharray: len, strokeDashoffset: len }, ">0.35");
      demoTL.to(loopPath, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" });
      demoTL.set(loopPath, { strokeDasharray: "8 7", strokeDashoffset: 0 });
      demoTL.call(() => loop.classList.add("on"));
      // 재구성: 앞 단계(설치~로딩)가 깜빡이며 되돌아감을 암시
      demoTL.to($$(".rt-node", el).slice(1, 5), { opacity: 0.45, duration: 0.35, yoyo: true, repeat: 3, stagger: 0.06 }, ">0.2");
    }
    $(".rt-replay", el).addEventListener("click", (e) => { e.stopPropagation(); playDemo(); });

    S["cl-runtime"] = {
      el, steps: 3,
      enter(s) { this.setStep(s, 1, true); if (s === 0) playDemo(); },
      leave() { kill(); resetLane(); },
      setStep(i, dir, instant) {
        const quick = instant || simple();
        if (!instant && i === 0 && dir < 0) playDemo();
        if (i >= 1 && !demoTL) { nodes.forEach((n) => n.classList.add("on")); gsap.set(prog, { width: "78%" }); progNum.textContent = "78%"; gsap.set(loopPath, { opacity: 1 }); loop.classList.add("on"); }
        impacts.classList.toggle("on", i >= 1);
        gsap.set(conclusion, { opacity: i >= 2 ? 1 : 0 });
        if (dir > 0 && i === 2 && !quick) gsap.fromTo(conclusion, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", clearProps: "transform" });
      },
    };
  })();

  /* ══════════════ CL3 · 데이터 접근 안정성 (학생 수 30/60/100 시뮬레이션) ══════════════ */
  (function () {
    const el = $("#cl-data");
    const stage = $(".da-stage", el);
    const dotsBox = $(".da-dots", el), links = $(".da-links", el);
    const loadFill = $(".da-load s", el), loadLbl = $(".da-load-lbl", el);
    const btns = $$(".da-btn", el);
    const side = $(".da-side", el), impacts = $(".da-impacts", el), conclusion = $(".da-conclusion", el);
    // 규모별 상태 분포·부하 (연출 수치 — 규모가 커질수록 불확실성 확대)
    const PROFILE = { 30: { delay: 7, fail: 0, load: 34 }, 60: { delay: 13, fail: 7, load: 66 }, 100: { delay: 18, fail: 14, load: 93 } };
    const HUB = { x: 575, y: 300 }; // viewBox 1150×660 기준 허브 중심
    let cur = 30, autoTimers = [], tweens = [];
    const kill = () => { tweens.forEach((t) => t && t.kill && t.kill()); tweens = []; autoTimers.forEach((t) => t && t.kill && t.kill()); autoTimers = []; };
    const rnd = (i, salt) => ((i * 7919 + salt * 104729) % 997) / 997; // 결정적 의사난수 (매 렌더 동일)

    function build(n, animate) {
      cur = n;
      btns.forEach((b) => b.classList.toggle("on", +b.dataset.n === n));
      const p = PROFILE[n];
      dotsBox.innerHTML = ""; links.innerHTML = "";
      const frag = document.createDocumentFragment();
      let failCnt = 0;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2 + rnd(i, 1) * 0.22;
        const rx = 430 + rnd(i, 2) * 82, ry = 246 + rnd(i, 3) * 52;
        const x = HUB.x + Math.cos(a) * rx, y = HUB.y + Math.sin(a) * ry;
        const roll = rnd(i, 4) * 100;
        const st = roll < p.fail ? "fail" : roll < p.fail + p.delay ? "delay" : "ok";
        if (st === "fail") failCnt++;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", HUB.x); line.setAttribute("y1", HUB.y);
        line.setAttribute("x2", x); line.setAttribute("y2", y);
        line.setAttribute("stroke", st === "fail" ? "#ff5c7a" : st === "delay" ? "#ff9f43" : "rgba(35,215,160,0.5)");
        if (st === "fail") line.setAttribute("stroke-dasharray", "3 6");
        links.appendChild(line);
        const d = document.createElement("i");
        d.className = "da-dot"; d.dataset.st = st;
        d.style.left = (x / 1150) * 100 + "%"; d.style.top = (y / 660) * 100 + "%";
        frag.appendChild(d);
      }
      dotsBox.appendChild(frag);
      if (animate && !simple()) {
        gsap.fromTo($$(".da-dot", dotsBox), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.006, ease: "back.out(1.8)", clearProps: "transform" });
        tweens.push(gsap.to(loadFill, { width: p.load + "%", duration: 0.9, ease: "power2.out" }));
      } else gsap.set(loadFill, { width: p.load + "%" });
      loadLbl.textContent = `동시 접근 부하 ${p.load}%` + (failCnt ? ` · 실패 ${failCnt}명` : "");
    }
    btns.forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); kill(); build(+b.dataset.n, true); }));

    S["cl-data"] = {
      el, steps: 3,
      enter(s) { this.setStep(s, 1, true); },
      leave() { kill(); },
      setStep(i, dir, instant) {
        const quick = instant || simple();
        kill();
        if (i === 0) build(30, dir > 0 && !quick);
        else if (i === 1 && dir > 0 && !quick) {
          // 30 → 60 → 100 자동 확대 시연
          build(30, false);
          autoTimers.push(gsap.delayedCall(0.5, () => build(60, true)));
          autoTimers.push(gsap.delayedCall(1.9, () => build(100, true)));
        } else build(100, false);
        side.classList.toggle("on", i >= 1);
        impacts.classList.toggle("on", i >= 2);
        gsap.set(conclusion, { opacity: i >= 2 ? 1 : 0 });
        if (dir > 0 && i === 2 && !quick) gsap.fromTo(conclusion, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", clearProps: "transform" });
      },
    };
  })();

  /* ══════════════ CL4 · 협업 및 장기 프로젝트 운영 한계 ══════════════ */
  (function () {
    const el = $("#cl-collab");
    const team = $(".co-team", el), cards = $$(".co-card", el);
    const merge = $(".co-merge", el), tst = $(".co-tst", el), conclusion = $(".co-conclusion", el);
    let tweens = [];
    const kill = () => { tweens.forEach((t) => t && t.kill && t.kill()); tweens = []; };

    S["cl-collab"] = {
      el, steps: 4,
      enter(s) { this.setStep(s, 1, true); },
      leave() { kill(); },
      setStep(i, dir, instant) {
        const quick = instant || simple();
        kill();
        if (i >= 0) {
          if (dir > 0 && i === 0 && !quick) {
            cards.forEach((c) => c.classList.remove("on"));
            cards.forEach((c, k) => tweens.push(gsap.delayedCall(0.08 + k * 0.14, () => c.classList.add("on"))));
          } else cards.forEach((c) => c.classList.add("on"));
        }
        team.classList.toggle("diff", i >= 1);
        team.classList.toggle("conflict", i >= 2);
        merge.classList.toggle("on", i >= 2);
        tst.classList.toggle("on", i >= 3);
        gsap.set(conclusion, { opacity: i >= 3 ? 1 : 0 });
        if (dir > 0 && i === 3 && !quick) gsap.fromTo(conclusion, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", clearProps: "transform" });
      },
    };
  })();

  /* ══════════════ CL5 · 대학 내부 GPU 활용 한계 (Pool 통합 시연) ══════════════ */
  (function () {
    const el = $("#cl-gpu");
    const oldP = $(".gp-old", el), newP = $(".gp-new", el);
    const poolCnt = $(".gp-pool-cnt", el);
    const rows = $$(".gp-row u s", el);
    const key = $(".gp-key", el);
    const BAR = [78, 64, 52, 88, 40]; // 시간표 배분 연출 값
    // 좌측 서버(스테이지 좌표) → 우측 Pool 중심으로 자원이 이동
    const SRV = [[190, 320], [500, 300], [710, 450], [270, 500], [530, 610]];
    const POOL = [1420, 300];
    let tweens = [], flies = [];
    const kill = () => {
      tweens.forEach((t) => t && t.kill && t.kill()); tweens = [];
      flies.forEach((f) => f.remove()); flies = [];
    };

    S["cl-gpu"] = {
      el, steps: 3,
      enter(s) { this.setStep(s, 1, true); },
      leave() { kill(); },
      setStep(i, dir, instant) {
        const quick = instant || simple();
        kill();
        oldP.classList.toggle("on", i >= 0);
        newP.classList.toggle("on", i >= 1);
        if (i >= 1) {
          if (dir > 0 && i === 1 && !quick) {
            // 분산 GPU → 중앙 Pool 이동 파티클
            SRV.forEach(([x, y], k) => {
              const f = document.createElement("i");
              f.className = "gp-fly"; f.style.left = x + "px"; f.style.top = y + "px";
              el.appendChild(f); flies.push(f);
              tweens.push(gsap.to(f, { left: POOL[0], top: POOL[1], duration: 0.9, delay: 0.15 + k * 0.12, ease: "power2.inOut", onComplete: () => { f.remove(); } }));
            });
            const st = { v: 0 };
            tweens.push(gsap.to(st, { v: 24, duration: 1.6, delay: 0.4, ease: "power2.out", onUpdate: () => (poolCnt.textContent = Math.round(st.v) + " GPU 통합") }));
          } else poolCnt.textContent = "24 GPU 통합";
        } else poolCnt.textContent = "0 GPU";
        // 시간표 기반 배분 막대
        rows.forEach((s, k) => {
          if (i >= 2) {
            if (dir > 0 && i === 2 && !quick) tweens.push(gsap.fromTo(s, { width: 0 }, { width: BAR[k] + "%", duration: 0.8, delay: k * 0.1, ease: "power2.out" }));
            else gsap.set(s, { width: BAR[k] + "%" });
          } else gsap.set(s, { width: 0 });
        });
        gsap.set(key, { opacity: i >= 2 ? 1 : 0 });
        if (dir > 0 && i === 2 && !quick) gsap.fromTo(key, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, delay: 0.5, ease: "power3.out", clearProps: "transform" });
      },
    };
  })();

  /* ══════════════ CL6 · 학생 진행 현황 관리 한계 (분산 시스템 얽힘) ══════════════ */
  (function () {
    const el = $("#cl-monitor");
    const qs = $$(".mo-qs span", el), sys = $$(".mo-sys span", el);
    const wires = $(".mo-wires", el);
    const dash = $(".mo-dash", el), impacts = $(".mo-impacts", el), conclusion = $(".mo-conclusion", el);
    // 질문 카드 → 확인해야 하는 시스템 (얽힘 라인, 카드 인덱스 매핑)
    const LINK = [[0, 0], [0, 1], [1, 0], [2, 0], [3, 4], [3, 5], [4, 0], [5, 2], [5, 6], [6, 2], [6, 4], [2, 1]];
    let tweens = [], built = false;
    const kill = () => { tweens.forEach((t) => t && t.kill && t.kill()); tweens = []; };

    function center(elm, xVar, yVar) {
      const x = parseFloat(getComputedStyle(elm).getPropertyValue(xVar)) || 0;
      const y = parseFloat(getComputedStyle(elm).getPropertyValue(yVar)) || 0;
      return [x + elm.offsetWidth / 2, y + elm.offsetHeight / 2];
    }
    function buildWires() {
      if (built) return; built = true;
      LINK.forEach(([qi, si]) => {
        const [x1, y1] = center(qs[qi], "--qx", "--qy");
        const [x2, y2] = center(sys[si], "--sx", "--sy");
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1); line.setAttribute("y1", y1);
        line.setAttribute("x2", x2); line.setAttribute("y2", y2);
        wires.appendChild(line);
      });
    }

    S["cl-monitor"] = {
      el, steps: 3,
      enter(s) { buildWires(); this.setStep(s, 1, true); },
      leave() { kill(); },
      setStep(i, dir, instant) {
        const quick = instant || simple();
        kill();
        if (i >= 0) {
          if (dir > 0 && i === 0 && !quick) {
            qs.forEach((q) => q.classList.remove("on"));
            qs.forEach((q, k) => tweens.push(gsap.delayedCall(0.1 + k * 0.12, () => q.classList.add("on"))));
          } else qs.forEach((q) => q.classList.add("on"));
        }
        const sysOn = i >= 1;
        if (sysOn) {
          if (dir > 0 && i === 1 && !quick) {
            sys.forEach((c) => c.classList.remove("on"));
            sys.forEach((c, k) => tweens.push(gsap.delayedCall(0.1 + k * 0.1, () => c.classList.add("on"))));
            tweens.push(gsap.fromTo(wires, { opacity: 0 }, { opacity: 1, duration: 0.9, delay: 0.5 }));
          } else { sys.forEach((c) => c.classList.add("on")); gsap.set(wires, { opacity: 1 }); }
        } else { sys.forEach((c) => c.classList.remove("on")); gsap.set(wires, { opacity: 0 }); }
        dash.classList.toggle("on", i >= 2);
        impacts.classList.toggle("on", i >= 1);
        gsap.set(conclusion, { opacity: i >= 2 ? 1 : 0 });
        if (dir > 0 && i === 2 && !quick) gsap.fromTo(conclusion, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", clearProps: "transform" });
      },
    };
  })();

  /* ══════════════ CL7 · Tstation 해결 구조 및 비교 ══════════════ */
  (function () {
    const el = $("#cl-solution");
    const probs = $$(".sv-prob", el), fns = $$(".sv-fn", el);
    const core = $(".sv-core", el), rows = $$(".sv-tr", el);
    const key = $(".sv-key", el), badge = $(".sv-fn-badge", el);
    let tweens = [], badgeTimer = null;
    const kill = () => { tweens.forEach((t) => t && t.kill && t.kill()); tweens = []; if (badgeTimer) { badgeTimer.kill(); badgeTimer = null; } };

    // 문제 칩 → 해당 해결 기능 강조 (hover·click)
    const setHot = (n) => { probs.forEach((p, k) => p.classList.toggle("hot", k === n)); fns.forEach((f, k) => f.classList.toggle("hot", k === n)); };
    probs.forEach((p, k) => {
      p.addEventListener("mouseenter", () => setHot(k));
      p.addEventListener("mouseleave", () => setHot(-1));
      p.addEventListener("click", (e) => { e.stopPropagation(); setHot(k); });
    });
    // 수업 시작/종료 시뮬레이션 → 기능① 배지
    function classDemo(txt) {
      if (badgeTimer) badgeTimer.kill();
      badge.textContent = txt;
      badge.classList.add("show");
      setHot(0);
      badgeTimer = gsap.delayedCall(3, () => { badge.classList.remove("show"); setHot(-1); });
    }
    $(".sv-class-start", el).addEventListener("click", (e) => { e.stopPropagation(); classDemo("학생 42명에게 GPU 자동 할당"); });
    $(".sv-class-end", el).addEventListener("click", (e) => { e.stopPropagation(); classDemo("GPU 회수 → 연구·야간 학습 재배정"); });

    S["cl-solution"] = {
      el, steps: 3,
      enter(s) { this.setStep(s, 1, true); },
      leave() { kill(); setHot(-1); badge.classList.remove("show"); },
      setStep(i, dir, instant) {
        const quick = instant || simple();
        kill();
        core.classList.toggle("on", i >= 0);
        if (i >= 0) {
          if (dir > 0 && i === 0 && !quick) {
            fns.forEach((f) => f.classList.remove("on"));
            fns.forEach((f, k) => tweens.push(gsap.delayedCall(0.2 + k * 0.14, () => f.classList.add("on"))));
          } else fns.forEach((f) => f.classList.add("on"));
        }
        if (i >= 1) {
          if (dir > 0 && i === 1 && !quick) {
            rows.forEach((r) => r.classList.remove("on"));
            rows.forEach((r, k) => tweens.push(gsap.delayedCall(0.05 + k * 0.09, () => r.classList.add("on"))));
          } else rows.forEach((r) => r.classList.add("on"));
        } else rows.forEach((r) => r.classList.remove("on"));
        gsap.set(key, { opacity: i >= 2 ? 1 : 0 });
        if (dir > 0 && i === 2 && !quick) gsap.fromTo(key, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", clearProps: "transform" });
      },
    };
  })();

  /* ══════════════ CL8 · 도입 효과 및 제안 마무리 ══════════════ */
  (function () {
    const el = $("#cl-effect");
    const cards = $$(".fx-card", el), keys = $$(".fx-keys span", el);
    let tweens = [];
    const kill = () => { tweens.forEach((t) => t && t.kill && t.kill()); tweens = []; };

    S["cl-effect"] = {
      el, steps: 2,
      enter(s) { this.setStep(s, 1, true); },
      leave() { kill(); },
      setStep(i, dir, instant) {
        const quick = instant || simple();
        kill();
        if (i >= 0) {
          if (dir > 0 && i === 0 && !quick) {
            cards.forEach((c) => c.classList.remove("on"));
            cards.forEach((c, k) => tweens.push(gsap.delayedCall(0.12 + k * 0.22, () => c.classList.add("on"))));
          } else cards.forEach((c) => c.classList.add("on"));
        }
        if (i >= 1) {
          if (dir > 0 && i === 1 && !quick) {
            keys.forEach((s) => s.classList.remove("on"));
            keys.forEach((s, k) => tweens.push(gsap.delayedCall(0.1 + k * 0.24, () => s.classList.add("on"))));
          } else keys.forEach((s) => s.classList.add("on"));
        } else keys.forEach((s) => s.classList.remove("on"));
      },
    };
  })();
})();
