"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function SiteLoadingOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Block all scroll-related events at the window level (capture phase)
  // so Lenis never receives them while this overlay is visible.
  // Lenis listens on `window` so we must intercept there too, not just on the element.
  useEffect(() => {
    const block = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    const blockKeys = (e: KeyboardEvent) => {
      const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", " ", "Home", "End"];
      if (scrollKeys.includes(e.key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    window.addEventListener("wheel", block, { passive: false, capture: true });
    window.addEventListener("touchmove", block, { passive: false, capture: true });
    window.addEventListener("touchstart", block, { passive: false, capture: true });
    window.addEventListener("keydown", blockKeys, { passive: false, capture: true });

    return () => {
      window.removeEventListener("wheel", block, { capture: true });
      window.removeEventListener("touchmove", block, { capture: true });
      window.removeEventListener("touchstart", block, { capture: true });
      window.removeEventListener("keydown", blockKeys, { capture: true });
    };
  }, []);

  const textColor = "rgba(241,246,255,0.96)";
  const glow = "rgba(210,228,255,0.35)";

  // We now use CSS variables to support light/dark mode gradients.
  // The variables are defined in globals.css.
  const strokeColor = "var(--loader-stroke)";


  return (
    <motion.div
      ref={overlayRef}
      key="loading-overlay"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.05,
        filter: "blur(10px)",
      }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      aria-live="polite"
      aria-busy="true"
      role="status"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        background: "var(--page-bg)",
        color: textColor,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        willChange: "opacity, transform, filter",
        // Make sure pointer events are active so our event listeners fire
        pointerEvents: "all",
        touchAction: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          pointerEvents: "none",
          position: "relative", // for absolute shadow positioning
        }}
      >
        {/* Soft breathing shadow underneath - more subtle now */}
        <div
          className="loading-shadow-pulse"
          style={{
            position: "absolute",
            bottom: -30,
            width: "50%",
            height: "12px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            filter: "blur(6px)",
          }}
        />

        <svg
          className="loading-svg-rotate"
          width="90"
          height="90"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: `drop-shadow(0 15px 20px ${glow})`,
            overflow: "visible",
            marginBottom: "20px",
          }}
        >
          <path
            className="loading-path-draw"
            fillRule="evenodd"
            clipRule="evenodd"
            // INSERTED EXACT SVG PATH DATA (RETAINED)
            d="M116.755 30.2797C136.237 -21.6484 176.299 4.9945 187.955 38.2775C193.879 60.4506 192.022 69.3363 192.362 80.4691C208.249 121.733 199.765 186.465 163.024 193.019C126.313 199.566 101.203 181.385 101.101 181.312C100.975 181.413 74.7317 204.297 38.037 197.752C-8.82899 189.393 -3.18727 116.351 7.05684 83.5987C7.39706 72.4659 6.22494 61.2631 12.1489 39.09L12.1485 39.0898C23.8045 5.80679 65.0379 -19.3301 84.0475 30.8595C98.28 79.7179 63.7622 85.5694 19.5811 71.8919C18.7693 73.4866 16.8 79.8898 17.1459 80.5853C27.4664 101.333 61.5588 128.224 101.101 152.696C140.644 128.224 166.851 100.29 182.273 79.31C182.733 78.6841 180.766 70.9361 179.954 69.3417C134.149 86.6124 102.523 79.1381 116.755 30.2797ZM10.884 96.233C5.93113 120.709 6.84122 154.503 31.4116 165.719C45.0528 171.947 62.229 168.672 76.1159 163.765C72.9308 161.197 69.7516 158.668 66.6039 156.164C42.1912 136.744 20.1609 118.604 10.884 96.233ZM190.043 91.017C180.766 113.388 152.82 142.366 127.424 161.143C141.571 166.939 157.152 165.748 170.793 159.52C191.55 145.843 195.146 116.286 190.043 91.017ZM73.8508 41.523C70.0241 25.6434 45.5564 31.9025 35.3518 45.3481C37.2259 45.7081 38.5683 45.9525 40.3682 46.19C47.3619 47.1131 75.3518 52.3666 73.8508 41.523ZM164.184 43.8413C153.98 30.3956 132.179 25.6433 128.352 41.523C126.851 52.3666 157.191 44.7643 164.184 43.8413Z"
            strokeWidth="3" // slightly thicker line for smaller size
            stroke={strokeColor}
            strokeOpacity={0.8} // Increased opacity for better visibility
          />
        </svg>

        {/* Animated text loading indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "24px",
            fontFamily: "'Cinzel', 'Playfair Display', 'Georgia', serif",
            textTransform: "lowercase",
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "0.4em",
            color: strokeColor,
          }}
        >
          {"quranpatterns.com".split("").map((char, i) => (
            <motion.span
              key={i}
              style={{ display: "inline-block" }}
              initial={{ opacity: 0.2 }}
              animate={{ 
                opacity: [0.3, 1, 0.8, 0.3],
                color: [
                  "var(--loader-color-1)",
                  "var(--loader-color-2)",
                  "var(--loader-color-3)",
                  "var(--loader-color-1)"
                ],
                textShadow: [
                  "0 0 0px var(--loader-glow-none)",
                  "0 0 20px var(--loader-glow-full)",
                  "0 0 10px var(--loader-glow-mid)",
                  "0 0 0px var(--loader-glow-none)"
                ],
                scale: [1, 1.1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
