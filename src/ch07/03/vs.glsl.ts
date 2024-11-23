const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform vec4 uMaterialDiffuse;
uniform vec4 uMaterialAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uLightAmbient;
uniform vec3 uLightPosition;

uniform bool uUsePerVertexColoring;
uniform bool uUseLambert;
uniform float uAlpha;

in vec3 aPosition;
in vec3 aNormal;
in vec4 aColor;

out vec4 vColor;

void main(void) {
  vec4 vertex = uModelViewMatrix * vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * vertex;

  vec4 diffuseColor = uMaterialDiffuse;

  if (uUsePerVertexColoring) {
    diffuseColor = aColor;
  }

  // Color
  vec4 Ia = uLightAmbient * uMaterialAmbient;
  vec4 Id = uLightDiffuse * diffuseColor;
  if (uUseLambert) {
    vec3 N = vec3(uNormalMatrix * vec4(aNormal, 1.0));
    vec3 L = normalize(vertex.xyz - uLightPosition);
    float lambertTerm = dot(N, -L);
    Id = Id * lambertTerm;
  }

  vColor = vec4(vec3(Ia + Id), uAlpha);
}
`;

export default vertexShaderSource;
