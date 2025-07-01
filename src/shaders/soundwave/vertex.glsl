uniform float time;
uniform float audioData[512]; // Match your fftSize/2
uniform vec3 color;

varying vec2 vUv;
varying float vAudio;

void main() {
    vUv = uv;
    
    // Get audio data based on x position
    int audioIndex = int(uv.x * 512.0); // Match your fftSize/2
    vAudio = audioData[audioIndex];
    
    vec3 pos = position;
    // Apply wave deformation based on audio
    pos.y += vAudio * 2.0;

    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}