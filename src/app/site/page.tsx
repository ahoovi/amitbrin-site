"use client";
import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   AMIT BRIN — ONE-PAGER
   Layout: 12-col grid · Figma reference · RTL
   Typography: Leon Heavy (primary) + Noto Sans Hebrew Medium
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
  --grid-max: 1200px;
  --grid-gap: 24px;
  --grid-pad: clamp(1.5rem, 4vw, 3rem);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Noto Sans Hebrew', 'Leon', Arial, sans-serif; color: var(--black); direction: rtl; overflow-x: hidden; }

/* ── 12-COL GRID UTILITY ── */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gap);
  max-width: var(--grid-max);
  margin: 0 auto;
  padding: 0 var(--grid-pad);
  width: 100%;
}

/* ── NAV ── */
.site-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 999;
  background: rgba(0,0,0,0.15);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  padding: 0 var(--grid-pad); height: 80px;
  display: flex; align-items: center; justify-content: space-between;
  transition: top .4s ease-in-out;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.site-nav.hidden { top: -100px; }
.site-nav a {
  color: rgba(255,255,255,.85); text-decoration: none;
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: 0.9rem; font-weight: 500;
  letter-spacing: 0.02em; transition: color .2s;
}
.site-nav a:hover { color: #fff; }
.nav-logo { font-family: 'Leon', sans-serif; font-weight: 800; font-size: 1.1rem; color: var(--gold) !important; letter-spacing: -.01em; }
.nav-links { display: flex; gap: 2.5rem; align-items: center; }
.nav-toggle { display: none; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; }

/* ═══════════════════════════════════════════
   SEC 0: HERO — CMYK PRINT AESTHETIC (90vh)
   Paper sheet sits on transparent bg,
   so the sky of the sailing section peeks below.
═══════════════════════════════════════════ */
.hero-wrapper {
  position: relative;
  width: 100%; height: 100vh;
  background: transparent;
  overflow: visible;
}
.hero-paper {
  position: relative;
  width: 100%; height: 90vh;
  background: url('/media/paper-texture.jpg') center/cover;
  overflow: hidden;
}
/* registration marks */
.hero-paper::before, .hero-paper::after {
  content: '⊕'; position: absolute; font-size: 1.6rem; color: rgba(0,0,0,0.25); z-index: 5; pointer-events: none;
}
.hero-paper::before { top: 1.5rem; right: 1.5rem; }
.hero-paper::after { bottom: 1.5rem; left: 1.5rem; }
.reg-mark-bl, .reg-mark-tr {
  position: absolute; font-size: 1.6rem; color: rgba(0,0,0,0.25); z-index: 5; pointer-events: none;
}
.reg-mark-bl { bottom: 1.5rem; right: 1.5rem; }
.reg-mark-tr { top: 1.5rem; left: 1.5rem; }

.hero-inner {
  height: 100%;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gap);
  max-width: var(--grid-max);
  margin: 0 auto;
  padding: 0 var(--grid-pad);
  align-items: center;
}

/* Unicorn Studio 3D portrait — left 6 cols */
.hero-portrait-col {
  grid-column: 7 / 13;
  position: relative;
  height: 75vh;
  display: flex; align-items: center; justify-content: center;
}
.unicorn-embed {
  width: 100%; height: 100%;
  position: relative;
}
.unicorn-embed canvas {
  width: 100% !important; height: 100% !important;
}

