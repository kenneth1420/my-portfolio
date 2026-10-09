import { CatmullRomCurve3, MathUtils, Vector3 } from "three";
import {
  heroCamera,
  type HeroVec2,
  type IHeroByAspect,
  type IHeroKeyRule,
} from "@/src/data/hero.scene";
import { distanceToSolid, type IHeroSolid } from "./hero.geometry";

/**
 * The camera's path through the hero scene, as pure functions of scroll
 * progress and aspect ratio. Nothing here touches a camera or a renderer:
 * `resolveHeroPath` turns the framing rules in `data/hero.scene` into
 * positions for one aspect ratio, and `sampleHeroPath` reads a pose off the
 * result. The render loop calls the second every frame and the first only
 * when the viewport changes shape.
 */

export type HeroFit = "contain" | "cover";

/** One keyframe, resolved to a place for a given aspect ratio. */
export interface IHeroKey {
  at: number;
  position: Vector3;
  target: Vector3;
  fov: number;
}

export interface IHeroPath {
  aspect: number;
  keys: Record<keyof typeof heroCamera.keys, IHeroKey>;
  /** Smooth curves through the first three keys: where the camera is, and
      where it looks. */
  approach: CatmullRomCurve3;
  gaze: CatmullRomCurve3;
  /** How far the picture is slid inside the frame at the top of the page,
      as fractions of the viewport's width and height. */
  shiftX: number;
  shiftY: number;
}

export interface IHeroPose {
  position: Vector3;
  target: Vector3;
  fov: number;
  shiftX: number;
  shiftY: number;
}

export const createHeroPose = (): IHeroPose => ({
  position: new Vector3(),
  target: new Vector3(),
  fov: heroCamera.keys.wide.fov.landscape,
  shiftX: 0,
  shiftY: 0,
});

/**
 * How far back a camera must stand for a subject to span `fill` of the
 * frame. `contain` takes the farther of the two distances that fit its
 * height and its width, so all of it is in view; `cover` takes the nearer,
 * so it fills the frame and the excess spills out of the other direction.
 */
export function fitDistance(
  size: HeroVec2,
  fov: number,
  aspect: number,
  fill: number,
  mode: HeroFit,
) {
  const halfHeight = Math.tan(MathUtils.degToRad(fov) / 2);
  const byHeight = size[1] / (2 * halfHeight * fill);
  const byWidth = size[0] / (2 * halfHeight * aspect * fill);
  return mode === "contain" ? Math.max(byHeight, byWidth) : Math.min(byHeight, byWidth);
}

const blend = (value: IHeroByAspect, wide: number) =>
  MathUtils.lerp(value.portrait, value.landscape, wide);

function resolveKey(rule: IHeroKeyRule, aspect: number, wide: number): IHeroKey {
  const fov = blend(rule.fov, wide);
  const distance =
    rule.frame.fit === "fixed"
      ? rule.frame.distance
      : fitDistance(rule.size, fov, aspect, blend(rule.frame.fill, wide), rule.frame.fit);

  const azimuth = MathUtils.degToRad(rule.azimuth);
  const elevation = MathUtils.degToRad(rule.elevation);
  const target = new Vector3(...rule.centre);
  const position = new Vector3(
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
    Math.cos(azimuth) * Math.cos(elevation),
  )
    .multiplyScalar(distance)
    .add(target);

  return { at: rule.at, position, target, fov };
}

/** Resolves every keyframe rule for one aspect ratio. Allocates, so call it
    when the viewport changes shape, not per frame. */
