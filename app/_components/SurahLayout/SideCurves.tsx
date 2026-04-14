"use client";

// ============================================================================
// SIDE CURVES
// Location: SurahLayout/components/SideCurves.tsx
// Purpose: Renders the chiastic (ring-structure) bracket curves on both sides
//          of Section 2. Each CurvePair brackets two semantically-mirrored
//          verse groups. Coordinates are derived 100% from the passed `layout`
//          prop — no hardcoded positions. If verse positions shift (e.g., taller
//          boxes, added groups), the curves follow automatically.
// ============================================================================

import { Line } from "@react-three/drei";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import {
  BLUE_THEME,
  MAROON_THEME,
  GREEN_THEME,
  CAPSULE_BG_7_10_15_18,
  CAPSULE_BG_12_14,
  CAPSULE_BG_6_19,
  BUMP_MID,
  BUMP_LOWER,
} from "../data/theme";
import { AnimatedArrow } from "./AnimatedArrow";
import { usePopUpState } from "../features/pop-up-verses/ui/PopUpState";
import { useFrame } from "@react-three/fiber";
import type { LayoutConfig } from "../data/SurahConfig";

// ── Curve shape constants ─────────────────────────────────────────────────────
const CURVE_GAP = 0.1; // Bow step between nesting levels (outer)
const CURVE_INWARD_OFFSET = 0.0085; // How far the bracket tip pokes inward
const CURVE_DEEP_OFFSET_OUTER = 0.01; // Deeper tip for the center (12–14) bracket
const CURVE_DEEP_OFFSET_INNER = 0.03; // Deeper inner tip for center bracket

const INNER_CURVE_GAP = 0.095; // Bow step for inner curves
const INNER_CURVE_INWARD_OFFSET = 0.008; // Inner tip penetration

// ── Line width constants ────────────────────────────────────────────────────
// Edit these two values to adjust the thickness of the side-curve outlines.
export const CURVE_OUTER_LINE_WIDTH = 1;
export const CURVE_INNER_LINE_WIDTH = 2;

// ─────────────────────────────────────────────────────────────────────────────

interface SideCurvesProps {
  layout: LayoutConfig;
  startX: number;
  isBumpMap?: boolean;
}

/**
 * getSmoothCurvePoints
 * Builds high-resolution cubic bezier points for a single curve arm.
 * Using the exact same sample points for both the Line and the fill Shape
 * guarantees zero visual bleeding between the two.
 */
const getSmoothCurvePoints = (
  tipX: number,
  controlX: number,
  yTop: number,
  yBot: number,
) => {
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(tipX, yTop, 0),
    new THREE.Vector3(controlX, yTop, 0),
    new THREE.Vector3(controlX, yBot, 0),
    new THREE.Vector3(tipX, yBot, 0),
  );
  return curve.getPoints(50);
};

