import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo } from "react";
import {
  CanvasTexture,
  Color,
  MathUtils,
  MeshBasicMaterial,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  Vector2,
  Vector3,
} from "three";
import { terminalMask, terminalPars } from "@/src/components/scene/hero.shaders";
import { heroTerminalSessions } from "@/src/data/hero";
import {
  heroAnisotropy,
  heroEditor,
  heroPalettes,
  heroRig,
  heroScreens,
  heroTyping,
  type HeroTheme,
  type IHeroPalette,
  type IHeroScreen,
  type IHeroTerminalGrid,
  type IHeroTier,
} from "@/src/data/hero.scene";
import {
  advanceTyping,
  createTyping,
  finishTyping,
  isTypingDone,
  paintEditor,
  paintTerminal,
  readCaret,
  startTyping,
} from "@/src/lib/hero.terminal";
import type { IHeroFrame } from "./use.hero.rig.hook";

interface IUseHeroScreensOptions {
  theme: HeroTheme;
  tier: IHeroTier;
  isStatic: boolean;
  /** What the rig drew this frame: where the camera is, and whether it is
      still on its way somewhere. */
  frame: RefObject<IHeroFrame>;
}

type Terminal = ReturnType<typeof createTerminal>;
type Editor = ReturnType<typeof createEditor>;

/** An off-DOM canvas to paint a texture on. Null where 2D canvas is refused. */
function createSurface(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return { canvas, context: canvas.getContext("2d") };
}

function createTerminal(grid: IHeroTerminalGrid, anisotropy: number) {
  const { canvas, context } = createSurface(grid.width, grid.height);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  // The screen is small and slanted for the first half of the journey;
  // without this its text shimmers as the camera moves.
  texture.anisotropy = anisotropy;

  const uniforms = {
    uOrigin: {
      value: new Vector2(grid.origin[0] / grid.width, grid.origin[1] / grid.height),
    },
    uCell: {
      value: new Vector2(grid.cell[0] / grid.width, grid.cell[1] / grid.height),
    },
    uCaret: { value: new Vector3() },
    uPaper: { value: new Color() },
    uCaretColor: { value: new Color() },
    uInk: { value: 1 },
  };

  // Unlit and untonemapped: the screen is its own light source, and its
  // paper has to come out as exactly the page's background colour.
  const material = new MeshBasicMaterial({ map: texture, toneMapped: false });

  material.onBeforeCompile = (shader) => {
    // Same objects, not copies: writing `.value` in the loop reaches the GPU.
    Object.assign(shader.uniforms, uniforms);

    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${terminalPars}`)
      .replace("#include <map_fragment>", `#include <map_fragment>\n${terminalMask}`);
  };

  // Without a distinct key three could hand this material the unpatched
  // program it compiled for the other screen.
  material.customProgramCacheKey = () => "hero-terminal";

  return { grid, context, texture, uniforms, material, typing: createTyping() };
}

function createEditor() {
  const { canvas, context } = createSurface(heroEditor.width, heroEditor.height);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  // Wraps vertically, so the code can scroll by sliding the texture.
  texture.wrapT = RepeatWrapping;

  // Opaque, but flagged transparent so it compiles to the same program as
  // the halo and shadow quads instead of one of its own. It still writes
  // depth, so nothing behind it shows through.
  const material = new MeshBasicMaterial({
    map: texture,
    toneMapped: false,
    transparent: true,
  });

  return { context, texture, material, scroll: { row: 0, wait: heroEditor.stepSeconds } };
}

const createGlass = (screen: IHeroScreen) => new PlaneGeometry(...screen.size);

/** Where a screen's quad goes: on its glass, turned to face the same way. */
const placeGlass = (screen: IHeroScreen) => ({
  position: [...screen.centre] as [number, number, number],
  rotation: [0, MathUtils.degToRad(screen.yaw), 0] as [number, number, number],
});

const PRIMARY = placeGlass(heroScreens.primary);
const SECONDARY = placeGlass(heroScreens.secondary);

const sessionLines = (index: number) => heroTerminalSessions[index]?.lines ?? [];

/** Paints the session the terminal is on and queues the upload. */
function paintSession(terminal: Terminal, palette: IHeroPalette) {
  if (!terminal.context) return;
  paintTerminal(
    terminal.context,
    terminal.grid,
    palette,
    heroTerminalSessions,
    terminal.typing.session,
  );
  terminal.texture.needsUpdate = true;
}

/**
 * Brings both screens in line with the theme: the terminal's session and the
 * editor's bars are repainted, and the mask is told the new paper colour.
 * These are the only texture uploads a theme change makes.
 */
function applyScreenPalette(terminal: Terminal, editor: Editor, palette: IHeroPalette) {
  terminal.uniforms.uPaper.value.set(palette.paper);
  terminal.uniforms.uCaretColor.value.set(palette.ink.text);
  paintSession(terminal, palette);

  if (editor.context) {
    paintEditor(editor.context, palette);
    editor.texture.needsUpdate = true;
  }
}

