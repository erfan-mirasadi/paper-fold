"use client";

import { useFrame } from "@react-three/fiber";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { useFoldStore } from "./ScrollManager";
import { Vector3 } from "three";
import { CAMERA_CONFIG } from "../../../data/cameraConfig";

const SECTION_ZOOM_TARGETS: Record<
  string,
  { y: number; fov: number; tilt: number }
> = {
  // y: بالا و پایین رفتن دوربین
  // fov: زوم لنز دوربین (مقدار پیش‌فرض 50 است. عدد کمتر = زوم بیشتر)
  // tilt: زاویه دید بالا/پایین (عدد منفی = نگاه به سمت پایین، صفر = نگاه مستقیم)
  s1: { y: 2, fov: 20, tilt: -1.3 },
  s2_top: { y: 1.4, fov: 25, tilt: -1.3 },
  s2_center: { y: 1, fov: 30, tilt: -1.5 },
  s2_bottom: { y: 0.7, fov: 35, tilt: -1.5 },
};

const _camPos = new Vector3();
const _lookTarget = new Vector3();

export function SectionZoomCamera() {
  useFrame((state) => {
    // 1. Only run zoom logic when in paper mode
    const isIntroActive = useFoldStore.getState().isIntroActive;
    if (isIntroActive) return;

    const { phase, isAllSectionsMode, activeSectionId } =
      useElevatedStore.getState();
    const camera = state.camera;
    const controls = state.controls as any;

    // 2. Base camera position and target from config
    const [defX, defY, defZ] = CAMERA_CONFIG.initialCamera.position;
    const [defTX, defTY, defTZ] = CAMERA_CONFIG.initialCamera.target;

    const defFov = CAMERA_CONFIG.initialCamera.fov;

    let targetCamY = defY;
    let targetFov = defFov;
    let lookAtY = defTY;

    // 3. If a section is active and we are NOT in all sections mode, zoom to it
    if (phase === "elevated" && !isAllSectionsMode && activeSectionId) {
      const zoomCoords = SECTION_ZOOM_TARGETS[activeSectionId];
      if (zoomCoords) {
        targetCamY = zoomCoords.y;
        targetFov = zoomCoords.fov;

        // زاویه نگاه دوربین به بالا یا پایین بر اساس tilt
        lookAtY = zoomCoords.y + zoomCoords.tilt;
      }
    }

    // 4. Smoothly interpolate camera position and target
    _camPos.set(defX, targetCamY, defZ); // Z is locked to default!
    _lookTarget.set(defTX, lookAtY, defTZ);

    camera.position.lerp(_camPos, 0.05);

    const currentFov = (camera as any).fov;
    if (currentFov !== undefined) {
      (camera as any).fov += (targetFov - currentFov) * 0.05;
      camera.updateProjectionMatrix();
    }

    if (controls?.target) {
      controls.target.lerp(_lookTarget, 0.05);
      controls.update();
    } else {
      camera.lookAt(_lookTarget);
    }
  });

  return null;
}
