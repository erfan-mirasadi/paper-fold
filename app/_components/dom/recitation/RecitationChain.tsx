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
// RecitationChain — the tafsir panel read aloud, one voice at a time, in the
// order the words sit on the page.
//
// The panel's reading log stacks several entries, and an entry can hold
// several recitations. Every player joins this chain, which buys three things:
//
//   • starting one stops whatever else was talking, anywhere in the panel;
//   • finishing one hands over to the NEXT PLAYER DOWN THE PAGE — across
//     entries as readily as within one — so pressing play at the top reads the
//     whole log through;
//   • that next voice is told to start loading the moment the current one
//     begins, so the hand-over doesn't stall on the network.
//
// Turn order is read from the DOM rather than kept as an index: the log grows
// as the fold story unfolds, and "whatever comes next on the page" is exactly
// what a reader expects to hear next — with no bookkeeping that could drift
// out of step with what's on screen.
// ---------------------------------------------------------------------------

/** A quiet beat between one voice ending and the next beginning. */
const HANDOVER_MS = 500;

/** What the chain can do to a player that has joined it. */
export interface RecitationChainApi {
  /** The player's root node — its place in the document decides its turn. */
  node: () => HTMLElement | null;
  /** Start (from the top if it had finished). */
  play: () => void;
  /** Stop, keeping the position. */
  pause: () => void;
  /** Start fetching the audio — called on the one that's up next. */
  prime: () => void;
}

/** A player's grip on the chain, handed back when it joins. */
export interface RecitationChainHandle {
  /** "I'm speaking now" — hushes the others and warms up the next. */
  claim: () => void;
  /** "I'm done" — passes the turn to the next player down the page. */
  advance: () => void;
  /** Leave the chain. */
  release: () => void;
}

interface Chain {
  register: (api: RecitationChainApi) => RecitationChainHandle;
}

const ChainContext = createContext<Chain | null>(null);

/** The surrounding chain, or null when a player stands alone. */
export function useRecitationChain(): Chain | null {
  return useContext(ChainContext);
}

export function RecitationChainProvider({ children }: { children: ReactNode }) {
  const members = useRef(new Set<RecitationChainApi>());
  const handover = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (handover.current !== null) window.clearTimeout(handover.current);
    },
    [],
  );

  const chain = useMemo<Chain>(() => {
    /** Everyone still on the page, in the order a reader meets them. */
    const inReadingOrder = () =>
      [...members.current]
        .filter((m) => m.node())
        .sort((a, b) => {
          const rel = a.node()!.compareDocumentPosition(b.node()!);
          if (rel & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
          if (rel & Node.DOCUMENT_POSITION_PRECEDING) return 1;
          return 0;
        });

    const after = (api: RecitationChainApi) => {
      const order = inReadingOrder();
      const i = order.indexOf(api);
      return i < 0 ? null : (order[i + 1] ?? null);
    };

    const cancelHandover = () => {
      if (handover.current === null) return;
      window.clearTimeout(handover.current);
      handover.current = null;
    };

    return {
      register(api) {
        members.current.add(api);
        return {
          claim() {
            members.current.forEach((m) => {
              if (m !== api) m.pause();
            });
            cancelHandover();
            after(api)?.prime();
          },
          advance() {
            const up = after(api);
            if (!up) return;
            cancelHandover();
            handover.current = window.setTimeout(() => {
              handover.current = null;
              up.play();
            }, HANDOVER_MS);
          },
          release() {
            members.current.delete(api);
          },
        };
      },
    };
  }, []);

  return (
    <ChainContext.Provider value={chain}>{children}</ChainContext.Provider>
  );
}
