"use client";

import { useEffect, useRef } from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export default function SplitText({
  text,
  className = "",
  delay = 30,
  duration = 500,
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const spans = ref.current?.querySelectorAll("span");
    spans?.forEach((span, i) => {
      setTimeout(() => {
        span.style.opacity = "1";
        span.style.transform = "translateY(0) rotate(0deg)";
      }, i * delay);
    });
  }, [delay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: 0,
            transform: "translateY(20px) rotate(6deg)",
            transition: `opacity ${duration}ms cubic-bezier(0.34,1.56,0.64,1), transform ${duration}ms cubic-bezier(0.34,1.56,0.64,1)`,
            whiteSpace: char === " " ? "pre" : undefined,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}
