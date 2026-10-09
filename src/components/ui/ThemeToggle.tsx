"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

interface IProps {
  className?: string;
}

/**
 * Light/dark switch. Both icons are always rendered and the `dark:` variant
 * picks the visible one. next-themes sets the class on <html> before
 * hydration, so the right icon shows from the first paint. That avoids a
 * mounted-state guard, which would cost an extra render and a hydration
 * special case. `resolvedTheme` is only read on click.
 */
export default function ThemeToggle({ className = "" }: IProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className={className}
    >
      <Sun aria-hidden="true" className="hidden size-4 dark:block" />
      <Moon aria-hidden="true" className="block size-4 dark:hidden" />
    </button>
  );
}
