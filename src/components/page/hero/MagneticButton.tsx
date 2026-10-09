"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useMagnetic } from "@/src/hook/use.magnetic.hook";

interface IProps {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
}

const VARIANT_CLASSES = {
  // Near-black on the accent in both themes: `text-ink` turns white in light mode,
  // which is only ~2.1:1 on the accent.
  solid:
    "btn-shine bg-primary text-neutral-950 font-semibold shadow-lg shadow-primary/25 hover:bg-primary-light",
  outline:
    "border border-primary/40 text-primary-strong font-medium hover:bg-primary/10 hover:border-primary/70",
} as const;

/**
 * A call to action that leans toward the cursor once it comes within 40px of
 * its edge, and springs home when the cursor leaves. Keyboard focus and
 * clicks behave exactly like a plain link.
 */
export default function MagneticButton({ href, children, variant = "solid" }: IProps) {
  const { ref, x, y } = useMagnetic<HTMLAnchorElement>();

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x, y }}
      className={`group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-strong ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </motion.a>
  );
}
