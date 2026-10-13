/**
 * Tuning for the WebGL background in `components/scene`. Kept as data so the
 * look can be adjusted without touching the shaders or the render loop.
 */

export type SceneTheme = "dark" | "light";

export interface IScenePalette {
  /** Painted behind the canvas. Transparent lets the page background show. */
  background: string;
  /** The lit star, and the glow that follows the cursor across the field. */
  accent: string;
  /** The three star colours; each star is given one. */
  stars: readonly [string, string, string];
  /** Peak opacity of a globe star on the near side; far-side stars fade. */
  starOpacity: number;
  /** The globe's links. */
  line: string;
  lineOpacity: number;
  /** The star field behind the globe: fainter, so the globe stays the focus.
      The cursor's glow lifts the marks under it toward full opacity. */
  fieldStarOpacity: number;
  fieldLineOpacity: number;
  /** The faint star dust that fills the space around everything. */
  dust: string;
  dustOpacity: number;
  /** Additive blending, so crossing links brighten. Only on a dark backdrop:
      on white it would wash the marks out instead. */
  additive: boolean;
}

export const scenePalettes: Record<SceneTheme, IScenePalette> = {
  dark: {
    background: "#090d16",
    accent: "#10b981",
    stars: ["#f0f9ff", "#38bdf8", "#2dd4bf"],
    starOpacity: 0.95,
    line: "#38bdf8",
    lineOpacity: 0.42,
    fieldStarOpacity: 0.9,
    fieldLineOpacity: 0.14,
    dust: "#64748b",
    dustOpacity: 0.6,
    additive: true,
  },
  // Sky ink: on white the constellations are the only marks with colours of
  // their own, so they read as a chart drawn over the page. Low field
  // opacities on purpose: dark marks on white compete with body copy far
  // more than lit marks on black.
  light: {
    background: "transparent",
    accent: "#10b981",
    stars: ["#0c4a6e", "#0284c7", "#0d9488"],
    starOpacity: 0.85,
    line: "#0284c7",
    lineOpacity: 0.36,
    fieldStarOpacity: 0.6,
    fieldLineOpacity: 0.12,
    dust: "#94a3b8",
    dustOpacity: 0.55,
    additive: false,
  },
};

export interface ISceneDensity {
  /** Device-pixel-ratio ceiling. The performance monitor scales below it. */
  maxDpr: number;
  /** Nodes in the constellation globe. */
  stars: number;
  /** Stars in the field, per square world unit of its face. */
  fieldDensity: number;
  /** Specks of star dust. */
  dust: number;
}

/**
 * Touch devices get fewer background stars and a lower DPR ceiling. They are
 * the ones most likely to be thermally limited, and a phone's smaller
 * viewport shows less of the sky anyway. The globe keeps all 88 nodes: it is
 * the centrepiece, and one instanced draw costs the same either way.
 */
export const sceneDensity: Record<"fine" | "coarse", ISceneDensity> = {
  fine: { maxDpr: 1.5, stars: 88, fieldDensity: 0.335, dust: 1200 },
  coarse: { maxDpr: 1.25, stars: 88, fieldDensity: 0.28, dust: 600 },
};

/** Lowest DPR the performance monitor may drop to before it stops scaling. */
export const sceneMinDpr = 0.75;

export const sceneCamera = {
  position: [0, 4.2, 9] as const,
  target: [0, 0, -3] as const,
  fov: 50,
};

/**
 * The star field: a deep layer of stars behind the globe, facing the camera
 * and filling the viewport. Links are capped by distance, so the stars
 * gather into separate figures rather than one web.
 */
