/**
 * Layouts for the background's sky: the constellation globe, the star field
 * behind it, and the star dust around everything. Like `hero.geometry`, nothing here touches the DOM or a
 * renderer: the functions take numbers and return typed arrays, so they can
 * be exercised without a browser.
 */

type TintWeights = readonly [number, number, number];

interface ISphereOptions {
  /** How many stars. */
  count: number;
  radius: number;
  /** Random offset from the even spread, as a share of the radius. */
  jitter: number;
  /** How often each of the three star colours is picked. */
  tintWeights: TintWeights;
  seed: number;
}

interface IFieldOptions {
  /** How many stars. */
  count: number;
  /** Half the field's width, height and depth, in world units. */
  extent: readonly [x: number, y: number, z: number];
  /** Links per star, at most, to its nearest neighbours. */
  neighbours: number;
  /** Stars further apart than this are never linked, so the field breaks
      into separate figures instead of one web. */
  maxLink: number;
  /** Star sizes are picked between these, as multiples of the base size. */
  sizeRange: readonly [min: number, max: number];
  tintWeights: TintWeights;
  seed: number;
}

export interface ISceneConstellation {
  /** x, y, z per star. */
  stars: Float32Array;
  /** Per star: 0, 1 or 2, which of the palette's colours it takes. */
  tints: Float32Array;
  /** Per star: its own index, which seeds per-star motion in the shaders. */
  indices: Float32Array;
  /** Per star: a size multiple. */
  sizes: Float32Array;
  /** Two endpoints per link, x, y, z each. */
  segments: Float32Array;
}

/** Stars without links, for a layout whose links are formed as it runs. */
export type IConstellationStars = Omit<ISceneConstellation, "segments">;

/** Golden angle in radians: consecutive stars turn by it around the axis. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * mulberry32: a tiny seeded generator. The same seed gives the same sky on
 * every load, so the layout never reshuffles between visits or re-renders.
 */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickTint(roll: number, [first, second, third]: TintWeights) {
  const total = first + second + third;
  if (roll * total < first) return 0;
  if (roll * total < first + second) return 1;
  return 2;
}

/**
 * Links every star to its nearest neighbours, skipping any further than
 * `maxLink`. A link two stars both choose is kept once, so no line is drawn
 * twice over itself.
 */
function linkNearest(stars: Float32Array, neighbours: number, maxLink: number) {
  const count = stars.length / 3;
  const maxDistance = maxLink * maxLink;
  const links = new Set<number>();
  const distances: { index: number; distance: number }[] = [];

  for (let i = 0; i < count; i++) {
    distances.length = 0;
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      const dx = stars[i * 3] - stars[j * 3];
      const dy = stars[i * 3 + 1] - stars[j * 3 + 1];
      const dz = stars[i * 3 + 2] - stars[j * 3 + 2];
      const distance = dx * dx + dy * dy + dz * dz;
      if (distance <= maxDistance) distances.push({ index: j, distance });
    }
    distances.sort((a, b) => a.distance - b.distance);

    for (const { index } of distances.slice(0, neighbours)) {
      // Keyed low index first, so a link both stars choose collides.
      links.add(Math.min(i, index) * count + Math.max(i, index));
    }
  }

  const segments = new Float32Array(links.size * 6);
  let link = 0;

  for (const key of links) {
    const from = Math.floor(key / count);
    const to = key % count;
    segments.set(stars.subarray(from * 3, from * 3 + 3), link * 6);
    segments.set(stars.subarray(to * 3, to * 3 + 3), link * 6 + 3);
    link++;
  }

  return { segments };
}

/** Each star's own index, 0 to count - 1. */
function sequence(count: number) {
  return Float32Array.from({ length: count }, (_, i) => i);
}

/**
 * Spreads the stars evenly over a sphere (a Fibonacci lattice) and nudges
 * each off the even spread a little. Its links move with the stars, so they
 * are formed as it runs, by `relink`.
 */
export function buildConstellation({
  count,
  radius,
  jitter,
  tintWeights,
  seed,
}: ISphereOptions): IConstellationStars {
  const random = createRandom(seed);
  const stars = new Float32Array(count * 3);
  const tints = new Float32Array(count);
  const offset = radius * jitter;

  for (let i = 0; i < count; i++) {
    // y runs from the top pole to the bottom; each ring is as wide as the
    // sphere is at that height.
    const y = count > 1 ? 1 - (i / (count - 1)) * 2 : 0;
    const ring = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * i;

    stars[i * 3] = Math.cos(theta) * ring * radius + (random() - 0.5) * offset;
    stars[i * 3 + 1] = y * radius + (random() - 0.5) * offset;
    stars[i * 3 + 2] = Math.sin(theta) * ring * radius + (random() - 0.5) * offset;
    tints[i] = pickTint(random(), tintWeights);
  }

  return {
    stars,
    tints,
    indices: sequence(count),
    sizes: new Float32Array(count).fill(1),
  };
}

