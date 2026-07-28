/**
 * ÂL-İ İMRÂN: 14 — Al-Imran 3:14, one ayah split into 10 chunks.
 *
 * Layout matches the reference book page:
 *
 *   ┌───────────────────────────────────────┐  ← outer section frame (1–9)
 *   │  ┌─────────────────────────────────┐  │
 *   │  │              (1-2)              │  │   yellow
 *   │  └─────────────────────────────────┘  │
 *   │              ╱‾‾‾‾‾╲                  │  ← upper band (3–5): peaks UP
 *   │        ╱‾‾‾‾‾       ‾‾‾‾‾╲            │
 *   │   │            (3)              │     │   yellow
 *   │   │      ┌─────┐ ┌─────┐        │     │
 *   │   │      │ (5) │ │ (4) │        │     │   blue pair (RTL: 4 right)
 *   │   │      └─────┘ └─────┘        │     │
 *   │   └─────────────────────────────┘     │
 *   │   ┌─────────────────────────────┐     │  ← lower band (6–8): peaks DOWN
 *   │   │      ┌─────┐ ┌─────┐        │     │
 *   │   │      │ (7) │ │ (6) │        │     │   blue pair (RTL: 6 right)
 *   │   │      └─────┘ └─────┘        │     │
 *   │   │            (8)              │     │   yellow
 *   │        ╲_____       _____╱            │
 *   │              ╲_____╱                  │
 *   │  ┌─────────────────────────────────┐  │
 *   │  │              (9)                │  │   yellow (same size as 1-2)
 *   │  └─────────────────────────────────┘  │
 *   └───────────────────────────────────────┘
 *      ┌──────────────────────────────┐        ← (10) sits OUTSIDE the frame
 *      │             (10)             │        orange, biggest box
 *      └──────────────────────────────┘
 *
 * The two band frames are mirror images, so read together they are one hexagon
 * cut across the fold — exactly how the reference page draws them.
 *
 * Chunk ids follow the book's own numbering, so there is no chunk "2":
 * the first box carries verses 1 AND 2 together and shows the badge "1-2"
 * (`verseOverrides[1].displayNumber`).
 *
 * FOLDING — three creases wrap the blue chunks (4,5,6,7), exactly like
 * Ayat al-Kursi's middle 2x2: above the 4/5 row, between the two rows, and
 * below the 6/7 row. Folding therefore tucks the blue pairs away and brings
 * chunk 3 and chunk 8 face to face.
 *
 * BACKGROUND SECTIONS — three frames: 1–9 (outer, a rounded rect) plus the two
 * peaked hexagon halves for 3–5 and 6–8. The band halves have a TRANSPARENT
 * body — only the gold outline is drawn, so the paper reads through them the
 * way `/tevbe/dome-section.svg` does.
 *
 * No SideCurves on this page (a single transparent curveColors entry).
 * Sizing (capsule heights, gaps, paddings, border widths) is Alak's standard
 * set verbatim — see `globalSettings`.
 */

import type { SurahLayoutConfig } from "../schema";
import type { SurahDataShape } from "../SurahConfig";
import type { SurahLanguage } from "../../hooks/useSurahLanguageStore";
import {
  ORANGE_THEME,
  MAROON_THEME,
  CAPSULE_BG_6_19,
  CAPSULE_BG_9_10_15_16,
  S1_INNER_BG,
  S1_INNER_BORDER,
} from "../theme";

// ---------------------------------------------------------------------------
// PALETTE — the project's own capsule themes, mapped onto the book page:
//   yellow (Alak Section 1) → 1-2, 3, 8, 9
//   orange (Alak 6/19)      → 10, the closing box outside the frame
//   blue   (Alak 9/10/15/16)→ the four folded boxes (4, 5, 6, 7)
//
// Every number badge takes `circleBorderCol = its own capsule bg`, so the badge
// ring disappears into the capsule. The single exception is the mushaf ayah
// marker (14) on chunk 10, which keeps a visible gold ring.
// ---------------------------------------------------------------------------

const YELLOW_BG = S1_INNER_BG; // #fbf1d5
const YELLOW_BORDER = S1_INNER_BORDER; // #d2ae84

