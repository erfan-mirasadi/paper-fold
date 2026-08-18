import {
  buildSheet,
  SHEET_COLORS,
  SHEET_FRAME_SVGS,
  type SheetSpec,
} from "../kit";

// ---------------------------------------------------------------------------
// 33-40 — the earth and the sky, ONE sheet in two mirrored halves.
//
// Eight ayahs, and they fall into two fours that say the same thing twice: a
// sign underfoot, then a sign overhead. So both halves are declared with the
// SAME THREE ROWS — a whole ayah, a bridged pair, a whole ayah — and each half
// gets one frame and one arrow from its first ayah to its last:
//
//        ╭──────── the earth (pink) ────────╮
//        │   33   ────────────────────► 36  │   whole · pair(34·35) · whole
//        ╰──────────────────────────────────╯
//        ╭──────── the sky  (cream) ────────╮
//        │   37   ────────────────────► 40  │   whole · pair(38·39) · whole
//        ╰──────────────────────────────────╯
//
// EVERY AYAH IS WHOLE. This sheet used to break 33 … 36 into phrase capsules —
// three per ayah, with only the last one numbered — while 37 … 40 stayed whole.
// That made one page out of two grammars and it is gone. One capsule, one ayah,
// one number, on both halves.
//
// The two halves keep their own inks (green/cream above, lavender/blue below)
// so the mirror reads as a rhyme rather than a repetition.
// ---------------------------------------------------------------------------