/**
 * Scatters the stars through a box and links each to its nearest neighbours
 * within reach. Random placement clumps on its own, so the capped links
 * gather into chains and small figures with open sky between them, the way
 * real constellations do.
 */
export function buildStarField({
  count,
  extent: [halfX, halfY, halfZ],
  neighbours,
  maxLink,
  sizeRange: [minSize, maxSize],
  tintWeights,
  seed,
}: IFieldOptions): ISceneConstellation {
  const random = createRandom(seed);
  const stars = new Float32Array(count * 3);
  const tints = new Float32Array(count);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    stars[i * 3] = (random() * 2 - 1) * halfX;
    stars[i * 3 + 1] = (random() * 2 - 1) * halfY;
    stars[i * 3 + 2] = (random() * 2 - 1) * halfZ;
    tints[i] = pickTint(random(), tintWeights);
    // Squared, so most stars are small and a few stand out.
    sizes[i] = minSize + (maxSize - minSize) * random() ** 2;
  }

  return {
    stars,
    tints,
    indices: sequence(count),
    sizes,
    ...linkNearest(stars, neighbours, maxLink),
  };
}

/**
 * Scatters star dust through a cube centred on the origin: x, y, z per
 * speck. No links, colours or sizes; the dust is one faint layer.
 */
export function buildStarDust(count: number, halfExtent: number, seed: number) {
  const random = createRandom(seed);
  return Float32Array.from({ length: count * 3 }, () => (random() * 2 - 1) * halfExtent);
}

/** Reusable buffers for `relink`, so re-forming the links allocates nothing. */
export interface IRelinkBuffers {
  /** Two endpoints per link, x, y, z each. Sized for the most links possible. */
  segments: Float32Array;
  /** Per link endpoint: the glow of the star it ends on. */
  glow: Float32Array;
  /** One flag per pair of stars, so a link two stars both choose is kept once. */
  seen: Uint8Array;
  /** The nearest stars found so far for the star being linked. */
  nearest: Int32Array;
  distances: Float64Array;
}

export function createRelinkBuffers(count: number, neighbours: number): IRelinkBuffers {
  return {
    segments: new Float32Array(count * neighbours * 6),
    glow: new Float32Array(count * neighbours * 2),
    seen: new Uint8Array(count * count),
    nearest: new Int32Array(neighbours),
    distances: new Float64Array(neighbours),
  };
}

/**
 * Re-forms the links for stars that have moved: each star to its nearest
 * neighbours where they are now. Writes into `buffers` and returns how many
 * links it wrote. Cheap enough to run every frame for under a hundred stars,
 * and allocates nothing, so it never triggers garbage collection mid-motion.
 */
export function relink(
  stars: Float32Array,
  starGlow: Float32Array,
  buffers: IRelinkBuffers,
) {
  const { segments, glow, seen, nearest, distances } = buffers;
  const count = starGlow.length;
  const neighbours = nearest.length;
  let links = 0;
  seen.fill(0);

  for (let i = 0; i < count; i++) {
    distances.fill(Infinity);
    nearest.fill(-1);

    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      const dx = stars[i * 3] - stars[j * 3];
      const dy = stars[i * 3 + 1] - stars[j * 3 + 1];
      const dz = stars[i * 3 + 2] - stars[j * 3 + 2];
      const distance = dx * dx + dy * dy + dz * dz;
      if (distance >= distances[neighbours - 1]) continue;

      // Insertion into the short sorted list of the nearest so far.
      let k = neighbours - 1;
      while (k > 0 && distances[k - 1] > distance) {
        distances[k] = distances[k - 1];
        nearest[k] = nearest[k - 1];
        k--;
      }
      distances[k] = distance;
      nearest[k] = j;
    }

    for (let k = 0; k < neighbours; k++) {
      const j = nearest[k];
      if (j < 0) continue;
      const key = Math.min(i, j) * count + Math.max(i, j);
      if (seen[key]) continue;
      seen[key] = 1;

      segments.set(stars.subarray(i * 3, i * 3 + 3), links * 6);
      segments.set(stars.subarray(j * 3, j * 3 + 3), links * 6 + 3);
      glow[links * 2] = starGlow[i];
      glow[links * 2 + 1] = starGlow[j];
      links++;
    }
  }

  return links;
}
