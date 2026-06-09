"use client";

import { useCameraStore } from "../../../stores/useCameraStore";
import {
  type CameraViewPreset,
  useCameraViewStore,
} from "../../../stores/useCameraViewStore";

interface ViewItem {
  id: CameraViewPreset;
  label: string;
}

const VIEW_ITEMS: ViewItem[] = [
  { id: "left", label: "Sol" },
  { id: "default", label: "Varsayilan" },
  { id: "right", label: "Sag" },
];

// Global scale knob for the whole preset overlay (buttons + icons + labels).
const CAMERA_PRESET_SCALE = 1.2;
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
          {/* rotate around center */}
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
    <div className="camera-presets-root">
      <div
        className="camera-presets-shell"
        role="group"
        aria-label="Kamera gorunum secimi"
      >
        {VIEW_ITEMS.map((item) => {
          const isActive = selectedView === item.id;
          const isCenter = item.id === "default";

          return (
            <button
              key={item.id}
              type="button"
              disabled={isLocked}
              aria-pressed={isActive}
              aria-label={`Kamera gorunum: ${item.label}`}
              onClick={(e) => {
                e.stopPropagation();
                requestView(item.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              className={`camera-preset-btn ${isActive ? "is-active" : ""} ${isCenter ? "is-center" : ""}`}
            >
              <span className="camera-preset-icon" aria-hidden="true">
                <PaperViewIcon preset={item.id} />
              </span>
              <span className="camera-preset-label">{item.label}</span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .camera-presets-root {
          position: fixed;
          left: calc(var(--safe-left) + 10px);
          bottom: calc(var(--safe-bottom) + 10px);
          z-index: 999993;
          pointer-events: none;
          user-select: none;
          transform: scale(${CAMERA_PRESET_SCALE});
          transform-origin: left bottom;
        }

        .camera-presets-shell {
          pointer-events: auto;
          display: grid;
          grid-template-columns: repeat(3, minmax(66px, 1fr));
          gap: 4px;
          padding: 5px;
          border-radius: 12px;
          border: var(--overlay-border);
          background: var(--overlay-bg);
          box-shadow: var(--overlay-shadow);
          backdrop-filter: blur(14px) saturate(124%);
          -webkit-backdrop-filter: blur(14px) saturate(124%);
        }

        .camera-preset-btn {
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.2);
          color: var(--overlay-text);
          height: 42px;
          padding: 0 4px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          font-family:
            "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif;
          letter-spacing: 0.01em;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease,
            background 150ms ease;
        }

        .camera-preset-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .camera-preset-btn:not(:disabled):hover {
          border-color: rgba(255, 255, 255, 0.52);
          background: rgba(255, 255, 255, 0.28);
        }

        .camera-preset-btn.is-active {
          border-color: rgba(255, 255, 255, 0.72);
          color: var(--overlay-text);
          background: var(--overlay-knob-bg);
          box-shadow: var(--overlay-knob-shadow);
        }

        .camera-preset-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          opacity: 0.93;
        }

        .camera-preset-btn.is-center .camera-preset-icon {
          transform: translateY(1px);
        }

        .camera-preset-label {
          font-size: 9px;
          font-weight: 600;
          line-height: 1;
          white-space: nowrap;
        }

        @media (max-width: 760px) {
          .camera-presets-root {
            left: calc(var(--safe-left) + 8px);
            bottom: calc(var(--safe-bottom) + 8px);
            transform: scale(${CAMERA_PRESET_SCALE * 0.93});
          }

          .camera-presets-shell {
            grid-template-columns: repeat(3, minmax(56px, 1fr));
            padding: 4px;
            gap: 4px;
            border-radius: 11px;
          }

          .camera-preset-btn {
            height: 35px;
            padding: 0 3px;
            border-radius: 8px;
          }

          .camera-preset-icon {
            transform: scale(0.88);
          }

          .camera-preset-label {
            font-size: 8.5px;
          }
        }
      `}</style>
    </div>
  );
}
