varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec3 vViewDir;

void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);

    vWorldPosition = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = cameraPosition - worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
}