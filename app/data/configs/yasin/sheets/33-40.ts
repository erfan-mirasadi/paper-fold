import { buildSheet, SHEET_FRAME_SVGS, type SheetSpec } from "../kit";

// ---------------------------------------------------------------------------
// 33-40 — the earth and the sky, grouped inside the project's standard frames.
// One pale outer frame holds the whole sheet. Four strong-pink inner frames
// hold ayah 33, ayahs 34-35 together, ayah 36, and ayahs 37-40 together.
//
// Ayahs 33-36 are still split into phrase capsules: a full-width phrase, a
// bridged pair, and another full-width phrase. Only the final fragment prints
// the ayah number. Ayahs 37-40 each remain whole and print their own numbers.
// ---------------------------------------------------------------------------

/**
 * Single-ayah phrase groups use half the natural row width. The 34-35 row uses
 * both columns together, while each ayah keeps the same local phrase width.
 */
const PETAL = 0.5;

/**
 * Vertical air each inner frame keeps around its group. Lower values pull the
 * four framed groups together; higher values separate them.
 */
const PETAL_PAD = 0.01;

const SPEC: SheetSpec = {
  id: "yasin3340",
  key: "yasin3340",
  title: "YÂSÎN: 33-40",
  heroSubtitle: "suresi 33-40",
  sayfa: 442,
  paperWidth: 2.3,
  capsuleWidthScale: 0.7,
  capsuleHeightScale: 0.7,

  rows: [
    // ── Lens 1 (top) — ayah 33 ───────────────────────────────────────────
    {
      ayah: 33,
      noNumber: true,
      tone: "green",
      width: PETAL,
      arScale: 0.69,
      latScale: 0.55,
      ar: "وَآيَةٌ لَّهُمُ الْأَرْضُ الْمَيْتَةُ",
      tr: "Ölü toprak onlar için bir delildir:",
      en: "The dead earth is a sign for them:",
    },
    {
      width: PETAL,
      pair: [
        {
          ayah: 33,
          noNumber: true,
          tone: "cream",
          arScale: 0.6,
          latScale: 0.62,
          ar: "أَحْيَيْنَاهَا",
          tr: "onu dirilttik,",
          en: "We revived it,",
        },
        {
          ayah: 33,
          noNumber: true,
          tone: "cream",
          arScale: 0.6,
          latScale: 0.44,
          ar: "وَأَخْرَجْنَا مِنْهَا حَبًّا",
          tr: "ondan taneler çıkardık,",
          en: "and brought grain from it,",
        },
      ],
    },
    {
      ayah: 33,
      tone: "green",
      width: PETAL,
      arScale: 0.69,
      latScale: 0.89,
      ar: "فَمِنْهُ يَأْكُلُونَ",
      tr: "ondan yiyorlar.",
      en: "and of it they eat.",
    },

    // ── Lenses 2 and 3 (right · left) — ayahs 34 and 35 ──────────────────
    {
      ratio: 0.5,
      inwardShift: 0.035,
      right: [
        {
          ayah: 34,
          noNumber: true,
          tone: "green",
          width: 0.9,
          arScale: 0.69,
          latScale: 0.66,
          ar: "وَجَعَلْنَا فِيهَا جَنَّاتٍ",
          tr: "Orada bahçeler var ettik,",
          en: "In it We made gardens,",
        },
        {
          width: 0.9,
          pair: [
            {
              ayah: 34,
              noNumber: true,
              tone: "cream",
              arScale: 0.6,
              latScale: 0.73,
              ar: "مِّن نَّخِيلٍ",
              tr: "hurmadan",
              en: "of palm",
            },
            {
              ayah: 34,
              noNumber: true,
              tone: "cream",
              arScale: 0.6,
              latScale: 0.63,
              ar: "وَأَعْنَابٍ",
              tr: "ve üzümden",
              en: "and vine",
            },
          ],
        },
        {
          ayah: 34,
          tone: "green",
          // Bring the two opposite bottom capsules almost together.
          width: 0.9,
          arScale: 0.69,
          latScale: 0.58,
          ar: "وَفَجَّرْنَا فِيهَا مِنَ الْعُيُونِ",
          tr: "içinden pınarlar fışkırttık.",
          en: "and made springs gush forth.",
        },
      ],
      left: [
        {
          ayah: 35,
          noNumber: true,
          tone: "green",
          width: 0.9,
          arScale: 0.69,
          latScale: 0.58,
          ar: "لِيَأْكُلُوا مِن ثَمَرِهِ",
          tr: "Ürününden yesinler diye —",
          en: "That they may eat its fruit —",
        },
        {
          width: 0.9,
          pair: [
            {
              ayah: 35,
              noNumber: true,
              tone: "cream",
              arScale: 0.6,
              latScale: 0.44,
              ar: "وَمَا عَمِلَتْهُ",
              tr: "oysa onu yapan",
              en: "yet it was not made",
            },
            {
              ayah: 35,
              noNumber: true,
              tone: "cream",
              arScale: 0.6,
              latScale: 0.5,
              ar: "أَيْدِيهِمْ",
              tr: "elleri değil.",
              en: "by their hands.",
            },
          ],
        },
        {
          ayah: 35,
          tone: "green",
          // Match ayah 34 so the pair remains visually centred.
          width: 0.9,
          arScale: 0.69,
          latScale: 0.58,
          ar: "أَفَلَا يَشْكُرُونَ",
          tr: "Hâlâ şükretmezler mi?",
          en: "Will they not give thanks?",
        },
      ],
    },

    // ── Lens 4 — ayah 36 ────────────────────────────────────────────────
    {
      ayah: 36,
      noNumber: true,
      tone: "green",
      width: PETAL,
      arScale: 0.69,
      latScale: 0.49,
      ar: "سُبْحَانَ الَّذِي خَلَقَ الْأَزْوَاجَ كُلَّهَا",
      tr: "Bütün çiftleri yaratanı tesbih ederim:",
      en: "Glory to Him who created all the pairs:",
    },
    {
      width: PETAL,
      pair: [
        {
          ayah: 36,
          noNumber: true,
          tone: "cream",
          arScale: 0.6,
          latScale: 0.44,
          ar: "مِمَّا تُنبِتُ الْأَرْضُ",
          tr: "toprağın bitirdiklerinden,",
          en: "of what the earth grows,",
        },
        {
          ayah: 36,
          noNumber: true,
          tone: "cream",
          arScale: 0.6,
          latScale: 0.46,
          ar: "وَمِنْ أَنفُسِهِمْ",
          tr: "kendi canlarından,",
          en: "of themselves,",
        },
      ],
    },
    {
      ayah: 36,
      tone: "green",
      width: PETAL,
      arScale: 0.69,
      latScale: 0.59,
      ar: "وَمِمَّا لَا يَعْلَمُونَ",
      tr: "ve bilmediklerinden.",
      en: "and of what they do not know.",
    },
    // ── Lens 5 (bottom) — the sky, 37-40 ────────────────────────────────
    //
    // Same three lines as every petal on this page: one across the top, a
    // BRIDGED PAIR through the middle, one across the bottom. The only
    // difference is what a capsule holds — a whole ayah here, a fragment in the
    // petals around it — so every one of these four prints its own number, and
    // its two middle capsules carry one line here as an intentional layout
    // experiment — the generator will fit the long ayahs down to the slot.
    {
      ayah: 37,
      tone: "lav",
      width: PETAL,
      offsetY: -0.02,
      arScale: 0.55,
      latScale: 0.5,
      ar: "وَآيَةٌ لَّهُمُ اللَّيْلُ نَسْلَخُ مِنْهُ\nالنَّهَارَ فَإِذَا هُم مُّظْلِمُونَ",
      tr: "Gece de bir delildir: ondan gündüzü\nsıyırırız, karanlıkta kalıverirler.",
      en: "The night is a sign: We strip the day\nfrom it, and they are in darkness.",
    },
    {
      // Give the 38–39 pair a little extra width so the number badge clears
      // the long one-line text instead of sitting inside it.
      width: 1.2,
      offsetY: -0.02,
      pair: [
        {
          ayah: 38,
          tone: "blue",
          arScale: 0.48,
          latScale: 0.45,
          ar: "وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَّهَا ذَٰلِكَ تَقْدِيرُ الْعَزِيزِ الْعَلِيمِ",
          tr: "Güneş kendi yörüngesinde akar; bu, Azîz ve Alîm'in takdiridir.",
          en: "The sun runs to its resting place: the decree of the Mighty, the Knowing.",
        },
        {
          ayah: 39,
          tone: "blue",
          arScale: 0.53,
          latScale: 0.45,
          ar: "وَالْقَمَرَ قَدَّرْنَاهُ مَنَازِلَ حَتَّىٰ عَادَ كَالْعُرْجُونِ الْقَدِيمِ",
          tr: "Aya da konaklar takdir ettik; sonunda kuru bir hurma dalına döner.",
          en: "For the moon We ordained phases, till it returns like an old palm stalk.",
        },
      ],
    },
    {
      ayah: 40,
      tone: "lav",
      width: PETAL,
      heightLines: 3,
      offsetY: -0.02,
      arScale: 0.55,
      latScale: 0.49,
      ar: "لَا الشَّمْسُ يَنبَغِي لَهَا أَن تُدْرِكَ الْقَمَرَ\nوَلَا اللَّيْلُ سَابِقُ النَّهَارِ وَكُلٌّ فِي فَلَكٍ يَسْبَحُونَ",
      tr: "Ne güneş aya yetişebilir, ne gece gündüzü geçebilir;\nher biri bir yörüngede yüzer.",
      en: "The sun may not overtake the moon,\nnor the night outrun the day: each swims in an orbit.",
    },
  ],

  frames: [
    // One pale standard frame around the complete 33-40 sheet.
    {
      from: 0,
      to: 9,
      tone: "outer",
      src: SHEET_FRAME_SVGS.overall,
      w: 1.6,
      h: 1.78,
      offsetY: -0.76,
    },
    // The blue section used for ayahs 14-19, reused here for ayahs 33-36.
    {
      from: 0,
      to: 6,
      tone: "band",
      src: SHEET_FRAME_SVGS.band,
      pad: PETAL_PAD,
      h: 1.13,
      w: 1.4,
    },
    // Four strong-pink standard inner frames: 33, 34-35, 36 and 37-40.
    {
      from: 0,
      to: 2,
      tone: "inner",
      src: SHEET_FRAME_SVGS.inner,
      pad: PETAL_PAD,
      w: 0.6864,
      h: 0.38,
      offsetY: -0.1352,
    },
    {
      from: 3,
      to: 3,
      tone: "inner",
      src: SHEET_FRAME_SVGS.inner,
      pad: PETAL_PAD,
      w: 1.53,
      h: 0.39,
      offsetY: -0.1353,
    },
    {
      from: 4,
      to: 6,
      tone: "inner",
      src: SHEET_FRAME_SVGS.inner,
      pad: PETAL_PAD,
      w: 0.6864,
      h: 0.38,
      offsetY: -0.1353,
    },
    {
      from: 7,
      to: 9,
      tone: "inner",
      src: SHEET_FRAME_SVGS.inner,
      pad: PETAL_PAD,
      w: 1.4617,
      h: 0.48,
      offsetY: -0.1757,
    },
  ],
};

export const SHEET = buildSheet(SPEC);
