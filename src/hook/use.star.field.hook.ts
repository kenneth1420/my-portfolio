import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  type Camera,
  Color,
  type Group,
  NormalBlending,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import {
  fieldLinkVertex,
  fieldStarVertex,
  linkFragment,
  starFragment,
} from "@/src/components/scene/constellation.shaders";
import type { ISceneDensity, IScenePalette } from "@/src/data/scene";
import { sceneCamera, sceneStarField } from "@/src/data/scene";
import {
  buildStarField,
  type ISceneConstellation,
} from "@/src/lib/scene.constellation";
import { damp } from "@/src/lib/utils";
import { type IScenePointer, useScenePointer } from "./use.scene.pointer.hook";

interface IUseStarFieldOptions {
  palette: IScenePalette;
  density: ISceneDensity;
  reducedMotion: boolean;
}

type StarFieldUniforms = ReturnType<typeof createUniforms>;

/** The eased lean toward the cursor, in radians. */
interface IFieldMotion {
  tiltX: number;
  tiltY: number;
}

/** The field's middle: straight down the camera's view, past its target. */
const FIELD_CENTER = (() => {
  const target = new Vector3(...sceneCamera.target);
  const view = target.clone().sub(new Vector3(...sceneCamera.position)).normalize();
  return target.addScaledVector(view, sceneStarField.back);
})();

// Scratch object for the render loop, so no frame allocates.
const goal = new Vector2();

function createUniforms() {
  return {
    uTime: { value: 0 },
    uTwinkleRate: { value: sceneStarField.twinkleRate },
    uSize: { value: sceneStarField.starSize },
    uPixelRatio: { value: 1 },
    uStarOpacity: { value: 1 },
    uLineOpacity: { value: 1 },
    uTint0: { value: new Color() },
    uTint1: { value: new Color() },
    uTint2: { value: new Color() },
    uAccent: { value: new Color() },
    uLine: { value: new Color() },
    uDepthFade: { value: sceneStarField.depthFade },
    uHalfDepth: { value: sceneStarField.halfDepth },
    uGlowPointer: { value: new Vector2() },
    uResolution: { value: new Vector2(1, 1) },
    uGlowRadius: { value: sceneStarField.glowRadius },
    uGlowStrength: { value: 0 },
  };
}

/**
 * The field's half-width for a viewport, so it always spans the screen.
 * Whole units only: a resize rebuilds the layout when it crosses one, not on
 * every pixel.
 */
function fieldHalfWidth(width: number, height: number) {
  const { halfHeight, minHalfWidth, maxHalfWidth } = sceneStarField;
  const halfWidth = (halfHeight * width) / Math.max(height, 1);
  return Math.round(Math.min(Math.max(halfWidth, minHalfWidth), maxHalfWidth));
}

function createStarGeometry({ stars, tints, sizes, indices }: ISceneConstellation) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(stars, 3));
  geometry.setAttribute("aTint", new BufferAttribute(tints, 1));
  geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
  geometry.setAttribute("aIndex", new BufferAttribute(indices, 1));
  return geometry;
}

function createLinkGeometry({ segments }: ISceneConstellation) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(segments, 3));
  return geometry;
}

function createMaterial(
  uniforms: StarFieldUniforms,
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
  uniforms: StarFieldUniforms,
  palette: IScenePalette,
) {
  uniforms.uTint0.value.set(palette.stars[0]);
  uniforms.uTint1.value.set(palette.stars[1]);
  uniforms.uTint2.value.set(palette.stars[2]);
  uniforms.uAccent.value.set(palette.accent);
  uniforms.uLine.value.set(palette.line);
  uniforms.uStarOpacity.value = palette.fieldStarOpacity;
  uniforms.uLineOpacity.value = palette.fieldLineOpacity;

  for (const material of materials) {
    material.blending = palette.additive ? AdditiveBlending : NormalBlending;
  }
}

