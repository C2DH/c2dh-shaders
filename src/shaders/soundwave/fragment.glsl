// fragment.glsl
uniform vec3 color;
uniform float time;

varying vec2 vUv;
varying float vAudio;

void main() {
    float alpha = smoothstep(0.1, 0.9, abs(vAudio));
    vec3 finalColor = mix(color, vec3(0.8, 0.9, 1.0), abs(vAudio) * 0.8);
    
    // Add pulsing effect to the live wave
    float pulse = sin(time * 2.0) * 0.1 + 0.9;
    gl_FragColor = vec4(finalColor * pulse, alpha);
}