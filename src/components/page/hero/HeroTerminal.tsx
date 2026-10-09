"use client";

import { type MotionValue, motion } from "motion/react";
import type { HeroTokenKind, IHeroTerminalToken } from "@/src/data/hero";
import { useHeroTerminal } from "@/src/hook/use.hero.terminal.hook";

interface IProps {
  /** Raw scroll progress along the hero track, 0…1. */
  progress: MotionValue<number>;
}

/** Site tokens for each kind of terminal text, so both themes are covered. */
const TOKEN_CLASSES: Record<HeroTokenKind, string> = {
  text: "text-text",
  prompt: "text-primary-strong",
  // The same pairing as the availability badge: sharp mint is about 2.5:1
  // on white, so light mode takes the darker emerald.
  success: "text-emerald-700 dark:text-mint",
  dim: "text-muted",
  accent: "font-semibold text-primary-strong",
};

const renderTokens = (tokens: readonly IHeroTerminalToken[]) =>
  tokens.map((token, i) => (
    <span key={i} className={TOKEN_CLASSES[token.kind]}>
      {token.text}
    </span>
  ));

/**
 * The journey's second stage without WebGL: an HTML terminal in the middle
 * of the stage, running the same sessions the 3D monitor would have shown.
 * It fades in where the camera would arrive at the screen and grows as it
 * fades out, where the camera would push through it.
 *
 * Decoration, like the scene it replaces: hidden from assistive technology
 * and never a target for the pointer. Everything the sessions mention is
 * already said in the hero's real text.
 *
 * The type is the site's one typeface, which is proportional, so nothing
 * here leans on a fixed pitch. The panel's type scales with its own width
 * through a container query, so the same sixteen-by-ten panel reads the
 * same on a phone and on an ultrawide.
 */
export default function HeroTerminal({ progress }: IProps) {
  const {
    opacity,
    scale,
    isShowing,
    session,
    sessions,
    lines,
    lineVariants,
    typedVariants,
  } = useHeroTerminal(progress);

  return (
    <motion.div
      data-hero-terminal=""
      aria-hidden="true"
      style={{ opacity, scale }}
      className="absolute inset-0 grid place-items-center px-4"
    >
      {/* As wide as the stage allows, but never so wide that the panel's
          sixteen-by-ten height outgrows 86% of the stage, which is how much
          of the frame the 3D screen fills at the same point. */}
      <div className="@container w-[min(100%,52rem,calc(86lvh*16/10))]">
        <div className="flex aspect-16/10 flex-col overflow-hidden rounded-[0.5em] border border-border bg-background font-mono text-[length:3.1cqw] leading-[1.75] shadow-[0_1.5em_4em_-2em] shadow-primary/40">
          <div className="flex items-center gap-[0.9em] border-b border-border px-[1.1em] py-[0.5em] text-[0.8em] text-text-dim">
            <span className="flex gap-[0.4em]">
              <span className="size-[0.55em] rounded-full bg-border" />
              <span className="size-[0.55em] rounded-full bg-border" />
              <span className="size-[0.55em] rounded-full bg-border" />
            </span>
            {session.title}
            {/* One pip per session, so the swap reads as a rotation. */}
            <span className="ml-auto flex gap-[0.4em]">
              {sessions.map((item) => (
                <span
                  key={item.id}
                  className={`size-[0.4em] rounded-full transition-colors duration-300 ${
                    item.id === session.id ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </span>
          </div>

          {/* Mounted only while the panel is on screen and keyed by session,
              so each arrival and each new session plays from its first line.
              `pre` keeps the sessions' own spacing; no line is long enough
              to need wrapping. */}
          {isShowing && (
            <motion.ol
              key={session.id}
              initial="hidden"
              animate="shown"
              className="flex-1 whitespace-pre px-[1.1em] py-[0.7em]"
            >
              {lines.map((line, i) => (
                <motion.li key={i} custom={line} variants={lineVariants}>
                  {renderTokens(line.lead)}
                  {line.typed ? (
                    <motion.span
                      custom={line}
                      variants={typedVariants}
                      className="inline-block align-bottom"
                    >
                      {renderTokens(line.body)}
                    </motion.span>
                  ) : (
                    renderTokens(line.body)
                  )}
                </motion.li>
              ))}
            </motion.ol>
          )}
        </div>
      </div>
    </motion.div>
  );
}
