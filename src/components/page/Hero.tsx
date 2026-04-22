"use client";
import Image from "next/image";
import HeroAurora from "./hero/HeroAurora";
import SplitText from "../ui/SplitText";
import BlurText from "../ui/BlurText";
import ShinyText from "../ui/ShinyText";
import avatarImage from "../../assets/avatar-profile.jpg";
import HeroTechLogo from "./hero/HeroTechLogo";

import { ArrowDown, Mail, Phone, Link } from "lucide-react";
import { useIsMobile } from "@/src/hook/use.mobile.hook";

export default function Hero() {
  const isMobile = useIsMobile();

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-10 px-6 overflow-hidden">
      <HeroAurora />
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
            <div className="w-10 h-0.5 bg-gold rounded-full" />
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

          <HeroTechLogo />

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
            {isMobile ? (
              <span className="text-muted text-xs font-mono">
                kennethlariosa14@gmail.com
              </span>
            ) : (
              <span className="text-muted text-xs font-mono">
                <ShinyText text="kennethlariosa14@gmail.com" speed={4} />
              </span>
            )}
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end mt-12 lg:mt-0">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full border border-gold/20 animate-float" />
            <div className="absolute -inset-8 rounded-full border border-gold/10" />

            <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 border-t-2 border-r-2 border-gold rounded-tr-lg" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 md:w-8 md:h-8 border-b-2 border-l-2 border-gold rounded-bl-lg" />

            <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden border-2 border-border shadow-2xl shadow-gold/10">
              <Image
                src={avatarImage}
                alt="Kenneth Lariosa"
                fill
                sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 288px, 320px"
                className="object-cover object-top"
                fetchPriority="high"
                priority
              />
            </div>

            <div className="absolute -bottom-4 -right-4 sm:-bottom-4 sm:-right-4 md:-bottom-6 md:-right-6 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-border rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-xl">
              <p className="text-[10px] md:text-xs text-muted font-mono">
                Experience
              </p>
              <p className="text-lg md:text-xl font-display font-bold text-gold">
                6+
              </p>
              <p className="text-[10px] md:text-xs text-text-dim">Years</p>
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
