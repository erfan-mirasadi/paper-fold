"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
  BrightnessContrast,
  Glitch,
} from "@react-three/postprocessing";
import { ToneMappingMode, GlitchMode } from "postprocessing";
import { Vector2 } from "three";

type EffectsProps = {
  glitchTrigger?: number;
  brightness?: number;
  contrast?: number;
  noiseOpacity?: number;
  vignetteDarkness?: number;
};

const Effects: React.FC<EffectsProps> = ({
  glitchTrigger = 0,
  brightness = -0.09,
  contrast = 0.23,
  vignetteDarkness = 0.4,
}) => {
  const [manualActive, setManualActive] = useState(false);
  const lastTriggerRef = useRef(0);
  const activeUntilRef = useRef(0);
  const activeRef = useRef(false);

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
      <Bloom
        intensity={2.85}
        luminanceThreshold={1.5}
        luminanceSmoothing={0}
        mipmapBlur
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <BrightnessContrast brightness={brightness} contrast={contrast} />
      {/* <Vignette eskil={false} offset={0.2} darkness={vignetteDarkness} /> */}
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
