"use client";

import { motion } from "motion/react";
import type { CSSProperties } from "react";
import type { FeaturedProject } from "@/src/data/resume";
import { useMotionTilt } from "@/src/hook/use.motion.tilt.hook";

interface IProps {
  project: FeaturedProject;
  index: number;
}

/**
 * One Selected Work tile: a glass card that tilts on both axes toward the
 * cursor, with a glare that follows it and mono tech tags that light up mint
 * while the card is hovered.
 *
 * Layering matters here. `backdrop-filter` forces 3D flattening on its
 * element, so the blur lives on its own background layer. The rotating card
 * keeps `preserve-3d`, which lets the title and tags sit on raised planes and
 * slide across the body copy as the card turns.
 */
export default function BentoCard({ project, index }: IProps) {
  const { rotateX, rotateY, glare, handlePointerMove, handlePointerLeave } =
    useMotionTilt<HTMLElement>({ max: project.span === "wide" ? 5 : 8 });
  const wide = project.span === "wide";

  return (
    <article
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group h-full perspective-[1200px]"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`relative h-full flex flex-col gap-5 rounded-3xl ${
          wide ? "p-8 md:p-10 min-h-80" : "p-7 min-h-80"
        }`}
      >
        {/* Glass. Light mode swaps the deep slate for frosted white, so the
            card still reads as glass on a light page. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl border border-slate-300/50 bg-white/55 backdrop-blur-md transition-[border-color,box-shadow] duration-500 group-hover:border-emerald-600/30 group-hover:shadow-[0_24px_60px_-28px] group-hover:shadow-mint/40 dark:border-slate-800/50 dark:bg-slate-950/40 dark:group-hover:border-mint/25"
        />
        {/* Glare: a soft light that tracks the cursor across the surface. */}
        <motion.div
          aria-hidden="true"
          style={{ background: glare }}
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        <header
          className="relative flex items-start justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-text-dim"
          style={{ transform: "translateZ(18px)" }}
        >
          <span>
            {project.kind}
            <span className="block mt-1 normal-case tracking-normal text-text-dim">
              {project.company} · {project.period}
            </span>
          </span>
          <span aria-hidden="true" className="text-muted/70">
            0{index + 1}
          </span>
        </header>

        <h3
          className={`relative font-headline font-bold tracking-[-0.03em] leading-[1.05] text-text ${
            wide ? "text-3xl md:text-[2.6rem]" : "text-2xl"
          }`}
          style={{ transform: "translateZ(40px)" }}
        >
          {project.title}
        </h3>

        <p
          className={`relative flex-1 leading-relaxed text-text-dim ${
            wide ? "max-w-xl text-base" : "text-sm"
          }`}
          style={{ transform: "translateZ(10px)" }}
        >
          {project.description}
        </p>

        <ul
          aria-label="Technologies"
          className="relative flex flex-wrap gap-1.5"
          style={{ transform: "translateZ(26px)" }}
        >
          {project.stack.map((tech, i) => (
            <li
              key={tech}
              // Each tag lights a beat after the one before it, so the row
              // switches on left to right like a strip of indicator lamps.
              style={{ transitionDelay: `${i * 45}ms` } as CSSProperties}
              className="rounded-md border border-border bg-subtle/60 px-2 py-0.5 font-mono text-[10px] tracking-wide text-text-dim transition-[color,border-color,background-color,box-shadow] duration-300 group-hover:border-emerald-600/40 group-hover:bg-emerald-500/10 group-hover:text-emerald-700 group-hover:shadow-[0_0_14px_-4px] group-hover:shadow-mint/70 dark:group-hover:border-mint/40 dark:group-hover:bg-mint/10 dark:group-hover:text-mint"
            >
              {tech}
            </li>
          ))}
        </ul>
      </motion.div>
    </article>
  );
}
