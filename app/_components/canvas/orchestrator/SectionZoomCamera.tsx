"use client";

import { useFrame } from "@react-three/fiber";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { useFoldStore } from "./ScrollManager";
import { CAMERA_CONFIG } from "../../../data/cameraConfig";
import { useStoryStore } from "../../../stores/useStoryStore";
import { CameraFocusRect } from "../../../data/schema";
import { PAGE_SPACE_ANCHOR } from "../3d-scene/PageSpaceAnchor";
import { buildSectionZoomIndex, FRAME_FILL } from "../../../utils/sectionZoom";
import {
  easeFlight,
  flightDuration,
  planFlight,
  type FlightSample,
} from "../../../utils/cameraFlight";
import {
  MathUtils,
  Matrix4,
  Object3D,
  PerspectiveCamera,
  Vector3,
} from "three";

import { useMemo, useRef } from "react";

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
const _toCenter = new Vector3();
const _invAnchor = new Matrix4();
const _sample: FlightSample = { travel: 0, width: 0 };
/** Stands in for the orbit target on a scene mounted without controls. */
const _aim = new Vector3();

/** The rectangle a section frames, as one comparable value. */
function focusKey(rect: CameraFocusRect): string {
  return `${rect.x}|${rect.y}|${rect.w}|${rect.h}`;
}

/** The middle of a framed rectangle, in the page's own coordinates. */
function rectCenter(rect: CameraFocusRect, out: Vector3): Vector3 {
  return out.set(rect.x + rect.w / 2, rect.y - rect.h / 2, 0);
}

/**
 * How far back the camera must stand for `rect` to fill `FRAME_FILL` of the
 * window. Its height sets the distance when the window is the narrower shape,
 * its width when the window is the wider one — so both are solved and the
 * camera takes whichever pushes it further back.
 *
 * `pageScale` is not 1: the page is drawn at 0.9 of its stated size inside the
 * tilt group, and the intro's handoff scales it again while that is running —
 * so the rectangle's size in the world is not the size it states.
 */
function framingDistance(
  rect: CameraFocusRect,
  pageScale: number,
  halfV: number,
  aspect: number,
): number {
  return (
    Math.max(
      (rect.h * pageScale) / 2 / halfV,
      (rect.w * pageScale) / 2 / (halfV * aspect),
    ) / FRAME_FILL
  );
}

/**
 * The two ways of saying the same thing: how far back the camera stands, and
 * how wide a slice of the world it therefore sees at what it is looking at.
 * `cameraFlight` works in the second because van Wijk's arithmetic does.
 */
function viewWidth(distance: number, halfV: number, aspect: number): number {
  return 2 * distance * halfV * aspect;
}
function viewDistance(width: number, halfV: number, aspect: number): number {
  return width / (2 * halfV * aspect);
}

/**
 * Where the camera has to stand for `rect` — a rectangle on the page — to fill
 * the viewport, and what it has to look at.
 *
 * The page is tilted 45° away from the viewer and the resting camera looks
 * almost exactly down its normal (1.2° off), so a rectangle on it is seen
 * head-on rather than foreshortened: framing it is the arithmetic for hanging a
 * picture on a wall.
 *
 * The direction is the RESTING one and not the page's own normal, so the
 * look-around spin still reads as a turn while zoomed in, instead of being
 * quietly undone by a camera that swings around to face the page again.
 *
 * Expects the anchor's world matrix to be fresh — the caller owns that, since
 * every path through the frame needs it.
 */
function solveFraming(
  rect: CameraFocusRect,
  anchor: Object3D,
  halfV: number,
  aspect: number,
  outFocus: Vector3,
  outPosition: Vector3,
) {
  rectCenter(rect, outFocus).applyMatrix4(anchor.matrixWorld);

  const pageScale = _pageScale.setFromMatrixScale(anchor.matrixWorld).x;

  outPosition
    .copy(REST_DIRECTION)
    .multiplyScalar(framingDistance(rect, pageScale, halfV, aspect))
    .add(outFocus);
}

/**
 * A step in progress: the view the camera left, and how long it has been going.
 *
 * The start is held in the PAGE's coordinates rather than the world's, so a
 * flight that overlaps a spin or a paper switch is carried along by the same
 * matrix as its destination instead of aiming at a spot the page has left.
 */
interface Flight {
  /** Where the camera was aiming when the step began, in page coordinates. */
  origin: Vector3;
  /** How wide a slice of the world it saw there. */
  width: number;
  elapsed: number;
  /** Seconds. 0 until the first frame solves the path and can price it. */
  duration: number;
}

