'use client';

/**
 * ReinforcementScreen — the "grandmother screen"
 *
 * Appears between lesson clusters or at lesson completion. Two modes:
 *
 *   "advanced"      Tier 1 — lesson went perfectly. Show advanced rule/example.
 *                   Timer: 6 seconds. Mood: love/reward/reward2.
 *
 *   "reinforcement" Tier 3 — user marked words for review or struggled.
 *                   Timer: 10 seconds (more reflection time).
 *                   Mood: listen/patience/wait/say/look-closely/improve/improve2.
 *                   Content is LLM-generated (see lib/reinforcement-content.ts).
 *
 * Drop-in replacement for the `phase === 'done'` block in VocabModule.
 *
 * IMPORTANT: this file uses the actual avatar filenames from your
 * /public/avatar images/tutor/ folder (with the space). Adjust AVATAR_PATH
 * below if your public path differs.
 */

import React, { useState, useEffect, useRef } from 'react';

// ───── Types ─────────────────────────────────────────────────────────────────

export type ReinforcementMood =
  // Tier 1 — celebration
  | 'love'
  | 'reward'
  | 'reward2'
  // Tier 3 — gentle teaching
  | 'listen'
  | 'patience'
  | 'wait'
  | 'say'
  | 'look-closely'
  | 'improve'
  | 'improve2'
  // Bonus moods available in your folder
  | 'hear'
  | 'talk';

export interface ReinforcementContent {
  mood: ReinforcementMood;
  address: string;            // e.g. "נטע׳לה תקשיבי לי"
  tipText: string;            // 2-3 sentences in Hebrew
  exampleHebRule: string;     // Hebrew explanation of the example
  exampleRomRule: string;     // Full Romanian sentence
  translationRom: string;     // The specific Romanian word/phrase
  translationHeb: string;     // Its Hebrew translation
}

export interface ReinforcementScreenProps {
  userName: string;
  content: ReinforcementContent | null;
  isLoading?: boolean;
  onContinue: () => void;
  mode: 'advanced' | 'reinforcement';
}

// ───── Avatar mapping ────────────────────────────────────────────────────────

const AVATAR_PATH = '/avatar/tutor';

const REINFORCEMENT_AVATAR_SRC: Record<ReinforcementMood, string> = {
  love:           `${AVATAR_PATH}/avatar-tutor-love.png`,
  reward:         `${AVATAR_PATH}/avatar-tutor-reward.png`,
  reward2:        `${AVATAR_PATH}/avatar-tutor-reward2.png`,
  listen:         `${AVATAR_PATH}/avatar-tutor-listen.png`,
  patience:       `${AVATAR_PATH}/avatar-tutor-patience.png`,
  wait:           `${AVATAR_PATH}/avatar-tutor-wait.png`,
  say:            `${AVATAR_PATH}/avatar-tutor-say.png`,
  'look-closely': `${AVATAR_PATH}/avatar-tutor-look-closely.png`,
  improve:        `${AVATAR_PATH}/avatar-tutor-improve.png`,
  improve2:       `${AVATAR_PATH}/avatar-tutor-improve2.png`,
  hear:           `${AVATAR_PATH}/avatar-tutor-hear.png`,
  talk:           `${AVATAR_PATH}/avatar-tutor-talk.png`,
};

// ───── Timer Button (auto-advancing) ─────────────────────────────────────────

interface TimerButtonProps {
  label: string;
  seconds: number;
  onComplete: () => void;
  resetKey: number;
}

function TimerButton({ label, seconds, onComplete, resetKey }: TimerButtonProps) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    setProgress(0);
    const startTime = performance.now();
    const durationMs = seconds * 1000;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(elapsed / durationMs, 1);
      setProgress(pct);
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [resetKey, seconds, onComplete]);

  const handleClick = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    onComplete();
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: '100%',
        height: 64,
        background: '#1f5fbf',
        border: 'none',
        borderRadius: 12,
        color: '#fff',
        fontFamily: "'Rubik', sans-serif",
        fontSize: 16,
        fontWeight: 700,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(31, 95, 191, 0.3)',
        direction: 'rtl',
        transition: 'transform 0.1s, box-shadow 0.1s',
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          height: 8,
          background: '#eff8ff',
          width: `${progress * 100}%`,
          transition: 'width 0.05s linear',
        }}
      />
    </button>
  );
}

// ───── Main component ────────────────────────────────────────────────────────

