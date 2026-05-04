'use client';

/**
 * Romanian B1 Learning App
 * "Salutări bunicii!" — Navigation v2
 *
 * Architecture:
 * - Login → 2 known users (Amit / Neta)
 * - App Shell: 4 tabs — בית | מילון | התקדמות | הגדרות
 * - Home tab: Lesson path map (6 nodes, session dots, lesson colors)
 * - Progress tab: Layered radar chart (skills × lessons)
 * - Lesson screen: module tabs inside a topic (vocab/listen/speak/write/grammar)
 */

import React, { useState, useEffect } from 'react';
import { Button, Card, Avatar, Feedback, ProgressBar } from './components';
import { DESIGN_TOKENS as T } from './design-system';

// ============= TYPES =============

type Tab = 'home' | 'dictionary' | 'progress' | 'settings';
type AppScreen = 'login' | 'app' | 'lesson';
type LessonModule = 'vocabulary' | 'listening' | 'speaking' | 'writing' | 'grammar';

interface SkillScores {
  vocabulary: number;
  listening: number;
  speaking: number;
  writing: number;
  grammar: number;
}

interface LessonProgress {
  sessions: number;     // 0–3
  skills: SkillScores; // 0–100 per skill
}

interface User {
  id: string;
  name: string;
  lessonProgress: { [lessonId: number]: LessonProgress };
  currentLesson: number;
  totalSessions: number;
}

// ============= CONSTANTS =============

const LESSONS = [
  { id: 1, topic: 'הצגה עצמית',   topicRo: 'Prezentare personală', color: '#2B5CAB' },
  { id: 2, topic: 'אוכל ומשקאות', topicRo: 'Mâncare și băuturi',  color: '#C96E34' },
  { id: 3, topic: 'העיר',          topicRo: 'Orașul',               color: '#38818D' },
  { id: 4, topic: 'עבודה ושגרה',  topicRo: 'Muncă și rutină',      color: '#713D99' },
  { id: 5, topic: 'בריאות',        topicRo: 'Sănătate',             color: '#3A7530' },
  { id: 6, topic: 'תרבות ומסורת', topicRo: 'Cultură și tradiții',  color: '#B23D70' },
] as const;

const SKILL_LABELS: Record<LessonModule, string> = {
  vocabulary: 'אוצר מילים',
  listening:  'האזנה',
  speaking:   'דיבור',
  writing:    'כתיבה',
  grammar:    'דקדוק',
};

const KNOWN_USERS: User[] = [
  {
    id: 'amit',
    name: 'Amit',
    lessonProgress: {
      1: { sessions: 1, skills: { vocabulary: 70, listening: 80, speaking: 55, writing: 65, grammar: 45 } },
      2: { sessions: 2, skills: { vocabulary: 55, listening: 70, speaking: 30, writing: 40, grammar: 25 } },
    },
    currentLesson: 2,
    totalSessions: 3,
  },
  {
    id: 'neta',
    name: 'Neta',
    lessonProgress: {
      1: { sessions: 3, skills: { vocabulary: 85, listening: 90, speaking: 75, writing: 80, grammar: 70 } },
    },
    currentLesson: 2,
    totalSessions: 3,
  },
];

// ============= MAIN APP =============

