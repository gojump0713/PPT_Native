/* qa-cl6.js — 06 덱(Colab vs Tstation 8장) 전용 프로브: 최종 스텝 상태·요소 검증 + 스냅샷
 * 사용: node qa/qa-cl6.js  (스냅샷은 qa/shots/에 cl6-*.png — gitignore 대상) */
const puppeteer = require("puppeteer-core");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SHOT_DIR = path.join(__dirname, "shots");
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".mp4": "video/mp4", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png" };

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
  let file = path.join(ROOT, url === "/" ? "index.html" : url);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  await new Promise((r) => server.listen(4174, r));
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    args: ["--window-size=1600,900", "--autoplay-policy=no-user-gesture-required", "--mute-audio"],
    defaultViewport: { width: 1600, height: 900 },
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push("[console] " + m.text()); });
  page.on("pageerror", (e) => errors.push("[pageerror] " + e.message));

  await page.goto("http://localhost:4174/index.html#/cl-intro", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.DECK && window.DECK.current >= 0, { timeout: 30000 });
  await page.evaluate(() => localStorage.clear());
  await new Promise((r) => setTimeout(r, 3500));

  const IDS = ["cl-intro", "cl-runtime", "cl-data", "cl-collab", "cl-gpu", "cl-monitor", "cl-solution", "cl-effect"];
  const results = {};

  for (const id of IDS) {
    await page.evaluate((id) => {
      const idx = window.CONTENT.findIndex((s) => s.id === id);
      window.DECK.goTo(idx, { step: window.DECK.totalSteps(idx) - 1 }); // 최종 스텝으로 진입
    }, id);
    await new Promise((r) => setTimeout(r, id === "cl-runtime" ? 9000 : 4500)); // 자동 시연 완료 대기
    results[id] = await page.evaluate((id) => {
      const $ = (s, r) => (r || document).querySelector(s);
      const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
      const el = $("#" + id);
      const vis = (n) => n && getComputedStyle(n).opacity > 0.5;
      // 스테이지 내 요소가 1920×1080을 벗어나는지 (하단 짤림 검사)
      const stage = $("#stage").getBoundingClientRect();
      const scale = stage.width / 1920;
      let overflow = 0;
      $$("*", el).forEach((n) => {
        const r = n.getBoundingClientRect();
        if (r.height > 0 && (r.bottom - stage.top) / scale > 1082) overflow++;
      });
      const out = { active: el.classList.contains("active"), overflow };
      if (id === "cl-intro") { out.cardsOn = $$(".q1-card.on", el).length; out.univOn = $(".q1-univ", el).classList.contains("on"); }
      if (id === "cl-runtime") { out.nodesOn = $$(".rt-node.on", el).length; out.prog = $(".rt-prog em", el).textContent; out.loopOn = $(".rt-loop", el).classList.contains("on"); out.conclusion = vis($(".rt-conclusion", el)); }
      if (id === "cl-data") { out.dots = $$(".da-dot", el).length; out.lines = $$(".da-links line", el).length; out.fails = $$('.da-dot[data-st="fail"]', el).length; out.loadLbl = $(".da-load-lbl", el).textContent; out.conclusion = vis($(".da-conclusion", el)); }
      if (id === "cl-collab") { out.cardsOn = $$(".co-card.on", el).length; out.mergeOn = $(".co-merge", el).classList.contains("on"); out.tstOn = $(".co-tst", el).classList.contains("on"); }
      if (id === "cl-gpu") { out.poolCnt = $(".gp-pool-cnt", el).textContent; out.bars = $$(".gp-row u s", el).filter((s) => parseFloat(s.style.width) > 0).length; out.key = vis($(".gp-key", el)); }
      if (id === "cl-monitor") { out.qsOn = $$(".mo-qs span.on", el).length; out.sysOn = $$(".mo-sys span.on", el).length; out.wires = $$(".mo-wires line", el).length; out.dashOn = $(".mo-dash", el).classList.contains("on"); }
      if (id === "cl-solution") { out.fnsOn = $$(".sv-fn.on", el).length; out.rowsOn = $$(".sv-tr.on", el).length; out.key = vis($(".sv-key", el)); }
      if (id === "cl-effect") { out.cardsOn = $$(".fx-card.on", el).length; out.keysOn = $$(".fx-keys span.on", el).length; out.ctaOn = $(".fx-cta", el).classList.contains("on"); }
      return out;
    }, id);
    await page.screenshot({ path: path.join(SHOT_DIR, `cl6-${id}.png`) });
  }

  // 인터랙션 검증: CL1 카드 클릭 → 상세 이동 / CL8 데모 버튼 → ts001 이동
  await page.evaluate(() => window.DECK.goTo(window.CONTENT.findIndex((s) => s.id === "cl-intro"), { step: 2 }));
  await new Promise((r) => setTimeout(r, 2500));
  await page.click('.q1-card[data-goto="cl-data"]');
  await new Promise((r) => setTimeout(r, 1800));
  results.cardNav = await page.evaluate(() => window.CONTENT[window.DECK.current].id);
  await page.evaluate(() => window.DECK.goTo(window.CONTENT.findIndex((s) => s.id === "cl-effect"), { step: 2 }));
  await new Promise((r) => setTimeout(r, 2000));
  await page.click(".fx-btn-primary");
  await new Promise((r) => setTimeout(r, 1800));
  results.ctaNav = await page.evaluate(() => window.CONTENT[window.DECK.current].id);

  console.log(JSON.stringify(results, null, 1));
  console.log("CONSOLE ERRORS:", errors.length ? "\n" + errors.join("\n") : "0건");
  await browser.close();
  server.close();
  process.exit(errors.length ? 2 : 0);
})().catch((e) => { console.error("QA FAILED:", e); process.exit(1); });
