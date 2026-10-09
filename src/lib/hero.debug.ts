/**
 * A read-out of the hero scene for automated checks: where the camera is,
 * where the primary screen lands on the viewport, and what the renderer is
 * drawing. The scene writes into it each frame; browser tests read it from
 * `window.__hero`.
 *
 * It exists in development, and in a production build only when
 * `NEXT_PUBLIC_HERO_DEBUG=1`. Both conditions are inlined at build time, so
 * a normal production bundle carries none of it: `heroDebug` is `null` and
 * every `if (heroDebug)` write is dead code.
 */
export interface IHeroDebug {
  /** Damped scroll progress the camera is drawn at, 0…1. */
  p: number;
  camera: { position: [number, number, number]; fov: number };
  /** The primary screen's corners projected to NDC: [minX, maxX, minY, maxY]. */
  screenNdc: [minX: number, maxX: number, minY: number, maxY: number];
  info: { calls: number; triangles: number; programs: number };
  /** Closest the camera path comes to any part of the set at the current
      aspect ratio, in metres. Sampled at 200 steps. */
  minClearance(): number;
  /** Times the Hero component has committed, counted in an effect with no
      dependency list. A scroll must not drive this up. */
  commits: number;
}

const enabled =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_HERO_DEBUG === "1";

export const heroDebug: IHeroDebug | null = enabled
  ? {
      p: 0,
      camera: { position: [0, 0, 0], fov: 0 },
      screenNdc: [0, 0, 0, 0],
      info: { calls: 0, triangles: 0, programs: 0 },
      minClearance: () => Number.POSITIVE_INFINITY,
      commits: 0,
    }
  : null;

if (heroDebug && typeof window !== "undefined") {
  (window as unknown as { __hero: IHeroDebug }).__hero = heroDebug;
}