// ─────────────────────────────────────────────────────────────────────────────
// CurvePair — renders one nested bracket (outer line + inner line + fill mesh)
// ─────────────────────────────────────────────────────────────────────────────
const CurvePair = ({
  outerYTop,
  outerYBot,
  outerControlX,
  outerTipX,
  innerYTop,
  innerYBot,
  innerControlX,
  innerTipX,
  color,
  fillColor,
  isRight,
  shouldHide = false,
  isBumpMap = false,
}: {
  outerYTop: number;
  outerYBot: number;
  outerControlX: number;
  outerTipX: number;
  innerYTop: number;
  innerYBot: number;
  innerControlX: number;
  innerTipX: number;
  color: string;
  fillColor?: string;
  isRight: boolean;
  shouldHide?: boolean;
  isBumpMap?: boolean;
}) => {
  const outerPoints = useMemo(
    () => getSmoothCurvePoints(outerTipX, outerControlX, outerYTop, outerYBot),
    [outerTipX, outerControlX, outerYTop, outerYBot],
  );

  const innerPoints = useMemo(
    () => getSmoothCurvePoints(innerTipX, innerControlX, innerYTop, innerYBot),
    [innerTipX, innerControlX, innerYTop, innerYBot],
  );

  // Build the fill shape from the exact same sample points as the lines.
  // This prevents any sub-pixel gap or bleed between outline and fill.
  const fillShape = useMemo(() => {
    const s = new THREE.Shape();

    if (outerPoints.length > 0 && innerPoints.length > 0) {
      s.moveTo(outerPoints[0].x, outerPoints[0].y);
      for (let i = 1; i < outerPoints.length; i++) {
        s.lineTo(outerPoints[i].x, outerPoints[i].y);
      }
      const lastInner = innerPoints[innerPoints.length - 1];
      s.lineTo(lastInner.x, lastInner.y);
      for (let i = innerPoints.length - 2; i >= 0; i--) {
        s.lineTo(innerPoints[i].x, innerPoints[i].y);
      }
      s.lineTo(outerPoints[0].x, outerPoints[0].y);
    }

    return s;
  }, [outerPoints, innerPoints]);

  const groupRef = useRef<THREE.Group>(null);
  const fillMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef1 = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRef2 = useRef<any>(null);

  const globalOpacityRef = useRef(1);
  const isAnimating = useRef(false);

  useEffect(() => {
    isAnimating.current = true;
    // Make visible immediately before fading in
    if (!shouldHide && groupRef.current) {
      groupRef.current.visible = true;
    }
  }, [shouldHide]);

  useFrame((_, delta) => {
    if (!isAnimating.current) return;

    const targetOp = shouldHide ? 0 : 1;
    globalOpacityRef.current = THREE.MathUtils.damp(
      globalOpacityRef.current,
      targetOp,
      4,
      delta,
    );
    const go = globalOpacityRef.current;

    if (fillMaterialRef.current) {
      fillMaterialRef.current.opacity = 0.999 * go;
    }
    if (lineRef1.current?.material) {
      lineRef1.current.material.opacity = go;
    }
    if (lineRef2.current?.material) {
      lineRef2.current.material.opacity = go;
    }

    // Stop the animation loop when close enough to target; hide when fully invisible
    if (Math.abs(go - targetOp) < 0.01) {
      isAnimating.current = false;
      if (shouldHide && groupRef.current) {
        groupRef.current.visible = false;
      }
    }
  });

  const activeColor = isBumpMap ? BUMP_MID : color;
  const activeFillColor = isBumpMap ? BUMP_LOWER : (fillColor ?? color);

  return (
    <group ref={groupRef} position={[0, 0, 0.0012]}>
      <group position={[0, 0, 0.0012]} renderOrder={5}>
        <Line
          ref={lineRef1}
          points={outerPoints}
          color={activeColor}
          lineWidth={CURVE_OUTER_LINE_WIDTH}
          transparent={true}
          renderOrder={5}
        />
        <Line
          ref={lineRef2}
          points={innerPoints}
          color={activeColor}
          lineWidth={CURVE_INNER_LINE_WIDTH}
          transparent={true}
          renderOrder={5}
        />
      </group>
      <mesh renderOrder={4}>
        <shapeGeometry args={[fillShape]} />
        <meshBasicMaterial
          ref={fillMaterialRef}
          color={activeFillColor}
          transparent
          opacity={0.999}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Two staggered animated arrows per bracket for a layered look */}
      <AnimatedArrow
        outerTipX={outerTipX}
        innerTipX={innerTipX}
        outerYTop={outerYTop}
        innerYTop={innerYTop}
        outerControlX={outerControlX}
        innerControlX={innerControlX}
        outerYBot={outerYBot}
        innerYBot={innerYBot}
        color={color}
        delay={isRight ? 0.2 : 0}
        speed={0.05}
        arrowSize={0.005}
        floatIntensity={0.0005}
        glowSize={2}
        shouldHide={shouldHide}
      />
      <AnimatedArrow
        outerTipX={outerTipX}
        innerTipX={innerTipX}
        outerYTop={outerYTop}
        innerYTop={innerYTop}
        outerControlX={outerControlX}
        innerControlX={innerControlX}
        outerYBot={outerYBot}
        innerYBot={innerYBot}
        color={color}
        delay={isRight ? 0.7 : 0.5}
        speed={0.06}
        arrowSize={0.004}
        floatIntensity={0.0009}
        glowSize={2}
        shouldHide={shouldHide}
      />
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SideCurves — orchestrates all 4 bracket pairs on left and right sides
// ─────────────────────────────────────────────────────────────────────────────
export const SideCurves = ({
  layout,
  startX,
  isBumpMap = false,
}: SideCurvesProps) => {
  const { groups } = usePopUpState();
  // Hide curves whenever any inner group (not 1–2 or 3–4) is open
  const shouldHide = groups.some(
    (g) => g.isOpen && g.id !== "g_1_2" && g.id !== "g_3_4",
  );

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

  // ── Derive Y edges from the layout object (no hardcoded numbers) ──────────

  // Outer bracket (blue): spans verse 6 top → verse 19 bottom
  const y6 = v6Y;
  const y19 = v19Y - bigBoxH;

  // Second bracket (maroon): spans verse 7/8 top → verse 17/18 bottom
  const y8 = g1Y - groupPad;
  const y18 = g3Y - groupPad - smallBoxH2 - s2Gap - smallBoxH2 - 0.01;

  // Third bracket (maroon): spans verse 9/10 top → verse 15/16 bottom
  const y10 = g1Y - groupPad - smallBoxH2 - s2Gap - 0.01;
  const y16 = g3Y - groupPad - smallBoxH2;

  // Inner bracket (green): spans verse 11/12 top → verse 13/14 bottom
  const y12 = g2Y - groupPad;
  const y14 = g2Y - groupPad - smallBoxH2 - s2Gap - smallBoxH2;

  // ── Bottom edges (inner faces of each bracket) ────────────────────────────
  const y6_bot = v6Y - bigBoxH;
  const y19_top = v19Y;
  const y8_bot = y8 - smallBoxH2;
  const y18_top = y18 + smallBoxH2;
  const y10_bot = y10 - smallBoxH2;
  const y16_top = y16 + smallBoxH2;
  const y12_bot = y12 - smallBoxH2;
  const y14_top = y14 + smallBoxH2;

  // ── Reference edges (flush with the section box sides) ───────────────────
  const startX_L = startX + s2Pad - 0.005;
  const startX_R = startX + sectionW - s2Pad + 0.005;

  // Standard bracket tips
  const tipX_L = startX_L + CURVE_INWARD_OFFSET;
  const tipX_R = startX_R - CURVE_INWARD_OFFSET;

  // Deep-penetration tips for center (12–14) bracket
  const tipX_12_14_L = startX_L + CURVE_DEEP_OFFSET_OUTER;
  const tipX_12_14_R = startX_R - CURVE_DEEP_OFFSET_OUTER;

  // ── Outer control points (bow increases outward per nesting level) ────────
  const control4_L = startX_L - CURVE_GAP * 1;
  const control3_L = startX_L - CURVE_GAP * 2;
  const control2_L = startX_L - CURVE_GAP * 3;
  const control1_L = startX_L - CURVE_GAP * 4;

  const control4_R = startX_R + CURVE_GAP * 1;
  const control3_R = startX_R + CURVE_GAP * 2;
  const control2_R = startX_R + CURVE_GAP * 3;
  const control1_R = startX_R + CURVE_GAP * 4;

  // ── Inner control points ──────────────────────────────────────────────────
  const innerControl4_L = startX_L - INNER_CURVE_GAP * 1;
  const innerControl3_L = startX_L - INNER_CURVE_GAP * 2;
  const innerControl2_L = startX_L - INNER_CURVE_GAP * 3;
  const innerControl1_L = startX_L - INNER_CURVE_GAP * 4;

  const innerControl4_R = startX_R + INNER_CURVE_GAP * 1;
  const innerControl3_R = startX_R + INNER_CURVE_GAP * 2;
  const innerControl2_R = startX_R + INNER_CURVE_GAP * 3;
  const innerControl1_R = startX_R + INNER_CURVE_GAP * 4;

  // ── Inner tips ────────────────────────────────────────────────────────────
  const innerTipX_L = startX_L + INNER_CURVE_INWARD_OFFSET;
  const innerTipX_R = startX_R - INNER_CURVE_INWARD_OFFSET;

  const innerTipX_12_14_L = startX_L + CURVE_DEEP_OFFSET_INNER;
  const innerTipX_12_14_R = startX_R - CURVE_DEEP_OFFSET_INNER;

  return (
    <group position={[0, 0, 0.0025]} renderOrder={5}>
      {/* ════════════ LEFT SIDE ════════════ */}

      {/* Bracket 1 (outermost, blue): verse 6 ↔ verse 19 */}
      <CurvePair
        outerYTop={y6}
        outerYBot={y19}
        outerControlX={control1_L}
        outerTipX={tipX_L}
        innerYTop={y6_bot}
        innerYBot={y19_top}
        innerControlX={innerControl1_L}
        innerTipX={innerTipX_L}
        color={BLUE_THEME}
        fillColor={CAPSULE_BG_6_19}
        isRight={false}
        shouldHide={shouldHide}
        isBumpMap={isBumpMap}
      />

      {/* Bracket 2 (maroon): verse 7–8 ↔ verse 17–18 */}
      <CurvePair
        outerYTop={y8}
        outerYBot={y18}
        outerControlX={control2_L}
        outerTipX={tipX_L}
        innerYTop={y8_bot}
        innerYBot={y18_top}
        innerControlX={innerControl2_L}
        innerTipX={innerTipX_L}
        color={MAROON_THEME}
        fillColor={CAPSULE_BG_7_10_15_18}
        isRight={false}
        shouldHide={shouldHide}
        isBumpMap={isBumpMap}
      />

      {/* Bracket 3 (maroon): verse 9–10 ↔ verse 15–16 */}
      <CurvePair
        outerYTop={y10}
        outerYBot={y16}
        outerControlX={control3_L}
        outerTipX={tipX_L}
        innerYTop={y10_bot}
        innerYBot={y16_top}
        innerControlX={innerControl3_L}
        innerTipX={innerTipX_L}
        color={MAROON_THEME}
        fillColor={CAPSULE_BG_7_10_15_18}
        isRight={false}
        shouldHide={shouldHide}
        isBumpMap={isBumpMap}
      />

      {/* Bracket 4 (innermost, green): verse 11–12 ↔ verse 13–14 */}
      <CurvePair
        outerYTop={y12}
        outerYBot={y14}
        outerControlX={control4_L}
        outerTipX={tipX_12_14_L}
        innerYTop={y12_bot}
        innerYBot={y14_top}
        innerControlX={innerControl4_L}
        innerTipX={innerTipX_12_14_L}
        color={GREEN_THEME}
        fillColor={CAPSULE_BG_12_14}
        isRight={false}
        shouldHide={shouldHide}
        isBumpMap={isBumpMap}
      />

      {/* ════════════ RIGHT SIDE ════════════ */}

      <CurvePair
        outerYTop={y6}
        outerYBot={y19}
        outerControlX={control1_R}
        outerTipX={tipX_R}
        innerYTop={y6_bot}
        innerYBot={y19_top}
        innerControlX={innerControl1_R}
        innerTipX={innerTipX_R}
        color={BLUE_THEME}
        fillColor={CAPSULE_BG_6_19}
        isRight={true}
        shouldHide={shouldHide}
        isBumpMap={isBumpMap}
      />

      <CurvePair
        outerYTop={y8}
        outerYBot={y18}
        outerControlX={control2_R}
        outerTipX={tipX_R}
        innerYTop={y8_bot}
        innerYBot={y18_top}
        innerControlX={innerControl2_R}
        innerTipX={innerTipX_R}
        color={MAROON_THEME}
        fillColor={CAPSULE_BG_7_10_15_18}
        isRight={true}
        shouldHide={shouldHide}
        isBumpMap={isBumpMap}
      />

      <CurvePair
        outerYTop={y10}
        outerYBot={y16}
        outerControlX={control3_R}
        outerTipX={tipX_R}
        innerYTop={y10_bot}
        innerYBot={y16_top}
        innerControlX={innerControl3_R}
        innerTipX={innerTipX_R}
        color={MAROON_THEME}
        fillColor={CAPSULE_BG_7_10_15_18}
        isRight={true}
        shouldHide={shouldHide}
        isBumpMap={isBumpMap}
      />

      <CurvePair
        outerYTop={y12}
        outerYBot={y14}
        outerControlX={control4_R}
        outerTipX={tipX_12_14_R}
        innerYTop={y12_bot}
        innerYBot={y14_top}
        innerControlX={innerControl4_R}
        innerTipX={innerTipX_12_14_R}
        color={GREEN_THEME}
        fillColor={CAPSULE_BG_12_14}
        isRight={true}
        shouldHide={shouldHide}
      />
    </group>
  );
};
