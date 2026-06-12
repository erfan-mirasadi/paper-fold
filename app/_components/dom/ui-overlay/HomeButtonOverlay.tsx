"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { OverlayButton } from "./OverlayButton";

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function HomeButtonOverlay() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 170, damping: 22 }}
      className="pointer-events-auto flex items-center justify-center"
    >
      <OverlayButton
        onClick={() => router.push("/")}
        aria-label="Home"
        className="w-14 h-14"
      >
        <HomeIcon />
      </OverlayButton>
    </motion.div>
  );
}
