import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import {
  type Group,
  MathUtils,
  type PerspectiveCamera,
  Vector3,
  type WebGLRenderer,
} from "three";
import {
  heroGroups,
  heroRig,
  heroScreens,
  type HeroVec3,
  type IHeroTier,
} from "@/src/data/hero.scene";
import { heroDebug } from "@/src/lib/hero.debug";
import { resolveHeroSolids } from "@/src/lib/hero.geometry";
import {
  createHeroPose,
  type IHeroPath,
  measureHeroClearance,
  resolveHeroPath,
  sampleHeroPath,
} from "@/src/lib/hero.path";
import { type IScenePointer, useScenePointer } from "./use.scene.pointer.hook";

/**
 * What the rig drew this frame, for the other parts of the scene that key
 * off the camera. The rig writes it; the screens read it later in the same
 * frame.
 */
export interface IHeroFrame {
  /** Damped scroll progress: where the camera actually is, 0…1. */
  p: number;
  /** True while the camera is still closing on the scroll position. */
  moving: boolean;
}

interface IUseHeroRigOptions {
  /** Raw scroll progress along the hero track. Read in the loop, never
      subscribed to. */
  progress: MotionValue<number>;
  frame: RefObject<IHeroFrame>;
  tier: IHeroTier;
  /** One still frame at the top of the path: reduced motion, or a hero
      that does not scroll. */
  isStatic: boolean;
  /** False while the frame loop is stopped. */
  isRunning: boolean;
}

interface IHeroRigState {
  /** Damped progress. */
  p: number;
  /** False until a frame has been drawn since the loop last started. */
  started: boolean;
  /** Seconds into the entrance drift; at its duration when there is none. */
  entrance: number;
  aspect: number;
  path: IHeroPath | null;
  tiltX: number;
  tiltY: number;
  /** Last opacity written to the canvas element, to skip repeat writes. */
  opacity: number;
}

const createRigState = (): IHeroRigState => ({
  p: 0,
  started: false,
  entrance: heroRig.entrance.duration,
  aspect: 0,
  path: null,
  tiltX: 0,
  tiltY: 0,
  opacity: -1,
});

const { pivot } = heroRig.parallax;
const PIVOT: HeroVec3 = pivot;
/** Moves the room back so that turning its parent turns it about the pivot. */
const UNPIVOT: HeroVec3 = [-pivot[0], -pivot[1], -pivot[2]];

// Scratch objects for the render loop, so no frame allocates.
const pose = createHeroPose();
const offset = new Vector3();
const corner = new Vector3();

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** The primary screen's four corners, relative to the parallax pivot. */
const screenCorners = (() => {
  const { centre, size, yaw } = heroScreens.primary;
  const angle = MathUtils.degToRad(yaw);
  const right = new Vector3(Math.cos(angle), 0, -Math.sin(angle));

  return [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([x, y]) =>
    new Vector3(...centre)
      .addScaledVector(right, (x * size[0]) / 2)
      .setY(centre[1] + (y * size[1]) / 2)
      .sub(new Vector3(...PIVOT)),
  );
})();

interface IRigFrame {
  rig: IHeroRigState;
  frame: IHeroFrame;
  camera: PerspectiveCamera;
  group: Group | null;
  gl: WebGLRenderer;
  pointer: IScenePointer;
  /** Raw scroll progress. */
  target: number;
  width: number;
  height: number;
  delta: number;
  tier: IHeroTier;
  isStatic: boolean;
}

/**
 * Publishes the frame to `window.__hero` for the browser checks. Compiled
 * out of a normal production build, where `heroDebug` is null.
 */
function reportFrame({ rig, camera, group, gl }: IRigFrame) {
  if (!heroDebug) return;

  heroDebug.p = rig.p;
  heroDebug.camera.position = [camera.position.x, camera.position.y, camera.position.z];
  heroDebug.camera.fov = camera.fov;

  // three refreshes these inside render(), which has not run yet this frame.
  camera.updateMatrixWorld();
  group?.updateMatrixWorld();

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const local of screenCorners) {
    corner.copy(local);
    if (group) corner.applyMatrix4(group.matrixWorld);
    corner.project(camera);
    minX = Math.min(minX, corner.x);
    maxX = Math.max(maxX, corner.x);
    minY = Math.min(minY, corner.y);
    maxY = Math.max(maxY, corner.y);
  }
  heroDebug.screenNdc = [minX, maxX, minY, maxY];

  // The renderer resets these when a frame begins, so read here they
  // describe the frame before this one.
  heroDebug.info.calls = gl.info.render.calls;
  heroDebug.info.triangles = gl.info.render.triangles;
  heroDebug.info.programs = gl.info.programs?.length ?? 0;
}

/**
 * One render-loop step for the camera. A plain function, as in the star
 * field hook: it mutates the camera, the room group and the canvas element,
 * which the React Compiler lint rules forbid inside the hook body itself.
 */
