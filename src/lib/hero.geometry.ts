import { Color, Euler, MathUtils, Matrix4, Quaternion, Vector3 } from "three";
import type {
  HeroDetail,
  HeroLayer,
  HeroTone,
  HeroVec3,
  IHeroDecal,
  IHeroGroup,
  IHeroPart,
} from "@/src/data/hero.scene";

/**
 * Turns the part list in `data/hero.scene` into vertex buffers. Nothing here
 * touches the DOM or a renderer: the functions take data and return typed
 * arrays, so they can be exercised without a browser.
 *
 * Every solid is built with its corners shared between faces: eight vertices
 * for a box, not twenty-four. The scene is flat-shaded, which derives each
 * face's normal per pixel, so the faces need no normals of their own, and a
 * part is one colour, so its corners can carry it.
 */

/** A part resolved into the room's space, ready to build or to measure. */
export interface IHeroSolid {
  tone: HeroTone;
  layer: HeroLayer;
  /** False when the camera is allowed to come close. */
  blocks: boolean;
  /** The solid's own frame into room space. */
  matrix: Matrix4;
  inverse: Matrix4;
  /** Half the solid's extent along its own axes. */
  half: Vector3;
  /** Set for cylinders and cones, whose length runs along their own y. */
  prism?: { bottom: number; top: number; sides: number };
}

/** The vertices one part owns, so a theme change can recolour just those. */
export interface IHeroRange {
  tone: HeroTone;
  start: number;
  count: number;
}

export interface IHeroMesh {
  positions: Float32Array;
  colors: Float32Array;
  indices: Uint16Array;
  ranges: IHeroRange[];
}

export interface IHeroQuads {
  positions: Float32Array;
  uvs: Float32Array;
  indices: Uint16Array;
}

const UP = new Vector3(0, 1, 0);
const UNIT = new Vector3(1, 1, 1);
const NO_OFFSET: HeroVec3 = [0, 0, 0];

function placeMatrix(at: HeroVec3 = NO_OFFSET, turn: HeroVec3 = NO_OFFSET) {
  const rotation = new Quaternion().setFromEuler(
    new Euler(
      MathUtils.degToRad(turn[0]),
      MathUtils.degToRad(turn[1]),
      MathUtils.degToRad(turn[2]),
    ),
  );
  return new Matrix4().compose(new Vector3(...at), rotation, UNIT);
}

/** A frame centred between two points with its y axis running from one to
    the other, plus the distance between them. */
function spanMatrix(from: HeroVec3, to: HeroVec3) {
  const start = new Vector3(...from);
  const axis = new Vector3(...to).sub(start);
  const length = axis.length();
  const rotation = new Quaternion().setFromUnitVectors(UP, axis.clone().normalize());
  const centre = start.addScaledVector(axis, 0.5);

  return { matrix: new Matrix4().compose(centre, rotation, UNIT), length };
}

function resolvePart(part: IHeroPart, parent: Matrix4, blocks: boolean): IHeroSolid {
  let local: Matrix4;
  let half: Vector3;
  let prism: IHeroSolid["prism"];

  if (part.shape === "box") {
    local = placeMatrix(part.at, part.turn);
    half = new Vector3(...part.size).multiplyScalar(0.5);
  } else if (part.shape === "beam") {
    const span = spanMatrix(part.from, part.to);
    local = span.matrix;
    half = new Vector3(part.width / 2, span.length / 2, part.depth / 2);
  } else {
    const span = spanMatrix(part.from, part.to);
    const [bottom, top] = part.radius;
    const reach = Math.max(bottom, top);
    local = span.matrix;
    half = new Vector3(reach, span.length / 2, reach);
    prism = { bottom, top, sides: part.sides };
  }

  const matrix = parent.clone().multiply(local);

  return {
    tone: part.tone,
    layer: part.layer ?? "set",
    blocks,
    matrix,
    inverse: matrix.clone().invert(),
    half,
    prism,
  };
}

/**
 * Flattens the groups into solids in room space, leaving out the parts a
 * coarse device does not build.
 */
