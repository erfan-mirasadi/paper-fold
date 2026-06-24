"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function AnimatedMountains() {
  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-0 pointer-events-none flex items-end justify-center"
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
    >
      <Image
        src="/hero/Mountains.png"
        alt="Mountains Background"
        width={2560}
        height={800}
        priority
        className="w-full h-auto object-contain object-bottom"
      />
      {/* Gradient fade to blend the bottom of mountains if necessary */}
      <div className="absolute inset-x-0 bottom-0 h-[30vh] bg-gradient-to-t from-black/80 to-transparent" />
    </motion.div>
  );
}

export function AnimatedHeader() {
  return (
    <header className="text-center flex flex-col items-center px-6" style={{ marginBottom: 'clamp(24px, 5vh, 64px)' }}>
      <motion.h1
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
        style={{
          fontFamily: "var(--font-cormorant), serif",
          textShadow: "0 4px 12px rgba(0,0,0,0.5)",
          fontSize: "clamp(2rem, 5vw, 5rem)",
          marginBottom: "clamp(16px, 2.5vh, 40px)",
        }}
        className="leading-[1.1] font-normal tracking-[-0.02em] text-[#F4F1EA]"
      >
        QuranPatterns
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
        style={{ marginTop: 'clamp(20px, 3.5vh, 48px)' }}
      >
        <Image
          src="/hero/Logomark.png"
          alt="Logo"
          width={32}
          height={32}
          className="w-6 h-6 md:w-8 md:h-8 drop-shadow-md opacity-80"
        />
      </motion.div>
    </header>
  );
}

export function AnimatedCarouselSection({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <motion.div
      className="w-full flex flex-col items-center"
      style={{ marginTop: 'clamp(60px, 18vh, 220px)' }}
      initial={{ y: 40, scale: 0.95 }}
      animate={{ y: 0, scale: 1 }}
      transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
    >
      {title && (
        <motion.h2
          style={{ fontFamily: "var(--font-cormorant), serif", marginBottom: "clamp(16px, 2.5vh, 32px)" }}
          className="text-xl md:text-3xl font-medium text-[#D2E1D7] drop-shadow-md text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
        >
          {title}
        </motion.h2>
      )}
      {children}
    </motion.div>
  );
}

