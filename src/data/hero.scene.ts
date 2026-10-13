import type { HeroTokenKind } from "./hero";

/**
 * The hero's desk scene as data: every part of the room, its colours in both
 * themes, the lights, the camera's keyframes, and what each class of device
 * is given. Kept here so the look can be tuned without touching the builders
 * or the render loop.
 *
 * Units are metres. The origin is the floor under the centre of the desk,
 * +y is up and +z points toward the viewer; the avatar faces -z. Angles are
 * degrees, because that is how a ten degree yaw is thought about; the
 * builders convert.
 */

export type HeroTheme = "dark" | "light";
export type HeroVec3 = readonly [number, number, number];
export type HeroVec2 = readonly [number, number];

/** A value that differs between a wide viewport and a tall one. */
export interface IHeroByAspect {
  landscape: number;
  portrait: number;
}

// ── Screens ──────────────────────────────────────────────────────────────

export interface IHeroScreen {
  /** Centre of the glass. */
  centre: HeroVec3;
  /** Turn about the vertical axis; positive faces the glass toward +x. */
  yaw: number;
  /** Width and height of the glass. */
  size: HeroVec2;
}

/**
 * The two monitors' glass. Stated once: the monitor bodies, the halos behind
 * them and the camera's last three keyframes are all derived from these, so
 * moving a screen moves everything that depends on it.
 */
export const heroScreens: Record<"primary" | "secondary", IHeroScreen> = {
  // The terminal, and where the camera ends up.
  primary: { centre: [-0.46, 1.13, -0.22], yaw: 10, size: [0.64, 0.4] },
  // The editor, in front of the avatar.
  secondary: { centre: [0.38, 1.11, -0.2], yaw: -8, size: [0.56, 0.35] },
};

// ── Parts ────────────────────────────────────────────────────────────────

/** A named colour slot. Each theme fills every slot. */
export type HeroTone =
  | "floor"
  | "wall"
  | "rug"
  | "deskTop"
  | "deskLeg"
  | "bezel"
  | "keyboard"
  | "keycap"
  | "hoodie"
  | "trousers"
  | "chair"
  | "skin"
  | "hair"
  | "shoe"
  | "glass"
  | "mug"
  | "pot"
  | "leaf"
  | "glowA"
  | "glowB";

/** `set` is lit by the scene's lights; `glow` is drawn at full brightness. */
export type HeroLayer = "set" | "glow";

/** How much of the set a device builds. See `heroTiers`. */
export type HeroDetail = "fine" | "coarse";

interface IHeroPartBase {
  tone: HeroTone;
  /** Defaults to `set`. */
  layer?: HeroLayer;
  /** Small parts a phone will not miss are built only at this detail. */
  detail?: "fine";
}

/** A box given by its centre, with an optional turn about x, y, z. */
export interface IHeroBox extends IHeroPartBase {
  shape: "box";
  size: HeroVec3;
  at: HeroVec3;
  turn?: HeroVec3;
}

/** A box stretched between two points: a limb, a spoke, a pole. */
export interface IHeroBeam extends IHeroPartBase {
  shape: "beam";
  from: HeroVec3;
  to: HeroVec3;
  width: number;
  depth: number;
}

/** A cylinder or cone between two points. A zero radius makes a point. */
export interface IHeroPrism extends IHeroPartBase {
  shape: "prism";
  from: HeroVec3;
  to: HeroVec3;
  /** Radius at `from`, then at `to`. */
  radius: HeroVec2;
  sides: number;
}

export type IHeroPart = IHeroBox | IHeroBeam | IHeroPrism;

/** Parts that share a position and a turn, such as a monitor on its stand. */
export interface IHeroGroup {
  name: string;
  at?: HeroVec3;
  turn?: HeroVec3;
  /** False when the camera is meant to come close: the group is then left
      out of the clearance check. Only the primary monitor is. */
  blocks?: boolean;
  parts: readonly IHeroPart[];
}

type PartExtra = Pick<IHeroPartBase, "layer" | "detail">;

const box = (
  tone: HeroTone,
  size: HeroVec3,
  at: HeroVec3,
  turn?: HeroVec3,
  extra?: PartExtra,
): IHeroBox => ({ shape: "box", tone, size, at, turn, ...extra });

const beam = (
  tone: HeroTone,
  from: HeroVec3,
  to: HeroVec3,
  width: number,
  depth = width,
): IHeroBeam => ({ shape: "beam", tone, from, to, width, depth });

