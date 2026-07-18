"use client";

import Link from "next/link";

export function WebGLUnsupportedOverlay() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 px-6 text-center"
      style={{ background: "var(--page-bg)", color: "var(--foreground)" }}
    >
      <p className="text-xs font-medium tracking-[0.2em] uppercase opacity-50">WebGL</p>
      <h1 className="text-2xl md:text-3xl font-light font-(family-name:--font-fraunces) max-w-md">
        This device can&apos;t run the 3D experience
      </h1>
      <p className="max-w-sm text-sm opacity-70">
        Your browser or device does not support WebGL, which this Surah view needs to render.
        Try a recent version of Chrome, Safari, or Firefox, or switch to another device.
      </p>
      <Link
        href="/"
        className="mt-1 inline-flex items-center justify-center rounded-full border border-current/20 px-6 py-3 text-sm font-medium hover:opacity-80 transition-all hover:scale-105"
      >
        Back to Surah list
      </Link>
    </div>
  );
}
