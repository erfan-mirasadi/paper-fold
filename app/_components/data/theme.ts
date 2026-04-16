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
export const PAGE_BG_COLOR = "#f4efec";
export const CIRCLE_BORDER = "#8e8e8e";

// ----------------------------------------------------------------------------
// 4. SECTION 1 — UPPER BLOCK PALETTE
// ----------------------------------------------------------------------------
export const S1_OUTER_BG = "#A0948D";
export const S1_OUTER_BORDER = "#C4963B";
export const S1_INNER_BG = "#fbf1d5";
export const S1_INNER_BORDER = "#e2caae";
export const S1_ANA_BG = "#C4963B";
export const S1_ANA_BORDER = "#000000";

// Verse 5 Specifics
export const S1_VERSE_5_NUMBER_BG = "#000000";
export const S1_VERSE_5_NUMBER_BORDER = "#8B7C74";
export const S1_VERSE_5_NUMBER_TEXT = "#fbf1d5";
export const S1_VERSE_5_TEXT = "#C4963B";

export const TAB_BG = "#e5ba71";
export const TAB_BORDER = "#96601b";
export const TAB_TEXT = "#5A451B";
// ----------------------------------------------------------------------------
// TOP LABEL — Section-specific background & border (Section 1)
// ----------------------------------------------------------------------------
export const S1_TOP_LABEL_BG = "#F7E9C8";
export const S1_TOP_LABEL_BORDER = "#fbf1d5";

// ----------------------------------------------------------------------------
// 5. SECTION 2 — LOWER BLOCK PALETTE
// ----------------------------------------------------------------------------
export const S2_OUTER_BG = "#DFDAD8";
export const S2_OUTER_BORDER = "#8B7C74";
export const HOLLOW_BORDER_COLOR = "#72665F";
export const HOLLOW_BORDER_INNER = "#B5ABA6";
export const HOLLOW_CONNECTOR_INNER_BG_1_3 = "#A0948D";
export const MAROON_THEME = "#5E7367";
export const MAROON_VERSE_BG = "#ebd2dc";
export const GREEN_THEME = "#813D22";
export const GREEN_VERSE_BG = "#eaf2db";
export const BLUE_THEME = "#7c8cb0";
export const SG_BG = "#845775";
export const SG_BORDER = "#F4ECD8";
// ----------------------------------------------------------------------------
// TOP LABEL — Section-specific background & border (Section 2)
// ----------------------------------------------------------------------------
export const S2_TOP_LABEL_BG = "#EFE9DC";
export const S2_TOP_LABEL_BORDER = "#72665F";

// ----------------------------------------------------------------------------
// 6. CAPSULE (VERSE BOX) BACKGROUND COLORS
// ----------------------------------------------------------------------------
export const CAPSULE_BG_7_10_15_18 = "#E0E6D0";
export const CAPSULE_BG_12_14 = "#EED1C9";
export const CAPSULE_BG_6_19 = "#CEE0E9";
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
  VERSE_TEXT_BIG: 0.071,
} as const;