const prism = (
  tone: HeroTone,
  from: HeroVec3,
  to: HeroVec3,
  radius: HeroVec2,
  sides: number,
  extra?: PartExtra,
): IHeroPrism => ({ shape: "prism", tone, from, to, radius, sides, ...extra });

const GLOW: PartExtra = { layer: "glow" };

/** Height of the desk's working surface; everything on it is placed from here. */
const DESK_TOP = 0.75;

/** Mirrors a part across the avatar's centre line: once per side. */
const bothSides = (build: (side: -1 | 1) => readonly IHeroPart[]) => [
  ...build(-1),
  ...build(1),
];

/**
 * A monitor around its glass: bezel, neck and foot, in the screen's own
 * frame (origin at the centre of the glass, +z out of it). The bezel's face
 * sits a hair behind the glass so the two never fight for the same depth.
 */
function monitor(name: string, screen: IHeroScreen, blocks: boolean): IHeroGroup {
  const [width, height] = screen.size;
  const border = 0.02;
  const depth = 0.03;
  const gap = 0.002;
  const desk = DESK_TOP - screen.centre[1];
  const bezelBottom = -(height / 2 + border);
  const neckTop = bezelBottom + 0.04;

  return {
    name,
    at: screen.centre,
    turn: [0, screen.yaw, 0],
    blocks,
    parts: [
      box(
        "bezel",
        [width + border * 2, height + border * 2, depth],
        [0, 0, -(gap + depth / 2)],
      ),
      box(
        "bezel",
        [0.05, neckTop - desk, depth],
        [0, (neckTop + desk) / 2, -(gap + depth * 1.5)],
      ),
      box("bezel", [width * 0.34, 0.014, 0.16], [0, desk + 0.007, -(gap + depth)]),
      // Power light on the lower border.
      box(
        "glowB",
        [0.014, 0.006, 0.004],
        [width / 2 - 0.02, bezelBottom + border / 2, -gap + 0.001],
        undefined,
        GLOW,
      ),
    ],
  };
}

/** Keys per row of a 60% board, back row first: 61 in all. */
const KEY_ROWS = [14, 14, 13, 12, 8] as const;
const KEY_CASE: HeroVec3 = [0.36, 0.022, 0.13];

/**
 * The keycaps, in the keyboard's own frame. Every row spans the same width,
 * so the rows with fewer keys get the wider ones, as on a real board. Escape
 * and Enter are lit accents; the rest take the light like any other part.
 */
function keycaps(): IHeroPart[] {
  const margin = 0.01;
  const gap = 0.005;
  const height = 0.012;
  const usableWidth = KEY_CASE[0] - margin * 2;
  const rowPitch = (KEY_CASE[2] - margin * 2) / KEY_ROWS.length;
  const y = KEY_CASE[1] / 2 + height / 2;
  const parts: IHeroPart[] = [];

  KEY_ROWS.forEach((count, row) => {
    const pitch = usableWidth / count;
    const z = -KEY_CASE[2] / 2 + margin + rowPitch * (row + 0.5);

    for (let col = 0; col < count; col++) {
      const isEscape = row === 0 && col === 0;
      const isEnter = row === 2 && col === count - 1;
      const accent = isEscape ? "glowA" : isEnter ? "glowB" : null;

      parts.push(
        box(
          accent ?? "keycap",
          [pitch - gap, height, rowPitch - gap + 0.002],
          [-usableWidth / 2 + pitch * (col + 0.5), y, z],
          undefined,
          { detail: "fine", layer: accent ? "glow" : "set" },
        ),
      );
    }
  });

  return parts;
}

/** The five legs of an office chair's base, fanned evenly round the post. */
function chairSpokes(): IHeroPart[] {
  const reach = 0.28;
  return Array.from({ length: 5 }, (_, i) => {
    const angle = ((i * 72 + 36) * Math.PI) / 180;
    return beam(
      "bezel",
      [0, 0.07, 0],
      [Math.sin(angle) * reach, 0.035, Math.cos(angle) * reach],
      0.04,
      0.03,
    );
  });
}

/**
 * Every solid in the room. Lit parts are merged into one mesh and glowing
 * parts into another, so the list can grow without adding draw calls; what
 * it does add is triangles, which the budget below caps.
 *
 * The avatar sits at the secondary monitor on purpose. That leaves the space
 * in front of the primary monitor empty, which is the corridor the camera
 * flies down; nothing has to move out of its way.
 */
