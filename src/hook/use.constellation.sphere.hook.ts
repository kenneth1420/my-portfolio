import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  type Camera,
  Color,
  DynamicDrawUsage,
  type Group,
  MathUtils,
  NormalBlending,
  PerspectiveCamera,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from "three";
import {
  globeLinkVertex,
  globeStarFragment,
  globeStarVertex,
  linkFragment,
} from "@/src/components/scene/constellation.shaders";
import type { ISceneDensity, IScenePalette } from "@/src/data/scene";
import { sceneConstellation } from "@/src/data/scene";
import {
  buildConstellation,
  createRelinkBuffers,
  type IConstellationStars,
  type IRelinkBuffers,
  relink,
} from "@/src/lib/scene.constellation";
import { damp } from "@/src/lib/utils";
import { type IScenePointer, useScenePointer } from "./use.scene.pointer.hook";

interface IUseConstellationSphereOptions {
  palette: IScenePalette;
  density: ISceneDensity;
  reducedMotion: boolean;
}

type ConstellationUniforms = ReturnType<typeof createUniforms>;

/** The spin and the eased lean, kept apart so the lean can relax to zero. */
interface ISphereMotion {
  spinX: number;
  spinY: number;
  tiltX: number;
  tiltY: number;
}

/**
 * Where every star is and how it is moving, in the globe's own space. The
 * typed arrays are the GPU buffers themselves: `positions` and `glow` feed
 * the stars, `links` feeds the lines, and each frame rewrites them in place.
 */
interface ISweepState {
  home: Float32Array;
  offset: Float32Array;
  velocity: Float32Array;
  positions: Float32Array;
  glow: Float32Array;
  links: IRelinkBuffers;
  /** The cursor last frame, in NDC, to measure how far it moved. */
  lastX: number;
  lastY: number;
  hadPointer: boolean;
  /** Something is out of place, so the links must be re-formed. */
  unsettled: boolean;
}

const CENTER = new Vector3(...sceneConstellation.center);
/** Below this, a star counts as home and at rest. */
const SETTLED = 1e-4;

// Scratch objects for the render loop, so no frame allocates.
const star = new Vector3();
const right = new Vector3();
const up = new Vector3();
const forward = new Vector3();
const push = new Vector3();
const toLocal = new Quaternion();

function createUniforms() {
  return {
    uTime: { value: 0 },
    uTwinkleRate: { value: sceneConstellation.twinkleRate },
    uSize: { value: sceneConstellation.starSize },
    uPixelRatio: { value: 1 },
    uStarOpacity: { value: 1 },
    uTint0: { value: new Color() },
    uTint1: { value: new Color() },
    uTint2: { value: new Color() },
    uAccent: { value: new Color() },
    uLine: { value: new Color() },
    uLineOpacity: { value: 1 },
    uCenter: { value: CENTER.clone() },
    uBackFade: { value: sceneConstellation.backFade },
  };
}

function createSweepState({ stars, tints }: IConstellationStars): ISweepState {
  return {
    home: stars,
    offset: new Float32Array(stars.length),
    velocity: new Float32Array(stars.length),
    positions: stars.slice(),
    glow: new Float32Array(tints.length),
    links: createRelinkBuffers(tints.length, sceneConstellation.neighbours),
    lastX: 0,
    lastY: 0,
    hadPointer: false,
    // Starts unsettled so the first frame forms the links.
    unsettled: true,
  };
}

function dynamicAttribute(array: Float32Array, itemSize: number) {
  return new BufferAttribute(array, itemSize).setUsage(DynamicDrawUsage);
}

function createStarGeometry(
  { tints, indices }: IConstellationStars,
  sweep: ISweepState,
) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", dynamicAttribute(sweep.positions, 3));
  geometry.setAttribute("aGlow", dynamicAttribute(sweep.glow, 1));
  geometry.setAttribute("aTint", new BufferAttribute(tints, 1));
  geometry.setAttribute("aIndex", new BufferAttribute(indices, 1));
  return geometry;
}

