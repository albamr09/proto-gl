const vertexShaderSource = `#version 300 es

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;

uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uMaterialAmbient;
uniform float uAlpha;

in vec3 aPosition;
in vec3 aNormal;
in vec4 aColor;

out vec4 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  float lamberTerm = 1.0;

  vec4 Ia = uLightAmbient * uMaterialAmbient;
  vec4 Id = uLightDiffuse * aColor * lamberTerm;

  vColor = vec4(vec3(Ia + Id), uAlpha);
}
`;

export default vertexShaderSource;
