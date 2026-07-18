"use client";

import { memo, ReactNode } from "react";
import { motion } from "framer-motion";
import { useFoldStore } from "../../canvas/orchestrator/ScrollManager";
import { useDragState, resetAllDrags } from "../../../utils/dragEngine";
import { useElevatedStore } from "../../../stores/useElevatedStore";
import { OverlayButton } from "./OverlayButton";

export function NavigationOverlay() {
  const triggerTransition = useFoldStore((s) => s.triggerTransition);
  const isTransitioning = useFoldStore((s) => s.isTransitioning);
  const hasDragged = useDragState((s) => s.hasDragged);
  const isPaperDocked = useDragState((s) => s.isPaperDocked);
  const isAllSectionsMode = useElevatedStore((s) => s.isAllSectionsMode);

  const isEndStage = useFoldStore((s) => s.currentOffset < 0.5);


  const accentColor = "var(--foreground)";
  const iconUnfold = (
    <svg
      width="22"
      height="14"
      viewBox="0 0 28 18"
      fill="none"
      stroke="currentColor"
      style={{ color: accentColor }}
      strokeWidth="1.2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M4 13.6 13.8 10l10.2 3.6-10.2 3.1Z"
        fill="currentColor"
        opacity="0.2"
        stroke="none"
      />
      <path d="M4 13.6V6.8L13.8 3.2v6.8" />
      <path d="M24 13.6V6.8L13.8 3.2" />
      <path d="M4 13.6 13.8 10 24 13.6" />
      <path d="M13.8 3.2 24 6.8" opacity="0.78" />
    </svg>
  );

  const iconFold = (
    <svg
      width="22"
      height="14"
      viewBox="0 0 28 18"
      fill="none"
      stroke="currentColor"
      style={{ color: accentColor }}
      strokeWidth="1.2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M4 13.7 9.7 8.7 14 12l4.3-3.3 5.7 5-5.7 2-4.3-2.1-4.3 2.1Z"
        fill="currentColor"
        opacity="0.2"
        stroke="none"
      />
      <path d="M4 13.7V7.6l5.7-4.1 4.3 3.2 4.3-3.2 5.7 4.1v6.1" />
      <path d="M4 13.7 9.7 8.7 14 12l4.3-3.3 5.7 5" />
      <path d="M9.7 3.5v5.2M18.3 3.5v5.2" opacity="0.78" />
    </svg>
  );

  const iconUndo = (
    <svg
      width="22"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: accentColor }}
    >
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
    </svg>
  );

  const containerVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  } as const;

  const nextStageId: "end" | "pre-start" = isEndStage ? "end" : "pre-start";
  const activeIcon = nextStageId === "end" ? iconUnfold : iconFold;
  const buttonLabel = nextStageId === "end" ? "Aç" : "Katla";

  const handleSmartTransition = () => {
    if (isTransitioning) return;
    triggerTransition(nextStageId);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pointer-events-auto flex flex-row-reverse gap-2 items-center"
    >
      {!isPaperDocked && !isAllSectionsMode && (
        <NavButton
          onClick={handleSmartTransition}
          icon={activeIcon}
          label={buttonLabel}
          isPending={isTransitioning}
          variants={itemVariants}
        />
      )}
      {hasDragged && (
        <NavButton
          onClick={resetAllDrags}
          icon={iconUndo}
          label="Sıfırla"
          isPending={false}
          variants={itemVariants}
        />
      )}
    </motion.div>
  );
}

interface NavButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label?: string;
  isPending: boolean;
  variants: import("framer-motion").Variants;
}

const NavButton = memo(function NavButton({
  onClick,
  icon,
  label,
  isPending,
  variants,
}: NavButtonProps) {
  const handleClick = () => {
    if (isPending) return;
    onClick();
  };

  return (
    <OverlayButton
      variants={variants}
      disabled={isPending}
      onClick={handleClick}
      aria-busy={isPending}
      className="flex flex-col items-center justify-center gap-1 w-14 h-14"
    >
      <span className="flex items-center justify-center pointer-events-none">
        {icon}
      </span>
      {label && (
        <span className="text-[10px] font-semibold tracking-wider pointer-events-none uppercase text-foreground">
          {label}
        </span>
      )}
    </OverlayButton>
  );
});
