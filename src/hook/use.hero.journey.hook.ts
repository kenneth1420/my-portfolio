import { useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { type HeroStage, heroJourney } from "@/src/data/hero";
import { heroDebug } from "@/src/lib/hero.debug";
import { useUiStore } from "@/src/store/ui.store";

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/** The journey's stages in scroll order. */
const STAGES: readonly HeroStage[] = ["intro", "zoom", "handoff", "past"];

/** The `[enter, leave]` edge that opens each stage after the first. */
const EDGES = [
  heroJourney.stageEdges.zoom,
  heroJourney.stageEdges.handoff,
  heroJourney.stageEdges.past,
];

// motion wants a mutable array for an input range; the data is a frozen tuple.
const BACKDROP_FADE = [...heroJourney.backdropFade];

/**
 * The stage a scroll position falls in.
 *
 * A stage already reached is held until progress drops below its leaving
 * edge, not its entering one. Without that gap a reader resting on a
 * boundary would flip the stage on every pixel of scroll jitter, and each
 * flip pauses or resumes a canvas.
 */
function resolveStage(p: number, previous: HeroStage | null): HeroStage {
  // `static` and null carry no position, so they resolve from the entering
  // edges, like a reader arriving from the top.
  const held = previous === null ? 0 : Math.max(STAGES.indexOf(previous), 0);

  let rank = 0;
  EDGES.forEach(([enter, leave], i) => {
    if (p >= (held > i ? leave : enter)) rank = i + 1;
  });

  return STAGES[rank];
}

/**
 * A plain function because it writes to an object this module does not own,
 * which the React Compiler lint rules forbid inside a hook body.
 */
function countCommit() {
  if (heroDebug) heroDebug.commits += 1;
}

/**
 * The DOM side of the hero's scroll journey: how far the reader is along
 * the track, which stage that is, and when the text and the poster fade.
 *
 * CSS owns the layout and decides whether there is a journey at all (see
 * the hero utilities in `globals.css`). This hook only observes: a track
 * taller than its pinned stage means there is travel to measure, and a
 * track the same height means static mode, where every value here rests.
 *
 * Progress is a plain motion value fed by one passive scroll listener, not
 * motion's `useScroll`. That hook reports 1 over a zero range, which is
 * exactly static mode, and it can bind a native scroll timeline that no
 * check here could stop. A scroll event writes two motion values and, a
 * few times per journey, the stage in the store. It never sets React state,
 * so scrolling the whole track re-renders the hero only when the stage
 * changes.
 */
export function useHeroJourney() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /** 0 at the top of the track, 1 where the pinned stage releases. */
  const progress = useMotionValue(0);
  /** 0 while the text's bottom edge is at or below the bottom of the
      viewport, 1 once it has risen `overlayExitSpan` of a viewport. */
  const overlayExit = useMotionValue(0);

  // Keyed to the text's own exit, not to progress: text taller than the
  // viewport (a small phone, 400% zoom) stays opaque until it has been
  // scrolled through.
  const overlayOpacity = useTransform(overlayExit, [0, 1], [1, 0]);
  const overlayPointerEvents = useTransform(overlayExit, (exit): string =>
    exit > heroJourney.overlayInertAt ? "none" : "auto",
  );
  const backdropOpacity = useTransform(progress, BACKDROP_FADE, [1, 0]);

  // Starts false, so a page restored far down never mounts the canvas.
  const [isNear, setIsNear] = useState(false);

  const stage = useUiStore((state) => state.heroStage);
  const scene = useUiStore((state) => state.heroScene);
  const setStage = useUiStore((state) => state.setHeroStage);

  useEffect(() => {
    const track = trackRef.current;
    const pinned = stageRef.current;
    const overlay = overlayRef.current;
    if (!track || !pinned || !overlay) return;

    // Document-space metrics, cached so a scroll event measures no element.
    let trackTop = 0;
    let overlayBottom = 0;
    let travel = 0;
    let current: HeroStage | null = null;

    const read = () => {
      const scrollY = window.scrollY;
      const viewport = window.innerHeight;
      // More than a pixel, so sub-pixel rounding never fakes a journey.
      const isJourney = travel > 1;

      const p = isJourney ? clamp01((scrollY - trackTop) / travel) : 0;
      progress.set(p);
      overlayExit.set(
        isJourney
          ? clamp01(
              (scrollY + viewport - overlayBottom) /
                (heroJourney.overlayExitSpan * viewport),
            )
          : 0,
      );

      const next = isJourney ? resolveStage(p, current) : "static";
      if (next !== current) {
        current = next;
        setStage(next);
      }
    };

    const measure = () => {
      const scrollY = window.scrollY;
      trackTop = track.getBoundingClientRect().top + scrollY;
      overlayBottom = overlay.getBoundingClientRect().bottom + scrollY;
      // The distance the stage stays pinned, which is the journey by
      // definition. Zero when CSS has left the hero as a normal section.
      travel = track.offsetHeight - pinned.offsetHeight;
      read();
    };

    // Also how a mode change is noticed: the reduced-motion and height
    // queries resize the track, so no media query is repeated in JS.
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(pinned);
    observer.observe(overlay);
    window.addEventListener("scroll", read, { passive: true });
    measure();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", read);
      // No hero on the page: the sky backdrop must not wait for one.
      setStage(null);
    };
  }, [progress, overlayExit, setStage]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      // Several entries can queue up between callbacks; the last is current.
      (entries) => setIsNear(entries[entries.length - 1].isIntersecting),
      { rootMargin: heroJourney.mount.rootMargin },
    );
    observer.observe(track);

    return () => observer.disconnect();
  }, []);

  // No dependency list on purpose: it runs after every commit of the hero,
  // which is the thing being counted.
  useEffect(countCommit);

  return {
    trackRef,
    stageRef,
    overlayRef,
    progress,
    overlayOpacity,
    overlayPointerEvents,
    backdropOpacity,
    isNear,
    stage,
    scene,
  };
}
