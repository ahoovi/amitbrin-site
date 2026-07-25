"use client";

/**
 * amitbrin.com — one-pager (test route /site2) · rev 3 — 8.7.2026
 * Design review round 2:
 *  · Hero: portrait 90% height, pulled toward center, safe gap from titles;
 *    playful letter-by-letter headline animation (overshoot, stagger, overlap).
 *  · Sailing: fine-print pinned to section bottom + legibility shadow/weight.
 *  · Blog: sketch-paper texture bg, centered navy title, 1.3-slide carousel.
 *  · Newsletter: right-column layout (≤50vw) like sailing, liquid-glass form.
 *  · Workshops: centered, wide 2-line subtitle, heavier column titles,
 *    body font unified (Noto), horizontal liquid-glass form.
 *  · Closing: crumpled-paper background, unified body font.
 *  · Footer: video replaced by a CSS underwater scene — wavy waterline,
 *    light rays, animated caustics on the floor; stacked title right,
 *    contacts left with channel icons.
 *  · Nav: progressive blur veil (≤180px, fades downward).
 *  · Scroll: section snap stops, ruler-line section nav (click + arrow keys),
 *    round back-to-top button.
 */

import { useEffect, useRef, useState } from "react";

const ROTATING_WORDS = ["שינוי", "ניראות", "בידול", "משמעות", "עניין", "ערך"];
const ROTATE_MS = 2600;

