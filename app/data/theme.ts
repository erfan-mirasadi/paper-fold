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

/**
 * BARE SKIN — the colour a page of vellum is cleared to, before the procedural
 * surface is laid over it. See `vellumSurface.ts`, which is what makes the
 * difference between this and a coloured card.
 *
 * IT REPLACES `FLAT_PAGE_BG_COLOR` FOR ANY PAGE THAT HAS THE SURFACE, and the
 * reason is the complaint that started this: those pages had gone pink and
 * pale. `FLAT_PAGE_BG_COLOR` is a neutral grey and honest about it — it is the
 * average of the photograph it stood in for — but the material's own colour was
 * still `PAGE_BG_COLOR`, a pinkish off-white, and every pixel of the page was
 * being multiplied by it. Grey paper x pink light is a pink page, and no amount
 * of turning the grey could fix a tint that was not in the grey.
 *
 * So the vellum page splits the two apart. The material's colour goes NEUTRAL
 * (`VELLUM_MATERIAL_COLOR`) and stops tinting anything, and the entire hue of
 * the paper lives here and in the shader — one place, where it can be looked at
 * against the reference sheet instead of derived through two multiplications.
 *
 * THE VALUE IS SOLVED BACKWARDS from what the page should LOOK like. The
 * reference sheet's median is #faebcd; the page is lit at roughly twice full
 * strength and reflects `VELLUM_LIGHT_SCALE` of it, so the colour the buffer
 * is cleared to has to be that median divided by the 1.12 those two make
 * together — which is this.
 *
 * IT MUST NOT BE BRIGHTER THAN THIS, and that is the whole reason it is written
 * down rather than picked. At #f2dac3 — the value that "looks like vellum" if
 * you choose one by eye — the red channel comes back out of the light ABOVE 255
 * and clips, on the paper AND on every pale thing drawn on it. Red pinned at
 * full while green and blue still move is not a warm cream; it is the peach the
 * flat page was complained about for in the first place. The clipping is the
 * bug; the hue was only ever the symptom.
 *
 * If the page ever looks wrong in the app, this is the number to turn — and the
 * check is that nothing on bare paper reads 255 in any channel.
 */
export const VELLUM_PAGE_COLOR = "#e6d9bd";

/**
 * What a vellum page's material reflects — NEUTRAL, at the same brightness
 * `FLAT_PAPER_LIGHT_SCALE` sets for every other flat page, so that dial still
 * means what its own comment says it means.
 *
 * Neutral on purpose: see `VELLUM_PAGE_COLOR`. The paper's colour belongs to
 * the paper, not to the light falling on it, and the moment the material stops
 * carrying a hue every coloured capsule on the page goes back to being exactly
 * the colour it was authored as.
 */
export const VELLUM_MATERIAL_COLOR = "#ffffff";

/**
 * How much light a VELLUM page accepts — the same dial as
 * `FLAT_PAPER_LIGHT_SCALE`, re-solved because the colour it multiplies changed.
 *
 * 0.62 was not a brightness, it was a brightness TIMES A COLOUR: it scaled
 * `PAGE_BG_COLOR`, whose largest channel is 0.905 in linear, so the brightest
 * thing the page could reflect was 2.0 x 0.62 x 0.905 = 1.12 — just over the
 * clipping point, which is where its own comment says it was aimed. Take the
 * colour out and leave the 0.62 and that peak becomes a flat 1.24: every pale
 * capsule on the page gains a tenth of a stop it has nowhere to put, and the
 * colour coding the whole reading depends on washes out.
 *
 * 0.56 is 0.62 x 0.905. It is the same peak through a neutral colour, so the
 * page is re-tinted without being re-exposed — which is the only way to change
 * the paper's hue without changing every capsule drawn on it.
 */
export const VELLUM_LIGHT_SCALE = 0.56;

/**
 * BARE PAPER for a given surah — the one place that decides it, because there
 * are TWO places that paint it and they were disagreeing.
 *
 * THE TRAP THIS CLOSES. `FLAT_PAGE_BG_COLOR`'s comment above says it is "the
 * colour the render target is CLEARED to", which is true and was never the
 * whole story: `SurahLayout` also draws a full-page plane at z = -0.05, half
 * again the size of the page, over the entire buffer. The clear colour is
 * therefore invisible on every surah — whatever that plane is painted with IS
 * the paper, and it was hard-coded to `PAGE_BG_COLOR`.
 *
 * Nothing showed the disagreement while the paper was a photograph, because the
 * photograph covered both. It showed up the moment the vellum needed to know
 * what bare paper looks like: the shader compares each pixel against this
 * colour to decide whether anything has been DRAWN there (see
 * `VELLUM.coverGain`), the plane handed it a different colour from the clear,
 * so every pixel of the sheet read as "drawn on" — and the surface was
 * multiplied out across the whole page. The paper stayed pink and the texture
 * never appeared, from one hard-coded constant two files away.
 *
 * Both callers now ask here. If a third ever needs it, it asks here too.
 */
export function pageBackgroundColor(features: {
  flatPaperSurface?: boolean;
  vellumSurface?: boolean;
}): string {
  if (features.flatPaperSurface && features.vellumSurface)
    return VELLUM_PAGE_COLOR;
  if (features.flatPaperSurface) return FLAT_PAGE_BG_COLOR;
  return PAGE_BG_COLOR;
}

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
