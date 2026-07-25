"use client";

import {
  BACKGROUND_MUSIC,
  type BackgroundTrack,
} from "@/app/data/backgroundMusic";
import { useBackgroundMusicStore } from "@/app/stores/useBackgroundMusicStore";
import { getAudioContext } from "@/app/utils/audioGraph";

// ---------------------------------------------------------------------------
// The background-music bed — one continuous, quiet piano playlist running
// UNDER the spoken tafsir, for as long as anything is being read aloud.
//
// It is a single module-level engine rather than a component, because the bed
// must outlive every player that summons it: recitations mount and unmount as
// the panel scrolls and the fold story advances, the chain hands the voice
// from one entry to the next, and through all of it the music has to keep its
// place. A React tree can't hold that; a singleton can.
//
// What it guarantees
//   • A voice starting anywhere raises the bed; the LAST voice going quiet
//     lowers it — and only after a grace beat longer than the chain's own
//     hand-over pause, so autoplaying through a page never dips the music.
//   • Stopping never rewinds. The bed is paused, not reset, so the next voice
//     picks the music up exactly where the previous one left it.
//   • Tracks join with an equal-power CROSSFADE, and the incoming file starts
//     loading well before it is needed — the bed is never interrupted by the
//     network, and never sits silent waiting for a download.
//
// How the fades are driven
//   Through a small Web Audio graph, NOT a requestAnimationFrame loop. Two
//   things fall out of that, both of which matter here:
//     · a backgrounded tab stops serving animation frames while its audio
//       keeps playing — a frame-driven fade would freeze part-way and strand
//       the bed silent — whereas ramps scheduled on an AudioParam run on the
//       audio thread and finish regardless;
//     · this app spends its frame budget on WebGL, and the music now costs it
//       nothing at all: no per-frame work, ever.
//   The elements stay <audio> elements feeding MediaElementSource nodes, so
//   the tracks STREAM. Nothing is decoded into memory up front.
//
// What it costs
//   Exactly one audio stream, plus a second one for the few seconds around a
//   track change. It is completely independent of how many recitations a page
//   carries: ten voices cost the same as one, because they all share this.
// ---------------------------------------------------------------------------

/**
 * Bed level. Low on purpose — the voice is the text, this is the room. Pairs
 * with the lift the recitations get in SyncedRecitation (VOICE_GAIN): between
 * the two, the voice sits about 6 dB further above the music than it did at
 * the levels this started from.
 */
const BED_VOLUME = 0.095;
/** Seconds for the bed to rise once a voice starts. */
const WAKE_FADE_S = 2.4;
/** Seconds for the bed to settle once the reading stops. */
const SLEEP_FADE_S = 1.8;
/** Seconds to fade when the reader mutes / unmutes — quicker, it's a command. */
const MUTE_FADE_S = 0.45;
/**
 * How long the bed holds after the last voice goes quiet. Must comfortably
 * clear RecitationChain's HANDOVER_MS (500) so autoplay reads through without
 * the music so much as flickering; the slack also covers a reader who pauses
 * to re-read a line and presses play again.
 */
const GRACE_MS = 2000;
/** Length of the overlap between one track and the next. */
const CROSSFADE_S = 5;
/**
 * How far ahead of the crossfade the next track starts downloading. The lead
 * over CROSSFADE_S is the buffer the network gets to work in.
 */
const PRELOAD_LEAD_S = 22;

const STORAGE_KEY = "qp.bg-music.muted";

/** Points in a scheduled curve. Plenty for a fade; costs nothing. */
const CURVE_STEPS = 48;

// The curves below are INTERPOLANTS: each maps 0→1 across the ramp and is fed
// to `from + (target - from) * curve(x)`. So the shape a deck's gain actually
// traces is the curve applied between its own endpoints — which is why the
// falling half of a crossfade is `1 - cos` here and not `cos`.

/** Gentle in/out for the whole bed, so it arrives and leaves without an edge. */
const smoothstep = (x: number) => x * x * (3 - 2 * x);
/** Rising half of a crossfade — traces sin(x·π/2) from 0 up to 1. */
const crossIn = (x: number) => Math.sin(x * Math.PI * 0.5);
/** Falling half — traces cos(x·π/2) from 1 down to 0, the equal-power partner
 *  of `crossIn`: their squares sum to 1, so the bed's loudness stays flat. */
const crossOut = (x: number) => 1 - Math.cos(x * Math.PI * 0.5);

