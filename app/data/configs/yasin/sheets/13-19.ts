/**
 * YÂSÎN: 13-19 — the parable of the town, one capsule per ayah.
 *
 * A sibling of yasin36Config (ayahs 1 … 12): same palette, same frame idiom,
 * its own sheet. Three frames, nested, and the nesting is the argument:
 *
 *   ╔══════════ all-section (13 … 19) ══════════╗
 *   ║   ┌──────────── (1) ───────────┐           ║  ayah 13   the narrator
 *   ║  ╭─────────── band (14 … 19) ──────────╮   ║
 *   ║  │  ┌────────── (2) ──────────┐         │  ║  ayah 14   sent, denied
 *   ║  │  ┌────────── (3) ──────────┐         │  ║  ayah 15   "you are only men"
 *   ║  │ ╭──── band-inner (16 · 17) ────╮     │  ║
 *   ║  │ │  ┌──────── (4) ────────┐      │    │  ║  ayah 16   "our Lord knows"
 *   ║  │ │  └─────── (5) ────────┘       │    │  ║  ayah 17   "only to deliver"
 *   ║  │ ╰──────────────────────────────╯     │  ║
 *   ║  │  ┌────────── (6) ──────────┐         │  ║  ayah 18   the threat
 *   ║  │  └───────── (7) ─────────┘           │  ║  ayah 19   the answer
 *   ║  ╰────────────────────────────────────╯    ║
 *   ╚═══════════════════════════════════════════╝
 *
 * Ayah 13 sits INSIDE the outer frame but OUTSIDE the band, because it is the
 * narrator's line — "set out for them the parable of the people of the town" —
 * introducing an exchange it does not take part in. The band holds the exchange
 * itself, and inside that, the messengers' reply (16 · 17) gets a frame of its
 * own: four ayahs of objection surrounding two of answer.
 *
 * NUMBERING. Seven ayahs, seven capsules — nothing split, nothing merged. Ids
 * run 1 … 7 and each badge shows its real ayah number (13 … 19) via
 * `displayNumber`, with `hideVerseNumbers` on.
 *
 * GEOMETRY IS SOLVED, NOT EYEBALLED. Every `svgOverlays` offsetY is
 * `(wanted frame centre) − (anchor block's frameY)`, from the stack table above
 * `blocks`. Horizontally, `sectionInnerW` is 1.13, so a capsule's width is
 * `0.547 − horizontalInset`.
 *
 * TEXT SCALES. `textScaleOverride` REPLACES the page's baseline rather than
 * scaling it (SharedUI: `textScale = textScaleOverride ?? langScale.verseBig`),
 * so the number on a capsule IS its font size, in units of the 0.071 big-verse
 * em. Each one here is the size at which that capsule's ink — vowel marks and
 * descenders included — just clears its own rule:
 *
 *     ink height ≈ 0.071 × override × ((lines − 1) × 1.2 + 1.05)
 *                ≤ capsule height − 0.012   ← the Arabic block is drawn 0.006
 *                                             low, so the bottom edge binds
 *
 * Overshooting does not look big — CanvasText gets a canvas the size of the
 * capsule, so text that does not fit is re-wrapped and then CLIPPED, which is
 * what used to shave the marks off the top line of ayahs 13 and 19.
 */

import type { SurahLayoutConfig } from "../../../schema";
import type { SurahDataShape } from "../../../SurahConfig";
import type { SurahLanguage } from "../../../../hooks/useSurahLanguageStore";
import { SHEET_FRAME_SVGS } from "../kit";
// import { yasinHandwrittenTitle } from "../kit";

// ---------------------------------------------------------------------------
// COLOR PALETTE — Tevbe 24's, as in yasin36Config. The reference photo paints
// this sheet in red / teal / purple watercolour; those three roles map onto
// Tevbe's maroon, white and cream pairs. Pairing rule: a capsule never shares
// its ground with the frame it sits on.
//   outer frame  cream panel     ->  MAROON_BG capsule   (ayah 13)
//   band         blue tint       ->  WHITE_BG capsules   (ayahs 14 · 15 · 18 · 19)
//   band-inner   lavender tint   ->  CREAM_BG capsules   (ayahs 16 · 17)
// ---------------------------------------------------------------------------

