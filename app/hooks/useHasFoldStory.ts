"use client";

import { hasFoldMotion } from "../_components/canvas/3d-scene/FoldStory";
import { useStoryStore } from "../stores/useStoryStore";

/**
 * True when the active paper's fold story actually moves — see `hasFoldMotion`.
 *
 * A boolean selector, so the fold UI only re-renders when the PAPER changes,
 * never on a scroll frame. Deliberately not part of `useSurahLayoutRuntime`:
 * the buttons that need this answer have no use for the layout math that hook
 * recomputes.
 */
export const useHasFoldStory = () =>
  useStoryStore((s) => hasFoldMotion(s.activeConfig.animations.foldSteps));
