"use client";

import { useFrame } from "@react-three/fiber";
import { useCameraStore } from "../../../stores/useCameraStore";
import { useFoldStore } from "./ScrollManager";
import { CAMERA_CONFIG } from "../../../data/cameraConfig";
import { ALAK_LAYOUT_CONFIG } from "../../../data/SurahConfig";

type OrbitControlsLike = {
  target?: {
    x: number;
    y: number;
    z: number;
    set: (x: number, y: number, z: number) => void;
  };
  update?: () => void;
};

const easeInOutCubic = (t: number): number => {
  if (t < 0.5) return 4 * t * t * t;
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

export function IntroCameraScrollController() {
  useFrame((state) => {
    if (useCameraStore.getState().phase !== "idle") return;

    const { isIntroActive, introProgress, introHandoffProgress } =
      useFoldStore.getState();

    if (!isIntroActive) return;

    const { introCamera } = ALAK_LAYOUT_CONFIG.animations;
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