export function resolveHeroSolids(
  groups: readonly IHeroGroup[],
  detail: HeroDetail,
): IHeroSolid[] {
  const solids: IHeroSolid[] = [];

  for (const group of groups) {
    const parent = placeMatrix(group.at, group.turn);
    for (const part of group.parts) {
      if (part.detail === "fine" && detail !== "fine") continue;
      solids.push(resolvePart(part, parent, group.blocks ?? true));
    }
  }

  return solids;
}

// A box's corners, numbered so that bit 0 is +x, bit 1 is +y and bit 2 is
// +z, and its twelve triangles wound anticlockwise seen from outside.
const BOX_INDICES = [
  4, 5, 7, 4, 7, 6, // +z
  1, 0, 2, 1, 2, 3, // -z
  5, 1, 3, 5, 3, 7, // +x
  0, 4, 6, 0, 6, 2, // -x
  6, 7, 3, 6, 3, 2, // +y
  0, 1, 5, 0, 5, 4, // -y
];

const ringSize = (radius: number, sides: number) => (radius > 0 ? sides : 1);

function countVertices(solid: IHeroSolid) {
  if (!solid.prism) return 8;
  const { bottom, top, sides } = solid.prism;
  return ringSize(bottom, sides) + ringSize(top, sides);
}

function countIndices(solid: IHeroSolid) {
  if (!solid.prism) return BOX_INDICES.length;
  const { bottom, top, sides } = solid.prism;
  // A full side is two triangles, a side meeting a point is one, and each
  // open end is closed with a fan.
  const wall = bottom > 0 && top > 0 ? sides * 6 : sides * 3;
  const caps = (bottom > 0 ? 1 : 0) + (top > 0 ? 1 : 0);
  return wall + caps * (sides - 2) * 3;
}

const corner = new Vector3();

function writeVertex(
  positions: Float32Array,
  index: number,
  matrix: Matrix4,
  x: number,
  y: number,
  z: number,
) {
  corner.set(x, y, z).applyMatrix4(matrix);
  positions[index * 3] = corner.x;
  positions[index * 3 + 1] = corner.y;
  positions[index * 3 + 2] = corner.z;
}

function writeBox(
  solid: IHeroSolid,
  positions: Float32Array,
  indices: Uint16Array,
  vertex: number,
  index: number,
) {
  const { x, y, z } = solid.half;
  for (let i = 0; i < 8; i++) {
    writeVertex(
      positions,
      vertex + i,
      solid.matrix,
      i & 1 ? x : -x,
      i & 2 ? y : -y,
      i & 4 ? z : -z,
    );
  }
  for (let i = 0; i < BOX_INDICES.length; i++) {
    indices[index + i] = vertex + BOX_INDICES[i];
  }
}

function writePrism(
  solid: IHeroSolid,
  prism: NonNullable<IHeroSolid["prism"]>,
  positions: Float32Array,
  indices: Uint16Array,
  vertex: number,
  index: number,
) {
  const { bottom, top, sides } = prism;
  const halfLength = solid.half.y;
  const bottomSize = ringSize(bottom, sides);
  const lower = vertex;
  const upper = vertex + bottomSize;

  // Going round by increasing angle is anticlockwise seen from above.
  const writeRing = (first: number, radius: number, y: number) => {
    if (radius <= 0) {
      writeVertex(positions, first, solid.matrix, 0, y, 0);
      return;
    }
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      writeVertex(
        positions,
        first + i,
        solid.matrix,
        Math.sin(angle) * radius,
        y,
        Math.cos(angle) * radius,
      );
    }
  };

  writeRing(lower, bottom, -halfLength);
  writeRing(upper, top, halfLength);

  let cursor = index;
  const push = (a: number, b: number, c: number) => {
    indices[cursor++] = a;
    indices[cursor++] = b;
    indices[cursor++] = c;
  };

  for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    if (bottom > 0 && top > 0) {
      push(lower + i, lower + next, upper + next);
      push(lower + i, upper + next, upper + i);
    } else if (bottom > 0) {
      push(lower + i, lower + next, upper);
    } else {
      push(lower, upper + next, upper + i);
    }
  }

  for (let i = 1; i < sides - 1; i++) {
    if (top > 0) push(upper, upper + i, upper + i + 1);
    if (bottom > 0) push(lower, lower + i + 1, lower + i);
  }
}

