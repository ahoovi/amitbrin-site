"use client";

/**
 * TeaLibrary — "הספרייה של תה" section (work 02).
 * A Stripe-Press-inspired 3D pile of the nine+ books designed for Tea:
 * scroll tilts the view (top view low on screen → pure spine view at center),
 * click extracts a book to the side panel at true print size & proportions,
 * drag rotates it freely with per-face lighting; קוראים לי תה carries its
 * outer sleeve (cover + spine) until peeled.
 * All dimensions come from the print PDFs — see teaLibraryData.ts.
 * TODO: swap the CSS paper approximation for <PaperTexture/> (@paper-design/shaders-react);
 * TODO: per-book store links.
 */

import { useEffect, useRef } from "react";
import { TEA_BOOKS, TEA_STORE, type TeaBook } from "./teaLibraryData";

const S = 2.0;   // px per mm — pile and panel share the same scale
const GAP = 26;

export default function TeaLibrary() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const shelf = root.querySelector<HTMLElement>(".tl-shelf")!;
    const column = root.querySelector<HTMLElement>(".tl-column")!;
    const panel = root.querySelector<HTMLElement>(".tl-panel")!;
    const spinEl = root.querySelector<HTMLElement>(".tl-spin")!;
    const spinShadow = root.querySelector<HTMLElement>(".tl-spin-shadow")!;
    const sleeveBtn = root.querySelector<HTMLButtonElement>(".tl-sleeve-btn")!;
    const siteBtn = root.querySelector<HTMLAnchorElement>(".tl-site-btn")!;
    const metaTitle = root.querySelector<HTMLElement>(".tl-meta h3")!;
    const metaYear = root.querySelector<HTMLElement>(".tl-year")!;
    const metaDesc = root.querySelector<HTMLElement>(".tl-syn")!;

    type Slot = { el: HTMLElement; box: HTMLElement; y: number; T: number; jr: string };
    const slots: Slot[] = [];
    let openIndex = -1;
    let rx = -6, ry = -22;

    /* ---- build the pile — closed 3D box per book ---- */
    let y = 0;
    TEA_BOOKS.forEach((b, i) => {
      const W = b.w * S, D = b.h * S, T = Math.max(14, b.t * S);
      const slot = document.createElement("div");
      slot.className = "tl-slot";
      const jr = (Math.sin(i * 4.1) * 2.2).toFixed(2);
      slot.style.cssText = `top:${y}px;width:${W}px;height:${T}px;margin-left:${-W / 2}px;`;
      const stackSpine = b.sleeveSpineH || b.spineH;
      const spineBG = stackSpine ? `background-image:url('${stackSpine}')` : `background:${b.spineColor || "#273E58"}`;
      const topImg = b.sleeve || b.front;
      slot.innerHTML = `<div class="tl-bookbox">
        <div class="tl-bf tl-bf-spine" style="width:${W}px;height:${T}px;${spineBG};transform:translate(-50%,-50%) translateZ(${D / 2}px)">${stackSpine ? "" : `<div class="tl-spine-word">${b.title} · תה</div>`}</div>
        <div class="tl-bf tl-bf-pages" style="width:${W}px;height:${T}px;transform:translate(-50%,-50%) rotateY(180deg) translateZ(${D / 2}px)"></div>
        <div class="tl-bf tl-bf-cover" style="width:${W}px;height:${D}px;background-image:url('${topImg}');transform:translate(-50%,-50%) rotateX(90deg) translateZ(${T / 2}px)"></div>
        <div class="tl-bf" style="width:${W}px;height:${D}px;background-image:url('${b.back}');background-size:100% 100%;filter:brightness(.75);transform:translate(-50%,-50%) rotateX(-90deg) translateZ(${T / 2}px)"></div>
        <div class="tl-bf tl-bf-pagesV" style="width:${D}px;height:${T}px;transform:translate(-50%,-50%) rotateY(90deg) translateZ(${W / 2}px)"></div>
        <div class="tl-bf tl-bf-pagesV" style="width:${D}px;height:${T}px;transform:translate(-50%,-50%) rotateY(-90deg) translateZ(${W / 2}px)"></div>
      </div>`;
      slot.addEventListener("click", () => openBook(i));
      column.appendChild(slot);
      slots.push({ el: slot, box: slot.firstElementChild as HTMLElement, y, T, jr });
      y += T + GAP;
    });
    const pileH = y - GAP;

    let scrollPos = 0.5;
    function layout() {
      const vh = shelf.clientHeight;
      const startY = vh * 0.72, endY = vh * 0.45 - pileH;
      const colY = startY + (endY - startY) * scrollPos;
      column.style.top = colY + "px";
      const centerY = vh * 0.52;
      slots.forEach((s) => {
        const by = colY + s.y + s.T / 2;
        const dc = Math.max(-1, Math.min(1, (by - centerY) / (vh * 0.55)));
        const ang = dc > 0 ? -(2 + dc * 24) : -(2 + dc * 6);
        s.el.style.transform = `rotateX(${ang}deg) rotateZ(${s.jr}deg)`;
      });
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      scrollPos = Math.max(0, Math.min(1, scrollPos + e.deltaY * 0.0012));
      layout();
    };
    shelf.addEventListener("wheel", onWheel, { passive: false });
    let shTouchY: number | null = null;
    const onTS = (e: TouchEvent) => { shTouchY = e.touches[0].clientY; };
    const onTM = (e: TouchEvent) => {
      if (shTouchY === null) return;
      const dy = shTouchY - e.touches[0].clientY;
      shTouchY = e.touches[0].clientY;
      scrollPos = Math.max(0, Math.min(1, scrollPos + dy * 0.002));
      layout();
    };
    const onTE = () => { shTouchY = null; };
    shelf.addEventListener("touchstart", onTS, { passive: true });
    shelf.addEventListener("touchmove", onTM, { passive: true });
    shelf.addEventListener("touchend", onTE);
    window.addEventListener("resize", layout);
    layout();

    /* ---- open / close ---- */
    function openBook(i: number) {
      if (openIndex === i) return closeBook();
      if (openIndex >= 0) {
        slots[openIndex].el.classList.remove("tl-open", "tl-extracting");
        slots[openIndex].box.style.transform = "";
        layout();
      }
      openIndex = i;
      const s = slots[i], b = TEA_BOOKS[i];
      buildSpin(b);
      panel.classList.add("has-book");
      const ped = spinEl.getBoundingClientRect();
      const src = s.el.getBoundingClientRect();
      panel.classList.remove("has-book");
      const dx = ped.left + ped.width / 2 - (src.left + src.width / 2);
      const dy = ped.top + ped.height / 2 - (src.top + src.height / 2);
      s.el.classList.add("tl-extracting");
      s.box.style.transform = `translateX(${dx}px) translateY(${dy}px) rotateX(-88deg)`;
      setTimeout(() => {
        s.el.classList.add("tl-open");
        s.el.classList.remove("tl-extracting");
        s.box.style.transform = "";
        layout();
        panel.classList.add("has-book");
        metaTitle.textContent = b.title;
        metaYear.textContent = b.year || "שנת הוצאה — יתעדכן";
        metaDesc.textContent = b.syn || "תקציר — יתעדכן.";
        siteBtn.href = b.url || TEA_STORE;
        siteBtn.style.display = b.noStore ? "none" : "inline-flex";
        sleeveBtn.classList.toggle("on", !!b.sleeve);
        sleeveBtn.textContent = "להציץ מתחת לשרוול";
      }, 600);
    }
    function closeBook() {
      if (openIndex < 0) return;
      const i = openIndex;
      openIndex = -1;
      const s = slots[i];
      const ped = spinEl.getBoundingClientRect();
      panel.classList.remove("has-book");
      s.el.classList.remove("tl-open");
      const src = s.el.getBoundingClientRect();
      const dx = ped.left + ped.width / 2 - (src.left + src.width / 2);
      const dy = ped.top + ped.height / 2 - (src.top + src.height / 2);
      s.box.style.transition = "none";
      s.box.style.transform = `translateX(${dx}px) translateY(${dy}px) rotateX(-88deg)`;
      s.el.classList.add("tl-extracting");
      requestAnimationFrame(() => { requestAnimationFrame(() => {
        s.box.style.transition = "";
        s.box.style.transform = "";
        setTimeout(() => { s.el.classList.remove("tl-extracting"); layout(); }, 620);
      }); });
    }

    /* ---- the standing, rotating book ---- */
    function buildSpin(b: TeaBook) {
      const W = b.w * S, H = b.h * S, T = Math.max(12, b.t * S);
      spinEl.style.width = W + "px";
      spinEl.style.height = H + "px";
      spinShadow.style.top = H + 22 + "px";
      const spineImg = b.sleeve && b.sleeveSpine ? b.sleeveSpine : b.spine;
      const spineBG = spineImg ? `background-image:url('${spineImg}')` : `background:${b.spineColor || "#273E58"}`;
      const spineRot = b.eng ? -90 : 90, foreRot = b.eng ? 90 : -90;
      spinEl.innerHTML = `
        <div class="tl-sf tl-sf-back" data-n="180" style="width:${W}px;height:${H}px;background-image:url('${b.back}');transform:translate(-50%,-50%) rotateY(180deg) translateZ(${T / 2}px)"></div>
        <div class="tl-sf tl-spineface" data-n="${spineRot}" style="width:${T}px;height:${H}px;${spineBG};background-size:100% 100%;transform:translate(-50%,-50%) rotateY(${spineRot}deg) translateZ(${W / 2}px)"></div>
        <div class="tl-sf tl-sf-pages" data-n="${foreRot}" style="width:${T - 2}px;height:${H * 0.985}px;transform:translate(-50%,-50%) rotateY(${foreRot}deg) translateZ(${W / 2 - 1}px)"></div>
        <div class="tl-sf tl-sf-pagesH" data-n="0" style="width:${W * 0.985}px;height:${T - 2}px;transform:translate(-50%,-50%) rotateX(90deg) translateZ(${H / 2 - 1}px)"></div>
        <div class="tl-sf tl-sf-pagesH" data-n="0" style="width:${W * 0.985}px;height:${T - 2}px;transform:translate(-50%,-50%) rotateX(-90deg) translateZ(${H / 2 - 1}px)"></div>
        <div class="tl-sf tl-sf-front" data-n="0" style="width:${W}px;height:${H}px;background-image:url('${b.front}');transform:translate(-50%,-50%) translateZ(${T / 2}px)">
          ${b.sleeve ? `<div class="tl-sleeve" style="background-image:url('${b.sleeve}')"></div>` : ""}
          <div class="tl-gloss"></div>
        </div>`;
      rx = -6; ry = -22;
      renderSpin();
    }
    function renderSpin() {
      spinEl.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      const rad = Math.PI / 180;
      const LIGHT = -32;
      spinEl.querySelectorAll<HTMLElement>(".tl-sf").forEach((f) => {
        const n = parseFloat(f.dataset.n || "0");
        const lit = Math.max(0, Math.cos((ry + n - LIGHT) * rad));
        f.style.filter = `brightness(${(0.72 + 0.42 * lit).toFixed(3)})`;
      });
      const g = spinEl.querySelector<HTMLElement>(".tl-gloss");
      if (g) {
        const yr = ((ry % 360) + 360) % 360;
        const siny = Math.sin(yr * rad);
        const amt = Math.max(0, 0.06 + 0.2 * Math.cos((yr + 32) * rad) - Math.abs(rx) * 0.001);
        const ang = 115 + siny * 40 - rx * 0.8;
        g.style.background = `linear-gradient(${ang}deg,rgba(255,255,255,${amt.toFixed(3)}),rgba(255,255,255,0) 50%,rgba(2,13,44,.22))`;
      }
      const sc = 0.5 + 0.5 * Math.abs(Math.cos(ry * rad));
      spinShadow.style.transform = `scaleX(${(0.6 + 0.4 * sc).toFixed(3)})`;
    }
    let dragging = false, dragged = false, lx = 0, ly = 0;
    const onPD = (e: PointerEvent) => { dragging = true; dragged = false; lx = e.clientX; ly = e.clientY; spinEl.setPointerCapture(e.pointerId); };
    const onPM = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 2) dragged = true;
      ry += dx * 0.45;
      rx = Math.max(-80, Math.min(80, rx - dy * 0.45));
      renderSpin();
    };
    const onPU = () => { dragging = false; };
    const onSpinClick = (e: MouseEvent) => {
      if (dragged) return;
      if ((e.target as HTMLElement).classList.contains("tl-sleeve")) return toggleSleeve();
      closeBook();
    };
    spinEl.addEventListener("pointerdown", onPD);
    spinEl.addEventListener("pointermove", onPM);
    spinEl.addEventListener("pointerup", onPU);
    spinEl.addEventListener("click", onSpinClick);
    function toggleSleeve() {
      const sl = spinEl.querySelector<HTMLElement>(".tl-sleeve");
      if (!sl) return;
      const off = !sl.classList.contains("off");
      sl.classList.toggle("off", off);
      sleeveBtn.textContent = off ? "להחזיר את השרוול" : "להציץ מתחת לשרוול";
      const b = TEA_BOOKS[openIndex];
      const face = spinEl.querySelector<HTMLElement>(".tl-spineface");
      if (b && face && b.sleeveSpine) face.style.backgroundImage = `url('${off ? b.spine : b.sleeveSpine}')`;
    }
    sleeveBtn.addEventListener("click", toggleSleeve);

    return () => {
      shelf.removeEventListener("wheel", onWheel);
      shelf.removeEventListener("touchstart", onTS);
      shelf.removeEventListener("touchmove", onTM);
      shelf.removeEventListener("touchend", onTE);
      window.removeEventListener("resize", layout);
      column.innerHTML = "";
    };
  }, []);

  return (
    <section className="tea-lib" id="tea-library" ref={rootRef}>
      <div className="tl-paper" aria-hidden />

      <div className="tl-intro" data-reveal>
        <div className="tl-kicker">עיצוב ועימוד לדפוס ולדיגיטל</div>
        <h2>הספרייה של תה</h2>
        <p>לפני שמונה שנים פנה אליי סופר שכותב תחת השם הבדוי &quot;תה&quot;, וביקש עיצוב ועימוד לספר שכתב — &quot;אליוט&quot;. מאז עיצבתי לו תשעה ספרים, חלקם בגרסאות אנגלית לקהל בינלאומי, ואפילו ספר ילדים אחד שגם עזרתי לאייר.</p>
        <p>השבוע תה משיק את ספרו העשירי — ספר אוטוביוגרפי, שבו הוא נחשף לראשונה בשמו האמיתי. זה אירוע חגיגי בשבילו (וגם בשבילי!) כי הספר הזה מחבר בין העולמות הבדיוניים, המרגשים והרומנטיים שברא לבין העולם האמיתי שמאחוריהם. אני כבר קראתי כל אחד ואחד מהספרים האלה והתרגשתי, ועכשיו, להיות חלק מהמהלך האישי הזה — זה בכלל מרגש ברמה אחרת.</p>
        <p className="tl-invite">אתם מוזמנים לעבור על הספרייה ולבחור לעצמכם מסע.</p>
        <a className="tl-ink-btn" href={TEA_STORE} target="_blank" rel="noopener noreferrer">לחנות הספרים של תה</a>
      </div>

      <div className="tl-shelf">
        <div className="tl-column" />
      </div>
      <div className="tl-shelf-hint">גלילה משנה זווית · לחיצה שולפת ספר</div>

      <div className="tl-panel">
        <div className="tl-stagearea">
          <div className="tl-placeholder">בחרו ספר<br />מהערימה</div>
          <div className="tl-pedestal">
            <div className="tl-spin" />
            <div className="tl-spin-shadow" />
          </div>
        </div>
        <div className="tl-meta">
          <h3 />
          <div className="tl-year" />
          <p className="tl-syn" />
          <div className="tl-row">
            <a className="tl-ink-btn tl-site-btn" href={TEA_STORE} target="_blank" rel="noopener noreferrer">לעמוד הספר באתר של תה</a>
            <button className="tl-ink-btn tl-sleeve-btn" type="button">להציץ מתחת לשרוול</button>
          </div>
          <div className="tl-close-hint">גרירה מסובבת את הספר לכל הכיוונים · לחיצה עליו מחזירה לערימה</div>
        </div>
      </div>

      <style>{`
.tea-lib{position:relative;height:100vh;overflow:hidden;color:var(--navy,#081845);--tl-muted:#3d4a66;--tl-faint:#7d8299}
.tea-lib *{user-select:none;-webkit-user-select:none}
.tl-paper{position:absolute;inset:0;z-index:0;pointer-events:none;filter:saturate(.85);background-color:#fdfaf2;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.012 0.016' numOctaves='4' seed='547'/><feDiffuseLighting lighting-color='%23fdfaf2' surfaceScale='2.2'><feDistantLight azimuth='235' elevation='58'/></feDiffuseLighting></filter><rect width='100%25' height='100%25' filter='url(%23p)'/></svg>"),
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1400' height='1400'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.006' numOctaves='3' seed='47'/><feDiffuseLighting lighting-color='%23dcd6db' surfaceScale='3.4'><feDistantLight azimuth='235' elevation='55'/></feDiffuseLighting></filter><rect width='100%25' height='100%25' filter='url(%23f)' opacity='0.5'/></svg>");
  background-size:900px 900px,1400px 1400px;background-blend-mode:multiply;opacity:.9}
.tl-intro{position:absolute;top:11vh;right:5vw;width:min(330px,24vw);z-index:5}
.tl-kicker{font-family:'Leon',sans-serif;font-weight:400;color:var(--tl-muted);font-size:12px;letter-spacing:.1em;margin-bottom:12px}
.tl-intro h2{font-family:'Leon','Noto Sans Hebrew',sans-serif;font-weight:700;color:var(--navy,#081845);font-size:clamp(24px,2.3vw,34px);line-height:1.15;white-space:nowrap;margin:0 0 20px}
.tl-intro p{color:var(--tl-muted);font-size:13.5px;line-height:1.78;margin:0 0 12px}
.tl-intro p.tl-invite{color:var(--navy,#081845);font-weight:700;font-size:15.5px;line-height:1.7;margin-top:18px;margin-bottom:16px}
.tl-shelf{position:absolute;left:26%;top:0;bottom:0;width:44%;perspective:1900px;perspective-origin:50% 50%;z-index:2}
.tl-column{position:absolute;left:50%;top:0;width:0;height:0;transform-style:preserve-3d}
.tl-slot{position:absolute;left:0;transform-style:preserve-3d}
.tl-bookbox{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .35s cubic-bezier(.32,.72,0,1);cursor:pointer}
.tl-slot:hover .tl-bookbox{transform:translateX(-46px)}
.tl-slot.tl-open{visibility:hidden}
.tl-slot.tl-extracting{z-index:50}
.tl-slot.tl-extracting .tl-bookbox{transition:transform .6s cubic-bezier(.5,.05,.2,1)}
.tl-bf{position:absolute;left:50%;top:50%;backface-visibility:hidden;background-size:100% 100%}
.tl-bf-spine{border-radius:1px}
.tl-bf-spine::after{content:"";position:absolute;inset:0;border-radius:1px;background:linear-gradient(180deg,rgba(255,255,255,.2),rgba(255,255,255,0) 38%,rgba(2,13,44,.24))}
.tl-spine-word{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;letter-spacing:.08em;color:rgba(255,255,255,.92);white-space:nowrap;overflow:hidden}
.tl-bf-cover::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,13,44,.18),rgba(2,13,44,0) 30%)}
.tl-bf-pages{background:linear-gradient(180deg,rgba(2,13,44,.18),rgba(2,13,44,0) 40% 60%,rgba(2,13,44,.22)),repeating-linear-gradient(180deg,#efe9da 0 2px,#d5cebd 2px 3px)}
.tl-bf-pagesV{background:linear-gradient(180deg,rgba(2,13,44,.22),rgba(2,13,44,.05) 45%,rgba(2,13,44,.3)),repeating-linear-gradient(180deg,#efe9da 0 2px,#d5cebd 2px 3px)}
.tl-shelf-hint{position:absolute;bottom:16px;left:26%;width:44%;text-align:center;color:var(--tl-faint);font-size:11.5px;letter-spacing:.12em;z-index:3;font-family:'Leon',sans-serif}
.tl-panel{position:absolute;left:4.5vw;top:0;bottom:0;width:min(350px,25vw);display:flex;flex-direction:column;justify-content:center;z-index:4}
.tl-stagearea{position:relative;display:flex;align-items:flex-end;justify-content:center;margin-bottom:36px;min-height:180px}
.tl-placeholder{width:200px;aspect-ratio:140/200;position:relative;display:flex;align-items:center;justify-content:center;color:var(--tl-faint);font-size:12.5px;letter-spacing:.08em;text-align:center;line-height:1.9;font-family:'Leon',sans-serif}
.tl-placeholder::before{content:'';position:absolute;inset:2px;pointer-events:none;border:1.6px dashed #273E58;opacity:.45;border-radius:14px 20px 12px 22px / 20px 13px 22px 14px;filter:url(#inkline)}
.tl-panel.has-book .tl-placeholder{display:none}
.tl-pedestal{perspective:1300px;position:relative;display:none}
.tl-panel.has-book .tl-pedestal{display:block}
.tl-spin{position:relative;transform-style:preserve-3d;cursor:grab;z-index:2}
.tl-spin:active{cursor:grabbing}
.tl-sf{position:absolute;left:50%;top:50%;background-size:100% 100%}
.tl-sf-front{border-radius:1px 3px 3px 1px}
.tl-sf-back{border-radius:3px 1px 1px 3px}
.tl-sf-pages{background:linear-gradient(90deg,rgba(2,13,44,.16),rgba(2,13,44,0) 35% 65%,rgba(2,13,44,.16)),repeating-linear-gradient(90deg,#efe9da 0 2px,#d5cebd 2px 3px)}
.tl-sf-pagesH{background:linear-gradient(0deg,rgba(2,13,44,.14),rgba(2,13,44,0) 40% 60%,rgba(2,13,44,.14)),repeating-linear-gradient(0deg,#efe9da 0 2px,#d5cebd 2px 3px)}
.tl-gloss{position:absolute;inset:0;pointer-events:none;border-radius:inherit;mix-blend-mode:screen}
.tl-spin-shadow{position:absolute;left:6%;right:6%;height:18px;border-radius:50%;background:radial-gradient(50% 100% at 50% 50%,rgba(2,13,44,.4),transparent 70%);z-index:1;pointer-events:none}
.tl-sleeve{position:absolute;inset:0;background-size:100% 100%;border-radius:1px;transition:transform .85s cubic-bezier(.6,.05,.2,1),opacity .85s;box-shadow:-6px 0 14px rgba(2,13,44,.3)}
.tl-sleeve::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(2,13,44,.14),rgba(2,13,44,0) 12% 88%,rgba(255,255,255,.1))}
.tl-sleeve.off{transform:translateX(-115%) rotate(-4deg);opacity:.96}
.tl-meta{opacity:0;transform:translateY(14px);transition:opacity .5s .15s cubic-bezier(.32,.72,0,1),transform .5s .15s cubic-bezier(.32,.72,0,1);text-align:right}
.tl-panel.has-book .tl-meta{opacity:1;transform:none}
.tl-meta h3{font-family:'Leon','Noto Sans Hebrew',sans-serif;font-weight:700;color:var(--navy,#081845);font-size:clamp(20px,2vw,28px);line-height:1.25;margin:0 0 4px}
.tl-year{font-family:'Leon',sans-serif;font-weight:400;color:var(--tl-muted);font-size:12px;letter-spacing:.12em;margin-bottom:14px}
.tl-syn{color:var(--tl-muted);font-size:13px;line-height:1.75;margin:0 0 6px;max-height:30vh;overflow:auto}
.tl-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px;justify-content:flex-start}
.tl-ink-btn{display:inline-flex;align-items:center;gap:.55em;position:relative;z-index:0;font-family:'Leon',sans-serif;font-weight:500;font-size:13.5px;color:var(--navy,#081845);background:transparent;border:none;cursor:pointer;padding:.6em 1.5em;text-decoration:none;transition:color .35s cubic-bezier(.32,.72,0,1),transform .5s cubic-bezier(.32,.72,0,1)}
.tl-ink-btn::before{content:'';position:absolute;inset:0;z-index:-1;border:1.7px solid var(--navy,#081845);border-radius:255px 18px 225px 18px / 18px 225px 18px 255px;filter:url(#inkline);transition:background .35s cubic-bezier(.32,.72,0,1)}
.tl-ink-btn:hover{color:var(--cream,#EADEB7)}
.tl-ink-btn:hover::before{background:var(--navy,#081845)}
.tl-ink-btn:active{transform:scale(.98)}
.tl-sleeve-btn{display:none}
.tl-sleeve-btn.on{display:inline-flex}
.tl-close-hint{margin-top:16px;font-size:11px;color:var(--tl-faint);letter-spacing:.05em;line-height:1.8}
@media (max-width:1024px){
  .tea-lib{height:auto;min-height:100vh;padding:10vw 6vw 6vw}
  .tl-intro{position:static;width:100%;max-width:560px;margin:0 auto 8vw}
  .tl-intro h2{white-space:normal}
  .tl-panel{position:static;width:100%;max-width:460px;margin:0 auto;justify-content:flex-start}
  .tl-stagearea{margin-bottom:24px}
  .tl-shelf{position:relative;left:auto;top:auto;bottom:auto;width:100%;height:78vh;margin-top:4vw;touch-action:none}
  .tl-shelf-hint{position:static;width:100%;margin-top:6px}
  .tl-syn{max-height:none}
}
      `}</style>
    </section>
  );
}