/**
 * Freeze a param at whatever value its automation has reached, so a new ramp
 * can start cleanly from there — this is what lets a fade-out reverse into a
 * fade-in mid-flight when a voice comes back.
 */
function hold(p: AudioParam, t: number): number {
  const v = p.value;
  if (typeof p.cancelAndHoldAtTime === "function") p.cancelAndHoldAtTime(t);
  else {
    p.cancelScheduledValues(t);
    p.setValueAtTime(v, t);
  }
  return v;
}

/**
 * Ramp `p` to `target` along `curve`. The duration is scaled by the distance
 * actually travelled, so interrupting a fade half-way doesn't leave the
 * correction crawling. Returns the seconds it will take.
 */
function rampTo(
  ctx: AudioContext,
  p: AudioParam,
  target: number,
  seconds: number,
  curve: (x: number) => number,
): number {
  const now = ctx.currentTime;
  const from = hold(p, now);
  const distance = Math.abs(target - from);
  if (distance < 1e-4) {
    p.setValueAtTime(target, now);
    return 0;
  }
  const dur = Math.max(seconds * distance, 0.02);
  const values = new Float32Array(CURVE_STEPS);
  for (let i = 0; i < CURVE_STEPS; i++)
    values[i] = from + (target - from) * curve(i / (CURVE_STEPS - 1));
  p.setValueCurveAtTime(values, now, dur);
  return dur;
}

/** One of the two audio elements the engine alternates between. */
interface Deck {
  el: HTMLAudioElement;
  /** Crossfade envelope for this deck alone. */
  gain: GainNode;
  /** Index into `order`, or -1 when the deck holds nothing. */
  slot: number;
  /** True while this deck is meant to be sounding (even if paused by a sleep). */
  live: boolean;
}

class BackgroundMusicEngine {
  /** Every recitation currently speaking. The bed is up iff this isn't empty. */
  private voices = new Set<object>();
  private decks: Deck[] = [];
  private active = 0;
  /** Playlist order — a shuffled view of BACKGROUND_MUSIC, fixed per session. */
  private order: number[] = [];
  /** Position in `order` of whatever the active deck holds. */
  private cursor = 0;

  private ctx: AudioContext | null = null;
  /** Wake / sleep / mute envelope, 0..1, shared by both decks. */
  private session: GainNode | null = null;
  private muted = false;
  /** Where the session envelope is currently headed. */
  private sessionTarget = 0;

  private grace: number | null = null;
  private sleepTimer: number | null = null;
  private crossTimer: number | null = null;
  private started = false;
  private ok = true;

  // ── Lifecycle ───────────────────────────────────────────────────────────

  /**
   * Build the graph on first real use. Nothing is fetched here — the elements
   * are created with preload="none" and stay empty until a track is loaded
   * into them, so merely importing this module costs nothing.
   */
  private init(): void {
    if (this.started || typeof window === "undefined") return;
    this.started = true;

    this.muted = readMutedPreference();
    useBackgroundMusicStore.setState({ muted: this.muted });
    this.order = shuffled(BACKGROUND_MUSIC.length);

    try {
      const ctx = getAudioContext();
      if (!ctx) throw new Error("no audio context");

      // deck gain (crossfade) → session gain (wake/sleep/mute) → bed level
      const bed = ctx.createGain();
      bed.gain.value = BED_VOLUME;
      bed.connect(ctx.destination);

      const session = ctx.createGain();
      session.gain.value = 0;
      session.connect(bed);

      this.decks = [0, 1].map((i) => {
        const el = new Audio();
        el.preload = "none";
        el.addEventListener("timeupdate", () => this.onTimeUpdate(i));
        el.addEventListener("ended", () => this.onEnded(i));
        el.addEventListener("error", () => this.onError(i));

        const gain = ctx.createGain();
        gain.gain.value = 0;
        // One source node per element, made once and kept — an element can
        // only ever be routed into the graph a single time.
        ctx.createMediaElementSource(el).connect(gain);
        gain.connect(session);
        return { el, gain, slot: -1, live: false };
      });

      this.ctx = ctx;
      this.session = session;
    } catch {
      // No Web Audio: the bed is a nicety, not a feature to break the panel
      // over. Stand down entirely rather than half-work.
      this.ok = false;
    }
  }

  // ── The two calls a recitation makes ────────────────────────────────────

