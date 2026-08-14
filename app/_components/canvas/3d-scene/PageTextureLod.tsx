"use client";

/**
 * PageTextureLod — the page texture, drawn in stages instead of all at once.
 *
 * WHY AN ATLAS NEEDS THIS AND A SURAH SHEET DOES NOT. One sheet fits in one
 * offscreen buffer at a resolution nobody can fault. A dozen sheets laid out on
 * one paper do not: the same buffer stretched over a page eight times wider is
 * eight times softer per line of script, and the obvious fix — ask for a buffer
 * eight times bigger — is how a phone ends up with no page at all. The buffer
 * is half-float (drei's `RenderTexture` default) and multiplied by the device
 * pixel ratio, so "2400 x 3400" is really 4800 x 6800 x 8 bytes, a quarter of a
 * gigabyte, before multisampling quadruples it. That single allocation is the
 * long wait on load, and the thing weak GPUs quietly refuse.
 *
 * So the page is never drawn at one quality. It is drawn three times:
 *
 *   1. FIRST PAINT — deliberately low, and the SAME on every device, because
 *      the point of it is to arrive fast rather than to be looked at for long.
 *      That is drei's own `RenderTexture`, sized by `firstPassTextureSize`.
 *
 *   2. THE REFINE — the whole page again at the resolution the resting view
 *      actually shows, into a buffer this module owns, a TILE PER FRAME so no
 *      single frame ever pays for the whole picture. When the last tile lands
 *      the material's `map` is swapped to it. Nothing fades: the two pictures
 *      are the same picture, so the swap reads as the page coming into focus.
 *
 *   3. THE DETAIL — the only pass that answers the zoom. A section zoom frames
 *      one sheet, and one sheet filling the screen needs roughly four times the
 *      texels per world unit that the resting page does — which no full-page
 *      buffer can carry. So this pass draws ONLY what the camera is about to
 *      show, at exactly the screen's own resolution, and the paper shader
 *      composites it over that rectangle (`uDetailMap` in `usePaperMasking`).
 *      Off-screen work, tiled like the refine, started the moment the click
 *      registers and finished long before the flight ends — the reader sees the
 *      sheet sharpen as they arrive, never a wait for it.
 *
 * WHY THE DETAIL IS DOUBLE-BUFFERED. Two of stage 3, alternating, because one
 * of it cannot survive being stepped off. Drawing the sheet the reader is
 * moving TO means overwriting the sheet they are moving FROM, and a buffer
 * cannot be overwritten while the page is still reading it — so the single
 * buffer had to be faded out first, and the sheet in front of the reader
 * visibly softened back to the low first paint in the middle of every step
 * between sheets. The dip was not a limit of anything; the sharp picture was
 * there the whole time and was being thrown away to make room. With two, the
 * incoming sheet is drawn into the one nobody is looking at, and the outgoing
 * one is left lit until its buffer is claimed — a step later, with the camera
 * long gone from it. The bill is one more buffer of the same size; what it buys
 * is that nothing on screen ever gets worse than it already was.
 *
 * WHY TILES. A tile is a normal render of the same offscreen scene with the
 * camera's box narrowed to a slice of the page and the viewport and scissor
 * narrowed to the matching slice of the buffer. The clear respects the scissor,
 * so tiles do not erase each other and the picture accumulates across frames.
 * The cost per frame is the cost of one tile, which is the whole point: a pass
 * that would stall for 200 ms as one render costs a millisecond or two a frame
 * for a fifth of a second instead, and nothing on screen ever hitches.
 *
 * WHY NO MULTISAMPLING ON THESE BUFFERS. Three resolves a multisampled target
 * and then INVALIDATES it (`updateMultisampleRenderTarget`), so tiles drawn on
 * earlier frames would be thrown away — tiling and MSAA cannot both be had.
 * These passes supersample instead (`QUALITY`) and downsample through mipmaps,
 * which is what the resolve was doing anyway.
 *
 * WHAT A WEAK DEVICE GIVES UP, AND WHAT IT MUST NOT. Stage 3 is the reason any
 * of this exists, so it is the one thing NOT scaled down: its buffer is one
 * screen's worth of texels on every tier, which is no more than the device
 * already draws every frame. What a weak device drops is stage 2 — the
 * whole-page buffer, skipped outright when the screen is not dense enough to
 * show the difference (`REFINE_WORTH_IT`) — and the size of a tile, so the
 * frames it does spend are small ones.
 */

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  HalfFloatType,
  LinearFilter,
  LinearMipmapLinearFilter,
  OrthographicCamera,
  WebGLRenderTarget,
  type MeshStandardMaterial,
  type Scene,
  type Texture,
  type WebGLRenderer,
} from "three";

