import { useEffect, useState, useRef } from "react";
import { usePopUpStore } from "../stores/usePopUpStore";
import { ORIGINAL_TEXTURE_TIMING } from "./useFoldAnimation";
import { useElevatedStore } from "../stores/useElevatedStore";
import { ELEVATE_TEXTURE_TIMING } from "./useElevateAnimation";

export function useDelayedVerseVisibility() {
  const groups = usePopUpStore((state) => state.popUpGroups);
  const middleHorizontalFolded = usePopUpStore(
    (state) => state.middleHorizontalFolded,
  );
  const activeVerseIds = useElevatedStore((state) => state.activeVerseIds);

  // Pop-up delayed state
  const [delayedGroupIsOpen, setDelayedGroupIsOpen] = useState<
    Record<string, boolean>
  >(() => {
    const init: Record<string, boolean> = {};
    groups.forEach((g) => (init[g.id] = g.isOpen));
    return init;
  });

  // Elevated delayed state
  const [delayedElevatedState, setDelayedElevatedState] = useState<
    Record<number, boolean>
  >(() => Object.fromEntries(activeVerseIds.map((id) => [id, true])));
  const [delayedMiddleHorizontalFolded, setDelayedMiddleHorizontalFolded] =
    useState(middleHorizontalFolded);

  // Refs for tracking timeouts so we can cancel specific ones without wiping others
  const groupTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const elevatedTimeoutsRef = useRef<Record<number, NodeJS.Timeout>>({});
  const middleHorizontalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for tracking previous states to detect actual changes
  const prevGroupsOpenRef = useRef<Record<string, boolean>>(
    Object.fromEntries(groups.map((g) => [g.id, g.isOpen])),
  );
  const prevActiveSetRef = useRef<Set<number>>(new Set(activeVerseIds));
  const prevMiddleHorizontalRef = useRef(middleHorizontalFolded);

  // Sync Pop-ups
  useEffect(() => {
    groups.forEach((g) => {
      // Only process if the isOpen state actually changed
      if (prevGroupsOpenRef.current[g.id] !== g.isOpen) {
        prevGroupsOpenRef.current[g.id] = g.isOpen;

        if (groupTimeoutsRef.current[g.id]) {
          clearTimeout(groupTimeoutsRef.current[g.id]);
        }

        const delay = g.isOpen
          ? ORIGINAL_TEXTURE_TIMING.hideDelay
          : ORIGINAL_TEXTURE_TIMING.showDelay;

        groupTimeoutsRef.current[g.id] = setTimeout(() => {
          setDelayedGroupIsOpen((prev) => {
            if (prev[g.id] === g.isOpen) return prev;
            return { ...prev, [g.id]: g.isOpen };
          });
        }, delay);
      }
    });
  }, [groups]);

  // Sync Elevated
  useEffect(() => {
    const currentSet = new Set(activeVerseIds);
    const prevSet = prevActiveSetRef.current;

    // Newly elevated verses should hide immediately (or with configured delay).
    currentSet.forEach((id) => {
      if (prevSet.has(id)) return;

      if (elevatedTimeoutsRef.current[id]) {
        clearTimeout(elevatedTimeoutsRef.current[id]);
      }

      elevatedTimeoutsRef.current[id] = setTimeout(() => {
        setDelayedElevatedState((prev) => ({ ...prev, [id]: true }));
      }, ELEVATE_TEXTURE_TIMING.hideDelay);
    });

    // Verses leaving elevated mode should reappear with the release delay.
    prevSet.forEach((id) => {
      if (currentSet.has(id)) return;

      if (elevatedTimeoutsRef.current[id]) {
        clearTimeout(elevatedTimeoutsRef.current[id]);
      }

      elevatedTimeoutsRef.current[id] = setTimeout(() => {
        setDelayedElevatedState((prev) => ({ ...prev, [id]: false }));
      }, ELEVATE_TEXTURE_TIMING.showDelay);
    });

    prevActiveSetRef.current = currentSet;
  }, [activeVerseIds]);

  // Sync middle horizontal fold visibility with the same popup timings.
  useEffect(() => {
    if (prevMiddleHorizontalRef.current === middleHorizontalFolded) return;
    prevMiddleHorizontalRef.current = middleHorizontalFolded;

    if (middleHorizontalTimeoutRef.current) {
      clearTimeout(middleHorizontalTimeoutRef.current);
    }

    const delay = middleHorizontalFolded
      ? ORIGINAL_TEXTURE_TIMING.hideDelay
      : ORIGINAL_TEXTURE_TIMING.showDelay;

    middleHorizontalTimeoutRef.current = setTimeout(() => {
      setDelayedMiddleHorizontalFolded((prev) =>
        prev === middleHorizontalFolded ? prev : middleHorizontalFolded,
      );
    }, delay);
  }, [middleHorizontalFolded]);

  // Global unmount cleanup
  useEffect(() => {
    const groupTimeouts = groupTimeoutsRef.current;
    const elevatedTimeouts = elevatedTimeoutsRef.current;

    return () => {
      Object.values(groupTimeouts).forEach(clearTimeout);
      Object.values(elevatedTimeouts).forEach(clearTimeout);
      if (middleHorizontalTimeoutRef.current) {
        clearTimeout(middleHorizontalTimeoutRef.current);
      }
    };
  }, []);

  const isVerseHidden = (verseId: number) => {
    // Hide paper verse as soon as store says elevated (no one-frame wait for
    // delayedElevatedState). Delayed map still drives the post-dismiss window.
    if (activeVerseIds.includes(verseId)) return true;
    if (delayedElevatedState[verseId]) return true;

    const isMiddleVerse =
      verseId === 11 || verseId === 12 || verseId === 13 || verseId === 14;
    if (
      isMiddleVerse &&
      ((delayedMiddleHorizontalFolded === "left" &&
        (verseId === 12 || verseId === 14)) ||
        (delayedMiddleHorizontalFolded === "right" &&
          (verseId === 11 || verseId === 13)))
    ) {
      return true;
    }

    const group = groups.find((g) => g.verseIds.includes(verseId));
    if (group) {
      return delayedGroupIsOpen[group.id] ?? group.isOpen;
    }

    return false;
  };

  return isVerseHidden;
}
