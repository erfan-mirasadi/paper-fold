"use client";

import { useFrame, useThree, createPortal } from "@react-three/fiber";
import { useRef, useSyncExternalStore } from "react";
import { Object3D, Vector3, Skeleton } from "three";
import { TAFSIR_DATA } from "./TafsirData";
import { subscribe, getActiveId, setAnchorPosition } from "./TafsirUI";

export const Tafsir3DTracker = ({ skeleton }: { skeleton: Skeleton }) => {
  const activeId = useSyncExternalStore(subscribe, getActiveId, getActiveId);
  const activeData = TAFSIR_DATA.find((t) => t.id === activeId);
  if (!activeData || !skeleton) return null;
  const targetBone = skeleton.bones[activeData.boneIndex];
  if (!targetBone) return null;

  // We portal a single invisible anchor to the currently active bone
  return createPortal(
    <AnchorPoint
      offsetX={activeData.anchorOffsetX}
      offsetY={activeData.anchorOffsetY}
    />,
    targetBone,
  );
};

// Internal component to handle the math
const AnchorPoint = ({
  offsetX,
  offsetY,
}: {
  offsetX: number;
  offsetY: number;
}) => {
  const objRef = useRef<Object3D>(null);
  const { size, camera } = useThree();

  useFrame(() => {
    if (!objRef.current) return;
    const vector = new Vector3();
    objRef.current.getWorldPosition(vector);
    vector.project(camera);
    const x = (vector.x * 0.5 + 0.5) * size.width;
    const y = (vector.y * -0.5 + 0.5) * size.height;
    setAnchorPosition(x, y);
  });

  return (
    // Z is slightly offset (0.01) so it sits just above the paper
    <group ref={objRef} position={[offsetX, offsetY, 0.01]}>
      {/* 🔴 RED DOT FOR DEBUGGING 🔴 - Comment out the mesh below when in production */}
      {/* <mesh>
        <sphereGeometry args={[0.015]} />
        <meshBasicMaterial color="red" depthTest={false} />
      </mesh> */}
    </group>
  );
};
