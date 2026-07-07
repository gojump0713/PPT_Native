/* scenes2.js — 02 덱 (기술 상세) 씬 컨트롤러 D01~D10
 * Scene API는 scenes.js와 동일: { el, steps, enter(step), leave(), setStep(i, dir) } */
(function () {
  const S = window.SCENES;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const simple = () => window.PERF.simple();

  /* ── 배경 영상 매니저 (VID-01~07: 재시도·포스터 폴백·수명주기) ── */
  function videoBg(section, video, posterSel) {
    const poster = $(posterSel, section);
    // 포스터 로드 (있으면)
    const pimg = new Image();
    pimg.onload = () => (poster.style.backgroundImage = `url(${pimg.src})`);
    pimg.src = `assets/images/${video.dataset.video}-poster.webp`;
    let loaded = false;
    return {
      play() {
        if (simple()) { section.classList.add("no-video"); return; }
        if (!loaded) {
          loaded = true;
          video.src = `assets/videos/${video.dataset.video}-loop.mp4`;
        }
        video.play().then(() => section.classList.remove("no-video")).catch(() => {});
        const retry = (n) => {
          if (video.readyState >= 2) { section.classList.remove("no-video"); return; }
          section.classList.add("no-video");
          if (n < 2) { video.load(); video.play().catch(() => {}); setTimeout(() => retry(n + 1), 4000); }
        };
        setTimeout(() => retry(0), 1800);
      },
      pause() { video.pause(); },                       // currentTime 유지 (VID-04)
      el: video,
    };
  }

  /* ── 챕터 타이틀 팩토리 (CHP-01~05 · D01/D03/D06) ── */
  function chapterScene(id, extra = {}) {
    const el = $("#" + id);
    const video = $(".chv-video", el);
    const bg = videoBg(el, video, ".chv-poster");
    const product = $(".ch-product", el);
    const indexLine = $(".ch-index i", el);
    const governing = $(".ch-governing", el) || $(".ch-kw", el);
    let played = false, parallaxRAF = 0;
    const tgt = { x: 0, y: 0 }, cur = { x: 0, y: 0 };

    // 제품명 문자 단위 분해 (Kinetic Reveal)
    const chars = product.textContent.trim().split("");
    product.innerHTML = chars.map((c) => `<span class="c"><b>${c}</b></span>`).join("");
    const charEls = $$(".c > b", product);

    // hover stagger wave (CHP-03)
    product.addEventListener("mouseenter", () => {
      if (simple()) return;
      gsap.to(charEls, {
        y: -10, duration: 0.28, stagger: 0.035, ease: "power2.out",
        yoyo: true, repeat: 1, overwrite: "auto",
      });
      gsap.fromTo(product, { textShadow: "0 0 0 rgba(0,229,255,0)" },
        { textShadow: "0 0 38px rgba(0,229,255,0.4)", duration: 0.5, yoyo: true, repeat: 1 });
    });

    function onMouse(e) {
      const r = document.getElementById("stage").getBoundingClientRect();
      tgt.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      tgt.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
    function loop() {
      cur.x += (tgt.x - cur.x) * 0.06; cur.y += (tgt.y - cur.y) * 0.06;
      video.style.transform = `translate(calc(-50% + ${cur.x * 10}px), calc(-50% + ${cur.y * 10}px))`;
      parallaxRAF = requestAnimationFrame(loop);
    }

    function intro() {
      const tl = gsap.timeline();
      tl.fromTo(".chv-media", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0, { scope: el });
      tl.to(indexLine, { width: 56, duration: 0.5, ease: "power2.out" }, 0.4);
      tl.fromTo(product, { letterSpacing: "0.22em" }, { letterSpacing: "-0.01em", duration: 1.1, ease: "power3.out" }, 0.7);
      tl.to(charEls, { y: 0, duration: 0.65, stagger: 0.045, ease: "power3.out" }, 0.7);
      tl.to(governing, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 1.6);
      const tags = $$(".ch-tags span", el);
      if (tags.length) {
        tl.to(tags, { opacity: 1, duration: 0.7, stagger: 0.15 }, 1.9);
        tags.forEach((t, i) => gsap.to(t, { y: "+=" + (8 + i * 4), duration: 2.4 + i * 0.4, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2.4 }));
      }
      const kwChips = $$(".ch-kw-chip", el);
      if (kwChips.length) tl.fromTo(kwChips, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: "back.out(1.5)" }, 1.7);
      return tl;
    }
    function endState() {
      charEls.forEach((c) => (c.style.transform = "translateY(0)"));
      product.style.letterSpacing = "-0.01em";
      indexLine.style.width = "56px";
      gsap.set(governing, { opacity: 1 });
      gsap.set($$(".ch-tags span, .ch-kw-chip", el), { opacity: 1, y: 0 });
      gsap.set(".chv-media", { opacity: 1 });
    }

    return {
      el,
      steps: extra.steps || 1,
      enter(step) {
        bg.play();
        document.getElementById("stage").addEventListener("mousemove", onMouse);
        if (!simple()) parallaxRAF = requestAnimationFrame(loop);
        if (!played && !simple()) { intro(); played = true; }
        else endState();
        if (extra.enter) extra.enter.call(this, step);
      },
      leave() {
        bg.pause();
        cancelAnimationFrame(parallaxRAF);
        document.getElementById("stage").removeEventListener("mousemove", onMouse);
        if (extra.leave) extra.leave.call(this);
      },
      setStep(i, dir) { if (extra.setStep) extra.setStep.call(this, i, dir); },
    };
  }

  // 03덱 등 후속 덱에서 재사용 (CHP 공통 패턴)
  window.CHAPTER_SCENE = chapterScene;
  window.VIDEO_BG = videoBg;

  /* ══════ D01 · Dstation ══════ */
  S.dstation = chapterScene("dstation");

  /* ══════ D03 · Estation (+ '9배' 카운트업) ══════ */
  (function () {
    const el = $("#estation");
    const num = $(".e3-num", el);
    S.estation = chapterScene("estation", {
      steps: 2,
      setStep(i, dir) {
        if (i >= 1) {
          el.classList.add("emph");
          const st = { v: 1 };
          gsap.to(st, {                                  // S03-AC-01: 진입 시 1회 재생
            v: 9, duration: 0.9, ease: "power2.out",
            onUpdate: () => (num.textContent = Math.round(st.v)),
          });
          gsap.fromTo(".e3-mult", { scale: 0.8 }, { scale: 1, duration: 0.6, ease: "back.out(2)" });
        } else {
          el.classList.remove("emph");
          num.textContent = "9";
        }
      },
    });
  })();

  /* ══════ D06 · iStation ══════ */
  S.istation = chapterScene("istation");

  /* ══════ D02 · VDI 개념 (diagram-live) ══════ */
  (function () {
    const el = $("#vdi-concept");
    const cloud = $(".v2-cloud", el);
    const mods = $$(".v2-mod", el);
    const chips = $$(".v2-chip", el);
    const bus = $("#v2-bus");
    const liveWire = $("#v2-up");
    const mirror = $(".v2-mirror", el);
    const badge = $(".v2-badge", el);
    const tooltip = $(".v2-tooltip", el);
    const busLen = bus.getTotalLength();
    bus.style.strokeDasharray = busLen;
    let demoDone = false;

    // 스테이지 좌표 (엘리먼트 중심)
    function ctr(node) {
      const sr = document.getElementById("stage").getBoundingClientRect();
      const r = node.getBoundingClientRect();
      const k = 1920 / sr.width;
      return { x: (r.left + r.width / 2 - sr.left) * k, y: (r.top + r.height / 2 - sr.top) * k };
    }

    function pulse(fromNode, toNode, n = 3) {
      if (simple()) {                                     // S02-FBK-01: 라인 하이라이트 대체
        const a = ctr(fromNode), b = ctr(toNode);
        liveWire.setAttribute("d", `M ${a.x} ${a.y} L ${b.x} ${b.y}`);
        gsap.fromTo(liveWire, { opacity: 1 }, { opacity: 0, duration: 1.2 });
        return;
      }
      const a = ctr(fromNode), b = ctr(toNode);
      liveWire.setAttribute("d", `M ${a.x} ${a.y} C ${a.x} ${(a.y + b.y) / 2}, ${b.x} ${(a.y + b.y) / 2}, ${b.x} ${b.y}`);
      gsap.to(liveWire, { opacity: 0.65, duration: 0.25 });
      for (let i = 0; i < n; i++) {
        ["up", "down"].forEach((dirn, k) => {
          const dot = document.createElement("i");
          dot.className = "v2-dot";
          el.appendChild(dot);
          const from = dirn === "up" ? a : b, to = dirn === "up" ? b : a;
          gsap.fromTo(dot, { left: from.x, top: from.y, opacity: 0 },
            { left: to.x, top: to.y, opacity: 1, duration: 0.9, delay: i * 0.3 + k * 0.15, ease: "power1.inOut",
              onComplete: () => dot.remove() });
        });
      }
      gsap.to(liveWire, { opacity: 0, duration: 0.5, delay: n * 0.3 + 1 });
    }

    // 단말 칩 hover → 경로 파티클 + 미러링 (S02-INT-01/02)
    chips.forEach((chip) => {
      chip.addEventListener("mouseenter", () => {
        if (chip.dataset.kind === "device") {
          pulse(chip, mods[0], 2);
          mirror.hidden = false;
          mirror.textContent = chip.textContent.trim().split(" ")[0];
          gsap.fromTo(mirror, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" });
        } else {
          badge.hidden = false;
          gsap.fromTo(badge, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
        }
      });
      chip.addEventListener("mouseleave", () => {
        if (chip.dataset.kind === "device") setTimeout(() => (mirror.hidden = true), 400);
        else gsap.to(badge, { opacity: 0, duration: 0.3, onComplete: () => (badge.hidden = true) });
      });
    });
    // 모듈 hover 툴팁 (S02-INT-03)
    mods.forEach((mod) => {
      mod.addEventListener("mouseenter", () => {
        tooltip.textContent = mod.dataset.tip;
        tooltip.hidden = false;
        const c = ctr(mod);
        tooltip.style.left = Math.min(c.x - 100, 1380) + "px";
        tooltip.style.top = c.y - 170 + "px";
      });
      mod.addEventListener("mouseleave", () => (tooltip.hidden = true));
    });

    S["vdi-concept"] = {
      el,
      steps: 4,
      enter(s) { this.setStep(s, 1, true); },
      leave() { tooltip.hidden = true; },
      setStep(i, dir, instant) {
        el.classList.toggle("final", i >= 3);
        // 스텝① 좌측 텍스트는 상시 (진입 리빌)
        if (dir > 0 && !instant && i === 0) {
          gsap.fromTo($$(".v2-left > *", el), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: "power3.out", clearProps: "all" });
        }
        // 스텝② Cloud Center
        const showCloud = i >= 1;
        gsap.set(cloud, { visibility: showCloud ? "visible" : "hidden" });
        cloud.classList.toggle("lit", showCloud);
        if (showCloud) {
          gsap.to(cloud, { opacity: 1, duration: 0.4 });
          if (dir > 0 && i === 1 && !instant) {
            mods.forEach((m) => gsap.set(m, { visibility: "visible" }));
            gsap.fromTo(mods, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.14, ease: "power3.out" });
          } else gsap.set(mods, { visibility: "visible", opacity: 1, y: 0 });
        } else {
          gsap.set(cloud, { opacity: 0 });
          gsap.set(mods, { visibility: "hidden", opacity: 0 });
        }
        // 스텝③ 칩 + 버스 + 자동 시연 1회
        gsap.set($$(".v2-row-label", el), { opacity: i >= 2 ? 1 : 0 });
        if (i >= 2) {
          chips.forEach((c) => gsap.set(c, { visibility: "visible" }));
          if (dir > 0 && i === 2 && !instant) {
            gsap.fromTo(chips, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: "back.out(1.5)" });
            gsap.to(bus, { strokeDashoffset: 0, duration: 1.0, ease: "power2.inOut" });
            if (!demoDone) { demoDone = true; gsap.delayedCall(1.2, () => pulse(chips[5], mods[0], 2)); } // 노트북→가상PC 1회 (S02-AC-03)
          } else { gsap.set(chips, { opacity: 1, y: 0 }); bus.style.strokeDashoffset = 0; }
        } else {
          gsap.set(chips, { visibility: "hidden", opacity: 0 });
          bus.style.strokeDashoffset = busLen;
        }
        // 스텝④ 펄스
        if (i >= 3 && dir > 0 && !instant) {
          gsap.fromTo(".v2-diagram", { scale: 1 }, { scale: 1.012, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut", transformOrigin: "center" });
        }
      },
    };
  })();

  /* ══════ D04 · GPU Slicing 비교 (compare-race) ══════ */
  (function () {
    const el = $("#gpu-slicing");
    const oldPanel = $(".g4-old", el), newPanel = $(".g4-new", el);
    const slicedGpu = $(".g4-gpu-sliced", el);
    const streamsNew = $(".g4-streams-new", el);
    const oldStream = $(".g4-stream", el);
    const loads = $$(".g4-load", el);
    const hatch = $(".g4-hatch", el);
    const LAYERS = 8;
    const NS = "http://www.w3.org/2000/svg";
    let layers = [], paths = [], raceDone = false;

    // 레이어 8장 + 스트림 경로 생성
    for (let i = 0; i < LAYERS; i++) {
      const d = document.createElement("div");
      d.className = "g4-slayer";
      d.style.setProperty("--i", i);
      d.dataset.layer = i;
      slicedGpu.appendChild(d);
      layers.push(d);
      const p = document.createElementNS(NS, "path");
      const y0 = 300 - i * 12, y1 = 150 + (i % 3) * 130;
      p.setAttribute("d", `M 330 ${y0} C 470 ${y0}, 520 ${y1}, 660 ${y1}`);
      p.dataset.load = i % 3;
      streamsNew.appendChild(p);
      paths.push(p);
    }
    oldStream.style.strokeDasharray = oldStream.getTotalLength();
    oldStream.style.strokeDashoffset = oldStream.getTotalLength();

    // 레이어 hover 매핑 (S04-INT-01)
    layers.forEach((ly, i) => {
      ly.addEventListener("mouseenter", () => {
        ly.classList.add("hot");
        streamsNew.classList.add("mapping");
        paths.forEach((p, k) => p.classList.toggle("lit", k === i));
        loads.forEach((ld, k) => ld.classList.toggle("lit", k === i % 3));
      });
      ly.addEventListener("mouseleave", () => {
        ly.classList.remove("hot");
        streamsNew.classList.remove("mapping");
        paths.forEach((p) => p.classList.remove("lit"));
        loads.forEach((ld) => ld.classList.remove("lit"));
      });
    });
    // 좌측 GPU hover — 유휴 시각화 (S04-INT-02)
    $(".g4-gpu-solid", el).addEventListener("mouseenter", () => { hatch.hidden = false; });
    $(".g4-gpu-solid", el).addEventListener("mouseleave", () => { hatch.hidden = true; });
    // 패널 tilt ±4° (S04-INT-04)
    [oldPanel, newPanel].forEach((panel) => {
      const gpu = $(".g4-gpu", panel);
      panel.addEventListener("mousemove", (e) => {
        if (simple()) return;
        const r = panel.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        gsap.to(gpu, { rotateZ: -42 + nx * 8, duration: 0.4, overwrite: "auto" });
      });
      panel.addEventListener("mouseleave", () => gsap.to(gpu, { rotateZ: -42, duration: 0.6 }));
    });

    function spread(on, instant) {
      layers.forEach((ly, i) => {
        gsap.to(ly, { z: on ? i * 26 : i * 13, duration: instant ? 0 : 0.8, delay: instant ? 0 : i * 0.06, ease: "power3.out" });
      });
      paths.forEach((p, i) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len;
        if (instant) { p.style.strokeDashoffset = on ? 0 : len; return; }
        gsap.to(p, { strokeDashoffset: on ? 0 : len, duration: 0.9, delay: on ? 0.3 + i * 0.05 : 0, ease: "power2.inOut" });
      });
    }
    function race(instant) {
      const lFill = $(".g4-fill-red", el), rFill = $(".g4-fill-mint", el);
      const lPct = $(".g4-old .g4-pct", el), rPct = $(".g4-new .g4-pct", el);
      if (instant) {
        lFill.style.width = "15%"; rFill.style.width = "90%";
        lPct.textContent = "15%"; rPct.textContent = "90%";
        newPanel.classList.add("win");
        return;
      }
      raceDone = true;
      const st = { l: 0, r: 0 };
      gsap.to(st, {
        l: 15, duration: 1.0, ease: "power2.out",
        onUpdate: () => { lFill.style.width = st.l + "%"; lPct.textContent = Math.round(st.l) + "%"; },
      });
      gsap.to(st, {                                       // 추월 연출: 늦게 출발해 크게 추월 (S04-SEQ-01)
        r: 93, duration: 1.15, delay: 0.25, ease: "power2.inOut",
        onUpdate: () => { rFill.style.width = st.r + "%"; rPct.textContent = Math.round(st.r) + "%"; },
        onComplete: () => gsap.to(st, {
          r: 90, duration: 0.35, ease: "power2.out",       // 오버슈트 후 정착 (S04-AC-03)
          onUpdate: () => { rFill.style.width = st.r + "%"; rPct.textContent = Math.round(st.r) + "%"; },
          onComplete: () => newPanel.classList.add("win"),
        }),
      });
    }
    function resetRace() {
      ["red", "mint"].forEach((c) => ($(`.g4-fill-${c}`, el).style.width = "0%"));
      $$(".g4-pct", el).forEach((p) => (p.textContent = "0%"));
      newPanel.classList.remove("win");
    }

    S["gpu-slicing"] = {
      el,
      steps: 4,
      enter(s) { this.setStep(s, 1, true); },
      leave() {},
      setStep(i, dir, instant) {
        const showOld = i >= 0, showNew = i >= 1;
        gsap.set(oldPanel, { visibility: "visible" });
        if (dir > 0 && i === 0 && !instant) {
          gsap.fromTo(oldPanel, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
          gsap.to(oldStream, { strokeDashoffset: 0, duration: 0.8, delay: 0.5 });
        } else { gsap.set(oldPanel, { opacity: 1, y: 0 }); oldStream.style.strokeDashoffset = 0; }
        gsap.set(newPanel, { visibility: showNew ? "visible" : "hidden" });
        if (showNew) {
          if (dir > 0 && i === 1 && !instant) gsap.fromTo(newPanel, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
          else gsap.set(newPanel, { opacity: 1, y: 0 });
        } else gsap.set(newPanel, { opacity: 0 });
        spread(i >= 2, instant || dir < 0 || i < 2);
        const footer = $(".g4-footer", el);
        if (i >= 3) {
          gsap.set(footer, { visibility: "visible" });
          if (dir > 0 && !instant) {
            race(false);
            gsap.fromTo($$(".g4-footer span", el), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, delay: 0.9 });
          } else { race(true); gsap.set($$(".g4-footer span", el), { opacity: 1, y: 0 }); }
          gsap.to(footer, { opacity: 1, duration: 0.3 });
        } else {
          gsap.set(footer, { visibility: "hidden", opacity: 0 });
          resetRace();
        }
      },
    };
  })();

  /* ══════ D05 · DaaS 가치 (value-steps) ══════ */
  (function () {
    const el = $("#daas-value");
    const values = $$(".d5-value", el);
    const table = $(".d5-table", el);
    const rows = $$(".d5-tr", el);
    const right = $(".d5-right", el);

    function counters(v) {
      if (v === 0) {
        const to = $(".d5-to", el), st = { v: 0 };
        gsap.to(st, { v: 90, duration: 1.1, ease: "power2.out", onUpdate: () => (to.textContent = (st.v < 80 ? Math.round(st.v) : "80~" + Math.round(st.v)) + "%") });
      }
      if (v === 2) {
        const fps = $(".d5-fpsnum", el), st = { v: 0 };
        gsap.to(st, { v: 64, duration: 0.9, ease: "power2.out", onUpdate: () => (fps.textContent = Math.round(st.v)) });
      }
    }

    S["daas-value"] = {
      el,
      steps: 5,
      enter(s) { this.setStep(s, 1, true); },
      leave() {},
      setStep(i, dir, instant) {
        values.forEach((v, k) => {
          const show = i >= k;
          gsap.set(v, { visibility: show ? "visible" : "hidden" });
          if (show && dir > 0 && i === k && !instant) {
            gsap.fromTo(v, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
            counters(k);                                  // S05-INT-01: 해당 스텝 진입 시에만
          } else gsap.set(v, { opacity: show ? 1 : 0, y: 0 });
        });
        if (instant && i >= 0) { $(".d5-to", el).textContent = "80~90%"; $(".d5-fpsnum", el).textContent = "64"; }
        // 스텝④ 비교표
        const showTable = i >= 3;
        gsap.set(table, { visibility: showTable ? "visible" : "hidden", opacity: showTable ? 1 : 0 });
        if (showTable && dir > 0 && i === 3 && !instant) {
          gsap.fromTo(rows, { opacity: 0, x: -22 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" });
        } else gsap.set(rows, { opacity: showTable ? 1 : 0, x: 0 });
        // 스텝⑤ 활용 분야
        const showRight = i >= 4;
        gsap.set(right, { visibility: showRight ? "visible" : "hidden" });
        const mask = $(".d5-conclusion .mask-reveal", el);
        if (showRight) {
          gsap.to(right, { opacity: 1, duration: 0.4 });
          if (dir > 0 && !instant) {
            gsap.fromTo($$(".d5-field", el), { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: { each: 0.08, grid: [2, 3], from: "start" }, ease: "back.out(1.5)" });
          }
          gsap.set(".d5-conclusion", { visibility: "visible" });
          mask.classList.add("on");
        } else {
          gsap.set(right, { opacity: 0 });
          gsap.set(".d5-conclusion", { visibility: "hidden" });
          mask.classList.remove("on");
        }
      },
    };
  })();

  /* ══════ D07 · iStation 3대 특징 (flip-cards) ══════ */
  (function () {
    const el = $("#istation-features");
    const cards = $$(".f7-card", el);
    let demoTL = null;

    cards.forEach((card) => {
      card.dataset.locked = "";
      card.addEventListener("mouseenter", () => { if (!card.dataset.locked) card.classList.add("flipped"); });
      card.addEventListener("mouseleave", () => { if (!card.dataset.locked) card.classList.remove("flipped"); });
      card.addEventListener("click", () => {              // S07-INT-03: 클릭 고정 토글 (고정 우선)
        card.dataset.locked = card.dataset.locked ? "" : "1";
        card.classList.toggle("flipped", !!card.dataset.locked);
      });
      // tilt ±5°
      card.addEventListener("mousemove", (e) => {
        if (simple()) return;
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        gsap.to($(".f7-inner", card), { rotateX: -ny * 10 > 5 ? 5 : Math.max(-5, -ny * 10), rotateY: (card.classList.contains("flipped") ? 180 : 0) + Math.max(-5, Math.min(5, nx * 10)), duration: 0.35, overwrite: "auto" });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to($(".f7-inner", card), { rotateX: 0, rotateY: card.classList.contains("flipped") ? 180 : 0, duration: 0.5 });
      });
    });

    function flipDemo() {                                 // S07-INT-02: 일괄 플립 시연
      if (demoTL) demoTL.kill();
      demoTL = gsap.timeline();
      cards.forEach((c, i) => {
        demoTL.add(() => c.classList.add("flipped"), i * 0.2);
        demoTL.add(() => { if (!c.dataset.locked) c.classList.remove("flipped"); }, 2.6 + i * 0.2);
      });
    }

    S["istation-features"] = {
      el,
      steps: 3,
      enter(s) { this.setStep(s, 1, true); },
      leave() { if (demoTL) demoTL.kill(); cards.forEach((c) => { c.dataset.locked = ""; c.classList.remove("flipped"); }); },
      setStep(i, dir, instant) {
        el.classList.toggle("final", i >= 2);
        cards.forEach((c) => gsap.set(c, { visibility: "visible" }));
        if (dir > 0 && i === 0 && !instant) {
          gsap.fromTo(cards, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: "power3.out" });
        } else gsap.set(cards, { opacity: 1, y: 0 });
        if (i >= 1 && dir > 0 && !instant) flipDemo();    // S07-AC-02: 재진입 시 재시연
      },
    };
  })();

  /* ══════ D08 · 지능형 자원 스케줄링 (day-night) ══════ */
  (function () {
    const el = $("#scheduling");
    const video = $(".s8-video", el);
    const bg = videoBg(el, video, ".s8-poster-day");
    const nightPoster = $(".s8-poster-night", el);
    const streams = $(".s8-streams", el);
    const nodesWrap = $(".s8-nodes", el);
    const stateLabel = $(".s8-state-label", el);
    const tooltip = $(".s8-tooltip", el);
    const NS = "http://www.w3.org/2000/svg";
    const SEG = { day: [0.2, 4.6], night: [5.4, 9.7] };   // S08-AST-02: 낮/밤 타임코드
    let night = false, segRAF = 0, switching = false;

    // 야간 포스터
    const np = new Image();
    np.onload = () => (nightPoster.style.backgroundImage = `url(${np.src})`);
    np.src = "assets/images/scheduling-night-poster.webp";

    // 학부생 매트릭스 10×5
    for (let i = 0; i < 50; i++) {
      const n = document.createElement("span");
      n.className = "s8-node";
      n.addEventListener("mouseenter", () => {
        tooltip.textContent = "vGPU 미세 슬라이스 사용 중 — 학부생 #" + (i + 1);
        tooltip.hidden = false;
        tooltip.style.left = "1050px"; tooltip.style.top = "220px";
      });
      n.addEventListener("mouseleave", () => (tooltip.hidden = true));
      nodesWrap.appendChild(n);
    }
    // 스트림: 주간 얇은 20가닥 → 매트릭스 / 야간 굵은 4가닥 → 블록
    const dayPaths = [], nightPaths = [];
    for (let i = 0; i < 20; i++) {
      const p = document.createElementNS(NS, "path");
      const ty = 300 + (i % 5) * 60, tx = 1230 + Math.floor(i / 5) * 140;
      p.setAttribute("d", `M 510 630 C 760 ${620 - i * 8}, 900 ${ty + 20}, ${tx} ${ty}`);
      p.setAttribute("stroke-width", "1.6");
      p.style.opacity = 0.85;
      streams.appendChild(p);
      dayPaths.push(p);
    }
    for (let i = 0; i < 4; i++) {
      const p = document.createElementNS(NS, "path");
      const ty = 830 + i * 22;
      p.setAttribute("d", `M 510 650 C 800 ${700 + i * 20}, 1050 ${ty - 20}, 1420 ${ty}`);
      p.setAttribute("stroke-width", "9");
      p.style.opacity = 0;
      streams.appendChild(p);
      nightPaths.push(p);
    }

    // GPU 코어 hover (S08-INT-05)
    $(".s8-core", el).addEventListener("mouseenter", (e) => {
      tooltip.textContent = "Slurm / Kubernetes — AI 토큰 기반 관리 · 자동 스케줄링";
      tooltip.hidden = false;
      tooltip.style.left = "380px"; tooltip.style.top = "480px";
    });
    $(".s8-core", el).addEventListener("mouseleave", () => (tooltip.hidden = true));
    $(".s8-block", el).addEventListener("mouseenter", () => {
      tooltip.textContent = "대형 vGPU 구성 — 노드당 대규모 할당량 집중 배정";
      tooltip.hidden = false;
      tooltip.style.left = "1150px"; tooltip.style.top = "760px";
    });
    $(".s8-block", el).addEventListener("mouseleave", () => (tooltip.hidden = true));

    // 영상 구간 루프 (day/night 세그먼트 내 반복)
    function segLoop() {
      const seg = night ? SEG.night : SEG.day;
      if (video.readyState >= 2 && !switching) {
        if (video.currentTime < seg[0] - 0.05 || video.currentTime > seg[1]) video.currentTime = seg[0];
      }
      segRAF = requestAnimationFrame(segLoop);
    }

    function setNight(on, instant) {
      if (switching && !instant) return;                  // S08-AC-03: 전환 중 잠금
      switching = true;
      night = on;
      el.classList.toggle("night", on);
      stateLabel.querySelector("b").textContent = on ? "야간" : "주간";
      stateLabel.querySelector("span").textContent = on ? "대규모 연구 집중 시간대" : "경량 실습 집중 시간대";
      // 태양↔달 호 교대 (S08-CNT-03)
      if (!instant && !simple()) {
        gsap.fromTo(on ? $(".s8-moon", el) : $(".s8-sun", el),
          { y: 40, x: 30, rotate: 40 }, { y: 0, x: 0, rotate: 0, duration: 1.0, ease: "power2.out" });
      }
      // 영상 구간 점프 (크로스페이드는 오버레이가 담당)
      if (video.readyState >= 2) video.currentTime = on ? SEG.night[0] : SEG.day[0];
      if (el.classList.contains("no-video")) {
        $(".s8-poster-day", el).style.opacity = on ? 0 : 1;
        nightPoster.style.opacity = on ? 1 : 0;
      }
      // 스트림 재구성 모핑
      const D = instant || simple() ? 0.01 : 1.1;
      dayPaths.forEach((p, i) => gsap.to(p, { opacity: on ? 0 : 0.85, duration: D, delay: instant ? 0 : i * 0.02 }));
      nightPaths.forEach((p, i) => gsap.to(p, { opacity: on ? 0.95 : 0, duration: D, delay: instant ? 0 : 0.3 + i * 0.08 }));
      gsap.delayedCall(instant ? 0 : 1.3, () => (switching = false));
    }

    S.scheduling = {
      el,
      steps: 3,
      enter(s) {
        bg.play();
        segRAF = requestAnimationFrame(segLoop);
        this.setStep(s, 1, true);
      },
      leave() { bg.pause(); cancelAnimationFrame(segRAF); tooltip.hidden = true; },
      setStep(i, dir, instant) {
        setNight(i >= 1, instant);
        const mask = $(".s8-conclusion .mask-reveal", el);
        if (i >= 2) { gsap.set(".s8-conclusion", { visibility: "visible" }); mask.classList.add("on"); }
        else { gsap.set(".s8-conclusion", { visibility: "hidden" }); mask.classList.remove("on"); }
      },
    };
  })();

  /* ══════ D09 · 제주대 채팅 데모 (chat-demo) ══════ */
  (function () {
    const el = $("#jeju-case");
    const typeEl = $(".j9-type", el);
    const msgs = $(".j9-msgs", el);
    const inputText = $(".j9-input-text", el);
    const inputCaret = $(".j9-caret-input", el);
    const rbacBadge = $(".j9-badge-rbac", el);
    const nodes = $$(".j9-node", el);
    const wires = $(".j9-wires", el);
    const NS = "http://www.w3.org/2000/svg";
    const GREETING = "안녕하세요, 무엇을 도와드릴까요?";
    const DEMO_Q = "교원 연구년 신청 절차를 알려줘";
    const DEMO_A = "교원 연구년은 매년 10월 학과장 추천을 거쳐 교무처에 신청합니다. 신청서(HWP 양식)와 연구계획서를 제출하시면 됩니다.";
    let timers = [], demoPlayed = false, greetPlayed = false;

    // 노드 연결선
    const wirePaths = nodes.map((_, i) => {
      const p = document.createElementNS(NS, "path");
      const y = 300 + i * 150;
      p.setAttribute("d", `M 1020 ${420 + i * 40} C 1090 ${420 + i * 40}, 1100 ${y}, 1170 ${y}`);
      wires.appendChild(p);
      return p;
    });

    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function typeInto(node, text, cps, done) {
      let k = 0;
      const t = setInterval(() => {
        node.textContent = text.slice(0, ++k);
        if (k >= text.length) { clearInterval(t); if (done) done(); }
      }, 1000 / cps);
      timers.push(t);
    }

    function playGreeting(instant) {
      typeEl.textContent = "";
      if (instant || simple()) { typeEl.textContent = GREETING; return; }
      typeInto(typeEl, GREETING, 22);
    }

    function playDemo(instant) {
      // 기존 데모 제거
      $$(".j9-bubble, .j9-rag", el).forEach((b) => b.remove());
      inputText.textContent = ""; inputCaret.hidden = true;
      clearTimers();
      const addBubble = (cls, text) => {
        const b = document.createElement("div");
        b.className = "j9-bubble " + cls;
        b.textContent = text;
        msgs.appendChild(b);
        return b;
      };
      if (instant || simple()) {                          // S09-AC-01: 스킵 시 즉시 완료 상태
        addBubble("j9-q", DEMO_Q);
        const a = addBubble("j9-a", DEMO_A);
        a.insertAdjacentHTML("beforeend", '<span class="j9-src">📄 제주대 내부 행정 문서 기반 · 직원 권한 답변</span>');
        rbacBadge.hidden = false;
        return;
      }
      inputCaret.hidden = false;
      typeInto(inputText, DEMO_Q, 18, () => {
        timers.push(setTimeout(() => {
          inputText.textContent = ""; inputCaret.hidden = true;
          gsap.fromTo(addBubble("j9-q", DEMO_Q), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
          const rag = document.createElement("div");
          rag.className = "j9-rag";
          rag.textContent = "Agentic RAG 검색 중…";
          msgs.appendChild(rag);
          timers.push(setTimeout(() => {
            rag.remove();
            const a = addBubble("j9-a", "");
            typeInto(a, DEMO_A, 40, () => {
              a.insertAdjacentHTML("beforeend", '<span class="j9-src">📄 제주대 내부 행정 문서 기반 · 직원 권한 답변</span>');
              rbacBadge.hidden = false;
            });
          }, 1100));
        }, 400));
      });
    }

    // 노드 hover → 채팅 연결 하이라이트 (S09-INT-01)
    const HL = [
      () => gsap.fromTo(".j9-chat", { boxShadow: "0 0 0 rgba(180,79,255,0)" }, { boxShadow: "0 0 34px rgba(180,79,255,0.45)", duration: 0.4, scope: el }),
      () => rbacBadge.classList.add("hot"),
      () => { const r = $(".j9-a .j9-src", el); if (r) gsap.fromTo(r, { color: "rgba(180,79,255,1)" }, { color: "rgba(255,255,255,0.38)", duration: 1.6 }); },
      () => { const a = $(".j9-a", el); if (a) gsap.fromTo(a, { borderColor: "rgba(180,79,255,0.9)" }, { borderColor: "rgba(255,255,255,0.14)", duration: 1.6 }); },
    ];
    nodes.forEach((n, i) => {
      n.addEventListener("mouseenter", () => HL[i]());
      n.addEventListener("mouseleave", () => rbacBadge.classList.remove("hot"));
    });

    S["jeju-case"] = {
      el,
      steps: 4,
      enter(s) { this.setStep(s, 1, true); },
      leave() { clearTimers(); },
      setStep(i, dir, instant) {
        el.classList.toggle("final", i >= 3);
        if (i === 0 && dir > 0 && !instant && !greetPlayed) { greetPlayed = true; playGreeting(false); }
        else if (instant || i > 0) playGreeting(true);
        if (i >= 1) {
          if (dir > 0 && i === 1 && !instant) playDemo(false);
          else playDemo(true);
        } else {
          $$(".j9-bubble, .j9-rag", el).forEach((b) => b.remove());
          rbacBadge.hidden = true;
          inputText.textContent = "";
        }
        // 스텝③ 노드 연결
        nodes.forEach((n, k) => {
          const show = i >= 2;
          gsap.set(n, { visibility: show ? "visible" : "hidden" });
          if (show && dir > 0 && i === 2 && !instant) {
            gsap.fromTo(n, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, delay: k * 0.18, ease: "power3.out" });
          } else gsap.set(n, { opacity: show ? 1 : 0, x: 0 });
        });
        wirePaths.forEach((p, k) => {
          const len = p.getTotalLength();
          p.style.strokeDasharray = len;
          if (i >= 2) {
            if (dir > 0 && i === 2 && !instant) gsap.to(p, { strokeDashoffset: 0, duration: 0.7, delay: k * 0.18 });
            else p.style.strokeDashoffset = 0;
          } else p.style.strokeDashoffset = len;
        });
      },
    };
  })();

  /* ══════ D10 · 클로징 (flow-finale) ══════ */
  (function () {
    const el = $("#closing");
    const canvas = $(".c10-particles", el);
    const stages = { old: $(".c10-old", el), own: $(".c10-own", el), gov: $(".c10-gov", el) };
    const arrows = $$(".c10-arrow", el);
    const rackLeds = $$(".c10-rack i", el);
    let field = null, orbitPlayed = false;

    // GPU 랙 hover — LED 시퀀스 + 배지 궤도 (S10-INT-01)
    $(".c10-rack", el).addEventListener("mouseenter", () => {
      rackLeds.forEach((led, i) => {
        setTimeout(() => led.classList.add("led"), i * 130);
        setTimeout(() => led.classList.remove("led"), 1400 + i * 130);
      });
      if (!simple()) {
        gsap.fromTo($$(".c10-badges span", el), { y: 0 }, { y: -10, duration: 0.35, stagger: 0.1, yoyo: true, repeat: 1, ease: "power2.out" });
      }
    });

    function convergeParticles() {                        // S10-CNT-03: 응집 → 메시지 (수미상관)
      if (simple() || !window.FX) return;
      if (!field) field = new FX.FloatField(canvas, { count: 46 });
      field.start();
      gsap.delayedCall(0.8, () => {
        const ctx = canvas.getContext("2d");
        field.dots.forEach((d, i) => {
          gsap.to(d, { x: 660 + Math.random() * 600, y: 960 + Math.random() * 40, duration: 1.2 + Math.random() * 0.5, ease: "power2.inOut" });
          gsap.to(d, { a: 0, delay: 1.6, duration: 0.5 });
        });
        gsap.delayedCall(2.4, () => { if (field) field.stop(); });
      });
    }

    S.closing = {
      el,
      steps: 4,
      enter(s) { this.setStep(s, 1, true); },
      leave() { if (field) field.stop(); el.classList.remove("idle"); },
      setStep(i, dir, instant) {
        const seq = [
          [],                    // 0: 헤드라인만
          ["old"],               // 1
          ["old", "own"],        // 2
          ["old", "own", "gov"], // 3
        ][i] || [];
        Object.entries(stages).forEach(([k, node]) => {
          const show = seq.includes(k);
          gsap.set(node, { visibility: show ? "visible" : "hidden" });
          if (show && dir > 0 && seq[seq.length - 1] === k && !instant) {
            gsap.fromTo(node, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" });
          } else gsap.set(node, { opacity: show ? 1 : 0, y: 0 });
        });
        arrows.forEach((a, k) => {
          const show = i >= k + 2;
          gsap.set(a, { visibility: show ? "visible" : "hidden", opacity: show ? 1 : 0 });
        });
        const mask = $(".c10-final .mask-reveal", el);
        if (i >= 3) {
          gsap.set(".c10-final", { visibility: "visible" });
          if (dir > 0 && !instant) { convergeParticles(); gsap.delayedCall(1.4, () => mask.classList.add("on")); }
          else mask.classList.add("on");
          gsap.delayedCall(2.2, () => el.classList.add("idle"));  // S10-AC-03: 고급 대기 상태
        } else {
          gsap.set(".c10-final", { visibility: "hidden" });
          mask.classList.remove("on");
          el.classList.remove("idle");
        }
      },
    };
  })();
})();
