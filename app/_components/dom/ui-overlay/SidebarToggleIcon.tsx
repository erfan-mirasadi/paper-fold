"use client";

import { motion } from "framer-motion";

export function SidebarToggleIcon({
  isOpen,
  side,
}: {
  isOpen: boolean;
  side: "left" | "right";
}) {
  const isLeft = side === "left";

  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
      overflow="visible"
    >
      {/* Outer frame — always present */}
      <motion.rect x="3" y="4.5" width="18" height="15" rx="2.8" />

      {/* Divider */}
      <motion.line
        animate={{ opacity: isOpen ? 1 : 0.3 }}
        x1={isLeft ? 9.5 : 14.5}
        y1="4.5"
        x2={isLeft ? 9.5 : 14.5}
        y2="19.5"
      />

      {/* Chevron — morphs direction */}
      <motion.polyline
        animate={{
          points: isOpen
            ? isLeft
              ? "7,9.5 4.5,12 7,14.5"
              : "17,9.5 19.5,12 17,14.5"
            : isLeft
              ? "13.5,9.5 16,12 13.5,14.5"
              : "10.5,9.5 8,12 10.5,14.5",
        }}
        points={
          isOpen
            ? isLeft
              ? "7,9.5 4.5,12 7,14.5"
              : "17,9.5 19.5,12 17,14.5"
            : isLeft
              ? "13.5,9.5 16,12 13.5,14.5"
              : "10.5,9.5 8,12 10.5,14.5"
        }
        fill="none"
      />
    </svg>
  );
}
