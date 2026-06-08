"use client";

import { a, to, useSpring, type SpringValue } from "@react-spring/three";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { RoundedShapeComponent } from "../SurahLayout/SharedUI";
import {
  ScallopedCenteredShape,
  SCALLOP_RADIUS_X,
  SCALLOP_RADIUS_Y,
  S1_SOLID_SCALE_X,
  S1_SOLID_SCALE_Y,
  S1_SOLID_Y_OFFSET,
  S1_IMAGE_SCALE,
  S1_IMAGE_Y_OFFSET,
} from "../SurahLayout/SectionOne";
import {
  S2_TOP_SOLID_SCALE_X,
  S2_TOP_SOLID_SCALE_Y,
  S2_TOP_SOLID_X_OFFSET,
  S2_TOP_SOLID_Y_OFFSET,
  S2_TOP_IMAGE_SCALE_X,
  S2_TOP_IMAGE_SCALE_Y,
  S2_TOP_IMAGE_X_OFFSET,
  S2_TOP_IMAGE_Y_OFFSET,
  S2_BOTTOM_SOLID_SCALE_X,
  S2_BOTTOM_SOLID_SCALE_Y,
  S2_BOTTOM_SOLID_X_OFFSET,
  S2_BOTTOM_SOLID_Y_OFFSET,
  S2_BOTTOM_IMAGE_SCALE_X,
  S2_BOTTOM_IMAGE_SCALE_Y,
  S2_BOTTOM_IMAGE_X_OFFSET,
  S2_BOTTOM_IMAGE_Y_OFFSET,
} from "../SurahLayout/SectionTwo";
import { OPPOSITE_VERSE_CONNECTOR } from "../../../data/SurahConfig";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { Color, LinearFilter, SRGBColorSpace, type Texture } from "three";
import { SectionTransforms, RowConnectorTransform } from "../../../data/schema";

import {
  HOLLOW_CONNECTOR_INNER_BG_1_3,
  SECTION_BG_TEXTURE,
  S1_INNER_BORDER,
  MAROON_THEME,
  GREEN_THEME,
  S1_FRAME_BG_COLOR,
  S2_FRAME_BG_COLOR,
  S1_FRAME_IMAGE,
  S2_FRAME_IMAGE,
} from "../../../data/theme";
import { PAGE_DEPTH } from "../3d-scene/SinglePaper";
import {
  ELEVATED_RETURN_SYNC_MS,
  useElevatedStore,
  type ElevatedSectionId,
} from "../../../stores/useElevatedStore";
import { dragEngine } from "../../../utils/dragEngine";
import { useElevatedDrag } from "../../../hooks/useElevatedDrag";
import { useFoldStore } from "../orchestrator/ScrollManager";
import {
  calculateSectionBounds,
  type SectionBounds,
} from "../../../utils/boundsHelper";
import { PAPER_MATERIAL_CONFIG } from "../3d-scene/PaperMaterial";
import { ALAK_LAYOUT_CONFIG } from "../../../data/SurahConfig";
import { cloneTextureAsAspectCover } from "../../../utils/textureFit";
import { useIntroSectionOffset } from "../../../hooks/useIntroSectionAnimation";
import { IntroGuide3DReporter } from "../intro/section-guides/IntroGuide3DReporter";
import { SECTION_ELEVATION_HEIGHT } from "../../../hooks/useElevateAnimation";

/**
 * SurahLayout draws section JPEG with meshBasic + toneMapped false, then the page
 * multiplies paper tint. Elevated uses the same basic path (no extra IBL) so it
 * matches the bitmap; slightly under paper base so it does not read brighter than
 * the folded page panel.
 */
const TEXTURE_FILL_TINT = new Color(PAPER_MATERIAL_CONFIG.color).multiplyScalar(
  1.3,
);

type SectionSpring = {
  liftZ: SpringValue<number>;
  opacity: any;
  shadowOpacity: SpringValue<number>;
  shadowVisibility: SpringValue<number>;
};

const SECTION_SURFACE = {
  liftHeight: SECTION_ELEVATION_HEIGHT,
  liftDelayMs: 120,
  opacityShowDelayMs: 0,
  opacityHideDelayMs: ELEVATED_RETURN_SYNC_MS,
  shadowOpacity: 0.12,
  spring: {
    mass: 2.2,
    tension: 85,
    friction: 22,
  },
  /** Snappier hide so we spend less time semi-transparent over the page (gray haze). */
  opacityHideSpring: { mass: 0.75, tension: 320, friction: 28 },
};

