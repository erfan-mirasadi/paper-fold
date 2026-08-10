/**
 * YÂSÎN: 1-12 — the opening twelve ayahs in eleven capsules, three sections.
 *
 *      ╭───────── all-section frame ─────────╮
 *      │            ┌─── (1) ───┐             │   ayahs 1 · 2
 *      │       ┌─ (3) ─┬─ (2) ─┐              │   ayahs 4 · 3
 *      │        ┌────── (4) ──────┐           │   ayahs 5 · 6
 *      ╰─────────────────────────────────────╯
 *
 *   ╔═════════════ outer ring ═════════════╗
 *   ║  ┌──────────── (5) ───────────┐       ║   ayah 7
 *   ║ ╔══════════ middle ring ════╗         ║
 *   ║ ║  ┌───────── (6) ───────┐   ║        ║   ayah 8
 *   ║ ║ ╔═══════ inner ring ══╗    ║        ║
 *   ║ ║ ║  ┌───── (7) ─────┐   ║   ║        ║   ayah 9, the two barriers
 *   ║ ║ ║  └──── (8) ─────┘    ║   ║        ║   ayah 9, the veil
 *   ║ ║ ╚════════════════════╝     ║        ║
 *   ║ ║  └───────── (9) ──────┘    ║        ║   ayah 10
 *   ║ ╚═════════════════════════╝            ║
 *   ║  └──────────── (10) ──────────┘        ║   ayah 11
 *   ╚═══════════════════════════════════════╝
 *
 *        ╭──── mandorla: teal ▷ maroon ▷ card ────╮
 *        │             (11)          ۱۲            │   ayah 12
 *        ╰───────────────────────────────────────╯
 *
 * THE RING IS THE POINT. Ayahs 7 … 11 are a chiasm and the page draws it as an
 * onion: 7 pairs with 11 (who will not believe / whom you can warn), 8 pairs
 * with 10 (shackled necks / warning makes no difference), and ayah 9 sits alone
 * at the centre. Ayah 12 is not another layer of the onion, which is why it gets
 * a shape of its own: it answers the whole thing.
 *
 * HOW TWELVE AYAHS LAND IN ELEVEN CAPSULES. One capsule per ayah through the
 * middle and bottom; the opening merges two pairs and the centre splits one
 * ayah, and both seams are grammatical, not convenience:
 *
 *   capsule  ayah(s)  badge   why it is one capsule
 *    1        1 · 2     ٢     the oath: "Yâ Sîn — by the wise Qur'an"
 *    2        3         ٣
 *    3        4         ٤
 *    4        5 · 6     ٦     one sentence: "a revelation … so that you warn"
 *    5        7         ٧
 *    6        8         ٨
 *    7        9a       (—)    the two barriers, front and behind
 *    8        9b        ٩     "so We covered them; they cannot see"
 *    9        10        ١٠
 *   10        11        ١١
 *   11        12        ١٢    all three of its clauses, over three lines
 *
 * A capsule's badge is the number of the LAST ayah it carries, the way a mushaf
 * marks the end of the text in front of you. `hideVerseNumbers` is on and each
 * badge opts back in via `showNumber` + `displayNumber`; capsule 7 is mid-ayah
 * and bare. The capsule ids are NOT the numbers drawn on the page.
 *
 * GEOMETRY IS SOLVED, NOT EYEBALLED. Every `svgOverlays` offsetY is
 * `(wanted frame centre) − (anchor block's frameY)`, from the stack table above
 * `blocks`. Horizontally, `sectionInnerW` is 1.13, so a capsule's width is
 * `0.547 − horizontalInset`, and each frame's corner radius caps how wide its
 * capsules may be — see the fit arithmetic in /public/yasin/ring-outer.svg.
 *
 * TEXT SCALES. Base font is `0.071 × 1.05 × verseTextScale` = 0.0425 world.
 *     width  ≈ 0.153 × (words per line) × override  ≤  capsule width
 *     height ≈ 0.0578 × (lines)         × override  ≤  capsule height
 * Overshooting either does not look big — CanvasText gets a canvas the size of
 * the capsule, so text that does not fit is re-wrapped and then CLIPPED.
 */

import type { SurahLayoutConfig } from "../../../schema";
import type { SurahDataShape } from "../../../SurahConfig";
import type { SurahLanguage } from "../../../../hooks/useSurahLanguageStore";
import { GREEN_THEME } from "../../../theme";

// ---------------------------------------------------------------------------
// COLOR PALETTE — Tevbe 24's, not the reference photo's. The photo paints in
// watercolour; this app's idiom is the shared gold gradient on frames and
// Tevbe's pale grounds with colored rules on capsules. Pairing rule: a capsule
// never shares its ground with the frame it sits on.
//   outer ring   cream frame     ->  WHITE_BG capsules  (ayahs 7 · 11)
//   middle ring  lavender frame  ->  CREAM_BG capsules  (ayahs 8 · 10)
//   inner ring   blue frame      ->  WHITE_BG capsules  (ayah 9)
// ---------------------------------------------------------------------------

