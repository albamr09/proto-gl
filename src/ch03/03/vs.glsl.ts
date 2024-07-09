const vertexShaderSource = `#version 300 es

// Uniforms
uniform vec3 uMaterialDiffuseColor;
uniform vec3 uMaterialAmbientColor;
uniform vec3 uMaterialSpecularColor;
uniform vec3 uLightDiffuseColor;
uniform vec3 uLightAmbientColor;
uniform vec3 uLightSpecularColor;
uniform vec3 uLightDirection;
uniform float uShininnessFactor;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

// Attributes
in vec3 aPosition;
in vec3 aNormal;

out vec4 vVertexColor;

void main(void) {
  // Position on world
  vec4 vertex = uModelViewMatrix * vec4(aPosition, 1.0);
  // Normal transformed according model view matrix
  vec3 N = vec3(uNormalMatrix * vec4(aNormal, 1.0));
  // Normalized light direction
  vec3 L = normalize(uLightDirection);

  // Ambient
  vec3 Ia = uMaterialAmbientColor * uLightAmbientColor;
  
  // Diffuse
  float lambertCoefficient = dot(N, -L);
  vec3 Id = uLightDiffuseColor * uMaterialDiffuseColor * lambertCoefficient;
  
  // Specular
  vec3 Is = vec3(0.0, 0.0, 0.0);
  // TODO: why this check
  if (lambertCoefficient > 0.0) {
    // Camera vector: vector from vertex to camera (origin 0, 0, 0)
    vec3 eyeVec = -vec3(vertex.xyz);
    vec3 E = normalize(eyeVec);
    // Reflected light direction on the surface (given by its normal vector)
    vec3 R = reflect(L, N);
    // TODO: why max
    float specular = pow(max(dot(R, E), 0.0), uShininnessFactor);

    vec3 Is = uLightSpecularColor * uMaterialSpecularColor * specular;
  }

  vVertexColor = vec4(Ia + Id + Is, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`;

export default vertexShaderSource;
