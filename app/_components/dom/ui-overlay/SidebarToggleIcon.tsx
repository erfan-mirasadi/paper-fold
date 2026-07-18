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

  // LEFT SIDEBAR: Tall line on the left (edge), short line on the right (handle)
  const leftClosed = {
    line1: { x1: 8, y1: 5, x2: 8, y2: 19 },
    line2: { x1: 16, y1: 10, x2: 16, y2: 14 },
  };

  // RIGHT SIDEBAR: Short line on the left (handle), tall line on the right (edge)
  const rightClosed = {
    line1: { x1: 8, y1: 10, x2: 8, y2: 14 },
    line2: { x1: 16, y1: 5, x2: 16, y2: 19 },
  };

  // OPEN STATE: A perfect minimal 'X' for both to indicate 'Close'
  const openState = {
    line1: { x1: 7, y1: 7, x2: 17, y2: 17 },
    line2: { x1: 17, y1: 7, x2: 7, y2: 17 },
  };

  const line1Props = isOpen
    ? openState.line1
    : isLeft
      ? leftClosed.line1
      : rightClosed.line1;

  const line2Props = isOpen
    ? openState.line2
    : isLeft
      ? leftClosed.line2
      : rightClosed.line2;

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ overflow: "visible" }}
    >
      <motion.line
        initial={false}
        animate={line1Props}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />
      <motion.line
        initial={false}
        animate={line2Props}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />
    </svg>
  );
}
