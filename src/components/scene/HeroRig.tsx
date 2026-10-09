"use client";

import type { MotionValue } from "motion/react";
import type { ReactNode, RefObject } from "react";
import type { IHeroTier } from "@/src/data/hero.scene";
import { type IHeroFrame, useHeroRig } from "@/src/hook/use.hero.rig.hook";

interface IProps {
  children: ReactNode;
  /** Raw scroll progress along the hero track, 0…1. */
  progress: MotionValue<number>;
  /** Where the rig records what it drew, for the screens to read. */
  frame: RefObject<IHeroFrame>;
  tier: IHeroTier;
  isStatic: boolean;
  isRunning: boolean;
}

/**
 * Flies the camera along the hero's path and holds the room it looks at.
 *
 * The room is wrapped in two groups so that it can lean toward the cursor
 * about a point at desk height: the outer one sits at that point and turns,
 * the inner one moves the room back to where it was.
 */
export default function HeroRig({ children, ...options }: IProps) {
  const { groupRef, pivot, unpivot } = useHeroRig(options);

  return (
    <group ref={groupRef} position={pivot}>
      <group position={unpivot}>{children}</group>
    </group>
  );
}
