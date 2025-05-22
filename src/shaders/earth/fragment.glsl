// fragment.glsl for THREE.js InstancedMesh
uniform vec3 uColor;
varying vec2 vUv;

void main() {
    // Create a circular point with soft edges
    float distanceToCenter = length(vUv - vec2(0.5));
    float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
    
    // Apply the color with fading edges
    gl_FragColor = vec4(uColor, strength);
}