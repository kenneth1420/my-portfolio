"use client";

import type { ReactNode } from "react";
import SectionHeading from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import ArchitectureVisualizer from "./projects/ArchitectureVisualizer";
import DarSimulator from "./projects/DarSimulator";
import ProjectArchive from "./projects/ProjectArchive";
import ShowcaseCard from "./projects/ShowcaseCard";
import type { ShowcaseProject } from "@/src/data/resume";
import { useProjectsSection } from "@/src/hook/use.projects.section.hook";

/** The live widget each showcase build carries, keyed by its `interactive` field. */
const WIDGETS: Record<NonNullable<ShowcaseProject["interactive"]>, ReactNode> = {
  architecture: <ArchitectureVisualizer />,
  "dar-simulator": <DarSimulator />,
};

export default function Projects() {
  const {
    showcase,
    totalCount,
    filters,
    activeCompany,
    visibleArchive,
    handleFilterChange,
  } = useProjectsSection();

  return (
    <section id="projects" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          index="01"
          eyebrow="Projects"
          title="Featured"
          accent="work"
          className="mb-12"
        >
          <p className="text-text-dim mt-5 max-w-xl">
            {totalCount}{" "}shipped projects. Three of them are below, and two
            you can poke at: CliniQo&apos;s architecture and DAR&apos;s report
            generator both run right here on the page.
          </p>
        </SectionHeading>

        {/* Each Reveal rises without fading: a fading ancestor would switch
            off the cards' backdrop blur until the fade ended. */}
        <div className="flex flex-col gap-8">
          {showcase.map((project, i) => (
            <Reveal key={project.id} fade={false}>
              <ShowcaseCard project={project} index={i}>
                {project.interactive && WIDGETS[project.interactive]}
              </ShowcaseCard>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <ProjectArchive
            projects={visibleArchive}
            filters={filters}
            activeCompany={activeCompany}
            onFilterChange={handleFilterChange}
          />
        </Reveal>
      </div>
    </section>
  );
}
