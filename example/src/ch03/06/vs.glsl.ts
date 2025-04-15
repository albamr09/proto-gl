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
  // Obtains transformed vertex position
  vec4 vertex = uModelViewMatrix * vec4(aPosition, 1.0);
  // Obtains transformed light position
  vec4 light = uModelViewMatrix * vec4(uLightPosition, 1.0);

  // Obtains transformed normal (use normal matrix)
  vNormal = vec3(uNormalMatrix * vec4(aNormal, 1.0));
  // Light ray -> vector between vertex and light vector
  vLightRay = vertex.xyz - light.xyz;
  // Eye vector -> vector between camera and vector
  vEyeVector = -vec3(vertex.xyz);

  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`;

export default vertexShaderSource;
