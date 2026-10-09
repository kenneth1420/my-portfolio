"use client";

import CountUp from "../../ui/CountUp";
import ScrambleText from "../../ui/ScrambleText";
import { heroStats } from "@/src/data/site";

interface IProps {
  /** Earliest start for the count and scramble, in ms after mount, so
      they play once the splash loader has lifted rather than underneath it. */
  notBefore?: number;
}

/**
 * The quick-stats block, set like an instrument readout: indexed cells, a
 * counting figure, a unit that resolves like a split-flap, and mono labels.
 *
 * The figures and units rewrite their own text while they animate, so they
 * are hidden from screen readers. A visually hidden copy carries the final
 * values, so nobody hears "4… 5… 6…" or scrambled glyphs.
 *
 * The panel is a tint, not frosted glass. It sits over the hero's 3D scene
 * inside a wrapper that fades on scroll: a fading ancestor switches a
 * backdrop blur off until the fade ends, and a blur over a moving canvas is
 * recomputed every frame. A stronger tint keeps the labels readable instead.
 */
export default function HeroStats({ notBefore = 0 }: IProps) {
  return (
    // Stacks below 360px (a 320px screen, or 400% zoom), where three columns
    // would clip the longer units.
    <dl className="grid grid-cols-1 min-[360px]:grid-cols-3 rounded-2xl border border-border bg-subtle/70 divide-y min-[360px]:divide-y-0 min-[360px]:divide-x divide-border overflow-hidden">
      {heroStats.map((stat, i) => (
        <div key={stat.unit} className="relative min-w-0 flex flex-col px-3 py-4 min-[360px]:px-2 min-[400px]:px-3 sm:px-5 sm:py-5">
          {/* dt first for screen readers; `order` lifts the figure above it. */}
          <dt className="order-2 mt-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider leading-tight text-text-dim">
            {stat.label}
            {/* Shown at every width. It is part of the claim, so a phone
                and a screen reader on one must get it too. */}
            {"detail" in stat && (
              <span className="block mt-1 normal-case tracking-normal text-text-dim">
                {stat.detail}
              </span>
            )}
          </dt>
          <dd className="order-1 flex flex-wrap items-baseline gap-x-2">
            <span className="sr-only">
              {stat.value}
              {stat.suffix} {stat.unit}
            </span>
            <span
              aria-hidden="true"
              className="font-headline font-bold text-3xl sm:text-4xl leading-none tracking-tight text-text"
            >
              <CountUp value={stat.value} suffix={stat.suffix} notBefore={notBefore} />
            </span>
            <span aria-hidden="true">
              <ScrambleText
                text={stat.unit}
                notBefore={notBefore}
                className="font-mono text-[11px] sm:text-xs uppercase tracking-normal min-[400px]:tracking-[0.18em] text-primary-strong"
              />
            </span>
          </dd>
          {/* Cell index, the readout's only ornament. */}
          <span
            aria-hidden="true"
            className="absolute top-2 right-3 font-mono text-[9px] tracking-widest text-muted/60"
          >
            0{i + 1}
          </span>
        </div>
      ))}
    </dl>
  );
}
