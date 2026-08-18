/**
 * NİSÂ: 23 — An-Nisa 4:23, one ayah split into 15 chunks.
 *
 * Layout matches the reference book page (the Turkish diagram; the Arabic
 * page is the same composition with every row mirrored, which the TEXT DATA
 * does — the geometry below never moves):
 *
 *   ┌──────────────────────────────────────────────────────────┐ ← outer frame (1–14)
 *   │  ┌────────────────────────────────────────────────────┐  │ ← top section (1–3)
 *   │  │        ┌──────────────────────────────┐            │  │
 *   │  │        │  Şunları nikahlamanız …      │            │  │ ← chunk-1 wrapper
 *   │  │        │      ┌───────────────┐       │            │  │   (TR/EN only)
 *   │  │        │      │      (1)      │       │            │  │
 *   │  │        │      └───────────────┘       │            │  │
 *   │  │        └──────────────────────────────┘            │  │
 *   │  │   ┌──────────────────┐  ┌──────────────────┐       │  │
 *   │  │   │       (2)        │  │       (3)        │       │  │ pink
 *   │  │   └──────────────────┘  └──────────────────┘       │  │
 *   │  └────────────────────────────────────────────────────┘  │
 *   │  ┌────────────────────────────────────────────────────┐  │ ← middle band wrapper
 *   │  │ ┌─────────────────┐      ┌─────────────────┐       │  │
 *   │  │ │ (4)  │  (5)     │      │ (8)  │  (9)     │       │  │ green
 *   │  │ │ (6)  │  (7)     │      │ (10) │  (11)    │       │  │ blue
 *   │  │ └─────────────────┘      └─────────────────┘       │  │
 *   │  └────────────────────────────────────────────────────┘  │
 *   │  ┌────────────────────────────────────────────────────┐  │ ← bottom section (12–14)
 *   │  │  ┌────────────────┐    ┌───────────────────────┐   │  │
 *   │  │  │      (12)      │    │         (13)          │   │  │ white
 *   │  │  └────────────────┘    └───────────────────────┘   │  │
 *   │  │        ┌───────────────────────────┐  ⟨٢٣⟩         │  │ yellow, carries
 *   │  │        │           (14)            │               │  │ the ayah marker
 *   │  │        └───────────────────────────┘               │  │
 *   │  └────────────────────────────────────────────────────┘  │
 *   └──────────────────────────────────────────────────────────┘
 *      ┌──────────────────────────────────────────────────┐
 *      │                      (15)                        │      OUTSIDE the frame
 *      └──────────────────────────────────────────────────┘
 *
 * CHUNK 15 is the tail the reference page prints separately under a red
 * "Not:" marker — the continuation of chunk 11 (وَرَبَائِبُكُمُ …). It is NOT a
 * capsule block: there are only eight blocks (0–7, chunks 1–14), and the
 * space under the frame is filled by `handwrittenNotes` instead, because the
 * reference prints something different there per language — the ayah's own
 * tail in Arabic, a prose gloss of it in Turkish. See the note block below;
 * the reference's box and (15) badge around it are not reproduced.
 *
 * The mushaf ayah number (23) rides on chunk 14 instead, stacked under 14's
 * own counter (`showAyahNumber`).
 *
 * MIRRORING. Arabic reads right→left, so chunks 4–7 sit in the RIGHT half and
 * 8–11 in the LEFT. Turkish/English read left→right and want the opposite.
 * Blocks 2/3 are always the right half and blocks 4/5 always the left, and
 * each language's `colorGroups` simply put its own chunks in the half that
 * reads first — the same trick tevbe24Config uses. Capsule colours follow the
 * SLOT (they resolve through the Arabic id at that transform), which is why
 * the upper row is green and the lower row blue in every language.
 *
 * FOLDING — four creases, one per band boundary between chunk 1 and chunk 14,
 * driving a three-beat reveal the reference reading order asks for:
 *   pre-start → only the YELLOW chunks (1 and 14) face the reader
 *   blue      → the blue row (6,7,10,11) comes back into plane
 *   green     → the green row (4,5,8,9) joins it
 *   end       → flat; pink (2,3) and white (12,13) complete the page
 *
 * BACKGROUND SECTIONS — the outer frame reuses the project's own
 * /nisa/all-section-1.svg. Everything inside it is a new /nisa23/frame-*.svg,
 * all four drawn with /tevbe/dome-section.svg's exact treatment: #F5EEDC at
 * 0.6 opacity over the project's gold gradient outline. Each file is drawn at
 * the aspect it is displayed at, so its corners and stroke arrive undistorted
 * — see the header comment inside each SVG before changing any scaleX/scaleY.
 */

import type { SurahLayoutConfig } from "../schema";
import type { SurahDataShape } from "../SurahConfig";
import type { SurahLanguage } from "../../hooks/useSurahLanguageStore";
import {
  S1_INNER_BG,
  S1_INNER_BORDER,
  MAROON_VERSE_BG,
  GREEN_VERSE_BG,
  GREEN_THEME,
  CAPSULE_BG_7_8_17_18,
  CAPSULE_BG_6_19,
  ORANGE_THEME,
  WHITE_VERSE_BG,
  QURAN_FONT,
} from "../theme";

// ---------------------------------------------------------------------------
// PALETTE — every capsule background is one of the project's own theme
// colours (see ../theme.ts); only the outlines and text tones are local, and
// each is picked to sit on its own background.
//
// Number badges take `circleBorderCol = their own capsule bg`, so the badge
// ring disappears into the capsule the way the reference page prints it. The
// single exception is the mushaf ayah marker (23) on chunk 14, which keeps a
// visible gold ring.
// ---------------------------------------------------------------------------

const YELLOW_BG = S1_INNER_BG; // #fbf1d5 — chunk 1
const YELLOW_BORDER = S1_INNER_BORDER; // #d2ae84

const PINK_BG = MAROON_VERSE_BG; // #ebd2dc — chunks 2, 3
const PINK_BORDER = "#B27E92";
const PINK_TEXT = "#6E2F45";

const GREEN_BG = GREEN_VERSE_BG; // #eaf2db — chunks 4, 5, 8, 9
const GREEN_BORDER = GREEN_THEME; // #5E7367
const GREEN_TEXT = "#2F4034";

const BLUE_BG = CAPSULE_BG_7_8_17_18; // #CEE0E9 — chunks 6, 7, 10, 11
const BLUE_BORDER = "#79A7AC";
const BLUE_TEXT = "#234A52";

const WHITE_BG = WHITE_VERSE_BG; // #ffffff — chunks 12, 13, 15
const WHITE_BORDER = "#C7C1AC";
const WHITE_TEXT = "#2C2A22";

const CLOSING_BG = CAPSULE_BG_6_19; // #EFE2C7 — chunk 14
const CLOSING_BORDER = ORANGE_THEME; // #C4963B

