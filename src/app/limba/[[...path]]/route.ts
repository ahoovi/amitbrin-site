import { NextRequest, NextResponse } from 'next/server';
import { readSession, SESSION_COOKIE } from '@/lib/limba/session';
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (!['/limba', '/limba/login', '/limba/practice'].includes(pathname)) return new NextResponse('Not found', { status: 404 });
  const user = await readSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!user && pathname !== '/limba/login') return NextResponse.redirect(new URL('/limba/login', req.url));
  if (user && pathname === '/limba/login') return NextResponse.redirect(new URL('/limba', req.url));
  return new NextResponse(`<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#f7f4ed"><title>הרומנית שלי · Limba română</title><link rel="stylesheet" href="/limba-personal/style.css"><script src="/limba-personal/app.js" defer></script></head><body><a class="skip" href="#main">דילוג לתוכן</a><div id="app"><main id="main" class="loading"><p>פותחים את הרומנית שלך…</p></main></div><noscript>כדי להיכנס ולשמור התקדמות יש להפעיל JavaScript בדפדפן.</noscript></body></html>`, { headers: {
    'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'Vary': 'Cookie', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    'Referrer-Policy': 'same-origin', 'Permissions-Policy': 'microphone=(), camera=()'
  }});
}
