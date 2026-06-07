/**
 * Reinforcement content generation — Tier 1 (static) + Tier 3 (LLM).
 *
 * USAGE PATTERN (recommended for zero perceived latency):
 *
 *   1. When user enters the LAST card of the lesson, kick off generation
 *      in the background. Don't await.
 *   2. By the time user finishes the last card, content is ready.
 *   3. Pass it to <ReinforcementScreen content={...} />
 *
 * If generation fails or hasn't completed, the screen shows the
 * "הסבתא חושבת..." loading state until content arrives.
 */

import type {
  ReinforcementContent,
  ReinforcementMood,
} from '../components/ReinforcementScreen';

// ───── Session signals (passed in from VocabModule) ──────────────────────────

export interface SessionSignals {
  userName: string;
  topicHe: string;                      // e.g. "אוכל ומשקאות"
  topicRo?: string;                     // e.g. "lichide"
  wordsLearned: string[];               // all Romanian words shown this session
  wordsMarkedForReinforcement: string[]; // words that got the orange/review button
}

/**
 * Decide which tier to show based on session signals.
 */
export function decideTier(signals: SessionSignals): 'advanced' | 'reinforcement' {
  return signals.wordsMarkedForReinforcement.length > 0
    ? 'reinforcement'
    : 'advanced';
}

// ═════════════════════════════════════════════════════════════════════════════
//  TIER 1 — Static bank (lesson went perfectly)
// ═════════════════════════════════════════════════════════════════════════════
//
// Add more entries per topic over time. The grandmother's address tone
// alternates between "love" (warm), "reward" (food gift), and "reward2"
// (cake / special celebration) for variety.

interface Tier1Entry {
  topicKey: string;
  mood: ReinforcementMood;
  addressNeta: string;
  addressAmit: string;
  tipText: string;
  exampleHebRule: string;
  exampleRomRule: string;
  translationRom: string;
  translationHeb: string;
}

const TIER1_BANK: Tier1Entry[] = [
  // ── lichide (נוזלים) ─────────────────────────────────────────────────────
  {
    topicKey: 'lichide',
    mood: 'reward',
    addressNeta: 'נטע׳לה, יפה מאוד!',
    addressAmit: 'עמית׳לה, יפה מאוד!',
    tipText:
      'עכשיו שאת/ה מכיר/ה את המילים הבסיסיות לנוזלים, כדאי לדעת: ברומנית הביטוי "cu apă" (עם מים) הוא דרך לבקש משקה בלי תוספות. שמ/עי את זה הרבה במסעדה.',
    exampleHebRule: 'אני רוצה קפה, אבל עם מים בצד',
    exampleRomRule: 'Vreau o cafea, dar cu apă',
    translationRom: 'cu apă',
    translationHeb: 'עם מים',
  },
  {
    topicKey: 'lichide',
    mood: 'love',
    addressNeta: 'נטע׳לה, את גאווה!',
    addressAmit: 'עמית׳לה, אתה גאווה!',
    tipText:
      'שימי/שים לב לטריק קטן - ברומנית אומרים "vin alb" ליין לבן ו"vin roșu" ליין אדום. שם התואר תמיד אחרי שם העצם, הפוך מעברית.',
    exampleHebRule: 'יין אדום מצוין',
    exampleRomRule: 'Vin roșu excelent',
    translationRom: 'vin roșu',
    translationHeb: 'יין אדום',
  },

  // ── הצגה עצמית (introductions) ────────────────────────────────────────────
  {
    topicKey: 'introductions',
    mood: 'reward2',
    addressNeta: 'נטע׳לה, מצוין!',
    addressAmit: 'עמית׳לה, מצוין!',
    tipText:
      'כשמציגים את עצמך ברומנית, אומרים "Mă numesc..." או הפשוט יותר "Sunt...". שני המבנים נכונים, אבל "Sunt" יותר יום-יומי וטבעי לשיחה.',
    exampleHebRule: 'אני נטע, נעים מאוד',
    exampleRomRule: 'Sunt Neta, încântată',
    translationRom: 'Sunt',
    translationHeb: 'אני',
  },

  // ── default fallback (any topic) ─────────────────────────────────────────
  {
    topicKey: 'default',
    mood: 'love',
    addressNeta: 'נטע׳לה, כל הכבוד!',
    addressAmit: 'עמית׳לה, כל הכבוד!',
    tipText:
      'סיימת את כל המילים בלי טעויות. זה אומר שאת/ה מוכן/ה לעלות שלב - בשיעור הבא ננסה גם משפטים שלמים, לא רק מילים בודדות.',
    exampleHebRule: 'אני מבין/ה רומנית טוב',
    exampleRomRule: 'Înțeleg bine româna',
    translationRom: 'bine',
    translationHeb: 'טוב',
  },
];

/**
 * Get a Tier 1 tip — synchronous, no network needed.
 * Used when lesson went well.
 */
