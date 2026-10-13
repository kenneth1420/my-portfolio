import { useSyncExternalStore } from "react";
import { detectWebGL2 } from "@/src/lib/webgl";

export interface ISceneEnvironment {
  /** WebGL2 is available at all. Enough for the sky backdrop. */
  isSupported: boolean;
  /** WebGL2 on real graphics hardware. The hero's desk scene needs this. */
  isStrictSupported: boolean;
  /** The visitor asked to save data, or the device reports very little
      memory. Heavy decoration should stand down. */
  isConstrained: boolean;
  coarsePointer: boolean;
  devicePixelRatio: number;
  reducedMotion: boolean;
}

type StaticEnvironment = Omit<ISceneEnvironment, "reducedMotion">;

/** What the server assumes: nothing fancy. Hydration starts from this too,
    so server HTML and the first client render always agree. */
const SERVER_ENVIRONMENT: StaticEnvironment = {
  isSupported: false,
  isStrictSupported: false,
  isConstrained: true,
  coarsePointer: true,
  devicePixelRatio: 1,
};

interface IDeviceHints {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
}

function readEnvironment(): StaticEnvironment {
  const hints = navigator as Navigator & IDeviceHints;

  return {
    isSupported: detectWebGL2(),
    isStrictSupported: detectWebGL2(true),
    // Both hints are Chromium-only; elsewhere they are simply absent and
    // the device is treated as unconstrained.
    isConstrained:
      hints.connection?.saveData === true ||
      (hints.deviceMemory !== undefined && hints.deviceMemory <= 2),
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    devicePixelRatio: window.devicePixelRatio || 1,
  };
}

// Read once per page load and kept: `useSyncExternalStore` needs the same
// object back each time, and none of these change while the page is open.
let clientEnvironment: StaticEnvironment | null = null;

const getClientEnvironment = () => (clientEnvironment ??= readEnvironment());
const getServerEnvironment = () => SERVER_ENVIRONMENT;
const subscribeNever = () => () => {};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
// The server cannot know the preference; "reduced" is the safe answer.
const getServerReducedMotion = () => true;

/**
 * What the device can do, for anything that has to decide how much WebGL to
 * run: support, pointer type, pixel density, and the reduced-motion setting.
 *
 * Safe in server-rendered components. During hydration it reports the
 * conservative server answer, then the real one a moment later. A component
 * mounted on the client only (the canvases, loaded with `ssr: false`) gets
 * the real answer on its first render, so a scene is built at the right
 * density first time instead of building twice.
 *
 * Reduced motion is live: switching it on mid-session takes effect at once.
 */
export function useSceneEnvironment(): ISceneEnvironment {
  const environment = useSyncExternalStore(
    subscribeNever,
    getClientEnvironment,
    getServerEnvironment,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );

  return { ...environment, reducedMotion };
}
