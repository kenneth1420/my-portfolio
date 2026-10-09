import { useMemo, useState } from "react";
import {
  archivedProjects,
  showcaseProjects,
  totalProjects,
} from "@/src/data/resume";

export const ALL_COMPANIES = "All";

/**
 * State for the Projects section: the three showcase builds, plus the archive
 * beneath them filtered by company. Filter counts cover the archive only, so
 * each chip promises exactly the number of rows it reveals.
 */
export function useProjectsSection() {
  const [activeCompany, setActiveCompany] = useState<string>(ALL_COMPANIES);

  const filters = useMemo(() => {
    const counts = new Map<string, number>();
    archivedProjects.forEach((project) =>
      counts.set(project.company, (counts.get(project.company) ?? 0) + 1),
    );
    return [
      { label: ALL_COMPANIES, count: archivedProjects.length },
      ...[...counts.entries()].map(([label, count]) => ({ label, count })),
    ];
  }, []);

  const visibleArchive =
    activeCompany === ALL_COMPANIES
      ? archivedProjects
      : archivedProjects.filter((project) => project.company === activeCompany);

  return {
    showcase: showcaseProjects,
    totalCount: totalProjects,
    filters,
    activeCompany,
    visibleArchive,
    handleFilterChange: setActiveCompany,
  };
}
