import { voiceReady } from '@/lib/limba/voice';
import { NextRequest, NextResponse } from 'next/server';
import { scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { accounts, issueSession, readSession, SESSION_COOKIE, SESSION_SECONDS } from '@/lib/limba/session';
import { appendEvent, readEvents, storageReady, storageMode, loginAllowed, clearLoginAttempts, topicIds, type Rating } from '@/lib/limba/store';

import { diagnosticItems, publicDiagnosticItems, gradeItem, assistanceLevels, DIAGNOSTIC_VERSION, type Assistance } from '@/lib/limba/diagnostic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const derive = promisify(scrypt);
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie', 'X-Content-Type-Options': 'nosniff' } });
export async function GET(req: NextRequest) {
  if (!storageReady()) return json({ error: 'הגרסה האישית עדיין לא הופעלה בשרת הזה.' }, 503);
  const user = await readSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!user) return json({ error: 'יש להיכנס לחשבון האישי.' }, 401);
  if (req.nextUrl.pathname === '/api/limba/diagnostic') return json({ version: DIAGNOSTIC_VERSION, items: publicDiagnosticItems() });
  if (req.nextUrl.pathname !== '/api/limba/me') return json({ error: 'לא נמצא' }, 404);
  try {
    return json({ user: { id: user.id, name: user.name }, events: await readEvents(user.id), storage: storageMode(), voice: voiceReady() });
  } catch { return json({ error: 'לא הצלחנו לקרוא את ההתקדמות. אפשר לנסות שוב.' }, 503); }
}
export async function POST(req: NextRequest) {
  // All writes require same-origin JSON, including login/logout (CSRF protection).
  if (req.headers.get('origin') !== req.nextUrl.origin || !req.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'בקשה לא מורשית.' }, 403);
  if (!storageReady()) return json({ error: 'הגרסה האישית עדיין לא הופעלה בשרת הזה.' }, 503);
  const action = req.nextUrl.pathname;
  if (action === '/api/limba/logout') {
    const res = json({ ok: true });
    res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax', secure: req.nextUrl.protocol === 'https:' });
    return res;
  }
  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 2048) return json({ error: 'בקשה ארוכה מדי.' }, 413);
    body = JSON.parse(raw);
    if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error();
  } catch { return json({ error: 'בקשה לא תקינה.' }, 400); }
  if (action === '/api/limba/login') {
    const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    // Cloud rate limits are shared across instances and devices.
    try {
      if (!await loginAllowed('all', 120) || !await loginAllowed('account:'+username.slice(0, 40),8)) return json({ error: 'יותר מדי ניסיונות. נסו שוב בעוד רבע שעה.' }, 429);
    } catch { return json({error:'לא ניתן להתחבר כרגע. נסו שוב בעוד רגע.'},503); }
    const user = accounts().find(a => a.id === username);
    const hash = await derive(password, user?.salt || '0'.repeat(32), 64) as Buffer;
    if (!user || !timingSafeEqual(hash, Buffer.from(user.hash, 'hex'))) return json({ error: 'שם המשתמש או הסיסמה אינם נכונים.' }, 401);
    try {
      await clearLoginAttempts('account:'+username.slice(0, 40));
      const res = json({ ok: true });
      res.cookies.set(SESSION_COOKIE, await issueSession(user), { httpOnly: true, sameSite: 'lax', secure: req.nextUrl.protocol === 'https:', path: '/', maxAge: SESSION_SECONDS });
      return res;
    } catch { return json({ error: 'הכניסה עדיין לא הוגדרה.' }, 503); }
  }
  const user = await readSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!user) return json({ error: 'יש להיכנס שוב לחשבון האישי.' }, 401);
  if (action === '/api/limba/diagnostic') {
    const item=diagnosticItems.find(i=>i.id===body.item);
    if (Object.keys(body).some(k=>!['id','item','answer','assistance','skipped'].includes(k)) || typeof body.id!=='string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(body.id) || !item || typeof body.answer!=='string' || body.answer.length>100 || !assistanceLevels.includes(body.assistance as Assistance) || typeof body.skipped!=='boolean' || (!body.skipped && !body.answer.trim())) return json({error:'תשובה לא תקינה.'},400);
    const assistance=body.assistance as Assistance;
    const answer=body.skipped?'':body.answer;
    const result=gradeItem(item.id,answer,assistance);
    try {
      await appendEvent(user.id,{id:body.id,topic:item.topic,kind:'diagnostic',schema:2,at:new Date().toISOString(),rating:result.rating,assistance,diagnostic:{version:DIAGNOSTIC_VERSION,item:item.id,answer,correct:result.correct,near:result.near,skipped:body.skipped}});
      return json({ok:true,result:{...result,explanation:item.explanation},events:await readEvents(user.id)});
    } catch { return json({error:'התשובה עדיין לא נשמרה. נסו שוב; התשובה נשארת כאן.'},503); }
  }
  if (action !== '/api/limba/events') return json({ error: 'לא נמצא' }, 404);
  if (Object.keys(body).some(k => !['id', 'topic', 'rating', 'assistance'].includes(k)) || typeof body.id !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(body.id) || typeof body.topic !== 'string' || !topicIds.includes(body.topic) || !['again', 'help', 'independent'].includes(String(body.rating)) || (body.assistance!==undefined && !assistanceLevels.includes(body.assistance as Assistance))) return json({ error: 'תוצאת תרגול לא תקינה.' }, 400);
  try {
    await appendEvent(user.id, { id: body.id, topic: body.topic, rating: body.rating==='independent' && body.assistance && body.assistance!=='none' ? 'help' : body.rating as Rating, kind: 'self-report', schema: 2, assistance: (body.assistance as Assistance)||'none', at: new Date().toISOString() });
    return json({ ok: true, events: await readEvents(user.id) });
  } catch { return json({ error: 'התרגול לא נשמר. השאירו את העמוד פתוח ונסו שוב.' }, 503); }
}
