const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec3 vNormal;

out vec4 fragColor;

void main(void) {
  fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

export default fragmentShaderSource;
