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
  speed = 0.0005, // Speed of the animation along the path
  arrowSize = 0.008, // Base size of the core star dot
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
  const innerGroupRef = useRef<THREE.Group>(null); // New group to handle the subtle spin of all components
  const flareRef = useRef<THREE.Mesh>(null);

  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const outerGlowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const flareMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const shadowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const darkHaloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  // --- INTERNAL VISUAL TUNING ---
  // Adjust these values to fine-tune the look without changing props
  const SHADOW_OPACITY = 0.1; // Scale of 0 to 1 for the drop shadow
  const CONTRAST_BOOST = 0.65; // Scale of 0 to 1 for the dark halo that makes the glow pop
  const GLOW_STRENGTH = 1.0; // Multiplier for the main light layers
  // ------------------------------

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

  // The WebGL Trick: Creating advanced multi-layered textures for a powerful star-like glow
  const { glowTexture, flareTexture, shadowTexture } = useMemo(() => {
    // 1. Soft Radial Glow Canvas
    const gCanvas = document.createElement("canvas");
    gCanvas.width = 128;
    gCanvas.height = 128;
    const gCtx = gCanvas.getContext("2d");
    if (gCtx) {
      const gradient = gCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      gCtx.fillStyle = gradient;
      gCtx.fillRect(0, 0, 128, 128);
    }
    const gTex = new THREE.CanvasTexture(gCanvas);
    gTex.needsUpdate = true;

    // 2. Star Flare Canvas
    const fCanvas = document.createElement("canvas");
    fCanvas.width = 128;
    fCanvas.height = 128;
    const fCtx = fCanvas.getContext("2d");
    if (fCtx) {
      // Horizontal Streak
      const gradH = fCtx.createLinearGradient(0, 64, 128, 64);
      gradH.addColorStop(0, "rgba(255,255,255,0)");
      gradH.addColorStop(0.48, "rgba(255,255,255,0.95)");
      gradH.addColorStop(0.5, "rgba(255,255,255,1)");
      gradH.addColorStop(0.52, "rgba(255,255,255,0.95)");
      gradH.addColorStop(1, "rgba(255,255,255,0)");
      fCtx.fillStyle = gradH;
      fCtx.fillRect(0, 62, 128, 4);

      // Vertical Streak
      const gradV = fCtx.createLinearGradient(64, 0, 64, 128);
      gradV.addColorStop(0, "rgba(255,255,255,0)");
      gradV.addColorStop(0.48, "rgba(255,255,255,0.95)");
      gradV.addColorStop(0.5, "rgba(255,255,255,1)");
      gradV.addColorStop(0.52, "rgba(255,255,255,0.95)");
      gradV.addColorStop(1, "rgba(255,255,255,0)");
      fCtx.fillStyle = gradV;
      fCtx.fillRect(62, 0, 4, 128);
    }
    const fTex = new THREE.CanvasTexture(fCanvas);
    fTex.needsUpdate = true;

    // 3. Shadow/Dark Halo Canvas (Inverse Radial for contrast)
    const sCanvas = document.createElement("canvas");
    sCanvas.width = 128;
    sCanvas.height = 128;
    const sCtx = sCanvas.getContext("2d");
    if (sCtx) {
      const gradient = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
      gradient.addColorStop(0.4, "rgba(0, 0, 0, 0.6)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      sCtx.fillStyle = gradient;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const sTex = new THREE.CanvasTexture(sCanvas);
    sTex.needsUpdate = true;

    return { glowTexture: gTex, flareTexture: fTex, shadowTexture: sTex };
  }, []);

  useFrame((state) => {
    if (
      !groupRef.current ||
      !innerGroupRef.current ||
      !flareRef.current ||
      !coreMaterialRef.current ||
      !glowMaterialRef.current ||
      !outerGlowMaterialRef.current ||
      !flareMaterialRef.current ||
      !shadowMaterialRef.current ||
      !darkHaloMaterialRef.current
    )
      return;

    const time = state.clock.elapsedTime * speed + delay;
    const t = time - Math.floor(time);

    const position = centerCurve.getPoint(t);
    const tangent = centerCurve.getTangent(t);

    const floatFrequency = 3.0;
    const floatOffset =
      Math.sin(state.clock.elapsedTime * floatFrequency + delay) *
      floatIntensity;

    const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
    position.add(normal.multiplyScalar(floatOffset));

    position.z = 0.0005; // Slightly higher to ensure visibility over curves
    groupRef.current.position.copy(position);

    const angle = Math.atan2(tangent.y, tangent.x);
    groupRef.current.rotation.z = angle - Math.PI / 2;

    const subtleSpinSpeed = 0.3;
    innerGroupRef.current.rotation.z =
      state.clock.elapsedTime * subtleSpinSpeed + delay;

    flareRef.current.rotation.z -= 0.02;

    let opacity = 1;
    const fadeEdges = 0.15;
    if (t < fadeEdges) {
      opacity = t / fadeEdges;
    } else if (t > 1 - fadeEdges) {
      opacity = (1 - t) / fadeEdges;
    }

    coreMaterialRef.current.opacity = opacity * GLOW_STRENGTH;
    glowMaterialRef.current.opacity = opacity * GLOW_STRENGTH;
    outerGlowMaterialRef.current.opacity = opacity * 0.9 * GLOW_STRENGTH;
    flareMaterialRef.current.opacity = opacity * GLOW_STRENGTH;
    shadowMaterialRef.current.opacity = opacity * SHADOW_OPACITY; // Uses the internal constant
    darkHaloMaterialRef.current.opacity = opacity * CONTRAST_BOOST; // Uses the internal constant
  });

  return (
    <group ref={groupRef} renderOrder={1002}>
      <group ref={innerGroupRef}>
        {/* Drop Shadow - Offset slightly to create depth */}
        <mesh position={[0.003, -0.003, -0.0002]} renderOrder={998}>
          <planeGeometry args={[arrowSize * 6, arrowSize * 6]} />
          <meshBasicMaterial
            ref={shadowMaterialRef}
            map={shadowTexture}
            transparent
            depthWrite={false}
          />
        </mesh>

        {/* Dark Contrast Halo - Sits exactly behind the glow to make it pop */}
        <mesh renderOrder={999}>
          <planeGeometry args={[arrowSize * 8, arrowSize * 8]} />
          <meshBasicMaterial
            ref={darkHaloMaterialRef}
            map={shadowTexture}
            transparent
            depthWrite={false}
          />
        </mesh>

        {/* Ambient Outer Glow */}
        <mesh renderOrder={1000}>
          <planeGeometry
            args={[arrowSize * glowSize * 2.5, arrowSize * glowSize * 2.5]}
          />
          <meshBasicMaterial
            ref={outerGlowMaterialRef}
            map={glowTexture}
            color={color}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Main Intense Glow */}
        <mesh renderOrder={1001}>
          <planeGeometry
            args={[arrowSize * glowSize * 1.5, arrowSize * glowSize * 1.5]}
          />
          <meshBasicMaterial
            ref={glowMaterialRef}
            map={glowTexture}
            color={color}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Star Flare Layer */}
        <mesh ref={flareRef} renderOrder={1002}>
          <planeGeometry
            args={[arrowSize * glowSize * 3.5, arrowSize * glowSize * 3.5]}
          />
          <meshBasicMaterial
            ref={flareMaterialRef}
            map={flareTexture}
            color={color}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Core Solid Ball - Hotter & Brighter */}
        <mesh renderOrder={1003}>
          <circleGeometry args={[arrowSize * 0.5, 32]} />
          <meshBasicMaterial
            ref={coreMaterialRef}
            color="#FFFFFF" // White core for maximum "heat"
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};
