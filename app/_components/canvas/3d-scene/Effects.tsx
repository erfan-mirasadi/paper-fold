"use client";

import { memo, useEffect, useRef, useState, FC } from "react";
import { useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  BrightnessContrast,
  Glitch,
} from "@react-three/postprocessing";
import { GlitchMode } from "postprocessing";
import { HalfFloatType, Vector2 } from "three";

type EffectsProps = {
  glitchTrigger?: number;
  brightness?: number;
  contrast?: number;
  noiseOpacity?: number;
  vignetteDarkness?: number;
};

const Effects: FC<EffectsProps> = ({
  glitchTrigger = 0,
  brightness = -0.1,
  contrast = 0.1,
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
    <EffectComposer
      enableNormalPass={false}
      frameBufferType={HalfFloatType}
      multisampling={0}
    >
      <Bloom
        intensity={0.5}
        luminanceThreshold={1}
        luminanceSmoothing={0.1}
        mipmapBlur
      />
      <BrightnessContrast brightness={brightness} contrast={contrast} />
      <Glitch
        active={manualActive}
        mode={GlitchMode.CONSTANT_WILD}
        delay={new Vector2(0, 0)}
        duration={new Vector2(0.1, 0.2)}
        strength={new Vector2(0.01, 0.05)}
        columns={0.001}
        dtSize={100}
        ratio={0.1}
      />
    </EffectComposer>
  );
};

export default memo(Effects);
