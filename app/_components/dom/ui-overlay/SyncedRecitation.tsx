"use client";

import {
  CSSProperties,
  ElementType,
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RecitationTranscript } from "@/app/data/recitations/types";
import { alignWordTimes, normalizeWord } from "@/app/data/recitations/align";
import {
  useRecitationChain,
  type RecitationChainSlot,
} from "@/app/_components/dom/ui-overlay/RecitationChain";

const GOLD = "#C4963B";

// Crest half-window, in seconds: a span glows as the voice comes within this
// much of its center and dims as it moves past — so a soft light rides the
// fill's leading edge, travelling left → right at the speaking rate.
const CREST_WIN = 0.2;
// How many spans on each side of the head we refresh per frame.
const WIN = 6;

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/** "#RGB"/"#RRGGBB" → rgba() with the given alpha. */
function withAlpha(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return hex;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
};

/**
 * Nearest scrollable ancestor of `node` — the box whose scroll we drive to
 * keep the spoken word in view. Returns null when there's no inner scroller,
 * so auto-scroll never fights the page's own scrolling.
 */
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    const oy = getComputedStyle(el).overflowY;
    if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight)
      return el;
    el = el.parentElement;
  }
  return null;
}

// One renderable span: a character, or an inter-word gap (`space`, holding a
// real " " so the line still wraps there while the fill flows straight
// through it — that's what keeps the band continuous instead of gapped).
interface Segment {
  ch: string;
  gi: number;
  space: boolean;
}

/**
 * One authored line of the recitation, with its own tag + typography. Blocks
 * are recited (and highlighted) in order — a kicker, a title, a subtitle and
 * body paragraphs all take the same karaoke treatment, each in its own style.
 */
