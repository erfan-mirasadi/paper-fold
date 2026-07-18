"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useStoryStore,
  getActiveStoryConfig,
} from "@/app/stores/useStoryStore";
import { useFoldStore } from "@/app/_components/canvas/orchestrator/ScrollManager";
import { useSideInfoStore } from "@/app/stores/useSideInfoStore";
import { AnimatedText } from "@/app/_components/dom/ui-overlay/AnimatedText";
import { ExpandableEntry } from "@/app/_components/dom/ui-overlay/ExpandableEntry";
import { AyahNumber } from "@/app/_components/dom/ui-overlay/SurahScriptSidebar";
import { OverlayButton } from "@/app/_components/dom/ui-overlay/OverlayButton";
import { PanelBackdrop } from "@/app/_components/dom/ui-overlay/PanelBackdrop";
import { SidebarToggleIcon } from "@/app/_components/dom/ui-overlay/SidebarToggleIcon";
import type {
  SideInfoAudio,
  SideInfoCapsuleItem,
  SideInfoCapsules,
  SideInfoEntry,
  SideInfoImage,
  SurahLayoutConfig,
} from "@/app/data/schema";

const GOLD = "#C4963B";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/** "#RGB"/"#RRGGBB" → rgba() with the given alpha (used for accent tints). */
const hexToRgba = (hex: string, alpha: number) => {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const num = parseInt(full, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
};

// ── Toggle — mirrored twin of the left sidebar's SidebarToggle ──────────────
// Rendered inside the top-right overlay button row (SurahViewer), so it lives
// in a different subtree from the panel — state is shared via useSideInfoStore.
export function SideInfoToggle() {
  const activeConfig = useStoryStore((s) => s.activeConfig);
  const isOpen = useSideInfoStore((s) => s.isOpen);
  const toggle = useSideInfoStore((s) => s.toggle);

  const side = activeConfig.sideInfo;
  if (!side || (!side.byFoldStep && !side.byVerse)) return null;

  return (
    <OverlayButton
      onClick={toggle}
      aria-label={isOpen ? "Collapse tafsir panel" : "Expand tafsir panel"}
      aria-expanded={isOpen}
      // hidden below sm: the top-right row already fills the smallest screens
      className="hidden sm:flex w-14 h-14 text-foreground"
    >
      <SidebarToggleIcon isOpen={isOpen} side="right" />
    </OverlayButton>
  );
}

// ── Minimal ink-style audio player — a play circle, a hairline progress
// track and the elapsed/total time. No box, no border: it sits directly on
// the page like everything else in this panel. ──────────────────────────────
function InkAudioPlayer({ src, title }: SideInfoAudio) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !isFinite(audio.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = clamp01((e.clientX - rect.left) / rect.width);
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  };

  const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ marginTop: "clamp(16px, 1.5vw, 26px)" }}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          setCurrentTime(a.currentTime);
          setProgress(a.duration ? a.currentTime / a.duration : 0);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      {title && (
        <div
          className="uppercase text-foreground/45 text-[8px] lg:text-[clamp(9px,0.62vw,14px)]"
          style={{
            letterSpacing: "0.22em",
            fontFamily: "var(--font-inter)",
            marginBottom: "clamp(7px, 0.6vw, 11px)",
          }}
        >
          {title}
        </div>
      )}

      <div
        className="flex items-center text-foreground"
        style={{ gap: "clamp(10px, 0.9vw, 16px)" }}
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Duraklat" : "Dinle"}
          className="flex items-center justify-center flex-shrink-0 cursor-pointer
            rounded-full transition-all duration-300
            opacity-60 hover:opacity-100 hover:scale-110
            w-[28px] h-[28px] lg:w-[clamp(30px,2.1vw,44px)] lg:h-[clamp(30px,2.1vw,44px)]"
          style={{
            border: "1px solid currentColor",
            background: "transparent",
          }}
        >
          {isPlaying ? (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
              <rect x="1" y="0.5" width="2.6" height="11" rx="1" />
              <rect x="6.4" y="0.5" width="2.6" height="11" rx="1" />
            </svg>
          ) : (
            <svg
              width="11"
              height="12"
              viewBox="0 0 11 12"
              fill="currentColor"
              style={{ marginLeft: 2 }}
            >
              <path d="M1.2 1.06c0-.8.87-1.3 1.56-.88l8.02 4.94c.66.4.66 1.36 0 1.76L2.76 11.8c-.69.43-1.56-.07-1.56-.88V1.06Z" />
            </svg>
          )}
        </button>

        <div
          className="flex-1 cursor-pointer py-2"
          onPointerDown={seek}
          role="slider"
          aria-label="Ses konumu"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div
            className="relative w-full"
            style={{ height: 2, background: "rgba(150,150,150,0.25)" }}
          >
            <div
              className="absolute left-0 top-0 h-full"
              style={{
                width: `${progress * 100}%`,
                background: GOLD,
                transition: isPlaying ? "none" : "width 0.2s ease",
              }}
            />
          </div>
        </div>

        <span
          className="flex-shrink-0 tabular-nums text-foreground/50 text-[9px] lg:text-[clamp(10px,0.68vw,15px)]"
          style={{ fontFamily: "var(--font-inter)", letterSpacing: "0.04em" }}
        >
          {fmt(currentTime)} / {fmt(duration)}
        </span>
      </div>
    </div>
  );
}

