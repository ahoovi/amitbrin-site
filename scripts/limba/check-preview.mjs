// Integration checks only against the explicitly enabled local pilot.
import assert from 'node:assert/strict';
import { readFileSync, unlinkSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
const base = 'http://localhost:3147';
const access = readFileSync('limba-local-access.txt', 'utf8');
const password = id => access.match(new RegExp(`שם משתמש: ${id}\\nסיסמה: (.+)`))[1];
const created = [];
let checks = 0;
const check = (value, message) => { assert.ok(value, message); checks++; };
async function call(action, body, cookie, origin = base) {
  return fetch(base + '/api/limba/' + action, { method: body === undefined ? 'GET' : 'POST', headers: { ...(body === undefined ? {} : {'Content-Type':'application/json', Origin:origin}), ...(cookie ? {Cookie:cookie} : {}) }, ...(body === undefined ? {} : {body:JSON.stringify(body)}) });
}
const login = async id => {
  const response = await call('login', {username:id,password:password(id)});
  check(response.status === 200, id + ' can sign in');
  const cookie = response.headers.get('set-cookie');
  check(cookie.includes('HttpOnly') && cookie.includes('SameSite=lax') && cookie.includes('Path=/'), 'protected session cookie');
  return cookie.split(';')[0];
};
try {
  check((await call('me')).status === 401, 'anonymous profile denied');
  check((await call('login',{username:'amit',password:password('amit')},null,'https://untrusted.example')).status === 403, 'cross-origin sign in denied');
  check((await call('login',{username:'amit',password:'wrong'})).status === 401, 'wrong password denied');
  const amit = await login('amit'); const neta = await login('neta');
  const a0 = await (await call('me',undefined,amit)).json();
  const n0 = await (await call('me',undefined,neta)).json();
  check(a0.user.id === 'amit' && n0.user.id === 'neta', 'independent identities');
  const id = randomUUID(); created.push(id);
  const event = {id,topic:'past17',rating:'help'};
  check((await call('events',{...event,uid:'neta'},amit)).status === 400,'cannot choose another learner');
  check((await call('events',event,undefined)).status === 401, 'anonymous writes denied');
  check((await call('events',event,amit,'https://untrusted.example')).status === 403, 'cross-origin write denied');
  const replies = await Promise.all(Array.from({length:5},()=>call('events',event,amit)));
  check(replies.every(r=>r.status===200),'concurrent retries succeed atomically');
  const a1 = await (await call('me',undefined,amit)).json();
  check(a1.events.filter(e=>e.id===id).length===1,'duplicate retries stored only once');
  check(a1.events.length===a0.events.length+1,'append preserves earlier progress');
  const n1 = await (await call('me',undefined,neta)).json();
  check(JSON.stringify(n1.events)===JSON.stringify(n0.events),'Amit progress never leaks into Neta account');
  check((await call('events',{...event,rating:'again'},amit)).status===503,'conflicting retry does not overwrite');
  check((await call('me',undefined,amit+'corrupt')).status===401,'tampered session denied');
  const again = await login('amit');
  const a2 = await (await call('me',undefined,again)).json();
  check(a2.events.some(e=>e.id===id),'progress survives new login');
  const logout = await call('logout',{},again);
  check(logout.status===200 && logout.headers.get('set-cookie').includes('Max-Age=0'),'logout expires cookie');
  const landing = await fetch(base+'/limbaromana.html', {redirect:'manual'});
  check(landing.status===307 && landing.headers.get('location').endsWith('/limba'),'optional home routing enabled');
  const book = await fetch(base+'/limbaromana.html?library=1', {headers:{Cookie:amit}});
  check(book.status===200 && (await book.text()).includes('id="dlall"'),'book and audio-download entry preserved');
  const page = await fetch(base+'/limba/login');
  check(page.headers.get('cache-control').includes('no-store'),'private page not cached');
  check(page.headers.get('content-security-policy').includes("frame-ancestors 'none'"),'page embedding blocked');
  check((await call('events',{id:randomUUID(),topic:'../neta',rating:'help'},amit)).status===400,'unregistered topic denied');
  console.log(`PASS: ${checks} checks covering authentication, account isolation, persistence, idempotence and request protection.`);
} finally {
  // Remove only the exact synthetic event IDs created by this test in the local preview.
  for (const id of created) {
    const filename = `.limba-data/amit/${id}.json`;
    if (existsSync(filename)) unlinkSync(filename);
  }
}