export interface RecitedBlock {
  text: string;
  /** Element tag (default "p"). e.g. "h3" for a title, "h4" for a subtitle. */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

export interface SyncedRecitationProps {
  /**
   * The authored blocks to recite, in order — the source of truth for what's
   * shown and how it's styled. The transcript is aligned onto their words.
   */
  blocks: RecitedBlock[];
  /** Time-aligned transcript (timing only — see RecitationTranscript). */
  transcript: RecitationTranscript;
  /** Highlight / wash accent. Defaults to the panel gold. */
  accent?: string;
  /**
   * Position in the surrounding RecitationChain — which entry this player
   * belongs to and where it falls within it. Given one, the player hushes the
   * others when it starts and hands over to the next when it ends. Omit for a
   * standalone player.
   */
  chain?: RecitationChainSlot;
}

/**
 * A self-contained, karaoke-style recitation block: it renders the authored
 * blocks (kicker / title / subtitle / paragraphs) as live text and, while its
 * inline audio player runs, an ink wash fills them as one continuous band,
 * left → right, in step with the voice — with a soft warm light riding the
 * leading edge — and the nearest scroll container glides to follow along.
 * Pausing or finishing fades it back to plain ink. Clicking any word jumps to
 * it. The displayed text is always the authored copy; the transcript only
 * times it (aligned tolerantly), so a bad transcript never changes what shows.
 *
 * Drop it anywhere; it finds its own scroll parent. Per frame it only touches
 * the handful of spans around the read head, so it stays light.
 */
export function SyncedRecitation({
  blocks,
  transcript,
  accent = GOLD,
  chain: slot,
}: SyncedRecitationProps) {
  const chain = useRecitationChain();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollElRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const timeRef = useRef<HTMLSpanElement | null>(null);
  const spanEls = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef<() => void>(() => {});
  const finalizedRef = useRef(0); // spans [0, finalized) are locked to full fill
  const suspendUntilRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(transcript.durationS ?? 0);

  // A left-anchored, vertically-feathered gold wash. Grows in WIDTH (0 → 100%)
  // per span; adjacent full spans abut seamlessly into one continuous band.
  const wash = useMemo(
    () =>
      `linear-gradient(to bottom, ${withAlpha(accent, 0)} 0%, ${withAlpha(
        accent,
        0.32,
      )} 42%, ${withAlpha(accent, 0.44)} 66%, ${withAlpha(
        accent,
        0.08,
      )} 92%, ${withAlpha(accent, 0)} 100%)`,
    [accent],
  );

  const spanBaseStyle = useMemo<CSSProperties>(
    () => ({
      backgroundImage: wash,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "left center",
      backgroundSize: "0% 100%",
      cursor: "pointer",
      transition:
        "background-size 0.09s linear, filter 0.18s ease, text-shadow 0.18s ease",
    }),
    [wash],
  );

  // Tokenize the authored blocks into display words (source of truth), align
  // the transcript's timings onto them, then split each word into per-character
  // segments plus an inter-word gap segment carrying the silence between words
  // (so the fill flows through the spaces too). `blockSegs[i]` is block i's
  // segments; `starts`/`durs`/`centers` are the flat arrays the loop reads.
  const { blockSegs, starts, durs, centers, N } = useMemo(() => {
    const starts: number[] = [];
    const durs: number[] = [];
    const centers: number[] = [];
    const push = (s: number, d: number) => {
      const dd = Math.max(d, 0.001);
      const gi = starts.length;
      starts.push(s);
      durs.push(dd);
      centers.push(s + dd / 2);
      return gi;
    };

    const words: { text: string; block: number }[] = [];
    blocks.forEach((b, bi) =>
      b.text.split(/\s+/).forEach((tok) => {
        if (tok) words.push({ text: tok, block: bi });
      }),
    );
    const times = alignWordTimes(
      words.map((w) => normalizeWord(w.text)),
      transcript.words,
      duration || transcript.durationS || 0,
    );

    const blockSegs: Segment[][] = blocks.map(() => []);
    words.forEach((word, wi) => {
      const segs = blockSegs[word.block];
      const { s, e } = times[wi];
      const chars = Array.from(word.text);
      const L = Math.max(chars.length, 1);
      const d = (e - s) / L;
      chars.forEach((ch, j) => {
        segs.push({ ch, gi: push(s + j * d, d), space: false });
      });
      const next = words[wi + 1];
      if (next && next.block === word.block)
        segs.push({
          ch: " ",
          gi: push(e, Math.max(times[wi + 1].s - e, 0.001)),
          space: true,
        });
    });
    return { blockSegs, starts, durs, centers, N: starts.length };
  }, [blocks, transcript, duration]);

  // Fractional head position in span-index units: `floor` is the span the
  // voice is on, the fraction is how far through it we are. −1 before the
  // first word. This is what makes the fill continuous rather than stepped.
  const headFrac = useCallback(
    (t: number) => {
      if (N === 0 || t < starts[0]) return -1;
      let lo = 0,
        hi = N - 1,
        ans = 0;
      while (lo <= hi) {
        const m = (lo + hi) >> 1;
        if (starts[m] <= t) {
          ans = m;
          lo = m + 1;
        } else hi = m - 1;
      }
      return ans + clamp01((t - starts[ans]) / durs[ans]);
    },
    [N, starts, durs],
  );

  const setSpan = useCallback(
    (i: number, fill: number, crest: number) => {
      const el = spanEls.current[i];
      if (!el) return;
      el.style.backgroundSize =
        (fill <= 0 ? "0%" : fill >= 1 ? "100%" : `${(fill * 100).toFixed(1)}%`) +
        " 100%";
      if (crest <= 0.004) {
        if (el.style.filter) {
          el.style.filter = "";
          el.style.textShadow = "";
        }
      } else {
        // Candlelight riding the frontier: brighten the ink and wrap it in a
        // warm gold halo, both peaking on the just-spoken character.
        el.style.filter = `brightness(${(1 + crest * 0.7).toFixed(3)})`;
        el.style.textShadow = `0 0 ${(crest * 20).toFixed(1)}px ${withAlpha(
          accent,
          crest * 0.7,
        )}, 0 0 ${(crest * 7).toFixed(1)}px ${withAlpha(accent, crest * 0.5)}`;
      }
    },
    [accent],
  );

  // Full pass — used on seek (and on (re)start) so a jump anywhere lands every
  // span in the right state, including clearing fills ahead of a rewind.
  const reconcile = useCallback(
    (t: number) => {
      const H = headFrac(t);
      const fH = Math.floor(H);
      for (let i = 0; i < N; i++) {
        if (H < 0) {
          setSpan(i, 0, 0);
        } else if (i < fH - WIN) {
          setSpan(i, 1, 0);
        } else if (i > fH + WIN) {
          setSpan(i, 0, 0);
        } else {
          const crest = Math.max(0, 1 - Math.abs(t - centers[i]) / CREST_WIN);
          setSpan(i, clamp01(H - i), crest);
        }
      }
      finalizedRef.current = H < 0 ? 0 : Math.max(0, fH - WIN);
    },
    [N, headFrac, centers, setSpan],
  );

  // Glide the scroll container so the head sits ~42% down the viewport. A
  // per-frame lerp keeps it continuous; a recent hand-scroll suspends it.
  const followHead = useCallback((i: number) => {
    const c = scrollElRef.current;
    if (!c || i < 0) return;
    if (performance.now() < suspendUntilRef.current) return;
    const el = spanEls.current[i];
    if (!el) return;
    const cr = c.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const target = c.scrollTop + (er.top - cr.top) - c.clientHeight * 0.42;
    const max = c.scrollHeight - c.clientHeight;
    const clamped = Math.max(0, Math.min(target, max));
    c.scrollTop += (clamped - c.scrollTop) * 0.1;
  }, []);

  const frame = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    const t = a.currentTime;
    if (progressRef.current)
      progressRef.current.style.width = duration
        ? `${clamp01(t / duration) * 100}%`
        : "0%";
    if (timeRef.current) timeRef.current.textContent = fmt(t);

    const H = headFrac(t);
    if (H >= 0) {
      const fH = Math.floor(H);
      const lo = Math.max(0, fH - WIN);
      const hi = Math.min(N - 1, fH + WIN);
      for (let i = finalizedRef.current; i < lo; i++) setSpan(i, 1, 0);
      if (lo > finalizedRef.current) finalizedRef.current = lo;
      for (let i = lo; i <= hi; i++) {
        const crest = Math.max(0, 1 - Math.abs(t - centers[i]) / CREST_WIN);
        setSpan(i, clamp01(H - i), crest);
      }
      followHead(Math.min(fH, N - 1));
    }
    rafRef.current = requestAnimationFrame(() => frameRef.current());
  }, [duration, headFrac, centers, setSpan, followHead, N]);

  // Keep the ref pointing at the latest `frame` so the self-scheduled loop
  // always runs the current closure without referencing itself.
  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  // Play → refresh the scroller, sync every span to the current time, run the
  // loop. Pause/stop → let `.rw-fade` slow the transitions and clear every
  // span back to plain ink, so the wash recedes and the light settles gently.
  useEffect(() => {
    const a = audioRef.current;
    if (isPlaying) {
      scrollElRef.current = getScrollParent(rootRef.current);
      if (a) reconcile(a.currentTime);
      rafRef.current = requestAnimationFrame(frame);
    } else {
      for (let i = 0; i < N; i++) setSpan(i, 0, 0);
      finalizedRef.current = 0;
    }
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isPlaying, frame, reconcile, setSpan, N]);

  // Pause auto-scroll for a beat whenever the reader scrolls the panel by hand.
  useEffect(() => {
    scrollElRef.current = getScrollParent(rootRef.current);
    const c = scrollElRef.current;
    if (!c) return;
    const suspend = () => {
      suspendUntilRef.current = performance.now() + 1800;
    };
    c.addEventListener("wheel", suspend, { passive: true });
    c.addEventListener("touchmove", suspend, { passive: true });
    return () => {
      c.removeEventListener("wheel", suspend);
      c.removeEventListener("touchmove", suspend);
    };
  }, []);

  // Start from the top if it had already finished. Shared by the play button
  // and by the chain, which calls it when the previous voice hands over.
  const start = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    const end = isFinite(a.duration) && a.duration > 0 ? a.duration : duration;
    if (a.ended || (end && a.currentTime >= end - 0.05)) a.currentTime = 0;
    a.play().catch(() => {});
  }, [duration]);

  const startRef = useRef(start);
  useEffect(() => {
    startRef.current = start;
  }, [start]);

  // Join the entry's chain — kept on primitives so a re-render never
  // re-registers, and `startRef` so the entry always gets the current player.
  const group = slot?.group;
  const order = slot?.order;
  useEffect(() => {
    if (!chain || group === undefined || order === undefined) return;
    return chain.register(
      { group, order },
      {
        play: () => startRef.current(),
        pause: () => audioRef.current?.pause(),
        prime: () => {
          const a = audioRef.current;
          if (a && a.preload !== "auto") a.preload = "auto";
        },
      },
    );
  }, [chain, group, order]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) start();
    else a.pause();
  };

  // Clicking any span jumps the voice there (event-delegated — one handler).
  const onTextClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-t]");
    if (!el) return;
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = parseFloat(el.dataset.t || "0");
    if (a.paused) a.play().catch(() => {});
    else reconcile(a.currentTime);
  };

  const seekBar = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = clamp01((e.clientX - rect.left) / rect.width);
    a.currentTime = ratio * duration;
    if (progressRef.current) progressRef.current.style.width = `${ratio * 100}%`;
    if (!a.paused) reconcile(a.currentTime);
  };

  return (
    <div
      ref={rootRef}
      className={`rw-root${isPlaying ? "" : " rw-fade"}`}
      style={{ marginTop: "clamp(6px, 0.6vw, 12px)" }}
    >
      <audio
        ref={audioRef}
        src={transcript.src}
        preload="metadata"
        onPlay={() => {
          setIsPlaying(true);
          if (chain && group !== undefined && order !== undefined)
            chain.claim({ group, order });
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (chain && group !== undefined && order !== undefined)
            chain.advance({ group, order });
        }}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (isFinite(d) && d > 0) setDuration(d);
        }}
        onSeeked={(e) => {
          if (isPlaying) return;
          const a = e.currentTarget;
          if (progressRef.current)
            progressRef.current.style.width = duration
              ? `${clamp01(a.currentTime / duration) * 100}%`
              : "0%";
          if (timeRef.current) timeRef.current.textContent = fmt(a.currentTime);
        }}
      />

      {/* ── The recited blocks — one span per character and per word-gap ──── */}
      <div onClick={onTextClick}>
        {blocks.map((block, bi) => {
          const segs = blockSegs[bi];
          if (!segs || segs.length === 0) return null;
          const Tag: ElementType = block.as ?? "p";
          // createElement (not <Tag/>) so a dynamic tag keeps normal HTML prop
          // typing instead of collapsing children/props to `never`.
          return createElement(
            Tag,
            {
              key: bi,
              lang: "tr",
              className: block.className,
              style: { margin: 0, ...block.style },
            },
            segs.map((seg) => (
              <span
                key={seg.gi}
                ref={(el) => {
                  spanEls.current[seg.gi] = el;
                }}
                className="rw-l"
                data-t={starts[seg.gi]}
                style={spanBaseStyle}
              >
                {seg.ch}
              </span>
            )),
          );
        })}
      </div>

      {/* ── Inline ink player — sits directly under the recited lines ─────── */}
      <div style={{ marginTop: "clamp(14px, 1.3vw, 22px)" }}>
        {transcript.title && (
          <div
            className="uppercase text-foreground/45 text-[7px] lg:text-[clamp(8px,0.5vw,12px)]"
            style={{
              letterSpacing: "0.22em",
              fontFamily: "var(--font-roboto)",
              marginBottom: "clamp(7px, 0.6vw, 11px)",
            }}
          >
            {transcript.title}
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
            style={{ border: "1px solid currentColor", background: "transparent" }}
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
            onPointerDown={seekBar}
            role="slider"
            aria-label="Ses konumu"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
          >
            <div
              className="relative w-full"
              style={{ height: 2, background: "rgba(150,150,150,0.25)" }}
            >
              <div
                ref={progressRef}
                className="absolute left-0 top-0 h-full"
                style={{ width: "0%", background: accent }}
              />
            </div>
          </div>

          <span
            className="flex-shrink-0 tabular-nums text-foreground/50 text-[8px] lg:text-[clamp(9px,0.6vw,13px)]"
            style={{ fontFamily: "var(--font-inter)", letterSpacing: "0.04em" }}
          >
            <span ref={timeRef}>0:00</span> / {fmt(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
