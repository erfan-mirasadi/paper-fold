// ============================================================================
// DESIGN TOKENS — SINGLE SOURCE OF TRUTH
// Location: SurahLayout/core/theme.ts
// Purpose: All colors, bump shades, and text sizes centralized here.
//          Never hardcode colors inside components; always import from here.
// ============================================================================

// ----------------------------------------------------------------------------
// 1. BASE COLORS
// ----------------------------------------------------------------------------
export const WHITE_BASE = "#ffffff";
export const SHADOW_BLACK = "#000000";
export const TEXT_DARK = "#1a1a1a";
export const TEXT_LABEL = "#4a423a";

// ----------------------------------------------------------------------------
// 2. BUMP MAP GRAYSCALE LEVELS
// White = Highest extrusion, Black = Lowest (flat base surface)
// ----------------------------------------------------------------------------
export const BUMP_MAX = "#ffffff";
export const BUMP_HIGH = "#e3e3e3";
export const BUMP_MID_HIGH = "#555555";
export const BUMP_MID = "#444444";
export const BUMP_LOWER = "#333333";
export const BUMP_DEEP = "#222222";
export const BUMP_BASE = "#000000";

// ----------------------------------------------------------------------------
// 3. CANVAS & PAGE COLORS
// ----------------------------------------------------------------------------
export const BG_COLOR = "#FDF8E4";
export const PAGE_BG_COLOR = "#EBEBDF";
export const HOLLOW_BORDER_COLOR = "#845775";
export const CIRCLE_BORDER = "#8e8e8e";

// ----------------------------------------------------------------------------
// 4. SECTION 1 — UPPER BLOCK PALETTE
// ----------------------------------------------------------------------------
export const S1_OUTER_BG = "#F8E3B6";
export const S1_OUTER_BORDER = "#A3822E";
export const S1_INNER_BG = "#fbf1d5";
export const S1_INNER_BORDER = "#e2caae";
export const S1_ANA_BG = "#efbe6c";
export const S1_ANA_BORDER = "#b48238";

export const TAB_BG = "#e5ba71";
export const TAB_BORDER = "#96601b";
export const TAB_TEXT = "#432c10";

// ----------------------------------------------------------------------------
// 5. SECTION 2 — LOWER BLOCK PALETTE
// ----------------------------------------------------------------------------
export const S2_OUTER_BG = "#F0E2CC";
export const S2_OUTER_BORDER = "#DBC180";
export const MAROON_THEME = "#7D3D62";
export const MAROON_VERSE_BG = "#ebd2dc";
export const GREEN_THEME = "#879A63";
export const GREEN_VERSE_BG = "#eaf2db";
export const BLUE_THEME = "#638f9c";
export const SG_BG = "#845775";
export const SG_BORDER = "#F4ECD8";

// ----------------------------------------------------------------------------
// 6. CAPSULE (VERSE BOX) BACKGROUND COLORS
// ----------------------------------------------------------------------------
export const CAPSULE_BG_7_10_15_18 = "#E4D3DE";
export const CAPSULE_BG_12_14 = "#E0E6D0";
export const CAPSULE_BG_6_19 = "#F8F1E6";
export const WHITE_VERSE_BG = "#ffffff";

// ----------------------------------------------------------------------------
// 7. GLOBAL FONT PATH
// ----------------------------------------------------------------------------
export const QURAN_FONT = "/fonts/KFGQPC-Uthman-Taha-Naskh-Bold.ttf";

// ----------------------------------------------------------------------------
// 8. GLOBAL TEXT SIZES
// ----------------------------------------------------------------------------
export const TEXT_SIZES = {
  BISMILLAH: 0.054,
  TOP_LABEL: 0.023,
  ANA_AYET_TAB: 0.016,
  VERSE_NUMBER: 0.024,
  VERSE_TEXT_SMALL: 0.032,
  VERSE_TEXT_BIG: 0.051,
} as const;
