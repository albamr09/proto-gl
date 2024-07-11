const vertexShaderSource = `#version 300 es
precision mediump float;

// Material
uniform vec4 uMaterialDiffuseColor;
uniform vec4 uMaterialAmbientColor;
uniform vec4 uMaterialSpecularColor;

// Light
uniform vec4 uLightDiffuseColor;
uniform vec4 uLightAmbientColor;
uniform vec4 uLightSpecularColor;
uniform vec3 uLightDirection;
uniform float uShininnessFactor;

// Model
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
  vec3 light = vec3(uModelViewMatrix * vec4(uLightDirection, 0.0));
  vec3 L = normalize(light);

  // Ambient
  vec4 Ia = uMaterialAmbientColor * uLightAmbientColor;
  
  // Diffuse
  float lambertCoefficient = dot(N, -L);
  vec4 Id = vec4(0.0, 0.0, 0.0, 1.0);
  
  // Specular
  vec4 Is = vec4(0.0, 0.0, 0.0, 1.0);
  // Only perform 
  if (lambertCoefficient > 0.0) {
    Id = uLightDiffuseColor * uMaterialDiffuseColor * lambertCoefficient;
    // Camera vector: vector from vertex to camera (origin 0, 0, 0)
    vec3 eyeVec = -vec3(vertex.xyz);
    vec3 E = normalize(eyeVec);
    // Reflected light direction on the surface (given by its normal vector)
    vec3 R = reflect(L, N);
    // Note that we only retrieve positive values for the dot product: 
    // https://albamr09.github.io/src/Notes/ComputerScience/CG/RTGW/03.html#Lights-Goraud%20Shading%20in%20Practice-With%20Phong%20Reflection%20Model-Vertex%20Shader
    float specular = pow(max(dot(R, E), 0.0), uShininnessFactor);
    Is = uLightSpecularColor * uMaterialSpecularColor * specular;
  }

  vVertexColor = vec4(vec3(Ia + Id + Is), 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`;

export default vertexShaderSource;
