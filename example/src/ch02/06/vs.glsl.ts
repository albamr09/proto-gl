export const vertexShaderSource = `#version 300 es
precision mediump float;

// Supplied vertex position attribute
in vec3 aVertexPosition;

void main(void) {
    // On point mode
    gl_PointSize = 40.0;
    // Set the position in clipspace coordinates
    gl_Position = vec4(aVertexPosition, 1.0);
}
`;
