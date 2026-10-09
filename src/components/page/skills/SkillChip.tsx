"use client";

import type { PointerEvent } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "../../ui/Popover";
import type { Skill } from "@/src/data/resume";

interface IProps {
  skill: Skill;
  isOpen: boolean;
  onOpen: (name: string) => void;
  onClose: (name: string) => void;
}

const isMouse = (event: PointerEvent) => event.pointerType === "mouse";

/**
 * One skill, with a detail card: how long it has been in use and what was
 * built with it. The card opens on hover, on keyboard focus, and on tap, so
 * it is not a mouse-only feature. It is rendered only while open, which also
 * keeps the year arithmetic out of the server HTML.
 */
export default function SkillChip({ skill, isOpen, onOpen, onClose }: IProps) {
  const cardId = `skill-${skill.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  const years = skill.since ? new Date().getFullYear() - skill.since : null;

  return (
    <Popover open={isOpen} onOpenChange={(open) => !open && onClose(skill.name)}>
      <PopoverAnchor asChild>
        <button
          type="button"
          aria-describedby={isOpen ? cardId : undefined}
          onPointerEnter={(event) => isMouse(event) && onOpen(skill.name)}
          onPointerLeave={(event) => isMouse(event) && onClose(skill.name)}
          onFocus={() => onOpen(skill.name)}
          onBlur={() => onClose(skill.name)}
          onClick={() => onOpen(skill.name)}
          className={`block px-3.5 py-1.5 rounded-full border text-sm font-mono transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
            isOpen
              ? "border-primary/60 bg-primary/10 text-primary-strong"
              : "border-border bg-card/70 text-text-dim"
          }`}
        >
          {skill.name}
        </button>
      </PopoverAnchor>
      <PopoverContent
        id={cardId}
        role="tooltip"
        side="top"
        // The card is read, not operated: focus stays on the chip.
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className="pointer-events-none"
      >
        <p className="font-semibold text-text">{skill.name}</p>
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-primary-strong">
          {years ? `${years}+ years · since ${skill.since}` : skill.group}
        </p>
        {skill.projects.length > 0 && (
          <>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-text-dim">
              Built with it
            </p>
            <ul className="mt-1 space-y-0.5 text-[13px] text-text-dim">
              {skill.projects.map((project) => (
                <li key={project}>{project}</li>
              ))}
            </ul>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
