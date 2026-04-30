"use client";

import { a, to, useSpring, type SpringValue } from "@react-spring/three";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { RoundedShapeComponent } from "../../SurahLayout/SharedUI";
import { OPPOSITE_VERSE_CONNECTOR } from "../../data/SurahConfig";
import { useSurahLayoutRuntime } from "../../data/useSurahLayoutRuntime";
import { Color, LinearFilter, SRGBColorSpace, type Texture } from "three";

import {
  S1_OUTER_BG,
  S1_OUTER_BORDER,
  HOLLOW_BORDER_COLOR,
  HOLLOW_BORDER_INNER,
  HOLLOW_CONNECTOR_INNER_BG_1_3,
  SECTION_BG_TEXTURE,
  S1_INNER_BORDER,
  MAROON_THEME,
  GREEN_THEME,
} from "../../data/theme";
import { PAGE_DEPTH } from "../../3d-scene/SinglePaper";
import {
  ELEVATED_RETURN_SYNC_MS,
  useElevatedStore,
  type ElevatedSectionId,
} from "./useElevatedStore";
import { dragEngine } from "./drag/dragEngine";
import { useElevatedDrag } from "./drag/useElevatedDrag";
import {
  calculateSectionBounds,
  type SectionBounds,
} from "./drag/boundsHelper";
import { PAPER_MATERIAL_CONFIG } from "../../3d-scene/PaperMaterial";
import { cloneTextureAsAspectCover } from "../../shared/textureFit";

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
  opacity: SpringValue<number>;
  shadowOpacity: SpringValue<number>;
  shadowVisibility: SpringValue<number>;
};