const CREAM_BG = "#F3EAD6";
const GOLD_BORDER = "#D0A24E";
const LAV_BG = "#E1E3F3";
const LAV_BORDER = "#8E93C8";
const DOME_BG = "#F5EEDC";
const DOME_BORDER = "#D0A24E";
const WHITE_BG = "#FBFAF4";
const WHITE_BORDER = "#C7C1AC";
const MAROON_BG = "#F6EDE8";
const MAROON_BORDER = "#B0504D";

const INK = "#2C2A22";
const INK_GOLD = "#5A3D12";
const INK_LAV = "#26283F";
const INK_PURPLE = "#634E73";
const INK_RED = "#A30000";

// EVERY capsule is `isPill: false`, as in tevbe24Config. Not cosmetic: SharedUI
// picks the verse font as `isPill ? VERSE_TEXT_SMALL (0.038) : VERSE_TEXT_BIG
// (0.071)`, so mixing the flag on one page puts its capsules on two baselines
// almost 2x apart and no per-capsule override reconciles them. The rounded look
// comes from `styling.verseRadius`.
const capsule = (
  bg: string,
  border: string,
  textColor: string,
  extra: Record<string, unknown> = {},
) => ({
  bg,
  border,
  circleBg: bg,
  circleBorderCol: border,
  circleTextCol: textColor,
  textColor,
  isPill: false,
  ...extra,
});

