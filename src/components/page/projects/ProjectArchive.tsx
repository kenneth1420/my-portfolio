import type { Project } from "@/src/data/resume";

interface IFilter {
  label: string;
  count: number;
}

interface IProps {
  projects: Project[];
  filters: IFilter[];
  activeCompany: string;
  onFilterChange: (company: string) => void;
}

/**
 * Earlier work beyond the three showcase builds, as a dense index: one row
 * per project, filterable by company. It is there to back the headline
 * count, so it stays quiet and lets the cards above carry the section.
 */
export default function ProjectArchive({
  projects,
  filters,
  activeCompany,
  onFilterChange,
}: IProps) {
  return (
    <div className="mt-20">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between mb-6">
        <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-primary-strong">
          Archive
        </h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter archive by company">
          {filters.map((filter) => {
            const isActive = filter.label === activeCompany;
            return (
              <button
                key={filter.label}
                type="button"
                onClick={() => onFilterChange(filter.label)}
                aria-pressed={isActive}
                className={`px-3.5 py-1.5 rounded-full border text-[11px] font-mono transition-[background-color,border-color,color] duration-300 ${
                  isActive
                    ? "bg-primary/15 border-primary/50 text-primary-strong"
                    : "bg-subtle/70 border-border text-text-dim hover:border-primary/40 hover:text-primary-strong"
                }`}
              >
                {filter.label}{" "}
                <span className="ml-0.5 tabular-nums">
                  {filter.count}
                  <span className="sr-only"> projects</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ul className="border-t border-border">
        {projects.map((project) => (
          <li
            key={project.title}
            className="grid grid-cols-1 gap-1 border-b border-border py-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-baseline md:gap-6"
          >
            <span className="font-medium text-text">{project.title}</span>
            <span className="text-sm text-text-dim">{project.company}</span>
            <span className="font-mono text-[11px] tracking-wide text-text-dim md:text-right">
              {project.period}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
