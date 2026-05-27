"use client";
import { motion, AnimatePresence } from "framer-motion";

import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useState } from "react";
import * as THREE from "three";
import { PopUpHoverScrollController } from "./_components/canvas/pop-up-verses/PopUpHoverScrollController";
// VerseNeonOverlay is currently fully commented out (not a module).
// import {
//   VerseNeonTracker,
//   VerseNeonHTMLOverlay,
// } from "./_components/canvas/camera-zoom/VerseNeonOverlay";
// import Effects from "./_components/canvas/3d-scene/Effects";
import { ScrollManager } from "./_components/canvas/orchestrator/ScrollManager";
import { useFoldStore } from "./_components/canvas/orchestrator/ScrollManager";
import { NavigationOverlay } from "./_components/dom/ui-overlay/NavigationOverlay";
import { TitleOverlay } from "./_components/dom/ui-overlay/TitleOverlay";
import { ThemeToggleOverlay } from "./_components/dom/ui-overlay/ThemeToggleOverlay";
import { LanguageSwitchOverlay } from "./_components/dom/ui-overlay/LanguageSwitchOverlay";
import { AllSectionsOverlay } from "./_components/dom/ui-overlay/AllSectionsOverlay";
import { SiteLoadingOverlay } from "./_components/dom/ui-overlay/SiteLoadingOverlay";
import { CameraViewPresetOverlay } from "./_components/dom/ui-overlay/CameraViewPresetOverlay";
import { CameraViewController } from "./_components/canvas/orchestrator/CameraViewController";
import { IntroSectionGuidesOverlay } from "./_components/dom/IntroSectionGuidesOverlay";
import AmbientMedia from "./_components/dom/AmbientMedia";
import JoinedStepOverlay from "./_components/dom/JoinedStepOverlay";
import { IntroBackgroundTextOverlay } from "./_components/dom/IntroBackgroundTextOverlay";
import { HeroTitleOverlay } from "./_components/dom/ui-overlay/HeroTitleOverlay";
import { LenisProvider } from "./_components/dom/LenisProvider";
import { CAMERA_CONFIG } from "./data/cameraConfig";
const Experience = dynamic(
  () =>
    import("./_components/canvas/3d-scene/Experience").then(
      (mod) => mod.Experience,
    ),
  { ssr: false },
);

