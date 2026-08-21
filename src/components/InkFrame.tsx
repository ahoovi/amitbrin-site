"use client";

/**
 * InkFrame — the drawn frame that every clickable thing on this site wears.
 *
 * The resting line is the same lopsided rounded rectangle the CSS frames
 * use (`border-radius: 255px 18px 225px 18px / 18px 225px 18px 255px` and
 * friends), rendered as a real <path> so it can draw itself, and roughened
 * by the site's own `inkline` filters (feTurbulence + feDisplacementMap).
 * There is no hand-rolled jitter — the wobble comes from the same filter
 * that draws every frame in the posts, so the language is identical.
 *
 * On hover the pen goes around the same frame again and again: each pass
 * lands in almost the same place, a touch heavier and darker than the last
 * (variation ד — "לחץ עט"). The frame never fills.
 *
 * Usage: drop <InkFrame/> as the first child of a position:relative box.
 */

import { useEffect, useRef } from "react";

/* Amit-approved, 21.8.2026 — do not re-tune without asking. */
export const INK = {
  passes: 4,
  duration: 900,
  stagger: 330,
  strokeWidth: 1.1,
  opacity: 0.4,
  offset: 1,
  pressure: 0.16, // stroke-width growth per pass
  darken: 0.3, // opacity growth per pass
};

const RAD = {
  btn: [
    [255, 18, 225, 18, 18, 225, 18, 255],
    [250, 20, 230, 16, 16, 235, 20, 250],
    [18, 240, 22, 245, 240, 18, 250, 20],
    [235, 26, 210, 24, 22, 220, 18, 240],
    [22, 215, 28, 230, 225, 24, 235, 18],
    [200, 30, 245, 20, 26, 250, 22, 210],
    [245, 22, 215, 24, 20, 240, 16, 235],
    [24, 225, 20, 250, 235, 20, 245, 22],
    [230, 28, 240, 18, 18, 215, 24, 245],
  ],
  box: [
    [14, 20, 12, 22, 20, 13, 22, 14],
    [16, 18, 14, 20, 18, 15, 20, 16],
    [12, 22, 16, 18, 22, 12, 18, 20],
    [18, 14, 20, 13, 14, 20, 13, 22],
    [15, 21, 13, 19, 21, 14, 19, 15],
    [20, 13, 18, 15, 13, 22, 15, 18],
    [13, 19, 15, 21, 19, 16, 21, 13],
    [17, 16, 19, 17, 16, 18, 17, 19],
    [19, 17, 17, 16, 17, 19, 16, 17],
  ],
} as const;

/* CSS-style overlap clamping, then one path with four elliptical corners */
function framePath(x: number, y: number, w: number, h: number, r: readonly number[]) {
  let [tlx, trx, brx, blx, tly, trY, brY, bly] = r as unknown as number[];
  const f = Math.min(w / (tlx + trx), w / (blx + brx), h / (tly + bly), h / (trY + brY), 1);
  if (f < 1) { tlx *= f; trx *= f; brx *= f; blx *= f; tly *= f; trY *= f; brY *= f; bly *= f; }
  const n = (v: number) => Math.round(v * 100) / 100;
  return `M ${n(x + tlx)} ${n(y)} L ${n(x + w - trx)} ${n(y)}` +
    ` A ${n(trx)} ${n(trY)} 0 0 1 ${n(x + w)} ${n(y + trY)}` +
    ` L ${n(x + w)} ${n(y + h - brY)}` +
    ` A ${n(brx)} ${n(brY)} 0 0 1 ${n(x + w - brx)} ${n(y + h)}` +
    ` L ${n(x + blx)} ${n(y + h)}` +
    ` A ${n(blx)} ${n(bly)} 0 0 1 ${n(x)} ${n(y + h - bly)}` +
    ` L ${n(x)} ${n(y + tly)}` +
    ` A ${n(tlx)} ${n(tly)} 0 0 1 ${n(x + tlx)} ${n(y)} Z`;
}

const PAD = 14;
const SVG_NS = "http://www.w3.org/2000/svg";

