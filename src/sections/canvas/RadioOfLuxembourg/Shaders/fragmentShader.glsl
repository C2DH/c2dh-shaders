uniform samplerCube envMap;
uniform bool useEnvMap;

uniform float fresnelPower;       // controls the broad white glow / alpha gradient
uniform float rimWidth;           // how far the glow reaches toward the center (0-1)

uniform float reflectionFresnelPower; // separate, tighter exponent just for reflections
uniform float reflectionStrength;     // how strongly the env map blends in at the true edge

uniform float opacity;

uniform vec3 rimColor;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec3 vViewDir;

void main() {

    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(vViewDir);

    float NdotV = max(dot(N, V), 0.0);

    // Broad fresnel term driving the soft white glow + alpha gradient.
    // Low fresnelPower + high rimWidth = glow reaches toward the center.
    float glowFresnel = pow(1.0 - NdotV, fresnelPower);
    float rim = smoothstep(1.0 - rimWidth, 1.0, glowFresnel);

    // Separate, tighter fresnel term used ONLY to gate environment
    // reflections, so they stay pinned to the true grazing edge and
    // don't wash the whole sphere out with a dim/dark env map.
    float reflFresnel = pow(1.0 - NdotV, reflectionFresnelPower);

    vec3 color = rimColor;

    if (useEnvMap) {
        vec3 R = reflect(-V, N);
        vec3 env = textureCube(envMap, R).rgb;

        color = mix(color, env, reflectionStrength * reflFresnel);
    }

    // Fully transparent at the center, opaque(ish) toward the rim.
    float alpha = rim * opacity;

    gl_FragColor = vec4(color, alpha);
}
