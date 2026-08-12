"use client";

import type { ReactNode } from "react";
import { useTilt } from "@/src/hook/use.tilt.hook";

interface TiltCardProps {
  children: ReactNode;
  /** Chrome for the tilting surface itself — background, border, radius, padding. */
  className?: string;
  /** Maximum rotation on either axis, in degrees. */
  max?: number;
}

/**
 * Gives a card a small perspective tilt toward the cursor, plus a lift and a
 * deeper shadow on hover. Composes around existing cards — including
 * `SpotlightCard` — rather than replacing them.
 *
 * Keep this a child of any `section-reveal` element, never the same node: the
 * reveal animates `transform` too, and the two would overwrite each other.
 */
export default function TiltCard({
  children,
  className = "",
  max = 4,
}: TiltCardProps) {
  const { ref, handlePointerMove, handlePointerLeave } = useTilt<HTMLDivElement>(
    { max },
  );

  return (
    <div className="perspective-card h-full">
      <div
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={`tilt-surface h-full ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
