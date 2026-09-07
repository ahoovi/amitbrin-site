'use client';
import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { geoPath, geoGraticule10, geoCircle } from 'd3-geo';
import { Slider } from './range';
import {
  countries,
  africaIds,
  worldProjection,
  countryRatio,
  localProjection,
  localDistortion,
} from './geo';

export function Term({children,meaning}:{children:ReactNode,meaning:string}) {
 const [open,setOpen]=useState(false);
 return <span className="term-wrapper" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}><button type="button" className="term" aria-expanded={open} onClick={()=>setOpen(true)} onFocus={()=>setOpen(true)} onBlur={()=>setOpen(false)} onKeyDown={e=>{if(e.key==='Escape')setOpen(false)}}>{children}</button>{open?<span className="term-popup" role="tooltip">{meaning}</span>:null}</span>;
}
function useMorph(initial = 0) {
  const [t, setT] = useState(initial),
    anim = useRef(0);
  useEffect(() => () => cancelAnimationFrame(anim.current), []);
  const go = (target: number) => {
    cancelAnimationFrame(anim.current);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setT(target);
      return;
    }
    const start = performance.now(),
      from = t;
    function f(now: number) {
      const p = Math.min(1, (now - start) / 850);
      setT(from + (target - from) * (p * p * (3 - 2 * p)));
      if (p < 1) anim.current = requestAnimationFrame(f);
    }
    anim.current = requestAnimationFrame(f);
  };
  const direct = (v: number | readonly number[]) => {
    cancelAnimationFrame(anim.current);
    setT(Array.isArray(v) ? v[0] : (v as number));
  };
  return { t, go, direct };
}
export function Cover() {
  const [t, setT] = useState(0.8),
    [playing, setPlaying] = useState(true);
  const canvas = useRef<HTMLCanvasElement>(null),
    source = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false),
    motionOK = useRef(true),
    scrollBoost = useRef(0);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => {
      motionOK.current = !media.matches;
      if (media.matches) setPlaying(false);
    };
    preference();
    media.addEventListener('change', preference);
    const im = new Image();
    im.onload = () => {
      source.current = im;
      setReady(true);
    };
    im.src = '/media/blog/map-as-a-lie/cover-source.png';
    return () => {
      im.onload = null;
      media.removeEventListener('change', preference);
    };
  }, []);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      scrollBoost.current = Math.min(
        1,
        Math.max(0, y / (window.innerHeight * 1.5)),
      );
      if (!playing && motionOK.current)
        setT((v) =>
          Math.min(
            1,
            Math.max(0, v + (y - lastY) / (window.innerHeight * 1.5)),
          ),
        );
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [playing]);
  useEffect(() => {
    if (!playing || !motionOK.current) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const base = 0.15 + (0.65 * (1 + Math.cos((now - start) / 2000))) / 2;
      setT(base + (1 - base) * scrollBoost.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);
  useEffect(() => {
    if (!ready || !canvas.current || !source.current) return;
    const ctx = canvas.current.getContext('2d');
    if (!ctx) return;
    const H = 630,
      W = 1200,
      m = (82 * Math.PI) / 180,
      merc = (p: number) => Math.log(Math.tan(Math.PI / 4 + p / 2));
    ctx.clearRect(0, 0, W, H);
    for (let y = 0; y < H; y++) {
      const v = y / H,
        v2 = (y + 1) / H,
        a = (1 - t) * v + t * (1 - merc((1 - v) * m) / merc(m)),
        b = (1 - t) * v2 + t * (1 - merc((1 - v2) * m) / merc(m));
      ctx.drawImage(source.current, 0, y, W, 1, 0, a * H, W, (b - a) * H + 1);
    }
  }, [t, ready]);
  return (
    <div className="cover-module">
      <div className="cover-art">
        <img
          src="/media/blog/map-as-a-lie/cover-og.png"
          width="1200"
          height="630"
          alt="גדלנו על מפה שתמיד משקרת – וזה מה שאנחנו יודעים על העולם. הפורטרט, הטקסט והגריד מתעוותים יחד."
          fetchPriority="high"
        />
        <canvas
          ref={canvas}
          width="1200"
          height="630"
          className={ready ? 'is-ready' : ''}
          aria-hidden="true"
        />
      </div>
      <div className="cover-controls">
        <label className="slider-label" id="cover-label">
          עיוות הקאבר <span>{Math.round(t * 100)}%</span>
        </label>
        <Slider
          className="article-slider cover-slider"
          value={[t]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(v) => {
            setPlaying(false);
            setT(Array.isArray(v) ? v[0] : (v as number));
          }}
          aria-labelledby="cover-label"
        />
        <button
          className="quiet-button"
          aria-pressed={playing}
          onClick={() => setPlaying((v) => !v)}
        >
          {playing ? 'עצירת המעבר' : 'ניגון המעבר'}
        </button>
      </div>
    </div>
  );
}
export function ProjectionWidget() {
  const { t, go, direct } = useMorph(0),
    [other, setOther] = useState(304);
  const p = useMemo(() => worldProjection(t), [t]),
    path = geoPath(p),
    ratio = countryRatio(t, other);
  return (
    <section
      className="projection-widget breakout"
      aria-labelledby="projection-heading"
    >
      <div className="widget-header">
        <span className="section-kicker">01 / איזו פשרה בוחרים?</span>
        <h4 id="projection-heading">אותו עולם. משקל אחר.</h4>
        <p>גררו בין ההיטלים וראו מה משתנה ביחס שבין אפריקה לצפון.</p>
      </div>
      <div className="map-choices">
        <button
          className={other === 304 ? 'selected' : ''}
          aria-pressed={other === 304}
          onClick={() => setOther(304)}
        >
          אפריקה וגרינלנד
        </button>
        <button
          className={other === 840 ? 'selected' : ''}
          aria-pressed={other === 840}
          onClick={() => setOther(840)}
        >
          אפריקה וארה״ב
        </button>
      </div>
      <svg
        className="world-map"
        viewBox="0 0 900 510"
        role="img"
        aria-label={`מפת העולם: אפריקה מודגשת בזהב, ${other === 304 ? 'גרינלנד' : 'ארה״ב'} בכחול. היטל ${t === 0 ? 'מרקטור' : t === 1 ? 'Equal Earth' : 'מעבר'}`}
      >
        <path d={path(geoGraticule10()) || ''} className="map-grid" />
        {countries
          .filter((f) => Number(f.id) !== 10)
          .map((f) => (
            <path
              key={String(f.id ?? f.properties?.name)}
              d={path(f) || ''}
              className={
                africaIds.has(Number(f.id))
                  ? 'map-africa'
                  : Number(f.id) === other
                    ? 'map-highlight'
                    : 'map-land'
              }
            />
          ))}
      </svg>
      <div className="morph-control">
        <div className="endpoint-labels">
          <button onClick={() => go(0)}>
            מרקטור <small>שומר על זוויות</small>
          </button>
          <span>
            {t === 0 ? 'מרקטור' : t === 1 ? 'Equal Earth' : 'בין שתי בחירות'}
          </span>
          <button onClick={() => go(1)}>
            Equal Earth <small>שומר על שטח</small>
          </button>
        </div>
        <Slider
          className="article-slider"
          value={[t]}
          min={0}
          max={1}
          step={0.005}
          onValueChange={direct}
          aria-label="מעבר בין מרקטור ל-Equal Earth"
        />
      </div>
      <div className="comparison-values" aria-live="polite">
        <p>
          <span>על הכדור, אפריקה גדולה פי</span>
          <strong>{ratio.real.toFixed(1)}</strong>
          <span>מ{other === 304 ? 'גרינלנד' : 'ארה״ב'}</span>
        </p>
        <p>
          <span>יחס השטח המוצג במפה: אפריקה ÷</span>
          <strong>{ratio.shown.toFixed(1)}</strong>
          <span>{other === 304 ? 'גרינלנד' : 'ארה״ב'}</span>
        </p>
      </div>
      <p className="widget-note">
        יחסים מחושבים מאותה גאומטריה בשני המצבים; ארה״ב כוללת אלסקה והוואי. שלבי
        הביניים הם המחשה. אנטארקטיקה אינה מוצגת.
      </p>
    </section>
  );
}
export function IsraelWidget() {
  const { t, go, direct } = useMorph(0),
    p = useMemo(() => localProjection(t), [t]),
    path = geoPath(p),
    d = localDistortion(t),
    point = p([35, 32])!,
    near = new Set([376, 275, 400, 422, 760, 818, 196]);
  return (
    <section
      className="israel-widget breakout"
      aria-labelledby="israel-heading"
    >
      <div className="widget-header">
        <span className="section-kicker">02 / קרוב לבית</span>
        <h4 id="israel-heading">
          מיקוד בישראל —<br />
          אותו העיוות קרוב לבית
        </h4>
        <p>גם ב־32° צפון המפה המוכרת נותנת לשטח יותר מקום ממה שמגיע לו.</p>
      </div>
      <div className="israel-layout">
        <div className="local-map-wrap">
          <svg
            className="local-map"
            viewBox="0 0 580 430"
            role="img"
            aria-label="ישראל וסביבתה בהיטל שנבחר; נקודת המדידה 32 צפון 35 מזרח"
          >
            <path d={path(geoGraticule10()) || ''} className="map-grid" />
            {countries
              .filter((f) => near.has(Number(f.id)))
              .map((f) => (
                <path
                  key={String(f.id ?? f.properties?.name)}
                  d={path(f) || ''}
                  className={
                    Number(f.id) === 376 ? 'map-highlight' : 'local-land'
                  }
                />
              ))}
            <path
              d={path(geoCircle().center([35, 32]).radius(0.23)()) || ''}
              className="local-circle"
            />
            <circle cx={point[0]} cy={point[1]} r="4" fill="#081845" />
            <text
              x={point[0] - 24}
              y={point[1] + 12}
              textAnchor="end"
              className="local-label"
            >
              ישראל
            </text>
            <text x="80" y="100" className="local-label">
              הים התיכון
            </text>
          </svg>
        </div>
        <div className="local-stats" aria-live="polite">
          <span className="section-kicker">32° צפון / 35° מזרח</span>
          <p>
            <strong>×{d.area.toFixed(2)}</strong>
            <span>מכפיל השטח המקומי</span>
          </p>
          <p>
            <strong>{d.angle.toFixed(1)}°</strong>
            <span>עיוות זוויתי מרבי בנקודה</span>
          </p>
          <p className="small-note">
            {t === 0
              ? 'במרקטור, שטח זעיר כאן מוגדל בכ־39%, אך הזוויות נשמרות.'
              : t === 1
                ? 'ב־Equal Earth יחס השטח נשמר. המחיר עובר לזוויות ולצורה.'
                : 'השטח והצורה משתנים יחד במעבר בין ההיטלים.'}
          </p>
        </div>
      </div>
      <div className="morph-control">
        <div className="endpoint-labels">
          <button onClick={() => go(0)}>מרקטור</button>
          <span>{Math.round(t * 100)}% מהמעבר</span>
          <button onClick={() => go(1)}>Equal Earth</button>
        </div>
        <Slider
          className="article-slider"
          value={[t]}
          min={0}
          max={1}
          step={0.005}
          onValueChange={direct}
          aria-label="ההיטל של מפת ישראל"
        />
      </div>
      <p className="widget-note">
        העיגול הזהוב הוא אזור מעגלי קטן על הכדור: במפה צורתו משתנה. המדדים
        מתייחסים לנקודה, לא לממוצע ישראל. קנה המידה נשאר קבוע. גבולות כלליים לפי
        Natural Earth; אינם קביעה מדינית.
      </p>
    </section>
  );
}
export function ReadProgress() {
  const [r, setR] = useState(0);
  useEffect(() => {
    const handler = () =>
      setR(
        window.scrollY /
          Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight,
          ),
      );
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return (
    <div
      className="read-progress"
      style={{ transform: `scaleX(${r})` }}
      aria-hidden="true"
    />
  );
}
export function LabEmbed() {
  return (
    <div className="lab-embed">
      <iframe
        src="https://amit-map-perspectives.ahoovi.chatgpt.site/"
        title="מפה היא בחירה – מעבדת היטלים"
        width="100%"
        height="900"
        loading="lazy"
      />
      <a
        className="lab-link"
        href="https://amit-map-perspectives.ahoovi.chatgpt.site/"
        target="_blank"
        rel="noreferrer"
      >
        למעבדה בחלון נפרד ↗
      </a>
    </div>
  );
}
