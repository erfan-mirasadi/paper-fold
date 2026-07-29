/**
 * MÂÛN 107 — Al-Ma'un, all 7 ayahs, laid out as the reference book page.
 *
 * COMPOSITION (the Arabic page is the master; the Turkish page is the same
 * composition with every row mirrored, which the TEXT DATA does — the geometry
 * below never moves):
 *
 *   ┌──────────────────────────────────────────────────────────┐ ← outer frame (1–7)
 *   │  ┌────────────────────────────────────────────────────┐  │ ← first section (1–3)
 *   │  │            ┌───────────────────────┐               │  │
 *   │  │            │          (1)          │               │  │ peach, the ana ayet
 *   │  │            └───────────────────────┘               │  │
 *   │  │   ┌──────────────────┐  ┌──────────────────┐       │  │
 *   │  │   │       (3)        │  │       (2)        │       │  │ peach pair
 *   │  │   └──────────────────┘  └──────────────────┘       │  │
 *   │  └────────────────────────────────────────────────────┘  │
 *   │   ┌───────────────────┐      ┌───────────────────┐       │
 *   │   │  ┌─────────────┐  │      │  ┌─────────────┐  │       │ ← two half boxes,
 *   │   │  │     (6)     │  │      │  │     (4)     │  │       │   blue
 *   │   │  └─────────────┘  │      │  └─────────────┘  │       │
 *   │   │  ┌─────────────┐  │      │  ┌─────────────┐  │       │
 *   │   │  │     (7)     │  │      │  │     (5)     │  │       │
 *   │   │  └─────────────┘  │      │  └─────────────┘  │       │
 *   │   └───────────────────┘      └───────────────────┘       │
 *   └──────────────────────────────────────────────────────────┘
 *
 * MIRRORING. Arabic reads right→left, so ayah 2 sits in the RIGHT column of the
 * pair and 4–5 take the RIGHT half of the lower band; Turkish/English read
 * left→right and want the opposite. The blocks are always [left, right] slots
 * and each language's `colorGroups` simply put its own ayah in the slot that
 * reads first — the same trick nisa23Config / tevbe24Config use. Capsule colours
 * follow the SLOT (they resolve through the Arabic id at that transform), which
 * is harmless here: 2 and 3 share one style, and so do 4–7.
 *
 * The lower band is authored as two 2-COLUMN ROWS (4|6 then 5|7) rather than as
 * four half-width blocks with a `verticalNudge`, so the engine's own
 * auto-centring still applies and no `contentStartYOverride` is needed — the
 * whole composition lands centred on the paper by construction (see the
 * VERTICAL BUDGET below).
 *
 * NO SIDE CURVES on this page: the reference draws small arrows between the
 * pairs, not the project's side brackets, so `curveColors` is a single
 * transparent entry (an empty [] would fall back to the default olive bracket).
 *
 * FOLDING — ONE crease, in the gap between the first section and the lower
 * band. At `pre-start` the band is folded away and only the ana bölüm (1–3)
 * faces the reader; `end` lays the page flat.
 *
 * BACKGROUND SECTIONS — /maun/all-section.svg is the project's own all-section
 * frame redrawn at this page's landscape aspect (see the file header for why a
 * page-local copy); the two inner frames are /maun/frame-top.svg (peach) and
 * /maun/frame-side.svg (pale blue, used twice). Each file is drawn AT the
 * aspect it is displayed at, so read its header before touching any
 * scaleX/scaleY below.
 */

import type { SurahLayoutConfig } from "../schema";
import type { SurahDataShape } from "../SurahConfig";
import type { SurahLanguage } from "../../hooks/useSurahLanguageStore";
import {
  CAPSULE_BG_6_19,
  WHITE_VERSE_BG,
  ORANGE_THEME,
  GREEN_THEME,
  GREEN_VERSE_BG,
} from "../theme";

// ---------------------------------------------------------------------------
// PALETTE — two families, exactly as the reference page prints them: the first
// section warm (peach), the two accusation boxes cool (pale blue). Both capsule
// backgrounds are the project's own theme colours; only the outlines and text
// tones are local, each picked to sit on its own background.
// ---------------------------------------------------------------------------

const PEACH_BG = CAPSULE_BG_6_19; // #EFE2C7 — ayahs 1, 2, 3
const PEACH_BORDER = ORANGE_THEME; // #C4963B
const PEACH_BADGE_TEXT = "#7A5A18";

