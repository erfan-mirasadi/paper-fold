"use client";

import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 1200; // Boosted for a heavier storm effect
const PLANE_Z = 0;
const INTRO_COLOR = [0.92, 0.78, 0.55] as const;
const MOUSE_COLOR = [0.45, 0.24, 0.16] as const;

interface SandParticlesProps {
  isExiting?: boolean;

  isActive?: boolean;
}

export default function SandParticles({
  isExiting = false,
  isActive = true,
}: SandParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera, mouse, viewport, gl } = useThree();

  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const positions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const velocities = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const colors = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const sizes = useMemo(() => new Float32Array(PARTICLE_COUNT), []);
  const baseSizes = useMemo(() => new Float32Array(PARTICLE_COUNT), []);
  const alphas = useMemo(() => new Float32Array(PARTICLE_COUNT), []);
  const life = useMemo(() => new Float32Array(PARTICLE_COUNT), []);
  const age = useMemo(() => new Float32Array(PARTICLE_COUNT), []);

  const cursor = useRef(0);
  const spawnCarry = useRef(0);
  const prevMouse = useRef({ x: 0, y: 0 });

  // Timer for the initial wind effect
  const windTimer = useRef(3.0);

  const rayOrigin = useMemo(() => new THREE.Vector3(), []);
  const rayDir = useMemo(() => new THREE.Vector3(), []);
  const mouseWorld = useMemo(() => new THREE.Vector3(), []);

  useMemo(() => {
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const i3 = i * 3;
      colors[i3] = INTRO_COLOR[0];
      colors[i3 + 1] = INTRO_COLOR[1];
      colors[i3 + 2] = INTRO_COLOR[2];
      baseSizes[i] = 10 + Math.random() * 8;
      sizes[i] = baseSizes[i];
      alphas[i] = 0;
      life[i] = 0;
      age[i] = 1;
    }
  }, [geometry, positions, colors, sizes, alphas, baseSizes, life, age]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: 1 },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aAlpha;
        attribute vec3 aColor;
        uniform float uPixelRatio;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = aColor;
          vAlpha = aAlpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio * (1.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float d = length(coord);
          float alpha = smoothstep(0.5, 0.0, d) * min(1.0, vAlpha * 1.5);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, []);

  useFrame((_, delta) => {
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();

    if (!isActive) {
      return;
    }

    // EXTREME STORM for exiting
    if (isExiting) {
      const exitSpawnRate = 40;
      for (let w = 0; w < exitSpawnRate; w++) {
        const i = cursor.current;
        const i3 = i * 3;

        positions[i3] = (Math.random() - 0.5) * viewport.width * 1.5;
        positions[i3 + 1] = (Math.random() - 0.5) * viewport.height * 1.5;
        positions[i3 + 2] = 0.1 + Math.random() * 0.5;

        // Forceful wind to the right and slightly up
        velocities[i3] = 0.8 + Math.random() * 0.5;
        velocities[i3 + 1] = 0.2 + (Math.random() - 0.5) * 0.2;
        velocities[i3 + 2] = Math.random() * 0.1;

        life[i] = 2.0;
        age[i] = 0;
        alphas[i] = 1;
        sizes[i] = baseSizes[i] * 1.2;

        cursor.current = (i + 1) % PARTICLE_COUNT;
      }
    }
    // Normal Intro Wind
    else if (windTimer.current > 0) {
      windTimer.current -= delta;

      const windSpawnRate = 24;
      for (let w = 0; w < windSpawnRate; w++) {
        const i = cursor.current;
        const i3 = i * 3;

        positions[i3] = (Math.random() - 0.5) * viewport.width * 1.5;
        positions[i3 + 1] = (Math.random() - 0.5) * viewport.height * 1.5;
        positions[i3 + 2] = 0.1 + Math.random() * 0.3;

        colors[i3] = INTRO_COLOR[0];
        colors[i3 + 1] = INTRO_COLOR[1];
        colors[i3 + 2] = INTRO_COLOR[2];

        velocities[i3] = -0.15 + (Math.random() - 0.5) * 0.1;
        velocities[i3 + 1] = -0.1 + (Math.random() - 0.5) * 0.1;
        velocities[i3 + 2] = -(0.01 + Math.random() * 0.03);

        life[i] = 2.5 + Math.random() * 2.5;
        age[i] = 0;
        alphas[i] = 1;
        sizes[i] = baseSizes[i] * 0.9;

        cursor.current = (i + 1) % PARTICLE_COUNT;
      }
    }

    // Normal Mouse Trail Effect (disabled if exiting)
    if (!isExiting) {
      const dx = mouse.x - prevMouse.current.x;
      const dy = mouse.y - prevMouse.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      prevMouse.current.x = mouse.x;
      prevMouse.current.y = mouse.y;

      if (speed > 0.001) {
        rayOrigin.copy(camera.position);
        mouseWorld.set(mouse.x, mouse.y, 0.5).unproject(camera);
        rayDir.copy(mouseWorld).sub(rayOrigin).normalize();

        if (Math.abs(rayDir.z) > 0.0001) {
          const t = (PLANE_Z - rayOrigin.z) / rayDir.z;
          if (t > 0) {
            mouseWorld.copy(rayOrigin).add(rayDir.multiplyScalar(t));

            const scatter = Math.min(viewport.width, viewport.height) * 0.025;
            spawnCarry.current += Math.min(8, speed * 600);

            while (spawnCarry.current >= 1) {
              spawnCarry.current -= 1;

              const i = cursor.current;
              const i3 = i * 3;

              positions[i3] = mouseWorld.x + (Math.random() - 0.5) * scatter;
              positions[i3 + 1] =
                mouseWorld.y + (Math.random() - 0.5) * scatter;
              positions[i3 + 2] = 0.02 + Math.random() * 0.04;

              colors[i3] = MOUSE_COLOR[0];
              colors[i3 + 1] = MOUSE_COLOR[1];
              colors[i3 + 2] = MOUSE_COLOR[2];

              velocities[i3] = (Math.random() - 0.5) * 0.06;
              velocities[i3 + 1] = -(0.06 + Math.random() * 0.1);
              velocities[i3 + 2] = -(0.02 + Math.random() * 0.04);

              life[i] = 1.8 + Math.random() * 1.8;
              age[i] = 0;
              alphas[i] = 1;
              sizes[i] = baseSizes[i];

              cursor.current = (i + 1) % PARTICLE_COUNT;

              if (cursor.current === 0) {
                break;
              }
            }
          }
        }
      }
    }

    // Update Particle Physics
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      if (age[i] >= life[i]) {
        alphas[i] = 0;
        continue;
      }

      age[i] += delta;
      if (age[i] >= life[i]) {
        alphas[i] = 0;
        continue;
      }

      const i3 = i * 3;

      // If exiting, particles fly straight. Otherwise, they fall normally.
      if (!isExiting) {
        velocities[i3 + 1] -= 0.45 * delta; // Gravity
        velocities[i3] *= 0.985; // Friction
        velocities[i3 + 1] *= 0.985;
        velocities[i3 + 2] *= 0.985;
      }

      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;

      const t = 1 - age[i] / life[i];
      const eased = t * t;
      alphas[i] = Math.min(1, eased * 1.9);
      sizes[i] = baseSizes[i] * (0.7 + eased * 0.6);
    }

    const positionAttr = geometry.getAttribute("position");
    const alphaAttr = geometry.getAttribute("aAlpha");
    const colorAttr = geometry.getAttribute("aColor");
    const sizeAttr = geometry.getAttribute("aSize");

    positionAttr.needsUpdate = true;
    alphaAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </points>
  );
}
