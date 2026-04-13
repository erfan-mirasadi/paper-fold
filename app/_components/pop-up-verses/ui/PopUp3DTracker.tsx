"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { Object3D, Vector3 } from "three";

interface PopUp3DTrackerProps {
  id: string;
  worldPosition: [number, number, number];
  scrollThreshold: number;
}

const _vector = new Vector3();

export function PopUp3DTracker({
  id,
  worldPosition,
  scrollThreshold,
}: PopUp3DTrackerProps) {
  const objRef = useRef<Object3D>(null);
  const domElRef = useRef<HTMLElement | null>(null);
  const lastState = useRef({ x: -9999, y: -9999, visible: false, op: "-1" });

  const { size, camera } = useThree();
  const scroll = useScroll();

  // Find and cache the element once when component mounts
  useEffect(() => {
    domElRef.current = document.getElementById(`popup-anchor-${id}`);
  }, [id]);

  useFrame(() => {
    if (!objRef.current || !domElRef.current) return;

    // Instead of creating a new vector every frame (bad for memory/GC), we reuse one
    objRef.current.getWorldPosition(_vector);
    _vector.project(camera);

    // Convert to screen coordinates like TafsirUI
    const x = (_vector.x * 0.5 + 0.5) * size.width;
    const y = (_vector.y * -0.5 + 0.5) * size.height;

    // Optional check: if point is behind camera or very far offscreen
    const isOnScreen =
      _vector.z < 1 &&
      _vector.x > -1.2 &&
      _vector.x < 1.2 &&
      _vector.y > -1.2 &&
      _vector.y < 1.2;

    // Calculate Scroll Visibility
    const isScrollVisible = scroll ? scroll.offset >= scrollThreshold : true;
    const visible = isOnScreen;
    const el = domElRef.current;
    
    const op = isScrollVisible ? "1" : "0";

    const xDiff = Math.abs(x - lastState.current.x);
    const yDiff = Math.abs(y - lastState.current.y);

    if (
      visible !== lastState.current.visible ||
      op !== lastState.current.op ||
      (visible && (xDiff > 0.1 || yDiff > 0.1))
    ) {
      lastState.current.visible = visible;
      lastState.current.op = op;
      lastState.current.x = x;
      lastState.current.y = y;

      if (!visible) {
        el.style.visibility = "hidden";
        el.style.pointerEvents = "none";
      } else {
        el.style.visibility = "visible";
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.style.opacity = op;
        el.style.pointerEvents = isScrollVisible ? "auto" : "none";
      }
    }
  });

  return <group ref={objRef} position={worldPosition}></group>;
}
