"use client";

import { AnimatePresence, motion } from "motion/react";
import SectionHeading from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import SkillChip from "./skills/SkillChip";
import { useSkillMatrix } from "@/src/hook/use.skill.matrix.hook";

export default function Skills() {
  const {
    filters,
    activeFilter,
    visibleSkills,
    openSkill,
    handleFilterChange,
    handleSkillOpen,
    handleSkillClose,
  } = useSkillMatrix();

  return (
    <section id="skills" className="py-28 px-6 bg-surface/40">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          index="04"
          eyebrow="Skills"
          title="Tech"
          accent="stack"
          className="mb-12"
        >
          <p className="text-text-dim mt-5 max-w-xl">
            Filter by discipline. Hover, focus, or tap a skill to see how long
            I&apos;ve used it and what I built with it.
          </p>
        </SectionHeading>

        <Reveal>
          <div role="group" aria-label="Filter skills by discipline" className="flex flex-wrap gap-2 mb-8">
            {filters.map((filter) => {
              const isActive = filter.id === activeFilter;
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleFilterChange(filter.id)}
                  className={`px-4 py-2 rounded-full border text-xs font-mono transition-[background-color,border-color,color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                    isActive
                      ? "bg-primary/15 border-primary/50 text-primary-strong"
                      : "bg-subtle/70 border-border text-text-dim hover:border-primary/40 hover:text-primary-strong"
                  }`}
                >
                  {filter.label}{" "}
                  <span className="ml-0.5 tabular-nums">
                    {filter.count}
                    <span className="sr-only"> skills</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* `initial={false}` keeps the first render un-animated, so the
              chips are in the server HTML at full opacity. After that, chips
              leaving a filter shrink out and the rest glide into the gaps. */}
          <ul className="flex flex-wrap gap-2 min-h-40 content-start">
            <AnimatePresence initial={false} mode="popLayout">
              {visibleSkills.map((skill) => (
                <motion.li
                  key={skill.name}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.25 }}
                >
                  <SkillChip
                    skill={skill}
                    isOpen={openSkill === skill.name}
                    onOpen={handleSkillOpen}
                    onClose={handleSkillClose}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