/* Hero text — right 5 cols (RTL = visually right) */
.hero-text-col {
  grid-column: 1 / 7;
  padding-left: 1rem;
  z-index: 5;
}
.hero-title {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(2.8rem, 5.5vw, 6rem);
  line-height: 92%; letter-spacing: 0.02px;
  margin-bottom: 1.8rem;
  background: linear-gradient(90deg, #0DEFED 0%, #ff69b4 25%, #CFBD85 50%, #4c44c4 75%, #0DEFED 100%);
  background-size: 300% 100%;
  background-clip: text; -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 6s ease-in-out infinite;
}
@keyframes gradientShift {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}
.hero-body {
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: clamp(0.85rem, 1vw, 1.05rem); font-weight: 400;
  line-height: 1.75; letter-spacing: 0.01em;
  color: #444; max-width: 95%;
}
.hero-subtitle {
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: 0.8rem; font-weight: 500;
  letter-spacing: 0.25em; text-transform: uppercase; color: var(--grey6);
  margin-bottom: 0.6rem;
}

/* ═══════════════════════════════════════════
   SEC 1: SAILING VIDEO (100vh)
   Text positioned on grid, NOT centered
═══════════════════════════════════════════ */
.sailing-section {
  position: relative; width: 100%; height: 100vh; overflow: hidden;
}
.sailing-section video {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;
}
.sailing-overlay {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.4) 50%, rgba(0,0,0,.65) 100%);
}
.sailing-content {
  position: relative; z-index: 2;
  height: 100%;
  display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--grid-gap);
  max-width: var(--grid-max); margin: 0 auto; padding: 0 var(--grid-pad);
  align-items: center;
}
.sailing-text {
  grid-column: 1 / 7;
  text-align: right;
}
.sailing-text h1 {
  font-family: 'Leon', sans-serif;
  font-size: clamp(2.2rem, 4.5vw, 5rem); font-weight: 800;
  color: #fff; line-height: 95%; letter-spacing: 0.02px;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 30px rgba(0,0,0,.35);
}
.sailing-text .sail-sub {
  font-family: 'Noto Sans Hebrew', sans-serif;
  font-size: clamp(0.85rem, 1.2vw, 1.15rem); font-weight: 400;
  color: rgba(255,255,255,.85); line-height: 1.7; letter-spacing: 0.02em;
  max-width: 540px;
}
.sailing-text .sail-note {
  font-family: 'Noto Sans Hebrew', sans-serif;
  font-size: clamp(0.75rem, 0.9vw, 0.9rem); font-weight: 400;
  color: rgba(255,255,255,.5); line-height: 1.6; letter-spacing: 0.02em;
  margin-top: 1.5rem; padding-top: 1rem;
  border-right: 3px solid var(--gold); padding-right: 1rem;
  max-width: 500px;
}

