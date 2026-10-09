import { useEffect, useRef } from "react";

/** Glyphs cycled through before each character locks. Uppercase and symbols
    only, so a monospaced word keeps its width while it scrambles. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";

/** How often unresolved characters change, in ms. Slower than a frame, so it
    reads as a mechanical split-flap rather than a flicker. */
const GLYPH_INTERVAL = 45;

/**
 * Scrambles the returned element's text and resolves it left to right, the
 * first time it scrolls into view, like a split-flap display settling.
 *
 * Mirrors `useCountUp`: the server renders the final text, so crawlers and
 * no-JS readers never see noise; the effect writes `textContent` inside rAF
 * so it never re-renders React; reduced-motion users keep the text as is.
 * Pair it with a monospaced font, or the line will jitter as glyphs change.
 *
 * `notBeforeMs` is the earliest start, in ms after mount, so text above
 * the fold waits out the splash loader but text scrolled to later does not.
 */
export function useTextScramble<T extends HTMLElement = HTMLSpanElement>(
  text: string,
  durationMs = 900,
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
    let lastSwap = -Infinity;

    const scrambled = (resolved: number) =>
      Array.from(text, (char, i) =>
        i < resolved || char === " "
          ? char
          : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      ).join("");

    element.textContent = scrambled(0);

    const run = () => {
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1);
        if (now - lastSwap >= GLYPH_INTERVAL || progress === 1) {
          lastSwap = now;
          element.textContent = scrambled(Math.floor(progress * text.length));
        }
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
      element.textContent = text;
    };
  }, [text, durationMs, notBeforeMs]);

  return ref;
}