const ORANGE_BG = CAPSULE_BG_6_19; // #EFE2C7
const ORANGE_BORDER = ORANGE_THEME; // #C4963B

const WHITE_BG = "#FBFAF4";
const WHITE_BORDER = "#C7C1AC";

const DARK_TEXT = "#2B2B2B";
const RED_TEXT = "#A30000";

/** Shared shape for the two band-edge boxes (3, 8) — yellow, non-pill. */
const bandEdge = (extra: Record<string, unknown> = {}) => ({
  bg: YELLOW_BG,
  border: YELLOW_BORDER,
  circleBg: YELLOW_BG,
  circleBorderCol: YELLOW_BG,
  circleTextCol: "#1A1A1A",
  textColor: DARK_TEXT,
  isPill: false,
  textScaleOverride: 0.7,
  translationTextScaleOverride: 0.48,
  translationPadding: 0.012,
  ...extra,
});

/**
 * Shared shape for the four folded boxes (4, 5, 6, 7) — blue.
 *
 * `isPill: false` like every other box on this page: the book draws these as
 * rounded rectangles, not capsules, and their proportions are the book's too
 * (0.317 x 0.105 ≈ 3:1 — measured off the reference page, where all four
 * boxes are the same height as the yellow ones around them).
 */
const foldedBox = (extra: Record<string, unknown> = {}) => ({
  bg: WHITE_BG,
  border: WHITE_BORDER,
  circleBg: WHITE_BG,
  circleBorderCol: WHITE_BG,
  circleTextCol: "#4A4636",
  textColor: "#2C2A22",
  isPill: false,
  ...extra,
});

// ---------------------------------------------------------------------------
// LAYOUT CONFIG
// ---------------------------------------------------------------------------

