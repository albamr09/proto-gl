const fragmentShaderSource = `#version 300 es

precision mediump float;

const int numLights = 4;

uniform vec4 uMaterialDiffuse;
uniform vec4 uLightDiffuseColors[numLights];
uniform vec4 uMaterialAmbient;
uniform vec4 uLightAmbient;
uniform vec4 uMaterialSpecular;
uniform vec4 uLightSpecularColors[numLights];
uniform float uShininess;
uniform int uIlluminationType;
uniform float uAlpha;

in vec3 vNormal;
in vec3 vLightRay[numLights];
in vec3 vEyeVector;

out vec4 fragColor;

void main() {
  if (uIlluminationType == 0) {
    fragColor = vec4(uMaterialDiffuse.rgb, uAlpha);
    return;
  }

  vec3 N = normalize(vNormal);
  vec3 E = normalize(vEyeVector);
  
  // Ambient
  vec4 Ia = uMaterialAmbient * uLightAmbient;

  vec4 Id = vec4(0.0);
  vec4 Is = vec4(0.0);

  for(int i = 0; i < numLights; i++) {
    vec3 L = normalize(vLightRay[i]);
    // Diffuse
    if (uIlluminationType == 1 || uIlluminationType == 2) {
      float lamberTerm = clamp(dot(-L, N), 0.0, 1.0);
      Id += uMaterialDiffuse * uLightDiffuseColors[i] * lamberTerm;
    }
    // Specular
    if (uIlluminationType == 2) {
      vec3 R = reflect(L, N);
      float specularTerm = max(dot(R, E), 0.0);
      Is += uMaterialSpecular * uLightSpecularColors[i] * pow(specularTerm, uShininess) * 4.0;
    }
  }

  fragColor = vec4((Ia + Id + Is).xyz, uAlpha);
}
`;

export default fragmentShaderSource;
