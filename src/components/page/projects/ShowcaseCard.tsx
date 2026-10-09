import type { ReactNode } from "react";
import type { ShowcaseProject } from "@/src/data/resume";

interface IProps {
  project: ShowcaseProject;
  index: number;
  /** The project's live widget, laid full width under the copy. */
  children?: ReactNode;
}

/**
 * One featured build: what it is and what it runs on to the left, the
 * figures and highlights to the right, and its interactive demo underneath.
 */
export default function ShowcaseCard({ project, index, children }: IProps) {
  return (
    <article
      id={project.id}
      className="scroll-mt-24 rounded-3xl border border-border bg-card/80 p-6 backdrop-blur-sm md:p-10"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
          <p className="flex items-start justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-text-dim">
            <span>{project.kind}</span>
            <span aria-hidden="true" className="text-muted/70">
              0{index + 1}
            </span>
          </p>
          <h3 className="mt-3 font-headline text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-text md:text-5xl">
            {project.title}
          </h3>
          <p className="mt-4 max-w-xl leading-relaxed text-text-dim">{project.description}</p>

          <ul aria-label="Technologies" className="mt-6 flex flex-wrap gap-1.5">
            {project.tech.map((tech) => (
              <li
                key={tech}
                className="rounded-md border border-border bg-subtle/60 px-2 py-0.5 font-mono text-[10px] tracking-wide text-text-dim"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <dl className="grid grid-cols-3 gap-3">
            {project.metrics.map((metric) => (
              <div key={metric.label} className="flex flex-col rounded-2xl border border-border bg-subtle/50 p-3.5">
                <dt className="order-2 mt-1.5 font-mono text-[10px] uppercase leading-tight tracking-wider text-text-dim">
                  {metric.label}
                </dt>
                <dd className="order-1 font-headline text-2xl font-bold leading-none text-text sm:text-3xl">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
          <ul className="space-y-2">
            {project.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3 text-sm leading-relaxed text-text-dim">
                <span aria-hidden="true" className="mt-1.5 shrink-0 text-xs text-primary">▸</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {children && <div className="mt-10">{children}</div>}
    </article>
  );
}
