"use client";

import { useCursorFollow } from "@/src/hook/use.cursor.follow.hook";

/**
 * A soft pool of sky light that trails the mouse behind the page content.
 * It sits under the cards, so it lights the sky between them rather than
 * tinting any text.
 */
export default function CursorGlow() {
  const ref = useCursorFollow<HTMLDivElement>();

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="cursor-glow fixed top-0 left-0 -z-10 w-[640px] h-[640px] rounded-full pointer-events-none opacity-0 transition-opacity duration-500 will-change-transform"
    />
  );
}
