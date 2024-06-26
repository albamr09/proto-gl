const vertexShaderSource = `#version 300 es
precision mediump float;

// Uniforms for transformation matrices and lighting properties
// Model
uniform mat4 uModelViewMatrix;        // Model-View matrix for the object
uniform mat4 uProjectionMatrix;       // Projection matrix for perspective
uniform mat4 uNormalMatrix;           // Normal matrix for transforming normals
// Lights
uniform vec3 uLightDirection;        // Direction of the light source
uniform vec4 uLightAmbient;          // Ambient light color
uniform vec4 uLightDiffuse;          // Diffuse light color
uniform vec4 uLightSpecular;         // Specular light color
// Materials
uniform vec4 uMaterialAmbient;       // Ambient material color
uniform vec4 uMaterialDiffuse;       // Diffuse material color
uniform vec4 uMaterialSpecular;      // Specular material color
uniform float uShininess;            // Shininess for specular reflection

// Input vertex attributes
in vec3 aVertexPosition;             // Vertex positions
in vec3 aVertexNormal;               // Vertex normals

// Output color for the fragment
out vec4 vVertexColor;               // Color to pass to the fragment shader

void main(void) {
  vec4 vertex = uModelViewMatrix * vec4(aVertexPosition, 1.0);

  // Calculate the transformed normal vector
  vec3 N = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));

  // Calculate the transformed light direction
  vec3 light = vec3(uModelViewMatrix * vec4(uLightDirection, 0.0));

  // Normalize the light direction vector
  vec3 L = normalize(light);

  // Calculate the Lambert term for diffuse reflection
  float lambertTerm = dot(N, -L);

  // Ambient
  vec4 Ia = uLightAmbient * uMaterialAmbient;

  // Diffuse
  vec4 Id = vec4(0.0, 0.0, 0.0, 1.0);

  // Specular
  vec4 Is = vec4(0.0, 0.0, 0.0, 1.0);

  if (lambertTerm > 0.0) {
    // Calculate ambient and diffuse lighting components
    Id = uLightDiffuse * uMaterialDiffuse * lambertTerm;

    // Vector between eye and surface
    vec3 eyeVec = -vec3(vertex.xyz);
    vec3 E = normalize(eyeVec);
    vec3 R = reflect(L, N);
    float specular = pow(max(dot(R, E), 0.0), uShininess);

    Is = uLightSpecular * uMaterialSpecular * specular;
  }

  // Combine ambient and diffuse lighting to determine the vertex color
  // Set varying to be used in fragment shader
  vVertexColor = vec4(vec3(Ia + Id + Is), 1.0);

  // Calculate the final position of the vertex in clip space
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
}
`;

export default vertexShaderSource;