export default function InkFrame({
  kind = "btn",
  seed = 0,
  className = "",
}: { kind?: "btn" | "box"; seed?: number; className?: string }) {
  const holder = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = holder.current;
    const host = svg?.parentElement;
    if (!svg || !host) return;

    const vocab = RAD[kind];
    let extra: SVGPathElement[] = [];
    let anims: Animation[] = [];

    function build() {
      const w = host!.offsetWidth, h = host!.offsetHeight;
      if (!w || !h) return;
      svg!.setAttribute("viewBox", `0 0 ${w + PAD * 2} ${h + PAD * 2}`);
      svg!.style.cssText =
        `position:absolute;left:${-PAD}px;top:${-PAD}px;width:${w + PAD * 2}px;height:${h + PAD * 2}px;` +
        `pointer-events:none;overflow:visible;z-index:-1`;
      svg!.textContent = "";
      extra = [];

      const base = document.createElementNS(SVG_NS, "path");
      base.setAttribute("d", framePath(PAD, PAD, w, h, vocab[0]));
      base.setAttribute("filter", "url(#ink0)");
      base.setAttribute("class", "ink-path ink-base");
      base.style.strokeWidth = INK.strokeWidth + "px";
      svg!.appendChild(base);

      for (let n = 1; n <= INK.passes; n++) {
        const o = (n % 2 ? INK.offset : -INK.offset) * (0.5 + (n % 3) * 0.28);
        const o2 = (n % 3 ? -INK.offset : INK.offset) * (0.4 + (n % 2) * 0.4);
        const p = document.createElementNS(SVG_NS, "path");
        p.setAttribute("d", framePath(PAD - o, PAD - o2, w + o * 2, h + o2 * 2, vocab[(n + seed) % vocab.length]));
        p.setAttribute("filter", `url(#ink${((n + seed) % 8) + 1})`);
        p.setAttribute("class", "ink-path");
        p.style.strokeWidth = INK.strokeWidth * (1 + n * INK.pressure) + "px";
        p.style.opacity = "0";
        svg!.appendChild(p);
        extra.push(p);
      }
    }

    function stop(silent?: boolean) {
      anims.forEach((a) => a.cancel());
      anims = [];
      extra.forEach((p) => {
        if (silent) { p.style.opacity = "0"; p.style.strokeDashoffset = ""; return; }
        const a = p.animate(
          [{ opacity: getComputedStyle(p).opacity }, { opacity: 0 }],
          { duration: 300, easing: "ease", fill: "forwards" }
        );
        a.onfinish = () => { p.style.opacity = "0"; p.style.strokeDasharray = "none"; p.style.strokeDashoffset = ""; };
      });
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    function start() {
      stop(true);
      anims = extra.map((p, n) => {
        const op = Math.min(1, INK.opacity * (1 + n * INK.darken));
        if (reduce.matches) {
          p.style.strokeDasharray = "none";
          return p.animate([{ opacity: 0 }, { opacity: op }], { duration: 160, fill: "forwards" });
        }
        const len = p.getTotalLength();
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = String(len);
        p.style.opacity = String(op);
        return p.animate(
          [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
          { duration: INK.duration, delay: n * INK.stagger, fill: "forwards", easing: "cubic-bezier(.45,.05,.3,1)" }
        );
      });
    }

    build();
    const onEnter = () => start();
    const onLeave = () => stop();
    host.addEventListener("mouseenter", onEnter);
    host.addEventListener("mouseleave", onLeave);
    host.addEventListener("focusin", onEnter);
    host.addEventListener("focusout", onLeave);

    const ro = new ResizeObserver(() => { stop(true); build(); });
    ro.observe(host);

    return () => {
      host.removeEventListener("mouseenter", onEnter);
      host.removeEventListener("mouseleave", onLeave);
      host.removeEventListener("focusin", onEnter);
      host.removeEventListener("focusout", onLeave);
      ro.disconnect();
      anims.forEach((a) => a.cancel());
    };
  }, [kind, seed]);

  return <svg ref={holder} className={"ink-frame " + className} aria-hidden />;
}

/* The filter set, mounted once per page (in the root layout). */
export function InkDefs() {
  const defs = [
    { f: 0.02, o: 3, s: 4, sc: 3.5 },
    { f: 0.016, o: 2, s: 9, sc: 2.4 },
    { f: 0.018, o: 2, s: 21, sc: 2.4 },
    { f: 0.015, o: 2, s: 33, sc: 2.4 },
    { f: 0.017, o: 2, s: 47, sc: 2.4 },
    { f: 0.014, o: 2, s: 61, sc: 2.4 },
    { f: 0.019, o: 2, s: 73, sc: 2.4 },
    { f: 0.016, o: 2, s: 89, sc: 2.4 },
    { f: 0.018, o: 2, s: 101, sc: 2.4 },
  ];
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      {defs.map((d, i) => (
        <filter key={i} id={"ink" + i} x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency={d.f} numOctaves={d.o} seed={d.s} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={d.sc} />
        </filter>
      ))}
    </svg>
  );
}

/* Shared CSS for anything wearing an InkFrame. Mounted with InkDefs. */
export const INK_CSS = `
.ink-frame{position:absolute;pointer-events:none;overflow:visible;z-index:-1}
.ink-path{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}
`;
