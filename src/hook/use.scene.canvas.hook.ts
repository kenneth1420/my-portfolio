import type { PerformanceMonitorApi } from "@react-three/drei";
import type { RootState } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";
import {
  type HeroSceneStatus,
  type HeroStage,
  heroWaveRelay,
} from "@/src/data/hero";
import {
  sceneCamera,
  sceneDensity,
  sceneMinDpr,
  scenePalettes,
} from "@/src/data/scene";
import { useUiStore } from "@/src/store/ui.store";
import { useSceneEnvironment } from "./use.scene.environment.hook";

const roundDpr = (value: number) => Math.round(value * 100) / 100;

/**
 * True while the hero is in front of the wave: its desk scene, or the poster
 * that stands in until the scene has loaded. The wave has nothing to show
 * then, so it can stop drawing.
 *
 * It fails open. A hero that has not reported a stage yet, one with no
 * scroll journey (`static`), and one whose scene has been given up on all
 * leave the wave running, because in each case the wave is the backdrop the
 * reader actually sees.
 */
function isCoveredByHero(stage: HeroStage | null, scene: HeroSceneStatus) {
  return scene !== "off" && (stage === "intro" || stage === "zoom");
}

/**
 * Everything `SceneCanvas` needs to configure its renderer: the theme palette,
 * the node density for this device, an adaptive device pixel ratio, a ready
 * flag that drives the fade-in, and whether the hero currently covers it.
 */
export function useSceneCanvas() {
  const { resolvedTheme } = useTheme();
  // Shared with the hero's canvas, so the WebGL probe runs once for both.
  // This canvas only ever mounts on the client, so the answer is the real
  // one from the first render and the scene is built at the right density
  // first time. Reduced motion stays live: turning it on mid-session must
  // stop the animation, not wait for a reload.
  const { isSupported, coarsePointer, devicePixelRatio, reducedMotion } =
    useSceneEnvironment();
  // Selects the answer, not the stage: the canvas re-renders when the cover
  // flips, and not for the stage changes that leave it as it is.
  const isCovered = useUiStore((state) =>
    isCoveredByHero(state.heroStage, state.heroScene),
  );

  const palette = scenePalettes[resolvedTheme === "light" ? "light" : "dark"];
  const density = sceneDensity[coarsePointer ? "coarse" : "fine"];

  // Never render above the screen's own density: on a 1x display a 1.5x
  // buffer is pure overdraw.
  const maxDpr = Math.min(devicePixelRatio, density.maxDpr);
  const minDpr = Math.min(sceneMinDpr, maxDpr);

  // drei's monitor reports a 0…1 quality factor as the frame rate drifts.
  // The factor is what is kept, not the DPR it maps to: the monitor unmounts
  // whenever the loop goes on demand, and handing the factor back when it
  // returns lets it carry on from where it was. Otherwise every pass through
  // the hero would send a slow GPU back to full resolution to fail again.
  const [quality, setQuality] = useState(1);
  const [isReady, setIsReady] = useState(false);

  // Map the factor onto the DPR range, so a struggling GPU shades fewer
  // pixels rather than dropping frames.
  const dpr = roundDpr(minDpr + (maxDpr - minDpr) * quality);

  const handleCreated = useCallback(({ camera }: RootState) => {
    camera.lookAt(...sceneCamera.target);
    setIsReady(true);
  }, []);

  // Same-value updates are free: React bails out of a state set that does
  // not change it.
  const handlePerformanceChange = useCallback(
    ({ factor }: PerformanceMonitorApi) => setQuality(factor),
    [],
  );

  return {
    isSupported,
    reducedMotion,
    palette,
    density,
    dpr,
    quality,
    isReady,
    isCovered,
    // In seconds, for motion. Reduced motion never animates the backdrop.
    coverFade: reducedMotion ? 0 : heroWaveRelay.fadeMs / 1000,
    // On demand the canvas draws only when something asks it to. Under
    // reduced motion that is the one still pose; behind the hero it is
    // nothing at all, which leaves the GPU to the desk scene. The first
    // frame is still drawn at mount, so the wave's shader compiles under
    // the splash and not at the hand-off.
    frameloop:
      reducedMotion || isCovered ? ("demand" as const) : ("always" as const),
    // MSAA is the costliest renderer option. Phones get a high-DPR screen
    // that already smooths the edges, so they go without it.
    antialias: !coarsePointer,
    handleCreated,
    handlePerformanceChange,
  };
}
