"use client";

/**
 * AtlasCamera — the only thing that moves between the board's two states.
 *
 * Reads `useAtlasStore.focusedSheetId` every frame and eases the camera toward
 * whatever it finds: the whole-board framing when nothing is focused, or a
 * single sheet when one is. Because it eases toward a TARGET rather than
 * playing a transition, clicking a second sheet mid-flight re-aims the same
 * continuous motion instead of fighting an animation already in progress —
 * which is what makes the board feel navigable rather than scripted.
 *
 * Framing is solved from the camera's own field of view, so the sheet or the
 * board fills the viewport correctly at any window size or aspect ratio.
 */

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";

import {
  SHEET_BY_ID,
  boardBounds,
} from "../../../data/configs/yasin/sheets";
import { useAtlasStore } from "../../../stores/useAtlasStore";

/** Breathing room around whatever is being framed. 1 = touching the edges. */
const BOARD_MARGIN = 1.16;
const SHEET_MARGIN = 1.3;

/** Seconds-to-settle feel; smaller is snappier. */
const EASE_BASE = 0.0015;

/** Distance that fits `width` × `height` in view for this camera. */
function distanceToFit(
  camera: PerspectiveCamera,
  width: number,
  height: number,
  margin: number,
): number {
  const vFov = MathUtils.degToRad(camera.fov);
  const fitH = (height * margin) / 2 / Math.tan(vFov / 2);
  // Horizontal fit needs the aspect-corrected half-angle.
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
  const fitW = (width * margin) / 2 / Math.tan(hFov / 2);

  return Math.max(fitH, fitW);
}

export function AtlasCamera() {
  const { camera } = useThree();
  const bounds = useMemo(() => boardBounds(), []);

  const targetPos = useRef(new Vector3());
  const targetLook = useRef(new Vector3());

  useFrame((_, delta) => {
    const cam = camera as PerspectiveCamera;
    const { focusedSheetId } = useAtlasStore.getState();
    const sheet = focusedSheetId ? SHEET_BY_ID.get(focusedSheetId) : null;

    if (sheet) {
      const z = distanceToFit(cam, sheet.width, sheet.height, SHEET_MARGIN);
      targetPos.current.set(sheet.x, sheet.y, z);
      targetLook.current.set(sheet.x, sheet.y, 0);
    } else {
      const z = distanceToFit(cam, bounds.width, bounds.height, BOARD_MARGIN);
      targetPos.current.set(bounds.centerX, bounds.centerY, z);
      targetLook.current.set(bounds.centerX, bounds.centerY, 0);
    }

    // Frame-rate independent easing — the same curve on a 60Hz and a 144Hz
    // display, rather than a fixed per-frame fraction that runs faster the
    // more frames there are.
    const ease = 1 - Math.pow(EASE_BASE, delta);
    cam.position.lerp(targetPos.current, ease);
    cam.lookAt(targetLook.current);
    cam.updateProjectionMatrix();
  });

  return null;
}
