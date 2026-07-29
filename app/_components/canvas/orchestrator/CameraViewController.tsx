"use client";

/**
 * CameraViewController — keeps the camera aimed at the orbit target.
 *
 * SectionZoomCamera lerps the camera's height and the orbit target's height
 * during a section zoom but deliberately never calls controls.update() (that
 * would fight whoever owns the camera), so re-aiming is this controller's job:
 * without it a zoom would slide the view straight up instead of tilting it.
 *
 * The left/right "look around" is NOT done here any more. Orbiting the camera
 * around world Y rolled the tilted page on screen; the slider now turns the
 * page about its own vertical axis instead — see ViewSpinGroup.
 */

import { useFrame } from "@react-three/fiber";
import type { Vector3 } from "three";
import { useFoldStore } from "./ScrollManager";

type OrbitControlsLike = {
  target?: Vector3;
};

export function CameraViewController() {
  useFrame((state) => {
    // The intro owns the camera outright while it is running.
    if (useFoldStore.getState().isIntroActive) return;

    const controls = state.controls as unknown as OrbitControlsLike | undefined;
    if (!controls?.target) return;

    state.camera.lookAt(controls.target);
  });

  return null;
}
