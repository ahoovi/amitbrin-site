"use client";

/* =====================================================================
 *  BLOG POST — "סליחה ששלחתי וואטסאפ"
 *  Editorial post page in the one-pager's visual language:
 *  sketch-paper base, Leon display + Noto Sans Hebrew body,
 *  ink-line borders, CMYK FxTitle, snap gallery, share + comments.
 *  Route: /blog/whatsapp  ·  Assets: /public/media/blog/whatsapp/
 *  TEST ROUTE — safe to delete; touches nothing else.
 * ===================================================================== */

import { useEffect, useRef, useState } from "react";

/* ---------- FxTitle (CMYK print-plate ghost, copied from site2) ---------- */
function FxTitle({
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
    let raf = 0, hovering = false, settling = false, px = -9999, py = -9999;
    let cs: { x: number; y: number }[] = [];
    const curX = new Float32Array(letters.length);
    const curY = new Float32Array(letters.length);
    const kk = new Float32Array(letters.length);
    const recompute = () => {
      cs = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };
    const SIG2 = 2 * 95 * 95;
    const loop = () => {
      let live = 0;
      letters.forEach((l, i) => {
        const dx = cs[i].x - px, dy = cs[i].y - py;
        const d = Math.hypot(dx, dy) || 1;
        const g = hovering ? Math.exp(-(d * d) / SIG2) : 0;
        const push = 3.5 * g;
        const tx = (dx / d) * push, ty = (dy / d) * push;
        curX[i] += (tx - curX[i]) * 0.16;
        curY[i] += (ty - curY[i]) * 0.16;
        kk[i] += (g - kk[i]) * 0.16;
        const still = Math.abs(curX[i]) < 0.05 && Math.abs(curY[i]) < 0.05 && kk[i] < 0.005;
        if (!still) live++;
        l.style.setProperty("--k", kk[i].toFixed(3));
        l.style.setProperty("--cx", (curX[i] * 1.5).toFixed(1) + "px");
        l.style.setProperty("--cy", (curY[i] * 1.5).toFixed(1) + "px");
        l.style.transform = still ? "" : `translate(${curX[i].toFixed(1)}px, ${curY[i].toFixed(1)}px)`;
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
  }, []);
  return (
    <Tag ref={ref} className={"fxt fxt-cmyk " + className}>
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

/* ---------- reading progress (thin navy rule, ruler-nav family) ---------- */
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
const POST_URL = "https://amitbrin.com/blog/whatsapp";
const POST_TITLE = "סליחה ששלחתי וואטסאפ - עמית ברין";

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
          להעביר בוואטסאפ
        </a>
        <a className="ink-btn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(POST_URL)}`} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a className="ink-btn" href={`https://x.com/intent/tweet?text=${enc(POST_TITLE)}&url=${enc(POST_URL)}`} target="_blank" rel="noopener noreferrer">
          X
        </a>
        <button className="ink-btn" type="button" onClick={copy}>
          {copied ? "הועתק ✓" : "העתקת קישור"}
        </button>
      </div>
    </div>
  );
}

/* ---------- comments (Formspree, moderated by email) ---------- */
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
      <p className="comments-sub">תגובות מגיעות ישירות אליי. הכי מעניינות יעלו לכאן בהמשך.</p>
      {state === "ok" ? (
        <p className="comments-ok">תודה! התגובה נשלחה.</p>
      ) : (
        <form className="comments-form" onSubmit={submit}>
          <input type="hidden" name="_subject" value="תגובה חדשה בבלוג: סליחה ששלחתי וואטסאפ" />
          <input type="hidden" name="post" value="whatsapp" />
          <div className="comments-grid">
            <input className="c-in" type="text" name="name" placeholder="שם" required />
            <input className="c-in" type="email" name="email" placeholder="אימייל (לא יפורסם)" required />
          </div>
          <textarea className="c-in c-area" name="comment" placeholder="מה עובר לך בראש?" rows={4} required />
          <button className="ink-btn c-send" type="submit" disabled={state === "sending"}>
            {state === "sending" ? "שולח…" : "שליחת תגובה"}
          </button>
          {state === "err" && <p className="comments-err">משהו השתבש בשליחה. אפשר לנסות שוב, או פשוט לכתוב לי למייל.</p>}
        </form>
      )}
    </section>
  );
}

