"use client";

import Image from "next/image";
import Aurora from "../ui/Aurora";
import SplitText from "../ui/SplitText";
import BlurText from "../ui/BlurText";
import ShinyText from "../ui/ShinyText";
import avatarImage from "../../assets/avatar-profile.jpg";
import LogoLoop from "../ui/LoopLogo";

import { ArrowDown, Mail, Phone, Link } from "lucide-react";
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

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  {
    node: <SiTypescript />,
    title: "TypeScript",
    href: "https://www.typescriptlang.org",
  },
  {
    node: <SiTailwindcss />,
    title: "Tailwind CSS",
    href: "https://tailwindcss.com",
  },
  {
    node: <SiDotnet />,
    title: ".NET Core",
    href: "https://dotnet.microsoft.com",
  },
  {
    node: <SiSharp />,
    title: "C#",
    href: "https://learn.microsoft.com/en-us/dotnet/csharp",
  },
  { node: <SiRedux />, title: "Redux", href: "https://redux.js.org" },
  { node: <SiMobx />, title: "MobX", href: "https://mobx.js.org" },
  {
    node: <span className="text-xs font-bold font-mono">ZST</span>,
    title: "Zustand",
    href: "https://zustand-demo.pmnd.rs",
  },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-10 px-6 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Aurora
          colorStops={["#66c4ff", "#B19EEF", "#5227FF"]}
          blend={1}
          amplitude={1.0}
          speed={1}
        />
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4">
        <div className="w-px h-24 bg-gradient-to-b from-transparent to-border" />
        <span
          className="text-muted text-xs tracking-[0.3em] font-mono"
          style={{ writingMode: "vertical-rl" }}
        >
          FULL STACK DEV
        </span>
        <div className="w-px h-24 bg-gradient-to-b from-border to-transparent" />
      </div>
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-subtle border border-border text-gold text-xs font-mono tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Available for opportunities
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4">
            <SplitText text="Kenneth" delay={30} />
            <br />
            <span className="text-gold-gradient italic">
              <SplitText text="Lariosa" delay={30} />
            </span>
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-0.5 bg-[#D4AF37] rounded-full" />
            <span className="text-text-dim font-body font-light text-lg tracking-wide">
              <BlurText text="Full Stack Developer" delay={100} />
            </span>
          </div>

          <p className="text-text-dim leading-relaxed max-w-md mb-8 font-body">
            <BlurText
              text="Passionate about building reliable, high-quality web and mobile applications. Experienced across the full stack — focused on clean, maintainable code."
              delay={40}
              duration={500}
            />
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <div className="w-full mb-2">
              <LogoLoop
                logos={techLogos}
                speed={100}
                direction="left"
                logoHeight={30}
                gap={30}
                hoverSpeed={0}
                scaleOnHover
                fadeOut
                fadeOutColor="#ffffff"
                ariaLabel="Technology partners"
              />
            </div>
            <a
              href="#experience"
              className="px-7 py-3 rounded-full border border-border text-text-dim font-medium text-sm hover:border-gold/50 hover:text-text transition-all duration-200"
            >
              View My Work
            </a>
            <a
              href="#contact"
              className="px-7 py-3 rounded-full border border-border text-text-dim font-medium text-sm hover:border-gold/50 hover:text-text transition-all duration-200"
            >
              Get in Touch
            </a>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="https://www.linkedin.com/in/kenneth-lariosa-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-gold transition-colors"
            >
              <Link size={18} />
            </a>
            <a
              href="mailto:kennethlariosa14@gmail.com"
              className="text-muted hover:text-gold transition-colors"
            >
              <Mail size={18} />
            </a>
            <a
              href="tel:+639460364852"
              className="text-muted hover:text-gold transition-colors"
            >
              <Phone size={18} />
            </a>
            <div className="w-px h-4 bg-border mx-1" />
            <span className="text-muted text-xs font-mono">
              <ShinyText text="kennethlariosa14@gmail.com" speed={4} />
            </span>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full border border-gold/20 animate-float" />
            <div className="absolute -inset-8 rounded-full border border-gold/10" />
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-gold rounded-tr-lg" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-gold rounded-bl-lg" />
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-border shadow-2xl shadow-gold/10">
              <Image
                src={avatarImage}
                alt="Kenneth Lariosa"
                fill
                sizes="(max-width: 768px) 256px, 320px"
                className="object-cover object-top"
                priority
              />
            </div>
            <div className="bg-[#ffff] absolute -bottom-4 -right-4 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl">
              <p className="text-xs text-muted font-mono">Experience</p>
              <p className="text-xl font-display font-bold text-gold">6+</p>
              <p className="text-xs text-text-dim">Years</p>
            </div>
          </div>
        </div>
      </div>
      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted hover:text-gold transition-colors"
      >
        <span className="text-xs font-mono tracking-widest">SCROLL</span>
        <ArrowDown size={14} className="animate-bounce" />
      </a>
    </section>
  );
}
