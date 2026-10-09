import {
  cubicBezier,
  type MotionValue,
  transform,
  useMotionValueEvent,
  useTransform,
  type Variants,
} from "motion/react";
import { useEffect, useState } from "react";
import {
  heroJourney,
  heroTerminalSessions,
  type IHeroTerminalLine,
  type IHeroTerminalSession,
  type IHeroTerminalToken,
} from "@/src/data/hero";

/** Seconds per typed character: about 26 a second, a quick but human hand. */
const CHAR_S = 0.038;
/** Beat before a session's first line, so the swap is seen before the typing. */
const LEAD_IN_S = 0.3;
/** Pause after a command, before whatever follows it. */
const AFTER_COMMAND_S = 0.22;
/** Gap between one line of output and the next. */
const OUTPUT_STEP_S = 0.14;
/** Fade for a line of output, and for a command's prompt. */
const OUTPUT_FADE_S = 0.12;
/** How long a finished session stays up before the next replaces it. With
    the typing, a session lasts about seven seconds, as on the 3D monitor. */
const HOLD_S = 4;
/** The panel grows this much as it fades out, as the 3D camera pushes into
    its screen at the same point in the journey. */
const EXIT_SCALE = 1.12;

/** The site's ease-out: fast start, long settle. Matches the CSS `--ease-out`. */
const EASE_OUT = cubicBezier(0.22, 1, 0.36, 1);

// motion wants mutable arrays for its ranges; the data is frozen tuples.
const FADE_IN = [...heroJourney.terminalFallback.in];
const FADE_OUT = [...heroJourney.terminalFallback.out];

// Eased on the way in, so the panel is all but opaque two thirds through
// its window and the reader is not left squinting at a half-faded prompt.
const resolveEntry = transform(FADE_IN, [0, 1], { ease: EASE_OUT });
const resolveExit = transform(FADE_OUT, [1, 0]);

/** Between the first moment of the fade in and the last of the fade out. */
const isOnScreen = (p: number) => p > FADE_IN[0] && p < FADE_OUT[1];

export interface IHeroTerminalScriptLine {
  /** Shown as soon as the line starts: the prompt of a command, or nothing. */
  lead: readonly IHeroTerminalToken[];
  /** What follows: typed out for a command, shown whole for output. */
  body: readonly IHeroTerminalToken[];
  typed: boolean;
  /** Seconds from the start of the session to this line. */
  delay: number;
  /** Seconds the body takes to appear. */
  duration: number;
}

const tokenLength = (tokens: readonly IHeroTerminalToken[]) =>
  tokens.reduce((sum, token) => sum + token.text.length, 0);

/** A command's prompt is already on screen when the typing starts, as in a
    real shell, so it is split off from what gets typed. */
function splitLine({ tokens, typed = false }: IHeroTerminalLine) {
  const firstTyped = typed
    ? tokens.findIndex((token) => token.kind !== "prompt")
    : 0;
  const cut = firstTyped === -1 ? tokens.length : firstTyped;

  return { lead: tokens.slice(0, cut), body: tokens.slice(cut), typed };
}

/**
 * Lays a session out in time: each command types at a steady rate, and each
 * line of output follows the one before it. The timings are worked out once,
 * here, and handed to motion as delays, so playing a session costs no
 * timers and no re-renders.
 */
function buildScript(session: IHeroTerminalSession) {
  let clock = LEAD_IN_S;

  const lines = session.lines.map((line): IHeroTerminalScriptLine => {
    const { lead, body, typed } = splitLine(line);
    const duration = typed ? tokenLength(body) * CHAR_S : OUTPUT_FADE_S;
    const delay = clock;
    clock += typed ? duration + AFTER_COMMAND_S : OUTPUT_STEP_S;

    return { lead, body, typed, delay, duration };
  });

  return { lines, durationMs: (clock + HOLD_S) * 1000 };
}

const SCRIPTS = heroTerminalSessions.map(buildScript);

/** Every line appears at its own moment. */
const lineVariants: Variants = {
  hidden: { opacity: 0 },
  shown: ({ delay }: IHeroTerminalScriptLine) => ({
    opacity: 1,
    transition: { delay, duration: OUTPUT_FADE_S },
  }),
};

/**
 * A command is wiped in from the left at typing speed. A clip, not a
 * character count: the site's one typeface is proportional, so there is no
 * fixed cell to step by, and a wipe needs no re-render per keystroke.
 */
const typedVariants: Variants = {
  hidden: { clipPath: "inset(0% 100% 0% 0%)" },
  shown: ({ delay, duration }: IHeroTerminalScriptLine) => ({
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { delay, duration, ease: "linear" },
  }),
};

/**
 * Drives the HTML terminal that stands in for the journey's second stage
 * when the 3D scene is off: when it is visible, how large it is, and which
 * session it is showing.
 *
 * The fade and the scale come straight from scroll progress, with no React
 * state. Sessions advance on a timer that runs only while the panel is on
 * screen, so a reader who never reaches it, or has scrolled past it, pays
 * for nothing.
 */
export function useHeroTerminal(progress: MotionValue<number>) {
  const opacity = useTransform(
    progress,
    (p) => resolveEntry(p) * resolveExit(p),
  );
  const scale = useTransform(progress, FADE_OUT, [1, EXIT_SCALE]);

  const [isShowing, setIsShowing] = useState(() => isOnScreen(progress.get()));
  const [index, setIndex] = useState(0);

  // Setting the same boolean again is free: React bails out of it.
  useMotionValueEvent(progress, "change", (p) => setIsShowing(isOnScreen(p)));

  const { lines, durationMs } = SCRIPTS[index];

  useEffect(() => {
    if (!isShowing) return;

    const timer = window.setTimeout(
      () => setIndex((current) => (current + 1) % SCRIPTS.length),
      durationMs,
    );
    return () => window.clearTimeout(timer);
  }, [isShowing, index, durationMs]);

  return {
    opacity,
    scale,
    isShowing,
    session: heroTerminalSessions[index],
    sessions: heroTerminalSessions,
    lines,
    lineVariants,
    typedVariants,
  };
}
