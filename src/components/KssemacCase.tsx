"use client";

/* =====================================================================
   KssemacCase — mini case study: the KsseMac world card, embedded in
   the one-pager (sec-works). The differentiation is deliberate: the
   card carries kssemac.com's own design DNA (blue, dark, 2.4rem radii,
   its ease, its fake-mac window) as a "specimen" inside the page.
   · Keycap flip logo: original vector faces (kssemacFaces.ts),
     original timing (610ms / stagger 100 / hold 1000).
   · Loop demo: the original typing engine, condensed script rage→fix.
   Approved via the standalone Vercel preview (amitbrin-kssemac-preview).
   ===================================================================== */

import { useEffect, useRef } from "react";
import { FHE, FEN } from "./kssemacFaces";

/* ---- condensed rage→fix script for the demo window ---- */
type Step =
  | { t: "cap"; s: string }
  | { t: "boom" }
  | { t: "badge"; s: string }
  | { t: "pause"; ms: number }
  | { t: "type"; s: string; cps: number }
  | { t: "del"; cps: number }
  | { t: "replace"; s: string }
  | { t: "shake"; lvl: number }
  | { t: "flash" };

const SCRIPT: Step[] = [
  { t: "cap", s: "שולחים הודעה. העיניים על המקלדת." },
  { t: "pause", ms: 500 },
  { t: "type", s: "akuo akuo, nv bang?", cps: 72 },
  { t: "pause", ms: 700 },
  { t: "cap", s: "מרימים את הראש למסך. אה." },
  { t: "shake", lvl: 1 },
  { t: "pause", ms: 800 },
  { t: "cap", s: "מוחקים. מחליפים שפה. לכאורה." },
  { t: "del", cps: 24 },
  { t: "pause", ms: 450 },
  { t: "type", s: "akuo", cps: 80 },
  { t: "pause", ms: 550 },
  { t: "cap", s: "המקלדת לא באמת התחלפה." },
  { t: "shake", lvl: 2 },
  { t: "pause", ms: 750 },
  { t: "del", cps: 28 },
  { t: "badge", s: "עב" },
  { t: "pause", ms: 400 },
  { t: "type", s: "aשלום", cps: 90 },
  { t: "pause", ms: 500 },
  { t: "cap", s: "עכשיו האות הראשונה נתקעה על אנגלית." },
  { t: "shake", lvl: 3 },
  { t: "pause", ms: 750 },
  { t: "boom" },
  { t: "pause", ms: 1400 },
  { t: "cap", s: "לצעקה הזאת יש אפליקציה." },
  { t: "del", cps: 30 },
  { t: "badge", s: "EN" },
  { t: "pause", ms: 400 },
  { t: "type", s: "akuo akuo, nv bang?", cps: 44 },
  { t: "pause", ms: 600 },
  { t: "cap", s: 'לוחצים <span class="km-chip">⌘ ⌘</span> וזהו.' },
  { t: "pause", ms: 550 },
  { t: "flash" },
  { t: "replace", s: "שלום שלום, מה נשמע?" },
  { t: "badge", s: "עב" },
  { t: "pause", ms: 850 },
  { t: "type", s: " יאללה, ממשיכים.", cps: 70 },
  { t: "pause", ms: 600 },
  { t: "cap", s: "<b>שלוש שניות. כולל ההקלדה.</b>" },
  { t: "pause", ms: 2600 },
];

