"use client";

import { useCameraStore } from "../../../stores/useCameraStore";
import {
  type CameraViewPreset,
  useCameraViewStore,
} from "../../../stores/useCameraViewStore";
import { OverlayButton } from "./OverlayButton";

interface ViewItem {
  id: CameraViewPreset;
  label: string;
}

const VIEW_ITEMS: ViewItem[] = [
  { id: "left", label: "Sol" },
  { id: "default", label: "Varsayilan" },
  { id: "right", label: "Sag" },
];

const PAPER_BORDER_STROKE = 1.05;

function QuranTextMarks() {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M0.2 0.6h7.2" strokeWidth="0.62" />
      <path d="M0 2.1h7.4" strokeWidth="0.6" />
      <path d="M0.4 3.6h6.6" strokeWidth="0.58" />
    </g>
  );
}

function PaperIcon({
  angle = 0,
  mirror = false,
}: {
  angle?: number;
  mirror?: boolean;
}) {
  return (
    <svg viewBox="0 0 28 20" width="18" height="14" aria-hidden="true">
      <g transform={mirror ? "translate(28 0) scale(-1 1)" : undefined}>
        <g transform={`translate(14 10) rotate(${angle}) translate(-14 -10)`}>
          <rect
            x="9"
            y="1.5"
            width="10"
            height="16"
            rx="1.35"
            fill="currentColor"
            opacity="0.14"
          />
          <rect
            x="9"
            y="1.5"
            width="10"
            height="16"
            rx="1.35"
            fill="none"
            stroke="currentColor"
            strokeWidth={PAPER_BORDER_STROKE}
          />
          <g transform="translate(11 7)" opacity="0.78">
            <QuranTextMarks />
          </g>
        </g>
      </g>
    </svg>
  );
}

function PaperViewIcon({ preset }: { preset: CameraViewPreset }) {
  if (preset === "left") {
    return <PaperIcon angle={-8} />;
  }

  if (preset === "right") {
    return <PaperIcon angle={8} />;
  }

  return <PaperIcon angle={0} />;
}

export function CameraViewPresetOverlay() {
  const zoomPhase = useCameraStore((s) => s.phase);
  const requestView = useCameraViewStore((s) => s.requestView);
  const selectedView = useCameraViewStore((s) => s.selectedView);

  const isLocked = zoomPhase !== "idle";

  return (
    <div className="fixed left-[calc(var(--safe-left)+8px)] md:left-[calc(var(--safe-left)+10px)] bottom-[calc(var(--safe-bottom)+8px)] md:bottom-[calc(var(--safe-bottom)+10px)] z-[999993] pointer-events-none select-none origin-bottom-left scale-[1.116] md:scale-[1.2] flex flex-row items-center gap-2">
      {VIEW_ITEMS.map((item) => {
        const isActive = selectedView === item.id;
        const isCenter = item.id === "default";

        return (
          <OverlayButton
            key={item.id}
            disabled={isLocked}
            isActive={isActive}
            aria-pressed={isActive}
            aria-label={`Kamera gorunum: ${item.label}`}
            onClick={(e) => {
              e.stopPropagation();
              requestView(item.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            className={`flex flex-col items-center justify-center p-2 w-12 h-12 text-[var(--foreground)] ${isCenter ? "[&>span:first-child]:translate-y-[1px]" : ""}`}
          >
            <span className="inline-flex items-center justify-center leading-none scale-[0.88] md:scale-100" aria-hidden="true">
              <PaperViewIcon preset={item.id} />
            </span>
            <span className="text-[8px] md:text-[9px] font-semibold leading-none whitespace-nowrap mt-1 uppercase tracking-wider">{item.label}</span>
          </OverlayButton>
        );
      })}
    </div>
  );
}
