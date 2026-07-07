/* speaker-notes.js — 발표자 노트 창 (N 키 · 듀얼 모니터 전제, PRD 2.2) */
(function () {
  let win = null;

  function render() {
    if (!win || win.closed) return;
    const i = window.DECK.current;
    const meta = window.CONTENT[i];
    const next = window.CONTENT[i + 1];
    const doc = win.document;
    doc.getElementById("n-cur").textContent = `${i + 1}. ${meta.title}`;
    doc.getElementById("n-sec").textContent = meta.section;
    doc.getElementById("n-step").textContent = `스텝 ${window.DECK.step + 1} / ${window.DECK.totalSteps(i)}`;
    doc.getElementById("n-body").textContent = meta.notes || "(노트 없음)";
    doc.getElementById("n-next").textContent = next ? `다음: ${next.title}` : "마지막 슬라이드";
  }

  const NOTES = {
    open() {
      if (win && !win.closed) { win.focus(); return; }
      win = window.open("", "anc-notes", "width=900,height=640");
      if (!win) return; // 팝업 차단
      win.document.write(`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
<title>발표자 노트 — AI Native Campus</title>
<style>
  body{margin:0;background:#0a0e1c;color:#fff;font-family:'Pretendard','Malgun Gothic',sans-serif;padding:36px;}
  #n-sec{color:#00e5ff;font-size:14px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;}
  #n-cur{font-size:30px;font-weight:800;margin:10px 0 4px;}
  #n-step{color:rgba(255,255,255,.5);font-size:14px;margin-bottom:24px;}
  #n-body{font-size:22px;line-height:1.6;color:rgba(255,255,255,.88);white-space:pre-wrap;
          border-top:1px solid rgba(255,255,255,.12);padding-top:24px;min-height:280px;}
  #n-next{color:#4f7cff;font-size:18px;font-weight:600;margin-top:24px;}
  #n-time{position:fixed;top:28px;right:36px;font-size:34px;font-weight:800;font-variant-numeric:tabular-nums;color:#00e5ff;}
</style></head><body>
  <div id="n-time">00:00</div>
  <div id="n-sec"></div><h1 id="n-cur"></h1><div id="n-step"></div>
  <p id="n-body"></p><div id="n-next"></div>
</body></html>`);
      win.document.close();
      render();
      // 경과 시간 동기화
      const t = setInterval(() => {
        if (!win || win.closed) { clearInterval(t); return; }
        const s = Math.floor((performance.now() - window.DECK.startTime) / 1000);
        win.document.getElementById("n-time").textContent =
          `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
      }, 1000);
    },
    update: render,
  };

  window.NOTES = NOTES;
})();
