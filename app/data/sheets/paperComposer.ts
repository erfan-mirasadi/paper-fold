/**
 * paperComposer — lays SEVERAL authored sheets out on ONE big paper.
 *
 * The reference for this is the photograph of the physical study: a dozen A4
 * sheets, each one surah-page already drawn and colored, laid side by side on
 * the floor so the whole surah can be read as one map. Every sheet in this
 * project is already a finished `SurahLayoutConfig` (yasin36Config,
 * yasin1319Config, …). This module takes those configs AS THEY ARE — it never
 * asks them to change — and returns a NEW config in which each sheet has been
 * translated to its own spot on a bigger sheet of paper.
 *
 *      composePaper({ paperWidth, paperHeight, sheets: [{sheet, x, y}, …] })
 *          → { config, textData }        ← feed straight into useStoryStore
 *
 * WHY A COMPOSER AND NOT A HAND-WRITTEN CONFIG. The block engine
 * (`createBlockLayoutMath`) lays blocks out as ONE vertical stack, centred on
 * the page: a block says how tall it is (`capsuleHeight`), how far in from the
 * section edge it sits (`horizontalInset`), how far off-centre (`xOffset`) and
 * how much air is above it (`gapBefore`). fatihaLandscapeConfig already shows
 * that arbitrary 2D placement IS expressible in those four numbers — its two
 * side-by-side panels are one negative `gapBefore` and two mirrored `xOffset`s.
 * What it also shows is that solving those numbers BY HAND is the whole job.
 * So this module solves them: it runs each sheet's own layout math once, reads
 * back where every block actually landed on ITS page, and re-expresses those
 * positions as `gapBefore` / `horizontalInset` / `xOffset` on the big page.
 * Nothing downstream (the renderers, the drag zones, the elevation surfaces,
 * the fold masking) learns that composition happened — it sees one ordinary
 * config with more blocks in it.
 *
 * WHAT IS PRESERVED EXACTLY. Capsule width and height, the gaps between rows
 * and blocks, every colour, every frame SVG, every handwritten note, every
 * text size — a sheet on the big paper is the same drawing at the same world
 * size as the sheet on its own page. Three families of numbers make that work:
 *
 *   1. GLOBALS ARE BAKED PER BLOCK. `globalSettings.capsuleHeight` and friends
 *      are per-CONFIG, and two sheets disagree about them (yasin36 sets
 *      `verseTextScale` 0.57, yasin1319 sets 0.75). Every block therefore
 *      carries its own resolved value, and the composed globals are only ever
 *      a fallback nothing reaches.
 *
 *   2. WIDTH IS SOLVED, NOT COPIED. A capsule's width is
 *      `(sectionInnerW − 2·inset − 2·blockPadding − columnGap) / 2`, and
 *      `sectionInnerW` grows with the paper. So the composer does not copy
 *      `horizontalInset`; it copies the capsule WIDTH the source produced and
 *      re-solves the inset against the big page's own `sectionInnerW`.
 *
 *   3. TEXT SIZE IS BAKED PER VERSE. `verseTextScale` is a per-config global
 *      that a verse's `textScaleOverride` REPLACES (VerseGroup.tsx), so every
 *      verse gets an explicit override here — its own if it had one, else its
 *      sheet's global — and the composed global is left undefined.
 *
 * IDS. Two sheets both number their capsules from 1, so ids are re-allocated
 * sequentially across the whole paper (sheet A: 1…11, sheet B: 12…18) and
 * remapped everywhere they are referenced. The badge keeps telling the truth
 * because each verse gets `displayNumber` baked to whatever the source drew.
 * Sequential (rather than per-sheet offsets like 1000, 2000) is deliberate:
 * usePaperMasking's shader arrays are sized `MAX_VERSE_ID = 100`, and the
 * left-hand script sidebar sorts its ayah list by id.
 *
 * WHAT IS NOT CARRIED OVER — all of it is stated at the call site instead:
 *   · per-language block overrides (`languageOverrides`, `stackOrder`) — the
 *     geometry is baked from the Arabic pass, so a translation that moves its
 *     blocks would move them relative to a stack that is no longer there;
 *   · the folds — a sheet's fold story is about ITS page, and the big paper
 *     gets one flat story (see `foldLines`);
 *   · `styling` — one config has one styling block, so the first sheet's wins.
 *     In practice this only picks border widths and theme fallbacks, since a
 *     capsule's colours all live in its own `verseOverrides` entry;
 *   · `scriptInfo.singleAyahNumber` and `tightVersePadding` — per-config flags
 *     with no per-verse form. `tightVersePadding` is taken from the majority.
 */

