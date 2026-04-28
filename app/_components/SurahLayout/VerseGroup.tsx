"use client";
import { VerseBox, UiRect } from "./SharedUI";
import {
  CAPSULE_BG_7_8_17_18,
  CAPSULE_BG_9_10_15_16,
  CAPSULE_BG_12_14,
  WHITE_VERSE_BG,
  MAROON_THEME,
  GREEN_THEME,
} from "../data/theme";
import type { ColorGroup, GroupTransforms } from "../data/SurahConfig";
import { OPPOSITE_VERSE_CONNECTOR } from "../data/SurahConfig";

interface VerseGroupProps {
  group: ColorGroup;
  groupTransform: GroupTransforms;
  groupIndex?: number;
}

export function VerseGroup({ group, groupTransform }: VerseGroupProps) {
  const gt = groupTransform;
  const borderColor = gt.isCenter ? GREEN_THEME : MAROON_THEME;

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
      {gt.rowConnectors.map((rc, i) => {
        const leftV = group.verses[i * 2];
        const rightV = group.verses[i * 2 + 1];

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
            color={borderColor}
          />
        );
      })}

      {/* 2×2 verse grid — position comes from the engine, no math here */}
      {group.verses.map((v) => {
        const vt = gt.verses[v.number];
        if (!vt) return null;

        // Verses 11–14 always get their dedicated capsule color
        const finalBg =
          v.number >= 11 && v.number <= 14
            ? CAPSULE_BG_12_14
            : [7, 8, 17, 18].includes(v.number)
              ? CAPSULE_BG_7_8_17_18
              : [9, 10, 15, 16].includes(v.number)
                ? CAPSULE_BG_9_10_15_16
                : (group.verseBg ?? (gt.isCenter ? WHITE_VERSE_BG : CAPSULE_BG_7_8_17_18));

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
          />
        );
      })}
    </group>
  );
}
