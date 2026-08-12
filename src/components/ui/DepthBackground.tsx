"use client";

import type { CSSProperties } from "react";
import BlinkingStars from "./BlinkingStars";
import Constellations from "./Constellations";
import Meteors from "./Meteors";
import { usePointerParallax } from "@/src/hook/use.pointer.parallax.hook";
import { useScrollMetrics } from "@/src/hook/use.scroll.metrics.hook";

/**
 * A minimalist space layer behind the whole page: three parallaxing starfields,
 * two slow gold nebulae, and a soft atmosphere along the bottom edge.
 *
 * Every layer answers to both scroll and cursor, moving further the nearer it
 * is meant to read. Two independent hooks publish the inputs — scroll on the
 * root, pointer on the wrapper — and custom properties inherit down to every
 * layer, so neither hook has to know about the other.
 *
 * Deliberately CSS-only: stars are tiled gradients rather than elements, and
 * the only JavaScript is those two rAF-coalesced listeners. It sits under the
 * existing `mesh-bg` gradients, which are transparent, so the two read as one
 * background with depth.
 */
export default function DepthBackground() {
  const scrollRef = useScrollMetrics<HTMLDivElement>();
  const pointerRef = usePointerParallax<HTMLDivElement>();

  return (
    <div
      ref={scrollRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      {/* Sky wash. Gives the stars something to be bright against — without it
          a light-mode starfield reads as dust on white paper. Both stops are
          transparent in dark mode, so this layer is inert there. */}
      <div
        className="absolute inset-0"
        style={{
          // The flat base is the paper tone; the gradient is the sky over it.
          // Both resolve to transparent in dark mode, leaving that theme alone.
          backgroundColor: "var(--sky-base)",
          backgroundImage:
            "linear-gradient(to bottom, var(--sky-top), transparent 45%, var(--sky-bottom))",
        }}
      />

      <div ref={pointerRef} className="absolute inset-0">
        {/* Nebulae. The drift animation and the parallax each need their own
            element: both write `transform`, and an animation outranks a normal
            declaration, so sharing one node would silently kill the parallax. */}
        <div
          className="scroll-depth absolute -top-32 -left-24"
          style={{ "--travel": "50px", "--pointer-shift": "20px" } as CSSProperties}
        >
          <div
            className="animate-depth-drift w-152 h-152 rounded-full bg-(--nebula) blur-[110px]"
            style={{ "--drift-duration": "34s" } as CSSProperties}
          />
        </div>
        <div
          className="scroll-depth absolute top-1/3 -right-32"
          style={{ "--travel": "70px", "--pointer-shift": "28px" } as CSSProperties}
        >
          <div
            className="animate-depth-drift w-128 h-128 rounded-full bg-(--nebula) opacity-85 blur-[110px]"
            style={
              {
                "--drift-duration": "44s",
                animationDirection: "reverse",
              } as CSSProperties
            }
          />
        </div>

        {/* Three star planes. The near plane covers ~4.5x the ground of the far
            one on scroll and ~4x on cursor, which is what sells the depth. Each
            --tile matches that layer's background-size so the scroll wrap is
            invisible, and each overhang matches its tile so no edge shows.
            Blinking is handled by discrete stars below rather than by pulsing a
            whole plane, which reads as the sky breathing rather than starlight. */}
        <div
          className="starfield-far star-drift absolute -inset-y-48 inset-x-0 opacity-90 dark:opacity-45"
          style={
            {
              "--rate": "0.06",
              "--tile": "190px",
              "--pointer-shift": "10px",
            } as CSSProperties
          }
        />
        <div
          className="starfield-mid star-drift absolute -inset-y-72 inset-x-0 opacity-95 dark:opacity-50"
          style={
            {
              "--rate": "0.14",
              "--tile": "280px",
              "--pointer-shift": "22px",
            } as CSSProperties
          }
        />
        <div
          className="starfield-near star-drift absolute -inset-y-112 inset-x-0 opacity-100 dark:opacity-60"
          style={
            {
              "--rate": "0.28",
              "--tile": "420px",
              "--pointer-shift": "42px",
            } as CSSProperties
          }
        />

        {/* Discrete stars, parallaxing with the rest. They use bounded
            `scroll-depth` rather than `star-drift`: wrapping at a tile boundary
            is seamless for a repeating field, but would make individual stars
            visibly jump. */}
        <div
          className="scroll-depth absolute inset-0"
          style={
            { "--travel": "140px", "--pointer-shift": "30px" } as CSSProperties
          }
        >
          <BlinkingStars />
        </div>

        {/* Constellation geometry, one plane nearer than the blinking stars.
            Static on purpose — these lead the composition, the blinking stars
            supply the motion. */}
        <div
          className="scroll-depth absolute inset-0"
          style={
            { "--travel": "110px", "--pointer-shift": "24px" } as CSSProperties
          }
        >
          <Constellations />
        </div>

        {/* Meteors stay unparallaxed — they are transient and fast, so shifting
            them with the cursor would read as noise rather than depth. */}
        <Meteors />
      </div>

      {/* Atmosphere: a wide, shallow glow hugging the bottom edge, standing in
          for a horizon so the starfield has something to sit above. Deliberately
          fixed — a horizon that slid with the cursor would break the illusion. */}
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[140%] h-80 rounded-[50%] bg-gold/5 dark:bg-gold/8 blur-[90px]" />
    </div>
  );
}
