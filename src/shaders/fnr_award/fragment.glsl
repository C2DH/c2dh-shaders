precision highp float;

uniform vec3 uColor;
uniform float uNoiseScale;
uniform float uNormalStrength;

uniform samplerCube uEnvMap;

uniform vec3 uCameraPos;

/* simple lighting */
uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform vec3 uAmbientColor;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec2 vUv;

/* ------------------------------------------------ */
/* 2D Noise (value noise)                           */
/* ------------------------------------------------ */
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) +
         (c - a) * u.y * (1.0 - u.x) +
         (d - b) * u.x * u.y;
}

/* ------------------------------------------------ */
/* Procedural Normal from Noise                     */
/* ------------------------------------------------ */
vec3 perturbNormal(vec3 normal, vec2 uv) {
  float e = 0.001;

  float n = noise(uv * uNoiseScale);
  float nx = noise((uv + vec2(e, 0.0)) * uNoiseScale);
  float ny = noise((uv + vec2(0.0, e)) * uNoiseScale);

  vec3 grad = vec3(nx - n, ny - n, 0.0);

  vec3 tangent = normalize(vec3(1.0, 0.0, 0.0));
  vec3 bitangent = normalize(vec3(0.0, 1.0, 0.0));

  vec3 bumpedNormal = normal +
    grad.x * tangent * uNormalStrength +
    grad.y * bitangent * uNormalStrength;

  return normalize(bumpedNormal);
}

void main() {

  /* -------- Normal -------- */
  vec3 normal = normalize(vNormal);
  normal = perturbNormal(normal, vUv);

  /* -------- View & Reflection -------- */
  vec3 viewDir = normalize(uCameraPos - vWorldPos);
  vec3 reflectDir = reflect(-viewDir, normal);
  vec3 envColor = textureCube(uEnvMap, reflectDir).rgb;

  /* -------- Lighting -------- */
  vec3 lightDir = normalize(uLightDir);
  float diff = max(dot(normal, lightDir), 0.0);

  vec3 diffuse = diff * uLightColor;

  /* Specular (metal-like) */
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 64.0);
  vec3 specular = spec * uLightColor;

  /* -------- Metal Color Noise -------- */
  float n = noise(vUv * uNoiseScale * 0.5);
  vec3 metalColor = uColor + n * 0.15;

  /* -------- Final Color -------- */
  vec3 color =
    metalColor * (diffuse + uAmbientColor) +
    specular +
    envColor * 0.6;  // reflection strength

  gl_FragColor = vec4(color, 1.0);
}
