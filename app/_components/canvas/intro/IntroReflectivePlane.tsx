"use client";

import { MeshReflectorMaterial } from "@react-three/drei";
import { PAGE_BG_COLOR } from "../../../data/theme";

interface IntroReflectivePlaneProps {
  isDarkMode?: boolean;
}

// Pushed the fog further back to hide the horizon line completely
const INTRO_FOG_NEAR = 10;
const INTRO_FOG_FAR = 40;
const INTRO_PLANE_Y = -0.6;

export function IntroReflectivePlane({
  isDarkMode = false,
}: IntroReflectivePlaneProps) {
  const fogColor = isDarkMode ? "#0a0a0a" : PAGE_BG_COLOR;
  // Keep it pure white or whatever your theme needs
  const planeColor = isDarkMode ? "#101010" : "#ffffff";

  return (
    <>
      <fog attach="fog" args={[fogColor, INTRO_FOG_NEAR, INTRO_FOG_FAR]} />
      <mesh rotation-x={-Math.PI / 2} position={[0, INTRO_PLANE_Y, 0]}>
        {/* Made the plane massive so the edges are far beyond the camera view */}
        <planeGeometry args={[500, 500]} />
        <MeshReflectorMaterial
          blur={[0, 0]} // No blur for now, just pure reflection
          resolution={1024} // Standard resolution
          mixBlur={0} // Disabled
          mixStrength={1} // Normal strength
          roughness={0} // Zero roughness makes it a perfect mirror
          color={planeColor}
          metalness={0} // No metalness, let the base color show
          mirror={2} // Force full mirror effect
        />
      </mesh>
    </>
  );
}
