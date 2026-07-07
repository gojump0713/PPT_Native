/* scenes.js — S01~S06 씬 컨트롤러
 * Scene API: { el, steps, enter(step), leave(), setStep(i, dir) }
 * - enter: 슬라이드 활성화 시 (렌더 루프 시작)
 * - leave: 이탈 시 (COM-09: 루프·재생 정지)
 * - setStep: 내부 인터랙션 단계 적용 (정/역방향 모두 지원)      */
(function () {
  const SCENES = {};
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const simple = () => window.PERF.simple();
  const lerp = (a, b, t) => a + (b - a) * t;

  /* 배경 이미지 로더 — 일시적 네트워크/SSL 오류 대비 3회 재시도 (캐시 버스터) */
  function loadBg(node, url, onOk, attempt = 0) {
    const img = new Image();
    img.onload = () => {
      node.style.backgroundImage = `url(${img.src})`;
      if (onOk) onOk();
    };
    img.onerror = () => {
      if (attempt < 3) setTimeout(() => loadBg(node, url, onOk, attempt + 1), 1500 * (attempt + 1));
    };
    img.src = url + (attempt ? `?retry=${attempt}` : "");
  }

  /* ══════════════ S01 · Opening / Hero ══════════════ */
  (function () {
    const el = $("#opening");
    const video = $(".s01-video", el);
    const posterDiv = $(".s01-poster", el);
    const copy = $(".s01-copy", el);
    const governing = $(".s01-governing", el);
    const canvas = $(".s01-particles", el);
    let field = null, parallaxRAF = 0, target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    let introPlayed = false;

    // 단어 단위 리빌 준비
    $$("[data-reveal-words]", el).forEach((line) => {
      const words = line.textContent.trim().split(/\s+/);
      line.innerHTML = words
        .map((w) => `<span class="w"><span>${w}</span></span>`)
        .join(" ");
    });
    const wordSpans = $$(".s01-line .w > span", el);

    // 포스터 이미지 존재 시 적용 (없으면 CSS 그라디언트 유지, 실패 시 재시도)
    loadBg(posterDiv, "assets/images/hero-poster.webp", () => el.classList.add("has-poster"));

    function onMouse(e) {
      const r = document.getElementById("stage").getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;   // -1 ~ 1
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
    function parallaxLoop() {
      cur.x = lerp(cur.x, target.x, 0.06);
      cur.y = lerp(cur.y, target.y, 0.06);
      video.style.transform = `translate(calc(-50% + ${cur.x * 10}px), calc(-50% + ${cur.y * 10}px))`;
      copy.style.transform = `translate(${cur.x * 6}px, ${cur.y * 6}px)`;
      if (field) { field.parallax.x = -cur.x * 16; field.parallax.y = -cur.y * 16; }
      parallaxRAF = requestAnimationFrame(parallaxLoop);
    }

    function playIntro() {
      const tl = gsap.timeline();
      tl.fromTo(".s01-media", { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.out" });
      const line1Count = $$(".s01-line", el)[0].querySelectorAll(".w > span").length;
      tl.to(wordSpans.slice(0, line1Count), { y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }, 0.5);
      tl.to(wordSpans.slice(line1Count), { y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }, 0.9);
      tl.add(() => el.classList.add("title-glow"), 2.2);
      return tl;
    }

    SCENES.opening = {
      el,
      steps: 2,
      enter(step) {
        // 영상 재생 시도 → 차단/부재 시 포스터 폴백 (S01-INT-03)
        if (!simple()) {
          video.play().then(() => el.classList.remove("no-video"))
            .catch(() => el.classList.add("no-video"));
          // 파일 부재·자동재생 차단 등 모든 실패 케이스 → 포스터 폴백 (S01-AC-03)
          setTimeout(() => { if (video.readyState < 2) el.classList.add("no-video"); }, 1500);
          if (!field) field = new FX.FloatField(canvas, { count: 70 });
          field.start();
          document.getElementById("stage").addEventListener("mousemove", onMouse);
          parallaxRAF = requestAnimationFrame(parallaxLoop);
        } else {
          el.classList.add("no-video");
        }
        if (!introPlayed && !simple()) { playIntro(); introPlayed = true; }
        else wordSpans.forEach((s) => (s.style.transform = "translateY(0)"));
        this.setStep(step, 1);
      },
      leave() {
        video.pause();                                    // S01-INT-04
        if (field) field.stop();
        cancelAnimationFrame(parallaxRAF);
        document.getElementById("stage").removeEventListener("mousemove", onMouse);
      },
      setStep(i) {
        if (i >= 1) {
          gsap.to(governing, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" });
          gsap.to(".s01-title", { y: -40, scale: 0.92, transformOrigin: "left bottom", duration: 0.9, ease: "power3.inOut" });
        } else {
          gsap.to(governing, { opacity: 0, duration: 0.4 });
          gsap.to(".s01-title", { y: 0, scale: 1, duration: 0.6, ease: "power3.inOut" });
        }
      },
    };
  })();

  /* ══════════════ S02 · Before / After ══════════════ */
  (function () {
    const el = $("#context");
    const stage = $(".s02-stage", el);
    const after = $(".s02-after", el);
    const divider = $(".s02-divider", el);
    const chips = $$(".chip", el);
    const BASE = [88, 35, 35];             // 스텝별 경계선 기본 위치 (%)
    let step = 0, pos = 88, targetPos = 88, tracking = false, raf = 0, hovering = false;

    // 실제 이미지가 있으면 교체 (없으면 그라디언트 플레이스홀더, 실패 시 재시도)
    loadBg($(".s02-before", el), "assets/images/before.webp");
    loadBg(after, "assets/images/after.webp");

    function apply(p) {
      pos = p;
      after.style.clipPath = `inset(0 0 0 ${p}%)`;
      divider.style.left = p + "%";
    }
    function loop() {
      if (Math.abs(pos - targetPos) > 0.05) apply(lerp(pos, targetPos, 0.1)); // S02-INT-01 lerp(0.1)
      raf = requestAnimationFrame(loop);
    }
    stage.addEventListener("mousemove", (e) => {
      if (simple()) return;                               // S02-FBK-01
      hovering = true;
      const r = stage.getBoundingClientRect();
      targetPos = Math.min(94, Math.max(6, ((e.clientX - r.left) / r.width) * 100));
    });
    stage.addEventListener("mouseleave", () => {
      hovering = false;
      gsap.to({ v: pos }, {                               // S02-INT-02: 1.2s 복귀
        v: BASE[step], duration: 1.2, ease: "power2.inOut",
        onUpdate() { if (!hovering) { targetPos = this.targets()[0].v; } },
      });
    });
    // 칩 hover 스포트라이트 (S02-INT-03 단순화: after 영역 밝기 강조)
    chips.forEach((chip) => {
      chip.addEventListener("mouseenter", () => gsap.to(after, { filter: "brightness(1.18)", duration: 0.3 }));
      chip.addEventListener("mouseleave", () => gsap.to(after, { filter: "brightness(1)", duration: 0.3 }));
    });

    SCENES.context = {
      el,
      steps: 3,
      enter(s) {
        raf = requestAnimationFrame(loop);
        this.setStep(s, 1);
      },
      leave() { cancelAnimationFrame(raf); },
      setStep(i, dir) {
        step = i;
        if (!hovering) {
          gsap.to({ v: pos }, {
            v: BASE[i], duration: i === 1 && dir > 0 ? 1.4 : 0.8, ease: "power3.inOut",
            onUpdate() { targetPos = this.targets()[0].v; },
          });
        } else targetPos = BASE[i];
        if (i >= 2) {
          gsap.set(".s02-chips", { visibility: "visible" });
          gsap.to(".s02-chips", { opacity: 1, duration: 0.3 });
          gsap.fromTo(chips, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.1, ease: "back.out(1.6)" });
          gsap.fromTo(".s02-title .hl", { textShadow: "0 0 0 rgba(0,229,255,0)" },
            { textShadow: "0 0 28px rgba(0,229,255,0.45)", duration: 0.8 });
        } else {
          gsap.to(".s02-chips", { opacity: 0, duration: 0.3, onComplete: () => gsap.set(".s02-chips", { visibility: "hidden" }) });
        }
      },
    };
  })();

  /* ══════════════ S03 · 3D 회전목마 ══════════════ */
  (function () {
    const el = $("#voices");
    const carousel = $(".s03-carousel", el);
    const cards = $$(".s03-card", el);
    const conclusion = $(".s03-conclusion", el);
    const RADIUS = 520, STEP_ANGLE = 120;
    // 아바타 이미지 재시도 로드 (CSS url() 실패 대비)
    ["student", "professor", "operator"].forEach((p) =>
      loadBg($(".s03-avatar-" + p, el), `assets/images/persona-${p}.webp`));
    const state = { angle: 0 };
    let autoTimer = null, resumeTimer = null, entered = false, conclusionShown = false;
    let persona = 0; // 전면 페르소나 인덱스 (0 학생, 1 교수, 2 운영자)

    // 저사양·reduced-motion 폴백: 3D 회전 제거, 가로 배치 + 전면 카드 하이라이트 (S03-FBK-01)
    function renderFlat() {
      cards.forEach((card, i) => {
        const active = i === persona;
        card.style.transform = `translateX(${(i - 1) * 600}px) scale(${active ? 1 : 0.85})`;
        card.style.opacity = active ? 1 : 0.45;
        card.style.filter = "none";
        card.style.zIndex = active ? 10 : 1;
        card.classList.toggle("front", active);
      });
    }

    function render() {
      if (simple()) { renderFlat(); return; }
      cards.forEach((card, i) => {
        const a = i * STEP_ANGLE + state.angle;             // 카드의 현재 각도
        const rad = (a * Math.PI) / 180;
        const depth = (Math.cos(rad) + 1) / 2;              // 1=전면, 0=후면
        const scale = lerp(0.72, 1, depth);                 // S03-LAY-03
        const opacity = lerp(0.35, 1, depth);
        const blur = lerp(2, 0, depth);
        // billboard: 카드 개별 배치 + counter-rotate (S03-LAY-04)
        // 선행 translateZ(-R)로 실린더 중심을 z=-R에 두어 전면 카드가 원척도(1:1)로 렌더됨
        card.style.transform =
          `translateZ(${-RADIUS}px) rotateY(${a}deg) translateZ(${RADIUS}px) rotateY(${-a}deg) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.filter = `blur(${blur}px)`;
        card.style.zIndex = Math.round(depth * 10);
        card.classList.toggle("front", depth > 0.85);
      });
    }

    function rotateTo(targetPersona, dur = 1.2) {
      persona = ((targetPersona % 3) + 3) % 3;
      if (simple()) { renderFlat(); return gsap.timeline(); }
      // 최단 방향이 아닌 시계방향 연속성 유지: 목표각 = 현재각에서 가장 가까운 -persona*120 동치각
      let goal = -targetPersona * STEP_ANGLE;
      while (goal > state.angle + 60) goal -= 360;
      while (goal < state.angle - 300) goal += 360;
      return gsap.to(state, { angle: goal, duration: dur, ease: "power2.inOut", onUpdate: render });
    }

    function startAuto() {
      stopAuto();
      if (simple() || conclusionShown) return;
      autoTimer = setInterval(() => rotateTo(persona + 1), 6000 + 1200); // 정착형: 6s 정지 + 1.2s 회전
    }
    function stopAuto() { clearInterval(autoTimer); autoTimer = null; }

    cards.forEach((card, i) => {
      card.addEventListener("mouseenter", () => {           // S03-INT-02
        stopAuto(); clearTimeout(resumeTimer);
        gsap.to(card, { scale: "+=0", duration: 0 });       // no-op guard
        card.style.transition = "box-shadow .3s";
      });
      card.addEventListener("mouseleave", () => {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(startAuto, 1000);
      });
      card.addEventListener("click", () => {                // S03-INT-04
        if (i !== persona && !conclusionShown) { rotateTo(i, 1); startAuto(); }
      });
    });

    function showConclusion(on) {
      conclusionShown = on;
      const mask = conclusion.querySelector(".mask-reveal");
      if (on) {
        stopAuto();
        gsap.to(".s03-carousel-wrap", { scale: 0.62, y: -170, duration: 0.9, ease: "power3.inOut" });
        gsap.set(conclusion, { visibility: "visible" });
        mask.classList.add("on");                           // Mask Reveal
      } else {
        mask.classList.remove("on");
        gsap.set(conclusion, { visibility: "hidden" });
        gsap.to(".s03-carousel-wrap", { scale: 1, y: 0, duration: 0.7, ease: "power3.inOut" });
        startAuto();
      }
    }

    SCENES.voices = {
      el,
      steps: 4, // 학생 → 교수 → 운영자 → 결론
      enter(s) {
        if (!entered) {
          entered = true;
          if (simple()) { renderFlat(); }
          else {
            state.angle = 180;
            render();
            gsap.fromTo(carousel, { scale: 0 }, { scale: 1, duration: 0.9, ease: "power3.out" });
            gsap.to(state, { angle: 0, duration: 1.4, ease: "power3.out", onUpdate: render }); // 반바퀴 펼침
          }
        }
        this.setStep(s, 1);
        startAuto();
      },
      leave() { stopAuto(); clearTimeout(resumeTimer); },
      setStep(i, dir) {
        if (i <= 2) {
          if (conclusionShown) showConclusion(false);
          rotateTo(i, dir < 0 ? 0.9 : 1.2);
          startAuto();
        } else {
          rotateTo(2, 0.6);
          showConclusion(true);                             // S03-INT-05
        }
      },
    };
  })();

  /* ══════════════ S04 · Pain Point 카드 그리드 ══════════════ */
  (function () {
    const el = $("#painpoints");
    const cards = $$(".s04-card", el);
    const tangle = $(".s04-tangle", el);
    const spotlight = $(".s04-spotlight", el);
    let tilt = []; // per-card tilt state

    // SVG 그라디언트 + 얽힘 곡선 4가닥 (아이콘 좌표 연결, S04-SEQ-02)
    const NS = "http://www.w3.org/2000/svg";
    const defs = document.createElementNS(NS, "defs");
    defs.innerHTML =
      `<linearGradient id="s04-grad" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0" stop-color="#ff5c7a"/><stop offset="1" stop-color="#00e5ff"/>
       </linearGradient>`;
    tangle.appendChild(defs);
    // 카드 아이콘 중심 좌표 (레이아웃 상수: left 100 + i*(400+40) + padding 40 + 반지름 44)
    const anchors = cards.map((_, i) => ({ x: 184 + i * 440, y: 432 }));
    const STRANDS = [
      { cards: [0, 2], d: (a) => `M ${a[0].x} ${a[0].y} C ${a[0].x + 300} ${a[0].y + 380}, ${a[2].x - 300} ${a[2].y + 420}, ${a[2].x} ${a[2].y}` },
      { cards: [1, 3], d: (a) => `M ${a[1].x} ${a[1].y} C ${a[1].x + 340} ${a[1].y + 430}, ${a[3].x - 260} ${a[3].y + 360}, ${a[3].x} ${a[3].y}` },
      { cards: [0, 3], d: (a) => `M ${a[0].x} ${a[0].y} C ${a[0].x + 600} ${a[0].y + 520}, ${a[3].x - 600} ${a[3].y + 500}, ${a[3].x} ${a[3].y}` },
      { cards: [1, 2], d: (a) => `M ${a[1].x} ${a[1].y} C ${a[1].x + 200} ${a[1].y + 300}, ${a[2].x - 180} ${a[2].y + 280}, ${a[2].x} ${a[2].y}` },
    ];
    const paths = STRANDS.map((s) => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", s.d(anchors));
      p.dataset.cards = s.cards.join(",");
      tangle.appendChild(p);
      return p;
    });
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });

    // hover: tilt ±6° + 스파크 버스트 (S04-INT-01/02/03)
    cards.forEach((card, idx) => {
      let rx = 0, ry = 0, raf = 0;
      function loop() {
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        raf = requestAnimationFrame(loop);
      }
      card.addEventListener("mouseenter", () => {
        if (simple()) return;
        raf = requestAnimationFrame(loop);
        // 스파크 버스트 1회
        for (let i = 0; i < 8; i++) {
          const sp = document.createElement("i");
          sp.className = "s04-spark";
          card.appendChild(sp);
          gsap.fromTo(sp,
            { x: 180, y: 200, opacity: 1 },
            { x: 180 + (Math.random() - 0.5) * 260, y: 200 + (Math.random() - 0.5) * 280,
              opacity: 0, duration: 0.7 + Math.random() * 0.4, ease: "power2.out",
              onComplete: () => sp.remove() });
        }
        // 얽힘 이후: 연결 가닥 하이라이트 (S04-INT-04)
        if (el.classList.contains("tangled")) {
          tangle.classList.add("dimming");
          paths.forEach((p) => p.classList.toggle("lit", p.dataset.cards.split(",").includes(String(idx))));
        }
      });
      card.addEventListener("mousemove", (e) => {
        if (simple()) return;
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        ry = nx * 12; rx = -ny * 12;                        // 최대 ±6° 상당
        rx = Math.max(-6, Math.min(6, rx)); ry = Math.max(-6, Math.min(6, ry));
      });
      card.addEventListener("mouseleave", () => {
        cancelAnimationFrame(raf);
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power2.out",
          onComplete: () => (card.style.transform = "") });
        rx = ry = 0;
        tangle.classList.remove("dimming");
        paths.forEach((p) => p.classList.remove("lit"));
      });
    });

    // 배경 스포트라이트 (S04-LAY-02)
    el.addEventListener("mousemove", (e) => {
      const r = document.getElementById("stage").getBoundingClientRect();
      spotlight.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
      spotlight.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
    });

    function showCard(i, instant) {
      const card = cards[i];
      gsap.set(card, { visibility: "visible" });
      if (instant) { gsap.set(card, { opacity: 1, y: 0 }); return; }
      gsap.fromTo(card, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
      const strokes = card.querySelectorAll(".s04-icon .draw");
      strokes.forEach((s) => {
        const len = s.getTotalLength ? s.getTotalLength() : 200;
        gsap.fromTo(s, { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 0.9, delay: 0.2, ease: "power2.inOut" });
      });
    }
    function hideCard(i) {
      gsap.to(cards[i], { opacity: 0, y: 40, duration: 0.35, onComplete: () => gsap.set(cards[i], { visibility: "hidden" }) });
    }
    function drawTangle(on) {
      el.classList.toggle("tangled", on);
      paths.forEach((p, i) => {
        const len = p.getTotalLength();
        if (on) gsap.to(p, { strokeDashoffset: 0, duration: 1.6, delay: i * 0.12, ease: "power2.inOut" });
        else gsap.to(p, { strokeDashoffset: len, duration: 0.5 });
      });
    }

    SCENES.painpoints = {
      el,
      steps: 5, // 카드① / ② / ③ / ④ / 얽힘
      enter(s) { this.setStep(s, 1, true); },
      leave() {},
      setStep(i, dir, instantAll) {
        const pair = window.CONFIG.s04PairCards;
        const visibleCount = Math.min(4, pair ? (i + 1) * 2 : i + 1);
        cards.forEach((_, c) => {
          const shouldShow = c < visibleCount;
          const isShown = cards[c].style.visibility === "visible";
          if (shouldShow && !isShown) showCard(c, instantAll || dir < 0);
          else if (!shouldShow && isShown) hideCard(c);
        });
        drawTangle(i >= 4);
      },
    };
  })();

  /* ══════════════ S05 · Convergence ══════════════ */
  (function () {
    const el = $("#solution");
    const nodes = $$(".s05-node", el);
    const center = $(".s05-center", el);
    const minis = $(".s05-minis", el);
    const message = $(".s05-message", el);
    const CX = 960, CY = 560;
    // 산포 좌표 (1920×1080 논리 픽셀, 안전영역 내 불규칙 배치)
    const SCATTER = [
      [270, 320], [1500, 280], [420, 800], [1620, 760], [820, 250],
      [1180, 850], [240, 560], [1680, 500], [700, 900],
    ];
    let floatTweens = [], repelHandler = null, converged = false;

    nodes.forEach((node, i) => {
      const tip = document.createElement("span");
      tip.className = "tip";
      tip.textContent = node.dataset.tip;
      node.appendChild(tip);
      minis.insertAdjacentHTML("beforeend", `<i>${node.textContent.trim().split(" ")[0]}</i>`);
      node.dataset.sx = SCATTER[i][0];
      node.dataset.sy = SCATTER[i][1];
    });

    function placeScatter(instant) {
      nodes.forEach((node, i) => {
        gsap.set(node, { visibility: "visible" });
        gsap.to(node, {
          x: +node.dataset.sx, y: +node.dataset.sy, opacity: 1, scale: 1,
          duration: instant ? 0 : 1.2, ease: "power3.inOut", overwrite: "auto",
        });
      });
      startFloat();
    }
    function startFloat() {
      stopFloat();
      if (simple()) return;
      floatTweens = nodes.map((node, i) =>
        gsap.to(node, {
          y: `+=${10 + (i % 3) * 6}`, duration: 2.2 + (i % 4) * 0.5,
          yoyo: true, repeat: -1, ease: "sine.inOut", delay: i * 0.17,
        })
      );
    }
    function stopFloat() { floatTweens.forEach((t) => t.kill()); floatTweens = []; }

    function converge(dir) {
      stopFloat();
      converged = dir > 0;
      if (dir > 0) {
        nodes.forEach((node, i) => {
          gsap.to(node, {                                    // S05-SEQ-01: 곡선 응집
            duration: 1.8, delay: i * 0.1, ease: "power2.inOut", overwrite: "auto",
            motionPath: undefined,                           // (MorphSVG·MotionPath 유료/플러그인 미사용)
            x: CX, y: CY, scale: 0.25, opacity: 0,
          });
        });
        gsap.delayedCall(1.9, () => {
          if (!converged) return;
          center.classList.add("lit");
          gsap.fromTo(".s05-ring", { scale: 0.92 }, { scale: 1.06, duration: 0.45, yoyo: true, repeat: 1, ease: "power2.out" }); // 펄스 1회
        });
      } else {                                               // S05-INT-04 역재생
        center.classList.remove("lit");
        placeScatter(false);
      }
    }
    function showMessage(on) {
      const mask = message.querySelector(".mask-reveal");
      if (on) {
        gsap.to(".s05-center", { y: -120, scale: 0.8, duration: 0.8, ease: "power3.inOut" });
        gsap.set(message, { visibility: "visible" });
        mask.classList.add("on");
        gsap.to(".s05-sub", { opacity: 1, y: 0, duration: 0.7, delay: 0.5 });
      } else {
        mask.classList.remove("on");
        gsap.set(message, { visibility: "hidden" });
        gsap.set(".s05-sub", { opacity: 0 });
        gsap.to(".s05-center", { y: 0, scale: 1, duration: 0.6, ease: "power3.inOut" });
      }
    }

    // 커서 반발 (S05-INT-03, 스텝① 한정)
    repelHandler = (e) => {
      if (converged || simple()) return;
      const r = document.getElementById("stage").getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 1920;
      const my = ((e.clientY - r.top) / r.height) * 1080;
      nodes.forEach((node) => {
        const nx = +node.dataset.sx, ny = +node.dataset.sy;
        const dx = nx - mx, dy = ny - my;
        const dist = Math.hypot(dx, dy);
        if (dist < 160 && dist > 1) {
          const push = (160 - dist) / 160 * 26;
          gsap.to(node, { x: nx + (dx / dist) * push, y: ny + (dy / dist) * push, duration: 0.4, overwrite: "auto" });
        } else {
          gsap.to(node, { x: nx, y: ny, duration: 0.8, overwrite: "auto" });
        }
      });
    };

    SCENES.solution = {
      el,
      steps: 3, // 분산 → 응집 → 메시지
      enter(s) {
        el.addEventListener("mousemove", repelHandler);
        this.setStep(s, 1, true);
      },
      leave() {
        el.removeEventListener("mousemove", repelHandler);
        stopFloat();
      },
      setStep(i, dir, instant) {
        if (i === 0) { showMessage(false); converged = false; center.classList.remove("lit"); placeScatter(instant); }
        else if (i === 1) {
          showMessage(false);
          if (dir >= 0 || instant) {
            if (instant) {
              nodes.forEach((n) => gsap.set(n, { x: CX, y: CY, opacity: 0, scale: 0.25, visibility: "visible" }));
              converged = true; center.classList.add("lit");
            } else converge(1);
          } else { converged = true; center.classList.add("lit"); }
        } else {
          if (!converged) {
            nodes.forEach((n) => gsap.set(n, { x: CX, y: CY, opacity: 0, scale: 0.25, visibility: "visible" }));
            converged = true; center.classList.add("lit");
          }
          showMessage(true);
        }
      },
    };
  })();

  /* ══════════════ S06 · Architecture diagram-steps ══════════════ */
  (function () {
    const el = $("#architecture");
    const tooltip = $(".s06-tooltip", el);
    const canvas = $(".s06-flow", el);
    const wires = { a: $("#wire-a"), b: $("#wire-b"), c: $("#wire-c"), vdi: $("#wire-vdi"), llm: $("#wire-llm") };
    const AREA_ORDER = ["tracks", "connectors", "modules", "vdi", "llm"];
    const AREA_WIRES = { connectors: ["a", "b", "c"], vdi: ["vdi"], llm: ["llm"] };
    // framework 보드는 connectors 스텝(①→②)에서 함께 점등
    const groups = {};
    AREA_ORDER.forEach((a) => (groups[a] = $$(`[data-area="${a === "connectors" ? "connectors" : a}"]`, el)));
    groups.connectors = groups.connectors.concat($$('[data-area="framework"]', el));

    let flow = null;

    // 와이어 길이 캐시
    Object.values(wires).forEach((w) => {
      const len = w.getTotalLength();
      w.style.strokeDasharray = len;
      w.style.strokeDashoffset = len;
    });

    function drawWires(keys, on, instant) {
      keys.forEach((k) => {
        const w = wires[k], len = w.getTotalLength();
        if (instant) { w.style.strokeDashoffset = on ? 0 : len; return; }
        gsap.to(w, { strokeDashoffset: on ? 0 : len, duration: on ? 1.0 : 0.4, ease: "power2.inOut" });
      });
    }

    // hover 툴팁 (S06-INT-01/03 — 스테이지 좌표 기준, 잘림 방지 클램프)
    $$(".s06-module, .s06-track", el).forEach((node) => {
      node.addEventListener("mouseenter", () => {
        const tip = node.dataset.tip;
        if (!tip) return;
        tooltip.textContent = tip;
        tooltip.hidden = false;
        const stage = document.getElementById("stage");
        const sr = stage.getBoundingClientRect();
        const nr = node.getBoundingClientRect();
        const scale = sr.width / 1920;
        let x = (nr.left - sr.left) / scale + 20;
        let y = (nr.top - sr.top) / scale - 76;
        x = Math.min(x, 1920 - 560); y = Math.max(20, y);
        tooltip.style.left = x + "px";
        tooltip.style.top = y + "px";
      });
      node.addEventListener("mouseleave", () => (tooltip.hidden = true));
    });

    // 트랙 hover 경로 하이라이트 (S06-INT-02, 스텝⑤ 조망 시)
    const tracks = $$(".s06-track", el);
    const modules = $$(".s06-module", el);
    const connectors = $$(".s06-connector", el);
    const PATH_MAP = [
      { conn: 0, mods: [0, 1], extra: [".s06-llm"] },
      { conn: 1, mods: [2, 3], extra: [".s06-vdi"] },
      { conn: 2, mods: [1, 3], extra: [".s06-vdi"] },
    ];
    tracks.forEach((track, i) => {
      track.addEventListener("mouseenter", () => {
        if (!el.classList.contains("overviewing")) return;
        el.classList.add("path-mode");
        const lit = [track, connectors[PATH_MAP[i].conn], $(".s06-framework", el), $(".s06-fw-head", el)]
          .concat(PATH_MAP[i].mods.map((m) => modules[m]))
          .concat(PATH_MAP[i].extra.map((sel) => $(sel, el)));
        lit.forEach((n) => n && n.classList.add("path-lit"));
      });
      track.addEventListener("mouseleave", () => {
        el.classList.remove("path-mode");
        $$(".path-lit", el).forEach((n) => n.classList.remove("path-lit"));
      });
    });

    const board = $(".s06-framework", el);
    function applyStep(i, dir, instant) {
      // 보드(점선 컨테이너)는 부모 opacity가 자식 모듈을 함께 딤시키므로 딤 없이 lit만 적용
      board.classList.toggle("lit", i >= 1);
      if (i < 1) board.classList.remove("lit", "shown");
      AREA_ORDER.forEach((area, idx) => {
        groups[area].forEach((node) => {
          node.classList.remove("lit", "shown");
          if (idx === i) node.classList.add("lit");
          else if (idx < i) node.classList.add("shown");
        });
        if (AREA_WIRES[area]) drawWires(AREA_WIRES[area], idx <= i, instant);
      });
      // 스텝① 트랙 스태거 등장
      if (i === 0 && dir >= 0 && !instant) {
        gsap.fromTo(tracks, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: "power3.out", clearProps: "opacity,transform" });
      }
      // 스텝⑤: 전체 조망 + 흐름 파티클 (S06-SEQ-03)
      if (i >= 4) {
        gsap.delayedCall(instant ? 0 : 0.8, () => {
          el.classList.add("overviewing");
          if (!simple()) {
            if (!flow) flow = new FX.FlowField(canvas, [wires.a, wires.b, wires.c], { perPath: 14 });
            flow.start();
          }
        });
      } else {
        el.classList.remove("overviewing", "path-mode");
        if (flow) flow.stop();
      }
    }

    SCENES.architecture = {
      el,
      steps: 5,
      enter(s) { applyStep(s, 1, s > 0); },
      leave() { if (flow) flow.stop(); tooltip.hidden = true; }, // S06-INT-05
      setStep(i, dir) { applyStep(i, dir, false); },
    };
  })();

  window.SCENES = SCENES;
})();
