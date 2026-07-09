"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className="w-full min-h-[100dvh] flex flex-col items-center justify-center gap-5 px-6 text-center"
      style={{ background: "var(--page-bg)", color: "var(--foreground)" }}
    >
      <p className="text-xs font-medium tracking-[0.2em] uppercase opacity-50">Error</p>
      <h1 className="text-3xl md:text-4xl font-light font-(family-name:--font-fraunces)">
        Something went wrong
      </h1>
      <p className="max-w-sm text-sm opacity-70">
        This page failed to load. This can happen if your browser or device does not support 3D
        rendering, or if a connection was interrupted.
      </p>
      <div className="flex items-center gap-3 mt-1">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full border border-current/20 px-6 py-3 text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-current/20 px-6 py-3 text-sm font-medium hover:opacity-80 transition-opacity"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
