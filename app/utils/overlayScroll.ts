// ---------------------------------------------------------------------------
// "Not your wheel."
//
// Overlays that scroll themselves — the tafsir panel, the script sidebar —
// mark their scroller with `data-lenis-prevent`, the same flag that keeps
// Lenis off it. But the page's own scroll systems (the fold story's intro
// barrier in ScrollManager, the pop-up hover controller) listen on `window` in
// the CAPTURE phase: they see every wheel and touch before the overlay does,
// and would happily swallow one that was meant for the panel — leaving the
// reader pushing against the page's barrier while the tafsir sits still.
//
// This is the one question those handlers ask first: did the gesture start
// inside an overlay that scrolls itself? If so it isn't theirs, and reading
// the panel stays completely independent of where the page happens to be.
// ---------------------------------------------------------------------------

/** Whether an event's target sits inside an overlay that scrolls itself. */
export function isOverSelfScrollingOverlay(target: EventTarget | null): boolean {
  const el =
    target instanceof Element
      ? target
      : target instanceof Node
        ? target.parentElement
        : null;
  return !!el?.closest("[data-lenis-prevent]");
}
