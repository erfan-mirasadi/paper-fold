"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useBackgroundMusicStore } from "@/app/stores/useBackgroundMusicStore";
import { backgroundMusic } from "@/app/utils/backgroundMusic";

/** Bar geometry in the icon's own units — full height; CSS scales them. */
const BARS = [0, 4.2, 8.4];

/**
 * The reader's hold on the background bed — a tiny equalizer that breathes
 * while the music is up and lies flat when it's muted.
 *
 * It only exists while there's something to silence (a voice speaking, or the
 * bed still settling), so the panel stays clean the rest of the time. The
 * preference itself outlives the visit: mute once and the music stays off.
 *
 * The pulse is CSS (see .bgm-bar in globals.css) — it costs the render loop
 * nothing, which matters on a page already giving its frames to WebGL.
 */
export function BackgroundMusicToggle() {
  const present = useBackgroundMusicStore((s) => s.present);
  const muted = useBackgroundMusicStore((s) => s.muted);
  const nowPlaying = useBackgroundMusicStore((s) => s.nowPlaying);

  const label = muted ? "Arka plan müziğini aç" : "Arka plan müziğini kapat";

  return (
    <AnimatePresence>
      {present && (
        <motion.button
          type="button"
          onClick={() => backgroundMusic.toggleMuted()}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: muted ? 0.32 : 0.62, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1.12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          aria-label={label}
          aria-pressed={!muted}
          title={
            nowPlaying && !muted
              ? `${nowPlaying.artist} — ${nowPlaying.title}`
              : label
          }
          className={`flex items-center justify-center cursor-pointer
            pointer-events-auto text-foreground outline-none
            w-[16px] h-[16px] lg:w-[clamp(16px,1.15vw,24px)] lg:h-[clamp(16px,1.15vw,24px)]
            ${muted ? "bgm-quiet" : ""}`}
          style={{ background: "transparent", border: 0, padding: 0 }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="-0.6 -0.6 12 12"
            fill="none"
            aria-hidden="true"
          >
            {BARS.map((x) => (
              <rect
                key={x}
                className="bgm-bar"
                x={x}
                y={0}
                width={2.4}
                height={10.8}
                rx={1.2}
                fill="currentColor"
              />
            ))}
            {/* Struck through when off — flat bars alone read as "quiet", the
                slash makes it read as "switched off". */}
            <line
              x1={0}
              y1={10.8}
              x2={10.8}
              y2={0}
              stroke="currentColor"
              strokeWidth={1.25}
              strokeLinecap="round"
              style={{
                opacity: muted ? 1 : 0,
                transition: "opacity 0.28s ease",
              }}
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
