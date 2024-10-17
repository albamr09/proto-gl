const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec4 uRedLightColor;
uniform vec4 uGreenLightColor;
uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;

uniform vec4 uLightAmbient;

in vec3 vNormal;
in vec3 vRedRay;
in vec3 vGreenRay;

out vec4 fragColor;

void main(void) {

  vec4 Ia = uLightAmbient * uMaterialAmbient;
  vec4 IdR = vec4(0.0);
  vec4 IdG = vec4(0.0);

  vec3 N = normalize(vNormal);
  vec3 LR = normalize(vRedRay);
  vec3 LG = normalize(vGreenRay);

  float lambertTerm1 = dot(N, -LR);
  float lambertTerm2 = dot(N, -LG);

  // TODO: cutoff
  if (lambertTerm1 == 0.0) {
    lambertTerm1 = 0.1;
  }

  IdR = uRedLightColor * uMaterialDiffuse * lambertTerm1;
  //IdG = uRedLightColor * lambertTerm1;

  // fragColor = vec4(vec3(Ia + IdR), 1.0);
  // fragColor = vec4(1.0);
}
`;

export default fragmentShaderSource;
