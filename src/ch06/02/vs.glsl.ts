const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

in vec3 aPos;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPos, 1.0);
}
`;

export default vertexShaderSource;
