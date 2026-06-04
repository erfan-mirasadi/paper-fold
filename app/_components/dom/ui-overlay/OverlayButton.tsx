"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { ReactNode, forwardRef } from "react";

interface OverlayButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  icon?: ReactNode;
  label?: string | ReactNode;
  children?: ReactNode; // Allow children for custom layouts if needed
  isActive?: boolean;
  isPending?: boolean;
  direction?: "row" | "column";
  gap?: string | number;
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  padding?: string | number;
  borderRadius?: string | number;
  fontSize?: string | number;
  fontWeight?: string | number;
}

export const OverlayButton = forwardRef<HTMLButtonElement, OverlayButtonProps>(
  (
    {
      icon,
      label,
      children,
      isActive,
      isPending,
      direction = "row",
      gap = "4px",
      width,
      height,
      minWidth,
      padding,
      borderRadius = "12px",
      fontSize,
      fontWeight = 600,
      style,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={isPending}
        whileTap={
          isPending
            ? undefined
            : { scale: 0.98, ...(typeof props.whileTap === "object" ? props.whileTap : {}) }
        }
        style={{
          display: "flex",
          flexDirection: direction,
          alignItems: "center",
          justifyContent: "center",
          gap,
          width,
          height,
          minWidth,
          padding,
          borderRadius,
          fontSize,
          fontWeight,
          ...style,
        }}
        className={`overlay-btn ${isActive ? "active" : ""} ${className}`}
        {...props}
      >
        {icon && (
          <span style={{ display: "inline-flex", pointerEvents: "none", zIndex: 2 }}>
            {icon}
          </span>
        )}
        {label && (
          <span style={{ zIndex: 2, pointerEvents: "none" }}>{label}</span>
        )}
        {children}
      </motion.button>
    );
  }
);

OverlayButton.displayName = "OverlayButton";
