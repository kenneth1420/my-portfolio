import { useEffect, useRef } from "react";

/**
 * Publishes the reader's scroll position on the returned element, as two
 * custom properties serving two different kinds of parallax:
 *
 * - `--scroll-y`        raw offset in px, unbounded. For layers that tile and
 *                       can wrap, so they drift forever without an edge.
 * - `--scroll-progress` 0→1 through the page. For layers that cannot wrap, so
 *                       they travel a fixed distance regardless of page length.
 *
 * One passive listener serves every layer, coalesced into a single rAF write,
 * so a fast scroll costs one style update per frame rather than one per event.
 */
export function useScrollMetrics<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;
        // A page shorter than the viewport has no meaningful progress.
        const progress = scrollable > 0 ? scrollY / scrollable : 0;

        element.style.setProperty("--scroll-y", scrollY.toFixed(1));
        element.style.setProperty("--scroll-progress", progress.toFixed(4));
      });
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}
