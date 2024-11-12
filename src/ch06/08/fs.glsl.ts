const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec4 uMaterialAmbient;
uniform vec4 uLightAmbient;
uniform vec4 uMaterialDiffuse;
uniform vec4 uLightDiffuse;

in vec3 vNormal;
in vec3 vRay;

out vec4 fragColor;

void main(void) {
  vec4 Ia = uMaterialAmbient * uLightAmbient;

  vec3 N = normalize(vNormal);
  vec3 L = normalize(vRay);
  float lambertTerm = clamp(dot(N, -L), 0.0, 1.0);
  vec4 Id = uLightDiffuse * uMaterialDiffuse * lambertTerm; 

  fragColor = vec4(vec3(Ia + Id), uMaterialDiffuse.a);
}
`;

export default fragmentShaderSource;
