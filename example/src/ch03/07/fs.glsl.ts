const fragmentShaderSource = `#version 300 es

precision mediump float;

// Material
uniform vec4 uMaterialDiffuseColor;
uniform vec4 uMaterialAmbientColor;
uniform vec4 uMaterialSpecularColor;

// Lights
uniform vec4 uLightDiffuseColor;
uniform vec4 uLightAmbientColor;
uniform vec4 uLightSpecularColor;
uniform float uShininess;

in vec3 vNormal;
in vec3 vEyeVector;
in vec3 vLightRay;

out vec4 fragColor;

void main(void) {
  vec3 L = normalize(vLightRay);
  vec3 N = normalize(vNormal);

  vec4 Ia = uMaterialAmbientColor * uLightAmbientColor;
  vec4 Id = vec4(0.0, 0.0, 0.0, 1.0);
  vec4 Is = vec4(0.0, 0.0, 0.0, 1.0);

  float lambTerm = dot(-L, N);
  if (lambTerm > 0.0) {
    Id = uLightDiffuseColor * uMaterialDiffuseColor * lambTerm;
    vec3 E = normalize(vEyeVector);
    vec3 R = reflect(L, N);
    float specular = pow(max(dot(R, E), 0.0), uShininess);
    Is = uMaterialSpecularColor * uLightSpecularColor * specular;
  }

  fragColor =  vec4(vec3(Ia + Id + Is), 1.0);
}
`;

export default fragmentShaderSource;
