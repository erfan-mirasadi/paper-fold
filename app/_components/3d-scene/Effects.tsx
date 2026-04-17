"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  // Noise,
  Vignette,
  ToneMapping,
  BrightnessContrast,
  Glitch,
  // DepthOfField,
} from "@react-three/postprocessing";
import { ToneMappingMode, GlitchMode } from "postprocessing";
import { Vector2 } from "three";
// import { useElevatedStore } from "../features/elevated-verses/useElevatedStore";
// import { ELEVATE_CAMERA } from "../features/elevated-verses/useElevateAnimation";

type EffectsProps = {
  glitchTrigger?: number; // Pass a counter from outside to trigger glitch
  brightness?: number;
  contrast?: number;
  noiseOpacity?: number;
  vignetteDarkness?: number;
};

const Effects: React.FC<EffectsProps> = ({
  glitchTrigger = 0,
  brightness = -0.09,
  contrast = 0.2,
  // noiseOpacity = 0.05,
  vignetteDarkness = 0.4,
}) => {
  const [manualActive, setManualActive] = useState(false);
  const lastTriggerRef = useRef(0);
  const activeUntilRef = useRef(0);
  const activeRef = useRef(false);
  // const isElevated = useElevatedStore((s) => s.phase === "elevated");
  // const dofFocusDistance = isElevated ? 0.15 + ELEVATE_CAMERA.focusOffset : 0;
  // const dofBokehScale = isElevated ? ELEVATE_CAMERA.bokehScale : 0;

  useEffect(() => {
    if (!glitchTrigger) return;
    if (lastTriggerRef.current === glitchTrigger) return;
    lastTriggerRef.current = glitchTrigger;
    activeUntilRef.current = performance.now() + 300;
  }, [glitchTrigger]);

  useFrame(() => {
    const shouldBeActive = performance.now() < activeUntilRef.current;
    if (shouldBeActive !== activeRef.current) {
      activeRef.current = shouldBeActive;
      setManualActive(shouldBeActive);
    }
  });

  return (
    <EffectComposer multisampling={5} enableNormalPass={false}>
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <BrightnessContrast brightness={brightness} contrast={contrast} />
      {/* <Noise opacity={noiseOpacity} /> */}
      <Vignette eskil={false} offset={0.2} darkness={vignetteDarkness} />

      {/* <DepthOfField
        focusDistance={dofFocusDistance}
        focalLength={15}
        bokehScale={dofBokehScale}
      /> */}
      <Glitch
        active={manualActive}
        mode={GlitchMode.CONSTANT_WILD}
        delay={new Vector2(0, 0)}
        duration={new Vector2(0.1, 0.2)}
        strength={new Vector2(0.01, 0.05)} // Back to the strength you liked
        columns={0.001} // Makes the glitch lines extremely thin and fine
        dtSize={100} // High resolution noise for smaller glitch bits
        ratio={0.1}
      />
    </EffectComposer>
  );
};

export default memo(Effects);
