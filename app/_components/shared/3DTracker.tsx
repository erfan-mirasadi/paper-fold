"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Object3D, Vector3 } from "three";

export interface Shared3DTrackerProps {
  position?: [number, number, number];
  domElementId?: string;
  onFrameUpdate?: (
    x: number,
    y: number,
    isOnScreen: boolean,
    el: HTMLElement | null,
  ) => void;
  children?: React.ReactNode;
}

export function Shared3DTracker({
  position = [0, 0, 0],
  domElementId,
  onFrameUpdate,
  children,
}: Shared3DTrackerProps) {
  const objRef = useRef<Object3D>(null);
  const lastState = useRef({ x: -9999, y: -9999, visible: false });
  // Allocate vector once per mount to prevent GC spikes
  const vectorRef = useRef(new Vector3());

  const { size, camera } = useThree();

  useFrame(() => {
    if (!objRef.current) return;

    // If no outputs are specified, we don't need to calculate projection
    if (!domElementId && !onFrameUpdate) return;

    const _vector = vectorRef.current;
    objRef.current.getWorldPosition(_vector);
    _vector.project(camera);

    const x = (_vector.x * 0.5 + 0.5) * size.width;
    const y = (_vector.y * -0.5 + 0.5) * size.height;

    // Visibility heuristic: within frustum and roughly on screen bounds
    const isOnScreen =
      _vector.z < 1 &&
      _vector.x > -1.2 &&
      _vector.x < 1.2 &&
      _vector.y > -1.2 &&
      _vector.y < 1.2;

    const xDiff = Math.abs(x - lastState.current.x);
    const yDiff = Math.abs(y - lastState.current.y);

    const hasPositionChanged = xDiff > 0.1 || yDiff > 0.1;
    const hasVisibilityChanged = isOnScreen !== lastState.current.visible;

    const el = domElementId
      ? (document.getElementById(domElementId) as HTMLElement | null)
      : null;

    // Optimization: Only update DOM styles if something meaningfully changed
    if (hasVisibilityChanged || (isOnScreen && hasPositionChanged)) {
      lastState.current.visible = isOnScreen;
      lastState.current.x = x;
      lastState.current.y = y;

      if (el) {
        if (!isOnScreen) {
          el.style.visibility = "hidden";
        } else {
          el.style.visibility = "visible";
          el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        }
      }
    }

    // Pass latest values to optional callback on every frame
    // This allows parents to add dynamic interpolations (like opacity on scroll)
    if (onFrameUpdate) {
      onFrameUpdate(x, y, isOnScreen, el);
    }
  });

  return (
    <group ref={objRef} position={position}>
      {children}
    </group>
  );
}
