// "use client";
// import { useMemo } from "react";
// import * as THREE from "three";
// import { BLUE_THEME, MAROON_THEME, GREEN_THEME } from "./SharedUI";

// export interface LayoutConfig {
//   s2Pad: number;
//   sectionW: number;
//   v6Y: number;
//   g1Y: number;
//   g2Y: number;
//   g3Y: number;
//   v19Y: number;
//   bigBoxH: number;
//   groupPad: number;
//   smallBoxH2: number;
//   s2Gap: number;
// }

// interface SideCurvesProps {
//   layout: LayoutConfig;
//   startX: number;
// }

// const CURVE_GAP = 0.05; // Controls how far outward the curve bows (user set)
// const CURVE_INWARD_OFFSET = 0.022; // Controls inward penetration for most curves (user set)
// const CURVE_DEEP_OFFSET = 0.033; // Controls the 12-14 penetration exception (user set)
// const CURVE_TENSION = 0.5; // 1 = Flat Boxy starts ([ shape). 0.5 = Circular (C shape). 0 = Pointy (< shape).
// const COMET_THICKNESS = 0.023; // Thickness of the curve at its base/head
// const COMET_TAIL_THICKNESS = 0.0005; // Thickness of the curve at its tail (faded end)
// const COMET_GAP_PERCENT = 7; // Spacing/Gap between the upper and lower comet (0 to 100)
// const COMET_HEAD_ROUNDNESS = 12; // Higher = more rounded edge at the head. 0 = flat/sharp.

// // Function to generate a smooth Cubic Bezier curve
// // =========================================================================
// const getSmoothCurvePoints = (
//   tipX: number,
//   controlX: number,
//   yTop: number,
//   yBot: number,
// ) => {
//   // Move Control Points Y towards the center by TENSION
//   const midY = (yTop + yBot) / 2;
//   const cpYTop = yTop - (yTop - midY) * (1 - CURVE_TENSION);
//   const cpYBot = yBot + (midY - yBot) * (1 - CURVE_TENSION);

//   const curve = new THREE.CubicBezierCurve3(
//     new THREE.Vector3(tipX, yTop, 0),
//     new THREE.Vector3(controlX, cpYTop, 0),
//     new THREE.Vector3(controlX, cpYBot, 0),
//     new THREE.Vector3(tipX, yBot, 0),
//   );
//   return curve.getPoints(100);
// };

// const createCometGeometry = (
//   points: THREE.Vector3[],
//   headThick: number,
//   tailThick: number,
// ) => {
//   const geo = new THREE.BufferGeometry();
//   const positions: number[] = [];
//   const uvs: number[] = [];
//   const indices: number[] = [];

//   const up = new THREE.Vector3(0, 0, 1);
//   const tangent = new THREE.Vector3();
//   const normal = new THREE.Vector3();

//   for (let i = 0; i < points.length; i++) {
//     const t = i / (points.length - 1);

//     // Tapering from thick head to thin tail.
//     const taper = Math.pow(1 - t, 2.5);
//     const thickness = tailThick + (headThick - tailThick) * taper;

//     if (i === 0) {
//       tangent.subVectors(points[1], points[0]).normalize();
//     } else if (i === points.length - 1) {
//       tangent.subVectors(points[i], points[i - 1]).normalize();
//     } else {
//       tangent.subVectors(points[i + 1], points[i - 1]).normalize();
//     }

//     normal.crossVectors(tangent, up).normalize();

//     const p1 = new THREE.Vector3()
//       .copy(points[i])
//       .addScaledVector(normal, thickness / 2);
//     const p2 = new THREE.Vector3()
//       .copy(points[i])
//       .addScaledVector(normal, -thickness / 2);

//     positions.push(p1.x, p1.y, p1.z);
//     positions.push(p2.x, p2.y, p2.z);

//     uvs.push(t, 0);
//     uvs.push(t, 1);
//   }

//   // Create rounded cap at the head (index 0) if requested
//   if (COMET_HEAD_ROUNDNESS > 0 && points.length > 1) {
//     const r = headThick / 2;
//     const center = points[0];

//     // Explicitly calculate tangent and normal for point 0 (the head)
//     const startTangent = new THREE.Vector3()
//       .subVectors(points[1], points[0])
//       .normalize();
//     const startNormal = new THREE.Vector3()
//       .crossVectors(startTangent, up)
//       .normalize();

