"use client";
import * as THREE from "three";
import { useMemo } from "react";
import { a, SpringValue, to } from "@react-spring/three";
import {
  RenderTexture,
  OrthographicCamera,
  useTexture,
} from "@react-three/drei";
import {
  VerseBox,
  RoundedShapeComponent,
  AnaAyetTab,
} from "../SurahLayout/SharedUI";
import { SHADOW_CONFIG } from "../../../hooks/useFoldAnimation";
import {
  ELEVATE_TIMING,
  SECTION_ELEVATION_HEIGHT,
} from "../../../hooks/useElevateAnimation";
import { useSurahLanguageStore } from "../../../hooks/useSurahLanguageStore";

export interface VerseMeshProps {
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
  opacity: any;
  liftZ: SpringValue<number>;
  surfaceLiftZ: SpringValue<number>;
  tiltX: SpringValue<number>;
  horizontalTiltX: SpringValue<number>;
  horizontalLiftZ: SpringValue<number>;
  horizontalPivotOffsetY: number;
  scale: SpringValue<number>;
  elevateShadowOpacity: SpringValue<number>;
  elevateOpacity: any;
  isPill?: boolean;
  backfaceColor: string;
  verse: string;
  number: number;
  bg: string;
  border: string;
  circleBorderCol: string;
  circleBg: string;
  circleTextCol: string;
  textColor?: string;
  suppressShadow?: boolean;
  shadowRenderOrder?: number;
  customFrameSvg?: string;
  frameScaleLTR?: number;
  anaAyetTab?: {
    x: number;
    y: number;
    w: number;
    h: number;
    borderWidth: number;
    labelDrop?: number;
  };
}