function advanceRig(input: IRigFrame) {
  const { rig, frame, camera, group, gl, pointer, width, height, tier, isStatic } = input;
  // Clamp so a tab returning from the background eases in, not jumps.
  const delta = Math.min(input.delta, heroRig.maxDelta);
  const target = isStatic ? 0 : MathUtils.clamp(input.target, 0, 1);

  // Damp the scalar, not the position: wheel ticks become continuous motion
  // and the camera can never leave its path. The first frame and any large
  // jump cut instead, so a restored scroll position or an anchor link does
  // not replay the whole flight.
  const isCut = !rig.started || Math.abs(target - rig.p) > heroRig.snapDistance;
  rig.p = isCut ? target : MathUtils.damp(rig.p, target, tier.followRate, delta);
  if (Math.abs(target - rig.p) < heroRig.settle) rig.p = target;

  const { entrance } = heroRig;
  if (!rig.started) {
    // Arriving at the top of the page, drift in. Arriving anywhere else, or
    // with nothing meant to move, be in place already.
    rig.entrance = !isStatic && target < entrance.below ? 0 : entrance.duration;
    rig.started = true;
  } else if (rig.entrance < entrance.duration) {
    rig.entrance = Math.min(rig.entrance + delta, entrance.duration);
  }
  const pullBack =
    1 + entrance.pullBack * (1 - easeOutCubic(rig.entrance / entrance.duration));

  // Resolving the path allocates, so it is redone only when the viewport
  // changes shape.
  const aspect = width / Math.max(height, 1);
  if (!rig.path || aspect !== rig.aspect) {
    rig.aspect = aspect;
    rig.path = resolveHeroPath(aspect);
  }
  sampleHeroPath(rig.path, rig.p, pose);

  offset.subVectors(pose.position, pose.target);
  camera.position.copy(pose.target).addScaledVector(offset, pullBack);
  camera.lookAt(pose.target);
  camera.fov = pose.fov;
  // Slides the picture inside the frame without turning the camera, so the
  // room sits beside the text with no change in perspective. It also
  // rebuilds the projection matrix, which the new fov needs anyway.
  camera.setViewOffset(
    width,
    height,
    -pose.shiftX * width,
    -pose.shiftY * height,
    width,
    height,
  );

  // The room leans toward the cursor; it has straightened by the time the
  // camera is square on to the screen, so the bezel never tilts into view.
  const [leanFrom, leanTo] = heroRig.parallax.fade;
  const lean =
    isStatic || !tier.parallax ? 0 : 1 - MathUtils.smoothstep(rig.p, leanFrom, leanTo);
  const goalX = pointer.active ? pointer.x * lean : 0;
  const goalY = pointer.active ? pointer.y * lean : 0;
  rig.tiltX = MathUtils.damp(rig.tiltX, goalX, heroRig.parallax.rate, delta);
  rig.tiltY = MathUtils.damp(rig.tiltY, goalY, heroRig.parallax.rate, delta);
  group?.rotation.set(
    -rig.tiltY * heroRig.parallax.pitch,
    rig.tiltX * heroRig.parallax.yaw,
    0,
  );

  // Faded on the damped value, so the canvas never dissolves ahead of the
  // camera. By now the frame is nothing but screen paper, which is the
  // page's own colour: only the page showing through gives the fade away.
  const [fadeFrom, fadeTo] = heroRig.canvasFade;
  const opacity = isStatic ? 1 : 1 - MathUtils.smoothstep(rig.p, fadeFrom, fadeTo);
  if (opacity !== rig.opacity) {
    rig.opacity = opacity;
    gl.domElement.style.opacity = String(opacity);
  }

  frame.p = rig.p;
  frame.moving = rig.p !== target || rig.entrance < entrance.duration;

  reportFrame(input);
}

/** Makes the next frame a first frame: no damping from a stale position. */
function restartRig(rig: IHeroRigState) {
  rig.started = false;
}

/**
 * Hands the clearance check to the debug handle. The solids are resolved
 * when the check is called, not here: it is a test's question, asked rarely.
 */
function publishClearance(rig: IHeroRigState) {
  if (!heroDebug) return;

  heroDebug.minClearance = () =>
    rig.path
      ? measureHeroClearance(rig.path, resolveHeroSolids(heroGroups, "fine"))
      : Number.POSITIVE_INFINITY;
}

/**
 * Drives the hero camera from scroll progress, and with it everything that
 * is timed to the camera: the room's lean toward the cursor and the canvas
 * fading out at the hand-off.
 *
 * The scroll position arrives as a motion value and is read with `.get()`
 * inside the frame loop. There is no subscription and no React state on that
 * path, so scrolling the hero re-renders nothing.
 */
export function useHeroRig({
  progress,
  frame,
  tier,
  isStatic,
  isRunning,
}: IUseHeroRigOptions) {
  const pointer = useScenePointer(tier.parallax && !isStatic);
  const groupRef = useRef<Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const rig = useMemo(() => createRigState(), []);

  useEffect(() => {
    publishClearance(rig);
  }, [rig]);

  // The damped position goes stale while the loop is stopped, and the still
  // mode has its own pose. Either way the next frame must cut to where it
  // belongs. `invalidate` asks for that frame when rendering is on demand.
  useEffect(() => {
    restartRig(rig);
    invalidate();
  }, [rig, isStatic, isRunning, invalidate]);

  // Runs before the screens, which read what this step writes. Only a
  // priority above zero would take rendering away from R3F.
  useFrame((state, delta) => {
    advanceRig({
      rig,
      frame: frame.current,
      camera: state.camera as PerspectiveCamera,
      group: groupRef.current,
      gl: state.gl,
      pointer: pointer.current,
      target: progress.get(),
      width: state.size.width,
      height: state.size.height,
      delta,
      tier,
      isStatic,
    });
  }, -1);

  return { groupRef, pivot: PIVOT, unpivot: UNPIVOT };
}
