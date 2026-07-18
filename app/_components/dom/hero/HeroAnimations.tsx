"use client";

import { motion } from "framer-motion";
import Image from "next/image";


export function AnimatedHeader() {
  return (
    <header className="text-center flex flex-col items-center px-6" style={{ marginBottom: 'clamp(24px, 5vh, 64px)' }}>
      <motion.h1
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
        style={{
          marginBottom: "clamp(16px, 2.5vh, 40px)",
        }}
        className="flex justify-center text-foreground"
      >
        <span className="sr-only">QuranPatterns</span>
        <span
          aria-hidden="true"
          className="block"
          style={{
            height: "clamp(24px, 4vw, 56px)",
            width: "clamp(149px, 24.8vw, 347px)",
            backgroundColor: "currentColor",
            WebkitMask: "url(/Quranpatterns.svg) no-repeat center / contain",
            mask: "url(/Quranpatterns.svg) no-repeat center / contain",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
          }}
        />
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
          className="w-6 h-6 md:w-8 md:h-8 drop-shadow-md opacity-80 dark:invert-0 invert"
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
          className="text-xl md:text-3xl font-medium text-foreground/70 drop-shadow-sm dark:drop-shadow-md text-center"
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

