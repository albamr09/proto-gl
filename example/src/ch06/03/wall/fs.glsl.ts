const fragmentShaderSource = `#version 300 es

precision mediump float;

const int numLights = 4;

uniform vec4 uLightColors[numLights];
uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;

uniform vec4 uLightAmbient;
uniform float uLightCutOff;

in vec3 vNormal;
in vec3 vRay[numLights];

out vec4 fragColor;

void main(void) {

  vec4 Ia = uLightAmbient * uMaterialAmbient;
  vec4 Id = vec4(0.0);

  vec3 N = normalize(vNormal);
  
  // Iterate over each light
  for(int i = 0; i < numLights; i++) {
    vec3 L = normalize(vRay[i]);
    // Cosine of angle between light and surface
    float lambertTerm = max(dot(N, -L), 0.1);
    // If cosine is bigger than cutoff (the angle is less than an implicit
    // threhsold imposed but that cutoff) then we update the 
    // sum of the diffuse color
    if (lambertTerm >= uLightCutOff) {
      Id += uLightColors[i] * uMaterialDiffuse * lambertTerm;
    }
  }

  fragColor = vec4(vec3(Ia + Id), 1.0);
}
`;

export default fragmentShaderSource;
