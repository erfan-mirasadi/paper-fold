"use client";
import { VerseBox, UiRect } from "./SharedUI";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import {
  CAPSULE_BG_7_8_17_18,
  CAPSULE_BG_9_10_15_16,
  CAPSULE_BG_12_14,
  WHITE_VERSE_BG,
  MAROON_THEME,
  GREEN_THEME,
} from "../../../data/theme";
import type { ColorGroup } from "../../../data/SurahConfig";
import { OPPOSITE_VERSE_CONNECTOR } from "../../../data/SurahConfig";
import type {
  GroupTransforms,
  RowConnectorTransform,
} from "../../../data/schema";
import { useStoryStore } from "../../../stores/useStoryStore";

interface VerseGroupProps {
  group: ColorGroup;
  groupTransform: GroupTransforms;
  groupIndex?: number;
  layout?: any; // To receive verseTextScale
}

export function VerseGroup({
  group,
  groupTransform,
  groupIndex,
  layout,
}: VerseGroupProps) {
  const gt = groupTransform;
  const borderColor = gt.isCenter ? GREEN_THEME : MAROON_THEME;
  const config = useStoryStore((state) => state.activeConfig);
  const centerFlowerSvg =
    config.id === "ayatalkursi"
      ? "/ayatalKursi/Flower.svg"
      : config.assets?.centerFlowerSvg;

  return (
    <group>
      {/* Group bounding box — color/shadow driven by isCenter flag */}
      {/* <UiRect
        x={gt.frameX}
        y={gt.frameY}
        z={0.0025}
        w={gt.frameW}
        h={gt.frameH}
        radius={0.015}
        color={gt.isCenter ? GREEN_THEME : HOLLOW_BORDER_COLOR}
        shadow={gt.isCenter}
      /> */}

      {/* Row Connectors for opposite verses */}
      {gt.rowConnectors.map((rc: RowConnectorTransform, i: number) => {
        const leftV = group.verses[i * 2];
        const rightV = group.verses[i * 2 + 1];

        if (!leftV || !rightV) return null;

        return (
          <group key={`connector-${i}`}>
            <UiRect
              x={rc.x}
              y={rc.y}
              z={rc.z}
              w={rc.w}
              h={rc.h}
              radius={OPPOSITE_VERSE_CONNECTOR.radius}
              color={borderColor}
            />
            {centerFlowerSvg && (
              <CenterFlower
                x={rc.x + rc.w / 2}
                y={rc.y - rc.h / 2}
                z={rc.z + 0.01}
                svgUrl={centerFlowerSvg}
              />
            )}
          </group>
        );
      })}

      {/* 2×2 verse grid — position comes from the engine, no math here */}
      {group.verses.map((v, i) => {
        // ── Foolproof transform lookup ─────────────────────────────────────────
        // The gt.verses dictionary is keyed by the *Arabic* verse IDs (the ids
        // used in config.sections[*].groups[*].verseIds).  When rendering a
        // non-Arabic language, v.number is still the same verse ID (only the
        // text changes), but in some LTR display orderings the index i inside the
        // group may correspond to a different Arabic verse than v.number would
        // imply.  We resolve this by consulting the active Arabic text data for
        // the current surah, not the hardcoded Alak SURAH_DATA_ARABIC constant.
        let lookupNumber = v.number;

        if (groupIndex !== undefined) {
          // useStoryStore.getState() is the zustand static accessor — safe inside
          // a render function; not a hook call.
          const activeTextData = useStoryStore.getState().activeTextData;
          const arabicData = activeTextData?.["ar"];

          // The verticalGroups section always stores its colorGroups under
          // section2 in SurahDataShape — true for both Alak and Ayat al-Kursi.
          const arabicGroups = arabicData?.section2?.colorGroups;

          const arabicVerseNumber =
            arabicGroups?.[groupIndex]?.verses?.[i]?.number;

          // Only override if the Arabic data gives a *different* number (i.e.
          // the current language displays verses in a different position than
          // the Arabic RTL order and the transform was keyed by the Arabic id).
          if (
            arabicVerseNumber !== undefined &&
            arabicVerseNumber !== v.number
          ) {
            lookupNumber = arabicVerseNumber;
          }
        }

        // Primary lookup by resolved number; fallback to v.number in case the
        // Arabic data and the display data happen to have the same ordering
        // (which is normal for Arabic mode — both resolve to the same key).
        const vt = gt.verses[lookupNumber] ?? gt.verses[v.number];
        if (!vt) return null; // Transform genuinely absent — skip silently.

        // ── Verse background color ─────────────────────────────────────────────
        // Alak-specific verse ranges get dedicated capsule colors.
        // All other surahs fall through to the group-level verseBg fallback
        // (color sync is a separate, future step).
        const finalBg =
          v.number >= 11 && v.number <= 14
            ? CAPSULE_BG_12_14
            : [7, 8, 17, 18].includes(v.number)
              ? CAPSULE_BG_7_8_17_18
              : [9, 10, 15, 16].includes(v.number)
                ? CAPSULE_BG_9_10_15_16
                : (group.verseBg ??
                  (gt.isCenter ? WHITE_VERSE_BG : CAPSULE_BG_7_8_17_18));

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
            bg={finalBg}
            border={borderColor}
            circleBorderCol={borderColor}
            circleBg={finalBg}
            circleTextCol={borderColor}
            isPill={true}
            textScaleOverride={layout?.verseTextScale}
          />
        );
      })}
    </group>
  );
}

function CenterFlower({
  x,
  y,
  z,
  svgUrl,
}: {
  x: number;
  y: number;
  z: number;
  svgUrl: string;
}) {
  const texture = useTexture(svgUrl, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });
  return (
    <group position={[x, y, z]} renderOrder={100}>
      <mesh>
        <planeGeometry args={[0.1, 0.075]} />
        <meshBasicMaterial
          map={texture}
          transparent
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