export function resolveHeroPath(aspect: number): IHeroPath {
  const [portraitEdge, landscapeEdge] = heroCamera.aspectBlend;
  const wide = MathUtils.smoothstep(aspect, portraitEdge, landscapeEdge);
  const rules = heroCamera.keys;

  const keys = {
    wide: resolveKey(rules.wide, aspect, wide),
    shoulder: resolveKey(rules.shoulder, aspect, wide),
    screen: resolveKey(rules.screen, aspect, wide),
    cover: resolveKey(rules.cover, aspect, wide),
    glass: resolveKey(rules.glass, aspect, wide),
  };

  const through = [keys.wide, keys.shoulder, keys.screen];

  return {
    aspect,
    keys,
    // Centripetal, so the curve does not loop or bulge between keys that
    // sit at very different distances from each other.
    approach: new CatmullRomCurve3(
      through.map((key) => key.position),
      false,
      "centripetal",
    ),
    gaze: new CatmullRomCurve3(
      through.map((key) => key.target),
      false,
      "centripetal",
    ),
    // The landscape shift is stated in viewport heights; dividing by the
    // aspect ratio turns it into the share of the width the camera needs.
    shiftX: (heroCamera.shift.landscape * wide) / aspect,
    shiftY: heroCamera.shift.portrait * (1 - wide),
  };
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeInOutSine = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;
const easeInQuad = (t: number) => t * t;

const span = (value: number, from: number, to: number) =>
  MathUtils.clamp((value - from) / (to - from), 0, 1);

/**
 * Writes the camera pose for scroll progress `p` into `out` and returns it.
 * Allocates nothing.
 *
 * The journey has three movements. Up to the screen keyframe the camera
 * sweeps along a curve from the wide shot past the avatar's shoulder, eased
 * so it leaves and arrives gently. It then pushes straight in until the
 * glass covers the frame, and from there accelerates to the glass itself,
 * by which point the canvas has faded out.
 */
export function sampleHeroPath(path: IHeroPath, p: number, out: IHeroPose): IHeroPose {
  const { wide, shoulder, screen, cover, glass } = path.keys;

  if (p <= screen.at) {
    // The curve gives each of its two segments half its length, so progress
    // is first mapped to put the shoulder key at the halfway mark.
    const linear =
      p <= shoulder.at
        ? span(p, wide.at, shoulder.at) / 2
        : 0.5 + span(p, shoulder.at, screen.at) / 2;
    const eased = easeInOutCubic(linear);

    path.approach.getPoint(eased, out.position);
    path.gaze.getPoint(eased, out.target);
    out.fov =
      eased <= 0.5
        ? MathUtils.lerp(wide.fov, shoulder.fov, eased * 2)
        : MathUtils.lerp(shoulder.fov, screen.fov, eased * 2 - 1);
  } else {
    const closing = p <= cover.at;
    const from = closing ? screen : cover;
    const to = closing ? cover : glass;
    const amount = closing
      ? easeInOutSine(span(p, screen.at, cover.at))
      : easeInQuad(span(p, cover.at, glass.at));

    out.position.lerpVectors(from.position, to.position, amount);
    out.target.lerpVectors(from.target, to.target, amount);
    out.fov = MathUtils.lerp(from.fov, to.fov, amount);
  }

  const [fadeFrom, fadeTo] = heroCamera.shift.fade;
  const shift = 1 - MathUtils.smoothstep(p, fadeFrom, fadeTo);
  out.shiftX = path.shiftX * shift;
  out.shiftY = path.shiftY * shift;

  return out;
}

/**
 * The closest the camera comes to anything solid along the whole path, for
 * the aspect ratio the path was resolved at. The primary monitor is left
 * out: arriving at its glass is the point of the journey.
 */
export function measureHeroClearance(
  path: IHeroPath,
  solids: readonly IHeroSolid[],
  steps = 200,
) {
  const pose = createHeroPose();
  let nearest = Number.POSITIVE_INFINITY;

  for (let i = 0; i <= steps; i++) {
    sampleHeroPath(path, i / steps, pose);
    for (const solid of solids) {
      if (!solid.blocks) continue;
      nearest = Math.min(nearest, distanceToSolid(pose.position, solid));
    }
  }

  return nearest;
}
