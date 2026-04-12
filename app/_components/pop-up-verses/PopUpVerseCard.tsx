"use client";
import * as THREE from "three";
import { useMemo } from "react";
import { a, SpringValue, to } from "@react-spring/three";
import { RenderTexture, OrthographicCamera } from "@react-three/drei";
import { VerseBox, RoundedShapeComponent } from "../paper-content/SharedUI";
import { SHADOW_CONFIG } from "./useFoldAnimation";

interface PopUpVerseCardProps {
  hingeX: number;
  y: number;
  w: number;
  h: number;
  zBaseOffset: number;
  direction: "left" | "right";
  rotValue: SpringValue<number>;
  foldProgress: SpringValue<number>;
  shadowGlobalOpacity: SpringValue<number>;
  zOffset: SpringValue<number>;
  opacity: SpringValue<number>;
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
  y,
  w,
  h,
  zBaseOffset,
  direction,
  rotValue,
  foldProgress,
  shadowGlobalOpacity,
  zOffset,
  opacity,
  verse,
  number,
  bg,
  border,
  circleBorderCol,
  circleBg,
  circleTextCol,
}: PopUpVerseCardProps) {
  const bw = 0.0055;
  const shrinkX = 0.001;
  const outerW = w - shrinkX * 2 + bw * 2;
  const outerH = h + bw * 2;
  const outerRadius = h / 2 + bw;
  const outerLeft = shrinkX - bw;
  const outerTop = bw;
  const boxRadius = h / 2;
  const alignX = bw - shrinkX;
  const alignY = -bw;

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const r = outerRadius;
    s.moveTo(r, 0);
    s.lineTo(outerW - r, 0);
    s.quadraticCurveTo(outerW, 0, outerW, -r);
    s.lineTo(outerW, -(outerH - r));
    s.quadraticCurveTo(outerW, -outerH, outerW - r, -outerH);
    s.lineTo(r, -outerH);
    s.quadraticCurveTo(0, -outerH, 0, -(outerH - r));
    s.lineTo(0, -r);
    s.quadraticCurveTo(0, 0, r, 0);
    return s;
  }, [outerW, outerH, outerRadius]);

  const extrudeSettings = useMemo(
    () => ({ depth: 0.008, bevelEnabled: false }),
    [],
  );

  const shadowScaleX = foldProgress.to((v) => 1 - v * SHADOW_CONFIG.shrinkX);
  const shadowScaleY = foldProgress.to((v) => 1 - v * SHADOW_CONFIG.shrinkY);

  const shadowXOffset = to([foldProgress, shadowScaleX], (v, scaleX) => {
    if (direction === "left") {
      const shiftCorrection = (1 - scaleX) * w;
      return (
        -w +
        shiftCorrection +
        SHADOW_CONFIG.baseOffsetX +
        v * SHADOW_CONFIG.foldOffsetX
      );
    } else {
      return SHADOW_CONFIG.baseOffsetX + v * SHADOW_CONFIG.foldOffsetX;
    }
  });

  const shadowYOffset = foldProgress.to(
    (v) => SHADOW_CONFIG.baseOffsetY + v * SHADOW_CONFIG.foldOffsetY,
  );

  const finalShadowOpacity = to(
    [shadowGlobalOpacity, foldProgress, opacity],
    (globalOp, foldP, mainOp) => {
      const dynamicOpacity =
        SHADOW_CONFIG.opacityFlat -
        foldP * (SHADOW_CONFIG.opacityFlat - SHADOW_CONFIG.opacityFolded);
      return globalOp * dynamicOpacity * mainOp;
    },
  );

  const brickGroupXOffset = direction === "left" ? -w + outerLeft : outerLeft;
  const paperBaseColor = "#f2f0e6";

  return (
    <a.group
      position={[hingeX, y, zBaseOffset]}
      visible={opacity.to((o) => o > 0.01)}
    >
      <a.mesh
        position-x={shadowXOffset}
        position-y={shadowYOffset}
        position-z={-0.001}
        scale-x={shadowScaleX}
        scale-y={shadowScaleY}
      >
        <RoundedShapeComponent w={w} h={h} radius={boxRadius} />
        <a.meshBasicMaterial
          color="#000000"
          transparent
          opacity={finalShadowOpacity}
          depthTest={false}
        />
      </a.mesh>

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
              <RenderTexture attach="map" width={512} height={256} frames={2}>
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
                    w={w}
                    h={h}
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
    </a.group>
  );
}
