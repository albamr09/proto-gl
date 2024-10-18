const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec4 uRedLightColor;
uniform vec4 uGreenLightColor;
uniform vec4 uBlueLightColor;
uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;

uniform vec4 uLightAmbient;
uniform float uLightCutOff;

in vec3 vNormal;
in vec3 vRedRay;
in vec3 vGreenRay;
in vec3 vBlueRay;

out vec4 fragColor;

void main(void) {

  vec4 Ia = uLightAmbient * uMaterialAmbient;
  vec4 IdR = vec4(0.0);
  vec4 IdG = vec4(0.0);
  vec4 IdB = vec4(0.0);

  vec3 N = normalize(vNormal);
  vec3 LR = normalize(vRedRay);
  vec3 LG = normalize(vGreenRay);
  vec3 LB = normalize(vBlueRay);

  float lambertTermR = max(dot(N, -LR), 0.1);
  float lambertTermG = max(dot(N, -LG), 0.1);
  float lambertTermB = max(dot(N, -LB), 0.1);

  if (lambertTermG < uLightCutOff) {
    lambertTermG = 0.0;
  }
  if (lambertTermR < uLightCutOff) {
    lambertTermR = 0.0;
  }
  if (lambertTermB < uLightCutOff) {
    lambertTermB = 0.0;
  }

  IdR = uRedLightColor * uMaterialDiffuse * lambertTermR;
  IdG = uGreenLightColor * uMaterialDiffuse * lambertTermG;
  IdB = uBlueLightColor * uMaterialDiffuse * lambertTermB;

  fragColor = vec4(vec3(Ia + IdR + IdG + IdB), 1.0);
}
`;

export default fragmentShaderSource;
