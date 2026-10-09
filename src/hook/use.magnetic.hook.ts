import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

interface IUseMagneticOptions {
  /** How far outside the element's edge the pull reaches, in px. */
  radius?: number;
  /** Share of the cursor's offset from centre the element travels. */
  strength?: number;
  /** Hard cap on travel per axis, in px, so a wide button never lunges. */
  max?: number;
}

const SPRING = { stiffness: 260, damping: 18, mass: 0.6 };

const clamp = (value: number, limit: number) =>
  Math.min(Math.max(value, -limit), limit);

/**
 * Magnetic pull: while the mouse is within `radius` px of the element's edge
 * (or over it), the element drifts toward the cursor; outside that band it
 * springs home. The target is a motion value and the rendered offset is its
 * spring, so the movement eases without any React re-render.
 *
 * Distance is measured to the element's resting box, not its current one:
 * the transform moves the box, and measuring the moved box would let the
 * element chase its own pull.
 *
 * Inert for touch pointers and reduced-motion users, who get a plain button.
 */
export function useMagnetic<T extends HTMLElement = HTMLAnchorElement>({
  radius = 40,
  strength = 0.35,
  max = 14,
}: IUseMagneticOptions = {}) {
  const ref = useRef<T>(null);
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, SPRING);
  const y = useSpring(targetY, SPRING);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const release = () => {
      targetX.set(0);
      targetY.set(0);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      const box = element.getBoundingClientRect();
      const halfWidth = box.width / 2;
      const halfHeight = box.height / 2;
      // Undo the current offset to recover the resting centre.
      const centreX = box.left + halfWidth - x.get();
      const centreY = box.top + halfHeight - y.get();
      const dx = event.clientX - centreX;
      const dy = event.clientY - centreY;

      const outsideX = Math.max(Math.abs(dx) - halfWidth, 0);
      const outsideY = Math.max(Math.abs(dy) - halfHeight, 0);

      const edgeDistance = Math.hypot(outsideX, outsideY);
      if (edgeDistance > radius) {
        release();
        return;
      }

      // Full pull over the element, fading to nothing at the radius, so
      // crossing the boundary eases the button home instead of dropping it.
      const falloff = 1 - edgeDistance / radius;
      targetX.set(clamp(dx * strength, max) * falloff);
      targetY.set(clamp(dy * strength, max) * falloff);
    };

    const root = document.documentElement;

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    root.addEventListener("pointerleave", release);
    window.addEventListener("blur", release);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", release);
      window.removeEventListener("blur", release);
      release();
    };
  }, [radius, strength, max, targetX, targetY, x, y]);

  return { ref, x, y };
}
