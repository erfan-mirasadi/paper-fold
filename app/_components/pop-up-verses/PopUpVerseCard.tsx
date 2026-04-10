"use client";
import * as THREE from "three";
import { a, SpringValue } from "@react-spring/three";
import { RenderTexture, OrthographicCamera } from "@react-three/drei";
import { VerseBox, RoundedShapeComponent } from "../paper-content/SharedUI";

// ============================================================================
// 3D BRICK & FBO COMPONENT
// Represents a single physical pop-up capsule. Completely isolated.
// ============================================================================

interface PopUpVerseCardProps {
  hingeX: number;
  rowY: number;
  zBaseOffset: number;
  direction: "left" | "right";
  rotValue: SpringValue<number>;
  shadowVal: SpringValue<number>;
  zOffset: SpringValue<number>;
  opacity: SpringValue<number>;
  innerHalfW: number;
  smallBoxH: number;
  boxRadius: number;
  outerW: number;
  outerH: number;
  outerLeft: number;
  outerTop: number;
  bw: number;
  shape: THREE.Shape;
  extrudeSettings: any;
  backfaceColor: string;
  verse: string;
  number: number;
  bg: string;
  border: string;
  circleBorderCol: string;
  circleBg: string;
  circleTextCol: string;
}

export function PopUpVerseCard({
  hingeX,
  rowY,
  zBaseOffset,
  direction,
  rotValue,
  shadowVal,
  zOffset,
  opacity,
  innerHalfW,
  smallBoxH,
  boxRadius,
  outerW,
  outerH,
  outerLeft,
  outerTop,
  bw,
  shape,
  extrudeSettings,
  verse,
  number,
  bg,
  border,
  circleBorderCol,
  circleBg,
  circleTextCol,
}: PopUpVerseCardProps) {
  const shadowXOffset =
    direction === "left"
      ? shadowVal.to((v) => -innerHalfW + 0.008 + v * 0.015)
      : shadowVal.to((v) => 0.008 + v * 0.015);

  const brickGroupXOffset =
    direction === "left" ? -innerHalfW + outerLeft : outerLeft;

  const shrinkX = 0.001;
  const alignX = bw - shrinkX;
  const alignY = -bw;

  const paperBaseColor = "#f2f0e6";

  return (
    <group position={[hingeX, rowY, zBaseOffset]}>
      {/* Dynamic Floor Shadow */}
      <a.mesh
        position-x={shadowXOffset}
        position-y={shadowVal.to((v) => -0.008 - v * 0.03)}
        position-z={-0.001}
        scale={shadowVal.to((v) => 1 + v * 0.03)}
      >
        <RoundedShapeComponent
          w={innerHalfW}
          h={smallBoxH}
          radius={boxRadius}
        />
        <a.meshBasicMaterial
          color="#000000"
          transparent
          opacity={opacity.to(
            (o) => o * (0.32 - (direction === "left" ? 0.27 : 0.24)),
          )}
          depthTest={false}
        />
      </a.mesh>

      {/* The rotating 3D Hinge Group */}
      <a.group rotation-y={rotValue} position-z={zOffset}>
        <group position={[brickGroupXOffset, outerTop, 0]}>
          <mesh position={[0, 0, -0.008]} renderOrder={100}>
            <extrudeGeometry args={[shape, extrudeSettings]} />
            <a.meshStandardMaterial
              color={paperBaseColor}
              transparent={true}
              opacity={opacity}
              depthTest={true}
              depthWrite={true}
              roughness={0.8}
              metalness={0.05}
              envMapIntensity={0.5}
            />
          </mesh>

          <mesh position={[outerW / 2, -outerH / 2, 0.002]} renderOrder={101}>
            <planeGeometry args={[outerW, outerH]} />
            <a.meshStandardMaterial
              color={paperBaseColor}
              transparent={true}
              opacity={opacity}
              depthTest={true}
              depthWrite={true}
              polygonOffset={true}
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
              roughness={0.8}
              metalness={0.05}
              envMapIntensity={0.5}
            >
              <RenderTexture attach="map" width={2048} height={1024} frames={2}>
                <OrthographicCamera
                  makeDefault
                  manual
                  left={0}
                  right={outerW}
                  top={0}
                  bottom={-outerH}
                  position={[0, 0, 10]}
                />

                <group position={[alignX, alignY, 0]}>
                  <VerseBox
                    x={0}
                    y={0}
                    z={0}
                    w={innerHalfW}
                    h={smallBoxH}
                    verse={verse}
                    number={number}
                    bg={bg}
                    border={border}
                    circleBorderCol={circleBorderCol}
                    circleBg={circleBg}
                    circleTextCol={circleTextCol}
                    isPill={true}
                    shadow={false}
                  />
                </group>
              </RenderTexture>
            </a.meshStandardMaterial>
          </mesh>
        </group>
      </a.group>
    </group>
  );
}