const WHITE_BG = WHITE_VERSE_BG; // White — ayahs 4, 5, 6, 7
const WHITE_BORDER = "#C7C1AC";
const WHITE_TEXT = "#2C2A22";

// The Arabic page prints every capsule in black ink; the Turkish page prints the
// first section's three meal lines in red. Hence the split on ayahs 1–3.
const RED_TEXT = "#A30000";
const DARK_TEXT = "#1E1E1E";

const peachBox = (extra: Record<string, unknown> = {}) => ({
  bg: PEACH_BG,
  border: PEACH_BORDER,
  circleBg: PEACH_BG,
  circleBorderCol: PEACH_BORDER,
  circleTextCol: PEACH_BADGE_TEXT,
  textColor: DARK_TEXT,
  translationTextColor: RED_TEXT,
  isPill: false,
  ...extra,
});

const GREEN_BG = GREEN_VERSE_BG;
const GREEN_BORDER = GREEN_THEME;
const GREEN_BADGE_TEXT = "#2F4035";

/** Shared shape for the green capsules (2, 3). */
const greenBox = (extra: Record<string, unknown> = {}) => ({
  bg: GREEN_BG,
  border: GREEN_BORDER,
  circleBg: GREEN_BG,
  circleBorderCol: GREEN_BORDER,
  circleTextCol: GREEN_BADGE_TEXT,
  textColor: DARK_TEXT,
  translationTextColor: RED_TEXT,
  isPill: false,
  ...extra,
});

/** Shared shape for the four white capsules (4, 5, 6, 7). */
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
// SIDE-PANEL (tafsir) palette — the little boxed diagrams the book draws in its
// running text. Same two families as the paper so the panel reads as the same
// document.
// ---------------------------------------------------------------------------

const PANEL_PEACH_BOX =
  "background:#EFE2C7;border:1px solid #C4963B;border-radius:7px;padding:6px 16px;color:#4A3617;white-space:nowrap;";
const PANEL_WHITE_BOX =
  "background:#ffffff;border:1px solid #C7C1AC;border-radius:7px;padding:6px 16px;color:#2C2A22;white-space:nowrap;";

