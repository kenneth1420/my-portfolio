import { type Variants, useReducedMotion } from "motion/react";

export interface IKineticLine {
  text: string;
  /** Classes for the line box: size, indent, colour. */
  className?: string;
  /** Classes for every glyph. A clipped-gradient class must go here: each
      glyph is transformed, which stops a parent's text clip reaching it. */
  charClassName?: string;
}

/** Seconds between one line starting and the next. */
const LINE_STEP = 0.18;
/** Seconds between characters within a line. */
const CHAR_STEP = 0.028;

/** Slightly underdamped, so each glyph overshoots a hair and settles. */
const CHAR_SPRING = { type: "spring", stiffness: 380, damping: 26, mass: 0.9 } as const;

const buildLineVariants = (reduced: boolean): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: reduced ? 0 : CHAR_STEP } },
});

const buildCharVariants = (reduced: boolean): Variants => ({
  hidden: { y: "110%", rotate: 8, opacity: 0 },
  visible: {
    y: "0%",
    rotate: 0,
    opacity: 1,
    transition: reduced ? { duration: 0 } : CHAR_SPRING,
  },
});

/** Splits a line into words of characters. Words stay whole for wrapping. */
const splitWords = (text: string) =>
  text.split(" ").map((word) => Array.from(word));

/**
 * Drives the hero's split-character reveal: lines enter one after another,
 * and within each line the glyphs spring up out of a clip mask in sequence.
 *
 * Reduced-motion users get the finished heading at once: every transition
 * collapses to zero. `initial` itself never branches on the preference.
 * The server cannot know it, so a client-only `initial={false}` would
 * render different styles from the server HTML and fail hydration.
 */
export function useKineticHeading(
  lines: IKineticLine[],
  delay = 0,
  label?: string,
) {
  const reduced = useReducedMotion() ?? false;

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: reduced
        ? { delayChildren: 0, staggerChildren: 0 }
        : { delayChildren: delay, staggerChildren: LINE_STEP },
    },
  };

  return {
    initial: "hidden" as const,
    containerVariants,
    lineVariants: buildLineVariants(reduced),
    charVariants: buildCharVariants(reduced),
    label: label ?? lines.map((line) => line.text).join(", "),
    splitLines: lines.map((line) => ({ ...line, words: splitWords(line.text) })),
  };
}