const RED_TEXT = "#A30000";

/** Shared shape for the four green chunks (4, 5, 8, 9). */
const greenBox = (extra: Record<string, unknown> = {}) => ({
  bg: GREEN_BG,
  border: GREEN_BORDER,
  circleBg: GREEN_BG,
  circleBorderCol: GREEN_BG,
  circleTextCol: "#2F4034",
  textColor: GREEN_TEXT,
  isPill: false,
  ...extra,
});

/** Shared shape for the four blue chunks (6, 7, 10, 11). */
const blueBox = (extra: Record<string, unknown> = {}) => ({
  bg: BLUE_BG,
  border: BLUE_BORDER,
  circleBg: BLUE_BG,
  circleBorderCol: BLUE_BG,
  circleTextCol: "#234A52",
  textColor: BLUE_TEXT,
  isPill: false,
  ...extra,
});

/** Shared shape for the white chunks (12, 13, 15). */
const whiteBox = (extra: Record<string, unknown> = {}) => ({
  bg: WHITE_BG,
  border: WHITE_BORDER,
  circleBg: WHITE_BG,
  circleBorderCol: WHITE_BG,
  circleTextCol: "#4A4636",
  textColor: WHITE_TEXT,
  isPill: false,
  ...extra,
});

// ---------------------------------------------------------------------------
// LAYOUT CONFIG
// ---------------------------------------------------------------------------

