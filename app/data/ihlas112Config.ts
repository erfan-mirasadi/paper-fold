import type { SurahLayoutConfig, VerticalGroupsSectionConfig } from "./schema";
import type { AlakLayoutParams } from "./SurahConfig";
import type { SurahDataShape } from "./surahData";
import type { SurahLanguage } from "../hooks/useSurahLanguageStore";

const YELLOW_BG = "#E5CFA4";
const YELLOW_BORDER = "#BE9E63";
const BLUE_BG = "#CEE0E9";
const BLUE_BORDER = "#7A9CAD";

export const IHLAS_112_CONFIG: SurahLayoutConfig<AlakLayoutParams> = {
  id: "ihlas112",
  title: "İhlas 112",
  heroTitle: "İhlas",
  heroSubtitle: "suresi 112",

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: false,
    hideVerseNumbers: false,
  },

  dimensions: {
    paperWidth: 1.5,
    paperHeight: 1.1,
    sceneCenterYOffset: 0.0,
    padding: 0.2,
    scrollPages: 1.5,
  },

  specialVerses: {},

  verseOverrides: {
    1: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BORDER,
      circleTextCol: "#000000",
      textColor: "#000000",
      expandW: 0.1,
    },
    2: {
      bg: BLUE_BG,
      border: BLUE_BORDER,
      circleBg: BLUE_BG,
      circleBorderCol: BLUE_BORDER,
      circleTextCol: "#000000",
      textColor: "#000000",
      expandW: 0.1,
    },
    3: {
      bg: BLUE_BG,
      border: BLUE_BORDER,
      circleBg: BLUE_BG,
      circleBorderCol: BLUE_BORDER,
      circleTextCol: "#000000",
      textColor: "#000000",
      expandW: 0.1,
    },
    4: {
      bg: YELLOW_BG,
      border: YELLOW_BORDER,
      circleBg: YELLOW_BG,
      circleBorderCol: YELLOW_BORDER,
      circleTextCol: "#000000",
      textColor: "#000000",
      expandW: 0.1,
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
      greenTheme: BLUE_BORDER,
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
          topAnchorXOffset: -0.02,
          bottomAnchorXOffset: -0.02,
        },
        {
          color: BLUE_BORDER,
          fillColor: BLUE_BG,
          curveSide: "symmetrical",
          topAnchorXOffset: -0.02,
          bottomAnchorXOffset: -0.02,
        },
        {
          color: "transparent", // Dummy center color to prevent rendering on single verse
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

  params: {
    s1Top: 0.5,
    s1Pad: 0.01,
    gap: 0.01,
    s1AnaGap: 0.01,
    smallBoxH: 0.04,
    anaAyetH: 0.04,
    gapBetweenS1andS2: 0.01,
    s2VerticalPad: 0.02,
    bigBoxH: 0.07,
    groupGap: 0.025,
    groupPad: 0.012,
    groupPadBottom: 0.012,
    s2Gap: 0.12,
    s2VerticalRowGap: 0.02,
    smallBoxH2: 0.12,
    middleExtraGap: 0,
    s2PadLeftRight: 0.005,
    g2Scale: 0.0,
    outerScale: 0.0,
    s1BorderWidth: 0,
    capsuleLabelW: 0.16,
    capsuleLabelH: 0.024,
    capsuleLabelBorderWidth: 0.0035,
    capsuleLabelDrop: 0.005,
    sgPad: 0.03,
    sgBorderWidth: 0.006,
    boxExtOffset: 0.02,
    extraRowGap: 0.0,
    labelHitboxWidth: 0.43,
    verseTextScale: 1.6,
    translationVerseTextScale: 1.1,
    groupRows: [1, 1, 1, 1],
  },

  svgOverlays: [],

  sections: [
    {
      id: "section2",
      type: "verticalGroups",
      backgroundTexture: "/ihlas/frame-section-3.svg",
      backgroundScaleX: 1.2,
      backgroundScaleY: 1.4,
      backgroundOffsetY: 0.0,
      backgroundSolidScaleX: 0.87,
      backgroundSolidScaleY: 0.85,

      hideRowConnectors: true,
      customSections: [
        {
          id: "section2_main",
          verseIds: [1, 2, 3, 4],
          cameraTarget: { y: 1.4, fov: 27.5, tilt: -1.4 },
        },
      ],
      groups: [
        {
          verseIds: [1],
          columns: 1,
          isPushedIn: false,
          isCenter: true,
          dragBehavior: "individual",
        },
        {
          verseIds: [2],
          columns: 1,
          isPushedIn: true,
          isCenter: true,
          dragBehavior: "individual",
        },
        {
          verseIds: [3],
          columns: 1,
          isPushedIn: true,
          isCenter: true,
          dragBehavior: "individual",
        },
        {
          verseIds: [4],
          columns: 1,
          isPushedIn: false,
          isCenter: true,
          dragBehavior: "individual",
        },
      ],
      cameraTarget: { y: 0.4, fov: 35, tilt: -1.2 },
    } as VerticalGroupsSectionConfig,
  ],

  animations: {
    computeFoldYPositions: (lm) => {
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
          { direction: 1, angleFactor: 0.4 },
          { direction: -1, angleFactor: 1 },
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
        isPushedIn: false,
        isCenter: true,
        extraRowGap: 0,
        verses: [{ number: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ" }],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [{ number: 2, text: "اللَّهُ الصَّمَدُ" }],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [{ number: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ" }],
      },
      {
        isPushedIn: false,
        isCenter: true,
        extraRowGap: 0,
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
        isPushedIn: false,
        isCenter: true,
        extraRowGap: 0,
        verses: [{ number: 1, text: "Say, He is Allah, the One." }],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [{ number: 2, text: "Allah, the Eternal Refuge." }],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [{ number: 3, text: "He neither begets nor is born." }],
      },
      {
        isPushedIn: false,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          { number: 4, text: "And there is nothing comparable to Him." },
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
        isPushedIn: false,
        isCenter: true,
        extraRowGap: 0,
        verses: [{ number: 1, text: "Söyle, O Allah tek'tir." }],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [{ number: 2, text: "Allah, Samet'tir :" }],
      },
      {
        isPushedIn: true,
        isCenter: true,
        extraRowGap: 0,
        verses: [{ number: 3, text: "Doğurmamış ve doğurulmamıştır." }],
      },
      {
        isPushedIn: false,
        isCenter: true,
        extraRowGap: 0,
        verses: [
          { number: 4, text: "Ve hiçbir şey Onun eşiti ve dengi değildir." },
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
