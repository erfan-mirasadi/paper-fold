"use client";

import { useEffect } from "react";
import { attachGlobalAudioUnlockListeners } from "../../stores/useAudioUnlockStore";

/**
 * Mounted once at the app root so the audio-unlock gesture listeners are
 * live from the very first paint (home page included), not just once a
 * surah page happens to mount.
 */
export default function AudioUnlockInitializer() {
  useEffect(() => {
    attachGlobalAudioUnlockListeners();
  }, []);

  return null;
}
