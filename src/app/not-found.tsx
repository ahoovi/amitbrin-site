import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "העמוד הזה לא כאן",
  robots: { index: false, follow: true },
};

/**
 * 404 — in the drafting-paper language of the blog, because that is where a
 * wrong URL most often lands. Two real ways out, no dead end.
 */
export default function NotFound() {
  return (
    <div className="nf-root" dir="rtl" lang="he">
      <style>{CSS}</style>
      <div className="nf-card">
        <p className="nf-code">404</p>
        <h1 className="nf-h">העמוד הזה לא כאן</h1>
        <p className="nf-x">
          יכול להיות שהכתובת השתנתה, יכול להיות שהיא נכתבה עם טעות קטנה. בכל מקרה — אין מה
          לעשות בעמוד הזה. שני מקומות שכן שווים את הזמן:
        </p>
        <div className="nf-links">
          <Link href="/">לעמוד הראשי</Link>
          <span aria-hidden>·</span>
          <Link href="/blog">לתרחיב, הבלוג</Link>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.nf-root{
  --navy:#081845; --muted:#4a5570; --gold:#CFBD85; --gg:12px;
  --grid-minor:hsla(223,60%,20%,.036); --grid-major:hsla(223,60%,20%,.096);
  min-height:100vh; display:flex; align-items:center; justify-content:center;
  padding:2rem 1.2rem; color:var(--navy);
  font-family:'Alef','Noto Sans Hebrew',Arial,sans-serif;
  background-color:#EFF1F5;
  background-image:
    linear-gradient(var(--grid-minor) 0 1px, transparent 1px var(--gg)),
    linear-gradient(to right, var(--grid-minor) 0 1px, transparent 1px var(--gg)),
    linear-gradient(var(--grid-major) 0 1px, transparent 1px calc(var(--gg)*5)),
    linear-gradient(to right, var(--grid-major) 0 1px, transparent 1px calc(var(--gg)*5));
  background-size:var(--gg) var(--gg), var(--gg) var(--gg), calc(var(--gg)*5) calc(var(--gg)*5), calc(var(--gg)*5) calc(var(--gg)*5);
}
.nf-card{max-width:34rem; text-align:center}
.nf-code{
  font-family:'Leon','Alef',sans-serif; font-size:clamp(3.5rem,12vw,6rem); line-height:1;
  margin:0 0 .4rem; color:var(--gold); font-variant-numeric:tabular-nums; letter-spacing:.04em;
}
.nf-h{font-family:'Leon','Alef',sans-serif; font-weight:700; font-size:clamp(1.4rem,4vw,2.2rem); margin:0 0 1rem; line-height:1.2}
.nf-x{color:var(--muted); line-height:1.75; margin:0 0 1.8rem}
.nf-links{display:flex; gap:.9rem; justify-content:center; align-items:center; flex-wrap:wrap}
.nf-links a{
  color:var(--navy); text-decoration:none; font-family:'Leon','Alef',sans-serif; font-weight:500;
  border-bottom:1.5px solid rgba(8,24,69,.3); padding-bottom:.15em;
  transition:border-color .35s cubic-bezier(.32,.72,0,1);
}
.nf-links a:hover{border-color:var(--navy)}
.nf-links a:focus-visible{outline:2px solid var(--gold); outline-offset:4px}
`;
