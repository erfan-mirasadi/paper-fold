// "use client";
// import { motion, AnimatePresence } from "framer-motion";

// import { Canvas } from "@react-three/fiber";
// import { Preload, ScrollControls } from "@react-three/drei";
// import dynamic from "next/dynamic";
// import { Suspense, useCallback, useEffect, useState } from "react";
// import * as THREE from "three";
// import { PopUpHoverScrollController } from "./_components/features/pop-up-verses/hover-scroll/PopUpHoverScrollController";
// import { CameraResetOverlay } from "./_components/features/camera-zoom/CameraResetOverlay";
// // VerseNeonOverlay is currently fully commented out (not a module).
// // import {
// //   VerseNeonTracker,
// //   VerseNeonHTMLOverlay,
// // } from "./_components/features/camera-zoom/VerseNeonOverlay";
// // import Effects from "./_components/3d-scene/Effects";
// import { ScrollManager } from "./_components/3d-scene/ScrollManager";
// import { NavigationOverlay } from "./_components/ui-overlay/NavigationOverlay";
// import { TitleOverlay } from "./_components/ui-overlay/TitleOverlay";
// import { ThemeToggleOverlay } from "./_components/ui-overlay/ThemeToggleOverlay";
// import { LanguageSwitchOverlay } from "./_components/ui-overlay/LanguageSwitchOverlay";
// import { AllSectionsOverlay } from "./_components/ui-overlay/AllSectionsOverlay";
// import { SiteLoadingOverlay } from "./_components/ui-overlay/SiteLoadingOverlay";
// import { CameraViewPresetOverlay } from "./_components/features/camera-views/CameraViewPresetOverlay";
// import { CameraViewController } from "./_components/features/camera-views/CameraViewController";
// import { CAMERA_CONFIG } from "./_components/data/cameraConfig";
// const Experience = dynamic(
//   () =>
//     import("./_components/3d-scene/Experience").then((mod) => mod.Experience),
//   { ssr: false },
// );

// export default function Home() {
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [isSceneReady, setIsSceneReady] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [canvasReady, setCanvasReady] = useState(false);

//   useEffect(() => {
//     const checkMobile = () => setIsMobile(window.innerWidth <= 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   useEffect(() => {
//     // Mount the Canvas almost immediately using requestAnimationFrame.
//     // This pushes the heavy initial WebGL blocking to the very start of the load,
//     // right before the loader animation is fully visible to the user.
//     const rafId = requestAnimationFrame(() => {
//       setCanvasReady(true);
//     });
//     return () => {
//       cancelAnimationFrame(rafId);
//     };
//   }, []);

//   const bgColor = isDarkMode && !isMobile ? "#000000" : "#ffffff";

//   const handleThemeToggle = () => {
//     setIsDarkMode((prev) => !prev);
//     // setGlitchKey((prev) => prev + 1);
//   };

//   const handleSceneReady = useCallback(() => {
//     setIsSceneReady(true);
//   }, []);

//   return (
//     <main
//       style={{
//         width: "100vw",
//         height: "100dvh",
//         backgroundColor: bgColor,
//         overflow: "hidden",
//         transition: "background-color 0.5s ease",
//         position: "relative", // Ensure relative positioning for absolute children
//       }}
//     >
//       <Suspense fallback={null}>
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             opacity: isSceneReady ? 1 : 0,
//             // Prevent pointer events while hidden to avoid blocking UI interactions
//             pointerEvents: isSceneReady ? "auto" : "none",
//             // Apple-like buttery smooth ease transition
//             transition: "opacity 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)",
//           }}
//         >
//           {canvasReady && (
//             <Canvas
//               camera={{
//                 position: CAMERA_CONFIG.initialCamera.position,
//                 fov: CAMERA_CONFIG.initialCamera.fov,
//               }}
//               gl={{
//                 antialias: true,
//                 powerPreference: "high-performance",
//                 toneMapping: THREE.NoToneMapping,
//                 outputColorSpace: THREE.SRGBColorSpace,
//               }}
//               frameloop="always"
//             >
//               <color attach="background" args={[bgColor]} />
//               {/* <Effects glitchTrigger={glitchKey} /> */}
//               <ScrollControls pages={2} damping={0.28}>
//                 <ScrollManager />
//                 <PopUpHoverScrollController />
//                 <Experience
//                   isDarkMode={isDarkMode}
//                   onReady={handleSceneReady}
//                 />
//               </ScrollControls>
//               {/* <VerseNeonTracker /> */}
//               <CameraViewController />
//               <Preload all />
//             </Canvas>
//           )}
//         </div>
//       </Suspense>
//       <AnimatePresence>
//         {!isSceneReady && (
//           <SiteLoadingOverlay key="site-loader" isDarkMode={isDarkMode} />
//         )}
//       </AnimatePresence>
//       {isSceneReady && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.6, delay: 0.1 }}
//         >
//           <CameraResetOverlay />
//           <NavigationOverlay isDarkMode={isDarkMode} />
//           <TitleOverlay isDarkMode={isDarkMode} />
//           <AllSectionsOverlay isDarkMode={isDarkMode} />
//           <LanguageSwitchOverlay isDarkMode={isDarkMode} />
//           <ThemeToggleOverlay
//             isDarkMode={isDarkMode}
//             onToggle={handleThemeToggle}
//           />
//           <CameraViewPresetOverlay />
//         </motion.div>
//       )}
//     </main>
//   );
// }

import Image from "next/image";
import { AnimatedText } from "./_components/ui-overlay/AnimatedText";

