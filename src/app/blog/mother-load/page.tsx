"use client";

/* =====================================================================
 *  BLOG POST — "Mother Load" (רייצ׳ל מאני)  ·  v2 (per Amit's revisions)
 *  · Site nav + blur veil on top; hero corner labels in negative
 *  · 80vh cover, frosted-grain glass title card
 *  · Persistent CMY ink-bleed title effect (front letters static)
 *  · Inline floating screenshots breaking left out of the column
 *  · Facebook + icons in share, sketchy multi-stroke send button
 *  Route: /blog/mother-load · Assets: /public/media/blog/mother-load/
 * ===================================================================== */

import { useEffect, useRef, useState } from "react";
import PostDate from "../../../components/PostDate";
import PostFooter from "../../../components/PostFooter";
import InkFrame from "../../../components/InkFrame";
import { PaperTexture } from "@paper-design/shaders-react";

/* ---------- BleedTitle: static letters, persistent CMY ink bleed ---------- */
function BleedTitle({
  lines,
  className = "",
  as: Tag = "h2",
}: {
  lines: string[];
  className?: string;
  as?: any;
}) {
  const ref = useRef<any>(null);
  useEffect(() => {
    const el: HTMLElement | null = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letters = Array.from(el.querySelectorAll<HTMLElement>(".fl"));
    if (!letters.length) return;
    let raf = 0, hovering = false, px = -9999, py = -9999;
    let cs: { x: number; y: number }[] = [];
    const amp = new Float32Array(letters.length);  /* monotonic bleed amount */
    const dx_ = new Float32Array(letters.length);  /* frozen bleed direction */
    const dy_ = new Float32Array(letters.length);
    const recompute = () => {
      cs = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };
    const SIG2 = 2 * 95 * 95;
    const loop = () => {
      letters.forEach((l, i) => {
        const ddx = cs[i].x - px, ddy = cs[i].y - py;
        const d = Math.hypot(ddx, ddy) || 1;
        const g = Math.exp(-(d * d) / SIG2);
        if (g > amp[i]) {
          /* ink spreads — direction follows the pointer while growing */
          amp[i] += (g - amp[i]) * 0.18;
          dx_[i] += ((ddx / d) - dx_[i]) * 0.3;
          dy_[i] += ((ddy / d) - dy_[i]) * 0.3;
          const off = amp[i] * 3.5; /* px (softened 50%) */
          l.style.setProperty("--k", amp[i].toFixed(3));
          l.style.setProperty("--cx", (dx_[i] * off).toFixed(1) + "px");
          l.style.setProperty("--cy", (dy_[i] * off).toFixed(1) + "px");
        }
        /* never shrinks back — the stain stays */
      });
      if (hovering) raf = requestAnimationFrame(loop);
    };
    const enter = () => { hovering = true; recompute(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };
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
  }, []);
  return (
    /* the letters are split into spans for the ink-bleed effect, which a
       screen reader would otherwise read out one character at a time. The
       real text lives on aria-label; the split letters are hidden from the
       accessibility tree. Not one pixel changes. */
    <Tag ref={ref} className={"blt " + className} aria-label={lines.join(" ")}>
      {lines.map((line, li) => (
        <span className="fxl" dir={/[֐-׿]/.test(line) ? "rtl" : "ltr"} key={li} aria-hidden>
          {line.split(" ").map((word, wi) => (
            <span className="fw" key={wi}>
              {[...word].map((ch, ci) => (
                <span className="fl" data-ch={ch} key={ci}>{ch}</span>
              ))}
              {wi < line.split(" ").length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}

/* ---------- scroll reveal ---------- */
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ---------- reading progress ---------- */
function ReadProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
        el.style.transform = `scaleX(${p})`;
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);
  return <div className="read-progress" ref={ref} aria-hidden />;
}

const POST_TITLE = "Mother Load - עמית ברין";

/* ---------- inline floating screenshot ---------- */
function Shot({ src, alt, cap }: { src: string; alt: string; cap: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <>
      <figure
        className="shot-inline shot-zoom"
        data-reveal
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter") setOpen(true); }}
      >
        <img src={src} alt={alt} loading="lazy" />
        <figcaption>{cap}</figcaption>
      </figure>
      {open && (
        <div className="lightbox" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <img src={src} alt={alt} />
        </div>
      )}
    </>
  );
}


/* ---------- three-up row cell with lightbox ---------- */
function Cell({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <>
      <figure className="shot-cell shot-zoom" role="button" tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter") setOpen(true); }}>
        <img src={src} alt={alt} loading="lazy" />
      </figure>
      {open && (
        <div className="lightbox" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <img src={src} alt={alt} />
        </div>
      )}
    </>
  );
}

/* =====================================================================
 *  PAGE
 * ===================================================================== */
export default function WhatsappPost() {
  useReveal();
  return (
    <div className="bp-root" dir="rtl" lang="he">
      <style>{CSS}</style>

      {/* filters: hand-drawn ink line + print grain for titles */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id="inkline-bp" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" />
        </filter>
        <filter id="print-grain" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="g" />
          <feDisplacementMap in="SourceGraphic" in2="g" scale="1.4" />
        </filter>
      </svg>

      <ReadProgress />

      {/* full-page crumpled paper shader background */}
      <PaperTexture
        colorBack="#f6f3e9"
        colorFront="#c5ccd3"
        contrast={0.36}
        roughness={1}
        fiber={0.27}
        fiberSize={0.27}
        crumples={0.51}
        crumpleSize={0.33}
        folds={0.57}
        foldCount={8}
        drops={0.13}
        fade={0}
        seed={546.8}
        scale={0.5}
        fit="cover"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
      />

      {/* progressive blur veil + site nav (same language as the one-pager) */}
      <div className="nav-veil" aria-hidden>
        <i /><i /><i />
      </div>
      <nav className="op-nav" aria-label="ניווט ראשי">
        <a href="/" className="nav-logo" aria-label="עמית ברין - ראשי">
          <img src="/media/amit-brin-logo.svg" alt="עמית ברין" />
        </a>
        <div className="nav-links">
          <a href="/">ראשי</a>
          <a href="/#blog">כתיבה ועשייה</a>
          <a href="/#footer">דברו איתי</a>
        </div>
      </nav>

      {/* ---------- HERO: 80vh cover, torn spiral-notebook title card ---------- */}
      <header className="hero">
        <figure className="hero-figure">
          <img
            src="/media/blog/mother-load/cover.jpg" width={1455} height={818}
            alt="פוסטרים של פרויקט Mother Load מודבקים על קיר רחוב"
            className="hero-img"
            fetchPriority="high"
          />
        </figure>
        <div className="hero-card" data-reveal>
          <i className="spiral" aria-hidden />
          <i className="margin-line" aria-hidden />
          <BleedTitle as="h1" className="hero-title" lines={["Mother Load"]} />
          <p className="hero-sub">
            רייצ'ל מאני מדפיסה את הגיליון שאף רואה חשבון לא יחתום עליו - החשבון הפתוח של אימהות
            יוצרות.
          </p>
          <p className="hero-meta">
            מחשבות על עיצוב ועל חוויית שימוש <span className="meta-slash">/</span> עמית ברין · 4 דקות קריאה
           · <PostDate slug="mother-load" /></p>
        </div>
        <i className="tape tape-a" aria-hidden />
        <i className="tape tape-b" aria-hidden />
      </header>

      {/* ---------- BODY ---------- */}
      <article className="body">
        <Shot
          src="/media/blog/mother-load/poster-price-tags.jpg"
          alt="פוסטר Mother Load: פנים של אישה מכוסות בתוויות מחיר"
          cap="מתוך Mother Load: הפנים כמוצר בסוף עונה - 74 סנט, מוזל, הצעה מיוחדת. לחיצה מגדילה."
        />

        <p className="lede" data-reveal>
          יש מסמך חשבונאי אחד שאף מחלקת כספים לא תדרוש ואף רואה חשבון לא יחתום עליו, והוא נפתח כל
          ערב ב־23:00 בראש של כל אמא יוצרת: כמה שעות עבדתי באמת היום, כמה מהן הופרעו באמצע, כמה
          אחוזי מעבד היו שמורים לאיסוף מבית הספר, לגרב שנעלמה, לאשמה… גיליון שלא מתאזן אף פעם, ולא
          מופיע בשום תלוש.
        </p>

        <p data-reveal>
          רייצ'ל מאני, מעצבת מלוס אנג'לס, החליטה לעצב ולהדפיס אותו – פרויקט בשם Mother Load:
          פוסטרים שבהם פנים של אישה מכוסות בתוויות מחיר כמו מוצר בסוף עונה, קבלת סופרמרקט עם שורות
          כמו "מס חופשת לידה" ו"עבודה בלתי נראית" – ולצידם מסה שמצחיקה וכועסת באותה נשימה, וכל
          שורה בה נשענת על מחקר.
        </p>

        <p className="section-lede" data-reveal>
          המחקרים, למי שעוד צריך אותם: 74.3 סנט לכל דולר שאבות מרוויחים; קנס של 5–7% על כל ילד; ופי
          שניים שיחות חזרה לנשים בלי ילדים – על קורות חיים זהים – בזמן שאבות באותם נתונים בדיוק
          מקבלים דווקא תוספת ("בונוס האבהות", ככה זה נקרא בספרות המחקרית, בלי מרכאות אירוניות
          אפילו).
        </p>

        <p data-reveal>
          כל זה הזכיר לי את מחברת ההקפות של המכולת השכונתית – זו שנרשמו בה חובות בעיפרון, מתוך הנחה
          שביום מן הימים מישהו יבוא לסגור את החשבון. ההבדל היחיד: במכולת לפחות כולם ידעו שיש מחברת.
          כאן ההקפות נרשמות בדיו בלתי נראית, ומי שמגיעה לשלם בסוף כל חודש היא דווקא זו שרשומה בה.
        </p>

        {/* pull quote — breaks into the right margin, wide rule beneath */}
        <aside className="pull" data-reveal>
          <BleedTitle
            as="blockquote"
            className="pull-title"
            lines={["במכולת לפחות כולם ידעו שיש מחברת. כאן ההקפות נרשמות בדיו בלתי נראית."]}
          />
        </aside>

        <figure className="shot-full" data-reveal>
          <img src="/media/blog/mother-load/poster-receipt.jpg" width={800} height={1200} alt="פוסטר Mother Load: קבלת סופרמרקט של קנסות האימהות" loading="lazy" />
          <figcaption>הקבלה: "מס חופשת לידה", "עבודה בלתי נראית", סה"כ - יותר מדי. כל המכירות סופיות.</figcaption>
        </figure>

        <p className="section-lede" data-reveal>
          עכשיו ההקשר, כי בלעדיו זה עוד פרויקט אמנותי יפה:
        </p>

        <p data-reveal>
          2025 הייתה שנת קונסולידציה אכזרית – Omnicom פיטרה מעל 4,000 עובדים, WPP איחדה את Ogilvy,
          VML ו־AKQA, וכ־10,000 משרות נעלמו מהתעשייה. פחות אנשים עושים יותר עבודה, עם דרישה חדשה
          שאף אחד לא טרח לכתוב במודעת הדרושים: שליטה ב־AI, וזמינות שאין לה שעות סגירה. ובדיוק כאן
          נמצא המשפט שמאני מניחה על השולחן ושווה לקרוא אותו פעמיים: הכישורים שההנהלות מצהירות שהן
          מחפשות עכשיו – תיעדוף תחת מחסור, ניהול משאבים מוגבלים, שקט תחת לחץ – הם ליטרלי האימון
          היומי של אימהות. אבל הפילטר שממיין את המועמדים לא בודק כישורים; הוא בודק זמינות.
        </p>

        <figure className="shot-full" data-reveal>
          <img src="/media/blog/mother-load/poster-portfolio.jpg" width={800} height={1200} alt="פוסטר Mother Load: תיקיית פורטפוליו עם ציורי ילדים" loading="lazy" />
          <figcaption>"Portfolio Review" - התיק שמגיע לראיון אחרי שהילדים סיימו איתו.</figcaption>
        </figure>

        <p className="section-lede" data-reveal>
          וגילוי נאות, כי אי אפשר בלי:
        </p>

        <p data-reveal>
          אני מלמד את הדרישה הסמויה הזאת. סדנאות AI, כלים, טכניקות, אינטגרציות – אני חוליה בשרשרת
          האספקה של המשוואה שמאני מפרקת. הנחמה שאני מוכר לעצמי היא שאני מתעקש להגיד, בכל סדנה,
          שהכלי טוב בדיוק כמו האדם שמחזיק בו – כלומר שהערך נשאר אצל מי שצבר ניסיון וכישרון, ולא אצל
          מי שפשוט זמין יותר שעות מול המסך. יש שיאמרו שזו בדיוק הנחמה שכל ספק נשק מוכר לעצמו…
        </p>

        <p data-reveal>
          כי בסופו של דבר הטיעון של מאני הוא לא "נגד קדמה", וזה מה שעושה אותו קשה לעיכול. קדמה שכל
          המדדים שלה הם מהירות וזמינות היא פילטר – שקט, יעיל, בלי אף החלטה מפלה אחת שאפשר להצביע
          עליה בישיבת דירקטוריון – שמסנן החוצה בדיוק את הכישרון המנוסה ביותר. שבמקרה גמור הוא נשי
          באופן לא פרופורציונלי. ובמקרה קצת פחות גמור – הוא גם כל מי שכבר עבר את תקרת הזכוכית של
          ממוצע אורך החיים במקצוע הזה; כל מי שיש לו, איך לנסח את זה, חיים שמפריעים באמצע.
        </p>

        <div className="shot-row" data-reveal>
          <Cell src="/media/blog/mother-load/poster-out-of-order.jpg" alt="פוסטר Out of Order: ידיים של ילדים מכסות פנים של אמא" />
          <Cell src="/media/blog/mother-load/poster-torn-face.jpg" alt="פוסטר Mother Load: פנים מכוסות בציור ילדים קרוע" />
          <Cell src="/media/blog/mother-load/street-mockup.jpg" alt="פוסטרים של Mother Load ו-Out of Order על חזית בניין ברחוב" />
        </div>

        <p className="closer link-line" data-reveal>
          המסה המלאה אצלה באתר:{" "}
          <a className="ink-btn btn-inline" href="https://rachelmany.com/creativemotherhood" target="_blank" rel="noopener noreferrer">
            <InkFrame seed={6} />
            rachelmany.com/creativemotherhood ←
          </a>{" "}
          שווה את הזמן. ואת החשבון שייפתח בראש אחר כך. גם בשבילך, גבר.
        </p>

        <hr className="ink-rule thick" data-reveal />

        <PostFooter slug="mother-load" title={POST_TITLE} />

        <footer className="bp-footer" data-reveal>
          <button type="button" className="ink-btn" onClick={() => history.back()}><InkFrame seed={4} />→ בחזרה</button>
        </footer>
      </article>
    </div>
  );
}

/* =====================================================================
 *  CSS
 * ===================================================================== */
const CSS = `

@font-face { font-family:'Leon'; src:url('/fonts/Leon-Thin.woff2') format('woff2');    font-weight:100 300; font-display:swap; }
@font-face { font-family:'Leon'; src:url('/fonts/Leon-Regular.woff2') format('woff2'); font-weight:400 500; font-display:swap; }
@font-face { font-family:'Leon'; src:url('/fonts/Leon-Bold.woff2') format('woff2');    font-weight:600 700; font-display:swap; }
@font-face { font-family:'Leon'; src:url('/fonts/Leon-Heavy.woff2') format('woff2');   font-weight:800 900; font-display:swap; }

.bp-root {
  --navy-deep:#020D2C; --navy:#081845; --gold:#CFBD85; --cream:#EADEB7;
  --paper:#f6f3e9; --ease:cubic-bezier(.22,.9,.24,1);
  font-family:'Noto Sans Hebrew', Arial, sans-serif;
  color:var(--navy-deep);
  background-color:var(--paper);
  min-height:100vh;
  overflow-x:hidden;
  position:relative;
}
.bp-root .hero, .bp-root .body { position:relative; z-index:1; }
.bp-root h1,.bp-root h2,.bp-root h3,.bp-root blockquote { font-family:'Leon','Noto Sans Hebrew',sans-serif; margin:0; }

[data-reveal] { opacity:0; transform:translateY(26px); transition:opacity 1s var(--ease), transform 1s var(--ease); }
[data-reveal].in { opacity:1; transform:none; }

.read-progress {
  position:fixed; top:0; right:0; left:0; height:3px; z-index:60;
  background:var(--navy); transform-origin:right; transform:scaleX(0);
}

/* ---------- site nav + blur veil (one-pager language) ---------- */
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

/* ---------- hero ---------- */
.hero { position:relative; }
.hero-figure { margin:0; height:80vh; overflow:hidden; position:relative; }
.hero-img { width:100%; height:100%; object-fit:cover; display:block; }

/* ---------- hero card: a page torn out of a spiral notebook ---------- */
.hero-card {
  position:relative; z-index:3;
  width:min(880px, 92vw); margin:-11rem auto 0;
  padding:3.6rem clamp(1.6rem, 4vw, 3.2rem) 2.4rem 4.2rem;
  background:
    linear-gradient(180deg, rgba(2,13,44,.03), transparent 8%),
    #fdfcf6;
  transform:rotate(-.6deg);
  clip-path:polygon(
    0 1.2%, 3% 0, 97% .6%, 100% 2%,
    99.4% 20%, 100% 34%, 99.2% 47%, 100% 61%, 99.5% 74%, 100% 88%, 99.3% 98%,
    96% 100%, 78% 99%, 55% 100%, 32% 99.2%, 12% 100%, 2% 99%, 0 96%
  );
  filter:drop-shadow(0 24px 30px rgba(2,13,44,.25)) drop-shadow(0 4px 8px rgba(2,13,44,.12)) drop-shadow(0 46px 60px rgba(2,13,44,.14));
  /* real punched holes along the spiral edge */
  -webkit-mask-image:radial-gradient(circle at calc(100% - 1.55rem) 50%, transparent 0 5.5px, #000 6px);
  -webkit-mask-size:100% 30px;
  -webkit-mask-repeat:repeat-y;
  mask-image:radial-gradient(circle at calc(100% - 1.55rem) 50%, transparent 0 5.5px, #000 6px);
  mask-size:100% 30px;
  mask-repeat:repeat-y;
}
.hero-card[data-reveal] { transform:rotate(-.6deg) translateY(26px); }
.hero-card[data-reveal].in { transform:rotate(-.6deg); }

/* paper folds + creases */
.hero-card::before {
  content:''; position:absolute; inset:0; pointer-events:none; z-index:1;
  background:
    linear-gradient(112deg, transparent 42%, rgba(2,13,44,.055) 42.5%, rgba(255,255,255,.5) 43.1%, transparent 44%),
    linear-gradient(248deg, transparent 63%, rgba(2,13,44,.05) 63.4%, rgba(255,255,255,.45) 64%, transparent 64.9%),
    linear-gradient(180deg, transparent 30%, rgba(2,13,44,.02) 50%, transparent 70%);
}
/* paper grain texture */
.hero-card::after {
  content:''; position:absolute; inset:0; pointer-events:none;
  opacity:.4; mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.28'/%3E%3C/svg%3E");
}
/* spiral binding: torn rims around the real punched holes */
.spiral {
  position:absolute; inset:0; z-index:2; pointer-events:none;
  background-image:radial-gradient(circle at calc(100% - 1.55rem) 50%,
    transparent 0 5.4px,
    rgba(2,13,44,.32) 5.9px 6.6px,
    rgba(255,255,255,.65) 7px 7.5px,
    transparent 8.2px);
  background-size:100% 30px;
  background-repeat:repeat-y;
  filter:url(#inkline-bp);
}
/* notebook top margin rule */
.margin-line {
  position:absolute; left:1.2rem; right:2.8rem; top:2.6rem; height:1.5px; z-index:2;
  background:rgba(198,74,74,.4);
  filter:url(#inkline-bp);
}
/* masking-tape strips straddling the cover image and the note */
.tape {
  position:absolute; width:120px; height:36px; z-index:5;
  top:calc(80vh - 11rem - 17px);
  background:rgba(250,243,212,.8);
  box-shadow:0 3px 8px rgba(2,13,44,.22);
  border-left:1px dashed rgba(2,13,44,.1);
  border-right:1px dashed rgba(2,13,44,.1);
}
.tape-a { right:calc((100% - min(880px, 92vw)) / 2 + min(880px, 92vw) * .12); transform:rotate(-5deg); }
.tape-b { left:calc((100% - min(880px, 92vw)) / 2 + min(880px, 92vw) * .1); transform:rotate(4deg); }
.hero-title {
  color:var(--navy); font-weight:800;
  font-size:clamp(2.6rem, 7vw, 5.4rem); line-height:.95;
}
.hero-sub {
  margin:1.5rem 0 0; font-size:clamp(1.28rem, 1.8vw, 1.55rem);
  font-weight:600; color:var(--navy-deep); line-height:1.55;
}
.post-date { font-variant-numeric:tabular-nums; }
.hero-meta {
  margin:1.3rem 0 0; text-align:center;
  font-size:.9rem; color:rgba(8,24,69,.72);
}
.meta-slash { margin:0 .5em; opacity:.5; }

/* ---------- body column ---------- */
.body {
  width:min(680px, 92vw); margin:0 auto; padding:5rem 0 6rem;
  font-size:clamp(1.05rem, 1.15vw, 1.18rem); line-height:1.95;
}
.body > p { margin:0 0 1.7em; }
.lede, .section-lede { font-size:clamp(1.18rem, 1.5vw, 1.36rem); font-weight:500; line-height:1.85; }
.section-lede { font-weight:600; color:var(--navy); }
.closer { font-weight:700; clear:both; }
.bp-root strong { font-weight:700; }

.ink-rule {
  border:none; height:0; margin:3.4rem auto;
  width:min(280px, 60%);
  border-top:2px solid var(--navy);
  filter:url(#inkline-bp);
  opacity:.85;
}
.ink-rule.thick { width:min(420px, 80%); border-top-width:3px; }

/* ---------- pull quotes: bleed into the right margin ---------- */
.pull {
  clear:both;
  margin:3.6rem 0;
  /* overhang = exactly 50% of the free area to the right of the text column */
  margin-right:calc((100vw - min(680px, 92vw)) / -4);
  position:relative; padding:.4rem 0;
}
.pull-left { text-align:left; margin-right:0; margin-left:calc((100vw - min(680px, 92vw)) / -8); }
.pull-title {
  color:var(--navy); font-weight:800;
  font-size:clamp(1.7rem, 4vw, 3.1rem); line-height:1.18;
}
.pull::after {
  content:''; display:block; margin-top:1.4rem;
  width:100%; border-top:3px solid var(--navy);
  filter:url(#inkline-bp);
}

/* ---------- inline floating screenshots ---------- */
.shot-inline {
  float:left; clear:left;
  width:min(300px, 70vw);
  margin:.5rem 2.2rem 1.6rem calc(min(300px, 70vw) / -2);
  position:relative;
  background:#fff; padding:.8rem .8rem .9rem; border-radius:18px;
  transform:rotate(-1deg);
}
.shot-inline[data-reveal] { transform:rotate(-1deg) translateY(26px); }
.shot-inline[data-reveal].in { transform:rotate(-1deg); }
.shot-inline:nth-of-type(even) { transform:rotate(.8deg); }
.shot-inline:nth-of-type(even)[data-reveal] { transform:rotate(.8deg) translateY(26px); }
.shot-inline:nth-of-type(even)[data-reveal].in { transform:rotate(.8deg); }
.shot-inline::before {
  content:''; position:absolute; inset:2px; pointer-events:none;
  border:1.8px solid var(--navy);
  border-radius:14px 20px 12px 22px / 20px 13px 22px 14px;
  filter:url(#inkline-bp);
}
.shot-inline img { width:100%; height:auto; display:block; border-radius:10px; }
.shot-inline figcaption {
  margin-top:.7rem; font-size:.85rem; line-height:1.55; color:rgba(8,24,69,.75);
  padding:0 .2rem;
}

/* ---------- ink buttons ---------- */
.ink-btn {
  display:inline-flex; align-items:center; gap:.55em;
  position:relative; z-index:0;
  font-family:'Leon',sans-serif; font-weight:500; font-size:1rem;
  color:var(--navy); background:transparent;
  padding:.6em 1.5em; text-decoration:none; cursor:pointer; border:none;
  transition:color .35s var(--ease), transform .5s var(--ease);
}
.ink-btn:active { transform:scale(.98); }
.ink-btn svg:not(.ink-frame) { flex:0 0 auto; }

.bp-footer { margin:4rem 0 0; display:flex; justify-content:center; clear:both; }

/* ---------- BleedTitle: printed, grainy; CMY ink bleeds out & stays ---------- */
.blt { filter:url(#print-grain); }
.blt .fxl { display:block; }
.blt .fw { display:inline-block; white-space:pre; }
.blt .fl { display:inline-block; position:relative; --k:0; --cx:0px; --cy:0px; }
.blt .fl::before, .blt .fl::after {
  content:attr(data-ch); position:absolute; inset:0; z-index:-1;
  pointer-events:none; opacity:calc(var(--k) * .4);
  filter:blur(calc(1px + var(--k) * 1.4px));
}
.blt .fl::before { color:#00C4DB; mix-blend-mode:multiply; transform:translate(var(--cx), var(--cy)); }
.blt .fl::after  { color:#E5289E; mix-blend-mode:multiply; transform:translate(calc(var(--cx) * -.8), calc(var(--cy) * -.8)); }
.blt .fl {
  text-shadow:
    calc(var(--cx) * -.6) calc(var(--cy) * .7) calc(2px + var(--k) * 3px) rgba(250,220,0, calc(var(--k) * .45));
}

/* wide breakout figure */
.shot-wide {
  clear:both; margin:3rem 0;
  margin-right:calc((100vw - min(680px, 92vw)) / -8);
  margin-left:calc((100vw - min(680px, 92vw)) / -8);
  position:relative; background:#fff; padding:.9rem; border-radius:18px;
}
.shot-wide::before {
  content:''; position:absolute; inset:2px; pointer-events:none;
  border:1.8px solid var(--navy);
  border-radius:14px 20px 12px 22px / 20px 13px 22px 14px;
  filter:url(#inkline-bp);
}
.shot-wide img { width:100%; height:auto; display:block; border-radius:10px; }
.shot-wide figcaption { margin-top:.7rem; font-size:.85rem; color:rgba(8,24,69,.75); }

/* full-column centered figure */
.shot-full {
  clear:both; margin:2.6rem 0; width:100%;
  position:relative; background:#fff; padding:.9rem; border-radius:18px; box-sizing:border-box;
}
.shot-full::before {
  content:''; position:absolute; inset:2px; pointer-events:none;
  border:1.8px solid var(--navy);
  border-radius:14px 20px 12px 22px / 20px 13px 22px 14px;
  filter:url(#inkline-bp);
}
.shot-full img { width:100%; height:auto; display:block; border-radius:10px; }
.shot-full figcaption { margin-top:.7rem; font-size:.85rem; color:rgba(8,24,69,.75); }

/* three-up row, breaking out to both margins */
.shot-row {
  clear:both; display:grid; grid-template-columns:repeat(3, 1fr); gap:1.2rem;
  align-items:start; margin:2.8rem 0;
  margin-right:calc((100vw - min(680px, 92vw)) / -8);
  margin-left:calc((100vw - min(680px, 92vw)) / -8);
}
.shot-cell {
  margin:0; position:relative; background:#fff; padding:.7rem; border-radius:16px;
}
.shot-cell::before {
  content:''; position:absolute; inset:2px; pointer-events:none;
  border:1.7px solid var(--navy);
  border-radius:12px 18px 11px 19px / 18px 12px 19px 13px;
  filter:url(#inkline-bp);
}
.shot-cell img { width:100%; height:auto; display:block; border-radius:9px; }

/* clickable shots + lightbox */
.shot-zoom { cursor:zoom-in; }
.lightbox {
  position:fixed; inset:0; z-index:120;
  background:rgba(2,13,44,.82);
  display:flex; align-items:center; justify-content:center;
  cursor:zoom-out; padding:4vh 4vw;
}
.lightbox img { max-width:92vw; max-height:92vh; width:auto; height:auto; border-radius:8px; box-shadow:0 30px 80px rgba(0,0,0,.5); }

/* inline link button inside a running line */
.ink-btn.btn-inline { padding:.25em .9em; font-size:.95em; vertical-align:middle; }
.link-line { line-height:2.3; }

/* ---------- mobile ---------- */
@media (max-width: 720px) {
  .hero-figure { height:62vh; }
  .hero-card { margin-top:-6rem; padding:3rem 1.3rem 1.7rem 3.4rem; }
  .tape { width:84px; height:28px; top:calc(62vh - 6rem - 14px); }
  .op-nav { padding:.9rem 1.1rem; gap:1.2rem; }
  .pull, .pull-left, .shot-wide { margin-right:0; margin-left:0; }
  .shot-inline { float:none; width:100%; margin:2rem 0; }
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] { transition:none; }
}
`;
