"use client";

import { useEffect } from "react";
import type { ElevatedSectionId } from "../../stores/useElevatedStore";
import {
  INTRO_SECTION_GUIDE_ORDER,
  introGuideMarkerDomId,
} from "../canvas/intro/section-guides/introGuideAnchorLayout";
import { INTRO_SECTION_GUIDE_UI_TEXT } from "../../data/introSectionGuideCopy";
import { AnimatedText } from "./ui-overlay/AnimatedText";
import { useFoldStore } from "../canvas/orchestrator/ScrollManager";

interface IntroSectionGuidesOverlayProps {
  isDarkMode?: boolean;
}

export function IntroSectionGuidesOverlay({
  isDarkMode = false,
}: IntroSectionGuidesOverlayProps) {
  const polePx = 112;
  const line = isDarkMode ? "rgba(180,210,255,0.92)" : "rgba(24,62,118,0.85)";
  const tip = isDarkMode ? "#a8dcff" : "#1a4888";
  const textColor = isDarkMode
    ? "rgba(232,243,255,0.94)"
    : "rgba(17,29,52,0.92)";

  const introHandoffProgress = useFoldStore((s) => s.introHandoffProgress);

  useEffect(() => {
    if (introHandoffProgress > 0) {
      useFoldStore.getState().setActiveAmbientMediaId(null);
    }
  }, [introHandoffProgress]);

  return (
    <div
      className="pointer-events-none"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        overflow: "visible",
      }}
    >
      {INTRO_SECTION_GUIDE_ORDER.map((id: ElevatedSectionId) => (
        <IntroGuideHudRow
          key={id}
          sectionId={id}
          caption={INTRO_SECTION_GUIDE_UI_TEXT[id]}
          polePx={polePx}
          lineStroke={line}
          tipFill={tip}
          textColor={textColor}
        />
      ))}
    </div>
  );
}

