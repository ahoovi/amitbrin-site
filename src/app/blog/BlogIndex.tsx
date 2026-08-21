"use client";

/**
 * /blog — the index of what already exists. Not a new design: the drafting-
 * paper ground, the "תרחיב" header artwork and the ink-framed cards are the
 * same vocabulary the blog section of the one-pager already uses, so arriving
 * here from a search result feels like arriving at the same site.
 */

import InkFrame from "../../components/InkFrame";
import { POSTS_INDEX } from "../../components/postsIndex";

function formatHe(iso?: string) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default function BlogIndex() {
  return (
    <div className="bi-root" dir="rtl" lang="he">
      <style>{CSS}</style>

      <nav className="bi-nav" aria-label="ניווט ראשי">
        <a href="/" className="bi-logo">עמית ברין</a>
        <div className="bi-links">
          <a href="/">ראשי</a>
          <a href="/blog" aria-current="page">תרחיב</a>
          <a href="/#footer">דברו איתי</a>
        </div>
      </nav>

      <header className="bi-head">
        {/* the same header artwork as the one-pager: the title sits inside its
            clear centre, exactly as it does there */}
        <div className="bi-mark">
          <img src="/media/tarhiv-blog-header.svg" alt="" className="bi-tarhiv" aria-hidden />
          <h1 className="bi-title">כתיבה על עיצוב<br />וחוויית שימוש</h1>
        </div>
        <p className="bi-sub">
          מחשבות על עיצוב, מוצר, טיפוגרפיה ובינה מלאכותית. נכתב מתוך עשייה, לא מתוך סיכום.
        </p>
      </header>

      <main className="bi-list">
        {POSTS_INDEX.map((p, i) => {
          const date = formatHe(p.published);
          return (
            <article className="bi-card" key={p.slug}>
              <InkFrame kind="box" seed={i} />
              <a className="bi-cover" href={p.href} tabIndex={-1} aria-hidden>
                <img src={p.cover} alt="" loading="lazy" />
              </a>
              <div className="bi-body">
                <h2 className="bi-h2">
                  <a href={p.href}>{p.title}</a>
                </h2>
                {date ? (
                  <time className="bi-date" dateTime={p.published}>{date}</time>
                ) : null}
                <p className="bi-x">{p.intro}</p>
                <a href={p.href} className="bi-btn">
                  <InkFrame seed={i + 4} />
                  לפוסט המלא <span aria-hidden>←</span>
                </a>
              </div>
            </article>
          );
        })}
      </main>

      <footer className="bi-foot">
        <a href="/blog/rss.xml">RSS</a>
        <span aria-hidden>·</span>
        <a href="/">חזרה לאתר</a>
      </footer>
    </div>
  );
}