// ── Borderless image — soft rounded corners, a faint vignette mask and a
// gentle sepia so photos melt into the page instead of sitting on it. ───────
function InkImage({ src, caption, alt }: SideInfoImage) {
  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.985, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: false, margin: "-6% 0px -6% 0px" }}
      transition={{ duration: 1.15, ease: [0.25, 1, 0.5, 1] }}
      style={{ margin: "clamp(16px, 1.5vw, 26px) 0 0" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? caption ?? ""}
        draggable={false}
        className="block w-full h-auto select-none"
        style={{
          borderRadius: "clamp(8px, 0.7vw, 14px)",
          filter: "sepia(0.12) saturate(0.92)",
          WebkitMaskImage:
            "radial-gradient(140% 140% at 50% 50%, black 62%, rgba(0,0,0,0.88) 84%, rgba(0,0,0,0.62) 100%)",
          maskImage:
            "radial-gradient(140% 140% at 50% 50%, black 62%, rgba(0,0,0,0.88) 84%, rgba(0,0,0,0.62) 100%)",
        }}
      />
      {caption && (
        <figcaption
          className="italic text-foreground/50 text-[9px] lg:text-[clamp(10px,0.72vw,16px)]"
          style={{
            fontFamily: "var(--font-inter)",
            marginTop: "clamp(6px, 0.5vw, 10px)",
            letterSpacing: "0.04em",
          }}
        >
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
}

// ── Capsules — the tafsir book's bordered phrase boxes, redrawn in the
// panel's ink style. A group is a 1- or 2-column grid (2 collapses to 1
// below lg, where the panel is only 160px wide), optionally wrapped in a
// rounded frame like the book's boxed clusters. Each capsule adapts to its
// text length: a short line sits centered in a true pill; longer passages
// relax into a left-aligned plaque, and very long ones float their number
// as a chip straddling the top border. ──────────────────────────────────────

function InkCapsule({
  item,
  index,
  framed,
  corners,
  groupAccent,
  groupBg,
  groupTextColor,
  spanClass,
}: {
  item: SideInfoCapsuleItem;
  index: number;
  framed: boolean;
  corners?: "pill" | "soft";
  groupAccent?: string;
  groupBg?: string;
  groupTextColor?: string;
  spanClass: string;
}) {
  const accent = item.color ?? groupAccent ?? GOLD;
  const bg = item.bg ?? groupBg ?? hexToRgba(accent, 0.06);
  const textColor = item.textColor ?? groupTextColor;

  // Corner treatment: explicit `corners` wins, otherwise the text's length
  // picks the capsule's personality (see schema docs).
  const len = item.text.length;
  const isPill = corners ? corners === "pill" : len <= 56;
  // Number always renders inline inside the capsule text (as the coloured
  // "n. " prefix). The floating-chip variant (straddling the top border) is
  // disabled: it produced inconsistent positioning depending on text length.
  const chipNumber = false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: false, margin: "-4% 0px -4% 0px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.07,
        ease: [0.25, 1, 0.5, 1],
      }}
      className={`relative flex min-w-0 ${spanClass} ${
        isPill
          ? "items-center justify-center text-center"
          : len > 140
            ? "items-start text-left"
            : "items-center text-left"
      }`}
      style={{
        border: `1px solid ${hexToRgba(accent, 0.75)}`,
        borderRadius: isPill ? 999 : "clamp(8px, 0.7vw, 13px)",
        background: bg,
        padding: isPill
          ? "clamp(7px, 0.6vw, 12px) clamp(12px, 1vw, 20px)"
          : "clamp(8px, 0.72vw, 14px) clamp(11px, 0.95vw, 19px)",
        marginTop: chipNumber ? "0.6em" : undefined,
      }}
    >
      {chipNumber && (
        <span
          className="absolute font-medium tabular-nums
            text-[8.5px] lg:text-[clamp(9.5px,0.66vw,15px)]"
          style={{
            top: 0,
            left: "clamp(12px, 1vw, 18px)",
            transform: "translateY(-52%)",
            color: accent,
            background: "var(--background)",
            border: `1px solid ${hexToRgba(accent, 0.75)}`,
            borderRadius: 999,
            padding: "0.1em 0.6em",
            letterSpacing: "0.06em",
            lineHeight: 1.5,
          }}
        >
          {item.n}
        </span>
      )}

      <p
        lang="tr"
        className={`m-0 break-words ${textColor ? "" : "text-foreground/85"}
          ${
            isPill
              ? "text-[10.5px] lg:text-[clamp(11.5px,0.82vw,19px)]"
              : "text-[10.5px] lg:text-[clamp(11px,0.78vw,18px)]"
          }`}
        style={{
          fontFamily: "var(--font-inter)",
          lineHeight: isPill ? 1.6 : 1.9,
          letterSpacing: "0.01em",
          color: item.textColor || textColor,
        }}
      >
        {!chipNumber && item.n !== undefined && (
          <span className="font-semibold" style={{ color: accent }}>
            {item.n}
            {typeof item.n === "number" ? "." : ""}
          </span>
        )}
        <span dangerouslySetInnerHTML={{ __html: item.text }} />
      </p>
    </motion.div>
  );
}

