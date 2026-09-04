"use client";
/* =====================================================================
   SeaLife — the footer's reef. Reference: Amit's composition
   (רפרנס2.jpg — a 2880x1620 artboard exported at 2x); the depth staging
   borrows from Anthropic's Fable 5.1 launch hero: things nearer than the
   plane of focus are soft, things further are hazed.

   Depth order, back to front:
     sea canvas (FooterWater, z0)
     .reef  z1  — far coral (mid floor) · near coral (behind the title)
     .footer-content z2 — title + contact links
     .reef-fore z3 — fish (upper band only, never over text) · two
                      swaying plants, out of focus in the foreground ·
                      bubbles the pointer leaves behind

   Cost discipline:
   · nothing here loads until the footer is a viewport away
     (IntersectionObserver, rootMargin 100%), and nothing animates
     unless the footer is on screen
   · all blur / haze / tint is BAKED into the assets
     (scripts/reef/) — zero CSS or SVG filters at runtime
   · the silhouettes travel as one SVG (27KB gzipped) that carries
     its own feGaussianBlur; the browser rasterises and blurs it once
     into a sprite canvas on load, so the site ships no bitmap for them
   · one 2D canvas, one rAF: ~80 drawImage calls a frame
   ===================================================================== */
import { useEffect, useRef, useState } from "react";

const DIR = "/media/reef/";
const ATLAS_SRC = DIR + "reef-life.svg";
/* atlas cells: x, y, w, h  (from scripts/reef/make_reef_svg.py) */
const ATLAS = {
  algae:  [0,   0,    408, 1048],
  branch: [408, 0,    596, 1030],
  fish1:  [0,   1048, 148, 60],
  fish2:  [156, 1048, 108, 103],
} as const;

/* the footer shader's own swells (0.55 / 0.42 / 0.31 rad/s) at the title's
   speed (UW.speed 1.75): the plants ride the same water as the letters */
const W1 = 0.55 * 1.75, W2 = 0.42 * 1.75, W3 = 0.31 * 1.75;

type Plant = {
  cell: keyof typeof ATLAS;
  h: number;                 /* height, fraction of footer height */
  left?: number; right?: number; bottom: number;   /* fractions of W / H */
  op: number; amp: number; ph: number;
};
type Fish = {
  cell: keyof typeof ATLAS;
  n: number; size: number;   /* sprite width, fraction of W */
  x: number; y: number;      /* base, fractions */
  ax: number; tx: number;    /* drift amplitude (fraction of W) and period (s) */
  ay: number; ty: number;
  ph: number; op: number;
  off: [number, number][];   /* offsets inside the shoal, in sprite widths */
};
type Layout = { plants: Plant[]; fish: Fish[]; narrow: boolean };

/* Positions read off the reference artboard as fractions, so they scale
   with the footer. The narrow layout keeps the far coral, the algae and both
   shoals; the branch and the near coral would sit on the contact links. */
function layout(w: number, h: number): Layout {
  const narrow = w < 768 || w < h;
  if (narrow) {
    return {
      narrow,
      plants: [
        { cell: "algae", h: 0.42, left: -0.03, bottom: -0.02, op: 0.82, amp: 0.045, ph: 0 },
      ],
      fish: [
        { cell: "fish2", n: 2, size: 0.085, x: 0.26, y: 0.44, ax: 0.10, tx: 96, ay: 0.02, ty: 61, ph: 0.4, op: 0.62,
          off: [[0, 0], [0.7, -0.9]] },
        { cell: "fish1", n: 4, size: 0.065, x: 0.64, y: 0.35, ax: -0.13, tx: 118, ay: 0.018, ty: 83, ph: 2.1, op: 0.58,
          off: [[0, 0.8], [1.1, 0], [2.2, 0.35], [1.4, 1.5]] },
      ],
    };
  }
  return {
    narrow,
    plants: [
      /* algae: left edge, fore, out of focus */
      { cell: "algae",  h: 0.55, left: -0.015, bottom: -0.02, op: 0.86, amp: 0.05, ph: 0 },
      /* branch: rises from below the frame over the title's foot */
      { cell: "branch", h: 0.58, right: 0.02, bottom: -0.12, op: 0.8, amp: 0.035, ph: 2.4 },
    ],
    fish: [
      { cell: "fish2", n: 2, size: 0.045, x: 0.15, y: 0.40, ax: 0.05, tx: 118, ay: 0.025, ty: 73, ph: 0.4, op: 0.62,
        off: [[0, 0], [0.65, -0.85]] },
      { cell: "fish1", n: 5, size: 0.036, x: 0.70, y: 0.43, ax: -0.04, tx: 135, ay: 0.02, ty: 90, ph: 2.1, op: 0.58,
        off: [[0, 0.9], [1.0, 0], [2.2, 0.25], [0.5, 1.7], [1.9, 1.4]] },
    ],
  };
}

