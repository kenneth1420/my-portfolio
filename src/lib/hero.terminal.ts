import type { IHeroTerminalLine, IHeroTerminalSession } from "@/src/data/hero";
import {
  heroEditor,
  heroTerminalFont,
  type heroTyping,
  type IHeroPalette,
  type IHeroTerminalGrid,
} from "@/src/data/hero.scene";

/**
 * What the two monitors show, and how the terminal types.
 *
 * The painters draw into a 2D canvas the scene then uses as a texture. A
 * session is painted whole, once; the typing is not repainting. The shader
 * hides every cell past a caret, and `advanceTyping` only moves that caret,
 * so a keystroke costs a uniform write and never a texture upload.
 *
 * Text goes through `fillText` in a system font. Nothing is fetched.
 */

// ── Typing ───────────────────────────────────────────────────────────────

export interface IHeroTyping {
  /** Index of the session on screen. */
  session: number;
  /** The line the caret is on. Lines above it are complete. */
  line: number;
  /** Cells revealed on that line. Fractional while a character is due. */
  column: number;
  /** Seconds to sit still before the next step. */
  wait: number;
  /** Seconds spent with the session finished. */
  rest: number;
  /** Running time for the caret's blink. */
  blink: number;
}

type HeroTypingTiming = typeof heroTyping;

/** Something a caret can be written into; three's `Vector3` fits. */
interface ICaretTarget {
  set(x: number, y: number, z: number): unknown;
}

/** Cells a line occupies. Counted in code points, as the painter draws. */
export const lineLength = (line: IHeroTerminalLine) =>
  line.tokens.reduce((sum, token) => sum + Array.from(token.text).length, 0);

/** Cells taken by the prompt a typed line opens with. It is not typed: it
    is simply there when the caret reaches the line. */
export function promptLength(line: IHeroTerminalLine) {
  let length = 0;
  for (const token of line.tokens) {
    if (token.kind !== "prompt") break;
    length += Array.from(token.text).length;
  }
  return length;
}

export const createTyping = (): IHeroTyping => ({
  session: 0,
  line: 0,
  column: 0,
  wait: 0,
  rest: 0,
  blink: 0,
});

/** Puts the caret at the start of a session, ready to type its first line. */
export function startTyping(
  state: IHeroTyping,
  session: number,
  lines: readonly IHeroTerminalLine[],
  timing: HeroTypingTiming,
) {
  const first = lines[0];
  state.session = session;
  state.line = 0;
  state.column = first?.typed ? promptLength(first) : 0;
  state.wait = timing.startDelay;
  state.rest = 0;
  state.blink = 0;
}

/** Jumps to the end of a session: every line shown, nothing left to type. */
export function finishTyping(state: IHeroTyping, lines: readonly IHeroTerminalLine[]) {
  state.line = lines.length;
  state.column = 0;
  state.wait = 0;
}

export const isTypingDone = (state: IHeroTyping, lines: readonly IHeroTerminalLine[]) =>
  state.line >= lines.length;

/**
 * Advances the caret by `delta` seconds.
 *
 * A command is typed a character at a time after its prompt; a line of
 * output appears whole, a beat after the one before it. The time is spent
 * in a loop, not one step per call, so a long frame types the several
 * characters it covers and the session takes the same time at any frame
 * rate.
 */
export function advanceTyping(
  state: IHeroTyping,
  lines: readonly IHeroTerminalLine[],
  delta: number,
  timing: HeroTypingTiming,
) {
  state.blink += delta;
  let budget = delta;

  while (budget > 0 && state.line < lines.length) {
    if (state.wait > 0) {
      const spent = Math.min(state.wait, budget);
      state.wait -= spent;
      budget -= spent;
      continue;
    }

    const line = lines[state.line];
    const length = lineLength(line);

    if (line.typed && state.column < length) {
      const remaining = length - state.column;
      const reach = budget * timing.charsPerSecond;

      if (reach < remaining) {
        state.column += reach;
        budget = 0;
      } else {
        state.column = length;
        budget -= remaining / timing.charsPerSecond;
        state.wait = timing.commandPause;
      }
      continue;
    }

    // This line is done, or is output arriving whole: move the caret on.
    state.line += 1;
    const next = lines[state.line];
    if (next) {
      state.column = next.typed ? promptLength(next) : 0;
      state.wait = next.typed ? timing.promptPause : timing.outputBeat;
    } else {
      state.column = 0;
    }
  }

  if (state.line >= lines.length) state.rest += budget;
}

/**
 * Writes the caret for the shader: cells revealed on the caret's row, the
 * row itself, and whether the caret block shows. The block is solid while
 * typing and blinks while waiting, like a real terminal's.
 */
export function readCaret(
  state: IHeroTyping,
  lines: readonly IHeroTerminalLine[],
  timing: HeroTypingTiming,
  out: ICaretTarget,
) {
  const line = lines[state.line];
  const isTyping =
    line !== undefined && line.typed === true && state.wait <= 0 && state.column < lineLength(line);
  const isLit = isTyping || (state.blink * timing.blinkRate) % 1 < 0.5;

  out.set(Math.floor(state.column), state.line, isLit ? 1 : 0);
}