//     // atan2 gets the angle of the normal. We sweep from the normal, backwards, to the negative normal.
//     // normal points to p1, negative normal points to p2.
//     // We sweep in the negative angle direction so the cap is drawn "behind" the head (away from the tail).
//     const startAngle = Math.atan2(startNormal.y, startNormal.x);

//     const centerIdx = positions.length / 3;
//     positions.push(center.x, center.y, center.z);
//     uvs.push(0, 0.5);

//     for (let k = 0; k <= COMET_HEAD_ROUNDNESS; k++) {
//       // Subtracting goes the opposite way to ensure we cap the back, not the front!
//       const angle = startAngle - Math.PI * (k / COMET_HEAD_ROUNDNESS);
//       const px = center.x + Math.cos(angle) * r;
//       const py = center.y + Math.sin(angle) * r;
//       positions.push(px, py, center.z);
//       uvs.push(0, 0);
//     }

//     for (let k = 0; k < COMET_HEAD_ROUNDNESS; k++) {
//       indices.push(centerIdx, centerIdx + 1 + k, centerIdx + 2 + k);
//     }
//   }

//   for (let i = 0; i < points.length - 1; i++) {
//     const v = i * 2;
//     indices.push(v, v + 1, v + 2);
//     indices.push(v + 1, v + 3, v + 2);
//   }

//   geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
//   geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
//   geo.setIndex(indices);
//   geo.computeVertexNormals();

//   return geo;
// };

// // CurveConnection component representing the smooth line WITH SHADOW
// // ===========================================
// const CurveConnection = ({
//   yTop,
//   yBot,
//   controlX,
//   tipX,
//   color,
// }: {
//   yTop: number;
//   yBot: number;
//   controlX: number;
//   tipX: number;
//   color: string;
// }) => {
//   // Memoize the points so it doesn't recalculate on every frame
//   const points = useMemo(
//     () => getSmoothCurvePoints(tipX, controlX, yTop, yBot),
//     [tipX, controlX, yTop, yBot],
//   );

//   // Total number of curve points generates a 0-100 index range (101 points total)
//   const totalPoints = points.length;
//   // Example calculation: if GAP_PERCENT = 40, meaning lines should take 40% of each half (or rather 100 - COMET_GAP_PERCENT = empty gap). Let's convert COMET_GAP_PERCENT to how far each comet line extends.
//   // 100% means they meet in the middle (50% each).
//   // 0% means they don't exist.
//   // COMET_GAP_PERCENT (e.g. 80 means total line length covered is 80%, so each half takes 40%).
//   const coveragePercent = Math.max(1, Math.min(100, 100 - COMET_GAP_PERCENT));
//   const coverRatioHalf = (coveragePercent / 100) * 0.5;
//   const breakPoint = Math.floor(totalPoints * coverRatioHalf);
//   const bottomBreakPoint = Math.ceil(totalPoints * (1 - coverRatioHalf));

//   const upperPoints = useMemo(
//     () => points.slice(0, breakPoint),
//     [points, breakPoint],
//   );

//   const lowerPoints = useMemo(() => {
//     const bottomSlice = points.slice(bottomBreakPoint, totalPoints);
//     return [...bottomSlice].reverse();
//   }, [points, bottomBreakPoint, totalPoints]);

//   const upperGeometry = useMemo(
//     () =>
//       createCometGeometry(upperPoints, COMET_THICKNESS, COMET_TAIL_THICKNESS),
//     [upperPoints],
//   );

//   const lowerGeometry = useMemo(
//     () =>
//       createCometGeometry(lowerPoints, COMET_THICKNESS, COMET_TAIL_THICKNESS),
//     [lowerPoints],
//   );

//   return (
//     <group>
//       {/* Main Colored Tapered Comet Lines */}
//       <mesh geometry={upperGeometry} renderOrder={999}>
//         <meshBasicMaterial
//           color={color}
//           depthTest={false}
//           side={THREE.DoubleSide}
//           transparent={true}
//         />
//       </mesh>

//       <mesh geometry={lowerGeometry} renderOrder={999}>
//         <meshBasicMaterial
//           color={color}
//           depthTest={false}
//           side={THREE.DoubleSide}
//           transparent={true}
//         />
//       </mesh>
//     </group>
//   );
// };