import type { SurahLanguage } from "../../hooks/useSurahLanguageStore";
import { createBlockLayoutMath } from "../SurahConfig";
import type { ColorGroup, SurahDataShape } from "../SurahConfig";
import type {
  CameraFocusRect,
  CustomSectionDef,
  FoldStoryStep,
  HandwrittenNoteConfig,
  LayoutBlock,
  SideInfoEntry,
  SurahGlobalSettings,
  SurahLayoutConfig,
  SurahScriptInfo,
  SvgOverlayItem,
  VerseOverrideConfig,
} from "../schema";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** A sheet as the registry stores it: its config plus its three text tables. */
export interface ComposableSheet {
  config: SurahLayoutConfig;
  textData: Record<SurahLanguage, SurahDataShape>;
}

/**
 * One sheet, and where it is pinned on the big paper.
 *
 * `x` / `y` place the sheet's OWN PAGE RECTANGLE — the (0, 0) top-left corner
 * of the page the sheet was authored on — in the big paper's coordinates, which
 * run x: 0 → paperWidth rightwards and y: 0 → −paperHeight downwards. So a
 * sheet authored 1.54 × 1.78 and placed at `{ x: 2.2, y: -0.02 }` occupies
 * x 2.2 … 3.74 and y −0.02 … −1.80, exactly as if you had laid that piece of
 * paper down there.
 */
export interface SheetPlacement {
  /** Short unique key. Namespaces every block / zone id this sheet brings. */
  key: string;
  sheet: ComposableSheet;
  x: number;
  y: number;
  /**
   * Draw this sheet smaller (or larger) than it was authored. 1 — the default
   * — is the sheet at the size it has on its own page.
   *
   * EVERYTHING the sheet owns scales together: capsule heights, row and block
   * gaps, insets, verse text, frame SVGs and handwritten notes, so a scaled
   * sheet is the same drawing at another size rather than a re-flowed one. Two
   * things cannot follow, because the renderers read them globally rather than
   * per sheet: a capsule's corner radius and its border width (SharedUI's
   * `VERSE_5_6_19_RADIUS` / `CAPSULE_BORDER_WIDTH`, both off Alak). Near 1 that
   * is invisible; below about 0.6 the corners start to read too round and the
   * rules too thick.
   */
  scale?: number;
  /**
   * Trims or loosens what the camera frames when this sheet is clicked. The
   * sheet's own page rectangle is the default — see `SheetZoomTuning`.
   */
  zoom?: SheetZoomTuning;
}

/**
 * Per-sheet adjustments to the rectangle a section zoom frames.
 *
 * The default frame is the sheet's page rectangle exactly: everything the sheet
 * draws, plus the blank margin it was authored with. That margin is not the
 * same on every sheet — some were drawn tight, some with room to spare — and
 * the camera cannot tell blank paper from a page that simply ends there. So
 * where the default reads too loose or too tight, these four numbers move the
 * frame's edges, in the paper's own world units.
 *
 * NEGATIVE PADDING CROPS. `padX: -0.1` pulls the left and right edges 0.1
 * INWARDS, so less paper fills more screen; positive pushes them out and leaves
 * more air. `dx` / `dy` slide the whole frame without resizing it, for a sheet
 * whose drawing does not sit in the middle of its page.
 */