export const heroGroups: readonly IHeroGroup[] = [
  {
    name: "room",
    parts: [
      box("floor", [4.4, 0.1, 3.6], [0, -0.05, 0.35]),
      box("rug", [1.8, 0.015, 1.2], [0.2, 0.008, 0.7]),
      // Back wall, then the right one. There is no left wall: the camera
      // starts out there. The back wall stops at the right wall's inner
      // face so their tops never overlap.
      box("wall", [4.35, 2.6, 0.1], [-0.025, 1.3, -1.45]),
      box("wall", [0.1, 2.6, 3.65], [2.2, 1.3, 0.325]),
      // Window on the right wall: pane, frame, and one upright.
      box("glass", [0.02, 0.7, 0.9], [2.145, 1.5, 0.45]),
      box("deskLeg", [0.04, 0.05, 1], [2.135, 1.875, 0.45]),
      box("deskLeg", [0.04, 0.05, 1], [2.135, 1.125, 0.45]),
      box("deskLeg", [0.04, 0.7, 0.05], [2.135, 1.5, -0.025]),
      box("deskLeg", [0.04, 0.7, 0.05], [2.135, 1.5, 0.925]),
      box("deskLeg", [0.03, 0.7, 0.03], [2.14, 1.5, 0.45]),
    ],
  },
  {
    name: "shelf",
    at: [0.9, 1.75, -1.32],
    parts: [
      box("deskTop", [0.9, 0.04, 0.22], [0, 0, 0]),
      // Five books; the last leans on its neighbour.
      box("hoodie", [0.045, 0.24, 0.16], [-0.38, 0.14, 0]),
      box("mug", [0.035, 0.2, 0.15], [-0.335, 0.12, 0]),
      box("leaf", [0.05, 0.26, 0.16], [-0.287, 0.15, 0]),
      box("trousers", [0.04, 0.22, 0.15], [-0.238, 0.13, 0]),
      box("keycap", [0.045, 0.23, 0.16], [-0.165, 0.137, 0], [0, 0, 14]),
      // A small plant at the other end.
      prism("pot", [0.3, 0.02, 0.01], [0.3, 0.09, 0.01], [0.04, 0.05], 6),
      prism("leaf", [0.3, 0.09, 0.01], [0.25, 0.25, 0.03], [0.022, 0], 4),
      prism("leaf", [0.3, 0.09, 0.01], [0.34, 0.27, -0.01], [0.022, 0], 4),
      prism("leaf", [0.3, 0.09, 0.01], [0.31, 0.22, 0.07], [0.022, 0], 4),
    ],
  },
  {
    name: "desk",
    parts: [
      box("deskTop", [1.7, 0.05, 0.8], [0, DESK_TOP - 0.025, 0]),
      box("deskLeg", [0.06, 0.7, 0.06], [-0.8, 0.35, -0.35]),
      box("deskLeg", [0.06, 0.7, 0.06], [0.8, 0.35, -0.35]),
      box("deskLeg", [0.06, 0.7, 0.06], [-0.8, 0.35, 0.35]),
      box("deskLeg", [0.06, 0.7, 0.06], [0.8, 0.35, 0.35]),
      // Drawer unit under the left end, with two pulls.
      box("deskLeg", [0.4, 0.5, 0.7], [-0.6, 0.45, 0]),
      box("keycap", [0.16, 0.018, 0.012], [-0.6, 0.57, 0.356]),
      box("keycap", [0.16, 0.018, 0.012], [-0.6, 0.33, 0.356]),
    ],
  },
  monitor("primary monitor", heroScreens.primary, false),
  monitor("secondary monitor", heroScreens.secondary, true),
  {
    name: "keyboard",
    at: [0.38, 0.763, 0.16],
    // Raised at the back, like a board on its feet.
    turn: [4, 0, 0],
    parts: [
      box("keyboard", KEY_CASE, [0, 0, 0]),
      ...keycaps(),
      // A lit strip a little larger than the case, showing as a rim.
      box(
        "glowA",
        [KEY_CASE[0] + 0.012, 0.003, KEY_CASE[2] + 0.012],
        [0, -KEY_CASE[1] / 2 + 0.0005, 0],
        undefined,
        GLOW,
      ),
    ],
  },
  {
    name: "desk things",
    parts: [
      // Mouse on its pad.
      box("bezel", [0.26, 0.004, 0.22], [0.7, DESK_TOP + 0.002, 0.18]),
      box("keycap", [0.06, 0.03, 0.1], [0.7, DESK_TOP + 0.019, 0.19]),
      // Mug: body, coffee, and a handle toward the camera's side.
      prism("mug", [-0.7, DESK_TOP + 0.0025, 0.2], [-0.7, DESK_TOP + 0.0975, 0.2], [0.042, 0.042], 8),
      prism("hair", [-0.7, DESK_TOP + 0.0975, 0.2], [-0.7, DESK_TOP + 0.0995, 0.2], [0.034, 0.034], 8),
      box("mug", [0.03, 0.05, 0.012], [-0.754, DESK_TOP + 0.05, 0.2]),
    ],
  },
  {
    name: "tower",
    parts: [
      box("keyboard", [0.2, 0.44, 0.44], [1.05, 0.22, -0.1]),
      box("glowB", [0.012, 0.34, 0.006], [0.99, 0.22, 0.122], undefined, GLOW),
      box("glowB", [0.006, 0.012, 0.34], [0.948, 0.38, -0.1], undefined, GLOW),
    ],
  },
  {
    name: "floor lamp",
    at: [1.75, 0, -1],
    parts: [
      prism("bezel", [0, 0, 0], [0, 0.03, 0], [0.12, 0.12], 8),
      box("bezel", [0.04, 1.5, 0.04], [0, 0.78, 0]),
      prism("keycap", [0, 1.39, 0], [0, 1.61, 0], [0.17, 0.09], 8),
      // The bulb hangs just below the shade, so it shows from the side.
      prism("glowA", [0, 1.345, 0], [0, 1.395, 0], [0.05, 0.05], 6, GLOW),
    ],
  },
  {
    name: "floor plant",
    at: [-1.6, 0, -0.9],
    parts: [
      prism("pot", [0, 0, 0], [0, 0.26, 0], [0.13, 0.16], 6),
      prism("hair", [0, 0.26, 0], [0, 0.264, 0], [0.145, 0.145], 6),
      prism("leaf", [0, 0.26, 0], [0.2, 0.86, 0.06], [0.075, 0], 5),
      prism("leaf", [0, 0.26, 0], [-0.18, 0.78, 0.1], [0.075, 0], 5),
      prism("leaf", [0, 0.26, 0], [0.03, 0.98, -0.14], [0.075, 0], 5),
      prism("leaf", [0, 0.26, 0], [-0.06, 0.74, 0.22], [0.075, 0], 5),
    ],
  },
  {
    name: "chair",
    at: [0.38, 0, 0.66],
    parts: [
      box("chair", [0.46, 0.07, 0.46], [0, 0.47, 0]),
      // The back stops below the shoulders so the hoodie shows above it.
      box("chair", [0.44, 0.4, 0.06], [0, 0.755, 0.22], [7, 0, 0]),
      box("chair", [0.06, 0.14, 0.04], [0, 0.535, 0.235]),
      box("bezel", [0.05, 0.33, 0.05], [0, 0.27, 0]),
      ...chairSpokes(),
    ],
  },
  {
    name: "avatar",
    at: [0.38, 0, 0],
    parts: [
      // Torso, leaning in a little, with the hood behind the neck.
      box("hoodie", [0.34, 0.5, 0.2], [0, 0.76, 0.635], [-6, 0, 0]),
      box("hoodie", [0.26, 0.1, 0.08], [0, 0.985, 0.72]),
      box("skin", [0.09, 0.07, 0.09], [0, 1.035, 0.615]),
      // Head, hair over the top and down the back, glasses.
      box("skin", [0.22, 0.22, 0.22], [0, 1.17, 0.62]),
      box("hair", [0.236, 0.06, 0.236], [0, 1.295, 0.625]),
      box("hair", [0.236, 0.15, 0.04], [0, 1.205, 0.735]),
      box("bezel", [0.21, 0.04, 0.015], [0, 1.18, 0.505]),
      // Headphone band; the cups and their lit rings are per side.
      box("bezel", [0.29, 0.025, 0.04], [0, 1.3375, 0.62]),
      ...bothSides((side) => [
        box("bezel", [0.02, 0.13, 0.03], [side * 0.135, 1.265, 0.62]),
        box("bezel", [0.04, 0.1, 0.09], [side * 0.13, 1.17, 0.62]),
        box("glowA", [0.006, 0.05, 0.045], [side * 0.153, 1.17, 0.62], undefined, GLOW),
        // Shoulder to elbow, elbow to wrist, and a hand on the keys.
        beam("hoodie", [side * 0.21, 0.97, 0.615], [side * 0.225, 0.8, 0.5], 0.09),
        beam("hoodie", [side * 0.225, 0.8, 0.5], [side * 0.11, 0.805, 0.235], 0.08),
        box("skin", [0.075, 0.035, 0.1], [side * 0.1, 0.808, 0.185]),
        // Thigh on the seat, shin down to a shoe on the rug.
        box("trousers", [0.14, 0.13, 0.4], [side * 0.09, 0.57, 0.47]),
        box("trousers", [0.12, 0.47, 0.12], [side * 0.09, 0.305, 0.3]),
        box("shoe", [0.12, 0.07, 0.22], [side * 0.09, 0.052, 0.27]),
      ]),
    ],
  },
];

