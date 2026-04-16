import { useEffect, useState, useRef } from "react";
import { usePopUpStore } from "../features/pop-up-verses/ui/usePopUpStore";
import { ORIGINAL_TEXTURE_TIMING } from "../features/pop-up-verses/useFoldAnimation";
import { useElevatedStore } from "../features/elevated-verses/useElevatedStore";
import { ELEVATE_TEXTURE_TIMING } from "../features/elevated-verses/useElevateAnimation";

export function useDelayedVerseVisibility() {
  const groups = usePopUpStore((state) => state.popUpGroups);
  const activeVerseId = useElevatedStore((state) => state.activeVerseId);

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
  >(activeVerseId !== null ? { [activeVerseId]: true } : {});

  // Refs for tracking timeouts so we can cancel specific ones without wiping others
  const groupTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const elevatedTimeoutsRef = useRef<Record<number, NodeJS.Timeout>>({});

  // Refs for tracking previous states to detect actual changes
  const prevGroupsOpenRef = useRef<Record<string, boolean>>(
    Object.fromEntries(groups.map((g) => [g.id, g.isOpen])),
  );
  const prevActiveRef = useRef<number | null>(activeVerseId);

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
    const currentActive = activeVerseId;
    const prevActive = prevActiveRef.current;

    // 1. Handle newly active verse (hide it)
    if (currentActive !== null && currentActive !== prevActive) {
      if (elevatedTimeoutsRef.current[currentActive]) {
        clearTimeout(elevatedTimeoutsRef.current[currentActive]);
      }

      elevatedTimeoutsRef.current[currentActive] = setTimeout(() => {
        setDelayedElevatedState((prev) => ({ ...prev, [currentActive]: true }));
      }, ELEVATE_TEXTURE_TIMING.hideDelay);
    }

    // 2. Handle previously active verse (show it)
    if (prevActive !== null && prevActive !== currentActive) {
      if (elevatedTimeoutsRef.current[prevActive]) {
        clearTimeout(elevatedTimeoutsRef.current[prevActive]);
      }

      const targetVerseToDismiss = prevActive; // bind for timeout closure

      elevatedTimeoutsRef.current[targetVerseToDismiss] = setTimeout(() => {
        setDelayedElevatedState((prev) => ({
          ...prev,
          [targetVerseToDismiss]: false,
        }));
      }, ELEVATE_TEXTURE_TIMING.showDelay);
    }

    prevActiveRef.current = currentActive;
  }, [activeVerseId]);

  // Global unmount cleanup
  useEffect(() => {
    const groupTimeouts = groupTimeoutsRef.current;
    const elevatedTimeouts = elevatedTimeoutsRef.current;

    return () => {
      Object.values(groupTimeouts).forEach(clearTimeout);
      Object.values(elevatedTimeouts).forEach(clearTimeout);
    };
  }, []);

  const isVerseHidden = (verseId: number) => {
    const isElevated = delayedElevatedState[verseId] ?? false;
    if (isElevated) return true;

    const group = groups.find((g) => g.verseIds.includes(verseId));
    if (group) {
      return delayedGroupIsOpen[group.id] ?? group.isOpen;
    }

    return false;
  };

  return isVerseHidden;
}