export interface SheetZoomTuning {
  /** Air added to the left AND right edges. Negative crops. */
  padX?: number;
  /** Air added to the top AND bottom edges. Negative crops. */
  padY?: number;
  /** Slides the frame right (positive) or left. */
  dx?: number;
  /** Slides the frame up (positive) or down. */
  dy?: number;
}

export interface PaperCompositionSpec {
  id: string;
  title: string;
  heroTitle?: string;
  heroSubtitle?: string;

  paperWidth: number;
  paperHeight: number;
  /** Outer margin of the layout section. Defaults to 0.2, as on the sheets. */
  padding?: number;
  /** Scroll length of the fold story. Defaults to 3. */
  scrollPages?: number;
  /**
   * How much further back the camera sits than on a normal 1.54-wide page.
   * A big paper needs it: the camera is otherwise fixed (see cameraConfig).
   * Roughly `paperWidth / 1.54` frames the paper like a single sheet; less
   * fills more of the screen. Defaults to 1 (no change).
   */
  cameraDistanceScale?: number;

  scriptInfo?: SurahScriptInfo;
  sideInfoPanelTitle?: string;

  /**
   * Y positions (big-paper space, negative going down) of the paper's fold
   * lines. The composed story never bends them — they exist so the fold
   * machinery has a line to hold — so this is only about where a future fold
   * WOULD run. Defaults to a single line through the paper's middle.
   */
  foldLines?: number[];

  sheets: SheetPlacement[];
}

