import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="w-full min-h-[100dvh] flex flex-col items-center justify-center gap-5 px-6 text-center"
      style={{ background: "var(--page-bg)", color: "var(--foreground)" }}
    >
      <p className="text-xs font-medium tracking-[0.2em] uppercase opacity-50">404</p>
      <h1 className="text-3xl md:text-4xl font-light font-(family-name:--font-fraunces)">
        This page could not be found
      </h1>
      <p className="max-w-sm text-sm opacity-70">
        The Surah or page you are looking for does not exist, or its link may have changed.
      </p>
      <Link
        href="/"
        className="mt-1 inline-flex items-center justify-center rounded-full border border-current/20 px-6 py-3 text-sm font-medium hover:opacity-80 transition-opacity"
      >
        Return to Surah list
      </Link>
    </main>
  );
}