import type { CameraFocusRect, SurahLayoutConfig } from "../../../data/schema";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { usePaperStore } from "../../../stores/usePaperStore";
import { detectGpuTier } from "../../../utils/gpuTier";
import { buildSectionZoomIndex } from "../../../utils/sectionZoom";
import { useFoldStore } from "../orchestrator/ScrollManager";
import {
  DETAIL_SLOTS,
  detailRect,
  detailTextureSize,
  planTiles,
  QUALITY,
  refineTextureSize,
  type PageDetailUniforms,
  type TextureSize,
} from "./pageTextureLodMath";

// ---------------------------------------------------------------------------
// The driver's own dials — sizes live in `pageTextureLodMath`
// ---------------------------------------------------------------------------

/**
 * How long after the page settles the background refine may start — long
 * enough for the loading handoff and the first reveal to be over with.
 *
 * Counted from the end of a PAPER SWITCH, not from the settle, whenever one is
 * in flight. A switch settles the incoming page BEFORE it animates it (that is
 * the whole point of the "loading" phase), so a delay measured from the settle
 * would drop the most expensive pass this module owns — the whole page,
 * re-rendered a tile a frame — directly into the middle of the choreography,
 * which is exactly where the frame budget is already spoken for. On a heavy
 * page that is the stutter the reader sees during the turn.
 */
const REFINE_IDLE_DELAY_MS = 900;

/** Seconds⁻¹ for the detail's fade. ~0.4 s door to door. */
const DETAIL_FADE_RATE = 8;

// ---------------------------------------------------------------------------
// Tiled passes
// ---------------------------------------------------------------------------

type PassKind = "refine" | "detail";

interface TilePass {
  kind: PassKind;
  /** Which detail request this pass is for — stale ones are abandoned. */
  key: string;
  /** Which detail slot is being filled. Absent on the refine. */
  slot?: number;
  target: WebGLRenderTarget;
  rect: CameraFocusRect;
  cols: number;
  rows: number;
  /** Next tile to draw. Survives being paused and picked up again. */
  tile: number;
}

/**
 * Draw the next `budget` tiles of `pass`. Returns true when the picture is
 * complete.
 *
 * The viewport and scissor are set ON THE TARGET rather than on the renderer:
 * `setRenderTarget` reads them straight off the target it is binding, and the
 * renderer's own pair are what it restores for the screen afterwards — so this
 * cannot leak into the main render even in principle.
 */
function drawTiles(
  gl: WebGLRenderer,
  scene: Scene,
  camera: OrthographicCamera,
  pass: TilePass,
  budget: number,
): boolean {
  const total = pass.cols * pass.rows;
  const last = Math.min(pass.tile + budget, total);
  if (pass.tile >= total) return true;

  const previousTarget = gl.getRenderTarget();
  const previousAutoClear = gl.autoClear;
  const previousXr = gl.xr.enabled;
  const previousPresenting = gl.xr.isPresenting;

  // The clear is what paints the page's background colour, and it obeys the
  // scissor — which is exactly why tiles do not erase one another.
  gl.autoClear = true;
  gl.xr.enabled = false;
  gl.xr.isPresenting = false;

  const { width, height } = pass.target;
  const tileW = pass.rect.w / pass.cols;
  const tileH = pass.rect.h / pass.rows;

  for (; pass.tile < last; pass.tile++) {
    const col = pass.tile % pass.cols;
    const row = Math.floor(pass.tile / pass.cols);

    // The camera's box is the slice of the page this tile carries...
    const left = pass.rect.x + col * tileW;
    const top = pass.rect.y - row * tileH;
    camera.left = left;
    camera.right = left + tileW;
    camera.top = top;
    camera.bottom = top - tileH;
    camera.updateProjectionMatrix();

    // ...and the viewport is the matching slice of the buffer. GL counts rows
    // from the bottom; the page counts them from the top. Rounding the shared
    // edges the same way from both sides leaves no seam and no overlap.
    const x0 = Math.round((col * width) / pass.cols);
    const x1 = Math.round(((col + 1) * width) / pass.cols);
    const y0 = Math.round(((pass.rows - row - 1) * height) / pass.rows);
    const y1 = Math.round(((pass.rows - row) * height) / pass.rows);

    pass.target.viewport.set(x0, y0, x1 - x0, y1 - y0);
    pass.target.scissor.set(x0, y0, x1 - x0, y1 - y0);
    pass.target.scissorTest = true;

    // Mipmaps are rebuilt at the end of every render into this target, so only
    // the tile that completes the picture asks for them.
    pass.target.texture.generateMipmaps = pass.tile === total - 1;

    gl.setRenderTarget(pass.target);
    gl.render(scene, camera);
  }

  gl.setRenderTarget(previousTarget);
  gl.autoClear = previousAutoClear;
  gl.xr.enabled = previousXr;
  gl.xr.isPresenting = previousPresenting;

  return pass.tile >= total;
}

