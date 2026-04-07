"use client";
import { Line } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { BLUE_THEME, MAROON_THEME, GREEN_THEME } from "./SharedUI";

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
}

interface SideCurvesProps {
  layout: LayoutConfig;
  startX: number;
}

// Custom configuration constants for easy tweaking
// ===============================================
const CURVE_GAP = 0.05; // Controls how far outward the curve bows (user set)
const CURVE_INWARD_OFFSET = 0.05; // Controls inward penetration for most curves (user set)
const CURVE_DEEP_OFFSET = 0.06; // Controls the 12-14 penetration exception (user set)

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
    new THREE.Vector3(tipX, yTop, 0), // Start point (inside top box)
    new THREE.Vector3(controlX, yTop, 0), // First control point (pulls outward)
    new THREE.Vector3(controlX, yBot, 0), // Second control point (pulls outward)
    new THREE.Vector3(tipX, yBot, 0), // End point (inside bottom box)
  );

  // Generate 50 points along the curve for a smooth 3D line
  return curve.getPoints(50);
};

// CurveConnection component representing the smooth line
// ===========================================
const CurveConnection = ({
  yTop,
  yBot,
  controlX,
  tipX,
  color,
}: {
  yTop: number;
  yBot: number;
  controlX: number;
  tipX: number;
  color: string;
}) => {
  // Memoize the points so it doesn't recalculate on every frame
  const points = useMemo(
    () => getSmoothCurvePoints(tipX, controlX, yTop, yBot),
    [tipX, controlX, yTop, yBot],
  );

  return (
    <Line
      points={points}
      color={color}
      lineWidth={3.5}
      depthTest={false}
      renderOrder={999}
    />
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

  // Calculate top and bottom edges for each verse box pair
  const y6 = v6Y;
  const y19 = v19Y - bigBoxH;

  const y8 = g1Y - groupPad;
  const y18 = g3Y - groupPad - smallBoxH2 - s2Gap - smallBoxH2;

  const y10 = g1Y - groupPad - smallBoxH2 - s2Gap;
  const y16 = g3Y - groupPad - smallBoxH2;

  const y12 = g2Y - groupPad;
  const y14 = g2Y - groupPad - smallBoxH2 - s2Gap - smallBoxH2;

  // Base bounding box reference edges
  const startX_L = startX + s2Pad - 0.005;
  const startX_R = startX + sectionW - s2Pad + 0.005;

  // Destination edges (penetrating inward for standard boxes)
  const tipX_L = startX_L + CURVE_INWARD_OFFSET;
  const tipX_R = startX_R - CURVE_INWARD_OFFSET;

  // Deep penetration destination exception for 12-14 boxes
  const tipX_12_14_L = startX_L + CURVE_DEEP_OFFSET;
  const tipX_12_14_R = startX_R - CURVE_DEEP_OFFSET;

  // Control points calculated outward with CURVE_GAP
  // These pull the curve outward to create the parenthesis shape
  const control4_L = startX_L - CURVE_GAP * 1; // 12-14 curve (inner)
  const control3_L = startX_L - CURVE_GAP * 2; // 10-16 curve
  const control2_L = startX_L - CURVE_GAP * 3; // 8-18 curve
  const control1_L = startX_L - CURVE_GAP * 4; // 6-19 curve (outer)

  const control4_R = startX_R + CURVE_GAP * 1;
  const control3_R = startX_R + CURVE_GAP * 2;
  const control2_R = startX_R + CURVE_GAP * 3;
  const control1_R = startX_R + CURVE_GAP * 4;

  return (
    // ensure rendering on top
    <group position={[0, 0, 0.08]} renderOrder={999}>
      {/* ================= LEFT CURVES ================= */}
      <CurveConnection
        yTop={y6}
        yBot={y19}
        controlX={control1_L}
        tipX={tipX_L}
        color={BLUE_THEME}
      />
      <CurveConnection
        yTop={y8}
        yBot={y18}
        controlX={control2_L}
        tipX={tipX_L}
        color={MAROON_THEME}
      />
      <CurveConnection
        yTop={y10}
        yBot={y16}
        controlX={control3_L}
        tipX={tipX_L}
        color={MAROON_THEME}
      />
      {/* Exception for 12-14: deep penetration target */}
      <CurveConnection
        yTop={y12}
        yBot={y14}
        controlX={control4_L}
        tipX={tipX_12_14_L}
        color={GREEN_THEME}
      />

      {/* ================= RIGHT CURVES ================= */}
      <CurveConnection
        yTop={y6}
        yBot={y19}
        controlX={control1_R}
        tipX={tipX_R}
        color={BLUE_THEME}
      />
      <CurveConnection
        yTop={y8}
        yBot={y18}
        controlX={control2_R}
        tipX={tipX_R}
        color={MAROON_THEME}
      />
      <CurveConnection
        yTop={y10}
        yBot={y16}
        controlX={control3_R}
        tipX={tipX_R}
        color={MAROON_THEME}
      />
      {/* Exception for 12-14: deep penetration target */}
      <CurveConnection
        yTop={y12}
        yBot={y14}
        controlX={control4_R}
        tipX={tipX_12_14_R}
        color={GREEN_THEME}
      />
    </group>
  );
};
