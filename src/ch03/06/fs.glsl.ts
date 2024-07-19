const fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec4 uMaterialDiffuseColor;
uniform vec4 uMaterialSpecularColor;
uniform vec4 uMaterialAmbientColor;
uniform vec4 uLightDiffuseColor;
uniform vec4 uLightAmbientColor;
uniform vec4 uLightSpecularColor;

in vec3 vNormal;
in vec3 vLightRay;
in vec3 vEyeVector;

out vec4 fragColor;

void main(void) {
  vec4 Ia = uMaterialAmbientColor * uLightAmbientColor;
  fragColor = vec4(Ia.xyz, 1.0);
}
`;

export default fragmentShaderSource;
