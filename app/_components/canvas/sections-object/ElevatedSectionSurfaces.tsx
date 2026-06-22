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
import {
  SectionTransforms,
  RowConnectorTransform,
  VerticalGroupsSectionConfig,
} from "../../../data/schema";

import {
  HOLLOW_CONNECTOR_INNER_BG_1_3,
  SECTION_BG_TEXTURE,
  S1_INNER_BORDER,
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
import { useStoryStore } from "../../../stores/useStoryStore";
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
      : isIntroActive ||
          sectionId === useStoryStore.getState().activeConfig.sections[0].id ||
          !justLeftIntro
        ? SECTION_SURFACE.opacityHideDelayMs
        : 0,
    immediate:
      actuallyActive ||
      (justLeftIntro &&
        sectionId !== useStoryStore.getState().activeConfig.sections[0].id), // Snap to 0 instantly ONLY when leaving the intro!
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
        state.isIntroActive &&
        sectionId &&
        sectionId !== useStoryStore.getState().activeConfig.sections[0].id
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
  renderOrder?: number;
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
  renderOrder,
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

      <a.mesh renderOrder={renderOrder}>
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

// ─── Passive drag follower ─────────────────────────────────────────────
// Applies a parent section's drag spring offset WITHOUT providing a drag handle.
// Used by non-primary groups that should move with the parent frame when it's dragged.
function ParentDragOffset({
  parentSectionId,
  children,
}: {
  parentSectionId: string;
  children: React.ReactNode;
}) {
  const sectionDrag = dragEngine.sections[parentSectionId];
  if (!sectionDrag) return <group>{children}</group>;
  return (
    <a.group position-x={sectionDrag.x} position-y={sectionDrag.y}>
      {children}
    </a.group>
  );
}

// ── Pure visual SVG overlay (no drag) ────────────────────────────────
function ElevatedSvgOverlay({ overlay, spring, s2, groupTransforms }: any) {
  const runtime = useSurahLayoutRuntime();
  const PAGE_WIDTH = runtime.PAGE_WIDTH;
  const texture = useTexture(overlay.src, (tex: any) => {
    tex.colorSpace = SRGBColorSpace;
  });

  const anchorX = s2.connectorX + s2.connectorW / 2;

  let anchorY = groupTransforms.frameY;
  const edge = overlay.anchorEdge ?? "center";
  if (edge === "top") anchorY = groupTransforms.frameY;
  else if (edge === "bottom")
    anchorY = groupTransforms.frameY - groupTransforms.frameH;
  else anchorY = groupTransforms.frameY - groupTransforms.frameH / 2;

  const posX = anchorX + (overlay.offsetX ?? 0);
  const posY = anchorY + (overlay.offsetY ?? 0);

  const baseZ = PAGE_DEPTH / 2 + 0.0035;

  return (
    <a.mesh
      position={[posX - PAGE_WIDTH / 2, posY, 0]}
      position-z={to(spring.liftZ, (lift) => baseZ + lift)}
      scale-x={overlay.scaleX ?? 1}
      scale-y={overlay.scaleY ?? 1}
      rotation-z={overlay.rotationZ ?? 0}
      renderOrder={overlay.renderOrder ?? 3}
    >
      <planeGeometry args={[1, 1]} />
      <a.meshBasicMaterial
        map={texture as any}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
        opacity={spring.opacity as any}
        side={2}
      />
    </a.mesh>
  );
}

// ── Draggable SVG overlay — wraps ElevatedSvgOverlay in its own drag section ─
// Only rendered in all-sections mode
function DraggableElevatedSvgOverlay({ overlay, s2, groupTransforms, parentSectionId }: any) {
  const sectionId = overlay.customSectionId as string;
  const isActive = useElevatedStore((s) =>
    s.activeSectionIds.includes(sectionId),
  );
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);

  const baseSpring = useSectionSurfaceSpring(isActive, sectionId);
  const spring = {
    ...baseSpring,
    opacity: useHandoffOpacity(baseSpring.opacity, sectionId),
  };

  const sectionDrag = dragEngine.sections[sectionId];
  // Also read the parent (overall frame) spring so SVG brackets follow frame drag
  const parentDrag = parentSectionId ? dragEngine.sections[parentSectionId] : null;

  const dragBind = useElevatedDrag({
    enabled: isActive && !isIntroActive,
    springX: sectionDrag?.x,
    springY: sectionDrag?.y,
    dragSectionId: sectionId,
  });

  // Only render SVG section frames in all-sections mode
  if (!isAllSectionsMode) return null;
  if (!sectionDrag) return null;

  return (
    <a.group
      {...dragBind}
      position-x={to(
        [sectionDrag.x, parentDrag ? parentDrag.x : sectionDrag.x],
        (sx, px) => sx + (parentDrag ? px : 0),
      )}
      position-y={to(
        [sectionDrag.y, parentDrag ? parentDrag.y : sectionDrag.y],
        (sy, py) => sy + (parentDrag ? py : 0),
      )}
    >
      <ElevatedSvgOverlay
        overlay={overlay}
        spring={spring}
        s2={s2}
        groupTransforms={groupTransforms}
      />
    </a.group>
  );
}

