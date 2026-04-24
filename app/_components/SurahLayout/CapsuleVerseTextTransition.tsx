"use client";

import { Text } from "@react-three/drei";
import { a, useTransition } from "@react-spring/three";

const AnimatedText = a(Text);
type TransitionPayload = {
  key: string;
  verse: string;
  position: [number, number, number];
  fontSize: number;
  color: string;
  anchorX: "left" | "center" | "right";
  anchorY: "top" | "top-baseline" | "middle" | "bottom-baseline" | "bottom";
  maxWidth: number;
  lineHeight: number;
  textAlign: "left" | "center" | "right" | "justify";
  font?: string;
  direction?: "auto" | "ltr" | "rtl";
  renderOrder?: number;
  materialDepthTest: boolean;
};

interface CapsuleVerseTextTransitionProps {
  verse: string;
  position: [number, number, number];
  fontSize: number;
  color: string;
  anchorX: "left" | "center" | "right";
  anchorY: "top" | "top-baseline" | "middle" | "bottom-baseline" | "bottom";
  maxWidth: number;
  lineHeight: number;
  textAlign: "left" | "center" | "right" | "justify";
  font?: string;
  direction?: "auto" | "ltr" | "rtl";
  renderOrder?: number;
  materialDepthTest?: boolean;
}

export function CapsuleVerseTextTransition({
  verse,
  position,
  fontSize,
  color,
  anchorX,
  anchorY,
  maxWidth,
  lineHeight,
  textAlign,
  font,
  direction,
  renderOrder,
  materialDepthTest = false,
}: CapsuleVerseTextTransitionProps) {
  const item: TransitionPayload = {
    key: [
      verse,
      fontSize.toFixed(5),
      color,
      anchorX,
      anchorY,
      maxWidth.toFixed(5),
      lineHeight.toFixed(5),
      textAlign,
      font ?? "",
      direction ?? "",
      renderOrder ?? 0,
      materialDepthTest ? "1" : "0",
      position[0].toFixed(5),
      position[1].toFixed(5),
      position[2].toFixed(5),
    ].join("|"),
    verse,
    position,
    fontSize,
    color,
    anchorX,
    anchorY,
    maxWidth,
    lineHeight,
    textAlign,
    font,
    direction,
    renderOrder,
    materialDepthTest,
  };

  const transitions = useTransition(item, {
    keys: (payload) => payload.key,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    exitBeforeEnter: true,
    config: { duration: 240 },
  });

  return transitions((style, payload) => (
    <a.group>
      <AnimatedText
        position={payload.position}
        fontSize={payload.fontSize}
        color={payload.color}
        anchorX={payload.anchorX}
        anchorY={payload.anchorY}
        maxWidth={payload.maxWidth}
        lineHeight={payload.lineHeight}
        textAlign={payload.textAlign}
        material-depthTest={payload.materialDepthTest}
        material-transparent={true}
        fillOpacity={style.opacity}
        font={payload.font}
        direction={payload.direction}
        renderOrder={payload.renderOrder}
      >
        {payload.verse}
      </AnimatedText>
    </a.group>
  ));
}