export const IMRAN_14_CONFIG: SurahLayoutConfig = {
  id: "imran14",
  title: "ÂL-İ İMRÂN: 14",
  heroTitle: "Âl-i İmrân",
  heroSubtitle: "suresi 14",

  scriptInfo: {
    title: "Âl-i İmrân: 14",
    sayfa: 51,
    juz: 3,
    hizb: 6,
    singleAyahNumber: 14,
  },

  // Fold-story → script sync (left ayah-list sidebar). At "pre-start" the blue
  // chunks are folded away, so only the boxes still facing the reader light up.
  scriptHighlights: {
    "pre-start": [1, 3, 8, 9, 10],
    end: [1, 3, 4, 5, 6, 7, 8, 9, 10],
  },

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: false,
    hideVerseNumbers: false,
  },

  // Identical to Alak's paper.
  dimensions: {
    paperWidth: 1.54,
    paperHeight: 1.78,
    sceneCenterYOffset: -0.045,
    padding: 0.29,
    scrollPages: 3,
    fixedWidthAcrossLanguages: true,
  },

  specialVerses: {
    // 4↔5 and 6↔7 are the "twin" pairs that face each other across a fold.
    versePairings: { 4: 5, 5: 4, 6: 7, 7: 6 },
  },

  // ── Per-verse appearance ─────────────────────────────────────────────────
  verseOverrides: {
    // Top box — carries BOTH verse 1 and verse 2, badge reads "1-2".
    1: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BG,
      circleTextCol: "#1A1A1A",
      textColor: DARK_TEXT,
      isPill: false,
      displayNumber: "1-2",
      textScaleOverride: 0.71,
      translationTextScaleOverride: 0.46,
      translationPadding: 0.02,
      translationTextAlign: "left",
    },

    // ── Band 3–5 ──────────────────────────────────────────────────────────
    3: bandEdge({ translationPadding: 0.002 }),
    4: foldedBox({
      textScaleOverride: 0.6,
      translationTextScaleOverride: 0.45,
      translationPadding: 0.02,
    }),
    5: foldedBox({
      textScaleOverride: 0.6,
      translationTextScaleOverride: 0.45,
      translationPadding: 0.02,
    }),

    // ── Band 6–8 ──────────────────────────────────────────────────────────
    // The two longest blue chunks — only their translations need scaling down.
    // (`textScaleOverride` is the Arabic scale and would leak into the
    // translations, since VerseGroup only replaces it when a translation
    // override exists — so never set one without the other here.)
    6: foldedBox({
      textScaleOverride: 0.55,
      translationTextScaleOverride: 0.45,
      translationPadding: 0.002,
    }),
    7: foldedBox({
      textScaleOverride: 0.6,
      translationTextScaleOverride: 0.45,
      translationPadding: 0.002,
    }),
    8: bandEdge(),

    // ── Closing boxes ─────────────────────────────────────────────────────
    // 9 — yellow, same size as the 1-2 box.
    9: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BG,
      circleTextCol: "#1A1A1A",
      textColor: RED_TEXT,
      isPill: false,
      textScaleOverride: 0.8,
      translationTextScaleOverride: 0.52,
      translationPadding: 0.02,
    },
    // 10 — the only orange box, and the biggest one on the page. Last chunk of
    // the ayah → carries the mushaf ayah marker (14) with the chunk counter
    // (10) stacked above it. The 14 badge is the one badge that keeps a ring.
    10: {
      bg: ORANGE_BG,
      border: ORANGE_BORDER,
      circleBg: ORANGE_BG,
      circleBorderCol: ORANGE_BG,
      circleTextCol: "#1A1A1A",
      ayahBadgeBg: ORANGE_BG,
      ayahBadgeBorderCol: ORANGE_BORDER,
      ayahBadgeTextCol: ORANGE_BORDER,
      textColor: RED_TEXT,
      isPill: false,
      showAyahNumber: true,
      textScaleOverride: 0.8,
      translationTextScaleOverride: 0.45,
      translationPadding: 0.02,
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
      maroonTheme: WHITE_BORDER,
      greenTheme: WHITE_BORDER,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: ORANGE_BG,
      s2Group1Bg: YELLOW_BG,
      s2Group2Bg: WHITE_BG,
      s2Group3Bg: YELLOW_BG,
      // No side brackets/curves on this page. A single fully-transparent entry
      // makes SideCurves emit nothing (an empty [] would instead fall back to
      // the default olive center bracket for every isCenter group).
      curveColors: [{ color: "transparent", fillColor: "transparent" }],
    },
    capsuleBorderWidth: 0.0039,
    circleBorderWidth: 0.0035,
    verseRadius: 0.04,
    oppositeVerseConnectorRadius: 0.05,
    elevatedSectionRadii: {
      base: 0.039,
      outer: 0.025,
      innerA: 0.023,
      innerB: 0.022,
    },
  },

  // ── GLOBAL SIZING — Alak's standard set, value for value ─────────────────
  globalSettings: {
    verseTextScale: 1.15,
    translationVerseTextScale: 1.15,
    capsuleHeight: 0.075,
    columnGap: 0.02,
    rowGap: 0.02,
    blockGap: 0.035,
    sectionPadX: 0.035,
    blockPadding: 0.012,
    sectionBorderWidth: 0.006,
    connectorPad: 0.03,
    framePad: 0.054,
  },

  handwrittenNotes: [
    {
      x: 0.77,
      y: -0.07,
      fontSize: 0.05,
      color: "#7C2C2A",
      lineSpacing: 1.4,
      maxWidth: 1.5,
      textAlign: "center",
      rotationZ: 0,
      lines: [{ text: "Âl-i İmrân: 14" }],
    },
  ],

  // ── BLOCKS ───────────────────────────────────────────────────────────────
  // Capsule width for a 1-column block and for one column of a 2-column block
  // is `0.423 - horizontalInset` on this paper (sectionInnerW 0.89, blockPadding
  // 0.012, columnGap 0.02) — that identity is how every inset below was chosen.
  //
  // Width ladder, biggest → smallest:
  //   (10) 0.92  >  (1-2) = (9) 0.86  >  (3) = (8) 0.66  >  4/5 + 6/7 pair span 0.654
  // The blue boxes are 0.317 x 0.105 — the book's own ≈3:1 proportion, and just
  // narrow enough as a pair to sit inside the width of (3) / (8) above them.
  //
  // VERTICAL BUDGET — the two band frames are now peaked hexagons
  // (/imran/band-peak-up.svg + its mirror), so a band's frame is NOT flush with
  // its blocks: it clears them by 0.0269 on the flat side and by a further
  // 0.0894 of peak on the pointed side. Every `gapBefore` below that touches a
  // band is `peak + flat pad + 0.018 of air` = 0.134, or, between the two
  // bands, `2 * flat pad + 0.018` = 0.072. Resulting frame edges (relative to
  // block 0's top, which is y = 0):
  //   upper frame   +0.1667 apex … −0.6179 flat     (blocks 1–2 at −0.283 … −0.591)
  //   lower frame   −0.6361 flat … −1.0873 apex     (blocks 3–4 at −0.663 … −0.971)
  // Retune `svgOverlays[1..2].offsetY` together with these gaps.
  //
  // allGroups index (used by svgOverlays anchorGroupIndex):
  //   0 = (1-2) · 1 = (3) · 2 = (5,4) · 3 = (7,6) · 4 = (8) · 5 = (9) · 6 = (10)
  blocks: [
    // 0 — Top box, verses 1+2 merged. width 0.86 (same as block 5)
    {
      id: "b_intro",
      type: "group",
      verseIds: [1],
      columns: 1,
      capsuleHeight: 0.125,
      horizontalInset: -0.437,
      isCenter: false,
      dragBehavior: "individual",
      hideRowConnectors: true,
    },
    // 1 — Band 3–5, head box (3). width 0.66
    //     gapBefore clears the upper frame's peak, which rises 0.0894 + 0.0269
    //     above this block's top edge.
    {
      id: "b_v3",
      type: "group",
      verseIds: [3],
      columns: 1,
      capsuleHeight: 0.105,
      horizontalInset: -0.1,
      isCenter: false,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.08,
    },
    // 2 — Band 3–5, blue pair (RTL: left = 5, right = 4). 0.317 x 0.105 each.
    {
      id: "b_v45",
      type: "group",
      verseIds: [5, 4],
      columns: 2,
      capsuleHeight: 0.105,
      horizontalInset: 0.05,
      isCenter: true,
      dragBehavior: "group",
      hideRowConnectors: true,
      gapBefore: 0.015,
    },
    // 3 — Band 6–8, blue pair (RTL: left = 7, right = 6).
    {
      id: "b_v67",
      type: "group",
      verseIds: [7, 6],
      columns: 2,
      capsuleHeight: 0.105,
      horizontalInset: 0.05,
      isCenter: true,
      dragBehavior: "group",
      hideRowConnectors: true,
      // Also the visible gap between the two band frames: this gap minus the
      // 2 x 0.0269 the frames pad themselves by on their flat edges.
      gapBefore: 0.072,
    },
    // 4 — Band 6–8, foot box (8). width 0.66 (same as block 1)
    {
      id: "b_v8",
      type: "group",
      verseIds: [8],
      columns: 1,
      capsuleHeight: 0.105,
      horizontalInset: -0.1,
      isCenter: false,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.015,
    },
    // 5 — Closing box inside the outer frame (9). width 0.86 (same as block 0)
    //     gapBefore clears the lower frame's downward peak, mirror of block 1's.
    {
      id: "b_v9",
      type: "group",
      verseIds: [9],
      columns: 1,
      capsuleHeight: 0.125,
      horizontalInset: -0.437,
      isCenter: false,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.08,
    },
    // 6 — Box OUTSIDE the outer frame (10) — the biggest box on the page.
    //     width 0.92, and the only capsule taller than the 0.125 standard.
    {
      id: "b_v10",
      type: "group",
      verseIds: [10],
      columns: 1,
      capsuleHeight: 0.125,
      horizontalInset: -0.6,
      isCenter: false,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.06,
    },
  ],

  // ── Drag / elevation zones ───────────────────────────────────────────────
  // Order matters: the reverse index is first-wins, so the two inner bands
  // claim 3–5 and 6–8, and `sec_all` keeps 1 and 9 (plus its own frame).
  customSections: [
    { id: "sec_3_5", verseIds: [3, 4, 5] },
    { id: "sec_6_8", verseIds: [6, 7, 8] },
    {
      id: "sec_all",
      verseIds: [1, 3, 4, 5, 6, 7, 8, 9],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.35 },
    },
    {
      id: "sec_v10",
      verseIds: [10],
      cameraTarget: { y: 0.8, fov: 35, tilt: -1.2 },
    },
  ],

  // ── BACKGROUND SECTIONS ──────────────────────────────────────────────────
  // The two inner bands are the book's split hexagon: a gold outline that
  // peaks UP over 3–5 and DOWN under 6–8, with a fully transparent body so the
  // paper shows through (/imran/band-peak-*.svg — mirror images of each other).
  // Both files are drawn at the aspect they are displayed at, so scaleX/scaleY
  // MUST keep the ratio 0.96 / 0.47 = 2.043 or the stroke and the corners stop
  // being uniform. Their frame fills 96% of the plane on both axes and is
  // centred in it, so:
  //     frame w = 0.96 * scaleX = 0.9216      peak    = 0.0894
  //     frame h = 0.96 * scaleY = 0.4512      flat pad = 0.0269
  //     offsetY = plane centre - anchor       (no re-centring term needed)
  //
  // The outer frame keeps the /nisa rounded-rect construction, which draws
  // across ~98% of the plane's width and from 10%→99.4% of its height, so its
  // scaleY is the wanted frame height / 0.894 and its offsetY pushes the plane
  // down by ~4.7% of that height to re-centre it.
  svgOverlays: [
    // Outer frame — wraps 1 … 9 (10 deliberately stays outside), 0.03 of air
    // above block 0 and below block 5.
    {
      src: "/nisa/all-section-1.svg",
      anchorGroupIndex: 0,
      anchorEdge: "top",
      scaleX: 1.1,
      scaleY: 1.28,
      offsetX: 0,
      offsetY: -0.48,
      renderOrder: 2,
      customSectionId: "sec_all",
    },
    // Upper band — 3 … 5. Peak points up, over block 1.
    //   apex   = anchor + 0.0269 + 0.0894
    //   centre = apex - 0.4512/2  →  anchor - 0.1093
    {
      src: "/imran/band-peak-up.svg",
      anchorGroupIndex: 1,
      anchorEdge: "top",
      scaleX: 0.86,
      scaleY: 0.37,
      offsetX: 0,
      offsetY: -0.12,
      renderOrder: 3,
      customSectionId: "sec_3_5",
    },
    // Lower band — 6 … 8. Same frame mirrored: flat edge on top, peak below
    // block 4.
    //   flat top = anchor + 0.0269
    //   centre   = flat top - 0.4512/2  →  anchor - 0.1987
    {
      src: "/imran/band-peak-down.svg",
      anchorGroupIndex: 3,
      anchorEdge: "top",
      scaleX: 0.86,
      scaleY: 0.37,
      offsetX: 0,
      offsetY: -0.16,
      renderOrder: 3,
      customSectionId: "sec_6_8",
    },
  ],

  sideInfo: {
    panelTitle: "Tefsir",
    byFoldStep: {
      "pre-start": {
        kicker: "ÂL-İ İMRÂN: 14",
        paragraphs: [
          "Bu ayet bir tek ayettir. Kelimeleriyle ve kısacık cümleleriyle ikili simetrik sistem üzere nazil olmuş. Birbiri içinde pek çok ince hakikatleri nasıl böyle harika bir düzen içinde söylemiş diyerek Allah kelamının güzelliğine hayran olarak okuyalım.",
        ],
      },
      end: {
        paragraphs: [
          "Şimdi ayeti okuyalım. Okurken numara sırasını takip ediniz. Bu ayet tek ayet olduğu için elbette onun kelimeleri numaralı değildir; numaralar yalnızca okunuş sırasını göstermek içindir.",
          {
            capsules: [
              {
                n: "1-2",
                text: "Bütün insanlara, çocuk sevgisi ve kadınlara karşı bir ilgi verildi.",
                bg: YELLOW_BG,
                color: YELLOW_BORDER,
                textColor: DARK_TEXT,
              },
              {
                n: 3,
                text: "Ve daha yığın yığın şeyler insana sevdirildi:",
                bg: YELLOW_BG,
                color: YELLOW_BORDER,
                textColor: DARK_TEXT,
              },
            ],
            corners: "soft",
          },
          "Sevdirilen o yığın yığın şeyler, ikişer ikişer sayılıyor:",
          {
            columns: 2,
            frame: true,
            color: WHITE_BORDER,
            bg: WHITE_BG,
            corners: "soft",
            textColor: "#2C2A22",
            capsules: [
              { n: 4, text: "Altınlar" },
              { n: 5, text: "Ve gümüşler" },
              { n: 6, text: "Cins atlar" },
              { n: 7, text: "Et ve süt veren hayvanlar" },
            ],
          },
          {
            capsules: [
              {
                n: 8,
                text: "Ve ekili tarlalar",
                bg: YELLOW_BG,
                color: YELLOW_BORDER,
                textColor: DARK_TEXT,
              },
            ],
            corners: "soft",
          },
          "Ve ayet, dünya ile ahireti yan yana koyan iki cümleyle bitiyor:",
          {
            capsules: [
              {
                n: 9,
                text: "Bütün bunlar dünya hayatının nimetleridir,",
                bg: YELLOW_BG,
                color: YELLOW_BORDER,
                textColor: RED_TEXT,
              },
              {
                n: 10,
                text: "(Buna ilave olarak) Allah katında, (müminler için) her nimetin en güzelini içinde saklayan ebedi cennet var!",
                bg: ORANGE_BG,
                color: ORANGE_BORDER,
                textColor: RED_TEXT,
              },
            ],
            corners: "soft",
          },
          "Bu kısacık tek ayetin kelime ve cümlelerini yukarıdan aşağıya ve sağdan sola katlayarak ikili simetrik dizilişteki güzellikleri ve anlam zenginliğini görünüz.",
          "Yaşamayı da dünyayı da sevimli ve cazip kılan Allah’tır. O’nun içimize attığı muhabbet kıvılcımıyla severiz hayatı. Bizi ve bütün varlıkları çeşitli duygularla donatan ve gönlümüze bir sevgi programı yazan O’dur. O’nun yazdığı bu sevgi programı olmasaydı hiç kimse hiçbir şeyi sevemez ve ilgi de duymazdı. Bütün sevmeler ve sevilmeler O’ndandır. O’nun sevgisinin yansımalarıdır.",
          "İnsan, dünyada ihtiyaç duyduğu şeyleri ve nefsine hoş gelen şeyleri severken öğrenir sevgiyi. Fakat daha sonra, sevdiği şeylerin fâni yüzlerini göre göre kalbi yaralanır. Sevdiklerinden ayrılmalarla, ölümlerle kalbi yorulur. Fâni sevgililerin, gençliğin, güzelliğin kendisini terk edip yokluğa koşmaları en sonunda insanı tam ikna ve irşat eder ki dünyadaki varlıkları sevme, bir dönem için verilmiş bir görevdir ve bir hikmete binaendir. O görev biterken dünyevi sevgiler de anlamsızlaşır. Gerçek sevgi, bitmeyen sevgi ve insan kalbini tam tatmin eden sevgi Allah sevgisidir, ebed sevgisidir ama yolunu şaşıran sevgi insanı Allah’tan ve ahiretten alıkoyduğu gibi, irşat edilmeyen ve gerçek sevgiliyi bulamayan kalp de acılar içinde kalır.",
          "İşte Kur'an, fâni dünyanın bütün acılarını lezzete ve bütün ayrılıklarını visale çeviren bir müjde veriyor.",
          "Allah, var ve madem bâkidir, nimetlerin elinizden çıkıp gitmesinden endişe etmeyiniz. Allah, bu dünyada ihsan ettiği ve tattırdığı nimetlerin daha güzellerini, ebedi bir âlemde, acısız, ayrılıksız bir cennette size ihsan edebilir. Hem madem vaat etmiştir elbette yapacaktır. Öyleyse iman ve itaatle bunu O’ndan talep ediniz, isteyiniz.",
        ],
      },
    },
  },

  animations: {
    // Three creases, wrapped around the blue chunks (4,5,6,7):
    //   fold0 — between (3) and the 4/5 row
    //   fold1 — between the 4/5 row and the 6/7 row
    //   fold2 — between the 6/7 row and (8)
    // The two enclosed bands are equal in height, so the accordion closes flat.
    computeFoldYPositions: (lm) => {
      const y = lm.groupYPositions;
      const h = lm.groupHeights;
      const mid = (i: number) => (y[i] - h[i] + y[i + 1]) / 2;
      return [mid(1), mid(2), mid(3)];
    },

    foldSteps: [
      // Blue chunks tucked away — the page rests like the reference image's
      // folded state (same angle set as Ayat al-Kursi's middle 2x2).
      {
        id: "pre-start",
        folds: [
          { direction: 1, angleFactor: 0.5 }, // fold0
          { direction: -1, angleFactor: 1.05 }, // fold1
          { direction: 1, angleFactor: 0.55 }, // fold2
        ],
      },
      {
        id: "end",
        folds: [
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
// ---------------------------------------------------------------------------

export const IMRAN_14_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      // 0 — top box (1+2)
      {
        verses: [
          {
            number: 1,
            text: "زُيِّنَ لِلنَّاسِ حُبُّ الشَّهَوَاتِ مِنَ النِّسَاءِ وَالْبَنِينَ",
          },
        ],
      },
      // 1 — band 3–5 head
      { verses: [{ number: 3, text: "وَالْقَنَاطِيرِ الْمُقَنطَرَةِ" }] },
      // 2 — blue pair [left = 5, right = 4]
      {
        verses: [
          { number: 5, text: "وَالْفِضَّةِ" },
          { number: 4, text: "مِنَ الذَّهَبِ" },
        ],
      },
      // 3 — blue pair [left = 7, right = 6]
      {
        verses: [
          { number: 7, text: "وَالْأَنْعَامِ" },
          { number: 6, text: "وَالْخَيْلِ الْمُسَوَّمَةِ" },
        ],
      },
      // 4 — band 6–8 foot
      { verses: [{ number: 8, text: "وَالْحَرْثِ" }] },
      // 5 — closing box inside the frame
      {
        verses: [{ number: 9, text: "ذَٰلِكَ مَتَاعُ الْحَيَاةِ الدُّنْيَا" }],
      },
      // 6 — box outside the frame
      { verses: [{ number: 10, text: "وَاللَّهُ عِندَهُ حُسْنُ الْمَآبِ" }] },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — Turkish, transcribed from the reference book page.
// The two-column groups are listed in LTR reading order (4 left, 5 right;
// 6 left, 7 right) — VerseGroup maps them onto the Arabic RTL slots.
// ---------------------------------------------------------------------------

export const IMRAN_14_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [
          {
            number: 1,
            text: "Bütün insanlara, çocuk sevgisi ve\nKadınlara karşı bir ilgi verildi.",
          },
        ],
      },
      {
        verses: [
          { number: 3, text: "Ve daha yığın yığın şeyler insana sevdirildi:" },
        ],
      },
      {
        verses: [
          { number: 4, text: "Altınlar" },
          { number: 5, text: "Ve gümüşler" },
        ],
      },
      {
        verses: [
          { number: 6, text: "Cins atlar" },
          { number: 7, text: "Et ve süt veren\nhayvanlar" },
        ],
      },
      { verses: [{ number: 8, text: "Ve ekili tarlalar" }] },
      {
        verses: [
          { number: 9, text: "Bütün bunlar dünya hayatının nimetleridir," },
        ],
      },
      {
        verses: [
          {
            number: 10,
            text: "(Buna ilave olarak) Allah katında, (müminler için) her nimetin en güzelini içinde saklayan ebedi cennet var!",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — English
// ---------------------------------------------------------------------------

export const IMRAN_14_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [
          {
            number: 1,
            text: "All people were given a love of children and\n an attraction toward women.",
          },
        ],
      },
      {
        verses: [
          {
            number: 3,
            text: "And heaped-up piles of yet more things were made dear to them:",
          },
        ],
      },
      {
        verses: [
          { number: 4, text: "Gold" },
          { number: 5, text: "And silver" },
        ],
      },
      {
        verses: [
          { number: 6, text: "Fine horses" },
          { number: 7, text: "Cattle giving\nmeat and milk" },
        ],
      },
      { verses: [{ number: 8, text: "And tilled fields" }] },
      {
        verses: [
          {
            number: 9,
            text: "All of these are the enjoyments of the life of this world,",
          },
        ],
      },
      {
        verses: [
          {
            number: 10,
            text: "(And besides that) with Allah there is an eternal Paradise holding the most beautiful of every blessing (for the believers)!",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const IMRAN_14_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: IMRAN_14_TEXT_AR,
  en: IMRAN_14_TEXT_EN,
  tr: IMRAN_14_TEXT_TR,
};
