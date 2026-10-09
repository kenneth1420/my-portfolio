import { MapPin } from "lucide-react";
import type { Experience } from "@/src/data/resume";

interface IProps {
  role: Experience;
}

/** One role's panel: the figures first, then the scope, then what shipped. */
export default function RoleDetail({ role }: IProps) {
  return (
    <article className="load-rise glow-border bg-card/80 backdrop-blur-sm border border-border rounded-3xl p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display text-xl font-semibold text-text mb-1">{role.role}</h3>
          <p className="text-primary-strong font-medium">{role.company}</p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-mono ${
              role.current
                ? "bg-primary/10 text-primary-strong border border-primary/30"
                : "bg-subtle text-text-dim border border-border"
            }`}
          >
            {role.period}
          </span>
          <div className="flex items-center gap-1 justify-end mt-2 text-text-dim text-xs">
            <MapPin aria-hidden="true" size={11} />
            <span>{role.location}</span>
          </div>
        </div>
      </div>

      <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary-strong mb-3">
        Key metrics
      </h4>
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
        {role.metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col rounded-2xl border border-border bg-subtle/50 p-4">
            <dt className="order-2 mt-1.5 font-mono text-[10px] uppercase leading-tight tracking-wider text-text-dim">
              {metric.label}
            </dt>
            <dd className="order-1 font-headline text-3xl font-bold leading-none text-text">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>

      <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary-strong mb-2">
        System scope
      </h4>
      <p className="text-text-dim text-sm leading-relaxed mb-7">{role.scope}</p>

      <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary-strong mb-3">
        Deliverables
      </h4>
      <ul className="space-y-2">
        {role.highlights.map((highlight) => (
          <li key={highlight} className="flex gap-3 text-text-dim text-sm leading-relaxed">
            <span aria-hidden="true" className="text-primary mt-1.5 shrink-0 text-xs">▸</span>
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