/** Sized for the most links possible; the draw range shows the ones in use. */
function createLinkGeometry(sweep: ISweepState) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", dynamicAttribute(sweep.links.segments, 3));
  geometry.setAttribute("aGlow", dynamicAttribute(sweep.links.glow, 1));
  geometry.setDrawRange(0, 0);
  return geometry;
}

function createMaterial(
  uniforms: ConstellationUniforms,
  vertexShader: string,
  fragmentShader: string,
) {
  return new ShaderMaterial({
    // The same object for both materials, not copies: one write per frame
    // reaches the stars and the links alike, and so do theme changes.
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    // Faint marks that rarely overlap, blended in draw order.
    depthWrite: false,
  });
}

function applyPalette(
  materials: readonly ShaderMaterial[],
  uniforms: ConstellationUniforms,
  palette: IScenePalette,
) {
  uniforms.uTint0.value.set(palette.stars[0]);
  uniforms.uTint1.value.set(palette.stars[1]);
  uniforms.uTint2.value.set(palette.stars[2]);
  uniforms.uAccent.value.set(palette.accent);
  uniforms.uStarOpacity.value = palette.starOpacity;
  uniforms.uLine.value.set(palette.line);
  uniforms.uLineOpacity.value = palette.lineOpacity;

  for (const material of materials) {
    material.blending = palette.additive ? AdditiveBlending : NormalBlending;
  }
}

/** Tangent of half the camera's vertical field of view. */
function halfFovTangent(camera: Camera) {
  return camera instanceof PerspectiveCamera
    ? Math.tan(MathUtils.degToRad(camera.fov / 2))
    : 1;
}

interface ISweepInput {
  sweep: ISweepState;
  group: Group;
  camera: Camera;
  /** How far the cursor moved this frame, in NDC. */
  moveX: number;
  moveY: number;
  pointer: IScenePointer;
  width: number;
  height: number;
  delta: number;
}

/**
 * Carries the stars near the cursor along the way it moved, then lets every
 * star's spring draw it back home. The cursor's movement is turned into a
 * world-space move at each star's own depth, so a star under the cursor
 * keeps pace with it on screen whether it is near or far, then into the
 * globe's own space, so the push survives the globe's spin.
 */
function advanceSweep({
  sweep,
  group,
  camera,
  moveX,
  moveY,
  pointer,
  width,
  height,
  delta,
}: ISweepInput) {
  const { sweepRadius, carry, fling, stiffness, damping, maxOffset, glowAt } =
    sceneConstellation;
  const { home, offset, velocity, positions, glow } = sweep;
  const count = glow.length;
  const moved = moveX !== 0 || moveY !== 0;

  if (moved) {
    const tangent = halfFovTangent(camera);
    const aspect = width / Math.max(height, 1);
    right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    toLocal.copy(group.quaternion).invert();
    const scale = group.scale.x;

    for (let i = 0; i < count; i++) {
      star.fromArray(positions, i * 3).applyMatrix4(group.matrixWorld);
      const depth = push.copy(star).sub(camera.position).dot(forward);
      star.project(camera);

      const dx = ((star.x - pointer.x) * width) / 2;
      const dy = ((star.y - pointer.y) * height) / 2;
      const reach = 1 - Math.hypot(dx, dy) / sweepRadius;
      if (reach <= 0) continue;
      // Squared, so the pull fades smoothly to nothing at the edge.
      const pull = reach * reach;

      push
        .copy(right)
        .multiplyScalar(moveX * depth * tangent * aspect)
        .addScaledVector(up, moveY * depth * tangent)
        .applyQuaternion(toLocal)
        .divideScalar(scale);

      for (let axis = 0; axis < 3; axis++) {
        const step = push.getComponent(axis) * pull;
        offset[i * 3 + axis] += step * carry;
        // Floored, so one unusually short frame cannot fling a star away.
        velocity[i * 3 + axis] += (step * fling) / Math.max(delta, 1 / 120);
      }
    }
  }

  let unsettled = false;

  for (let i = 0; i < count; i++) {
    let length = 0;
    let speed = 0;
    for (let axis = 0; axis < 3; axis++) {
      const at = i * 3 + axis;
      velocity[at] += (-stiffness * offset[at] - damping * velocity[at]) * delta;
      offset[at] += velocity[at] * delta;
      length += offset[at] * offset[at];
      speed += velocity[at] * velocity[at];
    }

    length = Math.sqrt(length);
    if (length > maxOffset) {
      for (let axis = 0; axis < 3; axis++) offset[i * 3 + axis] *= maxOffset / length;
      length = maxOffset;
    }

    for (let axis = 0; axis < 3; axis++) {
      positions[i * 3 + axis] = home[i * 3 + axis] + offset[i * 3 + axis];
    }
    glow[i] = Math.min(length / glowAt, 1);

    if (length > SETTLED || speed > SETTLED * SETTLED) unsettled = true;
  }

  return unsettled;
}