export default function ReinforcementScreen({
  userName,
  content,
  isLoading = false,
  onContinue,
  mode,
}: ReinforcementScreenProps) {
  const [resetKey, setResetKey] = useState(0);

  // 6s if lesson went well, 10s if reinforcement (more time to reflect)
  const timerSeconds = mode === 'reinforcement' ? 10 : 6;

  // Restart timer whenever the content changes
  useEffect(() => {
    setResetKey((k) => k + 1);
  }, [content?.mood, content?.tipText]);

  // ── Loading state (while Tier 3 is being generated) ──────────────────────
  if (isLoading || !content) {
    return (
      <div style={{ padding: '24px 16px', direction: 'rtl' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 4px 20px rgba(31, 95, 191, 0.12)',
            padding: 40,
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            color: '#6B7280',
            fontSize: 16,
            fontFamily: "'Rubik', sans-serif",
          }}
        >
          <span>הסבתא חושבת</span>
          <span style={{ display: 'inline-flex', gap: 4 }}>
            {[0, 0.2, 0.4].map((d) => (
              <span
                key={d}
                style={{
                  width: 7,
                  height: 7,
                  background: '#1f5fbf',
                  borderRadius: '50%',
                  animation: `rsDot 1.4s ${d}s infinite ease-in-out`,
                }}
              />
            ))}
          </span>
        </div>
        <style>{`
          @keyframes rsDot {
            0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
            30% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  const avatarSrc = REINFORCEMENT_AVATAR_SRC[content.mood];

  // ── Active state ──────────────────────────────────────────────────────────
  return (
    <div
      style={{
        padding: '20px 16px',
        direction: 'rtl',
        fontFamily: "'Rubik', sans-serif",
      }}
    >
      {/* Main card */}
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(31, 95, 191, 0.12)',
          padding: 20,
          marginBottom: 14,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 500,
        }}
      >
        {/* ── Text section ─────────────────────────────────────────────── */}
        <div dir="rtl" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Address line (warm Yiddish-Hebrew diminutive) */}
          <div
            dir="rtl"
            style={{
              color: '#1f5fbf',
              fontSize: 26,
              fontWeight: 700,
              textAlign: 'right',
              lineHeight: 1.2,
              marginBottom: 14,
            }}
          >
            {content.address}
          </div>

          {/* The tip itself */}
          <div
            dir="rtl"
            style={{
              color: '#1a2744',
              fontSize: 18,
              fontWeight: 500,
              lineHeight: 1.5,
              textAlign: 'right',
              marginBottom: 18,
            }}
          >
            {content.tipText}
          </div>

          {/* Example block */}
          <div dir="rtl">
            <div
              dir="rtl"
              style={{
                color: '#1f5fbf',
                fontSize: 11,
                fontWeight: 600,
                textAlign: 'right',
                marginBottom: 2,
              }}
            >
              למשל:
            </div>
            <div
              dir="rtl"
              style={{
                color: '#1a2744',
                fontSize: 18,
                fontWeight: 700,
                textAlign: 'right',
                lineHeight: 1.4,
                marginBottom: 14,
              }}
            >
              <span dir="rtl">{content.exampleHebRule}</span>
              <span dir="ltr" style={{ display: 'block', marginTop: 2 }}>
                {content.exampleRomRule}
              </span>
            </div>
          </div>

          {/* Translation pair (ROM / HEB) */}
          <div
            dir="rtl"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              dir="ltr"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <span style={{ color: '#6B7280', fontSize: 10, fontWeight: 300 }}>
                ROM
              </span>
              <span style={{ color: '#1a2744', fontSize: 26, fontWeight: 700 }}>
                {content.translationRom}
              </span>
            </div>
            <div
              dir="rtl"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              <span style={{ color: '#6B7280', fontSize: 10, fontWeight: 300 }}>
                עברית
              </span>
              <span style={{ color: '#1f5fbf', fontSize: 26, fontWeight: 700 }}>
                {content.translationHeb}
              </span>
            </div>
          </div>
        </div>

        {/* ── Grandmother avatar ──────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            marginTop: 16,
            minHeight: 200,
          }}
        >
          <img
            src={avatarSrc}
            alt=""
            style={{
              maxHeight: 280,
              width: 'auto',
              objectFit: 'contain',
              objectPosition: 'bottom',
            }}
          />
        </div>
      </div>

      {/* ── Auto-advancing button ─────────────────────────────────────── */}
      <TimerButton
        label="עכשיו הבנתי!"
        seconds={timerSeconds}
        onComplete={onContinue}
        resetKey={resetKey}
      />
    </div>
  );
}
