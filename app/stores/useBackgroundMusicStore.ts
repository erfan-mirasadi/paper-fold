"use client";

import { create } from "zustand";

/**
 * A thin, READ-ONLY-ish mirror of the background-music engine, so React can
 * render controls for something that lives outside React.
 *
 * The engine (app/utils/backgroundMusic.ts) is the single source of truth —
 * it owns the audio elements, the fades and the playlist, and it pushes state
 * in here. Nothing writes back the other way: the toggle button calls
 * `backgroundMusic.setMuted()`, the engine then updates this store. Keeping
 * the flow one-directional is what stops the two from arguing.
 */
interface BackgroundMusicState {
  /** Reader's preference, remembered across visits. */
  muted: boolean;
  /**
   * True while a voice is speaking or the bed is still fading out — i.e.
   * whenever the music control is worth showing at all.
   */
  present: boolean;
  /** What's on the bed right now, for an optional "now playing" line. */
  nowPlaying: { artist: string; title: string } | null;
}

export const useBackgroundMusicStore = create<BackgroundMusicState>(() => ({
  muted: false,
  present: false,
  nowPlaying: null,
}));
