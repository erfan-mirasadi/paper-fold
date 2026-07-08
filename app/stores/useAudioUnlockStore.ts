"use client";

/**
 * Tracks whether the user has interacted with the app at all, anywhere,
 * since the tab was opened. Browsers only allow audio.play() to succeed
 * after a real user gesture, but that gesture doesn't need to happen on
 * the page that plays the sound — it only needs to happen once per tab.
 * Surah pages mount/unmount as the user navigates, so any gate that lived
 * in component-local state (e.g. a useRef) reset on every visit and forced
 * a fresh click per surah. Keeping the flag here instead means it survives
 * client-side navigation for the lifetime of the tab.
 */

import { create } from "zustand";

interface AudioUnlockState {
  hasInteracted: boolean;
  markInteracted: () => void;
}

export const useAudioUnlockStore = create<AudioUnlockState>((set, get) => ({
  hasInteracted: false,
  markInteracted: () => {
    if (get().hasInteracted) return;
    set({ hasInteracted: true });
  },
}));

let listenersAttached = false;

/**
 * Attaches the one-time gesture listeners that unlock audio for the rest of
 * the tab's session. Idempotent and safe to call from multiple components —
 * only the first call actually attaches listeners.
 */
export function attachGlobalAudioUnlockListeners(): void {
  if (listenersAttached || typeof window === "undefined") return;
  listenersAttached = true;

  const onInteract = () => {
    useAudioUnlockStore.getState().markInteracted();
  };
  window.addEventListener("pointerdown", onInteract, { once: true });
  window.addEventListener("keydown", onInteract, { once: true });
  window.addEventListener("touchstart", onInteract, { once: true });
}
