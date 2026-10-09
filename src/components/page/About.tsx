"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Building, GraduationCap, MapPin } from "lucide-react";
import CountUp from "../ui/CountUp";
import SectionHeading from "../ui/SectionHeading";
import { Stagger, StaggerItem } from "../ui/Reveal";
import { education, experiences } from "@/src/data/resume";
import { site, stats } from "@/src/data/site";
import avatarImage from "../../assets/avatar-profile.jpg";

const current = experiences.find((exp) => exp.current);

interface TileProps {
  children: ReactNode;
  /** Deal order within the bento. */
  index: number;
  className?: string;
}

/** One cell of the bento: shared chrome, its span supplied by the caller. */
function Tile({ children, index, className = "" }: TileProps) {
  return (
    <StaggerItem index={index} className={className}>
      <div className="glow-border hover-card h-full bg-card/80 backdrop-blur-sm border border-border rounded-3xl p-6 md:p-7">
        {children}
      </div>
    </StaggerItem>
  );
}

export default function About() {
  return (
    <section id="about" className="py-28 px-6 bg-surface/40">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          index="02"
          eyebrow="About"
          title="Who I"
          accent="am"
          className="mb-14"
        />

        {/* Bento: the portrait and the statement share the top band, the
            figures run beneath as their evidence, and the facts close the
            grid. */}
        <Stagger
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(150px,auto)]"
          step={70}
        >
          {/* The face behind the work. It lives here rather than in the
              hero, which belongs to the 3D scene. Not a Tile: the photo runs
              to the card's edge, so it needs the chrome without the padding. */}
          <StaggerItem index={0} className="col-span-2 lg:col-span-1 lg:row-span-2">
            <figure className="glow-border hover-card relative h-80 lg:h-full lg:min-h-80 rounded-3xl border border-border">
              <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                <Image
                  src={avatarImage}
                  alt={`Portrait of ${site.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 280px"
                  className="object-cover object-top"
                />
                {/* Scrim so the caption reads over any part of the photo,
                    in either theme. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/75 to-transparent"
                />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <span className="block font-headline text-lg font-bold leading-tight text-white">
                  {site.name}
                </span>
                <span className="block mt-0.5 font-mono text-[11px] uppercase tracking-wider text-white/75">
                  {site.role}
                </span>
              </figcaption>
            </figure>
          </StaggerItem>

          <Tile index={1} className="col-span-2 lg:col-span-3 lg:row-span-2">
            <div className="flex h-full flex-col justify-between gap-8">
              <p className="font-serif text-2xl md:text-[1.7rem] leading-snug text-text">
                I build the software people open first thing at work — ERP
                modules, clinic systems, CRMs — and the mobile apps that sit in
                front of them.
              </p>
              <p className="text-text-dim text-sm leading-relaxed max-w-lg">
                Most of it is C# and ASP.NET Core behind React or React Native.
                I care about data that stays correct, screens that stay fast,
                and code the next developer can read. Next, I want a team
                building something people rely on.
              </p>
            </div>
          </Tile>

          {stats.map((stat, i) => (
            <Tile key={stat.label} index={i + 2}>
              <div className="flex h-full flex-col justify-between gap-6">
                <p className="text-muted text-[11px] font-mono uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="font-serif text-6xl text-primary-gradient leading-none pr-1">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
              </div>
            </Tile>
          ))}

          <Tile index={6} className="col-span-2 lg:col-span-1">
            <Fact icon={<MapPin size={16} />} label="Based in">
              {site.location.label}
            </Fact>
          </Tile>

          <Tile index={7} className="col-span-2">
            <Fact icon={<GraduationCap size={16} />} label="Education">
              BS Computer Science — {education[0].school}
              <span className="text-muted"> · {education[0].period}</span>
            </Fact>
          </Tile>

          {current && (
            <Tile index={8} className="col-span-2 lg:col-span-1">
              <Fact icon={<Building size={16} />} label="Currently">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                  </span>
                  {current.company}
                </span>
              </Fact>
            </Tile>
          )}
        </Stagger>
      </div>
    </section>
  );
}

interface FactProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

function Fact({ icon, label, children }: FactProps) {
  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <span className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center">
        {icon}
      </span>
      <div>
        <p className="text-muted text-[11px] font-mono uppercase tracking-wider mb-1">
          {label}
        </p>
        <div className="text-text text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
