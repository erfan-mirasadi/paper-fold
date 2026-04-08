"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export const AnimatedArrow = ({
  outerTipX,
  innerTipX,
  outerYTop,
  innerYTop,
  outerControlX,
  innerControlX,
  outerYBot,
  innerYBot,
  color,
  delay = 0,
  speed = 0.0005, // Speed of the animation
  arrowSize = 0.008, // Base size of the core dot
  floatIntensity = 0.008, // Amplitude of the floating/wobbling effect
  glowSize = 4, // Multiplier for the glow plane size relative to arrowSize
}: {
  outerTipX: number;
  innerTipX: number;
  outerYTop: number;
  innerYTop: number;
  outerControlX: number;
  innerControlX: number;
  outerYBot: number;
  innerYBot: number;
  color: string;
  delay?: number;
  speed?: number;
  arrowSize?: number;
  floatIntensity?: number;
  glowSize?: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const centerCurve = useMemo(
    () =>
      new THREE.CubicBezierCurve3(
        new THREE.Vector3(
          (outerTipX + innerTipX) / 2,
          (outerYTop + innerYTop) / 2,
          0,
        ),
        new THREE.Vector3(
          (outerControlX + innerControlX) / 2,
          (outerYTop + innerYTop) / 2,
          0,
        ),
        new THREE.Vector3(
          (outerControlX + innerControlX) / 2,
          (outerYBot + innerYBot) / 2,
          0,
        ),
        new THREE.Vector3(
          (outerTipX + innerTipX) / 2,
          (outerYBot + innerYBot) / 2,
          0,
        ),
      ),
    [
      outerTipX,
      innerTipX,
      outerControlX,
      innerControlX,
      outerYTop,
      innerYTop,
      outerYBot,
      innerYBot,
    ],
  );

  // The WebGL Trick: Creating a soft radial gradient texture using an offscreen 2D canvas
  const glowTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      // Core is solid white, fading out softly to transparent
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame((state) => {
    if (
      !groupRef.current ||
      !coreMaterialRef.current ||
      !glowMaterialRef.current
    )
      return;

    // Create a continuous forward loop with delay
    const time = state.clock.elapsedTime * speed + delay;
    const t = time - Math.floor(time); // Value between 0 and 1

    // Get position and tangent for current t
    const position = centerCurve.getPoint(t);
    const tangent = centerCurve.getTangent(t);

    // Floating/wobbling effect logic
    // Calculate the normal vector (orthogonal to the tangent) for natural hovering
    const floatFrequency = 3.0; // How fast it wobbles (kept static, but can be a prop too)
    const floatOffset =
      Math.sin(state.clock.elapsedTime * floatFrequency + delay) *
      floatIntensity;

    const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
    position.add(normal.multiplyScalar(floatOffset));

    // Add a slight local Z offset to appear slightly in front of the curve lines
    position.z = 0.0003;

    groupRef.current.position.copy(position);

    // Calculate rotation to face the direction of the curve
    const angle = Math.atan2(tangent.y, tangent.x);
    groupRef.current.rotation.z = angle - Math.PI / 2;

    // Smooth fade in and out at the edges of the curve
    let opacity = 1;
    const fadeEdges = 0.15;
    if (t < fadeEdges) {
      opacity = t / fadeEdges;
    } else if (t > 1 - fadeEdges) {
      opacity = (1 - t) / fadeEdges;
    }

    // Apply opacity (fade the glow slightly more than the core)
    coreMaterialRef.current.opacity = opacity;
    glowMaterialRef.current.opacity = opacity * 0.8;

    // Add a pulsing effect to the scale
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 5 + delay) * 0.15;
    groupRef.current.scale.set(pulse, pulse, 1);
  });

  return (
    <group ref={groupRef} renderOrder={1002}>
      {/* Soft Glow Layer */}
      <mesh renderOrder={1001}>
        {/* Glow size is dynamically controlled by arrowSize * glowSize */}
        <planeGeometry args={[arrowSize * glowSize, arrowSize * glowSize]} />
        <meshBasicMaterial
          ref={glowMaterialRef}
          map={glowTexture}
          color={color} // Taking color from props
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Core Solid Ball */}
      <mesh renderOrder={1002}>
        <circleGeometry args={[arrowSize * 0.6, 32]} />
        <meshBasicMaterial
          ref={coreMaterialRef}
          color={color} // Taking color from props
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
