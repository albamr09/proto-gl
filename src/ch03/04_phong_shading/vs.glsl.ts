const vertexShaderSource = `#version 300 es
precision mediump float;

// Input vertex attributes
in vec3 aVertexPosition;             // Vertex positions
in vec3 aVertexNormal;               // Vertex normals

void main(void) {
    // Set the position in clipspace coordinates
    gl_Position = vec4(aVertexPosition, 1.0);
}
`;

export default vertexShaderSource;
