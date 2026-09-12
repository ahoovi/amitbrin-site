import { mkdir, readdir, readFile, open, link, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { UserId } from './session';

export type Rating = 'again' | 'help' | 'independent';
export type StudyEvent = { id: string; topic: string; rating: Rating; kind: 'self-report'; at: string; schema: 1 };
export const topicIds = ['routine20', 'past17', 'agreement2'];
// Deliberately local-only. Vercel's filesystem is not a persistent learner database.
export function storageReady() { return process.env.LIMBA_LOCAL_PREVIEW === '1' && !process.env.VERCEL && process.env.NODE_ENV !== 'production'; }
function directory(uid: UserId) {
  if (!storageReady()) throw new Error('Persistent storage has not been configured');
  return path.join(process.cwd(), '.limba-data', uid);
}
export async function readEvents(uid: UserId): Promise<StudyEvent[]> {
  const dir = directory(uid);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const names = (await readdir(dir)).filter(n => /^[a-f0-9-]{36}\.json$/.test(n));
  const events = await Promise.all(names.map(async n => JSON.parse(await readFile(path.join(dir, n), 'utf8')) as StudyEvent));
  return events.sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id));
}
export async function appendEvent(uid: UserId, event: StudyEvent) {
  const dir = directory(uid);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const filename = path.join(dir, event.id + '.json');
  // Publish a fully written file with an atomic hard link. Reads never see a partial JSON record.
  const temporary = path.join(dir, '.' + randomUUID() + '.tmp');
  const file = await open(temporary, 'wx', 0o600);
  try {
    try { await file.writeFile(JSON.stringify(event)); await file.sync(); } finally { await file.close(); }
    try { await link(temporary, filename); }
    catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
      const previous = JSON.parse(await readFile(filename, 'utf8')) as StudyEvent;
      if (previous.topic !== event.topic || previous.rating !== event.rating) throw new Error('Conflicting event id');
    }
  } finally { await unlink(temporary); }
}
