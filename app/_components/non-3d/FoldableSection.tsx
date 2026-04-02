//just for test (not useable in project)

"use client";
import React, { useEffect, useState } from "react";

interface FoldableSectionProps {
  isOpen: boolean;
  zIndex: number;
  heightClass: string;
  content: React.ReactNode;
  nestedSection?: React.ReactNode;
  isBottom?: boolean;
}

export default function FoldableSection({
  isOpen,
  zIndex,
  heightClass,
  content,
  nestedSection,
  isBottom = false,
}: FoldableSectionProps) {
  // To avoid React hydration issues with animations, we use a mounted state
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // FOLD ANGLES: -179.9 avoids the 3D clipping bug that -180 causes in Safari/Chrome
  const FOLDED_ANGLE = "-179.9deg";
  const OPEN_ANGLE = "0deg";
  const angle = isOpen ? `rotateX(${OPEN_ANGLE})` : `rotateX(${FOLDED_ANGLE})`;

  // Smooth standard transition for the main hinge
  const transitionTiming = "cubic-bezier(0.25, 1, 0.5, 1)";
  const transitionDuration = isBottom ? "1100ms" : "900ms";

  // Base texture using the seamless paper background
  const paperTextureStyle: React.CSSProperties = {
    backgroundImage: "url('/image_1.png')",
    backgroundSize: "cover",
    backgroundPosition: "top left",
    backgroundColor: "#fdfbf0",
    backfaceVisibility: "hidden", // Completely hides the text from bleeding through the back
  };

  // The Hinge (Crease) using the folded image mask
  const hingeStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    width: "100%",
    top: "-20px", // Perfectly centered on the mathematical fold line
    height: "40px",
    backgroundImage: "url('/image_0.png')",
    backgroundPosition: "center center",
    backgroundSize: "100% auto",
    opacity: isOpen ? 0.7 : 0, // Fades in to mask the 3D joint seamlessly
    transition: `opacity ${transitionDuration} ease-in-out`,
    mixBlendMode: "multiply",
    zIndex: 40,
    pointerEvents: "none",
  };

  return (
    <>
      {mounted && (
        <style>{`
          /* Middle Section Snap: A subtle flick that simulates a tiny fold flattening out */
          @keyframes unfoldSnap {
            0% { transform: rotateX(0deg); }
            45% { transform: rotateX(8deg); }
            75% { transform: rotateX(-2deg); }
            100% { transform: rotateX(0deg); }
          }

          /* Bottom Section Release: A sense of freedom and lightness */
          @keyframes floatRelease {
            0% { transform: rotateX(0deg); }
            35% { transform: rotateX(14deg); }
            65% { transform: rotateX(-5deg); }
            85% { transform: rotateX(2deg); }
            100% { transform: rotateX(0deg); }
          }
          
          /* Continuous Organic Float */
          @keyframes continuousFloat {
            0%, 100% { transform: rotateX(0deg) rotateZ(0deg); }
            50% { transform: rotateX(2.5deg) rotateZ(0.4deg) translateY(-1px); }
          }
        `}</style>
      )}

      {/* OUTER PARENT: Strictly handles the clean -179.9deg to 0deg Hinge CSS transition */}
      <div
        className={`absolute top-[100%] left-0 w-full ${heightClass} origin-top`}
        style={{
          transformStyle: "preserve-3d",
          transform: angle,
          transitionProperty: "transform",
          transitionDuration: transitionDuration,
          transitionTimingFunction: transitionTiming,
          willChange: "transform",
          zIndex: zIndex,
          visibility: !isOpen && !isBottom ? "hidden" : "visible",
          transitionDelay: !isOpen ? "150ms" : "0ms", // Keeps it visible while folding up, hides after
        }}
      >
        {/* The Crease/Hinge Texture */}
        <div style={hingeStyle} />

        {/* 3D Depth Shadow at the top hinge */}
        <div className="absolute top-0 left-0 w-full h-[15px] bg-gradient-to-b from-black/15 to-transparent z-50 pointer-events-none" />

        {/* ORGANIC ANIMATION WRAPPER: Handles the life, float and snap. 
            Wraps both faces AND the nested section so everything moves perfectly together! */}
        <div
          className="absolute inset-0 w-full h-full origin-top"
          style={{
            transformStyle: "preserve-3d",
            animation: isOpen
              ? isBottom
                ? "floatRelease 2s ease-out 0.4s, continuousFloat 6s ease-in-out 2.4s infinite"
                : "unfoldSnap 1.3s ease-out 0.2s"
              : "none",
          }}
        >
          {/* FRONT FACE: The actual content wrapper */}
          <div
            className={`absolute inset-0 w-full h-full ${
              isBottom ? "rounded-b-xl shadow-2xl" : "border-b border-black/5"
            }`}
            style={{
              ...paperTextureStyle,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Dynamic Unfolding Shadow: Darkens the paper when folded, brightens when flat */}
            <div
              className={`absolute inset-0 bg-black pointer-events-none transition-opacity ${
                isBottom ? "rounded-b-xl" : ""
              }`}
              style={{
                opacity: isOpen ? 0 : 0.6,
                transitionDuration: transitionDuration,
                transitionTimingFunction: "ease-in-out",
              }}
            />

            {/* Content */}
            <div className="relative z-10 w-full h-full">{content}</div>
          </div>

          {/* BACK FACE: Solid blank back of the paper. Prevents the "upside down text" bug completely */}
          <div
            className={`absolute inset-0 w-full h-full shadow-inner ${
              isBottom ? "rounded-t-xl" : ""
            }`}
            style={{
              ...paperTextureStyle,
              backfaceVisibility: "hidden",
              transform: "rotateX(180deg)", // Faces out when the parent is folded up at -180deg
            }}
          >
            {/* Darken the back side */}
            <div className="absolute inset-0 bg-black/15 pointer-events-none" />
          </div>

          {/* Nested Section (Section 3 physically hinges off the animated bottom of Section 2!) */}
          {nestedSection}
        </div>
      </div>
    </>
  );
}
