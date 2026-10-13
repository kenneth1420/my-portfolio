"use client";

import type { ISceneDensity, IScenePalette } from "@/src/data/scene";
import { sceneConstellation } from "@/src/data/scene";
import { useConstellationSphere } from "@/src/hook/use.constellation.sphere.hook";

interface IProps {
  palette: IScenePalette;
  density: ISceneDensity;
  reducedMotion: boolean;
}

/**
 * The constellation globe, centred on screen: 88 glowing stars, each linked
 * to its nearest neighbours. It turns slowly and leans toward the cursor,
 * and every mouse move sweeps the nearby stars along and re-forms the links
 * between them. One draw call for the stars and one for the links.
 */
export default function ConstellationSphere(props: IProps) {
  const { groupRef, starGeometry, linkGeometry, starMaterial, linkMaterial } =
    useConstellationSphere(props);

  return (
    <>
      {/* Links first, so the stars draw over the lines that meet them.
          Culling is off because the stars and links move every frame, past
          the bounds three measured when they were built. Disposal is
          handled by the hook, which owns the geometry and materials. */}
      <group ref={groupRef} position={[...sceneConstellation.center]}>
        <lineSegments
          args={[linkGeometry, linkMaterial]}
          frustumCulled={false}
          dispose={null}
        />
        <points
          args={[starGeometry, starMaterial]}
          frustumCulled={false}
          dispose={null}
        />
      </group>
    </>
  );
}
