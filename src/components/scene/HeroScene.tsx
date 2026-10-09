"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { heroPerformance } from "@/src/data/hero.scene";
import { useHeroScene } from "@/src/hook/use.hero.scene.hook";
import HeroContextWatch from "./HeroContextWatch";
import HeroDiorama from "./HeroDiorama";
import HeroRig from "./HeroRig";
import HeroScreens from "./HeroScreens";

interface IProps {
  /** Raw scroll progress along the hero track, 0…1. Read inside the render
      loop with `.get()`; never subscribed to from React. */
  progress: MotionValue<number>;
}

// The canvas is pinned or scrolls with the page; either way its size does
// not change with the scroll position. R3F re-measures on scroll by default,
// which here would be a layout read per scroll event for nothing.
const RESIZE = { scroll: false };

/**
 * The hero's 3D scene: a low-poly desk, an avatar at work, and a camera that
 * flies from a view of the whole room into the primary monitor as the page
 * scrolls. By the end the frame is nothing but the screen's paper, which is
 * the page's own background colour, and the canvas fades out over the
 * section that follows.
 *
 * It fills its nearest positioned ancestor, never takes input or focus, and
 * is hidden from assistive technology: the hero's words live in the DOM
 * above it. Nothing here is fetched; the screens are drawn in the browser.
 *
 * Load it with `ssr: false`. It depends on `window` and has nothing worth
 * server-rendering.
 */
export default function HeroScene({ progress }: IProps) {
  const {
    measureRef,
    theme,
    tier,
    isStatic,
    isOff,
    isHidden,
    isRunning,
    isMonitored,
    frame,
    quality,
    dpr,
    frameloop,
    camera,
    handleCreated,
    handlePerformanceChange,
    handlePerformanceDecline,
  } = useHeroScene();

  // Off is final for the session. Dropping the canvas here releases its
  // WebGL context whatever the parent chooses to render in its place.
  if (isOff) return null;

  return (
    <div
      ref={measureRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ visibility: isHidden ? "hidden" : "visible" }}
    >
      <Canvas
        dpr={dpr}
        frameloop={frameloop}
        resize={RESIZE}
        // Untonemapped, so the screen's paper renders as exactly the page's
        // background colour and the hand-off has no seam.
        flat
        camera={camera}
        gl={{
          alpha: true,
          antialias: tier.antialias,
          stencil: false,
          powerPreference: "default",
        }}
        onCreated={handleCreated}
        style={{ pointerEvents: "none" }}
      >
        {/* Starts from the current quality, so a monitor remounted after the
            loop was paused does not forget what it had learned. A slow
            report lowers the DPR; one at the floor switches the scene off. */}
        {isMonitored && (
          <PerformanceMonitor
            factor={quality}
            step={heroPerformance.step}
            onChange={handlePerformanceChange}
            onIncline={handlePerformanceChange}
            onDecline={handlePerformanceDecline}
          />
        )}
        <HeroContextWatch />
        <HeroRig
          progress={progress}
          frame={frame}
          tier={tier}
          isStatic={isStatic}
          isRunning={isRunning}
        >
          <HeroDiorama theme={theme} tier={tier} isStatic={isStatic} />
          <HeroScreens theme={theme} tier={tier} isStatic={isStatic} frame={frame} />
        </HeroRig>
      </Canvas>
    </div>
  );
}
