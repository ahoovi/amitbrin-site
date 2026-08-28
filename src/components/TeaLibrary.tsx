"use client";

/**
 * TeaLibrary — "הספרייה של תה" section (work 01).
 *
 * A horizontal 3D shelf. The books stand parallel with their spines out; the
 * one in the middle turns its face to the reader. Navigation is a horizontal
 * swipe inside the shelf — it is deliberately NOT driven by the page scroll,
 * which is what used to make the old pile shimmer on a phone (every scroll
 * frame rewrote a transform on ten books × six textured faces, and an iOS URL
 * bar collapsing counted as 100px of scroll nobody performed).
 *
 * Two pieces of geometry carry the look:
 *  · spacing is measured between the books, not between their centres. A slot
 *    is as wide as the book's PROJECTED width at the shelf angle
 *    (W·cosθ + T·sinθ) plus one constant gap, and every frame re-packs the row
 *    in screen space so the gap stays constant even though the perspective
 *    shrinks the outer books.
 *  · the cast shadow is a quad lying on the floor inside the book's own
 *    transform, so it turns and foreshortens with it. While a book is being
 *    rotated freely it is in the air, so the shadow fades out with the angle.
 *
 * Tapping the centred book pulls it out of the shelf (eased, and 13% closer to
 * the reader via translateZ — real perspective, not a scale) into free
 * rotation. All dimensions come from the print PDFs — see teaLibraryData.ts.
 */

import { useEffect, useRef } from "react";
import { TEA_BOOKS, TEA_STORE, type TeaBook } from "./teaLibraryData";
import InkFrame from "./InkFrame";

/* shelf constants — tuned with Amit on the prototype */
const ANG = 75;        // spine-out angle of every book that is not centred
const BASE = 9;        // the centred book keeps a hint of its own spine
const GAP = 14;        // constant space between two neighbours, px
const DEP = 58;        // z step per book away from the centre
const SHADE = 0.6;     // how dark the row goes towards the edges
const CAST = 1.25;     // cast-shadow strength
const PAD_B = 38;      // floor line inside the stage
const TIP_DELAY = 2000;

