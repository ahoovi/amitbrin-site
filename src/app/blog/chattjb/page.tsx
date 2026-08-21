"use client";

/* =====================================================================
 *  BLOG POST — "הצ׳טבוט האנושי שלך" · CHATBOT EDITION
 *  The post rendered as a conversation with an LLM-style chatbot
 *  (the very interface ChatTJB imitates), scroll-driven:
 *  · Reader "prompts" = gray user pills (inline-end)
 *  · Post paragraphs = assistant turns that *stream* word-by-word
 *  · Assistant shows a pulsing "thinking" dot before streaming
 *  · Images = rounded media cards inside assistant turns
 *  · Fixed composer pill scrolls to the real comments form
 *  Route: /blog/chattjb
 * ===================================================================== */

import { useEffect, useRef, useState } from "react";
import PostFooter from "../../../components/PostFooter";

/* ---------- header status driven by scroll ---------- */
function useScrollThinking() {
  const [thinking, setThinking] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = () => {
      setThinking(true);
      clearTimeout(t);
      t = setTimeout(() => setThinking(false), 900);
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); clearTimeout(t); };
  }, []);
  return thinking;
}

/* ---------- turn reveal: bot turns think, then stream ---------- */
function useTurn(bot: boolean, streamMs: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"hidden" | "thinking" | "streaming" | "shown">("hidden");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("shown");
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          if (bot) {
            setState("thinking");
            setTimeout(() => setState("streaming"), 620);
            setTimeout(() => setState("shown"), 620 + streamMs + 420);
          } else {
            setState("shown");
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -22% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [bot, streamMs]);
  return { ref, state };
}

/* ---------- streaming text ---------- */
type Part = string | { a: string; href: string };
type Tok = { w: string; href?: string };

function tokenize(parts: Part[]): Tok[] {
  const toks: Tok[] = [];
  for (const p of parts) {
    if (typeof p === "string") {
      p.split(" ").forEach((w) => w && toks.push({ w }));
    } else {
      p.a.split(" ").forEach((w) => w && toks.push({ w, href: p.href }));
    }
  }
  return toks;
}

/* per-word delay: fast like a model, capped so long turns stay snappy */
function wordDelay(n: number) {
  return Math.min(26, Math.max(11, Math.round(2400 / Math.max(n, 1))));
}

function BotAvatar() {
  return (
    <span className="bot-av" aria-hidden>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
      </svg>
    </span>
  );
}

function ThinkingDot() {
  return <span className="think-dot" aria-label="חושב" />;
}

