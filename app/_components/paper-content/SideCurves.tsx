"use client";
import { Line } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { BLUE_THEME, MAROON_THEME, GREEN_THEME } from "./SharedUI";
import { AnimatedArrow } from "./AnimatedArrow";

export interface LayoutConfig {
  s2Pad: number;
  sectionW: number;
  v6Y: number;
  g1Y: number;
  g2Y: number;
  g3Y: number;
  v19Y: number;
  bigBoxH: number;
  groupPad: number;
  smallBoxH2: number;
  s2Gap: number;
  groupH: number;
}

interface SideCurvesProps {
  layout: LayoutConfig;
  startX: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OUTER curves — one per bracket pair, bow increases outward per nesting level
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CURVE_GAP = 0.1; // step between each nesting level
const CURVE_INWARD_OFFSET = 0.0085; // how far the tip penetrates inward (standard)
const CURVE_DEEP_OFFSET_OUTER = 0.01; // deeper penetration for the 12-14 pair (outer)
const CURVE_DEEP_OFFSET_INNER = 0.03; // deeper penetration for the 12-14 pair (inner)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INNER curves — identical bow for every pair, tweak these two values
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const INNER_CURVE_GAP = 0.095; // how far inward the inner curve bows
const INNER_CURVE_INWARD_OFFSET = 0.008; // tip penetration for inner curves

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MASTER CORNER CONTROLS (Unified caps matching)
// Just tweak these TWO variables to sync all corners!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CORNER_ROUNDNESS = 0.003; // 1. How rounded/curved the cap is (Y-axis bend)
const CORNER_DEPTH = 0.03; // 2. How far the cap pushes inward/outward (X-axis depth)

// Function to generate a smooth Cubic Bezier curve
// =========================================================================
const getSmoothCurvePoints = (
  tipX: number,
  controlX: number,
  yTop: number,
  yBot: number,
) => {
  // A Cubic Bezier Curve uses two control points to create a smooth C-shape
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(tipX, yTop, 0),
    new THREE.Vector3(controlX, yTop, 0),
    new THREE.Vector3(controlX, yBot, 0),
    new THREE.Vector3(tipX, yBot, 0),
  );
  return curve.getPoints(50);
};