const CREAM_BG = "#F3EAD6";
const GOLD_BORDER = "#D0A24E";
const LAV_BORDER = "#8E93C8";
const WHITE_BG = "#FBFAF4";
const WHITE_BORDER = "#C7C1AC";
const MAROON_BG = "#F6EDE8";
const MAROON_BORDER = "#B0504D";

const INK = "#2C2A22";
const INK_GOLD = "#5A3D12";
const INK_LAV = "#26283F";
const INK_RED = "#A30000";

// Requested vertical composition: lift ayah 13, then open the two lower
// group gaps by the same small amount while keeping 14–15 anchored.
const VERSE_LAYOUT_NUDGE = 0.03;
const FIRST_GAP_REDUCTION = 0.01;

// Every capsule is `isPill: false`, as in tevbe24Config and yasin36Config —
// SharedUI picks the verse font as `isPill ? 0.038 : 0.071`, so mixing the flag
// on one page puts its capsules on two baselines almost 2x apart. The rounded
// look comes from `styling.verseRadius`.
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

export const YASIN_13_19_CONFIG: SurahLayoutConfig = {
  id: "yasin1319",
  title: "YÂSÎN: 13-19",
  heroTitle: "Yâsîn",
  heroSubtitle: "suresi 13-19",

  scriptInfo: { title: "36 Yâ-Sîn", sayfa: 441, juz: 22, hizb: 44 },

  scriptHighlights: {
    "pre-start": [1, 2, 6, 7],
    end: [1, 2, 3, 4, 5, 6, 7],
  },

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: false,
    hideVerseNumbers: true,
  },

  dimensions: {
    paperWidth: 1.54,
    paperHeight: 1.78,
    // 0 rather than the usual −0.045: a plain vertical stack with no shape
    // hanging below its last capsule, so it wants to sit dead centre.
    sceneCenterYOffset: 0,
    // 0.20, as on the sibling sheet → sectionW 1.14, sectionInnerW 1.13.
    padding: 0.2,
    scrollPages: 3,
    fixedWidthAcrossLanguages: true,
  },

  specialVerses: {},

  // handwrittenNotes: yasinHandwrittenTitle(1.54, "13–19"),

  verseOverrides: {
    // Ayah 13 — the narrator's line, alone above the band.
    1: capsule(MAROON_BG, MAROON_BORDER, INK_RED, {
      circleTextCol: "#7C2C2A",
      // ONE line in a 0.90-wide capsule. Broken in two it could only be set
      // at 0.67, and the top line's marks were cropped by the capsule edge.
      textScaleOverride: 0.75,
      translationTextScaleOverride: 0.58,
      showNumber: true,
      displayNumber: 13,
    }),

    // Ayahs 14 · 15 — the sending, and the town's first objection.
    2: capsule(WHITE_BG, WHITE_BORDER, INK, {
      // 11 words over 2 lines in 0.82 — width-bound, tightest on the sheet.
      textScaleOverride: 0.81,
      translationTextScaleOverride: 0.44,
      showNumber: true,
      displayNumber: 14,
    }),
    3: capsule(WHITE_BG, WHITE_BORDER, INK_LAV, {
      // 15 words over TWO lines, not three: the third line was pure loss —
      // 0.54 against the 0.75 the same words hold when the last two clauses
      // share a line, and the capsule is 0.160 tall either way.
      textScaleOverride: 0.81,
      translationTextScaleOverride: 0.54,
      showNumber: true,
      displayNumber: 15,
    }),

    // Ayahs 16 · 17 — the messengers' reply, the framed pair.
    4: capsule(CREAM_BG, GOLD_BORDER, INK_GOLD, {
      // Match ayah 17's text size.
      textScaleOverride: 0.78,
      translationTextScaleOverride: 0.56,
      showNumber: true,
      displayNumber: 16,
    }),
    5: capsule(CREAM_BG, GOLD_BORDER, INK_GOLD, {
      textScaleOverride: 0.78,
      translationTextScaleOverride: 0.61,
      showNumber: true,
      displayNumber: 17,
    }),

    // Ayahs 18 · 19 — the threat, and the answer to it.
    6: capsule(WHITE_BG, WHITE_BORDER, INK_LAV, {
      textScaleOverride: 0.81,
      translationTextScaleOverride: 0.55,
      showNumber: true,
      displayNumber: 18,
    }),
    7: capsule(WHITE_BG, WHITE_BORDER, INK, {
      textScaleOverride: 0.81,
      translationTextScaleOverride: 0.58,
      showNumber: true,
      displayNumber: 19,
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
      maroonTheme: MAROON_BORDER,
      greenTheme: GOLD_BORDER,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: CREAM_BG,
      s2Group1Bg: CREAM_BG,
      s2Group2Bg: WHITE_BG,
      s2Group3Bg: MAROON_BG,
      // No side brackets — the three frames do that job. One fully transparent
      // entry makes SideCurves emit nothing (an empty [] would fall back to the
      // default olive bracket on every isCenter block, and all are centered).
      // ── THE LINK ACROSS THE EXCHANGE ───────────────────────────────────
      // The same move the 20-27 sheet makes: one bracket from the first outer
      // group to the second, straight past what sits between them. Here that is
      // ayah 15 ▸ ayah 18 — the townspeople's denial answered by their threat,
      // with the messengers' reply (16 · 17) passed on the way. It is anchored
      // on the INNER edge of each cream frame, so the bow's body lies in the
      // gap and the head lands on the group the frame below marks.
      //
      // nisa36Config's twisted arrow, one side only, with a slim tip and rule
      // in world units so its weight stays stable at every zoom level.
      //
      // `pair` is BLOCK indices: 13→0, 14→1, 15→2, 16→3, 17→4, 18→5, 19→6.
      //
      // The Y offsets correct for `smallBoxH2` — a bracket anchors with the
      // page-wide `capsuleHeight` (0.14 here) and these capsules are 0.160, so
      // each end misses its own capsule's centre by 0.010 until corrected.
      //
      // The last entry is the CENTER colour and stays transparent: every block
      // on this sheet is `isCenter`, and any that is also `isPushedIn` would
      // otherwise take a bracket of its own.
      curveColors: [
        {
          pair: [2, 5], // ayah 15 ▸ ayah 18
          // The surah's LINK colour — gold rule on a white ground, the same
          // pair the 1-12 sheet gives its 9a ▸ 9b bracket. Every arrow that
          // joins two groups now carries it; only 28-32's outer 29 ▸ 32 keeps a
          // colour of its own, being a frame's own chiasm rather than a link.
          color: GOLD_BORDER,
          fillColor: WHITE_BG,
          curveSide: "left",
          // Anchored on the capsules' left edge (0.360), with a shallow bow
          // that stays clear of the blue band.
          bowGap: 0.18,
          innerBowGap: 0.16,
          inwardOffset: 0,
          tipThickness: 0.09,
          topAnchorYOffset: 0.04,
          bottomAnchorYOffset: -0.05,
          topAnchorXOffset: 0.06,
          bottomAnchorXOffset: 0.2,
          lineWidthWorld: 0.003,
          opacity: 0.55,
          shape: "arrow",
          arrowHeadLength: 0.13,
          arrowHeadWidth: 0.08,
          twist: true,
          twistT: 0.5,
        },
        { color: "transparent", fillColor: "transparent" },
      ],
    },
    capsuleBorderWidth: 0.0038,
    circleBorderWidth: 0.003,
    verseRadius: 0.05,
    oppositeVerseConnectorRadius: 0.04,
    elevatedSectionRadii: {
      base: 0.04,
      outer: 0.026,
      innerA: 0.024,
      innerB: 0.022,
    },
  },

  globalSettings: {
    capsuleHeight: 0.14,
    columnGap: 0.02,
    rowGap: 0.014,
    blockGap: 0.018,
    sectionPadX: 0.005,
    blockPadding: 0.008,
    sectionBorderWidth: 0.006,
    // 0.75, against the sibling sheet's 0.57 — these capsules are 0.100 … 0.160
    // tall rather than 0.062 … 0.150, so the text scales up with them. Every
    // override above multiplies this and was solved against it.
    verseTextScale: 0.75,
    // 0.625 of the Arabic, the ratio Tevbe uses (0.50 / 0.80).
    translationVerseTextScale: 0.47,
    tightVersePadding: true,
  },

  // ── BLOCKS ───────────────────────────────────────────────────────────────
  // The solved stack (paperHeight 1.78, sceneCenterYOffset 0):
  //   totalContentH 1.288, contentStartY −0.246, content bottom −1.534
  //
  //   idx  block      ayah   H       frameY    capsule w   lines
  //    0   b_a13       13   0.156   −0.246       0.900      2
  //    1   b_a14       14   0.176   −0.477       0.820      2
  //    2   b_a15       15   0.176   −0.671       0.820      3
  //    3   b_a16       16   0.131   −0.885       0.680      1
  //    4   b_a17       17   0.116   −1.030       0.680      1
  //    5   b_a18       18   0.176   −1.184       0.820      2
  //    6   b_a19       19   0.156   −1.378       0.820      2
  //   visual nudges: 13 moves up 0.030; 14–15 move up 0.020 to tighten the
  //   first gap; 16–17 remain 0.030 down from the base stack; 18–19 remain
  //   0.080 down from the base stack.
  //
  // Block height is `2·blockPadding + capsuleHeight` (one row each); each frameY
  // is the previous block's bottom minus this block's gapBefore. The three big
  // gapBefores (0.075 on block 1, 0.038 on blocks 3 and 5) are the air the band
  // and band-inner frames need for their own edges — a frame's rule has to fit
  // between two capsules, and 0.038 is what two 0.0085 rules plus pads come to.
  blocks: [
    {
      id: "b_a13",
      type: "group",
      verseIds: [1],
      columns: 1,
      capsuleHeight: 0.14,
      horizontalInset: -0.39,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      verticalNudge: -VERSE_LAYOUT_NUDGE + 0.022,
    },
    {
      id: "b_a14",
      type: "group",
      verseIds: [2],
      columns: 1,
      capsuleHeight: 0.16,
      horizontalInset: -0.273,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.075,
      verticalNudge: -FIRST_GAP_REDUCTION,
      customSectionId: "sec_band",
    },
    {
      id: "b_a15",
      type: "group",
      verseIds: [3],
      columns: 1,
      capsuleHeight: 0.16,
      horizontalInset: -0.273,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.018,
      customSectionId: "sec_band",
    },
    {
      id: "b_a16",
      type: "group",
      verseIds: [4],
      columns: 1,
      capsuleHeight: 0.115,
      horizontalInset: -0.133,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.038,
      verticalNudge: VERSE_LAYOUT_NUDGE + FIRST_GAP_REDUCTION,
    },
    {
      id: "b_a17",
      type: "group",
      verseIds: [5],
      columns: 1,
      capsuleHeight: 0.1,
      horizontalInset: -0.133,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.014,
    },
    {
      id: "b_a18",
      type: "group",
      verseIds: [6],
      columns: 1,
      capsuleHeight: 0.16,
      horizontalInset: -0.273,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.038,
      customSectionId: "sec_band",
      verticalNudge: VERSE_LAYOUT_NUDGE + FIRST_GAP_REDUCTION,
    },
    {
      id: "b_a19",
      type: "group",
      verseIds: [7],
      columns: 1,
      capsuleHeight: 0.14,
      horizontalInset: -0.273,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.018,
      customSectionId: "sec_band",
    },
  ],

  // ── Drag / elevation zones ───────────────────────────────────────────────
  // One per frame drawn, INNERMOST FIRST: sectionResolver's reverse index is
  // first-wins, so each capsule lands in the tightest frame around it and an
  // outer zone owns only what no inner zone claimed — while still dragging the
  // inner ones with it, via the ancestor index. Peeling band-inner lifts the
  // reply; the band lifts the whole exchange; the outer frame lifts the sheet.
  customSections: [
    {
      id: "sec_reply",
      verseIds: [4, 5],
      cameraTarget: { y: 1.05, fov: 26, tilt: -1.4 },
    },
    // The two outer groups of the exchange. Same size as each other, so the
    // same camera — clicking either frames it the same way, which is part of
    // reading them as a pair. Capsule ids, not ayah numbers: id = ayah − 12.
    {
      id: "sec_claim",
      verseIds: [2, 3], // ayahs 14 · 15
      cameraTarget: { y: 1.1, fov: 28, tilt: -1.4 },
    },
    {
      id: "sec_threat",
      verseIds: [6, 7], // ayahs 18 · 19
      cameraTarget: { y: 1.1, fov: 28, tilt: -1.4 },
    },
    {
      id: "sec_band",
      verseIds: [2, 3, 4, 5, 6, 7],
      cameraTarget: { y: 1.2, fov: 31, tilt: -1.4 },
    },
    {
      id: "sec_all",
      verseIds: [1, 2, 3, 4, 5, 6, 7],
      cameraTarget: { y: 1.3, fov: 34, tilt: -1.35 },
    },
  ],

  // ── SVG SECTIONS ─────────────────────────────────────────────────────────
  // Each file is drawn flush with its plane and at the aspect it is displayed
  // at, so a frame's on-screen size IS (scaleX, scaleY) and its centre is the
  // plane centre — which is what each offsetY solves for:
  //     offsetY = (wanted frame centre) − (anchor block's frameY)
  // renderOrder MUST stay 2 < 3 < 4: each frame paints over the one below it.
  svgOverlays: [
    // Outer frame — blocks 0 … 6 (ayahs 13 … 19).
    //   expanded to clear the nudged 13–19 stack while staying inside the page
    {
      src: SHEET_FRAME_SVGS.overall,
      anchorGroupIndex: 0,
      anchorEdge: "top",
      scaleX: 1.07,
      scaleY: 1.47,
      offsetX: 0,
      offsetY: -0.71,
      renderOrder: 2,
      customSectionId: "sec_all",
    },
    // Middle band — blocks 1 … 6 (ayahs 14 … 19), i.e. everything but ayah 13.
    //   expanded at the bottom to clear the nudged 16–19 groups
    {
      src: "/yasin1319/band.svg",
      anchorGroupIndex: 1,
      anchorEdge: "top",
      scaleX: 0.95,
      scaleY: 1.234,
      offsetX: 0,
      offsetY: -0.573,
      renderOrder: 3,
      customSectionId: "sec_band",
    },
    // The claim and the denial — blocks 1 … 2 (ayahs 14 · 15).
    //   capsules −0.485 … −0.839; frame keeps 0.022 all round
    //   wanted: 0.865 x 0.40, y −0.462 … −0.862  (centre −0.662)
    {
      src: "/yasin1319/band-claim.svg",
      anchorGroupIndex: 1,
      anchorEdge: "top",
      scaleX: 0.9,
      scaleY: 0.42,
      offsetX: 0,
      offsetY: -0.185,
      renderOrder: 4,
      customSectionId: "sec_claim",
    },
    // Innermost frame — blocks 3 … 4 (ayahs 16 · 17).
    //   same frame-to-capsule relation; its whole group is nudged down 0.040
    {
      src: "/yasin1319/band-inner.svg",
      anchorGroupIndex: 3,
      anchorEdge: "top",
      scaleX: 0.78,
      scaleY: 0.3,
      offsetX: 0,
      offsetY: -0.1295,
      renderOrder: 4,
      customSectionId: "sec_reply",
    },
    // The threat and the answer — blocks 5 … 6 (ayahs 18 · 19). Mirror of the
    // claim frame, 0.022 shorter because ayah 19's capsule is 0.140 not 0.160.
    //   capsules −1.192 … −1.526
    //   same frame-to-capsule relation; its whole group is nudged down 0.080
    {
      src: "/yasin1319/band-threat.svg",
      anchorGroupIndex: 5,
      anchorEdge: "top",
      scaleX: 0.9,
      scaleY: 0.42,
      offsetX: 0,
      offsetY: -0.175,
      renderOrder: 4,
      customSectionId: "sec_threat",
    },
  ],

  sideInfo: {
    panelTitle: "Tefsir",
    byFoldStep: {
      "pre-start": {
        kicker: "YÂSÎN: 13-19",
        paragraphs: [
          "Bu sayfa, Yâsîn suresinin bir kıssasını gösteriyor: bir şehre gönderilen elçilerin kıssası. Ayetler yine alt alta sıralanmış değil; iç içe üç çerçeve hâlinde dizilmiştir.",
          "En dıştaki çerçeve yedi ayeti birlikte tutar. Onun içindeki çerçeve, şehir halkı ile elçiler arasındaki konuşmayı tutar. En içteki küçük çerçeve ise elçilerin cevabını tutar.",
          "13. ayet niçin ortadaki çerçevenin dışında kaldı? Çünkü o, konuşmanın kendisi değil, konuşmayı anlatan cümledir: “Onlara şu şehir halkını örnek ver.” Anlatan, anlatılanın içine girmez.",
        ],
      },
      end: {
        paragraphs: [
          "Şimdi ortadaki çerçeveye bakalım. Burada bir karşılıklı konuşma var ve bu konuşmanın tam ortasında elçilerin cevabı duruyor:",
          {
            capsules: [
              {
                n: 14,
                text: "14. ayet — Onlara iki elçi gönderdik, yalanladılar; bir üçüncüsüyle güçlendirdik.",
                bg: WHITE_BG,
                color: WHITE_BORDER,
                textColor: INK,
              },
              {
                n: 15,
                text: "15. ayet — “Siz de bizim gibi insandan başka değilsiniz; Rahmân bir şey indirmedi.”",
                bg: WHITE_BG,
                color: WHITE_BORDER,
                textColor: INK_LAV,
              },
              {
                n: 16,
                text: "16. ayet — “Rabbimiz biliyor ki biz gerçekten size gönderilmiş elçilerdeniz.”",
                bg: CREAM_BG,
                color: GOLD_BORDER,
                textColor: INK_GOLD,
              },
              {
                n: 17,
                text: "17. ayet — “Bize düşen, apaçık bir tebliğden başka bir şey değildir.”",
                bg: CREAM_BG,
                color: GOLD_BORDER,
                textColor: INK_GOLD,
              },
              {
                n: 18,
                text: "18. ayet — “Sizin yüzünüzden uğursuzluğa uğradık; vazgeçmezseniz sizi taşlarız.”",
                bg: WHITE_BG,
                color: WHITE_BORDER,
                textColor: INK_LAV,
              },
              {
                n: 19,
                text: "19. ayet — “Uğursuzluğunuz kendinizdendir. Size hatırlatıldı diye mi? Hayır, siz haddi aşan bir topluluksunuz.”",
                bg: WHITE_BG,
                color: WHITE_BORDER,
                textColor: INK,
              },
            ],
            corners: "soft",
          },
          "Dikkat ediniz: 15 ve 18. ayetler şehir halkının sözleridir; biri elçiliği inkâr eder, diğeri tehdit eder. 14 ve 19. ayetler ise bu iki sözü çerçeveler. Tam ortada, 16 ve 17. ayetlerde elçilerin cevabı vardır ve bu cevap iki cümleden fazlası değildir: “Rabbimiz biliyor” ve “bize düşen sadece tebliğdir.”",
          "Bu yüzden 16 ve 17. ayetler en içteki çerçevenin içine konulmuştur. Sayfanın söylediği şey şudur: dört ayetlik itiraz ve tehdit, iki ayetlik bir cevabı kuşatmaktadır. Elçinin işi tartışmayı kazanmak değil, mesajı açıkça ulaştırmaktır. Gerisi muhatabın kendi hesabıdır.",
          "Bir de şuna dikkat ediniz: şehir halkı “uğursuzluk” derken suçu dışarıda arıyor. 19. ayet bunu tersine çevirir: “Uğursuzluğunuz kendinizdendir.” İnsan, kendi tercihinin sonucunu başkasına yüklediğinde hakikate bir kapı daha kapatmış olur.",
        ],
      },
    },
  },

  animations: {
    computeFoldYPositions: (lm) => {
      // fold0 — between ayah 13 and the band's first capsule (blocks 0 → 1),
      // i.e. exactly where the band's top edge runs.
      const fold0 =
        (lm.groupYPositions[0] - lm.groupHeights[0] + lm.groupYPositions[1]) /
        2;
      // fold1 — the band-inner frame's top edge (blocks 2 → 3).
      const fold1 =
        (lm.groupYPositions[2] - lm.groupHeights[2] + lm.groupYPositions[3]) /
        2;
      // fold2 — the band-inner frame's bottom edge (blocks 4 → 5).
      const fold2 =
        (lm.groupYPositions[4] - lm.groupHeights[4] + lm.groupYPositions[5]) /
        2;
      // fold3 — between the last two capsules (blocks 5 → 6).
      const fold3 =
        (lm.groupYPositions[5] - lm.groupHeights[5] + lm.groupYPositions[6]) /
        2;
      return [fold0, fold1, fold2, fold3];
    },

    foldSteps: [
      {
        // The sheet arrives creased along the two inner-frame edges, so the
        // reader meets ayah 13 and the outer exchange first and opens the
        // messengers' reply by scrolling.
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

export const YASIN_13_19_TEXT_AR: SurahDataShape = {
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
            text: "وَاضْرِبْ لَهُمْ مَثَلًا أَصْحَابَ الْقَرْيَةِ إِذْ جَاءَهَا الْمُرْسَلُونَ",
          },
        ],
      },
      {
        verses: [
          {
            number: 2,
            text: "إِذْ أَرْسَلْنَا إِلَيْهِمُ اثْنَيْنِ فَكَذَّبُوهُمَا\nفَعَزَّزْنَا بِثَالِثٍ فَقَالُوا إِنَّا إِلَيْكُمْ مُرْسَلُونَ",
          },
        ],
      },
      {
        verses: [
          {
            number: 3,
            text: "قَالُوا مَا أَنْتُمْ إِلَّا بَشَرٌ مِثْلُنَا وَمَا أَنْزَلَ الرَّحْمَٰنُ\nمِنْ شَيْءٍ إِنْ أَنْتُمْ إِلَّا تَكْذِبُونَ",
          },
        ],
      },
      {
        verses: [
          {
            number: 4,
            text: "قَالُوا رَبُّنَا يَعْلَمُ إِنَّا إِلَيْكُمْ لَمُرْسَلُونَ",
          },
        ],
      },
      {
        verses: [
          { number: 5, text: "وَمَا عَلَيْنَا إِلَّا الْبَلَاغُ الْمُبِينُ" },
        ],
      },
      {
        verses: [
          {
            number: 6,
            text: "قَالُوا إِنَّا تَطَيَّرْنَا بِكُمْ لَئِنْ لَمْ تَنْتَهُوا\nلَنَرْجُمَنَّكُمْ وَلَيَمَسَّنَّكُمْ مِنَّا عَذَابٌ أَلِيمٌ",
          },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "قَالُوا طَائِرُكُمْ مَعَكُمْ أَئِنْ\nذُكِّرْتُمْ بَلْ أَنْتُمْ قَوْمٌ مُسْرِفُونَ",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const YASIN_13_19_TEXT_TR: SurahDataShape = {
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
            text: "Onlara şu şehir halkını örnek ver:\nkendilerine elçiler gelmişti.",
          },
        ],
      },
      {
        verses: [
          {
            number: 2,
            text: "Onlara iki elçi gönderdik, ikisini de yalanladılar;\nbir üçüncüsüyle güçlendirdik. “Biz size gönderilmiş elçilerdeniz” dediler.",
          },
        ],
      },
      {
        verses: [
          {
            number: 3,
            text: "Dediler: “Siz de bizim gibi\ninsandan başka değilsiniz. Rahmân\nbir şey indirmedi; siz sadece yalan söylüyorsunuz.”",
          },
        ],
      },
      {
        verses: [
          {
            number: 4,
            text: "Dediler: “Rabbimiz biliyor ki biz gerçekten size gönderilmiş elçilerdeniz.”",
          },
        ],
      },
      {
        verses: [
          {
            number: 5,
            text: "“Bize düşen, apaçık bir tebliğden başka bir şey değildir.”",
          },
        ],
      },
      {
        verses: [
          {
            number: 6,
            text: "Dediler: “Sizin yüzünüzden uğursuzluğa uğradık.\nVazgeçmezseniz sizi taşlarız ve bizden acı bir azap dokunur size.”",
          },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "Dediler: “Uğursuzluğunuz kendinizdendir.\nSize hatırlatıldı diye mi? Hayır, siz haddi aşan bir topluluksunuz.”",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const YASIN_13_19_TEXT_EN: SurahDataShape = {
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
            text: "Set out for them the parable of the people of the town,\nwhen the messengers came to it.",
          },
        ],
      },
      {
        verses: [
          {
            number: 2,
            text: "We sent them two, and they denied them both,\nso We reinforced them with a third. They said: “We are messengers sent to you.”",
          },
        ],
      },
      {
        verses: [
          {
            number: 3,
            text: "They said: “You are nothing but\nmen like ourselves. The Most Merciful\nhas sent nothing down; you are only lying.”",
          },
        ],
      },
      {
        verses: [
          {
            number: 4,
            text: "They said: “Our Lord knows that we are truly messengers sent to you.”",
          },
        ],
      },
      {
        verses: [
          {
            number: 5,
            text: "“And ours is only to deliver the message plainly.”",
          },
        ],
      },
      {
        verses: [
          {
            number: 6,
            text: "They said: “We see an evil omen in you.\nIf you do not stop, we will surely stone you, and a painful punishment from us will touch you.”",
          },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "They said: “Your omen is with yourselves.\nIs it because you were reminded? No — you are a people who transgress.”",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const YASIN_13_19_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: YASIN_13_19_TEXT_AR,
  en: YASIN_13_19_TEXT_EN,
  tr: YASIN_13_19_TEXT_TR,
};
