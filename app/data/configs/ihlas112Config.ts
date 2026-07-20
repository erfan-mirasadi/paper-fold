import type { SurahLayoutConfig } from "../schema";
import type { SurahDataShape } from "../SurahConfig";
import type { SurahLanguage } from "../../hooks/useSurahLanguageStore";

const YELLOW_BG = "#EFE2C7";
const YELLOW_BORDER = "#BE9E63";
const GREEN_BG = "#eaf2db";
const GREEN_BORDER = "#5E7367";

// Side-panel capsule palette for the tafsir book's page-372 diagram — the
// müspet (positive) ayets 1/2 stay in the paper's own warm yellow, the menfi
// (negative) ayets 3/4 get the book's blue-grey ink boxes.
const TAFSIR_CAPSULE_INK = "#2B2B2B";
const TAFSIR_BLUE_BG = "#ECF4F9";
const TAFSIR_BLUE_BORDER = "#7A9CAD";

export const IHLAS_112_CONFIG: SurahLayoutConfig = {
  id: "ihlas112",
  title: "İhlas Suresi",
  scriptInfo: {
    title: "İhlas Suresi",
    sayfa: 604,
    juz: 30,
    hizb: 60,
  },

  // Fold-story → script sync: which script verses light up at each fold step.
  // Keys are `animations.foldSteps` ids; values are verse ids. Edit freely.
  scriptHighlights: {
    "pre-start": [1, 4],
    end: [1, 2, 3, 4],
  },

  // Right-hand tafsir panel (SideInfoPanel). Content transcribed verbatim
  // from the reference tafsir book, pages 372 and 374 (p.373 not provided).
  sideInfo: {
    panelTitle: "Tefsir",
    byFoldStep: {
      "pre-start": {
        kicker: "İhlas Suresi",
        paragraphs: [
          {
            subtitle:
              "İlk iki ayet müspet cümlelerle ezeli ebedi değişmez muhkem hakikati ilan ediyorlar.",
          },
          {
            capsules: [
              {
                n: 1,
                text: "Söyle, O Allah tek'tir.",
                color: YELLOW_BORDER,
                bg: YELLOW_BG,
                textColor: "#A30000",
              },
              {
                n: 2,
                text: "Allah, Samet'tir :",
                color: YELLOW_BORDER,
                bg: YELLOW_BG,
              },
            ],
            corners: "soft",
            textColor: TAFSIR_CAPSULE_INK,
          },
          {
            subtitle:
              "Son iki ayet de menfi cümlelerle insanların yanıldıkları noktaları düzeltiyorlar",
          },
          {
            capsules: [
              {
                n: 3,
                text: "Doğurmamış ve doğurulmamıştır.",
                color: TAFSIR_BLUE_BORDER,
                bg: TAFSIR_BLUE_BG,
              },
              {
                n: 4,
                text: "Ve hiçbir şey Onun eşit ve dengi değildir.",
                color: TAFSIR_BLUE_BORDER,
                bg: TAFSIR_BLUE_BG,
              },
            ],
            corners: "soft",
            textColor: TAFSIR_CAPSULE_INK,
          },
          "Sure; iki müspet ve iki menfi cümle şeklinde de ikili bir düzen içinde gelmiş",
          "İhlas suresinin ilk ayeti ana ayettir. Surenin ana manasını veriyor: Allah birdir. Diyor. Ezelden ebede değişmez gerçeği, en muhkem hakikati ifade ediyor.",
          {
            columns: 1,
            capsules: [
              {
                n: 1,
                text: "Müşriklere <span style='color: #A30000'>söyle O Allah birdir, tek'tir.</span>",
                color: YELLOW_BORDER,
                bg: YELLOW_BG,
              },
              {
                n: 4,
                text: "Başka hiçbir şey Onun eşit ve dengi değildir.",
                color: YELLOW_BORDER,
                bg: YELLOW_BG,
              },
            ],
            corners: "soft",
            textColor: TAFSIR_CAPSULE_INK,
          },
        ],
      },
      end: {
        paragraphs: [
          { subtitle: "Kur'an-ı Kerim’in Mekke’de iki muhatabı vardır:" },
          "• Mekkeli müşrik Araplar,",
          "• Ehl-i Kitap dediği Hristiyanlar ve Yahudiler",
          "Birinci ve dördüncü ayetlerin birincil manayı söylemelerinden anlıyoruz ki Kur'an, tevhid hakikatini önce puta tapan müşriklere ilan ediyor.",
          "Sonra da parantez içi cümle şeklinde Hristiyanlara hitap ediyor.",
          "1. Müşriklere söyle ki, O Allah, birdir.",
          "• Hristiyanlara da şunu söyle ki Allah Samed’dir. Bütün varlıkların ihtiyaçlarını veren fakat kendisi hiçbir şeye muhtaç olmayan Allah’ın varlığı kendindendir. Babaya ve de oğula ihtiyacı yoktur.",
          "• Hem O, doğurmadı ki O’na ana tanrı veya Rab Baba denilsin ve doğurulmadı ki O’na Oğul Tanrı denilsin. Hristiyanlar baba ve oğul gibi sıfatları Allah’a yakıştırmakla saygısızlık yapıyorlar. Allah, bu yakıştırmalardan uzaktır, münezzehtir",
          "• Hiçbir şey O’nun eşiti, dengi olamaz. Yani ey müşrikler, Allah’ı bırakıp da taptığınız ay, güneş, yıldızlar, taşlar, ağaçlar, putlar kısacası varlık âleminden hiçbir şey Allah değildir. Allah yerine konulamaz. İbadet edilemez.",
          {
            subtitle:
              "Hristiyanlar Hz. İsa’nın dünyadan ayrılışından bir zaman sonra tevhid inançlarını bozdular.",
          },
          "Allah’a Rab Baba diyorlar. O’nu Baba Tanrı kabul ediyorlar.",
          "Hz. Meryem’i de ilah kabul edip ona da Ana Tanrı diyorlar.",
          "Hz. İsa’yı da tanrılaştırıp ona da Oğul Tanrı diyorlar.",
          "Allah, sonsuz hikmet ve kudretiyle, canlı varlıkların nesillerinin devamını anne babaya ve onlardan dünyaya gelecek bebeklere bağlamış. Bu yüzden bütün canlı varlıklar doğurmuşlar ve doğurulmuşlardır.",
          "Hâlbuki Allah, fâni bir varlık değil ki kendinden sonra varlığını, neslini devam ettirecek bir oğul tanrı doğursun veya Allah, bir bebek gibi dünyaya sonradan gelmedi ki, ana tanrıya, baba tanrıya ihtiyacı olsun!",
          "(O Tek'dir ve Samet'tir. ; Allah baba, Rab baba, Anne Tanrı, Oğul Tanrı, Kız Tanrı gibi bir ailesi de yoktur.)",
          "Eski Yunanda da insanlar Olimpus dağında yaşayan böyle kalabalık bir tanrılar ailesini tasavvur ediyorlardı. İnsanlık bu saçmalıklardan kurtulmalıdır.",
          "Allah birdir. Allahın yanında ana tanrı, oğul tanrı var diyerek Allah'a iftira edenler Allahın hiç razı olmadığı büyük bir şirk suçu işlemektedirler.",
          { subtitle: "İhlas Suresini şöyle de yazabiliriz:" },
          {
            html: `<div style="background-color: #fceade; border: 1px solid #e8d6cb; border-radius: 16px; padding: 24px 12px; display: flex; justify-content: center; overflow-x: auto; width: 100%; font-family: sans-serif;"><svg width="0" height="0" style="position: absolute;"><defs><marker id="red-arrow-ihlas" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#c00000" /></marker></defs></svg><div style="position: relative; width: 340px; min-width: 340px; display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 10px 0;"><div style="position: relative; width: 220px; background-color: #fbe4d5; border: 1px solid #c0504d; border-radius: 6px; padding: 8px 12px; display: flex; align-items: center; justify-content: center; gap: 12px; z-index: 2;"><div style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #777; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #555; background: #fff; flex-shrink: 0;">1</div><div style="font-size: 17px; font-weight: bold; color: #000; font-family: 'Amiri', serif;" dir="rtl">قُلْ هُوَ اللَّهُ أَحَدٌ</div><svg style="position: absolute; right: -90px; top: 50%; width: 90px; height: 128px; pointer-events: none; overflow: visible;"><path d="M 0,0 C 90,20 90,108 0,128" fill="none" stroke="#c00000" stroke-width="1.5" marker-end="url(#red-arrow-ihlas)" /></svg></div><div style="width: 340px; background-color: #d0dae1; border: 1px solid #aebac1; border-radius: 8px; padding: 12px; display: flex; justify-content: center; gap: 12px; z-index: 1;"><div style="flex: 1; background-color: #ecf1f4; border: 1px solid #7a9cad; border-radius: 6px; padding: 8px 10px; display: flex; align-items: center; justify-content: center; gap: 10px;"><div style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #777; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #555; background: #fff; flex-shrink: 0;">3</div><div style="font-size: 15px; font-weight: bold; color: #000; font-family: 'Amiri', serif;" dir="rtl">لَمْ يَلِدْ وَلَمْ يُولَدْ</div></div><div style="flex: 1; position: relative; background-color: #ecf1f4; border: 1px solid #7a9cad; border-radius: 6px; padding: 8px 10px; display: flex; align-items: center; justify-content: center; gap: 10px;"><div style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #777; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #555; background: #fff; flex-shrink: 0;">2</div><div style="font-size: 15px; font-weight: bold; color: #000; font-family: 'Amiri', serif;" dir="rtl">اللَّهُ الصَّمَدُ</div></div></div><div style="position: relative; width: 220px; background-color: #fbe4d5; border: 1px solid #c0504d; border-radius: 6px; padding: 8px 12px; display: flex; align-items: center; justify-content: center; gap: 12px; z-index: 2;"><div style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #777; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #555; background: #fff; flex-shrink: 0;">4</div><div style="font-size: 17px; font-weight: bold; color: #000; font-family: 'Amiri', serif;" dir="rtl">وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ</div></div></div></div>`,
          },
        ],
      },
    },
  },

  heroTitle: "İhlas Suresi",
  heroSubtitle: "Ihlas Suresi 112",

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
    padding: 0.2,
    scrollPages: 1.5,
    fixedWidthAcrossLanguages: true,
  },

  specialVerses: {},

  verseOverrides: {
    1: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BORDER,
      circleTextCol: "#000000",
      textColor: "#A30000",
      expandW: 0.1985,
      expandH: 0.0025,
      isPill: false,
      textScaleOverride: 0.9,
      translationTextScaleOverride: 0.65,
    },
    2: {
      bg: GREEN_BG,
      border: GREEN_BORDER,
      circleBg: GREEN_BG,
      circleBorderCol: GREEN_BORDER,
      circleTextCol: "#000000",
      textColor: "#000000",
      expandW: 0.05,
      translationTextAlign: "center",
    },
    3: {
      bg: GREEN_BG,
      border: GREEN_BORDER,
      circleBg: GREEN_BG,
      circleBorderCol: GREEN_BORDER,
      circleTextCol: "#000000",
      textColor: "#000000",
      expandW: 0.05,
      translationTextAlign: "center",
    },
    4: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BORDER,
      circleTextCol: "#000000",
      textColor: "#A30000",
      expandW: 0.1985,
      expandH: 0.0025,
      isPill: false,
      textScaleOverride: 0.9,
      translationTextScaleOverride: 0.65,
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
      maroonTheme: YELLOW_BORDER,
      greenTheme: GREEN_BORDER,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: YELLOW_BG,
      s2Group1Bg: "transparent",
      s2Group2Bg: "transparent",
      s2Group3Bg: "transparent",
      curveColors: [
        {
          color: YELLOW_BORDER,
          fillColor: YELLOW_BG,
          curveSide: "symmetrical",
          bowGap: 0.25,
          innerBowGap: 0.24,
          topAnchorXOffset: 0.0,
          bottomAnchorXOffset: 0.0,
        },
        {
          color: GREEN_BORDER,
          fillColor: GREEN_BG,
          curveSide: "symmetrical",
          topAnchorXOffset: -0.02,
          bottomAnchorXOffset: -0.02,
        },
        {
          // Dummy transparent entry prevents a third SideCurves bracket from
          // appearing when there is no real third group pair.
          color: "transparent",
          fillColor: "transparent",
        },
      ],
    },
    capsuleBorderWidth: 0.0045,
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

  svgOverlays: [],

  // ── NEW BLOCK-BASED SCHEMA ──────────────────────────────────────────────
  globalSettings: {
    // Legacy params mapping:
    //   smallBoxH2: 0.12  → capsuleHeight
    //   s2Gap: 0.12       → columnGap
    //   s2VerticalRowGap: 0.02 → rowGap
    //   groupGap: 0.025   → blockGap
    //   s2PadLeftRight: 0.005 → sectionPadX
    //   groupPad: 0.012   → blockPadding
    //   sgBorderWidth: 0.006 → sectionBorderWidth
    //   verseTextScale: 1.6, translationVerseTextScale: 1.1
    capsuleHeight: 0.12,
    columnGap: 0.12,
    rowGap: 0.02,
    blockGap: 0.025,
    sectionPadX: 0.005,
    blockPadding: 0.012,
    sectionBorderWidth: 0.006,
    verseTextScale: 1.6,
    translationVerseTextScale: 1.1,
  },

  handwrittenNotes: [
    {
      x: 0.77,
      y: -0.08,
      fontSize: 0.048,
      color: "#2f4858",
      lineSpacing: 1.6,
      maxWidth: 1.5,
      textAlign: "center",
      rotationZ: 0,
      lines: [
        {
          text: "İhlas Suresi",
        },
      ],
    },
  ],

  // Section-wide resting-state background — was incorrectly attached to
  // block0 alone, which also made it (wrongly) render as block0's own small
  // elevated/all-sections frame instead of the whole section's.
  sectionBackground: {
    texture: "/nisa/all-section-1.svg",
    scaleX: 0.9,
    scaleY: 1.3,
    offsetY: 0.046,
    solidScaleX: 0.87,
    solidScaleY: 0.85,
  },

  blocks: [
    // Block 0 — Verse 1 (full-width yellow, not pushed in)
    {
      id: "section2",
      type: "group",
      verseIds: [1],
      columns: 1,
      // outerScale was 0.0 for Ihlas → no push-out, standard width.
      // isPushedIn: false → horizontalInset: 0
      horizontalInset: 0,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
    },
    // Block 1 — Verse 2 (single column, pushed in)
    {
      id: "section2_main", // carries the customSection id for unified elevation drag
      type: "group",
      verseIds: [2],
      columns: 1,
      // g2Scale: 0.0 → no explicit scale offset; isPushedIn: true → inset inward
      horizontalInset: 0.04, // small push-in (approximates legacy isPushedIn visual)
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      customSectionId: "section2_main",
    },
    // Block 2 — Verse 3 (single column, pushed in, slight pushDown compensation)
    {
      id: "section2_g2",
      type: "group",
      verseIds: [3],
      columns: 1,
      horizontalInset: 0.04,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      verticalNudge: -0.03,
      // Legacy had pushDown: -0.03 to compensate for extra gap above.
      // In the block engine the auto-centering handles this, so no offset needed.
    },
    // Block 3 — Verse 4 (full-width yellow, not pushed in)
    {
      id: "section2_g3",
      type: "group",
      verseIds: [4],
      columns: 1,
      horizontalInset: 0,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
    },
  ],

  // customSections maps a virtual drag/elevation zone across all 4 blocks.
  customSections: [
    {
      id: "section2_main",
      verseIds: [1, 2, 3, 4],
      cameraTarget: { y: 1.4, fov: 27.5, tilt: -1.4 },
    },
  ],

  animations: {
    computeFoldYPositions: (lm) => {
      // groupYPositions[i] = frameY (top edge) of block i.
      // groupHeights[i]    = frameH of block i.
      const fold1 =
        (lm.groupYPositions[0] - lm.groupHeights[0] + lm.groupYPositions[1]) /
        2;
      const fold2 =
        (lm.groupYPositions[1] - lm.groupHeights[1] + lm.groupYPositions[2]) /
        2;
      const fold3 =
        (lm.groupYPositions[2] - lm.groupHeights[2] + lm.groupYPositions[3]) /
        2;
      return [fold1, fold2, fold3];
    },

    foldSteps: [
      {
        id: "pre-start",
        folds: [
          { direction: 1, angleFactor: 0.5 },
          { direction: -1, angleFactor: 1.1 },
          { direction: 1, angleFactor: 0.6 },
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

// ── TEXT DATA (unchanged) ────────────────────────────────────────────────────

export const IHLAS_112_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "الإخلاص",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [{ number: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ" }],
      },
      {
        verses: [{ number: 2, text: "اللَّهُ الصَّمَدُ" }],
      },
      {
        verses: [{ number: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ" }],
      },
      {
        verses: [{ number: 4, text: "وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ" }],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const IHLAS_112_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Al-Ikhlas",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [{ number: 1, text: "Say, He is Allah, the One" }],
      },
      {
        verses: [{ number: 2, text: "Allah is Samet :" }],
      },
      {
        verses: [
          { number: 3, text: "He has not begotten and has not been begotten" },
        ],
      },
      {
        verses: [
          { number: 4, text: "And nothing is equal and equivalent to Him" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const IHLAS_112_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "İhlas Suresi",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      {
        verses: [{ number: 1, text: "Söyle, O Allah tek'tir" }],
      },
      {
        verses: [{ number: 2, text: "Allah, Samet'tir :" }],
      },
      {
        verses: [{ number: 3, text: "Doğurmamış ve doğurulmamıştır" }],
      },
      {
        verses: [
          { number: 4, text: "Ve hiçbir şey Onun eşit ve dengi değildir" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const IHLAS_112_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: IHLAS_112_TEXT_AR,
  en: IHLAS_112_TEXT_EN,
  tr: IHLAS_112_TEXT_TR,
};
