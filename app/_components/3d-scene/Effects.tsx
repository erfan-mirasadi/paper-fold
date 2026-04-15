"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import {
  EffectComposer,
  // Noise,
  Vignette,
  ToneMapping,
  BrightnessContrast,
  Glitch,
} from "@react-three/postprocessing";
import { ToneMappingMode, GlitchMode } from "postprocessing";
import { Vector2 } from "three";

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

  useEffect(() => {
    if (!glitchTrigger) return;
    if (lastTriggerRef.current === glitchTrigger) return;
    lastTriggerRef.current = glitchTrigger;
    setManualActive(true);
    const t = setTimeout(() => setManualActive(false), 300);
    return () => clearTimeout(t);
  }, [glitchTrigger]);

  return (
    <EffectComposer multisampling={5} enableNormalPass={false}>
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <BrightnessContrast brightness={brightness} contrast={contrast} />
      {/* <Noise opacity={noiseOpacity} /> */}
      <Vignette eskil={false} offset={0.2} darkness={vignetteDarkness} />

      {/* 
        - active={manualActive} is the clean way to toggle without TS conditional render errors.
        - dtSize and columns make the glitch blocks themselves much finer/thinner (riiz tar)! 
      */}
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
