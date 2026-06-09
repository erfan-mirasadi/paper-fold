"use client";

import { useEffect, useRef, memo } from "react";
import type { ElevatedSectionId } from "../../stores/useElevatedStore";
import {
  INTRO_SECTION_GUIDE_ORDER,
  introGuideMarkerDomId,
} from "../canvas/intro/section-guides/introGuideAnchorLayout";
import { useStoryStore } from "../../stores/useStoryStore";
import { useFoldStore } from "../canvas/orchestrator/ScrollManager";

export function IntroSectionGuidesOverlay() {
  const polePx = 165;
  const line = "rgba(180,210,255,0.92)";
  const tip = "#a8dcff";
  const textColor = "rgba(232,243,255,0.94)";

  useEffect(() => {
    // Vanilla subscribe shields the parent from 60fps React re-renders
    return useFoldStore.subscribe((state, prevState) => {
      // Clear hover state if we enter the handoff phase, OR if the user scrolls significantly
      const enteredHandoff =
        state.introHandoffProgress > 0 && prevState.introHandoffProgress <= 0;
      const userScrolled =
        state.activeAmbientMediaId !== null &&
        Math.abs(state.rawOffset - prevState.rawOffset) > 0.001;

      if (enteredHandoff || userScrolled) {
        useFoldStore.getState().setActiveAmbientMediaId(null);
      }
    });
  }, []);

  const config = useStoryStore((state) => state.activeConfig);

  return (
    <div
      className="pointer-events-none"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "visible",
      }}
    >
      {INTRO_SECTION_GUIDE_ORDER.map((id: ElevatedSectionId) => (
        <IntroGuideHudRow
          key={id}
          sectionId={id}
          caption={config.introGuides?.[id] || ""}
          polePx={polePx}
          lineStroke={line}
          tipFill={tip}
          textColor={textColor}
        />
      ))}
    </div>
  );
}

