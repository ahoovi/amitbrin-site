"use client";

/* =====================================================================
 *  BLOG POST — "כשהמשתמשים שלך לא יודעים לקרוא את השם שלך"
 *  שינוי הלוגו של אינסטגרם · דור ה-Z והמוות של הכתב המחובר
 *
 *  Design logic:
 *  · Site styleguide template (nav + paper + ink rules + share + comments)
 *  · HERO = a ruled copybook sheet with the REAL wordmarks placed on the
 *    lines like repeated writing attempts: the cursive logo, the cursive
 *    logo again (fading), then the new print logo. The r is circled in
 *    red pen. No fabricated brand typography anywhere on the page.
 *  · ONE border token (--hair) for every light rectangle; the hand-drawn
 *    ink filter is reserved for rules and buttons only.
 *  · ONE type scale, two weights (400 / 700), two families (Leon for
 *    headings + figures, Noto Sans Hebrew for everything else).
 *
 *  ALL BODY TEXT IS VERBATIM FROM AMIT'S NOTION SOURCE.
 *  Claude-generated strings are flagged with a CLAUDE-GEN comment.
 *
 *  Route: /blog/instagram-cursive-logo · Assets: /public/media/blog/instagram-cursive-logo/
 * ===================================================================== */

import { useEffect, useRef, useState } from "react";
import PostDate from "../../../components/PostDate";
import PostFooter from "../../../components/PostFooter";
import InkFrame from "../../../components/InkFrame";
import { PaperTexture } from "@paper-design/shaders-react";

const LOGO_OLD = "/media/blog/instagram-cursive-logo/logo-old.png";
const LOGO_NEW = "/media/blog/instagram-cursive-logo/logo-new.png";

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
    const amp = new Float32Array(letters.length);
    const dx_ = new Float32Array(letters.length);
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
          amp[i] += (g - amp[i]) * 0.18;
          dx_[i] += ((ddx / d) - dx_[i]) * 0.3;
          dy_[i] += ((ddy / d) - dy_[i]) * 0.3;
          const off = amp[i] * 3.5;
          l.style.setProperty("--k", amp[i].toFixed(3));
          l.style.setProperty("--cx", (dx_[i] * off).toFixed(1) + "px");
          l.style.setProperty("--cy", (dy_[i] * off).toFixed(1) + "px");
        }
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

const POST_TITLE = "כשהמשתמשים שלך לא יודעים לקרוא את השם שלך - עמית ברין";

/* ---------- figures (one frame language: hairline + soft radius) ---------- */
function useLightbox() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return { open, setOpen };
}

function Shot({ src, alt, cap }: { src: string; alt: string; cap?: string }) {
  const { open, setOpen } = useLightbox();
  return (
    <>
      <figure className="fig fig-inline" data-reveal role="button" tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter") setOpen(true); }}>
        <img src={src} alt={alt} loading="lazy" />
        {cap && <figcaption>{cap}</figcaption>}
      </figure>
      {open && (
        <div className="lightbox" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <img src={src} alt={alt} />
        </div>
      )}
    </>
  );
}

function FullShot({ src, alt, cap, bleed = false }: { src: string; alt: string; cap?: string; bleed?: boolean }) {
  const { open, setOpen } = useLightbox();
  return (
    <>
      <figure className={"fig fig-full" + (bleed ? " fig-bleed" : "")} data-reveal role="button" tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter") setOpen(true); }}>
        <img src={src} alt={alt} loading="lazy" />
        {cap && <figcaption>{cap}</figcaption>}
      </figure>
      {open && (
        <div className="lightbox" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <img src={src} alt={alt} />
        </div>
      )}
    </>
  );
}

/* ---------- story progress bars (Instagram wink) ---------- */
function StoryBars({ active }: { active: number }) {
  return (
    <div className="story-bars" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <i key={i} className={i < active ? "done" : i === active ? "on" : ""} />
      ))}
    </div>
  );
}

/* ---------- hero: ruled copybook sheet + double-tap heart easter egg ---------- */
function HeroSheet() {
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const idRef = useRef(0);
  const pop = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = ++idRef.current;
    setHearts((h) => [...h, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 950);
  };
  return (
    <figure className="hero-figure ig-cover" onDoubleClick={pop}>
      <img
        src="/media/blog/instagram-cursive-logo/cover.jpg" width={1600} height={900}
        alt="הלוגו של אינסטגרם בכתב מחובר, בין שתי דמויות בצללית"
        fetchPriority="high"
      />
      {hearts.map((h) => (
        <svg key={h.id} className="tap-heart" style={{ left: h.x, top: h.y }} viewBox="0 0 24 24" aria-hidden>
          <path d="M12 21s-7.5-4.8-9.6-9.1C.6 8.3 2.6 4.5 6.2 4.5c2.1 0 3.4 1.1 4.3 2.4h3c.9-1.3 2.2-2.4 4.3-2.4 3.6 0 5.6 3.8 3.8 7.4C19.5 16.2 12 21 12 21z" />
        </svg>
      ))}
    </figure>
  );
}

/* =====================================================================
 *  PAGE
 * ===================================================================== */
