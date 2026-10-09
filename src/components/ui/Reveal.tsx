"use client";

import { motion, type Variants } from "motion/react";
import { createContext, useContext, type ReactNode } from "react";

/**
 * Scroll-entrance primitives, driven by motion's `whileInView`.
 *
 * - `Reveal`       one element fades and rises when it enters view
 * - `Stagger`      a container that deals its items out in sequence
 * - `StaggerItem`  one dealt item, ordered by `index`
 * - `StaggerRule`  a hairline that draws in from the left with its group
 *
 * Only `Reveal` and `Stagger` watch the viewport. Items and rules inherit the
 * container's `hidden` → `visible` switch through motion's variant
 * propagation, so a group of forty chips costs one observer, not forty.
 * Each entrance plays once.
 *
 * Reduced motion is handled globally by `<MotionConfig reducedMotion="user">`
 * in the page: transforms are skipped and only the opacity fade remains.
 */

/** The site's ease-out: fast start, long settle. Matches the CSS `--ease-out`. */
const EASE = [0.22, 1, 0.36, 1] as const;

/** Fire a little before the bottom edge, so motion is under way on arrival. */
const VIEWPORT = { once: true, amount: 0.15, margin: "0px 0px -6% 0px" } as const;

const DEFAULT_STEP = 70;

type RevealTag = "div" | "li" | "p" | "span";

// One motion component per tag. Typed as `motion.div` because the props used
// here (className, style, id, variants) are common to all four.
const MOTION_TAGS = {
  div: motion.div,
  li: motion.li,
  p: motion.p,
  span: motion.span,
} as unknown as Record<RevealTag, typeof motion.div>;

/** Fade and rise, delayed by the `custom` value in milliseconds. */
const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delayMs: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE, delay: delayMs / 1000 },
  }),
};

/**
 * Rise without the fade. For wrappers around `backdrop-filter` glass: an
 * ancestor below full opacity isolates the backdrop, so a fading wrapper
 * would show its card unblurred until the fade ended, then snap to frosted.
 */
const lift: Variants = {
  hidden: { y: 28 },
  visible: (delayMs: number = 0) => ({
    y: 0,
    transition: { duration: 0.8, ease: EASE, delay: delayMs / 1000 },
  }),
};

/**
 * Marks every element an entrance animates. Print CSS and the <noscript>
 * style in the root layout use it to force entrances to their final state,
 * so a printout or a no-JS visit never shows a blank section.
 */
export const REVEAL_ATTR = { "data-reveal-motion": "" } as const;

/** A hairline drawing in from the left. */
const draw: Variants = {
  hidden: { scaleX: 0 },
  visible: (delayMs: number = 0) => ({
    scaleX: 1,
    transition: { duration: 1.1, ease: EASE, delay: delayMs / 1000 },
  }),
};

/** Labels for a container that only relays state to its items. */
const relay: Variants = { hidden: {}, visible: {} };

interface IStaggerTiming {
  step: number;
  delay: number;
}

const StaggerContext = createContext<IStaggerTiming>({ step: DEFAULT_STEP, delay: 0 });

/** Timing of the nearest `Stagger`, for items that compute their own delay. */
export const useStaggerTiming = () => useContext(StaggerContext);

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Milliseconds before this element starts moving. */
  delay?: number;
  /** Position in a row, for a stagger across siblings that reveal together. */
  index?: number;
  id?: string;
  as?: RevealTag;
  "aria-hidden"?: boolean | "true" | "false";
  /** False rises without fading. Use it around backdrop-blur glass. */
  fade?: boolean;
}

/** Fades and lifts one element into place the first time it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  index = 0,
  id,
  as = "div",
  "aria-hidden": ariaHidden,
  fade = true,
}: RevealProps) {
  const Component = MOTION_TAGS[as];

  return (
    <Component
      {...REVEAL_ATTR}
      id={id}
      aria-hidden={ariaHidden}
      className={className}
      variants={fade ? rise : lift}
      custom={delay + index * DEFAULT_STEP}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </Component>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Milliseconds between one item starting and the next. */
  step?: number;
  delay?: number;
  as?: RevealTag;
}

/**
 * A container whose `StaggerItem` children are dealt out one after another
 * when it enters view. Do not nest one Stagger inside another: the inner
 * items would take their timing from the nearer container.
 */
export function Stagger({
  children,
  className,
  step = DEFAULT_STEP,
  delay = 0,
  as = "div",
}: StaggerProps) {
  const Component = MOTION_TAGS[as];

  return (
    <StaggerContext.Provider value={{ step, delay }}>
      <Component
        className={className}
        variants={relay}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
      >
        {children}
      </Component>
    </StaggerContext.Provider>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  index: number;
  className?: string;
  as?: RevealTag;
}

export function StaggerItem({ children, index, className, as = "div" }: StaggerItemProps) {
  const { step, delay } = useStaggerTiming();
  const Component = MOTION_TAGS[as];

  return (
    <Component
      {...REVEAL_ATTR}
      className={className}
      variants={rise}
      custom={delay + index * step}
    >
      {children}
    </Component>
  );
}

interface StaggerRuleProps {
  className?: string;
}

/** A decorative hairline that draws itself in as its group is revealed. */
export function StaggerRule({ className = "" }: StaggerRuleProps) {
  const { delay } = useStaggerTiming();

  return (
    <motion.span
      {...REVEAL_ATTR}
      aria-hidden="true"
      className={`block origin-left ${className}`}
      variants={draw}
      custom={delay}
    />
  );
}
