"use client";
import { IntroReflectivePlane } from "./IntroReflectivePlane";
import { SvgParticles } from "./SvgParticles";

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
      <SvgParticles
        svgUrl="/logo.svg"
        scale={0.005}
        position={[1, 1.7, 1.23]}
        rotation={[0, -1, 0]}
        isDarkMode={isDarkMode}
      />
    </group>
  );
}
