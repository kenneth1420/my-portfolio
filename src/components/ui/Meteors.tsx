"use client";

import type { CSSProperties } from "react";

/**
 * Three meteors on long, offset cycles. Each is visible for roughly a quarter
 * of its duration, so at any moment the sky is usually empty and a streak reads
 * as an event rather than as weather.
 *
 * Fixed values, not random ones — a generated set would differ between the
 * server and client render and trip a hydration mismatch.
 */
const METEORS = [
  {
    top: "12%",
    left: "8%",
    angle: 26,
    length: 90,
    distance: "460px",
    duration: "15s",
    delay: "2s",
  },
  {
    top: "6%",
    left: "58%",
    angle: 33,
    length: 70,
    distance: "380px",
    duration: "19s",
    delay: "9s",
  },
  {
    top: "38%",
    left: "34%",
    angle: 22,
    length: 60,
    distance: "320px",
    duration: "13s",
    delay: "15s",
  },
];

/**
 * The rotation lives on the outer element and the travel on the inner one.
 * They cannot share a node: an animated `transform` overrides a static one, so
 * a combined element would lose its angle the moment the streak began — and
 * splitting them also keeps the gradient tail aligned with the direction of
 * travel, since the child moves along its rotated parent's axis.
 */
export default function Meteors() {
  return (
    <>
      {METEORS.map((meteor) => (
        <span
          key={`${meteor.top}-${meteor.left}`}
          className="absolute"
          style={{
            top: meteor.top,
            left: meteor.left,
            transform: `rotate(${meteor.angle}deg)`,
          }}
        >
          <span
            className="animate-meteor block h-px origin-left opacity-0"
            style={
              {
                width: `${meteor.length}px`,
                backgroundImage:
                  "linear-gradient(to right, transparent, var(--star))",
                "--meteor-distance": meteor.distance,
                "--meteor-duration": meteor.duration,
                animationDelay: meteor.delay,
              } as CSSProperties
            }
          >
            {/* The head, at the leading edge of the tail. */}
            <span className="absolute -right-px -top-px h-[3px] w-[3px] rounded-full bg-(--star) shadow-[0_0_7px_2px_var(--star-glow)]" />
          </span>
        </span>
      ))}
    </>
  );
}
