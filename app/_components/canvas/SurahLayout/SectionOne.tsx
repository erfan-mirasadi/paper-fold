"use client";
import { TopLabel, UiRect, VerseBox, AnaAyetTab } from "./SharedUI";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  S1_INNER_BG,
  S1_INNER_BORDER,
  S1_ANA_BG,
  CAPSULE_BG_5,
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
  type S1Transforms,
} from "../../../data/SurahConfig";
interface SectionOneProps {
  data: SectionOneData;
  transforms: S1Transforms;
  PW: number;
  isFolded?: boolean;
}

import { useMemo } from "react";
import { SURAH_DATA_ARABIC } from "../../../data/surahData";

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

export function SectionOne({ data, transforms, PW }: SectionOneProps) {
  const hideSectionLabel = false;
  const t = transforms;

  const texture = useTexture(S1_FRAME_IMAGE, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

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

      {/* 2×2 verse grid — positions come from the engine, no math here */}
      {data.gridVerses.map((v, i) => {
        const isLTR = data.gridVerses[0].number === 1;
        const lookupNumber = isLTR
          ? SURAH_DATA_ARABIC.section1.gridVerses[i].number
          : v.number;
        const vt = t.verses[lookupNumber];

        return (
          <VerseBox
            key={v.number}
            x={vt.x}
            y={vt.y}
            z={vt.z}
            w={vt.w}
            h={vt.h}
            verse={v.text}
            number={v.number}
            bg={S1_INNER_BG}
            border={S1_INNER_BORDER}
            circleBorderCol={S1_VERSE_NUMBER_BORDER}
            circleBg={S1_VERSE_NUMBER_BG}
            circleTextCol={S1_VERSE_NUMBER_TEXT}
            isPill={true}
          />
        );
      })}

      {/* AnaAyet — y offset absorbed by LayoutEngine, no wrapper group needed */}
      <VerseBox
        x={t.anaAyet.x}
        y={t.anaAyet.y}
        z={t.anaAyet.z}
        w={t.anaAyet.w}
        h={t.anaAyet.h}
        verse={data.anaAyet.text}
        number={data.anaAyet.number}
        bg={S1_ANA_BG}
        border={CAPSULE_BG_5}
        circleBorderCol={CAPSULE_BG_5}
        circleBg={S1_ANA_BG}
        circleTextCol={CAPSULE_BG_5}
        isPill={false}
      />
      <AnaAyetTab
        x={t.anaAyetTabX}
        y={t.anaAyetTabY}
        w={t.anaAyetTabW}
        h={t.anaAyetTabH}
        z={0.005}
        borderWidth={t.anaAyetTabBorderWidth}
        renderOrder={100}
      />

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
