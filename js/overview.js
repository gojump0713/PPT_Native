/* overview.js — Overview Mode (PRD 5.1) */
(function () {
  const overlay = document.getElementById("overview");
  const grid = overlay.querySelector(".ov-grid");
  let open = false, focus = 0, cards = [];

  function build() {
    grid.innerHTML = "";
    cards = window.CONTENT.map((s, i) => {
      const btn = document.createElement("button");
      btn.className = "ov-card";
      btn.style.setProperty("--ov-art", s.art);
      btn.innerHTML =
        `<span class="ov-hover-meta">#/${s.id}</span>
         <span class="ov-num">${String(i + 1).padStart(2, "0")} / 06</span>
         <span class="ov-sec">${s.section}</span>
         <span class="ov-name">${s.title}</span>`;
      btn.addEventListener("click", () => {                 // O-06
        OVERVIEW.close();
        window.DECK.goTo(i, { step: 0 });
      });
      btn.addEventListener("mouseenter", () => setFocus(i));
      grid.appendChild(btn);
      return btn;
    });
  }

  function setFocus(i) {
    focus = Math.max(0, Math.min(cards.length - 1, i));
    cards.forEach((c, k) => c.classList.toggle("focused", k === focus));
  }

  const OVERVIEW = {
    get isOpen() { return open; },
    toggle() { open ? this.close() : this.open(); },
    open() {
      if (open) return;
      open = true;
      if (!cards.length) build();
      cards.forEach((c, i) => c.classList.toggle("current", i === window.DECK.current)); // O-05
      setFocus(window.DECK.current);
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.add("open"));
      // 등장 모프 연출 (O-12 경량 구현: 카드 스태거 스케일업)
      if (!window.PERF.simple()) {
        gsap.fromTo(cards, { scale: 0.7, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.4)" });
      }
    },
    close() {
      if (!open) return;
      open = false;
      overlay.classList.remove("open");
      setTimeout(() => (overlay.hidden = true), 350);
    },
    key(e) {                                                // O-07
      if (!open) return false;
      const col = 3;
      if (e.key === "ArrowRight") setFocus(focus + 1);
      else if (e.key === "ArrowLeft") setFocus(focus - 1);
      else if (e.key === "ArrowDown") setFocus(focus + col);
      else if (e.key === "ArrowUp") setFocus(focus - col);
      else if (e.key === "Enter") { this.close(); window.DECK.goTo(focus, { step: 0 }); }
      else if (e.key === "Escape" || e.key === "o" || e.key === "O") this.close();
      else return false;
      e.preventDefault();
      return true;
    },
  };

  document.getElementById("toc-btn").addEventListener("click", () => OVERVIEW.toggle()); // O-03
  window.OVERVIEW = OVERVIEW;
})();
