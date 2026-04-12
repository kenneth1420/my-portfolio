import { CSSProperties } from "react";

interface ShinyTextProps {
  text: string;
  className?: string;
  speed?: number; // seconds per shimmer cycle
}

export default function ShinyText({
  text,
  className = "",
  speed = 3,
}: ShinyTextProps) {
  return (
    <span
      className={className}
      style={
        {
          "--shimmer-speed": `${speed}s`,
          background:
            "linear-gradient(90deg, currentColor 0%, rgba(255,255,255,0.5) 40%, currentColor 60%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer var(--shimmer-speed) linear infinite",
        } as CSSProperties
      }
    >
      {text}
    </span>
  );
}