interface IFrameInput {
  group: Group | null;
  uniforms: StarFieldUniforms;
  motion: IFieldMotion;
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
 * One render-loop step: face the field to the camera with its lean, and
 * move the glow toward the cursor. A plain function rather than inline in
 * `useFrame` because it mutates objects the hook owns, which the React
 * Compiler lint rules forbid inside the hook body itself.
 */
function advanceFrame({
  group,
  uniforms,
  motion,
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
  const { tilt, tiltRate, idleStrength, followRate, strengthRate } = sceneStarField;
  const { active } = pointer;

  if (active) {
    goal.set(pointer.x, pointer.y);
  } else if (reducedMotion) {
    goal.set(0, 0);
  } else {
    // A slow Lissajous drift, so the field keeps a living highlight on
    // touch devices and before the first mouse move.
    goal.set(Math.sin(elapsed * 0.21) * 0.5, Math.sin(elapsed * 0.13) * 0.35);
  }

  const glow = uniforms.uGlowPointer.value;
  const strength = active ? 1 : idleStrength;

  if (reducedMotion) {
    // On-demand frames are too few to ease across, so settle immediately.
    glow.copy(goal);
    uniforms.uGlowStrength.value = strength;
    uniforms.uTime.value = 0;
  } else {
    glow.lerp(goal, damp(followRate, delta));
    uniforms.uGlowStrength.value +=
      (strength - uniforms.uGlowStrength.value) * damp(strengthRate, delta);
    uniforms.uTime.value = elapsed;

    // Screen y points up and a positive x rotation tips the top away, so
    // the field leans toward the cursor on both axes.
    const goalX = active ? -pointer.y * tilt : 0;
    const goalY = active ? pointer.x * tilt : 0;
    motion.tiltX += (goalX - motion.tiltX) * damp(tiltRate, delta);
    motion.tiltY += (goalY - motion.tiltY) * damp(tiltRate, delta);
  }

  // Face the camera, then lean. The field's local z runs toward the viewer,
  // which is what the shaders' depth fade reads.
  group.quaternion.copy(camera.quaternion);
  group.rotateX(motion.tiltX);
  group.rotateY(motion.tiltY);

  uniforms.uResolution.value.set(width, height);
  uniforms.uPixelRatio.value = pixelRatio;
}

/**
 * Builds and drives the star field behind the globe: its stars, the links
 * that gather them into figures, its lean, and the glow that follows the
 * cursor.
 *
 * The CPU does almost nothing per frame: ease the glow and the lean, and
 * turn one group. Twinkle, depth fading, and the glow itself are all in the
 * shaders.
 */
export function useStarField({
  palette,
  density,
  reducedMotion,
}: IUseStarFieldOptions) {
  const pointer = useScenePointer(!reducedMotion);
  const groupRef = useRef<Group>(null);
  const motion = useRef<IFieldMotion>({ tiltX: 0, tiltY: 0 });
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const invalidate = useThree((state) => state.invalidate);

  const halfWidth = fieldHalfWidth(width, height);
  const field = useMemo(() => {
    const { halfHeight, halfDepth } = sceneStarField;
    return buildStarField({
      // Density per unit of face, so a wide screen gets more stars, not
      // sparser ones.
      count: Math.round(density.fieldDensity * 4 * halfWidth * halfHeight),
      extent: [halfWidth, halfHeight, halfDepth],
      neighbours: sceneStarField.neighbours,
      maxLink: sceneStarField.maxLink,
      sizeRange: sceneStarField.sizeRange,
      tintWeights: sceneStarField.tintWeights,
      seed: sceneStarField.seed,
    });
  }, [density.fieldDensity, halfWidth]);

  const uniforms = useMemo(() => createUniforms(), []);
  const starGeometry = useMemo(() => createStarGeometry(field), [field]);
  const linkGeometry = useMemo(() => createLinkGeometry(field), [field]);
  const starMaterial = useMemo(
    () => createMaterial(uniforms, fieldStarVertex, starFragment),
    [uniforms],
  );
  const linkMaterial = useMemo(
    () => createMaterial(uniforms, fieldLinkVertex, linkFragment),
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
  // frames. Request one so the field settles into its still pose.
  useEffect(() => {
    invalidate();
  }, [reducedMotion, invalidate]);

  useFrame((state, delta) => {
    advanceFrame({
      group: groupRef.current,
      uniforms,
      motion: motion.current,
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

  return {
    groupRef,
    center: FIELD_CENTER,
    starGeometry,
    linkGeometry,
    starMaterial,
    linkMaterial,
  };
}
