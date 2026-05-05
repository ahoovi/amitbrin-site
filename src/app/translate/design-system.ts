/**
 * Design System (Token-based)
 * Salutări bunicii! — UI Specification
 * All colors, spacing, typography defined here
 */

export const DESIGN_TOKENS = {
  color: {
    bg_primary: "#172A46",     // Dark blue background
    bg_secondary: "#F7F2EA",   // Warm beige
    surface: "#FFFFFF",        // Card/button surface
    text_primary: "#1A1A1A",   // Main text
    text_secondary: "#6B7280", // Secondary text
    accent: "#1F5FBF",         // CTA, progress (blue)
    accent_soft: "#E8F0FE",    // Accent background
    success: "#2E7D32",        // Success feedback
    error: "#C62828",          // Error feedback (soft, no aggression)
  },

  spacing: {
    xs: 4,    // 4px
    sm: 8,    // 8px
    md: 12,   // 12px
    lg: 16,   // 16px
    xl: 24,   // 24px
    xxl: 32,  // 32px
  },

  typography: {
    fontFamily: '"Noto Sans", system-ui',
    weight: {
      regular: 400,   // Body text
      medium: 500,    // Headings
      bold: 700,      // CTA buttons
    },
    size: {
      xs: 12,         // Labels, small text
      sm: 14,         // Secondary text
      base: 16,       // Body text
      lg: 18,         // Headings (h3)
      xl: 20,         // Headings (h2)
      xxl: 24,        // Headings (h1)
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.75,
    },
  },

  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },

  shadow: {
    none: "none",
    subtle: "0 1px 2px rgba(0,0,0,0.05)",     // Only subtle base
  },
};

// Lesson Colors — used in map nodes + radar layers
// Palette: muted/print-like, not RGB-saturated
export const LESSON_COLORS = {
  lesson_1: { hex: "#2B5CAB", label: "הצגה עצמית" },  // blue
  lesson_2: { hex: "#C96E34", label: "אוכל ומשקאות" }, // orange
  lesson_3: { hex: "#38818D", label: "העיר" },          // teal
  lesson_4: { hex: "#713D99", label: "עבודה ושגרה" },   // purple
  lesson_5: { hex: "#3A7530", label: "בריאות" },        // green
  lesson_6: { hex: "#B23D70", label: "תרבות ומסורת" },  // pink
};

// Character System Levels
export const CHARACTER_LEVELS = {
  GLYPH: "glyph",      // Head only, flat, no shading
  TUTOR: "tutor",      // Half body, max 3 colors, default
  HERO: "hero",        // Full illustration, only in splash/onboarding
};

// Interaction States
export const INTERACTION_STATES = {
  IDLE: "idle",
  HOVER: "hover",
  ACTIVE: "active",
  DISABLED: "disabled",
  LOADING: "loading",
  ERROR: "error",
  SUCCESS: "success",
};
