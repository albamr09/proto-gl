const vertexShaderSource = `#version 300 es

// Transforms
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

// Lights
uniform vec3 uLightPosition;
uniform vec4 uLightAmbient;
uniform vec4 uLightSpecular;
uniform vec4 uLightDiffuse;

// Material
uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialSpecular;
uniform vec4 uMaterialDiffuse;

uniform bool uWireFrame;

in vec3 aPosition;
in vec3 aNormal;

out vec3 vNormal;
out vec4 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);

  if (uWireFrame) {
    vColor = uMaterialDiffuse;
    return;
  } 

  // Normal
  vec3 N = vec3(uNormalMatrix * vec4(aNormal, 0.0));
  // Normalized light position
  vec3 L = normalize(-uLightPosition);
  float lambertTerm = dot(N, -L);

  if (lambertTerm == 0.0) {
    lambertTerm = 0.01;
  }

  // Ambient
  vec4 Ia = uLightAmbient * uMaterialAmbient;
  // Diffuse
  vec4 Id = uLightDiffuse * uMaterialDiffuse * lambertTerm;

  vColor = vec4((Ia + Id).xyz, 1.0);

}
`;

export default vertexShaderSource;
