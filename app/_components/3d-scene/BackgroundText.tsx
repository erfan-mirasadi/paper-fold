"use client";
import { Text, Float } from "@react-three/drei";

interface BackgroundTextProps {
  text?: string;
  isDarkMode?: boolean;
}

export function BackgroundText({
  text = "ALAK SURAH",
  isDarkMode = false,
}: BackgroundTextProps) {
  const color = isDarkMode ? "#ffffff" : "#000000";
  const opacity = 0.08;

  return (
    <group position={[-3.9, -1, -3.5]}>
      {/* Main Text Layer */}
      <Text
        fontSize={0.25}
        font="/fonts/FiraSansCondensed-Medium.ttf"
        color={color}
        fillOpacity={opacity}
        anchorX="left"
        anchorY="bottom"
        letterSpacing={0.2}
      >
        {text.toUpperCase()}
      </Text>

      {/* Ghost Layer */}
      <Text
        position={[0.05, -0.05, -0.01]}
        fontSize={0.25}
        font="/fonts/FiraSansCondensed-Medium.ttf"
        color={color}
        fillOpacity={opacity * 0.4}
        anchorX="left"
        anchorY="bottom"
        letterSpacing={0.2}
      >
        {text.toUpperCase()}
      </Text>

      {/* Decorative Underline */}
      <mesh position={[0.85, -0.05, 0]}>
        <planeGeometry args={[1.7, 0.003]} />
        <meshBasicMaterial
          color={color}
          opacity={opacity * 1}
          transparent={true}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
