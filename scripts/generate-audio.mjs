/**
 * generate-audio.mjs
 * Pre-generates canonical lesson content + ElevenLabs audio for שלב א (units u1–u5)
 * Run once: node scripts/generate-audio.mjs
 *
 * Output:
 *   public/audio/u1/content.json   ← canonical lesson JSON (used by app)
 *   public/audio/u1/vocab_0_f1.mp3  ← vocab word 0, female 1
 *   public/audio/u1/vocab_0_f2.mp3  ← vocab word 0, female 2
 *   public/audio/u1/vocab_0_m1.mp3  ← vocab word 0, male 1
 *   public/audio/u1/vocab_0_m2.mp3  ← vocab word 0, male 2
 *   ... (same for each vocab, sentence, dialogue line)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(ROOT, 'public', 'audio');

// ── Load env ──────────────────────────────────────────────
import { readFileSync } from 'fs';
function loadEnv() {
  try {
    const env = readFileSync(path.join(ROOT, '.env.local'), 'utf8');
    for (const line of env.split('\n')) {
      const m = line.match(/^([^=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  } catch {}
}
loadEnv();

const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY;
const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY;

if (!ANTHROPIC_KEY)  { console.error('❌ Missing ANTHROPIC_API_KEY');  process.exit(1); }
if (!ELEVENLABS_KEY) { console.error('❌ Missing ELEVENLABS_API_KEY'); process.exit(1); }

// ── Voices ────────────────────────────────────────────────
const VOICES = {
  f1: 'XB0fDUnXU5powFXDhCwa',  // Charlotte
  f2: 'br0MPoLVxuslVxf61qHn',  // Lizy
  m1: 'onwK4e9ZLuTAKqWW03F9',  // Daniel
  m2: 'TX3LPaxmHKxFdv7VOQHJ',  // Liam
};

// ── Units in שלב א ────────────────────────────────────────
const UNITS = [
  { id: 'u1', name: 'ברכות ראשונות',   sub: 'Bună ziua, mulțumesc', topic: 'salut' },
  { id: 'u2', name: 'מספרים 1–20',     sub: 'unu, doi, trei...',    topic: 'numere' },
  { id: 'u3', name: 'צבעים',            sub: 'roșu, albastru, verde', topic: 'culori' },
  { id: 'u4', name: 'משפחה',            sub: 'mamă, tată, frate',    topic: 'familie' },
  { id: 'u5', name: 'גוף האדם',         sub: 'cap, mâini, picioare', topic: 'corp' },
];

const SYSTEM = `Romanian teacher. Mini-lesson for Hebrew beginners. Return ONLY valid JSON:
{"vocab":[{"ro":"bun","he":"טוב","emoji":"👍"}],"sentences":[{"ro":"Bună ziua!","he":"שלום!","note":"ברכה רשמית"}],"mini_ro":"- Bună ziua!\\n- Ce mai faceți?","mini_he":"- שלום!\\n- מה שלומכם?"}
4-6 vocab, 3-4 sentences, short dialogue. A1.`;

// ── Claude call ───────────────────────────────────────────
async function generateContent(unit) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Mini-lesson for "${unit.name}" (${unit.sub}), category: ${unit.topic}. A1 level.` }],
    }),
  });
  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  // Extract JSON
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('No JSON in response: ' + text.slice(0, 200));
  return JSON.parse(m[0]);
}

// ── ElevenLabs call ───────────────────────────────────────
async function generateSpeech(text, voiceId) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${err.slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

// ── Collect all texts from a lesson ──────────────────────
function collectTexts(lesson) {
  const items = [];
  // Vocab Romanian words
  for (let i = 0; i < lesson.vocab.length; i++) {
    items.push({ key: `vocab_${i}`, text: lesson.vocab[i].ro });
  }
  // Sentences Romanian
  for (let i = 0; i < lesson.sentences.length; i++) {
    items.push({ key: `sent_${i}`, text: lesson.sentences[i].ro });
  }
  // Dialogue lines (split by newline, filter empty)
  const lines = (lesson.mini_ro || '').split('\n').filter(l => l.trim());
  for (let i = 0; i < lines.length; i++) {
    items.push({ key: `dial_${i}`, text: lines[i].replace(/^[-–]\s*/, '') });
  }
  return items;
}

// ── Sleep helper (rate limiting) ──────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log(`\n🎙️  Audio pre-generation — שלב א (${UNITS.length} units × 4 voices)\n`);

  for (const unit of UNITS) {
    const dir = path.join(AUDIO_DIR, unit.id);
    fs.mkdirSync(dir, { recursive: true });

    const contentFile = path.join(dir, 'content.json');

    // ── Generate or load content ──
    let lesson;
    if (fs.existsSync(contentFile)) {
      console.log(`  📂 ${unit.id} — loading cached content`);
      lesson = JSON.parse(fs.readFileSync(contentFile, 'utf8'));
    } else {
      process.stdout.write(`  ✨ ${unit.id} — generating content via Claude... `);
      lesson = await generateContent(unit);
      fs.writeFileSync(contentFile, JSON.stringify(lesson, null, 2));
      console.log('✓');
      await sleep(500);
    }

    const texts = collectTexts(lesson);
    const missing = texts.flatMap(({key, text}) =>
      Object.entries(VOICES)
        .filter(([vName]) => !fs.existsSync(path.join(dir, `${key}_${vName}.mp3`)))
        .map(([vName, vId]) => ({ key, text, vName, vId }))
    );
    console.log(`     ${texts.length} texts × 4 voices = ${texts.length * 4} files (${texts.length*4-missing.length} cached, ${missing.length} to generate)`);

    // Generate voices sequentially (ElevenLabs free tier: max 3 concurrent)
    for (const { key, text, vName, vId } of missing) {
      try {
        const buf = await generateSpeech(text, vId);
        fs.writeFileSync(path.join(dir, `${key}_${vName}.mp3`), buf);
        process.stdout.write('▸');
      } catch (e) {
        process.stdout.write('✗');
        console.error(`\n     Error ${key}/${vName}: ${e.message?.slice(0,120)}`);
      }
      await sleep(80);
    }
    console.log(`\n     ✅ ${unit.id} done\n`);
  }

  console.log('🎉  All done! Static audio files saved to public/audio/\n');
}

main().catch(e => { console.error(e); process.exit(1); });
