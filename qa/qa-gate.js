/* qa-gate.js — env-gate(모바일 안내) 검증: 협소 뷰포트에서 게이트 표시 여부 */
const puppeteer = require("puppeteer-core");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  const file = path.join(ROOT, url === "/" ? "index.html" : url);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.end(fs.readFileSync(file));
});

(async () => {
  await new Promise((r) => server.listen(4174, r));
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    defaultViewport: { width: 800, height: 1000 },
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:4174/index.html", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  const gateShown = await page.evaluate(() => !document.getElementById("env-gate").hidden);
  await page.screenshot({ path: path.join(__dirname, "shots", "gate-800.png") });

  // 창 확대 시 게이트 해제 + 덱 시작 확인
  await page.setViewport({ width: 1600, height: 900 });
  await new Promise((r) => setTimeout(r, 1200));
  const gateAfter = await page.evaluate(() => !document.getElementById("env-gate").hidden);
  const deckStarted = await page.evaluate(() => window.DECK.current >= 0);

  console.log(`GATE @800px: ${gateShown} | GATE @1600px: ${gateAfter} | DECK started: ${deckStarted}`);
  await browser.close();
  server.close();
  process.exit(gateShown && !gateAfter && deckStarted ? 0 : 2);
})().catch((e) => { console.error(e); process.exit(1); });
