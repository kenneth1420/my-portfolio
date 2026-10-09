import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useUiStore } from "@/src/store/ui.store";

/**
 * Switches the hero scene off when the GPU takes its WebGL context away.
 *
 * It must be called from a component inside the `<Canvas>`, and that is the
 * whole point. Unmounting the canvas makes R3F release the context on
 * purpose, which fires the same `webglcontextlost` event as a real failure.
 * R3F unmounts everything inside the canvas, and flushes their effect
 * cleanups, before it does that, so a listener owned by this hook is always
 * gone by then. One owned by a component outside the canvas is still
 * attached, and would switch a healthy scene off for the session every time
 * the reader scrolled far enough below the hero for it to unmount.
 *
 * No restore is attempted: a device that dropped the context once will drop
 * it again, and the hero has a complete fallback without the scene.
 */
export function useHeroContextWatch() {
  const canvas = useThree((state) => state.gl.domElement);
  const setHeroScene = useUiStore((state) => state.setHeroScene);

  useEffect(() => {
    const handleContextLost = () => setHeroScene("off");

    canvas.addEventListener("webglcontextlost", handleContextLost);
    return () => canvas.removeEventListener("webglcontextlost", handleContextLost);
  }, [canvas, setHeroScene]);
}
