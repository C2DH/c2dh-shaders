
uniform vec3 uColor;
uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;

// Function to interpolate between colors
vec3 mixColors(float t) {
    // Define a few colors to transition between
    vec3 color1 = vec3(0.0392, 0.6706, 0.8667); // Red
    vec3 color2 = vec3(0.9098, 0.1255, 0.0588); // Green
    vec3 color3 = vec3(0.7255, 0.8824, 0.9373); // Blue
    vec3 color4 = vec3(0.0706, 0.5451, 0.6667); // Yellow

    // Use a sine function to create a smooth transition
    float wave = sin(t * 0.5); // Adjust the speed of the transition

    // Map the sine wave to the range [0, 1]
    wave = wave * 0.5 + 0.5;

    // Interpolate between colors based on the wave value
    if (wave < 0.25) {
        return mix(color1, color2, wave * 4.0);
    } else if (wave < 0.5) {
        return mix(color2, color3, (wave - 0.25) * 4.0);
    } else if (wave < 0.75) {
        return mix(color3, color4, (wave - 0.5) * 4.0);
    } else {
        return mix(color4, color1, (wave - 0.75) * 4.0);
    }
}

void main() {
    // Normal
    vec3 normal = normalize(vNormal);
    if (!gl_FrontFacing)
        normal *= -1.0;

    // Stripes
    float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
    stripes = pow(stripes, 3.0);

    // Fresnel
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal) + 0.85;
    fresnel = pow(fresnel, 2.0);

    // Falloff
    float falloff = smoothstep(0.8, 0.2, fresnel);

    // Holographic
    float holographic = stripes * fresnel;
    holographic += fresnel * 1.7;
    holographic *= falloff;

    // Get the interpolated color based on uTime
    vec3 dynamicColor = mixColors(uTime);
    

    // Final color
    gl_FragColor = vec4(dynamicColor * holographic, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}