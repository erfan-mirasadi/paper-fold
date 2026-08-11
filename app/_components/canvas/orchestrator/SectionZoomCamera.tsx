"use client";

import { useFrame } from "@react-three/fiber";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { useFoldStore } from "./ScrollManager";
import { CAMERA_CONFIG } from "../../../data/cameraConfig";
import { useStoryStore } from "../../../stores/useStoryStore";
import { CameraFocusRect, CameraTargetConfig } from "../../../data/schema";
import { PAGE_SPACE_ANCHOR } from "../3d-scene/PageSpaceAnchor";
import { MathUtils, Object3D, PerspectiveCamera, Vector3 } from "three";

import { useMemo, useRef } from "react";

/**
 * How much of the screen the framed rectangle fills, along whichever of its two
 * sides runs out of room first. At 1 its edges touch the edges of the window;
 * below that there is air around it.
 *
 * Not 1, for two reasons. A sheet's rectangle is the page it was drawn on and
 * the ink usually stops short of that — but not always, and a frame SVG drawn
 * out to the very edge would be cropped by the window if the fit were exact.
 * And a sheet read completely alone, with no hint of the ones it sits between,
 * loses the thing an atlas is for.
 */
const FRAME_FILL = 0.9;

/** Seconds⁻¹. The flight is ~2/3 of the way home after 1 s at this rate. */
const FRAME_RESPONSE = 3.2;

/** Where the camera stands, relative to whatever it is looking at. */
const REST_OFFSET = new Vector3(...CAMERA_CONFIG.initialCamera.position).sub(
  new Vector3(...CAMERA_CONFIG.initialCamera.target),
);
const REST_DIRECTION = REST_OFFSET.clone().normalize();

const _focus = new Vector3();
const _camPos = new Vector3();
const _pageScale = new Vector3();
/** Stands in for the orbit target on a scene mounted without controls. */
const _aim = new Vector3();

/**
 * Where the camera has to stand for `rect` — a rectangle on the page — to fill
 * the viewport, and what it has to look at.
 *
 * The page is tilted 45° away from the viewer and the resting camera looks
 * almost exactly down its normal (1.2° off), so a rectangle on it is seen
 * head-on rather than foreshortened: framing it is the arithmetic for hanging a
 * picture on a wall. Its height sets the distance when the window is the
 * narrower shape, its width when the window is the wider one — so both are
 * solved and the camera takes whichever pushes it further back.
 *
 * The direction is the RESTING one and not the page's own normal, so the
 * look-around spin still reads as a turn while zoomed in, instead of being
 * quietly undone by a camera that swings around to face the page again.
 */
function solveFraming(
  rect: CameraFocusRect,
  anchor: Object3D,
  fov: number,
  aspect: number,
  outFocus: Vector3,
  outPosition: Vector3,
) {
  // This runs BEFORE the renderer's own matrix pass, so the anchor is still
  // carrying last frame's transform — and, on the frame a paper mounts, no
  // transform at all. Freshening this one chain (parents yes, children no) is a
  // handful of matrix multiplies and it is what keeps the camera from aiming at
  // where the page used to be while the spin or a page switch is moving it.
  anchor.updateWorldMatrix(true, false);

  outFocus
    .set(rect.x + rect.w / 2, rect.y - rect.h / 2, 0)
    .applyMatrix4(anchor.matrixWorld);

  // The page is drawn at 0.9 of its stated size inside the tilt group, and the
  // intro's handoff scales it again while that is running — so the rectangle's
  // size in the world is not the size it states.
  const pageScale = _pageScale.setFromMatrixScale(anchor.matrixWorld).x;
  const halfV = Math.tan(MathUtils.degToRad(fov) / 2);
  const distance = Math.max(
    (rect.h * pageScale) / 2 / halfV,
    (rect.w * pageScale) / 2 / (halfV * aspect),
  );

  outPosition
    .copy(REST_DIRECTION)
    .multiplyScalar(distance / FRAME_FILL)
    .add(outFocus);
}

