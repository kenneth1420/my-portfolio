"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

const experiences = [
  {
    role: "Senior Computer Services Programmer",
    company: "Davao City Water District",
    period: "Dec 2021 – Present",
    location: "Davao City, Philippines",
    highlights: [
      "Developed and maintained an Attendance Recording System, improving accuracy and automating daily attendance tracking.",
      "Built a CRM system for both customers and agents, enhancing service efficiency and user experience.",
      "Developed a Document Tracking System to streamline document flow and improve processing time.",
      "Created an ERP HR Attendance module that supported employee management and HR workflows.",
      "Built an App Management platform used for internal applications and administrative tasks.",
    ],
    current: true,
  },
  {
    role: "Senior Fullstack Developer",
    company: "Aquila",
    period: "Nov 2019 – Jul 2022",
    location: "Davao City, Philippines",
    highlights: [
      "Developed modules and features for the Aquila Clinic Management System, supporting patient records, scheduling, and clinic operations.",
      "Implemented frontend interfaces and backend APIs to improve workflow efficiency.",
    ],
    current: false,
  },
  {
    role: "Front End and Mobile Developer",
    company: "The Guild Ltd.",
    period: "Jan 2021 – Oct 2021",
    location: "Davao City, Philippines",
    highlights: [
      "Developed the Mentor Mobile App, improving accessibility and user engagement.",
      "Built the Admin Portal for monitoring and managing mentorship activities.",
    ],
    current: false,
  },
  {
    role: "Full Stack Developer",
    company: "Iekzeed Software Development Co.",
    period: "Aug 2018 – Feb 2020",
    location: "Davao City, Philippines",
    highlights: [
      "Developed Akruals ERP Software modules including accounting, inventory, and reporting features.",
      "Built a CCTV Monitoring Web Application, enabling real-time monitoring and centralized management.",
      "Developed JCI CMS Web Application supporting content publishing and organizational workflows.",
      "Created and maintained the Iekzeed Company Website, improving brand visibility and client reach.",
    ],
    current: false,
  },
];

export default function Experience() {
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
    <section id="experience" ref={ref} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="section-reveal mb-16">
          <p className="text-gold font-mono text-sm tracking-widest mb-3">
            03. EXPERIENCE
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text">
            Work History
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-gold/50 via-border to-transparent" />

          <div className="space-y-10">
            {experiences.map((exp, i) => (
              <div
                key={`${exp.company}-${i}`}
                className="section-reveal relative pl-14 md:pl-24"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-1 md:left-5 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    exp.current
                      ? "border-gold bg-gold/20"
                      : "border-border bg-card"
                  }`}
                >
                  {exp.current && (
                    <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  )}
                </div>

                <div className="hover-card bg-card border border-border rounded-2xl p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-text mb-1">
                        {exp.role}
                      </h3>
                      <p className="text-gold font-medium">{exp.company}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-mono ${
                          exp.current
                            ? "bg-gold/10 text-gold border border-gold/30"
                            : "bg-subtle text-muted border border-border"
                        }`}
                      >
                        {exp.period}
                      </span>
                      <div className="flex items-center gap-1 justify-end mt-2 text-muted text-xs">
                        <MapPin size={11} />
                        <span>{exp.location}</span>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="flex gap-3 text-text-dim text-sm leading-relaxed">
                        <span className="text-gold mt-1.5 flex-shrink-0 text-xs">▸</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
