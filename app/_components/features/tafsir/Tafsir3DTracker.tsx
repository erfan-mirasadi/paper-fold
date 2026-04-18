"use client";

import { createPortal } from "@react-three/fiber";
import { Skeleton } from "three";
import { TAFSIR_DATA } from "./tafsir-data";
import { Shared3DTracker } from "../../shared/3DTracker";
import { useTafsirStore } from "./useTafsirStore";

export const Tafsir3DTracker = ({ skeleton }: { skeleton: Skeleton }) => {
  const activeId = useTafsirStore((state) => state.tafsirActiveId);
  const setAnchorPosition = useTafsirStore((state) => state.setTafsirAnchorPos);

  const activeData = TAFSIR_DATA.find((t) => t.id === activeId);
  if (!activeData || !skeleton) return null;
  const targetBone = skeleton.bones[activeData.boneIndex];
  if (!targetBone) return null;

  return createPortal(
    <Shared3DTracker
      position={[activeData.anchorOffsetX, activeData.anchorOffsetY, 0.01]}
      onFrameUpdate={(x, y) => setAnchorPosition(x, y)}
    />,
    targetBone,
  );
};