function InkCapsuleGroup({ group }: { group: SideInfoCapsules }) {
  const accent = group.color ?? GOLD;
  const cols = group.columns ?? (group.capsules.length > 1 ? 2 : 1);
  const frameColor =
    typeof group.frame === "string"
      ? group.frame
      : group.frame
        ? hexToRgba(accent, 0.45)
        : null;

  const grid = (
    <div
      className={`grid min-w-0 ${
        cols === 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      }`}
      style={{ gap: "clamp(6px, 0.55vw, 11px)" }}
    >
      {group.capsules.map((item, i) => (
        <InkCapsule
          key={i}
          item={item}
          index={i}
          framed={!!frameColor}
          corners={group.corners}
          groupAccent={group.color}
          groupBg={group.bg}
          groupTextColor={group.textColor}
          spanClass={cols === 2 && item.span ? "lg:col-span-2" : ""}
        />
      ))}
    </div>
  );

  return (
    <div
      style={{ marginTop: "clamp(13px, 1.2vw, 22px)" }}
      // The panel backdrop watches these to tint its wash with whatever
      // colored content is currently scrolled into view (see SideInfoPanel).
      data-pb-accent={accent}
    >
      {frameColor ? (
        <div
          style={{
            border: `1px solid ${frameColor}`,
            borderRadius: "clamp(14px, 1.15vw, 22px)",
            padding: "clamp(8px, 0.7vw, 14px)",
            background: hexToRgba(
              typeof group.frame === "string" ? group.frame : accent,
              0.07,
            ),
          }}
        >
          {grid}
        </div>
      ) : (
        grid
      )}
    </div>
  );
}

// ── Entry resolution ────────────────────────────────────────────────────────

interface ResolvedEntry {
  key: string;
  verseId?: number;
  stepIdx: number;
  entry: SideInfoEntry;
}

/**
 * Builds the panel's reading log for the given fold step: for every step from
 * the story's start up to (and including) the current one, append that step's
 * own entry, then the entries of verses that first became visible there
 * (per `scriptHighlights`). Earlier entries stay on screen — the reader keeps
 * their place while the paper keeps unfolding.
 */
function resolveEntries(
  config: SurahLayoutConfig,
  stepIdx: number,
): ResolvedEntry[] {
  const side = config.sideInfo;
  if (!side) return [];

  const steps = config.animations.foldSteps;
  const out: ResolvedEntry[] = [];
  const seenVerses = new Set<number>();

  const last = Math.min(stepIdx, steps.length - 1);
  for (let i = 0; i <= last; i++) {
    const stepId = steps[i].id;

    const stepEntry = side.byFoldStep?.[stepId];
    if (stepEntry)
      out.push({ key: `step-${stepId}`, stepIdx: i, entry: stepEntry });

    const fresh = (config.scriptHighlights?.[stepId] ?? [])
      .filter((v) => !seenVerses.has(v))
      .sort((a, b) => a - b);
    for (const v of fresh) {
      seenVerses.add(v);
      const entry = side.byVerse?.[v];
      if (entry) out.push({ key: `verse-${v}`, verseId: v, stepIdx: i, entry });
    }
  }
  return out;
}