/* ---- Playful letter-by-letter rotating headline ---- */
function AnimatedTitle() {
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  useEffect(() => {
    const t = setInterval(() => {
      setIdx((v) => {
        setPrev(v);
        return (v + 1) % ROTATING_WORDS.length;
      });
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, []);
  const word = ROTATING_WORDS[idx];
  const old = prev !== null ? ROTATING_WORDS[prev] : null;
  return (
    <div className="anim-title" aria-label={"יוצר " + ROTATING_WORDS.join(", ")}>
      <span className="anim-before">יוצר&nbsp;</span>
      <span className="anim-stack" aria-hidden>
        {old && (
          <span className="aw out" key={"o" + prev}>
            {[...old].map((ch, i) => (
              <span className="ch" style={{ animationDelay: `${i * 40}ms` }} key={i}>
                {ch}
              </span>
            ))}
          </span>
        )}
        <span className="aw in" key={"i" + idx}>
          {[...word].map((ch, i) => (
            <span className="ch" style={{ animationDelay: `${140 + i * 75}ms` }} key={i}>
              {ch}
            </span>
          ))}
        </span>
      </span>
    </div>
  );
}

/* ---- Scroll-reveal (GPU-safe, reduced-motion aware) ---- */
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ---- Sections registry (ruler nav + keyboard + snap) ---- */
const SECTIONS = [
  { id: "top", label: "ראשי" },
  { id: "sailing", label: "המסע" },
  { id: "blog", label: "תרחיב — הבלוג" },
  { id: "news", label: "ניוזלטר" },
  { id: "work", label: "הרצאות וסדנאות" },
  { id: "close", label: "סיכום" },
  { id: "footer", label: "יצירת קשר" },
];

function RulerNav() {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    /* middle-of-viewport detection */
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            const i = SECTIONS.findIndex((s) => s.id === (e.target as HTMLElement).id);
            if (i > -1) setCur(i);
          }
        }),
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    const go = (i: number) => {
      const j = Math.max(0, Math.min(SECTIONS.length - 1, i));
      document.getElementById(SECTIONS[j].id)?.scrollIntoView({ behavior: "smooth" });
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      /* don't hijack while the tear entrance still covers the page */
      if (document.querySelector('.tear-under[aria-hidden="true"]')) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goRef.current(curRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goRef.current(curRef.current - 1);
      }
    };
    goRef.current = go;
    window.addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const curRef = useRef(cur);
  const goRef = useRef<(i: number) => void>(() => {});
  useEffect(() => {
    curRef.current = cur;
  }, [cur]);
  return (
    <nav className="ruler" aria-label="ניווט בין אזורי העמוד">
      {SECTIONS.map((s, i) => (
        <button
          key={s.id}
          className={"tick" + (i === cur ? " on" : "")}
          aria-label={s.label}
          aria-current={i === cur ? "true" : undefined}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
        />
      ))}
    </nav>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver((es) => setShow(!es[0].isIntersecting), {
      threshold: 0.2,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);
  return (
    <button
      className={"to-top" + (show ? " show" : "")}
      aria-label="חזרה לראש העמוד"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
}

/* ---- Minimal line icons for contact channels ---- */
const Ico = {
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M8 10.5V17M8 7.6v.1M12 17v-3.6c0-1.5 1-2.4 2.3-2.4S16.5 12 16.5 13.4V17" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M4.5 4.5l15 15M19.5 4.5l-15 15" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M14.5 8H16V5h-2a3.5 3.5 0 0 0-3.5 3.5V11H8v3h2.5v6h3v-6H16l.5-3h-3v-2a1 1 0 0 1 1-1Z" />
    </svg>
  ),
  behance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M3.5 6.5h4.2c1.8 0 3 .9 3 2.4 0 1-.5 1.7-1.4 2.1 1.2.3 1.9 1.2 1.9 2.4 0 1.7-1.3 2.8-3.3 2.8H3.5v-9.7ZM14 6.9h5M14.2 13.2h6.3c0-2.2-1.3-3.7-3.2-3.7s-3.2 1.5-3.2 3.8 1.3 3.8 3.3 3.8c1.5 0 2.6-.7 3-1.9" />
    </svg>
  ),
};

const CONTACTS = [
  { icon: Ico.mail, text: "ahoovi@gmail.com", href: "mailto:ahoovi@gmail.com" },
  { icon: Ico.phone, text: "054-9407575", href: "tel:+972549407575" },
  { icon: Ico.linkedin, text: "Amit Brin", href: "https://www.linkedin.com/in/amit-brin" },
  { icon: Ico.x, text: "amit_brin", href: "https://x.com/amit_brin" },
  { icon: Ico.facebook, text: "עמית ברין עיצוב מיתוג שווק", href: "https://www.facebook.com/amitbdesign" },
  { icon: Ico.behance, text: "amitbrin", href: "https://www.behance.net/amitbrin" },
];

/* Blog posts — first is real; two placeholders await content */
const POSTS = [
  {
    title: "סליחה ששלחתי וואטסאפ",
    excerpt:
      "וואטסאפ היא אפליקציה תקשורת שמשבשת את התקשורת האנושית. לא פחות. היא גם משנה את ההתנהגות האישית שלנו לרעה. ממש ככה. רוב האנשים לא עסוקים בשאלה ״האם היא משרתת אותנו, או שאנחנו משרתים אותה?״, הם גם לא מודעים לכך שהיא כבר מזמן לא משמשת לצרכים שעבורם היא נבנתה – הם כבר שברו את התיקרה שלה והיא מצידה שברה את הגבולות שלהם.",
    href: "/blog/whatsapp",
    placeholder: false,
  },
  {
    title: "Mother Load",
    excerpt:
      "יש מסמך חשבונאי אחד שאף רואה חשבון לא יחתום עליו, והוא נפתח כל ערב ב־23:00 בראש של כל אמא יוצרת. רייצ'ל מאני עיצבה והדפיסה אותו – פוסטרים, קבלה אחת ארוכה, ומסה שמצחיקה וכועסת באותה נשימה – על החשבון הפתוח של אימהות יוצרות.",
    href: "/blog/motherload",
    placeholder: false,
  },
  {
    title: "פרי עץ הדעת",
    excerpt:
      "לקוח סרב לקבל עבודה ששלחתי לו כי היה משוכנע שהאיור מג׳ונרט ב-AI. ״בחיים לא ראיתי איור כזה״, הוא אמר לי בטלפון. על קוסמים, על מזכירות שהתפטרו בגלל מעבד התמלילים - ועל המוח שכבר החליט שמה שהוא רואה לא אמיתי.",
    href: "/blog/pri-etz-hadaat",
    placeholder: false,
  },
];


/* =====================================================================
   FooterWater — live water simulation (raw WebGL2), inspired by Evan
   Wallace's WebGL Water. Heightfield ripple sim drives: the wavy
   waterline (paper bites into the sea), the underside of the surface,
   god-rays, perspective caustics on the seabed, and a bobbing sphere.
   Pointer movement over the footer draws ripples; ambient drops keep
   the water alive when untouched. Falls back to the CSS scene when
   WebGL2/float buffers are unavailable or reduced motion is set.
   ===================================================================== */
const SIM_N = 256;

const VS = `#version 300 es
out vec2 vUv;
void main(){
  vec2 p = vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2));
  vUv = p;
  gl_Position = vec4(p*2.0-1.0, 0.0, 1.0);
}`;

const SIM_FS = `#version 300 es
precision highp float;
uniform sampler2D uPrev; uniform float uTexel; uniform vec4 uDrop; /* x,y,radius,strength */
in vec2 vUv; out vec4 o;
void main(){
  vec4 c = texture(uPrev, vUv);
  float l = texture(uPrev, vUv - vec2(uTexel,0.)).r;
  float r = texture(uPrev, vUv + vec2(uTexel,0.)).r;
  float d = texture(uPrev, vUv - vec2(0.,uTexel)).r;
  float u = texture(uPrev, vUv + vec2(0.,uTexel)).r;
  float avg = (l+r+u+d)*0.25;
  float vel = (c.g + (avg - c.r)*0.7) * 0.991;
  float h = (c.r + vel) * 0.9995;
  if (uDrop.w != 0.0){
    float dist = clamp(length(vUv - uDrop.xy)/uDrop.z, 0.0, 1.0);
    h += uDrop.w * 0.5*(1.0 + cos(3.14159*dist));
  }
  o = vec4(h, vel, 0.0, 1.0);
}`;

const DRAW_FS = `#version 300 es
precision highp float;
uniform sampler2D uSim; uniform sampler2D uSand; uniform vec2 uRes; uniform float uT;
in vec2 vUv; out vec4 o;
/* mirrored tiling so the sim field extends forever without seams */
vec2 mir(vec2 p){ return abs(fract(p*0.5)*2.0 - 1.0); }
float hgt(vec2 p){ return texture(uSim, mir(p)).r; }
/* gentle procedural swell so the surface breathes even in calm water */
float swell(vec2 p){
  float a = sin(p.x*6.0 + uT*0.35) * sin(p.y*5.0 - uT*0.28);
  a += 0.6*sin(p.x*11.0 - uT*0.22 + p.y*7.0);
  a += 0.35*sin(p.x*19.0 + uT*0.18 - p.y*13.0);
  return a*0.5;
}
void main(){
  vec2 s = vec2(vUv.x, 1.0 - vUv.y);   /* s.y: 0 top -> 1 bottom */
  float aspect = uRes.x/uRes.y;
  vec3 PAPER = vec3(0.929,0.922,0.894);
  vec3 surfBase = vec3(0.100,0.370,0.600);
  vec3 surfHi   = vec3(0.640,0.850,0.960);
  vec3 waterMid = vec3(0.050,0.250,0.460);
  vec3 waterDeep= vec3(0.028,0.150,0.330);
  /* ---- waterline ---- */
  float shl = hgt(vec2(s.x, 0.10));
  float wl = 0.105 + shl*0.5 + 0.006*sin(s.x*9.0 + uT*0.30) + 0.004*sin(s.x*21.0 - uT*0.22);
  float t = clamp((s.y - wl)/max(1.0 - wl, 0.001), 0.0, 1.0);
  vec3 col = waterMid;
  /* ---- 1 · the surface itself, seen from below (big receding region) ---- */
  float surfEnd = wl + 0.34;
  if (s.y < surfEnd){
    float st = clamp((s.y - wl)/(surfEnd - wl), 0.0, 1.0);
    float z = mix(0.9, 3.6, st);
    vec2 sp = vec2((s.x - 0.5)*z*aspect*0.30 + 0.5 + uT*0.006, 0.18 + z*0.22);
    float e = 2.0/256.0;
    float hC = hgt(sp)*9.0 + swell(sp*3.0)*0.014;
    float hX = hgt(sp + vec2(e,0.))*9.0 + swell(sp*3.0 + vec2(0.16,0.))*0.014;
    float hY = hgt(sp + vec2(0.,e))*9.0 + swell(sp*3.0 + vec2(0.,0.16))*0.014;
    vec2 n = vec2(hX - hC, hY - hC)*220.0;
    float glint = pow(clamp(0.5 + n.x*0.9 - n.y*1.3, 0.0, 1.0), 3.0);
    vec3 sc = mix(surfBase, surfHi, glint);
    col = mix(sc, waterMid, smoothstep(0.55, 1.0, st));  /* haze into open water */
  }
  col = mix(col, waterDeep, smoothstep(0.35, 0.85, t));
  /* ---- 2 · ray fan from the sun, fed by real ripples ---- */
  vec2 rd = s - vec2(0.5, wl - 0.08); rd.x *= aspect;
  float rr = length(rd);
  float ang = atan(rd.x, rd.y);
  float act = hgt(vec2(0.5 + ang*0.25, 0.10));
  float fan = pow(max(sin(ang*34.0 + uT*0.05), 0.0), 24.0)*0.6
            + pow(max(sin(ang*21.0 - uT*0.035 + 1.7), 0.0), 30.0)*0.5;
  float rays = fan * exp(-rr*2.4) * smoothstep(0.0, 0.12, s.y - wl) * (0.35 + act*6.0) * 0.28;
  /* ---- 3 · sandy seabed (real texture, perspective, caustics) ---- */
  float floorStart = 0.56;
  float fedge = smoothstep(floorStart, floorStart + 0.09, s.y);
  if (fedge > 0.0){
    float ft = clamp((s.y - floorStart)/(1.0 - floorStart), 0.0, 1.0);
    float z = mix(3.4, 1.0, ft);
    vec2 wp = vec2((s.x - 0.5)*z*aspect*0.30 + 0.5, mix(0.15, 0.95, ft));
    vec3 sand = texture(uSand, wp*vec2(1.0, 1.35)).rgb;
    sand *= vec3(0.62,0.86,0.95);                       /* underwater tint */
    float e2 = 2.0/256.0;
    float hc = hgt(wp);
    float lap = hgt(wp+vec2(e2,0.)) + hgt(wp-vec2(e2,0.)) + hgt(wp+vec2(0.,e2)) + hgt(wp-vec2(0.,e2)) - 4.0*hc;
    float caust = pow(max(-lap*2600.0 + 0.25, 0.0), 2.0);
    float pc = pow(clamp(swell(wp*2.3)*0.5 + 0.55, 0.0, 1.0), 7.0);
    sand += vec3(0.75,0.95,1.0) * (caust*0.35 + pc*0.20);
    sand = mix(waterMid*1.15, sand, smoothstep(0.0, 0.45, ft));  /* distance haze */
    col = mix(col, sand, fedge);
  }
  col += vec3(0.62,0.86,0.98) * rays * (1.0 - fedge*0.75);
  /* ---- 4 · paper above the waterline + bright seam ---- */
  if (s.y < wl) col = PAPER;
  else col += vec3(0.88,0.97,1.0) * smoothstep(0.014, 0.0, s.y - wl) * 0.5;
  o = vec4(col, 1.0);
}`;

function FooterWater() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fail, setFail] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl || !gl.getExtension("EXT_color_buffer_float")) { setFail(true); return; }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const mk = (vs: string, fs: string) => {
      const c = (t: number, s: string) => {
        const sh = gl.createShader(t)!; gl.shaderSource(sh, s); gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || "shader");
        return sh;
      };
      const p = gl.createProgram()!;
      gl.attachShader(p, c(gl.VERTEX_SHADER, vs)); gl.attachShader(p, c(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link");
      return p;
    };
    let simP: WebGLProgram, drawP: WebGLProgram;
    try { simP = mk(VS, SIM_FS); drawP = mk(VS, DRAW_FS); } catch { setFail(true); return; }

    const mkTex = () => {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, SIM_N, SIM_N, 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    let texA = mkTex(), texB = mkTex();
    /* sandy seabed texture: 1px placeholder until the photo arrives */
    const sandTex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, sandTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([176, 162, 136, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const sandImg = new Image();
    sandImg.src = "/media/seabed-sand.jpg";
    sandImg.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, sandTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, sandImg);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    };
    const fbo = gl.createFramebuffer()!;
    const uSimTexel = gl.getUniformLocation(simP, "uTexel");
    const uSimPrev = gl.getUniformLocation(simP, "uPrev");
    const uSimDrop = gl.getUniformLocation(simP, "uDrop");
    const uDrawSim = gl.getUniformLocation(drawP, "uSim");
    const uDrawSand = gl.getUniformLocation(drawP, "uSand");
    const uDrawRes = gl.getUniformLocation(drawP, "uRes");
    const uDrawT = gl.getUniformLocation(drawP, "uT");

    const drops: number[][] = [];
    const addDrop = (x: number, y: number, r: number, s: number) => { if (drops.length < 8) drops.push([x, y, r, s]); };

    const step = () => {
      const d = drops.shift() || [0, 0, 1, 0];
      gl.useProgram(simP);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texB, 0);
      gl.viewport(0, 0, SIM_N, SIM_N);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texA);
      gl.uniform1i(uSimPrev, 0);
      gl.uniform1f(uSimTexel, 1 / SIM_N);
      gl.uniform4f(uSimDrop, d[0], d[1], d[2], d[3]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      [texA, texB] = [texB, texA];
    };
    const render = (t: number) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(drawP);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texA);
      gl.uniform1i(uDrawSim, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, sandTex);
      gl.uniform1i(uDrawSand, 1);
      gl.uniform2f(uDrawRes, canvas.width, canvas.height);
      gl.uniform1f(uDrawT, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (w && h && (canvas.width !== (w * dpr | 0) || canvas.height !== (h * dpr | 0))) {
        canvas.width = w * dpr | 0; canvas.height = h * dpr | 0;
      }
    };
    const ro = new ResizeObserver(fit); ro.observe(canvas); fit();

    /* pointer -> ripples (listen on the footer so content above the canvas still feeds it) */
    const host = canvas.closest("footer") || canvas;
    let lastX = -1, lastY = -1;
    const onMove = (e: PointerEvent) => {
      const rc = canvas.getBoundingClientRect();
      const x = (e.clientX - rc.left) / rc.width, y = (e.clientY - rc.top) / rc.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      if (Math.hypot(x - lastX, y - lastY) > 0.022) {
        addDrop(x, 1 - y, 0.055, 0.005);
        lastX = x; lastY = y;
      }
    };
    if (!reduced) host.addEventListener("pointermove", onMove as EventListener, { passive: true });

    /* ambient life */
    let amb = 0;
    if (!reduced) amb = window.setInterval(() => {
      addDrop(Math.random(), Math.random() * 0.85, 0.05 + Math.random() * 0.04, 0.0022 + Math.random() * 0.0028);
    }, 2700);

    let raf = 0, running = true, t0 = performance.now();
    const loop = () => {
      if (!running) return;
      fit();
      step();
      render((performance.now() - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver((es) => {
      const vis = es[0].isIntersecting;
      if (vis && !running) { running = true; raf = requestAnimationFrame(loop); }
      if (!vis) { running = false; cancelAnimationFrame(raf); }
    });
    io.observe(canvas);

    if (reduced) {
      addDrop(0.3, 0.5, 0.08, 0.01); addDrop(0.7, 0.3, 0.06, 0.008);
      for (let i = 0; i < 24; i++) step();
      render(0); running = false;
    } else {
      raf = requestAnimationFrame(loop);
    }
    return () => {
      running = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      if (amb) clearInterval(amb);
      host.removeEventListener("pointermove", onMove as EventListener);
    };
  }, []);

  if (fail)
    return (
      <>
        <svg className="waterline" viewBox="0 0 1440 70" preserveAspectRatio="none">
          <path className="wl-shine" d="M0,38 C120,26 240,50 360,40 C480,30 600,52 720,42 C840,32 960,50 1080,40 C1200,30 1320,48 1440,38 L1440,0 L0,0 Z" />
          <path className="wl-cut" d="M0,30 C120,18 240,42 360,32 C480,22 600,44 720,34 C840,24 960,42 1080,32 C1200,22 1320,40 1440,30 L1440,0 L0,0 Z" />
        </svg>
        <div className="rays">
          <i style={{ right: "12%", animationDelay: "0s" }} />
          <i style={{ right: "34%", animationDelay: "-3s", width: "16vw", opacity: 0.5 }} />
          <i style={{ right: "58%", animationDelay: "-6s" }} />
          <i style={{ right: "78%", animationDelay: "-1.5s", width: "9vw", opacity: 0.35 }} />
        </div>
        <div className="caustics" />
      </>
    );
  return <canvas ref={ref} className="sea-canvas" />;
}

