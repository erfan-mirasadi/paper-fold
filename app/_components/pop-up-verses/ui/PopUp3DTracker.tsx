"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { useRef } from "react";
import { Object3D, Vector3 } from "three";

interface PopUp3DTrackerProps {
  id: string; // The group id
  worldPosition: [number, number, number]; // Give it the 3D position where you want the button to appear in world coordinates
  scrollThreshold: number; // When should this button start becoming visible?
}

const _vector = new Vector3();

export function PopUp3DTracker({
  id,
  worldPosition,
  scrollThreshold,
}: PopUp3DTrackerProps) {
  const objRef = useRef<Object3D>(null);
  const { size, camera } = useThree();
  const scroll = useScroll();

  useFrame(() => {
    if (!objRef.current) return;

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

    // Directly manipulate the DOM element for this anchor to avoid React re-renders!
    const el = document.getElementById(`popup-anchor-${id}`);
    if (el) {
      if (!visible) {
        el.style.display = "none";
      } else {
        el.style.display = "block";
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        el.style.opacity = isScrollVisible ? "1" : "0";
        el.style.pointerEvents = isScrollVisible ? "auto" : "none";
      }
    }
  });

  return (
    <group ref={objRef} position={worldPosition}>
      {/* Invisible anchor */}
    </group>
  );
}
