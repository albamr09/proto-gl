const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uLightPosition;

in vec3 aPosition;
in vec3 aNormal;

out vec3 vNormal;
out vec3 vLightRay;
out vec3 vEyeVector;

void main(void) {
  vec4 vertex = uModelViewMatrix * vec4(aPosition, 1.0);
  vec4 light = uModelViewMatrix * vec4(uLightPosition, 1.0);

  vNormal = vec3(uNormalMatrix * vec4(aNormal, 1.0));
  vLightRay = vertex.xyz - light.xyz;
  vEyeVector = -vec3(vertex.xyz);

  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`;

export default vertexShaderSource;
