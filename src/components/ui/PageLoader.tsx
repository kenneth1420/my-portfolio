"use client";

import { useEffect, useState } from "react";

export default function PageLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div
        className="
          fixed inset-0 z-50 flex items-center justify-center
            bg-[var(--background)] text-[var(--foreground)]
        "
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="
                w-10 h-10
                border-4
                border-[var(--foreground)]
                border-t-transparent
                rounded-full
                animate-spin
            "
          />

          <p className="text-sm tracking-widest opacity-70">
            Loading Portfolio...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
