import { create } from "zustand";
import type { ArchitectureLayerId } from "@/src/data/architecture";
import type { HeroSceneStatus, HeroStage } from "@/src/data/hero";

export type ArchitectureView = ArchitectureLayerId | "all";

interface IUiState {
  isCommandOpen: boolean;
  architectureView: ArchitectureView;
  /** Where the reader is along the hero's scroll track; null until the hero
      has mounted and measured. */
  heroStage: HeroStage | null;
  heroScene: HeroSceneStatus;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;
  setArchitectureView: (view: ArchitectureView) => void;
  setHeroStage: (stage: HeroStage | null) => void;
  setHeroScene: (status: HeroSceneStatus) => void;
}

/**
 * UI state that more than one part of the page needs: the command palette is
 * opened from the dock and from the keyboard, and it can also reset the
 * CliniQo diagram before scrolling to it. The hero's stage and scene status
 * are here because two canvases coordinate through them: the sky backdrop
 * stands down while the hero's desk scene covers it.
 *
 * Only coarse, rarely-changing values belong here. Scroll progress itself
 * changes every frame and stays out, in a motion value the render loop reads.
 */
export const useUiStore = create<IUiState>((set) => ({
  isCommandOpen: false,
  architectureView: "all",
  heroStage: null,
  heroScene: "pending",
  setCommandOpen: (open) => set({ isCommandOpen: open }),
  toggleCommand: () => set((state) => ({ isCommandOpen: !state.isCommandOpen })),
  setArchitectureView: (view) => set({ architectureView: view }),
  // Both setters return the same state when nothing changes, which zustand
  // treats as no update: a scroll listener can call them freely.
  setHeroStage: (stage) =>
    set((state) => (state.heroStage === stage ? state : { heroStage: stage })),
  // "off" is final. A scene that failed once is not retried this session.
  setHeroScene: (status) =>
    set((state) =>
      state.heroScene === status || state.heroScene === "off"
        ? state
        : { heroScene: status },
    ),
}));
