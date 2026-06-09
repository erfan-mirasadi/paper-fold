"use client";
import { TopLabel, UiRect, VerseBox, AnaAyetTab } from "./SharedUI";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  S1_INNER_BG,
  S1_INNER_BORDER,
  S1_VERSE_NUMBER_BG,
  S1_VERSE_NUMBER_BORDER,
  S1_VERSE_NUMBER_TEXT,
  S1_TOP_LABEL_BG,
  S1_TOP_LABEL_BORDER,
  S1_FRAME_IMAGE,
  S1_FRAME_BG_COLOR,
} from "../../../data/theme";
import {
  OPPOSITE_VERSE_CONNECTOR,
  type SectionOneData,
} from "../../../data/SurahConfig";
import { SectionTransforms, GridSectionConfig } from "../../../data/schema";
import { useStoryStore } from "../../../stores/useStoryStore";

import { useMemo } from "react";

interface SectionOneProps {
  data: SectionOneData;
  transforms: SectionTransforms;
  PW: number;
  isFolded?: boolean;
}

export const SCALLOP_RADIUS_X = 0.053;
export const SCALLOP_RADIUS_Y = 0.03;
export const S1_SOLID_SCALE_X = 1.065;
export const S1_SOLID_SCALE_Y = 0.965;
export const S1_SOLID_Y_OFFSET = -0.005;
export const S1_IMAGE_SCALE = 1.1;
export const S1_IMAGE_Y_OFFSET = 0.01;

export function ScallopedCenteredShape({
  w,
  h,
  radius,
  radiusX = radius,
  radiusY = radius,
  position = "top",
}: {
  w: number;
  h: number;
  radius: number;
  radiusX?: number;
  radiusY?: number;
  position?: "top" | "bottom" | "both" | "none";
}) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const halfW = w / 2;
    const halfH = h / 2;

    if (position === "none") {
      s.moveTo(-halfW, -halfH);
      s.lineTo(-halfW, halfH);
      s.lineTo(halfW, halfH);
      s.lineTo(halfW, -halfH);
      s.lineTo(-halfW, -halfH);
      return s;
    }

    if (position === "bottom" || position === "both") {
      s.moveTo(-halfW, -halfH + radiusY);
    } else {
      s.moveTo(-halfW, -halfH);
    }

    // Top-Left corner
    if (position === "top" || position === "both") {
      s.lineTo(-halfW, halfH - radiusY);
      s.absellipse(-halfW, halfH, radiusX, radiusY, -Math.PI / 2, 0, false, 0);
    } else {
      s.lineTo(-halfW, halfH);
    }

    // Top-Right corner
    if (position === "top" || position === "both") {
      s.lineTo(halfW - radiusX, halfH);
      s.absellipse(
        halfW,
        halfH,
        radiusX,
        radiusY,
        Math.PI,
        Math.PI * 1.5,
        false,
        0,
      );
    } else {
      s.lineTo(halfW, halfH);
    }

    // Bottom-Right corner
    if (position === "bottom" || position === "both") {
      s.lineTo(halfW, -halfH + radiusY);
      s.absellipse(
        halfW,
        -halfH,
        radiusX,
        radiusY,
        Math.PI / 2,
        Math.PI,
        false,
        0,
      );
    } else {
      s.lineTo(halfW, -halfH);
    }

    // Bottom-Left corner
    if (position === "bottom" || position === "both") {
      s.lineTo(-halfW + radiusX, -halfH);
      s.absellipse(-halfW, -halfH, radiusX, radiusY, 0, Math.PI / 2, false, 0);
    } else {
      s.lineTo(-halfW, -halfH);
    }

    return s;
  }, [w, h, radius, radiusX, radiusY, position]);

  return <shapeGeometry args={[shape]} />;
}

