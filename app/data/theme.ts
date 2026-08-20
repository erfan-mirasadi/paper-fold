export const WHITE_BASE = "#ffffff";
export const SHADOW_BLACK = "#000000";
export const TEXT_DARK = "#000000";
export const TEXT_LABEL = "#4a423a";

// ----------------------------------------------------------------------------
// 3. CANVAS & PAGE COLORS
// ----------------------------------------------------------------------------
export const INNER_CARD_BG = "#ffffff";
export const PAGE_BG_COLOR = "#f4efec";
/**
 * The page colour for a paper that draws NO photograph of paper on itself —
 * see `SurahFeatures.flatPaperSurface`.
 *
 * MEASURED, not chosen. `PAGE_BG_COLOR` was never what those pages looked
 * like: it is the colour the render target is CLEARED to, and the paper
 * photograph was then drawn opaquely over the whole of it, so what the reader
 * actually saw was the photograph's own average. Dropping the photograph and
 * leaving the clear colour showing therefore did not remove a texture — it
 * also lightened the page from 212 to 244 and swapped a warm neutral grey for
 * a pink cream. The page went pale and slightly rosy, which is exactly the
 * complaint.
 *
 * This is that average, sampled off the real assets: the photograph means
 * #d8d6d2, and the grunge frame (black at 0.115 average alpha, laid over it at
 * FRAME_OPACITY) brought it to #d4d3ce. Since a flat paper drops the frame as
 * well, this one number stands in for both and the page lands back where it
 * was.
 *
 * The material's own `color` is deliberately NOT touched: the page reads as
 * (material colour x page texture), so restoring the texture's background to
 * what the photograph averaged reproduces the old result exactly, and every
 * other surah keeps its own arithmetic untouched.
 */
export const FLAT_PAGE_BG_COLOR = "#d4d3ce";
/**
 * How much light a flat paper accepts, against a normal-mapped one — see
 * `SurahFeatures.flatPaperSurface`. THE BRIGHTNESS DIAL: turn this and nothing
 * else if the page is washed out or too dark.
 *
 * WHY IT IS NEEDED AT ALL. The scene lights the paper at roughly twice full
 * strength — ambient 0.8, directional 1.0, and the HDR environment at 0.6
 * (`SceneLighting`, `PAPER_MATERIAL_CONFIG`) — and the renderer runs with
 * `NoToneMapping`, so anything over 1.0 does not roll off, it clips flat to
 * white. A page has always been lit that way.
 *
 * The normal map was hiding it. With relief on the surface, N·L varied from
 * pixel to pixel, so only some of the page was ever over the line and the rest
 * kept its colour. Take the normal map away and the page is geometrically
 * flat: N·L is 1 EVERYWHERE, every pixel is lit at the same 2x, and everything
 * pale enough goes over the line together. What clips is not brightness but
 * SATURATION — a pale blue capsule at (0.90, 0.93, 0.98) doubled is (1, 1, 1),
 * and the blue is simply gone. That is why the colour coding disappeared along
 * with the texture: the two were never independent.
 *
 * Scaling the material's own colour is the surgical fix. It scales what the
 * paper reflects from EVERY light at once, and touches nothing else in the
 * scene: `SceneLighting` is mounted outside the paper-keyed subtree precisely
 * so illumination stays stable across a paper switch, and the elevated
 * sections, pop-ups and 3D bismillah all read those same lights.
 *
 * 0.62 puts the brightest paper back just under the clipping point (2.0 x 0.62
 * is 1.24 at the material's own colour, and the page texture under it is
 * darker still). It is arithmetic, not a measurement — the only way to land it
 * exactly is to look.
 */
export const FLAT_PAPER_LIGHT_SCALE = 0.62;
export const CIRCLE_BORDER = "#8e8e8e";

// ----------------------------------------------------------------------------
// 4. SECTION 1 — UPPER BLOCK PALETTE
// ----------------------------------------------------------------------------
export const SECTION_BG_TEXTURE = "/section-bg.webp";
export const S1_FRAME_BG_COLOR = "#D9C7CA";
export const S2_FRAME_BG_COLOR = "#F0E4E5";
export const S1_FRAME_IMAGE = "/alak/Group 10.svg";
export const S2_FRAME_IMAGE = "/nisa/all-section-1.svg";

