"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type BackgroundParticlesDesktopProps = {
  isDarkMode: boolean;
  yOffset?: number;
  zOffset?: number;
};

const pseudoRandom = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return x - Math.floor(x);
};
// Top-level tweakable distance constants — change these to move particles farther away
export const Z_SETTINGS = {
  // positive value: particles' base shift away along -Z axis (increase to go further away)
  BASE_Z_OFFSET: 3,
  // multiplies the existing CONFIG.DEPTH to increase spread in Z
  DEPTH_MULTIPLIER: 0.06,
  // amplitude of the Z twinkle / oscillation
  TWINKLE_AMPLITUDE: 0.12,
  // moves the entire particle system forward/backward as one group
  GROUP_Z_OFFSET: 0,
};

// vertical offset default (world units). Increase to move particle field up.
export const Y_SETTINGS = {
  DEFAULT_OFFSET: -2.8,
};

const CONFIG = {
  COUNT: 380,
  COLOR: "#d4af37",
  OPACITY_LIGHT: 0.82,
  OPACITY_DARK: 0.7,
  SIZE: 0.032,
  SIZE_LIGHT: 0.045,
  SPREAD_FACTOR: 3.5,
  DEPTH: 228,
  FLOAT_SPEED: 0.015,
  FLOAT_AMPLITUDE: 0.001,
  HOVER_SMOOTHNESS: 0.08,
  HOVER_RADIUS: 3.6,
  HOVER_STRENGTH: 0.55,
};

export default function BackgroundParticlesDesktop({
  isDarkMode,
  yOffset = 0,
  zOffset = 0,
}: BackgroundParticlesDesktopProps) {
  const pointsRef = useRef<THREE.Points | null>(null);
  const smoothPointer = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  const { positions, randoms, initialPositions } = useMemo(() => {
    const pos = new Float32Array(CONFIG.COUNT * 3);
    const initPos = new Float32Array(CONFIG.COUNT * 3);
    const rnd = new Float32Array(CONFIG.COUNT * 3);
    const baseSeed = viewport.width * 1000 + viewport.height * 100;

    for (let i = 0; i < CONFIG.COUNT; i++) {
      const i3 = i * 3;
      const rx = pseudoRandom(baseSeed + i3 + 1);
      const ry = pseudoRandom(baseSeed + i3 + 2);
      const rz = pseudoRandom(baseSeed + i3 + 3);

      const x = (rx - 0.5) * viewport.width * CONFIG.SPREAD_FACTOR;
      const y = (ry - 0.5) * viewport.height * CONFIG.SPREAD_FACTOR;
      const z =
        -Z_SETTINGS.BASE_Z_OFFSET -
        rz * (CONFIG.DEPTH * Z_SETTINGS.DEPTH_MULTIPLIER);

      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;

      initPos[i3] = x;
      initPos[i3 + 1] = y;
      initPos[i3 + 2] = z;

      rnd[i3] = pseudoRandom(baseSeed + i3 + 11);
      rnd[i3 + 1] = pseudoRandom(baseSeed + i3 + 12);
      rnd[i3 + 2] = pseudoRandom(baseSeed + i3 + 13);
    }

    return { positions: pos, initialPositions: initPos, randoms: rnd };
  }, [viewport.width, viewport.height]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positionsAttr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const array = positionsAttr.array as Float32Array;
    const time = state.clock.getElapsedTime();

    const targetX = state.pointer.x * (viewport.width / 2);
    const targetY = state.pointer.y * (viewport.height / 2);

    smoothPointer.current.x = THREE.MathUtils.lerp(
      smoothPointer.current.x,
      targetX,
      CONFIG.HOVER_SMOOTHNESS,
    );
    smoothPointer.current.y = THREE.MathUtils.lerp(
      smoothPointer.current.y,
      targetY,
      CONFIG.HOVER_SMOOTHNESS,
    );

    const hoverRadiusSq = CONFIG.HOVER_RADIUS * CONFIG.HOVER_RADIUS;

    for (let i = 0; i < CONFIG.COUNT; i++) {
      const i3 = i * 3;
      const ix = initialPositions[i3];
      const iy = initialPositions[i3 + 1];
      const iz = initialPositions[i3 + 2];

      const speed = CONFIG.FLOAT_SPEED + randoms[i3] * 0.4;
      const phase = randoms[i3 + 2] * 10;

      const floatX = Math.sin(time * speed + phase) * CONFIG.FLOAT_AMPLITUDE;
      const floatY =
        Math.cos(time * speed * 0.75 + phase) * CONFIG.FLOAT_AMPLITUDE;

      const dx = ix - smoothPointer.current.x;
      const dy = iy - smoothPointer.current.y;
      const distSq = dx * dx + dy * dy;

      let pushX = 0;
      let pushY = 0;

      if (distSq < hoverRadiusSq) {
        const force =
          ((hoverRadiusSq - distSq) / hoverRadiusSq) * CONFIG.HOVER_STRENGTH;
        pushX = dx * force;
        pushY = dy * force;
      }

      array[i3] = ix + floatX + pushX;
      array[i3 + 1] = iy + floatY + pushY;
      array[i3 + 2] =
        iz + Math.sin(time * 1.45 + phase) * Z_SETTINGS.TWINKLE_AMPLITUDE;
    }

    positionsAttr.needsUpdate = true;
  });
  const particleColor = isDarkMode ? CONFIG.COLOR : "#1a1a1a";

  return (
    <points
      ref={pointsRef}
      position={[
        0,
        yOffset + Y_SETTINGS.DEFAULT_OFFSET,
        zOffset + Z_SETTINGS.GROUP_Z_OFFSET,
      ]}
    >
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isDarkMode ? CONFIG.SIZE : CONFIG.SIZE_LIGHT}
        color={particleColor}
        transparent
        opacity={isDarkMode ? CONFIG.OPACITY_DARK : CONFIG.OPACITY_LIGHT}
        sizeAttenuation
        depthWrite={false}
        blending={isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}
