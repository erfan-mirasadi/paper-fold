"use client";

/**
 * useAdaptiveFrameloop — stop redrawing a page nobody is touching.
 *
 * THE PROBLEM. The canvas runs `frameloop="always"`, so three redraws the whole
 * scene sixty times a second forever, whether or not a single thing has moved.
 * A reader who has stopped scrolling and is simply reading the page is paying
 * full frame rate for a still picture — which on a phone is heat and battery and
 * nothing else.
 *
 * WHY NOT JUST `frameloop="demand"`. Because that is an all-or-nothing switch,
 * and this scene is not ready for it. Under `demand`, a frame is drawn only when
 * something calls `invalidate()` — so every `useFrame` that drives an animation
 * has to announce itself, and any that does not simply STOPS. Not slows: stops,
 * mid-motion, until something else happens to request a frame. There are
 * twenty-one `useFrame` callbacks across fifteen files here (camera flights, the
 * page-turn choreography, the fold, the texture ladder, several trackers), and
 * getting one of them wrong means a frozen animation that only an unrelated
 * mouse move un-freezes. That is a bad trade for a battery saving.
 *
 * WHAT THIS DOES INSTEAD. It keeps `always` as the normal state and drops to
 * `demand` only after a conservative stretch of COMPLETE quiet — no input, no
 * store change. Everything in this scene that animates is started either by an
 * input or by a store write, and every one of those animations settles well
 * inside the idle window (they all ease to a target and stop; none of them
 * loops forever — checked). So by the time the switch happens there is nothing
 * left in flight to freeze.
 *
 * And the failure mode is the mild one. If some future animation does start
 * without touching a store, the worst case is that it waits for the next input
 * rather than running at sixty frames a second — a delayed frame, not a dead
 * scene. `@react-spring/three` is safe regardless: it calls `invalidate()`
 * itself (verified in its source), so every spring in the app keeps animating
 * normally even while the loop is on demand.
 */

import { useEffect, useRef, useState } from "react";

import { useFoldStore } from "../_components/canvas/orchestrator/ScrollManager";
import { useCameraViewStore } from "../stores/useCameraViewStore";
import { useElevatedStore } from "../stores/useElevatedStore";
import { usePaperStore } from "../stores/usePaperStore";
import { usePopUpStore } from "../stores/usePopUpStore";
import { useStoryStore } from "../stores/useStoryStore";
import { useDragState } from "../utils/dragEngine";

/**
 * How long everything has to stay quiet before the loop is allowed to idle.
 *
 * SIZED AGAINST THE REAL CONSTANTS, not a guess. The longest things that keep
 * moving after the input that started them are:
 *
 *   • a camera flight — `flightDuration` in `cameraFlight.ts` clamps to
 *     `MAX_SECONDS = 4`;
 *   • the page-turn chain — `FLATTEN_DURATION_S` 0.9 then `FLIP_DURATION_S` 3.6,
 *     about 4.5 s end to end;
 *   • OrbitControls damping, which coasts for roughly a second after the
 *     pointer lifts.
 *
 * A four-second window would have tied the first two, and a tie here means the
 * loop stops in the last moments of a page turn. Eight gives both of them
 * comfortable clearance. It costs almost nothing: the case this exists for is
 * someone READING, who sits still for minutes, not seconds — so the saving is
 * the same either way, and the margin is free.
 *
 * If an animation longer than this is ever added, it must either write to one
 * of the subscribed stores as it runs or call `invalidate()` itself.
 */
const IDLE_BEFORE_DEMAND_MS = 8000;

/**
 * Floor on how often the idle countdown is restarted. `pointermove` fires far
 * faster than it is worth clearing and re-arming a timer for, and the precision
 * lost is irrelevant against a four-second window.
 */
const RESTART_THROTTLE_MS = 250;

export type FrameloopMode = "always" | "demand";

export function useAdaptiveFrameloop(enabled = true): FrameloopMode {
  const [mode, setMode] = useState<FrameloopMode>("always");
  // The live value, so the wake path can decide whether a re-render is even
  // needed. Without this, every pointermove would set state on a component that
  // owns the whole overlay tree.
  const modeRef = useRef<FrameloopMode>("always");

  useEffect(() => {
    if (!enabled) return;

    let idleTimer: number | null = null;
    let lastRestart = 0;

    const goIdle = () => {
      idleTimer = null;
      modeRef.current = "demand";
      setMode("demand");
    };

    const wake = () => {
      if (modeRef.current !== "always") {
        modeRef.current = "always";
        setMode("always");
      }

      const now = performance.now();
      if (idleTimer !== null && now - lastRestart < RESTART_THROTTLE_MS) return;
      lastRestart = now;

      if (idleTimer !== null) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(goIdle, IDLE_BEFORE_DEMAND_MS);
    };

    // Anything the reader does counts, including the events that drive the
    // scroll story. Passive + capture so this can never delay or swallow them.
    const listenerOptions = { passive: true, capture: true } as const;
    const inputEvents = [
      "pointerdown",
      "pointermove",
      "pointerup",
      "wheel",
      "touchstart",
      "touchmove",
      "touchend",
      "keydown",
      "scroll",
      "resize",
    ] as const;
    inputEvents.forEach((event) =>
      window.addEventListener(event, wake, listenerOptions),
    );

    // Every store that can start something moving in the 3D scene. A write to
    // any of them means an animation is about to run, so the loop has to be
    // awake to run it.
    const unsubscribes = [
      useFoldStore.subscribe(wake),
      useElevatedStore.subscribe(wake),
      usePopUpStore.subscribe(wake),
      usePaperStore.subscribe(wake),
      useStoryStore.subscribe(wake),
      useCameraViewStore.subscribe(wake),
      useDragState.subscribe(wake),
    ];

    // A backgrounded tab has nothing to show anyone; let it idle at once rather
    // than waiting out the window.
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (idleTimer !== null) {
          window.clearTimeout(idleTimer);
          idleTimer = null;
        }
        goIdle();
      } else {
        wake();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    wake();

    return () => {
      inputEvents.forEach((event) =>
        window.removeEventListener(event, wake, listenerOptions),
      );
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      document.removeEventListener("visibilitychange", onVisibility);
      if (idleTimer !== null) window.clearTimeout(idleTimer);
    };
  }, [enabled]);

  return enabled ? mode : "always";
}
