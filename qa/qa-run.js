/* qa-run.js — 셀프 QA: 전 슬라이드·전 스텝 구동, 스크린샷, 콘솔 에러 수집
 * 사용: node qa/qa-run.js [width height]                                    */
const puppeteer = require("puppeteer-core");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SHOT_DIR = path.join(__dirname, "shots");
const W = parseInt(process.argv[2] || "1920", 10);
const H = parseInt(process.argv[3] || "1080", 10);

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".mp4": "video/mp4", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png" };

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
  let file = path.join(ROOT, url === "/" ? "index.html" : url);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  await new Promise((r) => server.listen(4173, r));

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    args: [`--window-size=${W},${H}`, "--autoplay-policy=no-user-gesture-required", "--mute-audio"],
    defaultViewport: { width: W, height: H },
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push("[console] " + m.text()); });
  page.on("pageerror", (e) => errors.push("[pageerror] " + e.message));

  await page.goto("http://localhost:4173/index.html#/opening", { waitUntil: "networkidle0" });
  await page.evaluate(() => localStorage.clear());
  await new Promise((r) => setTimeout(r, 3200)); // 인트로 + FPS 프로브

  const plan = await page.evaluate(() =>
    window.CONTENT.map((s, i) => ({ id: s.id, steps: window.DECK.totalSteps(i) })));

  let shot = 0;
  const snap = async (name) => {
    await page.screenshot({ path: path.join(SHOT_DIR, `${String(shot++).padStart(2, "0")}-${name}-${W}x${H}.png`) });
  };

  // 자동 시퀀스 슬라이드는 최종 상태까지 대기 (키: "id" 진입 시, "id:스텝" 스텝 진행 시)
  const WAITS = { opening: 4500, painpoints: 6500, "architecture:1": 9500 };
  for (let i = 0; i < plan.length; i++) {
    for (let st = 0; st < plan[i].steps; st++) {
      if (!(i === 0 && st === 0)) {
        await page.keyboard.press("ArrowRight");
        const w = st === 0 ? (WAITS[plan[i].id] || 2300) : (WAITS[`${plan[i].id}:${st}`] || 2300);
        await new Promise((r) => setTimeout(r, w));
      } else {
        await new Promise((r) => setTimeout(r, WAITS[plan[i].id] ? WAITS[plan[i].id] - 3200 : 0));
      }
      await snap(`${plan[i].id}-s${st}`);
    }
  }

  // Overview
  await page.keyboard.press("o");
  await new Promise((r) => setTimeout(r, 900));
  await snap("overview");
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 500));

  // 역방향 왕복 (S05-AC-02 등 상태 확인)
  await page.keyboard.press("ArrowLeft");
  await new Promise((r) => setTimeout(r, 1500));
  await snap("back-once");

  // 해시 딥링크
  await page.evaluate(() => (location.hash = "#/solution"));
  await new Promise((r) => setTimeout(r, 1800));
  await snap("deeplink-solution");

  const state = await page.evaluate(() => ({
    current: window.DECK.current, step: window.DECK.step,
    lowPower: window.PERF.lowPower, webgl: window.PERF.webgl,
  }));

  console.log("FINAL STATE:", JSON.stringify(state));
  console.log("CONSOLE ERRORS:", errors.length ? "\n" + errors.join("\n") : "0건");
  await browser.close();
  server.close();
  process.exit(errors.length ? 2 : 0);
})().catch((e) => { console.error("QA FAILED:", e); process.exit(1); });