const CSS = `
.bi-root{
  --navy:#081845; --muted:#4a5570; --gold:#CFBD85;
  --ease:cubic-bezier(.32,.72,0,1);
  --gg:12px;
  --grid-minor:hsla(223,60%,20%,.036);
  --grid-major:hsla(223,60%,20%,.096);
  min-height:100vh; color:var(--navy);
  font-family:'Alef','Noto Sans Hebrew',Arial,sans-serif;
  background-color:#EFF1F5;
  background-image:
    linear-gradient(var(--grid-minor) 0 1px, transparent 1px var(--gg)),
    linear-gradient(to right, var(--grid-minor) 0 1px, transparent 1px var(--gg)),
    linear-gradient(var(--grid-major) 0 1px, transparent 1px calc(var(--gg)*5)),
    linear-gradient(to right, var(--grid-major) 0 1px, transparent 1px calc(var(--gg)*5));
  background-size:var(--gg) var(--gg), var(--gg) var(--gg), calc(var(--gg)*5) calc(var(--gg)*5), calc(var(--gg)*5) calc(var(--gg)*5);
}
.bi-root *{box-sizing:border-box}

.bi-nav{
  display:flex; align-items:center; justify-content:space-between; gap:1.5rem;
  padding:1.1rem clamp(1.1rem,5vw,3rem); position:sticky; top:0; z-index:10;
  backdrop-filter:blur(9px); background:rgba(239,241,245,.78);
  border-bottom:1px solid rgba(8,24,69,.08);
}
.bi-logo{font-weight:700; color:var(--navy); text-decoration:none; letter-spacing:.02em}
.bi-links{display:flex; gap:1.4rem}
.bi-links a{color:var(--muted); text-decoration:none; font-size:.95rem}
.bi-links a:hover, .bi-links a[aria-current]{color:var(--navy)}

.bi-head{text-align:center; padding:clamp(1.5rem,4vw,3rem) 0 clamp(1.5rem,4vw,3rem)}
.bi-mark{position:relative; width:100%; aspect-ratio:1900 / 292}
.bi-tarhiv{position:absolute; inset:0; width:100%; height:100%; display:block; pointer-events:none}
.bi-title{
  position:absolute; z-index:2; left:50%; top:50%; transform:translate(-50%,-50%);
  width:min(52%,640px); margin:0;
  font-family:'Leon','Alef',sans-serif; font-weight:700;
  font-size:clamp(1.1rem,2.7vw,2.6rem); line-height:1.1; text-wrap:balance;
}
.bi-sub{margin:clamp(1rem,2.5vw,2rem) auto 0; max-width:56ch; padding:0 clamp(1.1rem,5vw,3rem); color:var(--muted); line-height:1.7}

.bi-list{
  display:flex; flex-direction:column; gap:clamp(1.6rem,3vw,2.4rem);
  max-width:72rem; margin:0 auto; padding:clamp(1rem,3vw,2rem) clamp(1.1rem,5vw,3rem) 4rem;
}
.bi-card{
  position:relative; z-index:0;
  display:grid; grid-template-columns:minmax(0,17rem) 1fr; gap:clamp(1rem,2.5vw,2rem);
  padding:1.1rem 1.1rem 1.4rem;
  transition:transform .5s var(--ease);
}
.bi-card:hover{transform:translateY(-3px)}
.bi-card .ink-path{stroke:var(--navy)}
.bi-cover{display:block; aspect-ratio:16/10; overflow:hidden; border-radius:9px; background:rgba(2,13,44,.06)}
.bi-cover img{width:100%; height:100%; object-fit:cover; display:block}
.bi-body{display:flex; flex-direction:column; align-items:flex-start; min-width:0}
.bi-h2{margin:.2rem 0 .5rem; font-family:'Leon','Alef',sans-serif; font-weight:700; font-size:clamp(1.15rem,2.2vw,1.6rem); line-height:1.25}
.bi-h2 a{color:var(--navy); text-decoration:none}
.bi-h2 a:hover{text-decoration:underline; text-underline-offset:.22em}
.bi-date{display:block; font-size:.82rem; letter-spacing:.08em; color:var(--muted); margin-bottom:.7rem; font-variant-numeric:tabular-nums}
.bi-x{margin:0 0 1.3rem; color:var(--muted); line-height:1.7; max-width:62ch}
.bi-btn{
  display:inline-flex; align-items:center; gap:.55em; position:relative; z-index:0;
  margin-top:auto; font-family:'Leon','Alef',sans-serif; font-weight:500;
  color:var(--navy); text-decoration:none; padding:.6em 1.5em;
  transition:transform .5s var(--ease);
}
.bi-btn:active{transform:scale(.98)}
.bi-btn:focus-visible, .bi-h2 a:focus-visible{outline:2px solid var(--gold); outline-offset:4px}

.bi-foot{
  display:flex; justify-content:center; gap:.9rem; align-items:center;
  padding:0 1.1rem 4rem; color:var(--muted); font-size:.9rem;
}
.bi-foot a{color:var(--muted)}
.bi-foot a:hover{color:var(--navy)}

@media (max-width:720px){
  .bi-card{grid-template-columns:1fr}
  .bi-title{font-size:clamp(.95rem,3.4vw,1.4rem)}
}
`;
