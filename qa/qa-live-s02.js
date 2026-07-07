/* qa-live-s02.js — 배포 사이트 S02 렌더링 상태 진단 */
const puppeteer = require("puppeteer-core");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    defaultViewport: { width: 1920, height: 1080 },
  });
  const page = await browser.newPage();
  const errs = [];
  page.on("requestfailed", (r) => errs.push(`FAILED ${r.url()}`));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

  await page.goto("https://gojump0713.github.io/PPT_Native/#/context", { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(() => localStorage.clear());
  await new Promise((r) => setTimeout(r, 3500));

  const diag = await page.evaluate(() => {
    const before = document.querySelector(".s02-before");
    const after = document.querySelector(".s02-after");
    const cs = getComputedStyle(before);
    return {
      slide: window.DECK.current, step: window.DECK.step,
      beforeBg: before.style.backgroundImage.slice(0, 90),
      afterBg: after.style.backgroundImage.slice(0, 90),
      beforeFilter: cs.filter,
      afterClip: after.style.clipPath,
      dividerLeft: document.querySelector(".s02-divider").style.left,
    };
  });
  console.log(JSON.stringify(diag, null, 2));
  await page.screenshot({ path: path.join(__dirname, "shots", "live-s02.png") });
  console.log("ERRORS:", errs.length ? errs.join(" / ") : "0건");
  await browser.close();
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
