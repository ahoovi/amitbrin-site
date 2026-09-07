"use client";

/**
 * The round "↑" that the one-pager shows once the top section has scrolled
 * out of view — shared here so a blog post gets the same affordance.
 * `watch` is the id of the element whose disappearance reveals the button.
 */
import { useEffect, useState } from "react";

export default function BackToTop({ watch = "top" }: { watch?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = document.getElementById(watch);
    if (!el) return;
    const io = new IntersectionObserver((es) => setShow(!es[0].isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [watch]);
  return (
    <>
      <style>{CSS}</style>
      <button
        type="button"
        className={"btt" + (show ? " show" : "")}
        aria-label="חזרה לראש העמוד"
        onClick={() => {
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        }}
      >
        ↑
      </button>
    </>
  );
}

const CSS = `
.btt {
  position:fixed; bottom:1.3rem; right:1.3rem; z-index:45;
  width:46px; height:46px; border-radius:50%;
  border:1px solid rgba(255,255,255,.4);
  background:rgba(8,24,69,.55);
  backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
  color:#fff; font-size:1.15rem; line-height:1; cursor:pointer;
  opacity:0; transform:translateY(12px); pointer-events:none;
  transition:opacity .6s cubic-bezier(.32,.72,0,1), transform .6s cubic-bezier(.32,.72,0,1), background .4s cubic-bezier(.32,.72,0,1);
}
.btt.show { opacity:1; transform:none; pointer-events:auto; }
.btt:hover { background:rgba(207,189,133,.55); }
.btt:focus-visible { outline:2px solid #CFBD85; outline-offset:3px; }
@media (max-width:768px){ .btt { bottom:1rem; right:1rem; width:42px; height:42px; } }
`;
