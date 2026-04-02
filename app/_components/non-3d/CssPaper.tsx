//just for test (not useable in project)

"use client";
import { useState } from "react";
import FoldableSection from "./FoldableSection";

export default function CssPaper() {
  const [step, setStep] = useState<number>(0);

  const handlePaperClick = () => {
    setStep((prev) => (prev < 2 ? prev + 1 : 0));
  };

  // Top Anchor Texture
  const anchorTextureStyle: React.CSSProperties = {
    backgroundImage: "url('/image_1.png')",
    backgroundSize: "cover",
    backgroundPosition: "top left",
    backgroundColor: "#fdfbf0",
    backfaceVisibility: "hidden",
  };

  return (
    // Deep perspective is essential for the 3D pop effect
    <div
      className="relative flex flex-col items-center justify-start min-h-screen py-20 cursor-pointer select-none bg-[#1e2227] overflow-hidden"
      style={{ perspective: "3000px" }}
      onClick={handlePaperClick}
    >
      <div className="absolute top-10 text-gray-400 animate-pulse text-sm z-0">
        {step === 2 ? "Click to fold back" : "Click to unfold..."}
      </div>

      {/* --- TOP SECTION (The Static Anchor) --- */}
      <div
        className="w-[800px] max-w-[95vw] h-[300px] relative z-30"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 w-full h-full rounded-t-xl shadow-md border-b border-black/5"
          style={anchorTextureStyle}
        >
          <div className="p-10 h-full flex flex-col justify-center items-center relative z-10">
            <h2
              className="text-center text-4xl mb-6 font-serif text-gray-800"
              dir="rtl"
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </h2>
            <p className="text-center text-gray-600">
              This is the top anchor. It is always visible on the wall.
              <br />
              (Section 1/3)
            </p>
          </div>
        </div>

        {/* Back Face for the anchor (hidden from view, but structural) */}
        <div
          className="absolute inset-0 w-full h-full rounded-b-xl"
          style={{
            ...anchorTextureStyle,
            backfaceVisibility: "hidden",
            transform: "rotateX(180deg)",
          }}
        >
          <div className="absolute inset-0 bg-black/15 pointer-events-none rounded-b-xl" />
        </div>

        {/* --- MIDDLE SECTION --- */}
        <FoldableSection
          isOpen={step >= 1}
          zIndex={20}
          heightClass="h-[300px]"
          content={
            <div className="p-10 h-full flex flex-col justify-center items-center">
              <h2 className="text-center text-3xl mb-4 font-bold text-[#c29c4f]">
                Ana Ayet
              </h2>
              <p className="text-center text-gray-600">
                This is the middle section.
                <br />
                It opens first when you click.
                <br />
                (Section 2/3)
              </p>
            </div>
          }
          nestedSection={
            /* --- BOTTOM SECTION (Nested inside the middle) --- */
            <FoldableSection
              isOpen={step >= 2}
              zIndex={10}
              heightClass="h-[350px]"
              isBottom={true}
              content={
                <div className="p-10 h-full flex flex-col justify-center items-center">
                  <h2 className="text-center text-3xl mb-4 text-[#a16a82] font-bold">
                    Tozihat
                  </h2>
                  <p className="text-center text-gray-600">
                    This is the final section.
                    <br />
                    It feels "floaty" and loose when fully open.
                    <br />
                    (Section 3/3)
                  </p>
                </div>
              }
            />
          }
        />
      </div>
    </div>
  );
}