/**
 * A buffer that matches what drei's `RenderTexture` produces — half-float, so
 * the linear values three writes into a render target survive without banding
 * (a render target is never sRGB-encoded; see `WebGLRenderer`'s
 * `outputColorSpace`) — plus the mipmaps and anisotropy a page seen at an angle
 * needs.
 */
function createPageTarget(
  gl: WebGLRenderer,
  size: TextureSize,
  maxAnisotropy: number,
): WebGLRenderTarget {
  const target = new WebGLRenderTarget(size.width, size.height, {
    type: HalfFloatType,
    minFilter: LinearMipmapLinearFilter,
    magFilter: LinearFilter,
    generateMipmaps: true,
    depthBuffer: true,
    stencilBuffer: false,
    samples: 0,
  });
  target.texture.anisotropy = Math.min(
    gl.capabilities.getMaxAnisotropy(),
    maxAnisotropy,
  );
  return target;
}

// ---------------------------------------------------------------------------
// Reaching the offscreen scene
// ---------------------------------------------------------------------------

/**
 * Mounted INSIDE the `RenderTexture`, where `useThree` reports the portal's own
 * virtual scene. That scene already holds the whole page — every sheet, every
 * capsule, every glyph — so every pass here re-renders it with a different
 * camera rather than building a second copy of it.
 */
export function PageLodSceneProbe({
  sceneRef,
}: {
  sceneRef: RefObject<Scene | null>;
}) {
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    sceneRef.current = scene;
    return () => {
      if (sceneRef.current === scene) sceneRef.current = null;
    };
  }, [scene, sceneRef]);

  return null;
}

// ---------------------------------------------------------------------------
// The driver
// ---------------------------------------------------------------------------

interface PageTextureLodProps {
  config: SurahLayoutConfig;
  /** The page material whose `map` the refine pass takes over. */
  materialRef: RefObject<MeshStandardMaterial | null>;
  /** Filled in by `PageLodSceneProbe`. */
  sceneRef: RefObject<Scene | null>;
  pageWidth: number;
  pageHeight: number;
  /** True once the first paint has actually been captured. */
  settled: boolean;
  /** The paper shader's detail slot — written every frame, never read back. */
  detailRef: RefObject<PageDetailUniforms>;
}

