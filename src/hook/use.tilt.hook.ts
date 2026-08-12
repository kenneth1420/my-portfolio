import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

interface UseTiltOptions {
  /** Maximum rotation on either axis, in degrees. Kept small on purpose. */
  max?: number;
}

/**
 * Pointer-driven 3D card tilt.
 *
 * The rotation is published as the `--tilt-x` / `--tilt-y` custom properties
 * consumed by the `tilt-surface` utility, written inside a rAF callback — so
 * following the cursor never triggers a React render and the compositor does
 * all the work. Coarse pointers and reduced-motion users are skipped, and the
 * `tilt-surface` CSS flattens the card for them regardless.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>({
  max = 4,
}: UseTiltOptions = {}) {
  const ref = useRef<T>(null);
  const frame = useRef(0);
  const enabled = useRef(false);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = () => {
      enabled.current = !coarse.matches && !reduced.matches;
    };

    handleChange();

    coarse.addEventListener("change", handleChange);
    reduced.addEventListener("change", handleChange);

    return () => {
      coarse.removeEventListener("change", handleChange);
      reduced.removeEventListener("change", handleChange);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<T>) => {
      const element = ref.current;
      if (!element || !enabled.current || event.pointerType !== "mouse") return;

      const { clientX, clientY } = event;

      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        // -0.5 … 0.5, measured from the centre of the card.
        const offsetX = (clientX - rect.left) / rect.width - 0.5;
        const offsetY = (clientY - rect.top) / rect.height - 0.5;

        element.dataset.tilting = "true";
        element.style.setProperty("--tilt-y", `${(offsetX * max * 2).toFixed(2)}deg`);
        element.style.setProperty("--tilt-x", `${(-offsetY * max * 2).toFixed(2)}deg`);
      });
    },
    [max],
  );

  const handlePointerLeave = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    cancelAnimationFrame(frame.current);
    // Dropping the flag restores the long ease, so the card settles back
    // to flat instead of snapping.
    delete element.dataset.tilting;
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
  }, []);

  return { ref, handlePointerMove, handlePointerLeave };
}
