"use client";

import { motion } from "motion/react";
import { Fragment } from "react";
import { REVEAL_ATTR } from "../../ui/Reveal";
import {
  type IKineticLine,
  useKineticHeading,
} from "@/src/hook/use.kinetic.heading.hook";

interface IProps {
  lines: IKineticLine[];
  /** Seconds before the first line starts. */
  delay?: number;
  /** The heading as one plain string; defaults to the lines joined with
      commas. Read by screen readers and by anything that scrapes the HTML. */
  label?: string;
  className?: string;
}

/**
 * The hero headline: each line's characters spring up out of a clip mask,
 * line after line.
 *
 * The heading's text is carried twice. A visually hidden span holds it as
 * one plain string, and the split glyphs are hidden from assistive
 * technology, so nobody hears it spelled out letter by letter. The string is
 * real text rather than an `aria-label` so that it is also in the server
 * HTML in one piece: a crawler or an ATS scraper reading the markup finds
 * the headline, not a hundred single-letter spans.
 *
 * Words are kept as unbreakable boxes, so a narrow screen wraps between words
 * and never mid-name.
 */
export default function KineticHeading({
  lines,
  delay = 0,
  label: labelOverride,
  className = "",
}: IProps) {
  const { initial, containerVariants, lineVariants, charVariants, label, splitLines } =
    useKineticHeading(lines, delay, labelOverride);

  return (
    <motion.h1
      className={className}
      variants={containerVariants}
      initial={initial}
      animate="visible"
    >
      <span className="sr-only">{label}</span>
      {splitLines.map((line) => (
        <motion.span
          key={line.text}
          aria-hidden="true"
          variants={lineVariants}
          className={`block ${line.className ?? ""}`}
        >
          {line.words.map((chars, w) => (
            <Fragment key={`${line.text}-${w}`}>
            <span className="inline-block whitespace-nowrap">
              {chars.map((char, c) => (
                /* overflow-clip masks without becoming a scroll container. The
                   padding gives descenders and overshoot room inside the mask;
                   the matching negative margin keeps the line height. */
                <span
                  key={`${char}-${c}`}
                  className="inline-block overflow-clip align-bottom pb-[0.14em] -mb-[0.14em]"
                >
                  <motion.span
                    {...REVEAL_ATTR}
                    variants={charVariants}
                    className={`inline-block origin-bottom-left will-change-transform ${line.charClassName ?? ""}`}
                  >
                    {char}
                  </motion.span>
                </span>
              ))}
            </span>
            {/* The space sits between word boxes, not inside one, so it is a
                real wrap opportunity. */}
            {w < line.words.length - 1 && " "}
            </Fragment>
          ))}
        </motion.span>
      ))}
    </motion.h1>
  );
}