export const S1_OUTER_BG = SECTION_BG_TEXTURE;
export const S1_INNER_BG = "#fbf1d5";
export const S1_OUTER_BORDER = "#D9BC81";
export const S1_INNER_BORDER = "#d2ae84";
export const S1_ANA_BG = "#C4963B";

export const S1_VERSE_NUMBER_BG = S1_INNER_BG;
export const S1_VERSE_NUMBER_BORDER = "#8B7C74";
export const S1_VERSE_NUMBER_TEXT = "#000000";

// Verse 5 Specifics
export const CAPSULE_BG_5 = "#DBBD80";
export const S1_VERSE_5_NUMBER_BG = CAPSULE_BG_5;
export const S1_VERSE_5_NUMBER_BORDER = "#8B7C74";
export const S1_VERSE_5_NUMBER_TEXT = "#000000";
export const S1_VERSE_5_TEXT = "#A30000";

export const S1_ANA_LABEL_BG = "#EFE9DC"; // Same as S1_TOP_LABEL_BG
export const S1_ANA_LABEL_BORDER = "#a48a38"; // Golden
export const S1_ANA_LABEL_TEXT = "#5e544a"; // Slightly lighter than TEXT_LABEL (#4a423a)
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
export const ORANGE_THEME = "#C4963B";
export const SG_BG = "#845775";
export const SG_BORDER = "#F4ECD8";
export const S2_VERSE_NUMBER_TEXT = "#000000";
// ----------------------------------------------------------------------------
// TOP LABEL — Section-specific background & border (Section 2)
// ----------------------------------------------------------------------------
export const S2_TOP_LABEL_BG = "#EFE9DC";
export const S2_TOP_LABEL_BORDER = "#a48a38";

// ----------------------------------------------------------------------------
// 6. CAPSULE (VERSE BOX) BACKGROUND COLORS
// ----------------------------------------------------------------------------
export const CAPSULE_BG_7_8_17_18 = "#CEE0E9";
export const CAPSULE_BG_9_10_15_16 = "#AECCDB";
export const CAPSULE_BG_12_14 = "#eaf2db";
export const CAPSULE_BG_6_19 = "#EFE2C7";
export const WHITE_VERSE_BG = "#ffffff";
// ----------------------------------------------------------------------------
// 7. GLOBAL FONT PATH
// ----------------------------------------------------------------------------
export const QURAN_FONT = "/fonts/KFGQPC-Uthman-Taha-Naskh-Bold.woff2";
export const LATIN_VERSE_FONT = "/fonts/FiraSansCondensed-Medium.woff2";
export const LATIN_LABEL_FONT = "/fonts/FiraSansCondensed-Medium.woff2";
export const HANDWRITTEN_FONT = "/fonts/segoe-script-bold.woff2";

/**
 * Canvas-2D font-family names registered via the FontFace API (see
 * `preloadFontUrl` in PaperMaterial.tsx). `CanvasText` looks up a font URL
 * here to know which registered family to draw with — add new page-text
 * fonts to both this map and `PAGE_TEXT_FONTS` together.
 */
export const FONT_FAMILY_NAMES: Record<string, string> = {
  [QURAN_FONT]: "QuranFont",
  [LATIN_VERSE_FONT]: "LatinFont",
  [HANDWRITTEN_FONT]: "HandwrittenFont",
};

// ----------------------------------------------------------------------------
// 8. GLOBAL TEXT SIZES
// ----------------------------------------------------------------------------
export const TEXT_SIZES = {
  BISMILLAH: 0.066,
  TOP_LABEL: 0.027,
  CAPSULE_LABEL: 0.027, // Increased from 0.023 to match TOP_LABEL size
  VERSE_NUMBER: 0.028,
  VERSE_TEXT_SMALL: 0.038,
  VERSE_TEXT_BIG: 0.071,
} as const;

// Language-specific multipliers for capsule/label fitting.
// Tune these values to get tighter text fit per language without resizing capsules.
export const LANGUAGE_TEXT_SCALE = {
  ar: {
    verseSmall: 1,
    verseBig: 1.05,
    topLabel: 1,
    capsuleLabel: 1,
    labelWidth: 1,
  },
  en: {
    verseSmall: 0.67,
    verseBig: 0.5,
    topLabel: 1,
    capsuleLabel: 1,
    labelWidth: 1.35,
  },
  tr: {
    verseSmall: 0.67,
    verseBig: 0.49,
    topLabel: 1,
    capsuleLabel: 1,
    labelWidth: 1.35,
  },
} as const;
