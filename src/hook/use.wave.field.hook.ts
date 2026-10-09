import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  type Camera,
  Color,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  MeshStandardMaterial,
  Plane,
  PointLight,
  Raycaster,
  Vector2,
  Vector3,
} from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  fragmentColor,
  fragmentEmissive,
  fragmentPars,
  vertexMain,
  vertexPars,
} from "@/src/components/scene/scene.shaders";
import type { ISceneDensity, IScenePalette } from "@/src/data/scene";
import { sceneField } from "@/src/data/scene";
import { type IScenePointer, useScenePointer } from "./use.scene.pointer.hook";

interface IUseWaveFieldOptions {
  palette: IScenePalette;
  density: ISceneDensity;
  reducedMotion: boolean;
}

type WaveUniforms = ReturnType<typeof createUniforms>;

const HALF_DEPTH = sceneField.depth / 2;
const NEAR_Z = sceneField.offsetZ + HALF_DEPTH;
const FAR_Z = sceneField.offsetZ - HALF_DEPTH;
/** Farthest row the light may travel to; beyond it the rows have faded out. */
const FAR_LIMIT_Z = FAR_Z * 0.85;
/** Where the light rests before any input: centre, a third of the way back. */
const IDLE_Z = sceneField.offsetZ + HALF_DEPTH * 0.2;

// Scratch objects for the render loop, so no frame allocates.
const fabricPlane = new Plane(new Vector3(0, 1, 0), 0);
const raycaster = new Raycaster();
const ndc = new Vector2();
const goal = new Vector3();

function createUniforms() {
  return {
    uTime: { value: 0 },
    uExtent: { value: new Vector2(sceneField.minHalfWidth, HALF_DEPTH) },
    uOffsetZ: { value: sceneField.offsetZ },
    uAmplitude: { value: sceneField.amplitude },
    uPointer: { value: new Vector3(0, 0, IDLE_Z) },
    uStrength: { value: 0 },
    uRadius: { value: sceneField.radius },
    uLift: { value: sceneField.lift },
    uPush: { value: sceneField.push },
    uSwell: { value: sceneField.swell },
    uAccent: { value: new Color() },
    uGlow: { value: sceneField.glow },
  };
}

/**
 * One instance per node. Odd rows are offset half a step, which turns a
 * square grid into a triangular lattice: it reads as woven fabric rather
 * than graph paper, at no extra cost.
 */
function createGeometry({ cols, rows }: ISceneDensity) {
  // three builds polyhedra unindexed: 60 vertices for 12 corners. Dropping
  // the per-face normals and uvs lets the corners weld, cutting vertex work
  // 5x across every instance. Flat shading derives face normals per pixel,
  // so the smooth normals recomputed here are never used for lighting.
  const source = new IcosahedronGeometry(sceneField.nodeSize, 0);
  source.deleteAttribute("normal");
  source.deleteAttribute("uv");
  const geometry = mergeVertices(source);
  source.dispose();
  geometry.computeVertexNormals();
  const grid = new Float32Array(cols * rows * 2);
  const stepX = 2 / Math.max(cols - 1, 1);
  const stepZ = 2 / Math.max(rows - 1, 1);

  let i = 0;
  for (let row = 0; row < rows; row++) {
    const stagger = row % 2 === 0 ? 0 : stepX / 2;
    for (let col = 0; col < cols; col++) {
      grid[i++] = col * stepX - 1 + stagger;
      grid[i++] = row * stepZ - 1;
    }
  }

  geometry.setAttribute("aGrid", new InstancedBufferAttribute(grid, 2));
  return geometry;
}

