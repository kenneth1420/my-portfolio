"use client";

import type { CSSProperties } from "react";

/** How many stars blink. The single knob for how busy the sky feels. */
const STAR_COUNT = 32;

/** Column, in percent, kept clear of stars — the headings and body copy sit here. */
const TEXT_COLUMN = { from: 42, to: 58 };

/**
 * A seeded generator, never `Math.random()`: the sequence has to come out
 * identical on the server and in the browser or the two renders disagree and
 * React reports a hydration mismatch. A fixed seed gives a fresh-looking
 * scatter that is nonetheless the same every time.
 */
function createRandom(seed: number) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const STARS = (() => {
  const random = createRandom(20260812);

  return Array.from({ length: STAR_COUNT }, (_, index) => {
    const side = random();
    const spread = random();

    // Map into the two bands either side of the text column rather than
    // rejecting samples, so the count stays exact.
    const left =
      side < 0.5
        ? 2 + spread * (TEXT_COLUMN.from - 2)
        : TEXT_COLUMN.to + spread * (98 - TEXT_COLUMN.to);

    return {
      id: index,
      left: `${left.toFixed(2)}%`,
      top: `${(2 + random() * 96).toFixed(2)}%`,
      // A wide spread of weights is what reads as a star chart; a uniform size
      // reads as a dot pattern.
      size: Number((1.6 + random() * 2.8).toFixed(2)),
      duration: `${(2.6 + random() * 4).toFixed(2)}s`,
      delay: `${(random() * 7).toFixed(2)}s`,
    };
  });
})();

/**
 * A field of stars blinking on independent schedules, layered over the tiled
 * starfields — which cannot blink individually, being a single background
 * image each.
 *
 * The static `opacity-60` is what reduced-motion users see once the blink is
 * switched off: plain stars rather than stars frozen mid-fade.
 */
export default function BlinkingStars() {
  return (
    <>
      {STARS.map((star) => (
        <span
          key={star.id}
          className="animate-blink absolute rounded-full bg-(--star-bright) opacity-60"
          style={
            {
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              // The halo reinforces the dot's edge. Its colour flips per theme:
              // a light bloom against the night sky, a soft dark shadow on a
              // white page, where a bloom would wash the star out instead.
              boxShadow: `0 0 ${star.size * 3.5}px ${star.size / 2}px var(--star-glow)`,
              "--blink-duration": star.duration,
              animationDelay: star.delay,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}
