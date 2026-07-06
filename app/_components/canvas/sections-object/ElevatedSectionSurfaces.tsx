"use client";

import { a, to, useSpring, type SpringValue } from "@react-spring/three";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { RoundedShapeComponent } from "../SurahLayout/SharedUI";
import {
  S1_SOLID_SCALE_X,
  S1_SOLID_SCALE_Y,
  S1_SOLID_Y_OFFSET,
  S1_IMAGE_SCALE,
  S1_IMAGE_Y_OFFSET,
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
} from "../SurahLayout/BlockRenderer";
import { OPPOSITE_VERSE_CONNECTOR } from "../../../data/SurahConfig";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { Color, LinearFilter, SRGBColorSpace, type Texture } from "three";
import {
  SectionTransforms,
  RowConnectorTransform,
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
import {
  getSectionIdForVerseId,
  getIntroGridSectionId,
} from "../../../utils/sectionResolver";
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
          sectionId === getIntroGridSectionId(useStoryStore.getState().activeConfig) ||
          !justLeftIntro
        ? SECTION_SURFACE.opacityHideDelayMs
        : 0,
    immediate:
      actuallyActive ||
      (justLeftIntro &&
        sectionId !== getIntroGridSectionId(useStoryStore.getState().activeConfig)), // Snap to 0 instantly ONLY when leaving the intro!
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
        sectionId !== getIntroGridSectionId(useStoryStore.getState().activeConfig)
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
        <planeGeometry args={[w * solidScale[0], h * solidScale[1]]} />
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
// snapMode="page" in paper mode → snap back when the section center is still over the paper.
// sectionBounds needed to compute the section's original center position.
// In all-sections mode: no snap (sections float freely wherever dropped).
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
  // In all-sections mode, sections are placed freely — no snap back.
  // In paper mode, sections snap back if released within the page bounds.
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const dragBind = useElevatedDrag({
    enabled: isActive && !useFoldStore.getState().isIntroActive,
    springX: sectionDrag.x,
    springY: sectionDrag.y,
    dragSectionId: sectionId,
    sectionBounds: isAllSectionsMode ? undefined : sectionBounds,
    snapMode: isAllSectionsMode ? undefined : "page",
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

// ─── Block-engine elevated surface (Kafirun, Ihlas, etc.) ───────────────
// Mirrors DynamicElevatedGroup's role for the new `config.blocks` schema:
// renders the lifted background plate / row connectors for a single block
// and wraps it in the same draggable handle used by the legacy engine.
// `sectionId` is resolved via the shared verse->section reverse index so
// cross-block customSections (e.g. Ihlas' single zone spanning 4 blocks)
// are honored automatically — multiple blocks may share the same sectionId
// and therefore the same drag spring, same pattern as legacy "unified" mode.
function DynamicElevatedBlock({
  block,
  blockIndex,
  sTransform,
  config,
}: any) {
  const sectionId =
    getSectionIdForVerseId(block.verseIds?.[0] ?? -1) ?? block.id;

  const isActive = useElevatedStore((s) =>
    s.activeSectionIds.includes(sectionId),
  );
  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const runtime = useSurahLayoutRuntime();
  // Scatters this block's background/connector plate into the intro's
  // floating layout together with its verses (VerseController registers
  // under the same sectionId) — a no-op for surahs without an intro
  // (IntroSectionAnimationController skips all work when !hasIntro).
  const introRef = useIntroSectionOffset(sectionId);

  const baseSpring = useSectionSurfaceSpring(isActive, sectionId);
  const spring = {
    ...baseSpring,
    opacity: useHandoffOpacity(baseSpring.opacity, sectionId),
  };

  const bounds = useMemo(
    () =>
      isAllSectionsMode
        ? undefined
        : calculateSectionBounds(
            sectionId,
            runtime.SURAH_TRANSFORMS,
            runtime.PAGE_WIDTH,
          ),
    [isAllSectionsMode, runtime.PAGE_WIDTH, sectionId, runtime.SURAH_TRANSFORMS],
  );

  const group = sTransform.groups?.[0];
  const frame = group
    ? { x: group.frameX, y: group.frameY, w: group.frameW, h: group.frameH }
    : {
        x: sTransform.frameX,
        y: sTransform.frameY ?? 0,
        w: sTransform.frameW,
        h: sTransform.frameH ?? 0,
      };

  // Section-wide background (config.sectionBackground) is a resting-state-only
  // decoration (rendered by BlockRenderer). On paper, elevating a section must
  // NEVER bring it along — only the all-sections overview shows it, rendered
  // exactly ONCE (at block index 0, mirroring legacy's `groupIndex === 0`
  // check) and sized to the OVERALL section frame — every block's SectionTransforms
  // shares the same frameX/frameW/shiftedTop/shiftedH (computed once for the
  // whole block stack in buildBlockTransforms), so block 0's own sTransform
  // already covers the whole surah, not just its own bounds.
  const sectionBgFrame =
    isAllSectionsMode &&
    !block.backgroundTexture &&
    config.sectionBackground &&
    blockIndex === 0
      ? {
          x: sTransform.frameX + sTransform.frameW / 2,
          y: (sTransform.shiftedTop ?? 0) - (sTransform.shiftedH ?? 0) / 2,
          w: sTransform.frameW,
          h: sTransform.shiftedH ?? 0,
        }
      : null;

  // Alak-only: decorative top/bottom connector frames (rendered only when
  // `features.hasIntro`), lifting together with whichever "real" group
  // (excluding the grid block and intro/outro) is nearest each edge —
  // mirrors legacy's `groupIndex === 0` / `groupIndex === lastIndex` gating.
  const realGroupIndices = config.blocks
    .map((b: any, i: number) => ({ b, i }))
    .filter(({ b }: any) => b.type === "group" && !b.introOutroRole)
    .map(({ i }: any) => i);
  const isFirstRealGroup = blockIndex === realGroupIndices[0];
  const isLastRealGroup = blockIndex === realGroupIndices[realGroupIndices.length - 1];
  const connectorBgTex = config.sectionBackground?.texture || S2_FRAME_IMAGE;

  const rowConnectors: RowConnectorTransform[] =
    group?.rowConnectors ?? sTransform.rowConnectors ?? [];

  const firstVerseId = block.verseIds?.[0];
  const override =
    firstVerseId !== undefined ? config.verseOverrides?.[firstVerseId] : undefined;
  const connectorColor =
    override?.border ??
    (block.isCenter
      ? (config.styling.colors.greenTheme ?? "#000000")
      : (config.styling.colors.maroonTheme ?? "#000000"));

  return (
    <group ref={introRef}>
      <DraggableSectionGroup
        sectionId={sectionId}
        isActive={isActive}
        sectionBounds={bounds}
      >
        {isIntroActive && !block.introOutroRole && (
          <IntroGuide3DReporter
            guideId={sectionId}
            position={[
              sTransform.frameX - runtime.PAGE_WIDTH / 2 + sTransform.frameW,
              isFirstRealGroup && sTransform.shiftedTop !== undefined
                ? sTransform.shiftedTop
                : isLastRealGroup && sTransform.shiftedBot !== undefined
                  ? sTransform.shiftedBot
                  : frame.y,
              0.005,
            ]}
          />
        )}
        <group>
          {sectionBgFrame && (
            <ElevatedSvgFrame
              centerX={sectionBgFrame.x}
              centerY={sectionBgFrame.y}
              w={sectionBgFrame.w}
              h={sectionBgFrame.h}
              solidColor="transparent"
              texturePath={config.sectionBackground.texture}
              solidScale={[
                config.sectionBackground.solidScaleX ?? 1,
                config.sectionBackground.solidScaleY ?? 1,
                1,
              ]}
              imageScale={[
                config.sectionBackground.scaleX ?? 1,
                config.sectionBackground.scaleY ?? 1,
                1,
              ]}
              imageXOffset={config.sectionBackground.offsetX ?? 0}
              imageYOffset={config.sectionBackground.offsetY ?? 0}
              spring={spring}
              shadow
              shadowStrength={0.6}
              suppressShadow={isIntroActive && !isActive}
            />
          )}
          {block.backgroundTexture && (
            <ElevatedSvgFrame
              centerX={frame.x + frame.w / 2}
              centerY={frame.y - frame.h / 2}
              w={frame.w}
              h={frame.h}
              solidColor="transparent"
              texturePath={block.backgroundTexture}
              solidScale={[
                block.backgroundSolidScaleX ?? 1,
                block.backgroundSolidScaleY ?? 1,
                1,
              ]}
              imageScale={[
                block.backgroundScaleX ?? 1,
                block.backgroundScaleY ?? 1,
                1,
              ]}
              imageXOffset={block.backgroundOffsetX ?? 0}
              imageYOffset={block.backgroundOffsetY ?? 0}
              spring={spring}
              shadow
              shadowStrength={0.6}
              suppressShadow={isIntroActive && !isActive}
            />
          )}

          {isFirstRealGroup && sTransform.topConnectorY !== undefined && (
            <ElevatedSvgFrame
              centerX={sTransform.connectorX + sTransform.connectorW / 2}
              centerY={sTransform.topConnectorY - sTransform.topConnectorH / 2}
              w={sTransform.connectorW}
              h={sTransform.topConnectorH}
              solidColor={S2_FRAME_BG_COLOR}
              texturePath={connectorBgTex}
              solidScale={[S2_TOP_SOLID_SCALE_X, S2_TOP_SOLID_SCALE_Y, 1]}
              imageScale={[S2_TOP_IMAGE_SCALE_X, S2_TOP_IMAGE_SCALE_Y, 1]}
              solidXOffset={S2_TOP_SOLID_X_OFFSET}
              solidYOffset={S2_TOP_SOLID_Y_OFFSET}
              imageXOffset={S2_TOP_IMAGE_X_OFFSET}
              imageYOffset={S2_TOP_IMAGE_Y_OFFSET}
              spring={spring}
              shadow
              shadowStrength={0.8}
              suppressShadow={isIntroActive && !isActive}
            />
          )}

          {isLastRealGroup && sTransform.bottomConnectorY !== undefined && (
            <ElevatedSvgFrame
              centerX={sTransform.connectorX + sTransform.connectorW / 2}
              centerY={sTransform.bottomConnectorY - sTransform.bottomConnectorH / 2}
              w={sTransform.connectorW}
              h={sTransform.bottomConnectorH}
              solidColor={S2_FRAME_BG_COLOR}
              texturePath={connectorBgTex}
              solidScale={[S2_BOTTOM_SOLID_SCALE_X, S2_BOTTOM_SOLID_SCALE_Y, 1]}
              imageScale={[S2_BOTTOM_IMAGE_SCALE_X, S2_BOTTOM_IMAGE_SCALE_Y, 1]}
              solidXOffset={S2_BOTTOM_SOLID_X_OFFSET}
              solidYOffset={S2_BOTTOM_SOLID_Y_OFFSET}
              imageXOffset={S2_BOTTOM_IMAGE_X_OFFSET}
              imageYOffset={S2_BOTTOM_IMAGE_Y_OFFSET}
              spring={spring}
              shadow
              shadowStrength={0.8}
              suppressShadow={isIntroActive && !isActive}
            />
          )}

          {!block.hideRowConnectors &&
            rowConnectors.map((rc: RowConnectorTransform, j: number) => {
              const cols = block.columns ?? 2;
              const connCols = block.rowConnectorCols ?? cols;
              const leftVId = block.verseIds?.[j * cols];
              const rightVId = block.verseIds?.[j * cols + (connCols - 1)];

              const leftExpandW = leftVId !== undefined ? (config.verseOverrides?.[leftVId]?.expandW ?? 0) : 0;
              const rightExpandW = rightVId !== undefined ? (config.verseOverrides?.[rightVId]?.expandW ?? 0) : 0;

              const finalRcX = rc.x - leftExpandW;
              const finalRcW = rc.w + leftExpandW + rightExpandW;

              return (
                <ElevatedLayer
                  key={`${sectionId}-rc-${blockIndex}-${j}`}
                  x={finalRcX}
                  y={rc.y}
                  w={finalRcW}
                  h={rc.h}
                  radius={OPPOSITE_VERSE_CONNECTOR.radius}
                  color={connectorColor}
                  spring={spring}
                  zOffset={0.0025}
                  renderOrder={3}
                />
              );
            })}
        </group>
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

  // S1 ("grid" block, e.g. Alak's Section 1) — via the shared resolver, same
  // helper used for the opacity-snap fix.
  const gridBlockIndex = config.blocks?.findIndex((b) => b.type === "grid") ?? -1;
  const S1_ID = getIntroGridSectionId(config) ?? "__no_s1__";
  const s1Active = useElevatedStore((s) => s.activeSectionIds.includes(S1_ID));
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  const s1BaseSpring = useSectionSurfaceSpring(s1Active, S1_ID);
  const s1Spring = {
    ...s1BaseSpring,
    opacity: useHandoffOpacity(s1BaseSpring.opacity, S1_ID),
  };

  const s1 =
    gridBlockIndex >= 0
      ? (SURAH_TRANSFORMS.sections[
          gridBlockIndex
        ] as Required<SectionTransforms>)
      : undefined;

  // S1 bounds for "page" snap: the section's resting position on paper
  const s1Bounds = useMemo(
    () =>
      isAllSectionsMode || !s1
        ? undefined
        : calculateSectionBounds(S1_ID, SURAH_TRANSFORMS, runtime.PAGE_WIDTH),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAllSectionsMode, runtime.PAGE_WIDTH, S1_ID, !!s1],
  );

  const getTextureForColor = (color: string): Texture | null =>
    color === SECTION_BG_TEXTURE || color === HOLLOW_CONNECTOR_INNER_BG_1_3
      ? sectionBgTexture
      : null;

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
                solidScale={[S1_SOLID_SCALE_X, S1_SOLID_SCALE_Y, 1]}
                imageScale={[S1_IMAGE_SCALE, S1_IMAGE_SCALE, 1]}
                solidYOffset={S1_SOLID_Y_OFFSET}
                imageYOffset={S1_IMAGE_Y_OFFSET}
                spring={s1Spring}
                shadow
                shadowStrength={0.6}
                suppressShadow={isIntroActive && !s1Active}
                zOffset={0.001}
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

      {/* ─── SVG overlays + verse groups (Alak, Kafirun, Ihlas, Ayat al-Kursi, Fatiha, Ahzab) ─── */}
      {config.blocks && config.blocks.length > 0 && (
        <>
          {/* SVG overlays with customSectionId — each in its own drag group
              (all-sections mode only). */}
          {config.svgOverlays
            ?.filter((overlay: any) => overlay.customSectionId != null)
            .map((overlay: any, idx: number) => {
              const gIdx = overlay.anchorGroupIndex ?? 0;
              const blockSection = SURAH_TRANSFORMS.sections[gIdx] as
                | Required<SectionTransforms>
                | undefined;
              const groupTransforms = blockSection?.groups?.[0];
              const anyBlockSection = SURAH_TRANSFORMS.sections[0] as
                | Required<SectionTransforms>
                | undefined;
              if (!groupTransforms || !anyBlockSection) return null;
              return (
                <DraggableElevatedSvgOverlay
                  key={`custom-overlay-${idx}`}
                  overlay={overlay}
                  s2={anyBlockSection}
                  groupTransforms={groupTransforms}
                  parentSectionId={null}
                />
              );
            })}

          {config.blocks.map((block, idx) => {
            // "grid" blocks (Alak's Section 1) get their own dedicated
            // render above (the `{s1 && (...)}` block) — skip here to avoid
            // rendering the same frame/connectors/drag-handle twice.
            if (block.type === "spacer" || block.type === "grid") return null;
            const sTransform = SURAH_TRANSFORMS.sections[idx] as
              | Required<SectionTransforms>
              | undefined;
            if (!sTransform) return null;
            return (
              <DynamicElevatedBlock
                key={`block-${block.id}`}
                block={block}
                blockIndex={idx}
                sTransform={sTransform}
                config={config}
              />
            );
          })}
        </>
      )}
    </group>
  );
}
