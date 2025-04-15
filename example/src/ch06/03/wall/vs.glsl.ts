const vertexShaderSource = `#version 300 es

const int numLights = 4;

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uLightPositions[numLights];

in vec3 aPos;
in vec3 aNormal;

out vec3 vNormal;
out vec3 vRay[numLights];

void main(void) {
  vec4 vertex = uModelViewMatrix * vec4(aPos, 1.0);

  vNormal = vec3(uNormalMatrix * vec4(aNormal, 1.0));

  // Iterate over each light
  for(int i = 0; i < numLights; i++) {
    // Define each ray as the vector berween the light and the vertex
    vec4 lightPosition = uModelViewMatrix * vec4(uLightPositions[i], 1.0);
    vRay[i] = vertex.xyz - lightPosition.xyz;
  }

  gl_Position = uProjectionMatrix * vertex;
}
`;

export default vertexShaderSource;
