"use client";

/* =====================================================================
 *  PAPER LAB  ·  /paper-lab   (noindexed tuning tool)
 *
 *  Drives the real <PaperTexture> shader that the blog posts use, so
 *  whatever you dial in here is exactly what ships. Every uniform the
 *  shader exposes has a slider, plus the CSS post-filter layer.
 *
 *  The A/B MIX slider is the important one: park the old look in slot A,
 *  the new look in slot B, then slide to 50% (or wherever) and hit
 *  "העתקת קוד" — it interpolates every number and both hex colours.
 *
 *  Nothing here is imported by the site. Safe to edit or delete.
 * ===================================================================== */

import { useEffect, useMemo, useRef, useState } from "react";
import { PaperTexture } from "@paper-design/shaders-react";

/* ---------------------------------------------------------------- types */
type Fit = "none" | "contain" | "cover";

type Settings = {
  colorBack: string;
  colorFront: string;
  contrast: number;
  roughness: number;
  fiber: number;
  fiberSize: number;
  crumples: number;
  crumpleSize: number;
  folds: number;
  foldCount: number;
  fade: number;
  drops: number;
  seed: number;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  fit: Fit;
  /* CSS post-filter, applied to the wrapper */
  saturate: number;
  brightness: number;
  cssContrast: number;
  opacity: number;
};

/* ------------------------------------------------------------- presets */

/* The look the site shipped with, before the last pass. */
const PRESET_OLD: Settings = {
  colorBack: "#f6f3e9",
  colorFront: "#c5ccd3",
  contrast: 0.36,
  roughness: 1,
  fiber: 0.27,
  fiberSize: 0.27,
  crumples: 0.51,
  crumpleSize: 0.33,
  folds: 0.57,
  foldCount: 8,
  fade: 0,
  drops: 0.13,
  seed: 546.8,
  scale: 0.5,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  fit: "cover",
  saturate: 1,
  brightness: 1,
  cssContrast: 1,
  opacity: 1,
};

/* The finer / less saturated pass. */
const PRESET_NEW: Settings = {
  ...PRESET_OLD,
  crumpleSize: 0.165,
  foldCount: 16,
  saturate: 0.8,
};

const FIELDS: {
  key: keyof Settings;
  label: string;
  min: number;
  max: number;
  step: number;
  group: "shader" | "sizing" | "css";
  hint?: string;
}[] = [
  { key: "contrast",   label: "קונטרסט (contrast)",      min: 0, max: 1, step: 0.01, group: "shader", hint: "חדות המעבר בין שני הצבעים" },
  { key: "roughness",  label: "חספוס גרעין (roughness)", min: 0, max: 1, step: 0.01, group: "shader", hint: "רעש פיקסלים – לא מושפע מהזום" },
  { key: "fiber",      label: "עוצמת סיבים (fiber)",     min: 0, max: 1, step: 0.01, group: "shader", hint: "הסיבים המתולתלים של הנייר" },
  { key: "fiberSize",  label: "גודל סיבים (fiberSize)",  min: 0, max: 1, step: 0.01, group: "shader" },
  { key: "crumples",   label: "עוצמת קימוטים (crumples)", min: 0, max: 1, step: 0.01, group: "shader" },
  { key: "crumpleSize",label: "גודל קימוטים (crumpleSize)", min: 0, max: 1, step: 0.005, group: "shader", hint: "קטן יותר = דוגמה צפופה ואמינה יותר" },
  { key: "folds",      label: "עומק קפלים (folds)",      min: 0, max: 1, step: 0.01, group: "shader" },
  { key: "foldCount",  label: "מספר קפלים (foldCount)",  min: 1, max: 15, step: 1, group: "shader" },
  { key: "fade",       label: "מסכת דהייה (fade)",       min: 0, max: 1, step: 0.01, group: "shader", hint: "רעש בקנה מידה גדול שמחליש את הדוגמה" },
  { key: "drops",      label: "נקודות/כתמים (drops)",    min: 0, max: 1, step: 0.01, group: "shader" },
  { key: "seed",       label: "זרע אקראי (seed)",        min: 0, max: 1000, step: 0.1, group: "shader", hint: "משנה את פיזור הקפלים והקימוטים" },

  { key: "scale",      label: "זום (scale)",             min: 0.01, max: 4, step: 0.01, group: "sizing" },
  { key: "rotation",   label: "סיבוב (rotation)",        min: 0, max: 360, step: 1, group: "sizing" },
  { key: "offsetX",    label: "היסט אופקי (offsetX)",    min: -1, max: 1, step: 0.01, group: "sizing" },
  { key: "offsetY",    label: "היסט אנכי (offsetY)",     min: -1, max: 1, step: 0.01, group: "sizing" },

  { key: "saturate",   label: "רוויה (CSS saturate)",    min: 0, max: 2, step: 0.01, group: "css", hint: "1 = ללא שינוי, 0.8 = פחות 20%" },
  { key: "brightness", label: "בהירות (CSS brightness)", min: 0.5, max: 1.5, step: 0.01, group: "css" },
  { key: "cssContrast",label: "קונטרסט (CSS contrast)",  min: 0.5, max: 1.5, step: 0.01, group: "css" },
  { key: "opacity",    label: "אטימות (opacity)",        min: 0, max: 1, step: 0.01, group: "css" },
];

