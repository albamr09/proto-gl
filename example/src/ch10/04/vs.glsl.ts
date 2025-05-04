const vertexShaderSource = `#version 300 es

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uLightPosition;

in vec3 aPosition;
in vec2 aTextureCoords;
in vec3 aNormal;
in vec3 aTangent;

out vec2 vTextureCoords;
out vec3 vTangentLightRay;
out vec3 vTangentEyeRay;

void main(void) {
  vec4 vertex = uModelViewMatrix * vec4(aPosition, 1.0);

  vec3 transformedNormal = vec3(uNormalMatrix * vec4(aNormal, 1.0));
  vec3 tansformedTangent = vec3(uNormalMatrix * vec4(aTangent, 1.0));
  vec3 bitangent = cross(transformedNormal, tansformedTangent);
  mat3 tbnMatrix = mat3(
    tansformedTangent.x, bitangent.x, transformedNormal.x,
    tansformedTangent.y, bitangent.y, transformedNormal.y,
    tansformedTangent.z, bitangent.z, transformedNormal.z
  );

  vec3 lightRay = vertex.xyz - uLightPosition;
  vec3 eyeRay = -vertex.xyz;

  vTextureCoords = aTextureCoords;
  vTangentLightRay = lightRay * tbnMatrix;
  vTangentEyeRay = eyeRay * tbnMatrix;

  gl_Position = uProjectionMatrix * vertex;
}
`;

export default vertexShaderSource;