/* assistant text turn */
function Bot({ parts, big = false, children }: { parts?: Part[]; big?: boolean; children?: React.ReactNode }) {
  const toks = parts ? tokenize(parts) : [];
  const d = wordDelay(toks.length);
  const { ref, state } = useTurn(true, toks.length * d);
  return (
    <div ref={ref} className={`turn t-bot st-${state}`}>
      <BotAvatar />
      <div className={`bot-body${big ? " bot-big" : ""}`}>
        {state === "thinking" ? (
          <ThinkingDot />
        ) : parts ? (
          <p className="stream" style={{ ["--wd" as string]: `${d}ms` }}>
            {toks.map((t, i) =>
              t.href ? (
                <a key={i} className="w" style={{ animationDelay: `${i * d}ms` }} href={t.href} target="_blank" rel="noopener noreferrer">
                  {t.w}{" "}
                </a>
              ) : (
                <span key={i} className="w" style={{ animationDelay: `${i * d}ms` }}>
                  {t.w}{" "}
                </span>
              )
            )}
            {state === "streaming" && <span className="caret" aria-hidden>▍</span>}
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/* assistant media turn (no streaming — fades in like a rendered result) */
function BotMedia({ children }: { children: React.ReactNode }) {
  const { ref, state } = useTurn(true, 0);
  return (
    <div ref={ref} className={`turn t-bot st-${state}`}>
      <BotAvatar />
      <div className="bot-body">{state === "thinking" ? <ThinkingDot /> : children}</div>
    </div>
  );
}

/* the reader's prompt */
function Prompt({ children }: { children: React.ReactNode }) {
  const { ref, state } = useTurn(false, 0);
  return (
    <div ref={ref} className={`turn t-user st-${state}`}>
      <div className="user-pill">{children}</div>
    </div>
  );
}

/* an answer that never arrives — forever thinking */
function StuckThinking() {
  const { ref, state } = useTurn(false, 0);
  return (
    <div ref={ref} className={`turn t-bot st-${state}`} aria-hidden>
      <BotAvatar />
      <div className="bot-body"><ThinkingDot /></div>
    </div>
  );
}

/* fake app sidebar — the desktop-app column, but every item is a real link */
const RECENTS = [
  { t: "הצ׳טבוט האנושי שלך", href: "/blog/chattjb", current: true },
  { t: "פרי עץ הדעת", href: "/blog/pri-etz-hadaat" },
  { t: "Mother Load", href: "/blog/motherload" },
  { t: "סליחה ששלחתי וואטסאפ", href: "/blog/whatsapp" },
];
const PINNED = [
  { t: "ראשי", href: "/site#top" },
  { t: "פרויקטים", href: "/site#works" },
  { t: "הבלוג", href: "/site#blog" },
  { t: "סדנאות והרצאות", href: "/site#work" },
  { t: "דברו איתי", href: "/site#footer" },
];

function Sidebar() {
  return (
    <aside className="gpt-sidebar" aria-label="ניווט צד">
      <div className="sb-top">
        <span className="sb-brand">ChatTJB
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6"/></svg>
        </span>
        <svg className="sb-ic" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      </div>
      <button className="sb-item sb-new" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>
        שיחה חדשה
      </button>
      <div className="sb-label">מוצמדים</div>
      {PINNED.map((l) => (
        <a key={l.href} className="sb-item" href={l.href}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 17v5M9 3h6l1 7 3 2H5l3-2z"/></svg>
          {l.t}
        </a>
      ))}
      <div className="sb-label">אחרונים</div>
      {RECENTS.map((l) => (
        <a key={l.href} className={"sb-item sb-recent" + (l.current ? " sb-current" : "")} href={l.href}>{l.t}</a>
      ))}
      <a className="sb-user" href="/site#top">
        <img src="/media/headshot.png" alt="" />
        <span>עמית ברין</span>
      </a>
    </aside>
  );
}

/* ---------- share ---------- */
const POST_URL = "https://amitbrin.com/blog/chattjb";
const POST_TITLE = "הצ׳טבוט האנושי שלך - עמית ברין";

function ShareRow() {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const copy = async () => {
    try { await navigator.clipboard.writeText(POST_URL); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {}
  };
  return (
    <div className="share-btns">
      <a className="sh-btn" href={`https://wa.me/?text=${enc(POST_TITLE + " " + POST_URL)}`} target="_blank" rel="noopener noreferrer">להעביר בוואטסאפ</a>
      <a className="sh-btn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(POST_URL)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a className="sh-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(POST_URL)}`} target="_blank" rel="noopener noreferrer">פייסבוק</a>
      <a className="sh-btn" href={`https://x.com/intent/tweet?text=${enc(POST_TITLE)}&url=${enc(POST_URL)}`} target="_blank" rel="noopener noreferrer">X</a>
      <button className="sh-btn" type="button" onClick={copy}>{copied ? "הועתק ✓" : "העתקת קישור"}</button>
    </div>
  );
}

/* ---------- comments: the "composer" of this chat ---------- */
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
    <section className="comments" id="comments">
      <h3>יש לך מה להגיד על זה?</h3>
      <p className="comments-sub">תגובות מגיעות ישירות אליי. בואו נדבר על זה.</p>
      {state === "ok" ? (
        <p className="comments-ok">תודה! התגובה נשלחה.</p>
      ) : (
        <form className="comments-form" onSubmit={submit}>
          <input type="hidden" name="_subject" value="תגובה חדשה בבלוג (גרסת הצ׳טבוט): הצ׳טבוט האנושי שלך" />
          <input type="hidden" name="post" value="chattjb" />
          <div className="comments-grid">
            <input className="c-in" type="text" name="name" placeholder="שם" required />
            <input className="c-in" type="email" name="email" placeholder="אימייל (לא יפורסם)" required />
          </div>
          <div className="composer">
            <textarea className="c-in c-area" name="comment" placeholder="לשאול בן אדם…" rows={2} required />
            <button className="send-btn" type="submit" disabled={state === "sending"} aria-label="שליחה">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </button>
          </div>
          {state === "err" && <p className="comments-err">משהו השתבש בשליחה. אפשר לנסות שוב, או פשוט לכתוב לי למייל.</p>}
        </form>
      )}
      <p className="disclaimer">ChatTJB עלול לטעות. הוא בן אדם.</p>
    </section>
  );
}

/* fixed fake composer that leads to the real one */
function FloatingComposer() {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const target = document.getElementById("comments");
    if (!target) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => setHide(e.isIntersecting)), { threshold: 0.1 });
    io.observe(target);
    return () => io.disconnect();
  }, []);
  return (
    <button
      type="button"
      className={"float-composer" + (hide ? " fc-hidden" : "")}
      onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })}
      aria-label="מעבר לכתיבת תגובה"
    >
      <span className="fc-ph">לשאול בן אדם…</span>
      <span className="fc-send" aria-hidden>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
      </span>
    </button>
  );
}

