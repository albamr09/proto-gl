const vertexShaderSource = `#version 300 es

const int numLights = 4;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

in vec3 aPosition;
in vec3 aNormal;

uniform vec3 uLightPositions[numLights];

out vec4 vColor;
out vec3 vNormal;
out vec3 vEyeVector;
out vec3 vLightRay[numLights];

void main() {
  vec4 vertex = uModelViewMatrix * vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * vertex;
  vNormal = normalize(vec3(uNormalMatrix * vec4(aNormal, 1.0)));
  vEyeVector = -vertex.xyz;

  for(int i = 0; i < numLights; i++) {
    vLightRay[i] = vertex.xyz - uLightPositions[i];
  }
}
`;

export default vertexShaderSource;