export default function KssemacCase() {
  const keysRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  /* ---- keycap flip wave: קססעמאק ⇄ KSSEMAC ---- */
  useEffect(() => {
    const host = keysRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const keys = Array.from(host.querySelectorAll<HTMLElement>(".km-key3d"));
    if (!keys.length) return;
    let alive = true;
    const timers: number[] = [];
    const sleep = (ms: number) =>
      new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));

    const D = 610, STAG = 100, HOLD = 1000;
    const offsets = [0, 0.26, 0.5, 0.7, 0.83, 1];
    const FWD = [0, 20, -150, -195, -160, -180];
    const BCK = [-180, -200, -30, 15, -20, 0];
    const SCL = [1, 1, 1.1, 1.03, 1.017, 1];

    function wave(dir: "fwd" | "bck") {
      const n = keys.length;
      keys.forEach((el, i) => {
        const step = dir === "fwd" ? n - 1 - i : i;
        const A = dir === "fwd" ? FWD : BCK;
        el.animate(
          A.map((deg, j) => ({
            transform: `rotateX(${deg}deg) scale(${SCL[j]})`,
            offset: offsets[j],
            easing: "cubic-bezier(.45,.05,.35,1)",
          })),
          { duration: D, delay: step * STAG, fill: "forwards" }
        );
      });
      return (keys.length - 1) * STAG + D;
    }

    (async () => {
      await sleep(700);
      while (alive) {
        let t = wave("fwd");
        await sleep(t + HOLD);
        if (!alive) break;
        t = wave("bck");
        await sleep(t + HOLD);
      }
    })();

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  /* ---- loop demo: original typing engine, starts when scrolled into view ---- */
  useEffect(() => {
    const root = demoRef.current;
    if (!root) return;
    const typed = root.querySelector<HTMLElement>(".km-typed");
    const cap = root.querySelector<HTMLElement>(".km-democap");
    const badge = root.querySelector<HTMLElement>(".km-langbadge");
    const win = root.querySelector<HTMLElement>(".km-win");
    if (!typed || !cap || !badge || !win) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true;
    let running = false;
    const timers: number[] = [];
    const sleep = (ms: number) =>
      new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));

    async function setCap(html: string, boom: boolean) {
      cap!.classList.add("fade");
      await sleep(180);
      cap!.classList.toggle("boom", boom);
      cap!.innerHTML = html || "&nbsp;";
      cap!.classList.remove("fade");
    }

    async function run() {
      if (running) return;
      running = true;
      while (alive) {
        typed!.textContent = "";
        badge!.textContent = "EN";
        badge!.classList.remove("he");
        for (const s of SCRIPT) {
          if (!alive) return;
          switch (s.t) {
            case "cap":
              await setCap(s.s, false);
              break;
            case "boom":
              await setCap("קססע<span>מאק</span>.", true);
              break;
            case "badge":
              badge!.textContent = s.s;
              badge!.classList.toggle("he", s.s !== "EN");
              break;
            case "pause":
              await sleep(reduce ? Math.min(s.ms, 400) : s.ms);
              break;
            case "type":
              for (const ch of s.s) {
                typed!.textContent += ch;
                await sleep(s.cps);
              }
              break;
            case "del": {
              const n = typed!.textContent!.length;
              for (let i = 0; i < n; i++) {
                typed!.textContent = typed!.textContent!.slice(0, -1);
                await sleep(s.cps);
              }
              break;
            }
            case "replace":
              typed!.textContent = s.s;
              break;
            case "shake": {
              const cls = "shake" + s.lvl;
              win!.classList.add(cls);
              await sleep(360 * s.lvl + 90);
              win!.classList.remove(cls);
              break;
            }
            case "flash": {
              const chip = cap!.querySelector(".km-chip");
              if (chip) {
                chip.classList.add("flash");
                await sleep(500);
                chip.classList.remove("flash");
              }
              break;
            }
          }
        }
        await sleep(2200);
      }
    }

    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            run();
            io.disconnect();
          }
        }),
      { threshold: 0.35 }
    );
    io.observe(root);

    return () => {
      alive = false;
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="km-shell" data-reveal>
      <div className="km-core">
        <div className="km-top">
          <span className="km-eyebrow">
            <span className="km-dot" />
            עברית ⇄ אנגלית · קיצור אחד
          </span>
          <div className="km-keys" ref={keysRef} aria-label="KsseMac">
            {FHE.map((he, i) => (
              <div className="km-key" key={i}>
                <div className="km-key3d">
                  <div className="km-face km-face-he" dangerouslySetInnerHTML={{ __html: he }} />
                  <div className="km-face km-face-en" dangerouslySetInnerHTML={{ __html: FEN[i] }} />
                </div>
              </div>
            ))}
          </div>
          <p className="km-sum">
            הקלדתם שורה שלמה בשפה הלא נכונה? KsseMac יודעת מה התכוונתם להקליד: קיצור
            אחד ממיר את הטקסט <b>במקום שבו נכתב</b> - ומשאיר את המקלדת על השפה הנכונה.
          </p>
        </div>

        <div className="km-grid">
          <div className="km-text">
            <div className="km-lab">הסיפור</div>
            <div className="km-story">
              <p>
                זה מתחיל תמיד אותו דבר: העיניים על המקלדת, שורה שלמה נכתבת בביטחון מלא
                - ובמסך מחכה akuo akuo. מוחקים, מחליפים שפה (לכאורה), מקלידים שוב -
                והאות הראשונה נתקעת על אנגלית. לצעקה שנפלטת ברגע הזה קוראים{" "}
                <span className="km-scream">
                  קססע<span>מאק</span>.
                </span>{" "}
                עכשיו יש לה גם אפליקציה.
              </p>
              <p>
                בניתי את KsseMac סביב מקרה אחד מאוד ספציפי - ולכן היא עושה אותו כמו
                שצריך. מוצר שלם מיוזמה אישית: <b>אפיון, עיצוב, כתיבה, פיתוח והפצה</b> -
                עד קובץ חתום ומאושר של Apple שנמכר היום באתר משלו.
              </p>
            </div>

            <div className="km-insights">
              <div className="km-lab">ארבע תובנות שהפכו להחלטות</div>
              <div className="km-ins">
                <span className="km-cap" />
                <div>
                  <h4>&quot;זו לא בעיית תרגום, זו בעיית מיפוי.&quot;</h4>
                  <p>המרה דטרמיניסטית של המקשים שנלחצו בפועל - מדויקת בשני הכיוונים, בלי AI ובלי ניחושים.</p>
                </div>
              </div>
              <div className="km-ins">
                <span className="km-cap" />
                <div>
                  <h4>&quot;הכאב האמיתי הוא הלופ, לא הטעות.&quot;</h4>
                  <p>תיקון במקום + החלפת שפת הקלט אוטומטית. האות הבאה כבר נכונה, והלופ נשבר כולו - לא רק הסימפטום.</p>
                </div>
              </div>
              <div className="km-ins">
                <span className="km-cap" />
                <div>
                  <h4>&quot;כלי שקורא טקסט חייב להרוויח אמון.&quot;</h4>
                  <p>הכול מקומי על ה-Mac: בלי ענן, בלי חשבון, שדות סיסמה מחוץ לתחום - והסבר גלוי על כל הרשאה.</p>
                </div>
              </div>
              <div className="km-ins">
                <span className="km-cap" />
                <div>
                  <h4>&quot;מוצר למקרה אחד צריך לדעת להיעלם.&quot;</h4>
                  <p>אייקון ב-Menu Bar, אפס חלונות, כלום ב-Dock. שם כשצריך, שקוף כשלא.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="km-demo" ref={demoRef}>
            <div className="km-lab km-lab-center">
              לאפליקציה אין כמעט ממשק - אז במקום מסכים, הנה הלופ עצמו:
            </div>
            <div className="km-win">
              <div className="km-wininner">
                <div className="km-winbar">
                  <span className="km-windots"><i /><i /><i /></span>
                  <span className="km-wintitle">הודעות</span>
                  <span className="km-langbadge">EN</span>
                </div>
                <div className="km-winbody">
                  <span className="km-typed" />
                  <span className="km-caret" />
                </div>
              </div>
            </div>
            <p className="km-democap">&nbsp;</p>
          </div>
        </div>

        <div className="km-foot">
          <div className="km-meta">
            <span>2026 · יוזמה עצמית</span>
            <span>מוצר חי · 9₪</span>
            <span>macOS 14+ · Universal</span>
          </div>
          <a className="km-btn" href="https://kssemac.com" target="_blank" rel="noopener noreferrer">
            kssemac.com <span className="km-arr">↗</span>
          </a>
        </div>
      </div>

      <style>{KM_CSS}</style>
    </div>
  );
}

