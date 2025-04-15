const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform bool uUseLambert;

in vec3 vLightRay;
in vec3 vNormal;

out vec4 fragColor;

void main(void) {
  vec4 Ia = uMaterialAmbient * uLightAmbient;
  vec4 Id = uLightDiffuse * uMaterialDiffuse;

  if (uUseLambert) {
    vec3 L = normalize(vLightRay);
    vec3 N = normalize(vNormal);
    float lambertTerm = clamp(dot(-L, N), 0.0, 1.0);
    Id = Id * lambertTerm;
  }

  fragColor = vec4(vec3(Ia + Id), uMaterialDiffuse.a);
}
`;

export default fragmentShaderSource;
