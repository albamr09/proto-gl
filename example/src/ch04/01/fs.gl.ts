const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec4 vColor;

out vec4 fragColor;

void main(void) {
  fragColor = vec4(vColor);
}
`;

export default fragmentShaderSource;
