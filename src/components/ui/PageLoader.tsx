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
        <div className="flex flex-col items-center gap-4">
          <div
            className="
              w-10 h-10
              border-4
              border-foreground
              border-t-transparent
              rounded-full
              animate-spin
              motion-reduce:animate-none
            "
          />

          <p className="text-sm tracking-widest opacity-70">
            Loading Portfolio...
          </p>
        </div>
      </div>
    </>
  );
}