const SCROLL_PAGES = 5;
const MAIN_OVERLAY_DELAY_MS = 350;

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [showMainOverlays, setShowMainOverlays] = useState(false);
  const [mountMainOverlays, setMountMainOverlays] = useState(false);
  // Mirror isIntroActive from the Zustand store so overlay rendering re-evaluates
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  useEffect(() => {
    // Mount the Canvas almost immediately using requestAnimationFrame.
    // This pushes the heavy initial WebGL blocking to the very start of the load,
    // right before the loader animation is fully visible to the user.
    const rafId = requestAnimationFrame(() => {
      setCanvasReady(true);
    });
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const delay = isIntroActive ? 0 : MAIN_OVERLAY_DELAY_MS;
    const timeoutId = window.setTimeout(() => {
      setShowMainOverlays(!isIntroActive);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isIntroActive]);

  useEffect(() => {
    if (!isSceneReady) return;
    // Pre-mount heavy overlays offscreen to avoid a first-frame hitch at handoff.
    const timeoutId = window.setTimeout(() => {
      setMountMainOverlays(true);
    }, 200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isSceneReady]);

  const bgColor = isDarkMode ? "#000000" : "#ffffff";

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
    // setGlitchKey((prev) => prev + 1);
  };

  const handleSceneReady = useCallback(() => {
    setIsSceneReady(true);
  }, []);

  return (
    <LenisProvider>
      <main
        style={{
          width: "100vw",
          minHeight: "100dvh",
          backgroundColor: bgColor,
          transition: "background-color 0.5s ease",
          position: "relative", // Ensure relative positioning for absolute children
        }}
      >
        <div
          aria-hidden="true"
          style={{
            height: `${SCROLL_PAGES * 100}vh`,
            pointerEvents: "none",
          }}
        />

        <IntroBackgroundTextOverlay isDarkMode={isDarkMode} />

        <div className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 h-[45vh] md:h-[50vh] pointer-events-none z-10">
          <AmbientMedia />
        </div>

        {/* Soft static shadow removed in favor of dynamic Canvas drop-shadow */}

        <Suspense fallback={null}>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 30,
              opacity: isSceneReady ? 1 : 0,
              // Prevent pointer events while hidden or during intro to avoid blocking UI interactions behind canvas
              pointerEvents: isSceneReady && !isIntroActive ? "auto" : "none",
              // Dynamically cast a glassy soft shadow based on the 3D canvas alpha channel!
              // This makes each capsule accurately cast its own shadow onto the footage below.
              filter: isDarkMode
                ? "drop-shadow(0 20px 30px rgba(0,0,0,0.8)) drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
                : "drop-shadow(0 20px 30px rgba(255,255,255,0.8)) drop-shadow(0 4px 12px rgba(255,255,255,0.5))",
              // Apple-like buttery smooth ease transition
              transition: "opacity 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          >
            {/* Render Intro Guides INSIDE the Canvas wrapper but BEFORE Canvas, so they share the filter and aren't shadowed, but get occluded by 3D pixels */}
            {isSceneReady && isIntroActive && (
              <IntroSectionGuidesOverlay isDarkMode={isDarkMode} />
            )}
            {canvasReady && (
              <Canvas
                style={{ pointerEvents: isIntroActive ? "none" : "auto" }}
                eventSource={
                  typeof document !== "undefined" ? document.body : undefined
                }
                camera={{
                  position: CAMERA_CONFIG.initialCamera.position,
                  fov: CAMERA_CONFIG.initialCamera.fov,
                }}
                gl={{
                  antialias: true,
                  powerPreference: "high-performance",
                  toneMapping: THREE.NoToneMapping,
                  outputColorSpace: THREE.SRGBColorSpace,
                }}
                frameloop="always"
              >
                {/* <color attach="background" args={[bgColor]} /> Removed to allow transparent background for background text */}
                {/* <Effects glitchTrigger={glitchKey} /> */}
                <ScrollManager />
                <PopUpHoverScrollController />
                <Experience
                  isDarkMode={isDarkMode}
                  onReady={handleSceneReady}
                />
                {/* <VerseNeonTracker /> */}
                <CameraViewController />
                <Preload all />
              </Canvas>
            )}
          </div>
        </Suspense>
        <AnimatePresence>
          {!isSceneReady && (
            <SiteLoadingOverlay key="site-loader" isDarkMode={isDarkMode} />
          )}
        </AnimatePresence>
        {isSceneReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative z-40 pointer-events-none"
          >
            {isIntroActive && (
              <>
                <HeroTitleOverlay isDarkMode={isDarkMode} />
                {/* Render the extracted Apple-style border behind the main UI controls */}
                <div className="fixed inset-0 z-80 pointer-events-none">
                  <JoinedStepOverlay isDarkMode={isDarkMode} />
                </div>
              </>
            )}
            <ThemeToggleOverlay
              isDarkMode={isDarkMode}
              onToggle={handleThemeToggle}
            />
            {/* Hide standard chrome while intro runs */}
            {mountMainOverlays && (
              <div
                style={{
                  opacity: showMainOverlays ? 1 : 0,
                  pointerEvents: showMainOverlays ? "auto" : "none",
                  transition: "opacity 0.45s ease",
                  willChange: "opacity",
                }}
              >
                <NavigationOverlay isDarkMode={isDarkMode} />
                <TitleOverlay isDarkMode={isDarkMode} />
                <AllSectionsOverlay isDarkMode={isDarkMode} />
                <LanguageSwitchOverlay isDarkMode={isDarkMode} />
                <CameraViewPresetOverlay />
              </div>
            )}
          </motion.div>
        )}
      </main>
    </LenisProvider>
  );
}

// import Image from "next/image";
// import { Suspense, useEffect, useState } from "react";
// import { Canvas } from "@react-three/fiber";
// import { AnimatedText } from "./_components/dom/ui-overlay/AnimatedText";
// import InteractiveSandScene from "./_components/canvas/3d-scene/InteractiveSandScene";
// import { SiteLoadingOverlay } from "./_components/dom/ui-overlay/SiteLoadingOverlay";

// export default function Page() {
//   const [sandReady, setSandReady] = useState(false);
//   const [particlesActive, setParticlesActive] = useState(false);
//   const [showTitle, setShowTitle] = useState(false);

//   useEffect(() => {
//     if (!sandReady) return;
//     setParticlesActive(true);
//     setShowTitle(true);
//   }, [sandReady]);

//   return (
//     <main className="bg-black h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth scrollbar-hide">
//       {!sandReady && <SiteLoadingOverlay isDarkMode={true} />}
//       {/* Slide 1: Sand + Hero Image + Single Title */}
//       <section className="relative snap-start h-screen w-full flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
//         <div className="absolute inset-0 z-0">
//           <Suspense fallback={<div className="w-full h-full bg-black" />}>
//             <Canvas
//               camera={{ position: [0, 0, 5], fov: 45 }}
//               gl={{ antialias: true }}
//             >
//               <InteractiveSandScene
//                 onReady={() => setSandReady(true)}
//                 particlesActive={particlesActive}
//               />
//             </Canvas>
//           </Suspense>
//         </div>
//         <div
//           className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-700 ${
//             sandReady ? "opacity-50" : "opacity-0"
//           }`}
//         >
//           <Image
//             src="/intro/hero.png"
//             alt="Hero Background"
//             fill
//             className="object-cover"
//             priority
//           />
//         </div>

