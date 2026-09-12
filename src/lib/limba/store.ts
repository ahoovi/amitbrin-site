import { mkdir, readdir, readFile, open, link, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import type { UserId } from './session';
import type { Assistance } from './diagnostic';

export type Rating = 'again' | 'help' | 'independent';
export type StudyEvent = {
  id: string; topic: string; rating: Rating; at: string; schema: 1 | 2;
  kind: 'self-report' | 'diagnostic'; assistance?: Assistance;
  diagnostic?: { version: string; item: string; answer: string; correct: boolean; near: boolean; skipped: boolean };
};
export const topicIds = ['intro1', 'afi2', 'agreement2', 'avea4', 'past17', 'routine20'];
export function storageMode(): 'cloud' | 'local-preview' | 'unconfigured' {
  if (process.env.LIMBA_STORAGE === 'neon') return (process.env.LIMBA_DATABASE_URL || process.env.DATABASE_URL) ? 'cloud' : 'unconfigured';
  if (process.env.LIMBA_LOCAL_PREVIEW === '1' && !process.env.VERCEL && process.env.NODE_ENV !== 'production') return 'local-preview';
  return 'unconfigured';
}
export const storageReady = () => storageMode() !== 'unconfigured';
function database() {
  const url=process.env.LIMBA_DATABASE_URL || process.env.DATABASE_URL;
  if (storageMode()!=='cloud' || !url) throw new Error('Cloud storage is not configured');
  return neon(url);
}
function directory(uid: UserId) {
  if (storageMode() !== 'local-preview') throw new Error('Local storage is disabled');
  return path.join(process.cwd(), '.limba-data', uid);
}
export async function readEvents(uid: UserId): Promise<StudyEvent[]> {
  if (storageMode()==='cloud') {
    const rows=await database()`SELECT event FROM limba_events WHERE user_id=${uid} ORDER BY recorded_at, id`;
    return rows.map(row=>row.event as StudyEvent);
  }
  const dir = directory(uid);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const names = (await readdir(dir)).filter(n => /^[a-f0-9-]{36}\.json$/.test(n));
  const events = await Promise.all(names.map(async n => JSON.parse(await readFile(path.join(dir, n), 'utf8')) as StudyEvent));
  return events.sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id));
}
function sameAttempt(a: StudyEvent,b: StudyEvent) {
  return a.topic===b.topic && a.rating===b.rating && a.kind===b.kind && (a.assistance||'none')===(b.assistance||'none') && JSON.stringify(a.diagnostic)===JSON.stringify(b.diagnostic);
}
export async function appendEvent(uid: UserId, event: StudyEvent) {
  if (storageMode()==='cloud') {
    const sql=database();
    await sql`INSERT INTO limba_events (user_id,id,event) VALUES (${uid},${event.id},${JSON.stringify(event)}::jsonb) ON CONFLICT (user_id,id) DO NOTHING`;
    const rows=await sql`SELECT event FROM limba_events WHERE user_id=${uid} AND id=${event.id}`;
    // JSONB reorders object keys: compare semantic fields, not JSON object key order.
    const previous=rows[0]?.event as StudyEvent;
    if (!previous || !sameAttempt({...previous,diagnostic:previous.diagnostic && orderedDiagnostic(previous.diagnostic)}, {...event,diagnostic:event.diagnostic && orderedDiagnostic(event.diagnostic)})) throw new Error('Conflicting event id');
    return;
  }
  const dir = directory(uid);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const filename = path.join(dir, event.id + '.json');
  const temporary = path.join(dir, '.' + randomUUID() + '.tmp');
  const file = await open(temporary, 'wx', 0o600);
  try {
    try { await file.writeFile(JSON.stringify(event)); await file.sync(); } finally { await file.close(); }
    try { await link(temporary, filename); }
    catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
      const previous = JSON.parse(await readFile(filename, 'utf8')) as StudyEvent;
      if (!sameAttempt(previous,event)) throw new Error('Conflicting event id');
    }
  } finally { await unlink(temporary); }
}
function orderedDiagnostic(d:NonNullable<StudyEvent['diagnostic']>) {
  return {version:d.version,item:d.item,answer:d.answer,correct:d.correct,near:d.near,skipped:d.skipped};
}
const localAttempts=new Map<string,{hits:number;expires:number}>();
export async function loginAllowed(bucket:string,limit:number) {
  if (storageMode()==='cloud') {
    const sql=database();
    const rows=await sql`INSERT INTO limba_rate_limits(bucket,hits,expires_at) VALUES(${bucket},1,now()+interval '15 minutes')
    ON CONFLICT (bucket) DO UPDATE SET hits=CASE WHEN limba_rate_limits.expires_at<now() THEN 1 ELSE limba_rate_limits.hits+1 END,
    expires_at=CASE WHEN limba_rate_limits.expires_at<now() THEN now()+interval '15 minutes' ELSE limba_rate_limits.expires_at END RETURNING hits`;
    return rows[0].hits<=limit;
  }
  if (storageMode()!=='local-preview') return false;
  const now=Date.now();
  for(const [key,value] of localAttempts) if(value.expires<now) localAttempts.delete(key);
  const entry=localAttempts.get(bucket)||{hits:0,expires:now+15*60_000};
  entry.hits++;localAttempts.set(bucket,entry);return entry.hits<=limit;
}
export async function clearLoginAttempts(bucket:string) {
  if(storageMode()==='cloud') await database()`DELETE FROM limba_rate_limits WHERE bucket=${bucket}`;
  else localAttempts.delete(bucket);
}
