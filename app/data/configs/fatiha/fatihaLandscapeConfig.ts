import type { SurahLayoutConfig } from "../../schema";
import type { SurahDataShape } from "../../SurahConfig";
import type { SurahLanguage } from "../../../hooks/useSurahLanguageStore";

import {
  ORANGE_THEME,
  MAROON_THEME,
  CAPSULE_BG_6_19,
  CAPSULE_BG_9_10_15_16,
  S1_VERSE_NUMBER_BORDER,
  S1_VERSE_NUMBER_TEXT,
  S1_VERSE_5_TEXT,
} from "../../theme";

// ── LAYOUT TUNING ──────────────────────────────────────────────────────────
// This is Fatiha 1's content re-flowed onto a LANDSCAPE page: verse 1 sits
// alone on top, then verses 2-3-4 and 5-6-7 render as two side-by-side
// bordered panels (right = 2,3,4 — reads first in RTL order; left = 5,6,7)
// instead of one stacked on top of the other.
//
// Side-by-side placement is done with two new block-engine primitives:
//   - `horizontalInset` (existing) shrinks a block to half-width, centered.
//   - `xOffset` (new, additive, defaults to 0 for every other config) then
//     shifts that half-width block left/right off-center.
// Vertical rhythm between blocks uses `gapBefore` (existing field) directly
// instead of `verticalNudge`, so every gap below is a literal, auditable
// world-unit number rather than a cascading correction.
//
// All CAPSULE-level numbers (expandW/expandH/colors/text scale in
// verseOverrides below) are copied byte-for-byte from fatiha1Config — the
// panel width (TARGET_PANEL_INNER_W) is deliberately chosen so the base
// column width (colW) works out to the exact same 0.365 that fatiha1Config
// documents, so every expandW there produces an IDENTICAL final capsule
// size here.

const CAPSULE_H = 0.075; // == globalSettings.capsuleHeight
const BLOCK_PAD = 0.02; // == globalSettings.blockPadding
const COLUMN_GAP = 0.03; // == globalSettings.columnGap
const SECTION_PAD_X = 0.08; // == globalSettings.sectionPadX
const BLOCK_GAP = 0.1; // == globalSettings.blockGap (gap: verse1 -> panel row)
const PAIR_ROW_GAP = 0.024; // tight gap between a panel's solo top verse and
// its pair below, AND between the pair's own two verses — one uniform
// rhythm for all 3 stacked rows in a panel (matches the reference image).
const PADDING = 0.29; // == dimensions.padding

// Height of a 1-row ("solo") block and a 2-row ("pair") block, given the
// constants above — mirrors computeBlockHeight() in SurahConfig.ts exactly.
const H_SOLO = BLOCK_PAD * 2 + CAPSULE_H; // 0.115
const H_PAIR = BLOCK_PAD * 2 + CAPSULE_H * 2 + PAIR_ROW_GAP; // 0.214

// Target inner width for verse-1's block AND each side panel, chosen so
// colW = (W - blockPadding*2 - columnGap) / 2 comes out to fatiha1Config's
// documented 0.365 exactly:
const TARGET_INNER_W = 0.8; // (0.8 - 0.04 - 0.03) / 2 = 0.365

// Gap left BETWEEN the two side-by-side panel frames.
const PANEL_GAP_X = 0.25;
// Horizontal shift applied to each panel block to sit it in its own half,
// leaving PANEL_GAP_X of daylight between them.
const PANEL_X_OFFSET = TARGET_INNER_W / 2 + PANEL_GAP_X / 2; // 0.46

// ── PAGE DIMENSIONS ─────────────────────────────────────────────────────
// Wide enough that TWO half-width TARGET_INNER_W columns + PANEL_GAP_X +
// symmetric outer margin all fit; short enough that there's no dead space
// below/above the (much shorter, 2-row-band) content stack.
const PAPER_WIDTH = 2.34;
const PAPER_HEIGHT = 1.1;

const SECTION_INNER_W = PAPER_WIDTH - PADDING * 2 - SECTION_PAD_X * 2; // 1.8
// Shrinks verse-1's block AND each panel block down to TARGET_INNER_W,
// symmetric (keeps verse-1 centered; panels get re-centered via xOffset).
const PANEL_INSET = (SECTION_INNER_W - TARGET_INNER_W) / 2; // 0.5

