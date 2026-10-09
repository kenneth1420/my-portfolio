"use client";

import { type MotionValue, motion } from "motion/react";

interface IProps {
  /** 1 at rest, falling to 0 as the journey hands over to the page. */
  opacity: MotionValue<number>;
}

/**
 * The hero's CSS poster: a sky and emerald glow over a faint grid, behind
 * where the desk scene is drawn. It is plain markup in the server HTML, so
 * the stage is never empty: it shows before the scene has loaded, when the
 * scene has been unmounted far down the page, and in place of it on a
 * device with no WebGL.
 *
 * The look, in both themes, is the `hero-poster` utility in `globals.css`.
 */
export default function HeroBackdrop({ opacity }: IProps) {
  return (
    <motion.div
      style={{ opacity }}
      className="hero-poster absolute inset-0"
    />
  );
}