/* =====================================================================
 *  PAGE
 * ===================================================================== */
export default function ChattjbPost() {
  const thinking = useScrollThinking();
  return (
    <div className="gpt-root" dir="rtl" lang="he">
      <style>{CSS}</style>

      <Sidebar />
      <header className="gpt-header">
        <nav className="gpt-sitenav" aria-label="ניווט ראשי">
          <a href="/site#top" className="sn-logo" aria-label="עמית ברין - ראשי">
            <img src="/media/amit-brin-logo.svg" alt="עמית ברין" />
          </a>
          <div className="sn-links">
            <a href="/site#top">ראשי</a>
            <a href="/site#blog">כתיבה ועשייה</a>
            <a href="/site#footer">דברו איתי</a>
          </div>
        </nav>
        <div className="gpt-chatbar">
          <div className="model-pick">
            <strong>ChatTJB</strong>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <span className={"model-status" + (thinking ? " is-thinking" : "")}>
            {thinking ? "חושב…" : "אונליין · בן אדם"}
          </span>
        </div>
      </header>

      <main className="chat">
        <div className="chip">שיחה חדשה</div>

        <Prompt>ראיתי שמסתובבת תמונה של שלט חוצות מוזר בסן פרנסיסקו. מה הסיפור?</Prompt>

        <Bot big>
          <h1 className="post-title">התברר שהבינה המלאכותית היא בחור אחד עייף (זאת לא מטאפורה אבל זאת בדיוק הנקודה)</h1>
        </Bot>

        <Bot parts={["בפינת הרחובות השישי ופולסום בסן פרנסיסקו יש שלט חוצות בעלות 6,000 דולר שמבטיח לכם את ממשק הצ'אט המוביל, המופעל על ידי AI. עוד שלט אחד בים השלטים שמנסים למכור לכם עתיד שבו מכונה עונה לכם על הכל. רגיל לגמרי, נכון?"]} />

        <BotMedia>
          <figure className="media-card">
            <img src="/media/blog/chattjb/billboard-hero.jpg" alt="שלט החוצות של ChatTJB בפינת הרחובות השישי ופולסום בסן פרנסיסקו" loading="lazy" />
          </figure>
        </BotMedia>

        <Prompt>נראה כמו עוד שלט AI רגיל. מה מיוחד בו?</Prompt>

        <Bot parts={["חוץ מכוכבית קטנה אחרי המילה AI. הערת שוליים, שרובה מוסתרת מאחורי עץ (כן, ממש ככה, זה כמעט יותר מדי טוב בשביל להיות אמיתי), מסבירה ש-AI כאן היא לא Artificial Intelligence. היא Average Individual. אדם ממוצע. ובמקרה הזה, אדם ממוצע ספציפי מאוד אחד, בשם טאקר בראיינט."]} />

        <BotMedia>
          <div className="media-pair">
            <figure className="media-card"><img src="/media/blog/chattjb/ai-asterisk.jpg" alt="תקריב על הכוכבית והערת השוליים בשלט" loading="lazy" /></figure>
            <figure className="media-card"><img src="/media/blog/chattjb/tucker-bryant.jpg" alt="טאקר בראיינט" loading="lazy" /></figure>
          </div>
        </BotMedia>

        <Prompt>מי זה טאקר בראיינט?</Prompt>

        <Bot parts={["בראיינט הוא לא סתם מישהו עם יותר מדי זמן פנוי. משורר ואמן רעיוני בן 32, בוגר סטנפורד, עובד גוגל לשעבר, כלומר בדיוק הפרופיל שאמור לבנות עכשיו את הסטארטאפ הבא שיחסל עוד קטגוריית עבודה. במקום זה הוא בנה אתר שנראה בול כמו ChatGPT, בעזרת AI (כן, את האירוניה הזו הוא מודה בה בעצמו), ופשוט יושב מאחוריו. כל שאלה שנכנסת, הוא קורא, חושב, ועונה. בלי מודל שפה. בלי אלגוריתם. רק בחור אחד, לרוב עייף, שלפעמים אפילו מצייר ביד תמונה של ארנב עם משקפי שמש כי מישהו ביקש, ולא בא לו לפתוח מחולל תמונות בשביל זה."]} />

        <Bot parts={["הפרויקט רץ באפריל בלי רעש גדול במיוחד, כניסוי אמנותי על מה שהוא מכנה כניעה קוגניטיבית: הרגע שבו אנחנו מפסיקים לסמוך על האינטואיציה שלנו ומתחילים לבקש מ-AI לאשר לנו מה לאכול הערב, באיזה צבע לצבוע את הסלון, ואיך להרגיש לגבי כל דבר קטן שפעם ידענו להחליט בעצמנו, בלי לשאול אף אחד. אני, שמלמד סדנאות AI בשביל להתפרנס, יכול להעיד שזאת אולי לא תובנה מקורית – אבל להפוך אותה לביצוע פיזי, על חשבון האדם עצמו ובזמן אמת, זה כבר לקחת את זה לשלב הבא."]} />

        <BotMedia>
          <figure className="media-card media-video">
            <video
              src="/media/blog/chattjb/tucker-reel.mp4"
              poster="/media/blog/chattjb/tucker-reel-poster.jpg"
              controls
              muted
              playsInline
              loop
              preload="none"
              aria-label="טאקר בראיינט עונה לשאלות מאחורי ChatTJB"
            />
            <figcaption className="media-credit">
              <a href="https://www.instagram.com/reel/Dbg3rTVyE1d/" target="_blank" rel="noopener noreferrer">
                מתוך האינסטגרם של טאקר בראיינט ↗
              </a>
            </figcaption>
          </figure>
        </BotMedia>

        <Prompt>ואז?</Prompt>

        <Bot parts={["ואז השלט. פורסם אצלו בפרופיל, צולם לעוד פרופילים, התפשט, הגיע למדיה הממוסדת. מה שהיה כמה עשרות פניות ביום הפך תוך ימים לגל של יותר מ-30,000 שאלות, בשיא מסוים כ-5,000 בשעה. לפי מה שבראיינט מספר בראיונות, הוא כבר מסיים כל יום עם בערך אלף שיחות, על הכל, מארוחת ערב ועד צבע קיר. ציפה ל-24, אולי 48 שעות של עניין מק-סי-מום ואז שיהיה סוף סוף שקט. זה לא קרה."]} />

        <BotMedia>
          <div className="media-pair">
            <figure className="media-card"><img src="/media/blog/chattjb/billboard-insta.jpg" alt="השלט כפי שפורסם ברשתות" loading="lazy" /></figure>
            <figure className="media-card"><img src="/media/blog/chattjb/billboard-street.jpg" alt="השלט מזווית הרחוב" loading="lazy" /></figure>
          </div>
        </BotMedia>

        <Prompt>רגע, איך בן אדם אחד עומד בעומס כזה?</Prompt>

        <Bot parts={['הוא הגיע לשלב שיש לו כמעט 10 מתנדבים, כלומר גייס צוות אנוש כדי לתחזק פרויקט שכל הרעיון שלו הוא "לא AI", מבחן קליטה למי שרוצה להצטרף, ומדיניות סינון לתוכן פוגעני שלא יגיע אליהם. מי ששולח שאלה היום עשוי בכלל לא לדבר איתו אישית, אלא עם אדם ממוצע אחר מהקהילה שגויסה בדיוק בשביל זה. ואם יותר מדי מהפניות יהפכו רעילות, הוא אמר שיסגור את הכל.']} />

        <Bot parts={['יש פה נקודה שממש כדאי לעצור עליה: כדי לשמור על "אדם אחד עונה באמת", הוא נאלץ לבנות תשתית תפעולית, תהליכי גיוס, ומדיניות הגנה מפני שחיקה ותוכן רעיל. במילים אחרות: ברגע שהחוויה האנושית מצליחה מספיק, היא מתחילה להתנהג בדיוק כמו המוצר שהיא באה לבקר. סקייל דורש תהליכים. תהליכים דורשים מבנה. מבנה זה בערך ה-M הראשונה במילה LLM, רק עם בני אדם עייפים במקום GPU-ים.']} />

        <Bot parts={["אחת המתנדבות היא ג'ס מקאלום, בת 34, החברה של בראיינט. היא עונה כמה דקות ביום, בעיקר בנסיעה ברכבת, כשמשעמם לה, ובוחרת מה לענות (״לא על שיעורי בית במתמטיקה, תודה״). המתכון שלה: להישאר בעצמה, רק עם מנה נדיבה יותר של קלילות ושטויות מסביב. לדבריה, ההבדל בין השלט הזה לכל שלטי ה-AI האחרים בעיר הוא שכולם פונים לעסקים, והשלט הזה פונה לבני אדם עצמם."]} />

        <Bot parts={["וזה מוביל לרגע שבו הבדיחה מפסיקה להיות בדיחה. מישהו כתב לבראיינט בלילה הראשון של ירח הדבש שלו, שהוא לא מרגיש רגוע לגמרי, ושאל אם זה בסדר. הוא לא יכול היה לזרוק תשובה ציניקנית. כתב משהו אמפתי ואמיתי, על העומס הרגשי שנשאר גם אחרי שהחגיגה נגמרת, והופתע בעצמו מהצד הרך שיצא ממנו דרך המרחק שממשק צ'אט מספק. זה בדיוק אותו אפקט ריחוק שגורם לאנשים לשפוך את הלב שלהם לצ'טבוט, רק שכאן (בקצה השני) יש מישהו שבאמת קורא."]} />

        <div className="divider" aria-hidden><span>· · ·</span></div>

        <Bot parts={[
          "יש כבר תקדים לרעיון של פרסומת AI מזויפת: ",
          { a: "שני אמנים בניו יורק תלו שלטים סאטיריים בתחנות רכבת תחתית", href: "https://www.instagram.com/theharrisalterman/?ig_rid=AzFuMRv4HUjkPUMChUm6Hsf" },
          ", עם סיסמאות על תחתונים חכמים או שירות HR שמעסיק את כל העולם בלי לעשות כלום. חמוד, אבל זה נשאר ברמת הבדיחה החזותית, בלי אף אחד בצד השני שקורא בכלל. ChatTJB הולך צעד רחוק יותר: לא מחקה את האסתטיקה של AI כדי ללגלג עליה, אלא מאכלס אותה ממש, מבפנים, עם בן אדם שנושא באחריות אישית על כל תשובה.",
        ]} />

        <BotMedia>
          <div className="media-strip" role="group" aria-label="שלטים סאטיריים בניו יורק">
            <figure className="media-card"><img src="/media/blog/chattjb/press-1.jpg" alt="שלט סאטירי בתחנת רכבת תחתית בניו יורק" loading="lazy" /></figure>
            <figure className="media-card"><img src="/media/blog/chattjb/press-2.jpg" alt="שלט סאטירי בתחנת רכבת תחתית בניו יורק" loading="lazy" /></figure>
            <figure className="media-card"><img src="/media/blog/chattjb/press-3.jpg" alt="שלט סאטירי בתחנת רכבת תחתית בניו יורק" loading="lazy" /></figure>
            <figure className="media-card"><img src="/media/blog/chattjb/press-4.jpg" alt="שלט סאטירי בתחנת רכבת תחתית בניו יורק" loading="lazy" /></figure>
            <figure className="media-card"><img src="/media/blog/chattjb/press-5.jpg" alt="שלט סאטירי בתחנת רכבת תחתית בניו יורק" loading="lazy" /></figure>
          </div>
        </BotMedia>

        <Prompt>ואיך זה מרגיש מהצד של מי ששואל?</Prompt>

        <Bot parts={["עיתונאית שניסתה את זה בעצמה שאלה שתי שאלות, אחת קשה (איך לשפר יחסים עם קרוב משפחה) ואחת קלילה (למה השמיים כחולים, באמת). חיכתה יום שלם, קיבלה רק הודעה גנרית שמבקשת סבלנות, ונשארה עם שלוש נקודות מהבהבות שלא מובילות לשום מקום. וזו בדיוק הנקודה: התרגלנו לצפות לסיפוק רגשי מיידי מכל מכונה שמדברת אלינו בגוף ראשון, וכשמישהו אמיתי צריך פשוט זמן, אנחנו מרגישים כמעט נטושים."]} />

        <StuckThinking />

        <Prompt>אז מה הוא בעצם מנסה להגיד?</Prompt>

        <Bot parts={['בסה"כ, ChatTJB לא באמת בא לשכנע אתכם ש-AI זה רע. הוא בא להראות לכם כמה מהר שכחתם איך זה מרגיש לשאול בן אדם. תשובה איטית, לא ממוקדת, לפעמים באיחור של יום שלם, אבל עם משהו שאף מודל לא יודע לזייף: העובדה שמישהו בחר, מרצונו החופשי, להקדיש לכם דקה מהיום שלו.']} />

        <Bot big parts={["וזה בעצם ההבדל האמיתי, זה שהעיתונאית ניסחה יפה בלי בכלל לשים לב שהיא עשתה את זה: תשובה מבן אדם מרגישה כמו מתנה. תשובה מבוט מרגישה כמו שיעורי בית."]} />

        <Bot parts={["עכשיו תשאלו את עצמכם באיזו משתי הקטגוריות נמצאת רוב האינטראקציה שלכם היום. אני כבר יודע מה התשובה שלי, ואני לא בטוח שאני אוהב אותה."]} />

        <div className="share-wrap"><ShareRow /></div>

        <Comments />

        {/* the shared related rail, wearing this page's own look */}
        <div className="more-wrap">
          <PostFooter slug="chattjb" title={POST_TITLE} parts={["related"]} frames={false} />
        </div>
      </main>

      <FloatingComposer />
    </div>
  );
}

