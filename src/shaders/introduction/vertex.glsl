// 
// https://shaderific.com/glsl.html

// Kronos Group OpenGL reference pages
// https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/indexflat.php

// Book of shaders documentation
// https://thebookofshaders.com/


uniform float uTime;
varying vec2 vUv;


void main()
{
    // The detailed version of the matrix multiplication
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    // Final position (short version)
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // Varyings
   vUv = uv;
}
