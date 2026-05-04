"use client";
import { IntroReflectivePlane } from "./IntroReflectivePlane";

interface IntroExperienceProps {
  isIntroActive: boolean;
  isDarkMode: boolean;
}
export function IntroExperience({
  isIntroActive,
  isDarkMode,
}: IntroExperienceProps) {
  return (
    <group name="intro-scene" visible={isIntroActive}>
      <IntroReflectivePlane isDarkMode={isDarkMode} />
    </group>
  );
}