// ── One entry — kicker, title, paragraphs, images, audio; all animated with
// the same intro text animation (AnimatedText, cinematic word-by-word). ─────
function SideInfoEntryView({
  verseId,
  entry,
  hideVerseNumbers,
}: Omit<ResolvedEntry, "key" | "stepIdx"> & { hideVerseNumbers?: boolean }) {
  const kicker =
    entry.kicker ??
    (!hideVerseNumbers && verseId !== undefined
      ? `${verseId}. Ayet`
      : undefined);

  // The entry's reading flow, built on demand because it renders up to
  // twice: once as the real body, and once more as the fold window's
  // preview copy (see FoldedEntry) — identical markup keeps both copies
  // wrapping (and even word-animating) in perfect sync.
  const renderFlow = () =>
    entry.paragraphs?.map((item, i) =>
      typeof item === "string" ? (
        <AnimatedText
          key={i}
          text={item}
          as="p"
          variant="body"
          animationType="fadeIn"
          cinematic
          splitLevel="word"
          staggerDelay={0.008}
          once
          blurPx={0}
          durationS={0.7}
          inViewMargin="0px"
          className="!text-left w-full font-normal text-foreground/80
            text-[11.5px] lg:text-[clamp(12.5px,0.9vw,21px)]"
          style={{
            textShadow: "none",
            fontFamily: "var(--font-inter)",
            lineHeight: 1.95,
            marginTop: "clamp(10px, 1vw, 18px)",
          }}
        />
      ) : "subtitle" in item ? (
        <AnimatedText
          key={i}
          text={item.subtitle}
          as="h4"
          variant="subtitle"
          animationType="flyInBottom"
          cinematic
          splitLevel="word"
          staggerDelay={0.06}
          once
          blurPx={8}
          durationS={0.9}
          inViewMargin="0px"
          className="!text-left w-full font-medium tracking-tight text-foreground
            text-[15px] lg:text-[clamp(17px,1.2vw,28px)]"
          style={{
            textShadow: "none",
            fontFamily: "var(--font-roboto)",
            lineHeight: 1.3,
            marginTop: "clamp(18px, 2vw, 32px)",
          }}
        />
      ) : (
        <InkCapsuleGroup key={i} group={item} />
      ),
    );

  const body = (
    <>
      {renderFlow()}

      {entry.images?.map((img, i) => (
        <InkImage key={i} {...img} />
      ))}

      {entry.audio && <InkAudioPlayer {...entry.audio} />}
    </>
  );

  // Entries that open with a body paragraph ship folded at the 4th line —
  // kicker and title stay visible above the fold (see FoldedEntry.tsx for
  // every tunable). Capsule-first entries (e.g. summary pages) stay whole.
  const foldable = typeof entry.paragraphs?.[0] === "string";

  return (
    <div>
      {(kicker || (!hideVerseNumbers && verseId !== undefined)) && (
        <div
          className="flex items-center"
          style={{
            gap: "clamp(6px, 0.5vw, 10px)",
            marginBottom: "clamp(6px, 0.55vw, 12px)",
          }}
        >
          {!hideVerseNumbers && verseId !== undefined && (
            <span
              className="text-[11px] lg:text-[clamp(12px,0.85vw,19px)]"
              style={{ color: GOLD }}
            >
              <AyahNumber n={verseId} />
            </span>
          )}
          {kicker && (
            <AnimatedText
              text={kicker}
              as="div"
              variant="caption"
              animationType="flyInLeft"
              cinematic
              splitLevel="word"
              staggerDelay={0.05}
              once
              blurPx={0}
              durationS={0.8}
              inViewMargin="0px"
              className="!text-left w-full uppercase font-medium text-[8.5px] lg:text-[clamp(9.5px,0.66vw,15px)]"
              spanClassName="tracking-[0.26em]"
              style={{ textShadow: "none", color: GOLD }}
            />
          )}
        </div>
      )}

      {entry.title && (
        <AnimatedText
          text={entry.title}
          as="h3"
          variant="subtitle"
          animationType="flyInBottom"
          cinematic
          splitLevel="word"
          staggerDelay={0.06}
          once
          blurPx={8}
          durationS={0.9}
          inViewMargin="0px"
          className="!text-left w-full font-light tracking-tight text-foreground
            text-[17px] lg:text-[clamp(19px,1.4vw,34px)]"
          style={{
            textShadow: "none",
            fontFamily: "var(--font-roboto)",
            lineHeight: 1.2,
          }}
        />
      )}

      {foldable ? (
        <ExpandableEntry preview={renderFlow()}>{body}</ExpandableEntry>
      ) : (
        body
      )}
    </div>
  );
}