// Total vertical span of the real content (top of verse-1's frame to the
// bottom of the panel row), used to perfectly re-center the page — the
// engine's own auto-centering assumes every block stacks one after another
// with no negative gaps, which no longer holds once the left panel's
// `gapBefore` jumps back up to align with the right panel.
const CONTENT_SPAN = H_SOLO + BLOCK_GAP + H_SOLO + PAIR_ROW_GAP + H_PAIR; // 0.528
const CONTENT_START_Y_OVERRIDE = -(PAPER_HEIGHT / 2) + CONTENT_SPAN / 2;

// Jumps the left panel's solo verse (verse 5) back up so it lands at the
// exact same Y as the right panel's solo verse (verse 2), instead of
// continuing to stack below the right panel (the engine's default).
const REALIGN_GAP = -(H_SOLO + PAIR_ROW_GAP + H_PAIR); // -0.353

export const FATIHA_LANDSCAPE_CONFIG: SurahLayoutConfig = {
  id: "fatihaLandscape",
  title: "FATİHA SURESİ",
  heroTitle: "Fatiha",
  heroSubtitle: "suresi",
  scriptInfo: {
    title: "1 Fâtiha",
    sayfa: 1,
    juz: 1,
    hizb: 1,
  },

  // Side panel content (tafsir) — shown in the bottom-right band under the
  // landscape paper. The single "end" fold step surfaces the intro entry,
  // then the per-verse entries follow in reading order. Edit freely.
  sideInfo: {
    panelTitle: "Tefsir",
    emptyText: "Kağıt açıldıkça ayetlerin kıssaları burada belirecek.",
    byFoldStep: {
      end: {
        kicker: "Kur'anın Anahtarı",
        title: "Fatiha'nın Simetrik Yapısı",
        paragraphs: [
          "Fatiha suresi yedi ayetten oluşur ve Kur'anın açılış suresidir. Besmele ile açılan sure, ikiz iki bölüm halinde akar: sağdaki bölüm Allah'ı öven ayetleri, soldaki bölüm ise kulun duasını taşır. Beşinci ayet — yalnız Sana kulluk eder, yalnız Senden yardım dileriz — iki bölümü birbirine bağlayan eksendir.",
        ],
      },
    },
    byVerse: {
      1: {
        title: "Besmele",
        paragraphs: [
          "Rahmân ve Rahîm olan Allah'ın adıyla. Her hayırlı işin başı olan Besmele, Fatiha'da surenin ilk ayeti olarak yer alır: okuyuş daha ilk sözde rahmetin kuşatıcılığıyla açılır.",
        ],
      },
      2: {
        title: "Hamd, Âlemlerin Rabbine",
        paragraphs: [
          "Bütün övgü, âlemlerin Rabbi olan Allah'a mahsustur. Görünen ve görünmeyen bütün varlık düzenleri O'nun terbiyesi altındadır; hamd, bu gerçeğin dille ikrarıdır.",
        ],
      },
      3: {
        title: "Rahmân, Rahîm",
        paragraphs: [
          "Rahmeti bütün yaratılmışları kuşatan ve müminlere özel merhametiyle muamele eden Allah. İki isim birlikte, rahmetin hem genişliğini hem inceliğini anlatır.",
        ],
      },
      4: {
        title: "Din Gününün Sahibi",
        paragraphs: [
          "Hesap gününün tek hâkimi O'dur. O gün hiçbir aracı, hiçbir güç fayda vermez; hüküm yalnız Allah'ındır.",
        ],
      },
      5: {
        title: "Kulluk ve Yardım",
        paragraphs: [
          "Yalnız Sana kulluk eder, yalnız Senden yardım dileriz. Surenin dönüm noktası: övgüden duaya, haberden hitaba geçilir — kul artık Rabbiyle yüz yüze konuşmaktadır.",
        ],
      },
      6: {
        title: "Dosdoğru Yol",
        paragraphs: [
          "Bizi dosdoğru yola ilet. Fatiha'nın kalbindeki istek hidayettir: her rekâtta yenilenen, ömür boyu süren bir yol isteme duası.",
        ],
      },
      7: {
        title: "Nimet Verilenlerin Yolu",
        paragraphs: [
          "Kendilerine nimet verdiklerinin yoluna; gazaba uğrayanların ve sapanların yoluna değil. Dua, örnek alınacak olanlar ve sakınılacak olanlarla somutlaşır ve sure âmin ile mühürlenir.",
        ],
      },
    },
  },

  // Fold-story → script sync: which script verses light up at each fold step.
  // Keys are `animations.foldSteps` ids; values are verse ids. Edit freely.
  scriptHighlights: {
    "pre-start": [1, 2, 3, 4, 5, 6, 7],
    end: [1, 2, 3, 4, 5, 6, 7],
  },
  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: false,
    hideVerseNumbers: false,
    hideBismillah3D: true, // Bismillah is already verse 1 — skip the 3D overlay
  },
  dimensions: {
    paperWidth: PAPER_WIDTH,
    paperHeight: PAPER_HEIGHT,
    sceneCenterYOffset: 0.25,
    padding: PADDING,
    scrollPages: 1.5,
    fixedWidthAcrossLanguages: true, // Do not widen paper for translation
  },
  specialVerses: {
    versePairings: {
      3: 4,
      4: 3,
      6: 7,
      7: 6,
    },
  },
  // Same per-verse capsule tuning as fatiha1Config, unchanged — see that
  // file's own comment for how expandW derives from colW=0.365. Copied
  // verbatim on purpose: TARGET_INNER_W above is solved so colW here is
  // identical, so these numbers produce identical final capsule sizes.
  verseOverrides: {
    1: {
      isPill: false,
      expandW: 0.22,
      expandH: 0.015,
      textScaleOverride: 0.75,
      translationTextScaleOverride: 0.55,
      bg: CAPSULE_BG_6_19,
      border: CAPSULE_BG_6_19,
      circleBorderCol: S1_VERSE_NUMBER_BORDER,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: S1_VERSE_NUMBER_TEXT,
      textColor: "#000000", // black text
    },
    2: {
      isPill: false,
      expandW: 0.22,
      expandH: 0.015,
      textScaleOverride: 0.7,
      translationTextScaleOverride: 0.55,
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT, // red text
    },
    3: {
      expandH: 0.0025,
      expandW: 0.1042, // 0.0486 / 1.1
      textScaleOverride: 1.2,
      translationTextScaleOverride: 0.85,
      bg: CAPSULE_BG_9_10_15_16, // Blue theme
      border: MAROON_THEME, // Slate blue border
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    4: {
      expandW: 0.1042, // 0.0486 / 1.1
      expandH: 0.0025,
      textScaleOverride: 1.3,
      translationTextScaleOverride: 0.85,
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    5: {
      isPill: false,
      expandW: 0.22,
      expandH: 0.015,
      textScaleOverride: 0.7,
      translationTextScaleOverride: 0.5,
      bg: CAPSULE_BG_6_19,
      border: ORANGE_THEME,
      circleBorderCol: ORANGE_THEME,
      circleBg: CAPSULE_BG_6_19,
      circleTextCol: ORANGE_THEME,
      textColor: S1_VERSE_5_TEXT, // red text
    },
    6: {
      expandW: 0.1042, // 0.0486 / 1.1
      expandH: 0.0025,
      textScaleOverride: 1.2,
      translationTextScaleOverride: 0.85,
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
    },
    7: {
      expandW: 0.2875,
      expandH: 0.0025,
      textScaleOverride: 1.2,
      translationTextScaleOverride: 0.85,
      bg: CAPSULE_BG_9_10_15_16,
      border: MAROON_THEME,
      circleBorderCol: MAROON_THEME,
      circleBg: CAPSULE_BG_9_10_15_16,
      circleTextCol: MAROON_THEME,
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
      maroonTheme: MAROON_THEME,
      greenTheme: ORANGE_THEME,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: ORANGE_THEME,
      s2Group1Bg: ORANGE_THEME,
      s2Group2Bg: MAROON_THEME,
      s2Group3Bg: ORANGE_THEME,
      // No decorative S-curve connectors between the two side panels in the
      // landscape layout (the reference image shows none) — every pair
      // transparent so SideCurves renders nothing.
      curveColors: [
        { color: "transparent", fillColor: "transparent" },
        { color: "transparent", fillColor: "transparent" },
        { color: "transparent", fillColor: "transparent" },
      ],
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
  globalSettings: {
    capsuleHeight: CAPSULE_H,
    columnGap: COLUMN_GAP,
    rowGap: 0.02,
    blockGap: BLOCK_GAP,
    sectionPadX: SECTION_PAD_X,
    blockPadding: BLOCK_PAD,
    sectionBorderWidth: 0.006,
    connectorPad: 0.03,
    framePad: 0.1,
    contentStartYOverride: CONTENT_START_Y_OVERRIDE,
  },

  handwrittenNotes: [
    {
      x: 1.15,
      y: -0.08,
      fontSize: 0.048,
      color: "#2f4858",
      lineSpacing: 1.6,
      maxWidth: 1.5,
      textAlign: "center",
      rotationZ: 0,
      lines: [
        {
          text: "Fatiha suresi",
        },
      ],
    },
  ],

  blocks: [
    {
      // Verse 1 alone, centered on top — same capsule size as fatiha1Config
      // (narrowed via horizontalInset so colW matches 0.365), but NOT
      // shifted (xOffset omitted -> stays centered).
      id: "section2_g0",
      type: "group",
      verseIds: [1],
      columns: 1,
      horizontalInset: PANEL_INSET,
      isCenter: false,
      dragBehavior: "individual",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    // ── RIGHT PANEL (reads first, RTL): verses 2, 3, 4 ──────────────────
    {
      id: "section2_g1",
      type: "group",
      verseIds: [2],
      columns: 1,
      horizontalInset: PANEL_INSET,
      xOffset: PANEL_X_OFFSET,
      isCenter: false,
      gapBefore: BLOCK_GAP,
      dragBehavior: "individual",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    {
      id: "section2_g2",
      type: "group",
      verseIds: [3, 4],
      columns: 1,
      horizontalInset: PANEL_INSET,
      xOffset: PANEL_X_OFFSET,
      isCenter: false,
      rowGap: PAIR_ROW_GAP,
      gapBefore: PAIR_ROW_GAP,
      forceRowConnector: true,
      rowConnectorPadY: 0.012,
      rowConnectorPadX: 0.007,
      dragBehavior: "pair",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    // ── LEFT PANEL: verses 5, 6, 7 ───────────────────────────────────────
    {
      id: "section2_g3",
      type: "group",
      verseIds: [5],
      columns: 1,
      horizontalInset: PANEL_INSET,
      xOffset: -PANEL_X_OFFSET,
      isCenter: false,
      // Jumps back up to align with g1 (verse 2) instead of continuing to
      // stack below g2 (verse 3,4) — see REALIGN_GAP derivation above.
      gapBefore: REALIGN_GAP,
      dragBehavior: "individual",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    {
      id: "section2_g4",
      type: "group",
      verseIds: [6, 7],
      columns: 1,
      horizontalInset: PANEL_INSET,
      xOffset: -PANEL_X_OFFSET,
      isCenter: false,
      rowGap: PAIR_ROW_GAP,
      gapBefore: PAIR_ROW_GAP,
      forceRowConnector: true,
      rowConnectorPadY: 0.012,
      rowConnectorPadX: 0.007,
      dragBehavior: "pair",
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
  ],

  svgOverlays: [
    {
      // Verse-1 frame — sized to roughly span the two panels combined
      // (matches the reference image, where the top box is as wide as the
      // two lower boxes together), not the full (much wider) landscape page.
      src: "/nisa/all-section-1.svg",
      anchorGroupIndex: 0,
      anchorEdge: "center",
      scaleX: 2 * TARGET_INNER_W + PANEL_GAP_X - 0.8,
      scaleY: 0.21,
      offsetX: 0,
      offsetY: 0.005,
      renderOrder: 10,
      customSectionId: "section2_v1",
    },
    {
      // Right panel frame (verses 2,3,4).
      src: "/nisa/all-section-1.svg",
      anchorGroupIndex: 1,
      anchorEdge: "top",
      scaleX: TARGET_INNER_W + 0.25,
      scaleY: 0.48,
      offsetX: PANEL_X_OFFSET,
      offsetY: -0.155,
      renderOrder: 3,
      customSectionId: "section2_v234",
    },
    {
      // Left panel frame (verses 5,6,7).
      src: "/nisa/all-section-1.svg",
      anchorGroupIndex: 3,
      anchorEdge: "top",
      scaleX: TARGET_INNER_W + 0.25,
      scaleY: 0.48,
      offsetX: -PANEL_X_OFFSET,
      offsetY: -0.155,
      renderOrder: 3,
      customSectionId: "section2_v567",
    },
  ],

  // Cross-block elevation zones: verse 1 alone, right panel (2,3,4)
  // unified, left panel (5,6,7) unified — same verseId groupings as
  // fatiha1Config (only the visual arrangement changed, not the semantic
  // grouping), so tapping each box zooms/highlights just that box.
  customSections: [
    {
      id: "section2_v1",
      verseIds: [1],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    {
      id: "section2_v234",
      verseIds: [2, 4, 3],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
    {
      id: "section2_v567",
      verseIds: [5, 7, 6],
      cameraTarget: { y: 1.2, fov: 35, tilt: -1.2 },
    },
  ],
  animations: {
    // Only 3 horizontal creases now (down from fatiha1Config's 6): the two
    // panels are side-by-side, not stacked, so there's no fold between
    // them — but each row band still folds top-to-bottom exactly like
    // before, and BOTH panels share the same row Y's by construction, so
    // one set of creases correctly folds both boxes at once.
    computeFoldYPositions: (lm) => {
      // fold0: midpoint between g0 (v1) and g1 (v2/v5 row)
      const fold0 =
        (lm.groupYPositions[0] - lm.groupHeights[0] + lm.groupYPositions[1]) /
        2;

      // fold1: midpoint between g1 (v2/v5 row) and g2 (v3-4/v6-7 row)
      const fold1 =
        (lm.groupYPositions[1] - lm.groupHeights[1] + lm.groupYPositions[2]) /
          2 -
        0.02;

      // fold1_5: crease between the pair's two verses (v3/v4 or v6/v7) —
      // same for both panels since g2 and g4 share the same row geometry.
      const g2ContentY = lm.blockMeta[2].contentY;
      const capH = lm.capsuleHeight;
      const rg2 = PAIR_ROW_GAP;
      const fold1_5 = g2ContentY - capH - rg2 / 2;

      return [fold0, fold1, fold1_5];
    },
    foldSteps: [
      // {
      //   id: "pre-start",
      //   folds: [
      //     { direction: 1, angleFactor: 0 }, // fold0: v1 ↔ panel row (flat)
      //     { direction: 1, angleFactor: 0 }, // fold1: solo row ↔ pair row (flat)
      //     { direction: -1, angleFactor: 0 }, // fold1_5: pair's own crease
      //   ],
      // },
      {
        id: "end",
        folds: [
          { direction: 1, angleFactor: 0 },
          { direction: 1, angleFactor: 0 },
          { direction: -1, angleFactor: 0 },
        ],
      },
    ],
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
// TEXT DATA — identical to fatiha1Config (same verses, same block/colorGroup
// order: [v1], [v2], [v3,v4], [v5], [v6,v7]) since only the visual
// arrangement changed, not the block order or verse content.
// ---------------------------------------------------------------------------

export const FATIHA_LANDSCAPE_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "الفاتحة",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [{ number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" }],
      },
      {
        verses: [{ number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" }],
      },
      {
        verses: [
          { number: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ" },
          { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ" },
        ],
      },
      {
        verses: [
          { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
        ],
      },
      {
        verses: [
          { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ" },
          {
            number: 7,
            text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const FATIHA_LANDSCAPE_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Al-Fatiha",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [
          {
            number: 1,
            text: "In the name of Allah ! For He is the Most Gracious, the Most Merciful.",
          },
        ],
      },
      {
        verses: [
          {
            number: 2,
            text: "All praise is to Allah, Lord of the Worlds !",
          },
        ],
      },
      {
        verses: [
          { number: 3, text: "The Most Gracious, the Most Merciful." },
          { number: 4, text: "Owner of the Day of Judgment." },
        ],
      },
      {
        verses: [
          {
            number: 5,
            text: "We worship You alone and we ask for help from You alone.",
          },
        ],
      },
      {
        verses: [
          { number: 6, text: "Show us the straight path." },
          {
            number: 7,
            text: "That path is the path You taught the Prophet, not the path of those who have earned anger and of those who have gone astray.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const FATIHA_LANDSCAPE_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Fatiha Suresi",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [
          { number: 1, text: "Allah adına ! ki O Rahmandır, Rahimdir." },
        ],
      },
      {
        verses: [
          { number: 2, text: "Tüm övgüler Allaha, Alemlerin Rabbine !" },
        ],
      },
      {
        verses: [
          { number: 3, text: "Rahmandır, Rahimdir." },
          { number: 4, text: "Din gününün sahibidir." },
        ],
      },
      {
        verses: [
          {
            number: 5,
            text: "Yalnız sana ibadet ediyoruz ve yalnız senden yardım istiyoruz.",
          },
        ],
      },
      {
        verses: [
          { number: 6, text: "Bize doğru yolu göster." },
          {
            number: 7,
            text: "O yol, Peygambere öğrettiğin yoldur, gazap ettiklerinin ve sapmışların yolu değil.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const FATIHA_LANDSCAPE_TEXT_DATA: Record<SurahLanguage, SurahDataShape> =
  {
    ar: FATIHA_LANDSCAPE_TEXT_AR,
    en: FATIHA_LANDSCAPE_TEXT_EN,
    tr: FATIHA_LANDSCAPE_TEXT_TR,
  };
