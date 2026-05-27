"use client";
// import { IntroReflectivePlane } from "./IntroReflectivePlane";

import { useEffect, useRef } from "react";
import { useFoldStore } from "../orchestrator/ScrollManager";
import * as THREE from "three";

interface IntroExperienceProps {
  isDarkMode?: boolean;
}

export function IntroExperience({
  isDarkMode,
}: IntroExperienceProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const updateVisibility = (isActive: boolean) => {
      if (groupRef.current) {
        groupRef.current.visible = isActive;
      }
    };

    const unsubscribe = useFoldStore.subscribe((state, prevState) => {
      if (state.isIntroActive !== prevState.isIntroActive) {
        updateVisibility(state.isIntroActive);
      }
    });

    updateVisibility(useFoldStore.getState().isIntroActive);

    return unsubscribe;
  }, []);

  return (
    <group ref={groupRef} name="intro-scene">
      {/* <IntroReflectivePlane isDarkMode={isDarkMode} /> */}
    </group>
  );
}
