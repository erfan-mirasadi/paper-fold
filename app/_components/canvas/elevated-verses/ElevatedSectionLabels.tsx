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
  type ElevatedSectionId,
} from "../../../stores/useElevatedStore";
import { dragEngine } from "../../../utils/dragEngine";
import { useElevatedDrag } from "../../../hooks/useElevatedDrag";
import { useFoldStore } from "../orchestrator/ScrollManager";
import { useIntroSectionOffset } from "../../../hooks/useIntroSectionAnimation";
import { IntroGuide3DReporter } from "../intro/section-guides/IntroGuide3DReporter";
import { IntroCenterGuideReporter } from "../intro/section-guides/IntroCenterGuideReporter";

type AnimatedLabelProps = {
  sectionId: ElevatedSectionId;
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
  introGuidesActive?: boolean;
  pageWidth: number;
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
  introGuidesActive = false,
  pageWidth,
}: AnimatedLabelProps) {
  const PAGE_WIDTH = pageWidth;

  const isActive = useElevatedStore((s) =>
    s.activeSectionIds.includes(sectionId),
  );
  const [isMounted, setIsMounted] = useState(isActive);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setIsMounted(isActive);
      },
      isActive ? 0 : ELEVATED_RETURN_SYNC_MS,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [isActive]);

  const { liftZ } = useSpring({
    from: { liftZ: 0 },
    to: {
      liftZ: isActive ? liftHeight : 0,
    },
    config: {
      mass: 2.0,
      tension,
      friction,
    },
    delay: isActive ? delayMs : 0,
  });

  // Drag: label drags the entire section
  const sectionDrag = dragEngine.sections[sectionId];
  const dragBind = useElevatedDrag({
    enabled: isActive && !useFoldStore.getState().isIntroActive,
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
          />
          {introGuidesActive ? (
            <IntroGuide3DReporter
              guideId={sectionId}
              pinY={y}
              labelZ={labelZ}
              pageWidth={PAGE_WIDTH}
            />
          ) : null}
        </a.group>
      </a.group>
    </group>
  );
}

type ElevatedSectionLabelsProps = {
  introGuidesActive?: boolean;
};

export function ElevatedSectionLabels({
  introGuidesActive = false,
}: ElevatedSectionLabelsProps) {
  const runtime = useSurahLayoutRuntime();
  const SURAH_TRANSFORMS = runtime.SURAH_TRANSFORMS;

  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const surahData = SURAH_DATA_BY_LANGUAGE[activeLanguage];

  return (
    <group position={[0, runtime.SCENE_CENTER_Y, 0]}>
      {introGuidesActive ? <IntroCenterGuideReporter /> : null}
      <AnimatedElevatedLabel
        sectionId="s1"
        y={SURAH_TRANSFORMS.s1.labelPinY}
        text={surahData.section1.label}
        bgColor={S1_TOP_LABEL_BG}
        borderColor={S1_TOP_LABEL_BORDER}
        delayMs={55}
        liftHeight={0.14}
        tension={96}
        friction={24}
        renderOrder={220}
        introGuidesActive={introGuidesActive}
        pageWidth={runtime.PAGE_WIDTH}
      />

      <AnimatedElevatedLabel
        sectionId="s2_top"
        y={SURAH_TRANSFORMS.s2.topLabelPinY}
        text={surahData.section2.topLabel}
        bgColor={S2_TOP_LABEL_BG}
        borderColor={S2_TOP_LABEL_BORDER}
        partialBorder={true}
        delayMs={95}
        liftHeight={0.092}
        tension={90}
        friction={23}
        zBaseOffset={0.0022}
        labelZ={0.00035}
        renderOrder={240}
        introGuidesActive={introGuidesActive}
        pageWidth={runtime.PAGE_WIDTH}
      />

      <AnimatedElevatedLabel
        sectionId="s2_bottom"
        y={SURAH_TRANSFORMS.s2.bottomLabelPinY}
        text={surahData.section2.bottomLabel}
        bgColor={S2_TOP_LABEL_BG}
        borderColor={S2_TOP_LABEL_BORDER}
        partialBorder={true}
        bottomBorder={true}
        delayMs={130}
        liftHeight={0.096}
        tension={84}
        friction={22}
        zBaseOffset={0.0022}
        labelZ={0.00035}
        renderOrder={240}
        introGuidesActive={introGuidesActive}
        pageWidth={runtime.PAGE_WIDTH}
      />
    </group>
  );
}
