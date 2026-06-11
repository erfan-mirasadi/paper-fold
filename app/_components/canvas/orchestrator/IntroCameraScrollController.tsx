"use client";

import { useFrame } from "@react-three/fiber";
import { useCameraStore } from "../../../stores/useCameraStore";
import { useFoldStore } from "./ScrollManager";
import { CAMERA_CONFIG } from "../../../data/cameraConfig";
import { useStoryStore } from "../../../stores/useStoryStore";
import { Vector3, type Spherical } from "three";

type OrbitControlsLike = {
  target?: {
    x: number;
    y: number;
    z: number;
    set: (x: number, y: number, z: number) => void;
    copy: (v: Vector3) => void;
  };
  update?: () => void;
  _sphericalDelta?: { set: (x: number, y: number, z: number) => void };
  sphericalDelta?: { set: (x: number, y: number, z: number) => void };
  _panOffset?: { set: (x: number, y: number, z: number) => void };
  panOffset?: { set: (x: number, y: number, z: number) => void };
  _scale?: number;
  scale?: number;
};

const easeInOutCubic = (t: number): number => {
  if (t < 0.5) return 4 * t * t * t;
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

/** Flush OrbitControls internal deltas so the manual camera snap sticks. */
function flushOrbitControls(controls: OrbitControlsLike | undefined) {
  if (!controls) return;
  if (controls._sphericalDelta?.set) controls._sphericalDelta.set(0, 0, 0);
  if (controls.sphericalDelta?.set) controls.sphericalDelta.set(0, 0, 0);
  if (controls._panOffset?.set) controls._panOffset.set(0, 0, 0);
  if (controls.panOffset?.set) controls.panOffset.set(0, 0, 0);
  if (typeof controls._scale === "number") controls._scale = 1;
  if (typeof controls.scale === "number") controls.scale = 1;
  controls.update?.();
}

export function IntroCameraScrollController() {
  useFrame((state) => {
    const config = useStoryStore.getState().activeConfig;
    if (useCameraStore.getState().phase !== "idle") return;

    const { isIntroActive, introProgress, introHandoffProgress, isInstantSkip } =
      useFoldStore.getState();

    // When intro was instant-skipped, the handoff animation never played,
    // so the camera is frozen in its intro position.
    // Snap it to the base (story) position every frame until isInstantSkip clears.
    if (!isIntroActive && isInstantSkip) {
      const { introCamera } = config.animations;
      if (introCamera) {
        const controls = state.controls as OrbitControlsLike | undefined;
        const [baseX, baseY, baseZ] = CAMERA_CONFIG.initialCamera.position;
        const [baseTX, baseTY, baseTZ] = CAMERA_CONFIG.initialCamera.target;
        state.camera.position.set(baseX, baseY, baseZ);
        state.camera.lookAt(baseTX, baseTY, baseTZ);
        if (controls?.target?.set) {
          controls.target.set(baseTX, baseTY, baseTZ);
          flushOrbitControls(controls);
        }
      }
      return;
    }

    if (!isIntroActive) return;

    const { introCamera } = config.animations;
    if (!introCamera) return;

    const controls = state.controls as OrbitControlsLike | undefined;
    const offsetScale = 1 - introProgress;
    const [introX, introY, introZ] = introCamera.introPosition;
    const [introTX, introTY, introTZ] = introCamera.introTarget;
    const [offX, offY, offZ] = introCamera.scrollOffset;

    const introCamX = introX + offX * offsetScale;
    const introCamY = introY + offY * offsetScale;
    const introCamZ = introZ + offZ * offsetScale;

    const follow = introCamera.targetFollow;
    const introLookX = introTX + offX * offsetScale * follow;
    const introLookY = introTY + offY * offsetScale * follow;
    const introLookZ = introTZ + offZ * offsetScale * follow;

    let camX = introCamX;
    let camY = introCamY;
    let camZ = introCamZ;
    let lookX = introLookX;
    let lookY = introLookY;
    let lookZ = introLookZ;

    if (introHandoffProgress > 0) {
      const eased = easeInOutCubic(clamp01(introHandoffProgress));
      const [baseX, baseY, baseZ] = CAMERA_CONFIG.initialCamera.position;
      const [baseTX, baseTY, baseTZ] = CAMERA_CONFIG.initialCamera.target;

      camX = introCamX + (baseX - introCamX) * eased;
      camY = introCamY + (baseY - introCamY) * eased;
      camZ = introCamZ + (baseZ - introCamZ) * eased;
      lookX = introLookX + (baseTX - introLookX) * eased;
      lookY = introLookY + (baseTY - introLookY) * eased;
      lookZ = introLookZ + (baseTZ - introLookZ) * eased;
    }

    state.camera.position.set(camX, camY, camZ);
    state.camera.lookAt(lookX, lookY, lookZ);

    if (controls?.target?.set) {
      controls.target.set(lookX, lookY, lookZ);
      controls.update?.();
    }
  });

  return null;
}