/* =====================================================================
 *  CSS — LLM chat look
 * ===================================================================== */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@400;500;600;700&display=swap');

.gpt-root {
  --bg:#ffffff;
  --text:#0d0d0d;
  --muted:#8f8f8f;
  --pill:#f4f4f4;
  --line:#e6e6e6;
  --brand-navy:#020D2C;
  --brand-gold:#CFBD85;
  --ease:cubic-bezier(.22,.9,.24,1);
  font-family:'Noto Sans Hebrew', -apple-system, Arial, sans-serif;
  color:var(--text);
  background:var(--bg);
  min-height:100vh;
  font-size:1.04rem;
  line-height:1.75;
}

/* ---------- header ---------- */
.gpt-header {
  position:fixed; top:0; right:0; left:0; z-index:50;
  background:rgba(255,255,255,.88);
  backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
  border-bottom:1px solid var(--line);
}
.gpt-sitenav {
  display:flex; align-items:center; gap:1.2rem;
  padding:.55rem 1.1rem; border-bottom:1px solid var(--line);
}
.sn-logo img { height:26px; width:auto; display:block; }
.sn-links { display:flex; gap:1.1rem; margin-inline-start:auto; }
.sn-links a { color:var(--text); text-decoration:none; font-size:.92rem; font-weight:500; opacity:.75; transition:opacity .2s; }
.sn-links a:hover { opacity:1; }
.gpt-chatbar {
  display:flex; align-items:baseline; gap:.7rem; padding:.5rem 1.1rem;
}
.model-pick { display:flex; align-items:center; gap:.3rem; font-size:1.02rem; }
.model-pick svg { opacity:.5; }
.model-status { font-size:.8rem; color:var(--muted); transition:color .2s; }
.model-status.is-thinking { color:var(--text); }
.model-status.is-thinking::after {
  content:''; display:inline-block; width:.5em; height:.5em; border-radius:50%;
  background:var(--text); margin-inline-start:.4em; vertical-align:middle;
  animation:pulse 1s infinite var(--ease);
}

