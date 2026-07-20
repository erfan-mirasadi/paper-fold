"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Object3D, Vector3 } from "three";
import { useSurahLayoutRuntime } from "../../../hooks/useSurahLayoutRuntime";
import { foldSliderTrack } from "./foldSliderTrack";

/**
 * Mounted as a SIBLING of <SinglePaper> inside the paper-focus group, so its
 * two markers share the paper's exact coordinate space (SinglePaper wraps its
 * content in a group at [0, SCENE_CENTER_Y, 0]; local top edge is y = 0).
 *
 * The markers sit at the flat-page right-edge corners — deliberately NOT the
 * folded vertices — so the slider rail stays a stable rail hugging the paper's
 * full footprint while the handle alone reflects the fold progress.
 */
export function FoldSliderTracker() {
  const runtime = useSurahLayoutRuntime();
  const topRef = useRef<Object3D>(null);
  const bottomRef = useRef<Object3D>(null);
  const { size, camera, gl } = useThree();

  const vTop = useRef(new Vector3());
  const vBottom = useRef(new Vector3());

  const halfW = runtime.PAGE_WIDTH / 2;
  const topY = runtime.SCENE_CENTER_Y;
  const bottomY = runtime.SCENE_CENTER_Y - runtime.PAGE_HEIGHT;

  useFrame(() => {
    if (!topRef.current || !bottomRef.current) return;

    const rect = gl.domElement.getBoundingClientRect();

    topRef.current.getWorldPosition(vTop.current);
    vTop.current.project(camera);
    bottomRef.current.getWorldPosition(vBottom.current);
    vBottom.current.project(camera);

    foldSliderTrack.topX = (vTop.current.x * 0.5 + 0.5) * size.width + rect.left;
    foldSliderTrack.topY =
      (vTop.current.y * -0.5 + 0.5) * size.height + rect.top;
    foldSliderTrack.bottomX =
      (vBottom.current.x * 0.5 + 0.5) * size.width + rect.left;
    foldSliderTrack.bottomY =
      (vBottom.current.y * -0.5 + 0.5) * size.height + rect.top;

    foldSliderTrack.onScreen =
      vTop.current.z < 1 &&
      vBottom.current.z < 1 &&
      vTop.current.x > -1.3 &&
      vTop.current.x < 1.3 &&
      vBottom.current.x > -1.3 &&
      vBottom.current.x < 1.3;
    foldSliderTrack.hasData = true;
  });

  return (
    <>
      <group ref={topRef} position={[halfW, topY, 0]} />
      <group ref={bottomRef} position={[halfW, bottomY, 0]} />
    </>
  );
}
