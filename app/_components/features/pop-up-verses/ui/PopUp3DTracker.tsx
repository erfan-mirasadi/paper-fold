"use client";

import { useScroll } from "@react-three/drei";
import { useRef } from "react";
import { Shared3DTracker } from "../../../shared/3DTracker";

interface PopUp3DTrackerProps {
  id: string;
  worldPosition: [number, number, number];
  scrollThreshold: number;
}

export function PopUp3DTracker({
  id,
  worldPosition,
  scrollThreshold,
}: PopUp3DTrackerProps) {
  const scroll = useScroll();
  const lastOp = useRef("-1");

  return (
    <Shared3DTracker
      position={worldPosition}
      domElementId={`popup-anchor-${id}`}
      onFrameUpdate={(_, __, isOnScreen, el) => {
        if (!el || !isOnScreen) return;
        
        // Calculate Scroll Visibility based on threshold
        const isScrollVisible = scroll ? scroll.offset >= scrollThreshold : true;
        const op = isScrollVisible ? "1" : "0";

        if (op !== lastOp.current) {
          lastOp.current = op;
          el.style.opacity = op;
          el.style.pointerEvents = isScrollVisible ? "auto" : "none";
        }
      }}
    />
  );
}
