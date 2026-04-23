"use client";

import { usePopUpStore } from "./usePopUpStore";

export const PopUpUI = ({ isDarkMode }: { isDarkMode?: boolean }) => {
  void isDarkMode;
  const groups = usePopUpStore((state) => state.popUpGroups);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 999998,
      }}
    >
      <div
        id="popup-anchor-global"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          visibility: "hidden",
          opacity: 0,
          transition: "opacity 0.4s ease-out",
          willChange: "transform, opacity",
        }}
      >
        {/* Global anchor kept for tracker alignment. */}
      </div>

      {groups.map((group) => {
        return (
          <div
            key={group.id}
            id={`popup-anchor-${group.id}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              visibility: "hidden",
              opacity: 0,
              transition: "opacity 0.4s ease-out",
              willChange: "transform, opacity",
            }}
          >
            {/* Anchor is only for 3D-to-DOM tracker positioning. */}
          </div>
        );
      })}
    </div>
  );
};
