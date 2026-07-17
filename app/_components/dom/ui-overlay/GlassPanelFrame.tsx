"use client";

const GOLD = "#C4963B";

// Same four-pointed "illuminated manuscript" sparkle used by SideInfoPanel's
// NewEntryMark — reused here at corner scale so the glass frame reads as
// part of the same hand, not a generic frosted card.
const SPARK_PATH =
  "M12 0C12 6.2 13.9 10 20 12C13.9 14 12 17.8 12 24C12 17.8 10.1 14 4 12C10.1 10 12 6.2 12 0Z";

const RADIUS = "clamp(20px, 1.7vw, 34px)";

function CornerSpark({
  corner,
}: {
  corner: "tl" | "tr" | "bl" | "br";
}) {
  const inset = "clamp(10px, 0.9vw, 16px)";
  const pos: React.CSSProperties =
    corner === "tl"
      ? { top: inset, left: inset }
      : corner === "tr"
        ? { top: inset, right: inset, transform: "scaleX(-1)" }
        : corner === "bl"
          ? { bottom: inset, left: inset, transform: "scaleY(-1)" }
          : { bottom: inset, right: inset, transform: "scale(-1,-1)" };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="absolute w-[7px] h-[7px] lg:w-[clamp(7px,0.55vw,11px)] lg:h-[clamp(7px,0.55vw,11px)]"
      style={{
        opacity: 0.4,
        filter: `drop-shadow(0 0 0.2em ${GOLD}66)`,
        ...pos,
      }}
    >
      <path d={SPARK_PATH} fill={GOLD} />
    </svg>
  );
}

/**
 * Artistic glassy backdrop for the two reading sidebars (script + tafsir).
 *
 * Layered like an illuminated manuscript page seen through glass rather than
 * a flat frosted card: backdrop blur for the actual glass refraction, a warm
 * gold-tinted tint (light/dark via CSS vars in globals.css), a fine ink-grain
 * texture so it doesn't read as plastic, a slow drifting sheen, a gilded
 * double border, and four small corner sparks echoing the panel's own
 * "new entry" mark. Renders as an absolutely-positioned layer — drop it as
 * the first child of a `position: relative`/`fixed` container and give the
 * container's content its own padding.
 */
export function GlassPanelFrame() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ borderRadius: RADIUS, boxShadow: "var(--glass-panel-shadow)" }}
    >
      {/* Clipped layers: blur, tint, grain, sheen */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius: RADIUS }}
      >
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(26px) saturate(150%)",
            WebkitBackdropFilter: "blur(26px) saturate(150%)",
            background: "var(--glass-panel-bg)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "150px 150px",
            opacity: "var(--glass-panel-grain-opacity)",
            mixBlendMode: "overlay",
          }}
        />
        <div className="glass-panel-sheen absolute inset-0" />
      </div>

      {/* Gilded double border — outer hairline + faint inner highlight */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: RADIUS,
          border: "1px solid var(--glass-panel-border-outer)",
        }}
      />
      <div
        className="absolute"
        style={{
          inset: "3px",
          borderRadius: "calc(clamp(20px, 1.7vw, 34px) - 3px)",
          border: "1px solid var(--glass-panel-border-inner)",
        }}
      />

      <CornerSpark corner="tl" />
      <CornerSpark corner="tr" />
      <CornerSpark corner="bl" />
      <CornerSpark corner="br" />
    </div>
  );
}
