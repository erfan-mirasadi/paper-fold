/**
 * YÂSÎN: 1-12 — the opening page in twelve capsules, three sections.
 *
 *                  ┌─── (1) ───┐                  ayah 1
 *
 *      ╭╴╴╴╴╴╴ scalloped frame ╶╴╴╴╴╴╴╴╴╴╴╮
 *      ⊂           ┌─── (2) ───┐          ⊃      ayah 2
 *      ⊂      ┌─ (3) ─┬─ (4) ─┐           ⊃      ayahs 3 · 4
 *      ⊂           ┌─── (5) ───┐          ⊃      ayah 5
 *      ╰╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╯
 *
 *   ╔═════════════ outer ring ═════════════╗
 *   ║ ╭┌──────────── (6) ───────────┐      ║   ayah 6
 *   ║ │╔══════════ middle ring ════╗       ║
 *   ║ │╭┌──────── (7) ────────┐   ║        ║   ayah 7
 *   ║ ││╔═══════ inner ring ══╗    ║       ║
 *   ║ ││╭┌──── (8) ─────┐    ║   ║         ║   ayah 9, the two barriers
 *   ║ ││╰└──── (9) ─────┘    ║   ║         ║   ayah 9, the veil
 *   ║ ││╚════════════════════╝     ║       ║
 *   ║ │╰ └───────── (10) ──────┘    ║      ║   ayah 10
 *   ║ │╚═════════════════════════╝         ║
 *   ║ ╰ └──────────── (11) ──────────┘     ║   ayah 11
 *   ╚═══════════════════════════════════════╝
 *
 *              ┌───── (12) ─────┐   ۱۲         ayah 12, on no frame at all
 *
 * THE RING IS THE POINT. Ayahs 6 … 11 are a chiasm and the page draws it as an
 * onion: 6 pairs with 11 (who will not believe / whom you can warn), 7 pairs
 * with 10 (shackled necks / warning makes no difference), and ayah 9 sits alone
 * at the centre, split over two capsules. The three ⟨ brackets down the LEFT
 * margin say the pairing outright — the project's own plain side curves, one
 * bow each (`curveSide: "left"`, never mirrored). They are declared in
 * `styling.colors.curveColors`, not in `svgOverlays`. Ayah 12 is not another
 * layer of the onion, which is why nothing is drawn around it at all: it
 * answers the whole thing from outside.
 *
 * HOW THE PAGE LANDS IN TWELVE CAPSULES. The opening merges two pairs and the
 * centre splits one ayah, and both seams are grammatical, not convenience:
 *
 *   capsule  ayah(s)  badge   why it is one capsule
 *    1        1 · 2     ٢     the oath: "Yâ Sîn — by the wise Qur'an"
 *    2        3         ٣
 *    3        4         ٤
 *    4        5         ٥     the opening section's closing line
 *    5        7         ٦
 *    6        8         ٧
 *    7        9a        ٨     the two barriers, front and behind
 *    8        9b        ٩     "so We covered them; they cannot see"
 *    9        10        ١٠
 *   10        11        ١١
 *   11        12        ١٢    all three of its clauses, over two lines
 *
 * A capsule's badge is the number of the LAST ayah it carries, the way a mushaf
 * marks the end of the text in front of you. `hideVerseNumbers` is on and each
 * badge opts back in via `showNumber` + `displayNumber`; every capsule now has
 * a number. The capsule ids are NOT the numbers drawn on the page.
 *
 * IT IS DRAWN AFTER TEVBE 24, and that is a rule, not a resemblance. Every fill
 * on this page is a colour lifted from tevbe24Config or from the frames that
 * page is drawn with, at the SAME opacity: the frames are #F5EEDC / #E1E3F3 /
 * #CEE0E9 at 0.6, which is what /tevbe/dome-section.svg and dome-section-1.svg
 * carry. Every frame corner is 0.040 world, which is what /nisa/all-section-1
 * comes out at on Tevbe's own 1.15 x 1.24 plane — no stadiums, here or there.
 * A capsule's own colours are Tevbe's palette too (see the constants below).
 *
 * GEOMETRY IS SOLVED, NOT EYEBALLED. Every `svgOverlays` offsetY is
 * `(wanted frame centre) − (anchor block's frameY)`, from the stack table above
 * `blocks`. Horizontally, `sectionInnerW` is 1.13, so a capsule's width is
 * `0.547 − horizontalInset`, and each frame's corner radius caps how wide its
 * capsules may be — see the fit arithmetic in /public/yasin/ring-outer.svg. The
 * scalloped opening frame is the tightest of them, because it is only body-wide
 * near its top and bottom edges; /public/yasin/cloud.svg carries that profile.
 *
 * TEXT SCALES. `textScaleOverride` REPLACES the page's `verseTextScale` rather
 * than scaling it (SharedUI: `textScale = textScaleOverride ?? verseBig`), so
 * the number on a capsule IS its font size, in units of the 0.071 big-verse em.
 * Each one is the size at which that capsule's ink — vowel marks and descenders
 * included — just clears its own rule:
 *
 *     ink height ≈ 0.071 × override × ((lines − 1) × 1.2 + 1.05)
 *                ≤ capsule height − 0.012   ← the Arabic block is drawn 0.006
 *                                             low, so the bottom edge binds
 *
 * Overshooting does not look big — CanvasText gets a canvas the size of the
 * capsule, so text that does not fit is re-wrapped and then CLIPPED. That is
 * what used to shave the marks off the top line of every two-line capsule in
 * the ring, and why four of them now set on one line instead.
 */

import type { SurahLayoutConfig } from "../../../schema";
import type { SurahDataShape } from "../../../SurahConfig";
import type { SurahLanguage } from "../../../../hooks/useSurahLanguageStore";
import { GREEN_THEME, GREEN_VERSE_BG } from "../../../theme";
import { yasinHandwrittenTitle } from "../kit";

