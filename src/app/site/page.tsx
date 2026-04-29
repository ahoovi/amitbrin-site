"use client";
import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   AMIT BRIN — ONE-PAGER (Rich Media)
   Recreation of the Elementor one-pager with video backgrounds
═══════════════════════════════════════════════════════════════ */

const S = `
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap');

:root {
  --black: #000000;
  --white: #ffffff;
  --off-white: #f5f5f0;
  --gold: #c9973a;
  --gold-l: #e8b95a;
  --navy: #1a2744;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Heebo', Arial, sans-serif; color: var(--black); direction: rtl; overflow-x: hidden; }

/* ── NAV ── */
.site-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(0,0,0,.7); backdrop-filter: blur(12px);
  padding: 0 2rem; height: 56px;
  display: flex; align-items: center; justify-content: space-between;
  transition: transform .35s;
}
.site-nav a { color: rgba(255,255,255,.75); text-decoration: none; font-size: .88rem; transition: color .2s; }
.site-nav a:hover { color: #fff; }
.nav-logo { font-weight: 900; font-size: 1.05rem; color: #fff !important; letter-spacing: -.01em; }
.nav-links { display: flex; gap: 1.8rem; align-items: center; }
.nav-cta { background: var(--gold); color: var(--black) !important; padding: .45rem 1.1rem; border-radius: 6px; font-weight: 700; font-size: .82rem; }
.nav-cta:hover { background: var(--gold-l); }
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
  background: linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.55) 70%, rgba(0,0,0,.8) 100%);
  z-index: 1;
}
.hero-content {
  position: relative; z-index: 2;
  max-width: 780px; padding: 2rem;
  text-align: right;
}
.hero-content h1 {
  font-size: clamp(2.2rem, 6vw, 3.8rem); font-weight: 900;
  color: #fff; line-height: 1.1; letter-spacing: -.03em;
  margin-bottom: 1.2rem;
  text-shadow: 0 2px 20px rgba(0,0,0,.4);
}
.hero-content .hero-sub {
  font-size: clamp(.95rem, 2.2vw, 1.15rem); color: rgba(255,255,255,.85);
  line-height: 1.75; max-width: 640px; margin-bottom: 1.5rem;
}
.hero-content .hero-note {
  font-size: .85rem; color: rgba(255,255,255,.6);
  font-style: italic; border-right: 3px solid var(--gold);
  padding-right: 1rem; line-height: 1.6; max-width: 580px;
}
.hero-scroll-hint {
  position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
  z-index: 2; color: rgba(255,255,255,.5); font-size: .8rem;
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
  font-size: clamp(1.8rem, 4.5vw, 3rem); font-weight: 900;
  line-height: 1.08; letter-spacing: -.02em; margin-bottom: .3rem;
}
.headshot-text .roles {
  font-size: 1rem; font-weight: 300; line-height: 1.8; margin-bottom: 1.2rem; color: #444;
}
.headline-words {
  font-size: clamp(1.4rem, 3.5vw, 2rem); font-weight: 900;
  line-height: 1.35; letter-spacing: -.02em; margin-bottom: 1rem;
}
.headline-words span { display: inline; }
.headline-words span::after { content: ' '; }
.for-whom { font-size: .95rem; line-height: 1.65; color: #555; }
.headshot-img {
  width: 200px; flex-shrink: 0;
}
.headshot-img img {
  width: 100%; display: block; filter: grayscale(15%); border-radius: 4px;
}

/* ── BOXING VIDEO SECTION ── */
.boxing-section {
  position: relative; width: 100%; height: 50vh; min-height: 350px;
  overflow: hidden; display: flex; align-items: center; justify-content: center;
}
.boxing-section video {
  position: absolute; top: 50%; left: 50%;
  min-width: 100%; min-height: 100%;
  transform: translate(-50%, -50%); object-fit: cover; z-index: 0;
}
.boxing-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.45); z-index: 1;
}
.boxing-content {
  position: relative; z-index: 2;
  text-align: center; max-width: 600px; padding: 2rem;
}
.boxing-content h2 {
  font-size: clamp(1.5rem, 4vw, 2.5rem); font-weight: 900;
  color: #fff; line-height: 1.15; margin-bottom: .8rem;
  text-shadow: 0 2px 12px rgba(0,0,0,.4);
}
.boxing-content p {
  font-size: 1rem; color: rgba(255,255,255,.8); line-height: 1.7;
}

/* ── WORKSHOPS SECTION ── */
.workshops-section {
  position: relative; width: 100%;
  padding: 5rem 2rem;
  background-image: url('/media/keynote-section-back2800x1750w.jpg');
  background-size: cover; background-position: center; background-attachment: fixed;
}
.workshops-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.65);
}
.workshops-inner {
  position: relative; z-index: 1;
  max-width: 900px; margin: 0 auto;
}
.workshops-inner h2 {
  font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 900;
  color: #fff; margin-bottom: .5rem;
}
.workshops-inner .ws-sub {
  font-size: 1rem; color: rgba(255,255,255,.7); margin-bottom: 2.5rem;
  line-height: 1.7; max-width: 600px;
}
.ws-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.2rem;
}
.ws-card {
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);
  border-radius: 12px; padding: 1.6rem;
  backdrop-filter: blur(6px);
  transition: all .25s;
}
.ws-card:hover { background: rgba(255,255,255,.14); border-color: var(--gold); transform: translateY(-3px); }
.ws-card h3 { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: .4rem; letter-spacing: .04em; }
.ws-card p { font-size: .88rem; color: rgba(255,255,255,.7); line-height: 1.65; }

/* ── NEWSLETTER ── */
.newsletter-section {
  background: var(--black); color: #fff;
  padding: 4rem 2rem;
}
.newsletter-inner {
  max-width: 700px; margin: 0 auto;
}
.newsletter-inner h2 {
  font-size: clamp(1.3rem, 3.5vw, 1.8rem); font-weight: 900;
  margin-bottom: .5rem;
}
.newsletter-inner .ns-desc {
  font-size: .93rem; color: rgba(255,255,255,.7); line-height: 1.7;
  margin-bottom: 1.5rem;
}
.newsletter-inner .ns-cta {
  font-size: .95rem; font-weight: 700; color: rgba(255,255,255,.9);
  margin-bottom: 1.5rem;
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

/* ── BLOG ── */
.blog-section {
  max-width: 800px; margin: 0 auto; padding: 5rem 2rem;
}
.blog-label {
  font-size: .72rem; font-weight: 700; letter-spacing: .12em;
  text-transform: uppercase; margin-bottom: 2rem;
  padding-bottom: .5rem; border-bottom: 1px solid var(--black);
}
.post-card { margin-bottom: 3rem; }
.post-card h2 {
  font-size: clamp(1.3rem, 3vw, 1.8rem); font-weight: 700;
  line-height: 1.2; margin-bottom: .75rem; letter-spacing: -.01em;
}
.post-card p { font-size: 1rem; line-height: 1.7; margin-bottom: 1rem; }
.post-link {
  display: inline-block; font-size: .9rem; font-weight: 700;
  color: var(--black); text-decoration: none;
  border-bottom: 2px solid var(--black); padding-bottom: 1px;
  transition: opacity .15s;
}
.post-link:hover { opacity: .5; }

/* ── CONTACT ── */
.contact-section {
  max-width: 800px; margin: 0 auto; padding: 3rem 2rem 5rem;
}
.contact-section h2 {
  font-size: clamp(1.2rem, 3vw, 1.6rem); font-weight: 900;
  margin-bottom: .5rem;
}
.contact-section .ct-note {
  font-size: .85rem; font-style: italic; margin-bottom: 1.5rem; color: #444;
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
  font-size: clamp(1rem, 2.5vw, 1.4rem); font-weight: 700;
  line-height: 1.4; margin-bottom: .8rem;
}
.closing-section a { color: var(--gold); font-weight: 700; text-decoration: underline; }

/* ── FOOTER ── */
.site-footer {
  max-width: 800px; margin: 0 auto; padding: 2rem;
  border-top: 2px solid var(--black);
}
.site-footer h6 {
  font-size: .72rem; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; margin-bottom: 1rem;
}
.footer-links {
  list-style: none; display: flex; flex-wrap: wrap; gap: .4rem 1.5rem;
}
.footer-links a {
  color: #0000EE; text-decoration: underline; font-size: .9rem;
}
.footer-links a:hover { text-decoration: none; }

/* ── MOBILE ── */
@media (max-width: 768px) {
  .nav-links { display: none; }
  .nav-links.open {
    display: flex; position: absolute; top: 56px; right: 0; left: 0;
    background: rgba(0,0,0,.92); flex-direction: column;
    padding: 1.2rem 2rem; gap: 1rem;
  }
  .nav-toggle { display: block; }
  .headshot-section { flex-direction: column-reverse; padding: 3rem 1.5rem; }
  .headshot-img { width: 140px; }
  .ct-row { grid-template-columns: 1fr; }
  .boxing-section { height: 40vh; min-height: 280px; }
  .workshops-section { background-attachment: scroll; }
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
          <a href="#about">מי אני</a>
          <a href="#workshops">סדנאות</a>
          <a href="#blog">כתיבה ועשייה</a>
          <a href="#contact" className="nav-cta">דברו איתי</a>
        </div>
      </nav>

      {/* ── HERO — SAILING VIDEO ── */}
      <section className="hero-video-section">
        <video autoPlay muted loop playsInline poster="/media/portrait.jpg">
          <source src="/media/sailing4k2_1_1.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>לוקח אותך למסע<br/>אל משהו שאף אחד<br/>עוד לא עשה</h1>
          <p className="hero-sub">
            בדרך אל היצירה החדשה, מצויד בטכנולוגיה פורצת דרך, אני שם רגע בצד רזומה של 23 שנים במה שקוראים ״עיצוב גרפי״ — כי בעולם החדש הזה אין סיבה להאחז בדוגמאות מהעבר כרפרנס למה שאנחנו מסוגלים להגיע אליו עכשיו. גבול היכולות שלנו רחוק בהרבה ממה שהכירנו.
          </p>
          <p className="hero-note">
            *בין השאר, אני מחפש מראה סופי לאתר הזה. אז גם העמוד הזה שאתן קוראות עכשיו מתעדכן, ועובר שינויים ושיפוצים על בסיס קבוע. בקיצור: שימו לב איפה שאתן דורכות כי בדיוק שטפתי פה.
          </p>
        </div>
        <div className="hero-scroll-hint">
          <span>↓</span>
          <span>גלילה</span>
        </div>
      </section>

      {/* ── HEADSHOT / PORTRAIT ── */}
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
          <img
            src="/media/portrait.jpg"
            alt="עמית ברין"
            loading="lazy"
          />
        </div>
      </section>

      {/* ── BOXING VIDEO ── */}
      <section className="boxing-section">
        <video autoPlay muted loop playsInline>
          <source src="/media/boxing.mp4" type="video/mp4" />
        </video>
        <div className="boxing-overlay" />
        <div className="boxing-content">
          <h2>לא החליפו אותי —<br/>התווספו אלי</h2>
          <p>עם כאלה כוחות חדשים, ועם כזה שטף פנטסטי של יצירה — מי רוצה לעצור בכלל?</p>
        </div>
      </section>

      {/* ── WORKSHOPS — PHOTO BACKGROUND ── */}
      <section className="workshops-section" id="workshops">
        <div className="workshops-overlay" />
        <div className="workshops-inner">
          <h2>בא לחדש לכם</h2>
          <p className="ws-sub">
            מגיע עד אליכם כדי להעשיר, ללמד ולתרגל עבודה עם כלים עדכניים, פרקטיקות מתקדמות, חשיבה עיצובית ויצירה עם בינה מלאכותית.
          </p>
          <div className="ws-grid">
            <div className="ws-card">
              <h3>✦ הרצאות העשרה ✦</h3>
              <p>אם זה בערב חברה או במפגש חברים, כשרוצים להעניק לקבוצה חוויה של דעת וטריוויה מפתיעה — אני מגיע עם סיפור עשיר ומסחרר, רחב יריעה וסוחף.</p>
            </div>
            <div className="ws-card">
              <h3>✦ הדרכות טכניות ✦</h3>
              <p>להתעדכן בגרסאות האחרונות של התוכנות שאתן כבר עובדות עליהן — הדרכת ריענון תקופתי שהיא חובה לכל סטודיו.</p>
            </div>
            <div className="ws-card">
              <h3>✦ סדנאות מעשיות ✦</h3>
              <p>מאגרים של כלים חדשים (כאלה שתאהבו!) לארגז הכלים; עבודה מבוססת חשיבה עיצובית ובינה יוצרת.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="newsletter-section">
        <div className="newsletter-inner">
          <h2>רוצים לדעת מהיכן הפרומפטים שלי?</h2>
          <p className="ns-desc">
            כדי לדעת מה ללחוש לבוטים, במיוחד ברגעים מאתגרים ומכריעים, אני מקפיד להתעדכן על בסיס יומי בהשקות ועדכונים של כלים, בלימודי טכניקות או פרומפטים מורכבים — כדי שאתם לא תצטרכו לעבור את תהליך ההסתגלות הסיזיפי הזה ותוכלו ליהנות ישר מהתובנות שריכזתי.
          </p>
          <p className="ns-cta">לשלוח גם לך עדכונים, מדריכים וטיפים ברגע שאני מסכם אותם?</p>
          <form className="nl-form" onSubmit={e => e.preventDefault()}>
            <input type="text" name="name" placeholder="איך לקרוא לך?" />
            <input type="email" name="email" placeholder="לאיזה מייל לשלוח?" />
            <button type="submit">תרשום אותי לעדכונים!</button>
          </form>
        </div>
      </section>

      {/* ── BLOG ── */}
      <section className="blog-section" id="blog">
        <p className="blog-label">מחשבות על עיצוב ועל חוויית שימוש</p>
        <article className="post-card">
          <h2>סליחה ששלחתי וואטסאפ</h2>
          <p>
            וואטסאפ היא אפליקציה תקשורת שמשבשת את התקשורת האנושית. לא פחות. היא גם משנה את ההתנהגות האישית שלנו לרעה. ממש ככה. רוב האנשים לא עסוקים בשאלה ״האם היא משרתת אותנו, או שאנחנו משרתים אותה?״
          </p>
          <a href="#" className="post-link">לפוסט המלא ←</a>
        </article>
      </section>

      <hr style={{ border: "none", borderTop: "1px solid #000", margin: "0 auto", maxWidth: 800 }} />

      {/* ── CONTACT ── */}
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

      <hr style={{ border: "none", borderTop: "2px solid #000", margin: "0 auto", maxWidth: 800 }} />

      {/* ── CLOSING ── */}
      <section className="closing-section">
        <h2>כנראה שהעמוד הזה יהיה בבנייה לנצח</h2>
        <h2>אבל ברצינות, תחשבו על זה רגע... להיות במצב הזה של הצורך להשתנות תמידית — זה משהו שאתם הייתם לוקחים על עצמכם?</h2>
        <h2>(כי אני חושב שפשוט חייבים. <a href="mailto:ahoovi@gmail.com">דברו איתי</a> אם אתם צריכים שינוי.)</h2>
        <h2>זהו, הגעת לתחתית.</h2>
      </section>

      {/* ── FOOTER ── */}
      <footer className="site-footer" id="footer">
        <h6>איפה בכל זאת אפשר להשיג אותי</h6>
        <ul className="footer-links">
          <li><a href="mailto:ahoovi@gmail.com">ahoovi@gmail.com</a></li>
          <li><a href="tel:0549407575">054-9407575</a></li>
          <li><a href="https://www.linkedin.com/in/amit-brin" target="_blank" rel="noopener">Amit Brin — LinkedIn</a></li>
          <li><a href="https://x.com/amit_brin" target="_blank" rel="noopener">amit_brin — X</a></li>
          <li><a href="https://www.facebook.com/amitbdesign" target="_blank" rel="noopener">Facebook</a></li>
          <li><a href="https://www.behance.net/amitbrin" target="_blank" rel="noopener">Behance</a></li>
        </ul>
      </footer>
    </>
  );
}
