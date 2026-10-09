"use client";

import type { RefObject } from "react";
import type { HeroTheme, IHeroTier } from "@/src/data/hero.scene";
import type { IHeroFrame } from "@/src/hook/use.hero.rig.hook";
import { useHeroScreens } from "@/src/hook/use.hero.screens.hook";

interface IProps {
  theme: HeroTheme;
  tier: IHeroTier;
  isStatic: boolean;
  /** What the rig drew this frame; the terminal's fade is timed to it. */
  frame: RefObject<IHeroFrame>;
}

/**
 * The glass of the two monitors: a terminal typing on the primary, and code
 * scrolling on the secondary. Each is one textured quad set just in front
 * of its bezel.
 */
export default function HeroScreens(props: IProps) {
  const { primary, secondary } = useHeroScreens(props);

  return (
    <>
      {/* Disposal is handled by the hook, which owns the geometry, the
          materials and their textures. */}
      <mesh
        position={primary.position}
        rotation={primary.rotation}
        geometry={primary.geometry}
        material={primary.material}
        dispose={null}
      />
      <mesh
        position={secondary.position}
        rotation={secondary.rotation}
        geometry={secondary.geometry}
        material={secondary.material}
        dispose={null}
      />
    </>
  );
}