const SPEC: SheetSpec = {
  id: "yasin3340",
  key: "yasin3340",
  title: "YÂSÎN: 33-40",
  heroSubtitle: "suresi 33-40",
  sayfa: 442,
  // EVERY SIZING KNOB HERE IS 20-27's, so the two stand side by side on the
  // levha as one pair: the default 1.54 page, `capsuleWidthScale` 1.05, rows at
  // `width: 1.15`, and the outer frame below at exactly its 1.1 x 1.47. The
  // sheet used to be 2.3 wide with capsules at 0.7 and sprawled across two of
  // its neighbours' columns.
  capsuleWidthScale: 1.05,
  contentStartY: -0.246,

  // ── THE LINK BETWEEN THE HALVES ────────────────────────────────────────
  // Earth answered by sky. Anchored on the INNER edge of each half — ayah 36's
  // last phrase (block 11) and ayah 37 (block 12) — so the bow's body lies in
  // the gap between the two frames and the head lands on the sky.
  //
  // The surah's LINK colour, gold on white: the same mark the 1-12 sheet gives
  // 9a ▸ 9b and the 13-19 and 20-27 sheets give their own section-to-section
  // arrows. nisa36Config's twisted arrow, one side only.
  //
  // `pair` is BLOCK indices, and a split row emits its RIGHT column first:
  //   33 → 0 · 1 · 2      34 → 3 · 4 · 5      35 → 6 · 7 · 8
  //   36 → 9 · 10 · 11    37 → 12   38·39 → 13   40 → 14
  //
  // Y offsets correct for `smallBoxH2`: a bracket anchors with the page-wide
  // `capsuleHeight` (0.12) and these capsules are 0.073 and 0.104, so each end
  // misses its own capsule's centre until it is corrected.
  curveColors: [
    {
      pair: [0, 2], // ayah 33 ▸ ayah 36 — across the earth
      color: SHEET_COLORS.green.border,
      fillColor: SHEET_COLORS.green.bg,
      curveSide: "left",
      // Anchored on the capsules' left edge (0.375), using the same shallow bow
      // as the 13-19 and 20-27 section-to-section arrows.
      bowGap: 0.11,
      innerBowGap: 0.09,
      inwardOffset: 0,
      tipThickness: 0.09,
      // Anchors are placed with the page-wide `capsuleHeight` (0.12) and these
      // capsules are 0.148, so both ends are 0.014 off their own centre.
      topAnchorYOffset: -0.033,
      bottomAnchorYOffset: 0.014,
      bottomAnchorXOffset: 0.13,
      topAnchorXOffset: 0.021,
      lineWidthWorld: 0.003,
      opacity: 0.55,
      shape: "arrow",
      arrowHeadLength: 0.095,
      arrowHeadWidth: 0.075,
      twist: true,
      twistT: 0.5,
    },
    {
      pair: [3, 5], // ayah 37 ▸ ayah 40 — across the sky
      color: SHEET_COLORS.lav.border,
      fillColor: SHEET_COLORS.lav.bg,
      curveSide: "left",
      // Same depth as the earth's arrow above — the two halves are mirrors and
      // their arrows have to look it.
      bowGap: 0.11,
      innerBowGap: 0.09,
      inwardOffset: 0,
      tipThickness: 0.09,
      topAnchorXOffset: 0.021,
      topAnchorYOffset: -0.034,
      bottomAnchorYOffset: 0.014,
      bottomAnchorXOffset: 0.13,
      lineWidthWorld: 0.003,
      opacity: 0.55,
      shape: "arrow",
      arrowHeadLength: 0.095,
      arrowHeadWidth: 0.075,
      twist: true,
      twistT: 0.5,
    },
    // The CENTER colour — EVERY block here is `isCenter && isPushedIn`, so a
    // visible one would bracket all six capsule rows individually.
    { color: "transparent", fillColor: "transparent" },
  ],

  rows: [
    // ── THE EARTH — ayahs 33 … 36 ────────────────────────────────────────
    // Three rows: a whole ayah, the 34 · 35 pair FACING EACH OTHER, a whole
    // ayah. The sky below repeats it exactly. No `arScale` anywhere — the rows
    // are all one width, so the kit's fit gives the singles one size and the
    // pair capsules another, and each set stays level with itself.
    {
      ayah: 33,
      tone: "green",
      width: 1.15,
      ar: "وَآيَةٌ لَّهُمُ الْأَرْضُ الْمَيْتَةُ أَحْيَيْنَاهَا\nوَأَخْرَجْنَا مِنْهَا حَبًّا فَمِنْهُ يَأْكُلُونَ",
      tr: "Ölü toprak onlar için bir delildir: onu dirilttik,\nondan taneler çıkardık; ondan yiyorlar.",
      en: "The dead earth is a sign for them: We revived it,\nbrought grain from it, and of it they eat.",
    },
    {
      // The pair keeps its bridge. Its capsules are half a row wide, so their
      // text takes THREE lines where a single takes two — that is where the
      // height went when the page lost its width.
      width: 1.15,
      pair: [
        {
          ayah: 34,
          tone: "cream",
          ar: "وَجَعَلْنَا فِيهَا جَنَّاتٍ\nمِّن نَّخِيلٍ وَأَعْنَابٍ\nوَفَجَّرْنَا فِيهَا مِنَ الْعُيُونِ",
          tr: "Orada hurmadan ve üzümden\nbahçeler var ettik;\niçinden pınarlar fışkırttık.",
          en: "In it We made gardens\nof palm and vine,\nand made springs gush forth.",
        },
        {
          ayah: 35,
          tone: "cream",
          ar: "لِيَأْكُلُوا مِن ثَمَرِهِ\nوَمَا عَمِلَتْهُ أَيْدِيهِمْ\nأَفَلَا يَشْكُرُونَ",
          tr: "Ürününden yesinler diye —\noysa onu yapan elleri değil.\nHâlâ şükretmezler mi?",
          en: "That they may eat its fruit —\nyet not made by their hands.\nWill they not give thanks?",
        },
      ],
    },
    {
      ayah: 36,
      tone: "green",
      width: 1.15,
      ar: "سُبْحَانَ الَّذِي خَلَقَ الْأَزْوَاجَ كُلَّهَا مِمَّا تُنبِتُ\nالْأَرْضُ وَمِنْ أَنفُسِهِمْ وَمِمَّا لَا يَعْلَمُونَ",
      tr: "Bütün çiftleri yaratanı tesbih ederim: toprağın bitirdiklerinden,\nkendi canlarından ve bilmediklerinden.",
      en: "Glory to Him who created all the pairs: of what the earth grows,\nof themselves, and of what they do not know.",
    },

    // ── THE SKY — ayahs 37 … 40. The same three rows again. ──────────────
    {
      ayah: 37,
      tone: "lav",
      width: 1.15,
      ar: "وَآيَةٌ لَّهُمُ اللَّيْلُ نَسْلَخُ مِنْهُ\nالنَّهَارَ فَإِذَا هُم مُّظْلِمُونَ",
      tr: "Gece de bir delildir: ondan gündüzü\nsıyırırız, karanlıkta kalıverirler.",
      en: "The night is a sign: We strip the day\nfrom it, and they are in darkness.",
    },
    {
      width: 1.15,
      pair: [
        {
          ayah: 38,
          tone: "blue",
          ar: "وَالشَّمْسُ تَجْرِي\nلِمُسْتَقَرٍّ لَّهَا ذَٰلِكَ\nتَقْدِيرُ الْعَزِيزِ الْعَلِيمِ",
          tr: "Güneş kendi\nyörüngesinde akar; bu,\nAzîz ve Alîm'in takdiridir.",
          en: "The sun runs to its\nresting place: the decree\nof the Mighty, the Knowing.",
        },
        {
          ayah: 39,
          tone: "blue",
          ar: "وَالْقَمَرَ قَدَّرْنَاهُ\nمَنَازِلَ حَتَّىٰ عَادَ\nكَالْعُرْجُونِ الْقَدِيمِ",
          tr: "Aya da konaklar\ntakdir ettik; sonunda kuru\nbir hurma dalına döner.",
          en: "For the moon We ordained\nphases, till it returns\nlike an old palm stalk.",
        },
      ],
    },
    {
      ayah: 40,
      tone: "lav",
      width: 1.15,
      ar: "لَا الشَّمْسُ يَنبَغِي لَهَا أَن تُدْرِكَ الْقَمَرَ وَلَا اللَّيْلُ\nسَابِقُ النَّهَارِ وَكُلٌّ فِي فَلَكٍ يَسْبَحُونَ",
      tr: "Ne güneş aya yetişebilir, ne gece gündüzü geçebilir;\nher biri bir yörüngede yüzer.",
      en: "The sun may not overtake the moon,\nnor the night outrun the day: each swims in an orbit.",
    },
  ],

  frames: [
    // TWO SECTION FRAMES, and nothing else. The page used to nest four pink
    // frames and a blue band inside the outer one — one around ayah 33, one
    // around 34-35, one around 36, one around 37-40 — which drew every group
    // twice over and left the sheet reading as five boxes rather than two
    // halves. It is now what it always meant: the earth (33 … 36), then the sky
    // (37 … 40), one frame each, both drawn the way 37-40 already was.
    //
    // NONE OF THE THREE CARRIES w / h / offsetY. Those overrides are exactly
    // what made the outer frame the wrong size for its own rows; drop them and
    // `buildSheet` measures each frame off the capsules it actually owns — their
    // horizontal extent plus `framePadX(depth)`, and the row band top to bottom
    // plus its own `pad`. Add or resize a row and the frames follow it.
    //
    // `pad` is the only size knob left: the vertical air a frame opens around
    // its rows, AND — through `gapAbove` — the air opened wherever a frame edge
    // passes between two rows. Turning it up is how this sheet got taller. The
    // outer frame takes much more than the two inside it (0.09 against 0.06) so
    // that it reads as a margin around them rather than a fourth rule hugging
    // the pink one: at the depth defaults the two would have sat 0.008 apart.
    {
      from: 0,
      to: 5,
      tone: "outer",
      src: SHEET_FRAME_SVGS.overall,
      pad: 0.07,
      w: 1.1,
      h: 1.47,
      offsetY: -0.63,
    },
    // The earth — ayahs 33 … 36, in the surah's shared pink.
    {
      from: 0,
      to: 2,
      tone: "inner",
      src: SHEET_FRAME_SVGS.inner,
      pad: 0.045,
      w: 1.05,
      h: 0.73,
      offsetY: -0.255,
    },
    // The sky — ayahs 37 … 40, in cream. The one frame on the sheet that is not
    // pink: these four answer the four above them rather than continuing them.
    {
      from: 3,
      to: 5,
      tone: "inner",
      src: SHEET_FRAME_SVGS.gold,
      pad: 0.045,
      w: 1.05,
      h: 0.73,
      offsetY: -0.255,
    },
  ],
};

export const SHEET = buildSheet(SPEC);
