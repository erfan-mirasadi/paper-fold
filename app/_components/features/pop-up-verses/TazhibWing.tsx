import * as THREE from "three";
import { useMemo } from "react";
import { Line } from "@react-three/drei";

export function TazhibWing({
  side,
  height,
  width,
  radius,
  color = "#b30000", // Main border color (Red)
  innerColor = "#1a1a1a", // Inner lines color (Black)
  lineWidth = 2.5, // Thicker main border
  innerLineWidth = 1, // Thinner inner lines
  position = [0, 0, 0],
}: {
  side: "left" | "right";
  height: number;
  width: number;
  radius: number;
  color?: string;
  innerColor?: string;
  lineWidth?: number;
  innerLineWidth?: number;
  position?: [number, number, number];
}) {
  const { mainPaths, innerPaths } = useMemo(() => {
    // Mirror X coordinates if the wing is on the left side
    const dir = side === "left" ? -1 : 1;
    const w = width;
    const h = height;
    const r = radius;

    // Define main Y coordinate anchor points based on the central box
    const y_top = -r;
    const y_mid = -h / 2;
    const y_bot = -h + r;

    // Calculate equal spacing for the 4 inner lines originating from the box edge
    const span = h / 2 - r;
    const dy = span / 3;

    // Inner line starting points on the Y axis
    const y_inTopOuter = y_top - dy;
    const y_inTopInner = y_top - 2 * dy;
    const y_inBotInner = y_mid - dy;
    const y_inBotOuter = y_mid - 2 * dy;

    // The precise convergence node (Knot Point)
    const knotX = w * 0.82;
    const knotY = y_mid;

    // Helper function to generate Cubic Bezier curves with directional mirroring
    const makeCubic = (
      p0: number[],
      p1: number[],
      p2: number[],
      p3: number[],
    ) => {
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(p0[0] * dir, p0[1], 0),
        new THREE.Vector3(p1[0] * dir, p1[1], 0),
        new THREE.Vector3(p2[0] * dir, p2[1], 0),
        new THREE.Vector3(p3[0] * dir, p3[1], 0),
      );
      return curve.getPoints(50).map((v) => [v.x, v.y, 0]);
    };

    // Helper function to generate straight lines
    const makeLine = (p0: number[], p1: number[]) => [
      [p0[0] * dir, p0[1], 0],
      [p1[0] * dir, p1[1], 0],
    ];

    // --- 1. MAIN BORDER (Thicker Red Lines) ---
    // Top and bottom outer boundaries leading to the knot
    const outerTop = makeCubic(
      [0, y_top],
      [w * 0.4, y_top],
      [w * 0.6, y_mid + h * 0.15],
      [knotX, knotY],
    );
    const outerBot = makeCubic(
      [0, y_bot],
      [w * 0.4, y_bot],
      [w * 0.6, y_mid - h * 0.15],
      [knotX, knotY],
    );

    // The tail loops extending beyond the knot point
    const tailTop = makeCubic(
      [knotX, knotY],
      [knotX + w * 0.1, y_mid + h * 0.12],
      [w * 0.95, y_mid + h * 0.05],
      [w * 1.05, y_mid],
    );
    const tailBot = makeCubic(
      [knotX, knotY],
      [knotX + w * 0.1, y_mid - h * 0.12],
      [w * 0.95, y_mid - h * 0.05],
      [w * 1.05, y_mid],
    );

    // --- 2. INNER DESIGN LINES (Thinner Black Lines) ---
    // Deep arching outer lines crossing the center line
    const innerTopOuter = makeCubic(
      [0, y_inTopOuter],
      [w * 0.35, y_inTopOuter],
      [w * 0.55, y_mid - (y_inTopOuter - y_mid) * 1.8], // Control point dips deeply below center
      [knotX, knotY],
    );
    const innerBotOuter = makeCubic(
      [0, y_inBotOuter],
      [w * 0.35, y_inBotOuter],
      [w * 0.55, y_mid + (y_mid - y_inBotOuter) * 1.8], // Control point arches deeply above center
      [knotX, knotY],
    );

    // Shallower arching inner lines crossing the center line
    const innerTopInner = makeCubic(
      [0, y_inTopInner],
      [w * 0.4, y_inTopInner],
      [w * 0.6, y_mid - (y_inTopInner - y_mid) * 1.3],
      [knotX, knotY],
    );
    const innerBotInner = makeCubic(
      [0, y_inBotInner],
      [w * 0.4, y_inBotInner],
      [w * 0.6, y_mid + (y_mid - y_inBotInner) * 1.3],
      [knotX, knotY],
    );

    // The straight horizontal line passing right through the middle and the knot
    const centerLine = makeLine([0, y_mid], [w * 1.05, y_mid]);

    return {
      mainPaths: [outerTop, outerBot, tailTop, tailBot],
      innerPaths: [
        innerTopOuter,
        innerTopInner,
        innerBotInner,
        innerBotOuter,
        centerLine,
      ],
    };
  }, [side, height, width, radius]);

  return (
    <group position={position}>
      {/* Rendering the thick main borders */}
      {mainPaths.map((points, idx) => (
        <Line
          key={`main-${idx}`}
          // @ts-ignore
          points={points}
          color={color}
          lineWidth={lineWidth}
          transparent
          opacity={0.9}
          renderOrder={105}
        />
      ))}

      {/* Rendering the thin, intersecting inner lines */}
      {innerPaths.map((points, idx) => (
        <Line
          key={`inner-${idx}`}
          // @ts-ignore
          points={points}
          color={innerColor}
          lineWidth={innerLineWidth}
          transparent
          opacity={0.8}
          renderOrder={106} // Render slightly above main border to prevent z-fighting
        />
      ))}
    </group>
  );
}
