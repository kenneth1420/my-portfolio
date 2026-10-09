"use client";

import type { MotionValue } from "motion/react";
import dynamic from "next/dynamic";
import SceneErrorBoundary from "../../scene/SceneErrorBoundary";
import type { HeroSceneStatus } from "@/src/data/hero";
import { useHeroMount } from "@/src/hook/use.hero.mount.hook";

// Client-only and in its own chunk, like the wave backdrop: three and R3F
// never reach the server or the first-load bundle. In Next 16 `ssr: false`
// is only allowed inside a Client Component, which is why this file is one.
const HeroScene = dynamic(() => import("../../scene/HeroScene"), {
  ssr: false,
});

interface IProps {
  /** Raw scroll progress along the hero track, 0…1. */
  progress: MotionValue<number>;
  /** The scroll track is within a viewport of the screen. */
  isNear: boolean;
  scene: HeroSceneStatus;
}

/**
 * Where the desk scene's canvas goes in the stage, when there is one.
 *
 * The canvas is decoration over a poster that is already there, so every
 * failure ends the same way: it is taken out and the poster stays. The
 * boundary catches a chunk that will not load or a scene that throws, and
 * reports it so the rest of the page knows the scene is off for good.
 */
export default function HeroSceneMount({ progress, isNear, scene }: IProps) {
  const { isMounted, handleError } = useHeroMount({ isNear, scene });

  return (
    <SceneErrorBoundary onError={handleError}>
      {isMounted && (
        // R3F's canvas fills its parent, so the parent has to have a size.
        <div className="absolute inset-0">
          <HeroScene progress={progress} />
        </div>
      )}
    </SceneErrorBoundary>
  );
}