// ── Flat, textured quads ─────────────────────────────────────────────────

/** A quad facing +z before its turn, drawn with the soft round gradient. */
export interface IHeroDecal {
  at: HeroVec3;
  turn: HeroVec3;
  size: HeroVec2;
}

/** A glow on the wall side of a monitor, a little larger than its bezel. */
function halo(screen: IHeroScreen): IHeroDecal {
  const back = 0.07;
  const yaw = (screen.yaw * Math.PI) / 180;
  const [x, y, z] = screen.centre;

  return {
    at: [x - Math.sin(yaw) * back, y, z - Math.cos(yaw) * back],
    turn: [0, screen.yaw, 0],
    size: [screen.size[0] * 1.8, screen.size[1] * 2.1],
  };
}

export const heroDecals = {
  /** The one shadow in the scene: a soft dark patch under desk and chair,
      laid just above the rug so it darkens that too. */
  ground: { at: [0.1, 0.02, 0.3], turn: [-90, 0, 0], size: [2.6, 1.9] },
  halos: [halo(heroScreens.primary), halo(heroScreens.secondary)],
} satisfies { ground: IHeroDecal; halos: IHeroDecal[] };

/** Pixel size of the round gradient the decals share. */
export const heroDecalTextureSize = 128;

/** Three puffs rising off the mug, each a third of a cycle behind the last. */
export const heroSteam = {
  count: 3,
  /** Where a puff starts: just above the coffee. */
  base: [-0.7, 0.87, 0.2],
  rise: 0.17,
  /** Radius at its largest, midway up. */
  size: 0.02,
  /** Sideways drift, so the column wavers. */
  sway: 0.012,
  /** Cycles per second. */
  rate: 0.28,
  /** Where in the cycle a still frame is taken. */
  restPhase: 0.4,
} as const;

