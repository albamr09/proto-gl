const fragmentShaderSource = `#version 300 es

precision mediump float;
uniform sampler2D uSampler;

in vec2 vTextureCoords;
in vec4 vColor;

out vec4 fragColor;

void main(void) {
  fragColor = vColor;
}
`;

export default fragmentShaderSource;