// ---------------------------------------------------------------------------
// COLOR PALETTE — Tevbe 24's, not the reference photo's. The photo paints in
// watercolour; this app's idiom is the shared gold gradient on frames and
// Tevbe's pale grounds with colored rules on capsules. Pairing rule: a capsule
// never shares its ground with the frame it sits on.
//   scalloped    cream frame     ->  MAROON/CREAM capsules (ayahs 2 … 5)
//   outer ring   cream frame     ->  WHITE_BG capsules  (ayahs 6 · 11)
//   middle ring  lavender frame  ->  CREAM_BG capsules  (ayahs 7 · 10)
//   inner ring   blue frame      ->  WHITE_BG capsules  (ayah 9)
//
// Every constant below is a literal from tevbe24Config.ts, and the frames use
// the same three fills at the same 0.6 opacity Tevbe's own frames carry. Change
// one here and it stops being that page's ink.
// ---------------------------------------------------------------------------

const CREAM_BG = "#F3EAD6";
const GOLD_BORDER = "#D0A24E";
const LAV_BG = "#E1E3F3";
const LAV_BORDER = "#8E93C8";
const DOME_BG = "#F5EEDC";
const DOME_BORDER = "#D0A24E";
const WHITE_BG = "#FBFAF4";
const WHITE_BORDER = "#C7C1AC";
const MAROON_BG = "#F6EDE8";
const MAROON_BORDER = "#B0504D";

/**
 * The page's one rule thickness, in world units. It is `capsuleBorderWidth`
 * below AND the three side brackets' `lineWidthWorld`, so a bracket's outline
 * is drawn exactly as thick as the capsule rules it runs between — which only
 * works in world units, a capsule's border being geometry rather than a
 * screen-space line.
 */
const RULE_W = 0.0038;

/**
 * WHAT THE COMPOSED PAGE MULTIPLIES THIS SHEET BY — 1.25 of its own (see the
 * `s0112` placement in ../index.ts) times the grid's 1.1.
 *
 * This sheet is never drawn on its own; it only ever appears on the Yâsîn
 * levha, and `paperComposer` scales every world-unit field a sheet owns —
 * capsule heights, insets, overlay sizes, and the side curves below.
 *
 * The curve numbers were tuned BY EYE, on the composed page, so they are the
 * composed sizes. `tuned()` divides them back into this sheet's own units,
 * which is what the composer expects to be handed. Keep tuning in composed
 * numbers — read one off the screen, put it in, and let this do the division.
 */
const LEVHA_S = 1.25 * 1.1;
const tuned = (composed: number) =>
  Math.round((composed / LEVHA_S) * 1e5) / 1e5;

const INK = "#2C2A22";
const INK_GOLD = "#5A3D12";
const INK_LAV = "#26283F";
const INK_PURPLE = "#634E73";
const INK_RED = "#A30000";

// EVERY capsule is `isPill: false`, as in tevbe24Config. Not cosmetic: SharedUI
// picks the verse font as `isPill ? VERSE_TEXT_SMALL (0.038) : VERSE_TEXT_BIG
// (0.071)`, so mixing the flag on one page puts its capsules on two baselines
// almost 2x apart and no per-capsule override reconciles them. The rounded look
// comes from `styling.verseRadius`.
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
  // Sizes pass through untouched: each one below is already the size itself,
  // not a share of some page-wide baseline. See TEXT SCALES in the header.
  ...extra,
});