/** Every star home and at rest. */
function resetSweep(sweep: ISweepState) {
  sweep.positions.set(sweep.home);
  sweep.offset.fill(0);
  sweep.velocity.fill(0);
  sweep.glow.fill(0);
  sweep.unsettled = false;
}

interface IFrameInput {
  group: Group | null;
  uniforms: ConstellationUniforms;
  motion: ISphereMotion;
  sweep: ISweepState;
  starGeometry: BufferGeometry;
  linkGeometry: BufferGeometry;
  pointer: IScenePointer;
  camera: Camera;
  width: number;
  height: number;
  pixelRatio: number;
  elapsed: number;
  delta: number;
  reducedMotion: boolean;
}

/**
 * One render-loop step: spin the globe and lean it toward the cursor, size
 * it to the viewport, sweep the stars, and re-form the links while anything
 * is out of place. A plain function rather than inline in `useFrame`
 * because it mutates objects the hook owns, which the React Compiler lint
 * rules forbid inside the hook body itself.
 */
function advanceFrame({
  group,
  uniforms,
  motion,
  sweep,
  starGeometry,
  linkGeometry,
  pointer,
  camera,
  width,
  height,
  pixelRatio,
  elapsed,
  delta: rawDelta,
  reducedMotion,
}: IFrameInput) {
  if (!group) return;

  // Clamp so a tab returning from the background eases in, not jumps.
  const delta = Math.min(rawDelta, 0.1);
  const { spin, tilt, tiltRate, minAspect } = sceneConstellation;
  const active = pointer.active && !reducedMotion;

  if (!reducedMotion) {
    // Spin accumulates by frame rather than following the clock, so turning
    // reduced motion off resumes from where the globe stopped.
    motion.spinX += spin[0] * delta;
    motion.spinY += spin[1] * delta;
    // Screen y points up and a positive x rotation tips the top away, so
    // the globe leans toward the cursor on both axes.
    const goalX = active ? -pointer.y * tilt : 0;
    const goalY = active ? pointer.x * tilt : 0;
    motion.tiltX += (goalX - motion.tiltX) * damp(tiltRate, delta);
    motion.tiltY += (goalY - motion.tiltY) * damp(tiltRate, delta);
    uniforms.uTime.value = elapsed;
  }

  group.scale.setScalar(Math.min(1, width / Math.max(height, 1) / minAspect));
  group.rotation.set(motion.spinX + motion.tiltX, motion.spinY + motion.tiltY, 0);
  group.updateMatrixWorld();
  uniforms.uPixelRatio.value = pixelRatio;

  // Movement counts only between two frames that both had the cursor, so a
  // cursor arriving from outside the window does not fling everything.
  const moveX = active && sweep.hadPointer ? pointer.x - sweep.lastX : 0;
  const moveY = active && sweep.hadPointer ? pointer.y - sweep.lastY : 0;
  sweep.lastX = pointer.x;
  sweep.lastY = pointer.y;
  sweep.hadPointer = active;

  if (reducedMotion) {
    // Nothing moves: send every star home and form the links there, once.
    if (!sweep.unsettled) return;
    resetSweep(sweep);
  } else if (moveX !== 0 || moveY !== 0 || sweep.unsettled) {
    sweep.unsettled = advanceSweep({
      sweep,
      group,
      camera,
      moveX,
      moveY,
      pointer,
      width,
      height,
      delta,
    });
  } else {
    return;
  }

  // Re-formed from where the stars are now, so the figures change as they
  // move. This also runs once more after they settle, to restore the
  // original figures exactly.
  const links = relink(sweep.positions, sweep.glow, sweep.links);
  linkGeometry.setDrawRange(0, links * 2);
  linkGeometry.attributes.position.needsUpdate = true;
  linkGeometry.attributes.aGlow.needsUpdate = true;
  starGeometry.attributes.position.needsUpdate = true;
  starGeometry.attributes.aGlow.needsUpdate = true;
}

