"use client";
// Purpose: Renders a single thematic 2×2 verse cluster inside Section 2.
//          Receives a pre-computed GroupTransforms object from the LayoutEngine.
//          Does ZERO positional math — positions come directly from the engine.

import { VerseBox, UiRect } from "./SharedUI";
import {
  CAPSULE_BG_7_10_15_18,
  CAPSULE_BG_12_14,
  WHITE_VERSE_BG,
  MAROON_THEME,
  GREEN_THEME,
} from "../data/theme";
import type { ColorGroup, GroupTransforms } from "../data/SurahConfig";
import { OPPOSITE_VERSE_CONNECTOR } from "../data/SurahConfig";
import { useDelayedHidden } from "../shared/useDelayedHidden";
import {
  ELEVATED_RETURN_SYNC_MS,
  useElevatedStore,
} from "../features/elevated-verses/useElevatedStore";

interface VerseGroupProps {
  group: ColorGroup;
  groupTransform: GroupTransforms;
  groupIndex?: number;
}

export function VerseGroup({
  group,
  groupTransform,
  groupIndex = 0,
}: VerseGroupProps) {
  const gt = groupTransform;
  const borderColor = gt.isCenter ? GREEN_THEME : MAROON_THEME;

  const sectionId =
    groupIndex === 0 ? "s2_top" : groupIndex === 1 ? "s2_center" : "s2_bottom";
  const activeSectionIds = useElevatedStore((state) => state.activeSectionIds);
  const isElevatedNow = activeSectionIds.includes(sectionId);
  const hideConnectors = useDelayedHidden(isElevatedNow, ELEVATED_RETURN_SYNC_MS);

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
      {!hideConnectors && gt.rowConnectors.map((rc, i) => {
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
            : group.verseBg ??
              (gt.isCenter ? WHITE_VERSE_BG : CAPSULE_BG_7_10_15_18);

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
