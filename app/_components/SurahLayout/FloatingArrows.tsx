"use client";

import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  layoutMath,
  START_X,
  PW,
  CAPSULE_BORDER_WIDTH,
} from "../data/SurahConfig";
import {
  BLUE_THEME,
  MAROON_THEME,
  GREEN_THEME,
} from "../data/theme";
import {
  CURVE_GAP,
  CURVE_INWARD_OFFSET,
  CURVE_DEEP_OFFSET_OUTER,
  CURVE_DEEP_OFFSET_INNER,
  DEFAULT_VERSE_BORDER_WIDTH,
  INNER_CURVE_GAP,
  INNER_CURVE_INWARD_OFFSET,
  BRACKET_ROUNDNESS,
} from "./SideCurves";

/**
 * Visual tuning for the animated arrows.
 */
const ARROW_SCALE = 0.32;
const ARROW_GLOW_SCALE = 15;
const ARROW_SHADOW_SCALE = 9;
const ARROW_FLARE_SCALE = 14;
const ARROW_FLOAT_INTENSITY = 0.001;
const ARROW_FADE_THRESHOLD = 0.9;

// --- Helper for Arrow Textures ---

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

// --- Persistent Texture Cache to avoid memory leaks on remount ---
let cachedTextures: ArrowTextures | null = null;
function getArrowTextures(): ArrowTextures {
  if (!cachedTextures) {
    cachedTextures = createArrowTextures();
  }
  return cachedTextures;
}

// --- AnimatedArrow Component ---

interface AnimatedArrowProps {
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
  shadowSize?: number;
  flareSize?: number;
}

const AnimatedArrow = ({
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
  speed = 0.0005,
  arrowSize = 0.008,
  floatIntensity = 0.008,
  glowSize = 10,
  shadowSize = 6,
  flareSize = 14,
}: AnimatedArrowProps) => {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const flareRef = useRef<THREE.Mesh>(null);

  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const outerGlowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const flareMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const shadowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const darkHaloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const globalOpacityRef = useRef(0);
  const localTimeRef = useRef(0);
  const curvePositionRef = useRef(new THREE.Vector3());
  const curveTangentRef = useRef(new THREE.Vector3());
  const curveNormalRef = useRef(new THREE.Vector3());

  const SHADOW_OPACITY = 0.1;
  const CONTRAST_BOOST = 0.65;
  const GLOW_STRENGTH = 1.0;

  const centerCurve = useMemo(() => {
    const tipX = (outerTipX + innerTipX) / 2;
    const controlX = (outerControlX + innerControlX) / 2;
    const yTop = (outerYTop + innerYTop) / 2;
    const yBot = (outerYBot + innerYBot) / 2;

    const path = new THREE.Path();
    const h = Math.abs(yTop - yBot);
    const rY = h * BRACKET_ROUNDNESS;
    const k = 0.5522;

    path.moveTo(tipX, yTop);
    path.bezierCurveTo(controlX, yTop, controlX, yTop - rY * k, controlX, yTop - rY);
    path.lineTo(controlX, yBot + rY);
    path.bezierCurveTo(controlX, yBot + rY * k, controlX, yBot, tipX, yBot);

    path.updateArcLengths();
    return path;
  }, [outerTipX, innerTipX, outerControlX, innerControlX, outerYTop, innerYTop, outerYBot, innerYBot]);

  const textures = useMemo<ArrowTextures>(() => getArrowTextures(), []);
  const { glowTexture, flareTexture, shadowTexture } = textures;

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

    // React to scroll offset for hiding/showing (fading)
    const shouldHide = scroll.offset < ARROW_FADE_THRESHOLD;
    const targetOp = shouldHide ? 0 : 1;
    globalOpacityRef.current = THREE.MathUtils.damp(globalOpacityRef.current, targetOp, 4, delta);
    const go = globalOpacityRef.current;

    if (go < 0.001) {
      if (groupRef.current.visible) groupRef.current.visible = false;
      return;
    }
    if (!groupRef.current.visible) groupRef.current.visible = true;

    localTimeRef.current += delta;
    const time = localTimeRef.current * speed + delay;
    const t = time - Math.floor(time);

    const curvePosition = curvePositionRef.current;
    const curveTangent = curveTangentRef.current;
    const curveNormal = curveNormalRef.current;

    centerCurve.getPoint(t, curvePosition);
    centerCurve.getTangent(t, curveTangent);

    const floatFrequency = 3.0;
    const floatOffset = Math.sin(state.clock.elapsedTime * floatFrequency + delay) * floatIntensity;

    curveNormal.set(-curveTangent.y, curveTangent.x, 0).normalize();
    curvePosition.addScaledVector(curveNormal, floatOffset);
    curvePosition.z = 0.0005;

    groupRef.current.position.copy(curvePosition);
    groupRef.current.rotation.z = Math.atan2(curveTangent.y, curveTangent.x) - Math.PI / 2;

    innerGroupRef.current.rotation.z = state.clock.elapsedTime * 0.3 + delay;
    flareRef.current.rotation.z -= 0.02;

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
        <mesh position={[0.003, -0.003, -0.0002]} renderOrder={998}>
          <planeGeometry args={[arrowSize * shadowSize, arrowSize * shadowSize]} />
          <meshBasicMaterial ref={shadowMaterialRef} map={shadowTexture} transparent depthWrite={false} />
        </mesh>

        <mesh renderOrder={999}>
          <planeGeometry args={[arrowSize * shadowSize * 1.3, arrowSize * shadowSize * 1.3]} />
          <meshBasicMaterial ref={darkHaloMaterialRef} map={shadowTexture} transparent depthWrite={false} />
        </mesh>

        <mesh renderOrder={1000}>
          <planeGeometry args={[arrowSize * glowSize, arrowSize * glowSize]} />
          <meshBasicMaterial ref={outerGlowMaterialRef} map={glowTexture} color={color} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        <mesh renderOrder={1001}>
          <planeGeometry args={[arrowSize * glowSize * 0.6, arrowSize * glowSize * 0.6]} />
          <meshBasicMaterial ref={glowMaterialRef} map={glowTexture} color={color} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        <mesh ref={flareRef} renderOrder={1002}>
          <planeGeometry args={[arrowSize * flareSize, arrowSize * flareSize]} />
          <meshBasicMaterial ref={flareMaterialRef} map={flareTexture} color={color} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        <mesh renderOrder={1003}>
          <circleGeometry args={[arrowSize * 0.5, 32]} />
          <meshBasicMaterial ref={coreMaterialRef} color="#FFFFFF" transparent depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};

