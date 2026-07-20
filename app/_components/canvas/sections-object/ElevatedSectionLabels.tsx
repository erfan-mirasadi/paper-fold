"use client";

import { useEffect, useState } from "react";
import { a, to, useSpring } from "@react-spring/three";
import { TopLabel } from "../SurahLayout/SharedUI";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import {
  useSurahLanguageStore,
} from "../../../hooks/useSurahLanguageStore";
import { useStoryStore } from "../../../stores/useStoryStore";
import {
  S1_TOP_LABEL_BG,
  S1_TOP_LABEL_BORDER,
  S2_TOP_LABEL_BG,
  S2_TOP_LABEL_BORDER,
} from "../../../data/theme";
import { PAGE_DEPTH } from "../3d-scene/SinglePaper";
import {
  ELEVATED_RETURN_SYNC_MS,
  useElevatedStore,
} from "../../../stores/useElevatedStore";
import { dragEngine } from "../../../utils/dragEngine";
import { useElevatedDrag } from "../../../hooks/useElevatedDrag";
import { useFoldStore } from "../orchestrator/ScrollManager";
import { useIntroSectionOffset } from "../../../hooks/useIntroSectionAnimation";
import { LABEL_ELEVATION_HEIGHT } from "../../../hooks/useElevateAnimation";

type AnimatedLabelProps = {
  sectionId: string;
  y: number;
  text: string;
  bgColor: string;
  borderColor: string;
  partialBorder?: boolean;
  bottomBorder?: boolean;
  delayMs: number;
  liftHeight: number;
  tension?: number;
  friction?: number;
  zBaseOffset?: number;
  labelZ?: number;
  renderOrder?: number;
  depthTest?: boolean;
  fontSizeOverride?: number;
};

function AnimatedElevatedLabel({
  sectionId,
  y,
  text,
  bgColor,
  borderColor,
  partialBorder = false,
  bottomBorder = false,
  delayMs,
  liftHeight,
  tension = 88,
  friction = 23,
  zBaseOffset = 0.002,
  labelZ = 0.00035,
  renderOrder,
  depthTest = false,
  fontSizeOverride,
}: AnimatedLabelProps) {
  const PAGE_WIDTH = useSurahLayoutRuntime().PAGE_WIDTH;

  // Elevated section labels only lift in all-sections mode / intro — a plain
  // paper click just zooms the camera and leaves the paper flat.
  const isActive = useElevatedStore((s) =>
    s.isAllSectionsMode && s.activeSectionIds.includes(sectionId),
  );

  const isIntroActive = useFoldStore((s) => s.isIntroActive);
  const isFoldedMainPaper = useFoldStore(
    (s) => !s.isIntroActive && s.currentOffset < 0.98,
  );
  const actuallyActive = isActive && !isFoldedMainPaper;

  const [isMounted, setIsMounted] = useState(actuallyActive);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setIsMounted(actuallyActive);
      },
      actuallyActive ? 0 : ELEVATED_RETURN_SYNC_MS,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [actuallyActive]);

  const { liftZ } = useSpring({
    from: { liftZ: 0 },
    to: {
      liftZ: actuallyActive ? liftHeight : 0,
    },
    config: {
      mass: 2.0,
      tension,
      friction,
    },
    delay: actuallyActive ? delayMs : 0,
  });

  // Drag: label drags the entire section
  const sectionDrag = dragEngine.sections[sectionId];
  const dragBind = useElevatedDrag({
    enabled: actuallyActive && !isIntroActive,
    springX: sectionDrag.x,
    springY: sectionDrag.y,
    dragSectionId: sectionId,
  });

  const introRef = useIntroSectionOffset(sectionId);

  if (!isMounted) return null;

  return (
    <group ref={introRef}>
      <a.group
        {...dragBind}
        position-x={sectionDrag.x}
        position-y={sectionDrag.y}
      >
        <a.group
          // Convert from paper-local (0..PAGE_WIDTH) to centered world space.
          position={[-PAGE_WIDTH / 2, 0, 0]}
          position-z={to(liftZ, (lift) => PAGE_DEPTH / 2 + zBaseOffset + lift)}
        >
          <TopLabel
            x={PAGE_WIDTH / 2}
            y={y}
            z={labelZ}
            text={text}
            bgColor={bgColor}
            borderColor={borderColor}
            partialBorder={partialBorder}
            bottomBorder={bottomBorder}
            renderOrder={renderOrder}
            depthTest={depthTest}
            fontSizeOverride={fontSizeOverride}
          />
        </a.group>
      </a.group>
    </group>
  );
}

