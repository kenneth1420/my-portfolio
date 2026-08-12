import { useEffect, useRef } from "react";

/**
 * Publishes the pointer position, normalised to -0.5…0.5 of the viewport, as
 * the `--px` / `--py` custom properties on the returned element. The
 * `parallax-scene` utility turns those into movement, which keeps the decision
 * about whether the scene moves at all in CSS.
 *
 * Updates are skipped entirely while the element is off screen, and for touch
 * pointers and reduced-motion users, so an unseen hero costs nothing.
 */
export function usePointerParallax<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const coarse = window.matchMedia("(pointer: coarse)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (coarse.matches || reduced.matches) return;

    let frame = 0;
    let visible = false;

    const handlePointerMove = (event: PointerEvent) => {
      if (!visible || event.pointerType !== "mouse") return;

      const { clientX, clientY } = event;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = clientX / window.innerWidth - 0.5;
        const y = clientY / window.innerHeight - 0.5;
        element.style.setProperty("--px", x.toFixed(3));
        element.style.setProperty("--py", y.toFixed(3));
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );

    observer.observe(element);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}
