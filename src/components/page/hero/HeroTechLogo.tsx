"use client";

import dynamic from "next/dynamic";
import { useIsMobile } from "@/src/hook/use.mobile.hook";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiDotnet,
  SiSharp,
  SiRedux,
  SiMobx,
} from "react-icons/si";

const LogoLoop = dynamic(() => import("../../ui/LoopLogo"));

const techLogos = [
  { node: <SiReact size={30} />, title: "React", href: "https://react.dev" },
  {
    node: <SiNextdotjs size={30} />,
    title: "Next.js",
    href: "https://nextjs.org",
  },
  {
    node: <SiTypescript size={30} />,
    title: "TypeScript",
    href: "https://www.typescriptlang.org",
  },
  {
    node: <SiTailwindcss size={30} />,
    title: "Tailwind CSS",
    href: "https://tailwindcss.com",
  },
  {
    node: <SiDotnet size={30} />,
    title: ".NET Core",
    href: "https://dotnet.microsoft.com",
  },
  {
    node: <SiSharp size={30} />,
    title: "C#",
    href: "https://learn.microsoft.com/en-us/dotnet/csharp",
  },
  {
    node: <SiRedux size={30} />,
    title: "Redux",
    href: "https://redux.js.org",
  },
  { node: <SiMobx size={30} />, title: "MobX", href: "https://mobx.js.org" },
  {
    node: <span className="text-xs font-bold font-mono">ZST</span>,
    title: "Zustand",
    href: "https://zustand-demo.pmnd.rs",
  },
];

export default function HeroTechLogo() {
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <>
      {/* Logos only — the hero's calls to action live in Hero, so there is
          one primary action rather than three competing rows of buttons. */}
      <div className="flex flex-wrap gap-4">
        <div className="w-full">
          <LogoLoop
            logos={techLogos}
            speed={100}
            direction="left"
            logoHeight={30}
            gap={30}
            hoverSpeed={0}
            scaleOnHover={!isMobile}
            fadeOut
            fadeOutColor="#ffffff"
            ariaLabel="Technology partners"
          />
        </div>
      </div>
    </>
  );
}
