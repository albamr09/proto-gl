const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

uniform vec3 uLightDirection;
uniform vec4 uLightDiffuseColor;
uniform vec4 uLightAmbientColor;
uniform vec4 uMaterialDiffuseColor;

in vec3 aPosition;
in vec3 aNormal;

out vec4 vVertexColor;

void main(void) {
  vec3 N = vec3(uNormalMatrix * vec4(aNormal, 1.0));
  vec3 L = normalize(uLightDirection);
  // Ambient
  vec4 Ia = uLightAmbientColor;
  // Diffuse
  vec4 Id = uMaterialDiffuseColor * uLightDiffuseColor * dot(N, -L);

  vVertexColor = vec4(vec3(Ia + Id), 1.0);

  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`;

export default vertexShaderSource;
