"use client";
import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   AMIT BRIN — HOMEPAGE
   Modern sectioned landing page • RTL • Navy/Gold palette
═══════════════════════════════════════════════════════════════ */

const S = `
@import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500&display=swap');

:root {
  --navy: #1a2744;
  --navy-d: #111b30;
  --navy-l: #243356;
  --gold: #c9973a;
  --gold-l: #e8b95a;
  --gold-xl: #f5d68a;
  --blue: #1570EF;
  --bg: #f8f9fc;
  --surface: #ffffff;
  --text: #1a1a1a;
  --muted: #6b7280;
  --border: #e5e9f0;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Rubik', system-ui, sans-serif; color: var(--text); direction: rtl; }

/* ── NAV ─────────────────────────────── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(26,39,68,.92); backdrop-filter: blur(12px);
  padding: 0 2rem; height: 60px;
  display: flex; align-items: center; justify-content: space-between;
  transition: transform .35s;
}
.nav.hidden { transform: translateY(-100%); }
.nav-logo {
  font-size: 1.15rem; font-weight: 700; color: var(--gold);
  text-decoration: none; letter-spacing: -.01em;
  display: flex; align-items: center; gap: .5rem;
}
.nav-links { display: flex; gap: 1.8rem; align-items: center; }
.nav-links a {
  color: #b0bdd4; font-size: .88rem; text-decoration: none;
  transition: color .2s; font-weight: 400;
}
.nav-links a:hover { color: #fff; }
.nav-cta {
  background: var(--gold); color: var(--navy); padding: .5rem 1.2rem;
  border-radius: 8px; font-weight: 600; font-size: .85rem;
  text-decoration: none; transition: all .2s;
}
.nav-cta:hover { background: var(--gold-l); transform: translateY(-1px); }

/* ── HERO ─────────────────────────────── */
.hero {
  min-height: 100vh;
  background: linear-gradient(165deg, var(--navy) 0%, var(--navy-d) 55%, #0f1623 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 6rem 2rem 4rem;
  position: relative; overflow: hidden;
}
.hero::before {
  content: ''; position: absolute; top: -30%; right: -20%;
  width: 700px; height: 700px;
  background: radial-gradient(circle, rgba(21,112,239,.12) 0%, transparent 70%);
  pointer-events: none;
}
.hero::after {
  content: ''; position: absolute; bottom: -20%; left: -10%;
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(201,151,58,.08) 0%, transparent 70%);
  pointer-events: none;
}
.hero-inner { max-width: 820px; position: relative; z-index: 1; }
.hero-tag {
  display: inline-block;
  background: rgba(201,151,58,.12); color: var(--gold-l);
  padding: .4rem 1rem; border-radius: 99px;
  font-size: .82rem; font-weight: 500;
  margin-bottom: 1.5rem; letter-spacing: .02em;
}
.hero h1 {
  font-size: clamp(2.2rem, 5vw, 3.4rem); font-weight: 800;
  color: #fff; line-height: 1.18; margin-bottom: 1rem;
  letter-spacing: -.03em;
}
.hero h1 em { font-style: normal; color: var(--gold); }
.hero-sub {
  font-size: clamp(1rem, 2.2vw, 1.2rem); color: #8fa3c4;
  line-height: 1.75; max-width: 640px; margin-bottom: 2.2rem;
}
.hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; }
.btn-primary {
  background: var(--gold); color: var(--navy); padding: .85rem 2rem;
  border-radius: 12px; font-family: inherit; font-size: 1rem; font-weight: 700;
  border: none; cursor: pointer; transition: all .2s; text-decoration: none;
  display: inline-flex; align-items: center; gap: .5rem;
}
.btn-primary:hover { background: var(--gold-l); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(201,151,58,.25); }
.btn-outline {
  background: transparent; color: #b0bdd4; padding: .85rem 2rem;
  border-radius: 12px; font-family: inherit; font-size: 1rem; font-weight: 500;
  border: 1.5px solid rgba(255,255,255,.15); cursor: pointer; transition: all .2s; text-decoration: none;
  display: inline-flex; align-items: center; gap: .5rem;
}
.btn-outline:hover { border-color: var(--gold); color: var(--gold); }

/* ── SECTION SHARED ────────────────── */
.section {
  padding: 5rem 2rem;
  max-width: 1100px; margin: 0 auto;
}
.section-dark {
  background: var(--navy);
  padding: 5rem 2rem;
}
.section-dark .sec-inner { max-width: 1100px; margin: 0 auto; }
.section-alt { background: var(--bg); }
.sec-label {
  display: inline-block;
  font-size: .72rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .12em; color: var(--gold);
  margin-bottom: .6rem;
}
.sec-title {
  font-size: clamp(1.6rem, 3.5vw, 2.2rem); font-weight: 700;
  color: var(--navy); line-height: 1.25; margin-bottom: .6rem;
  letter-spacing: -.02em;
}
.sec-sub {
  font-size: .95rem; color: var(--muted); max-width: 600px;
  line-height: 1.7; margin-bottom: 2.5rem;
}
.section-dark .sec-title { color: #fff; }
.section-dark .sec-sub { color: #8fa3c4; }

/* ── SERVICES GRID ─────────────────── */
.srv-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.2rem;
}
.srv-card {
  background: var(--surface); border-radius: 16px; padding: 1.6rem;
  border: 1px solid var(--border);
  transition: all .25s; position: relative; overflow: hidden;
}
.srv-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(21,112,239,.08); border-color: var(--gold); }
.srv-icon {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; margin-bottom: 1rem;
}
.srv-card h3 { font-size: 1.05rem; font-weight: 700; color: var(--navy); margin-bottom: .4rem; }
.srv-card p { font-size: .87rem; color: var(--muted); line-height: 1.65; }

/* ── ABOUT / LETTER ────────────────── */
.about-wrap {
  display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start;
}
.about-letter {
  font-size: .95rem; line-height: 1.85; color: var(--text);
}
.about-letter p { margin-bottom: 1rem; }
.about-letter strong { color: var(--navy); }
.about-aside {
  background: linear-gradient(135deg, var(--navy), var(--navy-l));
  border-radius: 20px; padding: 2rem; color: #fff;
}
.stat-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem;
  margin-bottom: 1.5rem;
}
.stat-box { text-align: center; }
.stat-num { font-size: 2rem; font-weight: 800; color: var(--gold); }
.stat-lbl { font-size: .78rem; color: #8fa3c4; margin-top: .1rem; }
.about-aside h4 {
  font-size: .95rem; font-weight: 600; margin-bottom: .8rem; color: var(--gold-l);
}
.tool-tags { display: flex; flex-wrap: wrap; gap: .45rem; }
.tool-tag {
  background: rgba(255,255,255,.08); color: #b0bdd4;
  padding: .3rem .7rem; border-radius: 8px; font-size: .78rem;
  border: 1px solid rgba(255,255,255,.06);
}

/* ── WORKSHOPS ─────────────────────── */
.ws-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.2rem;
}
.ws-card {
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  border-radius: 16px; padding: 1.8rem;
  transition: all .25s;
}
.ws-card:hover { background: rgba(255,255,255,.1); border-color: var(--gold); transform: translateY(-3px); }
.ws-emoji { font-size: 2rem; margin-bottom: .8rem; }
.ws-card h3 { font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: .4rem; }
.ws-card p { font-size: .87rem; color: #8fa3c4; line-height: 1.65; }
.ws-tag {
  display: inline-block; margin-top: .8rem;
  background: rgba(201,151,58,.15); color: var(--gold-l);
  padding: .25rem .65rem; border-radius: 6px; font-size: .75rem; font-weight: 500;
}

/* ── CONTACT ───────────────────────── */
.contact-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start;
}
.contact-info h3 { font-size: 1.3rem; font-weight: 700; color: var(--navy); margin-bottom: .8rem; }
.contact-info p { font-size: .92rem; color: var(--muted); line-height: 1.7; margin-bottom: 1.5rem; }
.contact-item {
  display: flex; align-items: center; gap: .8rem;
  margin-bottom: 1rem; font-size: .93rem;
}
.contact-item .ci-icon {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; flex-shrink: 0;
}
.contact-item a { color: var(--navy); text-decoration: none; font-weight: 500; transition: color .2s; }
.contact-item a:hover { color: var(--blue); }

.cform { display: flex; flex-direction: column; gap: .9rem; }
.cform label { font-size: .82rem; font-weight: 600; color: var(--navy); }
.cform input, .cform textarea {
  width: 100%; padding: .8rem 1rem;
  border: 1.5px solid var(--border); border-radius: 12px;
  font-family: inherit; font-size: .91rem; outline: none;
  direction: rtl; transition: border-color .2s; background: var(--surface);
}
.cform input:focus, .cform textarea:focus { border-color: var(--blue); }
.cform textarea { min-height: 120px; resize: vertical; }
.cform-row { display: grid; grid-template-columns: 1fr 1fr; gap: .9rem; }
.form-submit {
  background: var(--navy); color: #fff; border: none; padding: .9rem;
  border-radius: 12px; font-family: inherit; font-size: .95rem;
  font-weight: 600; cursor: pointer; transition: all .2s;
}
.form-submit:hover { background: var(--navy-l); }
.form-submit:disabled { opacity: .5; cursor: not-allowed; }

/* ── FOOTER ────────────────────────── */
.footer {
  background: var(--navy-d); padding: 2.5rem 2rem;
  text-align: center; border-top: 1px solid rgba(255,255,255,.06);
}
.footer p { color: #5a6e8f; font-size: .82rem; }
.footer a { color: var(--gold); text-decoration: none; }
.footer a:hover { text-decoration: underline; }
.footer-links { display: flex; justify-content: center; gap: 1.5rem; margin-bottom: 1rem; }

/* ── MOBILE ────────────────────────── */
.nav-toggle { display: none; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; }
@media (max-width: 768px) {
  .nav-links { display: none; }
  .nav-links.open { display: flex; position: absolute; top: 60px; right: 0; left: 0; background: var(--navy-d); flex-direction: column; padding: 1.2rem 2rem; gap: 1rem; }
  .nav-toggle { display: block; }
  .hero { padding: 5rem 1.5rem 3rem; }
  .about-wrap, .contact-grid { grid-template-columns: 1fr; }
  .srv-grid, .ws-cards { grid-template-columns: 1fr; }
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .cform-row { grid-template-columns: 1fr; }
  .hero-btns { flex-direction: column; }
  .btn-primary, .btn-outline { justify-content: center; }
}
`;

