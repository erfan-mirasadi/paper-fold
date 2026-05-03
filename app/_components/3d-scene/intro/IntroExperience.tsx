"use client";
import { IntroReflectivePlane } from "./IntroReflectivePlane";

interface IntroExperienceProps {
  isIntroActive: boolean;
  isDarkMode: boolean;
}

// Dedicated component for all Intro logic and objects
// ADD ALL INTRO ANIMATIONS AND OBJECTS HERE
// You can use useFrame, useSpring, or GSAP specifically for the intro
export function IntroExperience({
  isIntroActive,
  isDarkMode,
}: IntroExperienceProps) {
  // If the intro is not active, we unmount everything inside to save performance
  if (!isIntroActive) return null;

  return (
    <group name="intro-scene">
      <IntroReflectivePlane isDarkMode={isDarkMode} />
      {/* Add your crazy intro particles, texts, and custom meshes here! */}
    </group>
  );
}
