/**
 * The hero's scroll journey as data: where its stages begin, what the
 * terminal on the primary monitor types, and the three calls to action.
 * The 3D scene's own tunables (geometry, camera, lights) live in
 * `hero.scene.ts`; this file is what the DOM and the scene both read.
 */

/**
 * Coarse position along the hero's scroll track.
 *
 * - `static`   no journey: reduced motion, a very short viewport, or no JS
 * - `intro`    the room in full, with the hero text over it
 * - `zoom`     the camera is travelling to the primary monitor
 * - `handoff`  the screen fills the frame and the page is taking over
 * - `past`     the track has been scrolled through
 */
export type HeroStage = "static" | "intro" | "zoom" | "handoff" | "past";

/**
 * Whether the 3D scene is drawing. `off` is final for the session: WebGL is
 * missing, the context was lost, the device is too slow, or the scene threw.
 */
export type HeroSceneStatus = "pending" | "ready" | "off";

export type HeroTokenKind = "text" | "prompt" | "success" | "dim" | "accent";

export interface IHeroTerminalToken {
  text: string;
  kind: HeroTokenKind;
}

export interface IHeroTerminalLine {
  tokens: readonly IHeroTerminalToken[];
  /** True for a command: it is typed out a character at a time. Output
      lines appear whole. */
  typed?: boolean;
}

export interface IHeroTerminalSession {
  id: "aspnet" | "react" | "postgres" | "tests";
  title: string;
  /** Each line is at most 40 characters, so it fits the coarse-pointer grid. */
  lines: readonly IHeroTerminalLine[];
}

const prompt = (text: string): IHeroTerminalToken => ({ text, kind: "prompt" });
const text = (value: string): IHeroTerminalToken => ({ text: value, kind: "text" });
const dim = (value: string): IHeroTerminalToken => ({ text: value, kind: "dim" });
const success = (value: string): IHeroTerminalToken => ({ text: value, kind: "success" });
const accent = (value: string): IHeroTerminalToken => ({ text: value, kind: "accent" });

/**
 * What the primary monitor shows, one session after another. The 3D screen
 * paints these into a texture and the no-WebGL fallback renders the same
 * lines as HTML, so the two can never drift apart.
 *
 * The sessions are set dressing, not logs: the commands are illustrative.
 * Every figure in them is one the page already states elsewhere (133
 * endpoints, 4 roles, 180 files, 128 tests), so the prop never claims
 * something the rest of the site does not.
 */
export const heroTerminalSessions: readonly IHeroTerminalSession[] = [
  {
    id: "aspnet",
    title: "ASP.NET Core",
    lines: [
      { typed: true, tokens: [prompt("$ "), text("dotnet run --project Api")] },
      { tokens: [dim("Building...")] },
      { tokens: [dim("info: "), text("Clean Architecture API")] },
      { tokens: [dim("info: "), accent("133"), text(" endpoints mapped")] },
      { tokens: [dim("info: "), text("SignalR waiting room hub up")] },
      { tokens: [dim("info: "), text("Now listening on :5001")] },
      { tokens: [success("Application started.")] },
    ],
  },
  {
    id: "react",
    title: "React + TypeScript",
    lines: [
      { typed: true, tokens: [prompt("$ "), text("tsc --noEmit && pnpm build")] },
      { tokens: [dim("checking types (strict)...")] },
      { tokens: [success("✓ "), text("0 type errors")] },
      { tokens: [dim("building for production...")] },
      { tokens: [success("✓ "), accent("180+"), text(" React/TS files")] },
      { tokens: [success("✓ "), text("TanStack Query + Zustand")] },
      { tokens: [success("build complete")] },
    ],
  },
  {
    id: "postgres",
    title: "PostgreSQL",
    lines: [
      { typed: true, tokens: [prompt("db=> "), text("ALTER TABLE patients")] },
      { typed: true, tokens: [prompt("db-> "), text("ENABLE ROW LEVEL SECURITY;")] },
      { tokens: [dim("ALTER TABLE")] },
      { typed: true, tokens: [prompt("db=> "), text("CREATE POLICY tenant_isolation")] },
      { typed: true, tokens: [prompt("db-> "), text("ON patients USING (")] },
      { typed: true, tokens: [prompt("db-> "), accent("tenant_id"), text(" = current_tenant());")] },
      { tokens: [success("CREATE POLICY")] },
      { tokens: [dim("-- "), accent("4"), dim(" roles, one database")] },
    ],
  },
  {
    id: "tests",
    title: "Integration tests",
    lines: [
      { typed: true, tokens: [prompt("$ "), text("dotnet test")] },
      { tokens: [dim("Starting test execution...")] },
      { tokens: [dim("Running integration tests")] },
      { tokens: [success("Passed!"), text("  Failed: 0, Passed: "), accent("128")] },
      { tokens: [success("✓ "), text("128 integration tests passed")] },
    ],
  },
];

/**
 * Where the journey's stages and fades fall, as fractions of the scroll
 * track (0 at the top, 1 where the pinned stage releases).
 */
export const heroJourney = {
  /**
   * `[enter, leave]` for each stage. A stage is entered scrolling down at
   * the first value and left scrolling back up at the second; the gap keeps
   * a reader resting on a boundary from flickering between two stages.
   */
  stageEdges: {
    zoom: [0.1, 0.07],
    handoff: [0.76, 0.72],
    past: [1, 0.97],
  },
  /** The overlay fades over this fraction of a viewport as its bottom edge
      rises from the bottom of the screen. */
  overlayExitSpan: 0.6,
  /** Past this much of the fade the overlay stops taking clicks, so a link
      nobody can see is never pressed. */
  overlayInertAt: 0.85,
  /** The CSS poster behind the canvas fades out across this range. */
  backdropFade: [0.55, 0.8],
  /** The HTML terminal that stands in for stage 2 when the scene is off. */
  terminalFallback: { in: [0.3, 0.45], out: [0.62, 0.78] },
  mount: {
    /** The canvas mounts once the track is within a viewport of the screen. */
    rootMargin: "100% 0px",
    /** How long it lingers after the track leaves that window. Touch
        devices drop it at once: they are the ones short of GPU memory. */
    unmountAfterMs: { fine: 3000, coarse: 0 },
    /** A scene still not drawing after this long is given up on. */
    watchdogMs: 6000,
  },
} as const;

/**
 * The hand-over between the two canvases. While the hero's desk scene is in
 * front of the wave backdrop, the wave stops drawing and fades out; it comes
 * back as the camera reaches the screen.
 */
export const heroWaveRelay = {
  /** How long the wave takes to fade out behind the hero, and to fade back
      in at the hand-off, in milliseconds. */
  fadeMs: 600,
} as const;

export interface IHeroCta {
  label: string;
  href: string;
  variant: "solid" | "outline";
}

export const heroCtas: readonly IHeroCta[] = [
  { label: "Explore Interactive Work", href: "#projects", variant: "solid" },
  { label: "View Resume", href: "/resume", variant: "outline" },
  { label: "Contact Me", href: "#contact", variant: "outline" },
];
