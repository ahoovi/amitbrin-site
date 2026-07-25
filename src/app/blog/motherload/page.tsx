"use client";

/* =====================================================================
 *  BLOG POST — "Mother Load" (רייצ׳ל מאני)  ·  v2 (per Amit's revisions)
 *  · Site nav + blur veil on top; hero corner labels in negative
 *  · 80vh cover, frosted-grain glass title card
 *  · Persistent CMY ink-bleed title effect (front letters static)
 *  · Inline floating screenshots breaking left out of the column
 *  · Facebook + icons in share, sketchy multi-stroke send button
 *  Route: /blog/whatsapp · Assets: /public/media/blog/whatsapp/
 * ===================================================================== */

import { useEffect, useRef, useState } from "react";
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
    <Tag ref={ref} className={"blt " + className}>
      {lines.map((line, li) => (
        <span className="fxl" key={li}>
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

/* ---------- share ---------- */
const POST_URL = "https://amitbrin.com/blog/motherload";
const POST_TITLE = "Mother Load - עמית ברין";

const Ic = {
  wa: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35zM12.05 21.6h-.01a9.55 9.55 0 0 1-4.87-1.33l-.35-.21-3.62.95.97-3.53-.23-.36a9.53 9.53 0 1 1 8.11 4.48zM12.05.9C5.93.9.96 5.87.96 11.99c0 1.95.51 3.86 1.48 5.54L.87 23.1l5.71-1.5a11.05 11.05 0 0 0 5.46 1.44h.01c6.12 0 11.09-4.97 11.09-11.09C23.14 5.87 18.17.9 12.05.9z"/></svg>
  ),
  li: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z"/></svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.66l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/></svg>
  ),
  fb: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05v-2.66c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z"/></svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  ),
};

function ShareRow({ punchline = false }: { punchline?: boolean }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const copy = async () => {
    try { await navigator.clipboard.writeText(POST_URL); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {}
  };
  return (
    <div className={"share-row" + (punchline ? " share-punch" : "")}>
      {punchline && <p className="share-wink">קדימה, אל תתביישו:</p>}
      <div className="share-btns">
        <a className="ink-btn" href={`https://wa.me/?text=${enc(POST_TITLE + " " + POST_URL)}`} target="_blank" rel="noopener noreferrer">
          {Ic.wa} להעביר בוואטסאפ
        </a>
        <a className="ink-btn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(POST_URL)}`} target="_blank" rel="noopener noreferrer">
          {Ic.li} LinkedIn
        </a>
        <a className="ink-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(POST_URL)}`} target="_blank" rel="noopener noreferrer">
          {Ic.fb} פייסבוק
        </a>
        <a className="ink-btn" href={`https://x.com/intent/tweet?text=${enc(POST_TITLE)}&url=${enc(POST_URL)}`} target="_blank" rel="noopener noreferrer">
          {Ic.x} X
        </a>
        <button className="ink-btn" type="button" onClick={copy}>
          {Ic.link} {copied ? "הועתק ✓" : "העתקת קישור"}
        </button>
      </div>
    </div>
  );
}

/* ---------- comments ---------- */
function Comments() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    try {
      const res = await fetch("https://formspree.io/f/xpqvaarr", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (res.ok) { setState("ok"); form.reset(); } else setState("err");
    } catch { setState("err"); }
  };
  return (
    <section className="comments" data-reveal>
      <h3 className="comments-title">יש לך מה להגיד על זה?</h3>
      <p className="comments-sub">תגובות מגיעות ישירות אליי. בואו נדבר על זה.</p>
      {state === "ok" ? (
        <p className="comments-ok">תודה! התגובה נשלחה.</p>
      ) : (
        <form className="comments-form" onSubmit={submit}>
          <input type="hidden" name="_subject" value="תגובה חדשה בבלוג: Mother Load" />
          <input type="hidden" name="post" value="motherload" />
          <div className="comments-grid">
            <input className="c-in" type="text" name="name" placeholder="שם" required />
            <input className="c-in" type="email" name="email" placeholder="אימייל (לא יפורסם)" required />
          </div>
          <textarea className="c-in c-area" name="comment" placeholder="מה עובר לך בראש?" rows={4} required />
          <button className="ink-btn scribble c-send" type="submit" disabled={state === "sending"}>
            <i aria-hidden /><i aria-hidden /><i aria-hidden />
            {state === "sending" ? "שולח…" : "שליחת תגובה"}
          </button>
          {state === "err" && <p className="comments-err">משהו השתבש בשליחה. אפשר לנסות שוב, או פשוט לכתוב לי למייל.</p>}
        </form>
      )}
    </section>
  );
}

/* ---------- inline floating screenshot ---------- */
function Shot({ src, alt, cap }: { src: string; alt: string; cap: string }) {
  return (
    <figure className="shot-inline" data-reveal>
      <img src={src} alt={alt} loading="lazy" />
      <figcaption>{cap}</figcaption>
    </figure>
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
        <a href="/site#top" className="nav-logo" aria-label="עמית ברין - ראשי">
          <img src="/media/amit-brin-logo.svg" alt="עמית ברין" />
        </a>
        <div className="nav-links">
          <a href="/site#top">ראשי</a>
          <a href="/site#blog">כתיבה ועשייה</a>
          <a href="/site#footer">דברו איתי</a>
        </div>
      </nav>

      {/* ---------- HERO: 80vh cover, torn spiral-notebook title card ---------- */}
      <header className="hero">
        <figure className="hero-figure">
          <img
            src="/media/blog/motherload/cover.jpg"
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
          </p>
        </div>
        <i className="tape tape-a" aria-hidden />
        <i className="tape tape-b" aria-hidden />
      </header>

      {/* ---------- BODY ---------- */}
      <article className="body">
        <p className="lede" data-reveal>
          יש מסמך חשבונאי אחד שאף מחלקת כספים לא תדרוש ואף רואה חשבון לא יחתום עליו, והוא נפתח כל
          ערב ב־23:00 בראש של כל אמא יוצרת: כמה שעות עבדתי באמת היום, כמה מהן הופרעו באמצע, כמה
          אחוזי מעבד היו שמורים לאיסוף מבית הספר, לגרב שנעלמה, לאשמה… גיליון שלא מתאזן אף פעם, ולא
          מופיע בשום תלוש.
        </p>

        <Shot
          src="/media/blog/motherload/poster-price-tags.jpg"
          alt="פוסטר Mother Load: פנים של אישה מכוסות בתוויות מחיר"
          cap="מתוך Mother Load: הפנים כמוצר בסוף עונה - 74 סנט, מוזל, הצעה מיוחדת."
        />

        <p data-reveal>
          רייצ'ל מאני, מעצבת מלוס אנג'לס, החליטה לעצב ולהדפיס אותו – פרויקט בשם Mother Load:
          פוסטרים שבהם פנים של אישה מכוסות בתוויות מחיר כמו מוצר בסוף עונה, קבלת סופרמרקט עם שורות
          כמו "מס חופשת לידה" ו"עבודה בלתי נראית" – ולצידם מסה שמצחיקה וכועסת באותה נשימה, וכל
          שורה בה נשענת על מחקר.
        </p>

        <Shot
          src="/media/blog/motherload/poster-receipt.jpg"
          alt="פוסטר Mother Load: קבלת סופרמרקט של קנסות האימהות"
          cap='הקבלה: "מס חופשת לידה", "עבודה בלתי נראית", סה"כ - יותר מדי. כל המכירות סופיות.'
        />

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

        {/* pull quote — breaks into the right margin */}
        <aside className="pull" data-reveal>
          <BleedTitle
            as="blockquote"
            className="pull-title"
            lines={["במכולת לפחות כולם ידעו שיש מחברת. כאן ההקפות נרשמות בדיו בלתי נראית."]}
          />
        </aside>

        <hr className="ink-rule" data-reveal />

        <p className="section-lede" data-reveal>
          עכשיו ההקשר, כי בלעדיו זה עוד פרויקט אמנותי יפה:
        </p>

        <Shot
          src="/media/blog/motherload/poster-portfolio.jpg"
          alt="פוסטר Mother Load: תיקיית פורטפוליו עם ציורי ילדים"
          cap='"Portfolio Review" - התיק שמגיע לראיון אחרי שהילדים סיימו איתו.'
        />

        <p data-reveal>
          2025 הייתה שנת קונסולידציה אכזרית – Omnicom פיטרה מעל 4,000 עובדים, WPP איחדה את Ogilvy,
          VML ו־AKQA, וכ־10,000 משרות נעלמו מהתעשייה. פחות אנשים עושים יותר עבודה, עם דרישה חדשה
          שאף אחד לא טרח לכתוב במודעת הדרושים: שליטה ב־AI, וזמינות שאין לה שעות סגירה. ובדיוק כאן
          נמצא המשפט שמאני מניחה על השולחן ושווה לקרוא אותו פעמיים: הכישורים שההנהלות מצהירות שהן
          מחפשות עכשיו – תיעדוף תחת מחסור, ניהול משאבים מוגבלים, שקט תחת לחץ – הם ליטרלי האימון
          היומי של אימהות. אבל הפילטר שממיין את המועמדים לא בודק כישורים; הוא בודק זמינות.
        </p>

        {/* pull quote 2 */}
        <aside className="pull pull-left" data-reveal>
          <BleedTitle as="blockquote" className="pull-title" lines={["הפילטר לא בודק כישורים;", "הוא בודק זמינות."]} />
        </aside>

        <hr className="ink-rule" data-reveal />

        <p className="section-lede" data-reveal>
          וגילוי נאות, כי אי אפשר בלי:
        </p>

        <Shot
          src="/media/blog/motherload/poster-out-of-order.jpg"
          alt="פוסטר Out of Order: ידיים של ילדים מכסות פנים של אמא"
          cap='"Out of Order" - הידיים הקטנות שמכסות את הפנים הן גם הסיבה וגם ההוכחה.'
        />

        <p data-reveal>
          אני מלמד את הדרישה הסמויה הזאת. סדנאות AI, כלים, טכניקות, אינטגרציות – אני חוליה בשרשרת
          האספקה של המשוואה שמאני מפרקת. הנחמה שאני מוכר לעצמי היא שאני מתעקש להגיד, בכל סדנה,
          שהכלי טוב בדיוק כמו האדם שמחזיק בו – כלומר שהערך נשאר אצל מי שצבר ניסיון וכישרון, ולא אצל
          מי שפשוט זמין יותר שעות מול המסך. יש שיאמרו שזו בדיוק הנחמה שכל ספק נשק מוכר לעצמו…
        </p>

        <Shot
          src="/media/blog/motherload/poster-torn-face.jpg"
          alt="פוסטר Mother Load: פנים מכוסות בציור ילדים קרוע"
          cap="ציור של הילדה על הפנים של אמא. השאר - שרבוטים על שולי הקריירה."
        />

        <p data-reveal>
          כי בסופו של דבר הטיעון של מאני הוא לא "נגד קדמה", וזה מה שעושה אותו קשה לעיכול. קדמה שכל
          המדדים שלה הם מהירות וזמינות היא פילטר – שקט, יעיל, בלי אף החלטה מפלה אחת שאפשר להצביע
          עליה בישיבת דירקטוריון – שמסנן החוצה בדיוק את הכישרון המנוסה ביותר. שבמקרה גמור הוא נשי
          באופן לא פרופורציונלי. ובמקרה קצת פחות גמור – הוא גם כל מי שכבר עבר את תקרת הזכוכית של
          ממוצע אורך החיים במקצוע הזה; כל מי שיש לו, איך לנסח את זה, חיים שמפריעים באמצע.
        </p>

        <figure className="shot-wide" data-reveal>
          <img src="/media/blog/motherload/street-mockup.jpg" alt="פוסטרים של Mother Load ו-Out of Order על חזית בניין ברחוב" loading="lazy" />
          <figcaption>הפוסטרים ברחוב: החשבון תלוי בגובה העיניים.</figcaption>
        </figure>

        <p data-reveal>
          המסה המלאה אצלה באתר:
        </p>

        <div data-reveal>
          <a className="ink-btn" href="https://rachelmany.com/creativemotherhood" target="_blank" rel="noopener noreferrer">
            rachelmany.com/creativemotherhood ←
          </a>
        </div>

        <p className="closer" data-reveal style={{ marginTop: "2.2rem" }}>
          שווה את הזמן. ואת החשבון שייפתח בראש אחר כך.
          <br />
          גם בשבילך, גבר.
        </p>

        <div data-reveal>
          <ShareRow punchline />
        </div>

        <hr className="ink-rule thick" data-reveal />

        <Comments />

        <footer className="bp-footer" data-reveal>
          <button type="button" className="ink-btn" onClick={() => history.back()}>→ בחזרה</button>
        </footer>
      </article>
    </div>
  );
}

/* =====================================================================
 *  CSS
 * ===================================================================== */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@400;500;600;700&family=Alef:wght@400;700&display=swap');

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
.ink-btn::before {
  content:''; position:absolute; inset:0; z-index:-1;
  border:1.7px solid var(--navy);
  border-radius:255px 18px 225px 18px / 18px 225px 18px 255px;
  filter:url(#inkline-bp);
  transition:background .35s var(--ease);
}
.ink-btn:hover { color:var(--cream); }
.ink-btn:hover::before { background:var(--navy); }
.ink-btn:active { transform:scale(.98); }
.ink-btn svg { flex:0 0 auto; }

/* scribbled 3-4x send button: extra hand-drawn strokes stacked */
.ink-btn.scribble i {
  position:absolute; inset:0; z-index:-1; pointer-events:none;
  border:1.6px solid var(--navy);
  filter:url(#inkline-bp);
}
.ink-btn.scribble i:nth-of-type(1) { border-radius:18px 230px 20px 250px / 240px 16px 250px 20px; transform:rotate(.7deg); opacity:.85; }
.ink-btn.scribble i:nth-of-type(2) { border-radius:240px 22px 250px 16px / 20px 245px 18px 235px; transform:rotate(-.9deg) scale(1.02); opacity:.7; }
.ink-btn.scribble i:nth-of-type(3) { border-radius:200px 30px 210px 26px / 26px 215px 24px 205px; transform:rotate(1.4deg) scale(1.035); opacity:.5; }

/* share */
.share-row { margin:2.6rem 0 0; clear:both; }
.share-wink { font-weight:700; margin:0 0 1rem; }
.share-btns { display:flex; flex-wrap:wrap; gap:.8rem; }

/* ---------- comments ---------- */
.comments { margin:4rem 0 0; clear:both; }
.comments-title { color:var(--navy); font-weight:700; font-size:clamp(1.5rem, 2.6vw, 2.2rem); }
.comments-sub { margin:.7rem 0 1.8rem; color:rgba(8,24,69,.7); }
.comments-form { display:flex; flex-direction:column; gap:1rem; }
.comments-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.c-in {
  width:100%; box-sizing:border-box;
  font-family:'Alef','Noto Sans Hebrew',Arial,sans-serif; font-size:1rem;
  color:var(--navy-deep); background:#fff;
  border:1.6px solid var(--navy); border-radius:12px 16px 11px 17px / 15px 11px 17px 12px;
  padding:.8em 1em; outline:none;
  transition:box-shadow .3s var(--ease);
}
.c-in:focus { box-shadow:0 0 0 3px rgba(8,24,69,.15); }
.c-area { resize:vertical; min-height:110px; }
.c-send { align-self:flex-start; }
.comments-ok { font-weight:600; color:var(--navy); }
.comments-err { font-size:.9rem; color:#8a1f1f; margin:0; }

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

/* ---------- mobile ---------- */
@media (max-width: 720px) {
  .hero-figure { height:62vh; }
  .hero-card { margin-top:-6rem; padding:3rem 1.3rem 1.7rem 3.4rem; }
  .tape { width:84px; height:28px; top:calc(62vh - 6rem - 14px); }
  .op-nav { padding:.9rem 1.1rem; gap:1.2rem; }
  .pull, .pull-left, .shot-wide { margin-right:0; margin-left:0; }
  .shot-inline { float:none; width:100%; margin:2rem 0; }
  .comments-grid { grid-template-columns:1fr; }
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] { transition:none; }
}
`;
