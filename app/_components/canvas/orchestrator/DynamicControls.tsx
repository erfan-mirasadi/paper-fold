"use client";

/**
 * DynamicControls — the app's OrbitControls, extracted from Experience so it
 * can be mounted OUTSIDE the paper-keyed scene subtree. Together with the
 * persistent PerspectiveCamera this keeps the user's camera orientation
 * completely untouched across in-page paper switches.
 */

import { OrbitControls } from "@react-three/drei";
import { CAMERA_CONFIG } from "../../../data/cameraConfig";
import { useFoldStore } from "./ScrollManager";
import { useStoryStore } from "../../../stores/useStoryStore";

export function DynamicControls() {
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  const config = useStoryStore((state) => state.activeConfig);

  const enableInteractions = isIntroActive
    ? (config.animations.introCamera?.allowOrbit ?? false)
    : false;

  const minAzimuthAngle = isIntroActive
    ? -Infinity
    : CAMERA_CONFIG.orbitControls.minAzimuthAngle;
  const maxAzimuthAngle = isIntroActive
    ? Infinity
    : CAMERA_CONFIG.orbitControls.maxAzimuthAngle;
  const minPolarAngle = isIntroActive
    ? 0
    : CAMERA_CONFIG.orbitControls.minPolarAngle;
  const maxPolarAngle = isIntroActive
    ? Math.PI
    : CAMERA_CONFIG.orbitControls.maxPolarAngle;

  return (
    <OrbitControls
      enabled={enableInteractions}
      makeDefault={true}
      enableRotate={enableInteractions}
      enableZoom={enableInteractions}
      enablePan={enableInteractions}
      minAzimuthAngle={minAzimuthAngle}
      maxAzimuthAngle={maxAzimuthAngle}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
    />
  );
}
