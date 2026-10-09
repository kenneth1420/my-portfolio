"use client";

import type { MotionValue } from "motion/react";
import HeroBackdrop from "./HeroBackdrop";
import HeroSceneMount from "./HeroSceneMount";
import HeroTerminal from "./HeroTerminal";
import type { HeroSceneStatus } from "@/src/data/hero";

interface IProps {
  /** Raw scroll progress along the hero track, 0…1. */
  progress: MotionValue<number>;
  /** The scroll track is within a viewport of the screen. */
  isNear: boolean;
  scene: HeroSceneStatus;
  backdropOpacity: MotionValue<number>;
}

/**
 * What is pinned behind the hero text, back to front: the CSS poster, the
 * desk scene's canvas over it, and, only when the scene is off for good,
 * the HTML terminal that tells the middle of the story in its place.
 *
 * Each layer fills the stage and stacks in source order. The stage itself
 * is hidden from assistive technology and takes no pointer events; both
 * are set once, on its wrapper in `Hero`.
 */
export default function HeroStage({
  progress,
  isNear,
  scene,
  backdropOpacity,
}: IProps) {
  return (
    <>
      <HeroBackdrop opacity={backdropOpacity} />
      <HeroSceneMount progress={progress} isNear={isNear} scene={scene} />
      {scene === "off" && <HeroTerminal progress={progress} />}
    </>
  );
}