const VERSE_MIMIC_SHADOW = {
  offsetX: 0,
  offsetY: -0.004,
  insetZ: -0.001,
  scale: 1.05,
  opacityFlat: 0.28,
};

function useSectionSurfaceSpring(
  isActive: boolean,
  sectionId: ElevatedSectionId,
): SectionSpring {
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const isFoldedMainPaper = useFoldStore(
    (s) => !s.isIntroActive && s.currentOffset < 0.98,
  );
  const [prevIntroActive, setPrevIntroActive] = useState(isIntroActive);
  const justLeftIntro = !isIntroActive && prevIntroActive;

  const actuallyActive = isActive && !isFoldedMainPaper;

  if (isIntroActive !== prevIntroActive) {
    setPrevIntroActive(isIntroActive);
  }

  const { liftZ } = useSpring({
    liftZ: actuallyActive ? SECTION_SURFACE.liftHeight : 0,
    from: { liftZ: 0 },
    delay: actuallyActive ? SECTION_SURFACE.liftDelayMs : 0,
    config: SECTION_SURFACE.spring,
  });

  const { opacity } = useSpring({
    opacity: actuallyActive ? 1 : 0,
    from: { opacity: 0 },
    delay: actuallyActive
      ? SECTION_SURFACE.opacityShowDelayMs
      : isIntroActive || sectionId === ALAK_LAYOUT_CONFIG.sections[0].id || !justLeftIntro
        ? SECTION_SURFACE.opacityHideDelayMs
        : 0,
    immediate: actuallyActive || (justLeftIntro && sectionId !== ALAK_LAYOUT_CONFIG.sections[0].id), // Snap to 0 instantly ONLY when leaving the intro!
    config: actuallyActive
      ? SECTION_SURFACE.spring
      : SECTION_SURFACE.opacityHideSpring,
  });

  const { shadowOpacity } = useSpring({
    shadowOpacity: actuallyActive ? SECTION_SURFACE.shadowOpacity : 0,
    from: { shadowOpacity: 0 },
    delay: 0,
    config: SECTION_SURFACE.spring,
  });

  const { shadowVisibility } = useSpring({
    shadowVisibility: actuallyActive ? 1 : 0,
    from: { shadowVisibility: 0 },
    delay: 0,
    config: SECTION_SURFACE.spring,
  });

  return { liftZ, opacity, shadowOpacity, shadowVisibility };
}

export function useHandoffOpacity(
  baseOpacity: SpringValue<number>,
  sectionId: ElevatedSectionId | null,
) {
  const [{ handoffOpacity }, api] = useSpring(() => ({ handoffOpacity: 1 }));
  const prevIntroActiveRef = useRef(true);

  useEffect(() => {
    // Sync opacity directly to the store without triggering React re-renders
    return useFoldStore.subscribe((state) => {
      const targetOpacity =
        state.isIntroActive && sectionId && sectionId !== ALAK_LAYOUT_CONFIG.sections[0].id
          ? 1 - state.introHandoffProgress
          : 1;

      const justEnteredIntro =
        state.isIntroActive && !prevIntroActiveRef.current;
      prevIntroActiveRef.current = state.isIntroActive;

      api.start({
        handoffOpacity: targetOpacity,
        immediate: !state.isIntroActive || justEnteredIntro, // Snap back if intro ends, AND snap to 0 if we just re-entered it
        config: { mass: 0.5, tension: 400, friction: 30 }, // Very responsive spring to match scroll
      });
    });
  }, [api, sectionId]);

  // Multiply the base opacity (from Elevated toggles) by the handoff opacity
  return to([baseOpacity, handoffOpacity], (base, handoff) => base * handoff);
}

// ─── Pure visual layer, no drag logic ──────────────────────────────────
interface ElevatedLayerProps {
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
  color: string;
  spring: SectionSpring;
  zOffset?: number;
  shadow?: boolean;
  shadowStrength?: number;
  shadowInsetZ?: number;
  sectionBgTexture?: Texture | null;
  /** When true the shadow is fully suppressed (e.g. during intro flight). */
  suppressShadow?: boolean;
}

