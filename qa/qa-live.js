/* qa-live.js — 배포된 GitHub Pages 사이트 렌더링 검증 */
const puppeteer = require("puppeteer-core");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    defaultViewport: { width: 1920, height: 1080 },
    args: ["--autoplay-policy=no-user-gesture-required", "--mute-audio"],
  });
  const page = await browser.newPage();
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("requestfailed", (r) => errs.push(`FAILED ${r.url()} → ${r.failure() && r.failure().errorText}`));

  await page.goto("https://gojump0713.github.io/PPT_Native/", { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3500));

  const state = await page.evaluate(() => ({
    slide: window.DECK.current,
    videoPlaying: !document.querySelector("#opening").classList.contains("no-video"),
  }));
  await page.screenshot({ path: path.join(__dirname, "shots", "live-deploy.png") });
  console.log("LIVE STATE:", JSON.stringify(state), "| ERRORS:", errs.length ? errs.join(" / ") : "0건");
  await browser.close();
  process.exit(errs.length ? 2 : 0);
})().catch((e) => { console.error("LIVE QA FAILED:", e.message); process.exit(1); });
