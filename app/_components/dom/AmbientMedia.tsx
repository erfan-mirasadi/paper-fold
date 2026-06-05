import { CSSProperties } from "react";
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

const MediaElement = ({
  src,
  isVideo,
  className = "",
  style,
}: MediaElementProps) => {
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

  // Direct Zustand selector prevents 60fps tearing while ensuring synchronous React updates
  const isAmbientPhase = useFoldStore(
    (state) =>
      state.ambientProgress >= 0 &&
      state.introHandoffProgress === 0 &&
      (state.ambientProgress > 0 || state.introProgress >= 1),
  );

  const currentMedia = scrollAmbientId
    ? INTRO_MEDIA_DATA[scrollAmbientId]
    : INTRO_MEDIA_DATA[mediaKeys[0]];
  const activeMedia = activeId ? INTRO_MEDIA_DATA[activeId] : currentMedia;

  const src = propSrc || activeMedia?.src;
  const isVideo =
    propIsVideo !== undefined ? propIsVideo : (activeMedia?.isVideo ?? true);

  // Split masks to avoid mask-composite: intersect (known Chrome/Safari subpixel rendering bug
  // that leaves a 1px white line artifact where the two gradients intersect).
  // Horizontal fade goes on the container, vertical fade goes on the media element directly.
  const horizontalMask: CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
    maskImage:
      "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };

  const verticalMask: CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(to bottom, transparent 0px, transparent 10px, black 35%, black 65%, transparent calc(100% - 10px), transparent 100%)",
    maskImage:
      "linear-gradient(to bottom, transparent 0px, transparent 10px, black 35%, black 65%, transparent calc(100% - 10px), transparent 100%)",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
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

            {/* Foreground Layer: horizontal mask on container, vertical mask on media */}
            <div
              className="absolute inset-0 z-10 w-full h-full overflow-hidden transform-gpu scale-100 origin-center"
              style={horizontalMask}
            >
              <MediaElement src={src} isVideo={isVideo} style={verticalMask} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
