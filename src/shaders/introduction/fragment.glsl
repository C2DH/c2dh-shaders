uniform float uTime;
uniform float uStripes;

varying vec2 vUv;

void main() {
    // Final color
    vec2 mulvUv = 1.0 - mod(vUv * 10.0 , uStripes);
    float strength = step(0.5, mulvUv.x);

    csm_DiffuseColor = vec4(vec3(strength), 0.5);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
