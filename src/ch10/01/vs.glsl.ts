const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uLightPosition;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;

uniform vec4 uMaterialDiffuse;
uniform vec4 uMaterialAmbient;

in vec3 aPosition;
in vec3 aNormal;
in vec2 aTextureCoords;

out vec4 vColor;
out vec2 vTextureCoords;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  vec3 N = vec3(uNormalMatrix * vec4(aNormal, 1.0));
  vec3 L = normalize(-uLightPosition);
  vec4 color;

  float lambertTerm = max(dot(-L, N), 0.33);
  vec4 Ia = uLightAmbient * uMaterialAmbient;
  vec4 Id = uLightDiffuse * uMaterialDiffuse * lambertTerm;
  color = vec4(vec3(Ia + Id), 1.0);

  vColor = vec4(vec3(color), 1.0);
  vTextureCoords = aTextureCoords;
}
`;

export default vertexShaderSource;