const SECTION_SURFACE = {
  liftHeight: 0.095,
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

function useSectionSurfaceSpring(isActive: boolean): SectionSpring {
  const { liftZ } = useSpring({
    liftZ: isActive ? SECTION_SURFACE.liftHeight : 0,
    from: { liftZ: 0 },
    delay: isActive ? SECTION_SURFACE.liftDelayMs : 0,
    config: SECTION_SURFACE.spring,
  });

  const { opacity } = useSpring({
    opacity: isActive ? 1 : 0,
    from: { opacity: 0 },
    delay: isActive
      ? SECTION_SURFACE.opacityShowDelayMs
      : SECTION_SURFACE.opacityHideDelayMs,
    immediate: isActive,
    config: isActive
      ? SECTION_SURFACE.spring
      : SECTION_SURFACE.opacityHideSpring,
  });

  const { shadowOpacity } = useSpring({
    shadowOpacity: isActive ? SECTION_SURFACE.shadowOpacity : 0,
    from: { shadowOpacity: 0 },
    delay: 0,
    config: SECTION_SURFACE.spring,
  });

  const { shadowVisibility } = useSpring({
    shadowVisibility: isActive ? 1 : 0,
    from: { shadowVisibility: 0 },
    delay: 0,
    config: SECTION_SURFACE.spring,
  });

  return { liftZ, opacity, shadowOpacity, shadowVisibility };
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
                Math.max(vis * VERSE_MIMIC_SHADOW.opacityFlat, shadowOp) *
                shadowStrength,
            )}
          />
        </a.mesh>
      )}

      <a.mesh material-opacity={spring.opacity}>
        <RoundedShapeComponent w={w} h={h} radius={radius} />
        {usesTextureFill ? (
          <meshBasicMaterial
            map={fittedSectionBgTexture}
            color={TEXTURE_FILL_TINT}
            transparent
            opacity={1}
            toneMapped={false}
          />
        ) : (
          <meshBasicMaterial color={color} transparent opacity={1} toneMapped />
        )}
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
    enabled: isActive,
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

  const s1Active = useElevatedStore((s) => s.activeSectionIds.includes("s1"));
  const s2TopActive = useElevatedStore((s) =>
    s.activeSectionIds.includes("s2_top"),
  );
  const s2CenterActive = useElevatedStore((s) =>
    s.activeSectionIds.includes("s2_center"),
  );
  const s2BottomActive = useElevatedStore((s) =>
    s.activeSectionIds.includes("s2_bottom"),
  );
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);

  const s1Spring = useSectionSurfaceSpring(s1Active);
  const s2TopSpring = useSectionSurfaceSpring(s2TopActive);
  const s2CenterSpring = useSectionSurfaceSpring(s2CenterActive);
  const s2BottomSpring = useSectionSurfaceSpring(s2BottomActive);

  const s1 = SURAH_TRANSFORMS.s1;
  const s2 = SURAH_TRANSFORMS.s2;

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
        : calculateSectionBounds("s1", SURAH_TRANSFORMS, runtime.PAGE_WIDTH),
    [isAllSectionsMode, SURAH_TRANSFORMS, runtime.PAGE_WIDTH],
  );
  const s2TopBounds = useMemo(
    () =>
      isAllSectionsMode
        ? undefined
        : calculateSectionBounds(
            "s2_top",
            SURAH_TRANSFORMS,
            runtime.PAGE_WIDTH,
          ),
    [isAllSectionsMode, SURAH_TRANSFORMS, runtime.PAGE_WIDTH],
  );
  const s2CenterBounds = undefined;
  const s2BottomBounds = useMemo(
    () =>
      isAllSectionsMode
        ? undefined
        : calculateSectionBounds(
            "s2_bottom",
            SURAH_TRANSFORMS,
            runtime.PAGE_WIDTH,
          ),
    [isAllSectionsMode, SURAH_TRANSFORMS, runtime.PAGE_WIDTH],
  );

  return (
    <group position={[0, runtime.SCENE_CENTER_Y, 0]}>
      {/* ─── Section 1 ─────────────────────────────────────────────── */}
      <DraggableSectionGroup
        sectionId="s1"
        isActive={s1Active}
        sectionBounds={s1Bounds}
      >
        <ElevatedLayer
          x={s1.frameX}
          y={s1.frameY}
          w={s1.frameW}
          h={s1.frameH}
          radius={0.02}
          color={S1_OUTER_BORDER}
          sectionBgTexture={getTextureForColor(S1_OUTER_BORDER)}
          spring={s1Spring}
        />
        <ElevatedLayer
          x={s1.frameX + s1.borderWidth}
          y={s1.frameY - s1.borderWidth}
          w={s1.frameW - s1.borderWidth * 2}
          h={s1.frameH - s1.borderWidth * 2}
          radius={0.017}
          color={S1_OUTER_BG}
          sectionBgTexture={getTextureForColor(S1_OUTER_BG)}
          spring={s1Spring}
          zOffset={0.001}
          shadow
          shadowStrength={0.95}
        />
        {s1.rowConnectors.map((rc, i) => (
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
      </DraggableSectionGroup>

      {/* ─── Section 2 top connector ───────────────────────────────── */}
      <DraggableSectionGroup
        sectionId="s2_top"
        isActive={s2TopActive}
        sectionBounds={s2TopBounds}
      >
        <ElevatedLayer
          x={topConnector.outer.x}
          y={topConnector.outer.y}
          w={topConnector.outer.w}
          h={topConnector.outer.h}
          radius={topConnector.outer.radius}
          color={HOLLOW_BORDER_COLOR}
          sectionBgTexture={getTextureForColor(HOLLOW_BORDER_COLOR)}
          spring={s2TopSpring}
          shadow
          shadowStrength={0.62}
        />
        <ElevatedLayer
          x={topConnector.middle.x}
          y={topConnector.middle.y}
          w={topConnector.middle.w}
          h={topConnector.middle.h}
          radius={topConnector.middle.radius}
          color={HOLLOW_BORDER_INNER}
          sectionBgTexture={getTextureForColor(HOLLOW_BORDER_INNER)}
          spring={s2TopSpring}
          zOffset={0.0006}
          shadow
          shadowStrength={0.8}
        />
        <ElevatedLayer
          x={topConnector.fill.x}
          y={topConnector.fill.y}
          w={topConnector.fill.w}
          h={topConnector.fill.h}
          radius={topConnector.fill.radius}
          color={HOLLOW_CONNECTOR_INNER_BG_1_3}
          sectionBgTexture={getTextureForColor(HOLLOW_CONNECTOR_INNER_BG_1_3)}
          spring={s2TopSpring}
          zOffset={0.0012}
          shadow
          shadowStrength={0.65}
        />
        {s2.groups[0].rowConnectors.map((rc, i) => (
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
      </DraggableSectionGroup>

      {/* ─── Section 2 Center Group ────────────────────────────────────── */}
      <DraggableSectionGroup
        sectionId="s2_center"
        isActive={s2CenterActive}
        sectionBounds={s2CenterBounds}
      >
        {s2.groups[1].rowConnectors.map((rc, i) => (
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
      </DraggableSectionGroup>

      {/* ─── Section 2 bottom connector ────────────────────────────── */}
      <DraggableSectionGroup
        sectionId="s2_bottom"
        isActive={s2BottomActive}
        sectionBounds={s2BottomBounds}
      >
        <ElevatedLayer
          x={bottomConnector.outer.x}
          y={bottomConnector.outer.y}
          w={bottomConnector.outer.w}
          h={bottomConnector.outer.h}
          radius={bottomConnector.outer.radius}
          color={HOLLOW_BORDER_COLOR}
          sectionBgTexture={getTextureForColor(HOLLOW_BORDER_COLOR)}
          spring={s2BottomSpring}
          shadow
          shadowStrength={0.62}
        />
        <ElevatedLayer
          x={bottomConnector.middle.x}
          y={bottomConnector.middle.y}
          w={bottomConnector.middle.w}
          h={bottomConnector.middle.h}
          radius={bottomConnector.middle.radius}
          color={HOLLOW_BORDER_INNER}
          sectionBgTexture={getTextureForColor(HOLLOW_BORDER_INNER)}
          spring={s2BottomSpring}
          zOffset={0.0006}
          shadow
          shadowStrength={0.8}
        />
        <ElevatedLayer
          x={bottomConnector.fill.x}
          y={bottomConnector.fill.y}
          w={bottomConnector.fill.w}
          h={bottomConnector.fill.h}
          radius={bottomConnector.fill.radius}
          color={HOLLOW_CONNECTOR_INNER_BG_1_3}
          sectionBgTexture={getTextureForColor(HOLLOW_CONNECTOR_INNER_BG_1_3)}
          spring={s2BottomSpring}
          zOffset={0.0012}
          shadow
          shadowStrength={0.65}
        />
        {s2.groups[2].rowConnectors.map((rc, i) => (
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
      </DraggableSectionGroup>
    </group>
  );
}