function DynamicElevatedGroup({
  groupId,
  groupIndex,
  s2,
  config,
  vertConfig,
  sectionBgTexture,
  getConnectorColor,
  topConnector,
  bottomConnector,
  parentSectionId,
}: any) {
  const vConfig = vertConfig as VerticalGroupsSectionConfig | undefined;
  const hasCustomSections =
    vConfig?.customSections && vConfig.customSections.length > 0;

  // For custom sections: a group is active if ANY custom section containing its verses is active
  const groupVerseIds = vConfig?.groups?.[groupIndex]?.verseIds ?? [];
  const relevantCustomSectionIds = hasCustomSections
    ? vConfig!
        .customSections!.filter((cs: any) =>
          cs.verseIds.some((vId: number) => groupVerseIds.includes(vId)),
        )
        .map((cs: any) => cs.id)
    : [];

  const isActive = useElevatedStore((s) =>
    hasCustomSections
      ? relevantCustomSectionIds.some((csId: string) =>
          s.activeSectionIds.includes(csId),
        )
      : s.activeSectionIds.includes(groupId),
  );
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const runtime = useSurahLayoutRuntime();
  const PAGE_WIDTH = runtime.PAGE_WIDTH;

  // For custom sections, use the first relevant custom section ID for the spring
  const springId = hasCustomSections
    ? (relevantCustomSectionIds[0] ?? groupId)
    : groupId;
  const baseSpring = useSectionSurfaceSpring(isActive, springId);
  const spring = {
    ...baseSpring,
    opacity: useHandoffOpacity(baseSpring.opacity, springId),
  };
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const bounds = useMemo(
    () =>
      isAllSectionsMode || !s2 || hasCustomSections
        ? undefined
        : calculateSectionBounds(groupId, runtime.SURAH_TRANSFORMS, PAGE_WIDTH),
    [
      isAllSectionsMode,
      PAGE_WIDTH,
      runtime.PAGE_HEIGHT,
      groupId,
      s2,
      hasCustomSections,
      runtime.SURAH_TRANSFORMS,
    ],
  );

  const introRef = useIntroSectionOffset(hasCustomSections ? null : groupId);
  const groupTransforms = s2.groups[groupIndex];
  const hideConnectors = vertConfig?.hideRowConnectors ?? false;

  // خواندن تکسچرها و ابعاد از تنظیمات احزاب و آیتالکرسی
  const bgTex = vertConfig?.backgroundTexture || S2_FRAME_IMAGE;
  const bgScaleX = vertConfig?.backgroundScaleX ?? S2_TOP_SOLID_SCALE_X;
  const bgScaleY = vertConfig?.backgroundScaleY ?? S2_TOP_SOLID_SCALE_Y;

  // ── Paper mode: NO frame for custom sections (Ahzab) ─────────────────────
  // Custom sections (hasCustomSections) show no frame in paper mode — only verses
  // animate via VerseController. Frames appear only in all-sections mode.
  // Other surahs (Alak, AyatAlKursi…) show their frame whenever the section is elevated.
  if (hasCustomSections && !isAllSectionsMode) return null;

  const innerContent = (
    <group>
      {groupIndex === 0 && vertConfig?.backgroundTexture && (
        <ElevatedSvgFrame
          centerX={s2.frameX + s2.frameW / 2}
          centerY={(s2.shiftedTop ?? 0) - (s2.shiftedH ?? 0) / 2}
          w={s2.frameW}
          h={s2.shiftedH ?? 0}
          solidColor="transparent"
          texturePath={vertConfig.backgroundTexture}
          solidScale={[
            1,
            1,
            1,
          ]}
          imageScale={[
            vertConfig.backgroundScaleX ?? 1,
            vertConfig.backgroundScaleY ?? 1,
            1,
          ]}
          spring={spring}
          shadow={false}
          suppressShadow={isIntroActive && !isActive}
          zOffset={-0.002}
          scallopPosition="none"
        />
      )}
      {/* شرط hasIntro حذف شد تا در احزاب هم دیده شود */}
      {groupIndex === 0 && s2.topConnectorY !== undefined && topConnector && (
        <ElevatedSvgFrame
          centerX={s2.connectorX + s2.connectorW / 2}
          centerY={s2.topConnectorY - s2.topConnectorH / 2}
          w={s2.connectorW}
          h={s2.topConnectorH}
          solidColor={S2_FRAME_BG_COLOR}
          texturePath={bgTex}
          solidScale={[S2_TOP_SOLID_SCALE_X, S2_TOP_SOLID_SCALE_Y, 1]}
          imageScale={[bgScaleX, bgScaleY, 1]}
          solidXOffset={S2_TOP_SOLID_X_OFFSET}
          solidYOffset={S2_TOP_SOLID_Y_OFFSET}
          imageXOffset={S2_TOP_IMAGE_X_OFFSET}
          imageYOffset={S2_TOP_IMAGE_Y_OFFSET}
          spring={spring}
          shadow
          shadowStrength={0.8}
          suppressShadow={isIntroActive && !isActive}
          scallopPosition="none"
        />
      )}

      {/* Static SVG Overlays only (those with customSectionId are rendered separately with drag) */}
      {config.svgOverlays
        ?.filter(
          (overlay: any) =>
            overlay.anchorGroupIndex === groupIndex &&
            overlay.customSectionId == null,
        )
        .map((overlay: any, idx: number) => (
          <ElevatedSvgOverlay
            key={`overlay-${idx}`}
            overlay={overlay}
            spring={spring}
            s2={s2}
            groupTransforms={groupTransforms}
          />
        ))}

      {!hideConnectors &&
        groupTransforms.rowConnectors?.map((rc: any, j: number) => {
          const rcColor = getConnectorColor(groupIndex);
          return (
            <ElevatedLayer
              key={`${groupId}-rc-${j}`}
              x={rc.x}
              y={rc.y}
              w={rc.w}
              h={rc.h}
              radius={OPPOSITE_VERSE_CONNECTOR.radius}
              color={rcColor}
              sectionBgTexture={
                rcColor === SECTION_BG_TEXTURE ||
                rcColor === HOLLOW_CONNECTOR_INNER_BG_1_3
                  ? sectionBgTexture
                  : null
              }
              spring={spring}
              zOffset={0.0025}
              renderOrder={3}
            />
          );
        })}

      {/* شرط hasIntro برای قاب پایین هم حذف شد */}
      {groupIndex === s2.groups.length - 1 &&
        s2.bottomConnectorY !== undefined &&
        bottomConnector && (
          <ElevatedSvgFrame
            centerX={s2.connectorX + s2.connectorW / 2}
            centerY={s2.bottomConnectorY - s2.bottomConnectorH / 2}
            w={s2.connectorW}
            h={s2.bottomConnectorH}
            solidColor={S2_FRAME_BG_COLOR}
            texturePath={bgTex}
            solidScale={[
              S2_BOTTOM_SOLID_SCALE_X,
              S2_BOTTOM_SOLID_SCALE_Y,
              1,
            ]}
            imageScale={[
              vertConfig?.backgroundScaleX ?? S2_BOTTOM_IMAGE_SCALE_X,
              vertConfig?.backgroundScaleY ?? S2_BOTTOM_IMAGE_SCALE_Y,
              1,
            ]}
            solidXOffset={S2_BOTTOM_SOLID_X_OFFSET}
            solidYOffset={S2_BOTTOM_SOLID_Y_OFFSET}
            imageXOffset={S2_BOTTOM_IMAGE_X_OFFSET}
            imageYOffset={S2_BOTTOM_IMAGE_Y_OFFSET}
            spring={spring}
            shadow
            shadowStrength={0.8}
            suppressShadow={isIntroActive && !isActive}
            scallopPosition="none"
          />
        )}
    </group>
  );

  if (hasCustomSections) {
    // Custom sections in all-sections mode:
    // The overall background frame (groupIndex=0) is wrapped in a DraggableSectionGroup
    // using the parent S2_ID, making the whole frame draggable as one unit.
    // Verse drag already follows their individual custom section spring.
    if (groupIndex === 0 && isAllSectionsMode && vertConfig?.backgroundTexture && parentSectionId) {
      // Extract just the background frame content for the parent drag wrapper
      const bgFrameContent = (
        <group>
          <ElevatedSvgFrame
            centerX={s2.frameX + s2.frameW / 2}
            centerY={(s2.shiftedTop ?? 0) - (s2.shiftedH ?? 0) / 2}
            w={s2.frameW}
            h={s2.shiftedH ?? 0}
            solidColor="transparent"
            texturePath={vertConfig.backgroundTexture}
            solidScale={[
              1,
              1,
              1,
            ]}
            imageScale={[
              vertConfig.backgroundScaleX ?? 1,
              vertConfig.backgroundScaleY ?? 1,
              1,
            ]}
            spring={spring}
            shadow={false}
            suppressShadow={false}
            zOffset={-0.002}
            scallopPosition="none"
          />
        </group>
      );
      return (
        <group>
          <DraggableSectionGroup
            sectionId={parentSectionId as ElevatedSectionId}
            isActive={true}
          >
            {bgFrameContent}
          </DraggableSectionGroup>
        </group>
      );
    }
    // All other groups in custom-section mode: follow parent frame drag passively
    if (parentSectionId) {
      return (
        <group>
          <ParentDragOffset parentSectionId={parentSectionId}>
            {innerContent}
          </ParentDragOffset>
        </group>
      );
    }
    return <group>{innerContent}</group>;
  }

  return (
    <group ref={introRef}>
      <DraggableSectionGroup
        sectionId={groupId}
        isActive={isActive}
        sectionBounds={bounds}
      >
        {isIntroActive && (
          <IntroGuide3DReporter
            guideId={groupId}
            position={[
              s2.frameX - PAGE_WIDTH / 2 + s2.frameW,
              groupIndex === 0 && s2.shiftedTop !== undefined
                ? s2.shiftedTop
                : groupIndex === s2.groups.length - 1 &&
                    s2.shiftedBot !== undefined
                  ? s2.shiftedBot
                  : groupTransforms.frameY,
              0.005,
            ]}
          />
        )}
        {innerContent}
      </DraggableSectionGroup>
    </group>
  );
}