/* ---------- chat column ---------- */
.chat {
  position:relative; max-width:46rem; margin:0 auto;
  padding:8.2rem 1.15rem 7rem;
}
.chip {
  width:max-content; margin:0 auto 2.2rem;
  font-size:.78rem; color:var(--muted);
  border:1px solid var(--line); border-radius:99px; padding:.25em 1em;
}

/* ---------- turns ---------- */
.turn { margin:0 0 1.9rem; transition:opacity .5s var(--ease), transform .5s var(--ease); }
.st-hidden { opacity:0; transform:translateY(14px); }
.st-thinking, .st-streaming, .st-shown { opacity:1; transform:none; }

.t-user { display:flex; }
.user-pill {
  margin-inline-start:auto; max-width:78%;
  background:var(--pill); border-radius:1.4rem; padding:.62em 1.15em;
  font-weight:500;
}

.t-bot { display:grid; grid-template-columns:30px 1fr; gap:.8rem; align-items:start; }
.bot-av {
  width:30px; height:30px; border-radius:50%;
  background:var(--brand-navy); color:var(--brand-gold);
  display:flex; align-items:center; justify-content:center;
  margin-top:.25rem; flex:none;
}
.bot-body { min-width:0; }
.bot-body p { margin:0; }
.bot-big { font-size:1.28rem; font-weight:600; line-height:1.55; }
.post-title { font-size:1.55rem; font-weight:700; line-height:1.45; margin:0; letter-spacing:-.01em; }

