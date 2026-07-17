/**
 * Ayat al-Kursi — Full Layout Config & Text Data
 *
 * Layout matches the hand-drawn design:
 *   - ONE fold in the middle (2 paper segments)
 *   - ONE VerticalGroupsSectionConfig with 3 groups:
 *       Top    (not pushed in): verseIds [2, 1]         — 2 chunks side-by-side
 *       Middle (pushed in):     verseIds [4, 3, 6, 5]   — 4 chunks in a 2×2 grid
 *       Bottom (not pushed in): verseIds [8, 7]         — 2 chunks side-by-side
 *
 * verseId ordering within a group: [left-col, right-col, left-col-row2, right-col-row2]
 * (i.e. even indices → left/RTL-start column, odd indices → right/RTL-end column)
 */

import type { SurahLayoutConfig } from "../schema";
import type { SurahDataShape } from "../SurahConfig";
import type { SurahLanguage } from "../../hooks/useSurahLanguageStore";

// ---------------------------------------------------------------------------
// LAYOUT CONFIG
// ---------------------------------------------------------------------------

const OUTER_GROUP_BG = "#EFE2C7"; // Yellow (Top and Bottom groups)
const OUTER_GROUP_BORDER = "#BE9E63"; // Lighter brown/gold border
const CENTER_GROUP_BG = "#CBE2EE"; // Blue/Grey (Middle group)
const CENTER_GROUP_BORDER = "#7A9CAD"; // Lighter slate blue border