  /**
   * "This voice is speaking." Raises the bed (or holds it, if it's already up)
   * and cancels any pending fade-out — which is what makes a hand-over between
   * two recitations completely inaudible on the music.
   */
  voiceStarted(id: object): void {
    this.init();
    if (!this.ok) return;
    this.voices.add(id);
    this.evaluate();
  }

  /** "This voice stopped." The bed only lowers once every voice has stopped. */
  voiceStopped(id: object): void {
    if (!this.voices.delete(id) || !this.ok) return;
    this.evaluate();
  }

  // ── Reader controls ─────────────────────────────────────────────────────

  setMuted(muted: boolean): void {
    this.init();
    if (this.muted === muted) return;
    this.muted = muted;
    useBackgroundMusicStore.setState({ muted });
    writeMutedPreference(muted);
    if (this.ok) this.evaluate(MUTE_FADE_S);
  }

  toggleMuted(): void {
    this.setMuted(!this.muted);
  }

  // ── State machine ───────────────────────────────────────────────────────

  /**
   * Decide where the bed should be heading. Rising is immediate; falling waits
   * out the grace beat, so the gap between two chained voices never reaches
   * the music. `fadeS` overrides the timing for a deliberate mute/unmute.
   */
  private evaluate(fadeS?: number): void {
    this.publishPresent();

    const wanted = this.voices.size > 0 && !this.muted;

    if (wanted) {
      this.clearGrace();
      this.clearSleep();
      this.resume();
      this.sessionTarget = 1;
      rampTo(
        this.ctx!,
        this.session!.gain,
        1,
        fadeS ?? WAKE_FADE_S,
        smoothstep,
      );
      return;
    }

    // Muting is a command — answer it now. A voice merely going quiet gets
    // the grace beat first, in case the chain is only handing over.
    if (this.muted || this.voices.size === 0) {
      const immediate = this.muted;
      if (immediate) {
        this.clearGrace();
        this.fadeOutBed(fadeS ?? MUTE_FADE_S);
        return;
      }
      if (this.grace !== null || this.sessionTarget === 0) return;
      this.grace = window.setTimeout(() => {
        this.grace = null;
        if (this.voices.size === 0) this.fadeOutBed(SLEEP_FADE_S);
      }, GRACE_MS);
    }
  }

  /**
   * Lower the bed and, once it has actually reached silence, pause the decks —
   * never rewinding them, so the next voice resumes the music mid-phrase
   * exactly where this one left it.
   */
  private fadeOutBed(fadeS: number): void {
    if (!this.ctx || !this.session) return;
    this.sessionTarget = 0;
    const dur = rampTo(this.ctx, this.session.gain, 0, fadeS, smoothstep);
    this.clearSleep();
    this.sleepTimer = window.setTimeout(
      () => {
        this.sleepTimer = null;
        if (this.sessionTarget !== 0) return;
        for (const d of this.decks) if (!d.el.paused) d.el.pause();
        this.publishPresent();
      },
      dur * 1000 + 80,
    );
  }

  private publishPresent(): void {
    const present =
      this.voices.size > 0 || (this.sessionTarget === 1 && this.ok);
    if (useBackgroundMusicStore.getState().present !== present)
      useBackgroundMusicStore.setState({ present });
  }

  private clearGrace(): void {
    if (this.grace === null) return;
    window.clearTimeout(this.grace);
    this.grace = null;
  }

  private clearSleep(): void {
    if (this.sleepTimer === null) return;
    window.clearTimeout(this.sleepTimer);
    this.sleepTimer = null;
  }

  // ── Playback ────────────────────────────────────────────────────────────

