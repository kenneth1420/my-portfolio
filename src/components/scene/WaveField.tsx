"use client";

import type { ISceneDensity, IScenePalette } from "@/src/data/scene";
import { sceneField } from "@/src/data/scene";
import { useWaveField } from "@/src/hook/use.wave.field.hook";

interface IProps {
  palette: IScenePalette;
  density: ISceneDensity;
  reducedMotion: boolean;
}

/**
 * The digital wave fabric and the mint point light that hovers over the
 * cursor's spot on it. One instanced draw call for every node.
 */
export default function WaveField(props: IProps) {
  const { geometry, material, count, lightRef, palette } = useWaveField(props);

  return (
    <>
      {/* Keyed on count so a density change rebuilds the instanced buffer.
          Culling is off because every instance matrix is identity — the real
          positions come from the shader — so three's bounding sphere is
          meaningless and would cull the whole fabric. Disposal is handled by
          the hook, which owns the geometry and material. */}
      <instancedMesh
        key={count}
        args={[geometry, material, count]}
        frustumCulled={false}
        dispose={null}
      />
      <pointLight
        ref={lightRef}
        color={palette.accent}
        intensity={palette.pointIntensity}
        distance={sceneField.lightDistance}
        decay={2}
      />
    </>
  );
}