//         {showTitle && (
//           <div className="relative z-20 w-full flex items-center justify-center pointer-events-none">
//             <AnimatedText
//               text="Alak Suresi"
//               variant="title"
//               noWrap={true}
//               animationType="fadeIn"
//               className="text-[16vw] md:text-[12vw] leading-none text-white w-full justify-center font-sans"
//             />
//           </div>
//         )}
//       </section>

//       {/* Slide 2: Hero Image 2 - Tavzif ve Vazife */}
//       <section className="relative snap-start h-screen w-full flex items-center justify-center p-6 md:p-12 overflow-hidden">
//         <Image
//           src="/intro/hero-2.png"
//           alt="Hero Background 2"
//           fill
//           className="object-cover opacity-40"
//         />
//         <div className="relative z-10 max-w-4xl text-center">
//           <AnimatedText
//             text="TAVZİF VE VAZİFE"
//             variant="title"
//             animationType="flyInBottom"
//             className="text-white font-bold text-6xl md:text-8xl mb-6"
//           />
//           <AnimatedText
//             text="İlahi bir görev, kutlu bir ödev"
//             variant="subtitle"
//             animationType="fadeIn"
//             className="text-white/80 font-light italic"
//           />
//         </div>
//       </section>

//       {/* Slide 3: İstiğna ve Tuğyan */}
//       <section className="snap-start h-screen w-full flex flex-col items-center justify-center p-6 md:p-12 bg-black">
//         <div className="text-center max-w-4xl">
//           <AnimatedText
//             text="İLAHİ TAVZİFİN HASIDI DÜŞMANI"
//             variant="caption"
//             animationType="flyInTop"
//             className="text-[#db5001] mb-4 tracking-widest"
//           />
//           <AnimatedText
//             text="İSTİĞNA VE TUĞYAN"
//             variant="title"
//             animationType="flyInBottom"
//             className="text-white tracking-[0.1em] text-7xl md:text-9xl mb-6"
//           />
//           <AnimatedText
//             text="Dünyada şeytan adamın mağrur ve kibirli azgınlığı"
//             variant="body"
//             animationType="fadeIn"
//             className="text-zinc-500 text-xl md:text-2xl"
//           />
//         </div>
//       </section>

//       {/* Slide 4: Ahiret */}
//       <section className="snap-start h-screen w-full flex items-center justify-center p-6 md:p-12 bg-zinc-950">
//         <div className="max-w-3xl text-center">
//           <AnimatedText
//             text="Kafır ve Taği adamın ahireti"
//             variant="subtitle"
//             animationType="flyInTop"
//             className="text-white/90 text-4xl md:text-6xl mb-8 leading-tight"
//           />
//           <AnimatedText
//             text="Hüsran ve pişmanlık dolu bir son"
//             variant="body"
//             animationType="fadeIn"
//             glow={true}
//             className="text-zinc-400"
//           />
//         </div>
//       </section>

//       {/* Slide 5: White Slide - Secde */}
//       <section className="snap-start h-screen w-full flex flex-col items-center justify-center p-6 md:p-12 bg-white">
//         <div className="text-center max-w-4xl">
//           <AnimatedText
//             text="Kella! Lâ tüti'hu"
//             variant="caption"
//             animationType="flyInTop"
//             className="text-black/40 mb-6 tracking-[0.4em] uppercase"
//           />
//           <AnimatedText
//             text="Ona mahkum olma"
//             variant="subtitle"
//             animationType="flyInBottom"
//             className="text-black font-bold text-6xl md:text-8xl leading-tight"
//           />
//           <AnimatedText
//             text="SECDE ET VE ALLAH'A YAKLAŞ"
//             variant="title"
//             animationType="fadeIn"
//             className="text-zinc-800 mt-8 text-4xl md:text-5xl"
//           />
//         </div>
//       </section>

//       {/* Slide 6: Symmetrical Side-by-Side (Concluding) */}
//       <section className="snap-start h-screen w-full flex items-center justify-center p-8 md:p-24 bg-black">
//         <div className="w-full max-w-[90vw] flex flex-col md:flex-row items-center justify-between gap-16 md:gap-32">
//           <div className="w-full md:w-[22%] text-center md:text-left">
//             <AnimatedText
//               text="Varlığın derinliklerinden süzülüp gelen o kadim nidayı işit; her zerre kendi lisanıyla hakikati fısıldar."
//               variant="subtitle"
//               animationType="fadeIn"
//               className="text-white/80 text-lg md:text-2xl leading-relaxed font-serif"
//             />
//           </div>
//           <div className="w-full md:w-[22%] text-center md:text-right">
//             <AnimatedText
//               text="Gökler dürülür, yeryüzü sarsılır ama kalbe nakşedilen o ilahi kelâm sonsuza dek baki kalır."
//               variant="subtitle"
//               animationType="fadeIn"
//               className="text-white/80 text-lg md:text-2xl leading-relaxed font-serif"
//             />
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }
