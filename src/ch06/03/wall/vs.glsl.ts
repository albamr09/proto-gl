const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uLightPositions[4];

in vec3 aPos;
in vec3 aNormal;

out vec3 vNormal;
out vec3 vRedRay;
out vec3 vGreenRay;
out vec3 vBlueRay;
out vec3 vWhiteRay;

void main(void) {
  vec4 vertex = uModelViewMatrix * vec4(aPos, 1.0);

  vNormal = vec3(uNormalMatrix * vec4(aNormal, 1.0));

  vec4 redLightPosition = uModelViewMatrix * vec4(uLightPositions[0], 1.0);
  vec4 greenLightPosition = uModelViewMatrix * vec4(uLightPositions[1], 1.0);
  vec4 blueLightPosition = uModelViewMatrix * vec4(uLightPositions[2], 1.0);
  vec4 whiteLightPosition = uModelViewMatrix * vec4(uLightPositions[3], 1.0);

  vRedRay = vertex.xyz - redLightPosition.xyz;
  vGreenRay = vertex.xyz - greenLightPosition.xyz;
  vBlueRay = vertex.xyz - blueLightPosition.xyz;
  vWhiteRay = vertex.xyz - whiteLightPosition.xyz;

  gl_Position = uProjectionMatrix * vertex;
}
`;

export default vertexShaderSource;
