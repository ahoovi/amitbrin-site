"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   AMIT BRIN — ONE-PAGER (Rich Media)
   Enhanced with CMYK Print Aesthetic + RTL Design System
   Typography: Leon family + Noto Sans Hebrew
═══════════════════════════════════════════════════════════════ */

const S = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@300;400;500;600;700&display=swap');

@font-face { font-family: 'Leon'; src: url('/fonts/Leon-Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'Leon'; src: url('/fonts/Leon-Bold.ttf') format('truetype'); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: 'Leon'; src: url('/fonts/Leon-Heavy.ttf') format('truetype'); font-weight: 800; font-style: normal; font-display: swap; }
@font-face { font-family: 'Leon'; src: url('/fonts/Leon-Thin.ttf') format('truetype'); font-weight: 200; font-style: normal; font-display: swap; }

:root {
  --logo: #1C2C7C;
  --navy: #051951;
  --gold: #CFBD85;
  --gold-light: #EADEB7;
  --dark-bg: #182027;
  --eff-grey: #282C34;
  --lightest: #E6E8EF;
  --grey3: #BABEC8;
  --grey6: #90929B;
  --grey8: #42434A;
  --cyan: #0DEFED;
  --purple: #4c44c4;
  --purple2: #212439;
  --black: #000000;
  --white: #ffffff;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Noto Sans Hebrew', 'Leon', Arial, sans-serif; color: var(--black); direction: rtl; overflow-x: hidden; }

/* ── NAV ── */
.site-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 999;
  background: rgba(0,0,0,0.15);
  backdrop-filter: blur(20px);
  padding: 0 2rem; height: 80px;
  display: flex; align-items: center; justify-content: space-between;
  transition: top .4s ease-in-out;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.site-nav.hidden { top: -100px; }
.site-nav a {
  color: rgba(255,255,255,.85); text-decoration: none;
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: 0.9rem; font-weight: 400;
  letter-spacing: 0.02em;
  transition: color .2s;
}
.site-nav a:hover { color: #fff; }
.nav-logo { font-family: 'Leon', sans-serif; font-weight: 800; font-size: 1.1rem; color: var(--gold) !important; letter-spacing: -.01em; }
.nav-links { display: flex; gap: 2.5rem; align-items: center; }
.nav-links a { font-size: .9rem; }
.nav-toggle { display: none; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; }

/* ── HERO CMYK SECTION (Print Aesthetic) ── */
.hero-cmyk-section {
  position: relative; width: 100%; height: 100vh; background: linear-gradient(135deg, #f0eff0 0%, #f5f4f5 100%);
  display: flex; align-items: center; justify-content: space-between;
  padding: 3rem; overflow: hidden;
}
.hero-cmyk-section::before, .hero-cmyk-section::after {
  content: '⊕'; position: absolute; font-size: 2rem; color: rgba(0,0,0,0.3);
}
.hero-cmyk-section::before { top: 2rem; right: 2rem; }
.hero-cmyk-section::after { bottom: 2rem; left: 2rem; }
.hero-cmyk-left {
  flex: 1; position: relative; height: 100%; display: flex; align-items: center; justify-content: center;
  max-width: 45%;
}
.hero-cmyk-portrait {
  position: relative; width: 100%; aspect-ratio: 1;
  filter: grayscale(100%);
}
.hero-cmyk-portrait img {
  position: absolute; width: 100%; height: 100%;
  object-fit: contain; top: 0; left: 0;
}
.hero-cmyk-portrait img:nth-child(2) {
  mix-blend-mode: multiply; transform: translate(3px, -2px);
  filter: hue-rotate(200deg) saturate(1.5);
}
.hero-cmyk-portrait img:nth-child(3) {
  mix-blend-mode: screen; transform: translate(-4px, 2px);
  filter: hue-rotate(60deg) saturate(1.5);
}
.hero-cmyk-portrait img:nth-child(4) {
  mix-blend-mode: lighten; transform: translate(2px, 3px);
  filter: hue-rotate(300deg) saturate(1.5);
}
.cmyk-color-bar {
  position: absolute; right: 0; top: 50%; transform: translateY(-50%);
  width: 12px; height: 30%; background: linear-gradient(180deg, #0DEFED 0%, #ff69b4 25%, #CFBD85 75%, #1C2C7C 100%);
}
.hero-cmyk-right {
  flex: 1; padding: 0 3rem; display: flex; flex-direction: column; justify-content: center;
}
.hero-cmyk-title {
  font-family: 'Leon', sans-serif; font-size: clamp(2.5rem, 5vw, 5.5rem); font-weight: 800;
  line-height: 95%; letter-spacing: 0.02px;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, #0DEFED 0%, #ff69b4 25%, #CFBD85 50%, #4c44c4 75%, #0DEFED 100%);
  background-size: 300% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 6s ease-in-out infinite;
}
@keyframes gradientShift {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}
.hero-cmyk-body {
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: 1em; font-weight: 400;
  line-height: 1.7; letter-spacing: 0.02em;
  color: #333; margin-bottom: 1.5rem; max-width: 90%;
}
.hero-cmyk-footnote {
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: 0.85em; font-weight: 400;
  line-height: 1.5; color: #666; margin-top: 2rem;
  padding-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.1);
}

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
  font-family: 'Leon', sans-serif;
  font-size: clamp(2.5rem, 5vw, 5.5rem); font-weight: 800;
  color: #fff; line-height: 95%; letter-spacing: 0.02px;
  margin-bottom: 1.2rem;
  text-shadow: 0 2px 20px rgba(0,0,0,.3);
}
.hero-content .hero-sub {
  font-family: 'Noto Sans Hebrew', sans-serif;
  font-size: clamp(0.9rem, 1.6vw, 2rem); font-weight: 400;
  color: rgba(255,255,255,.85);
  line-height: 130%; letter-spacing: 0.02em;
  max-width: 640px; margin-bottom: 1.5rem;
}
.hero-content .hero-note {
  font-family: 'Noto Sans Hebrew', sans-serif;
  font-size: clamp(0.8rem, 1.4vw, 1.6rem); font-weight: 400;
  color: rgba(255,255,255,.6);
  line-height: 1.6; letter-spacing: 0.02em;
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

/* ── HEADSHOT SECTION WITH ROTATING WORDS ── */
.headshot-section {
  max-width: 900px; margin: 0 auto;
  padding: 5rem 2rem;
  display: flex; gap: 2.5rem; align-items: flex-start;
}
.headshot-text { flex: 1; min-width: 260px; }
.headshot-text h2 {
  font-family: 'Leon', sans-serif;
  font-size: clamp(1.4rem, 2.2vw, 2.8rem); font-weight: 500;
  line-height: 120%; letter-spacing: 0.07vw;
  margin-bottom: .3rem;
}
.headshot-text .roles {
  font-family: 'Leon', sans-serif;
  font-size: clamp(1rem, 1.6vw, 2rem); font-weight: 500;
  line-height: 130%; letter-spacing: 0.03vw;
  color: #444; margin-bottom: 1.2rem;
}
.rotating-line {
  display: flex; align-items: baseline; gap: 0.3em; margin-bottom: 1rem;
}
.rotating-line .static-word {
  font-family: 'Leon', sans-serif;
  font-size: clamp(1rem, 1.6vw, 2rem); font-weight: 500;
  line-height: 130%; letter-spacing: 0.03vw;
}
.rotating-word {
  font-family: 'Leon', sans-serif;
  font-size: clamp(1rem, 1.6vw, 2rem); font-weight: 500;
  line-height: 130%; letter-spacing: 0.03vw;
  color: var(--gold); min-width: 180px;
  height: 1.3em; position: relative; display: inline-block;
  overflow: hidden;
}
.rotating-word span {
  position: absolute; right: 0; white-space: nowrap;
  opacity: 0; transition: none;
}
.rotating-word span.active { opacity: 1; }
.rotating-word span.anim-fade { animation: rFade 2.5s ease-in-out forwards; }
.rotating-word span.anim-slide { animation: rSlide 2.5s ease-in-out forwards; }
.rotating-word span.anim-clip { animation: rClip 2.5s ease-in-out forwards; }
.rotating-word span.anim-type { animation: rType 2.5s ease-in-out forwards; overflow: hidden; }
@keyframes rFade { 0% { opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; } }
@keyframes rSlide { 0% { opacity: 0; transform: translateY(100%); } 15% { opacity: 1; transform: translateY(0); } 85% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-100%); } }
@keyframes rClip { 0% { opacity: 1; clip-path: inset(0 100% 0 0); } 15% { clip-path: inset(0 0 0 0); } 85% { clip-path: inset(0 0 0 0); } 100% { opacity: 1; clip-path: inset(0 0 0 100%); } }
@keyframes rType { 0% { opacity: 1; width: 0; border-left: 2px solid var(--gold); } 15% { width: 100%; } 85% { width: 100%; opacity: 1; border-left: 2px solid var(--gold); } 100% { width: 100%; opacity: 0; border-left: none; } }
.for-whom {
  font-family: 'Noto Sans Hebrew', sans-serif;
  font-size: 1.2em; font-weight: 500;
  line-height: 1.6em; letter-spacing: 0.02em;
  color: #555;
}
.award-badges {
  display: flex; gap: 16px; margin-top: 20px; align-items: center;
}
.award-badges img {
  height: 60px; width: auto; opacity: 0.85;
  filter: grayscale(20%); transition: opacity 0.3s, filter 0.3s;
}
.award-badges img:hover { opacity: 1; filter: none; }
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
  font-family: 'Leon', sans-serif;
  font-size: clamp(0.9rem, 1.5vw, 1.6rem); font-weight: 400;
  line-height: 120%; letter-spacing: 0.4em; word-spacing: 1em;
  margin-bottom: 2rem; padding-bottom: .5rem;
  border-bottom: 1px solid var(--black);
}
.post-card { margin-bottom: 3rem; }
.post-card h2 {
  font-family: 'Leon', sans-serif;
  font-size: clamp(1.4rem, 2.2vw, 2.8rem); font-weight: 500;
  line-height: 120%; letter-spacing: 0.07vw;
  margin-bottom: .75rem;
}
.post-card p {
  font-family: 'Noto Sans Hebrew', sans-serif;
  font-size: 1em; font-weight: 400;
  line-height: 1.7; letter-spacing: 0.02em;
  color: #555; margin-bottom: 1rem;
}
.post-link {
  display: inline-block;
  font-family: 'Leon', sans-serif;
  font-size: clamp(1rem, 1.6vw, 2rem); font-weight: 500;
  line-height: 130%; letter-spacing: 0.03vw;
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
  font-family: 'Leon', sans-serif;
  font-size: clamp(1.4rem, 2.2vw, 2.8rem); font-weight: 500;
  line-height: 120%; letter-spacing: 0.07vw;
  margin-bottom: .5rem;
}
.newsletter-inner .ns-desc {
  font-family: 'Noto Sans Hebrew', sans-serif;
  font-size: 1em; font-weight: 400;
  line-height: 1.7; letter-spacing: 0.02em;
  color: rgba(255,255,255,.85); margin-bottom: 1.5rem;
}
.newsletter-inner .ns-cta {
  font-family: 'Noto Sans Hebrew', sans-serif;
  font-size: 1.2em; font-weight: 500;
  line-height: 1.6em; letter-spacing: 0.02em;
  color: rgba(255,255,255,.95); margin-bottom: 1.5rem;
}
.nl-form {
  display: flex; gap: .5rem; flex-wrap: wrap;
}
.nl-form input {
  flex: 1; min-width: 160px; padding: .8rem 1rem;
  border: none; border-radius: 6px;
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: 0.9rem;
  direction: rtl;
}
.nl-form button {
  background: var(--gold); color: var(--black);
  border: none; padding: .8rem 1.5rem; border-radius: 6px;
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: 0.9rem; font-weight: 600;
  cursor: pointer; transition: background .2s;
}
.nl-form button:hover { background: var(--gold-light); }

/* ── WORKSHOPS SECTION ── */
.workshops-section {
  max-width: 900px; margin: 0 auto;
  padding: 5rem 2rem;
}
.workshops-section h2 {
  font-family: 'Leon', sans-serif;
  font-size: clamp(1.4rem, 2.2vw, 2.8rem); font-weight: 500;
  line-height: 120%; letter-spacing: 0.07vw;
  margin-bottom: .5rem;
}
.workshops-section .ws-sub {
  font-family: 'Noto Sans Hebrew', sans-serif;
  font-size: 1em; font-weight: 400;
  line-height: 1.7; letter-spacing: 0.02em;
  color: #555; margin-bottom: 2.5rem; max-width: 600px;
}
.ws-item {
  padding: 1.5rem 0;
  border-top: 1px solid var(--black);
}
.ws-item:last-child { border-bottom: 1px solid var(--black); }
.ws-item h3 {
  font-family: 'Leon', sans-serif;
  font-size: clamp(1rem, 1.6vw, 2rem); font-weight: 500;
  line-height: 130%; letter-spacing: 0.03vw;
  margin-bottom: .5rem;
}
.ws-item p {
  font-family: 'Noto Sans Hebrew', sans-serif;
  font-size: 1em; font-weight: 400;
  line-height: 1.7; letter-spacing: 0.02em;
  color: #555;
}

/* ── CONTACT ── */
.contact-section {
  max-width: 800px; margin: 0 auto; padding: 3rem 2rem 5rem;
}
.contact-section h2 {
  font-family: 'Leon', sans-serif;
  font-size: clamp(1.4rem, 2.2vw, 2.8rem); font-weight: 500;
  line-height: 120%; letter-spacing: 0.07vw;
  margin-bottom: .5rem;
}
.contact-section .ct-note {
  font-family: 'Noto Sans Hebrew', sans-serif;
  font-size: 1em; font-weight: 400;
  line-height: 1.7; letter-spacing: 0.02em;
  font-style: italic; margin-bottom: 1.5rem; color: #666;
}
.ct-form { display: flex; flex-direction: column; gap: .75rem; }
.ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.ct-form input {
  width: 100%; padding: .75rem 1rem;
  border: 1px solid var(--black); border-radius: 0;
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: 0.9rem;
  direction: rtl; outline: none; transition: border-color .15s;
}
.ct-form input:focus { outline: 2px solid var(--black); }
.ct-submit {
  background: var(--black); color: #fff; border: none;
  padding: .85rem 2rem; font-family: 'Noto Sans Hebrew', sans-serif;
  font-size: 0.9rem; font-weight: 600; cursor: pointer;
  transition: opacity .15s; align-self: flex-start;
}
.ct-submit:hover { opacity: .75; }

/* ── CLOSING ── */
.closing-section {
  max-width: 800px; margin: 0 auto; padding: 2rem 2rem 3rem;
}
.closing-section h2 {
  font-family: 'Leon', sans-serif;
  font-size: clamp(1rem, 1.6vw, 2rem); font-weight: 500;
  line-height: 130%; letter-spacing: 0.03vw;
  margin-bottom: .8rem;
}
.closing-section a { color: var(--gold); font-weight: 600; text-decoration: underline; }

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
  font-family: 'Leon', sans-serif;
  font-size: clamp(0.9rem, 1.5vw, 1.6rem); font-weight: 400;
  line-height: 120%; letter-spacing: 0.4em; word-spacing: 1em;
  margin-bottom: 1rem;
}
.footer-links {
  list-style: none; display: flex; flex-wrap: wrap; gap: .4rem 1.5rem;
}
.footer-links a {
  color: rgba(255,255,255,.8); text-decoration: underline; font-size: .9rem;
  font-family: 'Noto Sans Hebrew', sans-serif;
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
    display: flex; position: absolute; top: 80px; right: 0; left: 0;
    background: rgba(0,0,0,.95); flex-direction: column;
    padding: 1.2rem 2rem; gap: 1rem;
  }
  .nav-toggle { display: block; }
  .hero-cmyk-section { flex-direction: column; padding: 2rem; min-height: auto; }
  .hero-cmyk-left { max-width: 100%; height: 300px; margin-bottom: 2rem; }
  .hero-cmyk-right { padding: 0; }
  .hero-cmyk-title { font-size: clamp(1.8rem, 4vw, 2.5rem); }
  .hero-cmyk-body { font-size: 0.95em; max-width: 100%; }
  .cmyk-color-bar { display: none; }
  .headshot-section { flex-direction: column-reverse; padding: 3rem 1.5rem; }
  .headshot-img { width: 140px; }
  .rotating-line { flex-direction: column; }
  .rotating-word { min-width: auto; }
  .ct-row { grid-template-columns: 1fr; }
}
`;

const rotatingWords = ['מותגים', 'חוויות', 'קונספטים', 'מוצרים', 'מערכות', 'אסטרטגיות'];

export default function SitePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current + 50) {
        setNavHidden(true);
      } else if (currentScrollY < lastScrollY.current - 50) {
        setNavHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: S }} />

      {/* ── NAV ── */}
      <nav className={`site-nav${navHidden ? ' hidden' : ''}`}>
        <a href="/" className="nav-logo">עמדית</a>
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
        <div className={`nav-links${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)}>
          <a href="#about">מי אני</a>
          <a href="#blog">בלוג</a>
          <a href="#workshops">הרצאות</a>
          <a href="#contact">דברו איתי</a>
        </div>
      </nav>

      {/* ── SEC0: HERO CMYK — PRINT AESTHETIC ── */}
      <section className="hero-cmyk-section">
        <div className="hero-cmyk-left">
          <div className="hero-cmyk-portrait">
            <img src="/media/headshot.png" alt="עמית ברין" />
            <img src="/media/headshot.png" alt="" />
            <img src="/media/headshot.png" alt="" />
            <img src="/media/headshot.png" alt="" />
          </div>
          <div className="cmyk-color-bar" />
        </div>
        <div className="hero-cmyk-right">
          <h1 className="hero-cmyk-title">הדפוס מחייה את הדיגיטל</h1>
          <p className="hero-cmyk-body">
            לאנשים שנוהגים להספיד את הפרינט אני אומר: חכו, כי הפרינט עוד לא התחיל! כל זמן שאי אפשר להרגיש (ממש להרגיש בידיים, לא רק בעיניים) את מה שאתם רואים – החוויה לא תהיה שלמה. כי אפשר לקחת את המוצרים ואת המסרים שלכם למקומות פיזיים של תחושה ורגש, עם פתרונות בהפקות דפוס והשבחות מתקדמות, שמפתיעות ומניעות את כל מי שיגע בהן.
          </p>
          <p className="hero-cmyk-footnote">
            *בין השאר אני מחפש מראה סופי לאתר הזה. אז העמוד הזה שאתה קוראים עכשיו מתעדכן עוברי שינויים ושיפוצים על בסיס קבוע. במשך האתר תמצאו גם כמה דברים אקספרימנטליים שאני עדיין בוחן... בקיצור, שימו לב איפה שאתם דורכים כי בדיוק שטפתי פה...
          </p>
        </div>
      </section>

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

      {/* ── SEC2: HEADSHOT / PORTRAIT WITH ROTATING WORDS ── */}
      <section className="headshot-section" id="about">
        <div className="headshot-text">
          <h2>עמית ברין</h2>
          <p className="roles">מעצב, מרצה, מנטור, מעורר השראה</p>
          <div className="rotating-line">
            <span className="static-word">מעצב</span>
            <div className="rotating-word">
              {rotatingWords.map((word, idx) => {
                const animStyles = ['anim-fade', 'anim-slide', 'anim-clip', 'anim-type'];
                const isActive = idx === rotatingIndex;
                const cls = isActive ? `active ${animStyles[rotatingIndex % 4]}` : '';
                return (
                  <span key={`${idx}-${rotatingIndex}`} className={cls}>
                    {word}
                  </span>
                );
              })}
            </div>
          </div>
          <p className="for-whom">למותגים המובילים בארץ ובעולם<br/>ולאנשים שמחפשים שינוי אמיתי</p>
          <div className="award-badges">
            <img src="/media/echo_v_200.png" alt="פרס Echo" />
          </div>
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
