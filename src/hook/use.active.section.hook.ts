import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently under the middle of the viewport,
 * or null above the first one (the hero).
 *
 * The root margin collapses the observed area to a thin band across the
 * viewport's centre, so exactly one section is "active" at a time and the
 * switch happens where the reader's eye is, not when a section's top edge
 * first peeks in.
 */
export function useActiveSection(ids: readonly string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    sections.forEach((section) => observer.observe(section));

    // Back in the hero, nothing in the nav should claim to be current.
    const handleScroll = () => {
      if (window.scrollY < sections[0].offsetTop - window.innerHeight / 2) {
        setActiveId(null);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [ids]);

  return activeId;
}
