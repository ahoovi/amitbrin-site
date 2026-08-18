import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * שער גישה לעמודי הרומנית.
 *
 * משתני סביבה (Vercel → Project → Settings → Environment Variables):
 *   LIMBA_PASS  - הסיסמה. אם ריק / לא מוגדר - השער פתוח לגמרי (המצב שהיה עד היום).
 *   LIMBA_GATE  - "off" מוריד את השאלטר: כל הקישורים מחזירים 404, גם עם סיסמה נכונה.
 *
 * שלוש דרכים להיכנס:
 *   1. קישור חד-לחיצה:  /limbaromana.html?key=הסיסמה   → מציב עוגייה לשנה ומנקה את ה-URL
 *   2. טופס סיסמה שמוגש למי שמגיע בלי עוגייה
 *   3. עוגייה קיימת (כך גרסת המסך-הבית בטלפון לא מבקשת סיסמה בכל פתיחה)
 *
 * לביטול גישה: משנים את LIMBA_PASS (כל העוגיות הקיימות נפסלות מיד) או LIMBA_GATE=off.
 * שינוי משתנה סביבה נכנס לתוקף אחרי Redeploy.
 */

const GATED = [
  '/limbaromana.html',
  '/limbaromana-audio.html',
  '/limbaromana-lessons.html',
  '/limbaromana-tutor.html',
];

const COOKIE = 'limba_key';
const YEAR = 60 * 60 * 24 * 365;

async function token(pass: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('limba::' + pass));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
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
  <p>העמוד הזה פרטי. הזינו את הסיסמה פעם אחת - הדפדפן יזכור.</p>
  ${wrong ? '<p class="err">סיסמה שגויה</p>' : ''}
  <input type="password" name="key" placeholder="סיסמה" autofocus autocomplete="current-password">
  <button type="submit">כניסה</button>
</form>
</body></html>`;
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (!GATED.includes(pathname)) return NextResponse.next();

  if ((process.env.LIMBA_GATE || '').toLowerCase() === 'off') {
    return new NextResponse('Not Found', { status: 404 });
  }

  const pass = process.env.LIMBA_PASS || '';
  if (!pass) return NextResponse.next();          // לא הוגדרה סיסמה - שום דבר לא משתנה

  const good = await token(pass);

  if (req.cookies.get(COOKIE)?.value === good) return NextResponse.next();

  const key = searchParams.get('key');
  if (key !== null) {
    if (key === pass) {
      const url = req.nextUrl.clone();
      url.searchParams.delete('key');
      const res = NextResponse.redirect(url);
      res.cookies.set(COOKIE, good, {
        path: '/', maxAge: YEAR, httpOnly: true, sameSite: 'lax',
        secure: req.nextUrl.protocol === 'https:',
      });
      return res;
    }
    return new NextResponse(loginPage(pathname, true), {
      status: 401,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    });
  }

  return new NextResponse(loginPage(pathname, false), {
    status: 401,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export const config = {
  matcher: [
    '/limbaromana.html',
    '/limbaromana-audio.html',
    '/limbaromana-lessons.html',
    '/limbaromana-tutor.html',
  ],
};
