"use client";
import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   AMIT BRIN — ONE-PAGER (Rich Media)
   Faithful recreation of the Elementor one-pager
   Typography: Leon font family + Heebo (Sans Hebrew)
═══════════════════════════════════════════════════════════════ */

const S = `
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;900&display=swap');

@font-face { font-family: 'Leon'; src: url('/fonts/Leon-Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'Leon'; src: url('/fonts/Leon-Bold.ttf') format('truetype'); font-weight: 700; font-style: normal; font-display: swap; }
@font-face { font-family: 'Leon'; src: url('/fonts/Leon-Heavy.ttf') format('truetype'); font-weight: 900; font-style: normal; font-display: swap; }
@font-face { font-family: 'Leon'; src: url('/fonts/Leon-Thin.ttf') format('truetype'); font-weight: 100; font-style: normal; font-display: swap; }

:root {
  --black: #000000;
  --white: #ffffff;
  --gold: #c9973a;
  --gold-l: #e8b95a;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Leon', 'Heebo', Arial, sans-serif; color: var(--black); direction: rtl; overflow-x: hidden; }

/* ── NAV ── */
.site-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: linear-gradient(180deg, rgba(0,0,0,.6) 0%, transparent 100%);
  padding: 0 2rem; height: 64px;
  display: flex; align-items: center; justify-content: space-between;
  transition: top .4s ease;
}
.site-nav a {
  color: rgba(255,255,255,.8); text-decoration: none;
  font-family: 'Leon', sans-serif; font-size: 2vw; font-weight: 400;
  letter-spacing: 0.09vw; line-height: 120%;
  transition: color .2s;
}
.site-nav a:hover { color: #fff; }
.nav-logo { font-weight: 700; font-size: 1.05rem; color: #fff !important; letter-spacing: -.01em; }
.nav-links { display: flex; gap: 2rem; align-items: center; }
.nav-links a { font-size: .9rem; }
.nav-toggle { display: none; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; }

/* ── HERO VIDEO ── */
.hero-video-section {
  position: relative; width: 100%; height: 100vh; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.hero-video-section video {
  position: absolute; top: 50%; left: 50%;
  min-width: 100%; min-height: 100%;
  transform: translate(-50%, -50%);
  object-fit: cover; z-index: 0;
}
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,.5) 60%, rgba(0,0,0,.75) 100%);
  z-index: 1;
}
.hero-content {
  position: relative; z-index: 2;
  max-width: 780px; padding: 2rem;
  text-align: right;
}
.hero-content h1 {
  font-family: 'Leon', serif;
  font-size: 2vw; font-weight: 400;
  color: #fff; line-height: 120%; letter-spacing: 0.09vw;
  margin-bottom: 1.2rem;
  text-shadow: 0 2px 20px rgba(0,0,0,.3);
}
.hero-content .hero-sub {
  font-family: 'Leon', serif;
  font-size: 1.5vw; font-weight: 400;
  color: rgba(255,255,255,.85);
  line-height: 120%; letter-spacing: 0.4em; word-spacing: 1em;
  max-width: 640px; margin-bottom: 1.5rem;
}
.hero-content .hero-note {
  font-family: 'Heebo', sans-serif;
  font-size: 1.4vw; font-weight: 600;
  color: rgba(255,255,255,.6);
  line-height: 135%; letter-spacing: 0.05vw;
  border-right: 3px solid var(--gold);
  padding-right: 1rem; max-width: 580px;
}
.hero-scroll-hint {
  position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
  z-index: 2; color: rgba(255,255,255,.4); font-size: .8rem;
  display: flex; flex-direction: column; align-items: center; gap: .3rem;
  animation: bobDown 2s ease-in-out infinite;
}
@keyframes bobDown { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }

/* ── HEADSHOT SECTION ── */
.headshot-section {
  max-width: 900px; margin: 0 auto;
  padding: 5rem 2rem;
  display: flex; gap: 2.5rem; align-items: flex-start;
}
.headshot-text { flex: 1; min-width: 260px; }
.headshot-text h2 {
  font-family: 'Leon', serif;
  font-size: 2vw; font-weight: 400;
  line-height: 120%; letter-spacing: 0.07vw;
  margin-bottom: .3rem;
}
.headshot-text .roles {
  font-family: 'Leon', serif;
  font-size: 1.6vw; font-weight: 400;
  line-height: 125%;
  color: #444; margin-bottom: 1.2rem;
}
.headline-words {
  font-family: 'Leon', serif;
  font-size: 1.6vw; font-weight: 400;
  line-height: 125%;
  margin-bottom: 1rem;
}
.headline-words span { display: inline; }
.headline-words span::after { content: ' '; }
.for-whom {
  font-family: 'Heebo', sans-serif;
  font-size: 1.4vw; font-weight: 600;
  line-height: 135%; letter-spacing: 0.05vw;
  color: #555;
}
.headshot-img {
  width: 200px; flex-shrink: 0;
}
.headshot-img img {
  width: 100%; display: block; filter: grayscale(15%); border-radius: 4px;
}

/* ── BLOG SECTION ── */
.blog-section {
  max-width: 800px; margin: 0 auto; padding: 5rem 2rem;
}
.blog-label {
  font-family: 'Leon', serif;
  font-size: 1.5vw; font-weight: 400;
  line-height: 120%; letter-spacing: 0.4em; word-spacing: 1em;
  margin-bottom: 2rem; padding-bottom: .5rem;
  border-bottom: 1px solid var(--black);
}
.post-card { margin-bottom: 3rem; }
.post-card h2 {
  font-family: 'Leon', serif;
  font-size: 2vw; font-weight: 400;
  line-height: 120%; letter-spacing: 0.09vw;
  margin-bottom: .75rem;
}
.post-card p {
  font-family: 'Heebo', sans-serif;
  font-size: 1.4vw; font-weight: 600;
  line-height: 135%; letter-spacing: 0.05vw;
  margin-bottom: 1rem;
}
.post-link {
  display: inline-block;
  font-family: 'Leon', serif;
  font-size: 1.6vw; font-weight: 400; line-height: 125%;
  color: var(--black); text-decoration: none;
  border-bottom: 2px solid var(--black); padding-bottom: 1px;
  transition: opacity .15s;
}
.post-link:hover { opacity: .5; }

/* ── NEWSLETTER — VIDEO BG ── */
.newsletter-section {
  position: relative; width: 100%; overflow: hidden;
  padding: 5rem 2rem; min-height: 400px;
  display: flex; align-items: center; justify-content: center;
}
.newsletter-section video {
  position: absolute; top: 50%; left: 50%;
  min-width: 100%; min-height: 100%;
  transform: translate(-50%, -50%); object-fit: cover; z-index: 0;
}
.newsletter-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.55); z-index: 1;
}
.newsletter-inner {
  position: relative; z-index: 2;
  max-width: 700px; margin: 0 auto; color: #fff;
}
.newsletter-inner h2 {
  font-family: 'Leon', serif;
  font-size: 2vw; font-weight: 400;
  line-height: 120%; letter-spacing: 0.09vw;
  margin-bottom: .5rem;
}
.newsletter-inner .ns-desc {
  font-family: 'Heebo', sans-serif;
  font-size: 1.4vw; font-weight: 600;
  line-height: 135%; letter-spacing: 0.05vw;
  color: rgba(255,255,255,.75); margin-bottom: 1.5rem;
}
.newsletter-inner .ns-cta {
  font-family: 'Leon', serif;
  font-size: 1.6vw; font-weight: 400; line-height: 125%;
  color: rgba(255,255,255,.9); margin-bottom: 1.5rem;
}
.nl-form {
  display: flex; gap: .5rem; flex-wrap: wrap;
}
.nl-form input {
  flex: 1; min-width: 160px; padding: .8rem 1rem;
  border: none; border-radius: 6px;
  font-family: 'Heebo', sans-serif; font-size: .93rem;
  direction: rtl;
}
.nl-form button {
  background: var(--gold); color: var(--black);
  border: none; padding: .8rem 1.5rem; border-radius: 6px;
  font-family: 'Heebo', sans-serif; font-size: .93rem; font-weight: 700;
  cursor: pointer; transition: background .2s;
}
.nl-form button:hover { background: var(--gold-l); }

/* ── WORKSHOPS SECTION ── */
.workshops-section {
  max-width: 900px; margin: 0 auto;
  padding: 5rem 2rem;
}
.workshops-section h2 {
  font-family: 'Leon', serif;
  font-size: 2vw; font-weight: 400;
  line-height: 120%; letter-spacing: 0.09vw;
  margin-bottom: .5rem;
}
.workshops-section .ws-sub {
  font-family: 'Heebo', sans-serif;
  font-size: 1.4vw; font-weight: 600;
  line-height: 135%; letter-spacing: 0.05vw;
  color: #555; margin-bottom: 2.5rem; max-width: 600px;
}
.ws-item {
  padding: 1.5rem 0;
  border-top: 1px solid var(--black);
}
.ws-item:last-child { border-bottom: 1px solid var(--black); }
.ws-item h3 {
  font-family: 'Leon', serif;
  font-size: 1.6vw; font-weight: 400;
  line-height: 125%;
  margin-bottom: .5rem; letter-spacing: .05em;
}
.ws-item p {
  font-family: 'Heebo', sans-serif;
  font-size: 1.4vw; font-weight: 600;
  line-height: 135%; letter-spacing: 0.05vw;
  color: #555;
}

/* ── CONTACT ── */
.contact-section {
  max-width: 800px; margin: 0 auto; padding: 3rem 2rem 5rem;
}
.contact-section h2 {
  font-family: 'Leon', serif;
  font-size: 2vw; font-weight: 400;
  line-height: 120%; letter-spacing: 0.09vw;
  margin-bottom: .5rem;
}
.contact-section .ct-note {
  font-family: 'Heebo', sans-serif;
  font-size: 1.4vw; font-weight: 600;
  line-height: 135%;
  font-style: italic; margin-bottom: 1.5rem; color: #444;
}
.ct-form { display: flex; flex-direction: column; gap: .75rem; }
.ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.ct-form input {
  width: 100%; padding: .75rem 1rem;
  border: 1px solid var(--black); border-radius: 0;
  font-family: 'Heebo', sans-serif; font-size: 1rem;
  direction: rtl; outline: none; transition: border-color .15s;
}
.ct-form input:focus { outline: 2px solid var(--black); }
.ct-submit {
  background: var(--black); color: #fff; border: none;
  padding: .85rem 2rem; font-family: 'Heebo', sans-serif;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: opacity .15s; align-self: flex-start;
}
.ct-submit:hover { opacity: .75; }

/* ── CLOSING ── */
.closing-section {
  max-width: 800px; margin: 0 auto; padding: 2rem 2rem 3rem;
}
.closing-section h2 {
  font-family: 'Leon', serif;
  font-size: 1.6vw; font-weight: 400;
  line-height: 125%;
  margin-bottom: .8rem;
}
.closing-section a { color: var(--gold); font-weight: 700; text-decoration: underline; }

/* ── FOOTER — VIDEO BG ── */
.footer-section {
  position: relative; width: 100%; overflow: hidden;
  padding: 3rem 2rem; min-height: 200px;
}
.footer-section video {
  position: absolute; top: 50%; left: 50%;
  min-width: 100%; min-height: 100%;
  transform: translate(-50%, -50%); object-fit: cover; z-index: 0;
}
.footer-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.6); z-index: 1;
}
.footer-inner {
  position: relative; z-index: 2;
  max-width: 800px; margin: 0 auto; color: #fff;
}
.footer-inner h6 {
  font-family: 'Leon', serif;
  font-size: 1.5vw; font-weight: 400;
  line-height: 120%; letter-spacing: 0.4em;
  margin-bottom: 1rem;
}
.footer-links {
  list-style: none; display: flex; flex-wrap: wrap; gap: .4rem 1.5rem;
}
.footer-links a {
  color: rgba(255,255,255,.8); text-decoration: underline; font-size: .9rem;
  font-family: 'Heebo', sans-serif;
}
.footer-links a:hover { color: #fff; }

/* ── DIVIDERS ── */
.section-hr {
  border: none; border-top: 1px solid var(--black);
  margin: 0 auto; max-width: 800px;
}
.section-hr.thick { border-top-width: 2px; }

/* ── MOBILE ── */
@media (max-width: 768px) {
  .nav-links { display: none; }
  .nav-links.open {
    display: flex; position: absolute; top: 64px; right: 0; left: 0;
    background: rgba(0,0,0,.92); flex-direction: column;
    padding: 1.2rem 2rem; gap: 1rem;
  }
  .nav-toggle { display: block; }
  .headshot-section { flex-direction: column-reverse; padding: 3rem 1.5rem; }
  .headshot-img { width: 140px; }
  .ct-row { grid-template-columns: 1fr; }

  /* Scale typography for mobile */
  .hero-content h1 { font-size: clamp(1.4rem, 5vw, 2rem); }
  .hero-content .hero-sub { font-size: clamp(.9rem, 3vw, 1.1rem); letter-spacing: .1em; word-spacing: .3em; }
  .hero-content .hero-note { font-size: clamp(.8rem, 2.5vw, .95rem); }
  .headshot-text h2 { font-size: clamp(1.5rem, 5vw, 2rem); }
  .headshot-text .roles, .headline-words { font-size: clamp(1rem, 3.5vw, 1.3rem); }
  .for-whom, .post-card p, .ws-sub, .ws-item p, .newsletter-inner .ns-desc, .contact-section .ct-note { font-size: clamp(.85rem, 2.5vw, 1rem); }
  .blog-label { font-size: clamp(.9rem, 3vw, 1.1rem); letter-spacing: .15em; word-spacing: .4em; }
  .post-card h2, .newsletter-inner h2, .workshops-section h2, .contact-section h2 { font-size: clamp(1.2rem, 4vw, 1.6rem); }
  .post-link, .ws-item h3, .newsletter-inner .ns-cta, .closing-section h2 { font-size: clamp(1rem, 3vw, 1.2rem); }
  .footer-inner h6 { font-size: clamp(.9rem, 3vw, 1.1rem); letter-spacing: .15em; }
}
`;