export const YASIN_36_CONFIG: SurahLayoutConfig = {
  id: "yasin36",
  title: "YÂSÎN: 1-12",
  heroTitle: "Yâsîn",
  heroSubtitle: "suresi 1-12",

  scriptInfo: { title: "36 Yâ-Sîn", sayfa: 440, juz: 22, hizb: 44 },

  scriptHighlights: {
    "pre-start": [1, 2, 3, 4, 5, 6, 11, 12],
    end: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },

  features: {
    hasIntro: false,
    hasElevatedSections: true,
    hasPopUps: false,
    hideVerseNumbers: true,
  },

  dimensions: {
    paperWidth: 1.54,
    // Solved, not chosen: the stack is 1.617 tall and `contentStartY` has to
    // land on −0.184 (the top margin the handwritten title was placed in), so
    //   PH = 2 · (0.184 + 1.617/2 + sceneCenterYOffset) = 2.025.
    // Change a gap in `blocks` and this number changes with it.
    paperHeight: 2.025,
    sceneCenterYOffset: 0.02,
    // 0.20, not 0.29 → sectionW 1.14, sectionInnerW 1.13. The outer ring is
    // 1.01 wide and the mandorla 1.16; at 0.29 neither would fit.
    padding: 0.2,
    scrollPages: 3,
    fixedWidthAcrossLanguages: true,
  },

  specialVerses: {},

  handwrittenNotes: yasinHandwrittenTitle(1.54, "1–12"),

  verseOverrides: {
    // ── SECTION 1 — the opening five capsules ─────────────────────────────
    // The letters stand alone above the cloud (id 1), the oath opens it (12),
    // ayahs 3 · 4 are its widest line, and ayah 5 closes it.
    1: capsule(WHITE_BG, WHITE_BORDER, INK, {
      circleTextCol: "#4A4636",
      textColor: "#000000",
      textScaleOverride: 0.94,
      translationTextScaleOverride: 0.9,
      showNumber: true,
      displayNumber: 1,
    }),
    2: capsule(MAROON_BG, MAROON_BORDER, INK_RED, {
      circleTextCol: "#7C2C2A",
      textColor: "#000000",
      textScaleOverride: 0.68,
      translationTextScaleOverride: 0.49,
      showNumber: true,
      displayNumber: 2,
    }),
    3: capsule(CREAM_BG, GOLD_BORDER, INK_GOLD, {
      circleTextCol: "#7A5A18",
      textColor: "#000000",
      textScaleOverride: 0.74,
      translationTextScaleOverride: 0.46,
      showNumber: true,
      displayNumber: 3,
    }),
    // The photo rules this one in dark red — the only red rule in the opening
    // section, and it lands on "a straight path".
    4: capsule(CREAM_BG, GOLD_BORDER, INK_GOLD, {
      circleTextCol: "#7A5A18",
      textColor: "#000000",
      textScaleOverride: 0.75,
      translationTextScaleOverride: 0.48,
      showNumber: true,
      displayNumber: 4,
    }),
    5: capsule(MAROON_BG, MAROON_BORDER, INK_RED, {
      circleTextCol: "#7C2C2A",
      // One line in a 0.500-wide capsule, the cloud's closing line.
      textColor: "#000000",
      textScaleOverride: 0.69,
      translationTextScaleOverride: 0.49,
      showNumber: true,
      displayNumber: 5,
    }),
    // ── OUTER RING — ayahs 6 and 11, paired in the green theme ───────────
    6: capsule(GREEN_VERSE_BG, GREEN_THEME, GREEN_THEME, {
      // Eight words on ONE line in 0.84 — the widest single line on the page.
      textColor: "#000000",
      textScaleOverride: 0.8,
      translationTextScaleOverride: 0.61,
      showNumber: true,
      displayNumber: 6,
    }),
    11: capsule(GREEN_VERSE_BG, GREEN_THEME, GREEN_THEME, {
      // The longest text on the page — eleven words. On ONE line now: the
      // capsule is 0.84 wide and two lines in 0.110 could only be set at 0.48,
      // where the top line's marks were cropped off by the capsule's own edge.
      textColor: "#000000",
      textScaleOverride: 0.8,
      translationTextScaleOverride: 0.61,
      showNumber: true,
      displayNumber: 11,
    }),

    // ── MIDDLE RING (lavender frame) — ayahs 8 and 10 ────────────────────
    // Both were broken over two lines and both were clipped for it; on one line
    // each is width-bound instead, and ayah 10 in particular gains half again.
    7: capsule(CREAM_BG, LAV_BORDER, INK_LAV, {
      textColor: "#000000",
      textScaleOverride: 0.73,
      translationTextScaleOverride: 0.56,
      showNumber: true,
      displayNumber: 7,
    }),
    10: capsule(CREAM_BG, LAV_BORDER, INK_LAV, {
      textColor: "#000000",
      textScaleOverride: 0.73,
      translationTextScaleOverride: 0.56,
      showNumber: true,
      displayNumber: 10,
    }),

    // ── INNER RING (blue frame) — the centre, ayah 9 ─────────────────────
    // Ayah 9 is the crux, so its closing clause takes Tevbe's red the way
    // Tevbe's own ana bölüm does, and the barriers take its purple.
    8: capsule(WHITE_BG, WHITE_BORDER, INK_PURPLE, {
      textColor: "#000000",
      textScaleOverride: 0.63,
      translationTextScaleOverride: 0.5,
      showNumber: true,
      displayNumber: 8,
    }),
    9: capsule(WHITE_BG, WHITE_BORDER, INK_RED, {
      textColor: "#000000",
      textScaleOverride: 0.63,
      translationTextScaleOverride: 0.5,
      showNumber: true,
      displayNumber: 9,
    }),

    // ── THE CLOSING AYAH — 12, on no frame at all ────────────────────────
    // One capsule for the whole ayah, two lines, and the page's widest capsule
    // after the ring. It used to sit on a mandorla; the shape is gone and the
    // capsule now carries the closing entirely on its own, in ayah 5's colours
    // exactly — the maroon ground, the maroon rule, the maroon badge ink. Those
    // two are the only maroon capsules on the sheet, and reading one against
    // the other is what the pairing is for: 5 closes the opening section, 12
    // closes the page.
    // THE CREAM CARD INSIDE THE MANDORLA, and the page's only red text. Every
    // other capsule here sets in black; this one does not, because it is the
    // one ayah that answers the ring rather than belonging to it, and the
    // handwritten sheet reds it for the same reason. Cream ground, not maroon:
    // the lens under it is already pale maroon, and a maroon capsule on it
    // would have nothing but its rule to stand on.
    // The cream card at the heart of the mandorla — the reference sheet's own
    // reading of this ayah, and the one capsule on the page whose TEXT is
    // coloured rather than black. It carries no `textColor` of its own on
    // purpose: `capsule()`'s third argument is the ink, so the red travels to
    // the text, the badge and nothing else. Ayah 12 is the answer the whole
    // ring was waiting for, so it is the one that speaks in colour.
    12: capsule(CREAM_BG, MAROON_BORDER, INK_RED, {
      // THE DECORATION IS ALAK 96's — /alak/Group 11.svg, the gold cartouche it
      // draws around its ana ayet (its own ayah 5), reused here unaltered. It
      // is drawn ENTIRELY in the shared #968428 → #CDC577 gold gradient and
      // carries no fill of its own, so it lands on this page's palette without
      // a single colour to reconcile — which is why it is borrowed rather than
      // redrawn.
      //
      // A CAPSULE FRAME, not a section frame: `customFrameSvg` is rendered by
      // VerseMesh's `BorderSvg` around this one capsule, at 0.8 x 0.93 of its
      // OUTER size (capsule + expandW/expandH). No `svgOverlays` entry, no
      // anchor, no offsetY — it travels with the capsule.
      //
      // IT ARRIVES SQUASHED, and there is no way around it. The art is drawn at
      // 8717 x 1167 (aspect 7.47) for Alak's one-line ana ayet; ayah 12 is two
      // lines, so its outer box is 0.87 x 0.195 → 3.84 after BorderSvg's own
      // scaling. The ornamental ends therefore come out about twice as stout as
      // Alak's. Matching the aspect would need either a one-line capsule
      // (~0.080 tall, and the ink alone needs 0.110) or a 1.62-wide one, on a
      // 1.54 page. Stout ends it is.
      customFrameSvg: "/alak/Group 11.svg",
      // The air the cartouche needs outside the rule it wraps — Alak's own
      // numbers, and they scale with the art rather than with the capsule.
      expandW: 0.035,
      expandH: 0.01,
      frameScaleLTR: 1.1,
      circleTextCol: "#7C2C2A",
      textScaleOverride: 0.69,
      translationTextScaleOverride: 0.45,
      showNumber: true,
      displayNumber: 12,
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
      maroonTheme: LAV_BORDER,
      greenTheme: DOME_BORDER,
      s1InnerBorder: "#cccccc",
      s2IntroOutroBg: CREAM_BG,
      s2Group1Bg: DOME_BG,
      s2Group2Bg: LAV_BG,
      s2Group3Bg: WHITE_BG,
      // ── THE THREE PAIR BRACKETS ────────────────────────────────────────
      // The chiasm the rings draw as nesting, said outright: 6 answered by 11,
      // 7 by 10, 9a by 9b. Each is one of the project's side curves, in
      // nisa36Config's TWISTED ARROW style: `shape: "arrow"` caps the tail in a
      // flared head that points into the lower ayah of the pair, and
      // `twist: true` sweeps the body as a folded ribbon — full width at both
      // capsules, pinching to a point at `twistT` where the two edges cross,
      // with the segment before the fold auto-darkened so it reads as the
      // ribbon turning its back face over. The head says WHICH ayah answers
      // which; the fold is what makes the answer look like it travelled.
      //
      // ONE SIDE ONLY. `curveSide: "left"` bows both of a bracket's curves the
      // same way instead of mirroring them, and since every block here holds a
      // single capsule its two anchors coincide — so what is drawn is exactly
      // one ribbon, down the LEFT of the page. Nothing is mirrored on the right.
      //
      // `pair` is what makes them the RIGHT three. The default pairing is i-th
      // block from the top with i-th from the bottom, which on this page would
      // bracket ayah 1 to ayah 12 and ayah 2 to ayah 11 — the ring is a chiasm
      // inside a page that is not one, so each bracket names its own two blocks.
      //
      // HOW DEEP A BOW FITS, which is the whole difficulty here. A bracket's
      // depth is the horizontal travel from its tip to the arc's extremity, and
      // for a cubic with both controls on the far side that extremity sits at
      //
      //     x = 0.25 · tip + 0.75 · (anchor − bowGap)     [ = anchor − 0.75·bowGap ]
      //
      // Every ring on this page is nearly as wide as the paper (1.50 of 1.54),
      // so the margin outside its capsules is only 0.066 / 0.054 / 0.052 — bow
      // out of the capsule's own edge and there is nothing to bow INTO. Two
      // things buy the depth back. The TIP is pulled inwards, off the capsule's
      // edge and onto the capsule, with `topAnchorXOffset` /
      // `bottomAnchorXOffset` (negative moves right, `anchor = edge − offset`).
      // And the two outer bows are then allowed to swing past the sheet's own
      // left edge entirely:
      //
      //           tip     extremity   depth
      //   6 ▸ 11  0.1405   −0.195     0.335    ← past x = 0, onto bare levha
      //   7 ▸ 10  0.2245   −0.094     0.319    ← same
      //   8 ▸  9  0.3020    0.112     0.190    ← stays inside the inner ring
      //
      // That is deliberate, and it is why these three are tuned against the live
      // page rather than solved: the sheet sits at the top of the composed
      // levha with blank paper beside it, so an arc leaving the sheet has
      // somewhere to go. Move this sheet on the grid and check them again.
      // `inwardOffset: 0` because the tip is already placed by hand; the
      // default 0.015 would move it again.
      //
      // THE TIP IS AS TALL AS THE CAPSULE IT TOUCHES. `tipThickness` defaults to
      // the page-wide `capsuleHeight` (0.09), which is not any of these three
      // capsules, so each bracket names its pair's own height instead — 0.110,
      // 0.100, 0.094. With the Y offsets below (which recentre the anchors off
      // that same 0.09 default), the ribbon's two edges then land exactly on the
      // capsule's top and bottom rules at both ends.
      //
      // THE FILL IS THE CAPSULE'S FILL — WHITE_BG for the two pairs of white
      // capsules, CREAM_BG for the cream pair — so a bracket reads as the two
      // capsules it joins reaching for each other, not as a fourth frame. It is
      // laid on slightly translucent, so the ring it crosses still shows.
      //
      // 0.55 IS NOT THE OPACITY YOU SEE. `curveSide: "left"` draws both of a
      // bracket's curves and every block here holds ONE capsule, so the two
      // coincide and the ribbon is painted TWICE: what lands is
      // `1 − (1 − 0.55)² ≈ 0.80`. Read the number as "about four fifths", and
      // if you want a different one, solve `o = 1 − √(1 − wanted)`.
      //
      // THE RULE IS AS THICK AS A CAPSULE'S. `lineWidthWorld` (not `lineWidth`)
      // — the default is a screen-space pixel line, which cannot match a
      // capsule border, that being world-space geometry. Both are `RULE_W`.
      //
      // THE ARROWHEAD FLARES FROM THE TAIL'S CENTRE, ±`arrowHeadWidth`, so it
      // only reads as a flare while `arrowHeadWidth > tipThickness / 2` —
      // below that it tapers instead. At tipThickness 0.145 that floor is
      // 0.0725, which is why these are 0.09. `arrowHeadLength` is how far the
      // tip pokes past the ribbon's own end, INTO the capsule it points at.
      //
      // The rule colour is each pair's own, except at the centre: ayah 9's
      // capsules are ruled WHITE_BORDER, which at this size would disappear, so
      // the innermost bracket takes the red that ayah already carries.
      //
      // The last entry stays transparent: it is the CENTER colour, and every
      // block of the opening section is `isCenter && isPushedIn`, so a visible
      // one would put a bracket around each of them too.
      curveColors: [
        {
          pair: [4, 9], // ayah 6 ▸ ayah 11, the outermost layer
          color: GREEN_THEME,
          fillColor: GREEN_VERSE_BG,
          curveSide: "left",
          // tip 0.1405 (capsule edge 0.0905 + 0.05), extremity −0.195
          topAnchorXOffset: 0,
          bottomAnchorXOffset: tuned(0.17),
          bowGap: tuned(0.447),
          innerBowGap: tuned(0.429),
          inwardOffset: 0,
          lineWidthWorld: RULE_W,
          opacity: 0.55,
          tipThickness: tuned(0.145),
          topAnchorYOffset: tuned(-0.032),
          bottomAnchorYOffset: tuned(0.032),
          shape: "arrow",
          arrowHeadLength: tuned(0.15),
          arrowHeadWidth: tuned(0.12),
          twist: true,
          twistT: 0.6,
        },
        {
          pair: [5, 8], // ayah 7 ▸ ayah 10
          color: LAV_BORDER,
          fillColor: CREAM_BG, // ayahs 7 · 10's own ground
          curveSide: "left",
          // tip 0.2245 (capsule edge 0.1745 + 0.05), extremity −0.094
          topAnchorXOffset: tuned(-0.05),
          bottomAnchorXOffset: tuned(0.13),
          bowGap: tuned(0.425),
          innerBowGap: tuned(0.411),
          inwardOffset: 0,
          lineWidthWorld: RULE_W,
          opacity: 0.55,
          tipThickness: tuned(0.145),
          topAnchorYOffset: tuned(-0.03),
          bottomAnchorYOffset: tuned(0.03),
          shape: "arrow",
          arrowHeadLength: tuned(0.11),
          arrowHeadWidth: tuned(0.11),
          twist: true,
          twistT: 0.6,
        },
        {
          pair: [6, 7], // ayah 9's two halves — the centre of the chiasm
          color: GOLD_BORDER,
          fillColor: WHITE_BG, // ayaground
          curveSide: "left",
          // tip 0.302 (capsule edge 0.272 + 0.03), extremity 0.112
          topAnchorXOffset: tuned(0.01),
          bottomAnchorXOffset: tuned(0.12),
          bowGap: tuned(0.253),
          innerBowGap: tuned(0.22),
          inwardOffset: 0,
          lineWidthWorld: RULE_W,
          opacity: 0.55,
          tipThickness: tuned(0.12),
          topAnchorYOffset: tuned(-0.03),
          bottomAnchorYOffset: tuned(0.03),
          shape: "arrow",
          arrowHeadLength: tuned(0.09),
          arrowHeadWidth: tuned(0.09),
          twist: true,
          twistT: 0.6,
        },
        { color: "transparent", fillColor: "transparent" },
      ],
    },
    capsuleBorderWidth: RULE_W,
    circleBorderWidth: 0.003,
    // Near a stadium on the short capsules. This, not `isPill`, is where the
    // photo's rounded capsules come from.
    verseRadius: 0.042,
    oppositeVerseConnectorRadius: 0.04,
    elevatedSectionRadii: {
      base: 0.036,
      outer: 0.024,
      innerA: 0.022,
      innerB: 0.02,
    },
  },

  globalSettings: {
    capsuleHeight: 0.09,
    columnGap: 0.02,
    rowGap: 0.014,
    blockGap: 0.012,
    sectionPadX: 0.005,
    blockPadding: 0.008,
    sectionBorderWidth: 0.006,
    // The page-wide fallback, reached only by a capsule that names no size of
    // its own — which, on this sheet, is none of them. Every capsule carries a
    // measured `textScaleOverride`, and an override REPLACES this rather than
    // multiplying it.
    verseTextScale: 0.57,
    // 0.625 of the Arabic, the ratio Tevbe uses (0.50 / 0.80).
    translationVerseTextScale: 0.36,
    tightVersePadding: true,
  },

  // ── BLOCKS ───────────────────────────────────────────────────────────────
  // The solved stack (paperHeight 2.025, sceneCenterYOffset 0.02):
  //   totalContentH 1.617, contentStartY −0.184, content bottom −1.801
  //
  //   idx  block        H      frameY   capsule top … bottom   w       lines
  //    0   s1_yasin    0.098   −0.164   −0.172 … −0.254      0.500      1
  //    1   s1_oath     0.098   −0.357   −0.365 … −0.447      0.500      1
  //    2   s1_row      0.098   −0.465   −0.473 … −0.555      0.420 ×2   1
  //    3   s1_tenzil   0.098   −0.573   −0.581 … −0.663      0.500      1
  //    4   r_a7        0.126   −0.801   −0.809 … −0.919      1.359      1
  //    5   r_a8        0.116   −0.939   −0.947 … −1.047      1.191      1
  //    6   r_a9a       0.110   −1.067   −1.075 … −1.169      0.996      1
  //    7   r_a9b       0.110   −1.189   −1.197 … −1.291      0.996      1
  //    8   r_a10       0.116   −1.311   −1.319 … −1.419      1.191      1
  //    9   r_a11       0.126   −1.439   −1.447 … −1.557      1.359      1
  //   10   closing_a12    0.166   −1.635   −1.643 … −1.793      0.639      2
  //
  // Block height is `2·blockPadding + capsuleHeight` (one row each); each frameY
  // is the previous block's bottom minus this block's gapBefore. The three big
  // gapBefores (0.075 on block 1, 0.130 on block 4, 0.070 on block 10) are the
  // air BETWEEN the sections, and each is measured off a drawn frame rather than
  // off a capsule — see each one's own note.
  //
  // The capsule top/bottom column is what the overlays are solved against: every
  // frame and every arrow below quotes numbers out of it.
  blocks: [
    // The two letters, alone above the scalloped frame — outside it, so the
    // frame's top edge has to clear this capsule's bottom (−0.254). It does, by
    // 0.019; see `s1_oath`'s gapBefore.
    {
      id: "s1_yasin",
      type: "group",
      verseIds: [1],
      columns: 1,
      capsuleHeight: 0.082,
      horizontalInset: 0.047,
      verticalNudge: -0.02,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      customSectionId: "sec_letters",
    },
    // The oath — the cloud's first line, and narrow, so the cloud tapers.
    {
      id: "s1_oath",
      type: "group",
      verseIds: [2],
      columns: 1,
      capsuleHeight: 0.082,
      horizontalInset: 0.047,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      // 0.075, not 0.03: the scalloped frame's top edge sits 0.240 above the
      // section's centre, and that edge has to clear ayah 1's capsule, which is
      // outside the frame. This gap is the clearance.
      gapBefore: 0.075,
      customSectionId: "sec_top",
    },
    // Ayahs 4 · 3, the cloud's widest line. RTL: ayah 3 reads first, so it
    // takes the RIGHT column — which is verseIds[1], not [0].
    {
      id: "s1_row",
      type: "group",
      verseIds: [4, 3],
      columns: 2,
      capsuleHeight: 0.082,
      horizontalInset: 0.127,
      columnGap: 0.022,
      isCenter: true,
      dragBehavior: "group",
      hideRowConnectors: true,
      gapBefore: 0.01,
      customSectionId: "sec_top",
    },
    // Ayah 5 closes the cloud, as narrow as the line that opened it.
    {
      id: "s1_tenzil",
      type: "group",
      verseIds: [5],
      columns: 1,
      capsuleHeight: 0.082,
      horizontalInset: 0.047,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.01,
      customSectionId: "sec_top",
    },
    {
      id: "r_a7",
      type: "group",
      verseIds: [6],
      columns: 1,
      capsuleHeight: 0.11,
      horizontalInset: -0.812,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      // 0.13 — the air between the opening section and the ring. It is measured
      // off the SCALLOPED frame's lowest point (−0.759), not off ayah 5's
      // capsule: the lobes hang 0.096 below it, and the outer ring's top edge
      // has to clear them.
      gapBefore: 0.13,
    },
    {
      id: "r_a8",
      type: "group",
      verseIds: [7],
      columns: 1,
      capsuleHeight: 0.1,
      horizontalInset: -0.644,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.03,
    },
    {
      id: "r_a9a",
      type: "group",
      verseIds: [8],
      columns: 1,
      capsuleHeight: 0.094,
      horizontalInset: -0.62,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.03,
    },
    {
      id: "r_a9b",
      type: "group",
      verseIds: [9],
      columns: 1,
      capsuleHeight: 0.094,
      horizontalInset: -0.62,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.012,
    },
    {
      id: "r_a10",
      type: "group",
      verseIds: [10],
      columns: 1,
      capsuleHeight: 0.1,
      horizontalInset: -0.644,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.03,
    },
    {
      id: "r_a11",
      type: "group",
      verseIds: [11],
      columns: 1,
      capsuleHeight: 0.11,
      horizontalInset: -0.812,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.03,
    },
    // Ayah 12 whole, two lines. It is the page's LARGEST capsule after the ring
    // — 0.800 against the 0.639 it used to be, and 0.175 against 0.150 — because
    // it is the one ayah that stands on its own, and because the cartouche
    // around it (verseOverrides[12].customFrameSvg) wants a card worth framing.
    //   inset = (1.13 − (2·0.800 + 2·0.008 + 0.02)) / 2 = −0.253
    // 0.09 of air above it: the cartouche is drawn on the capsule's OUTER box
    // (capsule + expandW/expandH), so it reaches 0.010 past the capsule top and
    // still has to clear the outer ring's bottom edge (−1.549).
    {
      id: "closing_a12",
      type: "group",
      verseIds: [12],
      columns: 1,
      capsuleHeight: 0.175,
      horizontalInset: -0.253,
      isCenter: true,
      dragBehavior: "individual",
      hideRowConnectors: true,
      gapBefore: 0.09,
      customSectionId: "sec_closing",
    },
  ],

  // ── Drag / elevation zones ───────────────────────────────────────────────
  // One per shape drawn, INNERMOST FIRST: sectionResolver's reverse index is
  // first-wins, so each capsule lands in the tightest shape around it and an
  // outer zone owns only what no inner zone claimed — while still dragging the
  // inner ones with it, via the ancestor index. `sec_top` and `sec_closing` are
  // declared on their blocks since each is one contiguous run.
  customSections: [
    {
      id: "sec_ring3",
      verseIds: [8, 9],
      cameraTarget: { y: 1.05, fov: 26, tilt: -1.4 },
    },
    {
      id: "sec_ring2",
      verseIds: [7, 8, 9, 10],
      cameraTarget: { y: 1.15, fov: 29, tilt: -1.4 },
    },
    {
      id: "sec_ring1",
      verseIds: [6, 7, 8, 9, 10, 11],
      cameraTarget: { y: 1.25, fov: 32, tilt: -1.4 },
    },
    {
      id: "sec_closing",
      verseIds: [12],
      cameraTarget: { y: 1.1, fov: 28, tilt: -1.4 },
    },
    {
      id: "sec_letters",
      verseIds: [1],
      cameraTarget: { y: 0.95, fov: 24, tilt: -1.4 },
    },
    {
      id: "sec_top",
      verseIds: [2, 3, 4, 5],
      cameraTarget: { y: 1.2, fov: 30, tilt: -1.4 },
    },
  ],

  // ── SVG SECTIONS ─────────────────────────────────────────────────────────
  // Every file is drawn flush with its plane and at the aspect it is displayed
  // at, so a frame's on-screen size IS (scaleX, scaleY) and its centre is the
  // plane centre — which is what each offsetY solves for:
  //     offsetY = (wanted frame centre) − (anchor block's frameY)
  // The three rings MUST keep renderOrder 3 < 4 < 5: each paints over the middle
  // of the one below it, and that overpainting is what turns three filled
  // rectangles into three visible bands.
  svgOverlays: [
    // Blue translucent scalloped cloud — blocks 1 … 3 (ayahs 2 … 5).
    {
      src: "/yasin/cloud.svg",
      anchorGroupIndex: 1,
      anchorEdge: "top",
      scaleX: 1.07,
      scaleY: 0.37,
      offsetX: 0,
      offsetY: -0.157,
      renderOrder: 2,
      customSectionId: "sec_top",
    },
    // Outer ring — blocks 4 … 9 (ayahs 6 … 11).
    {
      src: "/yasin/ring-outer.svg",
      anchorGroupIndex: 4,
      anchorEdge: "top",
      scaleX: 1.5,
      scaleY: 0.922,
      offsetX: 0,
      offsetY: -0.42,
      renderOrder: 3,
      customSectionId: "sec_ring1",
    },
    {
      src: "/yasin/ring-mid.svg",
      anchorGroupIndex: 5,
      anchorEdge: "top",
      scaleX: 1.3,
      scaleY: 0.56,
      offsetX: 0,
      offsetY: -0.265,
      renderOrder: 4,
      customSectionId: "sec_ring2",
    },
    {
      src: "/yasin/ring-inner.svg",
      anchorGroupIndex: 6,
      anchorEdge: "top",
      scaleX: 1.22,
      scaleY: 0.27,
      offsetX: 0,
      offsetY: -0.118,
      renderOrder: 5,
      customSectionId: "sec_ring3",
    },
    // The chiasm's three pairings are NOT drawn here — they are side curves,
    // and side curves come out of `styling.colors.curveColors`. See it.
    //
    // Ayah 12 has NO overlay of its own. Its decoration is a CAPSULE FRAME, not
    // a section frame — `verseOverrides[12].customFrameSvg`, the cartouche Alak
    // 96 draws around its ana ayet. See it there.
  ],

  sideInfo: {
    panelTitle: "Tefsir",
    byFoldStep: {
      "pre-start": {
        kicker: "YÂSÎN: 1-12",
        paragraphs: [
          "Yâsîn suresi, Kur'an-ı Kerim'in kalbi diye anılır. Bu sayfada onun ilk on iki ayetini görüyorsunuz. Ayetler alt alta sıralanmış değil; bir sistem içinde, iç içe halkalar hâlinde dizilmiştir. Bu diziliş sonradan uydurulmuş bir şema değil, ayetlerin kendi anlamlarının çizdiği şekildir.",
          "Sayfa üç bölümden oluşuyor. En üstte ilk beş kapsülü içine alan, kenarları işlemeli giriş çerçevesi var. Ortada birbirinin içine geçmiş üç halka var. En altta ise hiçbir çerçevenin içine konulmamış tek bir ayet var: 12. ayet.",
          "Üstteki giriş, Peygamber Efendimize hitaptır: Kur'an'a yemin edilir, onun gönderilmiş bir peygamber olduğu, dosdoğru bir yol üzerinde bulunduğu, bu Kitabın Azîz ve Rahîm olan Allah tarafından indirildiği ve niçin indirildiği söylenir. Yani muhatap ve görev burada belirlenir.",
        ],
      },
      end: {
        paragraphs: [
          "Şimdi ortadaki halkalara bakalım. Burası bu sayfanın ana bölümüdür ve bir ayna simetrisi taşır. Dıştan içe doğru okuyunuz:",
          {
            capsules: [
              {
                n: 7,
                text: "7. ayet — Onların çoğu üzerine o söz hak olmuştur; artık inanmazlar.",
                bg: WHITE_BG,
                color: GOLD_BORDER,
                textColor: INK_GOLD,
              },
              {
                n: 8,
                text: "8. ayet — Boyunlarına halkalar geçirdik; başları yukarı kalkık kaldı.",
                bg: CREAM_BG,
                color: LAV_BORDER,
                textColor: INK_LAV,
              },
              {
                n: 9,
                text: "9. ayet — Önlerine bir set, arkalarına bir set çektik ve gözlerini perdeledik.",
                bg: WHITE_BG,
                color: WHITE_BORDER,
                textColor: INK_RED,
              },
              {
                n: 10,
                text: "10. ayet — Uyarsan da uyarmasan da onlar için birdir; inanmazlar.",
                bg: CREAM_BG,
                color: LAV_BORDER,
                textColor: INK_LAV,
              },
              {
                n: 11,
                text: "11. ayet — Sen ancak Zikr'e uyanı ve Rahmân'dan gıyaben korkanı uyarırsın.",
                bg: WHITE_BG,
                color: GOLD_BORDER,
                textColor: GREEN_THEME,
              },
            ],
            corners: "soft",
          },
          "Dikkat ediniz: en dıştaki iki ayet, yani 7 ve 11, birbirinin karşılığıdır. Biri inanmayanlardan, diğeri uyarının kime fayda vereceğinden söz eder. Onların bir içindeki 8 ve 10 da birbirinin karşılığıdır: biri kalkık kalmış başları, diğeri uyarmanın fark etmeyişini anlatır. Ortada ise tek başına 9. ayet durur.",
          "Bu yüzden 9. ayet halkanın tam merkezine, en küçük ve en yuvarlak çerçevenin içine konulmuştur. O da kendi içinde ikiye ayrılmıştır: önden ve arkadan çekilen setler, sonra da gözlerin perdelenmesi. Önü arkası kapanmış, üstelik görüşü de alınmış bir insan tasviri.",
          "Şunu da fark etmek gerekir: burada anlatılan kapanma bir zorlama değildir. İnsan önce yüz çevirir; ardından bu yüz çevirme onun için bir alışkanlık, bir perde hâline gelir.",
          "En alttaki ayet ise bütün bu halkanın cevabıdır. Bu yüzden ne girişin içine ne de halkalardan birine konulmuştur; hiçbir çerçevenin içinde değildir, sayfanın en altında tek başına durur:",
          {
            capsules: [
              {
                n: 12,
                text: "12. ayet — Şüphesiz ölüleri biz diriltiriz; yaptıklarını ve bıraktıkları eserleri yazarız; her şeyi apaçık bir kitapta saymışızdır.",
                bg: MAROON_BG,
                color: MAROON_BORDER,
                textColor: INK_RED,
              },
            ],
            corners: "soft",
          },
          "Yukarıdaki halkalar kapanmayı anlatıyordu; bu ayet ise hiçbir şeyin kaybolmadığını söylüyor. Görmeyen gözler, kapanmış yollar… ama yapılan hiçbir iş ve geride bırakılan hiçbir eser kayıt dışı kalmıyor. Halkanın içinde kapanan insan, halkanın dışında bir kitapta yazılı duruyor.",
        ],
      },
    },
  },

  animations: {
    computeFoldYPositions: (lm) => {
      // fold0 — between section 1 (block 4) and the outer ring (block 5).
      const fold0 =
        (lm.groupYPositions[4] - lm.groupHeights[4] + lm.groupYPositions[5]) /
        2;
      // fold1 — the onion's centre line, between ayah 9's two capsules.
      const fold1 =
        (lm.groupYPositions[6] - lm.groupHeights[6] + lm.groupYPositions[7]) /
        2;
      // fold2 — between the outer ring (block 10) and the mandorla (block 11).
      const fold2 =
        (lm.groupYPositions[9] - lm.groupHeights[9] + lm.groupYPositions[10]) /
        2;
      // fold3 — below the mandorla, so it can hinge as a unit.
      const fold3 = fold2 - 0.16;
      return [fold0, fold1, fold2, fold3];
    },

    foldSteps: [
      {
        // The page arrives creased: the onion's inner rings are still tucked,
        // so the reader meets the giriş and the mandorla first.
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

export const YASIN_36_TEXT_AR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      { verses: [{ number: 1, text: "يسٓ" }] },
      { verses: [{ number: 2, text: "وَالْقُرْآنِ الْحَكِيمِ" }] },
      {
        verses: [
          { number: 4, text: "عَلَىٰ صِرَاطٍ مُسْتَقِيمٍ" },
          { number: 3, text: "إِنَّكَ لَمِنَ الْمُرْسَلِينَ" },
        ],
      },
      {
        verses: [{ number: 5, text: "تَنْزِيلَ الْعَزِيزِ الرَّحِيمِ" }],
      },
      {
        verses: [
          {
            number: 6,
            text: "لِتُنذِرَ قَوْمًا مَّا أُنذِرَ آبَاؤُهُمْ فَهُمْ غَافِلُونَ",
          },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "لَقَدْ حَقَّ الْقَوْلُ عَلَىٰ أَكْثَرِهِمْ فَهُمْ لَا يُؤْمِنُونَ",
          },
        ],
      },
      {
        verses: [
          {
            number: 8,
            text: "إِنَّا جَعَلْنَا فِي أَعْنَاقِهِمْ أَغْلَالًا فَهِيَ إِلَى الْأَذْقَانِ فَهُمْ مُقْمَحُونَ",
          },
        ],
      },
      {
        verses: [
          {
            number: 9,
            text: "وَجَعَلْنَا مِنْ بَيْنِ أَيْدِيهِمْ سَدًّا وَمِنْ خَلْفِهِمْ سَدًّا فَأَغْشَيْنَاهُمْ فَهُمْ لَا يُبْصِرُونَ",
          },
        ],
      },
      {
        verses: [
          {
            number: 10,
            text: "وَسَوَاءٌ عَلَيْهِمْ أَأَنْذَرْتَهُمْ أَمْ لَمْ تُنْذِرْهُمْ لَا يُؤْمِنُونَ",
          },
        ],
      },
      {
        verses: [
          {
            number: 11,
            text: "إِنَّمَا تُنْذِرُ مَنِ اتَّبَعَ الذِّكْرَ وَخَشِيَ الرَّحْمَٰنَ بِالْغَيْبِ فَبَشِّرْهُ بِمَغْفِرَةٍ وَأَجْرٍ كَرِيمٍ",
          },
        ],
      },
      {
        verses: [
          {
            number: 12,
            text: "إِنَّا نَحْنُ نُحْيِي الْمَوْتَىٰ وَنَكْتُبُ مَا قَدَّمُوا\nوَآثَارَهُمْ وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُبِينٍ",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const YASIN_36_TEXT_TR: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      { verses: [{ number: 1, text: "Yâsîn." }] },
      {
        verses: [{ number: 2, text: "Hikmet dolu Kur'an'a andolsun ki," }],
      },
      {
        verses: [
          { number: 4, text: "Dosdoğru bir yol üzeresin." },
          {
            number: 3,
            text: "Sen elbette gönderilmiş peygamberlerdensin,",
          },
        ],
      },
      {
        verses: [
          {
            number: 5,
            text: "Azîz ve Rahîm olanın indirmesidir;",
          },
        ],
      },
      {
        verses: [
          {
            number: 6,
            text: "Ataları uyarılmamış, bu yüzden kendileri gaflette kalmış bir toplumu uyarman için indirilmiştir.",
          },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "Andolsun, onların çoğu üzerine o söz hak olmuştur; artık inanmazlar.",
          },
        ],
      },
      {
        verses: [
          {
            number: 8,
            text: "Biz onların boyunlarına halkalar geçirdik;\no halkalar çenelerine dayandı, başları kalkık kaldı.",
          },
        ],
      },
      {
        verses: [
          {
            number: 9,
            text: "Önlerine bir set, arkalarına da bir set çektik ve gözlerini perdeledik.",
          },
        ],
      },
      {
        verses: [
          {
            number: 10,
            text: "Onları uyarsan da uyarmasan da\nkendileri için birdir; inanmazlar.",
          },
        ],
      },
      {
        verses: [
          {
            number: 11,
            text: "Sen ancak Zikr'e uyanı ve görmediği hâlde Rahmân'dan korkanı uyarırsın.\nİşte öylesini bağışlanma ve güzel bir mükâfatla müjdele.",
          },
        ],
      },
      {
        verses: [
          {
            number: 12,
            text: "Şüphesiz ölüleri biz diriltiriz, yaptıklarını ve bıraktıkları\neserleri yazarız; her şeyi apaçık bir kitapta saymışızdır.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const YASIN_36_TEXT_EN: SurahDataShape = {
  bismillah: "بِسْـــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
  section2: {
    topLabel: "",
    introVerse: { number: 0, text: "" },
    colorGroups: [
      { verses: [{ number: 1, text: "Ya Sin." }] },
      { verses: [{ number: 2, text: "By the wise Qur'an," }] },
      {
        verses: [
          { number: 4, text: "upon a straight path." },
          { number: 3, text: "you are indeed one of the messengers," },
        ],
      },
      {
        verses: [
          {
            number: 5,
            text: "A revelation of the Almighty, the Most Merciful,",
          },
        ],
      },
      {
        verses: [
          {
            number: 6,
            text: "so that you may warn a people whose forefathers were not warned, so they are heedless.",
          },
        ],
      },
      {
        verses: [
          {
            number: 7,
            text: "The word has already come true against most of them, so they will not believe.",
          },
        ],
      },
      {
        verses: [
          {
            number: 8,
            text: "We have placed shackles around their necks,\nreaching their chins, so their heads are forced up.",
          },
        ],
      },
      {
        verses: [
          {
            number: 9,
            text: "And We have set a barrier before them and a barrier behind them, then covered them over, so they cannot see.",
          },
        ],
      },
      {
        verses: [
          {
            number: 10,
            text: "It is all the same to them whether\nyou warn them or not — they will not believe.",
          },
        ],
      },
      {
        verses: [
          {
            number: 11,
            text: "You can only warn one who follows the Reminder and fears the Most Merciful unseen.\nGive him good news of forgiveness and a generous reward.",
          },
        ],
      },
      {
        verses: [
          {
            number: 12,
            text: "It is We who bring the dead to life, and We record what they send ahead\nand leave behind; We have accounted for everything in a clear Record.",
          },
        ],
      },
    ],
    outroVerse: { number: 0, text: "" },
    bottomLabel: "",
  },
};

export const YASIN_36_TEXT_DATA: Record<SurahLanguage, SurahDataShape> = {
  ar: YASIN_36_TEXT_AR,
  en: YASIN_36_TEXT_EN,
  tr: YASIN_36_TEXT_TR,
};
