import { randomBytes, scryptSync } from 'node:crypto';
import { writeFileSync, existsSync } from 'node:fs';
if (existsSync('.env.local') || existsSync('limba-local-access.txt')) throw new Error('Preview already configured; refusing to overwrite credentials or other environment settings.');
const passwords = {};
const users = [['amit', 'עמית'], ['neta', 'נטע']].map(([id, name]) => {
  const salt = randomBytes(16).toString('hex');
  const password = randomBytes(12).toString('base64url');
  passwords[id] = password;
  return { id, name, salt, hash: scryptSync(password, salt, 64).toString('hex') };
});
writeFileSync('.env.local', `LIMBA_LOCAL_PREVIEW=1\nLIMBA_PERSONAL_HOME=1\nLIMBA_SESSION_SECRET=${randomBytes(32).toString('hex')}\nLIMBA_USERS_JSON='${JSON.stringify(users)}'\n`, { mode: 0o600 });
writeFileSync('limba-local-access.txt', `פרטי כניסה להדגמה המקומית בלבד\n\nעמית\nשם משתמש: amit\nסיסמה: ${passwords.amit}\n\nנטע\nשם משתמש: neta\nסיסמה: ${passwords.neta}\n\nהנתונים נשמרים בעותק המקומי, לא בענן. קובץ זה אינו נשלח ל-Git.\n`, { mode: 0o600 });
console.log('Created local preview accounts; see limba-local-access.txt. No credentials printed or committed.');
