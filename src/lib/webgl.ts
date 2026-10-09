/** One answer per strictness, so the probe's throwaway context is made once. */
const cache = new Map<boolean, boolean>();

/**
 * True when the browser can give us a WebGL2 context, which is the only kind
 * the installed three will ask for.
 *
 * `strict` also refuses a software renderer. The wave backdrop is cheap
 * enough to run on one; the hero's desk scene is not, so it asks strictly
 * and falls back to its poster instead.
 *
 * The probe context is released straight away so it does not count against
 * the browser's live-context limit.
 */
export function detectWebGL2(strict = false): boolean {
  if (typeof document === "undefined") return false;

  const cached = cache.get(strict);
  if (cached !== undefined) return cached;

  let supported = false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: strict,
    });
    supported = gl !== null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    supported = false;
  }

  cache.set(strict, supported);
  return supported;
}