// ── Colour ───────────────────────────────────────────────────────────────

interface IHeroLightColour {
  color: string;
  intensity: number;
}

export interface IHeroPalette {
  tones: Record<HeroTone, string>;
  /** The primary screen's background. It must equal the page's
      `--background`: the hand-off works by filling the frame with it. */
  paper: string;
  /** Terminal text colours, by token kind. */
  ink: Record<HeroTokenKind, string>;
  /** The secondary screen's background; its bars reuse `ink`. */
  editorPaper: string;
  /** Opacity 0 hides the halos: an additive glow on white is invisible. */
  halo: { color: string; opacity: number };
  ground: { color: string; opacity: number };
  steam: { color: string; opacity: number };
  lights: {
    hemisphere: { sky: string; ground: string; intensity: number };
    key: IHeroLightColour;
    screen: IHeroLightColour;
    lamp: IHeroLightColour;
  };
}

/**
 * Both themes. The lit tones are the site's own surface tokens, and the
 * lights are balanced so that a face turned up to the light shows close to
 * its tone, with the faces turned away stepping down from there: that
 * stepping is what gives the flat-shaded shapes their form.
 *
 * Intensities are three's physical units, where a white surface under an
 * intensity of pi reflects full white. Nothing is tone-mapped, so a sum over
 * that simply clips; the values below stay under it.
 */
