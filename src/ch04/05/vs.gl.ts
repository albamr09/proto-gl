const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;

uniform vec3 uLightPosition;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;

uniform bool uWireFrame;
uniform bool uStaticLight;

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
  vec3 L = vec3(0.0);
  if (uStaticLight) {
    L = normalize(-vec3(uModelViewMatrix * vec4(uLightPosition, 1.0)));
  } else {
    L = normalize(-uLightPosition);
  }

  float lamberTerm = dot(N, -L);
  if (lamberTerm == 0.0) {
    lamberTerm = 0.1;
  }
  
  vec4 Ia = uLightAmbient * uMaterialAmbient;
  vec4 Id = uLightDiffuse * uMaterialDiffuse * lamberTerm;

  vColor = vec4(vec3(Ia + Id), 1.0);
}
`;

export default vertexShaderSource;
