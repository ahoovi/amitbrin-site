// Web Crypto only: shared by the Node route and the existing Edge middleware.
export const SESSION_COOKIE = 'limba_personal';
export const SESSION_SECONDS = 60 * 60 * 24 * 30;
export type UserId = 'amit' | 'neta';
export type Account = { id: UserId; name: string; salt: string; hash: string };
export const isUser = (value: unknown): value is UserId => value === 'amit' || value === 'neta';
export function accounts(): Account[] {
  try {
    const value = JSON.parse(process.env.LIMBA_USERS_JSON || '[]');
    if (!Array.isArray(value)) return [];
    return value.filter((a): a is Account => isUser(a.id) && typeof a.name === 'string' && /^[a-f0-9]{32}$/.test(a.salt) && /^[a-f0-9]{128}$/.test(a.hash));
  } catch { return []; }
}
const enc = new TextEncoder();
function encode(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', ''); }
function decode(value: string) { return Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0)); }
async function key() {
  const secret = process.env.LIMBA_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('Session secret unavailable');
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
export async function issueSession(account: Account) {
  const body = encode(enc.encode(JSON.stringify({ uid: account.id, rev: account.salt, exp: Math.floor(Date.now()/1000) + SESSION_SECONDS })));
  return body + '.' + encode(new Uint8Array(await crypto.subtle.sign('HMAC', await key(), enc.encode(body))));
}
export async function readSession(value: string | undefined): Promise<Account | null> {
  if (!value || value.length > 1024) return null;
  try {
    const parts = value.split('.');
    if (parts.length !== 2 || !await crypto.subtle.verify('HMAC', await key(), decode(parts[1]), enc.encode(parts[0]))) return null;
    const payload = JSON.parse(new TextDecoder().decode(decode(parts[0])));
    if (!Number.isFinite(payload.exp) || payload.exp <= Date.now()/1000) return null;
    return accounts().find(a => a.id === payload.uid && a.salt === payload.rev) || null;
  } catch { return null; }
}