export function SectionZoomCamera() {
  const config = useStoryStore(state => state.activeConfig);

  // The zone lookups, shared verbatim with the texture ladder that has to have
  // a sharp picture of the same rectangle ready — see `utils/sectionZoom`.
  const { zoomTargets, zoomFocus, getSectionIdForVerse } = useMemo(
    () => buildSectionZoomIndex(config),
    [config],
  );

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

  /** Which rectangle was framed last frame — a change in it is a step. */
  const framedKeyRef = useRef<string | null>(null);
  const flightRef = useRef<Flight | null>(null);

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

      // This runs BEFORE the renderer's own matrix pass, so the anchor is still
      // carrying last frame's transform — and, on the frame a paper mounts, no
      // transform at all. Freshening this one chain (parents yes, children no)
      // is a handful of matrix multiplies and it is what keeps the camera from
      // aiming at where the page used to be while the spin or a page switch is
      // moving it.
      anchor?.updateWorldMatrix(true, false);

      // The orbit target IS the aim, and the camera is pointed at it HERE
      // rather than left for CameraViewController to do a moment later. That
      // controller is still right — it reads the very same vector, so it
      // recomputes the identical rotation — but a flight that owns its own
      // aiming cannot be caught mid-frame between a position that has arrived
      // and a heading that has not.
      const aim = controls?.target ?? _aim;

      const aspect = state.size.width / state.size.height;
      const halfV = Math.tan(MathUtils.degToRad(defFov) / 2);

      // Frame-rate independent easing — the same flight on a 144Hz screen as on
      // a 30Hz one. `delta` is capped so coming out of a stall (a hidden tab, a
      // shader compile) eases rather than teleports.
      const ease = 1 - Math.exp(-FRAME_RESPONSE * Math.min(delta, 0.1));

      // Settled here, above every path below, because the framing arithmetic
      // assumes the resting field of view: a page arrived at from one of the
      // fov-driven surahs starts out zoomed by lens as well as by distance, and
      // a flight that returned before this ran would fly the whole way with it.
      const fovDiff = defFov - (camera as PerspectiveCamera).fov;
      if (Math.abs(fovDiff) > 0.001) {
        (camera as PerspectiveCamera).fov += fovDiff * ease;
        camera.updateProjectionMatrix();
      }

      // ── Did the framed rectangle just change? ──────────────────────────
      // A rectangle at BOTH ends is a step from one sheet to another, the one
      // move that gets flown rather than eased — see `utils/cameraFlight`.
      // Arriving from the resting view is already a zoom-in and needs no arc,
      // and leaving for it is the same thing backwards.
      const framedKey = rect ? focusKey(rect) : null;
      const leftBehind = framedKeyRef.current;
      framedKeyRef.current = framedKey;

      if (framedKey !== leftBehind) {
        if (framedKey && leftBehind && anchor) {
          // Take off from where the camera ACTUALLY is rather than from where
          // the sheet it is leaving would have put it, so a reader tapping next
          // twice in a second gets one continuous flight instead of a snap back
          // to the frame they already left.
          _invAnchor.copy(anchor.matrixWorld).invert();
          flightRef.current = {
            origin: aim.clone().applyMatrix4(_invAnchor).setZ(0),
            width: viewWidth(camera.position.distanceTo(aim), halfV, aspect),
            elapsed: 0,
            duration: 0,
          };
        } else {
          flightRef.current = null;
        }
      }

      const flight = flightRef.current;
      if (flight && rect && anchor) {
        const pageScale = _pageScale.setFromMatrixScale(anchor.matrixWorld).x;
        rectCenter(rect, _toCenter);

        // Re-solved every frame against the LIVE destination, so a page still
        // sliding into place or a window being resized moves the far end of the
        // path rather than stranding the flight beside it.
        const path = planFlight(
          _toCenter.distanceTo(flight.origin) * pageScale,
          flight.width,
          viewWidth(framingDistance(rect, pageScale, halfV, aspect), halfV, aspect),
        );

        if (flight.duration === 0) flight.duration = flightDuration(path.length);
        flight.elapsed += Math.min(delta, 0.1);

        // Nowhere to go (two zones of one sheet, say), or the time is up: the
        // easing below owns the last fraction and the handover is invisible,
        // because smoothstep hands it a camera that has already stopped.
        if (path.length === 0 || flight.elapsed >= flight.duration) {
          flightRef.current = null;
        } else {
          const at = path.sample(
            path.length * easeFlight(flight.elapsed / flight.duration),
            _sample,
          );

          _focus
            .copy(flight.origin)
            .lerp(_toCenter, at.travel)
            .applyMatrix4(anchor.matrixWorld);

          camera.position
            .copy(REST_DIRECTION)
            .multiplyScalar(viewDistance(at.width, halfV, aspect))
            .add(_focus);

          aim.copy(_focus);
          camera.lookAt(aim);
          return;
        }
      }

      if (rect && anchor) {
        solveFraming(rect, anchor, halfV, aspect, _focus, _camPos);
      } else {
        // Nothing to frame: the paper whole, seen from where it rests.
        _focus.set(0, defTY * distanceScale, 0);
        _camPos.copy(REST_OFFSET).multiplyScalar(distanceScale);
      }

      camera.position.lerp(_camPos, ease);
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
