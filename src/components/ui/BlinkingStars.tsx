"use client";

import type { CSSProperties } from "react";

/**
 * Fixed rather than random: a generated set would differ between the server and
 * the client render and trip a hydration mismatch.
 *
 * Positions are weighted toward the edges and the upper band, keeping the
 * central column — where the headings and body copy sit — clear.
 */
const STARS = [
  { top: "8%", left: "6%", size: 2, duration: "4.2s", delay: "0s" },
  { top: "17%", left: "88%", size: 2.5, duration: "5.6s", delay: "1.4s" },
  { top: "12%", left: "72%", size: 1.5, duration: "3.4s", delay: "2.1s" },
  { top: "31%", left: "14%", size: 2, duration: "6.5s", delay: "0.7s" },
  { top: "26%", left: "94%", size: 1.5, duration: "2.8s", delay: "3.2s" },
  { top: "48%", left: "4%", size: 2.5, duration: "5.1s", delay: "2.6s" },
  { top: "57%", left: "91%", size: 2, duration: "3.9s", delay: "0.4s" },
  { top: "69%", left: "11%", size: 1.5, duration: "4.7s", delay: "3.8s" },
  { top: "78%", left: "82%", size: 2, duration: "6.1s", delay: "1.1s" },
  { top: "88%", left: "23%", size: 2.5, duration: "3.6s", delay: "2.9s" },
];

/**
 * A sparse set of stars that blink independently, layered over the tiled
 * starfields. Ten elements is cheap enough to animate individually, which the
 * gradient-tiled planes cannot do.
 *
 * The static `opacity-60` is what reduced-motion users see once the blink is
 * switched off — plain stars rather than stars frozen mid-fade.
 */
export default function BlinkingStars() {
  return (
    <>
      {STARS.map((star) => (
        <span
          key={`${star.top}-${star.left}`}
          className="animate-blink absolute rounded-full bg-(--star) opacity-60"
          style={
            {
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              // The halo is what makes a point read as emitting light rather
              // than as a speck sitting on the page — which is the difference
              // between a star and a smudge on a light background.
              boxShadow: `0 0 ${star.size * 3}px ${star.size / 2}px var(--star-glow)`,
              "--blink-duration": star.duration,
              animationDelay: star.delay,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}