// CurvePair component representing the smooth lines and their fill
// ===========================================
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
  isRight, // boolean to handle left/right symmetry automatically
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
  isRight: boolean;
}) => {
  const outerPoints = useMemo(
    () => getSmoothCurvePoints(outerTipX, outerControlX, outerYTop, outerYBot),
    [outerTipX, outerControlX, outerYTop, outerYBot],
  );

  const innerPoints = useMemo(
    () => getSmoothCurvePoints(innerTipX, innerControlX, innerYTop, innerYBot),
    [innerTipX, innerControlX, innerYTop, innerYBot],
  );

  const fillShape = useMemo(() => {
    const s = new THREE.Shape();

    // Direction multiplier to handle left vs right symmetries seamlessly
    const dir = isRight ? 1 : -1;

    // Unified control points using just the 2 master variables
    // Top Cap
    const topCp1X = innerTipX + CORNER_DEPTH * dir;
    const topCp1Y = innerYTop + CORNER_ROUNDNESS;
    const topCp2X = outerTipX + CORNER_DEPTH * dir;
    const topCp2Y = outerYTop;

    // Bottom Cap
    const botCp1X = outerTipX + CORNER_DEPTH * dir;
    const botCp1Y = outerYBot;
    const botCp2X = innerTipX + CORNER_DEPTH * dir;
    const botCp2Y = innerYBot - CORNER_ROUNDNESS;

    // 1. Start at top outer point
    s.moveTo(outerTipX, outerYTop);

    // 2. Draw outer curve down to outer bottom
    s.bezierCurveTo(
      outerControlX,
      outerYTop,
      outerControlX,
      outerYBot,
      outerTipX,
      outerYBot,
    );

    // 3. Draw Bottom Cap (Hug the box with unified logic)
    s.bezierCurveTo(botCp1X, botCp1Y, botCp2X, botCp2Y, innerTipX, innerYBot);

    // 4. Draw inner curve back up to inner top
    s.bezierCurveTo(
      innerControlX,
      innerYBot,
      innerControlX,
      innerYTop,
      innerTipX,
      innerYTop,
    );

    // 5. Draw Top Cap (Hug the box with unified logic)
    s.bezierCurveTo(topCp1X, topCp1Y, topCp2X, topCp2Y, outerTipX, outerYTop);

    return s;
  }, [
    outerTipX,
    outerYTop,
    outerControlX,
    outerYBot,
    innerTipX,
    innerYBot,
    innerControlX,
    innerYTop,
    isRight,
  ]);

  return (
    <group>
      <Line
        points={outerPoints}
        color={color}
        lineWidth={3.5}
        depthTest={false}
        renderOrder={999}
      />
      <Line
        points={innerPoints}
        color={color}
        lineWidth={3.5}
        depthTest={false}
        renderOrder={999}
      />
      <mesh renderOrder={1}>
        <shapeGeometry args={[fillShape]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          depthTest={false}
        />
      </mesh>

      {/* Adding Animated Arrows on the Center curves */}
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
        delay={isRight ? 0.2 : 0} // Slight delay offset for left vs right
        speed={0.15}
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
        delay={isRight ? 0.7 : 0.5} // Two arrows looping on the same curve
        speed={0.15}
      />
    </group>
  );
};

export const SideCurves = ({ layout, startX }: SideCurvesProps) => {
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

  // ── TOP edges (existing outer curves) ──────────────────────────────────
  const y6 = v6Y;
  const y19 = v19Y - bigBoxH;

  const y8 = g1Y - groupPad;
  const y18 = g3Y - groupPad - smallBoxH2 - s2Gap - smallBoxH2 - 0.01;

  const y10 = g1Y - groupPad - smallBoxH2 - s2Gap - 0.01;
  const y16 = g3Y - groupPad - smallBoxH2;

  const y12 = g2Y - groupPad;
  const y14 = g2Y - groupPad - smallBoxH2 - s2Gap - smallBoxH2;

  // ── BOTTOM edges for each upper section / TOP edges for each lower section ──
  const y6_bot = v6Y - bigBoxH;
  const y19_top = v19Y;

  const y8_bot = y8 - smallBoxH2;
  const y18_top = y18 + smallBoxH2;

  const y10_bot = y10 - smallBoxH2;
  const y16_top = y16 + smallBoxH2;

  const y12_bot = y12 - smallBoxH2;
  const y14_top = y14 + smallBoxH2;

  // Base bounding box reference edges
  const startX_L = startX + s2Pad - 0.005;
  const startX_R = startX + sectionW - s2Pad + 0.005;

  // Destination edges
  const tipX_L = startX_L + CURVE_INWARD_OFFSET;
  const tipX_R = startX_R - CURVE_INWARD_OFFSET;

  // Deep penetration destination exception for 12-14 boxes
  const tipX_12_14_L = startX_L + CURVE_DEEP_OFFSET_OUTER;
  const tipX_12_14_R = startX_R - CURVE_DEEP_OFFSET_OUTER;

  // ── Outer control points ──
  const control4_L = startX_L - CURVE_GAP * 1;
  const control3_L = startX_L - CURVE_GAP * 2;
  const control2_L = startX_L - CURVE_GAP * 3;
  const control1_L = startX_L - CURVE_GAP * 4;

  const control4_R = startX_R + CURVE_GAP * 1;
  const control3_R = startX_R + CURVE_GAP * 2;
  const control2_R = startX_R + CURVE_GAP * 3;
  const control1_R = startX_R + CURVE_GAP * 4;

  // ── Inner control points ──
  const innerControl4_L = startX_L - INNER_CURVE_GAP * 1;
  const innerControl3_L = startX_L - INNER_CURVE_GAP * 2;
  const innerControl2_L = startX_L - INNER_CURVE_GAP * 3;
  const innerControl1_L = startX_L - INNER_CURVE_GAP * 4;

  const innerControl4_R = startX_R + INNER_CURVE_GAP * 1;
  const innerControl3_R = startX_R + INNER_CURVE_GAP * 2;
  const innerControl2_R = startX_R + INNER_CURVE_GAP * 3;
  const innerControl1_R = startX_R + INNER_CURVE_GAP * 4;

  // ── Inner tip X ──
  const innerTipX_L = startX_L + INNER_CURVE_INWARD_OFFSET;
  const innerTipX_R = startX_R - INNER_CURVE_INWARD_OFFSET;

  const innerTipX_12_14_L = startX_L + CURVE_DEEP_OFFSET_INNER;
  const innerTipX_12_14_R = startX_R - CURVE_DEEP_OFFSET_INNER;

  return (
    <group position={[0, 0, 0.08]} renderOrder={999}>
      {/* ================= LEFT CURVES ================= */}
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
        isRight={false}
      />
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
        isRight={false}
      />
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
        isRight={false}
      />
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
        isRight={false}
      />

      {/* ================= RIGHT CURVES ================= */}
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
        isRight={true}
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
        isRight={true}
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
        isRight={true}
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
        isRight={true}
      />
    </group>
  );
};
