import {
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

interface IUseMotionTiltOptions {
  /** Maximum rotation on either axis, in degrees. */
  max?: number;
}

/** Soft enough to feel weighted, stiff enough to track a quick flick. */
const SPRING = { stiffness: 220, damping: 22, mass: 0.6 };

/**
 * Cursor-driven 3D axis tilt built on motion values.
 *
 * The pointer's position over the card, as a 0…1 fraction of its box on each
 * axis, is written to two motion values. Springs smooth them, and
 * `useTransform` maps them to `rotateX` / `rotateY` and to the position of a
 * glare highlight. Nothing here re-renders React: motion writes the styles
 * straight to the element.
 *
 * Attach the handlers to a static wrapper and apply the rotation to a child.
 * Measuring the element that rotates would let its own tilt shift the box
 * it is measured against, so the card would chase itself.
 *
 * Inert for touch pointers and reduced-motion users, whose cards stay flat.
 */
export function useMotionTilt<T extends HTMLElement = HTMLElement>({
  max = 8,
}: IUseMotionTiltOptions = {}) {
  const enabled = useRef(false);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const smoothX = useSpring(pointerX, SPRING);
  const smoothY = useSpring(pointerY, SPRING);

  // Right of centre turns the card's right edge away (positive rotateY); below
  // centre tips its bottom edge away (negative rotateX).
  const rotateY = useTransform(smoothX, [0, 1], [-max, max]);
  const rotateX = useTransform(smoothY, [0, 1], [max, -max]);

  const glareX = useTransform(smoothX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(smoothY, [0, 1], ["0%", "100%"]);
  const glare = useMotionTemplate`radial-gradient(520px circle at ${glareX} ${glareY}, var(--tilt-glare), transparent 60%)`;

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = () => {
      enabled.current = fine.matches && !reduced.matches;
      if (!enabled.current) {
        pointerX.set(0.5);
        pointerY.set(0.5);
      }
    };

    handleChange();

    fine.addEventListener("change", handleChange);
    reduced.addEventListener("change", handleChange);

    return () => {
      fine.removeEventListener("change", handleChange);
      reduced.removeEventListener("change", handleChange);
    };
  }, [pointerX, pointerY]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<T>) => {
      if (!enabled.current || event.pointerType !== "mouse") return;

      const box = event.currentTarget.getBoundingClientRect();
      if (!box.width || !box.height) return;

      pointerX.set((event.clientX - box.left) / box.width);
      pointerY.set((event.clientY - box.top) / box.height);
    },
    [pointerX, pointerY],
  );

  const handlePointerLeave = useCallback(() => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }, [pointerX, pointerY]);

  return { rotateX, rotateY, glare, handlePointerMove, handlePointerLeave };
}
