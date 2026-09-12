// One-way additive import; existing cloud events and local source files are preserved.
import { neon } from '@neondatabase/serverless';
import { readdir, readFile } from 'node:fs/promises';
const connection=process.env.LIMBA_DATABASE_URL||process.env.DATABASE_URL;
if(!connection)throw new Error('Database connection is not configured');
const sql=neon(connection);let imported=0;
for(const user of ['amit','neta']){
  let files;try{files=await readdir(`.limba-data/${user}`);}catch(e){if(e.code==='ENOENT')continue;throw e;}
  for(const file of files.filter(f=>/^[a-f0-9-]{36}\.json$/.test(f))){
    const event=JSON.parse(await readFile(`.limba-data/${user}/${file}`,'utf8'));
    if(file!==event.id+'.json'||!['self-report','diagnostic'].includes(event.kind))throw new Error('Invalid local record; import stopped');
    const rows=await sql`INSERT INTO limba_events(user_id,id,event,recorded_at) VALUES(${user},${event.id},${JSON.stringify(event)}::jsonb,${event.at}::timestamptz) ON CONFLICT(user_id,id) DO NOTHING RETURNING id`;
    imported+=rows.length;
  }
}
console.log(`Imported ${imported} local event(s); existing records and local originals preserved.`);
