"use client";

import { useTextScramble } from "@/src/hook/use.text.scramble.hook";

interface IProps {
  text: string;
  className?: string;
  /** Earliest start, in ms after mount. */
  notBefore?: number;
}

/**
 * Text that scrambles and resolves left to right on first view. Set it in a
 * monospaced font so the width holds steady while the glyphs change.
 */
export default function ScrambleText({ text, className = "", notBefore = 0 }: IProps) {
  const ref = useTextScramble<HTMLSpanElement>(text, undefined, notBefore);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
