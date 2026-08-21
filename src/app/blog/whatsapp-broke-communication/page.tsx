"use client";

/* =====================================================================
 *  BLOG POST — "סליחה ששלחתי וואטסאפ" · CHAT EDITION
 *  The post rendered as a WhatsApp conversation, scroll-driven:
 *  · WhatsApp doodle wallpaper as page background
 *  · Every paragraph = outgoing green bubble (RTL: sent on the left)
 *  · Headings / pull-quotes = incoming white bubbles from the other side
 *  · Images = image-messages; incoming bubbles "type" before appearing
 *  · Chat header shows "מקליד…" while the reader scrolls
 *  Route: /blog/whatsapp-broke-communication/chat · standalone duplicate, original untouched
 * ===================================================================== */

import { useEffect, useRef, useState } from "react";
import PostDate from "../../../components/PostDate";
import PostFooter from "../../../components/PostFooter";

/* ---------- header typing status driven by scroll ---------- */
function useScrollTyping() {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    let t: any;
    const on = () => {
      setTyping(true);
      clearTimeout(t);
      t = setTimeout(() => setTyping(false), 900);
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); clearTimeout(t); };
  }, []);
  return typing;
}

/* ---------- bubble reveal; incoming bubbles type first ---------- */
function useBubble(incoming: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"hidden" | "typing" | "shown">("hidden");
  const [time, setTime] = useState("");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stamp = () =>
      setTime(new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("shown");
      stamp();
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          if (incoming) {
            setState("typing");
            setTimeout(() => { setState("shown"); stamp(); }, 750);
          } else {
            setState("shown");
            stamp();
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -30% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [incoming]);
  return { ref, state, time };
}

function TypingDots() {
  return (
    <span className="dots" aria-label="מקליד">
      <i /><i /><i />
    </span>
  );
}

/* ---------- message bubbles: live timestamps at reveal ---------- */
function Msg({
  side,
  children,
  big = false,
}: {
  side: "out" | "in";
  children: React.ReactNode;
  big?: boolean;
}) {
  const { ref, state, time } = useBubble(side === "in");
  return (
    <div ref={ref} className={`row row-${side} st-${state}`}>
      <div className={`bubble b-${side}${big ? " b-big" : ""}`}>
        {state === "typing" ? (
          <TypingDots />
        ) : (
          <>
            <div className="msg-body">{children}</div>
            <span className="meta">
              {time}
              {side === "out" && <span className="ticks">✓✓</span>}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function ImgMsg({ src, alt, cap }: { src: string; alt: string; cap: string }) {
  const { ref, state, time } = useBubble(false);
  return (
    <div ref={ref} className={`row row-out st-${state}`}>
      <div className="bubble b-out b-img">
        <img src={src} alt={alt} loading="lazy" />
        <div className="msg-body img-cap">{cap}</div>
        <span className="meta">{time}<span className="ticks">✓✓</span></span>
      </div>
    </div>
  );
}

function DateChip({ children }: { children: React.ReactNode }) {
  return <div className="date-chip">{children}</div>;
}

/* ---------- share ---------- */
const POST_URL = "https://amitbrin.com/blog/whatsapp-broke-communication";
const POST_TITLE = "סליחה ששלחתי וואטסאפ - עמית ברין";

function ShareRow() {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const copy = async () => {
    try { await navigator.clipboard.writeText(POST_URL); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {}
  };
  return (
    <div className="share-btns">
      <a className="wa-btn" href={`https://wa.me/?text=${enc(POST_TITLE + " " + POST_URL)}`} target="_blank" rel="noopener noreferrer">להעביר בוואטסאפ</a>
      <a className="wa-btn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(POST_URL)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a className="wa-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(POST_URL)}`} target="_blank" rel="noopener noreferrer">פייסבוק</a>
      <a className="wa-btn" href={`https://x.com/intent/tweet?text=${enc(POST_TITLE)}&url=${enc(POST_URL)}`} target="_blank" rel="noopener noreferrer">X</a>
      <button className="wa-btn" type="button" onClick={copy}>{copied ? "הועתק ✓" : "העתקת קישור"}</button>
    </div>
  );
}

/* ---------- comments (same Formspree, chat-input styling) ---------- */
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
    <section className="comments">
      <h2>יש לך מה להגיד על זה?</h2>
      <p className="comments-sub">תגובות מגיעות ישירות אליי. בואו נדבר על זה.</p>
      {state === "ok" ? (
        <p className="comments-ok">תודה! התגובה נשלחה.</p>
      ) : (
        <form className="comments-form" onSubmit={submit}>
          <input type="hidden" name="_subject" value="תגובה חדשה בבלוג (גרסת הצ׳אט): סליחה ששלחתי וואטסאפ" />
          <input type="hidden" name="post" value="whatsapp-chat" />
          <div className="comments-grid">
            <input className="c-in" type="text" name="name" placeholder="שם" required />
            <input className="c-in" type="email" name="email" placeholder="אימייל (לא יפורסם)" required />
          </div>
          <div className="chat-input-row">
            <textarea className="c-in c-area" name="comment" placeholder="הודעה" rows={2} required />
            <button className="send-fab" type="submit" disabled={state === "sending"} aria-label="שליחה">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff" style={{ transform: "scaleX(-1)" }} aria-hidden><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
            </button>
          </div>
          {state === "err" && <p className="comments-err">משהו השתבש בשליחה. אפשר לנסות שוב, או פשוט לכתוב לי למייל.</p>}
        </form>
      )}
    </section>
  );
}

/* =====================================================================
 *  PAGE
 * ===================================================================== */
export default function WhatsappChatPost() {
  const typing = useScrollTyping();
  return (
    <div className="wa-root" dir="rtl" lang="he">
      <style>{CSS}</style>

      {/* chat header: site nav on top, chat identity below */}
      <header className="wa-header">
        <nav className="wa-sitenav" aria-label="ניווט ראשי">
          <a href="/" className="sn-logo" aria-label="עמית ברין - ראשי">
            <img src="/media/amit-brin-logo.svg" alt="עמית ברין" />
          </a>
          <div className="sn-links">
            <a href="/">ראשי</a>
            <a href="/#blog">כתיבה ועשייה</a>
            <a href="/#footer">דברו איתי</a>
          </div>
          <a className="hd-alt" href="/blog/whatsapp-broke-communication-broke-communication/classic">לגרסת הקריאה</a>
        </nav>
        <div className="wa-chatbar">
          <button className="hd-back" type="button" onClick={() => history.back()} aria-label="חזרה">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "scaleX(-1)" }} aria-hidden><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <img className="hd-avatar" src="/media/headshot.png" width={839} height={1100} alt="" />
          <div className="hd-meta">
            <strong>עמית ברין</strong>
            <span className={"hd-status" + (typing ? " is-typing" : "")}>
              {typing ? "מקליד…" : "מחובר"}
            </span>
          </div>
          <a className="hd-call" href="tel:+972549407575" aria-label="התקשרו אליי">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
          </a>
        </div>
      </header>

      <main className="chat">
        {/* the document's real heading — the chat bar above is a contact name,
            not a title. Visible to search and to screen readers. */}
        <h1 className="wa-h1">סליחה ששלחתי וואטסאפ</h1>
        <DateChip><PostDate slug="whatsapp-broke-communication" /></DateChip>

        <Msg side="in" big>סליחה ששלחתי וואטסאפ 🙃</Msg>
        <Msg side="out">
          <strong>וואטסאפ: לא אפליקציה גרועה. אפליקציה שעובדת מצוין - לא בשבילכם.</strong>
        </Msg>

        <Msg side="out">
          יותר מדי אחוזים מהתקשורת האלקטרונית שלי מתנהלת בוואטסאפ, וזה לא מרצוני החופשי. גם לא
          משלכם, אם כבר. בישראל מדובר בכ־97% אימוץ (אנחנו במקום הראשון בעולם, איזו גאווה) – מה
          שאומר שאין באמת אופציה לצאת, יש רק אופציה להיעלב מהיציאה של אחרים.
        </Msg>

        <Msg side="out">
          אז תראו, אני לא חושב שוואטסאפ היא אפליקציה עם עיצוב לקוי. אני חושב שהיא אפליקציה שעיצבה
          מחדש את הדרך שבה אנשים מדברים זה עם זה, וזה שני דברים שונים לגמרי.
        </Msg>

        <Msg side="in" big>
          היא לא שירתה צורך קיים - היא ייצרה התנהגות, ואז הפכה אותה לנורמה, ואז הפכה את הנורמה
          לתנאי סף לחיים חברתיים.
        </Msg>

        <ImgMsg
          src="/media/blog/whatsapp-broke-communication/shot-typing-preview.jpg"
          alt="צילום מסך: תצוגה מקדימה של הודעה בזמן הקלדה"
          cap="למה שלא נדע כמה זמן אנחנו עוד אמורים לחכות פה? אפילו אם זה ברמה של רמז לאיזה שלב של הסיפור מי שכותב לנו נמצא כרגע."
         
        />

        <Msg side="out">
          הטריק המרכזי הוא היברידי ומכוער: וואטסאפ היא <strong>מדיום אסינכרוני שמתחפש
          לסינכרוני</strong>. טכנית מותר לך לא לענות. מעשית, ה"נראה לאחרונה", שני הסימונים הכחולים
          ושלוש הנקודות המרצדות מייצרים שקיפות חד־כיוונית שמבטלת את הזכות הזו. תקשורת אסינכרונית
          אמורה להוריד לחץ; כאן היא מייצרת אותו יש מאין.
        </Msg>

        <ImgMsg
          src="/media/blog/whatsapp-broke-communication/shot-voice-failed.jpg"
          alt="צילום מסך: הודעה קולית שלא עברה"
          cap="למה בעצם אי אפשר לחסום הודעות קוליות?"
         
        />

        <Msg side="out">
          ומי שמנסה לצאת מהמשחק מקבל עונש סימטרי: כיביתם אישורי קריאה? יופי, עכשיו גם אתם לא רואים.
          זו לא פשרה, זה קנס. מערכת שמתמחרת פרטיות בכך שהיא מחזירה אותך לחוסר הוודאות שהיא עצמה
          נועדה לפתור.
        </Msg>

        <ImgMsg
          src="/media/blog/whatsapp-broke-communication/shot-chat-list.jpg"
          alt="צילום מסך: רשימת הצ׳אטים והארכיון"
          cap="יש דברים שמקומם בארכיון ועדיין הם יותר חשובים מכל שאר ההודעות שם - היררכיה של חשיבות בארכיון לא תזיק."
         
        />

        <Msg side="out">
          הקבוצות הן פרק בפני עצמו. אין מנגנון אישור הצטרפות – כל אחד יכול לצרף אותך לכל דבר, בכל
          שעה, ואתה תגלה את זה מהתראה. ואם תרצה לצאת, האפליקציה תודיע על כך לכולם בשורה יבשה שנקראת
          כמו הצהרה פוליטית ("X עזב את הקבוצה"). כלומר: <strong>הכניסה בלי הסכמה, היציאה עם קנס
          חברתי</strong>. מי שתכנן את זה הבין היטב מה מחזיק אנשים בפנים.
        </Msg>

        <DateChip>מה שמעניין הוא איפה העיצוב נכשל בצורה כל כך יסודית שהוא מתהפך</DateChip>

        <Msg side="out">
          מחקר מאוניברסיטת Loughborough בדק את תוויות ה"הועבר" וה"הועבר פעמים רבות" – אותן תוויות
          שנועדו לבלום הפצת שקרים – ומצא שחלק מהמשתמשים פירשו אותן כסימן לחשיבות. כלומר העבירו
          יותר. רק מיעוט הבין שמדובר באזהרה. פיצ'ר שנועד להאט הפצת מידע מוטעה ושימש בפועל כתו תקן.
          אין הרבה מקרים כאלה, ואני חושב שכדאי ללמד אותם, ובכל מקרה שיהיה לנו בהצלחה במערכת הבחירות
          הקרובה…
        </Msg>

        <ImgMsg
          src="/media/blog/whatsapp-broke-communication/shot-voice-flood.jpg"
          alt="צילום מסך: צרור הודעות קוליות"
          cap="אם כבר שולחים אליכם צרור של הודעות, צריך להיות מסוגלים לעצור אותו מתישהו."
         
        />

        <Msg side="out">
          ובמקביל, תגובות האימוג'י: מנגנון שהוזלה של תגובה אנושית לכדי לחיצה אחת, בדיוק במקום שבו
          היה נדרש משפט. משתמשים מדווחים שהם לוחצים על זה בטעות. מבחינת המערכת זו לא תקלה – זו
          אינטראקציה. ספירת אינטראקציות זו המטריקה, לא איכותן.
        </Msg>

        <ImgMsg
          src="/media/blog/whatsapp-broke-communication/shot-auto-reply.jpg"
          alt="צילום מסך: מענה אוטומטי בצ׳אט עם אמא"
          cap="סליחה אמא, אבל לא בכל זמן אני פנוי לכל דבר."
         
        />

        <Msg side="out">
          ה"מחק לכולם" השלים את התמונה: פיצ'ר תיקון שמותיר במקום ההודעה שלט ניאון שאומר "כאן היה
          משהו שהתחרטתי עליו". הסתרה שהיא בעצם הצבעה.
        </Msg>

        <Msg side="out">
          ועכשיו החלק שקצת פחות מצחיק. מחקר על עובדי בריאות בסעודיה מצא ש־63% מהם הציגו רמות מתח
          חריגות, 55.8% חרדה ו־48.6% דיכאון – בקורלציה לשימוש בוואטסאפ בעבודה. יש בספרות מקרה מתועד
          של עובדת שהתפטרה כי המנהל שלה ציפה לתגובה מיידית בלילות ובסופי שבוע. ויש כבר פסיקה
          (Case v Tai Tarian) שקבעה שהתנהלות בקבוצת וואטסאפ פרטית מהווה בריונות במקום עבודה ומצדיקה
          פיטורים. הקבוצה הפרטית, מסתבר, היא מקום ציבורי שרק מרגיש כמו סלון.
        </Msg>

        <Msg side="out">
          אז לא, זו לא רשלנות עיצובית. זו לא "חוסר עקביות בהיררכיה ויזואלית" ולא איזה חוב טכני
          שמישהו ישלם בגרסה הבאה. זו מערכת שממטבת בדיוק את מה שהיא נבנתה למטב – זמן מסך, תדירות
          פתיחה, מטא־דאטה (ההצפנה מגנה על התוכן, לא על מי־מתי־כמה־עם־מי) – ומצליחה בזה מעולה.
          השאלה "למה הם לא מתקנים את זה" מניחה שמדובר בבאג.
        </Msg>

        <Msg side="in" big>זה לא באג. אתם פשוט לא הלקוח.</Msg>

        <Msg side="out">
          הדבר היחיד שנשאר לנו הוא לשים לב מתי אנחנו מתנהגים לפי כללי המערכת בלי ששאלו אותנו:
          התנצלות על תשובה באיחור של שעתיים, הודעה קולית של שש דקות שנשלחה כי היה קל, לייק על הודעה
          שהצריכה שיחת טלפון.
        </Msg>

        <Msg side="out">
          <strong>והנה החלק שכן מצחיק: את הטקסט הזה, ברוב המקרים, תעבירו הלאה בקבוצה.</strong>
        </Msg>

        <Msg side="in" big>נו, אז תעבירו 👇</Msg>

        <div className="share-wrap"><ShareRow /></div>

        <Comments />

        {/* the shared related rail, wearing this page's own look */}
        <div className="more-wrap">
          <PostFooter slug="whatsapp-broke-communication" title={POST_TITLE} parts={["related"]} frames={false} />
        </div>
      </main>
    </div>
  );
}

/* =====================================================================
 *  CSS — WhatsApp look
 * ===================================================================== */
const CSS = `

@font-face { font-family:'Leon'; src:url('/fonts/Leon-Regular.woff2') format('woff2'); font-weight:400 500; font-display:swap; }

.wa-root {
  --wa-bg:#EFE7DC;
  --wa-doodle:#DCD2C4;
  --wa-out:#D9FDD3;
  --wa-in:#FFFFFF;
  --wa-header:#F6F5F3;
  --wa-green:#1DAA61;
  --wa-text:#111B21;
  --wa-meta:#667781;
  --wa-tick:#53BDEB;
  --ease:cubic-bezier(.22,.9,.24,1);
  font-family:'Noto Sans Hebrew', -apple-system, Arial, sans-serif;
  color:var(--wa-text);
  min-height:100vh;
  background-color:var(--wa-bg);
}
/* the real WhatsApp-style wallpaper, fixed behind everything */
.wa-root::before {
  content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
  background-image:url('/media/blog/whatsapp-broke-communication/wallpaper.jpg');
  background-size:cover; background-position:center top;
}
.wa-root .chat { position:relative; z-index:1; }

/* ---------- header: beefed up, two levels on the beige bar ---------- */
.wa-h1 {
  position:absolute; width:1px; height:1px; margin:-1px; padding:0;
  overflow:hidden; clip:rect(0 0 0 0); clip-path:inset(50%); white-space:nowrap;
}
.wa-header {
  position:fixed; top:0; right:0; left:0; z-index:50;
  display:flex; flex-direction:column;
  background:rgba(246,245,243,.94);
  backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  border-bottom:1px solid rgba(17,27,33,.08);
}
.wa-sitenav {
  display:flex; align-items:center; gap:2rem;
  padding:.75rem 1.2rem .55rem;
  border-bottom:1px solid rgba(17,27,33,.06);
}
.sn-logo img { height:26px; width:auto; display:block; }
.sn-links { display:flex; gap:1.5rem; }
.sn-links a {
  color:var(--wa-text); text-decoration:none;
  font-family:'Leon','Noto Sans Hebrew',sans-serif; font-weight:500; font-size:.95rem;
  letter-spacing:.02em; transition:opacity .35s;
}
.sn-links a:hover { opacity:.6; }
.wa-chatbar {
  display:flex; align-items:center; gap:.8rem;
  padding:.55rem 1rem .65rem;
}
.hd-back { background:none; border:none; padding:.2rem; cursor:pointer; color:var(--wa-text); display:flex; }
.hd-avatar { width:40px; height:40px; border-radius:50%; object-fit:cover; background:#ccc; }
.hd-meta { display:flex; flex-direction:column; line-height:1.25; }
.hd-meta strong { font-size:1.02rem; font-weight:600; }
.hd-status { font-size:.8rem; color:var(--wa-meta); transition:color .3s; }
.hd-status.is-typing { color:var(--wa-green); }
.hd-alt {
  margin-right:auto; font-size:.85rem; color:var(--wa-green);
  text-decoration:none; font-weight:600; padding:.4em .9em;
  border:1.4px solid var(--wa-green); border-radius:999px;
}
.hd-alt:hover { background:var(--wa-green); color:#fff; }
.hd-call {
  margin-right:auto; display:flex; align-items:center; justify-content:center;
  width:42px; height:42px; border-radius:50%;
  color:var(--wa-green);
  transition:background .3s, color .3s;
}
.hd-call:hover { background:var(--wa-green); color:#fff; }

/* ---------- chat column ---------- */
.chat {
  width:min(760px, 94vw);
  margin:0 auto;
  padding:150px 0 4rem;
  display:flex; flex-direction:column; gap:.55rem;
}

.date-chip {
  align-self:center; text-align:center;
  background:#fff; color:var(--wa-meta);
  font-size:.82rem; font-weight:500;
  padding:.4em 1em; border-radius:8px;
  box-shadow:0 1px 1px rgba(17,27,33,.08);
  margin:1.2rem 0 .8rem;
  max-width:86%;
}

/* ---------- rows & bubbles ---------- */
.row { display:flex; }
.row-out { justify-content:flex-start; }   /* RTL: sent = left side */
.row-in  { justify-content:flex-end; }

.row { opacity:0; transform:translateY(30px); transition:opacity .7s var(--ease) .12s, transform .7s var(--ease) .12s; }
.row.st-typing, .row.st-shown { opacity:1; transform:none; }

.bubble {
  position:relative;
  max-width:min(560px, 82%);
  padding:.55rem .8rem .95rem;
  border-radius:12px;
  box-shadow:0 1px 1px rgba(17,27,33,.1);
  font-size:1.02rem; line-height:1.75;
}
.b-out { background:var(--wa-out); border-bottom-left-radius:4px; }
.b-in  { background:var(--wa-in);  border-bottom-right-radius:4px; }

/* bubble tails */
.b-out::before, .b-in::before {
  content:''; position:absolute; bottom:0; width:12px; height:14px;
}
.b-out::before {
  left:-7px;
  background:radial-gradient(circle at 0 0, transparent 13px, var(--wa-out) 14px);
}
.b-in::before {
  right:-7px;
  background:radial-gradient(circle at 100% 0, transparent 13px, var(--wa-in) 14px);
}

/* incoming = the other side's reactions: headline weight */
.b-big { font-weight:700; font-size:clamp(1.1rem, 2.6vw, 1.5rem); line-height:1.5; }

.msg-body strong { font-weight:700; }
.meta {
  position:absolute; bottom:.3rem; left:.7rem;
  display:inline-flex; align-items:center; gap:.25em;
  font-size:.7rem; color:var(--wa-meta); direction:ltr;
}
.ticks { color:var(--wa-tick); letter-spacing:-.12em; font-size:.85em; }

/* image messages */
.b-img { padding:.35rem .35rem 1rem; max-width:min(340px, 78%); }
.b-img img { width:100%; height:auto; display:block; border-radius:9px; }
.img-cap { padding:.5rem .45rem 0; font-size:.92rem; line-height:1.6; }

/* typing dots */
.dots { display:inline-flex; gap:5px; padding:.35rem .3rem; }
.dots i {
  width:8px; height:8px; border-radius:50%; background:#9AA6AD;
  animation:blink 1.2s infinite;
}
.dots i:nth-child(2) { animation-delay:.2s; }
.dots i:nth-child(3) { animation-delay:.4s; }
@keyframes blink { 0%,60%,100% { opacity:.3; transform:translateY(0);} 30% { opacity:1; transform:translateY(-3px);} }

/* ---------- share ---------- */
.share-wrap { margin:.6rem 0 0; display:flex; justify-content:flex-start; }
.share-btns { display:flex; flex-wrap:wrap; gap:.6rem; max-width:82%; }
.wa-btn {
  background:#fff; color:var(--wa-green);
  border:1.6px solid var(--wa-green); border-radius:999px;
  font-family:inherit; font-size:.95rem; font-weight:600;
  padding:.55em 1.3em; text-decoration:none; cursor:pointer;
  box-shadow:0 1px 1px rgba(17,27,33,.08);
  transition:background .3s, color .3s;
}
.wa-btn:hover { background:var(--wa-green); color:#fff; }

/* ---------- comments ---------- */
.comments {
  margin-top:3rem; background:#fff; border-radius:16px;
  padding:1.6rem 1.4rem; box-shadow:0 1px 2px rgba(17,27,33,.1);
}
.comments h2 { margin:0; font-size:1.3rem; font-weight:700; }
.comments-sub { margin:.5rem 0 1.2rem; color:var(--wa-meta); }
.comments-form { display:flex; flex-direction:column; gap:.8rem; }
.comments-grid { display:grid; grid-template-columns:1fr 1fr; gap:.8rem; }
.c-in {
  width:100%; box-sizing:border-box;
  font-family:inherit; font-size:1rem; color:var(--wa-text);
  background:#F0F2F5; border:none; border-radius:12px;
  padding:.75em 1em; outline:none;
}
.c-in:focus { box-shadow:0 0 0 2px rgba(29,170,97,.35); }
.chat-input-row { display:flex; gap:.6rem; align-items:flex-end; }
.c-area { resize:vertical; min-height:52px; border-radius:22px; flex:1; }
.send-fab {
  flex:0 0 auto; width:48px; height:48px; border-radius:50%;
  background:var(--wa-green); border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 2px 6px rgba(17,27,33,.2);
  transition:transform .25s var(--ease);
}
.send-fab:hover { transform:scale(1.06); }
.send-fab:disabled { opacity:.6; }
.comments-ok { font-weight:600; color:var(--wa-green); }
.comments-err { font-size:.9rem; color:#8a1f1f; margin:0; }

/* ---------- related rail, in this page's own language ---------- */
.more-wrap {
  position:relative; z-index:1; margin:2.4rem 0 2rem;
  --pf-card-bg:#fff;
  --pf-card-line:rgba(0,0,0,.08);
  --pf-card-line-hover:rgba(0,0,0,.18);
  --pf-card-shadow:0 1px 1px rgba(0,0,0,.13);
  --pf-card-shadow-hover:0 8px 22px rgba(0,0,0,.18);
  --pf-card-muted:rgba(0,0,0,.5);
}
.more-wrap .pf-more { margin:0; }
.more-wrap .pf-more-h { color:#111b21; }

/* ---------- mobile ---------- */
@media (max-width: 640px) {
  .bubble { max-width:88%; }
  .b-img { max-width:82%; }
  .comments-grid { grid-template-columns:1fr; }
  .hd-alt { font-size:.78rem; padding:.35em .7em; }
  .wa-sitenav { gap:1.1rem; padding:.65rem .9rem .5rem; }
  .sn-links { gap:1rem; }
  .sn-links a { font-size:.85rem; }
  .chat { padding-top:138px; }
}

@media (prefers-reduced-motion: reduce) {
  .row { transition:none; }
  .dots i { animation:none; }
}
`;