export const heroPalettes: Record<HeroTheme, IHeroPalette> = {
  dark: {
    tones: {
      floor: "#0d1422",
      wall: "#111a2b",
      rug: "#131d30",
      deskTop: "#1f2a3d",
      deskLeg: "#0d1422",
      bezel: "#05070c",
      keyboard: "#0b1220",
      keycap: "#1e293b",
      hoodie: "#0369a1",
      trousers: "#1e293b",
      chair: "#131d30",
      skin: "#e8b48f",
      hair: "#1c1917",
      shoe: "#94a3b8",
      glass: "#1b3a5c",
      mug: "#94a3b8",
      pot: "#334155",
      leaf: "#047857",
      glowA: "#10b981",
      glowB: "#38bdf8",
    },
    paper: "#090d16",
    ink: {
      text: "#e2e8f0",
      prompt: "#38bdf8",
      success: "#10b981",
      dim: "#64748b",
      accent: "#7dd3fc",
    },
    editorPaper: "#0d1422",
    halo: { color: "#38bdf8", opacity: 0.35 },
    ground: { color: "#05070c", opacity: 0.55 },
    steam: { color: "#e2e8f0", opacity: 0.16 },
    lights: {
      // A dark room still needs bright lights: the tones are already
      // near-black, and a dim light on a dim surface is simply black.
      hemisphere: { sky: "#e2e8f0", ground: "#334155", intensity: 3 },
      key: { color: "#7dd3fc", intensity: 3 },
      screen: { color: "#38bdf8", intensity: 1.2 },
      lamp: { color: "#10b981", intensity: 0.9 },
    },
  },
  light: {
    tones: {
      floor: "#e8edf3",
      wall: "#f1f5f9",
      rug: "#dbe3ec",
      deskTop: "#f8fafc",
      deskLeg: "#94a3b8",
      bezel: "#1e293b",
      keyboard: "#e2e8f0",
      keycap: "#ffffff",
      hoodie: "#0284c7",
      trousers: "#475569",
      chair: "#334155",
      skin: "#e8b48f",
      hair: "#1c1917",
      shoe: "#1e293b",
      glass: "#bae6fd",
      mug: "#0f172a",
      pot: "#94a3b8",
      leaf: "#059669",
      glowA: "#059669",
      glowB: "#0284c7",
    },
    paper: "#ffffff",
    ink: {
      text: "#0f172a",
      prompt: "#0369a1",
      success: "#047857",
      dim: "#64748b",
      accent: "#0284c7",
    },
    editorPaper: "#f8fafc",
    halo: { color: "#38bdf8", opacity: 0 },
    ground: { color: "#475569", opacity: 0.22 },
    steam: { color: "#94a3b8", opacity: 0.22 },
    lights: {
      // Mostly even light from above with a gentle key: the tones are
      // nearly white already, so the walls must stay light, and the step
      // in shade from one face to the next is all that separates the room
      // from a white page.
      hemisphere: { sky: "#ffffff", ground: "#cbd5e1", intensity: 2.2 },
      key: { color: "#fff7ed", intensity: 1 },
      screen: { color: "#38bdf8", intensity: 0.15 },
      lamp: { color: "#10b981", intensity: 0.2 },
    },
  },
};

/**
 * Where the lights stand. Their number is fixed when the scene mounts and
 * only colour and intensity change with the theme: three compiles the light
 * count into every lit shader, so adding or removing one would recompile.
 */
export const heroLights = {
  /** The key light shines from here toward the origin. */
  key: { position: [-2.5, 3, 1.5] },
  /** In front of the two monitors, standing in for their glow. */
  screen: { position: [-0.1, 1.2, 0.35], distance: 2.5 },
  /** Under the floor lamp's shade. */
  lamp: { position: [1.75, 1.35, -1], distance: 2.5 },
  decay: 2,
} as const;

// ── Camera ───────────────────────────────────────────────────────────────

/**
 * One stop on the camera's path, stored as a framing rule rather than a
 * position: look at `centre` from a direction, and stand as far back as it
 * takes for a `size` subject to fill the stated share of the frame. The
 * position falls out per aspect ratio, so a phone and an ultrawide each get
 * the same composition instead of the same coordinates.
 */
export interface IHeroKeyRule {
  /** Scroll progress at which the camera is here. */
  at: number;
  centre: HeroVec3;
  /** Width and height of what must be framed. */
  size: HeroVec2;
  /** Direction the camera stands in, seen from `centre`: degrees round the
      vertical axis from +z, and degrees above the horizon. */
  azimuth: number;
  elevation: number;
  fov: IHeroByAspect;
  frame:
    | {
        /** `contain` keeps the whole subject in view; `cover` fills the
            frame with it and lets the rest spill out. */
        fit: "contain" | "cover";
        /** Share of the frame the subject spans, in the tighter direction. */
        fill: IHeroByAspect;
      }
    | { fit: "fixed"; distance: number };
}

const primary = heroScreens.primary;

/** The last three stops share one line: straight out of the primary glass. */
const onScreenAxis = {
  centre: primary.centre,
  size: primary.size,
  azimuth: primary.yaw,
  elevation: 0,
  fov: { landscape: 36, portrait: 44 },
} as const;

