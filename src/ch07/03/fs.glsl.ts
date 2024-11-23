const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec4 vColor;

out vec4 fragtColor;

void main(void) {
  fragtColor = vec4(vColor);
}
`;

export default fragmentShaderSource;