/* streaming words */
.stream .w { opacity:0; }
.st-streaming .stream .w { animation:wordin .22s var(--ease) forwards; }
.st-shown .stream .w { opacity:1; animation:none; }
@keyframes wordin { to { opacity:1; } }
.stream a.w { color:inherit; text-decoration:underline; text-decoration-color:var(--brand-gold); text-decoration-thickness:2px; text-underline-offset:3px; }
.caret {
  display:inline-block; margin-inline-start:.05em; color:var(--text);
  animation:blink .9s steps(1) infinite;
}
@keyframes blink { 50% { opacity:0; } }

/* thinking dot */
.think-dot {
  display:inline-block; width:.85em; height:.85em; border-radius:50%;
  background:var(--text); margin-top:.45em;
  animation:pulse 1.05s infinite var(--ease);
}
@keyframes pulse { 0%,100% { transform:scale(.72); opacity:.45; } 50% { transform:scale(1); opacity:1; } }

/* ---------- media ---------- */
.media-card { margin:0; }
.media-card img {
  display:block; width:100%; height:auto;
  border-radius:1rem; border:1px solid var(--line);
}
.bot-body > .media-card { max-width:460px; }
.media-pair { display:grid; grid-template-columns:1fr 1fr; gap:.7rem; max-width:560px; }
.media-pair img { height:100%; object-fit:cover; }
.media-strip {
  display:flex; gap:.7rem; overflow-x:auto; padding-bottom:.5rem;
  scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch;
}
.media-strip .media-card { flex:0 0 240px; scroll-snap-align:start; }
.media-strip img { width:240px; height:240px; object-fit:cover; }

