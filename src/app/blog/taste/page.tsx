"use client";

/* =====================================================================
 *  BLOG POST — "מה הטעם לעצב בלי טעם?" · GENERATOR EDITION
 *  The post as a human designed it, with an OS X alert pinned in a fixed
 *  slot: "לייצר לעמוד הזה עיצוב חדש? You cannot undo this action."
 *  OK = the page "thinks" (shimmer), then gets a design assembled from
 *  bins of AI-aesthetic clichés — layout × type × scale × palette × media
 *  treatment × decoration × motion × numbering. 202,500 combinations, all
 *  "designed", none of them read the text. The panel itself never restyles.
 *  Route: /blog/taste
 *  Media: /public/media/blog/taste/  (iphone-unboxing.mp4 is dropped in by Amit)
 * ===================================================================== */

import { useEffect, useRef, useState } from "react";
import PostDate from "../../../components/PostDate";
import SiteNav from "../../../components/SiteNav";
import { relatedTo } from "../../../components/postsIndex";

const SLUG = "taste";
const TITLE = "מה הטעם לעצב בלי טעם?";
const URL = `https://www.amitbrin.com/blog/${SLUG}`;
const M = "/media/blog/taste";
const FORMSPREE = "https://formspree.io/f/xpqvaarr";

/* Moderated comments. Formspree mails every submission to Amit; the ones he
   wants public are pasted here, newest first. Empty list = nothing rendered. */
const COMMENTS: { name: string; date: string; text: string }[] = [];

/* ---------- the generator: bins of clichés ---------- */
const BINS = {
  layout: ["center", "ltr", "magazine", "justify", "bento"],
  type: ["inter", "serif", "grotesk", "mono", "heavy"],
  scale: ["display", "tight", "flat"],
  pal: ["cream", "violet", "glass", "sage", "acid", "blush"],
  rad: ["sharp", "soft", "pill"],
  media: ["mono", "duotone", "warm", "punch", "faded"],
  deco: ["blob", "dots", "sparkle", "grid", "rail"],
  motion: ["shimmer", "fade", "gradientbar"],
  num: ["on", "off"],
} as const;
type Bin = keyof typeof BINS;
type Choice = Record<Bin, string>;
const TOTAL = Object.values(BINS).reduce((a, b) => a * b.length, 1);

const WHY: Record<Bin, Record<string, string>> = {
  layout: { center: "מירכזתי הכול כי זה מרגיש מאוזן", ltr: "יישרתי לשמאל כי ככה זה נראה בכל הרפרנסים", magazine: "גריד מגזיני עם כותרות בצד לתחושה עורכית", justify: "יישור לשני הצדדים ואות פתיחה כמו בספר", bento: "חילקתי לכרטיסים כדי שיהיה קל לסרוק" },
  type: { inter: "Inter כי הוא נקי וקריא", serif: "סריף מוסיף נגיעה אנושית ועורכית", grotesk: "גרוטסק גיאומטרי לתחושה עכשווית", mono: "מונוספייס כדי לשדר אותנטיות טכנית", heavy: "כותרות כבדות כדי לתת נוכחות" },
  scale: { display: "כותרת ענקית כדי ליצור impact", tight: "היררכיה צפופה כי זה מרגיש מקצועי", flat: "כותרות קטנות ב-uppercase לתחושת מערכת" },
  pal: { cream: "פלטת קרם חמה כי היא מרגישה premium", violet: "סגול כהה משדר חדשנות ו-AI-native", glass: "זכוכית מטושטשת מוסיפה עומק", sage: "ירוק מרווה כי הוא רגוע ובר-קיימא", acid: "accent חומצי על שחור לאמירה נועזת", blush: "ורוד עדין כי זה מרגיש אנושי" },
  rad: { sharp: "פינות חדות לאמירה מינימליסטית", soft: "רדיוס 12px כדי להיות ידידותי", pill: "רדיוס גדול כי זה מרגיש רך ונגיש" },
  media: { mono: "תמונות בשחור-לבן לאחידות", duotone: "דואוטון בצבע ה-accent כדי שהכול ידבר אותו דבר", warm: "חימום התמונות לתחושה נוסטלגית", punch: "הגברת רוויה כדי שיקפוץ", faded: "דהייה קלה וצל רך למראה עדין" },
  deco: { blob: "כתם גרדיאנט ברקע מוסיף חיים", dots: "גריד נקודות מרמז על precision", sparkle: "הוספתי ✦ כדי לרמוז על AI", grid: "רשת עדינה ברקע לתחושת מערכת", rail: "פס צבע לצד הפסקאות כדי להדגיש" },
  motion: { shimmer: "שימר על הכותרת כדי להראות ש״זה חושב״", fade: "fade-up עדין כי זה מרגיש מלוטש", gradientbar: "קו גרדיאנט מתחת לכותרת כדי להבליט אותה" },
  num: { on: "מספור 01/02 לסקשנים כי זה נראה מסודר", off: "בלי מספור, לניקיון" },
};

const pick = (arr: readonly string[], prev?: string) => {
  let v: string;
  do v = arr[Math.floor(Math.random() * arr.length)];
  while (arr.length > 1 && v === prev);
  return v;
};

/* ---------- the invader from the cover, drawn from a bitmap ---------- */
const INVADER = ["00100000100", "00010001000", "00111111100", "01101110110", "11111111111", "10111111101", "10100000101", "00011011000"];
function Invader() {
  return (
    <svg className="invader" viewBox="0 0 11 8" aria-hidden>
      {INVADER.flatMap((row, y) => [...row].map((c, x) => (c === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#e0742c" /> : null)))}
    </svg>
  );
}

/* ---------- live OS X menubar clock inside the cover — "Tue 3:30 PM" ---------- */
function OsClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => { const d = new Date(); setT(d.toLocaleDateString("en-US", { weekday: "short" }) + " " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })); };
    tick(); const id = setInterval(tick, 15000); return () => clearInterval(id);
  }, []);
  return <span className="osclock" aria-hidden>{t}</span>;
}

/* ---------- streaming demo — my own lines ---------- */
const LINES = ["> generating taste…", "> 100 options in 0.8s. quality: unknown.", "> confidence: 100%"];
function Term() {
  const [txt, setTxt] = useState("");
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setTxt(LINES.join("\n")); return; }
    let li = 0, ci = 0, t: ReturnType<typeof setTimeout>;
    const type = () => {
      const l = LINES[li];
      if (ci <= l.length) { setTxt(LINES.slice(0, li).join("\n") + (li ? "\n" : "") + l.slice(0, ci)); ci++; t = setTimeout(type, 34 + Math.random() * 50); }
      else if (li < LINES.length - 1) { li++; ci = 0; t = setTimeout(type, 500); }
      else t = setTimeout(() => { li = 0; ci = 0; type(); }, 3200);
    };
    type(); return () => clearTimeout(t);
  }, []);
  return <div className="term">{txt}</div>;
}

