/**
 * GLSL patched into three's MeshStandardMaterial via `onBeforeCompile`.
 *
 * Patching the stock material rather than writing a ShaderMaterial keeps real
 * three.js lighting: the ambient and point lights in the scene shade every node
 * with no lighting code here. All motion happens on the GPU. Each instance
 * carries only its grid coordinate, and the instance matrices stay identity,
 * so the CPU never writes per-node data after mount.
 */

/** Declarations added to the vertex shader's global scope. */
export const vertexPars = /* glsl */ `
attribute vec2 aGrid;        // -1..1 across the fabric
uniform float uTime;
uniform vec2 uExtent;        // half-width, half-depth in world units
uniform float uOffsetZ;
uniform float uAmplitude;
uniform vec3 uPointer;       // cursor's spot on the fabric, world space
uniform float uStrength;     // 0..1, eased in and out with pointer presence
uniform float uRadius;
uniform float uLift;
uniform float uPush;
uniform float uSwell;
varying float vInfluence;
varying float vFade;
`;

/**
 * Runs after `<begin_vertex>`, so `transformed` holds the node's local vertex.
 * The node is scaled in place, then moved to its spot on the wave. Because the
 * scale is uniform and the move is a translation, the stock normals stay
 * correct and the lighting needs no adjustment.
 */
export const vertexMain = /* glsl */ `
vec2 base = aGrid * uExtent;
base.y += uOffsetZ;

// Three layered sines at unrelated frequencies, so the fabric never repeats
// visibly. Cheaper than noise, and smooth enough at this node spacing.
float wave =
    sin(base.x * 0.42 + uTime * 0.55) * 0.45
  + sin(base.y * 0.58 - uTime * 0.75 + base.x * 0.18) * 0.30
  + sin((base.x + base.y) * 0.23 + uTime * 0.32) * 0.25;

vec3 anchor = vec3(base.x, wave * uAmplitude, base.y);

float dist = distance(anchor.xz, uPointer.xz);
float influence = 1.0 - smoothstep(0.0, uRadius, dist);
// A second smoothstep pass tightens the core so the swell has a defined edge.
influence = influence * influence * (3.0 - 2.0 * influence) * uStrength;

// Swell: nodes near the cursor rise, part slightly, and grow.
vec2 away = dist > 1e-4 ? (anchor.xz - uPointer.xz) / dist : vec2(0.0);
anchor.xz += away * influence * uPush;
anchor.y += influence * uLift;

transformed = transformed * (1.0 + influence * uSwell) + anchor;

vInfluence = influence;

// Fade the far rows into the backdrop and soften the side edges, so the
// fabric has no visible boundary.
float depthFade = smoothstep(-1.0, -0.35, aGrid.y) * (1.0 - smoothstep(0.75, 1.0, aGrid.y));
float sideFade = 1.0 - smoothstep(0.8, 1.0, abs(aGrid.x));
vFade = depthFade * sideFade;
`;

/** Declarations added to the fragment shader's global scope. */
export const fragmentPars = /* glsl */ `
uniform vec3 uAccent;
uniform float uGlow;
varying float vInfluence;
varying float vFade;
`;

/**
 * Runs after `<color_fragment>`: shifts albedo toward the accent, lifts the
 * swollen nodes to near-full opacity so the swell reads even when the resting
 * fabric is faint (the light theme), then fades the edges.
 */
export const fragmentColor = /* glsl */ `
diffuseColor.rgb = mix(diffuseColor.rgb, uAccent, vInfluence * 0.65);
diffuseColor.a = mix(diffuseColor.a, max(diffuseColor.a, 0.9), vInfluence);
diffuseColor.a *= vFade;
`;

/** Runs after `<emissivemap_fragment>`: nodes near the cursor glow mint. */
export const fragmentEmissive = /* glsl */ `
totalEmissiveRadiance += uAccent * vInfluence * uGlow;
`;