/**
 * Builds and drives the constellation globe: its stars, the links between
 * neighbours, the globe's spin and lean, and the sweep that reshapes the
 * constellation on every mouse move.
 *
 * Per frame, while anything is out of place, the CPU projects each star once
 * to see whether the cursor reaches it, steps each star's spring, and
 * re-forms the links: a few thousand distance checks for 88 stars, into
 * buffers that are reused rather than reallocated. At rest it does nothing.
 */
export function useConstellationSphere({
  palette,
  density,
  reducedMotion,
}: IUseConstellationSphereOptions) {
  const pointer = useScenePointer(!reducedMotion);
  const groupRef = useRef<Group>(null);
  const motion = useRef<ISphereMotion>({ spinX: 0, spinY: 0, tiltX: 0, tiltY: 0 });
  const invalidate = useThree((state) => state.invalidate);

  const constellation = useMemo(
    () =>
      buildConstellation({
        count: density.stars,
        radius: sceneConstellation.radius,
        jitter: sceneConstellation.jitter,
        tintWeights: sceneConstellation.tintWeights,
        seed: sceneConstellation.seed,
      }),
    [density.stars],
  );
  const sweep = useMemo(() => createSweepState(constellation), [constellation]);
  const uniforms = useMemo(() => createUniforms(), []);
  const starGeometry = useMemo(
    () => createStarGeometry(constellation, sweep),
    [constellation, sweep],
  );
  const linkGeometry = useMemo(() => createLinkGeometry(sweep), [sweep]);
  const starMaterial = useMemo(
    () => createMaterial(uniforms, globeStarVertex, globeStarFragment),
    [uniforms],
  );
  const linkMaterial = useMemo(
    () => createMaterial(uniforms, globeLinkVertex, linkFragment),
    [uniforms],
  );

  useEffect(() => () => starGeometry.dispose(), [starGeometry]);
  useEffect(() => () => linkGeometry.dispose(), [linkGeometry]);
  useEffect(() => () => starMaterial.dispose(), [starMaterial]);
  useEffect(() => () => linkMaterial.dispose(), [linkMaterial]);

  // Theme changes are pushed into the existing GPU objects rather than
  // rebuilding them. `invalidate` matters under reduced motion, where the
  // canvas only renders on demand.
  useEffect(() => {
    applyPalette([starMaterial, linkMaterial], uniforms, palette);
    invalidate();
  }, [starMaterial, linkMaterial, uniforms, palette, invalidate]);

  // Reduced motion can switch on mid-session, moving the canvas to on-demand
  // frames. Request one so the globe settles into its still pose.
  useEffect(() => {
    invalidate();
  }, [reducedMotion, invalidate]);

  useFrame((state, delta) => {
    advanceFrame({
      group: groupRef.current,
      uniforms,
      motion: motion.current,
      sweep,
      starGeometry,
      linkGeometry,
      pointer: pointer.current,
      camera: state.camera,
      width: state.size.width,
      height: state.size.height,
      pixelRatio: state.viewport.dpr,
      elapsed: state.clock.elapsedTime,
      delta,
      reducedMotion,
    });
  });

  return { groupRef, starGeometry, linkGeometry, starMaterial, linkMaterial };
}
