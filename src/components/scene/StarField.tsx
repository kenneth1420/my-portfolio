"use client";

import type { ISceneDensity, IScenePalette } from "@/src/data/scene";
import { useStarField } from "@/src/hook/use.star.field.hook";

interface IProps {
  palette: IScenePalette;
  density: ISceneDensity;
  reducedMotion: boolean;
}

/**
 * The sky behind the globe: a deep layer of stars, linked into loose
 * figures, that fills the viewport. It twinkles, leans a little toward the
 * cursor, and brightens to mint around it. One draw call for the stars and
 * one for the links.
 */
export default function StarField(props: IProps) {
  const { groupRef, center, starGeometry, linkGeometry, starMaterial, linkMaterial } =
    useStarField(props);

  return (
    <>
      {/* Links first, so the stars draw over the lines that meet them.
          Disposal is handled by the hook, which owns the geometry and
          materials. */}
      <group ref={groupRef} position={center}>
        <lineSegments args={[linkGeometry, linkMaterial]} dispose={null} />
        <points args={[starGeometry, starMaterial]} dispose={null} />
      </group>
    </>
  );
}
