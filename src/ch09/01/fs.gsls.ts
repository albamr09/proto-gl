const fragmentShaderSource = `#version 300 es

precision mediump float;

const int numLights = 4;

uniform vec4 uMaterialDiffuse;
uniform vec4 uLightDiffuse;
uniform vec4 uMaterialAmbient;
uniform vec4 uLightAmbient;
uniform vec4 uMaterialSpecular;
uniform vec4 uLightSpecular;
uniform float uShininess;

in vec3 vNormal;
in vec3 vLightRay[numLights];
in vec3 vEyeVector;

out vec4 fragColor;

void main() {

  vec3 N = normalize(vNormal);
  vec3 E = normalize(vEyeVector);
  
  // Ambient
  vec4 Ia = uMaterialAmbient * uLightAmbient;

  vec4 Id = vec4(0.0);
  vec4 Is = vec4(0.0);

  for(int i = 0; i < numLights; i++) {
    vec3 L = normalize(vLightRay[i]);
    // Diffuse
    float lamberTerm = clamp(dot(-L, N), 0.0, 1.0);
    Id += uMaterialDiffuse * uLightDiffuse * lamberTerm;
    // Specular
    vec3 R = reflect(L, N);
    float specularTerm = max(dot(R, E), 0.0);
    Is += uMaterialSpecular * uLightSpecular * pow(specularTerm, uShininess);
  }

  fragColor = vec4((Ia + Id + Is).xyz, 1.0);
}
`;

export default fragmentShaderSource;