export const heroCamera = {
  near: 0.02,
  far: 30,
  /**
   * Viewports narrower than the first value get the portrait numbers, wider
   * than the second the landscape ones, and in between a blend, so resizing
   * a window never snaps the composition.
   */
  aspectBlend: [0.8, 1.25],
  keys: {
    /** The whole room, from the open left side. */
    wide: {
      at: 0,
      centre: [0, 0.9, 0],
      size: [2.3, 1.6],
      azimuth: -36,
      elevation: 15,
      fov: { landscape: 30, portrait: 38 },
      frame: { fit: "contain", fill: { landscape: 0.62, portrait: 0.92 } },
    },
    /** Beside the avatar's left shoulder, both monitors in view. A phone is
        too narrow to hold them with a margin, so there they span the full
        width instead of pushing the camera back out toward the wide shot. */
    shoulder: {
      at: 0.25,
      centre: [-0.05, 1.12, -0.21],
      size: [1.5, 0.75],
      azimuth: -18,
      elevation: 13,
      fov: { landscape: 33, portrait: 40 },
      frame: { fit: "contain", fill: { landscape: 0.85, portrait: 1 } },
    },
    /** Square on to the terminal, all of it readable. */
    screen: {
      ...onScreenAxis,
      at: 0.5,
      frame: { fit: "contain", fill: { landscape: 0.86, portrait: 0.94 } },
    },
    /** Close enough that the glass covers the frame on any aspect ratio.
        From here on the picture is nothing but screen paper. */
    cover: {
      ...onScreenAxis,
      at: 0.72,
      frame: { fit: "cover", fill: { landscape: 1.12, portrait: 1.12 } },
    },
    /** At the glass. The canvas has faded out before the camera arrives. */
    glass: {
      ...onScreenAxis,
      at: 0.9,
      frame: { fit: "fixed", distance: 0.08 },
    },
  },
  /**
   * Slides the picture inside the frame without turning the camera, so the
   * room sits beside the hero text on a wide screen and below it on a tall
   * one. Landscape is in viewport heights, so an ultrawide does not fling
   * the desk to its far edge; portrait is a share of the height. Both ease
   * to zero over `fade`, leaving the close-up centred.
   */
  shift: { landscape: 0.34, portrait: 0.12, fade: [0.05, 0.4] },
} satisfies {
  near: number;
  far: number;
  aspectBlend: HeroVec2;
  keys: Record<"wide" | "shoulder" | "screen" | "cover" | "glass", IHeroKeyRule>;
  shift: { landscape: number; portrait: number; fade: HeroVec2 };
};

/** How the camera follows the scroll position, and what rides along. */
export const heroRig = {
  /** Longest step the loop will take, so a tab coming back from the
      background eases in instead of leaping. Seconds. */
  maxDelta: 0.1,
  /** A gap this large is a restored scroll position or an anchor jump, not
      a hand on a wheel: the camera cuts to it instead of flying. */
  snapDistance: 0.35,
  /** Closer than this to its goal the camera counts as arrived. */
  settle: 0.0005,
  /** When the scene appears at the top of the page, the camera drifts in
      from this much further back. */
  entrance: { below: 0.05, pullBack: 0.08, duration: 1.2 },
  /**
   * The room leans a little toward the cursor. It is the room that turns,
   * about a point at desk height, not the camera, and the lean is gone by
   * the time the camera is square on to the screen. Radians, per second.
   */
  parallax: { pivot: [0, 0.9, 0], yaw: 0.07, pitch: 0.035, rate: 4, fade: [0.25, 0.5] },
  /** The terminal's text dissolves into its paper across this range. */
  inkFade: [0.6, 0.8],
  /** Then the canvas itself fades, uncovering the page behind it. The next
      section's heading is on screen by now (see `hero-track` in
      `globals.css`), so the frame is never blank paper for long. */
  canvasFade: [0.76, 0.9],
  /** Past this the terminal texture is left alone: it is filling the frame
      and about to dissolve, so a repaint would only cost a hitch. */
  repaintLimit: 0.6,
} as const;

// ── Screen contents ──────────────────────────────────────────────────────

/** The terminal's pixel grid: one character per cell, so the typing mask
    in the shader can hide and show whole cells. */
export interface IHeroTerminalGrid {
  width: number;
  height: number;
  cols: number;
  rows: number;
  /** Top-left corner of the first cell, in pixels. Above it is the tab strip. */
  origin: HeroVec2;
  /** One cell, in pixels. */
  cell: HeroVec2;
  fontSize: number;
  tabFontSize: number;
}

/**
 * The texture is a prop, not page typography, so it uses the system's
 * monospace face: the mask needs a fixed pitch, and a system font means
 * nothing is fetched. Each character is still drawn into its own cell, so
 * the grid holds whatever advance width the face turns out to have.
 */
export const heroTerminalFont =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