export const NISA_23_CONFIG: SurahLayoutConfig = {
  id: "nisa23",
  title: "NİSÂ: 23",
  heroTitle: "Nisâ",
  heroSubtitle: "suresi 23",

  scriptInfo: {
    title: "Nisâ: 23",
    sayfa: 81,
    juz: 4,
    hizb: 8,
    singleAyahNumber: 23,
  },

  // Fold-story → script sync (left ayah-list sidebar). One entry per fold
  // step: exactly the chunks still facing the reader at that step.
  scriptHighlights: {
    "pre-start": [1, 14],
    blue: [1, 6, 7, 10, 11, 14],
    green: [1, 4, 5, 6, 7, 8, 9, 10, 11, 14],
    end: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  },

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: false,
    hideVerseNumbers: false, // numbers ON — the small 1..15 chunk numerals
  },

  dimensions: {
    paperWidth: 1.54,
    paperHeight: 1.78,
    sceneCenterYOffset: -0.045,
    padding: 0.29,
    scrollPages: 3,
    fixedWidthAcrossLanguages: true,
  },

  specialVerses: {},

  // ── Per-verse appearance ───────────────────────────────────────────────
  verseOverrides: {
    // Chunk 1 — the opener.
    //
    // The two languages ink this capsule differently, which is why the color
    // is split here. Arabic keeps the opener (حُرِّمَتْ عَلَيْكُمْ, "forbidden to
    // you") in black and prints only the first forbidden relative — أُمَّهَاتُكُمْ,
    // "your mothers" — in red, so the red picks out the list item rather than
    // the sentence around it. The translations carry the opener in their own
    // `topLabel` line instead, so their capsule holds nothing BUT the list
    // item and goes red end to end, the way the reference page prints it.
    1: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BG,
      circleTextCol: "#7A5A18",
      textColor: "#000000",
      translationTextColor: RED_TEXT,
      textHighlights: [{ text: "أُمَّهَاتُكُمْ", color: RED_TEXT }],
      isPill: false,
      textScaleOverride: 0.75,
      translationTextScaleOverride: 0.48,
    },

    // Chunks 2, 3 — white pair, full width.
    2: whiteBox({
      textScaleOverride: 0.66,
      translationTextScaleOverride: 0.46,
    }),
    3: whiteBox({
      textScaleOverride: 0.66,
      translationTextScaleOverride: 0.46,
    }),

    // Chunks 4–11 — the middle band. Upper row green, lower row blue, in
    // both halves; see the MIRRORING note in the file header. Scales are
    // per-chunk because the Arabic phrases here differ a lot in length:
    // وَعَمَّاتُكُمْ is one word, وَأُمَّهَاتُكُمُ اللَّاتِي أَرْضَعْنَكُمْ is four.
    4: greenBox({
      textScaleOverride: 0.72,
      translationTextScaleOverride: 0.48,
    }),
    5: greenBox({
      textScaleOverride: 0.72,
      translationTextScaleOverride: 0.48,
    }),
    8: greenBox({
      textScaleOverride: 0.6,
      translationTextScaleOverride: 0.48,
    }),
    9: greenBox({ textScaleOverride: 0.6, translationTextScaleOverride: 0.48 }),

    6: blueBox({
      textScaleOverride: 0.72,
      translationTextScaleOverride: 0.48,
    }),
    7: blueBox({
      textScaleOverride: 0.72,
      translationTextScaleOverride: 0.48,
    }),
    10: blueBox({
      textScaleOverride: 0.72,
      translationTextScaleOverride: 0.48,
    }),
    // Chunk 11 carries the footnote marker for the "NOT:" tail printed under
    // the page (chunk 15's continuation). Arabic marks it with a bare `*` in
    // its text data; red is what makes it read as a marker rather than a stray
    // glyph in the phrase. Turkish spells the same marker out as "(NOT)" and
    // is left in the capsule's own ink.
    11: blueBox({
      textScaleOverride: 0.6,
      translationTextScaleOverride: 0.48,
      textHighlights: [{ text: "*", color: RED_TEXT }],
    }),

    // Chunks 12, 13 — white pair. 13 carries the longest text on the page.
    12: whiteBox({
      textScaleOverride: 0.66,
      translationTextScaleOverride: 0.46,
    }),
    13: whiteBox({
      textScaleOverride: 0.66,
      translationTextScaleOverride: 0.46,
    }),

    // Chunk 14 — the closing box. Last chunk inside the frame, so it carries
    // the mushaf ayah marker (23) stacked under its own counter (14).
    14: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BG,
      circleTextCol: "#7A5A18",
      ayahBadgeTextCol: YELLOW_BORDER,
      // The one badge on the page that keeps a visible ring — the mushaf ayah
      // marker. Every chunk counter takes `circleBorderCol = its own capsule
      // bg` and disappears into it; 23 is the mushaf's own number, so it gets
      // the gold outline the reference page prints around it.
      ayahBadgeBorderCol: YELLOW_BORDER,
      // The pair sits on a 0.105-high capsule. The ayah marker (23) is placed
      // on the vertical middle (offsetY: 0) and shifted in (offsetX: 0.06).
      // The counter (14) keeps its Y dropped by 0.017 to avoid the top border,
      // but its X is pushed to the wall (counterOffsetX: 0).
      ayahBadgeLayout: {
        offsetX: 0.06,
        offsetY: 0,
        counterOffsetX: 0,
        counterOffsetY: -0.017,
      },
      translationAyahBadgeLayout: {
        offsetX: 0,
        offsetY: -0.01, // Moves 23 slightly lower
        counterOffsetY: -0.012,
      },
      textColor: "#000000",
      isPill: false,
      textScaleOverride: 0.75,
      // Kept low so the long translation clears the stacked 14 / 23 badge
      // riding on the left edge.
      translationTextScaleOverride: 0.48,
      showAyahNumber: true,
    },
  },

  styling: {
    colors: {
      paperBase: "#FAF7F2",
      shadow: "#000000",
      backface: "#EDE8D6",
      textDark: "#333333",
      textLabel: "#555555",
      circleBorder: "#bbbbbb",
      verseNumberText: "#222222",
      s1AnaLabelBg: "#ffffff",
      s1AnaLabelText: "#000000",
      s1AnaLabelBorder: "#dddddd",
      s2FrameBg: "#f4f4f4",
      boarderFrame: "#ffffff",
      boarderHalo: "#ADADAD",
      innerCard: "#eeeeee",
      sectionBgTexture: "#fcfcfc",
      hollowConnectorInnerBg: "#e3e3e3",
      maroonTheme: PINK_BORDER,
      greenTheme: GREEN_BORDER,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: YELLOW_BG,
      s2Group1Bg: PINK_BG,
      s2Group2Bg: GREEN_BG,
      s2Group3Bg: BLUE_BG,
      // No side brackets/curves on this page. A single fully-transparent entry
      // makes SideCurves emit nothing (an empty [] would instead fall back to
      // the default olive centre bracket for every isCenter group).
      curveColors: [{ color: "transparent", fillColor: "transparent" }],
    },
    capsuleBorderWidth: 0.0042,
    circleBorderWidth: 0.0035,
    verseRadius: 0.032,
    oppositeVerseConnectorRadius: 0.05,
    elevatedSectionRadii: {
      base: 0.039,
      outer: 0.025,
      innerA: 0.023,
      innerB: 0.022,
    },
  },

  // ── GLOBAL SIZING ───────────────────────────────────────────────────────
  globalSettings: {
    capsuleHeight: 0.125,
    columnGap: 0.02,
    rowGap: 0.02,
    blockGap: 0.02,
    sectionPadX: 0.005,
    blockPadding: 0.012,
    sectionBorderWidth: 0.006,
    verseTextScale: 0.72,
    translationVerseTextScale: 0.48,
    // Lets verse text use the FULL capsule width (no wide number-badge
    // padding), so the short two-word chunks wrap cleanly instead of clipping.
    tightVersePadding: true,
    // The left half of the middle band is collapsed onto the right half's
    // vertical band by a big negative verticalNudge (see block 4). The engine
    // still reserves the full stacked height for auto-centring, so the top
    // edge is pinned here instead.
    //
    //   engine totalContentH   1.746      (counts the left half twice)
    //   real drawn height      1.380      (1.746 − the 0.366 nudge)
    //   pinned top             −0.298     → content runs to −1.625, leaving
    //                                       0.155 of paper under chunk 15
    contentStartYOverride: -0.298,
  },

  handwrittenNotes: [
    {
      x: 0.77,
      y: -0.072,
      fontSize: 0.05,
      color: "#7C2C2A",
      lineSpacing: 1.4,
      maxWidth: 1.5,
      textAlign: "center",
      rotationZ: 0,
      lines: [{ text: "Nisâ: 23" }],
    },
    // ── THE "NOT:" TAIL, TWO WAYS ────────────────────────────────────────────
    // The reference page prints chunk 15 — the continuation of chunk 11
    // (وَرَبَائِبُكُمُ …) — below the outer frame under a red "Not:" marker. What it
    // prints there is NOT the same content in two languages:
    //
    //   Arabic page  → the ayah's own tail, in mushaf script, two lines
    //   Turkish page → a prose gloss explaining that tail, four lines
    //
    // Different wording, line count, script, font and ink — so they are two
    // separate notes, each hidden in the other's languages, rather than one
    // note with a text override. That is the pattern for every other surah's
    // per-language notes too: author one note per script, set `hidden` in the
    // languages that don't read it. Both resolve on the language switch (see
    // `HandwrittenNoteLanguageOverride`).

    // ARABIC — the ayah tail itself. `font` is spelled out even though the
    // renderer would infer QURAN_FONT from the script, because a margin note in
    // the Latin cursive is this system's default and the exception should be
    // visible here. Every line pins `rotation: 0`: the auto-wobble sells
    // handwriting, and this is printed mushaf text, not a hand-written gloss.
    {
      x: 0.77,
      y: -1.552,
      fontSize: 0.042,
      font: QURAN_FONT,
      color: "#111111",
      lineSpacing: 1.55,
      maxWidth: 1.35,
      textAlign: "center",
      rotationZ: 0,
      lines: [
        {
          text: "مِّن نِّسَائِكُمُ اللَّاتِي دَخَلْتُم بِهِنَّ فَإِن لَّمْ تَكُونُوا دَخَلْتُم بِهِنَّ فَلَا",
          rotation: 0,
        },
        { text: "جُنَاحَ عَلَيْكُمْ", rotation: 0 },
      ],
      languageOverrides: {
        tr: { hidden: true },
        en: { hidden: true },
      },
    },

    // ARABIC — the red "Not:" marker that labels the tail above. Its own note
    // because it is Latin script sitting next to Arabic: one note carries one
    // font, and the marker wants the handwritten face the rest of the page's
    // margins use. Anchored near the frame's left edge (frame runs x 0.17…1.37),
    // level with the tail's second line, as on the reference page.
    {
      x: 0.235,
      y: -1.617,
      fontSize: 0.032,
      color: RED_TEXT,
      lineSpacing: 1.4,
      maxWidth: 0.3,
      textAlign: "left",
      rotationZ: 0,
      lines: [{ text: "Not:", rotation: 0 }],
      languageOverrides: {
        tr: { hidden: true },
        en: { hidden: true },
      },
    },

    // TURKISH / ENGLISH — the prose gloss. English currently reads the Turkish
    // wording (as everywhere else on this page that has no English copy yet);
    // give it its own `lines` under an `en` override when that copy exists.
    {
      x: 0.77,
      y: -1.546,
      fontSize: 0.038,
      color: "#000000",
      lineSpacing: 1.4,
      maxWidth: 1.5,
      textAlign: "center",
      rotationZ: 0,
      hidden: true,
      lines: [
        {
          segments: [
            { text: "NOT: 11. cümlenin devamı: ", color: RED_TEXT },
            { text: "Eşlerinizin kızları: Zifafa" },
          ],
        },
        {
          text: "girdiğiniz eşlerinizin kızlanını yani evinizde bulunan",
        },
        {
          text: "üvey kızlarınızı nikahlamanız haramdır. Ancak zifafa",
        },
        {
          text: "girmediğiniz eşlerinizin kızlanını nikahlayabılirsiniz.",
        },
      ],
      languageOverrides: {
        tr: { hidden: false },
        en: { hidden: false },
      },
    },
  ],

  // ── BLOCKS ───────────────────────────────────────────────────────────────
  // HORIZONTAL BUDGET. Everything on this page is sized outward from the
  // outer frame, which runs 1.20 wide (x 0.17 … 1.37 on a 1.54 paper). The
  // engine's own content column is only 0.95 wide, so every full-width block
  // below carries a NEGATIVE horizontalInset to push past it — that is the
  // normal way this engine widens a block, not a hack.
  //
  //   outer frame           1.20     x 0.170 … 1.370
  //   section frames        1.15     x 0.195 … 1.345
  //   half frames           0.545    x 0.210 … 0.755  /  0.785 … 1.330
  //   chunk 1 wrapper       0.77     x 0.385 … 1.155
  //
  // A block's capsule row is always centred on `0.77 + xOffset`, and for a
  // 2-column block its span is 2·colW + columnGap where
  //     colW = (0.95 − 2·horizontalInset − 2·blockPadding − columnGap) / 2.
  // A 1-column block places ONE capsule of that same colW, centred.
  //
  // VERTICAL BUDGET, in absolute page Y (contentStartY = −0.298, paper top 0):
  //
  //   block  frame top   frame h   capsules
  //     0     −0.298      0.265    chunk 1        (blockPadding 0.075 leaves
  //     1     −0.514      0.139    chunks 2,3      room above chunk 1 for the
  //     2     −0.695      0.169    right half ↑    opener line — empty in AR)
  //     3     −0.878      0.169    right half ↓
  //     4     −0.695      0.169    left half ↑     (verticalNudge −0.366)
  //     5     −0.878      0.169    left half ↓
  //     6     −1.089      0.154    chunks 12,13
  //     7     −1.257      0.149    chunk 14
  //
  // Below block 7 there is no block: the chunk-15 band (from about −1.506) is
  // drawn by `handwrittenNotes`, which is why it is per-language.
  //
  // allGroups index (used by svgOverlays anchorGroupIndex) == block index.
  blocks: [
    // 0 — Chunk 1, centred. The oversized blockPadding is the band the
    //     translations print their shared opener in (`topLabelConfig` below).
    {
      id: "b_v1",
      type: "group",
      verseIds: [1],
      columns: 1,
      capsuleHeight: 0.105,
      blockPadding: 0.075,
      // → capsule width 0.66, which is 67% of the 0.96 wrapper box drawn
      //   around it — the reference page's own ratio. Widening this capsule
      //   collapses the two outlines onto each other.
      horizontalInset: -0.187,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      // The shared opener line, printed inside the chunk-1 wrapper box above
      // chunk 1's own capsule. Empty in Arabic (see the text data), so this
      // renders nothing there. `yOffset` is measured DOWN from the block's
      // frame top (−0.298), putting the line's centre at −0.340 — comfortably
      // inside the wrapper, which spans −0.316 … −0.509. Scaled up to 1.2 so
      // the opener reads at the same weight as the capsule under it, the way
      // the reference prints the pair.
      topLabelConfig: {
        width: 0.92,
        height: 0.045,
        yOffset: -0.042,
        textColor: RED_TEXT,
        isSimpleText: true,
        shadow: false,
        textScaleOverride: 1.2,
        translationTextScaleOverride: 1.2,
      },
    },
    // 1 — Pink pair. AR [3,2] (2 reads first, on the right); TR/EN [2,3].
    {
      id: "b_v23",
      type: "group",
      verseIds: [3, 2],
      columns: 2,
      capsuleHeight: 0.13,
      horizontalInset: -0.092, // → capsule width 0.545
      isCenter: true,
      columnGap: 0.02,
      dragBehavior: "group",
      hideRowConnectors: true,
      gapBefore: -0.054,
    },
    // 2 — Middle band, RIGHT half, upper (green) row.
    //     AR chunks 5,4 · TR/EN chunks 8,9.
    {
      id: "b_right_up",
      type: "group",
      verseIds: [5, 4],
      columns: 2,
      capsuleHeight: 0.145,
      horizontalInset: 0.143, // → capsule width 0.31
      xOffset: 0.3475,
      isCenter: false,
      columnGap: 0.02,
      dragBehavior: "group",
      hideRowConnectors: true,
      gapBefore: 0.047,
    },
    // 3 — Middle band, RIGHT half, lower (blue) row.
    {
      id: "b_right_down",
      type: "group",
      verseIds: [7, 6],
      columns: 2,
      capsuleHeight: 0.145,
      horizontalInset: 0.143,
      xOffset: 0.3475,
      isCenter: false,
      columnGap: 0.02,
      dragBehavior: "group",
      hideRowConnectors: true,
      gapBefore: 0.014,
    },
    // 4 — Middle band, LEFT half, upper (green) row. Pulled back UP onto
    //     block 2's band: nudge = block2.h + gap + block3.h + gap
    //                           = 0.169 + 0.014 + 0.169 + 0.014.
    {
      id: "b_left_up",
      type: "group",
      verseIds: [9, 8],
      columns: 2,
      capsuleHeight: 0.145,
      horizontalInset: 0.143,
      xOffset: -0.3475,
      isCenter: false,
      columnGap: 0.02,
      dragBehavior: "group",
      hideRowConnectors: true,
      gapBefore: 0.014,
      verticalNudge: -0.366,
    },
    // 5 — Middle band, LEFT half, lower (blue) row. Natural stacking after
    //     block 4 lands it exactly on block 3's band.
    {
      id: "b_left_down",
      type: "group",
      verseIds: [11, 10],
      columns: 2,
      capsuleHeight: 0.145,
      horizontalInset: 0.143,
      xOffset: -0.3475,
      isCenter: false,
      columnGap: 0.02,
      dragBehavior: "group",
      hideRowConnectors: true,
      gapBefore: 0.014,
    },
    // 6 — White pair. Chunk 13 is the longest text inside the frame.
    {
      id: "b_v1213",
      type: "group",
      verseIds: [13, 12],
      columns: 2,
      capsuleHeight: 0.13,
      horizontalInset: -0.092, // → capsule width 0.545
      isCenter: true,
      columnGap: 0.02,
      dragBehavior: "group",
      hideRowConnectors: true,
      gapBefore: 0.042,
    },
    // 7 — Chunk 14, centred. Carries the ٢٣ ayah marker.
    {
      id: "b_v14",
      type: "group",
      verseIds: [14],
      columns: 1,
      capsuleHeight: 0.105,
      horizontalInset: -0.187, // → capsule width 0.66
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.014,
    },
  ],

  // ── Drag / elevation zones ───────────────────────────────────────────────
  //
  // `cameraFocus` puts this page on the SAME zoom as the Yâsîn atlas: a zone
  // states the RECTANGLE the camera must show, and `SectionZoomCamera` solves
  // the distance itself, flying in all three axes and returning home on
  // dismiss. Stating a focus is what switches the page onto that path, so the
  // `cameraTarget` heights below are superseded — they are kept as the
  // fallback the moment a focus is removed again.
  //
  // Each rectangle is the union of the zone's verse capsules AND the
  // decorative frame drawn around it (see `svgOverlays` below — a frame's
  // on-screen size IS its scaleX/scaleY, centred on its anchor plus offset),
  // grown by 1.12 about its own centre. That last factor is not decoration:
  // `FRAME_FILL` is 1.1, which fits the rectangle to 110% of the viewport and
  // so crops a tenth of whichever side runs out of room first — without the
  // margin, the frame art is exactly what gets cut off. Move a block or a
  // frame and these have to move with it.
  //
  // Deliberately NOT on the progressive-page-texture ladder (`PageTextureLod`).
  // That ladder exists for a paper carrying a dozen sheets, where one capture
  // cannot serve them all. This page is a single 1.54 x 1.78 sheet whose one
  // capture already lands ~3100 texels per world unit — better than the
  // screen-sized detail patch the ladder would swap in, so turning it on here
  // would cost memory and LOSE sharpness.
  // One zone per decorative frame below, innermost first: the reverse index is
  // first-wins, so each chunk lands in the tightest frame drawn around it and
  // `sec_all` keeps only its own outer frame — which encloses the other zones
  // and therefore drags all of them (see sectionResolver's ancestor index).
  customSections: [
    {
      id: "sec_top",
      verseIds: [1, 2, 3],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.4 },
      cameraFocus: { x: 0.126, y: -0.281, w: 1.288, h: 0.422 },
    },
    {
      id: "sec_grp_a",
      verseIds: [4, 5, 6, 7],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.4 },
      cameraFocus: { x: 0.736, y: -0.669, w: 0.762, h: 0.414 },
    },
    {
      id: "sec_grp_b",
      verseIds: [8, 9, 10, 11],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.4 },
      cameraFocus: { x: 0.042, y: -0.669, w: 0.762, h: 0.414 },
    },
    {
      id: "sec_bottom",
      verseIds: [12, 13, 14],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.4 },
      cameraFocus: { x: 0.126, y: -1.057, w: 1.288, h: 0.422 },
    },
    {
      id: "sec_all",
      verseIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      cameraTarget: { y: 1.2, fov: 28, tilt: -1.35 },
      cameraFocus: { x: 0.022, y: -0.064, w: 1.495, h: 1.512 },
    },
  ],

  // ── SVG SECTIONS ─────────────────────────────────────────────────────────
  // Each /nisa23/frame-*.svg draws its outline flush with the plane edge, so
  // a frame's on-screen size IS (scaleX, scaleY) and its centre is the plane
  // centre — which is what every offsetY below solves for:
  //     offsetY = (wanted frame centre) − (anchor block's frame top)
  //
  // /nisa/all-section-1.svg is the one exception: it draws across 98% of its
  // plane's width and from 10%→99.4% of its height, so its scales divide by
  // those factors and its offsetY carries the extra 4.68%-of-height term that
  // re-centres the plane. Its rx/ry pre-distortion is tuned for a
  // scaleX/scaleY of 0.859 and this page runs 0.918 — within 7%, so its
  // corners stay visually circular.
  //
  // Vertical stack of the frames (all in absolute page Y). The two domes are
  // TALLER than the boxes they wrap, because an arch is only full width below
  // its shoulder — see each SVG's header for the arch-depth budget.
  //     outer    −0.163 … −1.467
  //     top      −0.178 … −0.663   blue dome, arching UP
  //     wrapper  −0.263 … −0.456   cream, TR/EN only
  //     mid      −0.683 … −1.059   darker cream plate
  //     halves   −0.691 … −1.051   cream, sitting on the plate
  //     bottom   −1.075 … −1.452   blue dome, arching DOWN
  svgOverlays: [
    // Outer frame — wraps chunks 1 … 14 (15 deliberately stays outside).
    //   wanted: 1.20 wide, y −0.163 … −1.467  (centre −0.815)
    {
      src: "/nisa/all-section-1.svg",
      anchorGroupIndex: 0,
      anchorEdge: "top",
      scaleX: 1.2245, // 1.20 / 0.980
      scaleY: 1.35, // 1.304 / 0.894
      offsetX: 0,
      offsetY: -0.522, // −0.815 + 0.0468·1.4586 + 0.298
      renderOrder: 2,
      customSectionId: "sec_all",
    },
    // Top section — chunks 1 … 3. Blue dome, flat bottom, arching up.
    //   wanted: 1.15 x 0.485, y −0.178 … −0.663  (centre −0.4205)
    {
      src: "/nisa23/frame-oval-top.svg",
      anchorGroupIndex: 0,
      anchorEdge: "top",
      scaleX: 1.15,
      scaleY: 0.377,
      offsetX: 0,
      offsetY: -0.195,
      renderOrder: 3,
      customSectionId: "sec_top",
    },
    // Chunk-1 wrapper — the "capsule inside a capsule". TRANSLATIONS ONLY:
    // Arabic says the opener and chunk 1 in one breath, so there is nothing
    // to wrap and the band above chunk 1 simply stays empty, exactly like the
    // Arabic reference page.
    //   wanted: 0.92 x 0.193, y −0.263 … −0.456  (centre −0.3595)
    {
      src: "/nisa23/verse1-wrapper.svg",
      anchorGroupIndex: 0,
      anchorEdge: "top",
      scaleX: 0.77,
      scaleY: 0.195,
      offsetX: 0,
      offsetY: -0.105,
      renderOrder: 4,
      customSectionId: "sec_top",
      languages: ["tr", "en"],
    },
    // Middle band wrapper — the darker plate the two half frames sit on.
    // Belongs to `sec_all` rather than owning a zone of its own: the two
    // halves are the draggable units, this is just the plate under them.
    //   wanted: 1.15 x 0.376, y −0.683 … −1.059  (centre −0.871)
    // {
    //   src: "/nisa23/frame-band.svg",
    //   anchorGroupIndex: 2,
    //   anchorEdge: "top",
    //   scaleX: 1.36,
    //   scaleY: 0.376,
    //   offsetX: 0,
    //   offsetY: -0.176,
    //   renderOrder: 3,
    //   customSectionId: "sec_all",
    // },
    // Middle band, RIGHT half — AR chunks 4–7, TR/EN chunks 8–11.
    //   wanted: 0.545 x 0.360, y −0.691 … −1.051  (centre −0.871)
    {
      src: "/nisa23/frame-side.svg",
      anchorGroupIndex: 2,
      anchorEdge: "top",
      scaleX: 0.68,
      scaleY: 0.37,
      offsetX: 0.3475, // == the block's own xOffset
      offsetY: -0.176,
      renderOrder: 4,
      customSectionId: "sec_grp_a",
    },
    // Middle band, LEFT half — AR chunks 8–11, TR/EN chunks 4–7.
    {
      src: "/nisa23/frame-side.svg",
      anchorGroupIndex: 2,
      anchorEdge: "top",
      scaleX: 0.68,
      scaleY: 0.37,
      offsetX: -0.3475,
      offsetY: -0.176,
      renderOrder: 4,
      customSectionId: "sec_grp_b",
    },
    // Bottom section — chunks 12 … 14. Blue dome, the top one mirrored:
    // flat top, arching down under chunk 14.
    //   wanted: 1.15 x 0.377, y −1.075 … −1.452  (centre −1.2635)
    {
      src: "/nisa23/frame-oval-bottom.svg",
      anchorGroupIndex: 6,
      anchorEdge: "top",
      scaleX: 1.15,
      scaleY: 0.377,
      offsetX: 0,
      offsetY: -0.1745,
      renderOrder: 3,
      customSectionId: "sec_bottom",
    },
  ],

  sideInfo: {
    panelTitle: "Tefsir",
    byFoldStep: {
      "pre-start": {
        kicker: "NİSÂ: 23",
        paragraphs: [
          "Bu ayet tek bir ayettir. Nikahlanması haram olan kadınları, ikili simetrik bir sistem içinde, birbirine denk kelimelerle sıralar. Kelimelerin diziliş güzelliğini görmek için sayfayı ortasından aşağıdan yukarıya ve sağdan sola katlayarak inceleyiniz.",
          "Aşağıdaki numaralar ayetin kendi numaraları değildir; okunuş sırasını göstermek için biz koyduk.",
        ],
      },
      blue: {
        paragraphs: [
          "Şimdi ortadaki bölümün alt sırasını okuyalım. Bu dört kelime, üstlerindeki dört kelimenin simetriğidir: kardeş çocukları ile eş tarafından gelen yakınlıklar aynı hizada durur.",
        ],
      },
      green: {
        paragraphs: [
          "Üst sıra da açıldı. Şimdi dört kelime alt alta ve yan yana okunabiliyor:",
          {
            capsules: [
              {
                n: 4,
                text: "Halalarınızı,",
                bg: GREEN_BG,
                color: GREEN_BORDER,
                textColor: GREEN_TEXT,
              },
              {
                n: 5,
                text: "Teyzelerinizi,",
                bg: GREEN_BG,
                color: GREEN_BORDER,
                textColor: GREEN_TEXT,
              },
              {
                n: 6,
                text: "Erkek kardeşlerin kızlarını,",
                bg: BLUE_BG,
                color: BLUE_BORDER,
                textColor: BLUE_TEXT,
              },
              {
                n: 7,
                text: "Kız kardeşlerin kızlarını,",
                bg: BLUE_BG,
                color: BLUE_BORDER,
                textColor: BLUE_TEXT,
              },
            ],
            columns: 2,
            corners: "soft",
          },
          "Bu yukardaki dörtlü bölümü ortasından, sağdan sola ve sonra da yukarıdan aşağıya katlayınız. Kelimelerin sıralanışındaki güzelliği görünüz. Hikmetlerini kavramaya çalışınız.",
        ],
      },
      end: {
        paragraphs: [
          "Şimdi ayeti baştan sona okuyalım. Okurken numara sırasını takip ediniz.",
          "Şunları nikahlamanız size haram kılındı;",
          {
            capsules: [
              {
                n: 1,
                text: "Öz annenizi,",
                bg: YELLOW_BG,
                color: YELLOW_BORDER,
                textColor: RED_TEXT,
              },
              {
                n: 2,
                text: "Kendi kızlarınızı,",
                bg: PINK_BG,
                color: PINK_BORDER,
                textColor: PINK_TEXT,
              },
              {
                n: 3,
                text: "Kendi kız kardeşlerinizi,",
                bg: PINK_BG,
                color: PINK_BORDER,
                textColor: PINK_TEXT,
              },
              {
                n: 4,
                text: "Halalarınızı,",
                bg: GREEN_BG,
                color: GREEN_BORDER,
                textColor: GREEN_TEXT,
              },
              {
                n: 5,
                text: "Teyzelerinizi,",
                bg: GREEN_BG,
                color: GREEN_BORDER,
                textColor: GREEN_TEXT,
              },
              {
                n: 8,
                text: "Süt annelerinizi,",
                bg: GREEN_BG,
                color: GREEN_BORDER,
                textColor: GREEN_TEXT,
              },
              {
                n: 9,
                text: "Süt kız kardeşlerinizi,",
                bg: GREEN_BG,
                color: GREEN_BORDER,
                textColor: GREEN_TEXT,
              },
              {
                n: 6,
                text: "Erkek kardeşlerin kızlarını,",
                bg: BLUE_BG,
                color: BLUE_BORDER,
                textColor: BLUE_TEXT,
              },
              {
                n: 7,
                text: "Kız kardeşlerin kızlarını,",
                bg: BLUE_BG,
                color: BLUE_BORDER,
                textColor: BLUE_TEXT,
              },
              {
                n: 10,
                text: "Eşlerinizin annelerini,",
                bg: BLUE_BG,
                color: BLUE_BORDER,
                textColor: BLUE_TEXT,
              },
              {
                n: 11,
                text: "Eşlerinizin kızlarını,",
                bg: BLUE_BG,
                color: BLUE_BORDER,
                textColor: BLUE_TEXT,
              },
              {
                n: 12,
                text: "Kendi öz oğullarınızın hanımlarını,",
                bg: WHITE_BG,
                color: WHITE_BORDER,
                textColor: WHITE_TEXT,
              },
              {
                n: 13,
                text: "İki kız kardeşi nikahınız altında birleştirmeniz haramdır. (Eskiden yapılanlar geçmiştir)",
                bg: WHITE_BG,
                color: WHITE_BORDER,
                textColor: WHITE_TEXT,
              },
              {
                n: 14,
                text: "Muhakkak Allah, hataları affedicidir ve çok merhametlidir.",
                bg: CLOSING_BG,
                color: CLOSING_BORDER,
                textColor: RED_TEXT,
              },
            ],
            corners: "soft",
          },
          "NOT: 11. cümlenin devamı şöyledir: “Eşlerinizin kızları: Zifafa girdiğiniz eşlerinizin kızlarını yani evinizde bulunan üvey kızlarınızı nikahlamanız haramdır. Ancak zifafa girmediğiniz eşlerinizin kızlarını nikahlayabilirsiniz.”",
          "Yukarıdaki sistemi iyi anlamak ve zevkine varabilmek için tam ortasından aşağıdan yukarıya ve sağdan sola katlayarak simetrik durumları ve ne kadar uygun olduklarını görünüz. Kur’an’ın kelimelerine varıncaya kadar incelen fakat kopmayan diziliş mucizesini görüp, Rabbim Sen’in Kitabın da yarattığın her varlık kadar mucizedir. Sen’i tesbih ile hamdederiz diyelim.",
          {
            capsules: [
              {
                n: 4,
                text: "Halalarınızı,",
                bg: GREEN_BG,
                color: GREEN_BORDER,
                textColor: GREEN_TEXT,
              },
              {
                n: 5,
                text: "Teyzelerinizi,",
                bg: GREEN_BG,
                color: GREEN_BORDER,
                textColor: GREEN_TEXT,
              },
              {
                n: 6,
                text: "Erkek kardeşlerin kızlarını,",
                bg: BLUE_BG,
                color: BLUE_BORDER,
                textColor: BLUE_TEXT,
              },
              {
                n: 7,
                text: "Kız kardeşlerin kızlarını,",
                bg: BLUE_BG,
                color: BLUE_BORDER,
                textColor: BLUE_TEXT,
              },
            ],
            columns: 2,
            corners: "soft",
          },
          "Bu yukardaki dörtlü bölümü ortasından, sağdan sola ve sonra da yukarıdan aşağıya katlayınız. Kelimelerin sıralanışındaki güzelliği görünüz. Hikmetlerini kavramaya çalışınız.",
          "Ben örnek olarak bazı kelimelere dikkatinizi çekeyim:",
          {
            capsules: [
              {
                n: 2,
                text: "Kendi kızlarınızı",
                bg: PINK_BG,
                color: PINK_BORDER,
                textColor: PINK_TEXT,
              },
              {
                n: 3,
                text: "Kendi kız kardeşlerinizi",
                bg: PINK_BG,
                color: PINK_BORDER,
                textColor: PINK_TEXT,
              },
            ],
            corners: "soft",
          },
          "Kendi kızları ile kendi kız kardeşleri insana hemen hemen eşit yakınlıktadır ve nasıl kızlarınızla nikahlanmak haramsa, kız kardeşlerinizle nikahlanmak da öyle haramdır.",
          "Şimdi bu iki kelimelerin alt simetriği olan şu kelimelere bakınız:",
          {
            capsules: [
              {
                n: 2,
                text: "Kendi kızlarınızı,",
                bg: PINK_BG,
                color: PINK_BORDER,
                textColor: PINK_TEXT,
              },
              {
                n: 3,
                text: "Kendi kız kardeşlerinizi,",
                bg: PINK_BG,
                color: PINK_BORDER,
                textColor: PINK_TEXT,
              },
              {
                n: 12,
                text: "Kendi öz oğullarınızın hanımlarını,",
                bg: WHITE_BG,
                color: WHITE_BORDER,
                textColor: WHITE_TEXT,
              },
              {
                n: 13,
                text: "İki kız kardeşi nikahınız altında birleştirmeniz haramdır.",
                bg: WHITE_BG,
                color: WHITE_BORDER,
                textColor: WHITE_TEXT,
              },
            ],
            corners: "soft",
          },
          "Kelimelerin böyle simetrik dizilişi bize sanki şöyle diyor: “Kendi kızlarınız sizin için ne ise, kendi öz oğullarınızın hanımları da sizin için odur. Yani onlar da sizin kızınız sayılır. Kendi kız kardeşleriniz ne ise, baldızınız da öyledir. O da sizin kız kardeşiniz sayılır. İki kız kardeşi birden nikahınıza alamazsınız.”",
          "Siz de kelimelerin sistemdeki yerlerine bakarak buna benzer anlamları yakalayabilirsiniz. Burada şunu da açıkça görüyoruz ki böyle bir dizilişi insanlar toplansalar yapamazlar. Sistemdeki bir kelimenin bile yerini değiştiremezler.",
          "Kaldı ki bu ayet ikili simetrik sistem içinde daha büyük bir bölümün parçasıdır. O bölüm de daha büyük bir bölümün parçasıdır. Böylece gidiyor.",
        ],
      },
    },
  },

  animations: {
    // Four creases, one per band boundary between chunk 1 and chunk 14:
    //   fold0 — between chunk 1 and the pink pair
    //   fold1 — between the pink pair and the green row
    //   fold2 — between the green row and the blue row
    //   fold3 — between the blue row and the white pair
    //   fold4 — between the white pair and chunk 14
    //
    // Blocks 4 and 5 (the band's left half) share blocks 2 and 3's Y exactly,
    // so the middle two creases are read off the RIGHT half alone.
    computeFoldYPositions: (lm) => {
      const y = lm.groupYPositions;
      const h = lm.groupHeights;
      const mid = (a: number, b: number) => (y[a] - h[a] + y[b]) / 2;
      return [mid(0, 1) + 0.035, mid(1, 2), mid(2, 3), mid(3, 6), mid(6, 7)];
    },

    // Each step's angleFactors sum to zero across the creases it closes, so
    // the panels it tucks stand exactly perpendicular to the page (invisible
    // edge-on) and every panel after them lands back in plane. Same 0.5 /
    // 1.05 / 0.55 triple the other single-ayah pages use, extended to four
    // bands.
    foldSteps: [
      {
        // Only the two YELLOW chunks face the reader: 1 at the top, 14 folded
        // up right underneath it. Pink, green, blue and white all stand on
        // edge between them.
        id: "pre-start",
        folds: [
          { direction: 1, angleFactor: 0.5 }, // fold0
          { direction: -1, angleFactor: 1 }, // fold1
          { direction: -1, angleFactor: 1 }, // fold2
          { direction: 1, angleFactor: 1 }, // fold3
          { direction: 1, angleFactor: 0.5 }, // fold4
        ],
      },
      {
        // GREEN row joins it — the whole middle band is now readable.
        id: "green",
        folds: [
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 1.05 },
          { direction: 1, angleFactor: 0.55 },
          { direction: -1, angleFactor: 0 },
        ],
      },

      {
        id: "end",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
        ],
      },
    ] as const,

    scrollTimeline: {
      intro: { start: 0, end: 10 },
      ambient: { start: 10, end: 40 },
      handoff: { start: 40, end: 55 },
      story: { start: 55, end: 100 },
    },

    scrollLock: {
      lockPositionPercentage: 0.55,
      effortRequired: 2500,
      grabRangePixels: 50,
    },
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — Arabic (canonical). colorGroups order MUST match blocks order,
// and verses[] order inside each group MUST match that block's verseIds.
//
// Arabic reads right→left, so within a pair the LOWER chunk number sits in the
// RIGHT column (index 1) and the higher one on the left (index 0) — and the
// 4–7 group takes the RIGHT half of the middle band, 8–11 the left.
// ---------------------------------------------------------------------------

