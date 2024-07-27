const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

uniform vec3 uLightPosition;

in vec3 aPosition;
in vec3 aNormal;

out vec3 vNormal;
out vec3 vEyeVector;
out vec3 vLightRay;

void main(void) {
  vec4 vertex = uModelViewMatrix * vec4(aPosition, 1.0);
  vNormal = vec3(uNormalMatrix * vec4(aNormal, 1.0));
  // Vector between vertex and camera (0, 0, 0)
  vEyeVector = -vec3(vertex);
  // Vector between vertex and light
  vLightRay = vec3(vertex) - uLightPosition;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`;

export default vertexShaderSource;
