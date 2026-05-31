"use client";

import { useEffect, useRef, memo } from "react";
import type { ElevatedSectionId } from "../../stores/useElevatedStore";
import {
  INTRO_SECTION_GUIDE_ORDER,
  introGuideMarkerDomId,
} from "../canvas/intro/section-guides/introGuideAnchorLayout";
import { INTRO_SECTION_GUIDE_UI_TEXT } from "../../data/introSectionGuideCopy";
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

  useEffect(() => {
    // Vanilla subscribe shields the parent from 60fps React re-renders
    return useFoldStore.subscribe((state, prevState) => {
      if (
        state.introHandoffProgress > 0 &&
        prevState.introHandoffProgress <= 0
      ) {
        useFoldStore.getState().setActiveAmbientMediaId(null);
      }
    });
  }, []);

  return (
    <div
      className="pointer-events-none"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "visible",
      }}
    >
      <style>{`
        @keyframes energyBeamFlow {
          0% { stroke-dashoffset: 280; }
          100% { stroke-dashoffset: -40; }
        }
      `}</style>
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

  const cache = useRef<Record<string, string>>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const pingRef = useRef<SVGGElement>(null);
  const beamRef = useRef<SVGPathElement>(null);

  // Determine dark mode context for monochrome styling
  const isDarkMode = textColor.includes("232");
  const activeColor = isDarkMode ? "#ffffff" : "#000000";

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

  const unselectedProgress = 1.0; // Draw the full L-shape even when unselected
  const pathLength = 212; // 100px horizontal + 112px vertical
  const GUIDE_X_OFFSET = 30; // TWEAK THIS: Increase to move the line further to the right!

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
      // Lines fade to 40% when another item is selected
      const lineFocusOpacity = isAnyActive ? (isActive ? 1 : 0.4) : 1;
      // Text fades much more (to 15%) when another item is selected
      const textFocusOpacity = isAnyActive ? (isActive ? 1 : 0.15) : 1;

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

      const targetWidth = isActive ? 100 : 40;
      const currentPathLength = targetWidth + polePx;

      const textNorm = Math.max(
        0,
        Math.min((effectiveRowProgress - 0.1) / 0.8, 1),
      );
      const textTranslateY = polePx * (1 - textNorm);

      const animDuration = isHoverEnabled ? "1.5s" : "0.4s";
      const animEasing = isHoverEnabled
        ? "cubic-bezier(0.22, 1, 0.36, 1)"
        : "cubic-bezier(0.16, 1, 0.3, 1)";

      const c = cache.current;

      if (rootRef.current) {
        const op = isVisible ? "1" : "0";
        const vis = isVisible ? "visible" : "hidden";
        if (c.rootOp !== op) { rootRef.current.style.opacity = op; c.rootOp = op; }
        if (c.rootVis !== vis) { rootRef.current.style.visibility = vis; c.rootVis = vis; }
      }

      if (innerRef.current) {
        const op = (1 - handoffFadeOut).toString();
        if (c.innerOp !== op) { innerRef.current.style.opacity = op; c.innerOp = op; }
      }

      if (textContainerRef.current) {
        const baseTextOpacity = Math.min(Math.max((rowProgress - 0.7) / 0.3, 0), 1);
        const op = (baseTextOpacity * textFocusOpacity).toString();
        const trans = `translate(calc(${targetWidth}px - 50%), 0px)`;
        const transi = isHoverEnabled
          ? `opacity 0.5s ease-out, transform 1s ease-out`
          : `transform 1s ease-out`; // Remove opacity transition during scroll
        const pe = isHoverEnabled ? "auto" : "none";
        const cur = isHoverEnabled ? "pointer" : "default";

        if (c.textOp !== op) { textContainerRef.current.style.opacity = op; c.textOp = op; }
        if (c.textTrans !== trans) { textContainerRef.current.style.transform = trans; c.textTrans = trans; }
        if (c.textTransi !== transi) { textContainerRef.current.style.transition = transi; c.textTransi = transi; }
        if (c.textPe !== pe) { textContainerRef.current.style.pointerEvents = pe; c.textPe = pe; }
        if (c.textCur !== cur) { textContainerRef.current.style.cursor = cur; c.textCur = cur; }
      }

      if (textRef.current) {
        const fw = isActive ? "800" : "600";
        const ls = isActive ? "0.05em" : "0.02em";
        const tc = isActive ? activeColor : textColor;
        const trans = isActive ? "scale(1.1) translateY(-3px)" : "scale(0.85)";
        const ts = isActive
          ? isDarkMode
            ? "0 4px 15px rgba(0,0,0,1), 0 0 20px rgba(255,255,255,0.3)"
            : "0 4px 15px rgba(255,255,255,1), 0 0 20px rgba(0,0,0,0.2)"
          : "none";

        if (c.textFw !== fw) { textRef.current.style.fontWeight = fw; c.textFw = fw; }
        if (c.textLs !== ls) { textRef.current.style.letterSpacing = ls; c.textLs = ls; }
        if (c.textC !== tc) { textRef.current.style.color = tc; c.textC = tc; }
        if (c.textT !== trans) { textRef.current.style.transform = trans; c.textT = trans; }
        if (c.textS !== ts) { textRef.current.style.textShadow = ts; c.textS = ts; }
      }

      if (pingRef.current) {
        const op = isHoverEnabled ? (isActive ? "1" : lineFocusOpacity.toString()) : "0";
        const pe = isHoverEnabled ? "auto" : "none";
        const trans = `translate(${targetWidth}px, 0px)`;
        const transi = isHoverEnabled ? `opacity 0.5s ease-out, transform 1s ease-out` : `transform 1s ease-out`;

        if (c.pingOp !== op) { pingRef.current.style.opacity = op; c.pingOp = op; }
        if (c.pingPe !== pe) { pingRef.current.style.pointerEvents = pe; c.pingPe = pe; }
        if (c.pingTrans !== trans) { pingRef.current.style.transform = trans; c.pingTrans = trans; }
        if (c.pingTransi !== transi) { pingRef.current.style.transition = transi; c.pingTransi = transi; }
      }

      if (pathRef.current) {
        const drawProgress = Math.min(Math.max((effectiveRowProgress - 0.2) / 0.6, 0), 1);
        const d = `M ${targetWidth} 1 L 0 1 L 0 ${polePx}`;
        const sda = `${currentPathLength}`;
        const sdo = `${-currentPathLength * (1 - drawProgress)}`;
        const op = lineFocusOpacity.toString();
        const sw = isActive ? "3.5" : "1.5";
        const fil = isActive
          ? `drop-shadow(0 0 4px ${lineStroke}) drop-shadow(0 0 12px ${lineStroke}) drop-shadow(0 0 25px ${lineStroke})`
          : `drop-shadow(0 0 2px ${lineStroke})`;
        const transi = isHoverEnabled
          ? `d 1s ease-out, stroke-dashoffset ${animDuration} ${animEasing}, opacity 0.5s ease-out, stroke-width 1s ease-out, filter 1s ease-out`
          : `d 1s ease-out, stroke-width 1s ease-out, filter 1s ease-out`; // Remove scroll-driven props from transition

        if (c.pathD !== d) { pathRef.current.setAttribute("d", d); c.pathD = d; }
        if (c.pathSda !== sda) { pathRef.current.style.strokeDasharray = sda; c.pathSda = sda; }
        if (c.pathSdo !== sdo) { pathRef.current.style.strokeDashoffset = sdo; c.pathSdo = sdo; }
        if (c.pathOp !== op) { pathRef.current.style.opacity = op; c.pathOp = op; }
        if (c.pathSw !== sw) { pathRef.current.style.strokeWidth = sw; c.pathSw = sw; }
        if (c.pathFil !== fil) { pathRef.current.style.filter = fil; c.pathFil = fil; }
        if (c.pathTransi !== transi) { pathRef.current.style.transition = transi; c.pathTransi = transi; }
      }

      if (beamRef.current) {
        const d = `M ${targetWidth} 1 L 0 1 L 0 ${polePx}`;
        const op = isActive ? "1" : "0";
        if (c.beamD !== d) { beamRef.current.setAttribute("d", d); c.beamD = d; }
        if (c.beamOp !== op) { beamRef.current.style.opacity = op; c.beamOp = op; }
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
          flexDirection: "column", // Text above, SVG below
          alignItems: "flex-start",
          padding: "60px",
          // Anchor the bottom of the L-shape (x=0, y=polePx) to the 3D position
          // SVG x=0 is at 60px from the left (with 60px padding)
          // Adding GUIDE_X_OFFSET shifts the whole overlay to the right
          transform: `translate(calc(0% - 60px + ${GUIDE_X_OFFSET}px), calc(-100% + 60px))`,
          pointerEvents: "none",
          opacity: 0, // Starts hidden, updated by effect
        }}
      >
        <div
          ref={textContainerRef}
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
          style={{
            opacity: 0,
            // Slide horizontally based on targetWidth, no vertical sliding
            transform: `translate(calc(40px - 50%), 0px)`,
            transition: `opacity 0.5s ease-out, transform 1s ease-out`,
            pointerEvents: "none",
            cursor: "default",
            marginBottom: "10px", // Increased space between text and horizontal line
          }}
        >
          <span
            ref={textRef}
            className="text-sm md:text-base font-medium tracking-widest font-sans inline-block whitespace-nowrap"
            style={{
              fontSize: "clamp(14px, 1.8vw, 17px)", // Increased font size
              lineHeight: 1.25,
              textTransform: "none",
              transformOrigin: "center bottom",
              // Much slower transition for the text scaling and color change
              transition: "all 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {caption}
          </span>
        </div>

        <svg
          width={102}
          height={polePx + 2}
          style={{ overflow: "visible", flexShrink: 0 }}
          aria-hidden
        >
          {/* L-shape path pointing RIGHT */}
          <path
            ref={pathRef}
            d={`M 100 1 L 0 1 L 0 ${polePx}`}
            fill="none"
            stroke={lineStroke}
            strokeWidth="2" // Slightly thinner core for better neon glow
            strokeLinecap="round"
            strokeLinejoin="round"
            // Default styles are overridden by the DOM update loop above
          />

          {/* Flowing Energy Beam Overlay (visible only when active) */}
          <path
            ref={beamRef}
            d={`M 100 1 L 0 1 L 0 ${polePx}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.4)" // Softer core stroke
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              // Added blur(1.5px) to completely soften the edges so it looks like light, not a hard line
              filter: `blur(1.5px) drop-shadow(0 0 6px rgba(255,255,255,0.8)) drop-shadow(0 0 12px ${lineStroke})`,
              strokeDasharray: "40 280", // 40px dash length, 280px gap
              animation: "energyBeamFlow 4.5s linear infinite", // Much slower (was 3s)
              opacity: 0,
            }}
          />

          {/* Pulsing indicator at the start of the line (near text) temporarily commented out
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
            <circle cx={0} cy={1} r={3.5} fill={activeColor} />
          </g>
          */}
        </svg>
      </div>
    </div>
  );
});
