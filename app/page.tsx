"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import html2canvas from "html2canvas";
import { PaperUI } from "./_components/PaperUI";
import { Paper3D } from "./_components/Paper3D";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenUiRef = useRef<HTMLDivElement>(null);

  // We use a ref object so we can mutate it inside GSAP and read it securely in R3F's useFrame
  const progressRef = useRef({ value: 0 });
  const [uiTexture, setUiTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (hiddenUiRef.current) {
      setTimeout(() => {
        html2canvas(hiddenUiRef.current!, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          logging: true,
        }).then((canvas) => {
          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 16;
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          texture.needsUpdate = true;
          setUiTexture(texture);
        }).catch(err => console.error("html2canvas capture error:", err));
      }, 1000); // Give fonts/styles a moment to load and render natively
    }
  }, []);

  useGSAP(
    () => {
      // Sync WebGL shader purely with GSAP scroll!
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: "#pinWrap", // Pin the environment
          start: "top top",
          end: "bottom bottom",
          scrub: 1, // Smooth scrubbing
          onUpdate: (self) => {
            progressRef.current.value = self.progress;
          },
        },
      });
    },
    { scope: containerRef },
  );

  return (
    // 300vh allows the user to actually physically scroll down the page to trigger GSAP
    <div
      ref={containerRef}
      className="relative w-full bg-[#18181A]"
      style={{ height: "300vh" }}
    >
      {/* 
        This is the container we PIN. Both the 3D scene and the HTML UI are placed 
        inside this, ensuring they perfectly mirror each other dynamically and never disconnect 
        while scrolling.
      */}
      <div
        id="pinWrap"
        className="relative w-full h-screen overflow-hidden flex justify-center items-center"
      >
        {/* 
          The Native HTML Overlay Layer is rendered centrally but sitting at a lower z-index.
          The Canvas wrapper has a solid background and a higher z-index, completely hiding this UI from human eyes,
          but preserving it flawlessly in the physical viewport for html2canvas to capture!
        */}
        <div
          className="absolute w-full h-full flex items-center justify-center overflow-hidden z-10"
        >
          <div ref={hiddenUiRef}>
            <PaperUI />
          </div>
        </div>

        {/* 
          The 3D layer automatically maps to the container dimensions. 
          Given a solid bg color to physically hide the native UI behind it!
        */}
        <div className="absolute w-full h-full flex justify-center items-center pointer-events-none z-20 py-12 bg-[#18181A]">
          <Canvas shadows camera={{ position: [0, 0, 8.5], fov: 45 }}>
            <ambientLight intensity={0.6} color="#ffffff" />
            <directionalLight
              position={[10, 20, 15]}
              intensity={1.5}
              castShadow
              shadow-bias={-0.0001}
            />
            <Environment preset="city" />
            <Paper3D progressRef={progressRef} uiTexture={uiTexture} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