export const NISA_23_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      // 0 — chunk 1. No opener line in Arabic: the ayah says it inside the
      // chunk itself (حُرِّمَتْ عَلَيْكُمْ), which is why `topLabel` is empty here
      // and the chunk-1 wrapper overlay is skipped in this language.
      {
        topLabel: "",
        verses: [{ number: 1, text: "حُرِّمَتْ عَلَيْكُمْ أُمَّهَاتُكُمْ" }],
      },
      // 1 — pink pair [left = 3, right = 2]
      {
        verses: [
          { number: 3, text: "وَأَخَوَاتُكُمْ" },
          { number: 2, text: "وَبَنَاتُكُمْ" },
        ],
      },
      // 2 — RIGHT half, upper row [left = 5, right = 4]
      {
        verses: [
          { number: 5, text: "وَخَالَاتُكُمْ" },
          { number: 4, text: "وَعَمَّاتُكُمْ" },
        ],
      },
      // 3 — RIGHT half, lower row [left = 7, right = 6]
      {
        verses: [
          { number: 7, text: "وَبَنَاتُ\nالْأُخْتِ" },
          { number: 6, text: "وَبَنَاتُ\nالْأَخِ" },
        ],
      },
      // 4 — LEFT half, upper row [left = 9, right = 8]
      {
        verses: [
          { number: 9, text: "وَأَخَوَاتُكُم\nمِّنَ الرَّضَاعَةِ" },
          { number: 8, text: "وَأُمَّهَاتُكُمُ\nاللَّاتِي أَرْضَعْنَكُمْ" },
        ],
      },
      // 5 — LEFT half, lower row [left = 11, right = 10]
      {
        verses: [
          {
            number: 11,
            text: "وَرَبَائِبُكُمُ\n*اللَّاتِي فِي حُجُورِكُمْ\u200F...\u200F",
          },
          { number: 10, text: "وَأُمَّهَاتُ\nنِسَائِكُمْ" },
        ],
      },
      // 6 — white pair [left = 13, right = 12]
      {
        verses: [
          {
            number: 13,
            text: "وَأَن تَجْمَعُوا بَيْنَ\nالْأُخْتَيْنِ مَا قَدْ سَلَفَ",
          },
          {
            number: 12,
            text: "وَحَلَائِلُ أَبْنَائِكُمُ\nالَّذِينَ مِنْ أَصْلَابِكُمْ",
          },
        ],
      },
      // 7 — chunk 14
      {
        verses: [
          { number: 14, text: "إِنَّ اللَّهَ كَانَ غَفُورًا رَّحِيمًا" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — Turkish. Same nine groups in the same order, but every pair is
// mirrored (LTR reads the LOWER chunk number first, so it goes in the LEFT
// column) and the 4–7 group moves to the LEFT half of the middle band.
//
// Group 0's `topLabel` carries the shared opener the reference page prints
// above chunk 1 — the line Arabic keeps inside the chunk.
// ---------------------------------------------------------------------------

export const NISA_23_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        topLabel: "Şunları nikahlamanız size haram kılındı;",
        verses: [{ number: 1, text: "Öz annenizi," }],
      },
      // 1 — pink pair [left = 2, right = 3]
      {
        verses: [
          { number: 2, text: "Kendi kızlarınızı," },
          { number: 3, text: "Kendi kız kardeşlerinizi," },
        ],
      },
      // 2 — RIGHT half, upper row → chunks 8, 9
      {
        verses: [
          { number: 8, text: "Süt\nannelerinizi," },
          { number: 9, text: "Süt kız\nkardeşlerinizi," },
        ],
      },
      // 3 — RIGHT half, lower row → chunks 10, 11
      {
        verses: [
          { number: 10, text: "Eşlerinizin\nannelerini," },
          { number: 11, text: "Eşlerinizin\nkızlarını,(NOT)" },
        ],
      },
      // 4 — LEFT half, upper row → chunks 4, 5
      {
        verses: [
          { number: 4, text: "Halalarınızı," },
          { number: 5, text: "Teyzelerinizi," },
        ],
      },
      // 5 — LEFT half, lower row → chunks 6, 7
      {
        verses: [
          { number: 6, text: "Erkek\nkardeşlerin\nkızlarını," },
          { number: 7, text: "Kız kardeşlerin\nkızlarını," },
        ],
      },
      // 6 — white pair [left = 12, right = 13]
      {
        verses: [
          { number: 12, text: "Kendi öz oğullarınızın\nhanımlarını," },
          {
            number: 13,
            text: "İki kız kardeşi nikahınız altında birleştirmeniz haramdır.\n(Eskiden yapılanlar geçmiştir)",
          },
        ],
      },
      {
        verses: [
          {
            number: 14,
            text: "Muhakkak Allah, hataları affedicidir\nve çok merhametlidir.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — English. Mirrored exactly like the Turkish set.
// ---------------------------------------------------------------------------

export const NISA_23_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        topLabel: "Forbidden to you in marriage are:",
        verses: [{ number: 1, text: "your own mothers," }],
      },
      {
        verses: [
          { number: 2, text: "your own daughters," },
          { number: 3, text: "your own sisters," },
        ],
      },
      // 2 — RIGHT half, upper row → chunks 8, 9
      {
        verses: [
          { number: 8, text: "the mothers\nwho nursed you," },
          { number: 9, text: "your milk\nsisters," },
        ],
      },
      // 3 — RIGHT half, lower row → chunks 10, 11
      {
        verses: [
          { number: 10, text: "your wives'\nmothers," },
          { number: 11, text: "your wives'\ndaughters," },
        ],
      },
      // 4 — LEFT half, upper row → chunks 4, 5
      {
        verses: [
          { number: 4, text: "your paternal\naunts," },
          { number: 5, text: "your maternal\naunts," },
        ],
      },
      // 5 — LEFT half, lower row → chunks 6, 7
      {
        verses: [
          { number: 6, text: "your brothers'\ndaughters," },
          { number: 7, text: "your sisters'\ndaughters," },
        ],
      },
      {
        verses: [
          { number: 12, text: "the wives of your\nown sons," },
          {
            number: 13,
            text: "and to take two sisters together in marriage.\n(What has already passed is forgiven)",
          },
        ],
      },
      {
        verses: [
          {
            // Broken onto two lines like the Turkish, so the line does not run
            // the full width of the capsule and under the stacked 14 / 23 badge
            // on its left edge.
            number: 14,
            text: "Indeed Allah is Ever-Forgiving,\nMost Merciful.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const NISA_23_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: NISA_23_TEXT_AR,
  en: NISA_23_TEXT_EN,
  tr: NISA_23_TEXT_TR,
};
