"use client";

import dynamic from "next/dynamic";
import { useIsMobile } from "@/src/hook/use.mobile.hook";

const Aurora = dynamic(() => import("../../ui/Aurora"));

export default function HeroAurora() {
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    // Coloured light on white has nothing to contrast with — at full strength
    // it swallows the accent type and the nav. Light mode keeps only a glow.
    <div className="absolute inset-0 z-0 pointer-events-none opacity-30 dark:opacity-100">
      <Aurora
        // Deep sea → sky → emerald: the site accents, so the hero
        // light belongs to the same palette as every button and card edge.
        colorStops={["#0c4a6e", "#38bdf8", "#10b981"]}
        blend={1}
        amplitude={1.0}
        speed={1}
      />
    </div>
  );
}
