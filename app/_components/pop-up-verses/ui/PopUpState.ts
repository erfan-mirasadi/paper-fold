"use client";

import { useSyncExternalStore } from "react";

type PopUpGroup = {
  id: string;
  verseIds: number[];
  isOpen: boolean;
  hasEverOpened: boolean;
};

let _groups: PopUpGroup[] = [
  { id: "g_1_2", verseIds: [1, 2], isOpen: false, hasEverOpened: false },
  { id: "g_3_4", verseIds: [3, 4], isOpen: false, hasEverOpened: false },
  { id: "g_7_8", verseIds: [7, 8], isOpen: false, hasEverOpened: false },
  { id: "g_9_10", verseIds: [9, 10], isOpen: false, hasEverOpened: false },
  {
    id: "g_11_12_13_14",
    verseIds: [11, 12, 13, 14],
    isOpen: false,
    hasEverOpened: false,
  },
  { id: "g_15_16", verseIds: [15, 16], isOpen: false, hasEverOpened: false },
  { id: "g_17_18", verseIds: [17, 18], isOpen: false, hasEverOpened: false },
];

let _allOpen = false;
let _scrollThresholdReached = false;

const _listeners = new Set<() => void>();

function emit() {
  _listeners.forEach((cb) => cb());
}

export function subscribePopUps(cb: () => void) {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

export function getPopUpGroups() {
  return _groups;
}

export function getAllOpen() {
  return _allOpen;
}

export function getScrollThresholdReached() {
  return _scrollThresholdReached;
}

export function setScrollThresholdReached(reached: boolean) {
  if (_scrollThresholdReached !== reached) {
    _scrollThresholdReached = reached;
    emit();
  }
}

export function toggleGroup(id: string) {
  let anyClosed = false;
  _groups = _groups.map((g) => {
    if (g.id === id) {
      const newState = !g.isOpen;
      if (!newState) anyClosed = true;
      return {
        ...g,
        isOpen: newState,
        hasEverOpened: g.hasEverOpened || newState,
      };
    }
    if (!g.isOpen) anyClosed = true;
    return g;
  });
  _allOpen = !anyClosed;
  emit();
}

export function toggleAll() {
  _allOpen = !_allOpen;
  _groups = _groups.map((g) => ({
    ...g,
    isOpen: _allOpen,
    hasEverOpened: g.hasEverOpened || _allOpen,
  }));
  emit();
}

export function usePopUpState() {
  return {
    groups: useSyncExternalStore(
      subscribePopUps,
      getPopUpGroups,
      getPopUpGroups,
    ),
    allOpen: useSyncExternalStore(subscribePopUps, getAllOpen, getAllOpen),
    scrollThresholdReached: useSyncExternalStore(
      subscribePopUps,
      getScrollThresholdReached,
      getScrollThresholdReached,
    ),
  };
}
