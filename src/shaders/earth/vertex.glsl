

varying vec2 vUv;

void main() {
    vUv = uv;
    
    // Apply instance transformation
    vec4 instancePosition = instanceMatrix * vec4(position, 1.0);
    
    // Apply camera transformations
    vec4 mvPosition = modelViewMatrix * instancePosition;
    gl_Position = projectionMatrix * mvPosition;
}