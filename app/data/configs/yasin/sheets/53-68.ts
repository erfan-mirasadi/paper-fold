import { buildSheet, SHEET_FRAME_SVGS, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------
// 53-67 — the shout, the Garden, the guilty, and the fire. Fifteen ayahs on one
// sheet, copied off the handwritten page.
//
// THE PAGE IS THREE BLOCKS, and the middle one is where its whole argument is:
// the people of the Garden on the RIGHT, the guilty on the LEFT, side by side,
// so the two are read against each other.
//
//   ╭──────────────────────── the shout (53-54) ───────────────────────╮
//   │  53                                                              │
//   │  54                                                              │
//   ╰──────────────────────────────────────────────────────────────────╯
//   ╭──── the guilty (59-62) ────╮ ╭──── the Garden (55-58) ─────────╮
//   │  59                        │ │       56  ──  55                │
//   │      61  ──  60            │ │                                 │
//   │  62                        │ │       58  ──  57                │
//   ╰───────────────────────────╯ ╰─────────────────────────────────╯
//   ╭──────────────────────── the fire (63-67) ────────────────────────╮
//   │       64  ──  63                                                 │
//   │  ╭──────────────────── 65 ─────────────────────────────────────╮ │
//   │  │  66                                                         │ │
//   │  │  67                                                         │ │
//   ╰──╰─────────────────────────────────────────────────────────────╯─╯
//
// TWO SHAPES OF GROUP, and they mean different things. Capsules SIDE BY SIDE
// are one moment said twice — 55 with 56, 57 with 58, 63 with 64, and 60 with
// 61 — and the connector bar between them says so. Capsules STACKED are a
// sequence: the guilty are told to stand apart (59), reminded of the covenant
// (60-61, one sentence in two halves), and then charged with it (62).
//
// SO THE LEFT COLUMN IS A SEQUENCE OF THREE, NOT FOUR. 60 and 61 are the two
// halves of ONE covenant — "do not serve Satan" answered by "serve Me" — and
// stacking them read as two more steps of the sequence. Bridged, they read as
// the single step they are, and the charge above and the verdict below stand
// clear of them: that is what the wider `gapAfter` on either side is for.
//
// THE TWO HALVES OF THAT BAND ARE THE SAME BOX. A whole-column frame takes the
// row's own band, so they cannot come out different heights — but a box the
// same size as its twin and half as full is worse than no twin at all, so the
// two are filled to match as well. The left column now stacks to
// 0.1425 + 0.022 + 0.293 + 0.022 + 0.1425 = 0.622; the Garden's own two rows
// carry 0.1 of air between them so they come to the same number. CHANGE ONE
// AND THE OTHER HAS TO FOLLOW, or the twins stop being twins.
// ---------------------------------------------------------------------------

/**
 * Air each of the three blocks keeps around itself — well under the nesting
 * level's own 0.047. THREE frame edges meet at each band boundary (one block
 * ending, the two halves of the middle band starting), so the gap between two
 * blocks is three times this plus a row's air; at the default the blocks drift
 * apart and the sheet reads as three pages rather than one.
 */
const BLOCK_PAD = 0.025;

const SPEC: SheetSpec = {
  id: "yasin5368",
  key: "yasin5368",
  title: "YÂSÎN: 53-67",
  heroSubtitle: "suresi 53-67",
  sayfa: 444,
  // UNCHANGED from the 55-68 sheet this replaces — the atlas addresses this
  // sheet by its right edge, so its width is what puts it where it is.
  paperWidth: 2.9,
  capsuleWidthScale: 0.88,

  // ── THE GUILTY STACK, SAID WITH AN ARROW ───────────────────────────────
  // 59 ▸ 62: they are told to stand apart, and then charged with exactly that
  // — the covenant (60-61, bridged between them) is what they are charged
  // WITH, not another step of the sequence. Same idiom as every other jump in
  // this surah (1-12's ring, 20-27's 21 ▸ 26): a bracket the frame itself
  // cannot draw, because 59 and 62 are two ends of the SAME frame, not two of
  // them.
  //
  // `pair` is BLOCK indices — this column emits 59, the 60▸61 pair, then 62:
  //   ...  59→4   (60,61)→5   62→6  ...
  // Print them, do not count them; a row added above shifts every index.
  //
  // `curveSide: "right"` — NOT this surah's usual "left" — because 59-62 are
  // already the LEFT column of the split row: bowing "left" would push the
  // ribbon into the sliver of margin between the rose frame and the outer
  // one (0.025 world units, barely a rule's width). "right" bows it into the
  // gutter the guilty stack and the Garden already keep between them.
  curveColors: [
    {
      pair: [4, 6],
      // SHEET_COLORS.maroon — the ink 59 and 62 are already painted in.
      color: "#B0504D",
      fillColor: "#F6EDE8",
      curveSide: "left",
      bowGap: 0.18,
      innerBowGap: 0.15,
      inwardOffset: 0,
      tipThickness: 0.07,
      topAnchorYOffset: -0.01,
      bottomAnchorYOffset: 0.01,
      topAnchorXOffset: 0.04,
      bottomAnchorXOffset: 0.12,
      lineWidthWorld: 0.003,
      opacity: 0.6,
      shape: "arrow",
      arrowHeadLength: 0.08,
      arrowHeadWidth: 0.055,
      twist: true,
      twistT: 0.5,
    },
    // 53 ▸ 65 — the shout named at the top of the page answered by the mouths
    // sealed at the bottom of it. Both blocks are centred (xOffset 0, not a
    // split-row column), so this is the surah's usual LINK idiom — 1-12's
    // 9a▸9b, 20-27's 21▸26 — gold rule on a white ground, `curveSide: "left"`
    // down the page's own left margin, geometry modelled on 20-27's (the
    // closest thing to this on the surah: also a jump PAST several
    // intervening rows rather than a chiasm inside one frame).
    {
      pair: [0, 8],
      color: "#D0A24E",
      fillColor: "#FBFAF4",
      curveSide: "right",
      bowGap: 0.4,
      innerBowGap: 0.37,
      inwardOffset: 0,
      tipThickness: 0.09,
      topAnchorYOffset: -0.1,
      topAnchorXOffset: 0.09,
      bottomAnchorYOffset: -0.01,
      bottomAnchorXOffset: 0.23,
      lineWidthWorld: 0.003,
      opacity: 0.55,
      shape: "arrow",
      arrowHeadLength: 0.13,
      arrowHeadWidth: 0.08,
      twist: true,
      twistT: 0.5,
    },
    // The CENTER colour — see SheetSpec.curveColors. MUST stay transparent:
    // every split-row column on this sheet is narrow enough to be
    // `isPushedIn`, and a visible center colour would bracket all of them.
    { color: "transparent", fillColor: "transparent" },
  ],

  rows: [
    // ── The shout, and the verdict that follows it ────────────────────────
    {
      ayah: 53,
      tone: "blue",
      heightLines: 1.75,
      arScale: 0.9,
      latScale: 0.9,
      ar: "إِن كَانَتْ إِلَّا صَيْحَةً وَاحِدَةً فَإِذَا هُمْ جَمِيعٌ لَّدَيْنَا مُحْضَرُونَ",
      tr: "Sadece tek bir ses olur; hepsi birden huzurumuzda hazır edilirler.",
      en: "It is but one shout, and at once they are all brought before Us.",
    },
    {
      ayah: 54,
      tone: "blue",
      heightLines: 1.75,
      arScale: 0.9,
      latScale: 0.9,
      ar: "فَالْيَوْمَ لَا تُظْلَمُ نَفْسٌ شَيْئًا وَلَا تُجْزَوْنَ إِلَّا مَا كُنتُمْ تَعْمَلُونَ",
      tr: "O gün hiç kimseye zerre kadar haksızlık edilmez; ancak yaptığınız verilir.",
      en: "Today no soul is wronged in the least, and you are repaid only for what you did.",
    },

    // ── The Garden, against the guilty ────────────────────────────────────
    // RIGHT reads first, and it is the Garden: two bridged pairs, each pair one
    // moment said twice. LEFT is the guilty, and it is a stack, because what
    // happens to them happens in order.
    {
      // Pull the two middle sections apart far enough that their enlarged,
      // equal-size frames keep a clean gap between them.
      inwardShift: -0.15,
      right: [
        {
          width: 0.93,
          columnGap: 0.085,
          // 0.06 until 60 and 61 were bridged. The two halves of this band are
          // twins and have to STAY twins — see the header — so the air the
          // guilty stack gained around its new pair is given back here.
          gapAfter: 0.1,
          offsetY: 0,
          pair: [
            {
              ayah: 55,
              tone: "green",
              heightLines: 4.25,
              scale: 1.12,
              arScale: 0.82,
              latScale: 0.76,
              ar: "إِنَّ أَصْحَابَ الْجَنَّةِ\n الْيَوْمَ فِي شُغُلٍ فَاكِهُونَ",
              tr: "O gün cennetlikler bir\nmeşguliyet içinde sevinirler.",
              en: "Today the people of the\nGarden are busy in delight.",
            },
            {
              ayah: 56,
              tone: "green",
              heightLines: 4.25,
              scale: 1.12,
              arScale: 0.82,
              latScale: 0.75,
              ar: "هُمْ وَأَزْوَاجُهُمْ فِي ظِلَالٍ\n عَلَى الْأَرَائِكِ مُتَّكِئُونَ",
              tr: "Onlar ve eşleri gölgeler\naltında, tahtlara kurulmuş.",
              en: "They and their spouses are\nin shade, reclining on couches.",
            },
          ],
        },
        {
          width: 0.93,
          columnGap: 0.085,
          offsetY: 0.01,
          pair: [
            {
              ayah: 57,
              tone: "green",
              heightLines: 4.25,
              scale: 1.12,
              arScale: 0.82,
              latScale: 0.75,
              ar: "لَهُمْ فِيهَا فَاكِهَةٌ\nوَلَهُم مَّا يَدَّعُونَ",
              tr: "Orada meyveler onlarındır;\nistedikleri her şey onlarındır.",
              en: "They have fruit there, and\nwhatever they call for.",
            },
            {
              ayah: 58,
              tone: "green",
              heightLines: 4.25,
              scale: 1.12,
              arScale: 0.82,
              latScale: 0.75,
              ar: "سَلَامٌ قَوْلًا مِّن رَّبٍّ\nرَّحِيمٍ",
              tr: "Selâm — Rahîm olan\nRabden bir söz.",
              en: "“Peace” — a word from\na Merciful Lord.",
            },
          ],
        },
      ],
      left: [
        {
          ayah: 59,
          tone: "maroon",
          heightLines: 1.5,
          gapAfter: 0.022,
          expandW: 0.13,
          arScale: 0.84,
          latScale: 0.89,
          ar: "وَامْتَازُوا الْيَوْمَ أَيُّهَا الْمُجْرِمُونَ",
          tr: "“Ey suçlular, bugün şöyle ayrılın!”",
          en: "“Stand apart today, you guilty ones!”",
        },
        // THE COVENANT, BRIDGED. 60 and 61 are one sentence with two halves —
        // "do not serve Satan" and "serve Me" — so they sit side by side with
        // the connector bar between them, the same shape the Garden's pairs
        // take, rather than stacked as two more steps of the sequence. The
        // charge (59) and the verdict (62) stay stacked around them; that is
        // what the wider `gapAfter` on either side of this pair is for.
        //
        // `width` is 1.137 of the column's natural slot, not 1: the two halves
        // together have to span what a single capsule here spans once its
        // `expandW: 0.13` is added, or the pair would sit narrower than the
        // bars above and below it and the stack would step in and out.
        {
          width: 1.137,
          // The pair's OUTER edges are fixed by `width` — they line up with the
          // bars above and below — so this gap is the only thing that decides
          // how wide the two halves come out. It is deliberately tighter than
          // the Garden's 0.085: these two are one sentence, not two moments,
          // and the air between them was reading as a wall.
          columnGap: 0.028,
          gapAfter: 0.022,
          pair: [
            {
              ayah: 60,
              tone: "white",
              heightLines: 5,
              arScale: 0.9,
              latScale: 0.48,
              // THREE LINES, BROKEN WHERE THE SENTENCE BREAKS: the vocative,
              // the prohibition, the reason. Half a column is too narrow to
              // let the wrapper choose, and a wrapped line here lands mid
              // phrase.
              ar: "أَلَمْ أَعْهَدْ إِلَيْكُمْ يَا بَنِي آدَمَ\nأَن لَّا تَعْبُدُوا الشَّيْطَانَ\nإِنَّهُ لَكُمْ عَدُوٌّ مُّبِينٌ",
              tr: "“Ey Âdemoğulları, şeytana\nkulluk etmeyin diye size\nahit vermedim mi?”",
              en: "“Children of Adam, did I not\ncharge you not to serve\nSatan — he is a clear enemy?”",
            },
            {
              ayah: 61,
              tone: "white",
              heightLines: 5,
              arScale: 1.05,
              latScale: 0.6,
              ar: "وَأَنِ اعْبُدُونِي\nهَٰذَا صِرَاطٌ مُّسْتَقِيمٌ",
              tr: "“Bana kulluk edin;\ndosdoğru yol budur.”",
              en: "“and that you serve Me?\nThis is a straight path.”",
            },
          ],
        },
        {
          ayah: 62,
          tone: "maroon",
          heightLines: 1.5,
          expandW: 0.13,
          arScale: 0.77,
          latScale: 0.65,
          ar: "وَلَقَدْ أَضَلَّ مِنكُمْ جِبِلًّا كَثِيرًا أَفَلَمْ تَكُونُوا تَعْقِلُونَ",
          tr: "“O sizden birçok nesli saptırdı. Aklınızı kullanmadınız mı?”",
          en: "“He led astray many of you. Did you not use your minds?”",
        },
      ],
    },

    // ── The fire: named, then entered, then sealed ────────────────────────
    {
      gapAfter: 0.025,
      pair: [
        {
          ayah: 63,
          tone: "blue",
          arScale: 0.86,
          latScale: 0.8,
          ar: "هَٰذِهِ جَهَنَّمُ الَّتِي كُنتُمْ تُوعَدُونَ",
          tr: "“İşte size vaat edilen cehennem budur.”",
          en: "“This is the Hell you were promised.”",
        },
        {
          ayah: 64,
          tone: "blue",
          heightLines: 1.5,
          arScale: 0.95,
          latScale: 0.63,
          ar: "اصْلَوْهَا الْيَوْمَ بِمَا كُنتُمْ تَكْفُرُونَ",
          tr: "“İnkâr edip durmanıza karşılık bugün girin oraya.”",
          en: "“Burn in it today, for you were disbelieving.”",
        },
      ],
    },
    {
      ayah: 65,
      tone: "gold",
      heightLines: 1.75,
      gapAfter: 0.025,
      arScale: 0.84,
      latScale: 0.67,
      ar: "الْيَوْمَ نَخْتِمُ عَلَىٰ أَفْوَاهِهِمْ وَتُكَلِّمُنَا أَيْدِيهِمْ وَتَشْهَدُ أَرْجُلُهُم بِمَا كَانُوا يَكْسِبُونَ",
      tr: "Bugün ağızlarını mühürleriz; elleri bizimle konuşur, ayakları kazandıklarına şahitlik eder.",
      en: "Today We seal their mouths; their hands speak to Us, their feet testify to what they earned.",
    },
    // 66 ▸ 67, BRIDGED — same shape as 60 ▸ 61: one row instead of two, so the
    // connector bar says "held together" the way the stack could not. UNLIKE
    // 60 ▸ 61, this one is asked to cost NOTHING: no frame on this sheet moves,
    // because the pair's own height (`heightLines`) is set to exactly the
    // 0.317 the two stacked rows used to take between them —
    //   old: rowHeight(66) 0.1425 + gapAfter 0.032 + rowHeight(67) 0.1425
    // — so the fire band ends exactly where it always did.
    {
      pair: [
        {
          ayah: 66,
          tone: "white",
          heightLines: 5.56,
          arScale: 0.86,
          latScale: 0.52,
          ar: "وَلَوْ نَشَاءُ لَطَمَسْنَا عَلَىٰ أَعْيُنِهِمْ\nفَاسْتَبَقُوا الصِّرَاطَ\nفَأَنَّىٰ يُبْصِرُونَ",
          tr: "Dilesek gözlerini silerdik;\nyola koşuşurlardı,\nama nasıl göreceklerdi?",
          en: "Had We willed, We would have\nblotted their eyes; they would\nrace for the path — how then\nwould they see?",
        },
        {
          ayah: 67,
          tone: "white",
          heightLines: 5.56,
          arScale: 0.86,
          latScale: 0.52,
          ar: "وَلَوْ نَشَاءُ لَمَسَخْنَاهُمْ عَلَىٰ مَكَانَتِهِمْ\nفَمَا اسْتَطَاعُوا مُضِيًّا\nوَلَا يَرْجِعُونَ",
          tr: "Dilesek onları oldukları yerde\ndondururduk; ne ileri\ngidebilir ne dönebilirlerdi.",
          en: "Had We willed, We would have\nfixed them where they stand:\nunable to go on, unable to return.",
        },
      ],
    },
  ],

  frames: [
    {
      from: 0,
      // 6, not 5, until 66 ▸ 67 merged into one row — see the fire frame
      // below.
      to: 5,
      tone: "outer",
      src: SHEET_FRAME_SVGS.overall,
      pad: 0,
      w: 2.3,
      // 2.06 until the covenant pair made the middle band 0.04 taller.
      h: 2.1,
    },
    {
      from: 0,
      to: 1,
      tone: "inner",
      src: SHEET_FRAME_SVGS.inner,
      pad: BLOCK_PAD,
      h: 0.45,
      offsetY: -0.14,
    },
    // The two halves of the middle band, each bracketed on its own side. They
    // come out as TWINS. Their explicit size also accounts for the extra width
    // added to 59–62, so neither that stack nor the Garden escapes its frame.
    {
      from: 2,
      to: 2,
      side: "right",
      tone: "band",
      pad: BLOCK_PAD,
      w: 1.28,
      // 0.7 until the covenant pair made this band taller; the number is the
      // band plus the same clearance the twins were drawn with before.
      h: 0.74,
    },
    {
      from: 2,
      to: 2,
      side: "left",
      tone: "rose",
      pad: BLOCK_PAD,
      w: 1.28,
      h: 0.74,
    },
    // The fire, and the sealing of the mouths inside it. `to: 5`, not 6 — 66
    // and 67 are one row now (see the pair above), so the fire band is six
    // rows deep, not seven.
    {
      from: 3,
      to: 5,
      tone: "band",
      pad: BLOCK_PAD,
    },
    // { from: 4, to: 5, tone: "inner" },
  ],
};

export const SHEET = buildSheet(SPEC);

// Match 82's gold capsule and red text in every language.
const verse65Override = Object.values(SHEET.config.verseOverrides ?? {}).find(
  (override) => override.displayNumber === 65,
);
if (!verse65Override) {
  throw new Error("yasin5368: verse override for ayah 65 was not emitted");
}
verse65Override.textColor = "#A30000";

// The same four short curved-arrow SVGs used around 49-52, repeated around
// the 55-58 Garden frame. Only their offsets change to follow this frame's
// centre (x 0.665) and its taller 1.28 x 0.74 rectangle.
SHEET.config.svgOverlays?.push(
  {
    src: "/ahzab/arrows.svg",
    anchorGroupIndex: 2,
    anchorEdge: "top",
    scaleX: 0.1,
    scaleY: 0.1,
    offsetX: 0.665,
    offsetY: 0.03,
    rotationZ: -Math.PI / 2.8,
    renderOrder: 8,
    customSectionId: "yasin5368_f2",
  },
  {
    src: "/ahzab/arrows.svg",
    anchorGroupIndex: 2,
    anchorEdge: "top",
    scaleX: 0.1,
    scaleY: 0.1,
    offsetX: 0.1,
    offsetY: -0.31,
    rotationZ: Math.PI * 0.1,
    renderOrder: 8,
    customSectionId: "yasin5368_f2",
  },
  {
    src: "/ahzab/arrows.svg",
    anchorGroupIndex: 2,
    anchorEdge: "top",
    scaleX: -0.1,
    scaleY: 0.1,
    offsetX: 1.23,
    offsetY: -0.31,
    rotationZ: -Math.PI * 0.1,
    renderOrder: 8,
    customSectionId: "yasin5368_f2",
  },
  {
    src: "/ahzab/arrows.svg",
    anchorGroupIndex: 2,
    anchorEdge: "top",
    scaleX: -0.1,
    scaleY: 0.1,
    offsetX: 0.665,
    offsetY: -0.65,
    rotationZ: -Math.PI / 1.5,
    renderOrder: 8,
    customSectionId: "yasin5368_f2",
  },
);
