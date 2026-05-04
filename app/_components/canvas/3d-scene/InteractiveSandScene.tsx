"use client";

import React, { useEffect, useMemo, useRef, Suspense, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import SandParticles from "./SandParticles"; // Make sure the path is correct based on your folder structure

interface SandPlaneProps {
  bgTexture: THREE.Texture;
  normalTexture: THREE.Texture;
  onExitTrigger: () => void;
}

interface SceneContentProps {
  onReady?: () => void;
  particlesActive?: boolean;
}

function InteractiveSandShader({
  bgTexture,
  normalTexture,
  onExitTrigger,
}: SandPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size, mouse } = useThree();

  // Create a 2D canvas in memory.
  const canvasSize = 512;
  const { ctx, trailTexture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = canvasSize;
    c.height = canvasSize;
    const context = c.getContext("2d");

    if (context) {
      context.fillStyle = "black";
      context.fillRect(0, 0, canvasSize, canvasSize);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    return { ctx: context, trailTexture: tex };
  }, []);

  const prevMouse = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (!ctx) return;

    // Fade the existing canvas slowly to fill the grooves over time
    ctx.fillStyle = "rgba(0, 0, 0, 0.015)";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    const targetX = ((mouse.x + 1) / 2) * canvasSize;
    const targetY = ((1 - mouse.y) / 2) * canvasSize;

    const dx = targetX - prevMouse.current.x;
    const dy = targetY - prevMouse.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.1) {
      const brushSize = canvasSize * 0.035;
      const steps = Math.min(12, Math.ceil(distance / 5));
      for (let i = 1; i <= steps; i += 1) {
        const t = i / steps;
        const x = prevMouse.current.x + dx * t;
        const y = prevMouse.current.y + dy * t;

        // Use a much softer alpha so we don't get harsh white spots in the shader
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, brushSize);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    prevMouse.current.x = targetX;
    prevMouse.current.y = targetY;

    trailTexture.needsUpdate = true;
  });

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: bgTexture },
        uNormalMap: { value: normalTexture },
        uTrail: { value: trailTexture },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
      },
      vertexShader: `
        uniform sampler2D uTrail;
        varying vec2 vUv;

        void main() {
          vUv = uv;
          
          // Read trail to gently push the vertices down
          float trail = texture2D(uTrail, uv).r;

          vec3 pos = position;
          pos.z -= trail * 0.15; 

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform sampler2D uTrail;
        varying vec2 vUv;

        void main() {
          float tC = texture2D(uTrail, vUv).r;

          // Epsilon for sampling neighbors
          float e = 0.004;
          float tL = texture2D(uTrail, vUv - vec2(e, 0.0)).r;
          float tR = texture2D(uTrail, vUv + vec2(e, 0.0)).r;
          float tU = texture2D(uTrail, vUv + vec2(0.0, e)).r;
          float tD = texture2D(uTrail, vUv - vec2(0.0, e)).r;

          // Calculate slopes
          float slopeX = tR - tL;
          float slopeY = tU - tD;

          // Distort UVs gently based on the trail slope (Refraction)
          vec2 distortedUv = vUv - vec2(slopeX, slopeY) * 0.04;
          
          // Sample the EXACT original texture
          vec4 baseColor = texture2D(uTexture, distortedUv);

          // If no trail is here, render the raw image to guarantee 0% color loss
          if (tC < 0.001) {
              gl_FragColor = baseColor;
              // CRITICAL: Convert output back to sRGB to fix the dark overlay issue!
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
              return;
          }

          // Fake a directional shadow from Top-Left without adding raw white color
          // We multiply the original texture color instead of adding to it
          float shade = (slopeX * -1.0 + slopeY * 1.0) * 1.8;
          
          // Ambient occlusion to darken the deep parts of the groove slightly
          float ao = 1.0 - (tC * 0.25);

          // Apply purely via multiplication
          vec3 finalColor = baseColor.rgb * (1.0 + shade) * ao;

          gl_FragColor = vec4(finalColor, 1.0);
          
          // CRITICAL: Fixes the dark overlay issue
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      transparent: false,
    });
  }, [bgTexture, normalTexture, trailTexture, size]);

  return (
    <mesh ref={meshRef} onClick={onExitTrigger}>
      <planeGeometry args={[viewport.width, viewport.height, 256, 256]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}

function SceneContent({ onReady, particlesActive }: SceneContentProps) {
  const [bgTexture, normalTexture] = useTexture([
    "/intro/sand-texture.jpg",
    "/intro/sand-normal.png",
  ]);

  bgTexture.wrapS = THREE.RepeatWrapping;
  bgTexture.wrapT = THREE.RepeatWrapping;
  bgTexture.colorSpace = THREE.SRGBColorSpace;

  normalTexture.wrapS = THREE.RepeatWrapping;
  normalTexture.wrapT = THREE.RepeatWrapping;

  // Manage exit state
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <>
      <ambientLight intensity={1.0} />
      <InteractiveSandShader
        bgTexture={bgTexture}
        normalTexture={normalTexture}
        onExitTrigger={() => setIsExiting(true)}
      />
      {/* Pass the exit state to the particles */}
      <SandParticles isExiting={isExiting} isActive={particlesActive} />
    </>
  );
}

interface InteractiveSandSceneProps {
  onReady?: () => void;
  particlesActive?: boolean;
}

export default function InteractiveSandScene({
  onReady,
  particlesActive = true,
}: InteractiveSandSceneProps) {
  return (
    <Suspense fallback={null}>
      <SceneContent onReady={onReady} particlesActive={particlesActive} />
    </Suspense>
  );
}
