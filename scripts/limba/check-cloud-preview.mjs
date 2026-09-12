import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {randomUUID} from 'node:crypto';
import {neon} from '@neondatabase/serverless';
const env=parseEnv(readFileSync('.env.local','utf8'));
const share=process.env.LIMBA_PREVIEW_SHARE_URL;
const production=process.env.LIMBA_PRODUCTION_URL;
if(production && production!=='https://www.amitbrin.com')throw new Error('Unexpected production destination');
if(!share&&!production)throw new Error('Set an approved preview sharing URL or LIMBA_PRODUCTION_URL');
const base=production||new URL(share).origin;
if(!production&&!base.endsWith('-ahoovis-projects.vercel.app'))throw new Error('Unexpected test destination');
const gate=share&&!production?await fetch(share,{redirect:'manual'}):null;
const accessCookie=gate?gate.headers.getSetCookie().map(s=>s.split(';')[0]).join('; '):'';
const access=readFileSync('limba-local-access.txt','utf8');
const password=id=>access.match(new RegExp(`שם משתמש: ${id}\\nסיסמה: (.+)`))[1];
async function call(action,body,cookie=''){
 return fetch(base+'/api/limba/'+action,{method:body===undefined?'GET':'POST',redirect:'manual',headers:{Cookie:[accessCookie,cookie].filter(Boolean).join('; '),...(body===undefined?{}:{'Content-Type':'application/json',Origin:base})},...(body===undefined?{}:{body:JSON.stringify(body)})});
}
async function login(id){const r=await call('login',{username:id,password:password(id)});assert.equal(r.status,200);const c=r.headers.get('set-cookie');assert.match(c,/Secure/);assert.match(c,/HttpOnly/);return c.split(';')[0];}
const sql=neon(env.LIMBA_DATABASE_URL);
const id=randomUUID();
try{
 assert.equal((await call('me')).status,401);
 const amit=await login('amit'),neta=await login('neta');
 const before=await (await call('me',undefined,amit)).json();assert.equal(before.storage,'cloud');assert.equal(before.voice,true);
 const probe=await call('voice/check',{id:randomUUID()},amit);assert.equal(probe.status,200,'OpenAI model access');
 const event={id,item:'afi-1',answer:'sunt',assistance:'hint',skipped:false};
 const result=await call('diagnostic',event,amit);assert.equal(result.status,200);
 const checked=await result.json();assert.equal(checked.result.rating,'help');
 const secondSession=await login('amit');
 const restored=await (await call('me',undefined,secondSession)).json();assert.equal(restored.events.filter(e=>e.id===id).length,1);
 const other=await (await call('me',undefined,neta)).json();assert.ok(!other.events.some(e=>e.id===id));
 const rows=await sql`SELECT event FROM limba_events WHERE user_id=${'amit'} AND id=${id}`;assert.equal(rows.length,1);
 console.log('PASS: deployed site, both passwords, secure sessions, cloud write, independent login readback and account isolation.');
}finally{
 await sql`DELETE FROM limba_events WHERE user_id=${'amit'} AND id=${id}`;
 const rows=await sql`SELECT id FROM limba_events WHERE user_id=${'amit'} AND id=${id}`;assert.equal(rows.length,0);
 console.log('Removed only this test UUID; preexisting learner progress preserved.');
}
