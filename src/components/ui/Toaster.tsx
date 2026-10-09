"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

/**
 * Toast outlet. Sits at the top of the screen because the dock owns the
 * bottom, and takes its colours from the site tokens so it matches both themes.
 */
export default function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "!bg-card !text-text !border-border !rounded-2xl !font-body",
          description: "!text-text-dim",
        },
      }}
    />
  );
}
