import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  IcosahedronGeometry,
  type InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Quaternion,
  SRGBColorSpace,
  Vector3,
} from "three";
import {
  heroDecals,
  heroDecalTextureSize,
  heroGroups,
  heroLights,
  heroPalettes,
  heroRig,
  heroSteam,
  type HeroLayer,
  type HeroTheme,
  type IHeroDecal,
  type IHeroPalette,
  type IHeroTier,
} from "@/src/data/hero.scene";
import {
  applyHeroPalette,
  buildHeroMesh,
  buildHeroQuads,
  type IHeroRange,
  type IHeroSolid,
  resolveHeroSolids,
} from "@/src/lib/hero.geometry";
import { paintSoftDisc } from "@/src/lib/hero.terminal";

interface IUseHeroDioramaOptions {
  theme: HeroTheme;
  tier: IHeroTier;
  isStatic: boolean;
}

interface ILayer {
  geometry: BufferGeometry;
  ranges: IHeroRange[];
}

/** One merged mesh for a layer: every part of it in a single draw call. */
function createLayer(solids: readonly IHeroSolid[], layer: HeroLayer): ILayer {
  const mesh = buildHeroMesh(solids, layer);
  const geometry = new BufferGeometry();

  geometry.setAttribute("position", new BufferAttribute(mesh.positions, 3));
  geometry.setAttribute("color", new BufferAttribute(mesh.colors, 3));
  geometry.setIndex(new BufferAttribute(mesh.indices, 1));
  // Corners are shared between faces, so these are averaged and useless for
  // lighting. Flat shading derives each face's normal per pixel instead;
  // the attribute is only here so the stock shader has one to read.
  geometry.computeVertexNormals();

  return { geometry, ranges: mesh.ranges };
}

function createQuads(decals: readonly IHeroDecal[]) {
  const quads = buildHeroQuads(decals);
  const geometry = new BufferGeometry();

  geometry.setAttribute("position", new BufferAttribute(quads.positions, 3));
  geometry.setAttribute("uv", new BufferAttribute(quads.uvs, 2));
  geometry.setIndex(new BufferAttribute(quads.indices, 1));

  return geometry;
}

/** The soft round gradient the halos and the floor shadow are cut from. */
function createSoftTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = heroDecalTextureSize;
  canvas.height = heroDecalTextureSize;

  const context = canvas.getContext("2d");
  if (context) paintSoftDisc(context, heroDecalTextureSize);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * The materials that are not one of the two merged layers. None of them
 * writes depth: they are all see-through, and a soft edge that wrote depth
 * would cut a hard rectangle out of whatever is drawn behind it.
 */
