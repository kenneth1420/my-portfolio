"use client";

import { useHeroContextWatch } from "@/src/hook/use.hero.context.watch.hook";

/**
 * Watches the hero canvas for a lost WebGL context. Renders nothing; it sits
 * inside the `<Canvas>` so that it stops listening before R3F releases the
 * context on an ordinary unmount (see the hook).
 */
export default function HeroContextWatch() {
  useHeroContextWatch();
  return null;
}