export default function TranslateApp() {
  const [users, setUsers]               = useState<User[]>(KNOWN_USERS);
  const [currentUser, setCurrentUser]   = useState<User | null>(null);
  const [appScreen, setAppScreen]       = useState<AppScreen>('login');
  const [activeTab, setActiveTab]       = useState<Tab>('home');
  const [activeLesson, setActiveLesson] = useState<number | null>(null);
  const [activeModule, setActiveModule] = useState<LessonModule>('vocabulary');

  useEffect(() => {
    const saved = localStorage.getItem('ro_v4_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        setUsers(KNOWN_USERS.map(u => parsed.find(s => s.id === u.id) ?? u));
      } catch {}
    }
  }, []);

  const saveUsers = (updated: User[]) => {
    setUsers(updated);
    localStorage.setItem('ro_v4_users', JSON.stringify(updated));
  };

  const updateProgress = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    saveUsers(users.map(u => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const selectUser = (user: User) => {
    setCurrentUser(user);
    setAppScreen('app');
    setActiveTab('home');
  };

  const openLesson = (lessonId: number) => {
    setActiveLesson(lessonId);
    setActiveModule('vocabulary');
    setAppScreen('lesson');
  };

  const backToApp = () => {
    setAppScreen('app');
    setActiveLesson(null);
  };

  const handleProgress = (module: LessonModule, score: number) => {
    if (!currentUser || activeLesson === null) return;
    const existing = currentUser.lessonProgress[activeLesson] ?? {
      sessions: 0,
      skills: { vocabulary: 0, listening: 0, speaking: 0, writing: 0, grammar: 0 },
    };
    updateProgress({
      ...currentUser,
      totalSessions: currentUser.totalSessions + 1,
      lessonProgress: {
        ...currentUser.lessonProgress,
        [activeLesson]: {
          sessions: Math.min(existing.sessions + 1, 3),
          skills: { ...existing.skills, [module]: Math.min(100, score) },
        },
      },
    });
  };

  if (appScreen === 'login') {
    return <LoginScreen users={users} onSelectUser={selectUser} />;
  }

  if (appScreen === 'lesson' && currentUser && activeLesson !== null) {
    const lesson = LESSONS.find(l => l.id === activeLesson)!;
    return (
      <LessonScreen
        lesson={lesson}
        module={activeModule}
        user={currentUser}
        onModuleChange={setActiveModule}
        onBack={backToApp}
        onProgress={handleProgress}
      />
    );
  }

  if (appScreen === 'app' && currentUser) {
    return (
      <AppShell
        user={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenLesson={openLesson}
        onUserChange={() => setAppScreen('login')}
      />
    );
  }

  return null;
}

// ============= LOGIN SCREEN =============

function LoginScreen({ users, onSelectUser }: { users: User[]; onSelectUser: (u: User) => void }) {
  return (
    <div style={{
      background: T.color.bg_primary,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: T.spacing.xl,
      fontFamily: T.typography.fontFamily,
      gap: T.spacing.xl,
    }}>
      <div style={{ textAlign: 'center' }}>
        <Avatar level="hero" emotion="neutral" size="lg" />
        <h1 style={{
          color: T.color.surface,
          fontSize: T.typography.size.xxl,
          fontWeight: T.typography.weight.bold,
          margin: `${T.spacing.lg}px 0 ${T.spacing.sm}px`,
        }}>
          Salutări bunicii!
        </h1>
        <p style={{ color: T.color.text_secondary, fontSize: T.typography.size.base, margin: 0 }}>
          ?מי לומד היום
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: T.spacing.md, width: '100%', maxWidth: 320 }}>
        {users.map(user => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            style={{
              background: T.color.surface,
              border: 'none',
              borderRadius: T.radius.lg,
              padding: `${T.spacing.lg}px ${T.spacing.xl}px`,
              fontSize: T.typography.size.xl,
              fontWeight: T.typography.weight.medium,
              fontFamily: T.typography.fontFamily,
              color: T.color.text_primary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{user.name}</span>
            <span style={{ color: T.color.text_secondary, fontSize: T.typography.size.sm }}>
              {user.totalSessions} סשנים
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============= APP SHELL =============

const TABS: { id: Tab; label: string }[] = [
  { id: 'home',       label: 'בית'      },
  { id: 'dictionary', label: 'מילון'    },
  { id: 'progress',   label: 'התקדמות' },
  { id: 'settings',   label: 'הגדרות'  },
];

function AppShell({
  user, activeTab, onTabChange, onOpenLesson, onUserChange,
}: {
  user: User;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onOpenLesson: (id: number) => void;
  onUserChange: () => void;
}) {
  return (
    <div style={{
      background: T.color.bg_secondary,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: T.typography.fontFamily,
      maxWidth: 430,
      margin: '0 auto',
      position: 'relative',
    }}>
      {/* Scrollable content above fixed tab bar */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 68 }}>
        {activeTab === 'home'       && <LessonMapScreen user={user} onOpenLesson={onOpenLesson} />}
        {activeTab === 'dictionary' && <DictionaryScreen />}
        {activeTab === 'progress'   && <ProgressScreen user={user} />}
        {activeTab === 'settings'   && <SettingsScreen user={user} onUserChange={onUserChange} />}
      </div>

      {/* Tab Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        background: T.color.surface,
        borderTop: `1px solid ${T.color.text_secondary}20`,
        display: 'flex',
        zIndex: 100,
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: 1,
                padding: `${T.spacing.sm}px 0 ${T.spacing.md}px`,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                color: active ? T.color.accent : T.color.text_secondary,
                fontFamily: T.typography.fontFamily,
                transition: 'color 0.15s',
              }}
            >
              {/* Phosphor icon placeholder — swap with <IconName /> after npm install */}
              <TabIcon tabId={tab.id} active={active} />
              <span style={{
                fontSize: T.typography.size.xs,
                fontWeight: active ? T.typography.weight.bold : T.typography.weight.regular,
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Temporary SVG icons — replace with Phosphor after install */
function TabIcon({ tabId, active }: { tabId: Tab; active: boolean }) {
  const color = active ? T.color.accent : T.color.text_secondary;
  const size = 24;
  const icons: Record<Tab, React.ReactNode> = {
    home: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12L12 4l9 8" /><path d="M5 10v9h4v-5h6v5h4v-9" />
      </svg>
    ),
    dictionary: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" />
      </svg>
    ),
    progress: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><path d="M12 3v9l5 3" />
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  };
  return <>{icons[tabId]}</>;
}

// ============= LESSON MAP SCREEN (HOME TAB) =============

function LessonMapScreen({ user, onOpenLesson }: { user: User; onOpenLesson: (id: number) => void }) {
  return (
    <div style={{ padding: `${T.spacing.lg}px` }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: T.spacing.xxl,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: T.typography.size.sm, color: T.color.text_secondary }}>Bună,</p>
          <h2 style={{
            margin: 0,
            fontSize: T.typography.size.xl,
            fontWeight: T.typography.weight.medium,
            color: T.color.text_primary,
          }}>
            {user.name}
          </h2>
        </div>
        <Avatar level="glyph" emotion="happy" size="sm" />
      </div>

      {/* Path */}
      <div style={{ position: 'relative', paddingRight: 20 }}>
        {/* Spine */}
        <div style={{
          position: 'absolute',
          right: 39,  // aligns with center of node (20px padding + 19px = node center)
          top: 20,
          bottom: 20,
          width: 2,
          background: '#D5D9E2',
          zIndex: 0,
        }} />

        {LESSONS.map(lesson => {
          const progress   = user.lessonProgress[lesson.id];
          const sessions   = progress?.sessions ?? 0;
          const isUnlocked = lesson.id === 1 || (user.lessonProgress[lesson.id - 1]?.sessions ?? 0) >= 1;
          const isActive   = lesson.id === user.currentLesson;

          return (
            <div
              key={lesson.id}
              style={{
                display: 'flex',
                flexDirection: 'row-reverse', // RTL: node right, text left
                alignItems: 'center',
                marginBottom: T.spacing.xxl,
                position: 'relative',
                zIndex: 1,
                gap: T.spacing.lg,
              }}
            >
              {/* Node */}
              <button
                onClick={() => isUnlocked && onOpenLesson(lesson.id)}
                disabled={!isUnlocked}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: isUnlocked ? lesson.color : '#D5D9E2',
                  border: isActive ? `3px solid ${lesson.color}` : '3px solid transparent',
                  boxShadow: isActive ? `0 0 0 4px ${lesson.color}25` : 'none',
                  cursor: isUnlocked ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'box-shadow 0.2s',
                  padding: 0,
                }}
                aria-label={lesson.topic}
              >
                {isUnlocked ? (
                  <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>{lesson.id}</span>
                ) : (
                  <span style={{ fontSize: 16 }}>🔒</span>
                )}
              </button>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: `0 0 ${T.spacing.xs}px`,
                  fontSize: T.typography.size.base,
                  fontWeight: isActive ? T.typography.weight.medium : T.typography.weight.regular,
                  color: isUnlocked ? T.color.text_primary : T.color.text_secondary,
                  textAlign: 'right',
                }}>
                  {lesson.topic}
                </p>

                {isUnlocked && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
                    {/* Session dots */}
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: i <= sessions ? lesson.color : 'transparent',
                          border: `1.5px solid ${i <= sessions ? lesson.color : '#C8CDD8'}`,
                          transition: 'background 0.2s',
                        }}
                      />
                    ))}
                    {/* + button */}
                    <button
                      onClick={() => onOpenLesson(lesson.id)}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: `1.5px solid ${lesson.color}`,
                        background: 'transparent',
                        color: lesson.color,
                        cursor: 'pointer',
                        fontSize: 14,
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        fontWeight: T.typography.weight.bold,
                      }}
                      aria-label="תרגול נוסף"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============= RADAR CHART =============

type RadarLayer = { lesson: typeof LESSONS[number]; skills: SkillScores };

function RadarChart({ layers }: { layers: RadarLayer[] }) {
  const cx = 155;
  const cy = 165;
  const R  = 110;
  const skillKeys: LessonModule[] = ['speaking', 'listening', 'writing', 'vocabulary', 'grammar'];
  const skillLabels = ['דיבור', 'האזנה', 'כתיבה', 'אוצר', 'דקדוק'];
  const n = skillKeys.length;
  const angles = skillKeys.map((_, i) => (i * 2 * Math.PI) / n - Math.PI / 2);

  const toXY = (angle: number, r: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const gridRings = [0.25, 0.5, 0.75, 1].map(s => {
    const pts = angles.map(a => { const p = toXY(a, R * s); return `${p.x},${p.y}`; }).join(' ');
    return <polygon key={s} points={pts} fill="none" stroke="#E5E7EB" strokeWidth="1" />;
  });

  const axisLines = angles.map((a, i) => {
    const end = toXY(a, R);
    return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#E5E7EB" strokeWidth="1" />;
  });

  const axisLabels = angles.map((a, i) => {
    const pos = toXY(a, R + 20);
    return (
      <text key={i} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fill={T.color.text_secondary}>
        {skillLabels[i]}
      </text>
    );
  });

  const polygons = layers.map(({ lesson, skills }) => {
    const pts = angles.map((a, i) => {
      const val = (skills[skillKeys[i]] ?? 0) / 100;
      const { x, y } = toXY(a, R * val);
      return `${x},${y}`;
    }).join(' ');
    return (
      <polygon key={lesson.id} points={pts}
        fill={lesson.color} fillOpacity={0.15}
        stroke={lesson.color} strokeWidth="2" strokeOpacity={0.8} />
    );
  });

  return (
    <svg width="310" height="330" viewBox="0 0 310 330" style={{ display: 'block', margin: '0 auto' }}>
      {gridRings}
      {axisLines}
      {polygons}
      {axisLabels}
    </svg>
  );
}

// ============= PROGRESS SCREEN =============

function ProgressScreen({ user }: { user: User }) {
  const layers: RadarLayer[] = LESSONS
    .map(lesson => {
      const p = user.lessonProgress[lesson.id];
      if (!p || p.sessions === 0) return null;
      return { lesson, skills: p.skills };
    })
    .filter((l): l is RadarLayer => l !== null);

  return (
    <div style={{ padding: T.spacing.lg }}>
      <h2 style={{
        fontSize: T.typography.size.xl,
        fontWeight: T.typography.weight.medium,
        color: T.color.text_primary,
        margin: `0 0 ${T.spacing.xl}px`,
        textAlign: 'right',
      }}>
        התקדמות
      </h2>

      {layers.length === 0 ? (
        <p style={{ color: T.color.text_secondary, textAlign: 'center', marginTop: T.spacing.xxl }}>
          השלם שיעור ראשון כדי לראות את הרדאר
        </p>
      ) : (
        <>
          <RadarChart layers={layers} />

          {/* Legend */}
          <div style={{ marginTop: T.spacing.xl, display: 'flex', flexDirection: 'column', gap: T.spacing.md, alignItems: 'flex-end' }}>
            {layers.map(({ lesson, skills }) => {
              const avg = Math.round(Object.values(skills).reduce((a, b) => a + b, 0) / 5);
              return (
                <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: T.spacing.md, direction: 'rtl' }}>
                  <div style={{
                    width: 28, height: 3,
                    background: lesson.color,
                    borderRadius: 2,
                    opacity: 0.75,
                  }} />
                  <span style={{ fontSize: T.typography.size.sm, color: T.color.text_secondary }}>
                    {lesson.topic}
                  </span>
                  <span style={{ fontSize: T.typography.size.sm, color: lesson.color, fontWeight: T.typography.weight.medium }}>
                    {avg}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ============= DICTIONARY SCREEN =============

function DictionaryScreen() {
  return (
    <div style={{ padding: T.spacing.lg, textAlign: 'right' }}>
      <h2 style={{
        fontSize: T.typography.size.xl,
        fontWeight: T.typography.weight.medium,
        color: T.color.text_primary,
        margin: `0 0 ${T.spacing.xl}px`,
      }}>
        מילון וחוקים
      </h2>
      <p style={{ color: T.color.text_secondary }}>בקרוב — אוצר מילים לעיון, טיפים, וחוקי דקדוק.</p>
    </div>
  );
}

// ============= SETTINGS SCREEN =============

function SettingsScreen({ user, onUserChange }: { user: User; onUserChange: () => void }) {
  return (
    <div style={{ padding: T.spacing.lg, textAlign: 'right' }}>
      <h2 style={{
        fontSize: T.typography.size.xl,
        fontWeight: T.typography.weight.medium,
        color: T.color.text_primary,
        margin: `0 0 ${T.spacing.xl}px`,
      }}>
        הגדרות
      </h2>
      <Card>
        <p style={{ margin: `0 0 ${T.spacing.xs}px`, fontSize: T.typography.size.sm, color: T.color.text_secondary }}>
          משתמש נוכחי
        </p>
        <p style={{
          margin: `0 0 ${T.spacing.lg}px`,
          fontSize: T.typography.size.lg,
          fontWeight: T.typography.weight.medium,
          color: T.color.text_primary,
        }}>
          {user.name}
        </p>
        <Button onClick={onUserChange} variant="ghost" fullWidth>
          החלף משתמש
        </Button>
      </Card>
    </div>
  );
}

// ============= LESSON SCREEN =============

function LessonScreen({
  lesson, module, user, onModuleChange, onBack, onProgress,
}: {
  lesson: typeof LESSONS[number];
  module: LessonModule;
  user: User;
  onModuleChange: (m: LessonModule) => void;
  onBack: () => void;
  onProgress: (module: LessonModule, score: number) => void;
}) {
  const modules: LessonModule[] = ['vocabulary', 'listening', 'speaking', 'writing', 'grammar'];
  const progress = user.lessonProgress[lesson.id];
  const moduleScore = progress?.skills[module] ?? 0;

  return (
    <div style={{
      background: T.color.bg_primary,
      minHeight: '100vh',
      fontFamily: T.typography.fontFamily,
      maxWidth: 430,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: `${T.spacing.lg}px`,
        display: 'flex',
        alignItems: 'center',
        gap: T.spacing.md,
        borderBottom: `1px solid ${lesson.color}30`,
        direction: 'rtl',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: T.color.text_secondary,
            cursor: 'pointer',
            fontSize: 20,
            padding: 0,
            lineHeight: 1,
          }}
          aria-label="חזרה"
        >
          →
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: T.typography.size.xs, color: lesson.color }}>
            שיעור {lesson.id}
          </p>
          <p style={{
            margin: 0,
            fontSize: T.typography.size.base,
            color: T.color.surface,
            fontWeight: T.typography.weight.medium,
          }}>
            {lesson.topic}
          </p>
        </div>
        <Avatar level="glyph" emotion="happy" size="sm" />
      </div>

      {/* Module tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${T.color.surface}15`,
        overflowX: 'auto',
        direction: 'rtl',
      }}>
        {modules.map(m => {
          const active = module === m;
          return (
            <button
              key={m}
              onClick={() => onModuleChange(m)}
              style={{
                flex: 1,
                padding: `${T.spacing.sm}px ${T.spacing.xs}px`,
                background: 'none',
                border: 'none',
                borderBottom: active ? `2px solid ${lesson.color}` : '2px solid transparent',
                color: active ? lesson.color : T.color.text_secondary,
                cursor: 'pointer',
                fontSize: T.typography.size.xs,
                fontFamily: T.typography.fontFamily,
                whiteSpace: 'nowrap',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {SKILL_LABELS[m]}
            </button>
          );
        })}
      </div>

      {/* Module content area */}
      <div style={{ flex: 1, padding: T.spacing.lg, display: 'flex', flexDirection: 'column', gap: T.spacing.lg }}>
        {/* Character + prompt */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: T.spacing.lg }}>
          <Avatar level="tutor" emotion="pointing" size="md" />
        </div>

        {/* Progress for this module */}
        {moduleScore > 0 && (
          <ProgressBar progress={moduleScore} label={`${SKILL_LABELS[module]}: ${moduleScore}%`} />
        )}

        {/* Placeholder: real content rendered per module */}
        <Card>
          <p style={{
            color: T.color.text_secondary,
            textAlign: 'center',
            fontSize: T.typography.size.sm,
            margin: 0,
          }}>
            תוכן דינמי — {SKILL_LABELS[module]} / {lesson.topicRo}
          </p>
          <p style={{
            color: T.color.text_secondary,
            textAlign: 'center',
            fontSize: T.typography.size.xs,
            margin: `${T.spacing.sm}px 0 0`,
          }}>
            [Claude API + 11Labs TTS]
          </p>
        </Card>

        {/* CTA */}
        <Button onClick={() => onProgress(module, moduleScore + 15)} fullWidth>
          המשך
        </Button>
      </div>
    </div>
  );
}
