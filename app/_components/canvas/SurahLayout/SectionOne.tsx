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
          position={[t.frameX + t.frameW / 2, t.frameY - t.frameH / 2, -0.001]}
          renderOrder={1}
        >
          <planeGeometry args={[t.frameW * 1.107, t.frameH * 1]} />
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
            t.frameY - t.frameH / 2 + 0.01,
            0,
          ]}
          renderOrder={2}
        >
          <planeGeometry args={[t.frameW * 1.1, t.frameH * 1.1]} />
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
      {data.gridVerses.map((v) => {
        const vt = t.verses[v.number];

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
        />
      )}
    </group>
  );
}
