import { neon } from '@neondatabase/serverless';
import { readFileSync, readdirSync } from 'node:fs';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const connection=process.env.LIMBA_DATABASE_URL||process.env.DATABASE_URL;
if(!connection) throw new Error('Database connection is not configured');
const sql=neon(connection);
for(const name of readdirSync('scripts/limba/migrations').filter(n=>n.endsWith('.sql')).sort()){
 const migration=readFileSync('scripts/limba/migrations/'+name,'utf8');
 for(const statement of migration.split(';').map(s=>s.trim()).filter(Boolean)) await sql.query(statement);
}
console.log('Additive progress migration applied. Existing records preserved.');