export default function TeaLibrary() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rail = root.querySelector<HTMLElement>(".tl-rail")!;
    const stage = root.querySelector<HTMLElement>(".tl-stage")!;
    const tip = root.querySelector<HTMLElement>(".tl-tip")!;
    const tipText = tip.querySelector<HTMLElement>(".tl-tip-text")!;
    const metaTitle = root.querySelector<HTMLElement>(".tl-meta h3")!;
    const metaYear = root.querySelector<HTMLElement>(".tl-year")!;
    const metaSyn = root.querySelector<HTMLElement>(".tl-syn")!;
    const metaCredit = root.querySelector<HTMLElement>(".tl-credit")!;
    const siteBtn = root.querySelector<HTMLAnchorElement>(".tl-site-btn")!;
    const sleeveBtn = root.querySelector<HTMLButtonElement>(".tl-sleeve-btn")!;
    // the label lives in its own span — writing to the button itself would
    // wipe the InkFrame svg that draws its line
    const sleeveLabel = sleeveBtn.querySelector<HTMLElement>(".tl-btn-label")!;

    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const RAD = Math.PI / 180;
    const q = (v: number, n: number) => Math.round(v * n) / n;

    type Slot = {
      el: HTMLElement; box: HTMLElement; book: TeaBook; i: number;
      x: number; w: number; h: number; tf: string; sh: number;
    };
    let S = 1, PERSP = 1150, spinZ = 0, spinY = 0;
    let slots: Slot[] = [];
    let cur = -1, spinning = -1, sleeveOff = false;

    /* projected width of a book standing at a given angle — the cover
       foreshortens, the spine opens up. This is what spacing measures. */
    function projW(b: TeaBook, deg: number) {
      const W = b.w * S, T = Math.max(9, b.t * S);
      return W * Math.abs(Math.cos(deg * RAD)) + T * Math.abs(Math.sin(deg * RAD));
    }

    /* ---------- build ---------- */
    function build() {
      rail.innerHTML = "";
      slots = [];
      const railW = rail.clientWidth, railH = rail.clientHeight;
      if (!railW || !railH) return;
      const maxH = Math.max(...TEA_BOOKS.map((b) => b.h));
      const maxW = Math.max(...TEA_BOOKS.map((b) => b.w));
      S = Math.min((railH - PAD_B - 14) / maxH, (railW * 0.72) / maxW);
      // a fixed perspective on a wide shelf turns the outermost books back
      // towards the camera; tying it to the width keeps one read at every size
      PERSP = Math.round(Math.max(1150, railW * 1.55));
      rail.style.perspective = PERSP + "px";

      // the rail runs LTR internally: the newest book sits on the right, so an
      // RTL swipe (content dragged rightwards) walks back through the years
      [...TEA_BOOKS].reverse().forEach((b) => {
        const i = TEA_BOOKS.indexOf(b);
        const W = Math.round(b.w * S), H = Math.round(b.h * S);
        const T = Math.max(9, Math.round(b.t * S));
        const slotW = Math.round(projW(b, ANG) + GAP);
        const slot = document.createElement("div");
        slot.className = "tl-slot";
        slot.style.width = slotW + "px";
        slot.dataset.i = String(i);
        slot.setAttribute("role", "option");
        slot.setAttribute("aria-label", b.title);
        const spineImg = b.sleeve && b.sleeveSpine ? b.sleeveSpine : b.spine;
        const spineBG = spineImg
          ? `background-image:url('${spineImg}')`
          : `background:${b.spineColor || "#273E58"}`;
        // the spine sits on the right edge of a Hebrew cover and on the left of
        // an English one, so an English book turns the other way to face out
        const spineRot = b.eng ? -90 : 90, foreRot = b.eng ? 90 : -90;
        // a floor shadow seen from near eye level projects to almost nothing,
        // so it has to be genuinely long and pushed towards the viewer
        const castH = Math.max(T * 3, H * 0.52), contactH = Math.max(T * 1.7, H * 0.045);
        slot.innerHTML = `<div class="tl-book" style="width:${W}px;height:${H}px">
  <div class="tl-cast" style="width:${Math.round(W * 1.22)}px;height:${Math.round(castH)}px;transform:translate(-50%,-50%) translateY(${H / 2 + 1}px) rotateX(90deg) translateY(${Math.round(castH * 0.16)}px)"></div>
  <div class="tl-contact" style="width:${Math.round(W * 1.02)}px;height:${Math.round(contactH)}px;transform:translate(-50%,-50%) translateY(${H / 2}px) rotateX(90deg)"></div>
  <div class="tl-f tl-f-cover" style="width:${W}px;height:${H}px;background-image:url('${b.front}');transform:translate(-50%,-50%) translateZ(${T / 2}px)">${b.sleeve ? `<div class="tl-sleeve" style="background-image:url('${b.sleeve}')"></div>` : ""}<div class="tl-gloss"></div></div>
  <div class="tl-f" style="width:${W}px;height:${H}px;background-image:url('${b.back}');transform:translate(-50%,-50%) rotateY(180deg) translateZ(${T / 2}px)"></div>
  <div class="tl-f tl-f-spine" style="width:${T}px;height:${H}px;${spineBG};background-size:100% 100%;transform:translate(-50%,-50%) rotateY(${spineRot}deg) translateZ(${W / 2}px)"></div>
  <div class="tl-f tl-f-pages" style="width:${T - 1}px;height:${H * 0.99}px;transform:translate(-50%,-50%) rotateY(${foreRot}deg) translateZ(${W / 2 - 1}px)"></div>
  <div class="tl-f tl-f-pagesH" style="width:${W * 0.99}px;height:${T - 1}px;transform:translate(-50%,-50%) rotateX(90deg) translateZ(${H / 2 - 1}px)"></div>
  <div class="tl-f tl-f-pagesH" style="width:${W * 0.99}px;height:${T - 1}px;transform:translate(-50%,-50%) rotateX(-90deg) translateZ(${H / 2 - 1}px)"></div>
  <div class="tl-shade" style="width:${W}px;height:${H}px;transform:translate(-50%,-50%) translateZ(${T / 2 + 0.4}px)"></div>
</div>`;
        rail.appendChild(slot);
        slots.push({
          el: slot, box: slot.firstElementChild as HTMLElement, book: b, i,
          x: 0, w: slotW, h: H, tf: "", sh: -1,
        });
      });
      rail.style.paddingLeft = Math.round(railW / 2 - slots[0].w / 2) + "px";
      rail.style.paddingRight = Math.round(railW / 2 - slots[slots.length - 1].w / 2) + "px";
      slots.forEach((s) => { s.x = s.el.offsetLeft + s.w / 2; });
      rail.scrollLeft = rail.scrollWidth;
      layout(true);
      setMeta(0, true);
    }

    /* continuous index of the shelf centre — exact even though every slot is a
       different width */
    function centreIndex() {
      const cx = rail.scrollLeft + rail.clientWidth / 2;
      const last = slots.length - 1;
      if (cx <= slots[0].x) return 0;
      if (cx >= slots[last].x) return last;
      for (let k = 0; k < last; k++) {
        if (cx < slots[k + 1].x) return k + (cx - slots[k].x) / (slots[k + 1].x - slots[k].x);
      }
      return last;
    }

    function layout(force: boolean) {
      if (!slots.length) return;
      const t = centreIndex(), N = slots.length;
      const cx = rail.scrollLeft + rail.clientWidth / 2;
      const rot: number[] = [], kk: number[] = [], hw: number[] = [], pos: number[] = [];
      let best = -1, bd = Infinity;
      for (let n = 0; n < N; n++) {
        const s = slots[n], d = n - t, ad = Math.abs(d);
        if (ad < bd) { bd = ad; best = s.i; }
        const e = ad >= 1 ? 1 : ad * ad * (3 - 2 * ad);   // smoothstep
        rot[n] = (s.book.eng ? 1 : -1) * (BASE + (ANG - BASE) * e);
        // the perspective shrink has to be in the arithmetic, otherwise gaps
        // that are constant on paper open up towards the edges of the screen
        kk[n] = PERSP / (PERSP + Math.min(ad, 3) * DEP);
        hw[n] = projW(s.book, rot[n]) / 2 * kk[n];
      }
      // pack outwards from the centre with one constant gap between neighbours
      const k0 = Math.max(0, Math.min(N - 2, Math.floor(t)));
      const fr = Math.max(0, Math.min(1, t - k0));
      pos[k0] = 0;
      for (let n = k0 + 1; n < N; n++) pos[n] = pos[n - 1] + hw[n - 1] + GAP + hw[n];
      for (let n = k0 - 1; n >= 0; n--) pos[n] = pos[n + 1] - hw[n + 1] - GAP - hw[n];
      const shift = -(pos[k0] * (1 - fr) + pos[k0 + 1] * fr);
      for (let n = 0; n < N; n++) {
        const s = slots[n];
        if (s.i === spinning) continue;
        const ad = Math.abs(n - t);
        const u = (pos[n] + shift) / kk[n] - (s.x - cx);
        const tf = `translate3d(${q(u, 1)}px,0,${q(-Math.min(ad, 3) * DEP, 1)}px) rotateX(0deg) rotateY(${q(rot[n], 2)}deg)`;
        if (force || tf !== s.tf) { s.tf = tf; s.box.style.transform = tf; }
        const shade = q(Math.min(ad, 1.5) / 1.5 * SHADE, 50);
        if (force || shade !== s.sh) {
          s.sh = shade;
          s.box.style.setProperty("--tl-sh", String(shade));
          s.box.style.setProperty("--tl-dr", ((1 - Math.min(ad, 2.4) * 0.26) * CAST).toFixed(2));
        }
      }
      if (best >= 0 && best !== cur) setMeta(best, false);
    }

    let ticking = false;
    const onScroll = () => {
      hideTip(); armIdle();
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; layout(false); });
    };
    rail.addEventListener("scroll", onScroll, { passive: true });

    /* ---------- the book panel ---------- */
    let settleT: ReturnType<typeof setTimeout> | undefined;
    function setMeta(i: number, now: boolean) {
      cur = i;
      const b = TEA_BOOKS[i];
      metaTitle.textContent = b.title;
      metaYear.textContent = b.year || "";
      siteBtn.href = b.url || TEA_STORE;
      siteBtn.style.display = b.noStore ? "none" : "inline-flex";
      sleeveBtn.style.display = b.sleeve ? "inline-flex" : "none";
      slots.forEach((s) => s.el.classList.toggle("tl-on", s.i === i));
      const fill = () => {
        const bb = TEA_BOOKS[cur];
        metaSyn.textContent = bb.syn || "";
        metaCredit.textContent = bb.ill ? `איור הכריכה · ${bb.ill}` : "";
        metaSyn.classList.remove("tl-dim");
        metaCredit.classList.remove("tl-dim");
      };
      clearTimeout(settleT);
      if (now) { fill(); return; }
      // the long text lands when the swipe stops, not during it
      metaSyn.classList.add("tl-dim");
      metaCredit.classList.add("tl-dim");
      settleT = setTimeout(fill, 170);
    }

    /* ---------- free rotation ---------- */
    let rx = -6, ry = 0, drag = false, moved = false, lx = 0, ly = 0;
    let moveT: ReturnType<typeof setTimeout> | undefined;
    const faces = (box: HTMLElement) => box.querySelectorAll<HTMLElement>(".tl-f");

    function renderSpin(s: Slot) {
      s.box.style.transform = `translate3d(0px,${spinY}px,${spinZ}px) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg)`;
      const LIGHT = -32;
      const norms = [0, 180, s.book.eng ? -90 : 90, s.book.eng ? 90 : -90, 0, 0];
      faces(s.box).forEach((f, k) => {
        const lit = Math.max(0, Math.cos((ry + norms[k] - LIGHT) * RAD));
        f.style.filter = `brightness(${(0.72 + 0.42 * lit).toFixed(3)})`;
      });
      const g = s.box.querySelector<HTMLElement>(".tl-gloss");
      if (g) {
        const yr = ((ry % 360) + 360) % 360;
        const amt = Math.max(0, 0.06 + 0.2 * Math.cos((yr + 32) * RAD) - Math.abs(rx) * 0.001);
        const ang = 115 + Math.sin(yr * RAD) * 40 - rx * 0.8;
        g.style.background = `linear-gradient(${ang.toFixed(0)}deg,rgba(255,255,255,${amt.toFixed(3)}),rgba(255,255,255,0) 50%,rgba(2,13,44,.22))`;
      }
      // a book held in the air has no business casting a shadow on the shelf:
      // the further it turns from where it stood, the more the floor gives way
      const dev = Math.min(1, Math.abs(rx + 6) / 50 + Math.abs(ry) / 120);
      s.box.style.setProperty("--tl-dr", (1 - dev).toFixed(2));
    }

    function enterSpin(s: Slot) {
      spinning = s.i;
      rail.classList.add("tl-locked");
      spinZ = Math.round(PERSP * 0.115);   // ≈ 13% closer to the reader
      // coming forward magnifies about the vanishing point, which would drag
      // the book downwards on the way — hold its centre where it stood
      const cy = (rail.clientHeight - PAD_B - s.h / 2) - rail.clientHeight * 0.4;
      spinY = Math.round(-cy * 0.115 - 6);
      s.box.classList.add("tl-spin");
      if (!reduce) s.box.classList.add("tl-moving");
      s.box.style.setProperty("--tl-sh", "0");
      rx = -6; ry = 0; taught = true;
      renderSpin(s);
      hideTip();
      clearTimeout(moveT);
      moveT = setTimeout(() => { s.box.classList.remove("tl-moving"); armIdle(); }, 640);
    }

    function exitSpin() {
      const s = slots.find((x) => x.i === spinning);
      if (!s) return;
      spinning = -1;
      rail.classList.remove("tl-locked");
      s.box.classList.remove("tl-spin");
      if (!reduce) s.box.classList.add("tl-moving");
      faces(s.box).forEach((f) => { f.style.filter = ""; });
      const g = s.box.querySelector<HTMLElement>(".tl-gloss");
      if (g) g.style.background = "";
      s.tf = ""; s.sh = -1;
      layout(true);
      hideTip();
      clearTimeout(moveT);
      moveT = setTimeout(() => { s.box.classList.remove("tl-moving"); armIdle(); }, 640);
    }

    const onPointerDown = (e: PointerEvent) => {
      hideTip(); clearTimeout(idleT);
      const box = (e.target as HTMLElement).closest<HTMLElement>(".tl-book");
      if (!box) return;
      const s = slots.find((x) => x.box === box);
      if (!s) return;
      drag = true; moved = false; lx = e.clientX; ly = e.clientY;
      if (spinning === s.i) {
        clearTimeout(moveT);
        box.classList.remove("tl-moving");
        try { box.setPointerCapture(e.pointerId); } catch { /* face swapped mid-gesture */ }
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!drag || spinning < 0) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      const s = slots.find((x) => x.i === spinning);
      if (!s) return;
      ry += dx * 0.45;
      rx = Math.max(-80, Math.min(80, rx - dy * 0.45));
      renderSpin(s);
    };
    // a touch the browser takes over for scrolling fires pointercancel, never
    // pointerup — without this the book stays glued to the finger
    const endDrag = () => { drag = false; armIdle(); };
    const onClick = (e: MouseEvent) => {
      const box = (e.target as HTMLElement).closest<HTMLElement>(".tl-book");
      if (!box) return;
      const s = slots.find((x) => x.box === box);
      if (!s) return;
      if (spinning === s.i) { if (!moved) exitSpin(); return; }
      if (spinning >= 0) { exitSpin(); return; }
      if (s.i !== cur) {
        rail.scrollTo({ left: s.x - rail.clientWidth / 2, behavior: reduce ? "auto" : "smooth" });
        return;
      }
      enterSpin(s);
    };
    rail.addEventListener("pointerdown", onPointerDown);
    rail.addEventListener("pointermove", onPointerMove);
    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);
    rail.addEventListener("click", onClick);

    /* ---------- the sleeve ---------- */
    const onSleeve = () => {
      const s = slots.find((x) => x.book.sleeve);
      if (!s) return;
      const sl = s.box.querySelector<HTMLElement>(".tl-sleeve");
      if (!sl) return;
      sleeveOff = !sleeveOff;
      sl.classList.toggle("tl-off", sleeveOff);
      sleeveLabel.textContent = sleeveOff ? "להחזיר את השרוול" : "להציץ מתחת לשרוול";
      const b = s.book;
      const face = s.box.querySelector<HTMLElement>(".tl-f-spine");
      if (face && b.spine && b.sleeveSpine) {
        // swap the spine mid-move, while the sleeve is already off the cover
        setTimeout(() => {
          face.style.backgroundImage = `url('${sleeveOff ? b.spine : b.sleeveSpine}')`;
        }, sleeveOff ? 420 : 60);
      }
    };
    sleeveBtn.addEventListener("click", onSleeve);

    /* ---------- the hints ---------- */
    let idleT: ReturnType<typeof setTimeout> | undefined;
    let tipT: ReturnType<typeof setTimeout> | undefined;
    let taught = false, armed = true, inView = false;
    function showTip(text: string) {
      tipText.textContent = text;
      tip.classList.add("tl-on");
      armed = false;                 // shown once — it returns after a touch
      clearTimeout(tipT);
      tipT = setTimeout(() => tip.classList.remove("tl-on"), 6000);
    }
    function hideTip() { clearTimeout(tipT); tip.classList.remove("tl-on"); }
    /* the hint arrives after two still seconds — and only while the shelf is
       actually on screen, otherwise it fires into a section nobody is at */
    function armIdle() {
      armed = true;
      clearTimeout(idleT);
      if (!inView || reduce) return;
      idleT = setTimeout(() => {
        if (!armed) return;
        if (spinning >= 0) showTip("גררו כדי לסובב / לחצו כדי להחזיר למדף");
        else if (!taught) showTip("לחצו על הספר לצפייה מכל הכיוונים");
      }, TIP_DELAY);
    }
    const io = new IntersectionObserver((es) => {
      inView = es[0].isIntersecting;
      if (inView) armIdle();
      else { clearTimeout(idleT); hideTip(); }
    }, { threshold: 0.4 });
    io.observe(stage);

    /* ---------- keyboard ---------- */
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const n = slots.findIndex((s) => s.i === cur) + (e.key === "ArrowLeft" ? -1 : 1);
      const s = slots[Math.max(0, Math.min(slots.length - 1, n))];
      if (s) rail.scrollTo({ left: s.x - rail.clientWidth / 2, behavior: reduce ? "auto" : "smooth" });
    };
    rail.addEventListener("keydown", onKey);

    /* ---------- boot ---------- */
    build();
    // only a real width change counts: on a phone the URL bar collapsing
    // changes innerHeight by ~60px and must not rebuild the shelf
    let rw = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === rw) return;
      rw = window.innerWidth;
      const keep = cur;
      build();
      const s = slots.find((x) => x.i === keep);
      if (s) { rail.scrollLeft = s.x - rail.clientWidth / 2; layout(true); setMeta(keep, true); }
    };
    window.addEventListener("resize", onResize);
    armIdle();

    return () => {
      clearTimeout(settleT); clearTimeout(idleT); clearTimeout(tipT); clearTimeout(moveT);
      io.disconnect();
      rail.removeEventListener("scroll", onScroll);
      rail.removeEventListener("pointerdown", onPointerDown);
      rail.removeEventListener("pointermove", onPointerMove);
      rail.removeEventListener("pointerup", endDrag);
      rail.removeEventListener("pointercancel", endDrag);
      rail.removeEventListener("click", onClick);
      rail.removeEventListener("keydown", onKey);
      sleeveBtn.removeEventListener("click", onSleeve);
      window.removeEventListener("resize", onResize);
      rail.innerHTML = "";
    };
  }, []);

  return (
    <section className="tea-lib" id="tea-library" ref={rootRef}>
      <div className="tl-paper" aria-hidden />

      <div className="tl-intro">
        <div className="tl-kicker">עיצוב ועימוד לדפוס ולדיגיטל</div>
        <h2>הספרייה של תה</h2>
        <p>לפני שמונה שנים פנה אליי סופר שכותב תחת השם הבדוי &quot;תה&quot;, וביקש עיצוב ועימוד לספר שכתב — &quot;אליוט&quot;. מאז עיצבתי לו תשעה ספרים, חלקם בגרסאות אנגלית לקהל בינלאומי, ואפילו ספר ילדים אחד שגם עזרתי לאייר.</p>
        <p>השבוע תה משיק את ספרו העשירי — ספר אוטוביוגרפי, שבו הוא נחשף לראשונה בשמו האמיתי. זה אירוע חגיגי בשבילו (וגם בשבילי!) כי הספר הזה מחבר בין העולמות הבדיוניים, המרגשים והרומנטיים שברא לבין העולם האמיתי שמאחוריהם. אני כבר קראתי כל אחד ואחד מהספרים האלה והתרגשתי, ועכשיו, להיות חלק מהמהלך האישי הזה — זה בכלל מרגש ברמה אחרת.</p>
        <p className="tl-invite">אתם מוזמנים לעבור על הספרייה ולבחור לעצמכם מסע.</p>
        <a className="tl-ink-btn" href={TEA_STORE} target="_blank" rel="noopener noreferrer"><InkFrame seed={1} />לחנות הספרים של תה</a>
      </div>

      <div className="tl-stage">
        <div className="tl-ground" aria-hidden />
        <div className="tl-tip" aria-hidden>
          <svg viewBox="0 0 48 48" width="19" height="19" aria-hidden>
            {/* two orbits — one horizontal, one vertical: rotation on both axes */}
            <ellipse cx="24" cy="24" rx="20" ry="8.4" />
            <ellipse cx="24" cy="24" rx="8.4" ry="20" />
            <path d="M40.4 19.6 L44.6 24.2 L39.8 27.9" />
            <path d="M19.6 7.6 L24.2 3.4 L27.9 8.2" />
          </svg>
          <span className="tl-tip-text" />
        </div>
        <div className="tl-rail" role="listbox" aria-label="הספרים בספרייה של תה" tabIndex={0} />
      </div>

      <div className="tl-meta">
        <h3 />
        <div className="tl-year" />
        <p className="tl-syn" />
        <div className="tl-credit" />
        <div className="tl-row">
          <a className="tl-ink-btn tl-site-btn" href={TEA_STORE} target="_blank" rel="noopener noreferrer"><InkFrame seed={2} />לעמוד הספר באתר של תה</a>
          <button className="tl-ink-btn tl-sleeve-btn" type="button"><InkFrame seed={3} /><span className="tl-btn-label">להציץ מתחת לשרוול</span></button>
        </div>
      </div>

      <style>{`
.tea-lib{position:relative;color:var(--navy,#081845);--tl-muted:#3d4a66;--tl-faint:#7d8299;
  --tl-stage:clamp(276px,42svh,378px);-webkit-tap-highlight-color:transparent;
  padding:10vw 6vw 8vw}
.tea-lib *{user-select:none;-webkit-user-select:none}
.tl-paper{position:absolute;inset:0;z-index:0;pointer-events:none;filter:saturate(.85);background-color:#fdfaf2;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.012 0.016' numOctaves='4' seed='547'/><feDiffuseLighting lighting-color='%23fdfaf2' surfaceScale='2.2'><feDistantLight azimuth='235' elevation='58'/></feDiffuseLighting></filter><rect width='100%25' height='100%25' filter='url(%23p)'/></svg>"),
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1400' height='1400'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.006' numOctaves='3' seed='47'/><feDiffuseLighting lighting-color='%23dcd6db' surfaceScale='3.4'><feDistantLight azimuth='235' elevation='55'/></feDiffuseLighting></filter><rect width='100%25' height='100%25' filter='url(%23f)' opacity='0.5'/></svg>");
  background-size:900px 900px,1400px 1400px;background-blend-mode:multiply;opacity:.9}

.tl-intro{position:relative;z-index:5;max-width:560px;margin:0 auto}
.tl-kicker{font-family:'Leon',sans-serif;font-weight:400;color:var(--tl-muted);font-size:12px;letter-spacing:.1em;margin-bottom:12px}
.tl-intro h2{font-family:'Leon','Noto Sans Hebrew',sans-serif;font-weight:700;color:var(--navy,#081845);font-size:clamp(24px,2.3vw,34px);line-height:1.15;margin:0 0 20px}
.tl-intro p{color:var(--tl-muted);font-size:13.5px;line-height:1.78;margin:0 0 12px}
.tl-intro p.tl-invite{color:var(--navy,#081845);font-weight:700;font-size:15.5px;line-height:1.7;margin-top:18px;margin-bottom:16px}

/* ---- the shelf ---- */
.tl-stage{position:relative;z-index:2;margin:26px -6vw 0}
.tl-ground{position:absolute;left:0;right:0;bottom:24px;height:74px;pointer-events:none;z-index:0;
  background:linear-gradient(180deg,rgba(2,13,44,0) 0,rgba(2,13,44,.055) 76%,rgba(2,13,44,0) 100%)}
.tl-rail{position:relative;z-index:1;display:flex;align-items:flex-end;height:var(--tl-stage);direction:ltr;
  overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;overscroll-behavior-x:contain;
  perspective-origin:50% 40%;scrollbar-width:none}
.tl-rail::-webkit-scrollbar{display:none}
.tl-rail:focus-visible{outline:2px solid var(--navy,#081845);outline-offset:-2px}
.tl-rail.tl-locked{overflow-x:hidden}
.tl-slot{flex:0 0 auto;display:flex;align-items:flex-end;justify-content:center;height:100%;
  padding-bottom:38px;transform-style:preserve-3d;position:relative;
  scroll-snap-align:center;scroll-snap-stop:always;transition:opacity .45s cubic-bezier(.32,.72,0,1)}
.tl-rail.tl-locked .tl-slot:not(.tl-on){opacity:.14}
.tl-book{position:relative;transform-style:preserve-3d;cursor:pointer}
.tl-book.tl-spin{cursor:grab;touch-action:none}
.tl-book.tl-spin:active{cursor:grabbing}
/* the pull out of the shelf: one eased move that also brings the book closer */
.tl-book.tl-moving{transition:transform .62s cubic-bezier(.32,.72,0,1)}
.tl-book.tl-moving .tl-cast,.tl-book.tl-moving .tl-contact{transition:opacity .55s}
.tl-f{position:absolute;left:50%;top:50%;background-size:100% 100%;backface-visibility:hidden}
.tl-f-cover{box-shadow:0 0 0 .5px rgba(2,13,44,.2)}
.tl-f-pages{background:linear-gradient(90deg,rgba(2,13,44,.2),rgba(2,13,44,0) 40% 60%,rgba(2,13,44,.2)),repeating-linear-gradient(90deg,#efe9da 0 2px,#d5cebd 2px 3px)}
.tl-f-pagesH{background:linear-gradient(0deg,rgba(2,13,44,.16),rgba(2,13,44,0) 42% 58%,rgba(2,13,44,.16)),repeating-linear-gradient(0deg,#efe9da 0 2px,#d5cebd 2px 3px)}
.tl-shade{position:absolute;left:50%;top:50%;pointer-events:none;background:#020D2C;opacity:var(--tl-sh,0)}
.tl-gloss{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen}
/* a real quad lying on the floor, inside the book's transform */
.tl-cast{position:absolute;left:50%;top:50%;pointer-events:none;opacity:var(--tl-dr,.6);
  background:radial-gradient(58% 52% at 50% 36%,rgba(2,13,44,.72),rgba(2,13,44,.3) 42%,rgba(2,13,44,0) 78%)}
.tl-contact{position:absolute;left:50%;top:50%;pointer-events:none;opacity:var(--tl-dr,.6);
  background:radial-gradient(52% 60% at 50% 50%,rgba(2,13,44,.78),rgba(2,13,44,0) 78%)}
.tl-sleeve{position:absolute;inset:0;background-size:100% 100%;border-radius:1px;
  box-shadow:-5px 0 13px rgba(2,13,44,.28);
  transition:transform .95s cubic-bezier(.55,.06,.2,1),opacity .42s .42s linear}
.tl-sleeve::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(2,13,44,.13),rgba(2,13,44,0) 12% 88%,rgba(255,255,255,.1))}
.tl-sleeve.tl-off{transform:translate(-5%,-52%) rotate(-3.2deg);opacity:0}

.tl-tip{position:absolute;left:50%;top:26px;z-index:6;pointer-events:none;
  display:flex;align-items:center;gap:8px;white-space:nowrap;
  padding:6px 13px;border-radius:999px;background:rgba(8,24,69,.87);color:#f4efe2;
  font-family:'Leon',sans-serif;font-size:11.5px;letter-spacing:.02em;
  box-shadow:0 8px 22px rgba(2,13,44,.22);
  opacity:0;transform:translate(-50%,7px);
  transition:opacity .42s cubic-bezier(.32,.72,0,1),transform .42s cubic-bezier(.32,.72,0,1)}
.tl-tip.tl-on{opacity:1;transform:translate(-50%,0)}
.tl-tip svg{flex:0 0 auto;fill:none;stroke:currentColor;stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round;opacity:.95}
.tl-tip.tl-on svg{animation:tlSpinHint 2.6s ease-in-out .3s 2}
@keyframes tlSpinHint{0%,100%{transform:rotate(0)}35%{transform:rotate(14deg)}70%{transform:rotate(-14deg)}}

/* ---- the book, one level in from the section that holds it ---- */
.tl-meta{position:relative;z-index:4;max-width:560px;margin:26px auto 0;
  padding:2px 27px 0 0;border-right:1px solid rgba(8,24,69,.15);min-height:190px;text-align:right}
.tl-meta h3{font-family:'Leon','Noto Sans Hebrew',sans-serif;font-weight:700;color:var(--navy,#081845);
  font-size:clamp(20px,2vw,28px);line-height:1.25;margin:0 0 4px;text-wrap:balance}
.tl-year{font-family:'Leon',sans-serif;font-weight:400;color:var(--tl-muted);font-size:12px;letter-spacing:.12em;margin-bottom:12px}
.tl-syn{color:var(--tl-muted);font-size:13px;line-height:1.78;margin:0;transition:opacity .28s}
.tl-credit{margin-top:.55em;font-size:11.5px;line-height:1.7;color:var(--tl-faint);transition:opacity .28s}
.tl-syn.tl-dim,.tl-credit.tl-dim{opacity:.2}
.tl-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px;justify-content:flex-start}
.tl-ink-btn{display:inline-flex;align-items:center;gap:.55em;position:relative;z-index:0;
  font-family:'Leon',sans-serif;font-weight:500;font-size:13.5px;color:var(--navy,#081845);
  background:transparent;border:none;cursor:pointer;padding:.6em 1.5em;text-decoration:none;
  transition:color .35s cubic-bezier(.32,.72,0,1),transform .5s cubic-bezier(.32,.72,0,1)}
.tl-ink-btn:active{transform:scale(.98)}
.tl-ink-btn .ink-path{stroke:var(--navy,#081845)}

@media (prefers-reduced-motion:reduce){
  .tl-tip,.tl-sleeve,.tl-syn,.tl-credit,.tl-slot{transition:none}
  .tl-tip.tl-on svg{animation:none}
}

@media (max-width:1024px){
  /* mandatory scroll-snap fights sections taller than the viewport (the snap
     yanks the scroll back past this section) — turn it off on small screens */
  html{scroll-snap-type:none !important}
}

/* ---- desktop: intro right, book left, shelf across the bottom ---- */
/* ---- desktop: the section stays one viewport tall because the page snaps
        section by section. Intro on the right, the chosen book on the left,
        and the shelf takes whatever height is left over. ---- */
@media (min-width:1025px){
  .tea-lib{height:100vh;overflow:hidden;padding:0;display:grid;
    grid-template-columns:1fr 1fr;grid-template-rows:auto minmax(0,1fr);
    column-gap:5%;--tl-stage:100%}
  .tl-intro{grid-column:1;grid-row:1;max-width:min(430px,92%);margin:6vh 0 0 auto;padding-inline-end:5%}
  .tl-meta{grid-column:2;grid-row:1;max-width:min(410px,92%);margin:6vh auto 0 0;
    padding:2px 27px 0 0;min-height:0}
  .tl-meta .tl-syn{max-height:24vh;overflow:auto}
  .tl-stage{grid-column:1/-1;grid-row:2;margin:0;min-height:0}
  .tl-slot{padding-bottom:52px}
  .tl-ground{bottom:38px;height:96px}
}
@media (min-width:1025px) and (max-height:880px){
  .tl-intro{margin-top:4vh}
  .tl-intro p{font-size:12.6px;line-height:1.68;margin-bottom:9px}
  .tl-intro h2{margin-bottom:14px}
  .tl-meta{margin-top:4vh}
  .tl-meta .tl-syn{max-height:19vh}
}
      `}</style>
    </section>
  );
}

/**
 * The library's paper surface, exported so the works heading above it can sit
 * on the very same sheet — the title is an extension of this section, not a
 * band of its own.
 */
export const TEA_PAPER_CSS = `
.tea-paper { position:relative; background-color:#fdfaf2; }
.tea-paper::before {
  content:''; position:absolute; inset:0; z-index:0; pointer-events:none;
  filter:saturate(.85); opacity:.9; background-color:#fdfaf2;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.012 0.016' numOctaves='4' seed='547'/><feDiffuseLighting lighting-color='%23fdfaf2' surfaceScale='2.2'><feDistantLight azimuth='235' elevation='58'/></feDiffuseLighting></filter><rect width='100%25' height='100%25' filter='url(%23p)'/></svg>"),
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1400' height='1400'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.006' numOctaves='3' seed='47'/><feDiffuseLighting lighting-color='%23dcd6db' surfaceScale='3.4'><feDistantLight azimuth='235' elevation='55'/></feDiffuseLighting></filter><rect width='100%25' height='100%25' filter='url(%23f)' opacity='0.5'/></svg>");
  background-size:900px 900px,1400px 1400px; background-blend-mode:multiply;
}
.tea-paper > * { position:relative; z-index:1; }
`;