/* =====================================================================
   KsseMac world CSS — tokens ported 1:1 from kssemac.com.
   All classes km-prefixed; the card is self-contained by design (the
   "foreign object" look, incl. rounded corners, is the differentiation).
   ===================================================================== */
const KM_CSS = `
.km-shell {
  --km-blue:#0078FC; --km-blue-deep:#005EC4;
  --km-dark:#07090D; --km-dark-card:#0E1219;
  --km-hair:rgba(255,255,255,.09);
  --km-ink:#EDEFF3; --km-soft:rgba(237,239,243,.62);
  --km-ease:cubic-bezier(.32,.72,0,1);
  --km-font:-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  --km-mono:ui-monospace, "SF Mono", Menlo, Consolas, "Courier New", monospace;
  max-width:1200px; margin:0 auto; padding:10px;
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.09);
  border-radius:2.4rem;
}
.km-core {
  position:relative; overflow:hidden;
  background:var(--km-dark); color:var(--km-ink);
  border:1px solid rgba(255,255,255,.05);
  border-radius:calc(2.4rem - 10px);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05);
  font-family:var(--km-font);
  padding:clamp(2.2rem,4vw,3.6rem) clamp(1.4rem,4.5vw,4.2rem) clamp(1.9rem,3.2vw,2.8rem);
}
.km-core::before {
  content:''; position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(ellipse 62% 42% at 50% 0%, rgba(0,120,252,.14), transparent 70%);
}
.km-core > * { position:relative; }

.km-top { text-align:center; max-width:760px; margin:0 auto; }
.km-eyebrow {
  display:inline-flex; align-items:center; gap:9px;
  border:1px solid var(--km-hair); background:rgba(255,255,255,.05);
  border-radius:999px; padding:7px 17px; font-size:.85rem; font-weight:600;
  letter-spacing:.05em; color:rgba(255,255,255,.6);
}
.km-dot { width:7px; height:7px; border-radius:50%; background:var(--km-blue); box-shadow:0 0 0 3px rgba(0,120,252,.15); }

.km-keys {
  direction:ltr; display:flex; justify-content:center; gap:.047em;
  margin:2.2rem auto 1.8rem; font-size:clamp(30px, 5.4vw, 60px);
}
.km-key { width:.959em; height:1em; position:relative; perspective:3.2em; }
.km-key3d { position:absolute; inset:0; transform-style:preserve-3d; will-change:transform; }
.km-face { position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden; }
.km-face svg { width:100%; height:100%; display:block; }
.km-face-en { transform:rotateX(180deg); }
@media (prefers-reduced-motion: reduce){ .km-key3d { transform:rotateX(180deg) !important; } }

.km-sum { font-size:clamp(1.02rem,1.7vw,1.22rem); line-height:1.75; color:var(--km-soft); }
.km-sum b { color:var(--km-ink); font-weight:700; }

.km-grid {
  display:grid; grid-template-columns:1.05fr 1fr;
  gap:clamp(2.2rem,4.5vw,4.2rem);
  margin-top:clamp(2.4rem,4vw,3.4rem); align-items:start;
}
.km-lab {
  font-family:var(--km-mono); font-size:.72rem; letter-spacing:.14em;
  color:rgba(255,255,255,.38); margin-bottom:1.15rem;
}
.km-lab-center { text-align:center; }
.km-story p { font-size:1.01rem; line-height:1.78; color:var(--km-soft); margin-bottom:1.1rem; }
.km-story p b { color:var(--km-ink); font-weight:700; }
.km-scream { color:#fff; font-weight:800; }
.km-scream span { color:var(--km-blue); }

.km-insights { margin-top:1.9rem; }
.km-ins {
  display:flex; gap:16px; align-items:flex-start;
  padding:.88rem 0; border-top:1px solid rgba(255,255,255,.07);
}
.km-ins:last-child { border-bottom:1px solid rgba(255,255,255,.07); }
.km-cap {
  flex:none; width:15px; height:15px; margin-top:.42em; border-radius:4px;
  background:linear-gradient(180deg, var(--km-blue), var(--km-blue-deep));
  box-shadow:0 2px 0 var(--km-blue-deep), 0 0 14px rgba(0,120,252,.35);
}
.km-ins h4 { font-size:1.02rem; font-weight:800; color:var(--km-ink); line-height:1.5; margin:0; font-family:var(--km-font); }
.km-ins p { font-size:.94rem; line-height:1.75; color:var(--km-soft); margin-top:.3rem; }

.km-demo { position:sticky; top:8vh; }
.km-win {
  background:var(--km-dark-card); border:1px solid var(--km-hair); border-radius:1.6rem;
  padding:8px; max-width:640px; margin:0 auto;
  box-shadow:0 40px 90px -30px rgba(0,0,0,.7), 0 0 110px -12px rgba(0,120,252,.5), inset 0 1px 0 rgba(255,255,255,.06);
}
.km-wininner {
  background:#0A0D12; border:1px solid rgba(255,255,255,.06);
  border-radius:calc(1.6rem - 8px); overflow:hidden;
}
.km-winbar {
  display:flex; align-items:center; gap:8px; padding:12px 16px;
  border-bottom:1px solid rgba(255,255,255,.06);
}
.km-windots { display:flex; gap:7px; direction:ltr; }
.km-windots i { width:11px; height:11px; border-radius:50%; display:block; }
.km-windots i:nth-child(1){ background:#FF5F57; }
.km-windots i:nth-child(2){ background:#FEBC2E; }
.km-windots i:nth-child(3){ background:#28C840; }
.km-wintitle { flex:1; text-align:center; font-size:.8rem; color:rgba(255,255,255,.35); font-weight:500; }
.km-langbadge {
  font-family:var(--km-mono); font-size:.72rem; font-weight:600;
  border:1px solid rgba(255,255,255,.14); border-radius:6px; padding:2px 8px;
  color:rgba(255,255,255,.6); background:rgba(255,255,255,.04); min-width:34px; text-align:center;
  transition:all .3s var(--km-ease);
}
.km-langbadge.he { color:#fff; background:var(--km-blue); border-color:var(--km-blue); }
.km-winbody {
  min-height:132px; padding:24px 22px; font-family:var(--km-mono);
  font-size:clamp(.95rem,2vw,1.18rem); direction:rtl; text-align:right; color:var(--km-ink);
  display:flex; align-items:flex-start;
}
.km-typed { white-space:pre-wrap; word-break:break-word; unicode-bidi:plaintext; }
.km-caret {
  display:inline-block; width:2px; height:1.25em; background:var(--km-blue); vertical-align:text-bottom;
  margin-right:1px; animation:km-blink 1s steps(1) infinite;
}
@keyframes km-blink { 50%{ opacity:0; } }
.km-win.shake1 { animation:km-shk1 .35s var(--km-ease); }
.km-win.shake2 { animation:km-shk2 .35s var(--km-ease) 2; }
.km-win.shake3 { animation:km-shk3 .35s var(--km-ease) 3; }
@keyframes km-shk1 { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(2px)} }
@keyframes km-shk2 { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-9px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(4px)} }
@keyframes km-shk3 { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-14px)} 40%{transform:translateX(12px)} 60%{transform:translateX(-9px)} 80%{transform:translateX(6px)} }
.km-democap {
  text-align:center; margin-top:1.35rem; min-height:2.6em; font-size:1.08rem;
  color:#52A5FF; font-weight:600;
  font-family:var(--km-font);
  transition:opacity .35s var(--km-ease), font-size .55s var(--km-ease);
}
.km-democap.fade { opacity:0; }
.km-democap.boom {
  font-size:clamp(1.8rem,3.6vw,2.7rem); font-weight:800; color:#fff; letter-spacing:-.02em;
  text-shadow:0 0 60px rgba(0,120,252,.4);
}
.km-democap.boom span { color:var(--km-blue); }
.km-democap b { color:#fff; font-weight:700; }
.km-chip {
  display:inline-flex; align-items:center; gap:6px; direction:ltr;
  font-family:var(--km-mono); font-size:.88rem;
  border:1px solid rgba(255,255,255,.16); border-radius:10px; padding:3px 11px;
  background:rgba(255,255,255,.05); color:#fff; margin:0 6px; vertical-align:middle;
  transition:all .25s var(--km-ease);
}
.km-chip.flash { background:var(--km-blue); border-color:var(--km-blue); box-shadow:0 0 24px rgba(0,120,252,.65); }

.km-foot {
  margin-top:clamp(2.2rem,3.4vw,2.9rem);
  display:flex; align-items:center; justify-content:space-between; gap:1.5rem; flex-wrap:wrap;
  border-top:1px solid rgba(255,255,255,.07); padding-top:1.5rem;
}
.km-meta { display:flex; gap:10px; flex-wrap:wrap; }
.km-meta span {
  font-family:var(--km-mono); font-size:.72rem; letter-spacing:.05em;
  color:rgba(255,255,255,.5); border:1px solid rgba(255,255,255,.1);
  border-radius:999px; padding:6px 13px; background:rgba(255,255,255,.03);
}
.km-btn {
  display:inline-flex; align-items:center; gap:12px; border-radius:999px; text-decoration:none;
  font-weight:700; font-size:.98rem; padding:13px 15px 13px 22px; direction:ltr;
  font-family:var(--km-mono); letter-spacing:.02em;
  background:var(--km-blue); color:#fff;
  box-shadow:0 18px 40px -14px rgba(0,120,252,.55), inset 0 1px 0 rgba(255,255,255,.3);
  transition:transform .5s var(--km-ease), background .5s var(--km-ease);
}
.km-arr {
  width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  background:rgba(255,255,255,.18); font-size:.95rem;
  transition:transform .5s var(--km-ease);
}
.km-btn:hover { background:var(--km-blue-deep); transform:translateY(-2px); }
.km-btn:hover .km-arr { transform:translate(3px,-1px) scale(1.06); }
.km-btn:active { transform:scale(.975); }

@media (max-width:1240px){ .km-shell { margin-inline:16px; } }
@media (max-width:900px){
  .km-grid { grid-template-columns:1fr; gap:2.6rem; }
  .km-demo { position:static; order:-1; }
  .km-shell { margin-inline:12px; border-radius:1.8rem; }
  .km-core { border-radius:calc(1.8rem - 10px); }
  .km-foot { justify-content:center; text-align:center; }
}
`;
