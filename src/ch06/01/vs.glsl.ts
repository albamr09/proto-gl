const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uLightPosition;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;

uniform bool uUseLambert;
uniform bool uUsePerVertexColoring;
uniform float uAlpha;

uniform vec4 uMaterialDiffuse;
uniform vec4 uMaterialAmbient;

in vec3 aPosition;
in vec3 aNormal;
in vec4 aColor;

out vec4 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  vec3 N = vec3(uNormalMatrix * vec4(aNormal, 1.0));
  vec3 L = normalize(-uLightPosition);
  vec4 color;

  // Apply a different color per vertex
  if (uUsePerVertexColoring) {
    color = aColor;
  } else {
    color = uMaterialDiffuse;
  }

  // Compute lighting using goraud lighting model
  if (uUseLambert) {
    float lambertTerm = max(dot(-L, N), 0.2);
    vec4 Ia = uLightAmbient * uMaterialAmbient;
    vec4 Id = uLightDiffuse * color * lambertTerm;
    color = vec4(vec3(Ia + Id), uAlpha);
  } 

  vColor = color;
}
`;

export default vertexShaderSource;
