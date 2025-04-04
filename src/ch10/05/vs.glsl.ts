const vertexShaderSource = `#version 300 es

precision mediump float;

// These positions define the corner vertices
in vec2 aPosition;
// This is can be thought of a blank page on where we are going 
// to render using our fragment shader
in vec2 aTextureCoords;

out vec2 vTextureCoords;

void main(void) {
    vTextureCoords = aTextureCoords;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export default vertexShaderSource;
