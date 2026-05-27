"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  SURAH_LANGUAGE_ORDER,
  type SurahLanguage,
  useSurahLanguageStore,
} from "../../../hooks/useSurahLanguageStore";

interface LanguageSwitchOverlayProps {
  isDarkMode: boolean;
}

const LABEL_BY_LANGUAGE: Record<SurahLanguage, string> = {
  ar: "AR",
  en: "EN",
  tr: "TR",
};

export function LanguageSwitchOverlay({
  isDarkMode,
}: LanguageSwitchOverlayProps) {
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

  const buttonTheme = useMemo(() => {
    const border = isDarkMode
      ? "1px solid rgba(255,255,255,0.2)"
      : "1px solid rgba(255,255,255,0.34)";
    const background = isDarkMode
      ? "radial-gradient(150% 130% at 12% -90%, rgba(255,255,255,0.2) 0%, rgba(132,144,162,0.1) 45%, rgba(18,22,28,0.7) 100%), linear-gradient(180deg, rgba(20,24,32,0.74) 0%, rgba(9,12,18,0.84) 100%)"
      : "radial-gradient(160% 140% at 9% -90%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.1) 100%), linear-gradient(180deg, rgba(250,251,253,0.6) 0%, rgba(226,230,236,0.32) 100%)";
    const shadow = isDarkMode
      ? "0 12px 30px rgba(4, 7, 12, 0.48), 0 1px 0 rgba(255,255,255,0.16) inset, 0 -1px 0 rgba(255,255,255,0.08) inset"
      : "0 12px 30px rgba(19,22,29,0.16), 0 2px 0 rgba(255,255,255,0.54) inset, 0 -1px 0 rgba(255,255,255,0.24) inset";
    const text = isDarkMode ? "rgba(241, 246, 255, 0.95)" : "#0F1218";
    const itemHoverBackground = isDarkMode
      ? "rgba(188, 208, 238, 0.16)"
      : "rgba(56, 66, 82, 0.1)";
    const activeBackground = isDarkMode
      ? "rgba(210, 228, 255, 0.24)"
      : "rgba(56, 66, 82, 0.16)";
    const activeBorder = isDarkMode
      ? "1px solid rgba(255,255,255,0.24)"
      : "1px solid rgba(255,255,255,0.55)";
    const activeShadow = isDarkMode
      ? "0 6px 16px rgba(0,0,0,0.32)"
      : "0 6px 14px rgba(35,42,55,0.12)";
    const panelShadow = isDarkMode
      ? "0 18px 36px rgba(2, 6, 11, 0.52), 0 1px 0 rgba(255,255,255,0.16) inset"
      : "0 16px 34px rgba(19,22,29,0.18), 0 1px 0 rgba(255,255,255,0.72) inset";
    const divider = isDarkMode
      ? "rgba(255,255,255,0.12)"
      : "rgba(15, 18, 24, 0.10)";

    const transparentBackground = isDarkMode
      ? "rgba(210, 228, 255, 0)"
      : "rgba(56, 66, 82, 0)";

    return {
      border,
      background,
      shadow,
      text,
      itemHoverBackground,
      activeBackground,
      transparentBackground,
      activeBorder,
      activeShadow,
      panelShadow,
      divider,
    };
  }, [isDarkMode]);

  const [isTransitionOverlayActive, setIsTransitionOverlayActive] =
    useState(false);

  // We use this to track the target language so we know when it has successfully committed
  const [targetLanguage, setTargetLanguage] = useState<SurahLanguage | null>(
    null,
  );

  // Watch for the activeLanguage to catch up to the targetLanguage
  // This means React has finished suspending and committed the new UI!
  useEffect(() => {
    if (targetLanguage && activeLanguage === targetLanguage) {
      // The new language is now in the DOM.
      // Give RenderTexture just a tiny bit of time (e.g. 150ms) to render its 4 frames, then reveal!
      const t = setTimeout(() => {
        setIsTransitionOverlayActive(false);
        setTargetLanguage(null);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [activeLanguage, targetLanguage]);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDarkMode ? "#0A0D14" : "#F4F6F9",
          opacity: isTransitionOverlayActive ? 1 : 0,
          transition: "opacity 0.15s ease-out", // Sped up the animation drastically
          pointerEvents: "none",
          zIndex: 90, // Below the buttons, but above the canvas
        }}
      />
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
            color: buttonTheme.text,
            width: BUTTON_W_OPEN,
          }}
        >
          <motion.button
            type="button"
            aria-label="Language menu"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.992 }}
            animate={{ width: isOpen ? BUTTON_W_OPEN : BUTTON_W_CLOSED }}
            transition={{ type: "spring", stiffness: 330, damping: 30 }}
            style={{
              height: buttonH,
              borderRadius: buttonRadius,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              padding: "0 10px",
              fontSize,
              fontWeight: 700,
              letterSpacing: "0.03em",
              background: buttonTheme.background,
              border: buttonTheme.border,
              boxShadow: buttonTheme.shadow,
              backdropFilter: "blur(18px) saturate(130%)",
              WebkitBackdropFilter: "blur(18px) saturate(130%)",
              cursor: "pointer",
              color: buttonTheme.text,
              userSelect: "none",
              outline: "none",
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
          </motion.button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.985 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
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
                  border: buttonTheme.border,
                  background: buttonTheme.background,
                  boxShadow: buttonTheme.panelShadow,
                  backdropFilter: "blur(18px) saturate(130%)",
                  WebkitBackdropFilter: "blur(18px) saturate(130%)",
                  transformOrigin: "top left",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    height: 1,
                    background: buttonTheme.divider,
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
                      onClick={() => {
                        if (
                          activeLanguage !== language &&
                          targetLanguage === null
                        ) {
                          // 1. Mark target and start ultra-fast fade to solid background
                          setTargetLanguage(language);
                          setIsTransitionOverlayActive(true);

                          // 2. Just 150ms later (when screen is covered), trigger the language switch
                          setTimeout(() => {
                            startTransition(() => {
                              setLanguage(language);
                            });
                          }, 150);

                          setIsOpen(false);
                        }
                      }}
                      whileHover={{
                        background: buttonTheme.itemHoverBackground,
                        scale: 1.012,
                      }}
                      whileTap={{ scale: 0.99 }}
                      style={{
                        height: itemH,
                        borderRadius: "clamp(9px, 1.1vw, 10px)",
                        border: isActive ? buttonTheme.activeBorder : "none",
                        background: isActive
                          ? buttonTheme.activeBackground
                          : buttonTheme.transparentBackground,
                        boxShadow: isActive ? buttonTheme.activeShadow : "none",
                        color: buttonTheme.text,
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
