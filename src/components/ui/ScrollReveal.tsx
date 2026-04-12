"use client";

import { useEffect, useRef, ReactNode, CSSProperties } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  blur?: boolean;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  y = 30,
  blur = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            if (blur) el.style.filter = "blur(0)";
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, blur]);

  const style: CSSProperties = {
    opacity: 0,
    transform: `translateY(${y}px)`,
    transition: "opacity 0.7s ease, transform 0.7s ease, filter 0.7s ease",
    ...(blur ? { filter: "blur(6px)" } : {}),
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
