"use client";

import { useEffect, useRef } from "react";
import { Calendar } from "lucide-react";

const projects = [
  {
    title: "Reading App for Children",
    period: "Jan 2024 – Mar 2024",
    description:
      "Interactive reading application designed to improve early learning engagement with fun, child-friendly UI and gamified content.",
    tags: ["Mobile", "React Native", "Education"],
  },
  {
    title: "Chess Voice Recognition App",
    period: "Feb 2023 – Apr 2023",
    description:
      "Mobile chess game with voice command integration, enabling users to control gameplay hands-free using natural speech.",
    tags: ["Mobile", "Voice AI", "Game"],
  },
  {
    title: "Technician App & Web Platform",
    period: "Jan 2023 – Apr 2024",
    description:
      "Full-stack platform for job assignments, field technician tracking, and reporting — mobile app for technicians and web dashboard for managers.",
    tags: ["Full Stack", "React", "ASP.NET"],
  },
  {
    title: "Clinic Finder Web Application",
    period: "Jan 2021 – Feb 2021",
    description:
      "Web app helping users discover nearby clinics and book appointments online with real-time reservation management.",
    tags: ["Web App", "React", "Booking System"],
  },
  {
    title: "Census Web Application",
    period: "Aug 2020 – Sep 2020",
    description:
      "Data collection and statistical reporting system to support census operations with structured data entry and export.",
    tags: ["Web App", "Data", "Reporting"],
  },
];

export default function Projects() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target
              .querySelectorAll(".section-reveal")
              .forEach((el) => el.classList.add("visible"));
          }
        });
      },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" ref={ref} className="py-24 px-6 bg-surface/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="section-reveal mb-16">
          <p className="text-gold font-mono text-sm tracking-widest mb-3">
            04. PROJECTS
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text">
            Freelance Work
          </h2>
          <p className="text-text-dim mt-4 max-w-xl">
            Selected freelance projects built alongside full-time roles,
            spanning mobile, web, and specialized applications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => (
            <div
              key={project.title}
              className="section-reveal hover-card bg-card border border-border rounded-2xl p-6 flex flex-col gap-4"
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              {/* Period */}
              <div className="flex items-center gap-2 text-muted text-xs font-mono">
                <Calendar size={12} />
                <span>{project.period}</span>
              </div>

              {/* Title */}
              <h3 className="font-display text-lg font-semibold text-text leading-snug">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-text-dim text-sm leading-relaxed flex-1">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-subtle text-text-dim text-xs font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
