import type { Metadata } from "next";

// This page is intentionally NOT linked from any nav, menu, or other page.
// It is a private URL: amitbrin.com/targum
export const metadata: Metadata = {
  title: "מדריך תרגום קולי לסרטונים בשפה זרה",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

const STYLES = `
  :root{
    --ink:#1c2b2d;
    --paper:#f4efe6;
    --card:#fffdf8;
    --accent:#d94f2a;
    --accent-2:#2f7d6e;
    --gold:#c98a1e;
    --line:#e3dccd;
    --muted:#6a6357;
    --shadow:0 2px 0 rgba(28,43,45,.06), 0 14px 34px -18px rgba(28,43,45,.4);
  }
  .targum-page{
    font-family:"Assistant","Heebo","Segoe UI",system-ui,sans-serif;
    background:
      radial-gradient(circle at 15% -10%, rgba(217,79,42,.06), transparent 40%),
      radial-gradient(circle at 90% 5%, rgba(47,125,110,.08), transparent 45%),
      var(--paper);
    color:var(--ink);
    line-height:1.75;
    -webkit-font-smoothing:antialiased;
    padding-bottom:70px;
    min-height:100vh;
  }
  .targum-page *{box-sizing:border-box}
  .targum-page .wrap{max-width:1080px;margin:0 auto;padding:0 22px}
  .targum-page header.hero{padding:64px 22px 40px;text-align:center;position:relative}
  .targum-page .kicker{
    display:inline-block;font-size:.78rem;letter-spacing:.18em;font-weight:700;
    color:var(--accent);background:rgba(217,79,42,.09);
    border:1px solid rgba(217,79,42,.25);padding:6px 16px;border-radius:100px;margin-bottom:22px;
  }
  .targum-page header.hero h1{
    font-size:clamp(2rem,5.2vw,3.4rem);line-height:1.15;font-weight:800;
    letter-spacing:-.01em;margin-bottom:18px;max-width:16ch;margin-inline:auto;
  }
  .targum-page header.hero h1 em{color:var(--accent-2);font-style:normal}
  .targum-page header.hero p.lede{font-size:1.12rem;color:var(--muted);max-width:52ch;margin-inline:auto}
  .targum-page .hero-rule{width:64px;height:4px;border-radius:4px;background:linear-gradient(90deg,var(--accent),var(--gold));margin:26px auto 0}
  .targum-page nav.jump{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:34px auto 8px;max-width:820px}
  .targum-page nav.jump a{
    text-decoration:none;font-size:.92rem;font-weight:600;color:var(--ink);
    background:var(--card);border:1px solid var(--line);padding:9px 16px;
    border-radius:100px;transition:.18s;box-shadow:var(--shadow);
  }
  .targum-page nav.jump a:hover{transform:translateY(-2px);border-color:var(--accent);color:var(--accent)}
  .targum-page section{padding:36px 0 6px}
  .targum-page .sec-head{display:flex;align-items:baseline;gap:14px;margin-bottom:8px}
  .targum-page .sec-head .num{font-size:2.1rem;font-weight:800;color:var(--accent);line-height:1;flex:none}
  .targum-page .sec-head h2{font-size:1.7rem;font-weight:800;letter-spacing:-.01em}
  .targum-page .sec-sub{color:var(--muted);margin-bottom:22px;font-size:1.02rem;padding-inline-start:52px}
  .targum-page .card{
    background:var(--card);border:1px solid var(--line);border-radius:20px;
    padding:26px 26px 22px;box-shadow:var(--shadow);margin-bottom:22px;position:relative;overflow:hidden;
  }
  .targum-page .card::before{content:"";position:absolute;inset-inline-start:0;top:0;bottom:0;width:6px;background:linear-gradient(var(--accent),var(--gold))}
  .targum-page .card.teal::before{background:linear-gradient(var(--accent-2),#5bb0a0)}
  .targum-page .card-top{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-bottom:6px}
  .targum-page .card-top h3{font-size:1.32rem;font-weight:800}
  .targum-page .badge{font-size:.72rem;font-weight:700;letter-spacing:.04em;padding:4px 11px;border-radius:100px}
  .targum-page .b-free{background:rgba(47,125,110,.12);color:var(--accent-2);border:1px solid rgba(47,125,110,.3)}
  .targum-page .b-easy{background:rgba(201,138,30,.14);color:var(--gold);border:1px solid rgba(201,138,30,.35)}
  .targum-page .b-android{background:rgba(28,43,45,.07);color:var(--ink);border:1px solid var(--line)}
  .targum-page .card .what{color:var(--muted);margin:8px 0 16px;font-size:1.02rem}
  .targum-page .steps{list-style:none;counter-reset:step;display:grid;gap:12px}
  .targum-page .steps li{
    counter-increment:step;display:flex;gap:14px;align-items:flex-start;
    background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:13px 15px;
  }
  .targum-page .steps li::before{
    content:counter(step);flex:none;width:30px;height:30px;border-radius:50%;
    background:var(--accent);color:#fff;font-weight:800;font-size:.95rem;
    display:grid;place-items:center;margin-top:2px;
  }
  .targum-page .card.teal .steps li::before{background:var(--accent-2)}
  .targum-page .steps li span strong{color:var(--ink)}
  .targum-page .steps li span{font-size:1rem;color:var(--ink)}
  .targum-page .btn-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px}
  .targum-page .btn{text-decoration:none;font-weight:700;font-size:.98rem;padding:12px 22px;border-radius:12px;display:inline-flex;align-items:center;gap:8px;transition:.18s}
  .targum-page .btn-primary{background:var(--accent);color:#fff;box-shadow:0 8px 20px -8px rgba(217,79,42,.6)}
  .targum-page .btn-primary:hover{transform:translateY(-2px);background:#c4441f}
  .targum-page .card.teal .btn-primary{background:var(--accent-2);box-shadow:0 8px 20px -8px rgba(47,125,110,.55)}
  .targum-page .card.teal .btn-primary:hover{background:#276a5d}
  .targum-page .btn-ghost{background:transparent;color:var(--ink);border:1.5px solid var(--line)}
  .targum-page .btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
  .targum-page .tip{margin-top:16px;font-size:.94rem;background:rgba(201,138,30,.09);border:1px dashed rgba(201,138,30,.4);border-radius:12px;padding:12px 15px;color:#7a5a15}
  .targum-page .tip b{color:var(--gold)}
  .targum-page .reco{background:linear-gradient(135deg,#1c2b2d,#28403f);color:#f4efe6;border-radius:22px;padding:32px 30px;margin:40px 0 10px;box-shadow:var(--shadow)}
  .targum-page .reco h2{font-size:1.5rem;margin-bottom:14px;color:#fff}
  .targum-page .reco ol{padding-inline-start:22px;display:grid;gap:10px}
  .targum-page .reco li{font-size:1.05rem;color:#e7e1d4}
  .targum-page .reco li b{color:#f6b56a}
  .targum-page .note{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:22px 24px;margin-top:26px;box-shadow:var(--shadow)}
  .targum-page .note h3{font-size:1.1rem;margin-bottom:8px;color:var(--accent-2)}
  .targum-page .note p{color:var(--muted);font-size:.98rem}
  .targum-page footer{text-align:center;color:var(--muted);font-size:.86rem;padding:38px 22px 20px;margin-top:20px;border-top:1px solid var(--line)}
  .targum-page footer a{color:var(--accent);text-decoration:none}
  @media (max-width:600px){.targum-page .sec-sub{padding-inline-start:0}.targum-page .sec-head{gap:10px}.targum-page .btn{flex:1 1 auto;justify-content:center}}
`;

const BODY_HTML = `
<header class="hero">
  <span class="kicker">מדריך פשוט · תרגום קולי בזמן אמת</span>
  <h1>לשמוע סרטונים בשפה זרה <em>בעברית</em> — בלי לקרוא כתוביות</h1>
  <p class="lede">אספתי כאן את הכלים הטובים ביותר שמתרגמים ומדבבים סרטונים בזמן אמת, עם הוראות התקנה פשוטות שלב-אחר-שלב. מתאים גם למי שלא רגיל בטכנולוגיה.</p>
  <div class="hero-rule"></div>
</header>
<div class="wrap">
  <nav class="jump">
    <a href="#yt">① דיבוב מובנה ביוטיוב</a>
    <a href="#ext">② תוסף לדפדפן במחשב</a>
    <a href="#app">③ אפליקציה לאנדרואיד</a>
    <a href="#translate">④ Google Translate חי</a>
    <a href="#reco">מה הכי מומלץ?</a>
  </nav>
  <section id="yt">
    <div class="sec-head"><span class="num">①</span><h2>הדיבוב המובנה של יוטיוב</h2></div>
    <p class="sec-sub">הדרך הכי פשוטה — לא צריך להתקין שום דבר. עובד בתוך אפליקציית יוטיוב עצמה.</p>
    <div class="card teal">
      <div class="card-top">
        <h3>YouTube — דיבוב אוטומטי</h3>
        <span class="badge b-free">חינם</span>
        <span class="badge b-easy">הכי קל</span>
        <span class="badge b-android">אנדרואיד + מחשב</span>
      </div>
      <p class="what">יוטיוב מדבבת אוטומטית סרטונים רבים ל‑27 שפות. פשוט לוחצים "נגן" והסרטון נשמע בשפה שלכם. אפשר להגדיר פעם אחת מהי השפה המועדפת, וזה יקרה לבד בכל סרטון שתומך בכך.</p>
      <ol class="steps">
        <li><span>פותחים את אפליקציית <strong>YouTube</strong> בטלפון.</span></li>
        <li><span>נכנסים לסרטון בשפה זרה ולוחצים על <strong>שם החשבון / תמונת הפרופיל</strong> בפינה למעלה.</span></li>
        <li><span>נכנסים ל<strong>הגדרות</strong> ← בוחרים <strong>"שפה מועדפת לאודיו"</strong> (Preferred audio language).</span></li>
        <li><span>בוחרים <strong>עברית</strong>. מעכשיו, סרטונים שתומכים בדיבוב יושמעו אוטומטית בעברית.</span></li>
        <li><span>אם רוצים לחזור לשפת המקור בסרטון מסוים — לוחצים על <strong>גלגל השיניים ⚙️</strong> בתוך הנגן ← <strong>"רצועת שמע"</strong>.</span></li>
      </ol>
      <div class="tip"><b>שימו לב:</b> לא כל סרטון מדובב — זה תלוי ביוצר. אם אין דיבוב לסרטון מסוים, השתמשו באחת מהאפשרויות הבאות.</div>
      <div class="btn-row">
        <a class="btn btn-primary" href="https://support.google.com/youtube/answer/15569972" target="_blank" rel="noopener">📖 מדריך רשמי של יוטיוב</a>
      </div>
    </div>
  </section>
  <section id="ext">
    <div class="sec-head"><span class="num">②</span><h2>תוסף לדפדפן במחשב</h2></div>
    <p class="sec-sub">מדבב <em>כל</em> סרטון יוטיוב בזמן אמת, גם כשאין דיבוב מובנה. מתאים לצפייה במחשב (Chrome / Edge).</p>
    <div class="card">
      <div class="card-top">
        <h3>AutoDub</h3>
        <span class="badge b-free">חינם · ללא הגבלה</span>
        <span class="badge b-easy">התקנה בלחיצה אחת</span>
      </div>
      <p class="what">מזהה אוטומטית את שפת המקור, מדבב לעברית בקול טבעי ומוסיף כתוביות. חינמי לחלוטין וללא הגבלה יומית. רץ על מודלי ה‑AI העדכניים של גוגל.</p>
      <ol class="steps">
        <li><span>לוחצים על הכפתור הכתום למטה — נפתח <strong>חנות התוספים של Chrome</strong>.</span></li>
        <li><span>לוחצים על <strong>"הוסף ל‑Chrome" (Add to Chrome)</strong> ← מאשרים <strong>"הוסף תוסף"</strong>.</span></li>
        <li><span>פותחים סרטון ביוטיוב. מתחת לנגן יופיע כפתור <strong>AutoDub</strong>.</span></li>
        <li><span>לוחצים עליו, בוחרים <strong>עברית</strong> כשפת היעד, ולוחצים <strong>נגן</strong>. זהו.</span></li>
      </ol>
      <div class="btn-row">
        <a class="btn btn-primary" href="https://chromewebstore.google.com/detail/youtube-dubbing-translate/kallpmoklcckbobcoccenpphbhbijndc" target="_blank" rel="noopener">⬇️ התקנת AutoDub</a>
        <a class="btn btn-ghost" href="https://autodub.net/en" target="_blank" rel="noopener">אתר הבית</a>
      </div>
    </div>
    <div class="card">
      <div class="card-top">
        <h3>YouTube Dubbing – Translate &amp; Dub</h3>
        <span class="badge b-free">חינם עד 5/יום</span>
        <span class="badge b-android">גם אנדרואיד</span>
      </div>
      <p class="what">200,000 משתמשים, דירוג 4.2. עובד גם ב‑Udemy, Coursera ו‑Bilibili. הגרסה החינמית מוגבלת ל‑5 סרטונים ביום; מנוי מסיר את ההגבלה ושומר גם את הצליל המקורי ברקע.</p>
      <ol class="steps">
        <li><span>לוחצים על הכפתור למטה ← <strong>"הוסף ל‑Chrome"</strong> ← מאשרים.</span></li>
        <li><span>פותחים סרטון ביוטיוב ולוחצים <strong>נגן</strong> — התרגום והדיבוב מתחילים לבד.</span></li>
        <li><span>לשינוי שפה: לוחצים על <strong>סמל התוסף</strong> ליד הנגן ובוחרים עברית.</span></li>
      </ol>
      <div class="btn-row">
        <a class="btn btn-primary" href="https://chromewebstore.google.com/detail/youtube-dubbing-%E2%80%93-transla/oglffgiaiekgeicdgkdlnlkhliajdlja" target="_blank" rel="noopener">⬇️ התקנת התוסף</a>
      </div>
    </div>
  </section>
  <section id="app">
    <div class="sec-head"><span class="num">③</span><h2>אפליקציה לאנדרואיד</h2></div>
    <p class="sec-sub">קולטת את <em>הצליל שיוצא מהמכשיר</em> ומתרגמת בזמן אמת — לא רק ביוטיוב, אלא בכל אפליקציה.</p>
    <div class="card teal">
      <div class="card-top">
        <h3>Real-time Voice Translate</h3>
        <span class="badge b-android">אנדרואיד</span>
        <span class="badge b-free">100+ שפות</span>
      </div>
      <p class="what">אפליקציה שקולטת את שמע המערכת או את המיקרופון ומתרגמת דיבור בזמן אמת. מיועדת בין היתר לצפייה בסרטונים בשפה זרה. (מכילה פרסומות ורכישות בתוך האפליקציה.)</p>
      <ol class="steps">
        <li><span>פותחים את חנות <strong>Google Play</strong> בטלפון (הכפתור למטה מוביל ישירות לדף).</span></li>
        <li><span>לוחצים <strong>"התקנה" (Install)</strong> וממתינים שההורדה תסתיים.</span></li>
        <li><span>פותחים את האפליקציה ומאשרים לה <strong>הרשאה לקלוט שמע</strong> כשהיא מבקשת.</span></li>
        <li><span>בוחרים <strong>מאיזו שפה</strong> לתרגם ו<strong>לאיזו שפה</strong> (עברית), ולוחצים <strong>התחל</strong>.</span></li>
        <li><span>מפעילים את הסרטון במקביל — התרגום יופיע/יישמע תוך כדי הצפייה.</span></li>
      </ol>
      <div class="tip"><b>טיפ לפרטיות:</b> חברו אוזניות כדי לשמוע את התרגום רק אתם, בלי להפריע לסביבה.</div>
      <div class="btn-row">
        <a class="btn btn-primary" href="https://play.google.com/store/apps/details?id=com.subtitle.voice" target="_blank" rel="noopener">⬇️ הורדה מ‑Google Play</a>
      </div>
    </div>
  </section>
  <section id="translate">
    <div class="sec-head"><span class="num">④</span><h2>Google Translate — תרגום חי</h2></div>
    <p class="sec-sub">הכלי הרשמי של גוגל לתרגום דיבור חי. מצוין לשיחות פנים-אל-פנים, ותומך בעברית.</p>
    <div class="card">
      <div class="card-top">
        <h3>אפליקציית Google Translate</h3>
        <span class="badge b-free">חינם</span>
        <span class="badge b-android">אנדרואיד + iPhone</span>
      </div>
      <p class="what">מבוסס על מודל התרגום הקולי החדש של גוגל (Gemini 3.5 Live Translate). מתרגם דיבור חי בקול טבעי, עם או בלי אוזניות. מיועד בעיקר לשיחות ותרגום סביבתי, לא לדיבוב סרטונים מוקלטים.</p>
      <ol class="steps">
        <li><span>מתקינים / פותחים את אפליקציית <strong>Google Translate</strong> (הכפתור למטה).</span></li>
        <li><span>בתחתית המסך לוחצים על <strong>"תרגום חי" (Live translate)</strong>.</span></li>
        <li><span>בוחרים מצב <strong>"האזנה" (Listening)</strong> — אפשר גם להצמיד את הטלפון לאוזן כמו בשיחה רגילה.</span></li>
        <li><span>בוחרים את השפות ולוחצים על סמל הדיבור כדי להתחיל/לעצור.</span></li>
      </ol>
      <div class="btn-row">
        <a class="btn btn-primary" href="https://play.google.com/store/apps/details?id=com.google.android.apps.translate" target="_blank" rel="noopener">⬇️ הורדת Google Translate</a>
        <a class="btn btn-ghost" href="https://support.google.com/translate/answer/6142474" target="_blank" rel="noopener">📖 מדריך רשמי</a>
      </div>
    </div>
  </section>
  <div class="reco" id="reco">
    <h2>מה הכי מומלץ? — סדר פעולות פשוט</h2>
    <ol>
      <li><b>לצפייה ביוטיוב בטלפון:</b> נסו קודם את הדיבוב המובנה (①). הכי פשוט, בלי התקנות.</li>
      <li><b>אם אין דיבוב לסרטון:</b> במחשב — התקינו את <b>AutoDub</b> (②). חינמי לגמרי וללא הגבלה.</li>
      <li><b>בטלפון, לכל אפליקציה:</b> התקינו את <b>Real-time Voice Translate</b> (③) שקולט את שמע המכשיר.</li>
      <li><b>לשיחות חיות עם אנשים:</b> השתמשו ב‑<b>Google Translate</b> (④) במצב "האזנה".</li>
    </ol>
  </div>
  <div class="note">
    <h3>הערה חשובה על הטכנולוגיה</h3>
    <p>ההודעה של גוגל שקראנו בה עוסקת ב‑Gemini 3.5 Live Translate — מודל תרגום קולי חי שנחשף למשתמשים דרך אפליקציית Google Translate ו‑Google Meet. תרגום סימולטני של <b>מדיה מוקלטת</b> כמו סרטוני יוטיוב מגיע בפועל דרך הדיבוב המובנה של יוטיוב או דרך התוספים והאפליקציות של צד שלישי שמופיעים במדריך זה — ולא ישירות מהמוצר שבהודעה. הכלים החינמיים של צד שלישי הם עצמאיים; כדאי לבדוק את מדיניות הפרטיות שלהם לפני שמזינים מידע אישי.</p>
  </div>
</div>
<footer>
  נוצר עבורך ב‑Dia · אוגוסט 2026 · כל הקישורים נפתחים בכרטיסייה חדשה<br/>
  מבוסס על ההודעה הרשמית של Google בנושא <a href="https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-live-3-5-translate/" target="_blank" rel="noopener">Gemini 3.5 Live Translate</a>
</footer>
`;

export default function TargumPage() {
  return (
    <div className="targum-page" dir="rtl" lang="he">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
    </div>
  );
}
