const vertexShaderSource = `#version 300 es

in vec3 aPosition;

void main(void) {
  gl_Position = vec4(aPosition, 1.0);
}
`;

export default vertexShaderSource;