/* ---------- pull-quote with share row ---------- */
function Pull({ q, children }: { q: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  // credit when it fits; X caps at 280 so a long quote drops the credit and keeps the link
  const full = `״${q}״ — מתוך הפוסט ״${TITLE}״ של עמית ברין`;
  const short = `״${q}״`;
  const text = (full + " " + URL).length <= 270 ? full : short;
  const enc = encodeURIComponent(text + " " + URL);
  const copy = async () => {
    try {
      if (navigator.share) { await navigator.share({ text, url: URL }); return; }
      await navigator.clipboard.writeText(text + " " + URL); setCopied(true); setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  return (
    <div className="pull">
      <p>{children}</p>
      <div className="share">
        <span>שיתוף הציטוט:</span>
        <a href={`https://wa.me/?text=${enc}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a href={`https://www.linkedin.com/feed/?shareActive=true&text=${enc}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href={`https://x.com/intent/post?text=${enc}`} target="_blank" rel="noopener noreferrer">X</a>
        <button type="button" onClick={copy} className={copied ? "copied" : ""}>{copied ? "הועתק" : "העתקה"}</button>
      </div>
    </div>
  );
}

/* ---------- click-to-play video with sound (autoplay with audio is blocked by browsers) ---------- */
function SoundVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const play = () => { const v = ref.current; if (!v) return; v.muted = false; v.volume = 1; v.play().then(() => setPlaying(true)).catch(() => {}); };
  return (
    <div className={"vid media" + (playing ? " playing" : "")}>
      <video ref={ref} src={src} poster={poster} controls={playing} preload="metadata" playsInline onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />
      <button type="button" className="play" onClick={play} aria-label="הפעלת הסרטון עם סאונד"><span>▶&nbsp; להפעיל עם סאונד — זה ASMR</span></button>
    </div>
  );
}

/* ---------- comments: Formspree + moderated list ---------- */
function Comments() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const form = e.currentTarget; setState("sending");
    try { const r = await fetch(FORMSPREE, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) }); if (r.ok) { setState("ok"); form.reset(); } else setState("err"); } catch { setState("err"); }
  };
  return (
    <div className="closer">
      <h3>תגובות</h3>
      <p className="note">תגובות מגיעות ישירות אליי. בואו נדבר על זה.</p>
      {state === "ok" ? <p className="ok-msg">תודה! התגובה נשלחה.</p> : (
        <form className="comments" onSubmit={submit}>
          <input type="hidden" name="_subject" value={`תגובה חדשה בבלוג: ${TITLE}`} />
          <input type="hidden" name="post" value={SLUG} />
          <input type="text" name="name" placeholder="שם" aria-label="שם" required />
          <input type="email" name="email" placeholder="אימייל (לא יפורסם)" aria-label="אימייל" required />
          <textarea name="comment" rows={3} placeholder="מה דעתך? (בלי שימר)" aria-label="תגובה" required />
          <button type="submit" disabled={state === "sending"}>{state === "sending" ? "שולח…" : "שליחה"}</button>
          {state === "err" && <p className="err-msg">משהו השתבש בשליחה. אפשר לנסות שוב, או פשוט לכתוב לי למייל.</p>}
        </form>
      )}
      {COMMENTS.length > 0 && (
        <ul className="clist">
          {COMMENTS.map((c, i) => <li key={i}><b>{c.name}<time>{c.date}</time></b>{c.text}</li>)}
        </ul>
      )}
    </div>
  );
}

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@400;700;900&family=Heebo:wght@300;400;700;900&family=Frank+Ruhl+Libre:wght@400;700;900&family=Rubik:wght@400;500;700&family=Suez+One&family=David+Libre:wght@400;700&family=Inter:wght@400;600&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400&family=Space+Grotesk:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap');

/* =====================================================================
   BASELINE — the post as a human designed it (site template paper).
   Committed single world; every color painted explicitly.
   ===================================================================== */
