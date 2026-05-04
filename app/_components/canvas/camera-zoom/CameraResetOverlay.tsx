"use client";

import { useCameraStore } from "../../../stores/useCameraStore";

export function CameraResetOverlay() {
  const phase = useCameraStore((s) => s.phase);
  const resetCamera = useCameraStore((s) => s.resetCamera);

  // Only show when zoomed
  if (phase !== "zoomed") return null;

  return (
    <button
      onClick={resetCamera}
      aria-label="Reset camera zoom"
      style={{
        position: "fixed",
        top: 24,
        left: 24,
        zIndex: 999991,
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.2)",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 300,
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        padding: 0,
        lineHeight: 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
      }}
    >
      ✕
    </button>
  );
}
