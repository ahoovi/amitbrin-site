"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   AMIT BRIN — ONE-PAGER
   Layout: 12-col grid · Figma reference · RTL
   Typography: Leon Heavy (primary) + Noto Sans Hebrew Medium
═══════════════════════════════════════════════════════════════ */

const S = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@300;400;500;600;700&display=swap');

@font-face { font-family: 'Leon'; src: url('/fonts/Leon-Regular.woff2') format('woff2'), url('/fonts/Leon-Regular.ttf') format('truetype'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'Leon'; src: url('/fonts/Leon-Bold.woff2') format('woff2'), url('/fonts/Leon-Bold.ttf') format('truetype'); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: 'Leon'; src: url('/fonts/Leon-Heavy.woff2') format('woff2'), url('/fonts/Leon-Heavy.ttf') format('truetype'); font-weight: 800; font-style: normal; font-display: swap; }
@font-face { font-family: 'Leon'; src: url('/fonts/Leon-Thin.woff2') format('woff2'), url('/fonts/Leon-Thin.ttf') format('truetype'); font-weight: 200; font-style: normal; font-display: swap; }

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
  --grid-max: 1520px;
  --grid-gap: 24px;
  --grid-pad: clamp(1.5rem, 4vw, 3rem);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Noto Sans Hebrew', 'Leon', Arial, sans-serif; color: var(--black); direction: rtl; overflow-x: hidden; background: #111; }

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
  background: linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0) 100%);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  padding: 0 var(--grid-pad); height: 80px;
  display: flex; align-items: center; justify-content: flex-start; gap: 3rem;
  direction: rtl;
  transition: top .4s ease-in-out;
}
.site-nav.hidden { top: -100px; }
.site-nav a {
  color: var(--navy); text-decoration: none;
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: 0.9rem; font-weight: 500;
  letter-spacing: 0.02em; transition: color .2s;
}
.site-nav a:hover { color: var(--logo); }
.nav-logo { display: flex; align-items: center; }
.nav-logo img { height: 28px; width: auto; }
.nav-links { display: flex; gap: 2.5rem; align-items: center; }
.nav-toggle { display: none; background: none; border: none; color: var(--navy); font-size: 1.5rem; cursor: pointer; }