// export const SideCurves = ({ layout, startX }: SideCurvesProps) => {
//   const {
//     s2Pad,
//     sectionW,
//     v6Y,
//     g1Y,
//     g2Y,
//     g3Y,
//     v19Y,
//     bigBoxH,
//     groupPad,
//     smallBoxH2,
//     s2Gap,
//   } = layout;

//   // Calculate perfect Y centers for each verse box
//   const y6 = v6Y - bigBoxH / 2;
//   const y19 = v19Y - bigBoxH / 2;

//   const y8 = g1Y - groupPad - smallBoxH2 / 2;
//   const y10 = g1Y - groupPad - smallBoxH2 - s2Gap - smallBoxH2 / 2;

//   const y12 = g2Y - groupPad - smallBoxH2 / 2;
//   const y14 = g2Y - groupPad - smallBoxH2 - s2Gap - smallBoxH2 / 2;

//   const y16 = g3Y - groupPad - smallBoxH2 / 2;
//   const y18 = g3Y - groupPad - smallBoxH2 - s2Gap - smallBoxH2 / 2;

//   // Base bounding box reference edges (Anchored to the OUTSIDE of SectionTwo)
//   const startX_L = startX - 0.005;
//   const startX_R = startX + sectionW + 0.005;

//   // Destination edges (penetrating inward for standard boxes)
//   const tipX_L = startX_L + CURVE_INWARD_OFFSET;
//   const tipX_R = startX_R - CURVE_INWARD_OFFSET;

//   // Deep penetration destination exception for 12-14 boxes
//   const tipX_12_14_L = startX_L + CURVE_DEEP_OFFSET;
//   const tipX_12_14_R = startX_R - CURVE_DEEP_OFFSET;

//   // Control points calculated outward with CURVE_GAP
//   // These pull the curve outward to create the parenthesis shape
//   const control4_L = startX_L - CURVE_GAP * 1; // 12-14 curve (inner)
//   const control3_L = startX_L - CURVE_GAP * 2; // 10-16 curve
//   const control2_L = startX_L - CURVE_GAP * 3; // 8-18 curve
//   const control1_L = startX_L - CURVE_GAP * 4; // 6-19 curve (outer)

//   const control4_R = startX_R + CURVE_GAP * 1;
//   const control3_R = startX_R + CURVE_GAP * 2;
//   const control2_R = startX_R + CURVE_GAP * 3;
//   const control1_R = startX_R + CURVE_GAP * 4;

//   return (
//     // ensure rendering on top
//     <group position={[0, 0, 0.08]} renderOrder={999}>
//       {/* ================= LEFT CURVES ================= */}
//       <CurveConnection
//         yTop={y6}
//         yBot={y19}
//         controlX={control1_L}
//         tipX={tipX_L}
//         color={BLUE_THEME}
//       />
//       <CurveConnection
//         yTop={y8}
//         yBot={y18}
//         controlX={control2_L}
//         tipX={tipX_L}
//         color={MAROON_THEME}
//       />
//       <CurveConnection
//         yTop={y10}
//         yBot={y16}
//         controlX={control3_L}
//         tipX={tipX_L}
//         color={MAROON_THEME}
//       />
//       {/* Exception for 12-14: deep penetration target */}
//       <CurveConnection
//         yTop={y12}
//         yBot={y14}
//         controlX={control4_L}
//         tipX={tipX_12_14_L}
//         color={GREEN_THEME}
//       />

//       {/* ================= RIGHT CURVES ================= */}
//       <CurveConnection
//         yTop={y6}
//         yBot={y19}
//         controlX={control1_R}
//         tipX={tipX_R}
//         color={BLUE_THEME}
//       />
//       <CurveConnection
//         yTop={y8}
//         yBot={y18}
//         controlX={control2_R}
//         tipX={tipX_R}
//         color={MAROON_THEME}
//       />
//       <CurveConnection
//         yTop={y10}
//         yBot={y16}
//         controlX={control3_R}
//         tipX={tipX_R}
//         color={MAROON_THEME}
//       />
//       {/* Exception for 12-14: deep penetration target */}
//       <CurveConnection
//         yTop={y12}
//         yBot={y14}
//         controlX={control4_R}
//         tipX={tipX_12_14_R}
//         color={GREEN_THEME}
//       />
//     </group>
//   );
// };
