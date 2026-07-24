"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

// ---------------------------------------------------------------------------
// RecitationChain — the tafsir panel's one voice at a time, in order.
//
// A tafsir entry can hold several recitations (one per section). Every player
// registers here with the entry it belongs to (`group`) and its position in
// that entry (`order`), which buys three things:
//
//   • starting one stops whatever else was talking, anywhere in the panel;
//   • finishing one hands over to the next in the SAME entry, so a reader who
//     presses play at the top hears the whole entry read through;
//   • the next voice is told to start loading as soon as the current one
//     begins, so the handover doesn't stall on the network.
//
// Handover stops at the entry's edge on purpose: the next entry belongs to a
// fold step the reader hasn't reached yet, and should not start talking.
// ---------------------------------------------------------------------------

/** A quiet beat between one voice ending and the next beginning. */
const HANDOVER_MS = 500;

/** Where a player sits in the chain: which entry, and where within it. */
export interface RecitationChainSlot {
  group: string;
  order: number;
}

/** What the chain can do to a registered player. */
export interface RecitationChainApi {
  /** Start (from the top if it had finished). */
  play: () => void;
  /** Stop, keeping the position. */
  pause: () => void;
  /** Start fetching the audio — called on the one that's up next. */
  prime: () => void;
}

interface Chain {
  /** Join the chain; returns the leave function. */
  register: (slot: RecitationChainSlot, api: RecitationChainApi) => () => void;
  /** "I'm speaking now" — hushes the others and warms up the next. */
  claim: (slot: RecitationChainSlot) => void;
  /** "I'm done" — passes the turn to the next player in the same group. */
  advance: (slot: RecitationChainSlot) => void;
}

const ChainContext = createContext<Chain | null>(null);

/** The surrounding chain, or null when a player stands alone. */
export function useRecitationChain(): Chain | null {
  return useContext(ChainContext);
}

const idOf = (slot: RecitationChainSlot) => `${slot.group}#${slot.order}`;

type Member = RecitationChainSlot & RecitationChainApi;

export function RecitationChainProvider({ children }: { children: ReactNode }) {
  const members = useRef(new Map<string, Member>());
  const handover = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (handover.current !== null) window.clearTimeout(handover.current);
    },
    [],
  );

  const chain = useMemo<Chain>(() => {
    /** The registered player that comes right after `slot` in its entry. */
    const next = (slot: RecitationChainSlot) => {
      let best: Member | null = null;
      for (const m of members.current.values()) {
        if (m.group !== slot.group || m.order <= slot.order) continue;
        if (best === null || m.order < best.order) best = m;
      }
      return best;
    };

    return {
      register(slot, api) {
        const id = idOf(slot);
        const member = { ...slot, ...api };
        members.current.set(id, member);
        return () => {
          if (members.current.get(id) === member) members.current.delete(id);
        };
      },
      claim(slot) {
        const id = idOf(slot);
        members.current.forEach((m, key) => {
          if (key !== id) m.pause();
        });
        if (handover.current !== null) {
          window.clearTimeout(handover.current);
          handover.current = null;
        }
        next(slot)?.prime();
      },
      advance(slot) {
        const up = next(slot);
        if (!up) return;
        if (handover.current !== null) window.clearTimeout(handover.current);
        handover.current = window.setTimeout(() => {
          handover.current = null;
          up.play();
        }, HANDOVER_MS);
      },
    };
  }, []);

  return (
    <ChainContext.Provider value={chain}>{children}</ChainContext.Provider>
  );
}
