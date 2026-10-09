"use client";

import type { HeroTheme, IHeroTier } from "@/src/data/hero.scene";
import { useHeroDiorama } from "@/src/hook/use.hero.diorama.hook";

interface IProps {
  theme: HeroTheme;
  tier: IHeroTier;
  isStatic: boolean;
}

/**
 * The room and its lights: floor, walls, desk, monitors' bodies, keyboard,
 * chair and the seated avatar, in two draw calls, with a soft shadow, a glow
 * behind each monitor and steam off the mug on top.
 */
export default function HeroDiorama(props: IProps) {
  const { set, glow, ground, halos, steamRef, steam, lights, positions, hasLampLight } =
    useHeroDiorama(props);

  return (
    <>
      {/* The number of lights is fixed for the life of the canvas; a theme
          change only alters their colour and intensity. three compiles the
          light count into every lit shader, so adding or removing one here
          would recompile the room mid-session. */}
      <hemisphereLight
        color={lights.hemisphere.sky}
        groundColor={lights.hemisphere.ground}
        intensity={lights.hemisphere.intensity}
      />
      <directionalLight
        position={positions.key.position}
        color={lights.key.color}
        intensity={lights.key.intensity}
      />
      <pointLight
        position={positions.screen.position}
        color={lights.screen.color}
        intensity={lights.screen.intensity}
        distance={positions.screen.distance}
        decay={positions.decay}
      />
      {hasLampLight && (
        <pointLight
          position={positions.lamp.position}
          color={lights.lamp.color}
          intensity={lights.lamp.intensity}
          distance={positions.lamp.distance}
          decay={positions.decay}
        />
      )}

      {/* Disposal is handled by the hook, which owns every geometry and
          material here. */}
      <mesh geometry={set.geometry} material={set.material} dispose={null} />
      <mesh geometry={glow.geometry} material={glow.material} dispose={null} />
      <mesh geometry={ground.geometry} material={ground.material} dispose={null} />
      <mesh
        geometry={halos.geometry}
        material={halos.material}
        visible={halos.isVisible}
        dispose={null}
      />
      {/* Culling is off because three sizes an instanced mesh's bounds from
          its instances once, and these move every frame. */}
      {steam && (
        <instancedMesh
          ref={steamRef}
          args={[steam.geometry, steam.material, steam.count]}
          frustumCulled={false}
          dispose={null}
        />
      )}
    </>
  );
}