export const YASIN_36_CONFIG: SurahLayoutConfig = {
  id: "yasin36",
  title: "YÂSÎN: 1-12",
  heroTitle: "Yâsîn",
  heroSubtitle: "suresi 1-12",

  scriptInfo: { title: "36 Yâ-Sîn", sayfa: 440, juz: 22, hizb: 44 },

  scriptHighlights: {
    "pre-start": [1, 2, 3, 4, 5, 10, 11],
    end: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: false,
    hideVerseNumbers: true,
  },

  dimensions: {
    paperWidth: 1.54,
    paperHeight: 2.03,
    // +0.02 (others sit at −0.045): the mandorla's lower tip runs past its
    // capsule, so the stack is lifted to buy that tip a margin.
    sceneCenterYOffset: 0.02,
    // 0.20, not 0.29 → sectionW 1.14, sectionInnerW 1.13. The outer ring is
    // 1.01 wide and the mandorla 1.16; at 0.29 neither would fit.
    padding: 0.2,
    scrollPages: 3,
    fixedWidthAcrossLanguages: true,
  },

  specialVerses: {},

  verseOverrides: {
    // ── SECTION 1 — ayahs 1 … 6, ONE CAPSULE EACH ────────────────────────
    // The letters stand alone above the cloud (id 1), the oath opens it (12),
    // ayahs 3 · 4 are its widest line, ayah 5 closes it (4), and the warning
    // that follows (13) sits under it.
    1: capsule(CREAM_BG, GOLD_BORDER, INK_GOLD, {
      circleTextCol: "#7A5A18",
      textScaleOverride: 0.95,
      translationTextScaleOverride: 0.7,
      showNumber: true,
      displayNumber: 1,
    }),
    12: capsule(CREAM_BG, GOLD_BORDER, INK_GOLD, {
      circleTextCol: "#7A5A18",
      textScaleOverride: 0.8,
      translationTextScaleOverride: 0.56,
      showNumber: true,
      displayNumber: 2,
    }),
    2: capsule(WHITE_BG, WHITE_BORDER, INK, {
      circleTextCol: "#4A4636",
      textScaleOverride: 0.86,
      translationTextScaleOverride: 0.6,
      showNumber: true,
      displayNumber: 3,
    }),
    // The photo rules this one in dark red — the only red rule in the opening
    // section, and it lands on "a straight path".
    3: capsule(MAROON_BG, MAROON_BORDER, INK_RED, {
      circleTextCol: "#7C2C2A",
      textScaleOverride: 0.86,
      translationTextScaleOverride: 0.6,
      showNumber: true,
      displayNumber: 4,
    }),
    4: capsule(LAV_BG, LAV_BORDER, INK_LAV, {
      // One line in a 0.500-wide capsule, the cloud's closing line.
      textScaleOverride: 0.8,
      translationTextScaleOverride: 0.5,
      showNumber: true,
      displayNumber: 5,
    }),
    13: capsule(WHITE_BG, LAV_BORDER, INK_LAV, {
      // The long warning, on its own bar under the cloud.
      textScaleOverride: 0.7,
      translationTextScaleOverride: 0.46,
      showNumber: true,
      displayNumber: 6,
    }),

    // ── OUTER RING (cream frame) — ayahs 7 and 11 ────────────────────────
    5: capsule(WHITE_BG, GOLD_BORDER, INK_GOLD, {
      // Eight words on ONE line in 0.84 — the widest single line on the page.
      textScaleOverride: 0.66,
      translationTextScaleOverride: 0.46,
      showNumber: true,
      displayNumber: 7,
    }),
    10: capsule(WHITE_BG, GOLD_BORDER, GREEN_THEME, {
      // The longest text on the page: eleven words over two lines. It gets the
      // tallest ring capsule (0.110) to pay for that.
      textScaleOverride: 0.86,
      translationTextScaleOverride: 0.56,
      showNumber: true,
      displayNumber: 11,
    }),

    // ── MIDDLE RING (lavender frame) — ayahs 8 and 10 ────────────────────
    // Both two-liners in a 0.100 capsule, so both height-bound, same trim.
    6: capsule(CREAM_BG, LAV_BORDER, INK_LAV, {
      textScaleOverride: 0.8,
      translationTextScaleOverride: 0.54,
      showNumber: true,
      displayNumber: 8,
    }),
    9: capsule(CREAM_BG, LAV_BORDER, INK_LAV, {
      textScaleOverride: 0.8,
      translationTextScaleOverride: 0.54,
      showNumber: true,
      displayNumber: 10,
    }),

    // ── INNER RING (blue frame) — the centre, ayah 9 ─────────────────────
    // Ayah 9 is the crux, so its closing clause takes Tevbe's red the way
    // Tevbe's own ana bölüm does, and the barriers take its purple.
    7: capsule(WHITE_BG, WHITE_BORDER, INK_PURPLE, {
      textScaleOverride: 0.76,
      translationTextScaleOverride: 0.52,
    }),
    8: capsule(WHITE_BG, WHITE_BORDER, INK_RED, {
      textScaleOverride: 0.9,
      translationTextScaleOverride: 0.6,
      showNumber: true,
      displayNumber: 9,
    }),

    // ── MANDORLA (cream card on a maroon lens) — ayah 12 ─────────────────
    // One capsule for the whole ayah, three lines, on the tallest capsule
    // (0.150). Three lines is what makes this height-bound.
    11: capsule(WHITE_BG, MAROON_BORDER, INK_RED, {
      textScaleOverride: 0.64,
      translationTextScaleOverride: 0.44,
      showNumber: true,
      displayNumber: 12,
    }),
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
      maroonTheme: LAV_BORDER,
      greenTheme: DOME_BORDER,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: CREAM_BG,
      s2Group1Bg: DOME_BG,
      s2Group2Bg: LAV_BG,
      s2Group3Bg: WHITE_BG,
      // No side brackets — the rings do that job. One fully transparent entry
      // makes SideCurves emit nothing (an empty [] would fall back to the
      // default olive bracket on every isCenter block, and all are centered).
      curveColors: [{ color: "transparent", fillColor: "transparent" }],
    },
    capsuleBorderWidth: 0.0038,
    circleBorderWidth: 0.003,
    // Near a stadium on the short capsules. This, not `isPill`, is where the
    // photo's rounded capsules come from.
    verseRadius: 0.042,
    oppositeVerseConnectorRadius: 0.04,
    elevatedSectionRadii: {
      base: 0.036,
      outer: 0.024,
      innerA: 0.022,
      innerB: 0.02,
    },
  },

  globalSettings: {
    capsuleHeight: 0.09,
    columnGap: 0.02,
    rowGap: 0.014,
    blockGap: 0.012,
    sectionPadX: 0.005,
    blockPadding: 0.008,
    sectionBorderWidth: 0.006,
    // Every capsule is non-pill, so the base is VERSE_TEXT_BIG (0.071) x the
    // Arabic 1.05, and 0.57 is that scaled to THIS page's capsule heights:
    //     Tevbe  0.071 x 1.05 x 0.80 = 0.060 in a 0.12  capsule  (50%)
    //     here   0.071 x 1.05 x 0.57 = 0.043 in a 0.086 capsule  (50%)
    // Every override multiplies this — move it and the whole page moves.
    verseTextScale: 0.57,
    // 0.625 of the Arabic, the ratio Tevbe uses (0.50 / 0.80).
    translationVerseTextScale: 0.36,
    tightVersePadding: true,
  },

  handwrittenNotes: [
    {
      x: 1.33,
      y: -0.24,
      fontSize: 0.03,
      color: "#000000",
      lineSpacing: 1.3,
      maxWidth: 0.38,
      textAlign: "center",
      rotationZ: 0.04,
      lines: [{ text: "Giriş" }, { text: "(1-6. ayet)", scale: 0.82 }],
      svgs: [
        {
          src: "/ahzab/arrows.svg",
          anchor: "end",
          offsetX: -0.02,
          offsetY: -0.07,
          scaleX: 0.07,
          scaleY: 0.07,
          rotationZ: Math.PI * 0.22,
        },
      ],
    },
    {
      x: 0.2,
      y: -0.68,
      fontSize: 0.03,
      color: "#000000",
      lineSpacing: 1.3,
      maxWidth: 0.36,
      textAlign: "center",
      rotationZ: -0.04,
      lines: [{ text: "Ana Bölüm" }, { text: "(7-11. ayet)", scale: 0.82 }],
      svgs: [
        {
          src: "/ahzab/arrows.svg",
          anchor: "end",
          offsetX: 0.02,
          offsetY: -0.07,
          scaleX: -0.07,
          scaleY: 0.07,
          rotationZ: -Math.PI * 0.22,
        },
      ],
    },
    {
      x: 1.33,
      y: -1.46,
      fontSize: 0.03,
      color: "#000000",
      lineSpacing: 1.3,
      maxWidth: 0.38,
      textAlign: "center",
      rotationZ: 0.04,
      lines: [{ text: "Cevap" }, { text: "(12. ayet)", scale: 0.82 }],
      svgs: [
        {
          src: "/ahzab/arrows.svg",
          anchor: "end",
          offsetX: -0.02,
          offsetY: -0.07,
          scaleX: 0.07,
          scaleY: 0.07,
          rotationZ: Math.PI * 0.28,
        },
      ],
    },
  ],

  // ── BLOCKS ───────────────────────────────────────────────────────────────
  // The solved stack (paperHeight 1.78, sceneCenterYOffset 0.02):
  //   totalContentH 1.467, contentStartY −0.1365, content bottom −1.6035
  //
  //   idx  block        H       frameY    capsule w   lines
  //    0   s1_oath     0.098   −0.1365      0.460      1
  //    1   s1_row      0.098   −0.2445      0.420 ×2   1     (row 0.862)
  //    2   s1_tenzil   0.116   −0.3525      0.900      2
  //    3   r_a7        0.102   −0.5435      0.840      1
  //    4   r_a8        0.116   −0.6595      0.720      2
  //    5   r_a9a       0.110   −0.7895      0.580      2
  //    6   r_a9b       0.096   −0.9115      0.580      1
  //    7   r_a10       0.116   −1.0215      0.720      2
  //    8   r_a11       0.126   −1.1515      0.840      2
  //    9   leaf_a12    0.166   −1.4375      0.520      3
  //
  // Block height is `2·blockPadding + capsuleHeight` (one row each); each frameY
  // is the previous block's bottom minus this block's gapBefore. The two big
  // gapBefores (0.075 on block 3, 0.160 on block 9) are the air between the
  // three sections — 0.160 because the mandorla's upper tip reaches 0.135 above
  // its own capsule and must still clear the outer ring's bottom edge.
  blocks: [
    // The two letters, alone in their own panel above the cloud.
    {
      id: "s1_yasin",
      type: "group",
      verseIds: [1],
      columns: 1,
      capsuleHeight: 0.082,
      horizontalInset: 0.247,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      customSectionId: "sec_letters",
    },
    // The oath — the cloud's first line, and narrow, so the cloud tapers.
    {
      id: "s1_oath",
      type: "group",
      verseIds: [12],
      columns: 1,
      capsuleHeight: 0.082,
      horizontalInset: 0.047,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.03,
      customSectionId: "sec_top",
    },
    // Ayahs 4 · 3, the cloud's widest line. RTL: ayah 3 reads first, so it
    // takes the RIGHT column — which is verseIds[1], not [0].
    {
      id: "s1_row",
      type: "group",
      verseIds: [3, 2],
      columns: 2,
      capsuleHeight: 0.082,
      horizontalInset: 0.127,
      columnGap: 0.022,
      isCenter: true,
      dragBehavior: "group",
      hideRowConnectors: true,
      gapBefore: 0.01,
      customSectionId: "sec_top",
    },
    // Ayah 5 closes the cloud, as narrow as the line that opened it.
    {
      id: "s1_tenzil",
      type: "group",
      verseIds: [4],
      columns: 1,
      capsuleHeight: 0.082,
      horizontalInset: 0.047,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.01,
      customSectionId: "sec_top",
    },
    // Ayah 6 — outside the cloud, on a bar of its own.
    {
      id: "s1_uyari",
      type: "group",
      verseIds: [13],
      columns: 1,
      capsuleHeight: 0.086,
      horizontalInset: -0.313,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.03,
    },
    {
      id: "r_a7",
      type: "group",
      verseIds: [5],
      columns: 1,
      capsuleHeight: 0.086,
      horizontalInset: -0.293,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.09,
    },
    {
      id: "r_a8",
      type: "group",
      verseIds: [6],
      columns: 1,
      capsuleHeight: 0.1,
      horizontalInset: -0.173,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.012,
    },
    {
      id: "r_a9a",
      type: "group",
      verseIds: [7],
      columns: 1,
      capsuleHeight: 0.094,
      horizontalInset: -0.033,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.012,
    },
    {
      id: "r_a9b",
      type: "group",
      verseIds: [8],
      columns: 1,
      capsuleHeight: 0.08,
      horizontalInset: -0.033,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.012,
    },
    {
      id: "r_a10",
      type: "group",
      verseIds: [9],
      columns: 1,
      capsuleHeight: 0.1,
      horizontalInset: -0.173,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.012,
    },
    {
      id: "r_a11",
      type: "group",
      verseIds: [10],
      columns: 1,
      capsuleHeight: 0.11,
      horizontalInset: -0.293,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.012,
    },
    // Ayah 12 whole, three lines on the lens's cream card. The card is 0.544
    // wide and 0.240 tall, so this capsule (0.520 × 0.150) clears its cream by
    // 0.012 a side and 0.045 top and bottom.
    {
      id: "leaf_a12",
      type: "group",
      verseIds: [11],
      columns: 1,
      capsuleHeight: 0.15,
      horizontalInset: 0.027,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.16,
      customSectionId: "sec_leaf",
    },
  ],

  // ── Drag / elevation zones ───────────────────────────────────────────────
  // One per shape drawn, INNERMOST FIRST: sectionResolver's reverse index is
  // first-wins, so each capsule lands in the tightest shape around it and an
  // outer zone owns only what no inner zone claimed — while still dragging the
  // inner ones with it, via the ancestor index. `sec_top` and `sec_leaf` are
  // declared on their blocks since each is one contiguous run.
  customSections: [
    {
      id: "sec_ring3",
      verseIds: [7, 8],
      cameraTarget: { y: 1.05, fov: 26, tilt: -1.4 },
    },
    {
      id: "sec_ring2",
      verseIds: [6, 7, 8, 9],
      cameraTarget: { y: 1.15, fov: 29, tilt: -1.4 },
    },
    {
      id: "sec_ring1",
      verseIds: [5, 6, 7, 8, 9, 10],
      cameraTarget: { y: 1.25, fov: 32, tilt: -1.4 },
    },
    {
      id: "sec_leaf",
      verseIds: [11],
      cameraTarget: { y: 1.1, fov: 28, tilt: -1.4 },
    },
    {
      id: "sec_letters",
      verseIds: [1],
      cameraTarget: { y: 0.95, fov: 24, tilt: -1.4 },
    },
    {
      id: "sec_top",
      verseIds: [12, 2, 3, 4],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.4 },
    },
  ],

  // ── SVG SECTIONS ─────────────────────────────────────────────────────────
  // Every file is drawn flush with its plane and at the aspect it is displayed
  // at, so a frame's on-screen size IS (scaleX, scaleY) and its centre is the
  // plane centre — which is what each offsetY solves for:
  //     offsetY = (wanted frame centre) − (anchor block's frameY)
  // The three rings MUST keep renderOrder 3 < 4 < 5: each paints over the middle
  // of the one below it, and that overpainting is what turns three filled
  // rectangles into three visible bands.
  svgOverlays: [
    // The letters' panel — block 0 alone. Centred on that block: 0.098 tall,
    // 0.021 of air above and below it.
    // {
    //   src: "/yasin/letter-panel.svg",
    //   anchorGroupIndex: 0,
    //   anchorEdge: "top",
    //   scaleX: 0.42,
    //   scaleY: 0.14,
    //   offsetX: 0,
    //   offsetY: -0.049,
    //   renderOrder: 2,
    //   customSectionId: "sec_letters",
    // },
    // The cloud — blocks 1 … 3 (ayahs 2 … 5), 0.314 of stack inside a 0.52
    // plane: the lobes stand on the body's edge and eat 0.083 top and bottom,
    // so the band left for capsules is 0.354. Centre is the stack's centre.
    // {
    //   src: "/yasin/cloud.svg",
    //   anchorGroupIndex: 1,
    //   anchorEdge: "top",
    //   scaleX: 1.06,
    //   scaleY: 0.52,
    //   offsetX: 0,
    //   offsetY: -0.157,
    //   renderOrder: 2,
    //   customSectionId: "sec_top",
    // },
    // Outer ring — blocks 3 … 8 (ayahs 7 … 11).
    //   wanted: 1.01 x 0.798, y −0.5095 … −1.3075  (centre −0.9085)
    {
      src: "/yasin/ring-outer.svg",
      anchorGroupIndex: 5,
      anchorEdge: "top",
      scaleX: 1.01,
      scaleY: 0.798,
      offsetX: 0,
      offsetY: -0.365,
      renderOrder: 3,
      customSectionId: "sec_ring1",
    },
    // Middle ring — blocks 4 … 7 (ayahs 8 … 10).
    //   wanted: 0.86 x 0.534, y −0.6295 … −1.1635  (centre −0.8965)
    {
      src: "/yasin/ring-mid.svg",
      anchorGroupIndex: 6,
      anchorEdge: "top",
      scaleX: 0.86,
      scaleY: 0.534,
      offsetX: 0,
      offsetY: -0.237,
      renderOrder: 4,
      customSectionId: "sec_ring2",
    },
    // Inner ring — blocks 5 … 6 (ayah 9). The three centres land within 0.012
    // of each other (−0.9085 / −0.8965 / −0.8975), which is what makes the set
    // read as concentric.
    //   wanted: 0.70 x 0.268, y −0.7635 … −1.0315  (centre −0.8975)
    {
      src: "/yasin/ring-inner.svg",
      anchorGroupIndex: 7,
      anchorEdge: "top",
      scaleX: 0.7,
      scaleY: 0.268,
      offsetX: 0,
      offsetY: -0.108,
      renderOrder: 5,
      customSectionId: "sec_ring3",
    },
    // Mandorla — block 9 (ayah 12). Centred on the CAPSULE (−1.4455 … −1.5955,
    // centre −1.5205), not on the block frame: the lens's cream card is sized to
    // the text, so a pad measured off block padding would drift.
    //   wanted: 1.16 x 0.400, y −1.3205 … −1.7205
    {
      src: "/yasin/leaf.svg",
      anchorGroupIndex: 11,
      anchorEdge: "top",
      scaleX: 1.16,
      scaleY: 0.4,
      offsetX: 0,
      offsetY: -0.083,
      renderOrder: 3,
      customSectionId: "sec_leaf",
    },
  ],

  sideInfo: {
    panelTitle: "Tefsir",
    byFoldStep: {
      "pre-start": {
        kicker: "YÂSÎN: 1-12",
        paragraphs: [
          "Yâsîn suresi, Kur'an-ı Kerim'in kalbi diye anılır. Bu sayfada onun ilk on iki ayetini görüyorsunuz. Ayetler alt alta sıralanmış değil; bir sistem içinde, iç içe halkalar hâlinde dizilmiştir. Bu diziliş sonradan uydurulmuş bir şema değil, ayetlerin kendi anlamlarının çizdiği şekildir.",
          "Sayfa üç bölümden oluşuyor. En üstte bir giriş çerçevesi var: 1-6. ayetler. Ortada birbirinin içine geçmiş üç halka var: 7-11. ayetler. En altta ise bir badem şekli var: 12. ayet.",
          "Üstteki giriş, Peygamber Efendimize hitaptır: Kur'an'a yemin edilir, onun gönderilmiş bir peygamber olduğu, dosdoğru bir yol üzerinde bulunduğu, bu Kitabın Azîz ve Rahîm olan Allah tarafından indirildiği ve niçin indirildiği söylenir. Yani muhatap ve görev burada belirlenir.",
        ],
      },
      end: {
        paragraphs: [
          "Şimdi ortadaki halkalara bakalım. Burası bu sayfanın ana bölümüdür ve bir ayna simetrisi taşır. Dıştan içe doğru okuyunuz:",
          {
            capsules: [
              {
                n: 7,
                text: "7. ayet — Onların çoğu üzerine o söz hak olmuştur; artık inanmazlar.",
                bg: WHITE_BG,
                color: GOLD_BORDER,
                textColor: INK_GOLD,
              },
              {
                n: 8,
                text: "8. ayet — Boyunlarına halkalar geçirdik; başları yukarı kalkık kaldı.",
                bg: CREAM_BG,
                color: LAV_BORDER,
                textColor: INK_LAV,
              },
              {
                n: 9,
                text: "9. ayet — Önlerine bir set, arkalarına bir set çektik ve gözlerini perdeledik.",
                bg: WHITE_BG,
                color: WHITE_BORDER,
                textColor: INK_RED,
              },
              {
                n: 10,
                text: "10. ayet — Uyarsan da uyarmasan da onlar için birdir; inanmazlar.",
                bg: CREAM_BG,
                color: LAV_BORDER,
                textColor: INK_LAV,
              },
              {
                n: 11,
                text: "11. ayet — Sen ancak Zikr'e uyanı ve Rahmân'dan gıyaben korkanı uyarırsın.",
                bg: WHITE_BG,
                color: GOLD_BORDER,
                textColor: GREEN_THEME,
              },
            ],
            corners: "soft",
          },
          "Dikkat ediniz: en dıştaki iki ayet, yani 7 ve 11, birbirinin karşılığıdır. Biri inanmayanlardan, diğeri uyarının kime fayda vereceğinden söz eder. Onların bir içindeki 8 ve 10 da birbirinin karşılığıdır: biri kalkık kalmış başları, diğeri uyarmanın fark etmeyişini anlatır. Ortada ise tek başına 9. ayet durur.",
          "Bu yüzden 9. ayet halkanın tam merkezine, en küçük ve en yuvarlak çerçevenin içine konulmuştur. O da kendi içinde ikiye ayrılmıştır: önden ve arkadan çekilen setler, sonra da gözlerin perdelenmesi. Önü arkası kapanmış, üstelik görüşü de alınmış bir insan tasviri.",
          "Şunu da fark etmek gerekir: burada anlatılan kapanma bir zorlama değildir. İnsan önce yüz çevirir; ardından bu yüz çevirme onun için bir alışkanlık, bir perde hâline gelir.",
          "En alttaki badem şekli ise bütün bu halkanın cevabıdır. Onun için ne girişin içine ne de halkaların birine konulmamıştır; kendine ait bir şekli vardır:",
          {
            capsules: [
              {
                n: 12,
                text: "12. ayet — Şüphesiz ölüleri biz diriltiriz; yaptıklarını ve bıraktıkları eserleri yazarız; her şeyi apaçık bir kitapta saymışızdır.",
                bg: WHITE_BG,
                color: MAROON_BORDER,
                textColor: INK_RED,
              },
            ],
            corners: "soft",
          },
          "Yukarıdaki halkalar kapanmayı anlatıyordu; bu ayet ise hiçbir şeyin kaybolmadığını söylüyor. Görmeyen gözler, kapanmış yollar… ama yapılan hiçbir iş ve geride bırakılan hiçbir eser kayıt dışı kalmıyor. Halkanın içinde kapanan insan, halkanın dışında bir kitapta yazılı duruyor.",
        ],
      },
    },
  },

  animations: {
    computeFoldYPositions: (lm) => {
      // fold0 — between section 1 (block 4) and the outer ring (block 5).
      const fold0 =
        (lm.groupYPositions[4] - lm.groupHeights[4] + lm.groupYPositions[5]) /
        2;
      // fold1 — the onion's centre line, between ayah 9's two capsules.
      const fold1 =
        (lm.groupYPositions[7] - lm.groupHeights[7] + lm.groupYPositions[8]) /
        2;
      // fold2 — between the outer ring (block 10) and the mandorla (block 11).
      const fold2 =
        (lm.groupYPositions[10] -
          lm.groupHeights[10] +
          lm.groupYPositions[11]) /
        2;
      // fold3 — below the mandorla, so it can hinge as a unit.
      const fold3 = fold2 - 0.16;
      return [fold0, fold1, fold2, fold3];
    },

    foldSteps: [
      {
        // The page arrives creased: the onion's inner rings are still tucked,
        // so the reader meets the giriş and the mandorla first.
        id: "pre-start",
        folds: [
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 1.05 },
          { direction: 1, angleFactor: 0.55 },
          { direction: -1, angleFactor: 0.5 },
        ],
      },
      {
        id: "end",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
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
// The \n line breaks are load-bearing: each capsule's height was solved for the
// number of lines below, so adding or removing one re-sizes that capsule's text
// (or clips it).
// ---------------------------------------------------------------------------

export const YASIN_36_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      { verses: [{ number: 1, text: "يسٓ" }] },
      { verses: [{ number: 12, text: "وَالْقُرْآنِ الْحَكِيمِ" }] },
      {
        verses: [
          { number: 3, text: "عَلَىٰ صِرَاطٍ مُسْتَقِيمٍ" },
          { number: 2, text: "إِنَّكَ لَمِنَ الْمُرْسَلِينَ" },
        ],
      },
      {
        verses: [{ number: 4, text: "تَنْزِيلَ الْعَزِيزِ الرَّحِيمِ" }],
      },
      {
        verses: [
          {
            number: 13,
            text: "لِتُنْذِرَ قَوْمًا مَا أُنْذِرَ آبَاؤُهُمْ فَهُمْ غَافِلُونَ",
          },
        ],
      },
      {
        verses: [
          {
            number: 5,
            text: "لَقَدْ حَقَّ الْقَوْلُ عَلَىٰ أَكْثَرِهِمْ فَهُمْ لَا يُؤْمِنُونَ",
          },
        ],
      },
      {
        verses: [
          {
            number: 6,
            text: "إِنَّا جَعَلْنَا فِي أَعْنَاقِهِمْ أَغْلَالًا\nفَهِيَ إِلَى الْأَذْقَانِ فَهُمْ مُقْمَحُونَ",
          },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "وَجَعَلْنَا مِنْ بَيْنِ أَيْدِيهِمْ سَدًّا\nوَمِنْ خَلْفِهِمْ سَدًّا",
          },
        ],
      },
      {
        verses: [
          { number: 8, text: "فَأَغْشَيْنَاهُمْ فَهُمْ لَا يُبْصِرُونَ" },
        ],
      },
      {
        verses: [
          {
            number: 9,
            text: "وَسَوَاءٌ عَلَيْهِمْ أَأَنْذَرْتَهُمْ\nأَمْ لَمْ تُنْذِرْهُمْ لَا يُؤْمِنُونَ",
          },
        ],
      },
      {
        verses: [
          {
            number: 10,
            text: "إِنَّمَا تُنْذِرُ مَنِ اتَّبَعَ الذِّكْرَ وَخَشِيَ الرَّحْمَٰنَ\nبِالْغَيْبِ فَبَشِّرْهُ بِمَغْفِرَةٍ وَأَجْرٍ كَرِيمٍ",
          },
        ],
      },
      {
        verses: [
          {
            number: 11,
            text: "إِنَّا نَحْنُ نُحْيِي الْمَوْتَىٰ\nوَنَكْتُبُ مَا قَدَّمُوا وَآثَارَهُمْ\nوَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُبِينٍ",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const YASIN_36_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      { verses: [{ number: 1, text: "Yâsîn." }] },
      {
        verses: [{ number: 12, text: "Hikmet dolu Kur'an'a andolsun ki," }],
      },
      {
        verses: [
          { number: 3, text: "Dosdoğru\nbir yol\nüzeresin." },
          {
            number: 2,
            text: "Sen elbette\ngönderilmiş\npeygamberlerdensin,",
          },
        ],
      },
      {
        verses: [
          {
            number: 4,
            text: "Azîz ve Rahîm olanın indirmesidir;",
          },
        ],
      },
      {
        verses: [
          {
            number: 13,
            text: "ataları uyarılmamış, bu yüzden gaflette olan bir kavmi uyarman için.",
          },
        ],
      },
      {
        verses: [
          {
            number: 5,
            text: "Andolsun, onların çoğu üzerine o söz hak olmuştur; artık inanmazlar.",
          },
        ],
      },
      {
        verses: [
          {
            number: 6,
            text: "Biz onların boyunlarına halkalar geçirdik;\no halkalar çenelerine dayandı, başları kalkık kaldı.",
          },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "Önlerine bir set, arkalarına\nda bir set çektik,",
          },
        ],
      },
      {
        verses: [
          { number: 8, text: "Ve gözlerini perdeledik; artık görmezler." },
        ],
      },
      {
        verses: [
          {
            number: 9,
            text: "Onları uyarsan da uyarmasan da\nkendileri için birdir; inanmazlar.",
          },
        ],
      },
      {
        verses: [
          {
            number: 10,
            text: "Sen ancak Zikr'e uyanı ve görmediği hâlde Rahmân'dan korkanı uyarırsın.\nİşte öylesini bağışlanma ve güzel bir mükâfatla müjdele.",
          },
        ],
      },
      {
        verses: [
          {
            number: 11,
            text: "Şüphesiz ölüleri biz diriltiriz,\nyaptıklarını ve bıraktıkları eserleri yazarız;\nher şeyi apaçık bir kitapta saymışızdır.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const YASIN_36_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      { verses: [{ number: 1, text: "Ya Sin." }] },
      { verses: [{ number: 12, text: "By the wise Qur'an," }] },
      {
        verses: [
          { number: 3, text: "upon a\nstraight\npath." },
          { number: 2, text: "you are indeed\none of the\nmessengers," },
        ],
      },
      {
        verses: [
          {
            number: 4,
            text: "A revelation of the Almighty, the Most Merciful,",
          },
        ],
      },
      {
        verses: [
          {
            number: 13,
            text: "to warn a people whose forefathers were not warned, and so are heedless.",
          },
        ],
      },
      {
        verses: [
          {
            number: 5,
            text: "The word has already come true against most of them, so they will not believe.",
          },
        ],
      },
      {
        verses: [
          {
            number: 6,
            text: "We have placed shackles around their necks,\nreaching their chins, so their heads are forced up.",
          },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "And We have set a barrier before them\nand a barrier behind them,",
          },
        ],
      },
      {
        verses: [
          { number: 8, text: "and covered them over, so they cannot see." },
        ],
      },
      {
        verses: [
          {
            number: 9,
            text: "It is all the same to them whether\nyou warn them or not — they will not believe.",
          },
        ],
      },
      {
        verses: [
          {
            number: 10,
            text: "You can only warn one who follows the Reminder and fears the Most Merciful unseen.\nGive him good news of forgiveness and a generous reward.",
          },
        ],
      },
      {
        verses: [
          {
            number: 11,
            text: "It is We who bring the dead to life,\nand We record what they send ahead and leave behind;\nWe have accounted for everything in a clear Record.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const YASIN_36_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: YASIN_36_TEXT_AR,
  en: YASIN_36_TEXT_EN,
  tr: YASIN_36_TEXT_TR,
};
