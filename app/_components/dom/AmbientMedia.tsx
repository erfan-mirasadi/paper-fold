import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useFoldStore } from "../canvas/orchestrator/ScrollManager";
import { INTRO_MEDIA_DATA } from "../../data/introMedia";
import { motion, AnimatePresence } from "framer-motion";

interface AmbientMediaProps {
  src?: string;
  isVideo?: boolean;
}

interface MediaElementProps {
  src: string;
  isVideo: boolean;
  className?: string;
}

const MediaElement = ({ src, isVideo, className = "" }: MediaElementProps) => {
  if (isVideo) {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
      />
    );
  }
  return (
    <Image
      src={src}
      alt="Ambient Media"
      fill
      className={`object-cover ${className}`}
      priority
      sizes="(max-width: 768px) 350px, 600px"
    />
  );
};

const mediaKeys = Object.keys(INTRO_MEDIA_DATA) as Array<
  keyof typeof INTRO_MEDIA_DATA
>;

export default function AmbientMedia({
  src: propSrc,
  isVideo: propIsVideo,
}: AmbientMediaProps) {
  const activeId = useFoldStore((s) => s.activeAmbientMediaId);
  const introProgress = useFoldStore((s) => s.introProgress);
  const introHandoffProgress = useFoldStore((s) => s.introHandoffProgress);

  // Strictly trigger only when the sections have fully met at the center
  const isJoinedStep = introProgress >= 0.99 && introHandoffProgress < 0.05;

  const [loopIndex, setLoopIndex] = useState(0);

  // Loop through media every 4 seconds ONLY when exactly at the joined step
  useEffect(() => {
    if (!isJoinedStep) {
      useFoldStore.getState().setLoopedAmbientMediaId(null);
      return;
    }

    // Sync the current looped ID with the store for 3D synchronization
    useFoldStore.getState().setLoopedAmbientMediaId(mediaKeys[loopIndex]);

    if (activeId) return;

    const interval = setInterval(() => {
      setLoopIndex((prev) => (prev + 1) % mediaKeys.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeId, isJoinedStep, loopIndex]);

  const currentLoopMedia = INTRO_MEDIA_DATA[mediaKeys[loopIndex]];
  const activeMedia = activeId ? INTRO_MEDIA_DATA[activeId] : currentLoopMedia;

  const src = propSrc || activeMedia?.src;
  const isVideo =
    propIsVideo !== undefined ? propIsVideo : (activeMedia?.isVideo ?? true);

  // Mask that fades on Top, Bottom, and Left, but stays sharp on the Right.
  const maskStyle: React.CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(to right, transparent 0%, black 60%), linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
    WebkitMaskComposite: "source-in",
    maskImage:
      "linear-gradient(to right, transparent 0%, black 60%), linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
    maskComposite: "intersect",
  };

  const showMedia = !!src && (isJoinedStep || !!activeId);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-0">
      <AnimatePresence mode="sync">
        {showMedia && (
          <motion.div
            key={src}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 w-full h-full"
            style={{ willChange: "transform, opacity" }}
          >
            {/* Optimized Ambient Glow: Single high-performance layer instead of 3. 
                Massively reduces GPU overhead while maintaining the premium glow effect. */}
            <div className="absolute inset-0 z-0 scale-[1.3] opacity-60 blur-[80px] saturate-150 pointer-events-none mix-blend-screen transform-gpu origin-right">
              <MediaElement src={src} isVideo={isVideo} />
            </div>

            {/* Foreground Layer: The Media with the custom mask */}
            <div
              className="absolute inset-0 z-10 w-full h-full overflow-hidden transform-gpu scale-[0.7] origin-right"
              style={maskStyle}
            >
              <MediaElement src={src} isVideo={isVideo} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
