import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { type HeroSceneStatus, heroJourney } from "@/src/data/hero";
import { useUiStore } from "@/src/store/ui.store";
import { useSceneEnvironment } from "./use.scene.environment.hook";

interface IUseHeroMountOptions {
  /** The scroll track is within a viewport of the screen. */
  isNear: boolean;
  scene: HeroSceneStatus;
}

// False on the server and for the hydration render, true on every client
// render after it. Nothing ever changes it, so there is nothing to subscribe to.
const subscribeNever = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;

/**
 * Decides whether the hero's canvas is in the tree at all.
 *
 * It is mounted only when all of these hold: the track is near the screen,
 * the device has WebGL2 on real graphics hardware, it has not asked to save
 * data or reported very little memory, and the scene has not already been
 * given up on. Everywhere else the stage shows its CSS poster, and the
 * browser has one WebGL context to look after instead of two.
 *
 * Giving up is final for the session: the scene status goes to `off` and
 * the store never lets it leave. Three things here can do that: a device
 * that cannot run the scene, a scene that throws, and a scene that is
 * mounted and on screen but still not drawing when the watchdog runs out.
 */
export function useHeroMount({ isNear, scene }: IUseHeroMountOptions) {
  const { isStrictSupported, isConstrained, coarsePointer } =
    useSceneEnvironment();
  // The environment answers "no WebGL" while hydrating, to match the server
  // HTML, and that looks the same as a real no. Both stores switch to their
  // client answer in the same render, so this flag marks the answers that
  // can be believed. Without it every visitor would be ruled out on load.
  const isHydrated = useSyncExternalStore(
    subscribeNever,
    getHydrated,
    getServerHydrated,
  );

  const stage = useUiStore((state) => state.heroStage);
  const setScene = useUiStore((state) => state.setHeroScene);

  const canRun = isStrictSupported && !isConstrained;
  const lingerMs =
    heroJourney.mount.unmountAfterMs[coarsePointer ? "coarse" : "fine"];

  // The canvas outlives the reader's departure by a grace period, so a quick
  // look below the hero does not cost a context and a shader recompile on
  // the way back. Adjusted during render, as React recommends for state
  // that follows a prop, because an effect may not set state synchronously.
  const [wasNear, setWasNear] = useState(isNear);
  const [isLingering, setIsLingering] = useState(false);
  if (isNear !== wasNear) {
    setWasNear(isNear);
    setIsLingering(!isNear && lingerMs > 0);
  }

  useEffect(() => {
    if (!isLingering) return;

    const timer = window.setTimeout(() => setIsLingering(false), lingerMs);
    return () => window.clearTimeout(timer);
  }, [isLingering, lingerMs]);

  // Ruled out at hydration rather than when the hero is next approached, so
  // the wave backdrop never stands down for a scene that will not come.
  useEffect(() => {
    if (isHydrated && !canRun) setScene("off");
  }, [isHydrated, canRun, setScene]);

  const isMounted = canRun && scene !== "off" && (isNear || isLingering);

  // Past the track, or before it has been measured, the scene's render loop
  // is stopped, and a scene that is not allowed to draw cannot be late.
  const isAwaited =
    isMounted && scene === "pending" && stage !== null && stage !== "past";

  useEffect(() => {
    if (!isAwaited) return;

    let timer = 0;

    // A hidden tab keeps running timers but stops drawing frames. Counting
    // that time would condemn a scene opened in a background tab for not
    // drawing while nothing asked it to, so the clock starts again from
    // zero each time the tab comes back.
    const arm = () => {
      window.clearTimeout(timer);
      if (document.visibilityState !== "visible") return;

      timer = window.setTimeout(
        () => setScene("off"),
        heroJourney.mount.watchdogMs,
      );
    };

    arm();
    document.addEventListener("visibilitychange", arm);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", arm);
    };
  }, [isAwaited, setScene]);

  // A chunk that fails to load and a render-loop bug both end up here.
  const handleError = useCallback(() => setScene("off"), [setScene]);

  return { isMounted, handleError };
}