const NUMERIC_KEYS = FIELDS.map((f) => f.key);

/* ------------------------------------------------------------ helpers */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}
function mixHex(a: string, b: string, t: number) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t));
}
function mixSettings(a: Settings, b: Settings, t: number): Settings {
  const out: any = { ...a };
  NUMERIC_KEYS.forEach((k) => { out[k] = lerp(a[k] as number, b[k] as number, t); });
  out.foldCount = Math.round(out.foldCount);
  out.colorBack = mixHex(a.colorBack, b.colorBack, t);
  out.colorFront = mixHex(a.colorFront, b.colorFront, t);
  out.fit = t < 0.5 ? a.fit : b.fit;
  return out as Settings;
}

/* round for display / for the emitted code */
const r = (n: number, dp = 3) => {
  const v = Number(n.toFixed(dp));
  return Object.is(v, -0) ? 0 : v;
};

/* ------------------------------------------------------- code emitter */
function emitCode(s: Settings) {
  const filters: string[] = [];
  if (r(s.saturate, 2) !== 1) filters.push("saturate(" + r(s.saturate, 2) + ")");
  if (r(s.brightness, 2) !== 1) filters.push("brightness(" + r(s.brightness, 2) + ")");
  if (r(s.cssContrast, 2) !== 1) filters.push("contrast(" + r(s.cssContrast, 2) + ")");

  const wrapperCss =
    ".paper-layer {\n" +
    "  position:fixed; inset:0; z-index:0; pointer-events:none;\n" +
    (filters.length ? "  filter:" + filters.join(" ") + ";\n" : "") +
    (r(s.opacity, 2) !== 1 ? "  opacity:" + r(s.opacity, 2) + ";\n" : "") +
    "}";

  const jsx =
    '<div className="paper-layer" aria-hidden>\n' +
    "  <PaperTexture\n" +
    '    colorBack="' + s.colorBack + '"\n' +
    '    colorFront="' + s.colorFront + '"\n' +
    "    contrast={" + r(s.contrast) + "}\n" +
    "    roughness={" + r(s.roughness) + "}\n" +
    "    fiber={" + r(s.fiber) + "}\n" +
    "    fiberSize={" + r(s.fiberSize) + "}\n" +
    "    crumples={" + r(s.crumples) + "}\n" +
    "    crumpleSize={" + r(s.crumpleSize) + "}\n" +
    "    folds={" + r(s.folds) + "}\n" +
    "    foldCount={" + Math.round(s.foldCount) + "}\n" +
    "    fade={" + r(s.fade) + "}\n" +
    "    drops={" + r(s.drops) + "}\n" +
    "    seed={" + r(s.seed, 1) + "}\n" +
    "    scale={" + r(s.scale) + "}\n" +
    (r(s.rotation) !== 0 ? "    rotation={" + r(s.rotation) + "}\n" : "") +
    (r(s.offsetX) !== 0 ? "    offsetX={" + r(s.offsetX) + "}\n" : "") +
    (r(s.offsetY) !== 0 ? "    offsetY={" + r(s.offsetY) + "}\n" : "") +
    '    fit="' + s.fit + '"\n' +
    '    style={{ width: "100%", height: "100%" }}\n' +
    "  />\n" +
    "</div>";

  return "/* --- CSS --- */\n" + wrapperCss + "\n\n/* --- JSX --- */\n" + jsx;
}