export default function Page() {
  return (
    <main className="bg-black h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth scrollbar-hide">
      {/* Slide 1: Hero Image 1 - Oku */}
      <section className="relative snap-start h-screen w-full flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
        <Image
          src="/intro/hero.png"
          alt="Hero Background"
          fill
          className="object-cover opacity-50"
          priority
        />
        {/* Top Texts - Absolute to not affect main centering */}
        <div className="absolute top-16 md:top-24 left-0 w-full z-10 flex flex-col items-center space-y-4">
          <AnimatedText
            text="Yaratan Rabbinin adıyla"
            variant="body"
            animationType="flyInTop"
            className="text-gray-400 uppercase tracking-[0.3em] text-xs md:text-sm"
          />
          <AnimatedText
            text="İLK 5 AYET"
            variant="caption"
            animationType="flyInBottom"
            className="text-white/50 tracking-[0.5em] text-[10px] md:text-xs"
          />
        </div>

        {/* Main Centered Title */}
        <div className="relative z-10 w-full flex items-center justify-center">
          <AnimatedText
            text="Ensanlara Oku"
            variant="title"
            glow={true}
            noWrap={true}
            animationType="fadeIn"
            className="text-[15vw] md:text-[11vw] leading-none text-white w-full justify-center font-sans"
          />
        </div>
      </section>

      {/* Slide 2: Hero Image 2 - Tavzif ve Vazife */}
      <section className="relative snap-start h-screen w-full flex items-center justify-center p-6 md:p-12 overflow-hidden">
        <Image
          src="/intro/hero-2.png"
          alt="Hero Background 2"
          fill
          className="object-cover opacity-40"
        />
        <div className="relative z-10 max-w-4xl text-center">
          <AnimatedText
            text="TAVZİF VE VAZİFE"
            variant="title"
            animationType="flyInBottom"
            className="text-white font-bold text-6xl md:text-8xl mb-6"
          />
          <AnimatedText
            text="İlahi bir görev, kutlu bir ödev"
            variant="subtitle"
            animationType="fadeIn"
            className="text-white/80 font-light italic"
          />
        </div>
      </section>

      {/* Slide 3: İstiğna ve Tuğyan */}
      <section className="snap-start h-screen w-full flex flex-col items-center justify-center p-6 md:p-12 bg-black">
        <div className="text-center max-w-4xl">
          <AnimatedText
            text="İLAHİ TAVZİFİN HASIDI DÜŞMANI"
            variant="caption"
            animationType="flyInTop"
            className="text-[#db5001] mb-4 tracking-widest"
          />
          <AnimatedText
            text="İSTİĞNA VE TUĞYAN"
            variant="title"
            animationType="flyInBottom"
            className="text-white tracking-[0.1em] text-7xl md:text-9xl mb-6"
          />
          <AnimatedText
            text="Dünyada şeytan adamın mağrur ve kibirli azgınlığı"
            variant="body"
            animationType="fadeIn"
            className="text-zinc-500 text-xl md:text-2xl"
          />
        </div>
      </section>

      {/* Slide 4: Ahiret */}
      <section className="snap-start h-screen w-full flex items-center justify-center p-6 md:p-12 bg-zinc-950">
        <div className="max-w-3xl text-center">
          <AnimatedText
            text="Kafır ve Taği adamın ahireti"
            variant="subtitle"
            animationType="flyInTop"
            className="text-white/90 text-4xl md:text-6xl mb-8 leading-tight"
          />
          <AnimatedText
            text="Hüsran ve pişmanlık dolu bir son"
            variant="body"
            animationType="fadeIn"
            glow={true}
            className="text-zinc-400"
          />
        </div>
      </section>

      {/* Slide 5: White Slide - Secde */}
      <section className="snap-start h-screen w-full flex flex-col items-center justify-center p-6 md:p-12 bg-white">
        <div className="text-center max-w-4xl">
          <AnimatedText
            text="Kella! Lâ tüti'hu"
            variant="caption"
            animationType="flyInTop"
            className="text-black/40 mb-6 tracking-[0.4em] uppercase"
          />
          <AnimatedText
            text="Ona mahkum olma"
            variant="subtitle"
            animationType="flyInBottom"
            className="text-black font-bold text-6xl md:text-8xl leading-tight"
          />
          <AnimatedText
            text="SECDE ET VE ALLAH'A YAKLAŞ"
            variant="title"
            animationType="fadeIn"
            className="text-zinc-800 mt-8 text-4xl md:text-5xl"
          />
        </div>
      </section>

      {/* Slide 6: Symmetrical Side-by-Side (Concluding) */}
      <section className="snap-start h-screen w-full flex items-center justify-center p-8 md:p-24 bg-black">
        <div className="w-full max-w-[90vw] flex flex-col md:flex-row items-center justify-between gap-16 md:gap-32">
          <div className="w-full md:w-[22%] text-center md:text-left">
            <AnimatedText
              text="Varlığın derinliklerinden süzülüp gelen o kadim nidayı işit; her zerre kendi lisanıyla hakikati fısıldar."
              variant="subtitle"
              animationType="fadeIn"
              className="text-white/80 text-lg md:text-2xl leading-relaxed font-serif"
            />
          </div>
          <div className="w-full md:w-[22%] text-center md:text-right">
            <AnimatedText
              text="Gökler dürülür, yeryüzü sarsılır ama kalbe nakşedilen o ilahi kelâm sonsuza dek baki kalır."
              variant="subtitle"
              animationType="fadeIn"
              className="text-white/80 text-lg md:text-2xl leading-relaxed font-serif"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