/* ═══════════════════════════════════════════
   SEC 2: PORTRAIT — מעצב שינוי (100vh)
   BG: client logo wall pattern + blue gradient overlay (3 layers)
═══════════════════════════════════════════ */
.portrait-section {
  position: relative; width: 100%; min-height: 100vh; overflow: hidden;
  display: flex; align-items: center;
}
/* Layer 1: repeating client logos pattern */
.portrait-bg-pattern {
  position: absolute; inset: 0; z-index: 0;
  background: url('/media/client-logo-wall.jpg') center/600px repeat;
  opacity: 0.08;
}
/* Layer 2: blue gradient overlay */
.portrait-bg-gradient {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(160deg, var(--navy) 0%, #0a2d6e 40%, #0d3578 100%);
  opacity: 0.92;
}
/* Layer 3: subtle radial glow */
.portrait-bg-glow {
  position: absolute; inset: 0; z-index: 2;
  background: radial-gradient(ellipse at 30% 50%, rgba(207,189,133,0.08) 0%, transparent 60%);
}

.portrait-inner {
  position: relative; z-index: 3;
  display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--grid-gap);
  max-width: var(--grid-max); margin: 0 auto; padding: 5rem var(--grid-pad);
  width: 100%; align-items: center;
}
.portrait-img-col {
  grid-column: 7 / 13;
}
.portrait-img-col img {
  width: 100%; max-width: 400px; display: block;
  filter: grayscale(10%); border-radius: 4px;
}
.portrait-text-col {
  grid-column: 1 / 7;
  color: #fff;
}
.portrait-text-col h2 {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(1.2rem, 1.8vw, 1.8rem);
  line-height: 130%; letter-spacing: 0.04vw;
  color: var(--gold-light); margin-bottom: 0.3rem;
}
.portrait-text-col .big-role {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(2.5rem, 5vw, 5.5rem);
  line-height: 95%; letter-spacing: 0.02px;
  margin-bottom: 0.5rem;
}
.portrait-text-col .roles-line {
  font-family: 'Noto Sans Hebrew', sans-serif; font-weight: 500;
  font-size: clamp(0.9rem, 1.1vw, 1.15rem);
  color: rgba(255,255,255,.7); margin-bottom: 1rem;
}
.rotating-line {
  display: flex; align-items: baseline; gap: 0.3em; margin-bottom: 1.2rem;
}
.rotating-line .static-word {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(2.5rem, 5vw, 5.5rem);
  line-height: 95%; color: #fff;
}
.rotating-word {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(2.5rem, 5vw, 5.5rem);
  line-height: 95%; color: var(--gold);
  min-width: 280px; height: 1.1em;
  position: relative; display: inline-block; overflow: hidden;
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
.portrait-text-col .for-whom {
  font-family: 'Noto Sans Hebrew', sans-serif; font-weight: 500;
  font-size: clamp(0.95rem, 1.15vw, 1.2rem);
  line-height: 1.6; color: rgba(255,255,255,.7);
}
.award-badges {
  display: flex; gap: 16px; margin-top: 24px; align-items: center;
}
.award-badges img {
  height: 55px; width: auto; opacity: 0.8;
  filter: brightness(1.8) grayscale(30%);
  transition: opacity 0.3s, filter 0.3s;
}
.award-badges img:hover { opacity: 1; filter: brightness(2) grayscale(0%); }

/* client logos strip */
.client-logos-strip {
  grid-column: 1 / 13;
  display: flex; flex-wrap: wrap; gap: 2rem 3rem;
  justify-content: center; align-items: center;
  padding-top: 3rem; margin-top: 2rem;
  border-top: 1px solid rgba(255,255,255,.1);
}
.client-logos-strip img {
  height: 28px; width: auto; opacity: 0.5;
  filter: brightness(2) grayscale(100%);
  transition: opacity 0.3s;
}
.client-logos-strip img:hover { opacity: 0.8; }

/* ═══════════════════════════════════════════
   SEC 3: BOT WHISPERER / NEWSLETTER (video bg)
═══════════════════════════════════════════ */
.newsletter-section {
  position: relative; width: 100%; overflow: hidden;
  min-height: 100vh; display: flex; align-items: center;
}
.newsletter-section video {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;
}
.newsletter-overlay {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,.65) 100%);
}
.newsletter-inner {
  position: relative; z-index: 2; width: 100%;
  display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--grid-gap);
  max-width: var(--grid-max); margin: 0 auto; padding: 5rem var(--grid-pad);
}
.newsletter-text {
  grid-column: 1 / 8; color: #fff;
}
.newsletter-text h2 {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(1.8rem, 3.5vw, 3.5rem);
  line-height: 100%; letter-spacing: 0.02px;
  margin-bottom: 1.2rem;
}
.newsletter-text .ns-desc {
  font-family: 'Noto Sans Hebrew', sans-serif; font-weight: 400;
  font-size: clamp(0.85rem, 1vw, 1.05rem);
  line-height: 1.75; color: rgba(255,255,255,.8);
  margin-bottom: 1.5rem;
}
.newsletter-text .ns-cta {
  font-family: 'Noto Sans Hebrew', sans-serif; font-weight: 500;
  font-size: clamp(1rem, 1.2vw, 1.2rem);
  color: var(--gold-light); margin-bottom: 1.5rem;
}
.nl-form {
  display: flex; gap: .5rem; flex-wrap: wrap;
}
.nl-form input {
  flex: 1; min-width: 160px; padding: .8rem 1rem;
  border: none; border-radius: 6px;
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: 0.9rem;
  direction: rtl; background: rgba(255,255,255,.95);
}
.nl-form button {
  background: var(--gold); color: var(--black);
  border: none; padding: .8rem 1.5rem; border-radius: 6px;
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: 0.9rem; font-weight: 600;
  cursor: pointer; transition: background .2s;
}
.nl-form button:hover { background: var(--gold-light); }

