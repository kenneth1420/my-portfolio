import type { PerformanceMonitorApi } from "@react-three/drei";
import type { Frameloop, RootState } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  heroCamera,
  heroMinDpr,
  heroPerformance,
  heroPixelBudget,
  heroTiers,
  type HeroTheme,
} from "@/src/data/hero.scene";
import { useUiStore } from "@/src/store/ui.store";
import type { IHeroFrame } from "./use.hero.rig.hook";
import { useSceneEnvironment } from "./use.scene.environment.hook";

/** The parts of R3F's root that the warm-up needs once the canvas exists. */
type HeroRoot = Pick<RootState, "gl" | "scene" | "camera">;

const roundDpr = (value: number) => Math.round(value * 100) / 100;

/**
 * Highest DPR that keeps a canvas of this size within the pixel budget.
 * Stepped down to the nearest twentieth so dragging a window's edge does
 * not reallocate the drawing buffer on every pixel of travel.
 */
const pixelCapFor = (width: number, height: number) =>
  Math.floor(Math.sqrt(heroPixelBudget / (width * height)) * 20) / 20;

/** What the canvas is created with. The rig takes over on the first frame. */
const CAMERA = {
  fov: heroCamera.keys.wide.fov.landscape,
  near: heroCamera.near,
  far: heroCamera.far,
};

/**
 * Everything `HeroScene` needs to configure its canvas: the theme, what this
 * device is given, an adaptive device pixel ratio, and when to draw at all.
 *
 * It also reports the scene's status to the store, which is how the rest of
 * the page learns that the desk is drawing (`ready`) or has given up for the
 * session (`off`): the sky backdrop stands down for one and returns for the
 * other.
 */
export function useHeroScene() {
  const { resolvedTheme } = useTheme();
  const { coarsePointer, devicePixelRatio, reducedMotion } = useSceneEnvironment();
  const stage = useUiStore((state) => state.heroStage);
  const status = useUiStore((state) => state.heroScene);
  const setHeroScene = useUiStore((state) => state.setHeroScene);

  const theme: HeroTheme = resolvedTheme === "light" ? "light" : "dark";
  const tier = heroTiers[coarsePointer ? "coarse" : "fine"];

  const [root, setRoot] = useState<HeroRoot | null>(null);
  const [isCompiled, setIsCompiled] = useState(false);
  const [quality, setQuality] = useState<number>(heroPerformance.factor);
  const [pixelCap, setPixelCap] = useState(Number.POSITIVE_INFINITY);
  // Shared by the rig and the screens inside the canvas. A ref, not state:
  // it changes every frame and nothing in React renders from it.
  const frame = useRef<IHeroFrame>({ p: 0, moving: false });
  const floorDeclines = useRef(0);

  // Reduced motion and a hero that does not scroll get the same thing: one
  // still frame of the room.
  const isStatic = reducedMotion || stage === "static";

  // Nothing is drawn until the shaders are compiled. After that a still
  // scene draws only when asked, and a scene that is scrolled past (or
  // whose track has not reported yet) does not draw at all.
  const frameloop: Frameloop = !isCompiled
    ? "never"
    : isStatic
      ? "demand"
      : stage === null || stage === "past"
        ? "never"
        : "always";

  // Never render above the screen's own density, the tier's ceiling, or the
  // pixel budget; the performance monitor then scales between that and the
  // floor.
  const maxDpr = Math.min(devicePixelRatio, tier.maxDpr, pixelCap);
  const minDpr = Math.min(heroMinDpr, maxDpr);
  const dpr = roundDpr(minDpr + (maxDpr - minDpr) * quality);

  // A ref callback with a cleanup: the observer lives exactly as long as
  // the wrapper element does.
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setPixelCap(pixelCapFor(width, height));
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const handleCreated = useCallback(({ gl, scene, camera }: RootState) => {
    setRoot({ gl, scene, camera });
  }, []);

  // Compile every shader before the first frame, so the scene appears
  // whole instead of hitching in over several frames, and only then call
  // it ready. A lost context is watched for by `HeroContextWatch`, inside
  // the canvas, not here: see `use.hero.context.watch.hook.ts` for why.
  useEffect(() => {
    if (!root) return;

    const { gl, scene, camera } = root;
    let isCurrent = true;

    // Wrapped so a throw inside three becomes a rejection like any other.
    new Promise((resolve) => resolve(gl.compileAsync(scene, camera))).then(
      () => {
        if (!isCurrent) return;
        setIsCompiled(true);
        setHeroScene("ready");
      },
      () => {
        if (isCurrent) setHeroScene("off");
      },
    );

    return () => {
      isCurrent = false;
    };
  }, [root, setHeroScene]);

  // The canvas is gone, so whatever comes next starts from scratch. The
  // store ignores this once the scene is off, which is final.
  useEffect(() => () => setHeroScene("pending"), [setHeroScene]);

  // drei's monitor reports a 0…1 quality factor as the frame rate drifts.
  // Mapping it onto the DPR range makes a struggling GPU shade fewer pixels
  // rather than drop frames. Same-value updates are free: React bails out
  // of a state set that does not change it.
  const handlePerformanceChange = useCallback(({ factor }: PerformanceMonitorApi) => {
    if (factor > 0) floorDeclines.current = 0;
    setQuality(factor);
  }, []);

  // The factor is taken here as well as from `onChange`, because drei does
  // not report a change that lands on exactly zero. It calls this after
  // lowering the factor, so zero means the scene was slow at its cheapest:
  // the first such report is the step that reached the floor, and the next
  // means the floor is not enough.
  const handlePerformanceDecline = useCallback(
    ({ factor }: PerformanceMonitorApi) => {
      setQuality(factor);
      if (factor > 0) return;
      floorDeclines.current += 1;
      if (floorDeclines.current >= heroPerformance.floorDeclines) setHeroScene("off");
    },
    [setHeroScene],
  );

  return {
    measureRef,
    theme,
    tier,
    isStatic,
    isOff: status === "off",
    // Hidden as well as stopped: a fast scroll can end the track before
    // the damped camera has faded the canvas, and a frozen frame must not
    // be left showing.
    isHidden: !isStatic && stage === "past",
    isRunning: frameloop !== "never",
    // Continuous loop only. On demand, the gaps between frames would read
    // as a GPU running at near 0 fps.
    isMonitored: frameloop === "always",
    frame,
    quality,
    dpr,
    frameloop,
    camera: CAMERA,
    handleCreated,
    handlePerformanceChange,
    handlePerformanceDecline,
  };
}