export default function InstagramPost() {
  useReveal();

  return (
    <div className="bp-root" dir="rtl" lang="he">
      <style>{CSS}</style>

      {/* filters: hand-drawn ink line (rules + buttons), print grain, red pen */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id="inkline-bp" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" />
        </filter>
        <filter id="inkline-soft" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="2" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2" />
        </filter>
        <filter id="print-grain" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="g" />
          <feDisplacementMap in="SourceGraphic" in2="g" scale="1.4" />
        </filter>
        <filter id="redpen" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="11" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
        </filter>
      </svg>

      <ReadProgress />

      {/* dialled in on /paper-lab */}
      <div className="paper-layer" aria-hidden>
        <PaperTexture
          colorBack="#f7f5ee"
          colorFront="#cad0d8"
          contrast={0.14}
          roughness={1}
          fiber={0.42}
          fiberSize={0.16}
          crumples={0.63}
          crumpleSize={0.31}
          folds={0.98}
          foldCount={14}
          fade={0.19}
          drops={0.26}
          seed={546.8}
          scale={0.39}
          fit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

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

      {/* ---------- HERO ---------- */}
      <header className="hero">
        <HeroSheet />
        <div className="hero-card" data-reveal>
          <i className="spiral" aria-hidden />
          <i className="margin-line" aria-hidden />
          <BleedTitle
            as="h1"
            className="hero-title"
            lines={["כשהמשתמשים שלך", "לא יודעים לקרוא", "את השם שלך"]}
          />
          {/* CLAUDE-GEN: standing byline line, identical pattern to the other posts */}
          <p className="hero-meta">
            מחשבות על עיצוב ועל חוויית שימוש <span className="meta-slash">/</span> עמית ברין · 7 דקות קריאה
           · <PostDate slug="instagram-cursive-logo" /></p>
        </div>
        <i className="tape tape-a" aria-hidden />
        <i className="tape tape-b" aria-hidden />
      </header>

      {/* ---------- BODY ---------- */}
      <article className="body">

        <p className="lede" data-reveal>
          אחוז הולך וגדל באינסטגרם שלי עשוי ע״י בומרים ו-Xרים שמתלוננים על כך שהנוער קורא פחות
          ופחות, ומורים שטוענים במפורש, עם דמעות בעיניים, שהבוגרים שלהם לא יודעים לקרוא…
        </p>

        <p data-reveal>
          ואנחנו מדברים פה על אינסטגרם, כן? הפלטפורמה שלוקחת את התכנים האלה ועושה בהם מה שהיא רוצה
          כי הם שלה עכשיו, יודעת על מה דברים בסרטונים, מי רואה וכמה בדיוק – הם מכירים את הסרטונים
          שרצים אצלם, וגם את קהל היעד הראשי שלהם ואת רמת הקריאה שלו…
        </p>

        <p className="lede" data-reveal>
          אז השבוע הם שינו את הלוגו שלהם.
        </p>

        {/* the two real wordmarks, side by side — no white margins, no frame */}
        <figure className="logo-compare fig-bleed" data-reveal>
          <div className="lc-cell">
            <img src={LOGO_OLD} alt="הלוגו הישן של אינסטגרם, בכתב מחובר" loading="lazy" />
            <figcaption>
              הלוגו הישן: 2013. עיצוב: מקי סאטרדיי, על בסיס פונט בילאבונג
            </figcaption>
          </div>
          <div className="lc-cell">
            <img src={LOGO_NEW} alt="הלוגו החדש של אינסטגרם, באותיות נפרדות" loading="lazy" />
            <figcaption>
              הלוגו החדש: 2026: עיצוב: ג׳סמין פרובוסט ומאי הרטונו – מנהלות צוותי העיצוב של מטא, על
              בסיס הפונטים אינסטגרם סאנס, אינסטגרם פן ו- אינסטגרם מונו.
            </figcaption>
          </div>
        </figure>

        <p data-reveal>
          לכאורה עוד ״ריענון למותג״ שנועד לתת למי שפעם התגאתה במוצר ששואב השראה מ״עולם ישן״ של
          רטרו, אנלוגי, וקראפט ידני, מראה טיפוגרפי שהולם את הטרנדים העכשויים (עליהם נדבר בפוסט
          אחר) אבל זה הכיל בתוכו שינוי מהותי: הלוגו הישן היה עשוי מאותיות בסגנון cursive (״כתב
          מחובר״) והנוער של היום – תאמינו או לא – כבר לא יודע לקרוא אותיות כאלה. אפילו לא מילה
          אחת כזו. אפילו לא את שם האפליקציה הכי שימושית ביום-יום שלהם – גם המילה הזו לבדה כבר לא
          קריאה להם.
        </p>

        <Shot
          src="/media/blog/instagram-cursive-logo/early-ui.jpg"
          alt="הממשק של אינסטגרם בשנה הראשונה שלה"
          cap="הממשק בשנה הראשונה של אינסטגרם - כשוינטג׳ מהעולם הישן היה ערך לשימור"
        />

        <p data-reveal>
          ומה עושים אינסטגרם? מנצלים את מעמדם ואת הפופולריות שלהם כדי להטמיע תוכן ומיומנויות בקהל
          הלקוחות? אין צורך, כי אפשר לצאת מזה הרבה יותר בקלות ולהפוך את הפלטפורמה לנגישה יותר עבור
          אנשים פחות מלומדים…
        </p>

        {/* ============ STATS ============ */}
        <h2 className="sec-h" data-reveal>
          גילאי השימוש באינסטגרם: דומיננטיות מובהקת לדור ה-Z ולמילניאלס
        </h2>

        <p data-reveal>
          נכון לנתונים העדכניים, אינסטגרם מונה כ-3 מיליארד משתמשים פעילים בחודש. הקהל של אינסטגרם
          נוטה באופן מובהק לצעירים, כאשר רוב מוחלט של המשתמשים הם מתחת לגיל 35.
        </p>

        <section className="stat-block fig-bleed" data-reveal>
          <header className="stat-head">
            <span className="stat-big">3 מיליארד</span>
            <span className="stat-cap">משתמשים פעילים בחודש</span>
          </header>

          <div className="stat-grid">
            <div className="stat-sq">
              <b className="stat-num" dir="ltr">33.3%</b>
              <span className="stat-lbl">25–34 (מילניאלס)</span>
              <span className="stat-cap">קבוצת הגיל הגדולה ביותר מכלל המשתמשים הגלובליים</span>
            </div>
            <div className="stat-sq">
              <b className="stat-num" dir="ltr">31.7%</b>
              <span className="stat-lbl">18–24 (דור ה-Z)</span>
              <span className="stat-cap">הקבוצה השנייה בגודלה מהמשתמשים</span>
            </div>
            <div className="stat-sq">
              <b className="stat-num" dir="ltr">81%</b>
              <span className="stat-lbl">מעל 81% מתחת לגיל 45</span>
              <span className="stat-cap">מכלל המשתמשים באינסטגרם</span>
            </div>
            <div className="stat-sq">
              <b className="stat-num" dir="ltr">64.6%</b>
              <span className="stat-lbl">בני 18–34</span>
              <span className="stat-cap">מהקהל הבוגר</span>
            </div>
          </div>
        </section>

        {/* ============ EVIDENCE — story cards ============ */}
        <h2 className="sec-h" data-reveal>
          אז בואו נדבר על ה-Z הזה: זה לא מיתוס – יש פה משבר קריאה והוא עובדה מוגמרת.
        </h2>

        <article className="ev-card" data-reveal>
          <StoryBars active={0} />
          <h3 className="card-title">יש התרסקות בקריאה חופשית</h3>
          <p>
            מחקר מ-2024 מראה שרק כ-34.6% מבני דור ה-Z והאלפא קוראים להנאתם,{" "}
            <span className="u">הנתון הנמוך ביותר שנרשם אי פעם</span>, והוא מהווה צניחה תלולה לעומת
            העשור הקודם.
          </p>
        </article>

        <article className="ev-card" data-reveal>
          <StoryBars active={1} />
          <h3 className="card-title">יש ירידה בהבנת הנקרא</h3>
          <p>
            מבחנים סטנדרטיים, כמו ה-NAEP בארה"ב, מראים שדור ה-Z הוא{" "}
            <span className="u">הדור הראשון שמציג ציונים נמוכים מקודמיו</span> בהבנת הנקרא.
          </p>
        </article>

        <article className="ev-card" data-reveal>
          <StoryBars active={2} />
          <h3 className="card-title">יש פיצול קשב, אצל כולם, ובמיוחד בגילאים האלו</h3>
          <p>
            מוח שספוג מילדות בפיד אלגוריתמי ותוכן וידאו קצרצר כבר איבד את היכולת ל"קריאת עומק".
            היכולת לצלול לטקסט מורכב ולשמור על ריכוז לאורך זמן נשחקה דרמטית, מה שהוביל להבנת נקרא
            שטחית.
          </p>
        </article>

        <article className="ev-card" data-reveal>
          <StoryBars active={3} />
          <h3 className="card-title">כתב מחובר (Cursive) הפך להיות הירוגליפים של המאה ה-21</h3>
          <p>
            סביב שנת 2010, תקני החינוך (כמו ה-Common Core בארה"ב) פשוט הסירו את לימוד הכתב המחובר
            מתוכניות הלימודים לטובת מיומנויות הקלדה. <strong>היום, כ-40% מדור ה-Z מתקשים בתקשורת
            בכתב יד בכלל</strong>, Cursive הוא בכלל קוד סתרים עבורם.
          </p>

          {/* the real wordmark, and the misreading beside it — never faked */}
          <div className="decoder">
            <span className="dec-real">
              <img src={LOGO_OLD} alt="הלוגו הישן של אינסטגרם, עם האות r מסומנת" loading="lazy" />
              <i className="redmark" aria-hidden />
            </span>
            <i className="dec-eye" aria-hidden>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
                <circle cx="12" cy="12" r="3.2" />
              </svg>
            </i>
            <span className="dec-plain" aria-hidden>Instag<b>z</b>am</span>
          </div>

          <p>
            גם אחרי השינוי של הלוגו, צעירים רבים התלוננו ברשתות שהם לא מצליחים לקרוא אותו וחשבו
            שכתוב "Instagzam" כי הם פשוט לא זיהו את האות r בכתב מחובר.
          </p>

          <FullShot
            src="/media/blog/instagram-cursive-logo/cursive-tweet.png"
            alt="ציוץ באנגלית: כתב מחובר הופך להיות ארטיפקט תרבותי, כמעט קוד סתרים לדור הצעיר"
          />
        </article>

        {/* ============ ACCESSIBILITY PRINCIPLES ============ */}
        <h2 className="sec-h" data-reveal>אז איך מנגישים חומרים לדור הזה?</h2>

        <p className="lede" data-reveal>
          קודם כל חשוב להפנים שמבחינת עיצוב טיפוגרפיה והרגלי צריכת טקסט נראה שהגענו אל סוף עידן
          הפסקאות.
        </p>

        <div className="prin-list">
          <div className="prin" data-reveal>
            <h3 className="card-title">פסקאות הן חסם קוגניטיבי</h3>
            <p>
              דור ה-Z מתקשר במשפטים קצרים וקופצניים (לרוב מתחת ל-10 מילים). לראות בלוק של טקסט
              מעורר אצלם אנטגוניזם מיידי (תרבות ה-TLDR).
            </p>
          </div>
          <div className="prin" data-reveal>
            <h3 className="card-title">סריקה מול קריאה</h3>
            <p>
              הם לא קוראים מימין לשמאל ומלמעלה למטה – הם <strong>סורקים</strong>. אבל אסטרטגיית
              החיפוש שלהם פחות מתוחכמת מאשר של הדור שקדם להם – הם מחפשים עוגנים ויזואליים, מילות
              מפתח מודגשות ואייקונים שמסמנים להם את התכל'ס.
            </p>
          </div>
          <div className="prin" data-reveal>
            <h3 className="card-title">ההשלכה הטיפוגרפית</h3>
            <p>
              תסלחו לי על הקלישאה, אבל ׳היום יותר מתמיד׳ הטיפוגרפיה חייבת לייצר היררכיה אגרסיבית.
              כותרות בולטות, שימוש קיצוני בחלל לבן (Whitespace) כדי לתת לעין "לנשום", ושבירת שורות
              תכופה. מידע שאינו מקודד ויזואלית ובנוי במקטעים (Chunking) יתקשה לעבור עיבוד קוגניטיבי.
            </p>
          </div>
          <div className="prin" data-reveal>
            <h3 className="card-title">רמת סבלנות נמוכה דרמטית</h3>
            <p>
              הם מוותרים מהר, ומאשימים את האתר, לא את עצמם. כשבני נוער מחכים לטעינה, הם פונים
              לטלפון — ולא חוזרים. שימו לב שחלק גדול מהם משתמש במכשירים מדורות קודמים (שירשו מבן
              משפחה ששדרג) עם חיבורים ועיבוד איטיים יותר.
            </p>
          </div>
        </div>

        {/* ============ UX: paradigm shift grid ============ */}
        <h2 className="sec-h" data-reveal>עיצוב UX: לעצב עבור דור שלא עוצר (ונוהג לדלג)</h2>

        <p data-reveal>
          כשאנחנו מציגים להם טקסט, ״כללי האצבע״ שלמדנו לבניית עמוד כבר לא עובדים בצורה המסורתית;
          ההתנהלות היומיומית בסטודיו ובאקדמיה הוכיחה לי שהניסיון לחנך את הדור הזה לצרוך תוכן דיגיטלי
          "כמו פעם" הוא אבוד מראש. העיצוב חייב לעבור עדכון מהחוקים והיוריסטיקות הקלאסיות ולהתיישר
          לפי מערכת ההפעלה הקוגניטיבית שלהם:
        </p>

        <div className="shift-grid fig-bleed">
          {[
            {
              old: "ניווט עמוק ותפריטים",
              now: "גלילה כטבע שני (Scrolling)",
              fix: "גלילה היא הרפלקס שלהם (מודל TikTok). העדפת פיד רציף, סווייפ במקום קליקים, ותוכן שזורם אנכית מבלי לעצור אותם.",
            },
            {
              old: "טקסט תיאורי (Copy)",
              now: "ויזואליה כטקסט",
              fix: "עיבוד תמונה ווידאו אצלם מהיר משמעותית. חובה להשתמש במיקרו-אנימציות וסרטונים קצרים או מודלים תלת-ממדיים במקום טקסט ארוך.",
            },
            {
              old: "סבלנות למורכבות",
              now: "עומס קוגניטיבי = נטישה",
              fix: "מינימליזם מחמיר. כל אלמנט שאינו משרת פעולה מידית (Call to Action) מייצר עייפות החלטות (Decision fatigue) ומוביל לנטישה.",
            },
            {
              old: "ממשק סטטי מאורגן",
              now: "משוב קינטי (Micro-interactions)",
              fix: "הממשק חייב \"להרגיש חי\". כפתורים שמגיבים בתנועה קלה למגע (Tactile feedback), פידבק ויזואלי מיידי לפעולות המדמה סביבה אינטראקטיבית טבעית.",
            },
          ].map((r, i) => (
            <div className="shift" data-reveal key={i}>
              <div className="shift-head">
                <span className="shift-old">{r.old}</span>
                <i className="shift-arrow" aria-hidden>←</i>
                <span className="card-title">{r.now}</span>
              </div>
              <p>{r.fix}</p>
            </div>
          ))}
        </div>

        <figure className="fig fig-full fig-bleed" data-reveal>
          <video
            src="/media/blog/instagram-cursive-logo/story-3d.mp4"
            aria-label="סרטון: מעבר תלת־ממדי בין סטוריז של משתמשים שונים באינסטגרם. התיאור המלא בכיתוב מתחת."
            poster="/media/blog/instagram-cursive-logo/story-3d-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <figcaption>
            הנגשה סקיאומורפית של פעולת מעבר בין יוזרים בסטוריז - לא פיצ׳ר חדש, אבל רק לאחרונה נוספה
            ההמחשה הזו שמבהירה באופן ויזואלי דימוי של מעבר בין עמודים שונים. (סרטון מתוך אתר{" "}
            <a
              className="in-link"
              href="https://designspells.com/spells/3d-transition-when-navigating-to-a-story-from-a-different-user-on-instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              designspells
            </a>
            )
          </figcaption>
        </figure>

        {/* ============ UI principles ============ */}
        <h2 className="sec-h" data-reveal>עיצוב UI לדור שטובע בגירויים ופיתויים</h2>

        <p data-reveal>
          הראיות הטובות ביותר מגיעות לרוב ממחקרי שימוש בבני נוער ובצעירים, ולא מ״חוקים דוריים״.{" "}
          <a
            className="in-link"
            href="https://media.nngroup.com/media/reports/free/UX_Design_for_Teenagers_3rd_Edition.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            מחקרי Nielsen Norman Group
          </a>{" "}
          מצאו שבני 13–17 הם משתמשים ממוקדי־מטרה ומצפים שהאתר או האפליקציה יהיו קלים לשימוש; הם
          העדיפו ניווט עקבי וצפוי, וההמלצה המרכזית עבור הקהל הזה היא לעצב למובייל בפשטות — במיוחד
          באתרים עתירי תוכן.
        </p>

        <div className="ui-list" data-reveal>
          {[
            ["ערך מיידי", "להבהיר במסך הראשון מה המשתמש יכול לעשות ולמה זה מועיל"],
            ["מובייל־פירסט", "פעולות מרכזיות בטווח אגודל, יעדי מגע גדולים ומרווחים"],
            ["ניווט צפוי", "שמות ברורים, מבנה עקבי, חיפוש שימושי ויכולת חזרה פשוטה"],
            ["משוב מיידי", "אישור לפעולות, מצבי טעינה, שמירה ושגיאות בשפה אנושית"],
            ["בחירה ושליטה", "מצב כהה, גודל טקסט, התראות בשליטת המשתמש ופרטיות מובנת"],
            ["אותנטיות", "פחות מניפולציות, פחות “דארק פטרנס”, יותר שקיפות והסבר"],
            ["בדיקה אמפירית", "לבדוק עם משתמשים מהקהל הספציפי — לא להניח שהם רוצים פחות טקסט או יותר אנימציה"],
          ].map(([k, v], i) => (
            <div className="ui-row" key={i}>
              <b className="ui-idx" aria-hidden>{String(i + 1).padStart(2, "0")}</b>
              <span className="card-title">{k}</span>
              <span className="ui-v">{v}</span>
            </div>
          ))}
        </div>

        <FullShot
          bleed
          src="/media/blog/instagram-cursive-logo/nng-american-eagle.jpg"
          alt="עמוד הבית של אמריקן איגל מתוך המחקר של Nielsen Norman Group"
          cap="דוגמה מהמחקר של Nielsen Norman Group - עמוד הבית של אמריקן איגל במפגן היררכיה מלא אימפקט"
        />

        {/* ============ SCREEN vs PRINT ============ */}
        <h2 className="sec-h" data-reveal>מסך, דפוס והבנה</h2>

        <p data-reveal>
          <a
            className="in-link"
            href="https://onlinelibrary.wiley.com/doi/abs/10.1111/1467-9817.12269"
            target="_blank"
            rel="noopener noreferrer"
          >
            מחקרי מטא־אנליזה מצאו יתרון קטן אך עקבי לדפוס
          </a>{" "}
          בהבנת טקסט לעומת מסך, בעיקר בטקסטים עיוניים. בסקירה אחת של 33 מחקרים, הקריאה ממסך פגעה
          בממוצע בביצועי ההבנה יחסית לנייר, והקוראים גם העריכו פחות במדויק עד כמה הבינו את הטקסט.
        </p>

        <p data-reveal>
          אבל ההשפעה <strong>היא לא אוניברסלית</strong>:{" "}
          <a
            className="in-link"
            href="https://www.tandfonline.com/doi/full/10.1080/15213269.2022.2070216"
            target="_blank"
            rel="noopener noreferrer"
          >
            במטה־אנליזה על טקסטים נרטיביים
          </a>{" "}
          לא נמצא הבדל מובהק בהבנה בין מסך לדפוס, ופונקציות דיגיטליות רלוונטיות לסיפור עשויות אפילו
          לעזור. לכן הבעיה אינה “מסכים הורסים קריאה”, אלא התאמה בין מדיום, משימה ותנאי קריאה:
        </p>

        <div className="diptych" data-reveal>
          <div className="dip dip-screen">
            <i className="dip-ic" aria-hidden>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3.5" width="20" height="14" rx="2" /><path d="M8 21h8M12 17.5V21" />
              </svg>
            </i>
            <p>לקריאה קצרה, חיפוש מידע, ניווט, סריקה או תוכן נרטיבי: מסך דווקא יכול להיות יעיל מאוד.</p>
          </div>
          <div className="dip dip-print">
            <i className="dip-ic" aria-hidden>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 3h16v18H4z" /><path d="M8 8h8M8 12h8M8 16h5" />
              </svg>
            </i>
            <p>לקריאה לצורך החלטה, לימוד, חוזה, מחקר או ניתוח מורכב: תצוגה יציבה, מעט הסחות, היררכיה ברורה ואפילו דפוס – עובדים טוב יותר.</p>
          </div>
        </div>

        <p data-reveal>
          הסחות, קישורים, התראות, גלילה ומעברים תכופים מגדילים את הסיכוי לסריקה שטחית — לא משום
          שלצעירים אין יכולת להבין, אלא משום שהמדיום מעודד אופן קריאה אחר.
        </p>

        <p data-reveal>
          ההמלצה המעשית למעצב/מאפיין היא דווקא לא “לעצב קצר כי Gen Z לא קוראים”, אלא לבנות{" "}
          <strong>שתי שכבות</strong>: סריקה מהירה שמבהירה ערך, ונתיב עומק למי שצריך להבין, להשוות
          או להחליט. ניווט עקבי, תוכן מובנה ומטרות מגע גדולות נשענים על ממצאי שימוש ישירים בבני
          נוער;{" "}
          <a
            className="in-link"
            href="https://media.nngroup.com/media/reports/free/UX_Design_for_Teenagers_3rd_Edition.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            NN/g ממליצים
          </a>{" "}
          גם על יעדי מגע של לפחות כ־1 ס״מ פיזי במכשירי מגע (הרבה יותר ממה שלימדו אותנו בקורסים,
          למקרה שחיפשת פרופורציות).
        </p>

        <p data-reveal>
          אי אפשר לצפות שהמשתמש הצעיר יתאמץ לפענח ארכיטקטורת מידע עמוסת מלל.
        </p>

        <aside className="pull" data-reveal>
          <BleedTitle
            as="blockquote"
            className="pull-title"
            lines={["אם הממשק לא מבהיר את הערך", "ב-3 השניות הראשונות – איבדת אותו."]}
          />
        </aside>

        <p data-reveal>
          האתגר האמיתי היום לא בהכרח לבנות מערכות מידע מורכבות, אלא לפצח איך לזקק תוכן עמוק או מורכב
          למסלול פעולה חלק, מינימליסטי ובלי שום חיכוך.
        </p>

        {/* ============ ISRAEL APPENDIX ============ */}
        <section className="appendix fig-bleed" data-reveal>
          <span className="apx-flag" aria-hidden>🇮🇱</span>
          <h2 className="apx-title">נספח מקומי: אינסטגרם בישראל</h2>
          <p className="apx-lede">ישראל היא שוק אינסטגרם חזק במיוחד:</p>

          <ul className="apx-list">
            <li>
              <b className="apx-num" dir="ltr">82%</b>
              <span>
                בסקר איגוד האינטרנט הישראלי ממאי 2026, <strong>82% מהבוגרים</strong> דיווחו שהם
                משתמשים באינסטגרם. זהו המדד הרביעי בגובהו אחרי ווטסאפ, יוטיוב ופייסבוק.{" "}
                <a className="in-link" href="https://www.isoc.org.il/sts-data/social-media-usage-survey-2026" target="_blank" rel="noopener noreferrer">
                  איגוד האינטרנט הישראלי, 2026
                </a>
              </span>
            </li>
            <li>
              <b className="apx-num" dir="ltr">5M</b>
              <span>
                לפי כלי הפרסום של Meta בסוף 2025, ניתן היה להגיע לכ־<strong>5 מיליון חשבונות
                בישראל</strong>: כ־74% מהאוכלוסייה הבוגרת וכ־68.6% מבני 13 ומעלה.{" "}
                <a className="in-link" href="https://datareportal.com/reports/digital-2026-israel" target="_blank" rel="noopener noreferrer">
                  DataReportal Israel 2026
                </a>
              </span>
            </li>
            <li>
              <b className="apx-num" dir="ltr">90%</b>
              <span>
                בסקר הגילים המפורט מ־2024: 90% מבני 18–22, 86% מבני 23–29, 75% מבני 30–39 ו־68%
                מבני 40–49 דיווחו על שימוש באינסטגרם.{" "}
                <a className="in-link" href="https://www.isoc.org.il/sts-data/digital-services-use-il-2024" target="_blank" rel="noopener noreferrer">
                  איגוד האינטרנט הישראלי, פילוח 2024
                </a>
              </span>
            </li>
            <li>
              <b className="apx-num" dir="ltr">86/78</b>
              <span>
                ב־2026 נמדדו 86% שימוש בקרב נשים לעומת 78% בקרב גברים. בחברה הערבית הפער היה גדול
                יותר: 97% מהנשים לעומת 81% מהגברים.
              </span>
            </li>
          </ul>

          <p className="apx-close">
            המסקנה השיווקית: אם המוצר מיועד לישראל או לקהל בינלאומי עירוני, אינסטגרם אינה רק ערוץ של
            בני נוער. הקהל המרכזי הוא Gen Z הבוגר ומילניאלס צעירים, אבל בישראל ניתן להגיע באמצעותה
            גם לחלק גדול מבני 35–49. לעומת זאת, קמפיין בינלאומי דורש לוקליזציה חזקה: הודו, ברזיל,
            ארה״ב וישראל הן כולן “שווקי אינסטגרם”, אך הגילים, השפות, היחס בין נשים לגברים ודפוסי
            התוכן שונים מאוד.
          </p>
        </section>

        <hr className="ink-rule" data-reveal />

        <PostFooter slug="instagram-cursive-logo" title={POST_TITLE} />

        <footer className="bp-footer" data-reveal>
          <button type="button" className="ink-btn" onClick={() => history.back()}><InkFrame seed={4} />→ בחזרה</button>
        </footer>
      </article>
    </div>
  );
}

/* =====================================================================
 *  CSS
 *  Type scale (the whole page uses only these):
 *    --fs-h1  --fs-h2  --fs-lede  --fs-body  --fs-card  --fs-small
 *  Weights: 400 and 700. Families: Leon (display) + Noto Sans Hebrew.
 *  Frames: a single --hair token. The ink filter is for rules + buttons.
 * ===================================================================== */
const CSS = `

@font-face { font-family:'Leon'; src:url('/fonts/Leon-Thin.woff2') format('woff2');    font-weight:100 300; font-display:swap; }
@font-face { font-family:'Leon'; src:url('/fonts/Leon-Regular.woff2') format('woff2'); font-weight:400 500; font-display:swap; }
@font-face { font-family:'Leon'; src:url('/fonts/Leon-Bold.woff2') format('woff2');    font-weight:600 700; font-display:swap; }
@font-face { font-family:'Leon'; src:url('/fonts/Leon-Heavy.woff2') format('woff2');   font-weight:800 900; font-display:swap; }

.bp-root {
  --navy-deep:#020D2C; --navy:#081845; --gold:#CFBD85; --cream:#EADEB7;
  --gold-ink:#6B5B26;
  --paper:#f6f3e9; --card:#fdfcf6; --red:#c0392b;
  --line:rgba(2,13,44,.16);
  --hair:1.5px solid var(--line);
  --radius:18px;
  --muted:rgba(8,24,69,.7);
  --ease:cubic-bezier(.22,.9,.24,1);

  --fs-h1:clamp(1.75rem, 5vw, 3.7rem);
  --fs-h2:clamp(1.5rem, 3vw, 2.1rem);
  --fs-lede:clamp(1.16rem, 1.5vw, 1.3rem);
  --fs-body:clamp(1.03rem, 1.1vw, 1.1rem);
  --fs-card:1.14rem;
  --fs-small:.88rem;

  font-family:'Noto Sans Hebrew', Arial, sans-serif;
  font-weight:400;
  color:var(--navy-deep);
  background-color:var(--paper);
  min-height:100vh;
  overflow-x:hidden;
  position:relative;
}
.bp-root .hero, .bp-root .body { position:relative; z-index:1; }
.bp-root h1, .bp-root h2, .bp-root h3, .bp-root blockquote,
.bp-root .card-title, .bp-root .stat-num, .bp-root .stat-big,
.bp-root .apx-num, .bp-root .ui-idx, .bp-root .dec-plain {
  font-family:'Leon','Noto Sans Hebrew',sans-serif;
  font-weight:700;
}
.bp-root h1, .bp-root h3, .bp-root blockquote, .bp-root .card-title { margin:0; }
.bp-root strong { font-weight:700; }
.bp-root .u { text-decoration:underline; text-underline-offset:3px; text-decoration-thickness:1.5px; }

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
.nav-links a { color:#fff; text-decoration:none; font-family:'Leon',sans-serif; font-weight:400; font-size:1rem; letter-spacing:.02em; transition:opacity .4s var(--ease); }
.nav-links a:hover { opacity:.65; }

/* ---------- HERO: ruled copybook sheet, real wordmarks as attempts ---------- */
.hero { position:relative; }
.hero-figure { margin:0; height:80vh; overflow:hidden; position:relative; }

.ig-cover { background:#1b1030; }
.ig-cover img { width:100%; height:100%; object-fit:cover; display:block; }

/* the paper shader lives here; the wrapper must carry the fixed box itself,
   otherwise the filter creates a containing block and the canvas collapses */
.paper-layer {
  position:fixed; inset:0; z-index:0; pointer-events:none;
  filter:saturate(0.88) brightness(1.05) contrast(0.95);
}

/* double-tap heart easter egg */
.tap-heart {
  position:absolute; width:88px; height:88px; margin:-44px 0 0 -44px;
  fill:#fff; z-index:6; pointer-events:none;
  filter:drop-shadow(0 4px 14px rgba(2,13,44,.35));
  animation:heartPop .95s var(--ease) both;
}
@keyframes heartPop {
  0% { opacity:0; transform:scale(.2) rotate(-14deg); }
  22% { opacity:1; transform:scale(1.18) rotate(4deg); }
  38% { transform:scale(1) rotate(0deg); }
  100% { opacity:0; transform:scale(1.05) translateY(-38px); }
}

/* ---------- hero card: a page torn out of a spiral notebook ---------- */
.hero-card {
  position:relative; z-index:3;
  width:min(880px, 92vw); margin:-11rem auto 0;
  padding:3.6rem clamp(1.6rem, 4vw, 3.2rem) 2.4rem 4.2rem;
  background:
    linear-gradient(180deg, rgba(2,13,44,.03), transparent 8%),
    var(--card);
  transform:rotate(-.6deg);
  clip-path:polygon(
    0 1.2%, 3% 0, 97% .6%, 100% 2%,
    99.4% 20%, 100% 34%, 99.2% 47%, 100% 61%, 99.5% 74%, 100% 88%, 99.3% 98%,
    96% 100%, 78% 99%, 55% 100%, 32% 99.2%, 12% 100%, 2% 99%, 0 96%
  );
  filter:drop-shadow(0 24px 30px rgba(2,13,44,.25)) drop-shadow(0 4px 8px rgba(2,13,44,.12)) drop-shadow(0 46px 60px rgba(2,13,44,.14));
  -webkit-mask-image:radial-gradient(circle at calc(100% - 1.55rem) 50%, transparent 0 5.5px, #000 6px);
  -webkit-mask-size:100% 30px;
  -webkit-mask-repeat:repeat-y;
  mask-image:radial-gradient(circle at calc(100% - 1.55rem) 50%, transparent 0 5.5px, #000 6px);
  mask-size:100% 30px;
  mask-repeat:repeat-y;
}
.hero-card[data-reveal] { transform:rotate(-.6deg) translateY(26px); }
.hero-card[data-reveal].in { transform:rotate(-.6deg); }
.hero-card::before {
  content:''; position:absolute; inset:0; pointer-events:none; z-index:1;
  background:
    linear-gradient(112deg, transparent 42%, rgba(2,13,44,.055) 42.5%, rgba(255,255,255,.5) 43.1%, transparent 44%),
    linear-gradient(248deg, transparent 63%, rgba(2,13,44,.05) 63.4%, rgba(255,255,255,.45) 64%, transparent 64.9%);
}
.hero-card::after {
  content:''; position:absolute; inset:0; pointer-events:none;
  opacity:.4; mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.28'/%3E%3C/svg%3E");
}
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
.margin-line {
  position:absolute; left:1.2rem; right:2.8rem; top:2.6rem; height:1.5px; z-index:2;
  background:rgba(198,74,74,.4);
  filter:url(#inkline-bp);
}
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

.hero-title { color:var(--navy); font-size:var(--fs-h1); line-height:1.05; }
.post-date { font-variant-numeric:tabular-nums; }
.hero-meta { margin:1.6rem 0 0; text-align:center; font-size:var(--fs-small); color:var(--muted); }
.meta-slash { margin:0 .5em; opacity:.5; }

/* ---------- body column ---------- */
.body {
  width:min(680px, 92vw); margin:0 auto; padding:5rem 0 6rem;
  font-size:var(--fs-body); line-height:1.95;
}
.body > p { margin:0 0 1.7em; }
.lede { font-size:var(--fs-lede); line-height:1.8; }

.in-link { color:var(--navy); text-decoration:underline; text-underline-offset:3px; text-decoration-thickness:1.5px; text-decoration-color:var(--gold); transition:color .3s var(--ease); }
.in-link:hover { color:var(--gold-ink); }

/* section headings — a full heading-line of air beneath, more above */
.bp-root .sec-h {
  clear:both;
  color:var(--navy); font-size:var(--fs-h2); line-height:1.22;
  margin:6rem 0 2.9rem;
  padding-right:1.1rem;
  border-right:5px solid var(--gold);
}
.card-title { color:var(--navy); font-size:var(--fs-card); line-height:1.3; }

.ink-rule {
  border:none; height:0; margin:3.4rem auto;
  width:min(420px, 80%);
  border-top:3px solid var(--navy);
  filter:url(#inkline-bp);
  opacity:.85;
}

/* ---------- pull quote (always right-aligned in RTL) ---------- */
.pull {
  clear:both; margin:3.6rem 0;
  margin-right:calc((100vw - min(680px, 92vw)) / -4);
  position:relative; padding:.4rem 0;
}
.pull-title { color:var(--navy); font-size:clamp(1.5rem, 3.4vw, 2.6rem); line-height:1.18; }
.pull::after {
  content:''; display:block; margin-top:1.4rem;
  width:100%; border-top:3px solid var(--navy);
  filter:url(#inkline-bp);
}

/* ---------- one bleed token for wide blocks ---------- */
.fig-bleed {
  margin-right:calc((100vw - min(680px, 92vw)) / -10);
  margin-left:calc((100vw - min(680px, 92vw)) / -10);
  width:auto;
}

/* ---------- figures: one frame language ---------- */
.fig {
  margin:2.6rem 0; box-sizing:border-box;
  background:var(--card);
  border:var(--hair); border-radius:var(--radius);
  overflow:hidden; cursor:zoom-in;
}
.fig img, .fig video { width:100%; height:auto; display:block; }
.fig figcaption {
  padding:.75rem 1rem .9rem;
  font-size:var(--fs-small); line-height:1.6; color:var(--muted);
  border-top:var(--hair);
}
.fig-inline {
  float:left; clear:left;
  width:min(250px, 60vw);
  margin:.4rem 2.2rem 3.4rem 0;
}
.fig-full { clear:both; width:100%; }

/* ---------- the two real wordmarks, no white margin, no inner frame ---------- */
.logo-compare {
  clear:both; margin:2.8rem 0; padding:0;
  display:grid; grid-template-columns:1fr 1fr;
  border:var(--hair); border-radius:var(--radius);
  background:var(--card); overflow:hidden;
}
.lc-cell { padding:clamp(1.4rem, 3.5vw, 2.6rem) clamp(1rem, 3vw, 2.2rem); display:grid; place-items:center; }
.lc-cell + .lc-cell { border-right:var(--hair); }
.lc-cell img { width:100%; height:auto; display:block; }
.lc-cell figcaption {
  margin-top:1.1rem;
  font-size:.78rem; line-height:1.55; color:var(--muted); text-align:center;
}

/* ---------- STATS: one outer block titled "3 מיליארד" ---------- */
.stat-block {
  clear:both; margin:2.4rem 0 3rem;
  border:var(--hair); border-radius:var(--radius);
  background:var(--card);
  padding:clamp(1.3rem, 3vw, 2rem);
}
.stat-head {
  display:flex; align-items:baseline; gap:.9rem; flex-wrap:wrap;
  padding-bottom:1.2rem; margin-bottom:1.3rem;
  border-bottom:var(--hair);
}
.stat-big { color:var(--navy); font-size:clamp(2.2rem, 5.5vw, 3.2rem); line-height:1; }
.stat-cap { font-size:var(--fs-small); line-height:1.5; color:var(--muted); }
.stat-grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:.9rem; }
.stat-sq {
  border:var(--hair); border-radius:14px;
  padding:1.3rem 1.1rem;
  display:flex; flex-direction:column; align-items:center; text-align:center; gap:.2rem;
}
.stat-num { color:var(--navy); font-size:clamp(2rem, 5vw, 2.9rem); line-height:1; }
.stat-lbl { font-weight:700; font-size:var(--fs-small); color:var(--navy); margin-top:.5rem; }

/* ---------- EVIDENCE cards ---------- */
.ev-card {
  clear:both;
  background:var(--card);
  border:var(--hair); border-radius:var(--radius);
  padding:1.4rem 1.4rem 1.3rem;
  margin:0 0 1rem;
}
.ev-card > p { margin:0; line-height:1.85; }
.ev-card > p + p { margin-top:1rem; }
.ev-card .card-title { display:block; margin:.9rem 0 .55rem; }
.ev-card .fig { margin:1.4rem 0 0; }
.story-bars { display:flex; gap:5px; }
.story-bars i { flex:1; height:3px; border-radius:3px; background:var(--line); }
.story-bars i.done { background:rgba(2,13,44,.42); }
.story-bars i.on { background:var(--gold-ink); }

/* ---------- decoder: the real wordmark vs. what gets read ---------- */
.decoder {
  margin:1.5rem 0 1.3rem;
  padding:1.6rem 1.2rem;
  background:#f5f1e2;
  border:var(--hair); border-radius:14px;
  display:flex; flex-direction:column; align-items:center; gap:.7rem;
  direction:ltr;
}
.dec-real { position:relative; display:block; width:min(300px, 62%); line-height:0; }
/* red-pen circle over the r; percentages are measured off the real artwork */
.dec-real .redmark {
  position:absolute;
  left:66.5%; top:50%;
  width:15.5%; height:58%;
  border:2.5px solid var(--red);
  border-radius:52% 48% 46% 54% / 48% 52% 48% 52%;
  opacity:.9;
  filter:url(#redpen);
  transform:translate(-50%, -50%) rotate(-8deg);
  pointer-events:none;
}
.dec-real img { width:100%; height:auto; display:block; }
.dec-plain { font-size:1.5rem; color:var(--navy); letter-spacing:-.01em; }
.dec-plain b {
  font-weight:inherit;
  background:linear-gradient(180deg, transparent 58%, var(--gold) 58%);
  padding:0 .06em;
}
.dec-eye { color:rgba(8,24,69,.45); display:block; }

/* ---------- principles ---------- */
.prin-list { clear:both; margin:1.4rem 0 3rem; }
.prin {
  display:grid; grid-template-columns:minmax(150px, 32%) 1fr; gap:1.2rem;
  padding:1.4rem 0;
  border-top:var(--hair);
}
.prin:last-child { border-bottom:var(--hair); }
.prin p { margin:0; line-height:1.85; }

/* ---------- paradigm shift grid ---------- */
.shift-grid { clear:both; display:grid; grid-template-columns:repeat(2, 1fr); gap:.9rem; margin:1.8rem 0 3rem; }
.shift {
  background:var(--card); border:var(--hair); border-radius:var(--radius);
  padding:1.3rem;
  display:flex; flex-direction:column; gap:.8rem;
}
.shift-head { display:flex; align-items:center; gap:.6rem; flex-wrap:wrap; }
.shift-old { font-size:var(--fs-small); color:rgba(8,24,69,.5); text-decoration:line-through; text-decoration-thickness:1.5px; }
.shift-arrow { color:var(--gold-ink); font-style:normal; line-height:1; }
.shift p { margin:0; line-height:1.8; }

/* ---------- UI principle list ---------- */
.ui-list { clear:both; margin:1.6rem 0 2.6rem; border-top:2px solid var(--navy); }
.ui-row {
  display:grid; grid-template-columns:2.4rem minmax(112px, 26%) 1fr;
  gap:.9rem; align-items:baseline;
  padding:1rem .2rem;
  border-bottom:var(--hair);
}
.ui-idx { color:var(--gold-ink); font-size:1rem; }
.ui-v { line-height:1.75; }

/* ---------- diptych ---------- */
.diptych { clear:both; display:grid; grid-template-columns:1fr 1fr; gap:.9rem; margin:2rem 0 2.4rem; }
.dip {
  padding:1.4rem 1.3rem; border-radius:var(--radius);
  display:flex; flex-direction:column; gap:.7rem; line-height:1.8;
}
.dip p { margin:0; }
.dip-screen { background:var(--navy); color:var(--cream); }
.dip-screen .dip-ic { color:var(--gold); }
.dip-print { background:var(--card); border:var(--hair); color:var(--navy-deep); }
.dip-print .dip-ic { color:var(--navy); }
.dip-ic { display:block; }

/* ---------- ISRAEL APPENDIX ---------- */
.appendix {
  clear:both; position:relative;
  margin:4rem 0 1rem;
  background:var(--navy-deep); color:var(--cream);
  border-radius:var(--radius); padding:2.6rem clamp(1.3rem, 3vw, 2.2rem) 2.2rem;
  box-shadow:0 26px 50px rgba(2,13,44,.28);
}
.apx-flag {
  position:absolute; top:-18px; right:2rem;
  width:44px; height:44px; border-radius:14px;
  background:var(--gold); display:grid; place-items:center;
  font-size:1.3rem; box-shadow:0 8px 18px rgba(2,13,44,.3);
}
.bp-root .apx-title { margin:0; color:#fff; font-size:var(--fs-h2); line-height:1.2; }
.apx-lede { margin:.9rem 0 1.6rem; color:var(--gold); font-weight:700; font-size:var(--fs-body); }
.apx-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:1.1rem; }
.apx-list li {
  display:grid; grid-template-columns:5rem 1fr; gap:1rem; align-items:start;
  padding-bottom:1.1rem; border-bottom:1px solid rgba(234,222,183,.18);
  line-height:1.8;
}
.apx-list li:last-child { border-bottom:none; padding-bottom:0; }
.apx-num { color:var(--gold); font-size:1.8rem; line-height:1.2; text-align:center; }
.appendix strong { color:#fff; }
.appendix .in-link { color:var(--gold); text-decoration-color:rgba(207,189,133,.5); }
.appendix .in-link:hover { color:#fff; }
.apx-close { margin:1.8rem 0 0; line-height:1.85; color:rgba(234,222,183,.92); }

/* ---------- lightbox ---------- */
.lightbox {
  position:fixed; inset:0; z-index:120;
  background:rgba(2,13,44,.82);
  display:flex; align-items:center; justify-content:center;
  cursor:zoom-out; padding:4vh 4vw;
}
.lightbox img { max-width:92vw; max-height:92vh; width:auto; height:auto; border-radius:8px; box-shadow:0 30px 80px rgba(0,0,0,.5); }

/* ---------- ink buttons: hover re-traces the line, it never fills ---------- */
.ink-btn {
  display:inline-flex; align-items:center; gap:.55em;
  position:relative; z-index:0;
  font-family:'Leon',sans-serif; font-weight:400; font-size:1rem;
  color:var(--navy); background:transparent;
  padding:.6em 1.5em; text-decoration:none; cursor:pointer; border:none;
  --step:5px;
  transition:transform .5s var(--ease);
}
.ink-btn:active { transform:scale(.98); }
.ink-btn svg:not(.ink-frame) { flex:0 0 auto; }

/* ---------- BleedTitle ---------- */
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

/* ---------- responsive ---------- */
@media (max-width: 860px) {
  .prin { grid-template-columns:1fr; gap:.5rem; }
  .shift-grid, .diptych { grid-template-columns:1fr; }
}
@media (max-width: 720px) {
  /* a 4:3 box keeps the whole wordmark inside the crop on phones */
  .hero-figure { height:auto; aspect-ratio:4 / 3; }
  .hero-card { margin-top:-2rem; padding:2.6rem 1.3rem 1.7rem 3.4rem; }
  .tape { width:84px; height:28px; top:calc(75vw - 2rem - 14px); }
  .body { padding:3rem 0 5rem; }
  .op-nav { padding:.9rem 1.1rem; gap:.9rem; }
  .nav-links { gap:1rem; }
  .nav-links a { font-size:.86rem; }
  .nav-logo img { height:26px; }
  .pull, .fig-bleed { margin-right:0; margin-left:0; }
  .fig-bleed { width:100%; }
  .fig-inline { float:none; width:100%; margin:2rem 0; }
  .logo-compare { grid-template-columns:1fr; }
  .lc-cell + .lc-cell { border-right:none; border-top:var(--hair); }
  .ui-row { grid-template-columns:2rem 1fr; }
  .ui-v { grid-column:2; }
  .apx-list li { grid-template-columns:4rem 1fr; gap:.8rem; }
  .bp-root .sec-h { margin:4.4rem 0 2.2rem; }
  .stat-grid { gap:.7rem; }
  .stat-sq { padding:1.1rem .8rem; }
  /* the rail turns into a swipeable row on phones */
}
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { transition:none; }
  .tap-heart { animation:none; }
}
`;