const IntroGuideHudRow = memo(function IntroGuideHudRow({
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

  // Refs for imperative DOM updates
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const circlesRef = useRef<(SVGCircleElement | null)[]>([]);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const pingRef = useRef<SVGGElement>(null);

  // Fixed dark mode context for monochrome styling
  const activeColor = "#ffffff";

  // Calculate row-specific progress constraints once
  const index = INTRO_SECTION_GUIDE_ORDER.indexOf(sectionId);
  const numSteps = INTRO_SECTION_GUIDE_ORDER.length;
  const startOffset = 0.35;
  const endOffset = 0.95;
  const usable = endOffset - startOffset;
  const perStep = usable / numSteps;

  const myStart = startOffset + index * perStep;
  const myEnd = myStart + perStep;

  const fadeOutWindow = 0.7;
  const reversedIndex = numSteps - 1 - index;
  const handoffStart = (reversedIndex * fadeOutWindow) / numSteps;
  const handoffEnd = handoffStart + fadeOutWindow / numSteps;

  const numDots = 22;
  const unselectedProgress = 0.55;
  const GUIDE_X_OFFSET = 65; // TWEAK THIS: Increase to move the dots further to the right!

  useEffect(() => {
    // Dedicated subscription loop for the actual updates
    const updateDOM = (state: any) => {
      const {
        introProgress,
        introHandoffProgress,
        ambientProgress,
        isIntroActive,
        activeAmbientMediaId,
        scrollAmbientMediaId,
      } = state;

      const effectiveActiveId = activeAmbientMediaId || scrollAmbientMediaId;
      const isActive =
        effectiveActiveId === sectionId ||
        (effectiveActiveId &&
          effectiveActiveId.startsWith(`${sectionId}_step`));
      const isAnyActive = effectiveActiveId !== null;
      const focusOpacity = isAnyActive ? (isActive ? 1 : 0.55) : 1;

      const rowProgress = Math.min(
        Math.max((introProgress - myStart) / (myEnd - myStart), 0),
        1,
      );

      const handoffFadeOut = Math.min(
        Math.max(
          (introHandoffProgress - handoffStart) / (handoffEnd - handoffStart),
          0,
        ),
        1,
      );

      const isVisible =
        isIntroActive && introProgress >= myStart && handoffFadeOut < 1;
      const isHoverEnabled =
        (ambientProgress > 0 || introProgress >= 0.99) &&
        introHandoffProgress === 0;

      const effectiveRowProgress = isActive
        ? rowProgress
        : Math.min(rowProgress, unselectedProgress);

      const textNorm = Math.max(
        0,
        Math.min((effectiveRowProgress - 0.1) / 0.8, 1),
      );
      const textTranslateY = polePx * (1 - textNorm);

      const animDuration = isHoverEnabled ? "1.5s" : "0.4s";
      const animEasing = isHoverEnabled
        ? "cubic-bezier(0.22, 1, 0.36, 1)"
        : "cubic-bezier(0.16, 1, 0.3, 1)";

      if (rootRef.current) {
        rootRef.current.style.opacity = isVisible ? "1" : "0";
        rootRef.current.style.visibility = isVisible ? "visible" : "hidden";
      }

      if (innerRef.current) {
        innerRef.current.style.opacity = (
          (1 - handoffFadeOut) *
          focusOpacity
        ).toString();
      }

      if (textContainerRef.current) {
        textContainerRef.current.style.opacity = Math.min(
          Math.max((rowProgress - 0.7) / 0.3, 0),
          1,
        ).toString();
        textContainerRef.current.style.transform = `translateY(${textTranslateY}px)`;
        textContainerRef.current.style.transition = isHoverEnabled
          ? `opacity 0.3s ease-out, transform ${animDuration} ${animEasing}`
          : `opacity 0.3s ease-out`;
        textContainerRef.current.style.pointerEvents = isHoverEnabled
          ? "auto"
          : "none";
        textContainerRef.current.style.cursor = isHoverEnabled
          ? "pointer"
          : "default";
      }

      if (textRef.current) {
        textRef.current.style.fontWeight = isActive ? "700" : "600";
        textRef.current.style.letterSpacing = isActive ? "0.04em" : "0.02em";
        if (isActive) {
          textRef.current.classList.add("text-black", "in-[.dark]:text-white");
          textRef.current.classList.remove("text-black/60", "in-[.dark]:text-[rgba(232,243,255,0.94)]");
        } else {
          textRef.current.classList.add("text-black/60", "in-[.dark]:text-[rgba(232,243,255,0.94)]");
          textRef.current.classList.remove("text-black", "in-[.dark]:text-white");
        }
      }

      if (pingRef.current) {
        pingRef.current.style.opacity = isHoverEnabled ? "0.85" : "0";
        pingRef.current.style.pointerEvents = isHoverEnabled ? "auto" : "none";
        pingRef.current.style.transform = `translateY(${textTranslateY}px)`;
        pingRef.current.style.transition = isHoverEnabled
          ? `opacity 0.3s ease-out, transform ${animDuration} ${animEasing}`
          : `opacity 0.3s ease-out`;
      }

      for (let i = 0; i < numDots; i++) {
        const circle = circlesRef.current[i];
        if (!circle) continue;

        const normFromBottom = (numDots - 1 - i) / (numDots - 1);
        const dotProgress = Math.min(
          Math.max((effectiveRowProgress - normFromBottom * 0.8) / 0.2, 0),
          1,
        );
        const baseRadius = 2.0 - (i * 1.2) / (numDots - 1);
        const radius = baseRadius * dotProgress;
        const baseOpacity = 1 - (i * 0.2) / (numDots - 1);
        const opacity = baseOpacity * dotProgress;

        const delay = isHoverEnabled
          ? isActive
            ? normFromBottom * 0.4
            : (1 - normFromBottom) * 0.2
          : 0;

        circle.setAttribute("r", radius.toString());
        circle.setAttribute("opacity", opacity.toString());
        circle.style.transition = `all ${animDuration} ${animEasing} ${delay}s`;
      }
    };

    const unsubscribe = useFoldStore.subscribe(updateDOM);

    // Force an initial update immediately on mount
    updateDOM(useFoldStore.getState());

    return unsubscribe;
  }, [
    sectionId,
    polePx,
    activeColor,
    textColor,
    myStart,
    myEnd,
    handoffStart,
    handoffEnd,
    unselectedProgress,
  ]);

  const gradientId = `dot-gradient-${sectionId}`;

  return (
    <div
      ref={rootRef}
      id={id}
      data-intro-guide={sectionId}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        opacity: 0, // Starts hidden, updated by effect
        visibility: "hidden",
        willChange: "transform, opacity",
        transform: "translate3d(-9999px, -9999px, 0)",
        transition: "opacity 0.2s ease-out",
      }}
    >
      <div
        ref={innerRef}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          padding: "60px",
          transform: `translate(calc(0% - 60px + ${GUIDE_X_OFFSET}px), calc(-100% + 60px))`,
          pointerEvents: "none",
          opacity: 0, // Starts hidden, updated by effect
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
                className="[stop-color:#000000] in-[.dark]:[stop-color:#ffffff]"
              />
              <stop
                offset="100%"
                className="[stop-color:rgba(0,0,0,0.15)] in-[.dark]:[stop-color:rgba(255,255,255,0.15)]"
              />
            </linearGradient>
          </defs>

          {/* Pulsing indicator group at the top */}
          <g
            ref={pingRef}
            style={{
              opacity: 0,
              transition: "opacity 0.4s ease-out",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              const store = useFoldStore.getState();
              const isHoverEnabled =
                (store.ambientProgress > 0 || store.introProgress >= 0.99) &&
                store.introHandoffProgress === 0;
              if (!isHoverEnabled) return;
              store.setActiveAmbientMediaId(
                store.activeAmbientMediaId === sectionId ? null : sectionId,
              );
            }}
          >
            <circle
              cx={6}
              cy={0}
              r={4}
              className="animate-ping fill-black in-[.dark]:fill-white"
              style={{ transformOrigin: "6px 0px", animationDuration: "1.5s" }}
            />
            <circle
              cx={6}
              cy={0}
              r={3}
              className="fill-black in-[.dark]:fill-white"
            />
          </g>

          <g fill={`url(#${gradientId})`}>
            {Array.from({ length: numDots }).map((_, i) => {
              const y = i * (polePx / (numDots - 1));
              return (
                <circle
                  key={i}
                  ref={(el) => {
                    circlesRef.current[i] = el;
                  }}
                  cx={6}
                  cy={y}
                  r={0} // Computed imperatively
                  opacity={0} // Computed imperatively
                />
              );
            })}
          </g>
        </svg>
        <div
          ref={textContainerRef}
          onClick={(e) => {
            e.stopPropagation();
            const store = useFoldStore.getState();
            // We check hover capability manually because state is not in React
            const isHoverEnabled =
              (store.ambientProgress > 0 || store.introProgress >= 0.99) &&
              store.introHandoffProgress === 0;
            if (!isHoverEnabled) return;
            store.setActiveAmbientMediaId(
              store.activeAmbientMediaId === sectionId ? null : sectionId,
            );
          }}
          style={{
            opacity: 0, // Computed imperatively
            transform: `translateY(0px)`, // Computed imperatively
            transition: `opacity 0.3s ease-out`,
            pointerEvents: "none",
            cursor: "default",
            marginLeft: 6, // TWEAK THIS: Increase this value to add more distance from the circles
          }}
        >
          <span
            ref={textRef}
            className="mr-2 text-sm md:text-base font-medium tracking-widest font-sans inline-block whitespace-nowrap"
            style={{
              position: "relative",
              top: -12,
              fontSize: "clamp(12px, 1.55vw, 15px)",
              lineHeight: 1.25,
              textShadow: "none",
              textTransform: "none",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {caption}
          </span>
        </div>
      </div>
    </div>
  );
});