/** How the terminal types. Seconds, except the two rates. */
export const heroTyping = {
  charsPerSecond: 24,
  /** Before the first keystroke of a session. */
  startDelay: 0.6,
  /** Before typing begins on a later prompt. */
  promptPause: 0.35,
  /** After a command, before its output starts. */
  commandPause: 0.3,
  /** Between one line of output and the next. */
  outputBeat: 0.2,
  /** A finished session stays up this long before the next replaces it. */
  hold: 2.6,
  /** Caret blinks per second while it waits. */
  blinkRate: 1.25,
} as const;

export type HeroEditorRow = readonly (readonly [kind: HeroTokenKind, length: number])[];

/**
 * The secondary screen: lines of "code" drawn as bars, with no glyphs. Each
 * row is an indent and a run of coloured tokens. The rows fill the texture
 * exactly, so stepping it by one row wraps without a seam.
 */
export const heroEditor = {
  width: 512,
  height: 320,
  /** Pixels per unit of bar length and per indent step. */
  unit: 9,
  gutter: 44,
  /** Seconds between one-row scroll steps. */
  stepSeconds: 0.9,
  rows: [
    [0, [["prompt", 6], ["text", 9], ["dim", 3]]],
    [1, [["accent", 5], ["text", 12]]],
    [1, [["text", 7], ["dim", 2], ["success", 10]]],
    [2, [["prompt", 4], ["text", 6], ["text", 8]]],
    [2, [["dim", 14]]],
    [1, [["text", 3]]],
    [0, []],
    [0, [["prompt", 5], ["accent", 11], ["dim", 2]]],
    [1, [["text", 9], ["success", 6], ["text", 4]]],
    [1, [["prompt", 3], ["text", 15]]],
    [2, [["success", 8], ["dim", 5]]],
    [2, [["text", 5], ["accent", 4], ["text", 9]]],
    [1, [["text", 2]]],
    [0, []],
    [0, [["dim", 18]]],
    [0, [["prompt", 7], ["text", 5], ["success", 7]]],
  ],
} satisfies {
  width: number;
  height: number;
  unit: number;
  gutter: number;
  stepSeconds: number;
  rows: readonly (readonly [indent: number, tokens: HeroEditorRow])[];
};

// ── Devices ──────────────────────────────────────────────────────────────

export interface IHeroTier {
  detail: HeroDetail;
  /** Device-pixel-ratio ceiling. The performance monitor scales below it. */
  maxDpr: number;
  /** MSAA is the costliest renderer option; a phone's dense screen already
      smooths the edges. */
  antialias: boolean;
  /** How fast the camera closes on the scroll position, per second. Touch
      scrolling is already smooth, so it follows more tightly. */
  followRate: number;
  parallax: boolean;
  steam: boolean;
  /** The lamp's point light. Each light is paid for by every lit pixel. */
  lampLight: boolean;
  terminal: IHeroTerminalGrid;
}

/**
 * Touch devices are the ones short of GPU memory and most likely to throttle
 * when warm, so they get a smaller terminal texture, one light fewer, and
 * none of the small parts: keycaps, steam and pointer parallax.
 */
export const heroTiers: Record<HeroDetail, IHeroTier> = {
  fine: {
    detail: "fine",
    maxDpr: 1.5,
    antialias: true,
    followRate: 7,
    parallax: true,
    steam: true,
    lampLight: true,
    terminal: {
      width: 1536,
      height: 960,
      cols: 56,
      rows: 18,
      origin: [64, 124],
      cell: [25.5, 45],
      fontSize: 40,
      tabFontSize: 26,
    },
  },
  coarse: {
    detail: "coarse",
    maxDpr: 1.25,
    antialias: false,
    followRate: 12,
    parallax: false,
    steam: false,
    lampLight: false,
    terminal: {
      width: 1024,
      height: 640,
      cols: 40,
      rows: 14,
      origin: [56, 92],
      cell: [22, 38],
      fontSize: 33,
      tabFontSize: 20,
    },
  },
};

/** Lowest DPR the performance monitor may drop to before it stops scaling. */
export const heroMinDpr = 0.75;

/** Most pixels the canvas may shade per frame: the DPR is capped so that a
    4K window is not asked for a 4K-and-a-half buffer. */
export const heroPixelBudget = 5e6;

/** Sharpest filtering asked of the terminal texture, which is seen at a
    slant for the first half of the journey. */
export const heroAnisotropy = 4;

export const heroPerformance = {
  /** Quality the monitor starts from and steps down by. */
  factor: 1,
  step: 0.25,
  /** Slow reports in a row, with quality already at its floor, before the
      scene is switched off for the session. */
  floorDeclines: 2,
} as const;

/** What the scene must stay under. Checked through the debug handle. */
export const heroBudget = { drawCalls: 8, triangles: 3000, programs: 5 } as const;