function IntroGuideHudRow({
  sectionId,
  caption,
  polePx,
  lineStroke,
  tipFill,
  textColor,
}: {
  sectionId: ElevatedSectionId;
  caption: string;
  polePx: number;
  lineStroke: string;
  tipFill: string;
  textColor: string;
}) {
  const id = introGuideMarkerDomId(sectionId);

  const introProgress = useFoldStore((s) => s.introProgress);
  const introHandoffProgress = useFoldStore((s) => s.introHandoffProgress);
  const isIntroActive = useFoldStore((s) => s.isIntroActive);

  const activeAmbientMediaId = useFoldStore((s) => s.activeAmbientMediaId);
  const loopedAmbientMediaId = useFoldStore((s) => s.loopedAmbientMediaId);

  // A section is "active" if it's either hovered OR auto-looping (hover takes priority)
  const effectiveActiveId = activeAmbientMediaId || loopedAmbientMediaId;
  const isActive = effectiveActiveId === sectionId;
  const isAnyActive = effectiveActiveId !== null;

  // Apple-style focus opacity - made more subtle (0.55 instead of 0.25)
  const focusOpacity = isAnyActive ? (isActive ? 1 : 0.55) : 1;

  // Determine dark mode context for monochrome styling
  const isDarkMode = textColor.includes("232");
  const activeColor = isDarkMode ? "#ffffff" : "#000000";

  // Calculate row-specific progress
  const index = INTRO_SECTION_GUIDE_ORDER.indexOf(sectionId);
  const numSteps = INTRO_SECTION_GUIDE_ORDER.length;
  const startOffset = 0.35;
  const endOffset = 0.95;
  const usable = endOffset - startOffset;
  const perStep = usable / numSteps;

  const myStart = startOffset + index * perStep;
  const myEnd = myStart + perStep;

  const rowProgress = Math.min(
    Math.max((introProgress - myStart) / (myEnd - myStart), 0),
    1,
  );

  // Calculate fade-out during handoff (sequential based on reverse index)
  // Compressed into the first 60% of the handoff to make them disappear faster.
  const fadeOutWindow = 0.7;
  const reversedIndex = numSteps - 1 - index;
  const handoffStart = (reversedIndex * fadeOutWindow) / numSteps;
  const handoffEnd = handoffStart + fadeOutWindow / numSteps;
  const handoffFadeOut = Math.min(
    Math.max(
      (introHandoffProgress - handoffStart) / (handoffEnd - handoffStart),
      0,
    ),
    1,
  );

  const isVisible =
    isIntroActive && introProgress >= myStart && handoffFadeOut < 1;

  // Create a unique ID for the gradient based on the sectionId
  const gradientId = `dot-gradient-${sectionId}`;

  // Determine how many dots to render for the custom dotted trail
  const numDots = 24;

  const isHoverEnabled = introProgress >= 0.99 && introHandoffProgress === 0;

  return (
    <div
      id={id}
      data-intro-guide={sectionId}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        willChange: "transform, opacity",
        transform: "translate3d(-9999px, -9999px, 0)",
        transition: "opacity 0.2s ease-out",
      }}
    >
      <div
        onMouseEnter={() => {
          if (!isHoverEnabled) return;
          useFoldStore.getState().setActiveAmbientMediaId(sectionId);
        }}
        onMouseLeave={() => {
          useFoldStore.getState().setActiveAmbientMediaId(null);
        }}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          // X: calc(0% - 60px + 32px) aligns the left of the actual content 32px to the right of the anchor.
          // Y: calc(-100% + 60px) aligns the bottom of the actual content exactly to the anchor (goes UP from the corner).
          padding: "60px",
          transform: "translate(calc(0% - 60px + 12px), calc(-100% + 60px))",
          pointerEvents: isHoverEnabled ? "auto" : "none",
          cursor: isHoverEnabled ? "pointer" : "default",
          opacity: (1 - handoffFadeOut) * focusOpacity,
          transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <svg
          width={12}
          height={polePx}
          style={{ overflow: "visible", flexShrink: 0 }}
          aria-hidden
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="0"
              y2={polePx}
              gradientUnits="userSpaceOnUse"
            >
              <stop
                offset="0%"
                stopColor={isDarkMode ? "#ffffff" : "#000000"}
              />
              <stop
                offset="100%"
                stopColor={isDarkMode ? "rgba(255,255,255,0)" : "rgba(0,0,0,0)"}
              />
            </linearGradient>
          </defs>

          <g fill={`url(#${gradientId})`}>
            {Array.from({ length: numDots }).map((_, i) => {
              const y = i * (polePx / (numDots - 1));

              // Growth logic: bottom to top
              // Normalized position from bottom (0 = bottom, 1 = top)
              const normFromBottom = (numDots - 1 - i) / (numDots - 1);

              // Individual dot progress: how much of the "growth" has reached this dot
              // We add a little bit of stagger/spread
              const dotProgress = Math.min(
                Math.max((rowProgress - normFromBottom * 0.8) / 0.2, 0),
                1,
              );

              // Tapering radius: top dots are larger, bottom dots are smaller
              const baseRadius = 2.0 - (i * 1.2) / (numDots - 1);
              const radius = baseRadius * dotProgress;

              // Subtle fade: bottom dots become slightly transparent for a sleek look
              const baseOpacity = 1 - (i * 0.5) / (numDots - 1);
              const opacity = baseOpacity * dotProgress;

              return (
                <circle
                  key={i}
                  cx={6}
                  cy={y}
                  r={radius}
                  opacity={opacity}
                  style={{
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              );
            })}
          </g>
        </svg>
        <div
          style={{
            opacity: Math.min(Math.max((rowProgress - 0.7) / 0.3, 0), 1),
            transition: "opacity 0.3s ease-out",
            marginLeft: "12px",
          }}
        >
          <AnimatedText
            text={caption}
            as="span"
            variant="caption"
            className="mr-2"
            glow={false}
            style={{
              marginTop: -2,
              fontSize: "clamp(12px, 1.55vw, 15px)",
              fontWeight: isActive ? 700 : 600,
              letterSpacing: isActive ? "0.04em" : "0.02em",
              color: isActive ? activeColor : textColor,
              lineHeight: 1.25,
              textShadow: "none",
              textTransform: "none",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
