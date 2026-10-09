/**
 * GLSL patched into three's MeshBasicMaterial for the hero's terminal
 * screen, via `onBeforeCompile`.
 *
 * The terminal texture always holds a whole, finished session. These few
 * lines decide how much of it shows: every character cell past a caret is
 * replaced with the screen's paper colour. Typing therefore moves a uniform
 * and never re-uploads the texture, which on a phone is the difference
 * between a free keystroke and a dropped frame.
 *
 * Patching the stock material keeps three's own texture sampling and colour
 * management, so the paper comes out as exactly the page's background.
 */

/** Declarations added to the fragment shader's global scope. */
export const terminalPars = /* glsl */ `
uniform vec2 uOrigin;        // top-left of the first cell, in uv with y down
uniform vec2 uCell;          // one cell, in uv
uniform vec3 uCaret;         // cells shown on the caret's row, that row, caret block 0..1
uniform vec3 uPaper;
uniform vec3 uCaretColor;
uniform float uInk;          // 1 = text at full strength, 0 = blank paper
`;

/**
 * Runs after `<map_fragment>`, so `diffuseColor` holds the painted texel.
 *
 * A cell shows if its row is above the caret's, or it is on the caret's row
 * and left of the caret. Rows above the grid have a negative index and so
 * always pass, which is what keeps the tab strip in view. `uInk` then fades
 * the whole screen to paper as the camera closes in: text magnified that far
 * is a blur, and blank paper is what the page can take over from.
 */
export const terminalMask = /* glsl */ `
vec2 cell = floor((vec2(vMapUv.x, 1.0 - vMapUv.y) - uOrigin) / uCell);
float onCaretRow = step(abs(cell.y - uCaret.y), 0.5);
float typed = step(cell.y, uCaret.y - 0.5) + onCaretRow * step(cell.x, uCaret.x - 0.5);
float block = onCaretRow * step(abs(cell.x - uCaret.x), 0.5) * uCaret.z;

vec3 shown = mix(uPaper, diffuseColor.rgb, clamp(typed, 0.0, 1.0));
shown = mix(shown, uCaretColor, block);
diffuseColor.rgb = mix(uPaper, shown, uInk);
`;
