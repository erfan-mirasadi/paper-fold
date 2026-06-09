"use client";

import { useEffect, useState } from "react";
import { a, to, useSpring } from "@react-spring/three";
import { TopLabel } from "../SurahLayout/SharedUI";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import {
  SURAH_DATA_BY_LANGUAGE,
  useSurahLanguageStore,
} from "../../../hooks/useSurahLanguageStore";
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

  const isActive = useElevatedStore((s) =>
    s.activeSectionIds.includes(sectionId),
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

import { useStoryStore } from "../../../stores/useStoryStore";
import { GridSectionConfig, VerticalGroupsSectionConfig } from "../../../data/schema";

export function ElevatedSectionLabels() {
  const config = useStoryStore((state) => state.activeConfig);
  const runtime = useSurahLayoutRuntime();
  const SURAH_TRANSFORMS = runtime.SURAH_TRANSFORMS;

  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const surahData = SURAH_DATA_BY_LANGUAGE[activeLanguage];
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

  config.sections.forEach((section, idx) => {
    const sTransform = SURAH_TRANSFORMS.sections[idx]!;
    if (section.type === "gridWithAnaAyet") {
      const gConfig = section as GridSectionConfig;
      labelsToRender.push({
        key: gConfig.id,
        sectionId: gConfig.id,
        y: sTransform.labelPinY!,
        text: isIntroActive
          ? "بِسْـــــــــــــــــمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
          : getLabelText(gConfig.labelKey),
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
    } else if (section.type === "verticalGroups") {
      const vConfig = section as VerticalGroupsSectionConfig;
      labelsToRender.push({
        key: `${vConfig.id}_top`,
        sectionId: `${vConfig.id}_top`,
        y: sTransform.topLabelPinY!,
        text: getLabelText(vConfig.topLabelKey),
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

      labelsToRender.push({
        key: `${vConfig.id}_bottom`,
        sectionId: `${vConfig.id}_bottom`,
        y: sTransform.bottomLabelPinY!,
        text: getLabelText(vConfig.bottomLabelKey),
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
  });

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