/** Generic SVG overlay — used for any verse that has a customFrameSvg override */
function SvgFrameOverlay({
  x,
  y,
  z,
  w,
  h,
  svgUrl,
  renderW,
  renderH,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  svgUrl: string;
  renderW: number;
  renderH: number;
}) {
  const texture = useTexture(svgUrl, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

  return (
    <mesh position={[x + w / 2, y - h / 2, z]} renderOrder={15}>
      <planeGeometry args={[renderW, renderH]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export function SectionOne({ data, transforms, PW }: SectionOneProps) {
  const hideSectionLabel = false;
  const t = transforms as Required<SectionTransforms>;

  const texture = useTexture(S1_FRAME_IMAGE, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

  const config = useStoryStore(state => state.activeConfig);
  const s1Config = config.sections[0] as GridSectionConfig;

  // Build a verse-number → text map from the prop data.
  // Keyed by canonical Arabic verse number — works for any active language.
  const verseTextMap = useMemo(() => {
    const map: Record<number, string> = {};
    data.gridVerses.forEach((v) => {
      map[v.number] = v.text;
    });
    if (data.anaAyet) map[data.anaAyet.number] = data.anaAyet.text;
    return map;
  }, [data]);

  // All verse IDs for this section in config order: grid verses first, then anaAyet.
  const allVerseIds: number[] = [
    ...s1Config.verses,
    ...(s1Config.anaAyet !== undefined ? [s1Config.anaAyet] : []),
  ];

  const BW = 0.0055; // border width matching VerseMesh.bw
  const SVG_WIDTH_SCALE = 0.8;
  const SVG_HEIGHT_SCALE = 0.93;
  const ANA_LABEL_PIN_OVERLAP = 0.0015;

  return (
    <group>
      <>
        {/* Yellow solid background */}
        <mesh
          position={[
            t.frameX + t.frameW / 2,
            t.frameY - t.frameH / 2 + S1_SOLID_Y_OFFSET,
            -0.001,
          ]}
          renderOrder={1}
        >
          <ScallopedCenteredShape
            w={t.frameW * S1_SOLID_SCALE_X}
            h={t.frameH * S1_SOLID_SCALE_Y}
            radius={0.039}
            radiusX={SCALLOP_RADIUS_X}
            radiusY={SCALLOP_RADIUS_Y}
            position="top"
          />
          <meshBasicMaterial
            color={S1_FRAME_BG_COLOR}
            toneMapped={false}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>

        {/* Simple stretched main-frame image as background */}
        <mesh
          position={[
            t.frameX + t.frameW / 2,
            t.frameY - t.frameH / 2 + S1_IMAGE_Y_OFFSET,
            0,
          ]}
          renderOrder={2}
        >
          <planeGeometry
            args={[t.frameW * S1_IMAGE_SCALE, t.frameH * S1_IMAGE_SCALE]}
          />
          <meshBasicMaterial
            map={texture}
            transparent
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </>

      {/* Row Connectors for opposite verses */}
      {t.rowConnectors.map((rc, i) => {
        const leftV = data.gridVerses[i * 2];
        const rightV = data.gridVerses[i * 2 + 1];

        if (!leftV || !rightV) return null;

        return (
          <UiRect
            key={`connector-${i}`}
            x={rc.x}
            y={rc.y}
            z={rc.z}
            w={rc.w}
            h={rc.h}
            radius={OPPOSITE_VERSE_CONNECTOR.radius}
            color={S1_INNER_BORDER}
          />
        );
      })}

      {/* ── Unified verse loop: grid verses + anaAyet, all driven by config overrides ── */}
      {allVerseIds.map((vId) => {
        // Resolve the base layout transform.
        // Grid verses: t.verses[vId]; anaAyet: t.anaAyet
        const isAnaAyet = vId === s1Config.anaAyet;
        const rawT = isAnaAyet ? t.anaAyet : t.verses?.[vId];
        if (!rawT) return null;

        // Override-driven sizing, colors, and decorators
        const override = config.verseOverrides?.[vId];
        const expandW = override?.expandW ?? 0;
        const expandH = override?.expandH ?? 0;

        const w = rawT.w + expandW * 2;
        const h = rawT.h + expandH * 2;
        const outerW = w + BW * 2;
        const outerH = h + BW * 2;

        // Expanded position: shift origin to account for the grow
        const expandedX = rawT.x - expandW;
        const expandedY = rawT.y + expandH;

        const bg = override?.bg ?? S1_INNER_BG;
        const border = override?.border ?? S1_INNER_BORDER;
        const isPill = override?.isPill ?? true;
        const shrinkX = isPill ? 0.001 : 0;
        const circleBorderCol =
          override?.circleBorderCol ??
          override?.border ??
          S1_VERSE_NUMBER_BORDER;
        const circleBg =
          override?.circleBg ?? override?.bg ?? S1_VERSE_NUMBER_BG;
        const circleTextCol =
          override?.circleTextCol ?? override?.border ?? S1_VERSE_NUMBER_TEXT;
        const textColor = override?.textColor;

        // SVG frame overlay (generic — any verse with a customFrameSvg gets one)
        const svgUrl = override?.customFrameSvg;

        // AnaAyetTab (generic — any verse with hasAnaAyetTab: true in its override)
        const hasTab = override?.hasAnaAyetTab && t.anaAyetTabW != null;
        const labelW = t.anaAyetTabW ?? 0;
        const labelH = t.anaAyetTabH ?? 0;
        const labelDrop = t.anaAyetLabelDrop ?? 0.015;

        return (
          <group key={vId}>
            <VerseBox
              x={expandedX}
              y={expandedY}
              z={rawT.z}
              w={w}
              h={h}
              verse={verseTextMap[vId] ?? ""}
              number={vId}
              bg={bg}
              border={border}
              circleBorderCol={circleBorderCol}
              circleBg={circleBg}
              circleTextCol={circleTextCol}
              isPill={isPill}
              textColor={textColor}
            />

            {/* Generic SVG decorative frame — rendered for any verse with customFrameSvg */}
            {svgUrl && (
              <SvgFrameOverlay
                x={expandedX - BW + shrinkX}
                y={expandedY + BW}
                z={rawT.z + 0.003}
                w={outerW}
                h={outerH}
                svgUrl={svgUrl}
                renderW={outerW * SVG_WIDTH_SCALE}
                renderH={outerH * SVG_HEIGHT_SCALE}
              />
            )}

            {/* Generic AnaAyetTab — rendered for any verse with hasAnaAyetTab: true */}
            {hasTab && (
              <AnaAyetTab
                x={t.anaAyetTabX!}
                y={t.anaAyetTabY!}
                w={labelW}
                h={labelH}
                z={rawT.z + 0.004}
                borderWidth={t.anaAyetTabBorderWidth}
                renderOrder={110}
              />
            )}
          </group>
        );
      })}

      {/* Section title label pinned to the top edge */}
      {!hideSectionLabel && (
        <TopLabel
          x={PW / 2}
          y={t.labelPinY}
          z={0.004}
          text={data.label}
          bgColor={S1_TOP_LABEL_BG}
          borderColor={S1_TOP_LABEL_BORDER}
          renderOrder={100}
          shadow={false}
        />
      )}
    </group>
  );
}