/* ═══════════════════════════════════════════
   SEC 0: HERO — CMYK PRINT AESTHETIC (90vh)
   Layers (bottom→top):
   1. Paper texture (fills frame, object-cover)
   2. Portrait (multiply, left-aligned, parallax on scroll)
   3. Registration/print marks (multiply, pinned to corners)
   4. Text frame (right side, vertically centered)
   5. Holographic foil on title (moves with mouse, NOT auto)
   6. Glass + shape (RGB channel split refraction)
═══════════════════════════════════════════ */
.hero-wrapper {
  position: relative;
  width: 100%;
  background: transparent;
  overflow: visible;
  z-index: 2;
  display: flex; align-items: center; justify-content: center;
  padding: 20px 0;
}
.hero-paper {
  position: relative;
  width: 1440px; max-width: 100%;
  aspect-ratio: 1440 / 900;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0,0,0,0.25), 0 4px 36px rgba(0,0,0,0.25);
}
/* Paper bg — fills entire frame */
.hero-paper-bg {
  position: absolute; inset: 0; z-index: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
/* CMYK Halftone Canvas — decomposes portrait into actual CMYK dots */
.halftone-canvas {
  position: absolute; inset: 0; z-index: 1;
  width: 100%; height: 100%;
  mix-blend-mode: multiply;
  pointer-events: none;
}
/* Registration marks overlay — uses actual registration image from Unicorn */
.registration-marks {
  position: absolute; inset: 0; z-index: 3;
  mix-blend-mode: multiply; pointer-events: none;
  opacity: 0.55;
  background: url('/unicorn/assets/images/registration-1440x900-w10.jpg') center/cover no-repeat;
}
/* CMYK test strip — right edge, vertically centered */
.cmyk-strip {
  position: absolute; top: 50%; right: 0; transform: translateY(-50%);
  width: 34px; z-index: 3;
  mix-blend-mode: multiply; pointer-events: none;
}
.cmyk-strip-block { display: flex; flex-direction: column; gap: 1px; margin-bottom: 8px; }
.cmyk-strip-block span {
  display: block; width: 15px; height: 15px;
  margin-left: auto; margin-right: 6px;
}
/* CMYK colors */
.cmyk-c { background: #00AEEF; }
.cmyk-m { background: #EC008C; }
.cmyk-y { background: #FFF200; }
.cmyk-k { background: #231F20; }

/* Hero text — right side, centered at 60% height (higher) */
.hero-text-frame {
  position: absolute; top: 30%; right: 0;
  transform: translateY(-50%);
  width: 50%; z-index: 4;
  padding-right: clamp(2rem, 8vw, 120px);
  display: flex; flex-direction: column;
  align-items: flex-end; gap: 2.5rem;
}
.hero-title {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(2.8rem, 5.5vw, 6rem);
  line-height: 92%; letter-spacing: 0.02px;
  text-align: right;
  position: relative;
  /* Holographic foil — real image, enhanced via JS canvas */
  background-image: url('/media/holographic-foil.jpg');
  background-size: 130% 130%;
  background-position: var(--foil-x, 50%) var(--foil-y, 50%);
  background-clip: text; -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: background-position 0.08s ease-out;
  will-change: background-position, transform;
  transform: translateZ(0);
}
.hero-body {
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: clamp(0.85rem, 1vw, 1.05rem); font-weight: 500;
  line-height: 1.75; letter-spacing: 0.01em;
  color: #333; text-align: right;
  max-width: 470px;
}

/* 3D Glass Cross — large mask for raw portrait, RGB channel split */
.glass-cross-3d {
  position: absolute; z-index: 5;
  left: 33.3%; top: 46.2%;
  width: clamp(220px, 28vw, 380px); height: clamp(220px, 28vw, 380px);
  transform: translate(-50%, -50%) perspective(800px)
    rotateX(var(--cross-rx, 0deg)) rotateY(var(--cross-ry, 0deg));
  transform-style: preserve-3d;
  pointer-events: none;
  will-change: transform;
  transition: transform 0.15s ease-out;
  animation: glassFloat 18s ease-in-out infinite;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.3))
          drop-shadow(0 2px 8px rgba(0,0,0,0.2));
}
.cross-content {
  position: absolute; inset: 0;
  clip-path: polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%,
    65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%);
  background: #000;
  overflow: hidden;
  transform: translateZ(12px);
}
/* RGB channels — each shows portrait through one color, screen-blended */
.cross-channel {
  position: absolute;
  inset: -20px;
  background-repeat: no-repeat;
  mix-blend-mode: screen;
  will-change: transform;
  transition: transform 0.12s ease-out;
}
.cross-channel.ch-r {
  background-color: #ff0000;
  background-blend-mode: multiply;
}
.cross-channel.ch-g {
  background-color: #00ff00;
  background-blend-mode: multiply;
}
.cross-channel.ch-b {
  background-color: #0000ff;
  background-blend-mode: multiply;
}
/* Glass overlay — multiple layers for depth + refraction illusion */
.cross-glass-shine {
  position: absolute; inset: 0;
  clip-path: polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%,
    65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%);
  background:
    radial-gradient(ellipse at var(--shine-x, 35%) var(--shine-y, 30%),
      rgba(255,255,255,0.55) 0%,
      rgba(255,255,255,0.12) 25%,
      transparent 50%),
    linear-gradient(135deg,
      rgba(255,255,255,0.15) 0%,
      transparent 40%,
      rgba(255,255,255,0.06) 60%,
      transparent 100%),
    linear-gradient(to bottom,
      rgba(255,255,255,0.2) 0%,
      transparent 20%,
      transparent 80%,
      rgba(255,255,255,0.08) 100%);
  box-shadow: inset 0 0 60px rgba(255,255,255,0.1),
              inset 0 1px 0 rgba(255,255,255,0.5),
              inset 0 -1px 0 rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  pointer-events: none;
  transform: translateZ(16px);
}
/* Back face shadow for depth */
.cross-back-shadow {
  position: absolute; inset: 4px;
  clip-path: polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%,
    65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%);
  background: rgba(0,0,0,0.2);
  transform: translateZ(-4px);
  filter: blur(6px);
  pointer-events: none;
}
/* Edge highlight for glass thickness */
.cross-edge {
  position: absolute; inset: -1px;
  clip-path: polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%,
    65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%);
  border: 2px solid rgba(255,255,255,0.25);
  transform: translateZ(6px);
  pointer-events: none;
}
@keyframes glassFloat {
  0%, 100% { transform: translate(-50%, -50%) perspective(800px) rotateX(var(--cross-rx, 0deg)) rotateY(var(--cross-ry, 0deg)) translateY(0px); }
  33% { transform: translate(-50%, -50%) perspective(800px) rotateX(var(--cross-rx, 0deg)) rotateY(var(--cross-ry, 0deg)) translateY(-8px); }
  66% { transform: translate(-50%, -50%) perspective(800px) rotateX(var(--cross-rx, 0deg)) rotateY(var(--cross-ry, 0deg)) translateY(6px); }
}
/* Font stability — keep video and text on fully independent GPU layers
   so video compositing/loop resets never touch text rasterization.
   Key: will-change:transform (NOT contents!) on both video AND text. */