/* ═══════ SERVICES DATA ═══════ */
const SERVICES = [
  {
    icon: "🎤", bg: "linear-gradient(135deg, #fef3c7, #fde68a)",
    title: "הדרכות AI וחשיבה עיצובית",
    desc: "סדנאות מקצועיות לצוותים ולארגונים — מבוא ועד יישום מתקדם של בינה מלאכותית יוצרת בתהליכי עבודה יצירתיים."
  },
  {
    icon: "🖋️", bg: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
    title: "עיצוב גרפי ומיתוג",
    desc: "מיתוג, שיווק, אריזה והפקות דפוס מורכבות — משלב האסטרטגיה והקונספט ועד ליצירה והגשמה."
  },
  {
    icon: "🫵", bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    title: "מנטורינג",
    desc: "ליווי אישי למעצבים ויזמים מתחילים — מבניית תיק עבודות ועד מציאת הקול המקצועי הייחודי."
  },
  {
    icon: "🎓", bg: "linear-gradient(135deg, #fce7f3, #fbcfe8)",
    title: "הוראה אקדמית",
    desc: "מרצה ומורה לעיצוב גרפי, UX/UI ובינה מלאכותית — עשר שנות ניסיון, מאות בוגרים מוכשרים."
  },
];

/* ═══════ WORKSHOPS DATA ═══════ */
const WORKSHOPS = [
  {
    emoji: "🤖",
    title: "סדנת AI למעצבים",
    desc: "4 מפגשים × 3 שעות — מבוא מעשי לכלי בינה מלאכותית יוצרת, מותאם למעצבים עם רקע בסיסי. מ-Runway ו-Sora ועד Claude ו-ChatGPT.",
    tag: "קורפורטיב / קבוצות"
  },
  {
    emoji: "💡",
    title: "חשיבה עיצובית לארגונים",
    desc: "Design Thinking כמנוע חדשנות — הרצאות וסדנאות מעשיות לצוותים עסקיים שרוצים לשלב חשיבה יצירתית בתהליכי עבודה.",
    tag: "חברות / סטודיואים"
  },
  {
    emoji: "🎯",
    title: "הסמכת AI Workflows",
    desc: "הטמעת תהליכי עבודה משולבי בינה מלאכותית — מבחינת כלים, ניסוי וקבלת החלטות, ועד תזרים עבודה שלם.",
    tag: "מתקדמים"
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setFormStatus("sending");
    // For now, open mailto as fallback
    const subject = encodeURIComponent(`פנייה מהאתר — ${formData.name}`);
    const body = encodeURIComponent(`שם: ${formData.name}\nאימייל: ${formData.email}\n\n${formData.message}`);
    window.open(`mailto:ahoovi@gmail.com?subject=${subject}&body=${body}`);
    setFormStatus("sent");
    setTimeout(() => setFormStatus("idle"), 4000);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: S }} />

      {/* ── NAV ── */}
      <nav className="nav">
        <a href="#" className="nav-logo">עמית ברין</a>
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
        <div className={`nav-links${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)}>
          <a href="#services">שירותים</a>
          <a href="#about">מי אני</a>
          <a href="#workshops">סדנאות</a>
          <a href="#contact" className="nav-cta">דברו איתי</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero" id="top">
        <div className="hero-inner">
          <span className="hero-tag">עיצוב · מיתוג · שיווק · הדרכה · AI</span>
          <h1>
            עיצוב שמגיע עם<br />
            <em>23 שנות ניסיון</em><br />
            ומבט קדימה
          </h1>
          <p className="hero-sub">
            מעצב תקשורת חזותית, מומחה UX/AI, מרצה ומנטור —
            עוזר לעסקים, ארגונים ומעצבים לצמוח דרך עיצוב חכם, חשיבה עיצובית וכלי בינה מלאכותית.
          </p>
          <div className="hero-btns">
            <a href="#contact" className="btn-primary">בואו נדבר ←</a>
            <a href="#about" className="btn-outline">קצת עלי</a>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="section section-alt" id="services">
        <span className="sec-label">שירותים</span>
        <h2 className="sec-title">איך אני יכול לעזור לך?</h2>
        <p className="sec-sub">
          מרעיון ועד הגשמה — עיצוב, מיתוג, הדרכה ומנטורינג, עם שילוב של כלי AI מתקדמים.
        </p>
        <div className="srv-grid">
          {SERVICES.map((s, i) => (
            <div key={i} className="srv-card">
              <div className="srv-icon" style={{ background: s.bg }}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="section" id="about">
        <span className="sec-label">מי אני</span>
        <h2 className="sec-title">שלום, אני עמית 👋🏼</h2>
        <p className="sec-sub">מעצב, מרצה, מנטור — ואדם שממש לא יכול להפסיק ללמוד דברים חדשים.</p>
        <div className="about-wrap">
          <div className="about-letter">
            <p>
              קוראים לי עמית ברין, וכבר 23 שנים שאני עושה כל מה שקשור בעיצוב גרפי בצורה מסחרית.
              במהלך השנים צברתי פרסים מקומיים ובינלאומיים על הישגים תקדימיים בעולמות השיווק, הפרסום והמיתוג,
              על עבודות עבור המותגים המובילים בעולם <strong>(וגם בארץ 🇮🇱!)</strong>.
            </p>
            <p>
              אבל אפילו מעבר לפרסים — זכיתי לעבוד עם עשרות עסקים קטנים, לעזור להם להגשים חלומות —
              משלב היזמות ועד לשלב שבו המותג שיצרתי עבורם מבוסס, פעיל ומצליח.
            </p>
            <p>
              בשנתיים האחרונות אני מוסיף לארגז הכלים שלי כלי בינה מלאכותית יוצרת כמעט מדי יום.
              הסקרנות, הרצון לעזור והדחף להתפתח — אלה הם כלי העבודה האמיתיים שלי.
            </p>
            <p>
              כבר עשר שנים אני גם מורה לעיצוב, עם מאות בוגרות ובוגרים מוכשרים שיעידו על השינוי הגדול
              שעזרתי להם לבצע. על סמך הניסיון הזה, אני מעביר גם הרצאות, הדרכות והסמכות בנושאי
              חשיבה עיצובית, כלי עיצוב ובינה מלאכותית — לחברות ולארגונים.
            </p>
          </div>
          <div className="about-aside">
            <div className="stat-grid">
              <div className="stat-box">
                <div className="stat-num">23+</div>
                <div className="stat-lbl">שנות ניסיון</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">10+</div>
                <div className="stat-lbl">שנות הוראה</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">100+</div>
                <div className="stat-lbl">מותגים</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">500+</div>
                <div className="stat-lbl">בוגרים</div>
              </div>
            </div>
            <h4>כלים ותחומים</h4>
            <div className="tool-tags">
              {["מיתוג","שיווק","UX/UI","Generative AI","דפוס","אריזה","Design Thinking",
                "Claude","Runway","Sora","Figma","Photoshop","InDesign","Illustrator"
              ].map((t,i) => <span key={i} className="tool-tag">{t}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* ── WORKSHOPS ── */}
      <section className="section-dark" id="workshops">
        <div className="sec-inner">
          <span className="sec-label">סדנאות והדרכות</span>
          <h2 className="sec-title">ידע שהופך למעשי</h2>
          <p className="sec-sub">
            סדנאות מעשיות לצוותים ולארגונים — שילוב של חשיבה עיצובית עם כלי AI מתקדמים.
          </p>
          <div className="ws-cards">
            {WORKSHOPS.map((w, i) => (
              <div key={i} className="ws-card">
                <div className="ws-emoji">{w.emoji}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
                <span className="ws-tag">{w.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="section" id="contact">
        <span className="sec-label">צור קשר</span>
        <h2 className="sec-title">בואו נדבר</h2>
        <p className="sec-sub">יש לכם פרויקט, רעיון, או צורך — אני אשמח לשמוע.</p>
        <div className="contact-grid">
          <div className="contact-info">
            <h3>דרכים ליצירת קשר</h3>
            <p>
              תבחרו מה שנוח לכם — מייל מפורט, הודעת וואטסאפ קצרה, או פשוט מלאו את הטופס.
            </p>
            <div className="contact-item">
              <div className="ci-icon" style={{ background: "#ecfdf5" }}>✉️</div>
              <a href="mailto:ahoovi@gmail.com">ahoovi@gmail.com</a>
            </div>
            <div className="contact-item">
              <div className="ci-icon" style={{ background: "#f0fdf4" }}>💬</div>
              <a href="https://wa.me/972549407575" target="_blank" rel="noopener">WhatsApp — 054-9407575</a>
            </div>
            <div className="contact-item">
              <div className="ci-icon" style={{ background: "#eff6ff" }}>💼</div>
              <a href="https://www.behance.net/amitbrin" target="_blank" rel="noopener">ארכיון עבודות — Behance</a>
            </div>
          </div>
          <form className="cform" onSubmit={handleSubmit}>
            <div className="cform-row">
              <div>
                <label>שם</label>
                <input type="text" placeholder="איך קוראים לך?" value={formData.name}
                  onChange={e => setFormData(d => ({...d, name: e.target.value}))} />
              </div>
              <div>
                <label>אימייל</label>
                <input type="email" placeholder="your@email.com" dir="ltr" value={formData.email}
                  onChange={e => setFormData(d => ({...d, email: e.target.value}))} />
              </div>
            </div>
            <div>
              <label>מה בראש?</label>
              <textarea placeholder="ספרו לי על הפרויקט, הצורך או הרעיון..." value={formData.message}
                onChange={e => setFormData(d => ({...d, message: e.target.value}))} />
            </div>
            <button type="submit" className="form-submit" disabled={formStatus === "sending"}>
              {formStatus === "sent" ? "✓ נשלח!" : formStatus === "sending" ? "שולח..." : "שליחה ←"}
            </button>
          </form>
        </div>
      </section>

      {/* ── PIZZA ── */}
      <section className="section section-alt" style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <p style={{ fontSize: ".95rem", color: "var(--muted)", maxWidth: 550, margin: "0 auto", lineHeight: 1.8 }}>
          ואם כבר הגעת עד לאזור הכיפי שפה למטה — בשעות הפנאי אני נהנה לקרוא,
          לנגן רק על דברים עם 4 מיתרים, להתעמל (בלי מיתרים),
          ולהשתכלל באפייה ובאכילה של פיצה נאפוליטנית 🍕
        </p>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-links">
          <a href="mailto:ahoovi@gmail.com">✉️ מייל</a>
          <a href="https://wa.me/972549407575" target="_blank" rel="noopener">💬 וואטסאפ</a>
          <a href="https://www.behance.net/amitbrin" target="_blank" rel="noopener">💼 Behance</a>
        </div>
        <p>© {new Date().getFullYear()} עמית ברין — עיצוב, מיתוג, שיווק, הדרכה</p>
      </footer>
    </>
  );
}
