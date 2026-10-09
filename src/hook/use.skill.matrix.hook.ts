import { useMemo, useState } from "react";
import { skills, type Skill, type SkillCategory } from "@/src/data/resume";

export type SkillFilter = SkillCategory | "all";

const FILTER_LABELS: { id: SkillFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend / .NET" },
  { id: "data", label: "Database & Cloud" },
  { id: "mobile", label: "Mobile" },
];

const matches = (skill: Skill, filter: SkillFilter) =>
  filter === "all" || skill.categories.includes(filter);

/**
 * State for the skills matrix: the active filter, and which skill's detail
 * card is open. Only one card is open at a time, so moving between chips
 * never stacks them.
 */
export function useSkillMatrix() {
  const [activeFilter, setActiveFilter] = useState<SkillFilter>("all");
  const [openSkill, setOpenSkill] = useState<string | null>(null);

  const filters = useMemo(
    () =>
      FILTER_LABELS.map((filter) => ({
        ...filter,
        count: skills.filter((skill) => matches(skill, filter.id)).length,
      })),
    [],
  );

  const visibleSkills = skills.filter((skill) => matches(skill, activeFilter));

  const handleFilterChange = (filter: SkillFilter) => {
    setOpenSkill(null);
    setActiveFilter(filter);
  };

  const handleSkillClose = (name: string) =>
    setOpenSkill((current) => (current === name ? null : current));

  return {
    filters,
    activeFilter,
    visibleSkills,
    openSkill,
    handleFilterChange,
    handleSkillOpen: setOpenSkill,
    handleSkillClose,
  };
}