function ElevatedLayer({
  x,
  y,
  w,
  h,
  radius,
  color,
  spring,
  zOffset = 0,
  shadow = false,
  shadowStrength = 1,
  shadowInsetZ = VERSE_MIMIC_SHADOW.insetZ,
  sectionBgTexture = null,
  suppressShadow = false,
}: ElevatedLayerProps) {
  const runtime = useSurahLayoutRuntime();
  const PAGE_WIDTH = runtime.PAGE_WIDTH;
  const usesTextureFill = sectionBgTexture != null;
  const baseZ = PAGE_DEPTH / 2 + 0.001 + zOffset;
  const fittedSectionBgTexture = useMemo(() => {
    if (!sectionBgTexture) return null;
    const tex = cloneTextureAsAspectCover(sectionBgTexture, w, h, undefined, {
      offset: { y: -0.05 },
    });
    tex.generateMipmaps = false;
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.anisotropy = 1;
    tex.needsUpdate = true;
    return tex;
  }, [sectionBgTexture, w, h]);

  useEffect(() => {
    const tex = fittedSectionBgTexture;
    return () => {
      tex?.dispose();
    };
  }, [fittedSectionBgTexture]);

  return (
    <a.group
      position={[x - PAGE_WIDTH / 2, y, 0]}
      position-z={to(spring.liftZ, (lift) => baseZ + lift)}
    >
      {shadow && (
        <a.mesh
          renderOrder={-1}
          position={[VERSE_MIMIC_SHADOW.offsetX, VERSE_MIMIC_SHADOW.offsetY, 0]}
          position-z={to(spring.liftZ, (lift) => shadowInsetZ - lift)}
          scale-x={to(
            spring.liftZ,
            (lift) =>
              1 +
              (lift / SECTION_SURFACE.liftHeight) *
                (VERSE_MIMIC_SHADOW.scale - 1),
          )}
          scale-y={to(
            spring.liftZ,
            (lift) =>
              1 +
              (lift / SECTION_SURFACE.liftHeight) *
                (VERSE_MIMIC_SHADOW.scale - 1),
          )}
        >
          <RoundedShapeComponent w={w} h={h} radius={radius} />
          <a.meshBasicMaterial
            color="#000000"
            transparent
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
            opacity={to(
              [spring.shadowOpacity, spring.shadowVisibility],
              (shadowOp, vis) =>
                suppressShadow
                  ? 0
                  : Math.max(vis * VERSE_MIMIC_SHADOW.opacityFlat, shadowOp) *
                    shadowStrength,
            )}
          />
        </a.mesh>
      )}

      <a.mesh>
        <RoundedShapeComponent w={w} h={h} radius={radius} />
        {usesTextureFill ? (
          <a.meshBasicMaterial
            map={fittedSectionBgTexture as any}
            color={TEXTURE_FILL_TINT as any}
            transparent
            opacity={spring.opacity as any}
            toneMapped={false}
          />
        ) : (
          <a.meshBasicMaterial
            color={color}
            transparent
            opacity={spring.opacity as any}
            toneMapped
          />
        )}
      </a.mesh>
    </a.group>
  );
}

// ─── SVG Frame layer for custom section designs ────────────────────────
interface ElevatedSvgFrameProps {
  centerX: number;
  centerY: number;
  w: number;
  h: number;
  solidColor: string;
  texturePath: string;
  solidScale?: [number, number, number];
  imageScale?: [number, number, number];
  solidXOffset?: number;
  solidYOffset?: number;
  imageXOffset?: number;
  imageYOffset?: number;
  spring: SectionSpring;
  shadow?: boolean;
  shadowStrength?: number;
  suppressShadow?: boolean;
  zOffset?: number;
  scallopPosition?: "top" | "bottom" | "both" | "none";
}

