"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type KeyboardEvent } from "react";
import styles from "./YasinOpeningPopup.module.css";

type SectionTone = "red" | "green";

interface ExplanationSectionProps {
  tone: SectionTone;
  number: number;
  total: number;
  top: [string, string];
  lead?: string;
  bottom?: string;
}

function Arrow() {
  return (
    <div className={styles.flowArrow} aria-hidden="true">
      <span>FLOW</span>
      <i>→</i>
    </div>
  );
}

function ExplanationSection({
  tone,
  number,
  total,
  top,
  lead,
  bottom,
}: ExplanationSectionProps) {
  return (
    <section className={`${styles.explanationSection} ${styles[tone]}`}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>0{number}</span>
        <div>
          <span className={styles.sectionKicker}>EXPLANATION SECTION</span>
          <strong>TOPLAM {total} AYET</strong>
        </div>
        <span className={styles.sectionStatus}>●</span>
      </div>

      <div className={styles.sectionBody}>
        {lead && (
          <div className={`${styles.leadBox} ${styles.teal}`}>
            <span>{lead}</span>
            <small>VERSE UNIT</small>
          </div>
        )}

        <div className={styles.explanationTop}>
          <div className={`${styles.verseBox} ${styles.blue}`}>
            <span>{top[0]}</span>
            <small>VERSE UNIT</small>
          </div>
          <Arrow />
          <div className={`${styles.verseBox} ${styles.blue}`}>
            <span>{top[1]}</span>
            <small>VERSE UNIT</small>
          </div>
        </div>

        {bottom && (
          <div className={styles.explanationBottom}>
            <div className={`${styles.verseBox} ${styles.teal}`}>
              <span>{bottom}</span>
              <small>VERSE UNIT</small>
            </div>
          </div>
        )}
      </div>

      <div className={styles.sectionFooter}>
        <span>{number}. AÇIKLAMA BÖL.</span>
        <span>READING PATH</span>
      </div>
    </section>
  );
}

/**
 * Full-screen HTML/CSS opening card for the composed Yasin atlas.
 * It intentionally owns its own visibility so one click clears the whole
 * presentation without touching the 3D paper or any other surah's state.
 */
export function YasinOpeningPopup() {
  const [isVisible, setIsVisible] = useState(true);

  const dismiss = () => setIsVisible(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      dismiss();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.overlay}
          role="button"
          tabIndex={0}
          aria-label="Close Yasin overview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          onClick={dismiss}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            className={styles.board}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            <header className={styles.header}>
              <div className={styles.headerEyebrow}>
                <span className={styles.liveDot} />
                REVELATION MAP / 01
              </div>
              <div className={styles.headerTitle}>
                <strong>YÂSÎN</strong>
                <span>THE ARCHITECTURE OF A SURAH</span>
              </div>
              <div className={styles.headerMeta}>
                <span>36</span>
                <small>SURAH</small>
              </div>
            </header>

            <div className={styles.diagram}>
              <section className={styles.openingPanel}>
                <div className={styles.openingTitle}>
                  <span>01 / OPENING</span>
                  <strong>1. YASIN</strong>
                  <i>يس</i>
                </div>
                <div className={styles.openingCard}>
                  <div><strong>4</strong><span>AYET</span></div>
                  <div><strong>6</strong><span>AYET</span></div>
                </div>
              </section>

              <div className={styles.mainRibbon}>
                <span className={styles.ribbonNumber}>12</span>
                <div>
                  <small>THE CENTRAL VERSE</small>
                  <strong>ANA AYET</strong>
                </div>
                <span className={styles.ribbonTag}>ANCHOR</span>
              </div>

              <div className={styles.explanationGrid}>
                <ExplanationSection
                  tone="red"
                  number={1}
                  total={20}
                  top={["7 ayet", "8 ayet"]}
                  bottom="5 ayet"
                />
                <ExplanationSection
                  tone="red"
                  number={2}
                  total={20}
                  top={["8 ayet", "7 ayet"]}
                  bottom="5 ayet"
                />
                <ExplanationSection
                  tone="green"
                  number={3}
                  total={15}
                  top={["4 ayet", "4 ayet"]}
                  lead="2 ayet"
                  bottom="5 ayet"
                />
                <ExplanationSection
                  tone="green"
                  number={4}
                  total={15}
                  top={["6 ayet", "6 ayet"]}
                  lead="3 ayet"
                />
              </div>

              <div className={styles.closingRibbon}>
                <span className={styles.ribbonNumber}>83</span>
                <div>
                  <small>THE CLOSING ECHO</small>
                  <strong>ANA AYETİN İKİZİ</strong>
                </div>
                <span className={styles.ribbonTag}>RETURN</span>
              </div>
            </div>

            <footer className={styles.footer}>
              <span>STRUCTURE / CONNECTION / RHYTHM</span>
              <span>CLICK ANYWHERE TO CONTINUE <b>↗</b></span>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