.media-video { max-width:340px; }
.media-video video {
  display:block; width:100%; height:auto;
  border-radius:1rem; border:1px solid var(--line);
  background:#000;
}
.media-credit { margin-top:.35rem; font-size:.78rem; }
.media-credit a { color:var(--muted); text-decoration:none; }
.media-credit a:hover { color:var(--text); text-decoration:underline; text-decoration-color:var(--brand-gold); }

/* ---------- divider ---------- */
.divider { text-align:center; color:var(--muted); letter-spacing:.4em; margin:2.6rem 0; }

/* ---------- share ---------- */
.share-wrap { margin:3rem 0 0; }
.share-btns { display:flex; flex-wrap:wrap; gap:.55rem; justify-content:center; }
.sh-btn {
  font-family:inherit; font-size:.88rem; font-weight:500; color:var(--text);
  background:var(--bg); border:1px solid var(--line); border-radius:99px;
  padding:.45em 1.1em; text-decoration:none; cursor:pointer;
  transition:background .2s, border-color .2s;
}
.sh-btn:hover { background:var(--pill); border-color:#d6d6d6; }

/* ---------- comments as composer ---------- */
.comments { margin:3.2rem 0 0; }
.comments h3 { font-size:1.15rem; margin:0 0 .2rem; }
.comments-sub { color:var(--muted); font-size:.9rem; margin:0 0 1.1rem; }
.comments-form { display:flex; flex-direction:column; gap:.7rem; }
.comments-grid { display:grid; grid-template-columns:1fr 1fr; gap:.7rem; }
.c-in {
  width:100%; box-sizing:border-box;
  font-family:inherit; font-size:1rem; color:var(--text);
  background:var(--pill); border:1px solid transparent; border-radius:1rem;
  padding:.72em 1em; outline:none; transition:border-color .2s, background .2s;
}
.c-in:focus { background:#fff; border-color:#c9c9c9; }
.composer { position:relative; display:flex; align-items:flex-end; }
.c-area { resize:vertical; min-height:56px; border-radius:1.4rem; flex:1; padding-inline-end:3.4rem; }
.send-btn {
  position:absolute; inset-inline-end:.55rem; bottom:.55rem;
  width:36px; height:36px; border-radius:50%;
  background:var(--text); color:#fff; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:transform .2s var(--ease), opacity .2s;
}
.send-btn:hover { transform:scale(1.07); }
.send-btn:disabled { opacity:.5; }
.comments-ok { font-weight:600; }
.comments-err { font-size:.9rem; color:#8a1f1f; margin:0; }
.disclaimer { text-align:center; color:var(--muted); font-size:.78rem; margin:1.6rem 0 0; }

/* ---------- related rail, in this page's own language ---------- */
.more-wrap {
  margin:3.2rem 0 0;
  --pf-card-bg:var(--bg);
  --pf-card-line:var(--line);
  --pf-card-line-hover:#c9c9c9;
  --pf-card-shadow-hover:0 8px 24px rgba(13,13,13,.09);
  --pf-card-muted:var(--muted);
}
.more-wrap .pf-more { margin:0; }

/* ---------- floating composer ---------- */
.float-composer {
  position:fixed; bottom:1.1rem; left:50%; transform:translateX(-50%);
  z-index:40; width:min(44rem, calc(100vw - 2.2rem));
  display:flex; align-items:center;
  font-family:inherit; font-size:1rem; text-align:start; cursor:pointer;
  background:#fff; border:1px solid var(--line); border-radius:99px;
  padding:.8em 1.3em;
  box-shadow:0 6px 28px rgba(13,13,13,.1);
  transition:opacity .35s var(--ease), transform .35s var(--ease);
}
.float-composer .fc-ph { color:var(--muted); }
.fc-send {
  margin-inline-start:auto; width:32px; height:32px; border-radius:50%;
  background:var(--text); color:#fff;
  display:flex; align-items:center; justify-content:center; flex:none;
}
.fc-hidden { opacity:0; transform:translate(-50%, 18px); pointer-events:none; }

/* ---------- app sidebar (desktop only) ---------- */
.gpt-sidebar { display:none; }
@media (min-width: 1100px) {
  .gpt-sidebar {
    display:flex; flex-direction:column;
    position:fixed; top:0; bottom:0; left:0; width:260px; z-index:60;
    background:#f9f9f9; border-left:none; border-right:1px solid var(--line);
    padding:.9rem .7rem 1rem; overflow-y:auto;
  }
  .gpt-header { left:260px; }
  .gpt-root { padding-left:260px; }
  .float-composer { left:calc(50% + 130px); }
}
.sb-top { display:flex; align-items:center; padding:.3rem .55rem .9rem; }
.sb-brand { display:flex; align-items:center; gap:.3rem; font-weight:600; font-size:1rem; }
.sb-brand svg { opacity:.5; }
.sb-ic { margin-inline-start:auto; opacity:.55; }
.sb-item {
  display:flex; align-items:center; gap:.6rem;
  width:100%; box-sizing:border-box; text-align:start;
  font-family:inherit; font-size:.92rem; font-weight:500; color:var(--text);
  background:none; border:none; border-radius:.65rem; padding:.5em .55rem;
  text-decoration:none; cursor:pointer;
  transition:background .15s;
}
.sb-item:hover { background:#ececec; }
.sb-item svg { opacity:.6; flex:none; }
.sb-new { margin-bottom:.4rem; }
.sb-label {
  font-size:.76rem; color:var(--muted); font-weight:500;
  padding:.4rem .55rem .25rem; margin-top:1rem;
}
.sb-recent { display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:400; }
.sb-current { background:#ececec; font-weight:600; }
.sb-user {
  margin-top:auto; display:flex; align-items:center; gap:.6rem;
  padding:.55rem .55rem; border-radius:.65rem;
  font-size:.92rem; font-weight:600; color:var(--text); text-decoration:none;
  transition:background .15s;
}
.sb-user:hover { background:#ececec; }
.sb-user img { width:28px; height:28px; border-radius:50%; object-fit:cover; }

/* ---------- mobile ---------- */
@media (max-width: 640px) {
  .gpt-root { font-size:1rem; }
  .chat { padding-top:7.6rem; }
  .sn-links { gap:.8rem; }
  .sn-links a { font-size:.85rem; }
  .user-pill { max-width:86%; }
  .t-bot { grid-template-columns:26px 1fr; gap:.6rem; }
  .bot-av { width:26px; height:26px; }
  .post-title { font-size:1.32rem; }
  .media-strip .media-card { flex-basis:200px; }
  .media-strip img { width:200px; height:200px; }
  .comments-grid { grid-template-columns:1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .turn { transition:none; }
  .stream .w { opacity:1 !important; animation:none !important; }
  .think-dot, .caret, .model-status.is-thinking::after { animation:none; }
}
`;