  /** Put the decks back in motion, loading the first track if we've never run. */
  private resume(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});

    const deck = this.decks[this.active];
    if (deck.slot < 0) {
      this.load(deck, this.cursor);
      deck.gain.gain.setValueAtTime(1, ctx.currentTime);
      deck.live = true;
      this.publishNowPlaying();
    }
    for (const d of this.decks) {
      if (d.live && d.el.paused) void d.el.play().catch(() => {});
    }
  }

  /**
   * Point a deck at playlist position `slot` and let it start buffering.
   * Assigning `src` rewinds the element on its own, so the deck always comes
   * back at 0 without us touching `currentTime` before it's seekable.
   */
  private load(deck: Deck, slot: number): void {
    deck.slot = slot;
    deck.el.preload = "auto";
    deck.el.src = this.trackAt(slot).src;
    deck.el.load();
  }

  /** Hand a deck back: stop it and release the media resource it was holding. */
  private retire(deck: Deck): void {
    if (deck.slot < 0 && !deck.live) return;
    deck.el.pause();
    deck.live = false;
    deck.slot = -1;
    if (this.ctx) hold(deck.gain.gain, this.ctx.currentTime);
    deck.gain.gain.value = 0;
    deck.el.removeAttribute("src");
    deck.el.load();
  }

  private trackAt(slot: number): BackgroundTrack {
    return BACKGROUND_MUSIC[this.order[slot % this.order.length]];
  }

  private get standby(): Deck {
    return this.decks[1 - this.active];
  }

  /**
   * The active track's length — the file's own metadata when it has arrived,
   * otherwise the manifest's hint, so scheduling works from the first second.
   */
  private durationOf(deck: Deck): number {
    const d = deck.el.duration;
    if (Number.isFinite(d) && d > 0) return d;
    return deck.slot >= 0 ? this.trackAt(deck.slot).durationS : 0;
  }

  /**
   * The whole track-change schedule, driven off the media's own clock (a few
   * times a second — far cheaper than polling, it keeps running in a
   * backgrounded tab, and it stops when the music does).
   */
  private onTimeUpdate(i: number): void {
    if (i !== this.active || this.crossTimer !== null) return;
    const deck = this.decks[i];
    const total = this.durationOf(deck);
    if (!total) return;
    const remaining = total - deck.el.currentTime;

    if (remaining <= PRELOAD_LEAD_S && this.standby.slot < 0) {
      this.load(this.standby, this.cursor + 1);
    }
    if (remaining <= CROSSFADE_S) this.beginCrossfade();
  }

  /**
   * Safety net for the case the crossfade never got its chance — a track
   * shorter than its hint, a stalled clock. Cut straight to the next one
   * rather than leaving the bed silent.
   */
  private onEnded(i: number): void {
    if (i !== this.active) {
      this.retire(this.decks[i]); // the outgoing side of a crossfade, done
      return;
    }
    this.beginCrossfade(true);
  }

  /** A track that won't load is skipped rather than allowed to stall the bed. */
  private onError(i: number): void {
    const deck = this.decks[i];
    if (deck.slot < 0) return;
    if (i !== this.active) {
      this.retire(deck); // just a pre-load that failed; it'll be retried later
      return;
    }
    this.cursor += 1;
    this.retire(deck);
    if (this.sessionTarget === 1) this.resume();
  }

  /**
   * Overlap the next track with the current one on an equal-power curve, so
   * the bed's loudness stays flat straight through the join. `immediate`
   * collapses it to a short fade for the ended-without-warning case.
   */
  private beginCrossfade(immediate = false): void {
    const ctx = this.ctx;
    if (!ctx || this.crossTimer !== null) return;
    const outgoing = this.decks[this.active];
    const incoming = this.standby;

    if (incoming.slot !== this.cursor + 1) {
      if (incoming.slot >= 0) this.retire(incoming);
      this.load(incoming, this.cursor + 1);
    }

    this.cursor += 1;
    this.active = 1 - this.active;

    const seconds = immediate ? 0.6 : CROSSFADE_S;
    incoming.gain.gain.setValueAtTime(0, ctx.currentTime);
    incoming.live = true;
    void incoming.el.play().catch(() => {});
    rampTo(ctx, incoming.gain.gain, 1, seconds, crossIn);
    rampTo(ctx, outgoing.gain.gain, 0, seconds, crossOut);

    this.crossTimer = window.setTimeout(
      () => {
        this.crossTimer = null;
        this.retire(outgoing);
      },
      seconds * 1000 + 120,
    );

    this.publishNowPlaying();
  }

  private publishNowPlaying(): void {
    const deck = this.decks[this.active];
    if (deck.slot < 0) return;
    const { artist, title } = this.trackAt(deck.slot);
    useBackgroundMusicStore.setState({ nowPlaying: { artist, title } });
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Fisher–Yates over indices, so the bed doesn't open on the same piece twice. */
function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function readMutedPreference(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeMutedPreference(muted: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  } catch {
    /* private mode — the preference just won't outlive the tab */
  }
}

/**
 * The one bed for the whole app. Recitations call `voiceStarted` /
 * `voiceStopped`; the music control calls `setMuted` / `toggleMuted`.
 */
export const backgroundMusic = new BackgroundMusicEngine();
