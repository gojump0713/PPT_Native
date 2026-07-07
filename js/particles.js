/* particles.js — Canvas 2D 파티클 시스템 (부유 액센트 · 흐름 파티클)
 * WebGL 대신 2D 컨텍스트 사용: 6개 씬의 요구 밀도(≤3,000)에서 60fps 충분,
 * file:// 오프라인 실행에서도 모듈 로더 없이 동작 (DECISIONS.md 참조) */
(function () {
  class FloatField {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.count = opts.count || 60;
      this.colors = opts.colors || ["rgba(79,124,255,", "rgba(0,229,255,", "rgba(124,92,255,"];
      this.parallax = { x: 0, y: 0 };
      this.running = false;
      this._seed();
    }
    _seed() {
      const W = this.canvas.width, H = this.canvas.height;
      this.dots = Array.from({ length: this.count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 1 + Math.random() * 2.4,
        a: 0.15 + Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.12 - Math.random() * 0.3,
        c: this.colors[(Math.random() * this.colors.length) | 0],
        tw: Math.random() * Math.PI * 2,
      }));
    }
    start() {
      if (this.running) return;
      this.running = true;
      const loop = () => {
        if (!this.running) return;
        this._draw();
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }
    stop() {
      this.running = false;
      cancelAnimationFrame(this._raf);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    _draw() {
      const { ctx, canvas } = this;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const px = this.parallax.x, py = this.parallax.y;
      for (const d of this.dots) {
        d.x += d.vx; d.y += d.vy; d.tw += 0.02;
        if (d.y < -8) { d.y = H + 8; d.x = Math.random() * W; }
        if (d.x < -8) d.x = W + 8; else if (d.x > W + 8) d.x = -8;
        const alpha = d.a * (0.6 + 0.4 * Math.sin(d.tw));
        ctx.beginPath();
        ctx.arc(d.x + px * (d.r / 3), d.y + py * (d.r / 3), d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.c + alpha.toFixed(3) + ")";
        ctx.fill();
      }
    }
  }

  /* 경로 흐름 파티클 (S06) — SVG path에서 좌표 샘플링 후 도트가 경로를 따라 흐름 */
  class FlowField {
    constructor(canvas, paths, opts = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.perPath = opts.perPath || 10;
      this.speed = opts.speed || 0.0026;
      this.color = opts.color || "0,229,255";
      this.running = false;
      this.setPaths(paths);
    }
    setPaths(paths) {
      this.tracks = paths.map((p) => {
        const len = p.getTotalLength();
        const pts = [];
        const N = Math.max(24, Math.round(len / 14));
        for (let i = 0; i <= N; i++) pts.push(p.getPointAtLength((len * i) / N));
        return {
          pts,
          dots: Array.from({ length: this.perPath }, () => ({
            t: Math.random(),
            v: this.speed * (0.7 + Math.random() * 0.7),
            r: 2 + Math.random() * 2.2,
          })),
        };
      });
    }
    start() {
      if (this.running) return;
      this.running = true;
      const loop = () => {
        if (!this.running) return;
        this._draw();
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }
    stop() {
      this.running = false;
      cancelAnimationFrame(this._raf);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    _draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (const tr of this.tracks) {
        for (const d of tr.dots) {
          d.t += d.v;
          if (d.t > 1) d.t -= 1;
          const idx = d.t * (tr.pts.length - 1);
          const i0 = idx | 0, f = idx - i0;
          const p0 = tr.pts[i0], p1 = tr.pts[Math.min(i0 + 1, tr.pts.length - 1)];
          const x = p0.x + (p1.x - p0.x) * f;
          const y = p0.y + (p1.y - p0.y) * f;
          const fade = Math.min(1, Math.min(d.t, 1 - d.t) * 12);
          ctx.beginPath();
          ctx.arc(x, y, d.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${this.color},${(0.85 * fade).toFixed(3)})`;
          ctx.shadowColor = `rgba(${this.color},0.8)`;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  window.FX = { FloatField, FlowField };
})();