export const AYAT_AL_KURSI_CONFIG: SurahLayoutConfig = {
  id: "ayatalkursi",
  title: "Bakara 255",
  heroTitle: "Ayetel",
  heroSubtitle: "kürsî",

  scriptInfo: {
    title: "Bakara: 255",
    sayfa: 42,
    juz: 3,
    hizb: 5,
    singleAyahNumber: 255,
  },

  // Fold-story → script sync: which script chunks light up at each fold step.
  // Keys are `animations.foldSteps` ids; values are verse ids. Edit freely.
  scriptHighlights: {
    "pre-start": [1, 2, 7, 8],
    end: [1, 2, 3, 4, 5, 6, 7, 8],
  },

  // Right-hand tafsir panel (SideInfoPanel). Entries follow the reference
  // tafsir book's own page order (pp. 33-42) one-for-one: byFoldStep entries
  // are the book's structural/summary pages, byVerse entries are the book's
  // per-cümle deep dives — resolveEntries renders pre-start, then verses
  // [1,2,7,8], then end, then verses [3,4,5,6], which is exactly that order.
  // Capsule text reuses this file's own AYAT_AL_KURSI_TEXT_TR translations
  // (already canonical in-app copy); the surrounding commentary is an
  // original condensed paraphrase, not a transcription of the book's prose.
  sideInfo: {
    panelTitle: "Tefsir",
    byFoldStep: {
      "pre-start": {
        kicker: "Yapı",
        title: "Sekiz Cümlenin Ritmi",
        paragraphs: [
          "Ayet-ül Kürsi sekiz cümleden oluşur ve ikişer ikişer ilerler: tek sıradaki cümle bir hakikati doğrudan bildirir, ardından gelen çift sıradaki cümle ise buna aykırı bir yanlışı düzeltir.",
          {
            capsules: [
              { n: 1, text: "Doğrudan bir hakikati bildirir." },
              { n: 2, text: "Buna aykırı bir yanlışı düzeltir." },
              { n: 3, text: "Doğrudan bir hakikati bildirir." },
              { n: 4, text: "Buna aykırı bir yanlışı düzeltir." },
              { n: 5, text: "Doğrudan bir hakikati bildirir." },
              { n: 6, text: "Buna aykırı bir yanlışı düzeltir." },
              { n: 7, text: "Doğrudan bir hakikati bildirir." },
              { n: 8, text: "Buna aykırı bir yanlışı düzeltir." },
            ],
            corners: "soft",
            color: OUTER_GROUP_BORDER,
            bg: OUTER_GROUP_BG,
            textColor: "#2B2B2B",
            frame: OUTER_GROUP_BORDER,
          },
        ],
      },
      end: {
        kicker: "Sayfa 38",
        title: "Ana Cümle ve Ara Cümleler",
        paragraphs: [
          "Birinci-ikinci cümle ile yedinci-sekizinci cümle birlikte okununca tek bir anlam bütünlüğü oluşturur: Allah tektir, diridir, hiç uyumaz; mülkü ve hakimiyeti gökleri ve yeri kuşatır, bu Ona asla ağır gelmez.",
          {
            capsules: [
              { n: 1, text: "Allah! (Onun eşi ortağı yoktur). Hay ve Kayyumdur." },
              { n: 2, text: "O hiç uyuklamaz ve uyumaz." },
              {
                n: 7,
                text: "Onun tahtı, hakimiyeti gökler ve yer genişliğindedir.",
              },
              {
                n: 8,
                text: "O ikisini korumak Ona ağır gelmez. O, Yüce ve Büyüktür.",
              },
            ],
            corners: "soft",
            color: OUTER_GROUP_BORDER,
            bg: OUTER_GROUP_BG,
            textColor: "#2B2B2B",
            frame: OUTER_GROUP_BORDER,
          },
          "Üçüncü ile altıncı cümleler arasında kalan kısım ise bu ana fikri açan ayrıntılardır — ana cümlenin içine yerleştirilmiş bir açıklama gibi. Önce ana fikir söylenir, ayrıntıyla açılır, sonra yine ana fikre dönülür.",
        ],
      },
    },
    byVerse: {
      // ── Page 34 ───────────────────────────────────────────────────────
      1: {
        kicker: "Sayfa 34",
        title: "Kainat ve İnsan: İki Ayna",
        paragraphs: [
          "Yüce Allah her varlığı sayısız hikmet ve anlamla yaratmıştır. Kainattaki her şey kendi ötesinde bir gerçeğe işaret eder: onu var eden Zat'a.",
          "Nasıl her sanat eseri ustasının imzasını taşırsa, yaratılan her şey de Yaratıcısının kudretini, ilmini ve şefkatini yansıtan bir ayna gibidir.",
          "İnsan, görünüşte küçük olsa da akıl ve kalp gibi yetileri sayesinde kainattan bile kapsamlı bir aynadır. Yaratılışının en anlamlı gayesi, Rabbini tanıyıp Ona bilinçli bir ayna olmaktır.",
        ],
      },
      // ── Page 35 ───────────────────────────────────────────────────────
      2: {
        kicker: "Sayfa 35",
        title: "Peygamber ve Kur'an: En Berrak Aynalar",
        paragraphs: [
          "Hz. Muhammed (s.a.v.), herkesten önce Allah'ı tanımış ve bütün hayatıyla Onu en mükemmel şekilde yansıtan bir örnek olmuştur.",
          "Kur'an-ı Kerim'in de sayısız hikmeti vardır, ama en büyük gayesi yine Allah'ı anlatmak ve tanıtmaktır.",
          "Kur'an'da \"muhkem\" diye anılan, değişmez ve sağlam hakikatleri bildiren ayetler doğrudan Allah'tan bahseder. Ayet-ül Kürsi, İhlas Suresi, Fatiha'nın başı ve Haşir Suresi'nin son ayetleri bu yönüyle Kur'an'ın kalbi sayılır.",
        ],
      },
      // ── Page 36 ───────────────────────────────────────────────────────
      7: {
        kicker: "Sayfa 36",
        title: "Ayet-ül Kürsi: Sekiz Cümle Bir Bütün",
        paragraphs: [
          "Ayet-ül Kürsi de bütün cümleleriyle Rabbimizi tanıtır ve bazı yanlış inançların kökünü keser. Kur'an soyut hakikatleri çoğu zaman somut bir benzetmeyle anlatır; burada Yüce Allah kendini bir padişah benzetmesiyle tarif eder.",
          "Padişahını, tahtını ve otoritesini tanımayan yoktur; ama sınırlı aklımız sonsuz olan Allah'ı tam kavrayamaz. Bu benzetme, ancak uzaktan bakabildiğimiz bir dürbün gibidir.",
          {
            capsules: [
              {
                n: 1,
                text: "Allah! (Onun eşi ortağı yoktur). Hay ve Kayyumdur.",
                color: OUTER_GROUP_BORDER,
                bg: OUTER_GROUP_BG,
              },
              {
                n: 2,
                text: "O hiç uyuklamaz ve uyumaz.",
                color: OUTER_GROUP_BORDER,
                bg: OUTER_GROUP_BG,
              },
              {
                n: 3,
                text: "Göklerde ve yerde ne varsa Onundur.",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
              {
                n: 4,
                text: "Onun izni olmadan kim onun huzurunda şefaatçi ve söz sahibi olabilir ki?",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
              {
                n: 5,
                text: "Yalnızca Allah onların geleceklerini de geçmişlerini bilmektedir.",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
              {
                n: 6,
                text: "Allah dilemeden, Onun ilminden bir şeyler mi kapmışlar ki geçmişi ve geleceği bilsinler?",
                color: CENTER_GROUP_BORDER,
                bg: CENTER_GROUP_BG,
              },
              {
                n: 7,
                text: "Onun tahtı, hakimiyeti gökler ve yer genişliğindedir.",
                color: OUTER_GROUP_BORDER,
                bg: OUTER_GROUP_BG,
              },
              {
                n: 8,
                text: "O ikisini korumak Ona ağır gelmez. O, Yüce ve Büyüktür.",
                color: OUTER_GROUP_BORDER,
                bg: OUTER_GROUP_BG,
              },
            ],
            corners: "soft",
            textColor: "#2B2B2B",
            frame: OUTER_GROUP_BORDER,
          },
        ],
      },
      // ── Page 37 ───────────────────────────────────────────────────────
      8: {
        kicker: "Sayfa 37",
        title: "Her Cümlenin Derinliği",
        paragraphs: [
          "Yukarıdaki sekiz cümlenin her biri padişah benzetmesinin bir yönünü tamamlar: Allah'ın varlığı ve birliği, uyanıklığı, mülkü, izni, ilmi, hakimiyeti ve büyüklüğü.",
          "Cümleler tesadüfen yan yana gelmemiştir; her biri kendinden öncekini pekiştirir ve bir sonrakine zemin hazırlar.",
        ],
      },
      // ── Page 39 ───────────────────────────────────────────────────────
      3: {
        kicker: "Sayfa 39",
        title: "Mülk Onundur, Şefaat Onun İzniyledir",
        paragraphs: [
          {
            capsules: [
              {
                n: 3,
                text: "Göklerde ve yerde ne varsa Onundur.",
              },
              {
                n: 4,
                text: "Onun izni olmadan kim onun huzurunda şefaatçi ve söz sahibi olabilir ki?",
              },
            ],
            corners: "soft",
            color: CENTER_GROUP_BORDER,
            bg: CENTER_GROUP_BG,
            textColor: "#2B2B2B",
            frame: OUTER_GROUP_BORDER,
          },
          "Eski Arap toplumunda henüz güçlü bir devlet düzeni yerleşmemişken, zayıf ve yabancı kimseleri kabile reisleri korurdu; bu korumaya \"şefaat\" ya da \"himaye\" denirdi ve reisin izni olmadan kimse ondan yararlanamazdı.",
          "Bugün bu görevi devletler üstlenir: vatandaşlık, pasaport, güvenlik hep devletin yetkisiyle sağlanır. Ayetteki \"Onun izni olmadan şefaat edilemez\" ifadesi de aynı mantığı taşır — kainatın gerçek sahibi ve yetkilisi yalnızca Allah'tır.",
        ],
      },
      // ── Page 40 ───────────────────────────────────────────────────────
      4: {
        kicker: "Sayfa 40",
        title: "Yetkisiz Elçi Olmaz",
        paragraphs: [
          "Bir büyükelçi ancak devletinden aldığı yetkiyle görev yapar. Putperestlerin taptığı putlara da Allah'tan hiçbir yetki verilmediği halde kendilerine bir \"aracılık\" yetkisi yakıştırılmıştır.",
          "Allah, gökleri ve yeri hiçbir aracıya ihtiyaç duymadan bizzat ilmi ve kudretiyle yönetirken, birilerinin kalkıp Ona kendiliğinden ortaklar icat etmesi büyük bir haksızlıktır. Hz. İsa ve Hz. Meryem'i tanrılaştıranlar da, birer peygamber ve onun annesi olan bu iki mübarek insana asılsız yetkiler yakıştırarak aynı hataya düşmüşlerdir.",
        ],
      },
      // ── Page 41 ───────────────────────────────────────────────────────
      5: {
        kicker: "Sayfa 41",
        title: "Dördüncü Cümleye Dönüş",
        paragraphs: [
          {
            capsules: [
              {
                n: 4,
                text: "Onun izni olmadan kim onun huzurunda şefaatçi ve söz sahibi olabilir ki?",
              },
            ],
            corners: "soft",
            color: CENTER_GROUP_BORDER,
            bg: CENTER_GROUP_BG,
            textColor: "#2B2B2B",
          },
          "Göklerin ve yerin tek sahibi ve hakimi Allah olduğuna göre, Onun izni olmadan kimse Onun mülkünde söz sahibi olamaz. Bu yüzden herkes hiçbir aracıya ihtiyaç duymadan doğrudan Rabbine yönelebilir.",
          {
            capsules: [
              {
                n: 5,
                text: "Yalnızca Allah onların geleceklerini de geçmişlerini bilmektedir.",
              },
              {
                n: 6,
                text: "Allah dilemeden, Onun ilminden bir şeyler mi kapmışlar ki geçmişi ve geleceği bilsinler?",
              },
            ],
            corners: "soft",
            color: CENTER_GROUP_BORDER,
            bg: CENTER_GROUP_BG,
            textColor: "#2B2B2B",
            frame: OUTER_GROUP_BORDER,
          },
          "Geçmişi ve geleceği yalnızca Allah bilir. Gaipten haber verdiğini iddia edenlerin sözleri, Allah'ın izni ve bilgisi olmadan boştur.",
          {
            capsules: [
              {
                n: "A1",
                text: "TEK İLAH — Eşi benzeri olmayan tek Allah; diridir, her şeyi O yönetir.",
                span: true,
              },
              {
                n: "B1",
                text: "PUTLARIN YETKİSİ YOK — Her şeyin gerçek sahibi Allah'tır; putların kendiliğinden hiçbir yetkisi yoktur.",
              },
              {
                n: "B2",
                text: "GAYBI BİLEN YOK — Geçmişi geleceği yalnızca Allah bilir; gaipten haber verenlerin sözü boştur.",
              },
              {
                n: "A2",
                text: "SONSUZ HAKİMİYET — Hakimiyeti gökleri ve yeri kuşatır; bu Ona hiç ağır gelmez.",
                span: true,
              },
            ],
            corners: "soft",
            color: OUTER_GROUP_BORDER,
            bg: OUTER_GROUP_BG,
            textColor: "#2B2B2B",
            frame: OUTER_GROUP_BORDER,
          },
        ],
      },
      // ── Page 42 ───────────────────────────────────────────────────────
      6: {
        kicker: "Sayfa 42",
        title: "Yorulmayan, Uyumayan Allah",
        paragraphs: [
          "Ayet-ül Kürsi, Allah'ın hiç yorulmadığını, uyumadığını ve kainatın her zerresini kudretiyle elinde tuttuğunu vurgulayarak, Onu diğer varlıklara benzeten yanlış anlayışları ortadan kaldırır.",
        ],
      },
    },
  },

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: true,
    hideVerseNumbers: true,
  },

  dimensions: {
    paperWidth: 1.54,
    paperHeight: 1.78,
    sceneCenterYOffset: -0.045,
    padding: 0.15,
    scrollPages: 1.5,
    fixedWidthAcrossLanguages: true,
  },

  specialVerses: {
    // The single fold sits between the top group and the pushed-in middle group.
    // Verses flanking that crease are 1/2 (top) and 3/4 (middle top row).
    // No middleFoldVerses — all pairs fold as normal V-shape popups
    versePairings: {
      1: 2,
      2: 1,
      3: 4,
      4: 3,
      5: 6,
      6: 5,
      7: 8,
      8: 7,
    },
  },

  verseOverrides: {
    1: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BORDER,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
    2: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BORDER,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
    3: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    4: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    5: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    6: {
      border: CENTER_GROUP_BORDER,
      circleBorderCol: CENTER_GROUP_BORDER,
      circleBg: CENTER_GROUP_BG,
      circleTextCol: CENTER_GROUP_BORDER,
    },
    7: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BORDER,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
    8: {
      border: OUTER_GROUP_BORDER,
      circleBorderCol: OUTER_GROUP_BORDER,
      circleBg: OUTER_GROUP_BG,
      circleTextCol: OUTER_GROUP_BORDER,
    },
  },

  styling: {
    colors: {
      paperBase: "#FAF7F2", // Lighter, creamy paper color for the background fill
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
      maroonTheme: OUTER_GROUP_BG, // Yellow (Top and Bottom groups, since they are symmetrical)
      greenTheme: CENTER_GROUP_BG, // Blue/Grey (Middle group)
      // The three group background colours echo the hand-drawn image:
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: "#C4963B", // unused (no intro/outro verse)
      s2Group1Bg: OUTER_GROUP_BG, // yellow  — top group
      s2Group2Bg: CENTER_GROUP_BG, // light blue/grey — middle (pushed-in)
      s2Group3Bg: OUTER_GROUP_BG, // yellow — bottom group (symmetrical)

      // The background rectangles for the paper, echoing the hand-drawn sections
      // sectionBackgrounds: ["#DCE8DC", "#EDD8DF", "#DCE8DC"],

      curveColors: [
        { color: OUTER_GROUP_BORDER, fillColor: OUTER_GROUP_BG }, // Outer curves (top/bottom)
        { color: CENTER_GROUP_BORDER, fillColor: CENTER_GROUP_BG }, // Center curves (middle)
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

  // ── NEW BLOCK-BASED SCHEMA ──────────────────────────────────────────────
  // Legacy params mapping:
  //   smallBoxH2: 0.075      → capsuleHeight
  //   s2Gap: 0.02            → columnGap
  //   s2VerticalRowGap: 0.02 → rowGap
  //   groupGap + middleExtraGap (0.025 + 0.007) → blockGap
  //   s2PadLeftRight: 0.08   → sectionPadX
  //   groupPad: 0.012        → blockPadding
  //   sgBorderWidth: 0.006   → sectionBorderWidth
  //   sgPad: 0.03            → connectorPad
  globalSettings: {
    capsuleHeight: 0.075,
    columnGap: 0.032,
    rowGap: 0.032,
    blockGap: 0.035,
    sectionPadX: 0.08,
    blockPadding: 0.012,
    sectionBorderWidth: 0.006,
    connectorPad: 0.03,
    framePad: 0.02, // was s2VerticalPad
    verseTextScale: 1.0,
    translationVerseTextScale: null,
  },

  // Example handwritten margin note (Turkish) — sits in the blank top-left
  // margin above the content, like a personal note jotted next to the ayah.
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
          text: "Bakara: 255",
        },
        { text: "(Ayetel Kürsi)" },
      ],
    },
    {
      x: 1.15,
      y: -0.3,
      fontSize: 0.04,
      color: "#2f4858",
      lineSpacing: 2,
      maxWidth: 1.7,
      textAlign: "center",
      rotationZ: 0,
      lines: [
        {
          segments: [{ text: "Sağ blokta müspet ", color: "#8a4b3d" }],
        },
        { text: "cümlelerle hakikat beyan" },
        { text: "edilir;" },
      ],
    },
    {
      x: 0.38,
      y: -0.3,
      fontSize: 0.04,
      color: "#2f4858",
      lineSpacing: 2,
      maxWidth: 0.7,
      textAlign: "center",
      rotationZ: 0,
      lines: [
        {
          segments: [{ text: "Sol blokta menfi ", color: "#8a4b3d" }],
        },
        { text: "cümlelerle bu hakikate" },
        { text: "aykırı bütün yanlışlar" },
        { text: "reddedilir." },
      ],
    },
  ],

  // Section-wide resting-state background (the whole 3-block stack's outer
  // frame) — independent of any single block's own bounds.
  sectionBackground: {
    texture: "/nisa/all-section-1.svg",
    scaleX: 0.9,
    scaleY: 1.4,
    offsetY: 0.025,
    solidScaleX: 0.6,
    solidScaleY: 1,
  },

  blocks: [
    // ── Top block: 2 verses side-by-side (NOT pushed in) ────────────────
    {
      id: "section2_g0",
      type: "group",
      verseIds: [2, 1], // [left-col=2, right-col=1]
      columns: 2,
      horizontalInset: 0,
      isCenter: false,
      bgThemeKey: "s2Group1Bg",
    },
    // ── Middle block: 4 verses 2×2 (pushed in / indented) ────────────────
    {
      id: "section2_g1",
      type: "group",
      verseIds: [4, 3, 6, 5], // [left-row1=4, right-row1=3, left-row2=6, right-row2=5]
      columns: 2,
      horizontalInset: 0.01, // was g2Scale
      isCenter: true,
      dragBehavior: "individual",
      bgThemeKey: "s2Group2Bg",
    },
    // ── Bottom block: 2 verses side-by-side (NOT pushed in) ──────────────
    {
      id: "section2_g2",
      type: "group",
      verseIds: [8, 7], // [left-col=8, right-col=7]
      columns: 2,
      horizontalInset: 0,
      isCenter: false,
      bgThemeKey: "s2Group3Bg",
    },
  ],

  // "unified" elevation (legacy groupElevation: "unified") — all 3 blocks
  // share one drag/elevation zone, exactly like Ihlas's customSections.
  customSections: [
    {
      id: "section2",
      verseIds: [1, 2, 3, 4, 5, 6, 7, 8],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.2 },
    },
  ],

  animations: {
    computeFoldYPositions: (lm) => {
      // groupYPositions[i] = frameY (top edge) of block i; groupHeights[i] = frameH.
      // Position 1: between block 0 (top) and block 1 (middle)
      const fold1 =
        (lm.groupYPositions[0] - lm.groupHeights[0] + lm.groupYPositions[1]) /
        2;
      // Position 2: between row 1 and row 2 inside block 1 (middle, 2×2)
      const fold2 =
        lm.groupYPositions[1] - lm.groupPad - lm.smallBoxH2 - lm.rowGap / 2;
      // Position 3: between block 1 (middle) and block 2 (bottom)
      const fold3 =
        (lm.groupYPositions[1] - lm.groupHeights[1] + lm.groupYPositions[2]) /
        2;

      return [fold1, fold2, fold3];
    },

    foldSteps: [
      // Fully folded (paper closed in on itself)
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

  svgOverlays: [
    {
      src: "/ayatalKursi/divider.svg",
      anchorEdge: "center",
      scaleX: 0.51,
      scaleY: 1.35,
      offsetX: 0.005,
      offsetY: 0,
      renderOrder: 10, // Behind the verses
    },
    {
      src: "/ayatalKursi/divider.svg",
      anchorEdge: "center",
      scaleX: 0.46,
      scaleY: 1.54,
      offsetX: 0,
      offsetY: 0.0025,
      rotationZ: Math.PI / 2,
      renderOrder: 1, // Behind the verses
    },
    // {
    //   src: "/ayatalKursi/balara.png",
    //   anchorEdge: "top",
    //   scaleX: 0.4,
    //   scaleY: 0.16,
    //   offsetX: 0,
    //   offsetY: 0.85,
    //   renderOrder: 20,
    // },
  ],
};

// ---------------------------------------------------------------------------
// TEXT DATA — Arabic (canonical)
// ---------------------------------------------------------------------------
// verse ordering inside each colorGroup must match the config's verseIds:
//   group 0: [i=0 → id 2, i=1 → id 1]
//   group 1: [i=0 → id 4, i=1 → id 3, i=2 → id 6, i=3 → id 5]
//   group 2: [i=0 → id 8, i=1 → id 7]
// ---------------------------------------------------------------------------

export const AYAT_AL_KURSI_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",

  // section1 is a stub — the Ayat al-Kursi config has no gridWithAnaAyet section.
  section1: {
    label: "آية الكرسي",
    gridVerses: [],
    anaAyet: { number: 0, text: "" },
  },

  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" }, // no intro verse
    colorGroups: [
      // ── Group 0 — top, not pushed in ─────────────────────────────────────
      {
        verses: [
          // i=0 → verseId 2 (left column)
          { number: 2, text: "لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ" },
          // i=1 → verseId 1 (right column)
          {
            number: 1,
            text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
          },
        ],
      },
      // ── Group 1 — middle, pushed in ─────────────────────────────────────
      {
        verses: [
          // i=0 → verseId 4 (left col, row 1)
          {
            number: 4,
            text: "مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ",
          },
          // i=1 → verseId 3 (right col, row 1)
          { number: 3, text: "لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ" },
          // i=2 → verseId 6 (left col, row 2)
          {
            number: 6,
            text: "وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ",
          },
          // i=3 → verseId 5 (right col, row 2)
          {
            number: 5,
            text: "يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ",
          },
        ],
      },
      // ── Group 2 — bottom, not pushed in ─────────────────────────────────
      {
        verses: [
          // i=0 → verseId 8 (left column)
          {
            number: 8,
            text: "وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
          },
          // i=1 → verseId 7 (right column)
          { number: 7, text: "وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ" },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" }, // no outro verse
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — English (empty strings per spec)
// ---------------------------------------------------------------------------

export const AYAT_AL_KURSI_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Ayat al-Kursi",
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
            text: "Allah! (He has no equal or partner). He is the Ever-Living, the Sustainer.",
          },
          { number: 2, text: "He never slumbers or sleeps." },
        ],
      },
      {
        verses: [
          {
            number: 3,
            text: "Whatever is in the heavens and on the earth belongs to Him.",
          },
          {
            number: 4,
            text: "Without His permission, who can intercede and have a say in His presence?",
          },
          {
            number: 5,
            text: "Only Allah knows their future and their past.",
          },
          {
            number: 6,
            text: "Unless Allah wills, have they grasped anything from His knowledge to know the past and the future?",
          },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "His throne, His sovereignty is as wide as the heavens and the earth.",
          },
          {
            number: 8,
            text: "Protecting both of them is not burdensome to Him. He is the Most High and the Most Great.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// TEXT DATA — Turkish (empty strings per spec)
// ---------------------------------------------------------------------------

export const AYAT_AL_KURSI_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: {
    label: "Ayetü'l-Kürsî",
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
            text: "Allah! (Onun eşi ortağı yoktur). Hay ve Kayyumdur.",
          },
          {
            number: 2,
            text: "O hiç uyuklamaz ve uyumaz.",
          },
        ],
      },
      {
        verses: [
          { number: 3, text: "Göklerde ve yerde ne varsa Onundur." },
          {
            number: 4,
            text: "Onun izni olmadan kim onun huzurunda şefaatçi ve söz sahibi olabilir ki?",
          },
          {
            number: 5,
            text: "Yalnızca Allah onların geleceklerini de geçmişlerini bilmektedir.",
          },
          {
            number: 6,
            text: "Allah dilemeden, Onun ilminden bir şeyler mi kapmışlar ki geçmişi ve geleceği bilsinler?",
          },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "Onun tahtı, hakimiyeti gökler ve yer genişliğindedir.",
          },
          {
            number: 8,
            text: "O ikisini korumak Ona ağır gelmez. O, Yüce ve Büyüktür.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

// ---------------------------------------------------------------------------
// Aggregated text data (Record<SurahLanguage, SurahDataShape>)
// ---------------------------------------------------------------------------

export const AYAT_AL_KURSI_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: AYAT_AL_KURSI_TEXT_AR,
  en: AYAT_AL_KURSI_TEXT_EN,
  tr: AYAT_AL_KURSI_TEXT_TR,
};