export function ElevatedSectionLabels() {
  const config = useStoryStore((state) => state.activeConfig);
  const runtime = useSurahLayoutRuntime();
  const SURAH_TRANSFORMS = runtime.SURAH_TRANSFORMS;

  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const activeTextData = useStoryStore((s) => s.activeTextData);
  const surahData = activeTextData[activeLanguage];
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  // ALL labels hidden during intro→paper transition.
  const [postIntroSettled, setPostIntroSettled] = useState(
    () => !useFoldStore.getState().isIntroActive,
  );
  useEffect(() => {
    if (!isIntroActive) {
      const t = setTimeout(() => setPostIntroSettled(true), 800);
      return () => clearTimeout(t);
    } else {
      setPostIntroSettled(false);
    }
  }, [isIntroActive]);
  const showLabels = postIntroSettled && !isIntroActive;

  const getLabelText = (key: string | undefined) => {
    switch (key) {
      case "section1Label":
        return surahData.section1.label;
      case "section2TopLabel":
        return surahData.section2.topLabel;
      case "section2BottomLabel":
        return surahData.section2.bottomLabel;
      default:
        return "";
    }
  };

  const labelsToRender: Array<AnimatedLabelProps & { key: string; showInIntro: boolean }> = [];

  {
    const blocks = config.blocks ?? [];
    const gridBlockIdx = blocks.findIndex((b: any) => b.type === "grid");
    if (gridBlockIdx >= 0) {
      const gridBlock = blocks[gridBlockIdx];
      const sTransform = SURAH_TRANSFORMS.sections[gridBlockIdx]!;
      labelsToRender.push({
        key: gridBlock.id,
        sectionId: gridBlock.id,
        y: sTransform.labelPinY!,
        text: isIntroActive
          ? "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
          : getLabelText(gridBlock.labelKey),
        fontSizeOverride: isIntroActive ? 0.032 : undefined,
        bgColor: S1_TOP_LABEL_BG,
        borderColor: S1_TOP_LABEL_BORDER,
        delayMs: 55,
        liftHeight: LABEL_ELEVATION_HEIGHT,
        tension: 96,
        friction: 24,
        renderOrder: 220,
        depthTest: true,
        showInIntro: true,
      });
    }

    // "Section 2" top/bottom labels are surah-wide, not per-block — read
    // topLabelKey/bottomLabelKey off any non-grid block that declares them
    // (every non-grid SectionTransforms shares the same topLabelPinY/
    // bottomLabelPinY, computed once for the whole block stack).
    const realGroupBlocks = blocks
      .map((b: any, i: number) => ({ b, i }))
      .filter(({ b }: any) => b.type === "group" && !b.introOutroRole);
    const labelSourceBlock = blocks.find(
      (b: any) => b.topLabelKey || b.bottomLabelKey,
    );
    if (labelSourceBlock && realGroupBlocks.length > 0) {
      const anyIdx = blocks.findIndex((b: any) => b.type !== "grid");
      const sTransform = SURAH_TRANSFORMS.sections[anyIdx]!;
      const topSectionId = realGroupBlocks[0].b.id;
      const bottomSectionId = realGroupBlocks[realGroupBlocks.length - 1].b.id;

      const topText = getLabelText(labelSourceBlock.topLabelKey);
      if (topText) {
        labelsToRender.push({
          key: "section2_top_label",
          sectionId: topSectionId,
          y: sTransform.topLabelPinY!,
          text: topText,
          bgColor: S2_TOP_LABEL_BG,
          borderColor: S2_TOP_LABEL_BORDER,
          partialBorder: true,
          delayMs: 95,
          liftHeight: LABEL_ELEVATION_HEIGHT,
          tension: 90,
          friction: 23,
          zBaseOffset: 0.0022,
          labelZ: 0.00035,
          renderOrder: 240,
          depthTest: true,
          showInIntro: false,
        });
      }

      const bottomText = getLabelText(labelSourceBlock.bottomLabelKey);
      if (bottomText) {
        labelsToRender.push({
          key: "section2_bottom_label",
          sectionId: bottomSectionId,
          y: sTransform.bottomLabelPinY!,
          text: bottomText,
          bgColor: S2_TOP_LABEL_BG,
          borderColor: S2_TOP_LABEL_BORDER,
          partialBorder: true,
          bottomBorder: true,
          delayMs: 130,
          liftHeight: LABEL_ELEVATION_HEIGHT,
          tension: 84,
          friction: 22,
          zBaseOffset: 0.0022,
          labelZ: 0.00035,
          renderOrder: 240,
          depthTest: true,
          showInIntro: false,
        });
      }
    }
  }

  return (
    <group position={[0, runtime.SCENE_CENTER_Y, 0]}>
      {labelsToRender.map((labelConfig) => {
        const { key, showInIntro, ...props } = labelConfig;
        const shouldShow = showInIntro
          ? isIntroActive || showLabels
          : showLabels;

        if (!shouldShow) return null;

        return (
          <group key={key}>
            <AnimatedElevatedLabel
              {...props}
            />
          </group>
        );
      })}
    </group>
  );
}
