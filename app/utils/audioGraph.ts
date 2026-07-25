"use client";

// ---------------------------------------------------------------------------
// The page's one AudioContext, and the small amount of routing that goes
// through it.
//
// Two things want a Web Audio graph — the background-music bed and the spoken
// recitations — and a browser will only give a page a handful of contexts, so
// they share this one rather than opening their own.
// ---------------------------------------------------------------------------

let ctx: AudioContext | null = null;
let unavailable = false;

/**
 * The shared context, created on first ask. Returns null where Web Audio
 * isn't available — every caller treats that as "carry on without me" rather
 * than as a failure, so audio still plays, just unshaped.
 */
export function getAudioContext(): AudioContext | null {
  if (ctx || unavailable || typeof window === "undefined") return ctx;
  try {
    const Ctor: typeof AudioContext =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new Ctor();
  } catch {
    unavailable = true;
  }
  return ctx;
}

/**
 * Open the context on a real user gesture, so it is already running by the
 * time anything wants to make a sound. Without this the first play would have
 * to wait on an async `resume()`, and whatever it routed through the graph
 * would be silent for those few milliseconds.
 */
export function primeAudioContext(): void {
  const c = getAudioContext();
  if (c && c.state === "suspended") void c.resume().catch(() => {});
}

/**
 * Route `el` through a gain node at `gain`, making it louder (or quieter)
 * than an <audio> element can be on its own — `el.volume` is capped at 1, and
 * a gain node is the only way past that.
 *
 * Routing an element into the graph takes its sound OUT of the normal output
 * path, so this only ever attaches once the context is actually RUNNING;
 * hooking up a suspended context would mute the element instead of boosting
 * it. If the context isn't ready yet we wait for it, and until then the
 * element simply plays at its natural level.
 *
 * Returns a cleanup for the pending-attach listener. The routing itself lives
 * as long as the element does — an element can only be connected once, ever.
 */
export function amplify(el: HTMLAudioElement, gain: number): () => void {
  const c = getAudioContext();
  if (!c) return () => {};

  let attached = false;
  const attach = () => {
    if (attached || c.state !== "running") return;
    attached = true;
    c.removeEventListener("statechange", attach);
    try {
      const g = c.createGain();
      g.gain.value = gain;
      c.createMediaElementSource(el).connect(g);
      g.connect(c.destination);
    } catch {
      // Already routed, or the browser refused — either way the element keeps
      // playing on its own path. Nothing to undo.
    }
  };

  attach();
  if (!attached) {
    if (c.state === "suspended") void c.resume().catch(() => {});
    c.addEventListener("statechange", attach);
  }
  return () => c.removeEventListener("statechange", attach);
}
