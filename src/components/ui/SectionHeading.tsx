import type { ReactNode } from "react";
import { Stagger, StaggerItem, StaggerRule } from "./Reveal";
import RevealText from "./RevealText";

interface SectionHeadingProps {
  /** Two-digit position in the page, e.g. "01". */
  index: string;
  eyebrow: string;
  title: string;
  /** Final word(s) of the title, set in accent italic. */
  accent: string;
  children?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

/**
 * The one header every section shares: a numbered eyebrow whose rule draws
 * itself in, then a serif title that rises word by word, its last words in
 * accent italic, then any supporting copy. The whole header is one reveal group,
 * so the pieces arrive in that order from a single trigger.
 */
export default function SectionHeading({
  index,
  eyebrow,
  title,
  accent,
  children,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";

  const words = [
    ...title.split(" ").map((text) => ({ text })),
    ...accent.split(" ").map((text) => ({
      text,
      className: "italic text-primary-gradient",
    })),
  ];

  return (
    <Stagger step={70} className={`${centered ? "text-center" : ""} ${className}`}>
      <p
        className={`flex items-center gap-3 text-primary font-mono text-xs tracking-[0.3em] uppercase mb-5 ${
          centered ? "justify-center" : ""
        }`}
      >
        <StaggerRule className="h-px w-10 bg-gradient-to-r from-primary to-transparent" />
        <StaggerItem as="span" index={0}>
          {index} / {eyebrow}
        </StaggerItem>
      </p>
      <h2 className="font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight text-text text-balance">
        <RevealText words={words} trigger="parent" startIndex={1} />
      </h2>
      {children && (
        <StaggerItem index={words.length + 2}>{children}</StaggerItem>
      )}
    </Stagger>
  );
}
