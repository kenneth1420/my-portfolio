"use client";

import { useCountUp } from "@/src/hook/use.count.up.hook";

interface CountUpProps {
  value: number;
  suffix?: string;
  /** Earliest start, in ms after mount. */
  notBefore?: number;
}

export default function CountUp({ value, suffix = "", notBefore = 0 }: CountUpProps) {
  const ref = useCountUp<HTMLSpanElement>(value, undefined, notBefore);

  return (
    <>
      <span ref={ref} className="tabular-nums">
        {value}
      </span>
      {suffix}
    </>
  );
}