export function PageTextureLod({
  config,
  materialRef,
  sceneRef,
  pageWidth,
  pageHeight,
  settled,
  detailRef,
}: PageTextureLodProps) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const quality = QUALITY[detectGpuTier()];
  const maxTextureSize = gl.capabilities.maxTextureSize || 4096;

  const { zoomFocus, getSectionIdForVerse } = useMemo(
    () => buildSectionZoomIndex(config),
    [config],
  );

  // The buffer the screen is worth, at this window size. Every sheet's zoom
  // frames the same window, so ONE SHAPE serves them all — which is what lets
  // the two slots ping-pong without either ever paying for an allocation.
  const detailSize = useMemo(
    () => detailTextureSize(size.width, size.height, dpr, maxTextureSize),
    [size.width, size.height, dpr, maxTextureSize],
  );

  // The sharpen's reach, in the buffer's own UV space. Written here rather than
  // per frame: it changes only when the buffer's shape does.
  useEffect(() => {
    detailRef.current.uDetailTexel.value.set(
      1 / detailSize.width,
      1 / detailSize.height,
    );
  }, [detailSize, detailRef]);

  const refineSize = useMemo(
    () =>
      refineTextureSize(
        pageWidth,
        pageHeight,
        size.width * dpr,
        size.height * dpr,
        quality,
        maxTextureSize,
      ),
    [pageWidth, pageHeight, size.width, size.height, dpr, quality, maxTextureSize],
  );

  const camera = useMemo(() => {
    const cam = new OrthographicCamera(0, 1, 1, 0, 0.1, 100);
    cam.position.set(0, 0, 5);
    cam.updateMatrixWorld();
    return cam;
  }, []);

  const refineTargetRef = useRef<WebGLRenderTarget | null>(null);
  /** One buffer per slot — see `DETAIL_SLOTS` and the ping-pong below. */
  const detailTargetsRef = useRef<(WebGLRenderTarget | null)[]>(
    Array.from({ length: DETAIL_SLOTS }, () => null),
  );
  const passRef = useRef<TilePass | null>(null);
  const pausedRefineRef = useRef<TilePass | null>(null);
  const refineDoneRef = useRef(false);
  const settledAtRef = useRef(0);
  /** The map drei attached, restored on the way out. */
  const firstPassMapRef = useRef<Texture | null>(null);
  /** Which detail each buffer holds, and how visible each one is. */
  const heldDetailRef = useRef<(string | null)[]>(
    Array.from({ length: DETAIL_SLOTS }, () => null),
  );
  const fadeRef = useRef<number[]>(
    Array.from({ length: DETAIL_SLOTS }, () => 0),
  );
  /**
   * The slot carrying the sheet the reader is on — so the OTHER one is the
   * spare, and the spare is always where the next sheet gets drawn.
   */
  const shownSlotRef = useRef(0);
  /** What the reader is looking at right now — written by the subscription. */
  const wantRef = useRef<{ key: string; rect: CameraFocusRect } | null>(null);

  // ── What the reader asked for ──────────────────────────────────────────
  // Read the same way SectionZoomCamera reads it, so the sharp rectangle and
  // the framed one are always the same rectangle.
  useEffect(() => {
    const read = () => {
      if (useFoldStore.getState().isIntroActive) return null;
      const { phase, isAllSectionsMode, activeSectionId, activeVerseIds } =
        useElevatedStore.getState();
      if (phase !== "elevated" || isAllSectionsMode) return null;

      const sectionId =
        activeSectionId ??
        (activeVerseIds.length > 0
          ? getSectionIdForVerse(activeVerseIds[0])
          : null);
      if (!sectionId) return null;

      const rect = zoomFocus[sectionId];
      // Keyed by the RECTANGLE, not the section: every zone of one sheet hands
      // out the same one (see `paperComposer`), so moving between two rings of
      // the same page must not throw away the picture of that page.
      return rect
        ? { key: `${rect.x}|${rect.y}|${rect.w}|${rect.h}`, rect }
        : null;
    };

    const update = () => {
      const next = read();
      const current = wantRef.current;
      if (next?.key === current?.key) return;
      wantRef.current = next;
    };

    update();
    const unsubElevated = useElevatedStore.subscribe(update);
    const unsubFold = useFoldStore.subscribe(update);
    return () => {
      unsubElevated();
      unsubFold();
    };
  }, [zoomFocus, getSectionIdForVerse]);

  // ── Window resized: both buffers are the wrong shape now ────────────────
  useEffect(() => {
    const refine = refineTargetRef.current;
    if (refine && refineSize) {
      // Only worth redoing when the window GREW — a smaller one is already
      // covered by the buffer we have, and reshooting it would be for nothing.
      if (refineSize.width > refine.width * 1.15) {
        refine.setSize(refineSize.width, refineSize.height);
        refineDoneRef.current = false;
        if (passRef.current?.kind === "refine") passRef.current = null;
        pausedRefineRef.current = null;
      }
    }

    detailTargetsRef.current.forEach((det, slot) => {
      if (!det) return;
      if (det.width === detailSize.width && det.height === detailSize.height) {
        return;
      }
      det.setSize(detailSize.width, detailSize.height);
      // The picture in it did not survive the resize, so nothing may be shown
      // from it until it has been drawn again.
      heldDetailRef.current[slot] = null;
      fadeRef.current[slot] = 0;
      detailRef.current.uDetailStrength.value[slot] = 0;
      if (passRef.current?.kind === "detail" && passRef.current.slot === slot) {
        passRef.current = null;
      }
    });
  }, [refineSize, detailSize, detailRef]);

  useEffect(() => {
    settledAtRef.current = settled ? performance.now() : 0;
  }, [settled]);

  // A switch holds the clock down and restarts it on the way out, so the
  // refine's delay is always measured from the last thing that finished —
  // never from a settle the choreography then ran on top of.
  useEffect(() => {
    let wasSwitching = usePaperStore.getState().isSwitching;
    return usePaperStore.subscribe((state) => {
      if (state.isSwitching === wasSwitching) return;
      wasSwitching = state.isSwitching;
      if (state.isSwitching) {
        // Give up a half-drawn picture rather than carry it across the turn:
        // the page it was of is the page being replaced.
        pausedRefineRef.current = null;
        if (passRef.current?.kind === "refine") passRef.current = null;
      } else if (settledAtRef.current > 0) {
        settledAtRef.current = performance.now();
      }
    });
  }, []);

  // ── Teardown ────────────────────────────────────────────────────────────
  // Hand the material back the texture drei attached BEFORE the buffers go, so
  // nothing can ever hold a disposed one — not the paper, not the page-turn
  // snapshot that blits `material.map` mid-switch.
  //
  // ONLY IF THE MAP IS STILL OURS. This cleanup is a passive effect, so it runs
  // AFTER the commit that swapped the page — and leaving a heavy paper for a
  // light one unmounts this ladder in the very same commit that mounts the new
  // page's `RenderTexture`, which has already attached ITS texture to the
  // material by the time we get here. Restoring unconditionally therefore wrote
  // the OLD paper's first-pass texture over the new paper's live one, and then
  // disposed the buffers underneath it: the page went black, and stayed black,
  // for exactly the right → left trip and no other.
  useEffect(() => {
    const detail = detailRef.current;
    return () => {
      // Read LATE, on purpose. The lint rule here advises copying the ref into
      // the effect body — which is precisely the pattern that produced the
      // black page: the whole question this cleanup has to answer is what the
      // material looks like NOW, after the swap, not what it looked like when
      // the effect first ran.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const material = materialRef.current;
      const restorable =
        material !== null &&
        firstPassMapRef.current !== null &&
        material.map === refineTargetRef.current?.texture;
      if (material && restorable) {
        material.map = firstPassMapRef.current;
      }
      // Read late for the same reason as the material above: what has to be
      // disposed is whatever these slots are holding NOW, not what they held
      // when the effect first ran.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const detailTargets = detailTargetsRef.current;
      for (let slot = 0; slot < DETAIL_SLOTS; slot++) {
        detail.uDetailStrength.value[slot] = 0;
        detail.uDetailMap.value[slot] = null;
        detailTargets[slot]?.dispose();
        detailTargets[slot] = null;
      }
      refineTargetRef.current?.dispose();
      refineTargetRef.current = null;
    };
  }, [materialRef, detailRef]);

  useFrame((state, delta) => {
    const scene = sceneRef.current;
    const material = materialRef.current;
    if (!scene || !material || !settled) return;

    if (!firstPassMapRef.current && material.map) {
      firstPassMapRef.current = material.map;
    }

    const renderer = state.gl;
    const detail = detailRef.current;
    const want = wantRef.current;

    // 1. Which slot, if any, already has the picture the reader is asking for.
    //    Found by rectangle, so stepping between two zones of one sheet is a
    //    hit rather than a redraw — and so is stepping BACK to the sheet just
    //    left, whose picture the spare is still holding.
    const held = heldDetailRef.current;
    const hit = want ? held.indexOf(want.key) : -1;
    if (hit >= 0) shownSlotRef.current = hit;
    /** A zoom is on its way and no buffer has its picture yet. */
    const detailPending = want !== null && hit < 0;

    /**
     * The buffer the incoming sheet will be drawn into, or -1 for none: always
     * the one the reader is NOT looking at, which is the whole point — the
     * sheet in front of them keeps its picture while the next one is drawn
     * behind their back.
     */
    const drawInto = detailPending ? 1 - shownSlotRef.current : -1;

    // 2. The fades.
    //
    //    A slot is lit whenever it holds a real picture and the reader is
    //    zoomed in — INCLUDING the sheet they have just stepped off, whose
    //    rectangle is somewhere else on the page and costs nothing to leave
    //    sharp. The one thing that is ever put out is the buffer about to be
    //    drawn into, because a buffer cannot be overwritten while the page is
    //    still reading it.
    //
    //    That is the whole of the difference. The old ladder had one buffer, so
    //    the one being drawn into was always the one in front of the reader,
    //    and they watched the sheet they were looking at soften back to the
    //    page's own low first paint in the middle of every step. Nothing about
    //    that dip was earned: the sharp picture existed the whole way through
    //    and was being thrown away to make room.
    for (let slot = 0; slot < DETAIL_SLOTS; slot++) {
      const target =
        held[slot] === null || want === null || slot === drawInto ? 0 : 1;
      const fade = fadeRef.current[slot];
      if (fade === target) continue;
      const eased =
        fade +
        (target - fade) *
          (1 - Math.exp(-DETAIL_FADE_RATE * Math.min(delta, 0.1)));
      fadeRef.current[slot] =
        Math.abs(target - eased) < 0.002 ? target : eased;
      detail.uDetailStrength.value[slot] = fadeRef.current[slot];
    }

    // 3. A zoom outranks the background refine — pause it mid-picture and pick
    //    it up again when the reader has their sharp sheet.
    let pass = passRef.current;
    if (pass?.kind === "refine" && detailPending) {
      pausedRefineRef.current = pass;
      passRef.current = null;
      pass = null;
    }

    // 4. Abandon a detail pass the reader has already moved on from.
    if (pass?.kind === "detail" && pass.key !== (want?.key ?? "")) {
      passRef.current = null;
      pass = null;
    }

    if (pass) {
      if (!drawTiles(renderer, scene, camera, pass, 1)) return;
      passRef.current = null;

      if (pass.kind === "detail" && pass.slot !== undefined) {
        detail.uDetailMap.value[pass.slot] = pass.target.texture;
        detail.uDetailRect.value[pass.slot].set(
          pass.rect.x / pageWidth,
          1 + (pass.rect.y - pass.rect.h) / pageHeight,
          pass.rect.w / pageWidth,
          pass.rect.h / pageHeight,
        );
        held[pass.slot] = pass.key;
        // The picture is complete, so this is the slot the reader is on — and
        // the one they were on keeps its own light until its buffer is claimed.
        shownSlotRef.current = pass.slot;
      } else if (pass.kind === "refine") {
        material.map = pass.target.texture;
        refineDoneRef.current = true;
      }
      return;
    }

    // 5. Nothing running: the zoom first, the page's own sharpening second.
    //    The buffer has to be dark before it can be drawn into — which, with
    //    two of them, it already is on the very first frame of a step, since
    //    nothing on screen was reading it in the first place.
    if (detailPending && want && fadeRef.current[drawInto] <= 0.001) {
      if (!detailTargetsRef.current[drawInto]) {
        detailTargetsRef.current[drawInto] = createPageTarget(
          renderer,
          detailSize,
          quality.maxAnisotropy,
        );
      }
      const target = detailTargetsRef.current[drawInto]!;
      const rect = detailRect(want.rect, target.width / target.height);
      passRef.current = {
        kind: "detail",
        key: want.key,
        slot: drawInto,
        target,
        rect,
        ...planTiles(
          { width: target.width, height: target.height },
          quality.tilePixels,
        ),
        tile: 0,
      };
      return;
    }

    // The refine only gets the frame back once no zoom is waiting on one.
    if (pausedRefineRef.current && !detailPending) {
      passRef.current = pausedRefineRef.current;
      pausedRefineRef.current = null;
      return;
    }

    if (
      !refineDoneRef.current &&
      !detailPending &&
      !usePaperStore.getState().isSwitching &&
      settledAtRef.current > 0 &&
      performance.now() - settledAtRef.current > REFINE_IDLE_DELAY_MS
    ) {
      // Null means this device gains too little from a whole-page pass to be
      // asked for one — see `refineTextureSize`. It keeps the first paint and
      // spends everything it has on the zoom instead.
      if (!refineSize) {
        refineDoneRef.current = true;
        return;
      }
      if (!refineTargetRef.current) {
        refineTargetRef.current = createPageTarget(renderer, refineSize, quality.maxAnisotropy);
      }
      const target = refineTargetRef.current;
      passRef.current = {
        kind: "refine",
        key: "page",
        target,
        rect: { x: 0, y: 0, w: pageWidth, h: pageHeight },
        ...planTiles(
          { width: target.width, height: target.height },
          quality.tilePixels,
        ),
        tile: 0,
      };
      return;
    }

    // 6. Idle, and the page is as sharp as it gets: pay for a detail buffer's
    //    allocation NOW, so the first zoom is pure drawing. ONE PER IDLE FRAME —
    //    two of these back to back is the largest pair of allocations this
    //    module ever makes, and the second one can wait for the next frame.
    if (refineDoneRef.current) {
      const empty = detailTargetsRef.current.findIndex((t) => t === null);
      if (empty >= 0) {
        const target = createPageTarget(
          renderer,
          detailSize,
          quality.maxAnisotropy,
        );
        detailTargetsRef.current[empty] = target;
        const previous = renderer.getRenderTarget();
        renderer.setRenderTarget(target);
        renderer.clear();
        renderer.setRenderTarget(previous);
      }
    }
  });

  return null;
}
