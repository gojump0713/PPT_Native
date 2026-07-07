/* make-posters.js — 영상에서 포스터 프레임 추출 (요소 스크린샷 방식) */
const puppeteer = require("puppeteer-core");
const http = require("http");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const JOBS = [
  { video: "dstation-loop.mp4", t: 3.0, out: "dstation-poster.webp" },
  { video: "estation-loop.mp4", t: 3.0, out: "estation-poster.webp" },
  { video: "istation-loop.mp4", t: 3.0, out: "istation-poster.webp" },
  { video: "scheduling-loop.mp4", t: 3.0, out: "scheduling-poster.webp" },
  { video: "scheduling-loop.mp4", t: 9.0, out: "scheduling-night-poster.webp" },
];

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<html><body style='margin:0;background:#000'><video id=v muted style='width:1920px;height:1080px;object-fit:cover;display:block'></video></body></html>");
    return;
  }
  const file = path.join(ROOT, urlPath);
  if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  const size = fs.statSync(file).size;
  const range = req.headers.range;
  if (range) {
    const m = /bytes=(\d+)-(\d*)/.exec(range);
    const start = +m[1], end = m[2] ? +m[2] : size - 1;
    res.writeHead(206, { "Content-Range": `bytes ${start}-${end}/${size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1, "Content-Type": "video/mp4" });
    fs.createReadStream(file, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { "Content-Type": "video/mp4", "Content-Length": size, "Accept-Ranges": "bytes" });
    fs.createReadStream(file).pipe(res);
  }
});

(async () => {
  await new Promise((r) => server.listen(4175, r));
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    defaultViewport: { width: 1920, height: 1080 },
    args: ["--autoplay-policy=no-user-gesture-required", "--mute-audio"],
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:4175/");

  for (const job of JOBS) {
    await page.evaluate(async (src, t) => {
      const v = document.getElementById("v");
      if (v.dataset.src !== src) {
        v.src = src; v.dataset.src = src;
        await new Promise((res, rej) => { v.onloadeddata = res; setTimeout(rej, 15000); });
      }
      v.currentTime = t;
      await new Promise((res) => (v.onseeked = res));
      await new Promise((r) => setTimeout(r, 400)); // 컴포지터 프레임 안정화
    }, `/assets/videos/${job.video}`, job.t);
    const el = await page.$("#v");
    const png = await el.screenshot({ type: "png" });
    const out = path.join(ROOT, "assets", "images", job.out);
    await sharp(png).webp({ quality: 80 }).toFile(out);
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(job.out, kb + "KB");
  }
  await browser.close();
  server.close();
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