export function ElevatedSectionSurfaces() {
  const runtime = useSurahLayoutRuntime();
  const SURAH_TRANSFORMS = runtime.SURAH_TRANSFORMS;

  const sectionBgTexture = useTexture(SECTION_BG_TEXTURE, (texture) => {
    texture.colorSpace = SRGBColorSpace;
  });

  const config = useStoryStore((state) => state.activeConfig);
  const gridConfig = config.sections.find((s) => s.type === "gridWithAnaAyet");
  const vertConfig = config.sections.find((s) => s.type === "verticalGroups");

  const S1_ID = gridConfig?.id ?? "__no_s1__";
  const S2_ID = vertConfig?.id ?? "__no_s2__";
  const s1Active = useElevatedStore((s) => s.activeSectionIds.includes(S1_ID));
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  const s1BaseSpring = useSectionSurfaceSpring(s1Active, S1_ID);
  const s1Spring = {
    ...s1BaseSpring,
    opacity: useHandoffOpacity(s1BaseSpring.opacity, S1_ID),
  };

  const gridConfigIndex = config.sections.findIndex(
    (s) => s.type === "gridWithAnaAyet",
  );
  const vertConfigIndex = config.sections.findIndex(
    (s) => s.type === "verticalGroups",
  );

  const s1 =
    gridConfigIndex >= 0
      ? (SURAH_TRANSFORMS.sections[
          gridConfigIndex
        ] as Required<SectionTransforms>)
      : undefined;
  const s2 =
    vertConfigIndex >= 0
      ? (SURAH_TRANSFORMS.sections[
          vertConfigIndex
        ] as Required<SectionTransforms>)
      : undefined;

  const bw = s2?.borderWidth ?? 0;
  const innerBorderInset = bw * 0.7;

  const buildConnectorLayers = (
    yTop: number,
    height: number,
    position: "top" | "bottom",
  ) => {
    if (!s2) return null;
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

  const topConnector = s2
    ? buildConnectorLayers(s2.topConnectorY, s2.topConnectorH, "top")
    : null;

  const bottomConnector = s2
    ? buildConnectorLayers(s2.bottomConnectorY, s2.bottomConnectorH, "bottom")
    : null;
  const getTextureForColor = (color: string): Texture | null =>
    color === SECTION_BG_TEXTURE || color === HOLLOW_CONNECTOR_INNER_BG_1_3
      ? sectionBgTexture
      : null;

  const getGroupColor = (idx: number, fallback: string) => {
    if (
      vertConfig &&
      vertConfig.type === "verticalGroups" &&
      vertConfig.groups[idx]
    ) {
      const key = vertConfig.groups[idx].bgThemeKey;
      if (key) return (config.styling.colors as any)[key] ?? fallback;
    }
    return fallback;
  };


  const s1Bounds = useMemo(
    () =>
      isAllSectionsMode || !s1
        ? undefined
        : calculateSectionBounds(S1_ID, SURAH_TRANSFORMS, runtime.PAGE_WIDTH),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAllSectionsMode, runtime.PAGE_WIDTH, runtime.PAGE_HEIGHT, S1_ID, !!s1],
  );

  const getConnectorColor = (groupIdx: number) => {
    if (!vertConfig || vertConfig.type !== "verticalGroups")
      return config.styling.colors.maroonTheme ?? "#000000";
    const group = vertConfig.groups[groupIdx];
    if (!group) return config.styling.colors.maroonTheme ?? "#000000";
    const firstVerseId = group.verseIds?.[0];
    const override =
      firstVerseId !== undefined
        ? config.verseOverrides?.[firstVerseId]
        : undefined;
    if (override?.border) return override.border;
    return group.isCenter
      ? (config.styling.colors.greenTheme ?? "#000000")
      : (config.styling.colors.maroonTheme ?? "#000000");
  };

  const s1IntroRef = useIntroSectionOffset(S1_ID);

  return (
    <group position={[0, runtime.SCENE_CENTER_Y, 0]}>
      {/* ─── Section 1 (Grid + AnaAyet) ──────────────────────────────── */}
      {s1 && (
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
                solidScale={[1, S1_SOLID_SCALE_Y, 1]}
                imageScale={[S1_IMAGE_SCALE, S1_IMAGE_SCALE, 1]}
                solidYOffset={S1_SOLID_Y_OFFSET}
                imageYOffset={S1_IMAGE_Y_OFFSET}
                spring={s1Spring}
                shadow
                shadowStrength={0.6}
                suppressShadow={isIntroActive && !s1Active}
                zOffset={0.001}
                scallopPosition="top"
              />
              {s1.rowConnectors?.map((rc: RowConnectorTransform, i: number) => (
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
                  renderOrder={3}
                />
              ))}
            </group>
          </DraggableSectionGroup>
        </group>
      )}

      {s2 && (
        <>
          {/* ─── SVG overlays with customSectionId — each in its own drag group ─── */}
          {config.svgOverlays
            ?.filter((overlay: any) => overlay.customSectionId != null)
            .map((overlay: any, idx: number) => {
              const gIdx = overlay.anchorGroupIndex ?? 0;
              const groupTransforms = s2.groups[gIdx];
              if (!groupTransforms) return null;
              return (
                <DraggableElevatedSvgOverlay
                  key={`custom-overlay-${idx}`}
                  overlay={overlay}
                  s2={s2}
                  groupTransforms={groupTransforms}
                  parentSectionId={S2_ID}
                />
              );
            })}

          {/* ─── Rendered groups (visual backgrounds + static overlays) ─── */}
          {s2.groups.map((_: any, idx: number) => {
            const isUnified = vertConfig?.groupElevation === "unified";
            const gId = isUnified ? S2_ID : `${S2_ID}_g${idx}`;
            return (
              <DynamicElevatedGroup
                key={`${S2_ID}_g${idx}`}
                groupId={gId}
                groupIndex={idx}
                s2={s2}
                config={config}
                vertConfig={vertConfig}
                sectionBgTexture={sectionBgTexture}
                getConnectorColor={getConnectorColor}
                topConnector={topConnector}
                bottomConnector={bottomConnector}
                parentSectionId={S2_ID}
              />
            );
          })}
        </>
      )}
    </group>
  );
}