function BorderSvg({
  w,
  h,
  assetUrl,
  opacity,
  elevateOpacity,
  frameScaleLTR,
}: {
  w: number;
  h: number;
  assetUrl: string;
  opacity: any;
  elevateOpacity: SpringValue<number>;
  frameScaleLTR?: number;
}) {
  const texture = useTexture(assetUrl, (t: any) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

  const activeLanguage = useSurahLanguageStore.getState().activeLanguage;
  const isArabic = activeLanguage === "ar";
  
  const widthScale = 0.8;
  const heightScale = 0.93;
  
  const frameScaleMult = (!isArabic && frameScaleLTR) ? frameScaleLTR : 1.0;

  const renderW = w * widthScale * frameScaleMult;
  const renderH = h * heightScale * frameScaleMult;

  return (
    <mesh position={[w / 2, -h / 2, 0.01]} renderOrder={102}>
      <planeGeometry args={[renderW, renderH]} />
      <a.meshBasicMaterial
        map={texture as any}
        transparent
        depthTest={true}
        depthWrite={false}
        toneMapped={false}
        opacity={to([opacity, elevateOpacity], (o1, o2) => Math.max(o1, o2))}
      />
    </mesh>
  );
}

export function VerseMesh({
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
  liftZ,
  surfaceLiftZ,
  tiltX,
  horizontalTiltX,
  horizontalLiftZ,
  horizontalPivotOffsetY,
  scale,
  elevateShadowOpacity,
  elevateOpacity,
  isPill = true,
  verse,
  number,
  bg,
  border,
  circleBorderCol,
  circleBg,
  circleTextCol,
  textColor,
  suppressShadow = false,
  shadowRenderOrder,
  customFrameSvg,
  frameScaleLTR,
  anaAyetTab,
}: VerseMeshProps) {
  const normalizeLiftProgress = (lift: number) => {
    const ratio = lift / ELEVATE_TIMING.liftHeight;
    return Math.max(0, Math.min(1, ratio));
  };

  const normalizeSurfaceLiftProgress = (surfaceLift: number) => {
    const ratio = surfaceLift / SECTION_ELEVATION_HEIGHT;
    return Math.max(0, Math.min(1, ratio));
  };

  const bw = 0.0055;
  const shrinkX = isPill ? 0.001 : 0;
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

  const shadowScaleX = to(
    [foldProgress, liftZ, surfaceLiftZ],
    (foldP, lift, surfaceLift) => {
      const foldScale = 1 - foldP * SHADOW_CONFIG.shrinkX;
      const surfaceProgress = normalizeSurfaceLiftProgress(surfaceLift);
      const surfaceDampen =
        1 - surfaceProgress * SHADOW_CONFIG.surfaceScaleDampen;
      const liftScaleBoost =
        normalizeLiftProgress(lift) * (SHADOW_CONFIG.elevateScaleX - 1);
      const liftScale = 1 + liftScaleBoost * surfaceDampen;
      return foldScale * liftScale;
    },
  );

  const shadowScaleY = to(
    [foldProgress, liftZ, surfaceLiftZ],
    (foldP, lift, surfaceLift) => {
      const foldScale = 1 - foldP * SHADOW_CONFIG.shrinkY;
      const surfaceProgress = normalizeSurfaceLiftProgress(surfaceLift);
      const surfaceDampen =
        1 - surfaceProgress * SHADOW_CONFIG.surfaceScaleDampen;
      const liftScaleBoost =
        normalizeLiftProgress(lift) * (SHADOW_CONFIG.elevateScaleY - 1);
      const liftScale = 1 + liftScaleBoost * surfaceDampen;
      return foldScale * liftScale;
    },
  );

  const shadowXOffset = to(
    [foldProgress, shadowScaleX, surfaceLiftZ],
    (v, scaleX, surfaceLift) => {
      const surfaceProgress = normalizeSurfaceLiftProgress(surfaceLift);
      const baseRightBias =
        SHADOW_CONFIG.baseOffsetX +
        SHADOW_CONFIG.directionBiasX * surfaceProgress +
        v * SHADOW_CONFIG.foldOffsetX;

      if (direction === "left") {
        const leftAnchorCompensation =
          1 - surfaceProgress * (1 - SHADOW_CONFIG.leftAnchorCompensation);
        const shiftCorrection = (1 - scaleX) * w * leftAnchorCompensation;
        return -w + shiftCorrection + baseRightBias;
      }

      return baseRightBias;
    },
  );

  const shadowYOffset = foldProgress.to(
    (v) => SHADOW_CONFIG.baseOffsetY + v * SHADOW_CONFIG.foldOffsetY,
  );

  const finalShadowOpacity = to(
    [shadowGlobalOpacity, foldProgress, opacity, elevateShadowOpacity, liftZ],
    (globalOp, foldP, mainOp, elShadowOp, lift) => {
      if (suppressShadow) return 0;
      const dynamicOpacity =
        SHADOW_CONFIG.opacityFlat -
        foldP * (SHADOW_CONFIG.opacityFlat - SHADOW_CONFIG.opacityFolded);
      const foldShadowOpacity = globalOp * dynamicOpacity * mainOp;
      const elevateShadowLiftOpacity =
        elShadowOp *
        Math.pow(
          normalizeLiftProgress(lift),
          SHADOW_CONFIG.elevateOpacityFalloff,
        );

      return Math.max(foldShadowOpacity, elevateShadowLiftOpacity);
    },
  );

  const brickGroupXOffset = direction === "left" ? -w + outerLeft : outerLeft;
  const paperBaseColor = "#E4DFCA";

  const materialsProps = useMemo(() => {
    return {
      shadow: {
        color: "#000000",
        transparent: true,
        depthTest: true,
        depthWrite: false,
        toneMapped: false,
      },
      front: {
        color: paperBaseColor,
        transparent: true,
        depthTest: true,
        depthWrite: true,
        roughness: 0.8,
        metalness: 0.05,
        envMapIntensity: 0.5,
      },
      back: {
        color: paperBaseColor,
        transparent: true,
        depthTest: true,
        depthWrite: true,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
        roughness: 0.8,
        metalness: 0.05,
        envMapIntensity: 0.5,
      },
    };
  }, []);

  return (
    <a.group
      position-x={hingeX}
      position-y={y}
      position-z={to([zBaseOffset, zOffset, liftZ], (b, z, l) => b + z + l)}
      visible={to(
        [opacity, elevateOpacity],
        (o1, o2) => Math.max(o1, o2) > 0.01,
      )}
    >
      <a.group position-y={horizontalPivotOffsetY}>
        <a.group rotation-x={horizontalTiltX} position-z={horizontalLiftZ}>
          <a.group position-y={-horizontalPivotOffsetY}>
            <a.mesh
              position-x={shadowXOffset}
              position-y={shadowYOffset}
              renderOrder={shadowRenderOrder ?? 90}
              position-z={to([liftZ, surfaceLiftZ], (lift, surfaceLift) => {
                const surfaceProgress =
                  normalizeSurfaceLiftProgress(surfaceLift);
                const surfaceZBias =
                  SHADOW_CONFIG.surfaceLiftZBias * surfaceProgress;
                return (
                  SHADOW_CONFIG.baseInsetZ - lift + surfaceLift + surfaceZBias
                );
              })}
              scale-x={shadowScaleX}
              scale-y={shadowScaleY}
            >
              <RoundedShapeComponent w={w} h={h} radius={boxRadius} />
              <a.meshBasicMaterial
                {...materialsProps.shadow}
                opacity={finalShadowOpacity}
              />
            </a.mesh>

            <a.group rotation-x={tiltX} scale={scale}>
              <a.group rotation-y={rotValue} position-z={zOffset}>
                <group position={[brickGroupXOffset, outerTop, 0]}>
                  <mesh position={[0, 0, -0.008]} renderOrder={100}>
                    <extrudeGeometry args={[shape, extrudeSettings]} />
                    <a.meshStandardMaterial
                      {...materialsProps.front}
                      opacity={to([opacity, elevateOpacity], (o1, o2) =>
                        Math.max(o1, o2),
                      )}
                    />
                  </mesh>

                  {customFrameSvg && (
                    <BorderSvg
                      w={outerW}
                      h={outerH}
                      assetUrl={customFrameSvg}
                      opacity={opacity}
                      elevateOpacity={elevateOpacity}
                      frameScaleLTR={frameScaleLTR}
                    />
                  )}

                  <mesh
                    position={[outerW / 2, -outerH / 2, 0.002]}
                    renderOrder={101}
                  >
                    <planeGeometry args={[outerW, outerH]} />
                    <a.meshStandardMaterial
                      {...materialsProps.back}
                      opacity={to([opacity, elevateOpacity], (o1, o2) =>
                        Math.max(o1, o2),
                      )}
                    >
                      <RenderTexture
                        attach="map"
                        width={512}
                        height={256}
                        frames={8}
                      >
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
                            textColor={textColor}
                            isPill={isPill}
                            shadow={false}
                            verseTextEnterDurationMs={0}
                          />
                        </group>
                      </RenderTexture>
                    </a.meshStandardMaterial>
                  </mesh>
                </group>

                {/* AnaAyetTab – inside the fold transform hierarchy */}
                {anaAyetTab &&
                  (() => {
                    const labelW = anaAyetTab.w;
                    const labelH = anaAyetTab.h;
                    const ANA_LABEL_PIN_OVERLAP = 0.0015;
                    const labelDrop = anaAyetTab.labelDrop ?? 0.015;

                    // Use the exact config coordinates passed by surahDataGenerator.
                    // The tab is a sibling to the brick group (not a child), so it does
                    // NOT inherit the [outerLeft, outerTop] offsets. We can use the native
                    // relative coordinates calculated in the generator perfectly.
                    return (
                      <group
                        position={[anaAyetTab.x, anaAyetTab.y, 0.01 + 0.0025]}
                      >
                        <AnaAyetTab
                          x={0}
                          y={0}
                          w={labelW}
                          h={labelH}
                          z={0}
                          borderWidth={anaAyetTab.borderWidth}
                          renderOrder={110}
                        />
                      </group>
                    );
                  })()}
              </a.group>
            </a.group>
          </a.group>
        </a.group>
      </a.group>
    </a.group>
  );
}