// ── Painting ─────────────────────────────────────────────────────────────

const font = (weight: number, size: number) => `${weight} ${size}px ${heroTerminalFont}`;

/** The strip above the grid: one tab per session, the open one underlined. */
function paintTabs(
  context: CanvasRenderingContext2D,
  grid: IHeroTerminalGrid,
  palette: IHeroPalette,
  sessions: readonly IHeroTerminalSession[],
  active: number,
) {
  const size = grid.tabFontSize;
  const baseline = grid.origin[1] * 0.42;
  let x = grid.origin[0];

  context.font = font(500, size);
  context.textAlign = "left";
  context.textBaseline = "middle";

  sessions.forEach((session, index) => {
    const width = context.measureText(session.title).width;
    const isActive = index === active;

    context.fillStyle = isActive ? palette.ink.text : palette.ink.dim;
    context.fillText(session.title, x, baseline);

    if (isActive) {
      context.fillStyle = palette.ink.prompt;
      context.fillRect(x, baseline + size * 0.8, width, Math.max(2, size * 0.1));
    }
    x += width + size * 1.6;
  });

  // A hairline between the strip and the grid.
  context.globalAlpha = 0.35;
  context.fillStyle = palette.ink.dim;
  context.fillRect(
    grid.origin[0],
    grid.origin[1] - grid.cell[1] * 0.4,
    grid.cols * grid.cell[0],
    2,
  );
  context.globalAlpha = 1;
}

/**
 * Paints one session, finished, onto the terminal canvas.
 *
 * Each character is drawn centred in its own cell instead of letting the
 * font lay the line out. System monospace faces differ in advance width, and
 * the shader's mask is a grid: this keeps every glyph inside the cell the
 * mask thinks it is in, on any platform.
 */
export function paintTerminal(
  context: CanvasRenderingContext2D,
  grid: IHeroTerminalGrid,
  palette: IHeroPalette,
  sessions: readonly IHeroTerminalSession[],
  active: number,
) {
  const [originX, originY] = grid.origin;
  const [cellWidth, cellHeight] = grid.cell;

  context.fillStyle = palette.paper;
  context.fillRect(0, 0, grid.width, grid.height);

  paintTabs(context, grid, palette, sessions, active);

  context.textAlign = "center";
  context.textBaseline = "middle";

  const lines = sessions[active]?.lines ?? [];

  lines.slice(0, grid.rows).forEach((line, row) => {
    const y = originY + (row + 0.5) * cellHeight;
    let col = 0;

    for (const token of line.tokens) {
      // The figures are the point of each session, so they carry weight.
      context.font = font(token.kind === "accent" ? 700 : 500, grid.fontSize);
      context.fillStyle = palette.ink[token.kind];

      for (const character of token.text) {
        if (col >= grid.cols) break;
        if (character !== " ") {
          context.fillText(character, originX + (col + 0.5) * cellWidth, y);
        }
        col += 1;
      }
    }
  });
}

/**
 * Paints the secondary monitor: a column of line-number ticks and rows of
 * coloured bars standing in for code. Drawn once per theme; the scene then
 * scrolls it by sliding the texture, which uploads nothing.
 */
export function paintEditor(context: CanvasRenderingContext2D, palette: IHeroPalette) {
  const { width, height, unit, gutter, rows } = heroEditor;
  const rowHeight = height / rows.length;
  const barHeight = rowHeight * 0.4;

  context.fillStyle = palette.editorPaper;
  context.fillRect(0, 0, width, height);

  rows.forEach(([indent, tokens], row) => {
    const y = row * rowHeight + (rowHeight - barHeight) / 2;

    context.globalAlpha = 0.45;
    context.fillStyle = palette.ink.dim;
    context.fillRect(unit * 1.5, y, unit * 1.5, barHeight);
    context.globalAlpha = 1;

    let x = gutter + indent * unit * 2;
    for (const [kind, length] of tokens) {
      context.fillStyle = palette.ink[kind];
      // Half a unit of air between one bar and the next.
      context.fillRect(x, y, length * unit - unit / 2, barHeight);
      x += length * unit;
    }
  });
}

/**
 * Paints a white disc that fades to nothing at its edge. The halos and the
 * floor shadow tint it and stretch it; the falloff is eased so neither shows
 * a visible rim.
 */
export function paintSoftDisc(context: CanvasRenderingContext2D, size: number) {
  const centre = size / 2;
  const gradient = context.createRadialGradient(centre, centre, 0, centre, centre, centre);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.25, "rgba(255, 255, 255, 0.72)");
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.32)");
  gradient.addColorStop(0.75, "rgba(255, 255, 255, 0.08)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  context.clearRect(0, 0, size, size);
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
}
