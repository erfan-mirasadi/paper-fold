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
  speed = 0.3, // overall speed of the animation
  arrowSize = 0.015,
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
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const trailMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

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

  // A simple glowing arrow shape
  const arrowShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, arrowSize); // tip
    shape.lineTo(-arrowSize * 0.8, -arrowSize); // bottom left
    shape.lineTo(0, -arrowSize * 0.5); // inner indent
    shape.lineTo(arrowSize * 0.8, -arrowSize); // bottom right
    shape.lineTo(0, arrowSize); // back to tip
    return shape;
  }, [arrowSize]);

  useFrame((state) => {
    if (
      !groupRef.current ||
      !headMaterialRef.current ||
      !trailMaterialRef.current
    )
      return;

    // Create a continuous forward loop with delay
    const time = state.clock.elapsedTime * speed + delay;
    const t = time - Math.floor(time); // Value between 0 and 1

    // Get position and tangent for current t
    const position = centerCurve.getPoint(t);
    const tangent = centerCurve.getTangent(t);

    groupRef.current.position.copy(position);

    // Calculate rotation to face the direction of the curve
    const angle = Math.atan2(tangent.y, tangent.x);
    // Since our custom shape is drawn pointing UP (+Y), we subtract PI/2 to align with X-axis if needed
    groupRef.current.rotation.z = angle - Math.PI / 2;

    // Smooth fade in and out at the edges of the curve
    let opacity = 1;
    const fadeEdges = 0.15;
    if (t < fadeEdges) {
      opacity = t / fadeEdges;
    } else if (t > 1 - fadeEdges) {
      opacity = (1 - t) / fadeEdges;
    }

    headMaterialRef.current.opacity = opacity;
    trailMaterialRef.current.opacity = opacity * 0.4;

    // Add a pulsing effect to the scale
    const pulse = 1 + Math.sin(time * 15) * 0.15;
    groupRef.current.scale.set(pulse, pulse, 1);
  });

  return (
    <group ref={groupRef} renderOrder={1002}>
      {/* Glow / Trail underneath */}
      <mesh renderOrder={1001}>
        <shapeGeometry args={[arrowShape]} />
        <meshBasicMaterial
          ref={trailMaterialRef}
          color={color}
          transparent
          blending={THREE.AdditiveBlending}
          depthTest={false}
        />
      </mesh>

      {/* Core Arrow Head */}
      <mesh renderOrder={1002} scale={[0.8, 0.8, 1]}>
        <shapeGeometry args={[arrowShape]} />
        <meshBasicMaterial
          ref={headMaterialRef}
          color={color}
          transparent
          depthTest={false}
        />
      </mesh>
    </group>
  );
};
