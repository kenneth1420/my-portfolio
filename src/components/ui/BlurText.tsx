"use client";

import { useEffect, useRef } from "react";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number; // ms between each word
  duration?: number; // animation duration in ms
}

export default function BlurText({
  text,
  className = "",
  delay = 80,
  duration = 600,
}: BlurTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const spans = ref.current?.querySelectorAll("span");
    spans?.forEach((span, i) => {
      setTimeout(() => {
        span.style.opacity = "1";
        span.style.filter = "blur(0px)";
        span.style.transform = "translateY(0)";
      }, i * delay);
    });
  }, [delay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: 0,
            filter: "blur(8px)",
            transform: "translateY(10px)",
            transition: `opacity ${duration}ms ease, filter ${duration}ms ease, transform ${duration}ms ease`,
            marginRight: "0.3em",
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