/* ===================================================================== */
export default function PaperLab() {
  const [a, setA] = useState<Settings>(PRESET_OLD);
  const [b, setB] = useState<Settings>(PRESET_NEW);
  const [mix, setMix] = useState(0.5);
  const [live, setLive] = useState<Settings>(() => mixSettings(PRESET_OLD, PRESET_NEW, 0.5));
  const [mode, setMode] = useState<"mix" | "manual">("mix");
  const [showText, setShowText] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const history = useRef<Settings[]>([]);

  /* in MIX mode the live settings are derived; in MANUAL they're edited directly */
  useEffect(() => {
    if (mode === "mix") setLive(mixSettings(a, b, mix));
  }, [mode, mix, a, b]);

  const set = (patch: Partial<Settings>) => {
    history.current.push(live);
    if (history.current.length > 60) history.current.shift();
    setMode("manual");
    setLive((s) => ({ ...s, ...patch }));
  };

  const undo = () => {
    const prev = history.current.pop();
    if (prev) setLive(prev);
  };

  const code = useMemo(() => emitCode(live), [live]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const cssFilter = [
    "saturate(" + r(live.saturate, 3) + ")",
    "brightness(" + r(live.brightness, 3) + ")",
    "contrast(" + r(live.cssContrast, 3) + ")",
  ].join(" ");

  const group = (g: "shader" | "sizing" | "css") => FIELDS.filter((f) => f.group === g);

  const Slider = ({ f }: { f: (typeof FIELDS)[number] }) => (
    <label className="row">
      <span className="row-label">
        {f.label}
        {f.hint && <i className="hint">{f.hint}</i>}
      </span>
      <input
        type="range"
        min={f.min}
        max={f.max}
        step={f.step}
        value={live[f.key] as number}
        onChange={(e) => set({ [f.key]: parseFloat(e.target.value) } as any)}
      />
      <input
        className="num"
        type="number"
        min={f.min}
        max={f.max}
        step={f.step}
        value={r(live[f.key] as number)}
        onChange={(e) => set({ [f.key]: parseFloat(e.target.value || "0") } as any)}
      />
    </label>
  );

  return (
    <div className="lab" dir="rtl" lang="he">
      <style>{CSS}</style>

      {/* live background — exactly the markup the posts use */}
      <div
        className="paper-layer"
        aria-hidden
        style={{ filter: cssFilter, opacity: live.opacity }}
      >
        <PaperTexture
          colorBack={live.colorBack}
          colorFront={live.colorFront}
          contrast={live.contrast}
          roughness={live.roughness}
          fiber={live.fiber}
          fiberSize={live.fiberSize}
          crumples={live.crumples}
          crumpleSize={live.crumpleSize}
          folds={live.folds}
          foldCount={Math.round(live.foldCount)}
          fade={live.fade}
          drops={live.drops}
          seed={live.seed}
          scale={live.scale}
          rotation={live.rotation}
          offsetX={live.offsetX}
          offsetY={live.offsetY}
          fit={live.fit}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* a slab of real post content, so the texture is judged in context */}
      {showText && (
        <div className="sample">
          <h1>כשהמשתמשים שלך לא יודעים לקרוא את השם שלך</h1>
          <p className="sample-lede">
            אחוז הולך וגדל באינסטגרם שלי עשוי ע״י בומרים ו-Xרים שמתלוננים על כך שהנוער קורא פחות
            ופחות, ומורים שטוענים במפורש, עם דמעות בעיניים, שהבוגרים שלהם לא יודעים לקרוא…
          </p>
          <p>
            ואנחנו מדברים פה על אינסטגרם, כן? הפלטפורמה שלוקחת את התכנים האלה ועושה בהם מה שהיא רוצה
            כי הם שלה עכשיו, יודעת על מה דברים בסרטונים, מי רואה וכמה בדיוק.
          </p>
          <div className="sample-card">
            כרטיס על רקע בהיר, עם קו תוחם עדין — כדי לראות איך הטקסטורה מתנהגת מאחורי וסביב מלבנים.
          </div>
        </div>
      )}

      <button className="toggle" onClick={() => setPanelOpen((v) => !v)}>
        {panelOpen ? "הסתרת הפאנל ←" : "→ פאנל"}
      </button>

      {panelOpen && (
        <aside className="panel">
          <header className="panel-head">
            <h2>Paper Lab</h2>
            <p>הסליידרים מזינים את אותו שיידר שרץ בפוסטים. מה שרואים פה הוא מה שיישלח.</p>
          </header>

          {/* ---- A/B mix ---- */}
          <section className="block block-mix">
            <h3>ערבוב בין שתי גרסאות</h3>
            <div className="ab">
              <div className="ab-slot">
                <b>A</b>
                <button onClick={() => { setA(live); setMode("mix"); }}>שמירת הנוכחי ל-A</button>
                <button className="ghost" onClick={() => { setA(PRESET_OLD); setMode("mix"); }}>הישן</button>
              </div>
              <div className="ab-slot">
                <b>B</b>
                <button onClick={() => { setB(live); setMode("mix"); }}>שמירת הנוכחי ל-B</button>
                <button className="ghost" onClick={() => { setB(PRESET_NEW); setMode("mix"); }}>החדש</button>
              </div>
            </div>
            <label className="row row-mix">
              <span className="row-label">
                מיקס A ← B
                <i className="hint">
                  {mode === "mix" ? "מצב ערבוב פעיל" : "נותקת מהערבוב — הזזת הסליידר תחזיר אותו"}
                </i>
              </span>
              <input
                type="range" min={0} max={1} step={0.01} value={mix}
                onChange={(e) => { setMode("mix"); setMix(parseFloat(e.target.value)); }}
              />
              <span className="num num-static">{Math.round(mix * 100)}%</span>
            </label>
            <div className="quick">
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <button key={v} className={mode === "mix" && mix === v ? "on" : ""}
                  onClick={() => { setMode("mix"); setMix(v); }}>
                  {Math.round(v * 100)}%
                </button>
              ))}
            </div>
          </section>

          {/* ---- colours ---- */}
          <section className="block">
            <h3>צבעים</h3>
            <label className="row row-color">
              <span className="row-label">רקע (colorBack)</span>
              <input type="color" value={live.colorBack} onChange={(e) => set({ colorBack: e.target.value })} />
              <input className="num num-hex" type="text" value={live.colorBack}
                onChange={(e) => set({ colorBack: e.target.value })} />
            </label>
            <label className="row row-color">
              <span className="row-label">חזית (colorFront)<i className="hint">צבע הקימוטים והסיבים</i></span>
              <input type="color" value={live.colorFront} onChange={(e) => set({ colorFront: e.target.value })} />
              <input className="num num-hex" type="text" value={live.colorFront}
                onChange={(e) => set({ colorFront: e.target.value })} />
            </label>
          </section>

          <section className="block">
            <h3>שיידר</h3>
            {group("shader").map((f) => <Slider key={f.key as string} f={f} />)}
            <button className="wide ghost" onClick={() => set({ seed: Math.round(Math.random() * 10000) / 10 })}>
              זרע אקראי חדש ⟳
            </button>
          </section>

          <section className="block">
            <h3>מיקום וזום</h3>
            {group("sizing").map((f) => <Slider key={f.key as string} f={f} />)}
            <label className="row row-fit">
              <span className="row-label">התאמה (fit)</span>
              <div className="seg">
                {(["none", "contain", "cover"] as Fit[]).map((v) => (
                  <button key={v} className={live.fit === v ? "on" : ""} onClick={() => set({ fit: v })}>{v}</button>
                ))}
              </div>
            </label>
          </section>

          <section className="block">
            <h3>שכבת CSS מעל</h3>
            {group("css").map((f) => <Slider key={f.key as string} f={f} />)}
          </section>

          <section className="block block-out">
            <div className="acts">
              <button className="wide primary" onClick={copy}>{copied ? "הועתק ✓" : "העתקת קוד"}</button>
              <button className="ghost" onClick={undo}>ביטול</button>
              <button className="ghost" onClick={() => { setMode("mix"); setMix(0.5); setA(PRESET_OLD); setB(PRESET_NEW); }}>איפוס</button>
              <button className="ghost" onClick={() => setShowText((v) => !v)}>{showText ? "בלי טקסט" : "עם טקסט"}</button>
            </div>
            <pre className="code" dir="ltr">{code}</pre>
          </section>
        </aside>
      )}
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@400;700&display=swap');

