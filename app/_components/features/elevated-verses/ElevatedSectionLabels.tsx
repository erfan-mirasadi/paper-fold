"use client";

import { useEffect, useState } from "react";
import { a, to, useSpring } from "@react-spring/three";
import { TopLabel } from "../../SurahLayout/SharedUI";
import {
  PAGE_HEIGHT,
  PAGE_WIDTH,
  SURAH_DATA,
  SURAH_TRANSFORMS,
} from "../../data/SurahConfig";
import {
  S1_TOP_LABEL_BG,
  S1_TOP_LABEL_BORDER,
  S2_TOP_LABEL_BG,
  S2_TOP_LABEL_BORDER,
} from "../../data/theme";
import { PAGE_DEPTH } from "../../3d-scene/SinglePaper";
import { useElevatedStore, type ElevatedSectionId } from "./useElevatedStore";

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
};

const LABEL_RETURN_ANIMATION_MS = 480;

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
  zBaseOffset = 0.003,
  labelZ = 0.004,
  renderOrder,
}: AnimatedLabelProps) {
  const activeSectionIds = useElevatedStore((s) => s.activeSectionIds);
  const isActive = activeSectionIds.includes(sectionId);
  const [isMounted, setIsMounted] = useState(isActive);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setIsMounted(isActive);
      },
      isActive ? 0 : LABEL_RETURN_ANIMATION_MS,
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

  if (!isMounted) return null;

  return (
    <a.group
      // Convert from paper-local (0..PAGE_WIDTH) to centered world space.
      position={[-PAGE_WIDTH / 2, PAGE_HEIGHT / 2, 0]}
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
    </a.group>
  );
}

export function ElevatedSectionLabels() {
  return (
    <>
      <AnimatedElevatedLabel
        sectionId="s1"
        y={SURAH_TRANSFORMS.s1.labelPinY}
        text={SURAH_DATA.section1.label}
        bgColor={S1_TOP_LABEL_BG}
        borderColor={S1_TOP_LABEL_BORDER}
        delayMs={55}
        liftHeight={0.14}
        tension={96}
        friction={24}
        renderOrder={220}
      />

      <AnimatedElevatedLabel
        sectionId="s2_top"
        y={SURAH_TRANSFORMS.s2.topLabelPinY}
        text={SURAH_DATA.section2.topLabel}
        bgColor={S2_TOP_LABEL_BG}
        borderColor={S2_TOP_LABEL_BORDER}
        partialBorder={true}
        delayMs={95}
        liftHeight={0.092}
        tension={90}
        friction={23}
        zBaseOffset={0.012}
        labelZ={0.008}
        renderOrder={240}
      />

      <AnimatedElevatedLabel
        sectionId="s2_bottom"
        y={SURAH_TRANSFORMS.s2.bottomLabelPinY}
        text={SURAH_DATA.section2.bottomLabel}
        bgColor={S2_TOP_LABEL_BG}
        borderColor={S2_TOP_LABEL_BORDER}
        partialBorder={true}
        bottomBorder={true}
        delayMs={130}
        liftHeight={0.096}
        tension={84}
        friction={22}
        zBaseOffset={0.014}
        labelZ={0.008}
        renderOrder={240}
      />
    </>
  );
}
