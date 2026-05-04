"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const LenisContext = createContext<Lenis | null>(null);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const rafIdRef = useRef<number | null>(null);
  const [lenis] = useState<Lenis | null>(() => {
    if (typeof window === "undefined") return null;

    return new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: true,
    });
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!lenis) return;

    const onFrame = (time: number) => {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(onFrame);
    };

    rafIdRef.current = requestAnimationFrame(onFrame);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      lenis.destroy();
      rafIdRef.current = null;
    };
  }, [lenis]);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}

export function useLenis() {
  return useContext(LenisContext);
}