/* ═══════════════════════════════════════════
   SEC 4: WORKSHOPS — בא לחדש לכם
═══════════════════════════════════════════ */
.workshops-section {
  background: var(--lightest);
  padding: 6rem 0;
}
.workshops-inner {
  display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--grid-gap);
  max-width: var(--grid-max); margin: 0 auto; padding: 0 var(--grid-pad);
}
.ws-header {
  grid-column: 1 / 13;
}
.ws-header h2 {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(2rem, 3.5vw, 3.5rem);
  line-height: 100%; margin-bottom: 0.5rem;
}
.ws-header .ws-sub {
  font-family: 'Noto Sans Hebrew', sans-serif; font-weight: 400;
  font-size: clamp(0.85rem, 1vw, 1.05rem);
  line-height: 1.75; color: #555; max-width: 600px;
  margin-bottom: 2.5rem;
}
.ws-items { grid-column: 1 / 13; }
.ws-item {
  padding: 1.5rem 0;
  border-top: 1px solid rgba(0,0,0,.15);
}
.ws-item:last-child { border-bottom: 1px solid rgba(0,0,0,.15); }
.ws-item h3 {
  font-family: 'Leon', sans-serif; font-weight: 500;
  font-size: clamp(1.1rem, 1.6vw, 1.6rem);
  line-height: 130%; margin-bottom: .4rem;
}
.ws-item p {
  font-family: 'Noto Sans Hebrew', sans-serif; font-weight: 400;
  font-size: clamp(0.85rem, 1vw, 1.05rem);
  line-height: 1.7; color: #555;
}