.lab {
  --ink:#0d1b3e; --muted:#5b678a; --line:rgba(13,27,62,.16);
  --pane:rgba(255,255,255,.9);
  font-family:'Noto Sans Hebrew', Arial, sans-serif;
  color:var(--ink);
  min-height:100vh; position:relative;
}
.lab * { box-sizing:border-box; }

.paper-layer { position:fixed; inset:0; z-index:0; pointer-events:none; }

/* sample content */
.sample {
  position:relative; z-index:1;
  width:min(620px, 92vw);
  margin:0 auto; padding:5rem 0 8rem;
  line-height:1.9; font-size:1.05rem;
}
.sample h1 { font-size:clamp(1.6rem,3.6vw,2.6rem); line-height:1.15; margin:0 0 1.4rem; }
.sample-lede { font-size:1.2rem; }
.sample p { margin:0 0 1.4rem; }
.sample-card {
  background:#fdfcf6; border:1.5px solid var(--line); border-radius:18px;
  padding:1.3rem; font-size:.98rem;
}

/* toggle */
.toggle {
  position:fixed; top:1rem; left:1rem; z-index:30;
  background:var(--ink); color:#fff; border:none; border-radius:10px;
  padding:.6rem 1rem; font-family:inherit; font-size:.9rem; cursor:pointer;
}