export const sceneStarField = {
  /** How far behind the camera's target the field's middle sits: far enough
      that the globe never reaches into it. */
  back: 11,
  /** Half the field's height, in world units: a margin past the viewport's
      edges, so the tilt never brings an edge into view. */
  halfHeight: 12.7,
  /** The half-width follows the viewport's aspect ratio, within these. */
  minHalfWidth: 8,
  maxHalfWidth: 35,
  /** Half the field's depth, along the view. */
  halfDepth: 3.35,
  /** Links per star, at most, and the furthest two stars may be apart. */
  neighbours: 2,
  maxLink: 2.15,
  /** Star sizes, as multiples of `starSize`; most land near the low end. */
  sizeRange: [0.5, 1.6] as const,
  tintWeights: [0.5, 0.35, 0.15] as const,
  seed: 7,
  /** Star size, in pixels at one world unit from the camera. */
  starSize: 228,
  /** Opacity kept by the furthest stars. */
  depthFade: 0.35,
  /** Twinkle cycles, in radians per second. */
  twinkleRate: 0.7,
  /** Lean toward the cursor at the screen's edge, in radians. */
  tilt: 0.06,
  tiltRate: 1.5,
  /** The cursor's glow: its radius in CSS pixels, its strength while no
      pointer is present (so the field is never inert), and easing rates per
      second for its position and strength. */
  glowRadius: 220,
  idleStrength: 0.35,
  followRate: 6,
  strengthRate: 3,
} as const;

/**
 * The constellation globe: 88 glowing stars spread evenly over a sphere,
 * centred on screen and a little taller than it, each linked by a solid line
 * to its nearest neighbours. It turns slowly and leans a little toward the
 * cursor.
 *
 * Every mouse move reshapes it: stars near the cursor are swept along its
 * path, and the links are re-formed every frame to whichever stars are now
 * nearest, so the figures themselves change. When the mouse stops, springs
 * draw the stars home and the original figures re-form.
 */
export const sceneConstellation = {
  /** Globe radius, in world units: just over half the viewport's height. */
  radius: 6.8,
  /** Centre, in world space: the camera's target, the middle of the screen. */
  center: [0, 0, -3] as const,
  /** Below this viewport aspect ratio the globe shrinks in step, so a
      portrait phone is not lost inside it. */
  minAspect: 0.9,
  /** Links per star, to its nearest neighbours. Shared links are drawn once. */
  neighbours: 3,
  /** Random offset from the even spread, as a share of the radius, so the
      stars read as a sky rather than a mesh. */
  jitter: 0.07,
  /** Fixes the jitter and the colours, so the sky is the same on every load. */
  seed: 88,
  /** How often each of the palette's three colours is picked. */
  tintWeights: [0.45, 0.35, 0.2] as const,
  /** Star size, in pixels at one world unit from the camera. */
  starSize: 220,
  /** What marks on the far side of the globe keep of their size and opacity. */
  backFade: 0.22,
  /** Twinkle cycles, in radians per second. */
  twinkleRate: 0.9,
  /** Constant spin, radians per second, about x and y. */
  spin: [0.02, 0.04] as const,
  /** Lean toward the cursor at the screen's edge, in radians. */
  tilt: 0.25,
  tiltRate: 2.5,
  /** The sweep: how close to the cursor a star must be to be moved, in CSS
      pixels, and how much of the cursor's movement a star right under it
      takes. `carry` moves it along at once; `fling` sends it on with some of
      the cursor's speed, so a quick flick throws the stars further. */
  sweepRadius: 190,
  carry: 0.55,
  fling: 0.35,
  /** The spring that draws a swept star home, per second squared and per
      second: slightly under-damped, so it settles with a soft overshoot. */
  stiffness: 6,
  damping: 3.6,
  /** Furthest a star may be swept from home, in world units. */
  maxOffset: 2.6,
  /** A star swept this far, in world units, glows at full strength. */
  glowAt: 0.9,
} as const;

/**
 * Star dust: specks scattered through a cube that surrounds the camera,
 * unlinked and faint, drifting slowly the other way from the globe's spin.
 */
export const sceneStarDust = {
  /** Half the cube's side, in world units, around the camera's target. */
  halfExtent: 28,
  /** Speck size, in pixels at one world unit from the camera, and its range
      on screen in CSS pixels, so near specks never balloon. */
  size: 38,
  minPixels: 1,
  maxPixels: 2.5,
  /** Drift about the vertical axis, in radians per second. */
  drift: -0.01,
  seed: 1200,
} as const;
