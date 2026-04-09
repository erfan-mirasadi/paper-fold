"use client";

import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TAFSIR_DATA } from "./TafsirData";

let _activeId: number | null = null;
let _anchorPos = { x: -9999, y: -9999 };
const _listeners = new Set<() => void>();

export function subscribe(cb: () => void) {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

export function getActiveId() {
  return _activeId;
}

export function setActiveId(id: number | null) {
  if (id === _activeId) return;
  _activeId = id;
  _listeners.forEach((cb) => cb());
}

export function getAnchorPosition() {
  return _anchorPos;
}

export function setAnchorPosition(x: number, y: number) {
  if (Math.abs(_anchorPos.x - x) < 0.5 && Math.abs(_anchorPos.y - y) < 0.5)
    return;
  _anchorPos = { x, y };
  _listeners.forEach((cb) => cb());
}

export function TafsirScrollTracker() {
  const scroll = useScroll();
  const prevRef = useRef<number | null>(null);
  useFrame(() => {
    if (!scroll) return;
    const active = TAFSIR_DATA.find(
      (d) => scroll.offset >= d.scrollStart && scroll.offset <= d.scrollEnd,
    );
    const newId = active?.id ?? null;
    if (newId !== prevRef.current) {
      prevRef.current = newId;
      setActiveId(newId);
    }
  });
  return null;
}

export const TafsirUI = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const activeId = useSyncExternalStore(subscribe, getActiveId, getActiveId);
  const anchorPos = useSyncExternalStore(
    subscribe,
    getAnchorPosition,
    getAnchorPosition,
  );
  const activeTafsir = TAFSIR_DATA.find((t) => t.id === activeId);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 999999,
      }}
    >
      <AnimatePresence>
        {activeTafsir && (
          <motion.div
            key={`anchor-${activeTafsir.id}`}
            style={{
              position: "absolute",
              top: anchorPos.y,
              left: anchorPos.x,
              width: 0,
              height: 0,
            }}
          >
            {/* PULSATING POINTER */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              style={{
                position: "absolute",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: -12,
                  borderRadius: "50%",
                  background: isDarkMode ? "white" : "black",
                  opacity: 0.2,
                  animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                }}
              />
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: isDarkMode ? "#fff" : "#000",
                  boxShadow: "0 0 10px rgba(0,0,0,0.4)",
                }}
              />
            </motion.div>

            {/* CARD WRAPPER */}
            <motion.div
              initial={{
                opacity: 0,
                x: activeTafsir.direction === "left" ? 20 : -20,
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                position: "absolute",
                top: activeTafsir.verticalOffset,
                display: "flex",
                alignItems: "center",
                flexDirection:
                  activeTafsir.direction === "left" ? "row-reverse" : "row",
                [activeTafsir.direction === "left" ? "right" : "left"]: 12,
              }}
            >
              {/* CONNECTING LINE */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: activeTafsir.lineWidth }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{
                  height: 1.5,
                  background: isDarkMode
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.2)",
                  flexShrink: 0,
                }}
              />

              {/* INFO CARD */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.7 }}
                style={{
                  pointerEvents: "auto",
                  width: 320,
                  padding: "24px",
                  borderRadius: "24px",
                  background: isDarkMode
                    ? "rgba(25, 25, 25, 0.85)"
                    : "rgba(255, 255, 255, 0.85)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: isDarkMode
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px solid rgba(0,0,0,0.05)",
                  boxShadow: isDarkMode
                    ? "0 30px 60px -12px rgba(0,0,0,0.8)"
                    : "0 30px 60px -12px rgba(0,0,0,0.15)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isDarkMode ? "rgba(255,255,255,0.1)" : "#111",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {activeTafsir.id}
                  </div>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      letterSpacing: "0.1em",
                      color: isDarkMode ? "#fff" : "#111",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    {activeTafsir.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 500,
                    fontStyle: "italic",
                    lineHeight: 1.4,
                    color: isDarkMode ? "#eee" : "#222",
                    marginBottom: 12,
                  }}
                >
                  &quot;{activeTafsir.translation}&quot;
                </p>
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDarkMode ? "#888" : "#666",
                    margin: 0,
                  }}
                >
                  {activeTafsir.explanation}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
