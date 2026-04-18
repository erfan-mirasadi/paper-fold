"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type ArrowTextures = {
  glowTexture: THREE.CanvasTexture;
  flareTexture: THREE.CanvasTexture;
  shadowTexture: THREE.CanvasTexture;
};

function createArrowTextures(): ArrowTextures {
  // 1. Soft radial glow canvas
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
  const glowTexture = new THREE.CanvasTexture(gCanvas);
  glowTexture.needsUpdate = true;

  // 2. Star flare cross canvas
  const fCanvas = document.createElement("canvas");
  fCanvas.width = 128;
  fCanvas.height = 128;
  const fCtx = fCanvas.getContext("2d");
  if (fCtx) {
    const gradH = fCtx.createLinearGradient(0, 64, 128, 64);
    gradH.addColorStop(0, "rgba(255,255,255,0)");
    gradH.addColorStop(0.48, "rgba(255,255,255,0.95)");
    gradH.addColorStop(0.5, "rgba(255,255,255,1)");
    gradH.addColorStop(0.52, "rgba(255,255,255,0.95)");
    gradH.addColorStop(1, "rgba(255,255,255,0)");
    fCtx.fillStyle = gradH;
    fCtx.fillRect(0, 62, 128, 4);

    const gradV = fCtx.createLinearGradient(64, 0, 64, 128);
    gradV.addColorStop(0, "rgba(255,255,255,0)");
    gradV.addColorStop(0.48, "rgba(255,255,255,0.95)");
    gradV.addColorStop(0.5, "rgba(255,255,255,1)");
    gradV.addColorStop(0.52, "rgba(255,255,255,0.95)");
    gradV.addColorStop(1, "rgba(255,255,255,0)");
    fCtx.fillStyle = gradV;
    fCtx.fillRect(62, 0, 4, 128);
  }
  const flareTexture = new THREE.CanvasTexture(fCanvas);
  flareTexture.needsUpdate = true;

  // 3. Dark shadow / halo canvas
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
  const shadowTexture = new THREE.CanvasTexture(sCanvas);
  shadowTexture.needsUpdate = true;

  return { glowTexture, flareTexture, shadowTexture };
}

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
  speed = 0.0005, // Speed of travel along the path
  arrowSize = 0.008, // Base size of the core dot
  floatIntensity = 0.008, // Amplitude of the perpendicular float wobble
  glowSize = 4, // Glow plane size multiplier relative to arrowSize
  shouldHide = false, // Synced to popup open state
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
  shouldHide?: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const flareRef = useRef<THREE.Mesh>(null);

  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const outerGlowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const flareMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const shadowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const darkHaloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const globalOpacityRef = useRef(1);
  const curvePositionRef = useRef(new THREE.Vector3());
  const curveTangentRef = useRef(new THREE.Vector3());
  const curveNormalRef = useRef(new THREE.Vector3());

  // Visual tuning constants
  const SHADOW_OPACITY = 0.1;
  const CONTRAST_BOOST = 0.65;
  const GLOW_STRENGTH = 1.0;

  // Center path is the average of outer and inner curves
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

  const textures = useMemo<ArrowTextures>(() => createArrowTextures(), []);
  const { glowTexture, flareTexture, shadowTexture } = textures;

  useEffect(() => {
    if (!shouldHide && groupRef.current) {
      groupRef.current.visible = true;
    }
  }, [shouldHide]);

  useFrame((state, delta) => {
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

    const targetOp = shouldHide ? 0 : 1;
    globalOpacityRef.current = THREE.MathUtils.damp(
      globalOpacityRef.current,
      targetOp,
      4,
      delta,
    );
    const go = globalOpacityRef.current;

    if (shouldHide && go < 0.01) {
      if (groupRef.current.visible) groupRef.current.visible = false;
      return;
    }
    if (!groupRef.current.visible) groupRef.current.visible = true;

    const time = state.clock.elapsedTime * speed + delay;
    const t = time - Math.floor(time);

    const curvePosition = curvePositionRef.current;
    const curveTangent = curveTangentRef.current;
    const curveNormal = curveNormalRef.current;

    centerCurve.getPoint(t, curvePosition);
    centerCurve.getTangent(t, curveTangent);

    const floatFrequency = 3.0;
    const floatOffset =
      Math.sin(state.clock.elapsedTime * floatFrequency + delay) *
      floatIntensity;

    curveNormal.set(-curveTangent.y, curveTangent.x, 0).normalize();
    curvePosition.addScaledVector(curveNormal, floatOffset);
    curvePosition.z = 0.0005;

    groupRef.current.position.copy(curvePosition);
    groupRef.current.rotation.z =
      Math.atan2(curveTangent.y, curveTangent.x) - Math.PI / 2;

    innerGroupRef.current.rotation.z = state.clock.elapsedTime * 0.3 + delay;
    flareRef.current.rotation.z -= 0.02;

    // Edge fade-in/out to prevent popping at loop boundary
    let opacity = 1;
    const fadeEdges = 0.15;
    if (t < fadeEdges) {
      opacity = t / fadeEdges;
    } else if (t > 1 - fadeEdges) {
      opacity = (1 - t) / fadeEdges;
    }

    coreMaterialRef.current.opacity = opacity * GLOW_STRENGTH * go;
    glowMaterialRef.current.opacity = opacity * GLOW_STRENGTH * go;
    outerGlowMaterialRef.current.opacity = opacity * 0.9 * GLOW_STRENGTH * go;
    flareMaterialRef.current.opacity = opacity * GLOW_STRENGTH * go;
    shadowMaterialRef.current.opacity = opacity * SHADOW_OPACITY * go;
    darkHaloMaterialRef.current.opacity = opacity * CONTRAST_BOOST * go;
  });

  return (
    <group ref={groupRef} renderOrder={1002}>
      <group ref={innerGroupRef}>
        {/* Drop shadow offset for perceived depth */}
        <mesh position={[0.003, -0.003, -0.0002]} renderOrder={998}>
          <planeGeometry args={[arrowSize * 6, arrowSize * 6]} />
          <meshBasicMaterial
            ref={shadowMaterialRef}
            map={shadowTexture}
            transparent
            depthWrite={false}
          />
        </mesh>

        {/* Dark contrast halo — sits behind glow to make it pop */}
        <mesh renderOrder={999}>
          <planeGeometry args={[arrowSize * 8, arrowSize * 8]} />
          <meshBasicMaterial
            ref={darkHaloMaterialRef}
            map={shadowTexture}
            transparent
            depthWrite={false}
          />
        </mesh>

        {/* Ambient outer glow ring */}
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

        {/* Main intense inner glow */}
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

        {/* Star flare cross layer */}
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

        {/* Core solid white dot — hottest, brightest point */}
        <mesh renderOrder={1003}>
          <circleGeometry args={[arrowSize * 0.5, 32]} />
          <meshBasicMaterial
            ref={coreMaterialRef}
            color="#FFFFFF"
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};