/* =====================================================================
   Title FX — chromatic aberration ghosts follow the pointer on hover;
   scroll velocity skews/stretches the marked titles (GSAP-portfolio
   style, CSS-transform approximation).
   ===================================================================== */
function useScrollSkew() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const skewEls = Array.from(document.querySelectorAll<HTMLElement>(".fx-skew"));
    if (!skewEls.length) return;
    let lastY = window.scrollY, vel = 0, raf = 0;
    const loop = () => {
      const y = window.scrollY;
      vel += (y - lastY - vel) * 0.12;
      lastY = y;
      const s = Math.max(-6, Math.min(6, vel * 0.055));
      skewEls.forEach((el) => {
        el.style.transform = Math.abs(s) < 0.02 ? "" : `skewY(${s}deg) scaleY(${1 + Math.abs(s) * 0.008})`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}

/* =====================================================================
   FxTitle — section-title effect: a ripple of displacement runs through
   the letters under the pointer, with channel-split ghosts.
   palette: 'rgb'  (dark sections — screen-light split)
            'cmyk' (paper sections — print-ink split)
            'water'(footer — underwater refraction wobble)
   ===================================================================== */
function FxTitle({
  lines,
  className = "",
  palette = "rgb",
  as: Tag = "h2",
}: {
  lines: string[];
  className?: string;
  palette?: "rgb" | "cmyk" | "water";
  as?: any;
}) {
  const ref = useRef<any>(null);
  useEffect(() => {
    const el: HTMLElement | null = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letters = Array.from(el.querySelectorAll<HTMLElement>(".fl"));
    if (!letters.length) return;
    let raf = 0, hovering = false, settling = false, px = -9999, py = -9999;
    const t0 = performance.now();
    let cs: { x: number; y: number }[] = [];
    const curX = new Float32Array(letters.length); /* smoothed displacement */
    const curY = new Float32Array(letters.length);
    const kk = new Float32Array(letters.length);   /* smoothed intensity */
    const recompute = () => {
      cs = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };
    const SIG2 = 2 * 95 * 95;
    const loop = () => {
      const t = (performance.now() - t0) / 1000;
      let live = 0;
      letters.forEach((l, i) => {
        const dx = cs[i].x - px, dy = cs[i].y - py;
        const d = Math.hypot(dx, dy) || 1;
        const g = hovering ? Math.exp(-(d * d) / SIG2) : 0;
        let tx = 0, ty = 0;
        if (palette === "water") {
          /* whisper of refraction near the pointer */
          ty = Math.sin(t * 1.6 + cs[i].x * 0.045) * 1.25 * g;
        } else {
          /* misregistered print plates: barely-there radial push */
          const push = 3.5 * g;
          tx = (dx / d) * push;
          ty = (dy / d) * push;
        }
        curX[i] += (tx - curX[i]) * 0.16;
        curY[i] += (ty - curY[i]) * 0.16;
        kk[i] += (g - kk[i]) * 0.16;
        const still = Math.abs(curX[i]) < 0.05 && Math.abs(curY[i]) < 0.05 && kk[i] < 0.005;
        if (!still) live++;
        l.style.setProperty("--k", kk[i].toFixed(3));
        /* aberration splits along the push direction */
        l.style.setProperty("--cx", (curX[i] * 1.5).toFixed(1) + "px");
        l.style.setProperty("--cy", (curY[i] * 1.5).toFixed(1) + "px");
        if (palette === "water") {
          const w1 = Math.sin(t * 1.3 + cs[i].x * 0.06) * kk[i];
          const w2 = Math.cos(t * 1.7 + cs[i].x * 0.04) * kk[i];
          l.style.transform = still
            ? ""
            : `translate(${curX[i].toFixed(1)}px, ${curY[i].toFixed(1)}px) skewX(${(w1 * 2.4).toFixed(2)}deg) scaleY(${(1 + w2 * 0.035).toFixed(3)})`;
        } else {
          l.style.transform = still ? "" : `translate(${curX[i].toFixed(1)}px, ${curY[i].toFixed(1)}px)`;
        }
      });
      if (hovering || (settling && live)) raf = requestAnimationFrame(loop);
      else {
        settling = false;
        letters.forEach((l) => {
          l.style.transform = "";
          l.style.setProperty("--k", "0");
          l.style.setProperty("--cx", "0px");
          l.style.setProperty("--cy", "0px");
        });
      }
    };
    const enter = () => { hovering = true; settling = true; recompute(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };
    const move = (e: PointerEvent) => { px = e.clientX; py = e.clientY; };
    const leave = () => { hovering = false; };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    window.addEventListener("resize", recompute);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", recompute);
    };
  }, [palette]);
  return (
    <Tag ref={ref} className={"fxt fxt-" + palette + " " + className}>
      {lines.map((line, li) => (
        <span className="fxl" key={li}>
          {line.split(" ").map((word, wi) => (
            <span className="fw" key={wi}>
              {[...word].map((ch, ci) => (
                <span className="fl" data-ch={ch} key={ci}>
                  {ch}
                </span>
              ))}
              {wi < line.split(" ").length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}

export default function SitePage() {
  const stop = (e: React.FormEvent) => e.preventDefault();
  useReveal();
  useScrollSkew();

  return (
    <div className="op-root" dir="rtl">
      <style>{CSS}</style>

      {/* hand-drawn ink-line filter (blog cards & buttons) */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id="inkline" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" />
        </filter>
      </svg>

      {/* progressive blur veil behind the nav */}
      <div className="nav-veil" aria-hidden>
        <i />
        <i />
        <i />
      </div>

      {/* ============ NAV ============ */}
      <nav className="op-nav" aria-label="ניווט ראשי">
        <a href="#top" className="nav-logo" aria-label="עמית ברין — ראשי">
          <img src="/media/amit-brin-logo.svg" alt="עמית ברין" />
        </a>
        <div className="nav-links">
          <a href="#top">ראשי</a>
          <a href="#blog">כתיבה ועשייה</a>
          <a href="#footer">דברו איתי</a>
        </div>
      </nav>

      <RulerNav />
      <BackToTop />

      {/* ============ 1 · IDENTITY HERO ============ */}
      <section className="sec-identity" id="top">
        <div className="identity-inner">
          <div className="identity-text">
            <div className="identity-logos">
              <img src="/media/echo_v_200.png" alt="הד — עמית ברין" className="logo-echo" />
              <img src="/media/effie-white.png" alt="Effie Awards Israel" className="logo-effie" />
            </div>
            <div className="identity-titles">
              <h1 className="identity-name">עמית ברין</h1>
              <p className="identity-roles">אבא, מעצב, מרצה, מנטור, מעורר השראה</p>
              <AnimatedTitle />
              <p className="identity-for">
                למותגים המובילים בארץ ובעולם
                <br />
                ולאנשים מצליחים ומסופקים יותר
              </p>
            </div>
          </div>
          <div className="identity-photo">
            <img
              src="/media/amit-brin-headshot3-839x1100.png"
              alt="עמית ברין"
              width={839}
              height={1100}
            />
          </div>
        </div>
      </section>

      {/* ============ 2 · SAILING ============ */}
      <section className="sec-sailing" id="sailing">
        <video
          className="bg-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/media/portrait.jpg"
        >
          <source src="/media/sailing4k2_1_1.mp4" type="video/mp4" />
        </video>
        <div className="sailing-content">
          <div data-reveal>
            <FxTitle
              className="sailing-title fx-skew"
              palette="rgb"
              lines={["לוקח אותך למסע", "אל משהו שאף אחד", "עוד לא עשה"]}
            />
            <p className="sailing-body">
              בדרך אל היצירה החדשה, מצויד בטכנולוגיה פורצת דרך, אני שם רגע בצד רזומה של
              24 שנים במה שקוראים ״עיצוב גרפי״ (ואת הפורטפוליו שבאת לראות פה, כי אני
              מניח שבכל זאת הגעת לאתר הזה בשביל משהו שלא נעשה עדיין...) בעולם החדש הזה
              אין סיבה להאחז בדוגמאות מהעבר כרפרנס למה שאנחנו מסוגלים להגיע אליו עכשיו.
              כי עכשיו, כשעומדים לרשותנו כלים חדשים שיסירו מאיתנו את כל המגבלות שהיו
              לנו, גבול היכולות שלנו רחוק בהרבה ממה שהכרנו! אז... שנצא לדרך?
            </p>
          </div>
          <p className="sailing-fineprint">
            *בין השאר, אני מחפש מראה סופי לאתר הזה. אז גם העמוד הזה שאתן קוראות עכשיו
            מתעדכן, ועובר שינויים ושיפוצים על בסיס קבוע. בהמשך האתר גם כמה דברים
            אקספרימנטליים שאני עדיין בוחן... בקיצור: שימו לב איפה שאתן דורכות כי בדיוק
            שטפתי פה.
          </p>
        </div>
      </section>

      {/* ============ 3 · BLOG — sketch paper, centered title, 1.3 carousel ============ */}
      <section className="sec-blog" id="blog">
        <div className="blog-content">
          <div className="blog-head" data-reveal>
            <img
              src="/media/tarhiv-blog-header.svg"
              alt="תרחיב — הבלוג"
              className="blog-tarhiv"
            />
            <FxTitle
              className="blog-title fx-skew"
              palette="cmyk"
              lines={["מחשבות על עיצוב", "ועל חוויית שימוש"]}
            />
          </div>
          <div className="blog-rail" data-reveal>
            {POSTS.map((p, idx) => (
              <article className={"post-card" + (p.placeholder ? " placeholder" : "")} key={idx}>
                <h3 className="post-title">{p.title}</h3>
                <p className="post-excerpt">{p.excerpt}</p>
                <a href={p.href} className="post-btn" onClick={(e) => { if (p.placeholder) e.preventDefault(); }}>
                  לפוסט המלא <span aria-hidden>←</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 4 · NEWSLETTER — right column, glass form ============ */}
      <section className="sec-news" id="news">
        <video
          className="bg-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/boxing-coach-fallback.jpg"
        >
          <source src="/media/bot-whisperer.mp4" type="video/mp4" />
        </video>
        <div className="news-overlay" />
        <div className="news-content">
          <div data-reveal>
            <FxTitle className="news-title fx-skew" palette="rgb" lines={["רוצים לדעת מהיכן הפרומפטים שלי?"]} />
            <p className="news-body">
              כדי לדעת מה ללחוש לבוטים, במיוחד ברגעים מאתגרים ומכריעים, אני מקפיד
              להתעדכן על בסיס יומי בהשקות ועדכונים של כלים, בלימודי טכניקות או פרומפטים
              מורכבים – כדי שאתם לא תצטרכו לעבור את תהליך ההסתגלות הסיזיפי הזה ותוכלו
              ליהנות ישר מהתובנות שריכזתי, בצורה הכי מתומצתת ויעילה.
            </p>
          </div>
          <div className="news-card glass" data-reveal>
            <h3 className="news-card-title">
              לשלוח גם לך עדכונים, מדריכים וטיפים ברגע שאני מסכם אותם?
            </h3>
            <form className="op-form news-form" onSubmit={stop}>
              <label>
                איך לקרוא לך?
                <input type="text" name="name" autoComplete="name" />
              </label>
              <label>
                לאיזה מייל לשלוח?
                <input type="email" name="email" autoComplete="email" />
              </label>
              <label className="check">
                <input type="checkbox" name="consent" /> אשמח לקבל עדכונים למייל
              </label>
              <button type="submit">תרשום אותי לעדכונים חינם!</button>
            </form>
          </div>
        </div>
      </section>

      {/* ============ 5 · WORKSHOPS — centered, horizontal glass form ============ */}
      <section className="sec-work" id="work">
        <div className="work-overlay" />
        <div className="work-content">
          <div data-reveal>
            <FxTitle className="work-title fx-skew" palette="rgb" lines={["בא לחדש לכם"]} />
            <p className="work-sub">
              מגיע עד אליכם כדי להעשיר, ללמד ולתרגל עבודה עם כלים עדכניים, פרקטיקות
              מתקדמות, חשיבה עיצובית ויצירה עם בינה מלאכותית.
            </p>
          </div>
          <div className="work-cols" data-reveal>
            <div className="work-col">
              <h3>✦ הרצאות העשרה ✦</h3>
              <p>
                אם זה בערב חברה או במפגש חברים, כשרוצים להעניק לקבוצה חוויה של דעת
                וטריוויה מפתיעה – אני מגיע עם סיפור עשיר ומסחרר, רחב יריעה וסוחף.
              </p>
            </div>
            <div className="work-col">
              <h3>✦ הדרכות טכניות ✦</h3>
              <p>
                להתעדכן בגרסאות האחרונות של התוכנות שאתן כבר עובדות עליהן – הדרכת ריענון
                תקופתי שהיא חובה לכל סטודיו.
              </p>
            </div>
            <div className="work-col">
              <h3>✦ סדנאות מעשיות ✦</h3>
              <p>
                מאגרים של כלים חדשים (כאלה שתאהבו!) לארגז הכלים; עבודה מבוססת חשיבה
                עיצובית ובינה יוצרת.
              </p>
            </div>
          </div>
          <div className="work-card glass" data-reveal>
            <h3 className="work-card-title">הי, אני גם רוצה לארח אותך לכזה דבר!</h3>
            <p className="work-card-sub">
              (אבל הארגון שלי שונה ומיוחד, הוא מצריך תוכן ועריכה ייעודים – אז בוא נדבר!)
            </p>
            <form className="op-form work-form" onSubmit={stop}>
              <label>
                שם מלא
                <input type="text" name="fullname" autoComplete="name" />
              </label>
              <label>
                תפקיד בארגון
                <input type="text" name="role" />
              </label>
              <label>
                מייל בארגון
                <input type="email" name="workemail" autoComplete="email" />
              </label>
              <button type="submit">שליחה</button>
            </form>
          </div>
        </div>
      </section>

      {/* ============ 6 · CLOSING — crumpled paper ============ */}
      <section className="sec-close" id="close">
        <div className="close-inner" data-reveal>
          <FxTitle className="close-title fx-skew" palette="cmyk" lines={["כנראה שהעמוד הזה יהיה בבנייה לנצח"]} />
          <p>
            אבל ברצינות, תחשבו על זה רגע... להיות במצב הזה של הצורך להשתנות תמידית – זה
            משהו שאתם הייתם לוקחים על עצמכם?
          </p>
          <p>(כי אני חושב שפשוט חייבים. דברו איתי אם אתם צריכים שינוי.)</p>
        </div>
      </section>

      {/* ============ 7 · FOOTER — CSS underwater scene ============ */}
      <footer className="sec-footer" id="footer">
        <div className="sea" aria-hidden>
          <FooterWater />
        </div>
        <div className="footer-content">
          <FxTitle
            className="footer-title"
            palette="water"
            lines={["זהו,", "הגעת", "לתחתית."]}
          />
          <div className="footer-contact">
            <h3>איפה בכל זאת אפשר להשיג אותי</h3>
            <ul>
              {CONTACTS.map((c, i) => (
                <li key={i}>
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    <span className="c-ico" aria-hidden>
                      {c.icon}
                    </span>
                    <span>{c.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ================================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@400;500;600&family=Alef:wght@400;700&display=swap');

@font-face { font-family:'Leon'; src:url('/fonts/Leon-Thin.woff2') format('woff2');    font-weight:100 300; font-display:swap; }
@font-face { font-family:'Leon'; src:url('/fonts/Leon-Regular.woff2') format('woff2'); font-weight:400 500; font-display:swap; }
@font-face { font-family:'Leon'; src:url('/fonts/Leon-Bold.woff2') format('woff2');    font-weight:600 700; font-display:swap; }
@font-face { font-family:'Leon'; src:url('/fonts/Leon-Heavy.woff2') format('woff2');   font-weight:800 900; font-display:swap; }

/* --- scroll lock while the tear entrance covers the page --- */
.tear-under[aria-hidden="true"] { position:fixed; inset:0; overflow:hidden; }

/* --- section snap: only when the page is NOT covered by the tear --- */
html:has(.op-root) { scroll-behavior:smooth; }
html:has(.op-root):not(:has(.tear-under[aria-hidden="true"])) { scroll-snap-type:y mandatory; }
.op-root section, .op-root footer { scroll-snap-align:start; }

.op-root {
  --navy-deep:#020D2C; --navy-dark:#070E1F; --navy-mid:#273E58; --navy:#081845;
  --gold:#CFBD85; --cream:#EADEB7; --offwhite:#E6E8EF; --footer-end:#051951;
  --ease:cubic-bezier(.32,.72,0,1);
  font-family:'Noto Sans Hebrew', Arial, sans-serif;
  color:var(--offwhite);
  background:var(--navy-deep);
  overflow-x:hidden;
}
.op-root section, .op-root footer { position:relative; }
.op-root h1,.op-root h2,.op-root h3 { font-family:'Leon','Noto Sans Hebrew',sans-serif; margin:0; }
.op-root p { margin:0; }

.bg-video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:0; pointer-events:none; }

[data-reveal] { opacity:0; transform:translateY(30px); transition:opacity .9s var(--ease), transform .9s var(--ease); }
[data-reveal].in { opacity:1; transform:none; }
@media (prefers-reduced-motion: reduce){ [data-reveal]{ opacity:1; transform:none; transition:none; } }

/* ---------- NAV + progressive blur veil ---------- */
.nav-veil { position:fixed; top:0; right:0; left:0; height:90px; z-index:40; pointer-events:none; }
.nav-veil i { position:absolute; inset:0; }
.nav-veil i:nth-child(1){ backdrop-filter:blur(26px); -webkit-backdrop-filter:blur(26px);
  -webkit-mask-image:linear-gradient(#000 0 34%, transparent 62%); mask-image:linear-gradient(#000 0 34%, transparent 62%); }
.nav-veil i:nth-child(2){ backdrop-filter:blur(11px); -webkit-backdrop-filter:blur(11px);
  -webkit-mask-image:linear-gradient(transparent 22%, #000 40% 52%, transparent 80%); mask-image:linear-gradient(transparent 22%, #000 40% 52%, transparent 80%); }
.nav-veil i:nth-child(3){ backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
  -webkit-mask-image:linear-gradient(transparent 45%, #000 62% 74%, transparent 100%); mask-image:linear-gradient(transparent 45%, #000 62% 74%, transparent 100%); }

.op-nav {
  position:fixed; top:0; right:0; left:0; z-index:50;
  display:flex; align-items:center; gap:2.4rem;
  padding:1.1rem 2.2rem;
  mix-blend-mode:difference;
}
.nav-logo img { height:32px; width:auto; display:block; filter:brightness(0) invert(1); }
.nav-links { display:flex; gap:1.8rem; }
.nav-links a { color:#fff; text-decoration:none; font-family:'Leon',sans-serif; font-weight:500; font-size:1rem; letter-spacing:.02em; transition:opacity .4s var(--ease); }
.nav-links a:hover { opacity:.65; }

/* ---------- RULER NAV (left edge) ---------- */
.ruler {
  position:fixed; left:1.1rem; top:50%; transform:translateY(-50%);
  z-index:45; display:flex; flex-direction:column; gap:14px; align-items:flex-start;
  mix-blend-mode:difference;
}
.ruler .tick {
  width:16px; height:2px; border:none; padding:0; cursor:pointer;
  background:rgba(255,255,255,.55); border-radius:2px;
  transition:width .5s var(--ease), height .5s var(--ease), background .5s var(--ease);
}
.ruler .tick:hover { width:24px; background:#fff; }
.ruler .tick.on { width:34px; height:4px; background:#fff; }

/* ---------- BACK TO TOP ---------- */
.to-top {
  position:fixed; bottom:1.3rem; right:1.3rem; z-index:45;
  width:46px; height:46px; border-radius:50%;
  border:1px solid rgba(255,255,255,.35);
  background:rgba(7,14,31,.35);
  backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
  color:#fff; font-size:1.15rem; cursor:pointer;
  opacity:0; transform:translateY(12px); pointer-events:none;
  transition:opacity .6s var(--ease), transform .6s var(--ease), background .4s var(--ease);
}
.to-top.show { opacity:1; transform:none; pointer-events:auto; }
.to-top:hover { background:rgba(207,189,133,.45); }

/* ---------- 1 · IDENTITY ---------- */
.sec-identity { min-height:100vh; min-height:100svh; display:flex; align-items:stretch; }
.sec-identity::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(180deg, var(--navy-mid) 15%, var(--navy-dark) 50%);
  z-index:0;
}
.sec-identity::after {
  content:''; position:absolute; inset:0;
  background:url('/media/client-logo-wall-w.jpg') top right repeat;
  background-size:min(585px, 45vw) auto;
  opacity:.3; mix-blend-mode:overlay; z-index:1;
}
.identity-inner {
  position:relative; z-index:2;
  width:100%; min-height:100svh;
  display:flex; align-items:center; justify-content:flex-start;
  gap:clamp(2rem, 5vw, 6rem); padding-inline:5vw 0;
}
.identity-text { flex:1 1 56%; display:flex; flex-direction:row; align-items:center; gap:clamp(1.4rem, 3vw, 3rem); position:relative; z-index:3; }
.identity-logos { display:flex; flex-direction:column; align-items:center; gap:1.6rem; flex:0 0 auto; }
.logo-echo  { width:clamp(64px, 6.5vw, 100px); height:auto; }
.logo-effie { width:clamp(38px, 3.6vw, 56px); height:auto; }
.identity-titles { min-width:0; }
.identity-name, .anim-title {
  color:var(--gold); font-family:'Leon',sans-serif; font-weight:800;
  font-size:clamp(3rem, 6vw, 7rem); line-height:1.06;
  text-shadow:8px 4px 12px rgba(0,0,20,.5);
}
.identity-roles {
  color:var(--cream); font-family:'Leon',sans-serif; font-weight:200;
  font-size:clamp(1.05rem, 1.6vw, 1.7rem); line-height:1.06;
  margin-block:.55em .5em;
  text-shadow:0 2px 4px rgba(3,3,6,.81);
}
/* --- playful letter animation --- */
.anim-title { display:flex; white-space:nowrap; }
.anim-stack { position:relative; display:inline-block; }
.aw { display:inline-flex; }
.aw.out { position:absolute; inset-inline-start:0; top:0; }
.aw .ch { display:inline-block; }
.aw.in .ch {
  animation:chIn .75s cubic-bezier(.18,1.6,.32,1) both; /* springy overshoot */
}
@keyframes chIn {
  0%   { transform:translateY(.95em) rotate(9deg)  scale(.55); opacity:0; filter:blur(5px); }
  55%  { transform:translateY(-.09em) rotate(-3deg) scale(1.08); opacity:1; filter:blur(0); }
  75%  { transform:translateY(.03em)  rotate(1deg)  scale(.985); }
  100% { transform:none; opacity:1; }
}
.aw.out .ch { animation:chOut .5s cubic-bezier(.55,-.35,.75,.4) both; }
@keyframes chOut {
  0%   { transform:none; opacity:1; }
  100% { transform:translateY(-.85em) rotate(-8deg) scale(.6); opacity:0; filter:blur(4px); }
}
.identity-for {
  color:var(--cream); font-family:'Leon',sans-serif; font-weight:400;
  font-size:clamp(1.1rem, 1.8vw, 1.9rem); line-height:1.35;
  margin-top:.6em;
  text-shadow:0 2px 4px rgba(3,3,6,.81);
}
/* portrait: ANCHORED — absolutely pinned to the section floor; the animated title
   above changes width freely and can never push the photo again (approved 07-19) */
.identity-photo { position:absolute; left:0; bottom:0; height:100svh; width:clamp(300px, 40vw, 640px); z-index:1; pointer-events:none; }
.identity-photo img { position:absolute; bottom:0; right:0; height:90%; width:auto; max-width:none; }

/* ---------- 2 · SAILING ---------- */
.sec-sailing { min-height:100vh; background:var(--navy-deep); display:flex; }
.sailing-content {
  position:relative; z-index:2;
  width:min(44rem, 50vw);
  min-height:100vh;
  display:flex; flex-direction:column;
  padding:16vh 5vw 7vh;
}
.sailing-title {
  color:var(--navy); font-weight:700;
  font-size:clamp(2rem, 3.3vw, 3.8rem); line-height:1.08;
  text-shadow:3px 3px 33px rgba(252,253,248,.7);
}
.sailing-body {
  color:var(--navy); margin-top:1.6rem;
  font-size:clamp(1rem, 1.15vw, 1.2rem); line-height:1.75;
  text-shadow:0 1px 15px #fff; mix-blend-mode:luminosity;
}
.sailing-fineprint {
  color:var(--offwhite); margin-top:auto; padding-top:2rem;
  font-size:.85rem; line-height:1.6; font-weight:500;
  text-shadow:0 1px 2px rgba(2,13,44,.65), 0 0 16px rgba(2,13,44,.35);
}

/* ---------- 3 · BLOG — sketch paper ---------- */
.sec-blog {
  display:flex;
  background-color:#EFF1F5;
  background-image:
    radial-gradient(circle, rgba(8,24,69,.176) 1px, transparent 1.4px),
    linear-gradient(rgba(8,24,69,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(8,24,69,.04) 1px, transparent 1px);
  background-size:28px 28px, 28px 28px, 28px 28px;
}
.blog-content { position:relative; z-index:2; width:100%; padding:13vh 5vw min(11vh, 200px); display:flex; flex-direction:column; gap:6vh; }
.blog-head { width:min(1100px, 100%); margin-inline:auto; text-align:center; }
.blog-tarhiv { width:100%; height:auto; display:block; }
.blog-title {
  color:var(--navy); font-weight:700;
  font-size:clamp(1.9rem, 3.4vw, 3.6rem); line-height:1.12;
  margin-top:4vh;
}
/* 1.3 slides visible: one major + a peek of the next */
.blog-rail {
  display:flex; gap:1.8rem;
  overflow-x:auto; scroll-snap-type:x mandatory;
  padding:.5rem 0 1.8rem;
  scrollbar-width:none;
}
.blog-rail::-webkit-scrollbar { display:none; }
/* transparent cards with a hand-drawn ink border on the sketch paper */
.post-card {
  flex:0 0 max(260px, calc((100% - 3.6rem) / 3)); scroll-snap-align:start;
  display:flex; flex-direction:column; align-items:flex-start;
  position:relative; background:transparent; border:none;
  border-radius:20px;
  padding:2.4rem 2.4rem 2.2rem;
  transition:transform .7s var(--ease);
}
.post-card::before {
  content:''; position:absolute; inset:2px; pointer-events:none;
  border:1.8px solid var(--navy);
  border-radius:16px 22px 14px 24px / 22px 15px 24px 16px; /* uneven, hand-cut */
  filter:url(#inkline);                                     /* wiggly pen line */
}
.post-card:hover { transform:translateY(-6px); }
.post-card.placeholder { opacity:.45; }
.post-card.placeholder::before { border-style:dashed; }
.post-title { color:var(--navy); font-weight:600; font-size:clamp(1.3rem, 2vw, 1.9rem); }
.post-excerpt { color:#020D2C; margin-top:1rem; flex:1; font-size:clamp(.95rem, 1.05vw, 1.05rem); line-height:1.75; }
/* pen-stroke button -> solid ink fill on hover */
.post-btn {
  display:inline-flex; align-items:center; gap:.55em;
  position:relative; z-index:0; margin-top:1.8rem;
  font-family:'Leon',sans-serif; font-weight:500;
  color:var(--navy); background:transparent;
  padding:.6em 1.5em; text-decoration:none;
  transition:color .35s var(--ease), transform .5s var(--ease);
}
.post-btn::before {
  content:''; position:absolute; inset:0; z-index:-1;
  border:1.7px solid var(--navy);
  border-radius:255px 18px 225px 18px / 18px 225px 18px 255px; /* sketchy pill */
  filter:url(#inkline);
  transition:background .35s var(--ease);
}
.post-btn:hover { color:var(--cream); }
.post-btn:hover::before { background:var(--navy); }
.post-btn:active { transform:scale(.98); }

/* ---------- LIQUID GLASS (shared) ---------- */
.glass {
  position:relative;
  background:linear-gradient(135deg, rgba(255,255,255,.16), rgba(255,255,255,.05) 45%, rgba(255,255,255,.12));
  backdrop-filter:blur(18px) saturate(150%);
  -webkit-backdrop-filter:blur(18px) saturate(150%);
  border-radius:22px;
  border:1px solid rgba(255,255,255,.28);
  box-shadow:
    inset 0 1px 1px rgba(255,255,255,.35),
    inset 0 -1px 1px rgba(255,255,255,.08),
    0 24px 60px rgba(2,13,44,.35);
}
.glass::before {
  content:''; position:absolute; inset:0; border-radius:inherit; padding:1px;
  background:linear-gradient(120deg, rgba(255,255,255,.6), rgba(255,255,255,0) 28%, rgba(255,255,255,0) 72%, rgba(207,189,133,.5));
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor; mask-composite:exclude;
  pointer-events:none;
}

/* ---------- 4 · NEWSLETTER — right column like sailing ---------- */
.sec-news { min-height:100vh; background:var(--navy-deep); display:flex; }
.news-overlay { position:absolute; inset:0; z-index:1; background:linear-gradient(211deg, var(--navy) 20%, rgba(8,24,69,.02) 45%); }
.news-content {
  position:relative; z-index:2;
  width:min(44rem, 50vw);
  display:flex; flex-direction:column; gap:2.6rem;
  padding:14vh 5vw 12vh;
}
.news-title { color:var(--cream); font-weight:600; font-size:clamp(1.6rem, 2.5vw, 2.7rem); line-height:1.15; }
.news-body { color:var(--offwhite); margin-top:1.4rem; font-size:clamp(.95rem, 1.05vw, 1.05rem); line-height:1.75; }
.news-card { padding:2.2rem; }
.news-card-title { color:var(--cream); font-weight:600; font-size:clamp(1rem, 1.3vw, 1.35rem); line-height:1.4; }
.news-form label { color:var(--offwhite); }

/* ---------- 5 · WORKSHOPS ---------- */
.sec-work { min-height:100vh; display:flex; background:url('/media/keynote-section-back.jpg') center/cover; }
@media (min-width:1024px){ .sec-work { background-attachment:fixed; } }
.work-overlay { position:absolute; inset:0; z-index:1; background:radial-gradient(circle, rgba(27,37,47,0) 40%, rgba(0,0,0,.62) 70%); }
.work-content {
  position:relative; z-index:2; width:100%;
  padding:12vh 5vw 10vh;
  display:flex; flex-direction:column; align-items:center; gap:5vh;
  text-align:center;
}
.work-title { color:var(--offwhite); font-weight:700; font-size:clamp(2rem, 3.3vw, 3.8rem); }
.work-sub {
  color:var(--offwhite); max-width:62rem; margin:1.1rem auto 0;
  font-family:'Leon',sans-serif; font-weight:400;
  font-size:clamp(1.05rem, 1.7vw, 1.7rem); line-height:1.4;
}
.work-cols { display:flex; flex-wrap:wrap; gap:2.4rem; justify-content:center; }
.work-col { flex:1 1 16rem; max-width:22rem; }
.work-col h3 { color:var(--offwhite); font-weight:700; font-size:clamp(1.1rem, 1.7vw, 1.6rem); margin-bottom:.8rem; }
.work-col p { color:var(--offwhite); font-family:'Noto Sans Hebrew',sans-serif; font-size:clamp(.95rem, 1.05vw, 1.05rem); line-height:1.7; }
/* horizontal glass form */
.work-card { width:min(64rem, 100%); padding:2.2rem 2.4rem; }
.work-card-title { color:var(--offwhite); font-weight:500; font-size:clamp(1.2rem, 1.6vw, 1.6rem); }
.work-card-sub { color:var(--offwhite); font-family:'Leon',sans-serif; font-weight:400; font-size:.95rem; margin-top:.6rem; }
/* (moved below .op-form so the horizontal override wins the cascade) */

/* ---------- FORMS ---------- */
.op-form { display:flex; flex-direction:column; gap:1rem; margin-top:1.5rem; }
.op-form label { display:flex; flex-direction:column; gap:.35rem; text-align:right; font-family:'Leon',sans-serif; font-weight:400; font-size:.95rem; }
.op-form input[type=text], .op-form input[type=email] {
  font-family:'Alef',sans-serif; font-size:1rem;
  background:rgba(230,232,239,.92); color:var(--navy);
  border:1px solid rgba(255,255,255,.35); border-radius:10px;
  padding:.6em .8em; outline:none;
  transition:border-color .4s var(--ease), background .4s var(--ease);
}
.op-form input:focus { border-color:var(--gold); background:#fff; }
.op-form label.check { flex-direction:row; align-items:center; gap:.5rem; font-family:'Alef',sans-serif; }
/* horizontal glass form — fields side by side */
.op-form.work-form { flex-direction:row; flex-wrap:wrap; align-items:flex-end; justify-content:center; gap:1.1rem; }
.op-form.work-form label { flex:1 1 12rem; color:var(--gold); text-align:right; }
.op-form.work-form button { flex:0 0 auto; }
.op-form button {
  font-family:'Leon',sans-serif; font-weight:500; font-size:1.05rem;
  border:none; border-radius:999px; padding:.75em 1.6em; cursor:pointer;
  transition:background .5s var(--ease), transform .5s var(--ease);
}
.op-form button:active { transform:scale(.98); }
.news-form button { background:var(--gold); color:var(--navy); }
.news-form button:hover { background:var(--cream); }
.work-form button { background:var(--gold); color:var(--navy); }
.work-form button:hover { background:var(--cream); }

/* ---------- 6 · CLOSING — crumpled paper ---------- */
.sec-close {
  position:relative; color:var(--navy); text-align:center;
  padding:18vh 6vw;
  background-color:#EDEBE4;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.011 0.015' numOctaves='4' seed='7'/><feDiffuseLighting lighting-color='%23f2f0ea' surfaceScale='2.6'><feDistantLight azimuth='235' elevation='56'/></feDiffuseLighting></filter><rect width='100%25' height='100%25' filter='url(%23p)'/></svg>");
  background-size:900px 900px;
}
.sec-close::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(180deg, rgba(230,232,239,.35), rgba(255,255,255,.15) 60%, rgba(230,232,239,.4));
  pointer-events:none;
}
.close-inner { position:relative; }
.sec-close h2 { font-weight:600; font-size:clamp(1.5rem, 2.4vw, 2.5rem); color:var(--navy); text-shadow:0 1px 0 rgba(255,255,255,.6); }
.sec-close p {
  font-family:'Noto Sans Hebrew',sans-serif; max-width:44rem; margin:1.4rem auto 0;
  font-size:clamp(.95rem, 1.2vw, 1.2rem); line-height:1.7;
}

/* ---------- 7 · FOOTER — CSS underwater scene ---------- */
.sec-footer {
  min-height:96vh; display:flex; overflow:hidden;
  background:linear-gradient(180deg, #135A86 0%, #0A3A66 26%, var(--footer-end) 66%, #020D2C 100%);
}
.sea { position:absolute; inset:0; z-index:0; pointer-events:none; }
/* waterline: previous section's paper color bites into the sea, slightly wavy */
.waterline { position:absolute; top:-1px; left:0; width:100%; height:70px; }
.waterline .wl-cut   { fill:#EDEBE4; }
.waterline .wl-shine { fill:rgba(210,240,255,.5); transform:translateY(3px); }
.waterline path { animation:wlDrift 9s ease-in-out infinite alternate; }
.waterline .wl-shine { animation-duration:7s; animation-direction:alternate-reverse; }
@keyframes wlDrift { from { transform:translateX(0); } to { transform:translateX(-26px); } }
/* god-rays */
.rays i {
  position:absolute; top:-6%; width:12vw; height:85%;
  background:linear-gradient(180deg, rgba(190,230,255,.30), rgba(190,230,255,.05) 55%, rgba(190,230,255,0) 80%);
  transform:skewX(-13deg);
  filter:blur(14px);
  mix-blend-mode:screen;
  animation:raySway 10s ease-in-out infinite alternate;
  opacity:.65;
}
@keyframes raySway {
  from { transform:skewX(-13deg) translateX(0);     opacity:.4; }
  to   { transform:skewX(-9deg)  translateX(-3vw);  opacity:.75; }
}
/* caustic light dancing on the floor */
.caustics { position:absolute; right:0; left:0; bottom:0; height:40%; }
.caustics::before, .caustics::after {
  content:''; position:absolute; inset:-20% -30%;
  background-image:radial-gradient(ellipse 90px 46px at 50% 50%, rgba(160,215,250,.20) 0%, rgba(160,215,250,0) 62%);
  background-size:230px 130px;
  mix-blend-mode:screen; filter:blur(5px);
  -webkit-mask-image:linear-gradient(transparent 0, #000 45%);
          mask-image:linear-gradient(transparent 0, #000 45%);
  animation:caust 16s linear infinite;
}
.caustics::after {
  background-size:340px 180px;
  background-image:radial-gradient(ellipse 130px 60px at 50% 50%, rgba(140,205,245,.14) 0%, rgba(140,205,245,0) 60%);
  animation-duration:23s; animation-direction:reverse;
}
@keyframes caust {
  from { transform:translateX(0)      translateY(0); }
  to   { transform:translateX(230px)  translateY(-24px); }
}
/* layout: stacked title right, contacts left with icons */
.footer-content {
  position:relative; z-index:2;
  width:100%;
  padding:16vh 5vw 9vh;
  display:flex; align-items:flex-end; justify-content:space-between; gap:3rem;
}
.footer-title { color:#fff; font-weight:800; font-size:clamp(3.2rem, 9vw, 10rem); line-height:.98; text-shadow:0 2px 22px rgba(2,13,44,.6); }
.footer-title .fxl { display:block; }
.footer-contact h3 { color:var(--gold); font-weight:500; font-size:clamp(1.05rem, 1.6vw, 1.5rem); margin-bottom:1.2rem; }
.footer-contact ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.7rem; }
.footer-contact a {
  display:inline-flex; align-items:center; gap:.65em;
  color:var(--offwhite); text-decoration:none;
  font-family:'Noto Sans Hebrew',sans-serif; font-size:1rem; line-height:1.55;
  transition:color .4s var(--ease);
}
.footer-contact a:hover { color:var(--cream); }
.c-ico { display:inline-flex; width:19px; height:19px; opacity:.85; }
.c-ico svg { width:100%; height:100%; }


/* --- water canvas fills the footer --- */
.sea-canvas { position:absolute; inset:0; width:100%; height:100%; display:block; }

/* --- typographic FX: letter ripple + channel-split ghosts --- */
.fx-skew { will-change:transform; }
.fxt .fxl { display:block; }
.fxt .fw { display:inline-block; white-space:pre; }
.fxt .fl { display:inline-block; position:relative; --k:0; --cx:0px; --cy:0px; will-change:transform; }
.fxt .fl::before, .fxt .fl::after {
  content:attr(data-ch);
  position:absolute; inset:0; pointer-events:none;
  text-shadow:none; opacity:calc(var(--k) * .85);
}
/* RGB split — ghosts offset along the local push direction */
.fxt-rgb .fl::before { color:#FF2A2A; transform:translate(var(--cx), var(--cy)); }
.fxt-rgb .fl::after  { color:#2A6BFF; transform:translate(calc(var(--cx) * -1), calc(var(--cy) * -1)); }
.fxt-rgb .fl { text-shadow:calc(var(--cx) * -.6) calc(var(--cy) * .6) 0 rgba(0,230,80,calc(var(--k) * .8)); }
/* CMYK split — print inks on the paper sections */
.fxt-cmyk .fl::before { color:#00C4DB; mix-blend-mode:multiply; transform:translate(var(--cx), var(--cy)); }
.fxt-cmyk .fl::after  { color:#E5289E; mix-blend-mode:multiply; transform:translate(calc(var(--cx) * -1), calc(var(--cy) * -1)); }
.fxt-cmyk .fl { text-shadow:calc(var(--cx) * -.6) calc(var(--cy) * .6) 0 rgba(250,220,0,calc(var(--k) * .9)); }
/* underwater refraction — footer title */
.fxt-water .fl::before, .fxt-water .fl::after { content:none; }
.fxt-water .fl {
  text-shadow:
    0 0 calc(var(--k) * 16px) rgba(140,225,255, calc(var(--k) * .95)),
    calc(var(--k) * 3px) calc(var(--k) * 2px) calc(var(--k) * 2px) rgba(80,180,230, calc(var(--k) * .6));
}

/* ---------- Mobile ---------- */
@media (max-width:768px){
  .op-nav { padding:.9rem 1.2rem; gap:1.4rem; }
  .nav-logo img { height:26px; }
  .nav-links { gap:1.1rem; }
  .nav-veil { height:64px; }
  .ruler { left:.55rem; gap:11px; }
  .ruler .tick { width:12px; }
  .ruler .tick.on { width:24px; }
  .identity-inner { flex-direction:column; align-items:stretch; padding:13vh 5vw 0; gap:1rem; }
  .identity-text { flex-direction:column; align-items:flex-start; gap:1.6rem; }
  .identity-logos { order:2; flex-direction:row; align-items:flex-end; gap:1.4rem; }
  .identity-titles { order:1; }
  .identity-name, .anim-title { font-size:clamp(2.6rem, 11vw, 4rem); }
  .identity-roles { font-size:clamp(1rem, 4vw, 1.3rem); }
  .identity-for { font-size:clamp(1rem, 4.5vw, 1.4rem); }
  .identity-photo { position:relative; height:auto; min-height:50vh; width:100%; pointer-events:auto; }  /* mobile keeps the stacked flow */
  .identity-photo img { height:100%; right:0; }
  .sailing-content, .news-content { width:auto; }
  .sailing-title { font-size:clamp(1.9rem, 7vw, 2.8rem); }
  .post-card { flex-basis:calc((100% - 1rem) / 1.15); }
  .op-form.work-form { flex-direction:column; align-items:stretch; }
  .op-form.work-form label { flex:0 0 auto; }  /* the 12rem basis turned into 192px-tall labels — the broken form */
  .footer-contact ul { gap:.95rem; }
  .footer-content { flex-direction:column; align-items:flex-start; gap:3rem; padding-top:13vh; }
  .footer-title { font-size:clamp(3rem, 16vw, 5rem); }
  .to-top { bottom:1rem; right:1rem; width:42px; height:42px; }
}

@media (prefers-reduced-motion: reduce){
  .aw .ch { animation:none !important; }
  .aw.out { display:none; }
  .bg-video { display:none; }
  .waterline path, .rays i, .caustics::before, .caustics::after { animation:none; }
  html:has(.op-root) { scroll-behavior:auto; }
}
`;
