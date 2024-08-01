const vertexShaderSource = `#version 300 es

in vec3 aPosition;
in vec3 aNormal;

out vec3 vNormal;

void main(void) {
  vNormal = aNormal;

  gl_Position = vec4(aPosition, 1.0);
}
`;

export default vertexShaderSource;