export default function SitePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: S }} />

      {/* ── NAV ── */}
      <nav className="site-nav">
        <a href="/" className="nav-logo">עמית ברין</a>
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
        <div className={`nav-links${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)}>
          <a href="#about">ראשי</a>
          <a href="#blog">כתיבה ועשייה</a>
          <a href="#contact">דברו איתי</a>
        </div>
      </nav>

      {/* ── SEC1: HERO — SAILING VIDEO ── */}
      <section className="hero-video-section">
        <video autoPlay muted loop playsInline poster="/media/portrait.jpg">
          <source src="/media/sailing4k2_1_1.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>לוקח אותך למסע<br/>אל משהו שאף אחד<br/>עוד לא עשה</h1>
          <p className="hero-sub">
            בדרך אל היצירה החדשה, מצויד בטכנולוגיה פורצת דרך, אני שם רגע בצד רזומה של 23 שנים במה שקוראים ״עיצוב גרפי״ — כי בעולם החדש הזה אין סיבה להאחז בדוגמאות מהעבר כרפרנס למה שאנחנו מסוגלים להגיע אליו עכשיו. גבול היכולות שלנו רחוק בהרבה ממה שהכרנו! אז... שנצא לדרך?
          </p>
          <p className="hero-note">
            *בין השאר, אני מחפש מראה סופי לאתר הזה. אז גם העמוד הזה שאתן קוראות עכשיו מתעדכן, ועובר שינויים ושיפוצים על בסיס קבוע. בהמשך האתר גם כמה דברים אקספרימנטליים שאני עדיין בוחן... בקיצור: שימו לב איפה שאתן דורכות כי בדיוק שטפתי פה.
          </p>
        </div>
        <div className="hero-scroll-hint">
          <span>↓</span>
        </div>
      </section>

      {/* ── SEC2: HEADSHOT / PORTRAIT ── */}
      <section className="headshot-section" id="about">
        <div className="headshot-text">
          <h2>עמית ברין</h2>
          <p className="roles">אבא, מעצב, מרצה, מנטור, מעורר השראה</p>
          <div className="headline-words">
            <span>יוצר</span>
            <span>שינוי</span>
            <span>ניראות</span>
            <span>בידול</span>
            <span>משמעות</span>
            <span>עניין</span>
            <span>ערך</span>
          </div>
          <p className="for-whom">למותגים המובילים בארץ ובעולם<br/>ולאנשים מצליחים ומסופקים יותר</p>
        </div>
        <div className="headshot-img">
          <img src="/media/echo_v_200.png" alt="עמית ברין" loading="lazy" />
        </div>
      </section>

      {/* ── SEC3: BLOG ── */}
      <section className="blog-section" id="blog">
        <p className="blog-label">מחשבות על עיצוב<br/>ועל חוויית שימוש</p>
        <article className="post-card">
          <h2>סליחה ששלחתי וואטסאפ</h2>
          <p>
            וואטסאפ היא אפליקציה תקשורת שמשבשת את התקשורת האנושית. לא פחות. היא גם משנה את ההתנהגות האישית שלנו לרעה. ממש ככה. רוב האנשים לא עסוקים בשאלה ״האם היא משרתת אותנו, או שאנחנו משרתים אותה?״, הם גם לא מודעים לכך שהיא כבר מזמן לא משמשת לצרכים שעבורם היא נבנתה.
          </p>
          <a href="#" className="post-link">לפוסט המלא ←</a>
        </article>
      </section>

      <hr className="section-hr" />

      {/* ── SEC4: NEWSLETTER — BOT-WHISPERER VIDEO ── */}
      <section className="newsletter-section">
        <video autoPlay muted loop playsInline>
          <source src="/media/bot-whisperer.mp4" type="video/mp4" />
        </video>
        <div className="newsletter-overlay" />
        <div className="newsletter-inner">
          <h2>רוצים לדעת מהיכן הפרומפטים שלי?</h2>
          <p className="ns-desc">
            כדי לדעת מה ללחוש לבוטים, במיוחד ברגעים מאתגרים ומכריעים, אני מקפיד להתעדכן על בסיס יומי בהשקות ועדכונים של כלים, בלימודי טכניקות או פרומפטים מורכבים — כדי שאתם לא תצטרכו לעבור את תהליך ההסתגלות הסיזיפי הזה ותוכלו ליהנות ישר מהתובנות שריכזתי, בצורה הכי מתומצתת ויעילה.
          </p>
          <p className="ns-cta">לשלוח גם לך עדכונים, מדריכים וטיפים ברגע שאני מסכם אותם?</p>
          <form className="nl-form" onSubmit={e => e.preventDefault()}>
            <input type="text" name="name" placeholder="איך לקרוא לך?" />
            <input type="email" name="email" placeholder="לאיזה מייל לשלוח?" />
            <button type="submit">תרשום אותי לעדכונים!</button>
          </form>
        </div>
      </section>

      <hr className="section-hr" />

      {/* ── SEC5: WORKSHOPS ── */}
      <section className="workshops-section" id="workshops">
        <h2>בא לחדש לכם</h2>
        <p className="ws-sub">
          מגיע עד אליכם כדי להעשיר, ללמד ולתרגל עבודה עם כלים עדכניים, פרקטיקות מתקדמות, חשיבה עיצובית ויצירה עם בינה מלאכותית.
        </p>
        <div className="ws-item">
          <h3>✦ הרצאות העשרה ✦</h3>
          <p>אם זה בערב חברה או במפגש חברים, כשרוצים להעניק לקבוצה חוויה של דעת וטריוויה מפתיעה — אני מגיע עם סיפור עשיר ומסחרר, רחב יריעה וסוחף.</p>
        </div>
        <div className="ws-item">
          <h3>✦ הדרכות טכניות ✦</h3>
          <p>להתעדכן בגרסאות האחרונות של התוכנות שאתן כבר עובדות עליהן — הדרכת ריענון תקופתי שהיא חובה לכל סטודיו.</p>
        </div>
        <div className="ws-item">
          <h3>✦ סדנאות מעשיות ✦</h3>
          <p>מאגרים של כלים חדשים (כאלה שתאהבו!) לארגז הכלים; עבודה מבוססת חשיבה עיצובית ובינה יוצרת.</p>
        </div>
      </section>

      <hr className="section-hr" />

      {/* ── SEC6: CONTACT ── */}
      <section className="contact-section" id="contact">
        <h2>הי, אני גם רוצה לארח אותך לכזה דבר!</h2>
        <p className="ct-note">(אבל הארגון שלי שונה ומיוחד, הוא מצריך תוכן ועריכה ייעודים — אז בוא נדבר!)</p>
        <form className="ct-form" onSubmit={e => e.preventDefault()}>
          <div className="ct-row">
            <input type="text" name="name" placeholder="שם מלא" />
            <input type="text" name="role" placeholder="תפקיד בארגון" />
          </div>
          <input type="email" name="email" placeholder="מייל בארגון" />
          <button type="submit" className="ct-submit">שליחה</button>
        </form>
      </section>

      <hr className="section-hr thick" />

      {/* ── SEC7: CLOSING ── */}
      <section className="closing-section">
        <h2>כנראה שהעמוד הזה יהיה בבנייה לנצח</h2>
        <h2>אבל ברצינות, תחשבו על זה רגע... להיות במצב הזה של הצורך להשתנות תמידית — זה משהו שאתם הייתם לוקחים על עצמכם?</h2>
        <h2>(כי אני חושב שפשוט חייבים. <a href="mailto:ahoovi@gmail.com">דברו איתי</a> אם אתם צריכים שינוי.)</h2>
      </section>

      {/* ── SEC8: FOOTER — UNDERWATER VIDEO (placeholder - video missing) ── */}
      <footer className="footer-section">
        {/* Underwater video will go here when available */}
        <div className="footer-overlay" style={{ background: "rgba(0,0,0,.75)" }} />
        <div className="footer-inner">
          <h2 className="closing-section" style={{ color: "#fff", marginBottom: "1.5rem" }}>זהו, הגעת לתחתית.</h2>
          <h6>איפה בכל זאת אפשר להשיג אותי</h6>
          <ul className="footer-links">
            <li><a href="mailto:ahoovi@gmail.com">ahoovi@gmail.com</a></li>
            <li><a href="tel:0549407575">054-9407575</a></li>
            <li><a href="https://www.linkedin.com/in/amit-brin" target="_blank" rel="noopener">Amit Brin — LinkedIn</a></li>
            <li><a href="https://x.com/amit_brin" target="_blank" rel="noopener">amit_brin — X</a></li>
            <li><a href="https://www.facebook.com/amitbdesign" target="_blank" rel="noopener">Facebook</a></li>
            <li><a href="https://www.behance.net/amitbrin" target="_blank" rel="noopener">Behance</a></li>
          </ul>
        </div>
      </footer>
    </>
  );
}