export function getTier1Content(signals: SessionSignals): ReinforcementContent {
  // Try to find topic-specific tips, then fall back to default
  const topicKey = (signals.topicRo || '').toLowerCase();
  const matches = TIER1_BANK.filter(
    (e) => e.topicKey === topicKey || e.topicKey === 'default'
  );
  const pool = matches.length > 0 ? matches : TIER1_BANK.filter((e) => e.topicKey === 'default');
  const entry = pool[Math.floor(Math.random() * pool.length)];

  return {
    mood: entry.mood,
    address: signals.userName === 'Neta' ? entry.addressNeta : entry.addressAmit,
    tipText: entry.tipText,
    exampleHebRule: entry.exampleHebRule,
    exampleRomRule: entry.exampleRomRule,
    translationRom: entry.translationRom,
    translationHeb: entry.translationHeb,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
//  TIER 3 — LLM-generated reinforcement (when words were marked for review)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Generate personalized Tier 3 reinforcement content via Claude API.
 *
 * Reuses the same `callAI` helper your VocabModule uses (you'll need to pass
 * it in, since this lib file shouldn't depend on page.tsx internals).
 *
 * Returns null on failure — caller should fall back to a static Tier 3 tip
 * or a generic Tier 1 tip.
 */
export async function generateTier3Content(
  signals: SessionSignals,
  callAI: (
    messages: { role: string; content: string }[],
    system: string
  ) => Promise<string>
): Promise<ReinforcementContent | null> {
  const { userName, topicHe, wordsLearned, wordsMarkedForReinforcement } = signals;
  const yiddishDim = userName === 'Neta' ? 'נטע׳לה' : 'עמית׳לה';
  const gender = userName === 'Neta' ? 'female' : 'male';
  const verbFem = (m: string, f: string) => (gender === 'female' ? f : m);

  const system = `אתה סבתא רומנייה חכמה ואוהבת המלמדת רומנית ברמת B1 לדובר/ת עברית. אתה תמיד עונה אך ורק עם JSON תקני, ללא מרקדאון, ללא הקדמה, ללא הסבר.`;

  const userPrompt = `הקשר השיעור שזה עתה הסתיים:
- נושא: ${topicHe}
- כל המילים שנלמדו: ${wordsLearned.join(', ')}
- מילים שסומנו לחיזוק (לחיצה על כפתור "צריך עוד תרגול"): ${wordsMarkedForReinforcement.join(', ')}

תן טיפ חיזוק קצר וחם בעברית ש:
1. פונה ל${userName === 'Neta' ? 'נטע' : 'עמית'} בכינוי חיבה ${yiddishDim} (למשל: "${yiddishDim} ${verbFem('תקשיב', 'תקשיבי')} לי")
2. מתייחס ספציפית למילים שהיו קשות (${wordsMarkedForReinforcement.join(', ')})
3. נותן כלל דקדוקי או מנמוני קצר וברור, 2-3 משפטים בלבד
4. כולל דוגמה אחת קונקרטית עם המילה ברומנית
5. השתמש במקף רגיל (-), לא במקף ארוך
6. ${gender === 'female' ? 'פנה בלשון נקבה' : 'פנה בלשון זכר'}

בחר mood שמתאים לטון הטיפ:
- "listen" — אם זה טיפ של "תקשיב/י לי רגע" (ברירת מחדל)
- "patience" — אם זה דורש סבלנות ותרגול
- "wait" — אם זה משהו שלוקח זמן להפנים
- "say" — אם זה בעיקר בעיית הגייה
- "look-closely" — אם זה כלל ויזואלי (איות, סוף מילה)
- "improve" — תיקון עדין
- "improve2" — תיקון בעבודה ארוכת טווח

החזר אך ורק JSON תקני:
{
  "mood": "listen",
  "address": "${yiddishDim} + פנייה קצרה",
  "tipText": "2-3 משפטים",
  "exampleHebRule": "תרגום הדוגמה לעברית",
  "exampleRomRule": "המשפט המלא ברומנית",
  "translationRom": "המילה הספציפית ברומנית",
  "translationHeb": "המילה בעברית"
}`;

  try {
    const raw = await callAI([{ role: 'user', content: userPrompt }], system);

    // Extract JSON object even if wrapped in extra text
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as Partial<ReinforcementContent>;

    // Validate required fields
    const required: (keyof ReinforcementContent)[] = [
      'address',
      'tipText',
      'exampleHebRule',
      'exampleRomRule',
      'translationRom',
      'translationHeb',
    ];
    for (const f of required) {
      if (!parsed[f]) return null;
    }
    if (!parsed.mood) parsed.mood = 'listen';

    return parsed as ReinforcementContent;
  } catch (e) {
    console.error('Tier 3 generation failed:', e);
    return null;
  }
}

/**
 * Static fallback if Tier 3 generation fails.
 * Better than nothing — at least the user gets *something* relevant.
 */
export function getTier3Fallback(signals: SessionSignals): ReinforcementContent {
  const yiddishDim = signals.userName === 'Neta' ? 'נטע׳לה' : 'עמית׳לה';
  const verb = signals.userName === 'Neta' ? 'תקשיבי' : 'תקשיב';
  const firstHardWord = signals.wordsMarkedForReinforcement[0] || '';

  return {
    mood: 'listen',
    address: `${yiddishDim} ${verb} לי`,
    tipText: firstHardWord
      ? `ראיתי שהמילה ${firstHardWord} עוד לא נכנסה. אל דאגה - חוזרים עליה בשיעור הבא, ועד אז כדאי לחזור עליה כל פעם שאת/ה רואה את המילה הזאת בעברית.`
      : 'עבדנו על כמה מילים חדשות היום. חזרה היא המפתח - ננסה שוב בשיעור הבא ועם הזמן הכול יישב במקום.',
    exampleHebRule: 'תרגול חוזר עוזר לזכור',
    exampleRomRule: 'Exercițiul repetat ajută la memorare',
    translationRom: firstHardWord || 'exercițiu',
    translationHeb: firstHardWord ? 'התרגול' : 'תרגול',
  };
}