function createMaterial(uniforms: WaveUniforms) {
  const material = new MeshStandardMaterial({
    roughness: 0.38,
    metalness: 0.15,
    flatShading: true,
    transparent: true,
    // Nodes are tiny and rarely overlap, so skipping depth writes costs no
    // visible sorting artefacts and lets the faded rows blend cleanly.
    depthWrite: false,
  });

  material.onBeforeCompile = (shader) => {
    // Same objects, not copies: writing `.value` in the loop reaches the GPU.
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${vertexPars}`)
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>\n${vertexMain}`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${fragmentPars}`)
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>\n${fragmentColor}`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>\n${fragmentEmissive}`,
      );
  };

  // Without a distinct key three could reuse the unpatched program compiled
  // for another MeshStandardMaterial in the same renderer.
  material.customProgramCacheKey = () => "scene-wave-field";

  return material;
}

function applyPalette(
  material: MeshStandardMaterial,
  uniforms: WaveUniforms,
  palette: IScenePalette,
) {
  material.color.set(palette.node);
  material.emissive.set(palette.emissive);
  material.emissiveIntensity = palette.emissiveIntensity;
  material.opacity = palette.opacity;
  uniforms.uAccent.value.set(palette.accent);
}

/** Fabric half-width for a viewport, so the fixed node count always spans it. */
function applyExtent(uniforms: WaveUniforms, width: number, height: number) {
  const aspect = width / Math.max(height, 1);
  uniforms.uExtent.value.x = Math.min(
    Math.max(aspect * sceneField.widthPerAspect, sceneField.minHalfWidth),
    sceneField.maxHalfWidth,
  );
}

/** Frame-rate independent easing factor for an exponential approach. */
const damp = (rate: number, delta: number) => 1 - Math.exp(-rate * delta);

interface IFrameInput {
  uniforms: WaveUniforms;
  light: PointLight | null;
  pointer: IScenePointer;
  camera: Camera;
  elapsed: number;
  delta: number;
  reducedMotion: boolean;
}

/**
 * One render-loop step: resolve where the light should be, ease it there,
 * and advance the wave. A plain function rather than inline in `useFrame`
 * because it mutates the uniform and light objects the hook owns, which the
 * React Compiler lint rules forbid inside the hook body itself.
 */
function advanceFrame({
  uniforms,
  light,
  pointer,
  camera,
  elapsed,
  delta: rawDelta,
  reducedMotion,
}: IFrameInput) {
  // Clamp so a tab returning from the background eases in, not jumps.
  const delta = Math.min(rawDelta, 0.1);
  const halfWidth = uniforms.uExtent.value.x;
  const { x, y, active } = pointer;

  if (active) {
    ndc.set(x, y);
    raycaster.setFromCamera(ndc, camera);
    const { origin, direction } = raycaster.ray;
    // Near the horizon the hit races off toward infinity, and above it the
    // ray never meets the fabric. In both cases follow the cursor's ray only
    // as far as the far limit row, so x stays under the cursor and the light
    // glides continuously across the horizon instead of jumping.
    // `direction.z` is always negative for this camera, so `t` is positive.
    if (!raycaster.ray.intersectPlane(fabricPlane, goal) || goal.z < FAR_LIMIT_Z) {
      const t = (FAR_LIMIT_Z - origin.z) / direction.z;
      goal.set(origin.x + direction.x * t, 0, FAR_LIMIT_Z);
    }
    goal.z = Math.min(goal.z, NEAR_Z);
    goal.x = Math.min(Math.max(goal.x, -halfWidth), halfWidth);
  } else if (reducedMotion) {
    goal.set(0, 0, IDLE_Z);
  } else {
    // A slow Lissajous drift, so the fabric keeps a living highlight on
    // touch devices and before the first mouse move.
    goal.set(
      Math.sin(elapsed * 0.21) * halfWidth * 0.4,
      0,
      IDLE_Z + Math.sin(elapsed * 0.13) * HALF_DEPTH * 0.25,
    );
  }

  const pointerValue = uniforms.uPointer.value;
  const strength = active ? 1 : sceneField.idleStrength;

  if (reducedMotion) {
    // On-demand frames are too few to ease across, so settle immediately.
    pointerValue.copy(goal);
    uniforms.uStrength.value = strength;
    uniforms.uTime.value = 0;
  } else {
    pointerValue.lerp(goal, damp(sceneField.followRate, delta));
    uniforms.uStrength.value +=
      (strength - uniforms.uStrength.value) *
      damp(sceneField.strengthRate, delta);
    uniforms.uTime.value = elapsed * sceneField.speed;
  }

  light?.position.set(pointerValue.x, sceneField.lightHeight, pointerValue.z);
}

/**
 * Builds and drives the instanced wave fabric and its cursor light.
 *
 * The CPU does three things per frame: advance time, cast one ray from the
 * pointer onto the fabric plane, and ease the light toward that hit. All
 * per-node motion is in the vertex shader, so the frame cost is the same at
 * a thousand nodes as at five thousand.
 */
export function useWaveField({
  palette,
  density,
  reducedMotion,
}: IUseWaveFieldOptions) {
  const pointer = useScenePointer(!reducedMotion);
  const lightRef = useRef<PointLight>(null);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const invalidate = useThree((state) => state.invalidate);

  const count = density.cols * density.rows;
  const uniforms = useMemo(() => createUniforms(), []);
  const geometry = useMemo(() => createGeometry(density), [density]);
  const material = useMemo(() => createMaterial(uniforms), [uniforms]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  // Theme and viewport changes are pushed into the existing GPU objects
  // rather than rebuilding them. `invalidate` matters under reduced motion,
  // where the canvas only renders on demand.
  useEffect(() => {
    applyPalette(material, uniforms, palette);
    invalidate();
  }, [material, uniforms, palette, invalidate]);

  useEffect(() => {
    applyExtent(uniforms, width, height);
    invalidate();
  }, [uniforms, width, height, invalidate]);

  // Reduced motion can switch on mid-session, moving the canvas to on-demand
  // frames. Request one so the fabric settles into its still pose.
  useEffect(() => {
    invalidate();
  }, [reducedMotion, invalidate]);

  useFrame((state, delta) => {
    advanceFrame({
      uniforms,
      light: lightRef.current,
      pointer: pointer.current,
      camera: state.camera,
      elapsed: state.clock.elapsedTime,
      delta,
      reducedMotion,
    });
  });

  return { geometry, material, count, lightRef, palette };
}
