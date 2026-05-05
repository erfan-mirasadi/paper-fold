import React from "react";
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
    />
  );
};

export default function AmbientMedia({
  src: propSrc,
  isVideo: propIsVideo,
}: AmbientMediaProps) {
  const activeId = useFoldStore((s) => s.activeAmbientMediaId);
  
  const activeMedia = activeId ? INTRO_MEDIA_DATA[activeId] : null;
  
  const src = propSrc || activeMedia?.src || "/intro/video-sample.mp4";
  const isVideo = propIsVideo !== undefined ? propIsVideo : (activeMedia?.isVideo ?? true);

  // Mask that fades on Top, Bottom, and Left, but stays sharp on the Right.
  const maskStyle: React.CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(to right, transparent 0%, black 60%), linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
    WebkitMaskComposite: "source-in",
    maskImage:
      "linear-gradient(to right, transparent 0%, black 60%), linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
    maskComposite: "intersect",
  };

  const showMedia = !!(propSrc || activeMedia);

  return (
    <div className="relative w-full max-w-full ml-auto mr-0 aspect-video flex items-center justify-center p-0 mt-60 mb-4">
      <AnimatePresence>
        {showMedia && (
          <motion.div
            key={src}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
            style={{ willChange: "transform, opacity" }}
          >
            {/* Extreme Ambient Glow: Ultra-diffused multi-tier layers */}
            {/* Tier 1: Ultra-Massive Atmospheric Bleed */}
            <div className="absolute inset-0 z-0 scale-[3.5] opacity-30 blur-[180px] saturate-200 pointer-events-none mix-blend-screen">
              <MediaElement src={src} isVideo={isVideo} />
            </div>

            {/* Tier 2: Mid-range Intense Glow */}
            <div className="absolute inset-0 z-0 scale-[2.2] opacity-50 blur-[100px] saturate-150 pointer-events-none mix-blend-screen">
              <MediaElement src={src} isVideo={isVideo} />
            </div>

            {/* Tier 3: Core Wrap Glow */}
            <div className="absolute inset-0 z-0 scale-[1.3] opacity-70 blur-[45px] pointer-events-none">
              <MediaElement src={src} isVideo={isVideo} />
            </div>

            {/* Foreground Layer: The Media with the custom mask */}
            <div
              className="absolute inset-0 z-10 w-full h-full overflow-hidden"
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