/**
 * Merges every solid on one layer into a single indexed mesh, and records
 * which vertices belong to which tone. The colours are left for
 * `applyHeroPalette` to fill.
 */
export function buildHeroMesh(solids: readonly IHeroSolid[], layer: HeroLayer): IHeroMesh {
  const members = solids.filter((solid) => solid.layer === layer);
  const vertexCount = members.reduce((sum, solid) => sum + countVertices(solid), 0);
  const indexCount = members.reduce((sum, solid) => sum + countIndices(solid), 0);

  const positions = new Float32Array(vertexCount * 3);
  const indices = new Uint16Array(indexCount);
  const ranges: IHeroRange[] = [];

  let vertex = 0;
  let index = 0;

  for (const solid of members) {
    const count = countVertices(solid);
    if (solid.prism) writePrism(solid, solid.prism, positions, indices, vertex, index);
    else writeBox(solid, positions, indices, vertex, index);

    ranges.push({ tone: solid.tone, start: vertex, count });
    vertex += count;
    index += countIndices(solid);
  }

  return { positions, colors: new Float32Array(vertexCount * 3), indices, ranges };
}

const swatch = new Color();

/**
 * Writes a theme's colours over a mesh's vertex colours, part by part. The
 * geometry is untouched, so switching theme costs one small buffer upload
 * and no shader work.
 */
export function applyHeroPalette(
  colors: Float32Array,
  ranges: readonly IHeroRange[],
  tones: Record<HeroTone, string>,
) {
  for (const { tone, start, count } of ranges) {
    // Vertex colours are read as linear light; `set` converts from the hex.
    swatch.set(tones[tone]);
    for (let i = start; i < start + count; i++) {
      colors[i * 3] = swatch.r;
      colors[i * 3 + 1] = swatch.g;
      colors[i * 3 + 2] = swatch.b;
    }
  }
}

/**
 * Builds flat textured quads into one mesh: two triangles each, with the
 * whole texture mapped across. Used for the monitors' halos and the shadow
 * on the floor, so that several of them cost a single draw call.
 */
export function buildHeroQuads(decals: readonly IHeroDecal[]): IHeroQuads {
  const positions = new Float32Array(decals.length * 12);
  const uvs = new Float32Array(decals.length * 8);
  const indices = new Uint16Array(decals.length * 6);

  decals.forEach((decal, i) => {
    const matrix = placeMatrix(decal.at, decal.turn);
    const halfWidth = decal.size[0] / 2;
    const halfHeight = decal.size[1] / 2;
    const first = i * 4;

    for (let v = 0; v < 4; v++) {
      const right = v === 1 || v === 2;
      const upper = v >= 2;
      writeVertex(
        positions,
        first + v,
        matrix,
        right ? halfWidth : -halfWidth,
        upper ? halfHeight : -halfHeight,
        0,
      );
      uvs[(first + v) * 2] = right ? 1 : 0;
      uvs[(first + v) * 2 + 1] = upper ? 1 : 0;
    }

    indices.set([first, first + 1, first + 2, first, first + 2, first + 3], i * 6);
  });

  return { positions, uvs, indices };
}

const probe = new Vector3();

/**
 * Distance from a point in room space to a solid, zero if it is inside.
 * Cylinders and cones are measured as the box around them, which only ever
 * errs on the near side.
 */
export function distanceToSolid(point: Vector3, solid: IHeroSolid) {
  probe.copy(point).applyMatrix4(solid.inverse);
  const dx = Math.max(Math.abs(probe.x) - solid.half.x, 0);
  const dy = Math.max(Math.abs(probe.y) - solid.half.y, 0);
  const dz = Math.max(Math.abs(probe.z) - solid.half.z, 0);
  return Math.hypot(dx, dy, dz);
}