// ── The panel itself ────────────────────────────────────────────────────────
export function SideInfoPanel() {
  const activeConfig = useStoryStore((s) => s.activeConfig);
  const isOpen = useSideInfoStore((s) => s.isOpen);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Same fold-step derivation the left script sidebar uses: the selector
  // returns an index, so this only re-renders when the STEP changes, not on
  // every scroll frame.
  const stepIdx = useFoldStore((s) => {
    const steps = getActiveStoryConfig().animations.foldSteps;
    if (steps.length === 0) return 0;
    const maxIdx = steps.length - 1;
    return Math.round(clamp01(s.currentOffset) * maxIdx);
  });

  const entries = useMemo(
    () => resolveEntries(activeConfig, stepIdx),
    [activeConfig, stepIdx],
  );

  // Only claim the wheel (data-lenis-prevent + inner scroll) when the text
  // actually overflows — otherwise wheel events over the panel must keep
  // driving the page's fold-story scroll (mirrors the left sidebar).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setHasOverflow(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    // Content growth (e.g. a FoldedParagraph expanding) changes scrollHeight
    // without resizing the container itself — watch the entries too.
    for (const child of Array.from(el.children)) ro.observe(child);
    return () => ro.disconnect();
  }, [isOpen, activeConfig.id, entries.length]);

  // When new entries arrive on a fold-step change, glide the panel's own
  // scroll down to the first of them — the paper only unfolds while the user
  // is driving the page, so this never fights an in-progress read.
  const prevCountRef = useRef(0);
  useEffect(() => {
    const prevCount = prevCountRef.current;
    prevCountRef.current = entries.length;
    if (entries.length <= prevCount || !isOpen) return;
    const firstNewKey = entries[prevCount]?.key;
    const el = scrollRef.current;
    if (!firstNewKey || !el) return;
    // Let the entry mount + its entrance animation start before gliding.
    const t = window.setTimeout(() => {
      const node = el.querySelector<HTMLElement>(
        `[data-entry-key="${firstNewKey}"]`,
      );
      if (!node) return;
      el.scrollTo({
        top: Math.max(node.offsetTop - 12, 0),
        behavior: "smooth",
      });
    }, 420);
    return () => window.clearTimeout(t);
  }, [entries, isOpen]);

  // Backdrop accent — removed IntersectionObserver logic per request.
  // Now we mirror the exact same fast, synchronous logic used by the script side:
  // we pick the dominant color of the currently highlighted verses in the active fold step.
  const GOLD = "#C4963B";
  const activeStepId = activeConfig.animations.foldSteps[stepIdx]?.id;
  const highlightArray =
    (activeStepId && activeConfig.scriptHighlights?.[activeStepId]) || [];
  const highlighted = new Set(highlightArray);

  // Backdrop accent — compare current step vs previous to find newly added verses.
  const prevStepId =
    stepIdx > 0 ? activeConfig.animations.foldSteps[stepIdx - 1]?.id : null;
  const prevHighlightSet = new Set(
    (prevStepId && activeConfig.scriptHighlights?.[prevStepId]) || [],
  );
  const newlyAdded = highlightArray.filter((n) => !prevHighlightSet.has(n));

  let scrollAccent: string | null = null;
  if (newlyAdded.length > 0) {
    scrollAccent = activeConfig.verseOverrides?.[newlyAdded[0]]?.border ?? GOLD;
  } else if (highlightArray.length > 0) {
    scrollAccent =
      activeConfig.verseOverrides?.[highlightArray[highlightArray.length - 1]]
        ?.border ?? GOLD;
  }

  const side = activeConfig.sideInfo;
  if (!side || (!side.byFoldStep && !side.byVerse)) return null;

  // Landscape papers (wider than tall, e.g. fatihaLandscape) sit high on the
  // screen and leave the band below them free — there the panel drops into
  // the right half of that bottom band (still the right side, like the
  // default). Portrait papers keep the original right-side column untouched.
  const isLandscapePaper =
    activeConfig.dimensions.paperWidth > activeConfig.dimensions.paperHeight;

  const panelTitle = side.panelTitle ?? "Tefsir";
  const emptyText =
    side.emptyText ?? "Kağıt açıldıkça ayetlerin kıssaları burada belirecek.";

  return (
    <>
      {/* ── Divider — thin line below the top-right button row, mirroring
          the left sidebar's divider. Only for the right-side (portrait)
          panel; the landscape bottom panel carries no top-right divider. ─ */}
      {!isLandscapePaper && (
        <div
          className="fixed right-3 lg:right-5 z-[99] pointer-events-none hidden sm:block"
          style={{
            top: "clamp(42px, 4vw, 68px)",
            width: "clamp(140px, 18vw, 320px)",
          }}
        >
          <div
            style={{
              height: "1px",
              background: `linear-gradient(to left, rgba(180,180,180,0.35), rgba(180,180,180,0.08) 60%, transparent 100%)`,
            }}
          />
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={
              isLandscapePaper
                ? {
                    // Bottom band, right half — aligned with the paper's
                    // right edge, stopping short of the horizontal center,
                    // and vertically centered between the paper's bottom
                    // edge (~65vh) and the bottom of the screen.
                    top: "71vh",
                    bottom: "clamp(48px, 7vh, 96px)",
                    right: "clamp(48px, 17vw, 380px)",
                    width: "min(28vw, 520px)",
                  }
                : {
                    top: "clamp(54px, 5vw, 82px)",
                    bottom: "0px",
                  }
            }
            className={`fixed z-[90] pointer-events-auto hidden sm:flex flex-col
              ${
                isLandscapePaper
                  ? ""
                  : "right-2 w-[160px] lg:right-[2vw] lg:w-[22vw]"
              }`}
          >
            <PanelBackdrop accent={scrollAccent} side="right" />

            <motion.div
              initial={isLandscapePaper ? { y: 24 } : { x: 24 }}
              animate={isLandscapePaper ? { y: 0 } : { x: 0 }}
              exit={isLandscapePaper ? { y: 24 } : { x: 24 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex-1 min-h-0 flex flex-col"
            >
              {/* ── Panel heading — quiet small caps, centered ──────────── */}
              <div
                className="flex-shrink-0 text-center uppercase text-foreground/50
                  text-[9px] lg:text-[clamp(10px,0.72vw,16px)]"
                style={{
                  letterSpacing: "0.28em",
                  fontFamily: "var(--font-roboto)",
                  marginBottom: "clamp(14px, 1.4vw, 24px)",
                  paddingRight: "0.1em",
                }}
              >
                {panelTitle}
              </div>

              {/* ── Reading log — grows to fill the aside, scrolls on its own */}
              <div
                ref={scrollRef}
                {...(hasOverflow ? { "data-lenis-prevent": "" } : {})}
                className={`relative flex-1 min-h-0 overscroll-contain
                  [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                  ${hasOverflow ? "overflow-y-auto" : "overflow-visible"}`}
              >
              <AnimatePresence initial={false}>
                {entries.length === 0 ? (
                  <motion.p
                    key="side-info-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="italic text-foreground/40
                      text-[11px] lg:text-[clamp(12px,0.85vw,20px)]"
                    style={{
                      fontFamily: "var(--font-inter)",
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    {emptyText}
                  </motion.p>
                ) : (
                  entries.map((resolved) => {
                    // The entry the fold story just revealed stays at full
                    // ink; everything the reader has already moved past
                    // settles back — quieter and greyed, like older writing
                    // on the same page — so the newest story keeps the eye.
                    const isNewest = resolved.stepIdx === stepIdx;
                    return (
                      <motion.article
                        key={resolved.key}
                        data-entry-key={resolved.key}
                        initial={{
                          opacity: 0,
                          y: 18,
                          filter: "blur(6px) grayscale(0)",
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          filter: "blur(0px) grayscale(0)",
                        }}
                        exit={{
                          opacity: 0,
                          y: 10,
                          filter: "blur(6px) grayscale(0)",
                          transition: { duration: 0.35, ease: "easeIn" },
                        }}
                        transition={{
                          duration: isNewest ? 0.85 : 1.1,
                          ease: [0.25, 1, 0.5, 1],
                        }}
                        style={{ marginBottom: "clamp(30px, 3vw, 54px)" }}
                      >
                        <SideInfoEntryView
                          verseId={resolved.verseId}
                          entry={resolved.entry}
                          hideVerseNumbers={
                            activeConfig.features?.hideVerseNumbers
                          }
                        />
                      </motion.article>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
