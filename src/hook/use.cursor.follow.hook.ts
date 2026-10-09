import { useEffect, useRef } from "react";

/**
 * Moves the returned element so its centre trails the mouse, easing toward
 * the pointer each frame instead of snapping to it. The lag is what makes it
 * read as light rather than as a second cursor.
 *
 * Inert for touch pointers and reduced-motion users: the element stays at
 * opacity 0 and no listener is attached.
 */
export function useCursorFollow<T extends HTMLElement = HTMLDivElement>(
  easing = 0.14,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    const half = element.offsetWidth / 2;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 3 };
    const current = { ...target };
    let frame = 0;

    const render = () => {
      current.x += (target.x - current.x) * easing;
      current.y += (target.y - current.y) * easing;
      element.style.transform = `translate3d(${current.x - half}px, ${current.y - half}px, 0)`;

      // Stop the loop once settled, so an idle mouse costs nothing.
      const settled =
        Math.abs(target.x - current.x) < 0.5 &&
        Math.abs(target.y - current.y) < 0.5;
      frame = settled ? 0 : requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = event.clientX;
      target.y = event.clientY;
      element.style.opacity = "1";
      if (!frame) frame = requestAnimationFrame(render);
    };

    const handlePointerLeave = () => {
      element.style.opacity = "0";
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
      cancelAnimationFrame(frame);
    };
  }, [easing]);

  return ref;
}
