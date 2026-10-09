/**
 * Tuning for the WebGL background in `components/scene`. Kept as data so the
 * look can be adjusted without touching the shader or the render loop.
 */

export type SceneTheme = "dark" | "light";

export interface IScenePalette {
  /** Painted behind the canvas. Transparent lets the page background show. */
  background: string;
  /** Ambient light colour. Matches the backdrop so unlit nodes sink into it. */
  ambient: string;
  ambientIntensity: number;
  /** Base albedo of every node before the cursor tints it. */
  node: string;
  /** Faint self-illumination so the fabric reads even away from the light. */
  emissive: string;
  emissiveIntensity: number;
  /** The cursor light and the swell tint. */
  accent: string;
  pointIntensity: number;
  /** Peak opacity of the nearest rows; far rows fade from here to zero. */
  opacity: number;
}

export const scenePalettes: Record<SceneTheme, IScenePalette> = {
  dark: {
    background: "#090d16",
    ambient: "#090d16",
    ambientIntensity: 1,
    node: "#64748b",
    emissive: "#1e293b",
    emissiveIntensity: 0.55,
    accent: "#10b981",
    pointIntensity: 26,
    opacity: 0.95,
  },
  // On white, light-coloured nodes would vanish, so the light theme keeps the
  // same slate-black ambient and lets the nodes read as ink. The cursor tint
  // still turns them mint.
  light: {
    background: "transparent",
    ambient: "#090d16",
    ambientIntensity: 1,
    node: "#334155",
    emissive: "#000000",
    emissiveIntensity: 0,
    accent: "#10b981",
    pointIntensity: 18,
    // Low on purpose: dark specks on white compete with body copy far more
    // than lit specks on black. The shader restores opacity under the cursor.
    opacity: 0.16,
  },
};

export interface ISceneDensity {
  cols: number;
  rows: number;
  /** Device-pixel-ratio ceiling. The performance monitor scales below it. */
  maxDpr: number;
}

/**
 * Touch devices get roughly a third of the nodes and a lower DPR ceiling.
 * They are the ones most likely to be thermally limited, and a phone's
 * smaller viewport shows less of the fabric anyway.
 */
export const sceneDensity: Record<"fine" | "coarse", ISceneDensity> = {
  fine: { cols: 96, rows: 48, maxDpr: 1.5 },
  coarse: { cols: 44, rows: 34, maxDpr: 1.25 },
};

/** Lowest DPR the performance monitor may drop to before it stops scaling. */
export const sceneMinDpr = 0.75;

export const sceneCamera = {
  position: [0, 4.2, 9] as const,
  target: [0, 0, -3] as const,
  fov: 50,
};

/** Shape of the fabric and of the cursor's influence on it, in world units. */
export const sceneField = {
  /** Fabric depth along z. The width is derived from the viewport aspect. */
  depth: 22,
  /** Half-width per unit of aspect ratio, clamped so phones and ultrawides
      both get a sensible spread from the same fixed node count. */
  widthPerAspect: 11,
  minHalfWidth: 6,
  maxHalfWidth: 24,
  /** Pushes the fabric back so its near edge sits just below the viewport. */
  offsetZ: -5,
  nodeSize: 0.038,
  amplitude: 0.55,
  /** Wave speed multiplier. Ignored under reduced motion, which freezes time. */
  speed: 1,
  radius: 2.8,
  lift: 0.55,
  push: 0.35,
  swell: 0.75,
  glow: 1.5,
  /** Height of the point light above the cursor's spot on the fabric. */
  lightHeight: 2.2,
  lightDistance: 9,
  /** Swell strength while no pointer is present, so the fabric is never inert. */
  idleStrength: 0.35,
  /** Exponential easing rates, per second. Higher snaps faster. */
  followRate: 6,
  strengthRate: 3,
};
