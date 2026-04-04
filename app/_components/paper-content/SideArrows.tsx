// "use client";
// import { Line } from "@react-three/drei";
// import { useMemo } from "react";
// import * as THREE from "three";
// import { BLUE_THEME, MAROON_THEME, GREEN_THEME } from "./SharedUI";

// interface LayoutConfig {
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

// interface SideArrowsProps {
//   layout: LayoutConfig;
//   startX: number;
// }

// // Custom configuration constants for easy tweaking
// // ===============================================
// const LINE_GAP = 0.04; // Controls the gap between the parallel spine lines (user set)
// const ARROW_INWARD_OFFSET = 0.01; // Controls inward penetration for most arrows (user set)
// const ARROW_DEEP_OFFSET = 0.009; // Controls the 12-14 penetration exception (user set)

// const ARROW_SCALE = 1.5;

// // Base arrow notch magnitude (for line shortening logic)
// const BASE_NOTCH_DEPTH = 0.008;

// // Flawless geometric arrowhead component with customizable scaling
// // =============================================================
// const ArrowHead = ({
//   x,
//   y,
//   color,
//   pointTo,
// }: {
//   x: number;
//   y: number;
//   color: string;
//   pointTo: "right" | "left";
// }) => {
//   const shape = useMemo(() => {
//     const s = new THREE.Shape();
//     // Draws a clean, sharp right-pointing arrow scaled by ARROW_SCALE
//     s.moveTo(0, 0); // Tip
//     s.lineTo(-0.012 * ARROW_SCALE, 0.008 * ARROW_SCALE); // Top Back corner
//     s.lineTo(-BASE_NOTCH_DEPTH * ARROW_SCALE, 0); // Inner Notch (connection point)
//     s.lineTo(-0.012 * ARROW_SCALE, -0.008 * ARROW_SCALE); // Bot Back corner
//     s.lineTo(0, 0); // return to Tip
//     return s;
//   }, []);

//   return (
//     <mesh
//       position={[x, y, 0.001]}
//       rotation={[0, 0, pointTo === "right" ? 0 : Math.PI]}
//       renderOrder={999} // ensure always on top
//     >
//       <shapeGeometry args={[shape]} />
//       <meshBasicMaterial color={color} depthTest={false} />
//     </mesh>
//   );
// };

// // Function to generate smooth rounded points, now shortened to meet arrow notch
// // =========================================================================
// const getRoundedBracketPoints = (
//   tipX: number,
//   spineX: number,
//   yTop: number,
//   yBot: number,
//   side: "left" | "right",
// ) => {
//   const r = 0.015; // smoothness of corners
//   const dir = side === "left" ? 1 : -1; // direction vector inward (left side is pos X toward boxes)

//   // CALCULATE SHORTENING: Offset from tip to the inner notch meeting point
//   const currentNotchOffset = BASE_NOTCH_DEPTH * ARROW_SCALE;

//   // New connection points (shortened relative to tipX)
//   const connectionX = tipX - dir * currentNotchOffset;

//   const path = new THREE.Path();
//   path.moveTo(connectionX, yTop); // Start at meeting point
//   path.lineTo(spineX + dir * r, yTop); // straight top segment toward spine
//   path.quadraticCurveTo(spineX, yTop, spineX, yTop - r); // Top corner curve
//   path.lineTo(spineX, yBot + r); // vertical spine segment
//   path.quadraticCurveTo(spineX, yBot, spineX + dir * r, yBot); // Bot corner curve
//   path.lineTo(connectionX, yBot); // End at meeting point

//   // Generate 3D vectors
//   return path.getPoints(50).map((p) => new THREE.Vector3(p.x, p.y, 0));
// };

// // Bracket component representing the connection
// const Bracket = ({
//   yTop,
//   yBot,
//   spineX,
//   tipX,
//   color,
//   side,
// }: {
//   yTop: number;
//   yBot: number;
//   spineX: number;
//   tipX: number;
//   color: string;
//   side: "left" | "right";
// }) => {
//   // get shortened rounded points
//   const points = getRoundedBracketPoints(tipX, spineX, yTop, yBot, side);