/** Sets the terminal to the start of its first session, or to the end of it
    when nothing is going to move. */
function resetTyping(terminal: Terminal, isStatic: boolean) {
  startTyping(terminal.typing, 0, sessionLines(0), heroTyping);
  if (isStatic) finishTyping(terminal.typing, sessionLines(0));
}

interface IScreensFrame {
  terminal: Terminal;
  editor: Editor;
  frame: IHeroFrame;
  palette: IHeroPalette;
  delta: number;
  isStatic: boolean;
}

/**
 * One render-loop step for the two screens. A plain function, as in the wave
 * field hook: it mutates uniforms and textures the hook owns, which the
 * React Compiler lint rules forbid inside the hook body itself.
 *
 * Time comes from the accumulated `delta`, not the canvas clock: the clock
 * is reset whenever the frame loop is paused and resumed.
 */
function advanceScreens({
  terminal,
  editor,
  frame,
  palette,
  delta: rawDelta,
  isStatic,
}: IScreensFrame) {
  const { typing, uniforms } = terminal;
  const delta = Math.min(rawDelta, heroRig.maxDelta);
  const lines = sessionLines(typing.session);

  if (!isStatic) {
    advanceTyping(typing, lines, delta, heroTyping);

    // A new session means a repaint and an upload. It waits until the
    // camera has settled, and is skipped once the screen fills the frame:
    // a hitch there would land in the middle of the hand-off.
    const mayRepaint = !frame.moving && frame.p <= heroRig.repaintLimit;

    if (isTypingDone(typing, lines) && typing.rest >= heroTyping.hold && mayRepaint) {
      const next = (typing.session + 1) % heroTerminalSessions.length;
      startTyping(typing, next, sessionLines(next), heroTyping);
      paintSession(terminal, palette);
    }

    const { scroll } = editor;
    scroll.wait -= delta;
    if (scroll.wait <= 0) {
      scroll.wait += heroEditor.stepSeconds;
      scroll.row = (scroll.row + 1) % heroEditor.rows.length;
      // Sampling one row lower each step moves the picture up by one.
      editor.texture.offset.y = 1 - scroll.row / heroEditor.rows.length;
    }
  }

  // The two writes that typing costs.
  readCaret(typing, sessionLines(typing.session), heroTyping, uniforms.uCaret.value);
  if (isStatic) uniforms.uCaret.value.z = 0;

  const [inkFrom, inkTo] = heroRig.inkFade;
  const ink = isStatic ? 1 : 1 - MathUtils.smoothstep(frame.p, inkFrom, inkTo);
  // With no 2D canvas there is no text to show, only an unpainted texture:
  // leave the screen as blank paper.
  uniforms.uInk.value = terminal.context ? ink : 0;
}

/**
 * Builds and drives the two monitors' glass.
 *
 * The primary shows a terminal that types through the sessions in
 * `data/hero`; the secondary shows scrolling bars of code. Both are canvas
 * textures drawn here in the browser, so no font or image is fetched. Per
 * frame the CPU moves a caret and steps a texture offset; a texture is
 * uploaded only when the session or the theme changes.
 */
export function useHeroScreens({ theme, tier, isStatic, frame }: IUseHeroScreensOptions) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const palette = heroPalettes[theme];

  const anisotropy = Math.min(heroAnisotropy, gl.capabilities.getMaxAnisotropy());
  const terminal = useMemo(
    () => createTerminal(tier.terminal, anisotropy),
    [tier.terminal, anisotropy],
  );
  const editor = useMemo(() => createEditor(), []);
  const primaryGlass = useMemo(() => createGlass(heroScreens.primary), []);
  const secondaryGlass = useMemo(() => createGlass(heroScreens.secondary), []);

  useEffect(
    () => () => {
      terminal.texture.dispose();
      terminal.material.dispose();
    },
    [terminal],
  );
  useEffect(
    () => () => {
      editor.texture.dispose();
      editor.material.dispose();
    },
    [editor],
  );
  useEffect(() => () => primaryGlass.dispose(), [primaryGlass]);
  useEffect(() => () => secondaryGlass.dispose(), [secondaryGlass]);

  // A still scene shows a finished session; a moving one starts typing. This
  // runs before the palette effect below, which paints whichever it set.
  useEffect(() => {
    resetTyping(terminal, isStatic);
  }, [terminal, isStatic]);

  // `invalidate` matters in the still mode, where the canvas only renders
  // on demand.
  useEffect(() => {
    applyScreenPalette(terminal, editor, palette);
    invalidate();
  }, [terminal, editor, palette, isStatic, invalidate]);

  useFrame((_, delta) => {
    advanceScreens({
      terminal,
      editor,
      frame: frame.current,
      palette,
      delta,
      isStatic,
    });
  });

  return {
    primary: { ...PRIMARY, geometry: primaryGlass, material: terminal.material },
    secondary: { ...SECONDARY, geometry: secondaryGlass, material: editor.material },
  };
}