export interface ComposedPaper {
  config: SurahLayoutConfig;
  textData: Record<SurahLanguage, SurahDataShape>;
  /** Per sheet key: source verse id → the id it was re-allocated to. */
  verseIdMaps: Record<string, Map<number, number>>;
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const LANGUAGES: SurahLanguage[] = ["ar", "en", "tr"];

/**
 * The language whose layout is baked. A sheet's blocks may carry
 * `languageOverrides`, but the composed page has ONE geometry, and Arabic is
 * the one every sheet is authored against.
 */
const GEOMETRY_LANGUAGE: SurahLanguage = "ar";

/**
 * The composed page's own globals. Everything geometric is baked per block, so
 * these are reached only by a block that declared nothing — but two of them do
 * matter, because the engine reads them page-wide rather than per block:
 * `sectionPadX` (sets `sectionInnerW`, which every inset is solved against)
 * and `columnGap` (used for capsule WIDTH even when a block overrides it for
 * position). Both are folded into the inset solve below, so their values are
 * free; they are kept at the sheets' own numbers to keep the arithmetic short.
 */
const COMPOSED_GLOBALS: SurahGlobalSettings = {
  capsuleHeight: 0.09,
  columnGap: 0.02,
  rowGap: 0.014,
  blockGap: 0.012,
  sectionPadX: 0.005,
  blockPadding: 0.008,
  sectionBorderWidth: 0.006,
};

/** Drops undefined entries so a spread never plants `key: undefined`. */
function defined<T extends object>(obj: T): T {
  const out = {} as T;
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

/** An empty SurahDataShape — the shell every composed text table starts from. */
function emptyTextData(bismillah: string): SurahDataShape {
  return {
    bismillah,
    section1: { label: "", gridVerses: [], anaAyet: { number: 0, text: "" } },
    section2: {
      topLabel: "",
      introVerse: { number: 0, text: "" },
      colorGroups: [],
      outroVerse: { number: 0, text: "" },
      bottomLabel: "",
    },
  };
}

/** True for the blocks that emit a `groups[]` entry — i.e. a colorGroup. */
function isGroupBlock(block: LayoutBlock): boolean {
  return block.type === "group" && !block.introOutroRole;
}

// ---------------------------------------------------------------------------
// composePaper
// ---------------------------------------------------------------------------

export function composePaper(spec: PaperCompositionSpec): ComposedPaper {
  const padding = spec.padding ?? 0.2;
  const gs: SurahGlobalSettings = { ...COMPOSED_GLOBALS };

  // The big page's own horizontal frame — the reference every inset is solved
  // against. Mirrors createBlockLayoutMath: sectionW = PW − 2·padding.
  const sectionW = spec.paperWidth - padding * 2;
  const sectionInnerW = sectionW - gs.sectionPadX * 2;
  const pageCenterX = spec.paperWidth / 2;

  const blocks: LayoutBlock[] = [];
  const verseOverrides: Record<number, VerseOverrideConfig> = {};
  const customSections: CustomSectionDef[] = [];
  const svgOverlays: SvgOverlayItem[] = [];
  const handwrittenNotes: HandwrittenNoteConfig[] = [];
  const verseIdMaps: Record<string, Map<number, number>> = {};

  const colorGroups: Record<SurahLanguage, ColorGroup[]> = {
    ar: [],
    en: [],
    tr: [],
  };

  const highlightsPreStart: number[] = [];
  const highlightsEnd: number[] = [];
  const sideInfoByStep: Record<string, SideInfoEntry> = {};
  const sideInfoByVerse: Record<number, SideInfoEntry> = {};

  let nextVerseId = 1;
  let composedGroupCount = 0;
  let tightVotes = 0;
  let section1Data: Record<SurahLanguage, SurahDataShape["section1"]> | null =
    null;

  // The stack chain. `contentStartY` pins the first block; every later block
  // states the distance from the previous block's bottom edge to its own top —
  // negative wherever the next sheet starts higher up the page than the last
  // one ended, which is the normal case for sheets sitting side by side.
  let contentStartY: number | undefined;
  let prevBottom = 0;

  for (const placement of spec.sheets) {
    const { key, sheet, x: dx, y: dy, scale: rawScale } = placement;
    const s = rawScale ?? 1;
    const src = sheet.config;
    const srcGs = src.globalSettings;
    const srcBlocks = src.blocks ?? [];
    if (!srcGs || srcBlocks.length === 0) continue;

    if (srcGs.tightVersePadding) tightVotes++;

    // The sheet's own layout, at its own page width — the source of every
    // position and size copied below.
    const srcPageW = src.dimensions.paperWidth;
    const lm = createBlockLayoutMath(src, srcPageW, GEOMETRY_LANGUAGE);
    const srcSectionInnerW = lm.sectionW - srcGs.sectionPadX * 2;
    const srcPageCenterX = (srcPageW / 2) * s;

    // Everything this sheet draws moves by (dx, dy); an overlay's X is stated
    // relative to the PAGE centre (see BlockRenderer's SvgOverlays), so it
    // moves by the difference between the two pages' centres instead.
    const overlayShiftX = srcPageCenterX + dx - pageCenterX;

    // ── The zoom frame ────────────────────────────────────────────────────
    // What the camera must show when anything on this sheet is clicked: the
    // sheet, and none of its neighbours. EVERY zone the sheet contributes
    // carries the same rectangle, so clicking one ring inside a page frames
    // the page rather than the ring — on an atlas the sheet is the unit the
    // reader picked, whatever they happened to click inside it.
    const zoomPadX = placement.zoom?.padX ?? 0;
    const zoomPadY = placement.zoom?.padY ?? 0;
    const cameraFocus: CameraFocusRect = {
      x: dx - zoomPadX + (placement.zoom?.dx ?? 0),
      y: dy + zoomPadY + (placement.zoom?.dy ?? 0),
      w: srcPageW * s + zoomPadX * 2,
      h: src.dimensions.paperHeight * s + zoomPadY * 2,
    };

    // ── Verse ids ─────────────────────────────────────────────────────────
    const idMap = new Map<number, number>();
    const claim = (id: number): number => {
      const existing = idMap.get(id);
      if (existing !== undefined) return existing;
      const next = nextVerseId++;
      idMap.set(id, next);
      return next;
    };
    // Reading order first, so the composed ids run in reading order too.
    for (const b of srcBlocks) {
      for (const id of b.verseIds ?? []) claim(id);
      if (b.anaAyetId !== undefined) claim(b.anaAyetId);
    }
    for (const cs of src.customSections ?? []) cs.verseIds.forEach(claim);
    for (const id of Object.keys(src.verseOverrides ?? {})) claim(Number(id));
    const mapId = (id: number): number => idMap.get(id) ?? claim(id);
    verseIdMaps[key] = idMap;

    // ── Blocks ────────────────────────────────────────────────────────────
    // Source group index → composed group index, for `anchorGroupIndex` and
    // for lining the text tables' colorGroups up with the blocks again.
    const groupIndexMap = new Map<number, number>();
    let srcGroupIdx = 0;

    srcBlocks.forEach((block, i) => {
      const meta = lm.blockMeta[i];
      const wantedFrameY = meta.frameY * s + dy;
      const frameH = meta.frameH * s;

      // Resolved (never inherited) geometry — see note 1 in the file header.
      const rawBlockPadding = block.blockPadding ?? srcGs.blockPadding;
      const capsuleHeight = (block.capsuleHeight ?? srcGs.capsuleHeight) * s;
      const rowGap = (block.rowGap ?? srcGs.rowGap) * s;
      const blockPadding = rawBlockPadding * s;
      const columnGap = (block.columnGap ?? srcGs.columnGap) * s;
      const cols = block.columns ?? 2;
      const srcInset = block.horizontalInset ?? 0;
      const srcBlockInnerW = srcSectionInnerW - srcInset * 2;

      // The inset that reproduces this block's capsule width on a page whose
      // `sectionInnerW` is different — see note 2 in the file header. Two- and
      // one-column blocks size their capsule off the PAGE-WIDE `columnGap`
      // (a legacy quirk the engine preserves), so the solve absorbs the
      // difference between the two pages' global gaps; wider blocks divide the
      // inner width by their own gap, so there the inner width is what carries.
      let horizontalInset: number;
      if (cols <= 2) {
        const srcColW =
          ((srcBlockInnerW - rawBlockPadding * 2 - srcGs.columnGap) / 2) * s;
        horizontalInset =
          (sectionInnerW - (srcColW * 2 + blockPadding * 2 + gs.columnGap)) / 2;
      } else {
        horizontalInset = (sectionInnerW - srcBlockInnerW * s) / 2;
      }

      // A block's centre is `pageCentre + xOffset`, on both pages.
      const xOffset = srcPageCenterX + (block.xOffset ?? 0) * s + dx - pageCenterX;

      const composed: LayoutBlock = defined({
        ...block,
        id: `${key}__${block.id}`,
        verseIds: block.verseIds?.map(mapId),
        anaAyetId:
          block.anaAyetId !== undefined ? mapId(block.anaAyetId) : undefined,
        customSectionId: block.customSectionId
          ? `${key}__${block.customSectionId}`
          : undefined,
        capsuleHeight,
        rowGap,
        blockPadding,
        columnGap,
        horizontalInset,
        xOffset,
        gapBefore: contentStartY === undefined ? undefined : prevBottom - wantedFrameY,
        // Baked geometry replaces both of these: the nudge is already inside
        // `wantedFrameY`, and a per-language stack no longer has a stack to
        // move inside of.
        verticalNudge: undefined,
        languageOverrides: undefined,
        cameraTarget: block.cameraTarget
          ? scaleCameraTarget(block.cameraTarget, spec.cameraDistanceScale ?? 1)
          : undefined,
      });

      if (contentStartY === undefined) contentStartY = wantedFrameY;
      prevBottom = wantedFrameY - frameH;

      if (isGroupBlock(block)) {
        groupIndexMap.set(srcGroupIdx, composedGroupCount + srcGroupIdx);
        srcGroupIdx++;
      }
      blocks.push(composed);
    });

    // ── Verse overrides ───────────────────────────────────────────────────
    // Every verse the sheet draws gets an entry, even where the source had
    // none: this is where the sheet's page-wide text scale and its badge
    // number are pinned down before they can be re-inherited from the big
    // page's own (deliberately empty) globals.
    const sheetHidesNumbers = src.features.hideVerseNumbers === true;
    for (const [srcId, composedId] of idMap) {
      const ov = src.verseOverrides?.[srcId];
      verseOverrides[composedId] = defined({
        ...ov,
        textScaleOverride: scaleOr(
          ov?.textScaleOverride ?? srcGs.verseTextScale,
          s,
        ),
        translationTextScaleOverride: scaleOr(
          ov?.translationTextScaleOverride ??
            srcGs.translationVerseTextScale ??
            undefined,
          s,
        ),
        // Both paddings are WORLD UNITS inside a capsule, so they shrink with
        // the sheet exactly like the capsule they pad.
        versePadding: scaleOr(ov?.versePadding, s),
        translationPadding: scaleOr(ov?.translationPadding, s),
        // The composed page hides numbers page-wide, so a sheet that showed
        // them opts each of its verses back in.
        showNumber: sheetHidesNumbers ? ov?.showNumber : true,
        displayNumber: ov?.displayNumber ?? srcId,
      });
    }

    // ── Elevation / drag zones ────────────────────────────────────────────
    // A config with ANY `customSections` stops deriving zones from its blocks
    // (sectionResolver), so a sheet that relied on the per-block path has its
    // zones materialised here — otherwise it would lose them the moment a
    // sibling sheet brought custom sections along.
    if (src.customSections?.length) {
      for (const cs of src.customSections) {
        customSections.push(
          defined({
            id: `${key}__${cs.id}`,
            verseIds: cs.verseIds.map(mapId),
            cameraTarget: cs.cameraTarget
              ? scaleCameraTarget(cs.cameraTarget, spec.cameraDistanceScale ?? 1)
              : undefined,
            cameraFocus,
          }),
        );
      }
    } else {
      const zones = new Map<string, number[]>();
      for (const b of srcBlocks) {
        if (b.type === "spacer" || !b.verseIds?.length) continue;
        const zoneId = `${key}__${b.customSectionId ?? b.id}`;
        const ids = zones.get(zoneId) ?? [];
        ids.push(...b.verseIds.map(mapId));
        if (b.type === "grid" && b.anaAyetId !== undefined) {
          ids.push(mapId(b.anaAyetId));
        }
        zones.set(zoneId, ids);
      }
      for (const [id, verseIds] of zones) {
        customSections.push({ id, verseIds, cameraFocus });
      }
    }

    // ── Frame SVGs ────────────────────────────────────────────────────────
    for (const item of src.svgOverlays ?? []) {
      const overrides = item.languageOverrides;
      svgOverlays.push(
        defined({
          ...item,
          anchorGroupIndex:
            item.anchorGroupIndex !== undefined
              ? groupIndexMap.get(item.anchorGroupIndex)
              : undefined,
          scaleX: item.scaleX !== undefined ? item.scaleX * s : undefined,
          scaleY: item.scaleY !== undefined ? item.scaleY * s : undefined,
          offsetX: (item.offsetX ?? 0) * s + overlayShiftX,
          offsetY: item.offsetY !== undefined ? item.offsetY * s : undefined,
          customSectionId: item.customSectionId
            ? `${key}__${item.customSectionId}`
            : item.customSectionId,
          languageOverrides: overrides
            ? Object.fromEntries(
                Object.entries(overrides).map(([lang, o]) => [
                  lang,
                  defined({
                    ...o,
                    anchorGroupIndex:
                      o.anchorGroupIndex !== undefined
                        ? groupIndexMap.get(o.anchorGroupIndex)
                        : undefined,
                    offsetX:
                      o.offsetX !== undefined
                        ? o.offsetX + overlayShiftX
                        : undefined,
                  }),
                ]),
              )
            : undefined,
        }),
      );
    }

    // ── Handwritten notes ─────────────────────────────────────────────────
    // These are the only things on a page positioned in raw page coordinates,
    // so they are the only things that simply translate.
    for (const note of src.handwrittenNotes ?? []) {
      const overrides = note.languageOverrides;
      handwrittenNotes.push(
        defined({
          ...note,
          x: note.x * s + dx,
          y: note.y * s + dy,
          fontSize: note.fontSize * s,
          maxWidth: note.maxWidth !== undefined ? note.maxWidth * s : undefined,
          svgs: note.svgs?.map((g) => ({
            ...g,
            offsetX: g.offsetX !== undefined ? g.offsetX * s : undefined,
            offsetY: g.offsetY !== undefined ? g.offsetY * s : undefined,
            scaleX: g.scaleX !== undefined ? g.scaleX * s : undefined,
            scaleY: g.scaleY !== undefined ? g.scaleY * s : undefined,
          })),
          languageOverrides: overrides
            ? Object.fromEntries(
                Object.entries(overrides).map(([lang, o]) => [
                  lang,
                  defined({
                    ...o,
                    x: o.x !== undefined ? o.x * s + dx : undefined,
                    y: o.y !== undefined ? o.y * s + dy : undefined,
                  }),
                ]),
              )
            : undefined,
        }),
      );
    }

    // ── Text tables ───────────────────────────────────────────────────────
    // `colorGroups[i]` addresses the i-th GROUP (not the i-th block), which is
    // exactly the order the blocks were just pushed in, so appending keeps the
    // alignment BlockRenderer relies on.
    for (const lang of LANGUAGES) {
      const srcGroups = sheet.textData[lang]?.section2.colorGroups ?? [];
      for (const group of srcGroups) {
        colorGroups[lang].push({
          ...group,
          verses: group.verses.map((v) => ({ ...v, number: mapId(v.number) })),
        });
      }
    }
    composedGroupCount += srcGroupIdx;
    if (!section1Data && srcBlocks.some((b) => b.type === "grid")) {
      section1Data = {
        ar: remapSection1(sheet.textData.ar.section1, mapId),
        en: remapSection1(sheet.textData.en.section1, mapId),
        tr: remapSection1(sheet.textData.tr.section1, mapId),
      };
    }

    // ── Script sidebar + tafsir panel ─────────────────────────────────────
    const allIds = [...idMap.values()];
    const sh = src.scriptHighlights;
    highlightsPreStart.push(...(sh?.["pre-start"] ?? []).map(mapId));
    highlightsEnd.push(...(sh?.["end"] ? sh["end"].map(mapId) : allIds));

    for (const [stepId, entry] of Object.entries(
      src.sideInfo?.byFoldStep ?? {},
    )) {
      const target = stepId === "pre-start" ? "pre-start" : "end";
      sideInfoByStep[target] = mergeSideInfo(sideInfoByStep[target], entry);
    }
    for (const [verseId, entry] of Object.entries(
      src.sideInfo?.byVerse ?? {},
    )) {
      sideInfoByVerse[mapId(Number(verseId))] = entry;
    }
  }

  // ── Fold story ──────────────────────────────────────────────────────────
  // Flat: the big paper is a map to read, not a sheet to fold (yet). The lines
  // still exist so every consumer of `FOLD_Y_POSITIONS` has one to hold.
  const foldLines = spec.foldLines ?? [-spec.paperHeight / 2];
  const flatFolds = foldLines.map(
    () => ({ direction: 1, angleFactor: 0 }) as const,
  );
  const foldSteps: FoldStoryStep[] = [
    { id: "pre-start", folds: [...flatFolds] },
    { id: "end", folds: [...flatFolds] },
  ];

  const base = spec.sheets[0]?.sheet.config;

  const config: SurahLayoutConfig = {
    id: spec.id,
    title: spec.title,
    heroTitle: spec.heroTitle,
    heroSubtitle: spec.heroSubtitle,

    scriptInfo: spec.scriptInfo ?? base?.scriptInfo,
    scriptHighlights: {
      "pre-start": highlightsPreStart,
      end: highlightsEnd,
    },

    features: {
      hasIntro: false,
      hasElevatedSections: true,
      hasPopUps: false,
      // Page-wide, with every verse opting back in through `showNumber` —
      // see the verse-override bake above.
      hideVerseNumbers: true,
      hideBismillah3D: true,
      // A composed paper is the only kind that carries a dozen sheets at once,
      // and the only kind a single full-resolution capture cannot serve. See
      // `SurahFeatures.progressivePageTexture` / `PageTextureLod`.
      progressivePageTexture: true,
    },

    dimensions: {
      paperWidth: spec.paperWidth,
      paperHeight: spec.paperHeight,
      sceneCenterYOffset: 0,
      padding,
      scrollPages: spec.scrollPages ?? 3,
      // Load-bearing: every `xOffset` above was solved against this exact page
      // width, so the page must not widen when a translation is selected.
      fixedWidthAcrossLanguages: true,
      cameraDistanceScale: spec.cameraDistanceScale,
    },

    // One config, one styling block. Only border widths and the theme-colour
    // fallbacks live here — a capsule's own colours travel with its override.
    styling: base!.styling,
    specialVerses: {},

    globalSettings: {
      ...gs,
      // Deliberately absent: every verse carries its own baked scale, and an
      // inherited page-wide one would silently re-size any that did not.
      verseTextScale: undefined,
      translationVerseTextScale: undefined,
      tightVersePadding: tightVotes * 2 >= spec.sheets.length,
      contentStartYOverride: contentStartY,
    },

    verseOverrides,
    blocks,
    customSections,
    svgOverlays,
    handwrittenNotes,

    sideInfo: {
      panelTitle: spec.sideInfoPanelTitle ?? "Tefsir",
      byFoldStep: sideInfoByStep,
      byVerse: sideInfoByVerse,
    },

    animations: {
      foldSteps,
      computeFoldYPositions: () => foldLines,
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

  const textData = {} as Record<SurahLanguage, SurahDataShape>;
  for (const lang of LANGUAGES) {
    const data = emptyTextData(spec.sheets[0]?.sheet.textData[lang]?.bismillah ?? "");
    data.section2.colorGroups = colorGroups[lang];
    if (section1Data) data.section1 = section1Data[lang];
    textData[lang] = data;
  }

  return { config, textData, verseIdMaps };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Multiplies a size that may not be there. */
function scaleOr(v: number | undefined, s: number): number | undefined {
  return v === undefined ? undefined : v * s;
}

/**
 * A section's zoom target is a camera HEIGHT, tuned against the fixed camera
 * distance of a single sheet. Pulling the camera back for a big paper scales
 * that whole triangle, so the heights scale with it.
 */
function scaleCameraTarget<T extends { y: number; fov: number; tilt: number }>(
  target: T,
  scale: number,
): T {
  if (scale === 1) return target;
  return { ...target, y: target.y * scale, tilt: target.tilt * scale };
}

function remapSection1(
  section1: SurahDataShape["section1"],
  mapId: (id: number) => number,
): SurahDataShape["section1"] {
  return {
    ...section1,
    gridVerses: section1.gridVerses.map((v) => ({
      ...v,
      number: mapId(v.number),
    })),
    anaAyet: { ...section1.anaAyet, number: mapId(section1.anaAyet.number) },
  };
}

/**
 * Two sheets that both speak at the same fold step share one panel entry: the
 * first sheet's heading leads, and the second sheet's reading flow follows on
 * underneath it — the panel is a scrolling log, so this reads as one page's
 * commentary followed by the next.
 */
function mergeSideInfo(
  existing: SideInfoEntry | undefined,
  next: SideInfoEntry,
): SideInfoEntry {
  if (!existing) return next;
  return {
    ...existing,
    paragraphs: [...(existing.paragraphs ?? []), ...(next.paragraphs ?? [])],
    images: [...(existing.images ?? []), ...(next.images ?? [])],
  };
}
