"use client";

import type { ISceneDensity, IScenePalette } from "@/src/data/scene";
import { sceneCamera } from "@/src/data/scene";
import { useStarDust } from "@/src/hook/use.star.dust.hook";

interface IProps {
  palette: IScenePalette;
  density: ISceneDensity;
  reducedMotion: boolean;
}

/**
 * Star dust: faint unlinked specks filling the space around the camera, the
 * deepest layer of the sky. One draw call.
 */
export default function StarDust(props: IProps) {
  const { pointsRef, geometry, material } = useStarDust(props);

  return (
    <>
      {/* Centred on the camera's target, so the drift turns the dust around
          the middle of the screen. Disposal is handled by the hook. */}
      <points
        ref={pointsRef}
        args={[geometry, material]}
        position={[...sceneCamera.target]}
        dispose={null}
      />
    </>
  );
}
