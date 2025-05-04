const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec3 uLightPosition;

uniform mat4 uTransform;

in vec3 aPosition;
in vec3 aNormal;

out vec3 vNormal;
out vec3 vLightRay;

void main(void) {
  vec4 vertex = uModelViewMatrix * uTransform * vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * vertex;

  vNormal = vec3(uNormalMatrix * vec4(aNormal, 1.0));
  vLightRay = vertex.xyz - uLightPosition; 
}
`;

export default vertexShaderSource;
