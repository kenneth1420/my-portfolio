"use client";

import ScrollReveal from "../ui/ScrollReveal";
import SpotlightCard from "../ui/SpotlightCard";

const skillGroups = [
  {
    category: "Languages & Frameworks",
    icon: "⟨/⟩",
    skills: [
      "C#",
      "ASP.NET",
      "ASP.NET Core",
      "JavaScript",
      "TypeScript",
      "React JS",
      "React Native",
      "jQuery",
    ],
  },
  {
    category: "Web & Styling",
    icon: "◈",
    skills: [
      "HTML5",
      "CSS3",
      "Bootstrap",
      "Tailwind CSS",
      "Styled Components",
      "Material UI",
      "Ant Design",
    ],
  },
  {
    category: "Databases",
    icon: "⬡",
    skills: ["MSSQL", "MySQL", "PostgreSQL"],
  },
  {
    category: "Tools & Platforms",
    icon: "⚙",
    skills: ["Git", "Firebase"],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6 bg-surface/50">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="mb-16">
          <p className="text-gold font-mono text-sm tracking-widest mb-3">
            02. SKILLS
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text">
            Tech Stack
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {skillGroups.map((group, i) => (
            <ScrollReveal key={group.category} delay={i * 100}>
              <SpotlightCard className="bg-card border border-border rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono text-gold text-lg">
                    {group.icon}
                  </span>
                  <h3 className="font-display text-lg font-semibold text-text">
                    {group.category}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-lg bg-subtle border border-border text-text-dim text-sm font-mono hover:border-gold/40 hover:text-gold transition-all duration-200 cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
