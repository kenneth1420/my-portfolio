"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * One switch for every motion animation on the page: with reduced motion on,
 * transforms and layout glides are skipped and only fades remain. A Client
 * Component of its own so the page that uses it can stay a Server Component.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