.sailing-section, .newsletter-section, .footer-section {
  isolation: isolate;
  contain: layout style;
}
/* Text containers: own compositing layer, shielded from video repaints */
.sailing-content, .newsletter-inner, .footer-inner {
  position: relative;
  z-index: 2;
  will-change: transform;
  transform: translateZ(0);
  -webkit-font-smoothing: subpixel-antialiased;
}
/* Individual text elements also promoted */
.sailing-text, .newsletter-text, .footer-cta, .footer-info {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-font-smoothing: subpixel-antialiased;
}
/* Video on its own GPU layer — will-change:transform, NOT contents */
.sailing-section video, .newsletter-section video, .footer-section video {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* ═══════════════════════════════════════════
   SEC 1: SAILING VIDEO (100vh)
   Text positioned on grid, NOT centered
═══════════════════════════════════════════ */
.sailing-section {
  position: relative; width: 100%; height: 100vh; overflow: hidden;
  margin-top: -10vh; z-index: 1;
}
.sailing-section video {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;
}
.sailing-overlay {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(to right,
    transparent 0%,
    transparent 65%,
    rgba(0,0,0,.4) 100%);
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
/* Layer 1: repeating client logos pattern in multiply */
.portrait-bg-pattern {
  position: absolute; inset: 0; z-index: 0;
  background: url('/media/client-logo-wall.jpg') center/600px repeat;
  mix-blend-mode: multiply;
  opacity: 0.12;
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
  max-width: var(--grid-max); margin: 0 auto; padding: 4rem var(--grid-pad) 0;
  width: 100%; align-items: end;
}
.portrait-img-col {
  grid-column: 7 / 13;
  position: relative;
  align-self: end;
  overflow: hidden;
}
.portrait-img-col img {
  width: 100%; display: block;
  filter: grayscale(10%);
  object-fit: cover; object-position: top center;
  height: auto; max-height: 80vh;
}
.portrait-text-col {
  grid-column: 1 / 7;
  color: #fff;
  align-self: center;
}
.portrait-text-col h2 {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(1.6rem, 2.5vw, 2.8rem);
  line-height: 130%; letter-spacing: 0.04vw;
  color: var(--gold-light); margin-bottom: 0.5rem;
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
  direction: rtl;
}
.rotating-line .static-word {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(2.5rem, 5vw, 5.5rem);
  line-height: 1.15; color: #fff;
  flex-shrink: 0;
}
.rotating-word {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(2.5rem, 5vw, 5.5rem);
  line-height: 1.15; color: var(--gold);
  min-width: 280px; height: 1.15em;
  position: relative; display: inline-block; overflow: hidden;
  vertical-align: baseline;
}
.rotating-word span {
  position: absolute; right: 0; top: 0; white-space: nowrap;
  opacity: 0; transition: none;
  line-height: inherit; font-size: inherit;
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
  background: linear-gradient(to right,
    transparent 0%,
    transparent 60%,
    rgba(0,0,0,.45) 100%);
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
  position: relative;
  overflow: hidden;
}
.workshops-section::before {
  content: '';
  position: absolute; inset: 0;
  background: url('/media/keynote-section-back2800x1750w.jpg') center/cover no-repeat;
  opacity: 0.06;
  pointer-events: none;
}
.workshops-inner {
  display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--grid-gap);
  max-width: var(--grid-max); margin: 0 auto; padding: 0 var(--grid-pad);
}
.ws-header {
  grid-column: 1 / 13;
  text-align: center;
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
  margin: 0 auto 2.5rem;
}
.ws-items {
  grid-column: 3 / 11;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;
  margin-top: 40px;
}
.ws-item {
  padding: 2rem;
  border: 1px solid rgba(0,0,0,.1);
  border-radius: 8px;
  background: #fff;
  text-align: center;
}
.ws-item h3 {
  font-family: 'Leon', sans-serif; font-weight: 500;
  font-size: clamp(1.1rem, 1.6vw, 1.6rem);
  line-height: 130%; margin-bottom: .6rem;
}
.ws-item p {
  font-family: 'Noto Sans Hebrew', sans-serif; font-weight: 400;
  font-size: clamp(0.85rem, 1vw, 1.05rem);
  line-height: 1.7; color: #555;
}
/* Contact form merged into workshops section */
.ws-contact {
  grid-column: 3 / 11;
  margin-top: 3rem;
  text-align: center;
}
.ws-contact h3 {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(1.4rem, 2.2vw, 2.2rem);
  line-height: 110%; margin-bottom: .4rem;
}
.ws-contact .ws-ct-note {
  font-family: 'Noto Sans Hebrew', sans-serif; font-weight: 400;
  font-size: 0.95rem; font-style: italic; color: #666;
  line-height: 1.7; margin-bottom: 1.5rem;
}

/* ── CONTACT FORM (shared styles, used in workshops section) ── */
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
  background: #fff;
  position: relative; z-index: 1;
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
  height: 80px; overflow: hidden;
}
.footer-wave svg {
  position: absolute; bottom: 0; left: 0;
  width: 200%; height: 100%;
}
.footer-wave .wave-back {
  animation: waveShift 10s linear infinite;
  opacity: 0.5;
}
.footer-wave .wave-front {
  animation: waveShift 7s linear infinite reverse;
}
@keyframes waveShift {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.footer-inner {
  position: relative; z-index: 3;
  display: flex; justify-content: flex-end; align-items: flex-end;
  max-width: 100%; padding: 0 100px;
  color: #fff; gap: 4rem;
  direction: rtl;
}
.footer-cta {
  flex: 1;
}
.footer-cta h2 {
  font-family: 'Leon', sans-serif; font-weight: 800;
  font-size: clamp(2.5rem, 5vw, 5rem);
  line-height: 95%; color: #fff;
}
.footer-info {
  text-align: right; direction: rtl;
  min-width: 280px;
}
.footer-info h6 {
  font-family: 'Leon', sans-serif; font-weight: 500;
  font-size: 1rem; letter-spacing: 0.02em;
  color: rgba(255,255,255,.7); margin-bottom: 1rem;
}
.footer-contact-details {
  list-style: none; display: flex; flex-direction: column; gap: .5rem;
  margin-bottom: 1.5rem;
}
.footer-contact-details a {
  color: rgba(255,255,255,.9); text-decoration: none;
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: 1.1rem; font-weight: 500;
  transition: color .2s;
}
.footer-contact-details a:hover { color: #fff; }
.footer-social {
  list-style: none; display: flex; gap: 1rem; flex-wrap: wrap;
}
.footer-social a {
  color: rgba(255,255,255,.7); text-decoration: none;
  display: flex; align-items: center; gap: .5rem;
  font-family: 'Noto Sans Hebrew', sans-serif; font-size: .85rem;
  transition: color .2s;
}
.footer-social a:hover { color: #fff; }
.footer-social svg { width: 20px; height: 20px; fill: currentColor; flex-shrink: 0; }

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

  .hero-text-frame {
    position: relative; top: auto; right: auto; transform: none;
    width: 100%; padding: 2rem var(--grid-pad);
    align-items: flex-end;
  }
  .hero-title { font-size: clamp(2rem, 8vw, 3rem); }
  .hero-paper { width: 100%; aspect-ratio: auto; min-height: 80vh; display: flex; flex-direction: column; }
  .hero-wrapper { padding: 0; }
  .cmyk-strip { display: none; }
  .glass-cross-3d { display: none; }
  .halftone-canvas { display: none; }

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
  .ws-header, .ws-items, .ws-contact { grid-column: 1 / -1; }
  .ws-items { grid-template-columns: 1fr; }
  .ct-row { grid-template-columns: 1fr; }

  .footer-inner { flex-direction: column; padding: 0 var(--grid-pad); align-items: flex-start; }
  .footer-info { min-width: auto; width: 100%; }
}
`;

const rotatingWords = ['שינוי', 'ניראות', 'בידול', 'משמעות', 'עניין', 'ערך'];

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

  // Refs for hero interactions
  const sceneRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const halftoneCanvasRef = useRef<HTMLCanvasElement>(null);
  const cmykBufRef = useRef<Float32Array | null>(null);
  const cmykDimsRef = useRef({ w: 0, h: 0, cw: 0, ch: 0, step: 4 });
  const crossRRef = useRef<HTMLDivElement>(null);
  const crossGRef = useRef<HTMLDivElement>(null);
  const crossBRef = useRef<HTMLDivElement>(null);

  // ── CMYK halftone draw — rotated grids per channel (Unicorn-accurate) ──
  const drawHalftone = useCallback((canvas: HTMLCanvasElement, scrollFactor: number) => {
    const ctx = canvas.getContext('2d');
    const buf = cmykBufRef.current;
    if (!ctx || !buf) return;
    const dpr = window.devicePixelRatio || 1;
    const { cw: W, ch: H, w: bufW, h: bufH, step: SS } = cmykDimsRef.current;
    if (bufW === 0) return;

    // Cell size: starts small (many dots), GROWS on scroll (fewer, larger dots)
    const baseCell = 8;
    const cellSize = baseCell * (1 + scrollFactor * 3.2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    // CMYK channels with authentic printing angles (from Unicorn shader)
    const channels = [
      { angle: 15,  rgb: '0,174,239',  a: 0.65, idx: 0 },
      { angle: 75,  rgb: '236,0,140',  a: 0.6,  idx: 1 },
      { angle: 0,   rgb: '255,242,0',  a: 0.5,  idx: 2 },
      { angle: 45,  rgb: '35,31,32',   a: 0.72, idx: 3 },
    ];

    for (const ch of channels) {
      const rad = ch.angle * Math.PI / 180;
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);

      // Find bounds in rotated space to cover entire canvas
      const corners = [[0,0],[W,0],[0,H],[W,H]];
      let minRX = Infinity, maxRX = -Infinity, minRY = Infinity, maxRY = -Infinity;
      for (const [cx, cy] of corners) {
        const rx = cx * cosA + cy * sinA;
        const ry = -cx * sinA + cy * cosA;
        if (rx < minRX) minRX = rx; if (rx > maxRX) maxRX = rx;
        if (ry < minRY) minRY = ry; if (ry > maxRY) maxRY = ry;
      }

      const iMin = Math.floor(minRX / cellSize);
      const iMax = Math.ceil(maxRX / cellSize);
      const jMin = Math.floor(minRY / cellSize);
      const jMax = Math.ceil(maxRY / cellSize);

      ctx.beginPath();
      for (let gi = iMin; gi <= iMax; gi++) {
        for (let gj = jMin; gj <= jMax; gj++) {
          // Screen position of this rotated grid point
          const sx = gi * cellSize * cosA - gj * cellSize * sinA;
          const sy = gi * cellSize * sinA + gj * cellSize * cosA;
          if (sx < -cellSize || sx > W + cellSize || sy < -cellSize || sy > H + cellSize) continue;

          // Look up CMYK from pre-computed buffer
          const bx = Math.round(sx / SS);
          const by = Math.round(sy / SS);
          if (bx < 0 || bx >= bufW || by < 0 || by >= bufH) continue;

          const intensity = buf[(by * bufW + bx) * 4 + ch.idx];
          if (intensity < 0.03) continue;

          // sqrt(intensity) for dot radius — matches Unicorn's sqrt(col) in shader
          const r = Math.sqrt(intensity) * cellSize * 0.42;
          if (r < 0.2) continue;

          ctx.moveTo(sx + r, sy);
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
        }
      }
      ctx.fillStyle = `rgba(${ch.rgb},${ch.a})`;
      ctx.fill();
    }
    ctx.restore();
  }, []);

  // ── Load portrait → build CMYK buffer (full canvas) → draw halftone ──
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/unicorn/assets/images/portrait-NON-registration-1440x900.jpg';
    img.onload = () => {
      const canvas = halftoneCanvasRef.current;
      const paper = sceneRef.current;
      if (!canvas || !paper) return;

      const dpr = window.devicePixelRatio || 1;
      const W = paper.clientWidth;
      const H = paper.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';

      // Portrait covers FULL canvas (fit-to-canvas from Unicorn JSON)
      const off = document.createElement('canvas');
      off.width = W; off.height = H;
      const octx = off.getContext('2d')!;
      // Slight exposure + saturation boost (from Unicorn: exposure +0.05, saturation 1.09)
      octx.filter = 'brightness(1.05) saturate(1.09)';
      const imgR = img.width / img.height;
      const areaR = W / H;
      let sx: number, sy: number, sw: number, sh: number;
      if (imgR > areaR) {
        sh = img.height; sw = sh * areaR;
        sx = (img.width - sw) / 2; sy = 0;
      } else {
        sw = img.width; sh = sw / areaR;
        sx = 0; sy = 0;
      }
      octx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
      octx.filter = 'none';
      const idata = octx.getImageData(0, 0, W, H);
      const px = idata.data;

      // Build CMYK lookup buffer at 1:4 resolution
      const SS = 4;
      const bufW = Math.ceil(W / SS);
      const bufH = Math.ceil(H / SS);
      const buf = new Float32Array(bufW * bufH * 4);

      for (let by = 0; by < bufH; by++) {
        for (let bx = 0; bx < bufW; bx++) {
          const pi = (by * SS * W + bx * SS) * 4;
          const r = px[pi] / 255, g = px[pi + 1] / 255, b = px[pi + 2] / 255;
          const kk = 1 - Math.max(r, g, b);
          const div = kk < 1 ? 1 / (1 - kk) : 0;
          const bi = (by * bufW + bx) * 4;
          buf[bi]     = (1 - r - kk) * div; // C
          buf[bi + 1] = (1 - g - kk) * div; // M
          buf[bi + 2] = (1 - b - kk) * div; // Y
          buf[bi + 3] = kk;                 // K
        }
      }
      cmykBufRef.current = buf;
      cmykDimsRef.current = { w: bufW, h: bufH, cw: W, ch: H, step: SS };
      drawHalftone(canvas, 0);

      // ── Position cross channels — portrait covers full canvas ──
      const crossEl = document.querySelector('.glass-cross-3d') as HTMLElement;
      if (crossEl) {
        const cW = crossEl.clientWidth;
        const cH = crossEl.clientHeight;
        // Cross position from Unicorn JSON: (0.333, 0.462)
        const cLeft = W * 0.333 - cW / 2;
        const cTop = H * 0.462 - cH / 2;
        const pad = 20;

        // Portrait covers full canvas — compute background to match
        let bsW: number, bsH: number, imgOffX: number;
        if (imgR > areaR) {
          bsH = H; bsW = H * imgR;
          imgOffX = (W - bsW) / 2;
        } else {
          bsW = W; bsH = W / imgR;
          imgOffX = 0;
        }
        const bgX = imgOffX - cLeft + pad;
        const bgY = -cTop + pad;

        for (const ref of [crossRRef, crossGRef, crossBRef]) {
          if (!ref.current) continue;
          ref.current.style.backgroundImage = `url('${img.src}')`;
          ref.current.style.backgroundSize = `${bsW}px ${bsH}px`;
          ref.current.style.backgroundPosition = `${bgX}px ${bgY}px`;
        }
      }
    };
  }, [drawHalftone]);

  // ── Enhance foil image for title ──
  useEffect(() => {
    const foilImg = new Image();
    foilImg.src = '/media/holographic-foil.jpg';
    foilImg.onload = () => {
      const c = document.createElement('canvas');
      c.width = foilImg.width * 3;
      c.height = foilImg.height * 3;
      const ctx = c.getContext('2d')!;
      ctx.filter = 'contrast(2.5) saturate(4) brightness(1.5)';
      ctx.drawImage(foilImg, 0, 0, c.width, c.height);
      if (titleRef.current) {
        titleRef.current.style.backgroundImage = `url(${c.toDataURL('image/jpeg', 0.92)})`;
      }
    };
  }, []);

  // ── Scroll: drive halftone canvas + foil shift ──
  useEffect(() => {
    let rafId: number;
    let lastSF = -1;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scene = sceneRef.current;
        const title = titleRef.current;
        const canvas = halftoneCanvasRef.current;
        if (!scene) return;
        const rect = scene.getBoundingClientRect();
        const scrollProgress = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.8)));

        // Foil Y shift
        if (title) {
          title.style.setProperty('--foil-y', `${30 + scrollProgress * 40}%`);
        }

        // Redraw halftone only when scroll changes enough
        const sf = Math.round(scrollProgress * 100) / 100;
        if (sf !== lastSF && canvas && cmykBufRef.current) {
          lastSF = sf;
          drawHalftone(canvas, scrollProgress);
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafId); };
  }, [drawHalftone]);

  // ── Mouse: foil shift + cross RGB split + cross 3D tilt ──
  const handleSceneMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const scene = sceneRef.current;
    const title = titleRef.current;
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;

    // Holographic foil
    if (title) {
      title.style.setProperty('--foil-x', `${nx * 100}%`);
      title.style.setProperty('--foil-y', `${ny * 100}%`);
    }

    // Glass cross 3D tilt — track mouse with perspective rotation
    const crossEl = document.querySelector('.glass-cross-3d') as HTMLElement;
    if (crossEl) {
      const tiltX = (ny - 0.462) * -18; // vertical mouse → X rotation
      const tiltY = (nx - 0.333) * 18;  // horizontal mouse → Y rotation
      crossEl.style.setProperty('--cross-rx', `${tiltX}deg`);
      crossEl.style.setProperty('--cross-ry', `${tiltY}deg`);
      // Move shine highlight to follow mouse
      const shineEl = crossEl.querySelector('.cross-glass-shine') as HTMLElement;
      if (shineEl) {
        shineEl.style.setProperty('--shine-x', `${nx * 100}%`);
        shineEl.style.setProperty('--shine-y', `${ny * 100}%`);
      }
    }

    // Glass cross RGB split — offset channels based on mouse distance from cross center
    const dx = (nx - 0.333) * 16;
    const dy = (ny - 0.462) * 16;
    if (crossRRef.current) crossRRef.current.style.transform = `translate(${-dx}px, ${dy}px)`;
    if (crossGRef.current) crossGRef.current.style.transform = 'translate(0,0)';
    if (crossBRef.current) crossBRef.current.style.transform = `translate(${dx}px, ${-dy}px)`;
  }, []);

  const handleSceneMouseLeave = useCallback(() => {
    const crossEl = document.querySelector('.glass-cross-3d') as HTMLElement;
    if (crossEl) {
      crossEl.style.setProperty('--cross-rx', '0deg');
      crossEl.style.setProperty('--cross-ry', '0deg');
    }
    if (crossRRef.current) crossRRef.current.style.transform = 'translate(0,0)';
    if (crossBRef.current) crossBRef.current.style.transform = 'translate(0,0)';
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: S }} />

      {/* ── NAV ── */}
      <nav className={`site-nav${navHidden ? ' hidden' : ''}`}>
        <a href="/" className="nav-logo"><img src="/media/logo.svg" alt="עמית ברין" /></a>
        <div className={`nav-links${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)}>
          <a href="#about">מי אני</a>
          <a href="#workshops">הרצאות</a>
          <a href="#contact">דברו איתי</a>
        </div>
        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* ═══ SEC 0: HERO — CMYK PRINT AESTHETIC ═══ */}
      <section className="hero-wrapper">
        <div
          className="hero-paper"
          ref={sceneRef}
          onMouseMove={handleSceneMouseMove}
          onMouseLeave={handleSceneMouseLeave}
        >
          {/* Layer 1: Paper texture bg */}
          <img className="hero-paper-bg" src="/media/paper-texture.jpg" alt="" aria-hidden="true" />

          {/* Layer 2: Canvas CMYK halftone — decomposes portrait into dots */}
          <canvas className="halftone-canvas" ref={halftoneCanvasRef} />

          {/* Layer 3: Registration/crop marks overlay */}
          <div className="registration-marks" />

          {/* CMYK test strip removed — registration marks image includes strips */}

          {/* Layer 4: Text frame — right side */}
          <div className="hero-text-frame">
            <h1 className="hero-title" ref={titleRef}>הדפוס<br/>מחייה את<br/>הדיגיטל</h1>
            <p className="hero-body">
              לאנשים שנוהגים להספיד את הפרינט אני אומר: חכו, כי הפרינט עוד לא התחיל! כל זמן שאי אפשר להרגיש (ממש להרגיש בידיים, לא רק בעיניים) את מה שאתם רואים — החוויה לא תהיה שלמה: כי אפשר לקחת את המוצרים ואת המסרים שלכם למקומות פיזיים של תחושה ורגש, עם פתרונות בהפקות דפוס והשבחות מתקדמות, שמפתיעות ומניעות את כל מי שיגע בהן.
            </p>
          </div>

          {/* Layer 5: Glass Cross — 3D mask for raw portrait, RGB split */}
          <div className="glass-cross-3d">
            <div className="cross-back-shadow" />
            <div className="cross-content">
              <div className="cross-channel ch-r" ref={crossRRef} />
              <div className="cross-channel ch-g" ref={crossGRef} />
              <div className="cross-channel ch-b" ref={crossBRef} />
            </div>
            <div className="cross-edge" />
            <div className="cross-glass-shine" />
          </div>
        </div>
      </section>

      {/* ═══ SEC 1: SAILING VIDEO ═══ */}
      <section className="sailing-section">
        <video autoPlay muted loop playsInline preload="auto">
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
              <span className="static-word">יוצר</span>
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
            <p className="roles-line">אבא, מעצב, מרצה, מנטור, מעורר השראה</p>
            <p className="for-whom">למותגים המובילים בארץ ובעולם<br/>ולאנשים מצליחים ומסופקים יותר</p>
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
        <video autoPlay muted loop playsInline preload="auto">
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
          </div>
          <div className="ws-contact" id="contact">
            <h3>הי, אני גם רוצה לארח אותך לכזה דבר!</h3>
            <p className="ws-ct-note">(אבל הארגון שלי שונה ומיוחד, הוא מצריך תוכן ועריכה ייעודים — אז בוא נדבר!)</p>
            <form className="ct-form" style={{maxWidth: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}} onSubmit={e => e.preventDefault()}>
              <input type="text" name="name" placeholder="שם מלא" />
              <input type="text" name="role" placeholder="תפקיד בארגון" />
              <input type="email" name="email" placeholder="מייל בארגון" style={{gridColumn: '1 / -1'}} />
              <button type="submit" className="ct-submit" style={{gridColumn: '1 / 3', maxWidth: 'calc(50% - 0.375rem)'}}>שליחה</button>
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
        <video autoPlay muted loop playsInline preload="auto">
          <source src="/media/underwater.mp4" type="video/mp4" />
        </video>
        <div className="footer-wave">
          <svg className="wave-back" viewBox="0 0 2400 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C150,20 350,60 600,35 C850,10 1050,55 1200,40 C1350,25 1550,60 1800,35 C2050,10 2250,55 2400,40 L2400,0 L0,0 Z"
              fill="#ffffff"
            />
          </svg>
          <svg className="wave-front" viewBox="0 0 2400 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,45 C200,15 400,55 600,35 C800,15 1000,50 1200,35 C1400,20 1600,55 1800,30 C2000,10 2200,50 2400,35 L2400,0 L0,0 Z"
              fill="#ffffff"
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
            <ul className="footer-contact-details">
              <li><a href="mailto:ahoovi@gmail.com">ahoovi@gmail.com</a></li>
              <li><a href="tel:0549407575">054-9407575</a></li>
            </ul>
            <ul className="footer-social">
              <li><a href="https://www.linkedin.com/in/amit-brin" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                amit-brin
              </a></li>
              <li><a href="https://x.com/amit_brin" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                @amit_brin
              </a></li>
              <li><a href="https://www.facebook.com/amitbdesign" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                amitbdesign
              </a></li>
              <li><a href="https://www.behance.net/amitbrin" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.63.166-1.27.25-1.95.25H0v-15h6.938v.252zM16.94 16.665c.44.428 1.073.643 1.894.643.59 0 1.1-.148 1.53-.447.424-.3.68-.61.78-.93h2.588c-.403 1.28-1.048 2.2-1.9 2.75-.85.56-1.884.83-3.08.83-.837 0-1.585-.13-2.272-.4-.674-.27-1.25-.65-1.72-1.14-.464-.49-.82-1.08-1.06-1.77-.24-.7-.36-1.46-.36-2.3 0-.81.13-1.56.388-2.27.26-.7.63-1.3 1.1-1.8.478-.5 1.06-.88 1.74-1.15.68-.27 1.44-.41 2.28-.41.92 0 1.73.17 2.42.51.69.34 1.26.82 1.71 1.4.45.59.78 1.28.99 2.08.21.8.28 1.68.2 2.65h-7.69c-.04.97.17 1.72.64 2.23zm3.24-8.56v1.6h-4.92v-1.6h4.92zM3.56 7.01h2.58c.18 0 .37.02.57.05.2.04.38.1.55.2.17.1.31.24.42.43.11.19.17.44.17.76 0 .53-.16.9-.48 1.14-.32.23-.73.35-1.22.35H3.56V7.01zm0 4.72h2.81c.22 0 .43.02.65.06.22.04.42.12.59.23.17.11.31.27.41.47.1.2.15.46.15.78 0 .62-.2 1.06-.58 1.31-.38.25-.84.38-1.39.38H3.56v-3.23z"/></svg>
                amitbrin
              </a></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
