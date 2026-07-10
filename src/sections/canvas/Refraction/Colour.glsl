// ─── Uniforms ────────────────────────────────────────────────────────────────
// Gradient stops passed as parallel arrays.
// MAX_STOPS must match the constant in WobblingPlane.tsx.

#define MAX_STOPS 8

uniform vec3  uColours[MAX_STOPS];   // RGB, each channel 0–1
uniform float uStops[MAX_STOPS];     // normalised stop positions 0–1
uniform int   uStopCount;            // how many stops are active
uniform float uWobblePower;          // used to normalise elevation → 0–1
uniform float uColourBlend;          // 0 = pure UV, 1 = pure elevation

// ─── Varyings ────────────────────────────────────────────────────────────────
varying vec2  vUv;
varying float vElevation;

// ─── Gradient helper ─────────────────────────────────────────────────────────
vec3 evalGradient(float t) {
  t = clamp(t, 0.0, 1.0);

  // Below first stop → first colour
  if (t <= uStops[0]) return uColours[0];

  for (int i = 1; i < MAX_STOPS; i++) {
    if (i >= uStopCount) break;

    if (t <= uStops[i]) {
      float range  = uStops[i] - uStops[i - 1];
      float localT = (range < 0.0001)
                       ? 0.0
                       : (t - uStops[i - 1]) / range;
      return mix(uColours[i - 1], uColours[i], clamp(localT, 0.0, 1.0));
    }
  }

  // Above last stop → last colour
  return uColours[uStopCount - 1];
}

// ─── Main ─────────────────────────────────────────────────────────────────────
void main() {
  // Normalise elevation to 0–1 (centre of the noise range maps to 0.5).
  // fbm returns roughly –0.9…+0.9 before the wobblePower scale, so dividing
  // by wobblePower gives us back that –1…1 range.
  float safeWobble = max(uWobblePower, 0.0001);
  float normElev   = vElevation / safeWobble;          // –1 … 1
  float elevT      = normElev * 0.5 + 0.5;              // 0 … 1  (1 = peak)

  // vUv.y runs 0 (bottom) → 1 (top) across the plane geometry.
  // Blend between pure-UV and pure-elevation so either mode is reachable.
  float t = mix(vUv.y, elevT, uColourBlend);

  vec3 colour = evalGradient(t);

  gl_FragColor = vec4(colour, 1.0);
}