function ElevatedSvgFrame({
  centerX,
  centerY,
  w,
  h,
  solidColor,
  texturePath,
  solidScale = [1, 1, 1],
  imageScale = [1, 1, 1],
  solidYOffset = 0,
  imageYOffset = 0,
  spring,
  shadow = false,
  shadowStrength = 1,
  suppressShadow = false,
  zOffset = 0,
  scallopPosition = "none",
}: ElevatedSvgFrameProps) {
  const runtime = useSurahLayoutRuntime();
  const PAGE_WIDTH = runtime.PAGE_WIDTH;
  const baseZ = PAGE_DEPTH / 2 + 0.001 + zOffset;

  const texture = useTexture(texturePath, (tex) => {
    tex.colorSpace = SRGBColorSpace;
  });

  return (
    <a.group
      position={[centerX - PAGE_WIDTH / 2, centerY, 0]}
      position-z={to(spring.liftZ, (lift) => baseZ + lift)}
    >
      {shadow && (
        <a.mesh
          renderOrder={-1}
          position={[VERSE_MIMIC_SHADOW.offsetX, VERSE_MIMIC_SHADOW.offsetY, 0]}
          position-z={to(
            spring.liftZ,
            (lift) => VERSE_MIMIC_SHADOW.insetZ - lift,
          )}
          scale-x={to(
            spring.liftZ,
            (lift) =>
              1 +
              (lift / SECTION_SURFACE.liftHeight) *
                (VERSE_MIMIC_SHADOW.scale - 1),
          )}
          scale-y={to(
            spring.liftZ,
            (lift) =>
              1 +
              (lift / SECTION_SURFACE.liftHeight) *
                (VERSE_MIMIC_SHADOW.scale - 1),
          )}
        >
          <planeGeometry args={[w * solidScale[0], h * solidScale[1]]} />
          <a.meshBasicMaterial
            color="#000000"
            transparent
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
            opacity={to(
              [spring.shadowOpacity, spring.shadowVisibility],
              (shadowOp, vis) =>
                suppressShadow
                  ? 0
                  : Math.max(vis * VERSE_MIMIC_SHADOW.opacityFlat, shadowOp) *
                    shadowStrength,
            )}
          />
        </a.mesh>
      )}

      {/* Solid background */}
      <a.mesh position={[0, solidYOffset, -0.001]}>
        <ScallopedCenteredShape
          w={w * solidScale[0]}
          h={h * solidScale[1]}
          radius={0.039}
          radiusX={SCALLOP_RADIUS_X}
          radiusY={SCALLOP_RADIUS_Y}
          position={scallopPosition}
        />
        <a.meshBasicMaterial
          color={solidColor}
          transparent
          opacity={spring.opacity as any}
          toneMapped={false}
          depthTest={false}
          depthWrite={false}
        />
      </a.mesh>

      {/* SVG Image */}
      <a.mesh position={[0, imageYOffset, 0]} scale={imageScale as any}>
        <planeGeometry args={[w, h]} />
        <a.meshBasicMaterial
          map={texture as any}
          transparent
          opacity={spring.opacity as any}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
          side={2} // THREE.DoubleSide = 2, THREE.FrontSide = 0
        />
      </a.mesh>
    </a.group>
  );
}

// ─── Draggable section wrapper ─────────────────────────────────────────
// Groups all layers of a section under ONE drag handle, so the whole
// section moves together when dragged from any point.
function DraggableSectionGroup({
  sectionId,
  isActive,
  sectionBounds,
  children,
}: {
  sectionId: ElevatedSectionId;
  isActive: boolean;
  sectionBounds?: SectionBounds;
  children: React.ReactNode;
}) {
  const sectionDrag = dragEngine.sections[sectionId];
  const dragBind = useElevatedDrag({
    enabled: isActive && !useFoldStore.getState().isIntroActive,
    springX: sectionDrag.x,
    springY: sectionDrag.y,
    dragSectionId: sectionId,
    sectionBounds,
  });

  return (
    <a.group
      {...dragBind}
      position-x={sectionDrag.x}
      position-y={sectionDrag.y}
    >
      {children}
    </a.group>
  );
}