export const MAUN_107_CONFIG: SurahLayoutConfig = {
  id: "maun107",
  title: "Mâûn Suresi",
  heroTitle: "Mâûn",
  heroSubtitle: "Suresi",

  scriptInfo: {
    title: "Mâûn Suresi",
    sayfa: 602,
    juz: 30,
    hizb: 60,
  },

  // Fold-story → script sync (left ayah-list sidebar): exactly the ayahs still
  // facing the reader at each fold step.
  scriptHighlights: {
    "pre-start": [1, 2, 3],
    end: [1, 2, 3, 4, 5, 6, 7],
  },

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: false,
    hideVerseNumbers: false,
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

  // ── Per-verse appearance ─────────────────────────────────────────────────
  // Every capsule is a rounded rectangle (`isPill: false`, radius
  // `styling.verseRadius`), so its text is CENTRED and sized off the big-verse
  // base (0.071) rather than the pill base (0.038).
  //
  // Text scales are per-ayah because the phrases differ a lot in length:
  // وَيَمْنَعُونَ الْمَاعُونَ is two words, الَّذِينَ هُمْ عَنْ صَلَاتِهِمْ سَاهُونَ is five —
  // and their translations invert that ratio. The budget a line has before it
  // reaches the number badge is `capsule width − 0.094`.
  verseOverrides: {
    // Ayah 1 — the ana ayet, alone on the first row and the widest capsule.
    1: peachBox({
      textScaleOverride: 0.6,
      translationTextScaleOverride: 0.4,
    }),
    2: greenBox({
      textScaleOverride: 0.6,
      translationTextScaleOverride: 0.4,
    }),
    3: greenBox({
      textScaleOverride: 0.6,
      translationTextScaleOverride: 0.4,
    }),

    // Ayahs 4–7 — the lower band. Upper row is 4 (right half) / 6 (left half),
    // lower row 5 / 7; see the MIRRORING note in the file header.
    4: whiteBox({
      textScaleOverride: 0.6,
      translationTextScaleOverride: 0.42,
    }),
    5: whiteBox({
      textScaleOverride: 0.57,
      translationTextScaleOverride: 0.38,
    }),
    6: whiteBox({
      textScaleOverride: 0.6,
      translationTextScaleOverride: 0.38,
    }),
    7: whiteBox({
      textScaleOverride: 0.6,
      translationTextScaleOverride: 0.38,
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
      maroonTheme: PEACH_BORDER,
      greenTheme: WHITE_BORDER,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: PEACH_BG,
      s2Group1Bg: GREEN_BG,
      s2Group2Bg: WHITE_BG,
      s2Group3Bg: WHITE_BG,
      // No side brackets on this page — see the file header.
      curveColors: [{ color: "transparent", fillColor: "transparent" }],
    },
    capsuleBorderWidth: 0.0042,
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

  // ── GLOBAL SIZING ────────────────────────────────────────────────────────
  globalSettings: {
    capsuleHeight: 0.125, // the first section's rows; the band overrides to 0.15
    columnGap: 0.02, // the WIDTH reference for every column (see below)
    rowGap: 0.02,
    blockGap: 0.008,
    sectionPadX: 0.005,
    blockPadding: 0.012,
    sectionBorderWidth: 0.006,
    verseTextScale: 0.55,
    translationVerseTextScale: 0.4,
    // Every capsule is a rounded rect, and without this the engine reserves the
    // wide decorative padding a "big verse" needs (0.083 per side, plus 0.07
    // more in translations) — which on a 0.44-wide capsule leaves 62% of it
    // unusable. Tight padding pulls the number badge to the wall and lets the
    // text use the full width; the per-ayah scales above keep every line inside
    // `width − 0.094` so no line ever runs under the badge.
    tightVersePadding: true,
  },

  handwrittenNotes: [
    {
      x: 0.77,
      y: -0.1,
      fontSize: 0.05,
      color: "#7C2C2A",
      lineSpacing: 1.4,
      maxWidth: 1.5,
      textAlign: "center",
      rotationZ: 0,
      lines: [{ text: "Mâûn Suresi" }],
    },
  ],

  // ── BLOCKS ───────────────────────────────────────────────────────────────
  // HORIZONTAL BUDGET. A block's capsule column is always
  //     colW = (0.95 − 2·horizontalInset − 2·0.012 − 0.02) / 2 = 0.453 − inset
  // (0.95 = the engine's content column at sectionPadX 0.005), and a 2-column
  // block centres its pair on x 0.77 with `columnGap` between them. Every inset
  // below was chosen from that identity:
  //
  //   outer frame       1.14    x 0.200 … 1.340
  //   first section     1.06    x 0.240 … 1.300
  //   half frames       0.50    x 0.240 … 0.740  /  0.800 … 1.300
  //   ayah 1            0.64    x 0.450 … 1.090
  //   ayahs 2 / 3       0.485   x 0.275 … 0.760  /  0.780 … 1.265
  //   ayahs 4–7         0.44    x 0.270 … 0.710  /  0.830 … 1.270
  //
  // The band's two capsules are pushed apart by a per-block `columnGap` of 0.12
  // (the WIDTH math keeps using the global 0.02 — that decoupling is the
  // engine's own, see buildBlockTransforms), which is what opens the channel
  // between the two half frames.
  //
  // VERTICAL BUDGET, in absolute page Y (contentStartY = −0.547, paper top 0).
  // Frames clear their blocks by 0.022, which puts 0.034 of air above and under
  // every capsule and 0.032 between the two rows inside a frame:
  //
  //   block  frame top   frame h   capsule
  //     0     −0.547      0.149    ayah 1        −0.559 … −0.684
  //     1     −0.704      0.149    ayahs 3 | 2   −0.716 … −0.841
  //     2     −0.967      0.174    ayahs 6 | 4   −0.979 … −1.129
  //     3     −1.149      0.174    ayahs 7 | 5   −1.161 … −1.311
  //
  //   first section frame   −0.525 … −0.875     (h 0.350)
  //   crease                −0.910              (mid of the 0.07 channel)
  //   half frames           −0.945 … −1.345     (h 0.400)
  //   outer frame           −0.485 … −1.385     (h 0.900, centre −0.935 =
  //                                              the engine's paper centre)
  //
  // allGroups index (used by svgOverlays anchorGroupIndex) == block index.
  blocks: [
    // 0 — Ayah 1, the ana ayet. Alone and centred.
    {
      id: "b_v1",
      type: "group",
      verseIds: [1],
      columns: 1,
      capsuleHeight: 0.125,
      horizontalInset: -0.187, // → capsule width 0.64
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
    },
    // 1 — The peach pair. AR [3,2] (2 reads first, on the right); TR/EN [2,3].
    {
      id: "b_v23",
      type: "group",
      verseIds: [3, 2],
      columns: 2,
      capsuleHeight: 0.125,
      horizontalInset: -0.032, // → capsule width 0.485
      columnGap: 0.02,
      isCenter: true,
      dragBehavior: "group", // the pair travels together, as the book's arrow implies
      hideRowConnectors: true,
      gapBefore: 0.008,
    },
    // 2 — Lower band, UPPER row: left half's first ayah | right half's first.
    //     AR [6,4] · TR/EN [4,6].
    {
      id: "b_band_up",
      type: "group",
      verseIds: [6, 4],
      columns: 2,
      capsuleHeight: 0.15,
      horizontalInset: 0.013, // → capsule width 0.44
      columnGap: 0.12, // opens the channel between the two half frames
      isCenter: false,
      dragBehavior: "individual", // its two capsules live in DIFFERENT half boxes
      hideRowConnectors: true,
      gapBefore: 0.114, // 0.022 + the 0.07 channel + 0.022
    },
    // 3 — Lower band, LOWER row. AR [7,5] · TR/EN [5,7].
    {
      id: "b_band_down",
      type: "group",
      verseIds: [7, 5],
      columns: 2,
      capsuleHeight: 0.15,
      horizontalInset: 0.013,
      columnGap: 0.12,
      isCenter: false,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.008,
    },
  ],

  // ── Drag / elevation zones ───────────────────────────────────────────────
  // One zone per frame drawn on the page, innermost first: the reverse index is
  // first-wins, so each ayah lands in the tightest box drawn around it and
  // `sec_all` keeps only its own outer frame — which encloses the other three
  // and therefore drags all of them (see sectionResolver's ancestor index).
  //
  // The two half boxes are what the book pairs up (4 with 5, 6 with 7), so they
  // are zones even though their ayahs come from two different blocks.
  customSections: [
    {
      id: "sec_top",
      verseIds: [1, 2, 3],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.4 },
    },
    {
      id: "sec_right",
      verseIds: [4, 5],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.4 },
    },
    {
      id: "sec_left",
      verseIds: [6, 7],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.4 },
    },
    {
      id: "sec_all",
      verseIds: [1, 2, 3, 4, 5, 6, 7],
      cameraTarget: { y: 1.2, fov: 28, tilt: -1.35 },
    },
  ],

  // ── SVG SECTIONS ─────────────────────────────────────────────────────────
  // All three files are drawn flush with their plane and at the aspect they are
  // displayed at, so a frame's on-screen size IS (scaleX, scaleY) and its
  // centre is the plane centre — which is what every offsetY below solves for:
  //     offsetY = (wanted frame centre) − (anchor block's frame top)
  svgOverlays: [
    // Outer frame — wraps all seven ayahs.
    //   wanted: 1.14 x 0.900, y −0.485 … −1.385  (centre −0.935)
    {
      src: "/maun/all-section.svg",
      anchorGroupIndex: 0,
      anchorEdge: "top",
      scaleX: 1.14,
      scaleY: 0.9,
      offsetX: 0,
      offsetY: -0.388,
      renderOrder: 2,
      customSectionId: "sec_all",
    },
    // First section — ayahs 1 … 3.
    //   wanted: 1.06 x 0.350, y −0.525 … −0.875  (centre −0.700)
    {
      src: "/maun/frame-top.svg",
      anchorGroupIndex: 0,
      anchorEdge: "top",
      scaleX: 1.06,
      scaleY: 0.35,
      offsetX: 0,
      offsetY: -0.153,
      renderOrder: 3,
      customSectionId: "sec_top",
    },
    // Lower band, RIGHT half — AR ayahs 4–5, TR/EN ayahs 6–7.
    //   wanted: 0.50 x 0.400, y −0.945 … −1.345  (centre −1.145)
    {
      src: "/maun/frame-side.svg",
      anchorGroupIndex: 2,
      anchorEdge: "top",
      scaleX: 0.5,
      scaleY: 0.4,
      offsetX: 0.28, // == half of (frame width + the 0.06 channel)
      offsetY: -0.178,
      renderOrder: 3,
      customSectionId: "sec_right",
    },
    // Lower band, LEFT half — AR ayahs 6–7, TR/EN ayahs 4–5.
    {
      src: "/maun/frame-side.svg",
      anchorGroupIndex: 2,
      anchorEdge: "top",
      scaleX: 0.5,
      scaleY: 0.4,
      offsetX: -0.28,
      offsetY: -0.178,
      renderOrder: 3,
      customSectionId: "sec_left",
    },
  ],

  // ── TAFSIR PANEL ─────────────────────────────────────────────────────────
  // Transcribed from the reference book, pages 347–350, including the little
  // boxed diagrams it draws inside its running text.
  sideInfo: {
    panelTitle: "Tefsir",
    byFoldStep: {
      end: {
        paragraphs: [
          "Bu sureyi burada okumazdan önce, başka bir meal veya tefsirden okumanızı rica ediyorum.",
          "Peygamber Efendimizden önce Araplarda inanç da ibadet de, yardım da gösterişe, folklorik eğlencelere dönüşmüştü.",
          "Kur'an pek çok yanlışı tashih ettiği gibi, inancı, ibadeti ve yardımlaşmayı da temiz bir yörüngeye oturtmuştur:",
          "Kur'an-ı Kerimin bir çok ayetlerinde mümin insanın sıfatları şöyle özetlenir.",
          { html: '<span style="color:#BA5C51;">Mü\'min insan:</span>' },
          "1. Yerin göğün yaratıcısı olan bir Allah'a şeksiz şüphesiz iman eden insandır.",
          "2. Sonra da inandığı, iman ettiği Rabbine karşı güzel duygularını namazla ifade eder. İnsan olarak yaratılmanın gereğini yerine getirir.",
          "3. Yoksullara ve yetimlere karşı şefkat ilgi ve sorumluluk duyar. Malının zekatını vererek insanlık görevini yapar.",
          "İşte şu üç kelime mümini kısaca ifade ediyor:",
          {
            html: `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin:14px 0;font-size:13px;">
              <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
                <div style="${PANEL_PEACH_BOX}">1. İman</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">
                  <div style="${PANEL_PEACH_BOX}">2. İbadet</div>
                  <div style="${PANEL_PEACH_BOX}">3. yardımlaşma</div>
                </div>
              </div>
              <div style="font-weight:600;color:#7A5A18;">Yani:</div>
              <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
                <div style="${PANEL_PEACH_BOX}">1. İman</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">
                  <div style="${PANEL_PEACH_BOX}">2. Namaz</div>
                  <div style="${PANEL_PEACH_BOX}">3. Zekat</div>
                </div>
              </div>
            </div>`,
          },
          {
            html: `<p style="margin:0;"><span style="color:#A30000;">Allaha, peygambere, dine karşı savaş açmış olan Mekkeli zalim (kafirler) ise:</span> Yukarıda formüle edilen üç esası tersine çevirmiş kimselerdir.</p>`,
          },
          "1. İman yerine inkarı seçmiş, Allahın dinini yalanlamışlardır.",
          "2. Allaha ibadet etmiyorlar. Çeşitli şeylere tapıyorlar.",
          "3. Yoksul ve yetimlere karşı ilgisiz davranıyorlar. İyilik damarları kurumuş.",
          "İşte bu sure böyle bir kafirin portresini bu üç kelime ile çiziyor.",
          {
            html: `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;margin:14px 0;font-size:13px;">
              <div style="${PANEL_WHITE_BOX}">1. İmansız</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">
                <div style="${PANEL_WHITE_BOX}">2. Namazsız</div>
                <div style="${PANEL_WHITE_BOX}">3. Zekatsız</div>
              </div>
            </div>`,
          },
          {
            html: `<div style="background:#F2E6DD; border:1px solid #DDBB99; border-radius:12px; padding:16px; margin:16px 0; display:flex; flex-direction:column; gap:16px; font-size:13px;">
              <div style="border:1px solid #82B38A; background:#EBF4EC; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
                <div style="background:#ffffff; border:1px solid #82B38A; border-radius:6px; padding:6px 12px; text-align:center; color:#BA5C51; font-weight:600; width:fit-content; margin:0 auto;">
                  1. Şu, dini yalanlayan adamı gördün mü?
                </div>
                <div style="display:flex; justify-content:center; gap:8px; align-items:center;">
                  <div style="background:#ffffff; border:1px solid #82B38A; border-radius:6px; padding:6px 12px;">
                    2. İşte o, yetimi itip kakıyor
                  </div>
                  <div style="color:#82B38A; font-weight:bold; font-size:24px; line-height:1; display:flex; align-items:center;">➔</div>
                  <div style="background:#ffffff; border:1px solid #82B38A; border-radius:6px; padding:6px 12px;">
                    3. Ve yoksulu doyuralım demiyor.
                  </div>
                </div>
              </div>

              <div style="border:1px solid #7FA4C4; background:#EAF0F6; border-radius:8px; padding:12px; display:flex; gap:12px;">
                <div style="display:flex; flex-direction:column; gap:6px; flex:1;">
                  <div style="background:#ffffff; border:1px solid #7FA4C4; border-radius:6px; padding:6px 12px; text-align:center;">
                    4. Yazık o ( puta) tapanlara !
                  </div>
                  <div style="text-align:center; color:#7FA4C4; font-size:16px; font-weight:bold; transform:scaleY(1.5);">↓</div>
                  <div style="background:#ffffff; border:1px solid #7FA4C4; border-radius:6px; padding:6px 12px; text-align:center;">
                    5. Onların namazdan, (Allaha ibadetten) haberleri yok!
                  </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:6px; flex:1;">
                  <div style="background:#ffffff; border:1px solid #7FA4C4; border-radius:6px; padding:6px 12px; text-align:center;">
                    6. Onlar (zenginlikleriyle) de sadece gösteriş yaparlar.
                  </div>
                  <div style="text-align:center; color:#7FA4C4; font-size:16px; font-weight:bold; transform:scaleY(1.5);">↓</div>
                  <div style="background:#ffffff; border:1px solid #7FA4C4; border-radius:6px; padding:6px 12px; text-align:center;">
                    7. İhtiyaç sahiplerine küçük bir iyilikleri bile olmaz.
                  </div>
                </div>
              </div>
            </div>`,
          },
          {
            html: `<div style="border:1px solid #82B38A; background:#EBF4EC; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px; font-size:13px; margin-bottom:16px;">
              <div style="background:#ffffff; border:1px solid #82B38A; border-radius:6px; padding:6px 12px; text-align:center; color:#BA5C51; font-weight:600; width:fit-content; margin:0 auto;">
                1. Şu, dini yalanlayan adamı gördün mü?
              </div>
              <div style="display:flex; justify-content:center; gap:8px; align-items:center;">
                <div style="background:#ffffff; border:1px solid #82B38A; border-radius:6px; padding:6px 12px;">
                  2. İşte o, yetimi itip kakıyor
                </div>
                <div style="color:#82B38A; font-weight:bold; font-size:24px; line-height:1; display:flex; align-items:center;">➔</div>
                <div style="background:#ffffff; border:1px solid #82B38A; border-radius:6px; padding:6px 12px;">
                  3. Ve yoksulu doyuralım demiyor.
                </div>
              </div>
            </div>`,
          },
          {
            html: `<div style="background:#F3EAD3; border:1px solid #D8D0B3; border-radius:8px; padding:16px; font-size:14px; color:#2C2A22;">
              <p style="margin:0 0 10px 0;"><span style="color:#BA5C51; font-weight:700;">ANA BÖLÜM üç ayettir. 1. Ayet:</span> Bu ayet birinci bölümün ana ayeti olduğu gibi Surenin de "ana" ayetidir.</p>
              <p style="margin:0 0 10px 0;">Ana Ayetin konusu imansızlıktır; Tevhit dinini inkar eden yani inanmayan bedbaht bir adamdan bahsediyor. O adam kendi yaratıcısı ile inanç bağını kuramamış bir zavallıdır.</p>
              <p style="margin:0 0 10px 0;"><span style="font-weight:700;">2. ve 3. Ayetler:</span> O bedbaht adamın "iyilik duygusunu da kaybetmiş" olduğunu ilan ediyor. Yüreği katılaşmış bencil, ilgisiz ve duyarsız, fakir ve kimsesizleri düşünmez bir adam olduğunu deşifre ediyor.</p>
              <p style="margin:0;">Bu sureden anlıyorum ki; Ben dindar bir insan olmak istiyorsam Allah'a ibadetle beraber fakirleri ve yetimleri de düşüneceğim. Benim vicdanım zaten bunu emrediyor. Kur'an da bunları söylemekle vicdanları iyiliğe uyarıyor, motive ediyor. Toplumda yardımlaşmayı, sosyal adaleti, sosyal barışı ve güvenliği sağlamak istiyor.</p>
            </div>`,
          },
          {
            html: `<div style="border:1px solid #7FA4C4; background:#EAF0F6; border-radius:8px; padding:12px; display:flex; gap:12px; margin:16px 0; font-size:13px;">
              <div style="display:flex; flex-direction:column; gap:6px; flex:1;">
                <div style="background:#ffffff; border:1px solid #7FA4C4; border-radius:6px; padding:6px 12px; text-align:center;">
                  4. Yazık o namaz kılar gibi (putların karşısında) tapınanlara !
                </div>
                <div style="text-align:center; color:#7FA4C4; font-size:16px; font-weight:bold; transform:scaleY(1.5);">↓</div>
                <div style="background:#ffffff; border:1px solid #7FA4C4; border-radius:6px; padding:6px 12px; text-align:center;">
                  5. Onların gerçek bir ibadetten haberleri yoktur !
                </div>
              </div>
              <div style="display:flex; flex-direction:column; gap:6px; flex:1;">
                <div style="background:#ffffff; border:1px solid #7FA4C4; border-radius:6px; padding:6px 12px; text-align:center;">
                  6. Onların zenginleri sadece gösteriş peşindedirler.
                </div>
                <div style="text-align:center; color:#7FA4C4; font-size:16px; font-weight:bold; transform:scaleY(1.5);">↓</div>
                <div style="background:#ffffff; border:1px solid #7FA4C4; border-radius:6px; padding:6px 12px; text-align:center;">
                  7. İhtiyaç sahiplerine küçük bir iyilikleri bile olmaz.
                </div>
              </div>
            </div>`,
          },
          {
            html: `<div style="display:flex; gap:0; border:1px solid #C7C1AC; border-radius:8px; background:#F2F2F2; font-size:13px; color:#2C2A22; overflow:hidden; margin-bottom:16px;">
              <div style="flex:1; padding:12px; border-right:1px solid #C7C1AC;">
                <div style="font-weight:700; margin-bottom:4px;">İKİNCİ BÖLÜM:</div>
                <p style="margin:0;">4. ve 5. ayet: Yazık o putperestlere ki, putların karşısında namaz kılar gibi ibadet niyetine el çırparak, ıslık çalarak, sarhoş olarak bir takım merasimler yaparlar da,<br/>'Bir' olan Allah'a karşı yapmaları gereken şirksiz, temiz bir ibadet olan <span style="font-weight:700;">namazdan haberleri yoktur.</span></p>
              </div>
              <div style="flex:1; padding:12px;">
                <div style="font-weight:700; margin-bottom:4px;">ÜÇÜNCÜ BÖLÜM:</div>
                <p style="margin:0;">6. ve 7. ayet: Gösteriş için her masrafı yaparlar, servet harcarlar fakat hiçbir sosyal yaraya merhem olmazlar. Yoksulların küçük bir ihtiyacını bile karşılamazlar. Karşılık beklemeden iyilik yapmak demek olan <span style="font-weight:700;">zekattan haberleri yoktur.</span></p>
              </div>
            </div>`,
          },
          "Enfal Suresi, 35. ayet bu müşrikler hakkında: Onların namazları (tapınmaları) Ka'bede ıslık çalmak ve el çırpmaktan ibarettir. Buyurmaktadır.",
          "Önemli bir not: Kur'anın tahkir ettiği kafir; hem Rabbinin lütufuna, hem de insanların hukukuna saygısızlık eden zalim kafirlerdir.",
          "Yoksa her toplumda hukuka saygılı, şefkatli ve iyilik sever olan fakat dini açıdan kendisini dindar saymayan insanlar da vardır. Ayrıca iman etmek için sırasını vaktini bekleyen henüz iman etmemiş insanlar da çoktur. Kendisi bir dine inanmasa bile inananlara karşı saygılı olan medeni ve hukuka saygılı kimseler de vardır.",
          "Bu surede Kur'anın zemmettiği kimseler bunlar değildir. Burada zemmedilen kimseler yetim ve yoksullara karşı şefkatsiz, hak ve hakikate karşı inat içinde, hatta iyi insanlarla ve inananlarla haksız yere mücadele eden 'zalim kafirlerdir'. Cahiliye döneminin statükosundan beslenen çıkarcı, israfçı, iyilik sevmez müşriklerdir. Bunlar duygusal sebeplerle İslama karşı da mücadele içindedirler. Her türlü insan haklarını da hiç pervasız çiğnemektedirler.",
          "Dirilişin çaresi de Maun suresinde saklı; “Peygamberlerin tebliğ ve temsil ettikleri 'gerçek dini' hayatımıza hayat yapmak”.",
          "Evet “Din hayatın hayatı, hem nuru, hem esası. Gerçek din, saf bir din ile olur insanlığın ihyası”. O da Allahın bildirdiği ve razı olduğu dindir.",
          "Evet Din insanlığa ruh üflüyor, hayata anlam katıyor. İnsana ulvi zevk ve heyecanlarını hatırlatıyor. İnsana, insan olmanın şartlarını, sorumluluklarını bildiriyor.",
          "Din; insanı, maddenin karanlık ve boğucu zindanından kurtarıp madde ötesi ufuklarda gezdiriyor. Bizi, ezeli ve ebedi olan, her hakikatin kendisine dayandığı, mukaddes, münezzeh bir Allah ile tanıştırıyor.",
          "Dinin, vicdanın, canlı olduğu yerde herkes, Allaha ve insanlara karşı kendi sorumluluklarını düşünür.",
        ],
      },
    },
  },

  animations: {
    // ONE crease, in the channel between the first section's frame and the two
    // half frames — the only gap on the page wide enough to fold through.
    computeFoldYPositions: (lm) => {
      const fold0 =
        (lm.groupYPositions[1] - lm.groupHeights[1] + lm.groupYPositions[2]) /
        2;
      return [fold0];
    },

    foldSteps: [
      // The lower band folded away: only the ana bölüm (1–3) faces the reader.
      {
        id: "end",
        folds: [{ direction: 1, angleFactor: 0 }],
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
// Arabic reads right→left, so inside a pair the LOWER ayah number sits in the
// RIGHT column (index 1) and the higher one on the left (index 0) — and ayahs
// 4–5 take the RIGHT half of the lower band, 6–7 the left.
// ---------------------------------------------------------------------------

export const MAUN_107_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      // 0 — ayah 1, the ana ayet
      {
        verses: [
          { number: 1, text: "أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ" },
        ],
      },
      // 1 — peach pair [left = 3, right = 2]
      {
        verses: [
          { number: 3, text: "وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ" },
          { number: 2, text: "فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ" },
        ],
      },
      // 2 — lower band, upper row [left half = 6, right half = 4]
      {
        verses: [
          { number: 6, text: "الَّذِينَ هُمْ يُرَاءُونَ" },
          { number: 4, text: "فَوَيْلٌ لِّلْمُصَلِّينَ" },
        ],
      },
      // 3 — lower band, lower row [left half = 7, right half = 5]
      {
        verses: [
          { number: 7, text: "وَيَمْنَعُونَ الْمَاعُونَ" },
          { number: 5, text: "الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — Turkish, copied from the reference page's own meal. Same four
// groups in the same order, but every pair is mirrored (LTR reads the lower
// ayah number first, so it goes in the LEFT column) and ayahs 4–5 move to the
// LEFT half of the lower band.
// ---------------------------------------------------------------------------

export const MAUN_107_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [{ number: 1, text: "Şu, dini yalanlayan adamı gördün mü?" }],
      },
      // 1 — peach pair [left = 2, right = 3]
      {
        verses: [
          { number: 2, text: "İşte o, yetimi itip kakıyor" },
          { number: 3, text: "Ve yoksulu doyuralım demiyor." },
        ],
      },
      // 2 — lower band, upper row → left half = 4, right half = 6
      {
        verses: [
          { number: 4, text: "Yazık o ( puta) tapanlara !" },
          {
            number: 6,
            text: "Onlar (zenginlikleriyle)\nde sadece gösteriş yaparlar.",
          },
        ],
      },
      // 3 — lower band, lower row → left half = 5, right half = 7
      {
        verses: [
          {
            number: 5,
            text: "Onların namazdan,\n(Allaha ibadetten)\nhaberleri yok!",
          },
          {
            number: 7,
            text: "İhtiyaç sahiplerine\nküçük bir iyilikleri\nbile olmaz.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — English, translated line for line from the Turkish above and
// mirrored exactly like it.
// ---------------------------------------------------------------------------

export const MAUN_107_TEXT_EN: SurahDataShape = {
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
            text: "Have you seen that man\nwho denies the religion?",
          },
        ],
      },
      {
        verses: [
          { number: 2, text: "There he is, shoving\nthe orphan aside" },
          { number: 3, text: "And he does not say:\nlet us feed the poor." },
        ],
      },
      {
        verses: [
          { number: 4, text: "Woe to those who\nworship (an idol) !" },
          {
            number: 6,
            text: "They (with their wealth)\nonly make a show of it.",
          },
        ],
      },
      {
        verses: [
          {
            number: 5,
            text: "They know nothing of\nthe prayer,\n(of worshipping Allah)!",
          },
          {
            number: 7,
            text: "They will not do\nthe smallest kindness\nfor those in need.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const MAUN_107_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: MAUN_107_TEXT_AR,
  en: MAUN_107_TEXT_EN,
  tr: MAUN_107_TEXT_TR,
};