/* panel */
.panel {
  position:fixed; top:0; left:0; bottom:0; z-index:20;
  width:min(430px, 100vw);
  background:var(--pane);
  backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
  border-left:1px solid var(--line);
  overflow-y:auto;
  padding:1.2rem 1.1rem 3rem;
}
.panel-head { padding:2.4rem .2rem 1rem; }
.panel-head h2 { margin:0; font-size:1.3rem; }
.panel-head p { margin:.4rem 0 0; font-size:.82rem; color:var(--muted); line-height:1.55; }

.block { border-top:1px solid var(--line); padding:1rem .2rem; }
.block h3 { margin:0 0 .8rem; font-size:.95rem; }

.row { display:grid; grid-template-columns:1fr 130px 62px; gap:.6rem; align-items:center; margin-bottom:.55rem; }
.row-label { font-size:.82rem; line-height:1.3; display:flex; flex-direction:column; }
.hint { font-style:normal; font-size:.7rem; color:var(--muted); margin-top:.15rem; }
.row input[type=range] { width:100%; accent-color:var(--ink); }
.num {
  width:100%; font-family:ui-monospace, Menlo, monospace; font-size:.76rem;
  border:1px solid var(--line); border-radius:7px; padding:.32rem .3rem; text-align:center;
  background:#fff; color:var(--ink);
}
.num-static { display:block; text-align:center; font-size:.78rem; font-family:ui-monospace, Menlo, monospace; }
.num-hex { direction:ltr; }
.row-color { grid-template-columns:1fr 46px 88px; }
.row-color input[type=color] { width:46px; height:30px; padding:0; border:1px solid var(--line); border-radius:7px; background:none; }
.row-fit { grid-template-columns:1fr 200px; }

.seg, .quick { display:flex; gap:.3rem; }
.seg button, .quick button {
  flex:1; font-family:inherit; font-size:.75rem; cursor:pointer;
  border:1px solid var(--line); background:#fff; color:var(--ink);
  border-radius:7px; padding:.35rem .2rem;
}
.seg button.on, .quick button.on { background:var(--ink); color:#fff; border-color:var(--ink); }
.quick { margin-top:.5rem; }

.block-mix { background:rgba(13,27,62,.04); border-radius:12px; padding:1rem .8rem; border-top:none; margin-bottom:.6rem; }
.ab { display:grid; grid-template-columns:1fr 1fr; gap:.6rem; margin-bottom:.9rem; }
.ab-slot { display:flex; flex-direction:column; gap:.3rem; align-items:stretch; }
.ab-slot b { font-size:.8rem; text-align:center; }
.row-mix { grid-template-columns:1fr 130px 46px; }

.panel button {
  font-family:inherit; cursor:pointer;
  border:1px solid var(--line); background:#fff; color:var(--ink);
  border-radius:8px; padding:.42rem .6rem; font-size:.78rem;
}
.panel button:hover { border-color:var(--ink); }
.panel button.primary { background:var(--ink); color:#fff; border-color:var(--ink); font-size:.9rem; padding:.6rem; }
.panel button.wide { width:100%; }
.acts { display:flex; flex-wrap:wrap; gap:.4rem; margin-bottom:.8rem; }
.acts .primary { flex:1 0 100%; }

.code {
  direction:ltr; text-align:left;
  background:#0d1b3e; color:#dfe6f5;
  font-family:ui-monospace, Menlo, monospace; font-size:.68rem; line-height:1.55;
  padding:.9rem; border-radius:10px; margin:0;
  white-space:pre; overflow-x:auto; max-height:340px;
}

@media (max-width: 720px) {
  .panel { width:100vw; top:auto; height:72vh; border-left:none; border-top:1px solid var(--line); }
  .sample { padding:4rem 0 76vh; }
  .row { grid-template-columns:1fr 110px 56px; }
}
`;
