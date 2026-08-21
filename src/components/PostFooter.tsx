"use client";

/**
 * PostFooter — the closing sequence every blog post shares:
 *   share buttons → comment form → "עוד דברים שכתבתי עליהם"
 *
 * Every frame here is an <InkFrame/>: the resting line is the site's drawn
 * rectangle, and hover re-traces it rather than filling it. Class names are
 * namespaced `pf-` so a post's own stylesheet can never collide with this.
 */

import { useState } from "react";
import InkFrame from "./InkFrame";
import { relatedTo } from "./postsIndex";

const SITE = "https://www.amitbrin.com";

const Ic = {
  wa: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.18 4.22-9.4 9.42-9.4a9.34 9.34 0 0 1 6.65 2.76 9.32 9.32 0 0 1 2.76 6.65c0 5.18-4.23 9.41-9.42 9.41zM20.52 3.48A11.78 11.78 0 0 0 12.04 0C5.5 0 .18 5.32.18 11.86c0 2.09.55 4.13 1.59 5.93L.08 24l6.35-1.66a11.83 11.83 0 0 0 5.61 1.43h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.15-3.39-8.43z"/></svg>
  ),
  li: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
  ),
  fb: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05v-2.66c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z"/></svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.66l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/></svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  ),
};

type Part = "share" | "comments" | "related";

export default function PostFooter({
  slug,
  title,
  formspree = "https://formspree.io/f/xpqvaarr",
  punchline = true,
  parts = ["share", "comments", "related"],
  frames = true,
}: {
  slug: string;
  title: string;
  formspree?: string;
  punchline?: boolean;
  /** posts designed inside their own world keep their own share/comments and
   *  take only the related rail — see chattjb and whatsapp */
  parts?: Part[];
  /** false drops the drawn frames so the rail inherits the host page's look */
  frames?: boolean;
}) {
  const show = (p: Part) => parts.includes(p);
  const Frame = ({ kind, seed }: { kind?: "btn" | "box"; seed: number }) =>
    frames ? <InkFrame kind={kind} seed={seed} /> : null;
  const url = `${SITE}/blog/${slug}`;
  const enc = encodeURIComponent;
  const [copied, setCopied] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const related = relatedTo(slug);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {}
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    try {
      const res = await fetch(formspree, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
      if (res.ok) { setState("ok"); form.reset(); } else setState("err");
    } catch { setState("err"); }
  };

  return (
    <div className={"pf-root" + (frames ? "" : " pf-bare")}>
      <style>{PF_CSS}</style>

      {/* ---- share ---- */}
      {show("share") && <div className="pf-share" data-reveal>
        {punchline && <p className="pf-wink">קדימה, אל תתביישו:</p>}
        <div className="pf-btns">
          <a className="pf-btn" href={`https://wa.me/?text=${enc(title + " " + url)}`} target="_blank" rel="noopener noreferrer">
            <Frame seed={1} />{Ic.wa} להעביר בוואטסאפ
          </a>
          <a className="pf-btn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noopener noreferrer">
            <Frame seed={2} />{Ic.li} LinkedIn
          </a>
          <a className="pf-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer">
            <Frame seed={3} />{Ic.fb} פייסבוק
          </a>
          <a className="pf-btn" href={`https://x.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`} target="_blank" rel="noopener noreferrer">
            <Frame seed={4} />{Ic.x} X
          </a>
          <button className="pf-btn" type="button" onClick={copy}>
            <Frame seed={5} />{Ic.link} {copied ? "הועתק ✓" : "העתקת קישור"}
          </button>
        </div>
      </div>}

      {/* ---- comments ---- */}
      {show("comments") && <section className="pf-comments" data-reveal>
        <h2 className="pf-h">יש לך מה להגיד על זה?</h2>
        <p className="pf-sub">תגובות מגיעות ישירות אליי. בואו נדבר על זה.</p>
        {state === "ok" ? (
          <p className="pf-ok">תודה! התגובה נשלחה.</p>
        ) : (
          <form className="pf-form" onSubmit={submit}>
            <input type="hidden" name="_subject" value={`תגובה חדשה בבלוג: ${title}`} />
            <input type="hidden" name="post" value={slug} />
            <div className="pf-grid">
              <span className="pf-field"><Frame kind="box" seed={6} /><input className="pf-in" type="text" name="name" placeholder="שם" required /></span>
              <span className="pf-field"><Frame kind="box" seed={7} /><input className="pf-in" type="email" name="email" placeholder="אימייל (לא יפורסם)" required /></span>
            </div>
            <span className="pf-field"><Frame kind="box" seed={8} /><textarea className="pf-in pf-area" name="comment" placeholder="מה עובר לך בראש?" rows={4} required /></span>
            <button className="pf-btn pf-send" type="submit" disabled={state === "sending"}>
              <Frame seed={0} />
              {state === "sending" ? "שולח…" : "שליחת תגובה"}
            </button>
            {state === "err" && <p className="pf-err">משהו השתבש בשליחה. אפשר לנסות שוב, או פשוט לכתוב לי למייל.</p>}
          </form>
        )}
      </section>}

      {/* ---- related ---- */}
      {show("related") && <section className="pf-more" data-reveal>
        <h2 className="pf-more-h">עוד דברים שכתבתי עליהם:</h2>
        <div className="pf-rail">
          {related.map((p, i) => (
            <a className="pf-card" href={p.href} key={p.href}>
              <Frame kind="box" seed={i} />
              <span className="pf-cover"><img src={p.cover} alt="" loading="lazy" /></span>
              <h3 className="pf-card-t">{p.title}</h3>
              <p className="pf-card-x">{p.intro}</p>
            </a>
          ))}
        </div>
      </section>}
    </div>
  );
}

