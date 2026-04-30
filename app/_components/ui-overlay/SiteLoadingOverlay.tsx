"use client";
import { motion } from "framer-motion";

interface SiteLoadingOverlayProps {
  isDarkMode?: boolean;
}

export function SiteLoadingOverlay({
  isDarkMode = false,
}: SiteLoadingOverlayProps) {
  // Keeping your original colors for text, but made the glow a bit more refined
  const textColor = isDarkMode ? "rgba(241,246,255,0.96)" : "#0F1218";
  const glow = isDarkMode ? "rgba(210,228,255,0.35)" : "rgba(35,42,55,0.12)";

  // The requested Brown color, fixed for both modes for consistent line look.
  // This is the color from Image 0.
  const fixedBrownStroke = "#3E342B";

  // The Sand color from Image 1 for the subtle fill tone shift
  const sandFill = "#E5E0D8";

  // Light/Dark mode specific colors for the fill gradient
  const finalFillColor = isDarkMode ? "#ffffff" : sandFill; // white for contrast, sand for lighmode

  return (
    <motion.div
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
        background: isDarkMode ? "#000" : "#fff",
        color: textColor,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        willChange: "opacity, transform, filter",
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
        <motion.div
          style={{
            position: "absolute",
            bottom: -30,
            width: "50%",
            height: "12px",
            borderRadius: "50%",
            background: isDarkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.06)",
            filter: "blur(6px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.15, 0.3],
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />

        {/* The main SVG with unique, slow, Siri-like multi-axial rotation */}
        <motion.svg
          width="120"
          height="120"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: `drop-shadow(0 15px [20,25,20]px ${glow})`, // dynamic drop shadow blur
            overflow: "visible",
            marginBottom: "30px", // give space for shadow and complex motion
          }}
          animate={{
            // Slow, complex 3D rotation and a subtle pulsation
            rotateX: [0, 8, -8, 0],
            rotateY: [0, 12, -12, 0],
            scale: [1, 1.015, 1],
          }}
          transition={{
            duration: 7, // very slow, deliberate motion
            ease: "linear", // linear makes the complex rotation fluid
            repeat: Infinity,
          }}
        >
          <motion.path
            fillRule="evenodd"
            clipRule="evenodd"
            // INSERTED EXACT SVG PATH DATA (RETAINED)
            d="M116.755 30.2797C136.237 -21.6484 176.299 4.9945 187.955 38.2775C193.879 60.4506 192.022 69.3363 192.362 80.4691C208.249 121.733 199.765 186.465 163.024 193.019C126.313 199.566 101.203 181.385 101.101 181.312C100.975 181.413 74.7317 204.297 38.037 197.752C-8.82899 189.393 -3.18727 116.351 7.05684 83.5987C7.39706 72.4659 6.22494 61.2631 12.1489 39.09L12.1485 39.0898C23.8045 5.80679 65.0379 -19.3301 84.0475 30.8595C98.28 79.7179 63.7622 85.5694 19.5811 71.8919C18.7693 73.4866 16.8 79.8898 17.1459 80.5853C27.4664 101.333 61.5588 128.224 101.101 152.696C140.644 128.224 166.851 100.29 182.273 79.31C182.733 78.6841 180.766 70.9361 179.954 69.3417C134.149 86.6124 102.523 79.1381 116.755 30.2797ZM10.884 96.233C5.93113 120.709 6.84122 154.503 31.4116 165.719C45.0528 171.947 62.229 168.672 76.1159 163.765C72.9308 161.197 69.7516 158.668 66.6039 156.164C42.1912 136.744 20.1609 118.604 10.884 96.233ZM190.043 91.017C180.766 113.388 152.82 142.366 127.424 161.143C141.571 166.939 157.152 165.748 170.793 159.52C191.55 145.843 195.146 116.286 190.043 91.017ZM73.8508 41.523C70.0241 25.6434 45.5564 31.9025 35.3518 45.3481C37.2259 45.7081 38.5683 45.9525 40.3682 46.19C47.3619 47.1131 75.3518 52.3666 73.8508 41.523ZM164.184 43.8413C153.98 30.3956 132.179 25.6433 128.352 41.523C126.851 52.3666 157.191 44.7643 164.184 43.8413Z"
            strokeWidth="1.2" // slightly thinner line for elegance
            stroke={fixedBrownStroke} // FIXED BROWN STROKE
            initial={{
              pathLength: 0,
              fill: "rgba(0,0,0,0)",
            }}
            animate={{
              // Slower, continuous drawing loop
              pathLength: [0, 1], // draw only
              fill: [
                sandFill, // start sand
                fixedBrownStroke, // morph to brown
                finalFillColor, // morph to final tonal shift (white or sand)
                sandFill, // back to sand
              ],
            }}
            transition={{
              // Slower stroke drawing
              pathLength: {
                duration: 5, // much slower (was 2.5s)
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop", // loop for continuous draw
                repeatDelay: 0.5,
              },
              // Slower color shift keyframes
              fill: {
                duration: 12, // extremely slow (was 1.5s) to make it subtle
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 0.5,
              },
            }}
          />
        </motion.svg>

        {/* Professional 3-dot loading indicator */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: fixedBrownStroke,
                opacity: 0.3,
                boxShadow: isDarkMode
                  ? "0 0 12px rgba(255,255,255,0.2)"
                  : `0 0 8px ${glow}`,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [0.85, 1.15, 0.85],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
