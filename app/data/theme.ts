export const WHITE_BASE = "#ffffff";
export const SHADOW_BLACK = "#000000";
export const TEXT_DARK = "#000000";
export const TEXT_LABEL = "#4a423a";

// ----------------------------------------------------------------------------
// 3. CANVAS & PAGE COLORS
// ----------------------------------------------------------------------------
export const INNER_CARD_BG = "#ffffff";
export const PAGE_BG_COLOR = "#f4efec";
export const CIRCLE_BORDER = "#8e8e8e";

// ----------------------------------------------------------------------------
// 4. SECTION 1 — UPPER BLOCK PALETTE
// ----------------------------------------------------------------------------
export const SECTION_BG_TEXTURE = "/section-bg.jpeg";
export const SECTION_FRAME_BG_COLOR = "#F0E4E5";
export const S1_FRAME_IMAGE = "/Group 10.svg";
export const S2_FRAME_IMAGE = "/Group 92.svg";

export const S1_OUTER_BG = SECTION_BG_TEXTURE;
export const S1_INNER_BG = "#fbf1d5";
export const S1_OUTER_BORDER = "#D9BC81";
export const S1_INNER_BORDER = "#e2caae";
export const S1_ANA_BG = "#C4963B";

export const S1_VERSE_NUMBER_BG = S1_INNER_BG;
export const S1_VERSE_NUMBER_BORDER = "#8B7C74";
export const S1_VERSE_NUMBER_TEXT = "#000000";

// Verse 5 Specifics
export const CAPSULE_BG_5 = "#DBBD80";
export const S1_VERSE_5_NUMBER_BG = CAPSULE_BG_5;
export const S1_VERSE_5_NUMBER_BORDER = "#8B7C74";
export const S1_VERSE_5_NUMBER_TEXT = "#000000";
export const S1_VERSE_5_TEXT = "#000000";

export const S1_ANA_LABEL_BG = "#e2caae";
export const S1_ANA_LABEL_BORDER = "#96601b";
export const S1_ANA_LABEL_TEXT = "#72665F";
export const S1_NEON_GOLD = "#FFD700";
// ----------------------------------------------------------------------------
// TOP LABEL — Section-specific background & border (Section 1)
// ----------------------------------------------------------------------------
export const S1_TOP_LABEL_BG = "#EFE9DC";
export const S1_TOP_LABEL_BORDER = "#EFE9DC";

// ----------------------------------------------------------------------------
// 5. SECTION 2 — LOWER BLOCK PALETTE
// ----------------------------------------------------------------------------
export const S2_OUTER_BG = "#DFDAD8";
export const S2_OUTER_BORDER = "#8B7C74";
export const HOLLOW_BORDER_COLOR = "#72665F";
export const HOLLOW_BORDER_INNER = "#B5ABA6";
export const HOLLOW_CONNECTOR_INNER_BG_1_3 = SECTION_BG_TEXTURE;
export const MAROON_THEME = "#7c8cb0";
export const MAROON_VERSE_BG = "#ebd2dc";
export const GREEN_THEME = "#5E7367";
export const GREEN_VERSE_BG = "#eaf2db";
export const BLUE_THEME = "#C4963B";
export const SG_BG = "#845775";
export const SG_BORDER = "#F4ECD8";
export const S2_VERSE_NUMBER_TEXT = "#000000";
// ----------------------------------------------------------------------------
// TOP LABEL — Section-specific background & border (Section 2)
// ----------------------------------------------------------------------------
export const S2_TOP_LABEL_BG = "#EFE9DC";
export const S2_TOP_LABEL_BORDER = "#72665F";

// ----------------------------------------------------------------------------
// 6. CAPSULE (VERSE BOX) BACKGROUND COLORS
// ----------------------------------------------------------------------------
export const CAPSULE_BG_7_8_17_18 = "#CEE0E9";
export const CAPSULE_BG_9_10_15_16 = "#AECCDB";
export const CAPSULE_BG_12_14 = "#eaf2db";
export const CAPSULE_BG_6_19 = "#E5CFA4";
export const WHITE_VERSE_BG = "#ffffff";
// ----------------------------------------------------------------------------
// 7. GLOBAL FONT PATH
// ----------------------------------------------------------------------------
export const QURAN_FONT = "/fonts/KFGQPC-Uthman-Taha-Naskh-Bold.ttf";
export const LATIN_VERSE_FONT = "/fonts/FiraSansCondensed-Medium.ttf";
export const LATIN_LABEL_FONT = "/fonts/FiraSansCondensed-Medium.ttf";

// ----------------------------------------------------------------------------
// 8. GLOBAL TEXT SIZES
// ----------------------------------------------------------------------------
export const TEXT_SIZES = {
  BISMILLAH: 0.066,
  TOP_LABEL: 0.027,
  ANA_AYET_TAB: 0.023,
  VERSE_NUMBER: 0.028,
  VERSE_TEXT_SMALL: 0.038,
  VERSE_TEXT_BIG: 0.071,
} as const;

// Language-specific multipliers for capsule/label fitting.
// Tune these values to get tighter text fit per language without resizing capsules.
export const LANGUAGE_TEXT_SCALE = {
  ar: {
    verseSmall: 1,
    verseBig: 1,
    topLabel: 1,
    anaAyet: 1,
  },
  en: {
    verseSmall: 0.67,
    verseBig: 0.5,
    topLabel: 1,
    anaAyet: 1,
  },
  tr: {
    verseSmall: 0.67,
    verseBig: 0.49,
    topLabel: 1,
    anaAyet: 1,
  },
} as const;