.tp{
  --bg:#ffffff; --ink:#111111; --ink-soft:#5c5c5c; --rule:#111111; --accent:#111111; --on-accent:#fff; --card:#ffffff;
  --display:'Noto Sans Hebrew','Heebo',sans-serif; --body:'Heebo','Noto Sans Hebrew',sans-serif; --mono:'JetBrains Mono',Menlo,monospace;
  --h1:clamp(34px,4.6vw,54px); --h2:28px; --h3:21px; --p:18px; --lh:1.75; --measure:64ch;
  --align:right; --radius:0px; --wrap:760px;
  --img-filter:none; --img-radius:0px;
}
.tp *{box-sizing:border-box}
.tp{margin:0;direction:rtl;background:var(--bg);color:var(--ink);font-family:var(--body);font-size:var(--p);line-height:var(--lh);font-weight:300;padding:0 0 340px;transition:background .5s,color .5s}
.tp a{color:inherit}
.tp h1,.tp h2,.tp h3{font-family:var(--display);line-height:1.12;text-wrap:balance;margin:0;color:var(--ink)}
.tp p{margin:0 0 1.15em;max-width:var(--measure);text-align:var(--align)}
.tp strong{font-weight:700}
.tp figure.cover{margin:0;position:relative;width:100%;max-width:none}
.tp .cover img{width:100%;height:auto;display:block}
.tp .cover .osclock{position:absolute;top:0;right:1.55%;height:3.9%;display:flex;align-items:center;font:700 clamp(9px,1.15vw,16px) 'Lucida Grande','Noto Sans Hebrew',sans-serif;color:#111;letter-spacing:.01em;direction:ltr;pointer-events:none}
.tp .wrap{max-width:var(--wrap);margin:0 auto;padding:40px 24px 0}
.tp .kicker{font-family:var(--mono);font-size:12.5px;color:var(--ink-soft);letter-spacing:.04em;margin:0 0 18px;text-align:var(--align)}
.tp h1{font-size:var(--h1);font-weight:900;margin:0 0 .35em;text-align:var(--align)}
.tp .lede{font-size:calc(var(--p) * 1.18);font-weight:400;max-width:var(--measure)}
.tp h2{font-size:var(--h2);font-weight:900;margin:2em 0 .5em;text-align:var(--align)}
.tp h3{font-size:var(--h3);font-weight:700;margin:1.6em 0 .4em;text-align:var(--align)}
.tp .sec{position:relative}
.tp .num{display:none}
.tp figure{margin:2em 0;max-width:var(--wrap)}
.tp figure img{width:100%;height:auto;display:block;filter:var(--img-filter);border-radius:var(--img-radius);transition:filter .6s,border-radius .6s}
.tp .media{position:relative;overflow:hidden;border-radius:var(--img-radius)}
.tp .media::after{content:"";position:absolute;inset:0;pointer-events:none;background:var(--img-overlay,none);mix-blend-mode:var(--img-blend,normal);opacity:var(--img-overlay-o,0)}
.tp figcaption{font-size:13.5px;color:var(--ink-soft);margin-top:10px;line-height:1.5;text-align:var(--align)}
.tp .video{aspect-ratio:16/9;background:#0e0e0e;display:grid;place-items:center;color:#9a9a9a;font-family:var(--mono);font-size:13px;border-radius:var(--img-radius);filter:var(--img-filter)}
.tp blockquote{margin:1.6em 0;padding:0 20px 0 0;border-right:2px solid var(--rule);font-size:calc(var(--p)*1.05);max-width:var(--measure);font-weight:400}
.tp blockquote.en{direction:ltr;text-align:left;padding:0 0 0 20px;border-right:0;border-left:2px solid var(--rule);font-family:'Fraunces',Georgia,serif;font-style:italic}
.tp blockquote cite{display:block;font-style:normal;font-size:13px;color:var(--ink-soft);margin-top:6px;font-family:var(--mono)}

/* pull-quotes: inline, shareable */
.tp .pull{margin:2.2em 0;padding:22px 0;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);max-width:var(--measure)}
.tp .pull p{font-family:var(--display);font-weight:700;font-size:calc(var(--p)*1.3);line-height:1.35;margin:0 0 12px;max-width:none}
.tp .share{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-family:var(--mono);font-size:12px;color:var(--ink-soft)}
.tp .share a,.tp .share button{font:inherit;color:var(--ink);background:none;border:1px solid var(--ink);border-radius:var(--radius);padding:4px 10px;cursor:pointer;text-decoration:none;line-height:1.4}
.tp .share a:hover,.tp .share button:hover{background:var(--ink);color:var(--bg)}
.tp .share .copied{color:var(--accent)}

/* the two clichés, separately, on my own text */
.tp .demo{margin:1.8em 0;max-width:var(--measure);border:1px solid var(--rule);padding:18px 20px;border-radius:var(--radius);background:var(--card)}
.tp .demo .cap{font-size:13.5px;color:var(--ink-soft);line-height:1.5;margin:12px 0 0;padding-top:10px;border-top:1px solid color-mix(in srgb,var(--rule) 40%,transparent);max-width:none}
.tp .demo .lab{font-family:var(--mono);font-size:11.5px;color:var(--ink-soft);margin-bottom:8px;letter-spacing:.04em}
.tp .shimmer{font-family:var(--display);font-weight:700;font-size:22px;
  background:linear-gradient(90deg,var(--ink-soft) 0%,var(--ink-soft) 40%,var(--bg) 50%,var(--ink-soft) 60%,var(--ink-soft) 100%);
  background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shimmer 1.7s linear infinite}
.tp[data-pal] .shimmer{background-image:linear-gradient(90deg,var(--ink-soft) 40%,var(--accent) 50%,var(--ink-soft) 60%)}
@keyframes shimmer{from{background-position:120% 0}to{background-position:-120% 0}}
.tp .term{font-family:var(--mono);font-size:14px;line-height:1.8;direction:ltr;text-align:left;white-space:pre-wrap;min-height:4.8em;color:var(--ink)}
.tp .term::after{content:"▍";animation:blink 1s steps(2) infinite;color:var(--accent)}
@keyframes blink{50%{opacity:0}}

.tp .sources{margin-top:3em;padding-top:1.2em;border-top:1px solid var(--rule);font-size:14.5px;max-width:var(--measure)}
.tp .sources h3{margin:0 0 .6em;font-size:15px}
.tp .sources ol{margin:0;padding:0 1.2em 0 0;line-height:1.6}
.tp .sources li{margin:0 0 .35em;padding-inline-start:4px;text-align:var(--align)}

/* post closers — part of the page, restyle with it */
.tp .post-end{margin-top:4em;padding-top:2em;border-top:2px solid var(--rule);display:grid;gap:34px;max-width:var(--measure)}
.tp .closer h3{margin:0 0 .6em;font-size:16px}
.tp .closer .note{font-size:15px;color:var(--ink-soft);margin:0 0 14px}
.tp .comments{display:grid;gap:10px;max-width:520px}
.tp .comments input,.tp .comments textarea{font:inherit;font-size:15px;padding:10px 12px;border:1px solid var(--rule);background:var(--card);color:var(--ink);border-radius:var(--radius);width:100%}
.tp .comments button{font:700 14px var(--body);padding:10px 18px;border:1.5px solid var(--ink);background:var(--accent);color:var(--on-accent);border-radius:var(--radius);cursor:pointer;justify-self:start}
.tp .more{max-width:none}
.tp .post-end{max-width:none}
.tp .post-end>.closer:not(.more){max-width:var(--measure)}
.tp .rail{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.tp .card{display:grid;gap:8px;text-decoration:none;color:var(--ink);border:1px solid var(--rule);border-radius:var(--radius);padding:12px;background:var(--card);box-shadow:var(--card-shadow,none);align-content:start;transition:transform .25s}
.tp .card:hover{transform:translateY(-3px)}
.tp .card .media{display:block;aspect-ratio:16/10;overflow:hidden;border-radius:var(--img-radius)}
.tp .card .media img{width:100%;height:100%;object-fit:cover;display:block;filter:var(--img-filter)}
.tp .card strong{font-family:var(--display);font-size:17px;line-height:1.3;font-weight:700}
.tp .card span:last-child{font-size:14px;line-height:1.5;color:var(--ink-soft);text-align:var(--align)}
.tp[data-layout="center"].gen .card{text-align:center}
.tp[data-layout="ltr"].gen .card{text-align:left}
.tp[data-deco="sparkle"].gen .card strong::before{content:"✦ ";color:var(--accent)}
.tp[data-deco="rail"].gen .card{border-inline-start:3px solid var(--accent)}
@media (max-width:700px){.tp .rail{grid-template-columns:1fr}}

/* ---------- THE PANEL — the dialog from the cover. Fixed slot, fixed style: never restyled ---------- */
.tp .panel{position:fixed;right:22px;bottom:22px;z-index:60;width:min(520px,calc(100vw - 32px));background:#f2f2f2;color:#111;
  border:1px solid #9c9c9c;border-radius:8px;box-shadow:0 22px 60px rgba(0,0,0,.45);overflow:hidden;transition:transform .35s;font-family:'Lucida Grande','Noto Sans Hebrew',sans-serif;font-weight:400;direction:rtl}
.tp .panel .bar{height:20px;background:repeating-linear-gradient(#f4f4f4 0 2px,#e4e4e4 2px 4px);border-bottom:1px solid #a6a6a6}
.tp .panel .row{display:grid;grid-template-columns:60px 1fr;gap:16px;align-items:start;padding:14px 24px 14px}
.tp .invader{width:60px;height:60px;display:block}

.tp .panel h4{margin:0 0 4px;white-space:pre-line;font-family:'Noto Sans Hebrew','Lucida Grande',sans-serif;font-size:16px;font-weight:900;line-height:1.25;text-align:right;color:#111}
.tp .panel .sub{font-family:'Lucida Grande','JetBrains Mono',sans-serif;font-size:11.5px;color:#444;margin:0 0 12px;direction:ltr;text-align:right;line-height:1.5}
.tp .btns{display:flex;gap:10px;direction:ltr;justify-content:flex-start}
.tp .btn{font:13px/1 'Lucida Grande','Noto Sans Hebrew',sans-serif;min-width:94px;height:28px;border-radius:14px;border:1px solid #6a6a6a;background:linear-gradient(#fff,#dcdcdc);color:#111;cursor:pointer;box-shadow:0 1px 1px rgba(0,0,0,.25)}
.tp .btn.ok{background:linear-gradient(#a9c8f7 0%,#5f97ee 45%,#2f6fdc 50%,#79b0ff 100%);color:#fff;border-color:#2a4f9c;text-shadow:0 -1px 0 rgba(0,0,0,.35);animation:pulse 1.6s ease-in-out infinite}
@keyframes pulse{50%{box-shadow:0 0 0 4px rgba(95,151,238,.35)}}
.tp .btn:disabled{opacity:.55;cursor:default;animation:none}
.tp .btn:focus-visible{outline:2px solid #ffb400;outline-offset:2px}
.tp .panel .status{display:none;font-family:'JetBrains Mono',monospace;font-size:12px;color:#2a63c7;margin:0 0 10px}
.tp .panel.busy .status{display:block}
.tp .panel .log{display:none;font-family:'JetBrains Mono',monospace;font-size:11px;color:#555;line-height:1.55;margin:0;padding:10px 24px 12px;border-top:1px dashed #c9c9c9;white-space:pre-line;text-align:right;background:#fafafa}
.tp .panel.has-log .log{display:block}

/* ---------- THINKING: the cliché, applied to the whole page ---------- */
.tp.thinking .wrap :is(h1,h2,h3,p,li,figcaption,blockquote){
  background:linear-gradient(90deg,var(--ink-soft) 40%,var(--bg) 50%,var(--ink-soft) 60%);background-size:220% 100%;
  -webkit-background-clip:text;background-clip:text;color:transparent!important;animation:shimmer 1.1s linear infinite}
.tp.thinking figure img,.tp.thinking .video{filter:blur(6px) saturate(.4)}

/* =====================================================================
   GENERATED — bins. Layout, type scale, alignment, palette, media
   treatment, decoration, motion. Every combo looks "designed".
   ===================================================================== */
.tp.gen{font-weight:var(--p-weight,400)}
/* the cover stays as designed — full width, no filter, no radius */
.tp.gen h1{font-weight:var(--h-weight,700);letter-spacing:var(--h-track,0)}
.tp.gen h2{font-weight:var(--h-weight,700)}
.tp.gen .btn{font-family:var(--body)}

/* layouts */
.tp[data-layout="center"]{--wrap:640px;--align:center;--measure:none;--cover-w:640px}
.tp[data-layout="center"].gen .pull,.tp[data-layout="center"].gen .demo,.tp[data-layout="center"].gen .sources,.tp[data-layout="center"].gen blockquote{margin-inline:auto}
.tp[data-layout="center"].gen .share{justify-content:center}
.tp[data-layout="center"].gen blockquote{border:0;padding:0}
.tp[data-layout="ltr"]{--align:left;--wrap:880px;--cover-w:880px}
.tp[data-layout="ltr"].gen{direction:ltr}
.tp[data-layout="ltr"].gen .wrap :is(p,.tp h1,.tp h2,.tp h3,.tp li,.tp figcaption){direction:rtl;text-align:left}
.tp[data-layout="ltr"].gen blockquote{border-right:0;border-left:2px solid var(--rule);padding:0 0 0 20px}
.tp[data-layout="magazine"]{--wrap:1080px;--measure:58ch}
.tp[data-layout="magazine"].gen .sec{display:grid;grid-template-columns:260px minmax(0,1fr);gap:40px;align-items:start;margin-top:3em}
.tp[data-layout="magazine"].gen .sec>h2{position:sticky;top:20px;margin:0;font-size:22px;line-height:1.3;border-top:2px solid var(--accent);padding-top:12px}
.tp[data-layout="magazine"].gen .sec>*:not(h2){grid-column:2}
.tp[data-layout="magazine"].gen .head{display:grid;grid-template-columns:260px 1fr;gap:40px}
.tp[data-layout="magazine"].gen .head h1{grid-column:1/3}
.tp[data-layout="magazine"].gen .head .kicker{grid-column:1;margin:0}
.tp[data-layout="magazine"].gen .head .lede{grid-column:2}
.tp[data-layout="justify"]{--wrap:700px;--align:justify;--measure:none;--lh:1.85}
.tp[data-layout="justify"].gen p{text-align:justify;hyphens:auto}
.tp[data-layout="justify"].gen .lede::first-letter{font-family:var(--display);font-size:3.6em;float:right;line-height:.8;margin:6px 0 0 10px;color:var(--accent)}
.tp[data-layout="bento"]{--wrap:1000px;--measure:none}
.tp[data-layout="bento"].gen .sec{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:2.5em}
.tp[data-layout="bento"].gen .sec>h2{grid-column:1/-1;margin:0 0 4px}
.tp[data-layout="bento"].gen .sec>p{background:var(--card);border:1px solid color-mix(in srgb,var(--ink) 10%,transparent);border-radius:var(--radius);padding:20px 22px;margin:0;box-shadow:var(--card-shadow);font-size:calc(var(--p)*.94)}
.tp[data-layout="bento"].gen .sec>:is(figure,.tp .pull,.tp .demo,.tp blockquote){grid-column:1/-1;margin:8px 0}
.tp[data-layout="bento"].gen .head h1{font-size:clamp(44px,8vw,110px)}

/* type pairings */
.tp[data-type="inter"]{--display:'Inter','Heebo',sans-serif;--body:'Heebo','Noto Sans Hebrew',sans-serif;--h-weight:600;--h-track:-.02em}
.tp[data-type="serif"]{--display:'Fraunces','Frank Ruhl Libre',serif;--body:'Frank Ruhl Libre','David Libre',serif;--h-weight:400;--p-weight:400}
.tp[data-type="grotesk"]{--display:'Space Grotesk','Rubik',sans-serif;--body:'Rubik','Noto Sans Hebrew',sans-serif;--h-weight:700}
.tp[data-type="mono"]{--display:'JetBrains Mono','Suez One',monospace;--body:'Noto Sans Hebrew',sans-serif;--h-weight:700}
.tp[data-type="heavy"]{--display:'Suez One','Heebo',serif;--body:'Heebo',sans-serif;--h-weight:400;--p-weight:300}
/* scales */
.tp[data-scale="display"]{--h1:clamp(56px,9vw,120px);--h2:44px;--h3:26px;--p:19px;--lh:1.7}
.tp[data-scale="tight"]{--h1:34px;--h2:20px;--h3:17px;--p:15.5px;--lh:1.65}
.tp[data-scale="flat"]{--h1:26px;--h2:15px;--h3:14px;--p:17px;--lh:1.8}
.tp[data-scale="flat"].gen :is(h2,.tp h3,.tp .kicker){text-transform:uppercase;letter-spacing:.16em;font-weight:600;color:var(--accent)}
.tp[data-scale="flat"].gen h1{font-weight:500}
/* numbering cliché */
.tp[data-num="on"].gen .num{display:block;font-family:var(--mono);font-size:12px;color:var(--accent);letter-spacing:.2em;margin:0 0 6px}
/* palettes */
.tp[data-pal="cream"]{--bg:#F5F1E8;--ink:#1C1917;--ink-soft:#7A736B;--rule:#D9D2C5;--accent:#E8632B;--on-accent:#fff;--card:#FFFDF9;--card-shadow:0 1px 2px rgba(0,0,0,.05)}
.tp[data-pal="violet"]{--bg:#0B0A14;--ink:#F2F0FF;--ink-soft:#9A95B8;--rule:#2A2745;--accent:#9D6BFF;--on-accent:#fff;--card:#16152A;--card-shadow:0 0 0 1px rgba(157,107,255,.18),0 12px 30px rgba(0,0,0,.5)}
.tp[data-pal="glass"]{--bg:#E9EFF8;--ink:#0F172A;--ink-soft:#5B6478;--rule:#C9D3E3;--accent:#2563EB;--on-accent:#fff;--card:rgba(255,255,255,.6);--card-shadow:0 8px 30px rgba(15,23,42,.08)}
.tp[data-pal="sage"]{--bg:#EEEFE6;--ink:#1F2A22;--ink-soft:#6A7468;--rule:#CFD3C2;--accent:#4F7A5C;--on-accent:#fff;--card:#F9FAF3;--card-shadow:0 1px 3px rgba(0,0,0,.06)}
.tp[data-pal="acid"]{--bg:#0A0A0A;--ink:#F5F5F5;--ink-soft:#8A8A8A;--rule:#262626;--accent:#C6FF3D;--on-accent:#111;--card:#161616;--card-shadow:0 0 0 1px #262626}
.tp[data-pal="blush"]{--bg:#FBF3F1;--ink:#2B1B1E;--ink-soft:#8C7377;--rule:#EBD6D3;--accent:#D94A6A;--on-accent:#fff;--card:#fff;--card-shadow:0 2px 10px rgba(217,74,106,.08)}
/* radii */
.tp[data-rad="sharp"]{--radius:0}
.tp[data-rad="soft"]{--radius:12px}
.tp[data-rad="pill"]{--radius:24px}
/* media treatments */
.tp[data-media="mono"]{--img-filter:grayscale(1) contrast(1.1);--img-radius:var(--radius)}
.tp[data-media="duotone"]{--img-filter:grayscale(1) contrast(1.2);--img-overlay:var(--accent);--img-blend:screen;--img-overlay-o:.55;--img-radius:var(--radius)}
.tp[data-media="duotone"].gen .media::after{background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 30%,var(--ink)))}
.tp[data-media="warm"]{--img-filter:sepia(.45) saturate(1.3) contrast(.95);--img-radius:var(--radius)}
.tp[data-media="punch"]{--img-filter:saturate(1.8) contrast(1.25);--img-radius:calc(var(--radius) * 2)}
.tp[data-media="faded"]{--img-filter:contrast(.85) brightness(1.08) saturate(.7);--img-radius:var(--radius)}
.tp[data-media="faded"].gen figure img{box-shadow:0 30px 60px -20px rgba(0,0,0,.35)}
/* decorations */
.tp::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:0}
.tp[data-deco="blob"].gen::before{opacity:1;background:radial-gradient(45% 40% at 15% 5%,color-mix(in srgb,var(--accent) 28%,transparent),transparent 70%),radial-gradient(40% 45% at 85% 70%,color-mix(in srgb,var(--accent) 18%,transparent),transparent 70%)}
.tp[data-deco="dots"].gen::before{opacity:1;background-image:radial-gradient(color-mix(in srgb,var(--ink) 14%,transparent) 1px,transparent 1px);background-size:22px 22px}
.tp[data-deco="sparkle"].gen :is(h2,.tp h3)::before{content:"✦ ";color:var(--accent)}
.tp[data-deco="sparkle"].gen .kicker::before{content:"✦ "}
.tp[data-deco="grid"].gen::before{opacity:1;background-image:linear-gradient(color-mix(in srgb,var(--ink) 7%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--ink) 7%,transparent) 1px,transparent 1px);background-size:64px 64px}
.tp[data-deco="rail"].gen .sec>p{border-inline-start:3px solid var(--accent);padding-inline-start:16px}
/* motion */
.tp[data-motion="shimmer"].gen h1{background:linear-gradient(90deg,var(--ink) 40%,var(--accent) 50%,var(--ink) 60%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shimmer 2.4s linear infinite}
.tp[data-motion="fade"].gen .wrap>*{animation:up .7s ease both}
.tp[data-motion="gradientbar"].gen h1{border-bottom:6px solid;border-image:linear-gradient(90deg,var(--accent),color-mix(in srgb,var(--accent) 30%,var(--bg))) 1;padding-bottom:14px}
@keyframes up{from{opacity:0;transform:translateY(14px)}}


@media (max-width:860px){
  .tp .wrap{padding:28px 18px 0}
  .tp .panel{right:12px;left:12px;bottom:12px;width:auto}
  .tp[data-layout="magazine"].gen .sec,.tp[data-layout="magazine"].gen .head,.tp[data-layout="bento"].gen .sec{grid-template-columns:1fr}
  .tp[data-layout="magazine"].gen .sec>*:not(h2){grid-column:auto}
  .tp[data-layout="magazine"].gen .sec>h2{position:static}
}
@media (prefers-reduced-motion:reduce){.tp *{animation:none!important;transition:none!important}}

/* site nav: dissolve in after 100px of scroll; transparent and inert over the cover's menubar */
.tp .op-nav,.tp .nav-veil{transition:opacity .55s cubic-bezier(.32,.72,0,1)}
.tp.nav-off .op-nav,.tp.nav-off .nav-veil{opacity:0;pointer-events:none}
/* real media */
.tp .vid{position:relative;border-radius:var(--img-radius);overflow:hidden;background:#000;filter:var(--img-filter)}
.tp .vid video{width:100%;display:block;aspect-ratio:16/9}
.tp .vid .play{position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.25);color:#fff;border:0;cursor:pointer;font:700 15px var(--body)}
.tp .vid .play span{display:inline-flex;align-items:center;gap:10px;padding:12px 20px;border:1.5px solid #fff;border-radius:999px;background:rgba(0,0,0,.45);backdrop-filter:blur(6px)}
.tp .vid.playing .play{display:none}
.tp .yt{position:relative;aspect-ratio:16/9;border-radius:var(--img-radius);overflow:hidden;background:#000}
.tp .yt iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.tp .clist{margin:26px 0 0;padding:0;list-style:none;display:grid;gap:14px;max-width:520px}
.tp .clist li{border-top:1px solid var(--rule);padding-top:12px;font-size:15px}
.tp .clist b{display:block;font-size:14px}
.tp .clist time{font-family:var(--mono);font-size:11.5px;color:var(--ink-soft);margin-inline-start:8px}
.tp .ok-msg{color:var(--accent);font-weight:700}
.tp .err-msg{color:#c0392b;font-size:14px}
`;

export default function TastePost() {
  const root = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [gen, setGen] = useState<{ n: number; choice: Choice | null; secs: string }>({ n: 0, choice: null, secs: "" });
  const [hidden, setHidden] = useState(false);
  /* the site nav dissolves in only after 100px of scroll — the top 100px are
     the cover's own menubar (with the live clock), and the nav must not sit on it */
  const [navOn, setNavOn] = useState(false);
  useEffect(() => {
    const on = () => setNavOn(window.scrollY > 100);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const last = useRef<Partial<Choice>>({});
  const related = relatedTo(SLUG);

  const generate = () => {
    if (busy) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setBusy(true);
    const t0 = performance.now();
    setTimeout(() => {
      const choice = {} as Choice;
      (Object.keys(BINS) as Bin[]).forEach((k) => { choice[k] = pick(BINS[k], last.current[k]); });
      last.current = choice;
      setGen((g) => ({ n: g.n + 1, choice, secs: ((performance.now() - t0) / 1000).toFixed(1) }));
      setBusy(false);
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }, reduce ? 200 : 1500);
  };

  const dataAttrs = gen.choice ? Object.fromEntries((Object.keys(gen.choice) as Bin[]).map((k) => [`data-${k}`, gen.choice![k]])) : {};
  const keys = gen.choice ? (Object.keys(gen.choice) as Bin[]) : [];
  const postShare = encodeURIComponent(TITLE + " " + URL);
  const [copiedLink, setCopiedLink] = useState(false);
  const copyLink = async () => { try { await navigator.clipboard.writeText(URL); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 1600); } catch {} };

  return (
    <div ref={root} className={"tp" + (gen.choice ? " gen" : "") + (busy ? " thinking" : "") + (navOn ? "" : " nav-off")} {...dataAttrs}>
      <style>{CSS}</style>
      <SiteNav current="blog" />

      <figure className="cover">
        <img src={`${M}/cover.jpg`} alt="דיאלוג במערכת Mac OS X Aqua: מה הטעם לעצב בלי טעם? You cannot undo this action. OK / Cancel" width={1400} height={706} />
        <OsClock />
      </figure>

      <main className="wrap">
        <div className="head">
          <p className="kicker">amitbrin.com / blog · <PostDate slug={SLUG} /></p>
          <h1>{TITLE}</h1>
          <p className="lede">בשנת 2,000 (שפעם קראנו לה ״העתיד״ ועכשיו היא נשמעת כמו מספר חסר חשיבות) סטיב ג'ובס עלה על הבמה ב-Macworld והציג את Aqua – הסגנון החדש של מערכת ההפעלה של המק; הוא לא דיבר על רדיוסים של פינות, לא על מרווחים, לא על יחסי ניגודיות… הוא אמר שהכפתורים ״כל כך טובים שמתחשק לך ללקק אותם״ וזה היה הרגע שבו כל התעשייה הבינה שממשק הוא לא רק דבר שמשתמשים בו, הוא דבר שקורה לך.</p>
        </div>

        <section className="sec">
          <p>עד כאן רגע של נוסטלגיה מקצועית; עשרים ושש שנה עברו, והיום יש לנו בעיצוב טוקנים, קומפוננטות, סקייל-ספייסינג, variant לכל breakpoint… במהלך השנים שעברו מאז התגבש לנו מנגנון אדיר לתעד כל החלטת עיצוב שהתקבלה אי פעם, אבל הוא לא יודע לתעד למה קיבלנו אותה.</p>
          <Pull q="התגבש לנו במהלך השנים מנגנון אדיר לתעד כל החלטת עיצוב שהתקבלה אי פעם, אבל הוא לא יודע לתעד למה קיבלנו אותה.">התגבש לנו במהלך השנים מנגנון אדיר לתעד כל החלטת עיצוב שהתקבלה אי פעם, אבל הוא לא יודע לתעד למה קיבלנו אותה.</Pull>
          <p>זה בדיוק הפער שג׳ם גולד (<a href="https://superposition.jem.computer/design-is-how-it-tastes/">Jem Gold, Superposition</a>) שם עליו את האצבע: יש "שפת-אובייקט" (רדיוס 8px, פלטה נייטרלית עם הדגשת ורוד) ויש "שפת-מפגש" — איך זה גורם לך <strong>להרגיש</strong>, <strong>לנשום</strong>, מה זה <strong>מריח</strong>. הטענה של גולד היא שדיפוזיית טקסט-לתמונה כבר יודעת לתרגם את שפת המפגש ישירות לצורה, בלי לעבור דרך שפת האובייקט בכלל; שכשהוא הזין למודל "חצץ מתפורר מתחת לגלגלים בכביש עפר" הוא קיבל בחזרה עיצוב שכל בריף מילולי-מקצועי לא הצליח להוציא ממנו. יש שיאמרו שזה בדיוק מה שקורה כשמעצב שיודע לתאר ״טעם״ נפגש עם כלי שסוף-סוף יודע לקרוא ״תיאור טעם״.</p>
          <figure>
            <SoundVideo src={`${M}/iphone-unboxing.mp4`} />
            <figcaption>הרגע המצמרר של פתיחת מארז אייפון תוכנן עד הפרטים הקטנים, לצורך מיקסום התחושות והרגשות של חוויית הפתיחה של מארז שלעולם לא יושלך לפח – אף מחשב לא היה יכול לעצב חוויה טקטילית שמרגשת אותנו ככה</figcaption>
          </figure>
          <p>אישית, אני לא בטוח שזה חדש כמו שזה נשמע — כי זה בעצם מה שכל ארט דירקטור טוב עשה תמיד למעצב הג'וניור שלו ("תעשה לי משהו שמרגיש כמו בוקר של יום ראשון") — ההבדל היחיד הוא שעכשיו גם המכונה מבינה משפט כזה, ולא רק הבן אדם שעומד על ידה. וזה בדיוק המקום שבו אני חוזר לדבר שאני חוזר ואומר בכל הזדמנות: כלי הוא טוב כמו האדם שמפעיל אותו, וכלי שנוצר כדי לספק בקשה אנושית ממוצעת — יפיק תוצאה ממוצעת.</p>
          <Pull q="כלי הוא טוב כמו האדם שמפעיל אותו, וכלי שנוצר כדי לספק בקשה אנושית ממוצעת — יפיק תוצאה ממוצעת.">כלי הוא טוב כמו האדם שמפעיל אותו, וכלי שנוצר כדי לספק בקשה אנושית ממוצעת — יפיק תוצאה ממוצעת.</Pull>
        </section>

        <section className="sec">
          <span className="num">01</span>
          <h2>הסימנים שכבר מזהים</h2>
          <p>ג'ים נילסן כתב בדיוק את הצד המכוער של התופעה הזו: הוא קיבץ את כל הסימנים שכבר הופכים תוכנה למזוהה כ"עשויה ב-AI" – אתם כבר מזהים אותם בקלות: אייקונים דקיקים־זעירים, פלטת בז'/קרם עם הדגשי כתום, טיפוגרפיה סריפית, טקסט־שמרצד בזמן שהוא נכתב (shimmer) שמדמה תחושה של "חשיבה", וכמובן בל נשכח את אייקון הנצנץ הלעוס שכבר לא אומר כלום חוץ מ"זה AI" (מתוך <a href="https://blog.jim-nielsen.com/2026/ai-aesthetic/">Jim Nielsen's Blog</a>). מהנדס-AI לשעבר מ-Figma (<a href="https://diffui.ai/">jjcm</a>) נתן להתכנסות הזו הסבר טכני שממש מחזיק מים: מודלים מאומנים לכתוב <strong>קוד עקבי</strong> — דבר טוב לפונקציות backend, אבל כשהם "כותבים עיצוב״ מתקבלת התכנסות לממוצע חזותי גנרי. זאת אומרת שזו לא בעיה של טעם רע, אלא תוצאה ישירה, כמעט מתמטית, של אופטימיזציה לצורך עקביות.</p>
          <figure>
            <div className="media"><img src={`${M}/ai-vs-apple-icons.webp`} alt="אייקונים של מנועי AI לצד אייקונים של אפל" width={1100} height={1170} loading="lazy" /></div>
            <figcaption>אייקונים של מנועי AI משמאל, אייקונים של אפל מימין – את מי משניהם אפשר לזהות ולהבין יותר?</figcaption>
          </figure>

          <div className="demo">
            <div className="lab">קלישאה 1 · shimmer</div>
            <div className="shimmer">חושב… מנסח… מייצר לך משהו מרגש…</div>
            <p className="cap">אפקט ה-shimmer: גרדיאנט על טקסט שלפני שנתיים לא היה מתקבל בשום ביקורת בגלל הזילות הטיפוגרפית, מקובל עכשיו כסימן מוסכם שמעיד על זה ש״הצ׳ט עסוק בחשיבה״ וממש תכף הוא עונה לך.</p>
          </div>
          <div className="demo">
            <div className="lab">קלישאה 2 · streaming</div>
            <Term />
            <p className="cap">טקסט שכותב את עצמו: ירושה מהטרמינל, שהפכה לסימן ש״התשובה בדרך״. בצ׳אט זה מועיל — מתחילים לקרוא לפני שהתשובה נגמרה; בכל מקום אחר זה סתם מרדים את הקורא עד שהמשפט מסתיים.</p>
          </div>
          <p>החלק הבאמת מעניין פה הוא דווקא מנוגד לדעה הרווחת: לא כל מה שמזוהה כ"אסתטיקת AI" הוא זבל שצריך להיפטר ממנו. טקסט־שמרצד עובד מצוין בהקשר צ'אט (אתה מתחיל לקרוא לפני שהתשובה נגמרה) — אבל אפקט אנימציה של טקסט בסטייל מטריקס, סטרימינג של אות־אחר־אות בשורת דאטהבייס, זו הפגנת קלישאות מיותרת שמישהו העתיק בלי לשאול למה. בקרות "Whack-a-mole", שבהן הכפתור שלחצת עליו אתמול פשוט לא שם היום כי המודל החליט אחרת — זו לא תקלה, זו תכונה אמיתית של תוכן לא־החלטי, וההמלצה המעשית היא לשריין מקום קבוע לבקרות שחייבות תמיד להיות באותו מקום, ולתת רק לתוכן עצמו לזרום בתוך הסלוט. (כן, ראית מה עשיתי כאן עם הפאנל בפינה.) זה ההבדל בין לאמץ שפה חזותית כי היא פותרת בעיה, לבין לאמץ אותה כי כולם כבר מדברים ככה.</p>
        </section>

        <section className="sec">
          <span className="num">02</span>
          <h2>נסיון אישי = טעם עשיר</h2>
          <p>ג'סיקה וולש כתבה החודש (<a href="https://adobe.design/ideas/is-design-dead-in-the-age-of-ai">בבלוג של אדובי</a>) משהו שקרוב מאוד לליבי בעניין הזה, ולא במקרה, כי היא בעצם מדברת על טעם במונחים שאני משתמש בהם כבר עשרים שנה בלי לשים לב שיש להם שם רשמי ב-2026. הטענה שלה: AI לא נכשל בצורה מעניינת, הוא נכשל בצורה שטוחה. חוסר שלמות שעדיין נתפס כדבר יפה מאותת לצופים שהדבר הזה נעשה על ידי בן אדם.</p>
          <blockquote className="en">AI does not fail interestingly; it fails blandly. Human designers fail in ways that sometimes become the whole point. Imperfections that still read as beautiful, signal that this was made by a human.<cite>Jessica Walsh</cite></blockquote>
          <figure>
            <div className="media"><img src={`${M}/jessica-walsh.jpg`} alt="ג׳סיקה וולש" width={1400} height={1050} loading="lazy" /></div>
            <figcaption>ג׳סיקה וולש. צילום: &amp;Walsh, עבור Adobe Design</figcaption>
          </figure>
          <p>כשהיא עיצבה את פונט Meraki עבור בית הדפוס Type of Feeling, שותף הגימור אמר לה שכמה אותיות "לא מצוירות נכון" מבחינה טכנית — והיא סירבה לתקן, כי בדיוק האי־דיוקים האלה הם התו האנושי. וכשעיצבה את הזהות של Zooba היא לא בנתה מערכת ויזואלית — היא ניסתה לבקבק את החום והכאוס והשמחה הספציפיים של תרבות אוכל הרחוב בקהיר; שום בריף לא מכיל את זה במלואו, ושום פרומפט לא מייצר אותו.</p>
          <Pull q="טעם הוא לדעת מה טוב ומה לא, ולהיות מוכן להילחם על ההבדל. AI יכול לייצר מאה אפשרויות תוך שנייה, אבל רובן בינוניות, והוא לא יודע את זה. אתה כן.">טעם הוא לדעת מה טוב ומה לא, ולהיות מוכן להילחם על ההבדל. וזו בדיוק הנקודה שבה AI לא עוזר לך — הוא יכול לייצר מאה אפשרויות תוך שנייה, אבל רובן בינוניות, והוא לא יודע את זה. אתה כן.</Pull>
        </section>

        <section className="sec">
          <span className="num">03</span>
          <h2>איך לומדים טעם?</h2>
          <p>במשך מאות שנים (ולמעשה עד התקופה הנוכחית) לימודי עיצוב היו משולים לקראפט שהולך יד ביד עם הכרת ההיסטוריה של האומנות והאמנות, והצריכו שילוב של ידע נרכש, חשיבה ביקורתית מאומנת ומלוטשת, וכישורים ידניים ליצירה פיזית.</p>
          <figure>
            <div className="media"><img src={`${M}/graphic-means.jpg`} alt="עיצוב גרפי לפני העידן הדיגיטלי" width={1400} height={804} loading="lazy" /></div>
            <figcaption>עיצוב גרפי לפני העידן הדיגיטלי (מתוך הסרט graphicmeans.com)</figcaption>
          </figure>
          <p>עיצוב גרפי כתחום מיוחד לא היה קיים עד תחילת המאה ה-20. רוב המעצבים הגרפיים באותה עת היו אמנים מסורתיים, מאיירים, אמני הדבקה וסדרי אותיות שלמדו טכניקות וכישורי תקשורת תוך כדי עבודה. עדיין לא קראו להם מעצבים גרפיים – הם היו אמנים מסחריים שהתקיימו בין עולמות המלאכה והאומנות. ולטר גרופיוס ייסד את בית הספר באוהאוס ב-1919 במטרה לגשר בין שני העולמות, ליישם את הפדגוגיה של האומנות על עבודת מלאכה, ולהיפך. תוכנית הלימודים תוכננה כך שכולם נדרשו לקחת קורסי יסוד ברחבי האמנות היפה המסורתית, המלאכה ופרקטיקות העיצוב, וגם להתאמן במדע ובתיאוריה. סטודנטים למדו קורסים בתולדות האמנות, אנטומיה אנושית, מדע החומרים, פיזיקה ותורת הצבע וכן ניהול עסקי. הבאוהאוס הוא דוגמה למה שלימים נודע כ״בית ספר בסגנון שוויצרי מבוסס-תהליך״ וקורסי היסוד שלו נמצאים לעיתים קרובות בתוכניות האמנות בהשכלה הגבוהה גם כיום.</p>
          <figure>
            <div className="media"><img src={`${M}/bauhaus-posters.jpg`} alt="פוסטרים של הבאוהאוס" width={720} height={720} loading="lazy" /></div>
            <figcaption>פוסטרים של הבאוהאוס – בשביל להסביר למה זה כל כך מוצלח נדרשות מעל 100 שנות היסטוריה</figcaption>
          </figure>
          <p>אם בעבר מעצבים זוטרים בשוק העבודה (״ג׳וניורים, כן״) הצטרכו לחדד את שיקול הדעת שלהם על ידי ביצוע הוראות הכוונה של מישהו אחר, כאשר כל איטרציה היא תוצר של שיקול דעת של מישהו ותיק מהם, לפני שזכו לומר את דברם בהחלטות הגדולות יותר. סך כל המשימות ברמת המתחילים היה תמיד גדול מסכום חלקיו – תהליך איטרטיבי סיזיפי שאפשר לג׳וניורים לבנות אינסטינקט להחלטות עיצוביות שאפשר להגן עליהן. אין ערך ברומנטיזציה של המאבק לשמו, אבל תפקידו כמתווך בין מתחיל למומחה מילא היסטורית תפקיד משמעותי בבניית הטעם של הדור הזה – טעם שהועבר הלאה כשהם הקנו אותו לדור שאחריהם.</p>
          <Pull q="ביטול העבודה השגרתית הזו הוא לא דבר רע, כל זמן שמפצים על השריר שהיא בנתה.">ביטול העבודה השגרתית הזו הוא לא דבר רע, כל זמן שמפצים על השריר שהיא בנתה.</Pull>
          <p>מורים לעיצוב (ולאומנות, וליצירתיות) ומעצבים בתקופה הנוכחית יצטרכו להמשיך להנחיל לדור הצעיר את חשיבותה של חשיבה ביקורתית והיסטוריה יצירתית: להוריש להם את המסגרות שקודמיהם הקדישו חיים שלמים לפיתוחן, ולאתגר את הדור הצעיר לשלב אותן, לפקפק בהן, ובסופו של דבר להשתמש בהן כדי לקבל החלטות עיצוב חדות יותר שמתחברות לקהל שלהם; כדאי למורים ולמנטורים להתאים את נפח העבודה והיקף הפרויקטים שהם נותנים כדי לאפשר לסטודנטים לבלות יותר זמן <em>בתוך העבודה</em>, במקום לאלץ אותם להעביר משימות ל-AI רק כדי לעמוד בקצב. במקביל, ההערכה שהסטודנטים מקבלים יכולה לעבור ממדדי ביצוע לתיעוד האופן שבו הסטודנט הגיע להחלטה, ולא לתמונה הסופית המלוטשת — מתן ערך גבוה לתהליך על פני המוצר עצמו. הביקורת (Critique), מסורת הסטודיו של פירוק והגנה על העבודה מול עמיתים ו/או לקוחות, תקבל חשיבות חדשה ככל שהסטודנטים יידחקו לפרוט את נימוקיהם. ניתן ללמד את ״הסטודיו״ כמקום שבו אנשים מקבלים החלטות יחד.</p>
          <figure>
            <div className="yt"><iframe src="https://www.youtube-nocookie.com/embed/B8Q89_yoJAY" title="Figma · Taste Sources" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
            <figcaption>פיגמה השיקה השבוע סדרת רשת שבה היא מארחת מעצבים שמציגים את מקורות הטעם שלהם (ההשראות שבנו אותם והציתו להם את הדמיון כשהיו רק בתחילת הקריירה). הסרטון הזה הגיע ל-150,000 צפיות ביומיים (בשביל הפרופורציה: לערוץ של פיגמה יש בסה״כ 750,000 מנויים) — עדות לצורך הרב של אנשים בחיפוש אחר מקורות של הטעם החמקמק הזה שכולם מחפשים עכשיו.</figcaption>
          </figure>
          <p><a href="https://www.itsnicethat.com/articles/pov-graphic-design-schools-are-teaching-tech-not-taste-creative-industry-150426">קאת׳י פאם</a> הזהירה לאחרונה מפני צמצום החינוך העיצובי למודל של בית ספר מקצועי: מתן עדיפות להכשרה טכנית על חשבון תשתית של מדעי הרוח המייצרת חושבים ביקורתיים. בזירת עיצוב שנשלטת על ידי AI, תוכנית לימודים שמלמדת רק טכניקה תכשיר סטודנטים במיומנות שעליה הם יכולים לסמוך הכי פחות.</p>
          <blockquote>״אם מטרת המכללה היא שסטודנטים ימקסמו את סיכויי ההעסקה שלהם (hiremaxxing), אז ההשכלה הגבוהה היא… רק עוד מחנה אימונים לעולם התאגידי.״<cite>קאת׳י פאם</cite></blockquote>
        </section>

        <section className="sec">
          <span className="num">04</span>
          <h2>אנחנו מואבסים בסלופ תפל</h2>
          <p>מה הטעם לעצב בלי טעם? שום דבר, ליטרלי — זה רק שהעולם עכשיו מלא בכלים שיודעים <strong>לחקות את הצורה של טעם</strong> בלי לשאת בסיכון שבו. הכלים שמחליפים את התהליכים מאכילים אותנו בתוצר תעשייתי וחסר ייחוד.</p>
          <p>שאלה פתוחה שאני מתחיל לגלגל עכשיו: אם "טעם" הופך להיות המונח החם של השנה, כמה זמן ייקח עד שמישהו יתחיל למכור אותו כשירות — עם דשבורד, עם KPI, עם A/B test על רמת האותנטיות שלו? כי כל הדברים פה מובילים לתובנה שברגע שזה קורה אז זה כבר לא טעם – זה פשוט עוד תבנית.</p>
          <div className="sources"><h3>מקורות</h3><ol>
            <li>Jem Gold, <a href="https://superposition.jem.computer/design-is-how-it-tastes/">Design Is How It Tastes</a>, Superposition, 24.4.2026</li>
            <li>Jim Nielsen, <a href="https://blog.jim-nielsen.com/2026/ai-aesthetic/">The AI Aesthetic</a>, Jim Nielsen's Blog, 29.7.2026</li>
            <li>jjcm (מהנדס AI-tooling לשעבר ב-Figma, כיום בונה את diffui), מצוטט אצל <a href="https://www.explainx.ai/blog/ai-aesthetic-design-patterns-jim-nielsen-2026">explainx.ai</a>, The AI Aesthetic Explained</li>
            <li>Jessica Walsh (&amp;Walsh), <a href="https://adobe.design/ideas/is-design-dead-in-the-age-of-ai">Is Design Dead in the Age of AI?</a>, Adobe Design, 13.8.2026</li>
            <li>Kathy Pham, <a href="https://www.itsnicethat.com/articles/pov-graphic-design-schools-are-teaching-tech-not-taste-creative-industry-150426">Graphic design schools are teaching tech, but are they teaching taste?</a>, It's Nice That, 15.4.2026</li>
            <li>Andrew Shea, <a href="https://www.itsnicethat.com/articles/pov-no-shortcuts-why-ai-threatens-creative-instinct-creative-industry-240826">No shortcuts: Why AI threatens creative instinct</a>, It's Nice That, 24.8.2026</li>
          </ol></div>
        </section>

        <footer className="post-end">
          <div className="closer"><h3>שיתוף הפוסט</h3><div className="share">
            <a href={`https://wa.me/?text=${postShare}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(URL)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(URL)}`} target="_blank" rel="noopener noreferrer">פייסבוק</a>
            <a href={`https://x.com/intent/post?text=${postShare}`} target="_blank" rel="noopener noreferrer">X</a>
            <button type="button" onClick={copyLink}>{copiedLink ? "הועתק" : "העתקת קישור"}</button>
          </div></div>
          <Comments />
          <div className="closer more"><h3>עוד דברים שכתבתי עליהם:</h3><div className="rail">
            {related.map((p) => (
              <a className="card" href={p.href} key={p.href}>
                <span className="media"><img src={p.cover} alt="" loading="lazy" /></span>
                <strong>{p.cardTitle || p.title}</strong>
                <span>{p.intro}</span>
              </a>
            ))}
          </div></div>
        </footer>
      </main>

      {/* THE PANEL — the dialog from the cover. Fixed slot, fixed style: never restyled. */}
      <div className={"panel" + (busy ? " busy" : "") + (gen.choice ? " has-log" : "")} role="dialog" aria-live="polite" style={{ transform: hidden ? "translateY(calc(100% - 56px))" : undefined }}>
        <div className="bar" />
        <div className="row">
          <Invader />
          <div>
            <h4>{busy ? "קורא… לא, מייצר." : gen.choice ? `העמוד הזה עוצב עכשיו ב-${gen.secs} שניות, בלי לקרוא אותו.\nלייצר לו עיצוב אחר?` : "לייצר לעמוד הזה עיצוב חדש?"}</h4>
            <p className="sub">{gen.choice ? `Design ${gen.n} of ${TOTAL.toLocaleString("en-US")} · You cannot undo this action.` : "You cannot undo this action."}</p>
            <p className="status">✦ thinking…</p>
            <div className="btns">
              <button className="btn ok" type="button" onClick={generate} disabled={busy}>OK</button>
              <button className="btn" type="button" onClick={() => setHidden((h) => !h)} disabled={busy}>{hidden ? "↑" : "Cancel"}</button>
            </div>
          </div>
        </div>
        {gen.choice && (
          <p className="log">
            {keys.slice(0, 5).map((k) => "• " + WHY[k][gen.choice![k]]).join("\n")}
            {`\n• …ועוד ${keys.length - 5} החלטות מנומקות היטב\n(הגרסה שמישהו עיצב? רק ב-⌘R)`}
          </p>
        )}
      </div>
    </div>
  );
}
