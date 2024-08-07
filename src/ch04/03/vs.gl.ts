const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uLightPosition;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;

uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;

uniform bool uWireFrame;

in vec3 aPosition;
in vec3 aNormal;

out vec4 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);

  if (uWireFrame) {
    vColor = uMaterialDiffuse;
    return;
  }

  vec3 N = vec3(uNormalMatrix * vec4(aNormal, 1.0));
  // We negate the lightPosition vector, this creates a direction vector
  // between the camera (0, 0) and the position of the light (uLightPosition.x, uLightPosition.y)
  vec3 L = normalize(-uLightPosition);
  float lambertTerm = dot(N, -L);

  if (lambertTerm == 0.0) {
    lambertTerm = 0.001;
  }

  vec4 Id = uMaterialDiffuse * uLightDiffuse * lambertTerm;
  vec4 Ia = uMaterialAmbient * uLightAmbient;

  vColor = vec4(vec3(Ia + Id), 1.0);
}
`;

export default vertexShaderSource;
