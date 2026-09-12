import {NextRequest,NextResponse} from 'next/server';
import {readSession,SESSION_COOKIE} from '@/lib/limba/session';
import {loginAllowed} from '@/lib/limba/store';
import {voiceReady,voiceDB,voiceClient,voiceConfig,voiceTopics} from '@/lib/limba/voice';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
export async function POST(req:NextRequest){
 if(req.headers.get('origin')!==req.nextUrl.origin||!req.headers.get('content-type')?.startsWith('application/json'))return json({error:'בקשה לא מורשית.'},403);
 const user=await readSession(req.cookies.get(SESSION_COOKIE)?.value);
 if(!user)return json({error:'יש להיכנס לחשבון האישי.'},401);
 if(!voiceReady())return json({error:'החיבור הקולי עדיין ממתין להגדרת מפתח OpenAI בשרת.'},503);
 let body:Record<string,unknown>;
 try{const raw=await req.text();if(raw.length>65536)return json({error:'בקשה ארוכה מדי.'},413);body=JSON.parse(raw);if(!body||Array.isArray(body)||typeof body!=='object')throw Error();}catch{return json({error:'בקשה לא תקינה.'},400);}
 if(typeof body.id!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(body.id))return json({error:'מזהה שיחה לא תקין.'},400);
 const sql=voiceDB(),action=req.nextUrl.pathname.split('/').at(-1);
 try{
  if(action==='check'){
   if(Object.keys(body).some(k=>k!=='id'))return json({error:'בקשה לא תקינה.'},400);
   if(!await loginAllowed('voice-check:'+user.id,6))return json({error:'אפשר לבדוק שוב בעוד רבע שעה.'},429);
   await voiceClient().models.retrieve('gpt-live-1');
   return json({ok:true,model:'gpt-live-1'});
  }
  if(action==='finish'){
   if(Object.keys(body).some(k=>!['id','seconds','finalized'].includes(k))||typeof body.finalized!=='boolean'||typeof body.seconds!=='number'||!Number.isFinite(body.seconds)||body.seconds<0||body.seconds>14400)return json({error:'סיכום לא תקין.'},400);
   const rows=await sql`SELECT provider_id,ended_at FROM limba_voice_sessions WHERE id=${body.id} AND user_id=${user.id}`;
   if(!rows.length)return json({error:'השיחה לא נמצאה.'},404);
   if(!rows[0].ended_at && rows[0].provider_id){try{await voiceClient().live.sessions.hangup(rows[0].provider_id);}catch(error){const status=(error as {status?:number}).status;if(status!==404&&status!==409)return json({error:'סיום השיחה בשרת לא אושר. אפשר לנסות שוב.'},503);}}
   await sql`UPDATE limba_voice_sessions SET ended_at=COALESCE(ended_at,now()),client_seconds=${body.seconds},client_finalized=${body.finalized} WHERE id=${body.id} AND user_id=${user.id}`;
   return json({ok:true});
  }
  if(action!=='start')return json({error:'לא נמצא'},404);
  if(Object.keys(body).some(k=>!['id','topic','minutes','sdp'].includes(k))||typeof body.topic!=='string'||!voiceTopics[body.topic]||![5,10,15,20].includes(Number(body.minutes))||typeof body.sdp!=='string'||!body.sdp.startsWith('v=0')||body.sdp.length>50000)return json({error:'פרטי שיחה לא תקינים.'},400);
  const reserved=await sql`INSERT INTO limba_voice_sessions(id,user_id,topic) VALUES(${body.id},${user.id},${body.topic}) ON CONFLICT(id) DO NOTHING RETURNING id`;
  if(!reserved.length)return json({error:'כבר נשלחה בקשת התחלה. סגרו ופתחו שיחה חדשה.'},409);
  // Shared daily start limit. A failed or uncertain start counts too; never auto-retry a billed creation.
  const quota=await sql`INSERT INTO limba_voice_quota(user_id,day,starts) VALUES(${user.id},CURRENT_DATE,1) ON CONFLICT(user_id,day) DO UPDATE SET starts=limba_voice_quota.starts+1 WHERE limba_voice_quota.starts<12 RETURNING starts`;
  if(!quota.length)return json({error:'הגענו למגבלת 12 התחלות שיחה להיום. אפשר להמשיך בתרגול הכתוב.'},429);
  const session=await voiceConfig(user.id,body.topic,Number(body.minutes));
  const result=await voiceClient().live.create({session,transport:{type:'webrtc',sdp:body.sdp}});
  try{await sql`UPDATE limba_voice_sessions SET provider_id=${result.session.id} WHERE id=${body.id} AND user_id=${user.id}`;}catch(error){await voiceClient().live.sessions.hangup(result.session.id).catch(()=>{});throw error;}
  return json({id:body.id,session:result.session,transport:result.transport,maxSeconds:Number(body.minutes)*60},201);
 }catch(error){
  const status=(error as {status?:number}).status||503;
  const code=(error as {code?:string}).code;
  console.error('Limba voice request failed',{status,code:typeof code==='string'?code.slice(0,80):undefined});
  const message=status===401?'OpenAI לא קיבל את מפתח ה־API. יש לעדכן את המפתח בשרת לפני תחילת שיחה.':status===403||status===404?'למפתח הזה אין כרגע גישה ל־GPT Live. יש לבדוק הרשאות בפרויקט OpenAI.':status===429?'OpenAI הגביל את השימוש כרגע. בדקו יתרה ומגבלות API או נסו מאוחר יותר.':'לא הצלחנו להשלים את החיבור הקולי. אפשר לנסות שוב בעוד רגע.';
  return json({error:message},503);
 }
}