export function ElevatedSectionSurfaces() {
  const runtime = useSurahLayoutRuntime();
  const SURAH_TRANSFORMS = runtime.SURAH_TRANSFORMS;

  const sectionBgTexture = useTexture(SECTION_BG_TEXTURE, (texture) => {
    texture.colorSpace = SRGBColorSpace;
  });

  const S1_ID = ALAK_LAYOUT_CONFIG.sections[0].id;
  const S2_ID = ALAK_LAYOUT_CONFIG.sections[1].id;
  const S2_TOP_ID = `${S2_ID}_top`;
  const S2_CENTER_ID = `${S2_ID}_center`;
  const S2_BOTTOM_ID = `${S2_ID}_bottom`;

  const s1Active = useElevatedStore((s) => s.activeSectionIds.includes(S1_ID));
  const s2TopActive = useElevatedStore((s) =>
    s.activeSectionIds.includes(S2_TOP_ID),
  );
  const s2CenterActive = useElevatedStore((s) =>
    s.activeSectionIds.includes(S2_CENTER_ID),
  );
  const s2BottomActive = useElevatedStore((s) =>
    s.activeSectionIds.includes(S2_BOTTOM_ID),
  );
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  const s1BaseSpring = useSectionSurfaceSpring(s1Active, S1_ID);
  const s2TopBaseSpring = useSectionSurfaceSpring(s2TopActive, S2_TOP_ID);
  const s2CenterBaseSpring = useSectionSurfaceSpring(
    s2CenterActive,
    S2_CENTER_ID,
  );
  const s2BottomBaseSpring = useSectionSurfaceSpring(
    s2BottomActive,
    S2_BOTTOM_ID,
  );

  const s1Spring = {
    ...s1BaseSpring,
    opacity: useHandoffOpacity(s1BaseSpring.opacity, S1_ID),
  };
  const s2TopSpring = {
    ...s2TopBaseSpring,
    opacity: useHandoffOpacity(s2TopBaseSpring.opacity, S2_TOP_ID),
  };
  const s2CenterSpring = {
    ...s2CenterBaseSpring,
    opacity: useHandoffOpacity(s2CenterBaseSpring.opacity, S2_CENTER_ID),
  };
  const s2BottomSpring = {
    ...s2BottomBaseSpring,
    opacity: useHandoffOpacity(s2BottomBaseSpring.opacity, S2_BOTTOM_ID),
  };

  const s1 = SURAH_TRANSFORMS.sections[0] as Required<SectionTransforms>;
  const s2 = SURAH_TRANSFORMS.sections[1] as Required<SectionTransforms>;

  const bw = s2.borderWidth;
  const innerBorderInset = bw * 0.7;

  const buildConnectorLayers = (
    yTop: number,
    height: number,
    position: "top" | "bottom",
  ) => {
    const outerX = s2.connectorX - bw;
    const outerW = s2.connectorW + bw * 2;
    const outerH = height + bw * 3;
    const outerY = position === "top" ? yTop + bw * 2 : yTop + bw;

    const middleX = outerX + innerBorderInset;
    const middleY = outerY - innerBorderInset;
    const middleW = outerW - innerBorderInset * 2;
    const middleH = outerH - innerBorderInset * 2;

    return {
      outer: { x: outerX, y: outerY, w: outerW, h: outerH, radius: 0.025 },
      middle: {
        x: middleX,
        y: middleY,
        w: middleW,
        h: middleH,
        radius: 0.023,
      },
      fill: {
        x: s2.connectorX,
        y: yTop,
        w: s2.connectorW,
        h: height,
        radius: 0.022,
      },
    };
  };

  const topConnector = buildConnectorLayers(
    s2.topConnectorY,
    s2.topConnectorH,
    "top",
  );

  const bottomConnector = buildConnectorLayers(
    s2.bottomConnectorY,
    s2.bottomConnectorH,
    "bottom",
  );
  const getTextureForColor = (color: string): Texture | null =>
    color === SECTION_BG_TEXTURE || color === HOLLOW_CONNECTOR_INNER_BG_1_3
      ? sectionBgTexture
      : null;

  const s1Bounds = useMemo(
    () =>
      isAllSectionsMode
        ? undefined
        : calculateSectionBounds(S1_ID, SURAH_TRANSFORMS, runtime.PAGE_WIDTH),
    [isAllSectionsMode, SURAH_TRANSFORMS, runtime.PAGE_WIDTH, S1_ID],
  );
  const s2TopBounds = useMemo(
    () =>
      isAllSectionsMode
        ? undefined
        : calculateSectionBounds(
            S2_TOP_ID,
            SURAH_TRANSFORMS,
            runtime.PAGE_WIDTH,
          ),
    [isAllSectionsMode, SURAH_TRANSFORMS, runtime.PAGE_WIDTH, S2_TOP_ID],
  );
  const s2CenterBounds = undefined;
  const s2BottomBounds = useMemo(
    () =>
      isAllSectionsMode
        ? undefined
        : calculateSectionBounds(
            S2_BOTTOM_ID,
            SURAH_TRANSFORMS,
            runtime.PAGE_WIDTH,
          ),
    [isAllSectionsMode, SURAH_TRANSFORMS, runtime.PAGE_WIDTH, S2_BOTTOM_ID],
  );

  const s1IntroRef = useIntroSectionOffset(S1_ID);
  const s2TopIntroRef = useIntroSectionOffset(S2_TOP_ID);
  const s2CenterIntroRef = useIntroSectionOffset(S2_CENTER_ID);
  const s2BottomIntroRef = useIntroSectionOffset(S2_BOTTOM_ID);

  return (
    <group position={[0, runtime.SCENE_CENTER_Y, 0]}>
      {/* ─── Section 1 ─────────────────────────────────────────────── */}
      <group ref={s1IntroRef}>
        <DraggableSectionGroup
          sectionId={S1_ID}
          isActive={s1Active}
          sectionBounds={s1Bounds}
        >
          {isIntroActive && (
            <IntroGuide3DReporter
              guideId={S1_ID}
              position={[
                s1.frameX - runtime.PAGE_WIDTH / 2 + s1.frameW,
                s1.frameY,
                0.005,
              ]}
            />
          )}
          <group>
            <ElevatedSvgFrame
              centerX={s1.frameX + s1.frameW / 2}
              centerY={s1.frameY - s1.frameH / 2}
              w={s1.frameW}
              h={s1.frameH}
              solidColor={S1_FRAME_BG_COLOR}
              texturePath={S1_FRAME_IMAGE}
              solidScale={[S1_SOLID_SCALE_X, S1_SOLID_SCALE_Y, 1]}
              imageScale={[S1_IMAGE_SCALE, S1_IMAGE_SCALE, 1]}
              solidYOffset={S1_SOLID_Y_OFFSET}
              imageYOffset={S1_IMAGE_Y_OFFSET}
              spring={s1Spring}
              shadow
              shadowStrength={0.95}
              suppressShadow={false}
              zOffset={0.001}
              scallopPosition="top"
            />
            {s1.rowConnectors.map((rc: RowConnectorTransform, i: number) => (
              <ElevatedLayer
                key={`s1-rc-${i}`}
                x={rc.x}
                y={rc.y}
                w={rc.w}
                h={rc.h}
                radius={OPPOSITE_VERSE_CONNECTOR.radius}
                color={S1_INNER_BORDER}
                sectionBgTexture={getTextureForColor(S1_INNER_BORDER)}
                spring={s1Spring}
                zOffset={0.0015}
              />
            ))}
          </group>
        </DraggableSectionGroup>
      </group>

      {/* ─── Section 2 top connector ───────────────────────────────── */}
      <group ref={s2TopIntroRef}>
        <DraggableSectionGroup
          sectionId={S2_TOP_ID}
          isActive={s2TopActive}
          sectionBounds={s2TopBounds}
        >
          {isIntroActive && (
            <IntroGuide3DReporter
              guideId={S2_TOP_ID}
              position={[
                s2.frameX - runtime.PAGE_WIDTH / 2 + s2.frameW,
                s2.shiftedTop,
                0.005,
              ]}
            />
          )}
          <group>
            <ElevatedSvgFrame
              centerX={s2.connectorX + s2.connectorW / 2}
              centerY={s2.topConnectorY - s2.topConnectorH / 2}
              w={s2.connectorW}
              h={s2.topConnectorH}
              solidColor={S2_FRAME_BG_COLOR}
              texturePath={S2_FRAME_IMAGE}
              solidScale={[S2_TOP_SOLID_SCALE_X, S2_TOP_SOLID_SCALE_Y, 1]}
              imageScale={[S2_TOP_IMAGE_SCALE_X, S2_TOP_IMAGE_SCALE_Y, 1]}
              solidXOffset={S2_TOP_SOLID_X_OFFSET}
              solidYOffset={S2_TOP_SOLID_Y_OFFSET}
              imageXOffset={S2_TOP_IMAGE_X_OFFSET}
              imageYOffset={S2_TOP_IMAGE_Y_OFFSET}
              spring={s2TopSpring}
              shadow
              shadowStrength={0.8}
              suppressShadow={false}
              zOffset={0.001}
              scallopPosition="none"
            />
            {s2.groups[0].rowConnectors.map((rc: RowConnectorTransform, i: number) => (
              <ElevatedLayer
                key={`s2-top-rc-${i}`}
                x={rc.x}
                y={rc.y}
                w={rc.w}
                h={rc.h}
                radius={OPPOSITE_VERSE_CONNECTOR.radius}
                color={MAROON_THEME}
                sectionBgTexture={getTextureForColor(MAROON_THEME)}
                spring={s2TopSpring}
                zOffset={0.0025}
              />
            ))}
          </group>
        </DraggableSectionGroup>
      </group>

      {/* ─── Section 2 Center Group ────────────────────────────────────── */}
      <group ref={s2CenterIntroRef}>
        <DraggableSectionGroup
          sectionId={S2_CENTER_ID}
          isActive={s2CenterActive}
          sectionBounds={s2CenterBounds}
        >
          {isIntroActive && (
            <IntroGuide3DReporter
              guideId={S2_CENTER_ID}
              position={[
                s2.frameX - runtime.PAGE_WIDTH / 2 + s2.frameW,
                s2.groups[1].frameY,
                0.005,
              ]}
            />
          )}
          <group>
            {s2.groups[1].rowConnectors.map((rc: RowConnectorTransform, i: number) => (
              <ElevatedLayer
                key={`s2-center-rc-${i}`}
                x={rc.x}
                y={rc.y}
                w={rc.w}
                h={rc.h}
                radius={OPPOSITE_VERSE_CONNECTOR.radius}
                color={GREEN_THEME}
                sectionBgTexture={getTextureForColor(GREEN_THEME)}
                spring={s2CenterSpring}
                zOffset={0.0025}
              />
            ))}
          </group>
        </DraggableSectionGroup>
      </group>

      {/* ─── Section 2 bottom connector ────────────────────────────── */}
      <group ref={s2BottomIntroRef}>
        <DraggableSectionGroup
          sectionId={S2_BOTTOM_ID}
          isActive={s2BottomActive}
          sectionBounds={s2BottomBounds}
        >
          {isIntroActive && (
            <IntroGuide3DReporter
              guideId={S2_BOTTOM_ID}
              position={[
                s2.frameX - runtime.PAGE_WIDTH / 2 + s2.frameW,
                s2.groups[2].frameY,
                0.005,
              ]}
            />
          )}
          <group>
            <ElevatedSvgFrame
              centerX={s2.connectorX + s2.connectorW / 2}
              centerY={s2.bottomConnectorY - s2.bottomConnectorH / 2}
              w={s2.connectorW}
              h={s2.bottomConnectorH}
              solidColor={S2_FRAME_BG_COLOR}
              texturePath={S2_FRAME_IMAGE}
              solidScale={[S2_BOTTOM_SOLID_SCALE_X, S2_BOTTOM_SOLID_SCALE_Y, 1]}
              imageScale={[S2_BOTTOM_IMAGE_SCALE_X, S2_BOTTOM_IMAGE_SCALE_Y, 1]}
              solidXOffset={S2_BOTTOM_SOLID_X_OFFSET}
              solidYOffset={S2_BOTTOM_SOLID_Y_OFFSET}
              imageXOffset={S2_BOTTOM_IMAGE_X_OFFSET}
              imageYOffset={S2_BOTTOM_IMAGE_Y_OFFSET}
              spring={s2BottomSpring}
              shadow
              shadowStrength={0.8}
              suppressShadow={false}
              zOffset={0.001}
              scallopPosition="none"
            />
            {s2.groups[2].rowConnectors.map((rc: RowConnectorTransform, i: number) => (
              <ElevatedLayer
                key={`s2-bottom-rc-${i}`}
                x={rc.x}
                y={rc.y}
                w={rc.w}
                h={rc.h}
                radius={OPPOSITE_VERSE_CONNECTOR.radius}
                color={MAROON_THEME}
                sectionBgTexture={getTextureForColor(MAROON_THEME)}
                spring={s2BottomSpring}
                zOffset={0.0025}
              />
            ))}
          </group>
        </DraggableSectionGroup>
      </group>
    </group>
  );
}
