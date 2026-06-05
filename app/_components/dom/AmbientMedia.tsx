import React, { useState, useEffect, CSSProperties } from "react";
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
  style?: CSSProperties;
}

const MediaElement = ({ src, isVideo, className = "", style }: MediaElementProps) => {
  if (isVideo) {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
        style={style}
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
      style={style}
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
  const scrollAmbientId = useFoldStore((s) => s.scrollAmbientMediaId);

  // Localized discrete state to shield from 60fps scroll renders
  const [isAmbientPhase, setIsAmbientPhase] = useState(() => {
    const s = useFoldStore.getState();
    return s.ambientProgress >= 0 && s.introHandoffProgress === 0 && (s.ambientProgress > 0 || s.introProgress >= 1);
  });

  useEffect(() => {
    return useFoldStore.subscribe((state) => {
      const ambient = state.ambientProgress >= 0 && state.introHandoffProgress === 0 && (state.ambientProgress > 0 || state.introProgress >= 1);
      setIsAmbientPhase(ambient);
    });
  }, []);

  const currentMedia = scrollAmbientId ? INTRO_MEDIA_DATA[scrollAmbientId] : INTRO_MEDIA_DATA[mediaKeys[0]];
  const activeMedia = activeId ? INTRO_MEDIA_DATA[activeId] : currentMedia;

  const src = propSrc || activeMedia?.src;
  const isVideo =
    propIsVideo !== undefined ? propIsVideo : (activeMedia?.isVideo ?? true);

  // Mask that fades smoothly on all edges: Top, Bottom, Left, and Right.
  const maskStyle: CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)",
    WebkitMaskComposite: "source-in",
    maskImage:
      "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)",
    maskComposite: "intersect",
  };

  const showMedia = !!src && (isAmbientPhase || !!activeId);

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
            {/* Optimized Ambient Glow: enabled for both image and video to look exactly the same */}
            <div className="absolute inset-0 z-0 scale-[1.4] opacity-60 blur-[80px] saturate-150 pointer-events-none mix-blend-screen transform-gpu origin-center">
              <MediaElement src={src} isVideo={isVideo} />
            </div>

            {/* Foreground Layer: The Media with the custom mask */}
            <div className="absolute inset-0 z-10 w-full h-full overflow-hidden transform-gpu scale-100 origin-center">
              <MediaElement src={src} isVideo={isVideo} style={maskStyle} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
