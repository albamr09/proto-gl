const vertexShaderSource = `#version 300 es

const int numLights = 4;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

in vec3 aPosition;
in vec3 aNormal;

uniform vec3 uLightPositions[numLights];
uniform vec4 uMaterialDiffuse;
uniform vec4 uLightDiffuse;
uniform vec4 uMaterialAmbient;
uniform vec4 uLightAmbient;
uniform vec4 uMaterialSpecular;
uniform vec4 uLightSpecular;
uniform float uShininess;

out vec4 vColor;

void main() {
  vec4 vertex = uModelViewMatrix * vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * vertex;
  vec3 N = normalize(vec3(uNormalMatrix * vec4(aNormal, 1.0)));
  vec3 eyeVector = -vertex.xyz;

  // Ambient
  vec4 Ia = uMaterialAmbient * uLightAmbient;
  // Diffuse
  vec4 Id = vec4(0.0);
  for(int i = 0; i < numLights; i++) {
    vec3 L = normalize(vertex.xyz - uLightPositions[i]);
    float lamberTerm = clamp(dot(-L, N), 0.0, 1.0);
    Id += uMaterialDiffuse * uLightDiffuse * lamberTerm;
  }
  // Specular
  vec4 Is = vec4(0.0);
  for(int i = 0; i < numLights; i++) {
    vec3 L = normalize(vertex.xyz - uLightPositions[i]);
    vec3 R = reflect(L, N);
    float specularTerm = clamp(dot(R, eyeVector), 0.0, 1.0);
    Is += uMaterialSpecular * uLightSpecular * pow(specularTerm, uShininess);
  }
  vColor = vec4((Ia + Id + Is).xyz, 1.0);
}
`;

export default vertexShaderSource;
