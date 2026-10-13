/**
 * GLSL for the background's sky.
 *
 * The globe: one shader for its stars, drawn as glowing points, and one for
 * the solid links between them. Both dim the marks on the far side of the
 * globe, so it reads as a solid shape turning rather than as a flat tangle,
 * and both turn mint as the cursor sweeps the stars out of place.
 *
 * The star field behind it: soft round stars and plain links, dimmed by
 * depth instead, and brightened by a mint glow that follows the cursor
 * across the screen. Its links share the globe's fragment shader.
 *
 * The star dust around everything: single faint specks.
 */

/**
 * Shared by the globe's vertex shaders: `facing` is 1 on the side of the
 * globe that faces the camera and 0 on the far side.
 */
const sharedPars = /* glsl */ `
uniform vec3 uCenter;        // globe centre, world space
uniform float uBackFade;     // what the far side keeps of a mark

float facing(vec3 world) {
  vec3 outward = normalize(world - uCenter);
  vec3 toCamera = normalize(cameraPosition - uCenter);
  return dot(outward, toCamera) * 0.5 + 0.5;
}
`;

/**
 * One star per point. Its position is rewritten each frame as the cursor
 * sweeps it; `aGlow` says how far out of place it is. Pairs with
 * `globeStarFragment`.
 */
export const globeStarVertex = /* glsl */ `
attribute float aTint;       // 0, 1 or 2: which colour
attribute float aIndex;
attribute float aGlow;       // 0 at home, 1 when swept far
uniform float uTime;
uniform float uTwinkleRate;
uniform float uSize;         // pixels at one world unit from the camera
uniform float uPixelRatio;
uniform float uStarOpacity;
uniform vec3 uTint0;
uniform vec3 uTint1;
uniform vec3 uTint2;
uniform vec3 uAccent;
varying vec3 vColor;
varying float vAlpha;
${sharedPars}

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vec4 view = viewMatrix * world;

  float depth = mix(uBackFade, 1.0, facing(world.xyz));
  // Each star on its own phase: the golden angle spreads the indices out.
  float twinkle = 0.75 + 0.25 * sin(uTime * uTwinkleRate + aIndex * 2.39996);

  vec3 tint = aTint < 0.5 ? uTint0 : (aTint < 1.5 ? uTint1 : uTint2);
  vColor = mix(tint, uAccent, aGlow);
  vAlpha = mix(uStarOpacity * twinkle * depth, 1.0, aGlow);

  float size = uSize * mix(0.6, 1.0, depth) * (1.0 + aGlow * 0.5);
  gl_PointSize = size * uPixelRatio / -view.z;
  gl_Position = projectionMatrix * view;
}
`;

/** A solid round star with a soft halo around it. */
export const globeStarFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.3, 0.22, d);
  float halo = smoothstep(0.5, 0.0, d);
  float alpha = (core + halo * halo * 0.35) * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(vColor, min(alpha, 1.0));

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/**
 * One end of a link. The links are re-formed every frame, so each end
 * carries the glow of the star it ends on. Pairs with `linkFragment`.
 */
export const globeLinkVertex = /* glsl */ `
attribute float aGlow;
uniform float uLineOpacity;
varying float vAlpha;
varying float vLit;
${sharedPars}

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);

  vLit = aGlow;
  vAlpha = uLineOpacity * mix(uBackFade, 1.0, facing(world.xyz));
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

/** A soft round star: a bright core inside a fading halo. */
export const starFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float halo = smoothstep(0.5, 0.0, d);
  float core = smoothstep(0.16, 0.0, d);
  float alpha = (halo * halo * 0.55 + core) * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(vColor, min(alpha, 1.0));

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Links: they brighten and take the accent as they light up. */
export const linkFragment = /* glsl */ `
uniform vec3 uLine;
uniform vec3 uAccent;
varying float vAlpha;
varying float vLit;

void main() {
  vec3 color = mix(uLine, uAccent, vLit);
  float alpha = mix(vAlpha, max(vAlpha, 0.85), vLit);
  gl_FragColor = vec4(color, alpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/**
 * Shared by the field's vertex shaders. `depthOf` is 1 at the front of the
 * field and `uDepthFade` at the back. `glowAt` is the cursor's glow at a
 * clip-space position, measured on screen so it is round at any depth.
 */
const fieldPars = /* glsl */ `
uniform float uDepthFade;
uniform float uHalfDepth;
uniform vec2 uGlowPointer;   // NDC
uniform vec2 uResolution;    // CSS pixels
uniform float uGlowRadius;   // CSS pixels
uniform float uGlowStrength; // 0..1, eased in and out with pointer presence

float depthOf(float z) {
  return mix(uDepthFade, 1.0, smoothstep(-uHalfDepth, uHalfDepth, z));
}

float glowAt(vec4 clip) {
  vec2 offset = (clip.xy / clip.w - uGlowPointer) * uResolution * 0.5;
  float glow = 1.0 - smoothstep(0.0, uGlowRadius, length(offset));
  // A second smoothstep pass gives the glow a soft but defined edge.
  return glow * glow * (3.0 - 2.0 * glow) * uGlowStrength;
}
`;

/** Pairs with `starFragment`. */
export const fieldStarVertex = /* glsl */ `
attribute float aTint;       // 0, 1 or 2: which star colour
attribute float aSize;       // a multiple of uSize
attribute float aIndex;
uniform float uTime;
uniform float uTwinkleRate;
uniform float uSize;         // pixels at one world unit from the camera
uniform float uPixelRatio;
uniform float uStarOpacity;
uniform vec3 uTint0;
uniform vec3 uTint1;
uniform vec3 uTint2;
uniform vec3 uAccent;
varying vec3 vColor;
varying float vAlpha;
${fieldPars}

void main() {
  vec4 view = modelViewMatrix * vec4(position, 1.0);
  vec4 clip = projectionMatrix * view;

  float glow = glowAt(clip);
  float twinkle = 0.65 + 0.35 * sin(uTime * uTwinkleRate + aIndex * 2.39996);

  vec3 tint = aTint < 0.5 ? uTint0 : (aTint < 1.5 ? uTint1 : uTint2);
  vColor = mix(tint, uAccent, glow * 0.85);
  vAlpha = mix(uStarOpacity * twinkle * depthOf(position.z), 1.0, glow);

  gl_PointSize = uSize * aSize * (1.0 + glow * 0.6) * uPixelRatio / -view.z;
  gl_Position = clip;
}
`;

/** Pairs with `linkFragment`, whose `vLit` here is the cursor's glow. */
export const fieldLinkVertex = /* glsl */ `
uniform float uLineOpacity;
varying float vAlpha;
varying float vLit;
${fieldPars}

void main() {
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  // Held below full: lit links should frame the lit stars, not outshine them.
  vLit = glowAt(clip) * 0.75;
  vAlpha = uLineOpacity * depthOf(position.z);
  gl_Position = clip;
}
`;

/**
 * Star dust: one speck per point, its size in pixels kept within a range so
 * the specks that drift close to the camera never balloon.
 */
export const dustVertex = /* glsl */ `
uniform float uSize;         // pixels at one world unit from the camera
uniform float uMinPixels;
uniform float uMaxPixels;
uniform float uPixelRatio;

void main() {
  vec4 view = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp(uSize / -view.z, uMinPixels, uMaxPixels) * uPixelRatio;
  gl_Position = projectionMatrix * view;
}
`;

/** A plain round speck. At one or two pixels a soft falloff would vanish. */
export const dustFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;

void main() {
  if (length(gl_PointCoord - 0.5) > 0.5) discard;
  gl_FragColor = vec4(uColor, uOpacity);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
