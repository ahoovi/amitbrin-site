import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * שער גישה לעמודי הרומנית · v2 · מפתחות פר-אדם
 *
 * משתני סביבה (Vercel → Project → Settings → Environments → Production):
 *
 *   LIMBA_KEYS - רשימת מפתחות מופרדת בפסיקים. כל פריט:  תווית:מפתח[|תפוגה]
 *                למשל:  amit:dchf6mh8bfy,neta:86tev79qwkw,grup:qua7p4jgewb|2026-12-31
 *                התווית היא רק לצורך ניתוק סלקטיבי ולוגים - היא לא סוד.
 *                התפוגה אופציונלית, בפורמט YYYY-MM-DD, ומתפוגגת מעצמה בלי שתעשה כלום.
 *
 *   LIMBA_GATE - "off" מוריד את השאלטר: כל ארבעת העמודים מחזירים 404, גם עם מפתח תקין.
 *
 *   LIMBA_PASS - נתיב תאימות לאחור. אם LIMBA_KEYS לא מוגדר, משתמשים בו כמפתח יחיד.
 *
 * אם שניהם ריקים - השער פתוח לגמרי, בדיוק כמו לפני שהקובץ הזה נוצר.
 *
 * שלוש דרכים להיכנס:
 *   1. קישור חד-לחיצה:  /limbaromana.html?key=המפתח  → שותל עוגייה ומנקה את ה-URL
 *   2. טופס סיסמה למי שמגיע בלי עוגייה
 *   3. עוגייה קיימת - והיא מתחדשת בכל ביקור, כך שמשתמש פעיל לעולם לא נזרק החוצה
 *
 * ניתוק סלקטיבי: מוחקים פריט אחד מ-LIMBA_KEYS → רק העוגיות שנשתלו באותו מפתח נפסלות.
 * שאר האנשים לא מרגישים כלום. כל שינוי נכנס לתוקף אחרי Redeploy.
 */

const GATED = [
  '/limbaromana.html',
  '/limbaromana-audio.html',
  '/limbaromana-lessons.html',
  '/limbaromana-tutor.html',
  '/limbaromana-examen15-a1.html',
  '/limbaromana-neta.html',
];

const COOKIE = 'limba_key';
const MAX_AGE = 60 * 60 * 24 * 400; // 400 יום - התקרה שדפדפנים מכבדים. מתחדש בכל ביקור.

type Key = { label: string; secret: string; until: number | null };

function parseKeys(): Key[] {
  const raw = (process.env.LIMBA_KEYS || '').trim();
  if (raw) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((item) => {
        const [pair, exp] = item.split('|');
        const i = pair.indexOf(':');
        if (i < 1) return null;
        const label = pair.slice(0, i).trim();
        const secret = pair.slice(i + 1).trim();
        if (!label || !secret) return null;
        let until: number | null = null;
        if (exp && exp.trim()) {
          const t = Date.parse(exp.trim() + 'T23:59:59Z');
          if (!Number.isNaN(t)) until = t;
        }
        return { label, secret, until };
      })
      .filter((k): k is Key => k !== null);
  }
  const legacy = (process.env.LIMBA_PASS || '').trim();
  return legacy ? [{ label: 'all', secret: legacy, until: null }] : [];
}

const live = (k: Key, now: number) => k.until === null || now <= k.until;

/** אסימון נגזר מהמפתח עצמו, ולכן החלפת מפתח אחד לא נוגעת בעוגיות של האחרים */
async function token(k: Key) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode('limba::v2::' + k.label + '::' + k.secret),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

/** השוואה בזמן קבוע - לא קריטי בסקאלה הזאת, אבל זה שתי שורות */
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function setCookie(res: NextResponse, req: NextRequest, value: string) {
  res.cookies.set(COOKIE, value, {
    path: '/',
    maxAge: MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    secure: req.nextUrl.protocol === 'https:',
  });
  return res;
}

function loginPage(path: string, wrong: boolean) {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>רומנית · כניסה</title>
<style>
body{margin:0;background:#faf7f0;color:#2b3550;font-family:Rubik,-apple-system,Arial,sans-serif;
direction:rtl;text-align:right;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
form{max-width:400px;width:100%;background:#fff;border:1px solid #e6e0d2;border-radius:14px;padding:26px 28px}
h1{font-size:1.2rem;color:#1c2b4a;margin:0 0 6px}
p{color:#6b7280;font-size:.9rem;margin:0 0 18px;line-height:1.6}
input{width:100%;font:inherit;font-size:1rem;padding:11px 14px;border:1px solid #e6e0d2;
border-radius:10px;background:#faf7f0;margin-bottom:12px}
input:focus{outline:2px solid #b8860b;outline-offset:1px}
button{width:100%;font:inherit;font-weight:600;font-size:.98rem;background:#1c2b4a;color:#f3e9c9;
border:none;border-radius:999px;padding:12px;cursor:pointer}
.err{color:#c22f2e;font-size:.88rem;margin:0 0 12px;font-weight:600}
</style></head>
<body>
<form method="GET" action="${path}">
  <h1>Limba română</h1>
  <p>העמוד הזה פרטי. הזינו את המפתח פעם אחת - הדפדפן יזכור.</p>
  ${wrong ? '<p class="err">מפתח שגוי או שפג תוקפו</p>' : ''}
  <input type="password" name="key" placeholder="מפתח" autofocus autocomplete="current-password">
  <button type="submit">כניסה</button>
</form>
</body></html>`;
}

const deny = (path: string, wrong: boolean) =>
  new NextResponse(loginPage(path, wrong), {
    status: 401,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (!GATED.includes(pathname)) return NextResponse.next();

  if ((process.env.LIMBA_GATE || '').toLowerCase() === 'off') {
    return new NextResponse('Not Found', { status: 404 });
  }

  const now = Date.now();
  const keys = parseKeys().filter((k) => live(k, now));
  if (!keys.length) return NextResponse.next(); // לא הוגדרו מפתחות - שום דבר לא משתנה

  // 1. עוגייה קיימת. אם היא תקפה - מחדשים אותה, כך שמי שנכנס מדי פעם לא נזרק לעולם.
  const jar = req.cookies.get(COOKIE)?.value;
  if (jar) {
    const dot = jar.indexOf('.');
    const label = dot > 0 ? jar.slice(0, dot) : '';
    const value = dot > 0 ? jar.slice(dot + 1) : '';
    for (const k of keys) {
      if (k.label !== label) continue;
      if (same(await token(k), value)) return setCookie(NextResponse.next(), req, jar);
    }
    // תווית שנמחקה, מפתח שהוחלף, או תוקף שפג - נופלים לטופס
  }

  // 2. קישור חד-לחיצה
  const given = searchParams.get('key');
  if (given !== null) {
    for (const k of keys) {
      if (!same(k.secret, given)) continue;
      const url = req.nextUrl.clone();
      url.searchParams.delete('key');
      console.log(`[limba] in: ${k.label} -> ${pathname}`);
      return setCookie(NextResponse.redirect(url), req, `${k.label}.${await token(k)}`);
    }
    return deny(pathname, true);
  }

  // 3. אין כלום
  return deny(pathname, false);
}

export const config = {
  matcher: [
    '/limbaromana.html',
    '/limbaromana-audio.html',
    '/limbaromana-lessons.html',
    '/limbaromana-tutor.html',
    '/limbaromana-examen15-a1.html',
    '/limbaromana-neta.html',
  ],
};