export function SectionZoomCamera() {
  const config = useStoryStore(state => state.activeConfig);

  const { zoomTargets, zoomFocus, getSectionIdForVerse } = useMemo(() => {
    const zoomTargets: Record<string, CameraTargetConfig> = {};
    // The sections that say WHAT the camera must show instead of where it
    // should stand. An atlas of many sheets fills this and leaves `zoomTargets`
    // empty; an ordinary one-surah page does the reverse. See `CameraFocusRect`.
    const zoomFocus: Record<string, CameraFocusRect> = {};

    if (config.customSections && config.customSections.length > 0) {
      // Register the custom section camera target (falls back to the first block with one)
      const fallback = config.blocks?.find((b: any) => b.cameraTarget)?.cameraTarget;
      config.customSections.forEach((cs: any) => {
        const target = cs.cameraTarget ?? fallback;
        if (target) zoomTargets[cs.id] = target;
        if (cs.cameraFocus) zoomFocus[cs.id] = cs.cameraFocus;
      });
    } else {
      // "perBlock" elevation (Fatiha, Kafirun, Alak): blocks sharing a
      // `customSectionId` (e.g. Alak's intro/outro merging into their
      // neighboring group's zone) register under that zone instead of
      // their own id. Blocks without their own `cameraTarget` reuse the
      // first target found anywhere (matching "Fallback: per-group entries
      // with same target" behavior for Kafirun/Fatiha, where only one block
      // declares a target), instead of never zooming.
      const fallback = config.blocks?.find((b: any) => b.cameraTarget)?.cameraTarget;
      config.blocks?.forEach((block: any) => {
        if (block.type === 'spacer' || !block.verseIds?.length) return;
        const zoneId = block.customSectionId ?? block.id;
        const target = block.cameraTarget ?? zoomTargets[zoneId] ?? fallback;
        if (target) zoomTargets[zoneId] = target;
      });
    }

    const getSectionIdForVerse = (vid: number): string | null => {
      if (config.customSections && config.customSections.length > 0) {
        for (const cs of config.customSections) {
          if (cs.verseIds.includes(vid)) return cs.id;
        }
      }
      for (const block of (config.blocks ?? [])) {
        if (block.verseIds?.includes(vid)) return block.customSectionId ?? block.id;
        // Grid blocks (Alak) carry their anaAyet as a separate field, not
        // part of `verseIds`.
        if (block.type === "grid" && block.anaAyetId === vid) {
          return block.customSectionId ?? block.id;
        }
      }
      return null;
    };

    return { zoomTargets, zoomFocus, getSectionIdForVerse };
  }, [config.blocks, config.customSections]);

  /** True for a page whose sections frame themselves — see step 3. */
  const framesSections = Object.keys(zoomFocus).length > 0;

  const activeSectionId = useElevatedStore((s) => s.activeSectionId);
  const activeVerseIds = useElevatedStore((s) => s.activeVerseIds);

  const fallbackSectionId = useMemo(() => {
    if (activeSectionId) return activeSectionId;
    if (activeVerseIds.length > 0) return getSectionIdForVerse(activeVerseIds[0]);
    return null;
  }, [activeSectionId, activeVerseIds, getSectionIdForVerse]);

  // Looked up once and held: the scene is persistent, and walking it by name on
  // every frame of every zoom would not be.
  const anchorRef = useRef<Object3D | null>(null);

  useFrame((state, delta) => {
    // 1. Only run zoom logic when in paper mode
    const isIntroActive = useFoldStore.getState().isIntroActive;
    const { phase, isAllSectionsMode } = useElevatedStore.getState();

    // 1. If we are in intro and NOT elevated, do nothing here so IntroCameraScrollController can handle it.
    if (isIntroActive && phase === "idle") return;

    const camera = state.camera;
    const controls = state.controls as any;

    // 2. Base camera position and target from config
    // A page big enough to need the camera pulled back (an atlas of several
    // sheets — see `LayoutDimensions.cameraDistanceScale`) scales the whole
    // camera triangle, height included: the resting height has to move with
    // the distance or the view flattens out. 1 for every ordinary surah.
    const distanceScale = config.dimensions.cameraDistanceScale ?? 1;
    const [, defY] = CAMERA_CONFIG.initialCamera.position;
    const [, defTY] = CAMERA_CONFIG.initialCamera.target;

    const defFov = CAMERA_CONFIG.initialCamera.fov;

    let targetCamY = defY * distanceScale;
    let targetFov = defFov;
    let lookAtY = defTY * distanceScale;

    // Infer section if we only clicked a verse and activeSectionId is null
    let targetSectionId = fallbackSectionId;

    // 3. THE ATLAS PATH — a paper of many sheets, where the clicked section
    // states the rectangle to frame and the camera solves the rest. Here the
    // camera flies in all three axes, which the height-and-fov path below never
    // does, so this branch also owns flying BACK: a dismissed zoom returns the
    // camera to its resting spot instead of leaving it parked over one sheet.
    if (framesSections) {
      if (!anchorRef.current?.parent) {
        anchorRef.current = state.scene.getObjectByName(PAGE_SPACE_ANCHOR) ?? null;
      }
      const anchor = anchorRef.current;
      const rect =
        phase === "elevated" && !isAllSectionsMode && targetSectionId
          ? zoomFocus[targetSectionId]
          : undefined;

      if (rect && anchor) {
        solveFraming(
          rect,
          anchor,
          defFov,
          state.size.width / state.size.height,
          _focus,
          _camPos,
        );
      } else {
        // Nothing to frame: the paper whole, seen from where it rests.
        _focus.set(0, defTY * distanceScale, 0);
        _camPos.copy(REST_OFFSET).multiplyScalar(distanceScale);
      }

      // Frame-rate independent easing — the same flight on a 144Hz screen as on
      // a 30Hz one. `delta` is capped so coming out of a stall (a hidden tab, a
      // shader compile) eases rather than teleports.
      const ease = 1 - Math.exp(-FRAME_RESPONSE * Math.min(delta, 0.1));

      camera.position.lerp(_camPos, ease);

      const fovDiff = defFov - (camera as PerspectiveCamera).fov;
      if (Math.abs(fovDiff) > 0.001) {
        (camera as PerspectiveCamera).fov += fovDiff * ease;
        camera.updateProjectionMatrix();
      }

      // The orbit target IS the aim, and the camera is pointed at it HERE
      // rather than left for CameraViewController to do a moment later. That
      // controller is still right — it reads the very same vector, so it
      // recomputes the identical rotation — but a flight that owns its own
      // aiming cannot be caught mid-frame between a position that has arrived
      // and a heading that has not.
      const aim = controls?.target ?? _aim;
      aim.lerp(_focus, ease);
      camera.lookAt(aim);
      return;
    }

    // 4. Zoom into the active section on a plain paper click (elevated phase,
    // not all-sections mode). No paper dragging happens anymore, so there is no
    // zoom-out-to-drop state to consider — a click always zooms in.
    if (phase === "elevated" && !isAllSectionsMode && targetSectionId) {
      const zoomCoords = zoomTargets[targetSectionId];
      if (zoomCoords) {
        targetCamY = zoomCoords.y;
        targetFov = zoomCoords.fov;

        // زاویه نگاه دوربین به بالا یا پایین بر اساس tilt
        lookAtY = zoomCoords.y + zoomCoords.tilt;
      }
    }

    // 5. Smoothly interpolate camera position and target
    // IMPORTANT: We only control Y-height and FOV.
    // X and Z are owned by OrbitControls (azimuth rotation) — do NOT lerp them.
    const lerpFactor = 0.025; // Lower = smoother/slower zoom
    const threshold = 0.001;

    const yDiff = targetCamY - camera.position.y;
    if (Math.abs(yDiff) > threshold) {
      camera.position.y += yDiff * lerpFactor;
    }

    const currentFov = (camera as any).fov;
    if (currentFov !== undefined) {
      const fovDiff = targetFov - currentFov;
      if (Math.abs(fovDiff) > threshold) {
        (camera as any).fov += fovDiff * lerpFactor;
        camera.updateProjectionMatrix();
      }
    }

    if (controls?.target) {
      const targetYDiff = lookAtY - controls.target.y;
      if (Math.abs(targetYDiff) > threshold) {
        controls.target.y += targetYDiff * lerpFactor;
      }
      // Do NOT call controls.update() here — CameraViewController owns the
      // camera orientation each frame. Calling controls.update() here would
      // fight its azimuth positioning and cause jitter/resets.
    } else {
      // Fallback: directly tilt the camera to face the lookAtY
      camera.lookAt(camera.position.x, lookAtY, camera.position.z);
    }
  });

  return null;
}
