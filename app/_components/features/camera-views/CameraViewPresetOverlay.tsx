"use client";

import { useCameraStore } from "../camera-zoom/useCameraStore";
import {
  type CameraViewPreset,
  useCameraViewStore,
} from "./useCameraViewStore";

interface ViewItem {
  id: CameraViewPreset;
  label: string;
}

const VIEW_ITEMS: ViewItem[] = [
  { id: "left", label: "Sol" },
  { id: "default", label: "Varsayilan" },
  { id: "right", label: "Sag" },
];

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        d="M7.8 7.2h4.1l1.1-1.5h3.3l1.1 1.5h1.6a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.2a2 2 0 0 1 2-2h2.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12.8"
        r="3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function PaperViewIcon({ preset }: { preset: CameraViewPreset }) {
  if (preset === "left") {
    return (
      <svg viewBox="0 0 28 18" width="24" height="16" aria-hidden="true">
        <path
          d="M24 13.5 12.5 8.2 4 11.3 15.5 16.5Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M24 13.5V6.8L12.5 1.5V8.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M24 13.5 12.5 8.2 4 11.3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (preset === "right") {
    return (
      <svg viewBox="0 0 28 18" width="24" height="16" aria-hidden="true">
        <path
          d="M4 13.5 15.5 8.2 24 11.3 12.5 16.5Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M4 13.5V6.8L15.5 1.5V8.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M4 13.5 15.5 8.2 24 11.3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 28 18" width="24" height="16" aria-hidden="true">
      <rect
        x="4.2"
        y="2.2"
        width="19.6"
        height="13.6"
        rx="1.8"
        fill="currentColor"
        opacity="0.18"
      />
      <rect
        x="4.2"
        y="2.2"
        width="19.6"
        height="13.6"
        rx="1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M8.2 6.2h11.6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
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
        <div className="camera-header">
          <span className="camera-header-icon" aria-hidden="true">
            <CameraIcon />
          </span>
          <span className="camera-header-title">Kamera</span>
        </div>

        {VIEW_ITEMS.map((item) => {
          const isActive = selectedView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              disabled={isLocked}
              aria-pressed={isActive}
              aria-label={`Kamera gorunum: ${item.label}`}
              onClick={() => requestView(item.id)}
              className={`camera-preset-btn ${isActive ? "is-active" : ""}`}
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
          left: 16px;
          bottom: 16px;
          z-index: 999993;
          pointer-events: none;
          user-select: none;
        }

        .camera-presets-shell {
          pointer-events: auto;
          display: grid;
          grid-template-columns: repeat(3, minmax(84px, 1fr));
          gap: 6px;
          padding: 8px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.34);
          background:
            radial-gradient(
              160% 140% at 9% -90%,
              rgba(255, 255, 255, 0.62) 0%,
              rgba(255, 255, 255, 0.18) 50%,
              rgba(255, 255, 255, 0.1) 100%
            ),
            linear-gradient(
              180deg,
              rgba(250, 251, 253, 0.6) 0%,
              rgba(226, 230, 236, 0.32) 100%
            );
          box-shadow:
            0 12px 30px rgba(19, 22, 29, 0.16),
            0 2px 0 rgba(255, 255, 255, 0.54) inset,
            0 -1px 0 rgba(255, 255, 255, 0.24) inset;
          backdrop-filter: blur(18px) saturate(130%);
          -webkit-backdrop-filter: blur(18px) saturate(130%);
        }

        .camera-header {
          grid-column: 1 / -1;
          min-height: 24px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 4px 2px;
          color: rgba(15, 18, 24, 0.84);
        }

        .camera-header-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.44);
          border: 1px solid rgba(255, 255, 255, 0.52);
        }

        .camera-header-title {
          font-family:
            "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .camera-preset-btn {
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.2);
          color: rgba(26, 30, 37, 0.84);
          height: 52px;
          padding: 0 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
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
          color: #101318;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(236, 240, 246, 0.84) 100%
          );
          box-shadow:
            0 6px 14px rgba(35, 42, 55, 0.14),
            0 1px 0 rgba(255, 255, 255, 0.72) inset;
        }

        .camera-preset-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          opacity: 0.9;
        }

        .camera-preset-label {
          font-size: 11px;
          font-weight: 600;
          line-height: 1;
          white-space: nowrap;
        }

        @media (max-width: 760px) {
          .camera-presets-root {
            left: 10px;
            bottom: 10px;
          }

          .camera-presets-shell {
            grid-template-columns: repeat(3, minmax(72px, 1fr));
            padding: 5px;
            gap: 5px;
            border-radius: 14px;
          }

          .camera-preset-btn {
            height: 46px;
            padding: 0 6px;
            border-radius: 10px;
          }

          .camera-preset-icon {
            transform: scale(0.92);
          }

          .camera-preset-label {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
