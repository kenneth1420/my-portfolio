"use client";

import { useEffect, useState } from "react";

/**
 * Renders children immediately so the page is present in the server-rendered
 * HTML for crawlers, ATS scrapers, and link previews. The splash is a purely
 * decorative overlay that fades away once hydrated — it never gates content.
 */
export default function PageLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {children}

      <div
        aria-hidden="true"
        className={`
          fixed inset-0 z-100 flex items-center justify-center
          bg-background text-foreground
          transition-opacity duration-500
          motion-reduce:transition-none
          ${loading ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* The monogram is the first thing anyone sees, so it carries the
            brand rather than a generic spinner. */}
        <div className="flex flex-col items-center gap-5">
          <span className="font-serif italic text-6xl text-primary-gradient pr-2 animate-pulse motion-reduce:animate-none">
            KL
          </span>
          <span className="relative block h-px w-28 overflow-hidden bg-border">
            <span className="animate-loader-fill absolute inset-0 origin-left bg-gradient-to-r from-primary to-primary-light" />
          </span>
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted">
            Kenneth Lariosa
          </p>
        </div>
      </div>
    </>
  );
}
