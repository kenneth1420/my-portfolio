"use client";

import { motion, type Variants } from "motion/react";
import { REVEAL_ATTR, Stagger, useStaggerTiming } from "./Reveal";

export interface RevealWord {
  text: string;
  /** Classes for this word's glyphs. A clipped-gradient class must go here:
      each word is transformed, which stops a parent's text clip reaching it. */
  className?: string;
}

interface RevealTextProps {
  words: RevealWord[];
  /**
   * When the words rise:
   * - `scroll` — this text is its own reveal group, triggered on entering view
   * - `parent` — with the enclosing `Stagger`, using its timing
   */
  trigger?: "scroll" | "parent";
  /** Offset for the word stagger, when earlier siblings in a group go first. */
  startIndex?: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** A word rising out of its clip mask, delayed by `custom` milliseconds. */
const wordRise: Variants = {
  hidden: { y: "135%" },
  visible: (delayMs: number = 0) => ({
    y: "0%",
    transition: { duration: 0.9, ease: EASE, delay: delayMs / 1000 },
  }),
};

function Words({ words, startIndex = 0 }: Omit<RevealTextProps, "trigger">) {
  const { step, delay } = useStaggerTiming();

  return (
    <>
      {words.map((word, i) => (
        <span key={`${word.text}-${i}`}>
          {/* overflow-clip, not overflow-hidden: it masks the same way but
              does not make the span a scroll container. The padding gives
              descenders and italic overhang room inside the mask; the
              matching negative margin keeps the line height. */}
          <span className="inline-block overflow-clip align-bottom pb-[0.26em] -mb-[0.26em] pr-[0.06em] -mr-[0.06em]">
            <motion.span
              {...REVEAL_ATTR}
              className={`inline-block ${word.className ?? ""}`}
              variants={wordRise}
              custom={delay + (startIndex + i) * step}
            >
              {word.text}
            </motion.span>
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </>
  );
}

/**
 * Masked word reveal: each word rises out of its own clipping box, as if
 * being set line by line. The sentence stays in the DOM as real text, so it
 * reads and indexes normally.
 */
export default function RevealText({ words, trigger = "scroll", startIndex = 0 }: RevealTextProps) {
  if (trigger === "parent") return <Words words={words} startIndex={startIndex} />;

  return (
    <Stagger as="span">
      <Words words={words} startIndex={startIndex} />
    </Stagger>
  );
}
