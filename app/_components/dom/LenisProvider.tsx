"use client";

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

const LenisContext = createContext<Lenis | null>(null);

// Module-level handle so non-React orchestration code (e.g. usePaperStore's
// paper switching) can drive the scroll position imperatively, outside of the
// React tree and ahead of any pending commit.
let activeLenisInstance: Lenis | null = null;

export function getLenisInstance(): Lenis | null {
  return activeLenisInstance;
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const rafIdRef = useRef<number | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  // 1. Force the browser to start at 0 BEFORE it paints the first frame
  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 2. Instantiate Lenis INSIDE useEffect to prevent Strict Mode memory leaks
    const lenisInstance = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: true,
      wheelMultiplier: 0.5,
      touchMultiplier: 0.5,
    });

    // 3. Force Lenis internal state to 0
    lenisInstance.scrollTo(0, { immediate: true });
    activeLenisInstance = lenisInstance;

    // Defer the state update to avoid the "synchronous setState in effect" linter warning
    // and prevent cascading renders during the initial commit phase.
    const timeoutId = setTimeout(() => {
      setLenis(lenisInstance);
    }, 0);

    let active = true;

    const onFrame = (time: number) => {
      if (!active) return;
      lenisInstance.raf(time);
      rafIdRef.current = requestAnimationFrame(onFrame);
    };

    rafIdRef.current = requestAnimationFrame(onFrame);

    return () => {
      clearTimeout(timeoutId);
      active = false;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (activeLenisInstance === lenisInstance) {
        activeLenisInstance = null;
      }
      lenisInstance.destroy(); // Safely destroy the single tracked instance
      rafIdRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}

export function useLenis() {
  return useContext(LenisContext);
}
