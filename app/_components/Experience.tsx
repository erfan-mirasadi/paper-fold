"use client";

import {
  Environment,
  // useScroll,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
// import { PerspectiveCamera } from "@theatre/r3f";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import { SinglePaper } from "./SinglePaper";
import { mainSheet } from "./TheatreManager";

interface ExperienceProps {
  isDarkMode: boolean;
}

export const Experience: React.FC<ExperienceProps> = ({ isDarkMode }) => {
  // const scroll = useScroll();
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const isDragging = useRef(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);

  useEffect(() => {
    if (controlsEnabled) {
      document.body.style.cursor = "grab";
    } else {
      document.body.style.cursor = "auto";
    }
  }, [controlsEnabled]);

  useFrame(() => {
    // Force Theatre sequence to the end of the intro
    if (mainSheet) {
      mainSheet.sequence.position = 5;
    }

    /*
    if (mainSheet && scroll) {
      const INTRO_SCROLL_RATIO = 0.3;
      const THEATRE_ANIMATION_LENGTH = 5;

      const isAtEnd = scroll.offset > INTRO_SCROLL_RATIO;
      if (controlsEnabled !== isAtEnd) {
        setControlsEnabled(isAtEnd);
      }

      if (!isAtEnd) {
        const normalizedTime =
          (scroll.offset / INTRO_SCROLL_RATIO) * THEATRE_ANIMATION_LENGTH;
        mainSheet.sequence.position = normalizedTime;

        // Lock controls to prevent dragging mid-scroll
        if (controlsRef.current) {
          controlsRef.current.enabled = false;
        }
      } else {
        mainSheet.sequence.position = THEATRE_ANIMATION_LENGTH;

        // Enable orbit controls when animation is done
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
          // Slowly damp back to original look at center as a smooth transition
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }
      }
    }
    */
  });

  return (
    <>
      <PerspectiveCamera
        // theatreKey="Camera"
        makeDefault
        position={[0, 1.4, 1.6]}
        fov={45}
      />

      <group rotation-x={-Math.PI / 4}>
        <SinglePaper />
      </group>

      <OrbitControls
        ref={controlsRef}
        enabled={controlsEnabled}
        enableZoom={false}
        enablePan={false}
        makeDefault={controlsEnabled}
        // Limit Azimuth angle (left-right rotation) to between -45 and 45 degrees
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        // Limit Polar angle (up-down) around its resting position (approx 60 degrees)
        minPolarAngle={Math.PI / 6} // ~30 degrees upward
        maxPolarAngle={Math.PI * 0.45} // ~80 degrees downward, stopping before it sees the back
        onStart={() => {
          isDragging.current = true;
          document.body.style.cursor = "grabbing";
        }}
        onEnd={() => {
          isDragging.current = false;
          document.body.style.cursor = "grab";
        }}
      />

      <Environment preset={isDarkMode ? "studio" : "apartment"} />
      <ambientLight intensity={isDarkMode ? 0.6 : 0.8} />
      <directionalLight
        position={[2, 5, 2]}
        intensity={isDarkMode ? 1.0 : 1.5}
      />
    </>
  );
};