//   return (
//     <group>
//       {/* Shortened rounded line bracket */}
//       <Line
//         points={points}
//         color={color}
//         lineWidth={3.5}
//         depthTest={false}
//         renderOrder={999}
//       />
//       {/* Arrowheads at both ends (placed exactly at tipX target) */}
//       <ArrowHead
//         x={tipX}
//         y={yTop}
//         color={color}
//         pointTo={side === "left" ? "right" : "left"}
//       />
//       <ArrowHead
//         x={tipX}
//         y={yBot}
//         color={color}
//         pointTo={side === "left" ? "right" : "left"}
//       />
//     </group>
//   );
// };

// export const SideArrows = ({ layout, startX }: SideArrowsProps) => {
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

//   // Base bounding box reference edges
//   const startX_L = startX + s2Pad - 0.005;
//   const startX_R = startX + sectionW - s2Pad + 0.005;

//   // Arrow Tip destination edges (penetrating inward for standard boxes)
//   const tipX_L = startX_L + ARROW_INWARD_OFFSET;
//   const tipX_R = startX_R - ARROW_INWARD_OFFSET;

//   // Arrow Tip deep penetration destination exception for 12-14 boxes
//   const tipX_12_14_L = startX_L + ARROW_DEEP_OFFSET;
//   const tipX_12_14_R = startX_R - ARROW_DEEP_OFFSET;

//   // Spines calculated outward with LINE_GAP from refernce edge
//   const spine4_L = startX_L - LINE_GAP * 1; // 12-14 spine (inner)
//   const spine3_L = startX_L - LINE_GAP * 2; // 10-16 spine
//   const spine2_L = startX_L - LINE_GAP * 3; // 8-18 spine
//   const spine1_L = startX_L - LINE_GAP * 4; // 6-19 spine (outer)

//   const spine4_R = startX_R + LINE_GAP * 1;
//   const spine3_R = startX_R + LINE_GAP * 2;
//   const spine2_R = startX_R + LINE_GAP * 3;
//   const spine1_R = startX_R + LINE_GAP * 4;

//   return (
//     // ensure rendering on top
//     <group position={[0, 0, 0.08]} renderOrder={999}>
//       {/* ================= LEFT BRACKETS ================= */}
//       <Bracket
//         yTop={y6}
//         yBot={y19}
//         spineX={spine1_L}
//         tipX={tipX_L}
//         color={BLUE_THEME}
//         side="left"
//       />
//       <Bracket
//         yTop={y8}
//         yBot={y18}
//         spineX={spine2_L}
//         tipX={tipX_L}
//         color={MAROON_THEME}
//         side="left"
//       />
//       <Bracket
//         yTop={y10}
//         yBot={y16}
//         spineX={spine3_L}
//         tipX={tipX_L}
//         color={MAROON_THEME}
//         side="left"
//       />
//       {/* Exception for 12-14: deep penetration target */}
//       <Bracket
//         yTop={y12}
//         yBot={y14}
//         spineX={spine4_L}
//         tipX={tipX_12_14_L}
//         color={GREEN_THEME}
//         side="left"
//       />

//       {/* ================= RIGHT BRACKETS ================= */}
//       <Bracket
//         yTop={y6}
//         yBot={y19}
//         spineX={spine1_R}
//         tipX={tipX_R}
//         color={BLUE_THEME}
//         side="right"
//       />
//       <Bracket
//         yTop={y8}
//         yBot={y18}
//         spineX={spine2_R}
//         tipX={tipX_R}
//         color={MAROON_THEME}
//         side="right"
//       />
//       <Bracket
//         yTop={y10}
//         yBot={y16}
//         spineX={spine3_R}
//         tipX={tipX_R}
//         color={MAROON_THEME}
//         side="right"
//       />
//       {/* Exception for 12-14: deep penetration target */}
//       <Bracket
//         yTop={y12}
//         yBot={y14}
//         spineX={spine4_R}
//         tipX={tipX_12_14_R}
//         color={GREEN_THEME}
//         side="right"
//       />
//     </group>
//   );
// };
