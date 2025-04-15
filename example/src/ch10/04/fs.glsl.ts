const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;

uniform vec4 uLightDiffuse;
uniform vec4 uLightAmbient;
uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;
uniform float uShininess;

in vec2 vTextureCoords;
in vec3 vTangentLightRay;
in vec3 vTangentEyeRay;

out vec4 fragColor;

// Transforms the normal stored inside the texture from a range of [0, 1] to a range of [-1, 1]
vec3 transformNormal() {
  return 2.0 * (texture(uNormalSampler, vTextureCoords).rgb - 0.5);
}

void main(void) {

  // Ambient color
  vec4 Ia = uLightAmbient * uMaterialAmbient;

  // Diffuse color
  vec4 textureColor = texture(uSampler, vTextureCoords);
  vec3 N = normalize(transformNormal());
  vec3 L = normalize(vTangentLightRay);
  float lambertTerm = max(dot(N, -L), 0.2);
  vec4 Id = uMaterialDiffuse * textureColor * uLightDiffuse * lambertTerm;

  // Specular color
  vec3 R = reflect(L, N);
  float Is = pow(clamp(dot(R, vTangentEyeRay), 0.0, 1.0), uShininess);

  fragColor = Ia + Id + Is;
}
`;

export default fragmentShaderSource;
