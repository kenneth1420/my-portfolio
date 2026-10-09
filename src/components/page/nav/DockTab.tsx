"use client";

import { motion } from "motion/react";
import { useMagnetic } from "@/src/hook/use.magnetic.hook";

interface IProps {
  href: string;
  label: string;
  isActive: boolean;
}

/** Glide for the active pill: quick, with no overshoot past the next tab. */
const PILL_SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

/**
 * One dock tab. The active tab hosts the shared `layoutId="activeTab"` pill,
 * so when the active section changes motion animates the one pill from the
 * old tab to the new one instead of fading one out and another in.
 *
 * The magnetic pull moves only the label, not the tab, and is kept small.
 * Moving the tab itself would carry the pill, whose layout animation
 * measures the tab's box, and could make the glide jitter. Neighbouring
 * tabs would also jostle.
 */
export default function DockTab({ href, label, isActive }: IProps) {
  const { ref, x, y } = useMagnetic<HTMLSpanElement>({
    radius: 24,
    strength: 0.25,
    max: 4,
  });

  return (
    <a
      href={href}
      aria-current={isActive ? "location" : undefined}
      className={`relative flex items-center rounded-full px-2 py-2 text-[11px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong min-[380px]:px-2.5 min-[380px]:text-xs sm:px-4 sm:text-sm ${
        isActive ? "text-primary-strong" : "text-text-dim hover:text-text"
      }`}
    >
      {isActive && (
        <motion.span
          layoutId="activeTab"
          aria-hidden="true"
          transition={PILL_SPRING}
          className="absolute inset-0 rounded-full bg-primary/15 ring-1 ring-inset ring-primary/30"
        />
      )}
      <motion.span ref={ref} style={{ x, y }} className="relative inline-block">
        {label}
      </motion.span>
    </a>
  );
}
