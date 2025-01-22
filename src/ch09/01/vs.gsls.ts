const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

in vec3 aPosition;

uniform vec4 uMaterialDiffuseColor;
uniform vec4 uLightDiffuseColor;
uniform vec4 uMaterialAmbientColor;
uniform vec4 uLightAmbientColor;
uniform vec4 uMaterialSpecularColor;
uniform vec4 uLightSpecularColor;

out vec4 vColor;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);

  // Ambient
  // Diffuse
  // Specular
}
`;

export default vertexShaderSource;
