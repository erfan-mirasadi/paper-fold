"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition } from "react";
import {
  SURAH_LANGUAGE_ORDER,
  type SurahLanguage,
  useSurahLanguageStore,
} from "../../../hooks/useSurahLanguageStore";
import { OverlayButton } from "./OverlayButton";

const LABEL_BY_LANGUAGE: Record<SurahLanguage, string> = {
  ar: "AR",
  en: "EN",
  tr: "TR",
};

export function LanguageSwitchOverlay() {
  const activeLanguage = useSurahLanguageStore((s) => s.activeLanguage);
  const setLanguage = useSurahLanguageStore((s) => s.setLanguage);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fluid sizing: keep mobile + XL feeling consistent, smooth in-between.
  const rightOffset = "clamp(118px, 15vw, 160px)";
  const buttonH = "clamp(38px, 4.2vw, 44px)";
  const buttonRadius = "clamp(12px, 1.4vw, 14px)";
  const fontSize = "clamp(10px, 1.15vw, 11px)";
  const itemFontSize = fontSize;
  const BUTTON_W_CLOSED = "clamp(52px, 6vw, 62px)";
  const BUTTON_W_OPEN = "clamp(40px, 4.8vw, 45px)";
  const PANEL_W = "clamp(84px, 9.5vw, 96px)";
  const panelTop = "calc(" + buttonH + " + 6px)";
  const panelPad = "clamp(5px, 0.7vw, 6px)";
  const panelRadius = buttonRadius;
  const itemH = "clamp(30px, 3.2vw, 34px)";
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 170, damping: 22 }}
        style={{
          position: "fixed",
          top: "16px",
          right: rightOffset,
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        <motion.div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onFocusCapture={() => setIsOpen(true)}
          onBlurCapture={() => setIsOpen(false)}
          style={{
            pointerEvents: "auto",
            position: "relative",
            color: "var(--overlay-text)",
            width: BUTTON_W_OPEN,
          }}
        >
          <OverlayButton
            aria-label="Language menu"
            onPointerDown={(e) => e.preventDefault()}
            animate={{ width: isOpen ? BUTTON_W_OPEN : BUTTON_W_CLOSED }}
            transition={{ type: "spring", stiffness: 330, damping: 30 }}
            height={buttonH}
            borderRadius={buttonRadius}
            gap="5px"
            padding="0 10px"
            fontSize={fontSize}
            fontWeight={700}
            style={{
              letterSpacing: "0.03em",
              userSelect: "none",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                opacity: isPending ? 0.6 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {LABEL_BY_LANGUAGE[activeLanguage]}
            </span>
            <motion.span
              aria-hidden="true"
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              style={{ display: "inline-flex", opacity: 0.78 }}
            >
              <svg
                viewBox="0 0 16 16"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3.5 6 4.5 4 4.5-4" />
              </svg>
            </motion.span>
          </OverlayButton>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.985 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="overlay-panel"
                style={{
                  position: "absolute",
                  top: panelTop,
                  left: 0,
                  width: PANEL_W,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  padding: panelPad,
                  borderRadius: panelRadius,
                  transformOrigin: "top left",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    height: 1,
                    background: "var(--overlay-divider)",
                    margin: "2px 6px 4px 6px",
                    borderRadius: 999,
                  }}
                />
                {SURAH_LANGUAGE_ORDER.map((language) => {
                  const isActive = language === activeLanguage;
                  return (
                    <motion.button
                      key={language}
                      type="button"
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (activeLanguage !== language) {
                          startTransition(() => {
                            setLanguage(language);
                          });
                          setIsOpen(false);
                        }
                      }}
                      whileHover={{
                        background: "var(--overlay-item-hover-bg)",
                        scale: 1.012,
                      }}
                      whileTap={{ scale: 0.99 }}
                      style={{
                        height: itemH,
                        borderRadius: "clamp(9px, 1.1vw, 10px)",
                        border: isActive ? "var(--overlay-active-border)" : "none",
                        background: isActive
                          ? "var(--overlay-active-bg)"
                          : "var(--overlay-transparent-bg)",
                        boxShadow: isActive ? "var(--overlay-active-shadow)" : "none",
                        color: "var(--overlay-text)",
                        cursor: "pointer",
                        fontSize: itemFontSize,
                        fontWeight: 700,
                        letterSpacing: "0.03em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      {LABEL_BY_LANGUAGE[language]}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}