// --- FloatingArrows Component (Exported) ---

export const FloatingArrows = () => {
  const scroll = useScroll();

  const layout = layoutMath;
  const startX = START_X;
  const borderWidth = CAPSULE_BORDER_WIDTH;

  const {
    s2Pad,
    sectionW,
    v6Y,
    g1Y,
    g2Y,
    g3Y,
    v19Y,
    bigBoxH,
    groupPad,
    smallBoxH2,
    s2Gap,
  } = layout;

  const borderDelta = borderWidth - DEFAULT_VERSE_BORDER_WIDTH;
  const y6 = v6Y + borderDelta;
  const y19 = v19Y - bigBoxH - borderDelta;
  const y8 = g1Y - groupPad;
  const y18 = g3Y - groupPad - smallBoxH2 - s2Gap - smallBoxH2;
  const y10 = g1Y - groupPad - smallBoxH2 - s2Gap;
  const y16 = g3Y - groupPad - smallBoxH2;
  const y12 = g2Y - groupPad;
  const y14 = g2Y - groupPad - smallBoxH2 - s2Gap - smallBoxH2;

  const y6_bot = v6Y - bigBoxH;
  const y19_top = v19Y;
  const y8_bot = y8 - smallBoxH2;
  const y18_top = y18 + smallBoxH2;
  const y10_bot = y10 - smallBoxH2;
  const y16_top = y16 + smallBoxH2;
  const y12_bot = y12 - smallBoxH2;
  const y14_top = y14 + smallBoxH2;

  const startX_L = startX + s2Pad - 0.005;
  const startX_R = startX + sectionW - s2Pad + 0.005;

  const tipX_L = startX_L + CURVE_INWARD_OFFSET;
  const tipX_R = startX_R - CURVE_INWARD_OFFSET;

  const tipX_12_14_L = startX_L + CURVE_DEEP_OFFSET_OUTER;
  const tipX_12_14_R = startX_R - CURVE_DEEP_OFFSET_OUTER;

  const control4_L = startX_L - CURVE_GAP * 1;
  const control3_L = startX_L - CURVE_GAP * 2;
  const control2_L = startX_L - CURVE_GAP * 3;
  const control1_L = startX_L - CURVE_GAP * 4;

  const control4_R = startX_R + CURVE_GAP * 1;
  const control3_R = startX_R + CURVE_GAP * 2;
  const control2_R = startX_R + CURVE_GAP * 3;
  const control1_R = startX_R + CURVE_GAP * 4;

  const innerControl4_L = startX_L - INNER_CURVE_GAP * 1;
  const innerControl3_L = startX_L - INNER_CURVE_GAP * 2;
  const innerControl2_L = startX_L - INNER_CURVE_GAP * 3;
  const innerControl1_L = startX_L - INNER_CURVE_GAP * 4;

  const innerControl4_R = startX_R + INNER_CURVE_GAP * 1;
  const innerControl3_R = startX_R + INNER_CURVE_GAP * 2;
  const innerControl2_R = startX_R + INNER_CURVE_GAP * 3;
  const innerControl1_R = startX_R + INNER_CURVE_GAP * 4;

  const innerTipX_L = startX_L + INNER_CURVE_INWARD_OFFSET;
  const innerTipX_R = startX_R - INNER_CURVE_INWARD_OFFSET;

  const innerTipX_12_14_L = startX_L + CURVE_DEEP_OFFSET_INNER;
  const innerTipX_12_14_R = startX_R - CURVE_DEEP_OFFSET_INNER;

  const arrowProps = {
    arrowSize: 0.008 * ARROW_SCALE,
    glowSize: ARROW_GLOW_SCALE,
    shadowSize: ARROW_SHADOW_SCALE,
    flareSize: ARROW_FLARE_SCALE,
    floatIntensity: ARROW_FLOAT_INTENSITY,
  };

  return (
    <group position={[-PW / 2, 0, 0.01]}>
      <AnimatedArrow outerTipX={tipX_L} innerTipX={innerTipX_L} outerYTop={y6} innerYTop={y6_bot} outerControlX={control1_L} innerControlX={innerControl1_L} outerYBot={y19} innerYBot={y19_top} color={BLUE_THEME} speed={0.05} {...arrowProps} />
      <AnimatedArrow outerTipX={tipX_L} innerTipX={innerTipX_L} outerYTop={y8} innerYTop={y8_bot} outerControlX={control2_L} innerControlX={innerControl2_L} outerYBot={y18} innerYBot={y18_top} color={MAROON_THEME} speed={0.06} {...arrowProps} />
      <AnimatedArrow outerTipX={tipX_L} innerTipX={innerTipX_L} outerYTop={y10} innerYTop={y10_bot} outerControlX={control3_L} innerControlX={innerControl3_L} outerYBot={y16} innerYBot={y16_top} color={MAROON_THEME} speed={0.055} {...arrowProps} />
      <AnimatedArrow outerTipX={tipX_12_14_L} innerTipX={innerTipX_12_14_L} outerYTop={y12} innerYTop={y12_bot} outerControlX={control4_L} innerControlX={innerControl4_L} outerYBot={y14} innerYBot={y14_top} color={GREEN_THEME} speed={0.07} {...arrowProps} />
      <AnimatedArrow outerTipX={tipX_R} innerTipX={innerTipX_R} outerYTop={y6} innerYTop={y6_bot} outerControlX={control1_R} innerControlX={innerControl1_R} outerYBot={y19} innerYBot={y19_top} color={BLUE_THEME} speed={0.05} delay={0.5} {...arrowProps} />
      <AnimatedArrow outerTipX={tipX_R} innerTipX={innerTipX_R} outerYTop={y8} innerYTop={y8_bot} outerControlX={control2_R} innerControlX={innerControl2_R} outerYBot={y18} innerYBot={y18_top} color={MAROON_THEME} speed={0.06} delay={0.7} {...arrowProps} />
      <AnimatedArrow outerTipX={tipX_R} innerTipX={innerTipX_R} outerYTop={y10} innerYTop={y10_bot} outerControlX={control3_R} innerControlX={innerControl3_R} outerYBot={y16} innerYBot={y16_top} color={MAROON_THEME} speed={0.055} delay={0.3} {...arrowProps} />
      <AnimatedArrow outerTipX={tipX_12_14_R} innerTipX={innerTipX_12_14_R} outerYTop={y12} innerYTop={y12_bot} outerControlX={control4_R} innerControlX={innerControl4_R} outerYBot={y14} innerYBot={y14_top} color={GREEN_THEME} speed={0.07} delay={0.2} {...arrowProps} />
    </group>
  );
};