/* ── CONTACT ── */
.contact-section {
  padding: 5rem 0;
}
.contact-inner {
  display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--grid-gap);
  max-width: var(--grid-max); margin: 0 auto; padding: 0 var(--grid-pad);
}
.contact-text { grid-column: 1 / 7; }
.contact-form-col { grid-column: 1 / 8; }
.contact-text h2 {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(1.6rem, 2.5vw, 2.8rem);
  line-height: 110%; margin-bottom: .5rem;
}
.contact-text .ct-note {
  font-family: 'Noto Sans Hebrew', sans-serif; font-weight: 400;
  font-size: 0.95rem; font-style: italic; color: #666;
  line-height: 1.7; margin-bottom: 1.5rem;
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

/* ═══════════════════════════════════════════
   SEC 5: CLOSING + FOOTER (underwater video)
═══════════════════════════════════════════ */
.closing-section {
  padding: 4rem 0 2rem;
}
.closing-inner {
  max-width: var(--grid-max); margin: 0 auto; padding: 0 var(--grid-pad);
}
.closing-inner h2 {
  font-family: 'Leon', sans-serif; font-weight: 500;
  font-size: clamp(1rem, 1.6vw, 1.6rem);
  line-height: 150%; margin-bottom: .6rem;
}
.closing-inner a { color: var(--gold); font-weight: 600; text-decoration: underline; }

/* Footer — underwater video with wave top edge */
.footer-section {
  position: relative; width: 100%; overflow: hidden;
  padding: 6rem 0 3rem; min-height: 350px;
}
.footer-section video {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;
}
.footer-overlay {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(180deg, rgba(5,25,81,0.7) 0%, rgba(0,0,0,0.6) 100%);
}
/* Wave effect — top edge */
.footer-wave {
  position: absolute; top: -2px; left: 0; right: 0; z-index: 2;
  height: 60px; overflow: hidden;
}
.footer-wave svg {
  width: 200%; height: 100%;
  animation: waveShift 8s linear infinite;
}
@keyframes waveShift {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.footer-inner {
  position: relative; z-index: 3;
  display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--grid-gap);
  max-width: var(--grid-max); margin: 0 auto; padding: 0 var(--grid-pad);
  color: #fff; align-items: end;
}
.footer-cta {
  grid-column: 1 / 7;
}
.footer-cta h2 {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(2.5rem, 5vw, 5rem);
  line-height: 95%; color: #fff;
}
.footer-info {
  grid-column: 7 / 13;
  text-align: left; direction: ltr;
}
.footer-info h6 {
  font-family: 'Noto Sans Hebrew', sans-serif; font-weight: 500;
  font-size: 0.85rem; letter-spacing: 0.05em;
  color: rgba(255,255,255,.6); margin-bottom: 0.8rem;
  direction: rtl; text-align: right;
}
.footer-links {
  list-style: none; display: flex; flex-direction: column; gap: .4rem;
  direction: rtl; text-align: right;
}
.footer-links a {
  color: rgba(255,255,255,.75); text-decoration: none; font-size: .9rem;
  font-family: 'Noto Sans Hebrew', sans-serif; transition: color .2s;
}
.footer-links a:hover { color: #fff; text-decoration: underline; }

/* ═══════════════════════════════════════════
   MOBILE
═══════════════════════════════════════════ */
@media (max-width: 768px) {
  :root { --grid-gap: 16px; }
  .nav-links { display: none; }
  .nav-links.open {
    display: flex; position: absolute; top: 80px; right: 0; left: 0;
    background: rgba(0,0,0,.95); flex-direction: column;
    padding: 1.2rem 2rem; gap: 1rem;
  }
  .nav-toggle { display: block; }

  .hero-inner { grid-template-columns: 1fr; }
  .hero-portrait-col { grid-column: 1 / -1; height: 50vh; order: 1; }
  .hero-text-col { grid-column: 1 / -1; order: 2; padding: 0 0 2rem; }
  .hero-title { font-size: clamp(2rem, 8vw, 3rem); }
  .hero-paper { height: auto; min-height: 100vh; padding-bottom: 2rem; }
  .hero-wrapper { height: auto; }
  .cmyk-bar { display: none; }

  .sailing-content { grid-template-columns: 1fr; }
  .sailing-text { grid-column: 1 / -1; padding: 2rem 0; }

  .portrait-inner { grid-template-columns: 1fr; }
  .portrait-text-col { grid-column: 1 / -1; order: 1; }
  .portrait-img-col { grid-column: 1 / -1; order: 2; text-align: center; }
  .portrait-img-col img { max-width: 250px; margin: 0 auto; }
  .rotating-line { flex-direction: column; gap: 0; }
  .rotating-word { min-width: auto; }
  .client-logos-strip { gap: 1.5rem 2rem; }
  .client-logos-strip img { height: 22px; }

  .newsletter-inner { grid-template-columns: 1fr; }
  .newsletter-text { grid-column: 1 / -1; }

  .workshops-inner { grid-template-columns: 1fr; }
  .ws-header, .ws-items { grid-column: 1 / -1; }

  .contact-inner { grid-template-columns: 1fr; }
  .contact-text, .contact-form-col { grid-column: 1 / -1; }
  .ct-row { grid-template-columns: 1fr; }

  .footer-inner { grid-template-columns: 1fr; }
  .footer-cta, .footer-info { grid-column: 1 / -1; }
  .footer-info { text-align: right; }
}
`;

const rotatingWords = ['מותגים', 'חוויות', 'קונספטים', 'מוצרים', 'מערכות', 'אסטרטגיות'];

export default function SitePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const lastScrollY = useRef(0);
  // Nav: hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollY.current + 50) setNavHidden(true);
      else if (y < lastScrollY.current - 50) setNavHidden(false);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Rotating words
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Load Unicorn Studio SDK and init scene
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/unicorn/assets/unicornStudio.umd.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).UnicornStudio) {
        (window as any).UnicornStudio.init();
      }
    };
    document.body.appendChild(script);
    return () => {
      // Cleanup: destroy Unicorn instances if available
      if ((window as any).UnicornStudio?.destroy) {
        (window as any).UnicornStudio.destroy();
      }
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: S }} />

      {/* ── NAV ── */}
      <nav className={`site-nav${navHidden ? ' hidden' : ''}`}>
        <a href="/" className="nav-logo">עמית ברין</a>
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
        <div className={`nav-links${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)}>
          <a href="#about">מי אני</a>
          <a href="#workshops">הרצאות</a>
          <a href="#contact">דברו איתי</a>
        </div>
      </nav>

      {/* ═══ SEC 0: HERO — CMYK PRINT AESTHETIC ═══ */}
      <section className="hero-wrapper">
        <div className="hero-paper">
          <span className="reg-mark-bl">⊕</span>
          <span className="reg-mark-tr">⊕</span>
          <div className="hero-inner">
            {/* Text — right side (RTL) */}
            <div className="hero-text-col">
              <p className="hero-subtitle">creative director · visual design</p>
              <h1 className="hero-title">הדפוס<br/>מחייה את<br/>הדיגיטל</h1>
              <p className="hero-body">
                לאנשים שנוהגים להספיד את הפרינט אני אומר: חכו, כי הפרינט עוד לא התחיל! כל זמן שאי אפשר להרגיש (ממש להרגיש בידיים, לא רק בעיניים) את מה שאתם רואים — החוויה לא תהיה שלמה: כי אפשר לקחת את המוצרים ואת המסרים שלכם למקומות פיזיים של תחושה ורגש, עם פתרונות בהפקות דפוס והשבחות מתקדמות, שמפתיעות ומניעות את כל מי שיגע בהן.
              </p>
            </div>

            {/* Unicorn Studio 3D Portrait */}
            <div className="hero-portrait-col">
              <div
                className="unicorn-embed"
                data-us-project-src="/unicorn/assets/scene.json"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SEC 1: SAILING VIDEO ═══ */}
      <section className="sailing-section">
        <video autoPlay muted loop playsInline poster="/media/portrait.jpg">
          <source src="/media/sailing4k2_1_1.mp4" type="video/mp4" />
        </video>
        <div className="sailing-overlay" />
        <div className="sailing-content">
          <div className="sailing-text">
            <h1>לוקח אותך למסע<br/>אל משהו שאף אחד<br/>עוד לא עשה</h1>
            <p className="sail-sub">
              בדרך אל היצירה החדשה, מצויד בטכנולוגיה פורצת דרך, אני שם רגע בצד רזומה של 23 שנים במה שקוראים ״עיצוב גרפי״ — כי בעולם החדש הזה אין סיבה להאחז בדוגמאות מהעבר כרפרנס למה שאנחנו מסוגלים להגיע אליו עכשיו.
            </p>
            <p className="sail-note">
              *בין השאר, אני מחפש מראה סופי לאתר הזה. אז גם העמוד הזה שאתם קוראים עכשיו מתעדכן, ועובר שינויים ושיפוצים על בסיס קבוע. בקיצור: שימו לב איפה שאתם דורכים כי בדיוק שטפתי פה.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ SEC 2: PORTRAIT — מעצב שינוי ═══ */}
      <section className="portrait-section" id="about">
        <div className="portrait-bg-pattern" />
        <div className="portrait-bg-gradient" />
        <div className="portrait-bg-glow" />
        <div className="portrait-inner">
          <div className="portrait-text-col">
            <h2>עמית ברין</h2>
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
            <p className="roles-line">מעצב, מרצה, מנטור, מעורר השראה</p>
            <p className="for-whom">למותגים המובילים בארץ ובעולם<br/>ולאנשים שמחפשים שינוי אמיתי</p>
            <div className="award-badges">
              <img src="/media/echo_v_200.png" alt="פרס Echo" />
            </div>
          </div>
          <div className="portrait-img-col">
            <img src="/media/headshot-big.png" alt="עמית ברין" loading="lazy" />
          </div>
        </div>
      </section>

      {/* ═══ SEC 3: BOT WHISPERER / NEWSLETTER ═══ */}
      <section className="newsletter-section">
        <video autoPlay muted loop playsInline>
          <source src="/media/bot-whisperer.mp4" type="video/mp4" />
        </video>
        <div className="newsletter-overlay" />
        <div className="newsletter-inner">
          <div className="newsletter-text">
            <h2>רוצים לדעת מהיכן<br/>הפרומפטים שלי?</h2>
            <p className="ns-desc">
              כדי לדעת מה ללחוש לבוטים, במיוחד ברגעים מאתגרים ומכריעים, אני מקפיד להתעדכן על בסיס יומי בהשקות ועדכונים של כלים, בלימודי טכניקות או פרומפטים מורכבים — כדי שאתם לא תצטרכו לעבור את תהליך ההסתגלות הסיזיפי הזה ותוכלו ליהנות ישר מהתובנות שריכזתי.
            </p>
            <p className="ns-cta">לשלוח גם לך עדכונים, מדריכים וטיפים?</p>
            <form className="nl-form" onSubmit={e => e.preventDefault()}>
              <input type="text" name="name" placeholder="איך לקרוא לך?" />
              <input type="email" name="email" placeholder="לאיזה מייל לשלוח?" />
              <button type="submit">תרשום אותי לעדכונים!</button>
            </form>
          </div>
        </div>
      </section>

      {/* ═══ SEC 4: WORKSHOPS — בא לחדש לכם ═══ */}
      <section className="workshops-section" id="workshops">
        <div className="workshops-inner">
          <div className="ws-header">
            <h2>בא לחדש לכם</h2>
            <p className="ws-sub">
              מגיע עד אליכם כדי להעשיר, ללמד ולתרגל עבודה עם כלים עדכניים, פרקטיקות מתקדמות, חשיבה עיצובית ויצירה עם בינה מלאכותית.
            </p>
          </div>
          <div className="ws-items">
            <div className="ws-item">
              <h3>✦ הרצאות העשרה</h3>
              <p>אם זה בערב חברה או במפגש חברים, כשרוצים להעניק לקבוצה חוויה של דעת וטריוויה מפתיעה — אני מגיע עם סיפור עשיר ומסחרר, רחב יריעה וסוחף.</p>
            </div>
            <div className="ws-item">
              <h3>✦ הדרכות טכניות</h3>
              <p>להתעדכן בגרסאות האחרונות של התוכנות שאתן כבר עובדות עליהן — הדרכת ריענון תקופתי שהיא חובה לכל סטודיו.</p>
            </div>
            <div className="ws-item">
              <h3>✦ סדנאות מעשיות</h3>
              <p>מאגרים של כלים חדשים (כאלה שתאהבו!) לארגז הכלים; עבודה מבוססת חשיבה עיצובית ובינה יוצרת.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SEC 5: CONTACT ═══ */}
      <section className="contact-section" id="contact">
        <div className="contact-inner">
          <div className="contact-text">
            <h2>הי, אני גם רוצה לארח אותך לכזה דבר!</h2>
            <p className="ct-note">(אבל הארגון שלי שונה ומיוחד, הוא מצריך תוכן ועריכה ייעודים — אז בוא נדבר!)</p>
          </div>
          <div className="contact-form-col">
            <form className="ct-form" onSubmit={e => e.preventDefault()}>
              <div className="ct-row">
                <input type="text" name="name" placeholder="שם מלא" />
                <input type="text" name="role" placeholder="תפקיד בארגון" />
              </div>
              <input type="email" name="email" placeholder="מייל בארגון" />
              <button type="submit" className="ct-submit">שליחה</button>
            </form>
          </div>
        </div>
      </section>

      {/* ═══ SEC 6: CLOSING ═══ */}
      <section className="closing-section">
        <div className="closing-inner">
          <h2>כנראה שהעמוד הזה יהיה בבנייה לנצח</h2>
          <h2>אבל ברצינות, תחשבו על זה רגע... להיות במצב הזה של הצורך להשתנות תמידית — זה משהו שאתם הייתם לוקחים על עצמכם?</h2>
          <h2>(כי אני חושב שפשוט חייבים. <a href="mailto:ahoovi@gmail.com">דברו איתי</a> אם אתם צריכים שינוי.)</h2>
        </div>
      </section>

      {/* ═══ SEC 7: FOOTER — UNDERWATER VIDEO ═══ */}
      <footer className="footer-section">
        <video autoPlay muted loop playsInline>
          <source src="/media/underwater.mp4" type="video/mp4" />
        </video>
        <div className="footer-wave">
          <svg viewBox="0 0 2400 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,30 C200,10 400,50 600,30 C800,10 1000,50 1200,30 C1400,10 1600,50 1800,30 C2000,10 2200,50 2400,30 L2400,0 L0,0 Z"
              fill="#E6E8EF"
            />
          </svg>
        </div>
        <div className="footer-overlay" />
        <div className="footer-inner">
          <div className="footer-cta">
            <h2>זהו,<br/>הגעת<br/>לתחתית.</h2>
          </div>
          <div className="footer-info">
            <h6>איפה בכל זאת אפשר להשיג אותי</h6>
            <ul className="footer-links">
              <li><a href="mailto:ahoovi@gmail.com">ahoovi@gmail.com</a></li>
              <li><a href="tel:0549407575">054-9407575</a></li>
              <li><a href="https://www.linkedin.com/in/amit-brin" target="_blank" rel="noopener">LinkedIn</a></li>
              <li><a href="https://x.com/amit_brin" target="_blank" rel="noopener">X</a></li>
              <li><a href="https://www.facebook.com/amitbdesign" target="_blank" rel="noopener">Facebook</a></li>
              <li><a href="https://www.behance.net/amitbrin" target="_blank" rel="noopener">Behance</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