const PF_CSS = `
.pf-root{
  --pf-ink:#081845; --pf-muted:#4a5570; --pf-gold:#CFBD85;
  --pf-ease:cubic-bezier(.32,.72,0,1);
  color:var(--pf-ink); clear:both;
  font-family:'Alef','Noto Sans Hebrew',Arial,sans-serif;
}
.pf-root *{box-sizing:border-box}

/* buttons — the line is drawn by InkFrame; nothing here ever fills */
.pf-btn{
  display:inline-flex; align-items:center; gap:.55em;
  position:relative; z-index:0;
  font-family:'Leon','Alef',sans-serif; font-weight:400; font-size:1rem;
  color:var(--pf-ink); background:transparent;
  padding:.62em 1.5em; text-decoration:none; cursor:pointer; border:none;
  transition:transform .5s var(--pf-ease);
}
.pf-btn:active{transform:scale(.98)}
.pf-btn:disabled{opacity:.55; cursor:default}
.pf-btn svg:not(.ink-frame){flex:0 0 auto}
.pf-btn:focus-visible{outline:2px solid var(--pf-gold); outline-offset:4px}

.pf-share{margin:2.6rem 0 0}
.pf-wink{font-weight:700; margin:0 0 1rem}
.pf-btns{display:flex; flex-wrap:wrap; gap:1.5rem 1.4rem}

/* comments */
.pf-comments{margin:4rem 0 0}
.pf-h{margin:0; color:var(--pf-ink); font-size:clamp(1.5rem,3.2vw,2.1rem); line-height:1.25}
.pf-sub{margin:.7rem 0 1.8rem; color:var(--pf-muted)}
.pf-form{display:flex; flex-direction:column; gap:1.15rem}
.pf-grid{display:grid; grid-template-columns:1fr 1fr; gap:1.15rem}
.pf-field{position:relative; z-index:0; display:block; color:var(--pf-ink)}
.pf-in{
  width:100%; display:block; box-sizing:border-box;
  font-family:inherit; font-size:1rem; color:var(--pf-ink);
  background:transparent; border:none; outline:none; padding:.8em 1.15em;
}
.pf-in::placeholder{color:rgba(8,24,69,.45)}
.pf-area{resize:vertical; min-height:110px}
/* the send button sits against the left edge of the fields (RTL: flex-end) */
.pf-send{align-self:flex-end}
.pf-ok{font-weight:700; color:var(--pf-ink)}
.pf-err{font-size:.9rem; color:#8a1f1f; margin:0}

/* related */
.pf-more{margin:4.5rem 0 1rem}
.pf-more-h{
  color:var(--pf-ink); font-size:clamp(1.5rem,3.2vw,2.1rem); line-height:1.22;
  margin:0 0 1.8rem; padding-right:1.1rem; border-right:5px solid var(--pf-gold);
}
.pf-rail{display:grid; grid-template-columns:repeat(3,1fr); gap:1.1rem}
.pf-card{
  position:relative; z-index:0; display:flex; flex-direction:column;
  background:transparent; border:none; padding:.7rem .7rem 1.1rem;
  text-decoration:none; color:inherit;
  transition:transform .45s var(--pf-ease);
}
.pf-card:hover{transform:translateY(-3px)}
.pf-card:focus-visible{outline:2px solid var(--pf-gold); outline-offset:4px}
.pf-cover{display:block; aspect-ratio:16/10; overflow:hidden; border-radius:9px; background:rgba(2,13,44,.06)}
.pf-cover img{width:100%; height:100%; object-fit:cover; display:block}
.pf-card-t{
  font-family:'Leon','Alef',sans-serif; font-weight:700;
  font-size:1.05rem; line-height:1.3; margin:1rem .4rem .45rem; color:var(--pf-ink);
}
.pf-card-x{margin:0 .4rem; font-size:.9rem; line-height:1.6; color:var(--pf-muted)}

/* --- bare mode: no drawn frames; the host page's own look carries it --- */
.pf-bare{font-family:inherit; color:inherit}
.pf-bare .pf-more-h{
  font-family:inherit; color:inherit; border-right:none; padding-right:0;
  font-size:clamp(1.15rem,2.4vw,1.5rem);
}
.pf-bare .pf-card{
  padding:.75rem .75rem 1.05rem; border-radius:1rem;
  background:var(--pf-card-bg,rgba(255,255,255,.7));
  border:1px solid var(--pf-card-line,rgba(0,0,0,.1));
  box-shadow:var(--pf-card-shadow,none);
  transition:transform .35s ease, border-color .25s ease, box-shadow .25s ease;
}
.pf-bare .pf-card:hover{
  transform:translateY(-3px);
  border-color:var(--pf-card-line-hover,rgba(0,0,0,.22));
  box-shadow:var(--pf-card-shadow-hover,0 8px 22px rgba(0,0,0,.09));
}
.pf-bare .pf-card-t{font-family:inherit; color:inherit; font-size:1rem}
.pf-bare .pf-card-x{color:var(--pf-card-muted,rgba(0,0,0,.55)); font-size:.86rem}

@media (max-width:720px){
  .pf-grid{grid-template-columns:1fr}
  .pf-rail{
    display:flex; gap:1rem; overflow-x:auto; scroll-snap-type:x mandatory;
    margin-inline:-1rem; padding:0 1rem 1rem; scrollbar-width:none;
  }
  .pf-rail::-webkit-scrollbar{display:none}
  .pf-card{flex:0 0 76vw; scroll-snap-align:center}
  .pf-btns{gap:1.1rem}
}
`;
