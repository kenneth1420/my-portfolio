import { useEffect, useRef } from "react";

/**
 * Counts the returned element's text from 0 up to `target` the first time it
 * scrolls into view.
 *
 * The server renders the final figure, so crawlers and no-JS readers never see
 * a zero. The count writes `textContent` inside rAF rather than through state,
 * so the animation never re-renders React. Reduced-motion users keep the
 * final figure untouched.
 *
 * `notBeforeMs` is the earliest start, in ms after mount. Above-the-fold
 * figures use it to wait out the splash loader instead of finishing unseen;
 * once that moment has passed, a figure scrolled into view counts at once.
 */
export function useCountUp<T extends HTMLElement = HTMLSpanElement>(
  target: number,
  durationMs = 1400,
  notBeforeMs = 0,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The delay runs on the mount clock, like the splash loader and the
    // headline, so a client-side return to the page waits out the splash too.
    const mountedAt = performance.now();

    let frame = 0;
    let timer = 0;
    element.textContent = "0";

    const run = () => {
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1);
        // Ease-out cubic: fast start, settling gently onto the final figure.
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(eased * target));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(
          run,
          Math.max(0, notBeforeMs - (performance.now() - mountedAt)),
        );
      },
      { threshold: 0.6 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      element.textContent = String(target);
    };
  }, [target, durationMs, notBeforeMs]);

  return ref;
}