type Bubble = { x: number; y: number; r: number; rise: number; life: number; t0: number; ph: number };

export default function SeaLife() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [armed, setArmed] = useState(false);   /* assets may load */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = (canvas.closest("footer") as HTMLElement) || canvas.parentElement!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---- 1 · arm a viewport early: load, decode, prepare; don't draw yet ---- */
    let sprite: HTMLCanvasElement | null = null;
    let disposed = false;
    const arm = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting) return;
        arm.disconnect();
        setArmed(true);
        const img = new Image();
        img.decoding = "async";
        img.src = ATLAS_SRC;
        img.decode().catch(() => undefined).then(() => {
          if (disposed || !img.naturalWidth) return;
          /* rasterise once (the SVG blurs itself); slicing a canvas is far
             cheaper per frame than re-decoding an SVG image */
          const c = document.createElement("canvas");
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          c.getContext("2d")!.drawImage(img, 0, 0);
          sprite = c;
          if (reduced) drawStatic();
        });
      },
      { rootMargin: "100% 0px" }
    );
    arm.observe(host);

    /* ---- 2 · geometry ---- */
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, dpr = 1;
    let lay: Layout = layout(1, 1);
    const fit = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      if (W !== w || H !== h) {
        W = w; H = h;
        lay = layout(w, h);
        /* everything here is soft: 1.5 is plenty, 1.25 on phones */
        dpr = Math.min(window.devicePixelRatio || 1, lay.narrow ? 1.25 : 1.5);
        canvas.width = (w * dpr) | 0; canvas.height = (h * dpr) | 0;
      }
    };
    fit();
    const ro = new ResizeObserver(() => { fit(); if (reduced) drawStatic(); });
    ro.observe(host);

    /* ---- 3 · the plants: bent by the water, kicked by the pointer ---- */
    /* per plant: a damped spring for the pointer's kick (like the branch
       dipping under a landing bird in the Fable hero: immediate, then a
       fading ring) */
    const kick = [0, 1, 2, 3].map(() => ({ x: 0, v: 0 }));   /* sized for any layout, not the first one */
    const K = Math.pow((2 * Math.PI) / 1.7, 2), C = 2 * 0.17 * Math.sqrt(K);
    const plantBox = (p: Plant) => {
      const [, , cw, ch] = ATLAS[p.cell];
      const ph = p.h * H, pw = ph * (cw / ch);
      const x = p.left !== undefined ? p.left * W : W - p.right! * W - pw;
      const y = H - p.bottom * H - ph;
      return { x, y, w: pw, h: ph };
    };
    const drawPlants = (t: number, dt: number) => {
      lay.plants.forEach((p, i) => {
        const [sx, sy, sw, sh] = ATLAS[p.cell];
        const { x, y, w, h } = plantBox(p);
        const k = kick[i];
        if (dt > 0) { const a = -K * k.x - C * k.v; k.v += a * dt; k.x += k.v * dt; }
        const n = Math.max(18, Math.min(56, Math.round(h / (lay.narrow ? 16 : 10))));
        const dh = h / n, ds = sh / n;
        const amp = p.amp * h;
        ctx.globalAlpha = p.op;
        for (let j = 0; j < n; j++) {
          /* u: 0 at the root, 1 at the tip. The root is planted; the tips
             carry the motion, and the wave travels up the frond. */
          const u = 1 - (j + 0.5) / n;
          const prof = Math.pow(u, 1.6);
          const dx = amp * prof * (
                Math.sin(W1 * t + p.ph - 2.4 * u)
              + 0.55 * Math.sin(W2 * 1.3 * t + p.ph * 1.7 - 3.8 * u + 1.3)
              + 0.30 * Math.sin(W3 * 3.5 * t + p.ph * 2.3 - 5.0 * u))
            + k.x * prof;
          ctx.drawImage(sprite!, sx, sy + j * ds, sw, ds + 1, x + dx, y + j * dh, w, dh + 0.75);
        }
      });
      ctx.globalAlpha = 1;
    };

    /* ---- 4 · the shoals: slow Lissajous drift, turning when they slow ---- */
    const facing = [-1, -1, -1, -1];
    const drawFish = (t: number, dt: number) => {
      lay.fish.forEach((f, gi) => {
        const [sx, sy, sw, sh] = ATLAS[f.cell];
        const fw = f.size * W, fh = fw * (sh / sw);
        const wx = (2 * Math.PI) / f.tx, wy = (2 * Math.PI) / f.ty;
        const gx = f.x * W + f.ax * W * Math.sin(wx * t + f.ph);
        const gy = f.y * H + f.ay * H * Math.sin(wy * t + f.ph * 0.7);
        const vx = f.ax * wx * Math.cos(wx * t + f.ph);
        /* sprites face left; they turn through a squash, not a flip */
        const want = vx > 0.0004 ? 1 : vx < -0.0004 ? -1 : facing[gi];
        facing[gi] += (want - facing[gi]) * Math.min(1, dt * 2.4);
        ctx.globalAlpha = f.op;
        for (let i = 0; i < f.n; i++) {
          const [ox, oy] = f.off[i] || [0, 0];
          const bx = gx + ox * fw + Math.sin(t * 0.7 + i * 1.3) * fw * 0.04;
          const by = gy + oy * fh + Math.sin(t * 1.1 + i * 1.7) * fw * 0.06;
          ctx.setTransform(dpr * facing[gi], 0, 0, dpr, dpr * (bx + fw / 2), dpr * (by + fh / 2));
          ctx.drawImage(sprite!, sx, sy, sw, sh, -fw / 2, -fh / 2, fw, fh);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      });
      ctx.globalAlpha = 1;
    };

    /* ---- 5 · bubbles the pointer leaves behind ---- */
    const bubbles: Bubble[] = [];
    let lastX = -1, lastY = -1, now = 0;
    const onMove = (e: PointerEvent) => {
      const rc = host.getBoundingClientRect();
      const x = e.clientX - rc.left, y = e.clientY - rc.top;
      if (x < 0 || x > W || y < 0 || y > H) { lastX = -1; return; }
      if (lastX < 0) { lastX = x; lastY = y; return; }
      const dx = x - lastX, dy = y - lastY, dist = Math.hypot(dx, dy);
      if (dist < 9) return;
      /* a bubble or two every ~9px of travel, never a curtain */
      const cnt = Math.min(2, Math.floor(dist / 9));
      for (let i = 0; i < cnt && bubbles.length < 110; i++) {
        const f = (i + 1) / cnt;
        bubbles.push({
          x: lastX + dx * f + (Math.random() - 0.5) * 6,
          y: lastY + dy * f + (Math.random() - 0.5) * 6,
          r: 0.9 + Math.random() * 1.9,
          rise: 50 + Math.random() * 30,          /* 50-80px, then gone */
          life: 1.1 + Math.random() * 0.7,
          t0: now, ph: Math.random() * 6.28,
        });
      }
      /* the pointer brushing a frond: a kick in its direction of travel */
      lay.plants.forEach((p, i) => {
        const b = plantBox(p);
        const pad = 48;
        if (x > b.x - pad && x < b.x + b.w + pad && y > b.y - pad && y < b.y + b.h + pad) {
          const u = 1 - (y - b.y) / b.h;                       /* higher on the frond = easier to move */
          kick[i].v += Math.max(-140, Math.min(140, dx * 9)) * (0.4 + 0.6 * Math.max(0, u));
        }
      });
      lastX = x; lastY = y;
    };
    const drawBubbles = () => {
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        const p = (now - b.t0) / b.life;
        if (p >= 1) { bubbles[i] = bubbles[bubbles.length - 1]; bubbles.pop(); continue; }
        const e = 1 - (1 - p) * (1 - p);                        /* fast off the pointer, slowing as it fades */
        const x = b.x + Math.sin(b.ph + p * 7) * 1.6 * p;
        const y = b.y - b.rise * e;
        const a = Math.pow(1 - p, 1.3);
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, 6.2832);
        ctx.fillStyle = `rgba(210,235,255,${(0.16 * a).toFixed(3)})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${(0.72 * a).toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        /* the highlight that makes it a sphere */
        ctx.beginPath();
        ctx.arc(x - b.r * 0.35, y - b.r * 0.35, Math.max(0.35, b.r * 0.28), 0, 6.2832);
        ctx.fillStyle = `rgba(255,255,255,${(0.85 * a).toFixed(3)})`;
        ctx.fill();
      }
    };

    /* ---- 6 · the loop: only while the footer is on screen ---- */
    let raf = 0, running = false, last = 0, tick = 0;
    const t0 = performance.now();
    const frame = () => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (!sprite) return;
      fit();
      /* phones: slow water needs 30fps, not 60 — draw every other frame */
      if (lay.narrow && (tick++ & 1)) return;
      const tn = performance.now();
      const t = (tn - t0) / 1000, dt = Math.min(0.05, (tn - last) / 1000);
      last = tn; now = t;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      drawFish(t, dt);
      drawPlants(t, dt);
      drawBubbles();
    };
    const drawStatic = () => {
      if (!sprite || !W) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      drawFish(0, 0);
      drawPlants(0, 0);
    };
    let vis: IntersectionObserver | null = null;
    if (!reduced) {
      vis = new IntersectionObserver((es) => {
        const on = es[0].isIntersecting;
        if (on && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
        if (!on && running) { running = false; cancelAnimationFrame(raf); }
      });
      vis.observe(host);
      host.addEventListener("pointermove", onMove, { passive: true });
    }
    return () => {
      disposed = true; running = false;
      cancelAnimationFrame(raf);
      arm.disconnect(); vis?.disconnect(); ro.disconnect();
      host.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <div className="reef" aria-hidden>
        {armed && (
          <>
            <img className="reef-far" src={DIR + "coral-far.webp"} width={438} height={326} alt="" decoding="async" loading="lazy" />
            <img className="reef-near" src={DIR + "coral-near.webp"} width={680} height={510} alt="" decoding="async" loading="lazy" />
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="reef-fore" aria-hidden />
    </>
  );
}

export const SEA_LIFE_CSS = `
.reef, .reef-fore { position:absolute; inset:0; pointer-events:none; }
.reef { z-index:1; overflow:hidden; }
.reef-fore { z-index:3; width:100%; height:100%; display:block; }
.reef img { position:absolute; width:auto; display:block; user-select:none; -webkit-user-drag:none; }
/* far: on the mid floor, right of the contact column (RTL: greater x) */
.reef-far  { height:30%; left:30%; bottom:20.5%; }
/* near: leans on the title from behind, cut by the frame's edge */
.reef-near { height:44%; right:-10%; bottom:12%; }
@media (max-width:767px), (orientation:portrait) {
  .reef img.reef-far  { height:15%; left:4%; bottom:24%; }
  .reef img.reef-near { display:none; }   /* one coral is enough on a phone */
}
`;
