const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

uniform vec4 uMaterialDiffuse;
uniform vec4 uMaterialAmbient;

uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec3 uLightPosition;

in vec3 aPosition;
in vec3 aNormal;

out vec4 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);

  vec3 N = vec3(uNormalMatrix * vec4(aNormal, 1.0));
  vec3 L = normalize(-uLightPosition);

  float lamberTerm = dot(N, -L);
  if (lamberTerm == 0.0) {
    lamberTerm = 0.0001;
  }
  vec4 Id = uLightDiffuse * uMaterialDiffuse * lamberTerm;
  vec4 Ia = uLightAmbient * uMaterialAmbient;

  vColor = vec4(vec3(Ia + Id), 1.0);
}
`;

export default vertexShaderSource;
