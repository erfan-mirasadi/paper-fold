"use client";

import { usePopUpStore } from "./usePopUpStore";

export const PopUpUI = ({ isDarkMode }: { isDarkMode?: boolean }) => {
  const groups = usePopUpStore((state) => state.popUpGroups);
  const allOpen = usePopUpStore((state) => state.popUpAllOpen);
  const middleHorizontalFolded = usePopUpStore(
    (state) => state.middleHorizontalFolded,
  );
  const toggleAll = usePopUpStore((state) => state.toggleAllPopUps);
  const toggleGroup = usePopUpStore((state) => state.togglePopUpGroup);
  const toggleMiddleHorizontalFold = usePopUpStore(
    (state) => state.toggleMiddleHorizontalFold,
  );

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
        {/* <button
          onClick={toggleAll}
          style={{
            position: "absolute",
            transform: "translate(-50%, -50%)",
            padding: "12px",
            borderRadius: "50%",
            border: isDarkMode
              ? "1px solid rgba(255,255,255,0.2)"
              : "1px solid rgba(0,0,0,0.1)",
            background: isDarkMode
              ? "rgba(0,0,0,0.5)"
              : "rgba(255,255,255,0.7)",
            backdropFilter: "blur(10px)",
            color: isDarkMode ? "#fff" : "#000",
            cursor: "pointer",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease",
          }}
        >
          {allOpen ? "⊟" : "⊞"}
        </button> */}
      </div>

      {groups.map((group) => {
        const isMiddleGroup = group.id === "g_11_12_13_14";

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
            {/* MINIMAL TOGGLE BUTTON AT ANCHOR */}
            <button
              onClick={() => toggleGroup(group.id)}
              style={{
                position: "absolute",
                transform: "translate(-50%, -50%)",
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: group.isOpen
                  ? isDarkMode
                    ? "#fff"
                    : "#111"
                  : isDarkMode
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.1)",
                border: isDarkMode
                  ? "2px solid rgba(255,255,255,0.5)"
                  : "2px solid rgba(0,0,0,0.2)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {/* Inner dot indicator */}
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: group.isOpen
                    ? isDarkMode
                      ? "#111"
                      : "#fff"
                    : isDarkMode
                      ? "#fff"
                      : "#111",
                  margin: "auto",
                }}
              />
            </button>

            {isMiddleGroup && (
              <button
                onClick={toggleMiddleHorizontalFold}
                style={{
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                  top: 34,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: middleHorizontalFolded
                    ? isDarkMode
                      ? "#fff"
                      : "#111"
                    : isDarkMode
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.1)",
                  border: isDarkMode
                    ? "2px solid rgba(255,255,255,0.5)"
                    : "2px solid rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                title="Toggle horizontal fold"
              >
                <div
                  style={{
                    width: 8,
                    height: 2,
                    borderRadius: 2,
                    background: middleHorizontalFolded
                      ? isDarkMode
                        ? "#111"
                        : "#fff"
                      : isDarkMode
                        ? "#fff"
                        : "#111",
                    margin: "auto",
                  }}
                />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
