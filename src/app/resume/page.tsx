import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, Mail, MapPin, Phone } from "lucide-react";

import { education, experiences, skillGroups } from "../../data/resume";
import { seoDescription, site } from "../../data/site";

export const metadata: Metadata = {
  title: "Resume",
  description: seoDescription,
  alternates: { canonical: "/resume" },
};

const contactItems = [
  { icon: Phone, label: site.phone, href: site.phoneHref },
  { icon: Mail, label: site.email, href: `mailto:${site.email}` },
  { icon: MapPin, label: site.location.label, href: null },
];

export default function ResumePage() {
  return (
    <main className="min-h-screen bg-background py-12 px-6 print:py-0 print:px-0">
      {/* Toolbar — screen only */}
      <div className="no-print max-w-3xl mx-auto flex items-center justify-between gap-4 mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-dim hover:text-gold transition-colors text-sm font-medium"
        >
          <ArrowLeft size={15} />
          Back to portfolio
        </Link>

        <a
          href={site.resumePath}
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
        >
          <Download size={15} />
          Download PDF
        </a>
      </div>

      <article className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-12 print:border-0 print:rounded-none print:p-0">
        {/* Header */}
        <header className="border-b border-border pb-6 mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-text tracking-tight">
            {site.name}
          </h1>
          <p className="text-gold font-medium text-lg mt-1">{site.role}</p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-text-dim text-sm">
            {contactItems.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
                >
                  <item.icon size={13} className="text-gold" />
                  {item.label}
                </a>
              ) : (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5"
                >
                  <item.icon size={13} className="text-gold" />
                  {item.label}
                </span>
              ),
            )}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2 text-text-dim text-sm">
            <a
              href={site.linkedin}
              className="hover:text-gold transition-colors"
            >
              {site.linkedin.replace("https://", "")}
            </a>
            <a href={site.github} className="hover:text-gold transition-colors">
              {site.github.replace("https://", "")}
            </a>
          </div>
        </header>

        {/* Profile */}
        <Section title="Profile">
          <p className="text-text-dim text-sm leading-relaxed">
            {site.summary}
          </p>
          <p className="text-text-dim text-sm leading-relaxed mt-3">
            {site.summarySecondary}
          </p>
        </Section>

        {/* Experience */}
        <Section title="Work Experience">
          <div className="space-y-6">
            {experiences.map((exp) => (
              <div
                key={`${exp.company}-${exp.period}`}
                className="print-break-inside-avoid"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-semibold text-text">{exp.role}</h3>
                  <span className="text-muted text-xs font-mono">
                    {exp.period}
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 mb-2">
                  <p className="text-gold text-sm font-medium">{exp.company}</p>
                  <span className="text-muted text-xs">{exp.location}</span>
                </div>
                <ul className="space-y-1.5">
                  {exp.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex gap-2.5 text-text-dim text-sm leading-relaxed"
                    >
                      <span className="text-gold mt-1.5 shrink-0 text-[8px]">
                        ●
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Skills */}
        <Section title="Skills">
          <div className="space-y-3">
            {skillGroups.map((group) => (
              <div
                key={group.category}
                className="print-break-inside-avoid grid sm:grid-cols-[190px_1fr] gap-x-4 gap-y-1"
              >
                <p className="font-semibold text-text text-sm">
                  {group.category}
                </p>
                <p className="text-text-dim text-sm leading-relaxed">
                  {group.skills.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Education */}
        <Section title="Education" last>
          {education.map((item) => (
            <div key={item.school} className="print-break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="font-semibold text-text">{item.level}</h3>
                <span className="text-muted text-xs font-mono">
                  {item.period}
                </span>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <p className="text-gold text-sm font-medium">{item.school}</p>
                <span className="text-muted text-xs">{item.location}</span>
              </div>
            </div>
          ))}
        </Section>
      </article>
    </main>
  );
}

function Section({
  title,
  children,
  last = false,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <section className={last ? "" : "mb-8"}>
      <h2 className="font-display text-xs font-bold tracking-[0.2em] text-text uppercase border-b border-border pb-2 mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}
