import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  type Points,
  ShaderMaterial,
} from "three";
import {
  dustFragment,
  dustVertex,
} from "@/src/components/scene/constellation.shaders";
import type { ISceneDensity, IScenePalette } from "@/src/data/scene";
import { sceneStarDust } from "@/src/data/scene";
import { buildStarDust } from "@/src/lib/scene.constellation";

interface IUseStarDustOptions {
  palette: IScenePalette;
  density: ISceneDensity;
  reducedMotion: boolean;
}

type StarDustUniforms = ReturnType<typeof createUniforms>;

function createUniforms() {
  return {
    uSize: { value: sceneStarDust.size },
    uMinPixels: { value: sceneStarDust.minPixels },
    uMaxPixels: { value: sceneStarDust.maxPixels },
    uPixelRatio: { value: 1 },
    uColor: { value: new Color() },
    uOpacity: { value: 1 },
  };
}

function createGeometry(count: number) {
  const geometry = new BufferGeometry();
  const specks = buildStarDust(count, sceneStarDust.halfExtent, sceneStarDust.seed);
  geometry.setAttribute("position", new BufferAttribute(specks, 3));
  return geometry;
}

function createMaterial(uniforms: StarDustUniforms) {
  return new ShaderMaterial({
    uniforms,
    vertexShader: dustVertex,
    fragmentShader: dustFragment,
    transparent: true,
    depthWrite: false,
  });
}

function applyPalette(
  material: ShaderMaterial,
  uniforms: StarDustUniforms,
  palette: IScenePalette,
) {
  uniforms.uColor.value.set(palette.dust);
  uniforms.uOpacity.value = palette.dustOpacity;
  material.blending = palette.additive ? AdditiveBlending : NormalBlending;
}

interface IFrameInput {
  points: Points | null;
  uniforms: StarDustUniforms;
  pixelRatio: number;
  delta: number;
  reducedMotion: boolean;
}

/**
 * One render-loop step: drift the dust. A plain function rather than inline
 * in `useFrame` because it mutates objects the hook owns, which the React
 * Compiler lint rules forbid inside the hook body itself.
 */
function advanceFrame({ points, uniforms, pixelRatio, delta, reducedMotion }: IFrameInput) {
  if (!points) return;
  // Clamp so a tab returning from the background does not jump the drift.
  if (!reducedMotion) points.rotation.y += sceneStarDust.drift * Math.min(delta, 0.1);
  uniforms.uPixelRatio.value = pixelRatio;
}

/**
 * Builds and drives the star dust: faint specks filling the space around the
 * camera, drifting slowly the other way from the globe's spin. It takes no
 * input; it is depth, not a feature.
 */
export function useStarDust({ palette, density, reducedMotion }: IUseStarDustOptions) {
  const pointsRef = useRef<Points>(null);
  const invalidate = useThree((state) => state.invalidate);

  const uniforms = useMemo(() => createUniforms(), []);
  const geometry = useMemo(() => createGeometry(density.dust), [density.dust]);
  const material = useMemo(() => createMaterial(uniforms), [uniforms]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  // `invalidate` matters under reduced motion, where the canvas only renders
  // on demand.
  useEffect(() => {
    applyPalette(material, uniforms, palette);
    invalidate();
  }, [material, uniforms, palette, invalidate]);

  useFrame((state, delta) => {
    advanceFrame({
      points: pointsRef.current,
      uniforms,
      pixelRatio: state.viewport.dpr,
      delta,
      reducedMotion,
    });
  });

  return { pointsRef, geometry, material };
}
