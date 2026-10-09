"use client";

import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, ArrowUpRight, FileText, Mail, Phone } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import AvailabilityBadge from "./hero/AvailabilityBadge";
import HeroStage from "./hero/HeroStage";
import HeroStats from "./hero/HeroStats";
import KineticHeading from "./hero/KineticHeading";
import MagneticButton from "./hero/MagneticButton";
import { heroCtas } from "@/src/data/hero";
import { site } from "@/src/data/site";
import { useHeroJourney } from "@/src/hook/use.hero.journey.hook";
import type { IKineticLine } from "@/src/hook/use.kinetic.heading.hook";

const socialLinks = [
  { icon: FaLinkedin, label: "LinkedIn profile", href: site.linkedin },
  { icon: Mail, label: `Email ${site.email}`, href: `mailto:${site.email}` },
  { icon: Phone, label: `Call ${site.phone}`, href: site.phoneHref },
];

/**
 * The glyph that trails each call to action, keyed by where it leads. The
 * labels, targets and order are data, in `heroCtas`.
 */
const ctaIcons: Record<string, ReactNode> = {
  "#projects": (
    <ArrowRight
      size={15}
      className="transition-transform duration-300 group-hover:translate-x-1"
    />
  ),
  "/resume": <FileText size={15} />,
  "#contact": (
    <ArrowUpRight
      size={15}
      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
    />
  ),
};

/**
 * Entrance timing, in milliseconds. The splash loader holds for 700ms and then
 * fades, so the name begins springing up just as the page is uncovered. The
 * name and title are motion springs; everything else is the CSS load-*
 * animations, ordered here to land after the title's last character.
 */
const T = { meta: 400, name: 550, copy: 1250, bar: 1400 };

/** The kinetic headline, in reading order: name, surname, then title. */
const headline: IKineticLine[] = [
  { text: "Kenneth", className: "text-[clamp(3.25rem,10vw,8.5rem)]" },
  {
    text: "Lariosa",
    className: "text-[clamp(3.25rem,10vw,8.5rem)] pl-[0.45em] lg:pl-[0.75em]",
    charClassName: "text-primary-gradient",
  },
  {
    text: site.role,
    className:
      "mt-5 max-w-[22ch] sm:max-w-none text-[clamp(1.05rem,2.3vw,1.7rem)] font-medium leading-snug tracking-[-0.01em] text-text-dim",
  },
];

const at = (delay: number) => ({ "--delay": `${delay}ms` }) as CSSProperties;

/**
 * The hero: a scroll track with the 3D desk scene pinned behind the text.
 *
 * Three boxes, laid out by the hero utilities in `globals.css`:
 *
 * - the section is the track, as tall as the journey is long
 * - the stage is pinned inside it and holds the poster and the canvas
 * - the overlay is the hero's real text, ordinary in-flow content on the
 *   track's first screen, which scrolls away like any other page
 *
 * Under reduced motion, on a very short viewport, and without JavaScript,
 * CSS leaves the track one screen tall and this is a normal section.
 *
 * The section must not gain overflow, transform, filter or contain, and
 * neither may anything above it: the stage's `position: sticky` depends on
 * that.
 */
export default function Hero() {
  const {
    trackRef,
    stageRef,
    overlayRef,
    progress,
    overlayOpacity,
    overlayPointerEvents,
    backdropOpacity,
    isNear,
    stage,
    scene,
  } = useHeroJourney();

  return (
    <section
      id="hero"
      ref={trackRef}
      aria-label="Introduction"
      data-hero-stage={stage ?? undefined}
      data-hero-scene={scene}
      className="hero-track"
    >
      <div ref={stageRef} aria-hidden="true" className="hero-stage">
        <HeroStage
          progress={progress}
          isNear={isNear}
          scene={scene}
          backdropOpacity={backdropOpacity}
        />
      </div>

      {/* The text fades as it scrolls off, and stops taking clicks once it
          is nearly gone. Nothing here is ever inert or hidden from assistive
          technology, so the h1 and the links are reachable from anywhere on
          the page. Tabbing back to a link makes the browser scroll it into
          view, and the `has-[:focus-visible]` pair beats the inline fade,
          so a focused control is always visible and clickable.

          The bottom padding keeps the calls to action above the floating
          dock on the first screen. */}
      <motion.div
        ref={overlayRef}
        style={{ opacity: overlayOpacity, pointerEvents: overlayPointerEvents }}
        className="hero-overlay relative flex flex-col px-6 pt-12 sm:pt-14 pb-28 has-[:focus-visible]:opacity-100! has-[:focus-visible]:pointer-events-auto!"
      >
        {/* Page colour behind the copy, for contrast over the scene. It is
            inside the overlay so that it scrolls and fades with the text
            it serves. */}
        <div
          aria-hidden="true"
          className="hero-scrim pointer-events-none absolute inset-0"
        />

        <div className="relative max-w-6xl mx-auto w-full flex-1 flex flex-col">
          {/* Meta row — the masthead line above the headline. */}
          <div
            style={at(T.meta)}
            className="load-rise flex flex-wrap items-center justify-end sm:justify-between gap-4 mb-10 lg:mb-4"
          >
            <span className="hidden sm:block text-text-dim text-xs font-mono uppercase tracking-[0.3em]">
              {site.location.city}, PH — ASP.NET Core · React · PostgreSQL
            </span>
            <AvailabilityBadge />
          </div>

          <div className="flex-1 flex items-center">
            <div className="min-w-0">
              {/* Kinetic headline: name, surname, then title, each line's
                  characters springing up in turn. The surname steps in from the
                  margin so the name reads as a set piece, not a stacked label. */}
              <KineticHeading
                lines={headline}
                delay={T.name / 1000}
                label={`${site.name} — ${site.role}`}
                className="font-headline font-bold leading-[0.9] tracking-[-0.045em]"
              />

              <p
                style={at(T.copy)}
                className="load-rise mt-6 max-w-md text-lg leading-relaxed text-text-dim"
              >
                {site.tagline}
              </p>
            </div>
          </div>

          {/* Proof bar: the readout, then the ask. A rule draws across first
              so the bar lands as one deliberate line of the layout. */}
          <div style={at(T.bar)} className="load-rise mt-10">
            <span
              aria-hidden="true"
              style={at(T.bar)}
              className="load-rule block h-px bg-border mb-6"
            />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="w-full max-w-xl">
                <HeroStats notBefore={T.bar + 300} />
              </div>

              {/* Three calls to action, all magnetic: the work first, because
                  it is what earns the conversation the last one asks for. */}
              <div className="flex flex-wrap items-center gap-3">
                {heroCtas.map((cta) => (
                  <MagneticButton
                    key={cta.href}
                    href={cta.href}
                    variant={cta.variant}
                  >
                    {cta.label}
                    {ctaIcons[cta.href]}
                  </MagneticButton>
                ))}
                <div className="flex items-center gap-4 pl-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      aria-label={link.label}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-muted hover:text-primary transition-colors"
                    >
                      <link.icon size={17} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
