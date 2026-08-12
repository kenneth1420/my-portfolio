"use client";

import type { CSSProperties } from "react";

/**
 * Orbital planes, in draw order. Each is a circle turned in 3D, so the shared
 * rotation of the rig reads as an object with volume rather than as spinning
 * flat rings.
 */
const ORBITS = [
  { inset: "0.5rem", transform: "rotateY(74deg)", tone: "border-gold/15" },
  { inset: "2.75rem", transform: "rotateX(18deg) rotateZ(28deg)", tone: "border-gold/20" },
];

/**
 * The hero's 3D element: a slow gold gyroscope behind the portrait. Built from
 * CSS 3D transforms rather than a WebGL scene — the page already runs an ogl
 * shader for the aurora, and a second context here would cost far more than
 * this effect is worth.
 *
 * Purely decorative, so it is hidden from assistive technology and stops
 * moving entirely for reduced-motion users via the `animate-orbit` rule.
 */
export default function HeroObject() {
  return (
    <div
      aria-hidden="true"
      className="absolute -inset-10 pointer-events-none"
      /* Seated behind the portrait plane so cursor parallax pulls the rig and
         the badge across each other, rather than moving the group as one slab. */
      style={{ transform: "translateZ(-30px)" }}
    >
      {/* Soft key light. Reads as the source for the rings' highlights and
          keeps the portrait separated from the background. */}
      <div className="absolute inset-8 rounded-full bg-gold/10 blur-3xl" />

      <div className="perspective-card absolute inset-0">
        <div
          className="animate-orbit relative w-full h-full"
          style={
            {
              "--orbit-duration": "46s",
              transformStyle: "preserve-3d",
            } as CSSProperties
          }
        >
          {/* Near-horizontal plane. On its own a circle spinning about its own
              axis looks static, so it carries the satellite that shows motion. */}
          <div
            className="absolute rounded-full border border-gold/25"
            style={{ inset: "1.5rem", transform: "rotateX(76deg)" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_12px_2px] shadow-gold/40" />
          </div>

          {ORBITS.map((orbit) => (
            <div
              key={orbit.transform}
              className={`absolute rounded-full border ${orbit.tone}`}
              style={{ inset: orbit.inset, transform: orbit.transform }}
            />
          ))}
        </div>
      </div>

      {/* Kept from the original hero: the steady outer ring that frames the
          portrait while the rig turns inside it. */}
      <div className="absolute inset-6 rounded-full border border-gold/10 animate-float" />
    </div>
  );
}
