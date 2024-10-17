const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uRedLightPosition;
uniform vec3 uGreenLightPosition;

in vec3 aPos;
in vec3 aNormal;

out vec3 vNormal;
out vec3 vRedRay;
out vec3 vGreenRay;

void main(void) {
  vec4 vertex = uModelViewMatrix * vec4(aPos, 1.0);

  vNormal = vec3(uNormalMatrix * vec4(aNormal, 1.0));

  vec4 redLightPosition = uModelViewMatrix * vec4(uRedLightPosition, 1.0);
  vec4 greenLightPosition = uModelViewMatrix * vec4(uGreenLightPosition, 1.0);

  vRedRay = vertex.xyz - redLightPosition.xyz;
  vGreenRay = vertex.xyz - greenLightPosition.xyz;

  gl_Position = uProjectionMatrix * vertex;
}
`;

export default vertexShaderSource;
