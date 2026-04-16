import { useEffect, useState, useRef } from "react";
import { usePopUpStore } from "../features/pop-up-verses/ui/usePopUpStore";
import { ORIGINAL_TEXTURE_TIMING } from "../features/pop-up-verses/useFoldAnimation";
import { useElevatedStore } from "../features/elevated-verses/useElevatedStore";
import { ELEVATE_TEXTURE_TIMING } from "../features/elevated-verses/useElevateAnimation";

export function useDelayedVerseVisibility() {
  const groups = usePopUpStore((state) => state.popUpGroups);
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

  // Refs for tracking timeouts so we can cancel specific ones without wiping others
  const groupTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const elevatedTimeoutsRef = useRef<Record<number, NodeJS.Timeout>>({});

  // Refs for tracking previous states to detect actual changes
  const prevGroupsOpenRef = useRef<Record<string, boolean>>(
    Object.fromEntries(groups.map((g) => [g.id, g.isOpen])),
  );
  const prevActiveSetRef = useRef<Set<number>>(new Set(activeVerseIds));

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
