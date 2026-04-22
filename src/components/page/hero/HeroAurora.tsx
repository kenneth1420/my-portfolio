"use client";

import dynamic from "next/dynamic";
import { useIsMobile } from "@/src/hook/use.mobile.hook";

const Aurora = dynamic(() => import("../../ui/Aurora"));

export default function HeroAurora() {
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Aurora
        colorStops={["#66c4ff", "#B19EEF", "#5227FF"]}
        blend={1}
        amplitude={1.0}
        speed={1}
      />
    </div>
  );
}
