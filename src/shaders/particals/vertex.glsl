uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform float uPointSize;

varying vec3 vColor;

void main()
{
    // Final position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Picture - monocrome
    // float pictureIntensity = texture(uPictureTexture, uv).r;

    // Picture - RGB colors
    vec3 pictureColor = texture(uPictureTexture, uv).rgb; // Sample the RGB color from the texture

    // Point size
    float pictureIntensity = length(pictureColor); // Calculate intensity from the RGB color
    gl_PointSize = 0.08 * pictureIntensity * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    vColor = vec3(pow(pictureColor, vec3(2.0))); // Apply gamma correction or other adjustments if needed
}