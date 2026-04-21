"use client";

import { a, to, useSpring, type SpringValue } from "@react-spring/three";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { RoundedShapeComponent } from "../../SurahLayout/SharedUI";
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  SURAH_TRANSFORMS,
} from "../../data/SurahConfig";
import {
  Color,
  ClampToEdgeWrapping,
  LinearFilter,
  NoColorSpace,
  type Texture,
  Vector2,
} from "three";

import {
  S1_OUTER_BG,
  S1_OUTER_BORDER,
  HOLLOW_BORDER_COLOR,
  HOLLOW_BORDER_INNER,
  HOLLOW_CONNECTOR_INNER_BG_1_3,
} from "../../data/theme";
import { PAGE_DEPTH } from "../../3d-scene/SinglePaper";
import {
  ELEVATED_RETURN_SYNC_MS,
  useElevatedStore,
  type ElevatedSectionId,
} from "./useElevatedStore";
import { dragEngine } from "./drag/dragEngine";
import { useElevatedDrag } from "./drag/useElevatedDrag";

const SURFACE_NORMAL_SCALE = new Vector2(0.8, 0.8);
const ELEVATED_SURFACE_DARKNESS = 0.7;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function buildSectionNormalMap(
  source: Texture,
  x: number,
  y: number,
  w: number,
  h: number,
): Texture {
  const xStart = clamp(x, 0, PAGE_WIDTH);
  const xEnd = clamp(x + w, 0, PAGE_WIDTH);
  const yTop = clamp(y, -PAGE_HEIGHT, 0);
  const yBottom = clamp(y - h, -PAGE_HEIGHT, 0);

  const mappedW = Math.max(xEnd - xStart, 0.0001);
  const mappedH = Math.max(yTop - yBottom, 0.0001);

  const texture = source.clone();
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.repeat.set(mappedW / PAGE_WIDTH, mappedH / PAGE_HEIGHT);
  texture.offset.set(
    xStart / PAGE_WIDTH,
    (yBottom + PAGE_HEIGHT) / PAGE_HEIGHT,
  );
  texture.needsUpdate = true;
  return texture;
}

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
  shadowOpacity: 0.26,
  spring: {
    mass: 2.2,
    tension: 85,
    friction: 22,
  },
};

const VERSE_MIMIC_SHADOW = {
  offsetX: 0,
  offsetY: -0.004,
  insetZ: -0.001,
  scale: 1.05,
  opacityFlat: 0.6,
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
    config: SECTION_SURFACE.spring,
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
  paperNormalTexture: Texture;
  spring: SectionSpring;
  zOffset?: number;
  shadow?: boolean;
  shadowStrength?: number;
  shadowInsetZ?: number;
}

function ElevatedLayer({
  x,
  y,
  w,
  h,
  radius,
  color,
  paperNormalTexture,
  spring,
  zOffset = 0,
  shadow = false,
  shadowStrength = 1,
  shadowInsetZ = VERSE_MIMIC_SHADOW.insetZ,
}: ElevatedLayerProps) {
  const baseZ = PAGE_DEPTH / 2 + 0.001 + zOffset;
  const shadedColor = useMemo(
    () => new Color(color).multiplyScalar(ELEVATED_SURFACE_DARKNESS).getStyle(),
    [color],
  );
  const sectionNormalMap = useMemo(
    () => buildSectionNormalMap(paperNormalTexture, x, y, w, h),
    [paperNormalTexture, x, y, w, h],
  );

  useEffect(() => {
    return () => {
      sectionNormalMap.dispose();
    };
  }, [sectionNormalMap]);

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
        <meshStandardMaterial
          color={shadedColor}
          transparent
          opacity={1}
          roughness={0.8}
          metalness={0.02}
          envMapIntensity={0.2}
          normalMap={sectionNormalMap}
          normalScale={SURFACE_NORMAL_SCALE}
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
  children,
}: {
  sectionId: ElevatedSectionId;
  isActive: boolean;
  children: React.ReactNode;
}) {
  const sectionDrag = dragEngine.sections[sectionId];
  const dragBind = useElevatedDrag({
    enabled: isActive,
    springX: sectionDrag.x,
    springY: sectionDrag.y,
    dragSectionId: sectionId,
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
  const paperTextureNormal = useTexture(
    "/Paper-Texture-7_normal.png",
    (texture) => {
      texture.colorSpace = NoColorSpace;
      texture.wrapS = ClampToEdgeWrapping;
      texture.wrapT = ClampToEdgeWrapping;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
    },
  );

  const activeSectionIds = useElevatedStore((s) => s.activeSectionIds);
  const s1Active = activeSectionIds.includes("s1");
  const s2TopActive = activeSectionIds.includes("s2_top");
  const s2BottomActive = activeSectionIds.includes("s2_bottom");

  const s1Spring = useSectionSurfaceSpring(s1Active);
  const s2TopSpring = useSectionSurfaceSpring(s2TopActive);
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

  return (
    <group position={[0, PAGE_HEIGHT / 2, 0]}>
      {/* ─── Section 1 ─────────────────────────────────────────────── */}
      <DraggableSectionGroup sectionId="s1" isActive={s1Active}>
        <ElevatedLayer
          x={s1.frameX}
          y={s1.frameY}
          w={s1.frameW}
          h={s1.frameH}
          radius={0.02}
          color={S1_OUTER_BORDER}
          paperNormalTexture={paperTextureNormal}
          spring={s1Spring}
        />
        <ElevatedLayer
          x={s1.frameX + s1.borderWidth}
          y={s1.frameY - s1.borderWidth}
          w={s1.frameW - s1.borderWidth * 2}
          h={s1.frameH - s1.borderWidth * 2}
          radius={0.017}
          color={S1_OUTER_BG}
          paperNormalTexture={paperTextureNormal}
          spring={s1Spring}
          zOffset={0.001}
          shadow
          shadowStrength={0.95}
        />
      </DraggableSectionGroup>

      {/* ─── Section 2 top connector ───────────────────────────────── */}
      <DraggableSectionGroup sectionId="s2_top" isActive={s2TopActive}>
        <ElevatedLayer
          x={topConnector.outer.x}
          y={topConnector.outer.y}
          w={topConnector.outer.w}
          h={topConnector.outer.h}
          radius={topConnector.outer.radius}
          color={HOLLOW_BORDER_COLOR}
          paperNormalTexture={paperTextureNormal}
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
          paperNormalTexture={paperTextureNormal}
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
          paperNormalTexture={paperTextureNormal}
          spring={s2TopSpring}
          zOffset={0.0012}
          shadow
          shadowStrength={0.65}
        />
      </DraggableSectionGroup>

      {/* ─── Section 2 bottom connector ────────────────────────────── */}
      <DraggableSectionGroup sectionId="s2_bottom" isActive={s2BottomActive}>
        <ElevatedLayer
          x={bottomConnector.outer.x}
          y={bottomConnector.outer.y}
          w={bottomConnector.outer.w}
          h={bottomConnector.outer.h}
          radius={bottomConnector.outer.radius}
          color={HOLLOW_BORDER_COLOR}
          paperNormalTexture={paperTextureNormal}
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
          paperNormalTexture={paperTextureNormal}
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
          paperNormalTexture={paperTextureNormal}
          spring={s2BottomSpring}
          zOffset={0.0012}
          shadow
          shadowStrength={0.65}
        />
      </DraggableSectionGroup>
    </group>
  );
}
