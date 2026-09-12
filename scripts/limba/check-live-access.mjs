// Read-only OpenAI model-access probe through the authenticated preview server.
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const url=process.env.LIMBA_PREVIEW_SHARE_URL;
if(!url)throw Error('Set the approved preview share URL');
const base=new URL(url).origin;
if(!base.endsWith('-ahoovis-projects.vercel.app'))throw Error('Unexpected destination');
const gate=await fetch(url,{redirect:'manual'});
const protection=gate.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
const access=readFileSync('limba-local-access.txt','utf8');
const password=access.match(/שם משתמש: amit\nסיסמה: (.+)/)[1];
const call=(action,body,cookie='')=>fetch(base+'/api/limba/'+action,{method:'POST',redirect:'manual',headers:{Origin:base,'Content-Type':'application/json',Cookie:[protection,cookie].filter(Boolean).join('; ')},body:JSON.stringify(body)});
assert.equal((await call('voice/check',{id:randomUUID()})).status,401);
const login=await call('login',{username:'amit',password});if(login.status!==200){console.log('Login check:',login.status,(await login.text()).slice(0,250));process.exit(1);}
const cookie=login.headers.get('set-cookie').split(';')[0];
const probe=await call('voice/check',{id:randomUUID()},cookie);
console.log('Live access probe:',probe.status,await probe.json());
if(!probe.ok)process.exitCode=1;
