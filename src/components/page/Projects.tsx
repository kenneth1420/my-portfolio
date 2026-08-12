"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Calendar } from "lucide-react";
import TiltCard from "../ui/TiltCard";
import { projects } from "@/src/data/resume";


const ALL = "All";

export default function Projects() {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [activeCompany, setActiveCompany] = useState<string>(ALL);

  const filters = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => counts.set(p.company, (counts.get(p.company) ?? 0) + 1));
    return [
      { label: ALL, count: projects.length },
      ...[...counts.entries()].map(([label, count]) => ({ label, count })),
    ];
  }, []);

  const visibleProjects =
    activeCompany === ALL
      ? projects
      : projects.filter((p) => p.company === activeCompany);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setRevealed(true);
        });
      },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const reveal = `section-reveal${revealed ? " visible" : ""}`;

  return (
    <section id="projects" ref={ref} className="py-24 px-6 bg-surface/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${reveal} mb-10`}>
          <p className="text-gold font-mono text-sm tracking-widest mb-3">
            04. PROJECTS
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text">
            Selected Work
          </h2>
          <p className="text-text-dim mt-4 max-w-xl">
            {projects.length} projects delivered across enterprise, startup, and
            freelance engagements — spanning ERP, CRM, healthcare, mobile, and
            specialized applications.
          </p>
        </div>

        {/* Filters */}
        <div className={`${reveal} flex flex-wrap gap-2 mb-10`}>
          {filters.map((filter) => {
            const isActive = filter.label === activeCompany;
            return (
              <button
                key={filter.label}
                type="button"
                onClick={() => setActiveCompany(filter.label)}
                aria-pressed={isActive}
                className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono transition-colors duration-200 ${
                  isActive
                    ? "bg-gold/10 border-gold/40 text-gold"
                    : "bg-subtle border-border text-text-dim hover:border-gold/40 hover:text-gold"
                }`}
              >
                {filter.label}
                <span className="ml-1.5 text-muted">{filter.count}</span>
              </button>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleProjects.map((project, i) => (
            <div
              key={project.title}
              className={`${reveal} h-full`}
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              {/* The reveal stays on the wrapper: it animates transform too, and
                  would fight the tilt if both lived on the same element. */}
              <TiltCard
                className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4"
                max={4}
              >
                {/* Period */}
                <div className="flex items-center gap-2 text-muted text-xs font-mono">
                  <Calendar size={12} />
                  <span>{project.period}</span>
                </div>

                {/* Title and company sit above the card face so they parallax
                    against the body copy as the card tilts. */}
                <h3
                  className="depth-layer font-display text-lg font-semibold text-text leading-snug"
                  style={{ "--depth": "30px" } as CSSProperties}
                >
                  {project.title}
                </h3>

                {/* Company */}
                <p
                  className="depth-layer text-gold text-xs font-medium -mt-2"
                  style={{ "--depth": "22px" } as CSSProperties}
                >
                  {project.company}
                </p>

                {/* Description */}
                <p className="text-text-dim text-sm leading-relaxed flex-1">
                  {project.description}
                </p>

                {/* Tags */}
                <div
                  className="depth-layer flex flex-wrap gap-2 pt-2 border-t border-border"
                  style={{ "--depth": "12px" } as CSSProperties}
                >
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-subtle text-text-dim text-xs font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