/* ---------- gallery data ---------- */
const SHOTS = [
  {
    src: "/media/blog/whatsapp/shot-chat-list.jpg",
    alt: "צילום מסך: רשימת הצ׳אטים ואפשרויות הצד",
    cap: "רשימת הצ׳אטים: כל שורה היא התחייבות פתוחה.",
  },
  {
    src: "/media/blog/whatsapp/shot-voice-failed.jpg",
    alt: "צילום מסך: הודעה קולית שלא עברה",
    cap: "ההודעה הקולית שנשלחה כי היה קל - לא כי היה נכון.",
  },
  {
    src: "/media/blog/whatsapp/shot-text-flood.jpg",
    alt: "צילום מסך: ריבוי הודעות טקסט",
    cap: "שבע הודעות במקום משפט אחד. הממשק מעודד את זה.",
  },
];

/* =====================================================================
 *  PAGE
 * ===================================================================== */
export default function WhatsappPost() {
  useReveal();
  return (
    <div className="bp-root" dir="rtl" lang="he">
      <style>{CSS}</style>

      {/* hand-drawn ink-line filter */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id="inkline-bp" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" />
        </filter>
      </svg>

      <ReadProgress />

      {/* minimal top bar: back home */}
      <nav className="bp-nav">
        <a href="/site2#blog" className="bp-back">→ חזרה לעמוד הראשי</a>
        <span className="bp-mark">תרחיב · הבלוג של עמית ברין</span>
      </nav>

      {/* ---------- HERO: full-bleed smiley pile + overlapping title card ---------- */}
      <header className="hero">
        <figure className="hero-figure">
          <img
            src="/media/blog/whatsapp/cover.jpg"
            alt="ערימת כדורי סמיילי צהובים - תמונת השער של הפוסט"
            className="hero-img"
            fetchPriority="high"
          />
        </figure>
        <div className="hero-card" data-reveal>
          <p className="kicker">מחשבות על עיצוב ועל חוויית שימוש</p>
          <FxTitle as="h1" className="hero-title" lines={["סליחה ששלחתי", "וואטסאפ"]} />
          <p className="hero-sub">
            וואטסאפ: לא אפליקציה גרועה. אפליקציה שעובדת מצוין - לא בשבילכם.
          </p>
          <p className="hero-meta">עמית ברין · ~5 דקות קריאה</p>
        </div>
      </header>

      {/* ---------- BODY ---------- */}
      <article className="body">
        <p className="lede" data-reveal>
          סליחה ששלחתי וואטסאפ: יותר מדי אחוזים מהתקשורת האלקטרונית שלי מתנהלת בוואטסאפ, וזה לא
          מרצוני החופשי. גם לא משלכם, אם כבר. בישראל מדובר בכ־97% אימוץ (אנחנו במקום הראשון בעולם,
          איזו גאווה) – מה שאומר שאין באמת אופציה לצאת, יש רק אופציה להיעלב מהיציאה של אחרים.
        </p>

        <p data-reveal>
          אז תראו, אני לא חושב שוואטסאפ היא אפליקציה עם עיצוב לקוי. אני חושב שהיא אפליקציה שעיצבה
          מחדש את הדרך שבה אנשים מדברים זה עם זה, וזה שני דברים שונים לגמרי.
        </p>

        {/* pull quote 1 — breaks out of the column */}
        <aside className="pull" data-reveal>
          <FxTitle
            as="blockquote"
            className="pull-title"
            lines={["היא לא שירתה צורך קיים -", "היא ייצרה התנהגות,", "ואז הפכה אותה לנורמה,", "ואז הפכה את הנורמה", "לתנאי סף לחיים חברתיים."]}
          />
        </aside>

        <hr className="ink-rule" data-reveal />

        <p data-reveal>
          הטריק המרכזי הוא היברידי ומכוער: וואטסאפ היא <strong>מדיום אסינכרוני שמתחפש
          לסינכרוני</strong>. טכנית מותר לך לא לענות. מעשית, ה"נראה לאחרונה", שני הסימונים הכחולים
          ושלוש הנקודות המרצדות מייצרים שקיפות חד־כיוונית שמבטלת את הזכות הזו. תקשורת אסינכרונית
          אמורה להוריד לחץ; כאן היא מייצרת אותו יש מאין.
        </p>

        <p data-reveal>
          ומי שמנסה לצאת מהמשחק מקבל עונש סימטרי: כיביתם אישורי קריאה? יופי, עכשיו גם אתם לא רואים.
          זו לא פשרה, זה קנס. מערכת שמתמחרת פרטיות בכך שהיא מחזירה אותך לחוסר הוודאות שהיא עצמה
          נועדה לפתור.
        </p>

        <p data-reveal>
          הקבוצות הן פרק בפני עצמו. אין מנגנון אישור הצטרפות – כל אחד יכול לצרף אותך לכל דבר, בכל
          שעה, ואתה תגלה את זה מהתראה. ואם תרצה לצאת, האפליקציה תודיע על כך לכולם בשורה יבשה שנקראת
          כמו הצהרה פוליטית ("X עזב את הקבוצה"). כלומר: <strong>הכניסה בלי הסכמה, היציאה עם קנס
          חברתי</strong>. מי שתכנן את זה הבין היטב מה מחזיק אנשים בפנים.
        </p>

        {/* ---------- GALLERY: phone shots on the sketch paper ---------- */}
        <section className="gallery" data-reveal aria-label="צילומי מסך מתוך וואטסאפ">
          <div className="gallery-rail">
            {SHOTS.map((s, i) => (
              <figure className="shot" key={i}>
                <img src={s.src} alt={s.alt} loading="lazy" />
                <figcaption>{s.cap}</figcaption>
              </figure>
            ))}
          </div>
          <p className="gallery-hint" aria-hidden>← אפשר לגלול הצידה</p>
        </section>

        <hr className="ink-rule" data-reveal />

        <p data-reveal>
          מה שמעניין הוא איפה העיצוב נכשל בצורה כל כך יסודית שהוא מתהפך. מחקר מאוניברסיטת
          Loughborough בדק את תוויות ה"הועבר" וה"הועבר פעמים רבות" – אותן תוויות שנועדו לבלום הפצת
          שקרים – ומצא שחלק מהמשתמשים פירשו אותן כסימן לחשיבות. כלומר העבירו יותר. רק מיעוט הבין
          שמדובר באזהרה. פיצ'ר שנועד להאט הפצת מידע מוטעה ושימש בפועל כתו תקן. אין הרבה מקרים כאלה,
          ואני חושב שכדאי ללמד אותם, ובכל מקרה שיהיה לנו בהצלחה במערכת הבחירות הקרובה…
        </p>

        <p data-reveal>
          ובמקביל, תגובות האימוג'י: מנגנון שהוזלה של תגובה אנושית לכדי לחיצה אחת, בדיוק במקום שבו
          היה נדרש משפט. משתמשים מדווחים שהם לוחצים על זה בטעות. מבחינת המערכת זו לא תקלה – זו
          אינטראקציה. ספירת אינטראקציות זו המטריקה, לא איכותן.
        </p>

        <p data-reveal>
          ה"מחק לכולם" השלים את התמונה: פיצ'ר תיקון שמותיר במקום ההודעה שלט ניאון שאומר "כאן היה
          משהו שהתחרטתי עליו". הסתרה שהיא בעצם הצבעה.
        </p>

        <hr className="ink-rule" data-reveal />

        <p data-reveal>
          ועכשיו החלק שקצת פחות מצחיק. מחקר על עובדי בריאות בסעודיה מצא ש־63% מהם הציגו רמות מתח
          חריגות, 55.8% חרדה ו־48.6% דיכאון – בקורלציה לשימוש בוואטסאפ בעבודה. יש בספרות מקרה מתועד
          של עובדת שהתפטרה כי המנהל שלה ציפה לתגובה מיידית בלילות ובסופי שבוע. ויש כבר פסיקה
          (Case v Tai Tarian) שקבעה שהתנהלות בקבוצת וואטסאפ פרטית מהווה בריונות במקום עבודה ומצדיקה
          פיטורים. הקבוצה הפרטית, מסתבר, היא מקום ציבורי שרק מרגיש כמו סלון.
        </p>

        <p data-reveal>
          אז לא, זו לא רשלנות עיצובית. זו לא "חוסר עקביות בהיררכיה ויזואלית" ולא איזה חוב טכני
          שמישהו ישלם בגרסה הבאה. זו מערכת שממטבת בדיוק את מה שהיא נבנתה למטב – זמן מסך, תדירות
          פתיחה, מטא־דאטה (ההצפנה מגנה על התוכן, לא על מי־מתי־כמה־עם־מי) – ומצליחה בזה מעולה.
          השאלה "למה הם לא מתקנים את זה" מניחה שמדובר בבאג.
        </p>

        {/* pull quote 2 */}
        <aside className="pull pull-left" data-reveal>
          <FxTitle as="blockquote" className="pull-title" lines={["זה לא באג.", "אתם פשוט לא הלקוח."]} />
        </aside>

        <p data-reveal>
          הדבר היחיד שנשאר לנו הוא לשים לב מתי אנחנו מתנהגים לפי כללי המערכת בלי ששאלו אותנו:
          התנצלות על תשובה באיחור של שעתיים, הודעה קולית של שש דקות שנשלחה כי היה קל, לייק על הודעה
          שהצריכה שיחת טלפון.
        </p>

        <p className="closer" data-reveal>
          והנה החלק שכן מצחיק: את הטקסט הזה, ברוב המקרים, תעבירו הלאה בקבוצה.
        </p>

        {/* share — deliberately placed right on the punchline */}
        <div data-reveal>
          <ShareRow punchline />
        </div>

        <hr className="ink-rule thick" data-reveal />

        <Comments />

        <footer className="bp-footer" data-reveal>
          <a href="/site2#blog" className="ink-btn">→ לכל הפוסטים</a>
        </footer>
      </article>
    </div>
  );
}

/* =====================================================================
 *  CSS — self-contained, mirrors site2 tokens
 * ===================================================================== */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@400;500;600;700&family=Alef:wght@400;700&display=swap');

@font-face { font-family:'Leon'; src:url('/fonts/Leon-Thin.woff2') format('woff2');    font-weight:100 300; font-display:swap; }
@font-face { font-family:'Leon'; src:url('/fonts/Leon-Regular.woff2') format('woff2'); font-weight:400 500; font-display:swap; }
@font-face { font-family:'Leon'; src:url('/fonts/Leon-Bold.woff2') format('woff2');    font-weight:600 700; font-display:swap; }
@font-face { font-family:'Leon'; src:url('/fonts/Leon-Heavy.woff2') format('woff2');   font-weight:800 900; font-display:swap; }

.bp-root {
  --navy-deep:#020D2C; --navy:#081845; --gold:#CFBD85; --cream:#EADEB7;
  --paper:#EFF1F5; --ease:cubic-bezier(.22,.9,.24,1);
  font-family:'Noto Sans Hebrew', Arial, sans-serif;
  color:var(--navy-deep);
  background-color:var(--paper);
  background-image:
    radial-gradient(circle, rgba(8,24,69,.22) 1px, transparent 1.4px),
    linear-gradient(rgba(8,24,69,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(8,24,69,.05) 1px, transparent 1px);
  background-size:28px 28px, 28px 28px, 28px 28px;
  min-height:100vh;
  overflow-x:hidden;
}
.bp-root h1,.bp-root h2,.bp-root h3,.bp-root blockquote { font-family:'Leon','Noto Sans Hebrew',sans-serif; margin:0; }

/* reveal */
[data-reveal] { opacity:0; transform:translateY(26px); transition:opacity 1s var(--ease), transform 1s var(--ease); }
[data-reveal].in { opacity:1; transform:none; }

/* reading progress */
.read-progress {
  position:fixed; top:0; right:0; left:0; height:3px; z-index:60;
  background:var(--navy); transform-origin:right; transform:scaleX(0);
}

/* top bar */
.bp-nav {
  position:relative; z-index:5;
  display:flex; justify-content:space-between; align-items:center; gap:1rem;
  padding:1.4rem 5vw;
}
.bp-back {
  font-family:'Leon',sans-serif; font-weight:500; font-size:1rem;
  color:var(--navy); text-decoration:none; transition:opacity .4s var(--ease);
}
.bp-back:hover { opacity:.6; }
.bp-mark { font-size:.85rem; color:rgba(8,24,69,.55); letter-spacing:.02em; }

/* ---------- hero ---------- */
.hero { position:relative; }
.hero-figure { margin:0; height:min(64vh, 640px); overflow:hidden; }
.hero-img { width:100%; height:100%; object-fit:cover; display:block; }
.hero-card {
  position:relative; z-index:3;
  width:min(880px, 92vw); margin:-9rem auto 0;
  background:#fff; padding:3rem clamp(1.6rem, 4vw, 3.4rem) 2.6rem;
  border-radius:20px;
}
.hero-card::before {
  content:''; position:absolute; inset:2px; pointer-events:none;
  border:1.8px solid var(--navy);
  border-radius:16px 22px 14px 24px / 22px 15px 24px 16px;
  filter:url(#inkline-bp);
}
.kicker {
  font-size:.9rem; font-weight:600; letter-spacing:.06em;
  color:rgba(8,24,69,.6); margin:0 0 1.1rem;
}
.hero-title {
  color:var(--navy); font-weight:800;
  font-size:clamp(2.6rem, 7vw, 5.4rem); line-height:1.04;
}
.hero-sub {
  margin:1.4rem 0 0; font-size:clamp(1.05rem, 1.5vw, 1.3rem);
  font-weight:600; color:var(--navy-deep); line-height:1.6;
}
.hero-meta { margin:1.2rem 0 0; font-size:.85rem; color:rgba(8,24,69,.55); }

/* ---------- body column ---------- */
.body {
  width:min(680px, 92vw); margin:0 auto; padding:5rem 0 6rem;
  font-size:clamp(1.05rem, 1.15vw, 1.18rem); line-height:1.95;
}
.body > p { margin:0 0 1.7em; }
.lede { font-size:clamp(1.18rem, 1.5vw, 1.36rem); font-weight:500; line-height:1.85; }
.closer { font-weight:700; }
.bp-root strong { font-weight:700; }

/* ink dividers (the article's own "---" breaks) */
.ink-rule {
  border:none; height:0; margin:3.4rem auto;
  width:min(280px, 60%);
  border-top:2px solid var(--navy);
  filter:url(#inkline-bp);
  opacity:.85;
}
.ink-rule.thick { width:min(420px, 80%); border-top-width:3px; }

/* ---------- pull quotes: break out of the column ---------- */
.pull {
  width:min(980px, 96vw);
  margin:3.6rem 0 3.6rem calc((min(980px,96vw) - 100%) / -2);
  position:relative; padding:.4rem 0 .4rem;
}
.pull-left { text-align:left; }
.pull-title {
  color:var(--navy); font-weight:800;
  font-size:clamp(1.7rem, 4vw, 3.1rem); line-height:1.18;
}
.pull::after {
  content:''; display:block; margin-top:1.4rem;
  width:120px; border-top:3px solid var(--navy);
  filter:url(#inkline-bp);
}
.pull-left::after { margin-left:0; margin-right:auto; }

/* ---------- gallery: phone shots, snap rail ---------- */
.gallery {
  width:min(980px, 96vw);
  margin:3.6rem 0 3.6rem calc((min(980px,96vw) - 100%) / -2);
}
.gallery-rail {
  display:flex; gap:1.6rem;
  overflow-x:auto; scroll-snap-type:x mandatory;
  padding:.6rem .2rem 1.4rem;
  scrollbar-width:none;
}
.gallery-rail::-webkit-scrollbar { display:none; }
.shot {
  flex:0 0 min(300px, 74vw); scroll-snap-align:center;
  margin:0; position:relative;
  background:#fff; padding:.9rem .9rem 1rem; border-radius:18px;
  transform:rotate(var(--tilt, -1.1deg));
  transition:transform .6s var(--ease);
}
.shot:nth-child(2) { --tilt:0.9deg; }
.shot:nth-child(3) { --tilt:-0.6deg; }
.shot:hover { transform:rotate(0) translateY(-6px); }
.shot::before {
  content:''; position:absolute; inset:2px; pointer-events:none;
  border:1.8px solid var(--navy);
  border-radius:14px 20px 12px 22px / 20px 13px 22px 14px;
  filter:url(#inkline-bp);
}
.shot img { width:100%; height:auto; display:block; border-radius:10px; }
.shot figcaption {
  margin-top:.8rem; font-size:.85rem; line-height:1.6; color:rgba(8,24,69,.75);
}
.gallery-hint { text-align:center; font-size:.85rem; color:rgba(8,24,69,.5); margin:.2rem 0 0; }

/* ---------- ink buttons (share / actions) ---------- */
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

/* share */
.share-row { margin:2.6rem 0 0; }
.share-wink { font-weight:700; margin:0 0 1rem; }
.share-btns { display:flex; flex-wrap:wrap; gap:.8rem; }

/* ---------- comments ---------- */
.comments { margin:4rem 0 0; }
.comments-title {
  color:var(--navy); font-weight:700;
  font-size:clamp(1.5rem, 2.6vw, 2.2rem);
}
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

/* footer */
.bp-footer { margin:4rem 0 0; display:flex; justify-content:center; }

/* ---------- FxTitle CMYK ghosts ---------- */
.fxt .fxl { display:block; }
.fxt .fw { display:inline-block; white-space:pre; }
.fxt .fl { display:inline-block; position:relative; --k:0; --cx:0px; --cy:0px; will-change:transform; }
.fxt .fl::before, .fxt .fl::after {
  content:attr(data-ch); position:absolute; inset:0; z-index:-1;
  pointer-events:none; text-shadow:none; opacity:calc(var(--k) * .85);
}
.fxt-cmyk .fl::before { color:#00C4DB; mix-blend-mode:multiply; transform:translate(var(--cx), var(--cy)); }
.fxt-cmyk .fl::after  { color:#E5289E; mix-blend-mode:multiply; transform:translate(calc(var(--cx) * -1), calc(var(--cy) * -1)); }
.fxt-cmyk .fl { text-shadow:calc(var(--cx) * -.6) calc(var(--cy) * .6) 0 rgba(250,220,0,calc(var(--k) * .9)); }

/* ---------- mobile ---------- */
@media (max-width: 720px) {
  .hero-figure { height:48vh; }
  .hero-card { margin-top:-5.5rem; padding:2rem 1.4rem 1.8rem; }
  .pull, .gallery { width:100%; margin:3rem 0; }
  .comments-grid { grid-template-columns:1fr; }
  .bp-mark { display:none; }
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] { transition:none; }
  .shot, .ink-btn { transition:none; }
}
`;
