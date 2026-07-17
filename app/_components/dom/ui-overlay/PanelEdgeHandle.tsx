"use client";

const GOLD = "#C4963B";

/**
 * A collapse handle straddling a glass panel's inner edge, vertically
 * centered — a gilded capsule with a small grip of dots so it visibly reads
 * as a slide handle, not just a decorative line. The panel it belongs to
 * only mounts while open, so a click here always means "close".
 */
export function PanelEdgeHandle({
  edge,
  onClick,
  label,
}: {
  edge: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute top-1/2 -translate-y-1/2 z-10 pointer-events-auto cursor-pointer
        outline-none group flex items-center justify-center"
      style={{ [edge]: "-11px", width: "30px", height: "clamp(66px, 6.2vw, 116px)" }}
    >
      <span
        aria-hidden="true"
        className="relative flex flex-col items-center justify-center rounded-full
          transition-all duration-300 ease-out
          bg-[var(--glass-handle-bg)] border border-[var(--glass-handle-line)]
          group-hover:bg-[var(--glass-handle-bg-hover)]
          group-hover:shadow-[0_0_14px_rgba(196,150,59,0.6)]"
        style={{ width: "10px", height: "100%", gap: "5px" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block rounded-full transition-opacity duration-300 group-hover:opacity-100"
            style={{ width: "3.5px", height: "3.5px", background: GOLD, opacity: 0.7 }}
          />
        ))}
      </span>
    </button>
  );
}