function createSoftMaterials(soft: CanvasTexture) {
  return {
    ground: new MeshBasicMaterial({
      map: soft,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
    // Additive, so the glow lightens the wall behind a monitor and adds
    // nothing where the bezel already covers it.
    halo: new MeshBasicMaterial({
      map: soft,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      blending: AdditiveBlending,
    }),
    steam: new MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  };
}

type SoftMaterials = ReturnType<typeof createSoftMaterials>;

/**
 * Recolours the scene for a theme. Only buffer contents and uniform values
 * change: no material gains or loses a feature, so three keeps every
 * compiled program.
 */
function applyDioramaPalette(
  layers: readonly ILayer[],
  materials: SoftMaterials,
  palette: IHeroPalette,
) {
  for (const { geometry, ranges } of layers) {
    const color = geometry.getAttribute("color") as BufferAttribute;
    applyHeroPalette(color.array as Float32Array, ranges, palette.tones);
    color.needsUpdate = true;
  }

  materials.ground.color.set(palette.ground.color);
  materials.ground.opacity = palette.ground.opacity;
  materials.halo.color.set(palette.halo.color);
  materials.halo.opacity = palette.halo.opacity;
  materials.steam.color.set(palette.steam.color);
  materials.steam.opacity = palette.steam.opacity;
}

// Scratch objects for the render loop, so no frame allocates.
const puffMatrix = new Matrix4();
const puffPosition = new Vector3();
const puffScale = new Vector3();
const NO_TURN = new Quaternion();

interface ISteamClock {
  time: number;
}

/**
 * Moves the steam: each puff rises off the mug, swelling and then thinning
 * away, a third of a cycle behind the one before. A plain function because
 * it mutates the instanced mesh the hook's ref points at.
 */
function advanceSteam(
  mesh: InstancedMesh | null,
  clock: ISteamClock,
  delta: number,
  isStatic: boolean,
) {
  if (!mesh) return;
  if (!isStatic) clock.time += Math.min(delta, heroRig.maxDelta);

  const [x, y, z] = heroSteam.base;

  for (let i = 0; i < heroSteam.count; i++) {
    const phase = (clock.time * heroSteam.rate + i / heroSteam.count) % 1;
    // Zero at both ends of the rise, so a puff never pops in or out.
    const size = Math.sin(phase * Math.PI) * heroSteam.size;

    puffPosition.set(
      x + Math.sin((phase + i) * Math.PI * 2) * heroSteam.sway,
      y + phase * heroSteam.rise,
      z,
    );
    puffScale.setScalar(size);
    mesh.setMatrixAt(i, puffMatrix.compose(puffPosition, NO_TURN, puffScale));
  }

  mesh.instanceMatrix.needsUpdate = true;
}

/**
 * Builds the room: every lit part merged into one mesh, every glowing part
 * into another, plus the floor shadow, the monitors' halos and the steam.
 *
 * The geometry is built once per device tier and never again. A theme
 * change rewrites vertex colours and a few material values in place.
 */
export function useHeroDiorama({ theme, tier, isStatic }: IUseHeroDioramaOptions) {
  const invalidate = useThree((state) => state.invalidate);
  const palette = heroPalettes[theme];
  const steamRef = useRef<InstancedMesh>(null);

  const solids = useMemo(() => resolveHeroSolids(heroGroups, tier.detail), [tier.detail]);
  const set = useMemo(() => createLayer(solids, "set"), [solids]);
  const glow = useMemo(() => createLayer(solids, "glow"), [solids]);
  const ground = useMemo(() => createQuads([heroDecals.ground]), []);
  const halos = useMemo(() => createQuads(heroDecals.halos), []);
  const puff = useMemo(() => new IcosahedronGeometry(1, 0), []);

  const setMaterial = useMemo(
    () => new MeshLambertMaterial({ vertexColors: true, flatShading: true }),
    [],
  );
  const glowMaterial = useMemo(
    () => new MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
    [],
  );
  const soft = useMemo(() => createSoftTexture(), []);
  const softMaterials = useMemo(() => createSoftMaterials(soft), [soft]);
  const steamClock = useMemo<ISteamClock>(
    () => ({ time: heroSteam.restPhase / heroSteam.rate }),
    [],
  );

  useEffect(() => () => set.geometry.dispose(), [set]);
  useEffect(() => () => glow.geometry.dispose(), [glow]);
  useEffect(() => () => ground.dispose(), [ground]);
  useEffect(() => () => halos.dispose(), [halos]);
  useEffect(() => () => puff.dispose(), [puff]);
  useEffect(() => () => setMaterial.dispose(), [setMaterial]);
  useEffect(() => () => glowMaterial.dispose(), [glowMaterial]);
  useEffect(() => () => soft.dispose(), [soft]);
  useEffect(
    () => () => {
      softMaterials.ground.dispose();
      softMaterials.halo.dispose();
      softMaterials.steam.dispose();
    },
    [softMaterials],
  );

  // Theme changes are pushed into the existing GPU objects rather than
  // rebuilding them. `invalidate` matters in the still mode, where the
  // canvas only renders on demand.
  useEffect(() => {
    applyDioramaPalette([set, glow], softMaterials, palette);
    invalidate();
  }, [set, glow, softMaterials, palette, invalidate]);

  useFrame((_, delta) => {
    advanceSteam(steamRef.current, steamClock, delta, isStatic);
  });

  return {
    set: { geometry: set.geometry, material: setMaterial },
    glow: { geometry: glow.geometry, material: glowMaterial },
    ground: { geometry: ground, material: softMaterials.ground },
    halos: {
      geometry: halos,
      material: softMaterials.halo,
      // Hidden, not just transparent, so the light theme does not pay for
      // a draw call that adds nothing.
      isVisible: palette.halo.opacity > 0,
    },
    // The ref travels on its own: bundled into an object with the rest, the
    // React Compiler treats every field of that object as a ref and refuses
    // to let the component read them during render.
    steamRef,
    steam: tier.steam
      ? {
          geometry: puff,
          material: softMaterials.steam,
          count: heroSteam.count,
        }
      : null,
    lights: palette.lights,
    positions: heroLights,
    hasLampLight: tier.lampLight,
  };
}
