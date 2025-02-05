const vertexShaderSource = `#version 300 es

precision mediump float;

in vec2 aPosition;
in vec2 aTextureCoords;

out vec2 vTextureCoords;

void main(void) {
    vTextureCoords = aTextureCoords;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export default vertexShaderSource;
