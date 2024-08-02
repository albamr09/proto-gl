const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

in vec3 aPosition;
in vec3 aNormal;

out vec3 vNormal;

void main(void) {
  vNormal = aNormal;

  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`;

export default vertexShaderSource;
