"use client";

import type { CSSProperties } from "react";

/**
 * Four small figures, as [x, y] percentages of the viewport. All of them sit in
 * the bands either side of the 42-58% column where the headings and body copy
 * live, so the geometry never runs behind text.
 *
 * Consecutive points are joined, so each array reads as a path through its
 * figure rather than as a cluster.
 */
const FIGURES = [
  [
    [7, 14],
    [13, 22],
    [10, 32],
    [18, 37],
    [24, 27],
  ],
  [
    [78, 11],
    [85, 18],
    [92, 14],
    [88, 27],
    [79, 31],
  ],
  [
    [71, 67],
    [78, 73],
    [85, 69],
    [81, 81],
  ],
  [
    [9, 71],
    [16, 78],
    [12, 88],
  ],
];

/**
 * Faint constellation geometry over the starfields. This is what makes a
 * light-mode sky read as a deliberate celestial chart rather than as specks
 * scattered on a white page — dark-on-light only looks intentional once the
 * marks have structure.
 *
 * Coordinates are percentages so the figures track the viewport, but radii and
 * stroke widths stay in px: a percentage radius resolves against the viewport
 * diagonal and would squash the dots into ellipses on non-square screens.
 *
 * The vertices pulse on long, offset cycles — slower than the ambient stars
 * around them — so the figures still read as the fixed anchors of the sky
 * rather than joining in the twinkle. The connecting lines stay static:
 * blinking geometry reads as flicker, not as starlight.
 */
export default function Constellations() {
  let vertex = 0;

  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
      {FIGURES.map((points) => {
        const key = points.map(([x, y]) => `${x}-${y}`).join("_");

        return (
          <g key={key}>
            {points.slice(1).map(([x, y], index) => {
              const [previousX, previousY] = points[index];

              return (
                <line
                  key={`${previousX}-${previousY}-${x}-${y}`}
                  x1={`${previousX}%`}
                  y1={`${previousY}%`}
                  x2={`${x}%`}
                  y2={`${y}%`}
                  stroke="var(--constellation)"
                  strokeWidth={0.75}
                />
              );
            })}

            {points.map(([x, y], index) => {
              // Derived from a running vertex count rather than a generator:
              // deterministic by construction, so the server and client renders
              // always agree.
              const position = vertex++;
              const duration = 5 + ((position * 1.7) % 4);
              const delay = (position * 0.9) % 6;

              return (
                <circle
                  key={`${x}-${y}`}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  // The first star of each figure anchors it and sits heavier.
                  r={index === 0 ? 2.4 : 1.7}
                  fill="var(--star-bright)"
                  className="animate-mark-blink"
                  style={
                    {
                      "--blink-duration": `${duration.toFixed(2)}s`,
                      animationDelay: `${delay.toFixed(2)}s`,
                    } as CSSProperties
                  }
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
