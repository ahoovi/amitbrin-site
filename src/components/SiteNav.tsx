/**
 * The one top navigation of the site: the wordmark, four links, and the
 * progressive blur veil behind them. `mix-blend-mode: difference` makes the
 * white type invert itself against whatever is underneath, so the same nav
 * reads correctly on the navy hero and on the blog's drafting paper.
 *
 * `home` switches the in-page anchors on the one-pager for absolute paths
 * everywhere else.
 */
export default function SiteNav({ home = false, current }: { home?: boolean; current?: string }) {
  const to = (hash: string) => (home ? hash : "/" + hash);
  return (
    <>
      <style>{NAV_CSS}</style>
      <div className="nav-veil" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <nav className="op-nav" aria-label="ניווט ראשי">
        <a href={to("#top")} className="nav-logo" aria-label="עמית ברין — ראשי">
          <img src="/media/amit-brin-logo.svg" alt="עמית ברין" />
        </a>
        <div className="nav-links">
          <a href={to("#top")} aria-current={current === "home" ? "page" : undefined}>ראשי</a>
          <a href={to("#blog")}>כתיבה ועשייה</a>
          <a href="/blog" aria-current={current === "blog" ? "page" : undefined}>תרחיב</a>
          <a href={to("#footer")}>דברו איתי</a>
        </div>
      </nav>
    </>
  );
}

export const NAV_CSS = `
.nav-veil { position:fixed; top:0; right:0; left:0; height:90px; z-index:40; pointer-events:none; }
.nav-veil i { position:absolute; inset:0; }
.nav-veil i:nth-child(1){ backdrop-filter:blur(26px); -webkit-backdrop-filter:blur(26px);
  -webkit-mask-image:linear-gradient(#000 0 34%, transparent 62%); mask-image:linear-gradient(#000 0 34%, transparent 62%); }
.nav-veil i:nth-child(2){ backdrop-filter:blur(11px); -webkit-backdrop-filter:blur(11px);
  -webkit-mask-image:linear-gradient(transparent 22%, #000 40% 52%, transparent 80%); mask-image:linear-gradient(transparent 22%, #000 40% 52%, transparent 80%); }
.nav-veil i:nth-child(3){ backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);
  -webkit-mask-image:linear-gradient(transparent 45%, #000 62% 74%, transparent 100%); mask-image:linear-gradient(transparent 45%, #000 62% 74%, transparent 100%); }

.op-nav {
  position:fixed; top:0; right:0; left:0; z-index:50;
  display:flex; align-items:center; gap:2.4rem;
  padding:1.1rem 2.2rem;
  mix-blend-mode:difference;
}
.nav-logo img { height:32px; width:auto; display:block; filter:brightness(0) invert(1); }
.nav-links { display:flex; gap:1.8rem; }
.nav-links a { color:#fff; text-decoration:none; font-family:'Leon',sans-serif; font-weight:500; font-size:1rem; letter-spacing:.02em; transition:opacity .4s cubic-bezier(.32,.72,0,1); }
.nav-links a:hover { opacity:.65; }
.nav-links a[aria-current="page"] { opacity:.55; }
@media (max-width:768px){
  .op-nav { gap:1.2rem; padding:.9rem 1.1rem; }
  .nav-links { gap:1.1rem; }
  .nav-links a { font-size:.9rem; }
}
`;
