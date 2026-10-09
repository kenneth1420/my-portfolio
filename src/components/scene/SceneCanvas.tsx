"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { motion } from "motion/react";
import { sceneCamera } from "@/src/data/scene";
import { useSceneCanvas } from "@/src/hook/use.scene.canvas.hook";
import WaveField from "./WaveField";

/** The site's ease-out: fast start, long settle. Matches the CSS `--ease-out`. */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The fixed WebGL backdrop: an instanced wave fabric that swells and turns
 * mint under the cursor, lit by a slate-black ambient and a mint point light
 * that follows the pointer.
 *
 * It never takes input or focus. `pointer-events: none` lets every click pass
 * through to the page, and the scene tracks the pointer from `window` instead.
 * It is decorative, so it is hidden from assistive technology. When WebGL is
 * unavailable it renders only the flat backdrop colour.
 *
 * While the hero's desk scene is in front of it, the wave stands down: it
 * fades out and stops drawing, so only one canvas is working at a time. The
 * `data-covered` attribute says which state it is in.
 *
 * Load it through `SceneLayout`, which imports it with `ssr: false`. It
 * depends on `window` and has nothing worth server-rendering.
 */
export default function SceneCanvas() {
  const {
    isSupported,
    reducedMotion,
    palette,
    density,
    dpr,
    quality,
    isReady,
    isCovered,
    coverFade,
    frameloop,
    antialias,
    handleCreated,
    handlePerformanceChange,
  } = useSceneCanvas();

  return (
    <div
      aria-hidden="true"
      data-scene="wave"
      data-covered={isCovered}
      className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500"
      style={{ backgroundColor: palette.background }}
    >
      {isSupported && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: isReady ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 1.6, ease: EASE }}
        >
          {/* The hero's cover is a second fade on its own element, so it and
              the entrance above never fight over one opacity. It wraps only
              the canvas: the backdrop colour behind stays painted. `initial`
              is off so a page that loads at the top starts already covered
              instead of flashing the wave and fading it away. */}
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: isCovered ? 0 : 1 }}
            transition={{ duration: coverFade, ease: EASE }}
          >
            <Canvas
              dpr={dpr}
              frameloop={frameloop}
              // Untonemapped, so the accent renders as exactly #10b981 rather
              // than the desaturated green ACES would turn it into.
              flat
              camera={{
                position: [...sceneCamera.position],
                fov: sceneCamera.fov,
                near: 0.1,
                far: 60,
              }}
              gl={{
                alpha: true,
                antialias,
                stencil: false,
                powerPreference: "default",
              }}
              onCreated={handleCreated}
              style={{ pointerEvents: "none" }}
            >
              {/* Starts at full quality to match the initial DPR, so only a
                  genuine slowdown lowers it. No flip-flop cutoff: drei counts
                  every incline as a flip, which would freeze a healthy device
                  after ~10s. Continuous loop only — on demand, the gaps
                  between frames would read as a GPU running at near 0 fps.
                  The monitor reads `factor` once, when it mounts: the first
                  time that is 1, and after the hero has covered the wave it
                  is wherever the last monitor had got to. */}
              {frameloop === "always" && (
                <PerformanceMonitor
                  factor={quality}
                  onChange={handlePerformanceChange}
                />
              )}
              <ambientLight
                color={palette.ambient}
                intensity={palette.ambientIntensity}
              />
              <WaveField
                palette={palette}
                density={density}
                reducedMotion={reducedMotion}
              />
            </Canvas>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
