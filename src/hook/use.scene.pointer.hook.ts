import { useEffect, useRef } from "react";

export interface IScenePointer {
  /** Normalised device coordinates: -1…1, with y pointing up. */
  x: number;
  y: number;
  /** True while a mouse is over the page or a finger is on the screen. */
  active: boolean;
}

/**
 * Tracks the pointer across the whole window for a WebGL scene whose canvas
 * has `pointer-events: none`, so the canvas itself never receives events.
 *
 * Writes into a ref rather than state: the render loop reads it every frame,
 * and a React update per pointer move would cost a re-render for nothing.
 *
 * Mouse movement is tracked while the cursor is over the page. Touch is
 * tracked only while a finger is down, so a phone's scene relaxes back to idle
 * when the user lets go instead of freezing where they last touched.
 */
export function useScenePointer(enabled = true) {
  const pointer = useRef<IScenePointer>({ x: 0, y: 0, active: false });

  useEffect(() => {
    if (!enabled) return;

    const state = pointer.current;

    const handlePointerMove = (event: PointerEvent) => {
      state.x = (event.clientX / window.innerWidth) * 2 - 1;
      state.y = -(event.clientY / window.innerHeight) * 2 + 1;
      // A touch only moves while pressed. A mouse reports a move on hover.
      state.active = event.pointerType === "mouse" || event.buttons > 0;
    };

    const handleTouchEnd = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") state.active = false;
    };

    const handleLeave = () => {
      state.active = false;
    };

    const root = document.documentElement;

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handleTouchEnd, { passive: true });
    // Fires when the browser takes over a touch for scrolling.
    window.addEventListener("pointercancel", handleTouchEnd, { passive: true });
    root.addEventListener("pointerleave", handleLeave);
    window.addEventListener("blur", handleLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerMove);
      window.removeEventListener("pointerup", handleTouchEnd);
      window.removeEventListener("pointercancel", handleTouchEnd);
      root.removeEventListener("pointerleave", handleLeave);
      window.removeEventListener("blur", handleLeave);
      state.active = false;
    };
  }, [enabled]);

  return pointer;
}
