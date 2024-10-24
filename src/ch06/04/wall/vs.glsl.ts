const vertexShaderSource = `#version 300 es

const int numLights = 3;

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uLightPositions[numLights];
uniform vec3 uLightDirections[numLights];

in vec3 aPos;
in vec3 aNormal;

out vec3 vRay[numLights];
out vec3 vTransformedNormals[numLights];

void main(void) {
  vec4 vertex = uModelViewMatrix * vec4(aPos, 1.0);

  // Iterate over each light
  for(int i = 0; i < numLights; i++) {
    // Define each ray as the vector berween the light and the vertex
    vec4 lightPosition = uModelViewMatrix * vec4(uLightPositions[i], 1.0);
    vRay[i] = vertex.xyz - lightPosition.xyz;
    // Transform the normal by substracting the direction of each light
    vTransformedNormals[i] = vec3(uNormalMatrix * vec4(aNormal - uLightDirections[i], 1.0));
  }

  gl_Position = uProjectionMatrix * vertex;
}
`;

export default vertexShaderSource;
